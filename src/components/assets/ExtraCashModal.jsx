import { useState } from "react";
import visualIdentity from "../../theme/visualIdentity";

export default function ExtraCashModal({ state, onSubmit, onClose, preset = null }) {
  const isRequiredSurplus = ["salary_surplus", "month_end_surplus"].includes(preset?.source);
  const [amount, setAmount] = useState(preset?.amount ? String(preset.amount) : "");
  const [note, setNote] = useState(preset?.note || "");
  const [allocation, setAllocation] = useState(isRequiredSurplus ? "cash" : "spendingCap");
  const [targetId, setTargetId] = useState("");
  const [assetName, setAssetName] = useState("");
  const [units, setUnits] = useState("");
  const [price, setPrice] = useState("");

  const needsAssetName = ["bank", "stock", "gold", "silver", "goods", "fixed"].includes(allocation);
  const needsUnits = ["stock", "gold", "silver", "goods"].includes(allocation);

  const targetOptions =
    allocation === "bank"
      ? state.assets.banks || []
      : allocation === "stock"
      ? state.assets.stocks || []
      : allocation === "gold"
      ? [
          ...(state.assets.gold || []),
          ...["ذهب 21", "ذهب 24"]
            .filter(
              (label) =>
                !(state.assets.gold || []).some(
                  (item) => String(item.label || "").trim() === label
                )
            )
            .map((label) => ({ id: `new:${label}`, label, isPreset: true })),
        ]
      : allocation === "silver"
      ? state.assets.silver || []
      : allocation === "goods"
      ? (state.assets.custom || []).filter((item) => item.type === "unit")
      : [];

  const targetLabel = (item) => item.name || item.label || "";

  const resetTarget = (value) => {
    setAllocation(value);
    setTargetId("");
    setAssetName("");
    setUnits("");
    setPrice("");
  };

  function submit() {
    const n = Number(preset?.lockedAmount ? preset.amount : amount || 0);
    const unitCount = Number(units || 0);
    const unitPrice = Number(price || 0);

    if (!n || n <= 0) {
      alert("أدخل مبلغًا صحيحًا");
      return;
    }

    if (needsAssetName && !targetId && !assetName.trim()) {
      alert("اختر أصلًا موجودًا أو اكتب اسم أصل جديد");
      return;
    }

    if (needsUnits) {
      if (unitCount <= 0 || unitPrice <= 0) {
        alert("أدخل العدد والسعر لحساب متوسط التكلفة");
        return;
      }

      if (Math.abs(unitCount * unitPrice - n) > 0.01) {
        alert("قيمة الدخل يجب أن تساوي العدد × السعر");
        return;
      }
    }

    if (isRequiredSurplus && allocation === "spendingCap") {
      alert("فائض الراتب يجب توجيهه إلى أصل وليس إلى سقف الصرف");
      return;
    }

    onSubmit({
      amount: n,
      note,
      allocation,
      targetId,
      assetName,
      units: unitCount,
      price: unitPrice,
      source: preset?.source || "extra_income",
    });
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(4,20,40,0.78)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 16,
      }}
    >
      <div
        className="asset-modal"
        style={{
          background: visualIdentity.gradients.appBackground,
          color: visualIdentity.colors.white,
          border: visualIdentity.cards.outer.border,
          boxShadow: "0 18px 46px rgba(3,18,37,0.34)",
          borderRadius: 16,
          padding: 16,
          width: "100%",
          maxWidth: 420,
          textAlign: "right",
        }}
      >
        <h3 style={{ marginTop: 0 }}>{preset?.source === "salary_surplus" ? "توجيه فائض الراتب" : "دخل إضافي"}</h3>

        <label style={{ display: "block", marginBottom: 6 }}>المبلغ الداخل</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={Boolean(preset?.lockedAmount)}
          placeholder="مثال: 300"
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 12,
            borderRadius: 10,
            border: "1px solid var(--border-soft)",
            background: "var(--bg-card)",
            color: "white",
          }}
        />

        <label style={{ display: "block", marginBottom: 6 }}>المصدر</label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={Boolean(preset?.lockedNote)}
          placeholder="مثال: بونص، هدية، زيادة"
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 12,
            borderRadius: 10,
            border: "1px solid var(--border-soft)",
            background: "var(--bg-card)",
            color: "white",
          }}
        />

        <label style={{ display: "block", marginBottom: 6 }}>تخصيص الدخل</label>
        <select
          value={allocation}
          onChange={(e) => resetTarget(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 16,
            borderRadius: 10,
            border: "1px solid var(--border-soft)",
            background: "var(--bg-card)",
            color: "white",
          }}
        >
          {!isRequiredSurplus && <option value="spendingCap">زيادة سقف الصرف</option>}
          <option value="cash">ادخار كاش احتياطي</option>
          <option value="bank">حساب بنكي</option>
          <option value="stock">أسهم</option>
          <option value="gold">ذهب</option>
          <option value="silver">فضة</option>
          <option value="goods">بضاعة / وحدات</option>
          <option value="fixed">أصل ثابت</option>
        </select>

        {targetOptions.length > 0 && (
          <select
            value={targetId}
            onChange={(e) => {
              const value = e.target.value;
              const preset = targetOptions.find((item) => String(item.id) === value && item.isPreset);
              if (preset) {
                setTargetId("");
                setAssetName(preset.label);
                return;
              }
              setTargetId(value);
              setAssetName("");
            }}
            style={{
              width: "100%",
              padding: 10,
              marginBottom: 10,
              borderRadius: 10,
              border: "1px solid var(--border-soft)",
              background: "var(--bg-card)",
              color: "white",
            }}
          >
            <option value="">أصل جديد</option>
            {targetOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {targetLabel(item)}
              </option>
            ))}
          </select>
        )}

        {needsAssetName && !targetId && (
          <input
            value={assetName}
            onChange={(e) => setAssetName(e.target.value)}
            placeholder={
              allocation === "gold"
                ? "مثال: ذهب 21"
                : allocation === "silver"
                ? "مثال: فضة"
                : allocation === "stock"
                ? "اسم السهم"
                : allocation === "bank"
                ? "اسم البنك"
                : "اسم الأصل"
            }
            style={{
              width: "100%",
              padding: 10,
              marginBottom: 10,
              borderRadius: 10,
              border: "1px solid var(--border-soft)",
              background: "var(--bg-card)",
              color: "white",
            }}
          />
        )}

        {needsUnits && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
            <input
              type="number"
              value={units}
              onChange={(e) => setUnits(e.target.value)}
              placeholder={allocation === "stock" ? "عدد الأسهم" : "عدد الوحدات"}
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 10,
                border: "1px solid var(--border-soft)",
                background: "var(--bg-card)",
                color: "white",
              }}
            />
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="سعر الشراء"
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 10,
                border: "1px solid var(--border-soft)",
                background: "var(--bg-card)",
                color: "white",
              }}
            />
          </div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={submit}
            style={{
              flex: 1,
              padding: "10px 12px",
              border: 0,
              borderRadius: 10,
              background: visualIdentity.gradients.gold,
              color: visualIdentity.colors.navy,
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            حفظ
          </button>

          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px 12px",
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: 10,
              background: "transparent",
              color: visualIdentity.colors.white,
              cursor: "pointer",
            }}
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
