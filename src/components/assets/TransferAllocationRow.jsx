import visualIdentity from "../../theme/visualIdentity";
import CalendarDatePicker from "../common/CalendarDatePicker";
import { StickyNote } from "lucide-react";

export default function TransferAllocationRow({
  row,
  options,
  onUpdate,
  onRemove,
  inputStyle,
  removeButtonStyle,
  allowRemove = true,
  allowedAllocations,
  allowNewTarget = true,
}) {
  const needsUnits = ["stock", "gold", "silver", "goods"].includes(
    row.allocation
  );
  const needsName = ["bank", "stock", "gold", "silver", "goods"].includes(
    row.allocation
  );
  const isReceivable = row.allocation === "receivable";

  const selectTarget = (value) => {
    const preset = options.find(
      (item) => String(item.id) === value && item.isPreset
    );

    if (preset) {
      onUpdate({ targetId: "", assetName: preset.label });
      return;
    }

    onUpdate({ targetId: value, assetName: "" });
  };

  const allocationOptions = [
    ["cash", "كاش احتياطي"],
    ["spendingCap", "سقف الصرف"],
    ["bank", "حساب بنكي"],
    ["stock", "أسهم"],
    ["gold", "ذهب"],
    ["silver", "فضة"],
    ["goods", "بضاعة"],
    ["receivable", "ذمم مدينة"],
  ].filter(([value]) => !allowedAllocations || allowedAllocations.includes(value));
  const updateReceivableNote = () => {
    const nextNote = window.prompt("ملاحظة الذمة المدينة", row.note || "");
    if (nextNote !== null) onUpdate({ note: nextNote });
  };
  const receivableIconButtonStyle = (active) => ({
    width: 42,
    height: 42,
    borderRadius: 12,
    border: active
      ? `1.5px solid ${visualIdentity.colors.gold}`
      : "1px solid rgba(255,255,255,0.18)",
    background: active ? "rgba(255,198,45,0.14)" : "rgba(255,255,255,0.08)",
    color: active ? visualIdentity.colors.gold : visualIdentity.colors.textSecondary,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
  });

  return (
    <div
      style={{
        border: visualIdentity.cards.inner.border,
        borderRadius: visualIdentity.cards.inner.borderRadius,
        padding: 10,
        marginBottom: 10,
        background: visualIdentity.gradients.innerCard,
        boxShadow: visualIdentity.cards.inner.boxShadow,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: allowRemove ? "42px 1fr" : "1fr",
          gap: 8,
          marginBottom: 8,
        }}
      >
        {allowRemove ? (
          <button type="button" onClick={onRemove} style={removeButtonStyle}>
            ×
          </button>
        ) : null}
        <select
          value={row.allocation}
          onChange={(event) =>
            onUpdate({
              allocation: event.target.value,
              targetId: "",
              assetName: "",
              dueDate: "",
              note: "",
              units: "",
              price: "",
            })
          }
          style={inputStyle}
        >
          {allocationOptions.map(([optionValue, optionLabel]) => (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          ))}
        </select>
      </div>

      {isReceivable ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 42px 42px",
            gap: 8,
            marginBottom: 8,
            alignItems: "center",
          }}
        >
          <input
            type="number"
            value={row.amount}
            onChange={(event) => onUpdate({ amount: event.target.value })}
            placeholder="المبلغ"
            style={{ ...inputStyle, marginBottom: 0 }}
          />
          <CalendarDatePicker
            value={row.dueDate || ""}
            onChange={(value) => onUpdate({ dueDate: value })}
            label="اختيار تاريخ استحقاق الذمة المدينة"
          />
          <button
            type="button"
            onClick={updateReceivableNote}
            title={row.note ? "تعديل ملاحظة الذمة المدينة" : "إضافة ملاحظة للذمة المدينة"}
            aria-label={row.note ? "تعديل ملاحظة الذمة المدينة" : "إضافة ملاحظة للذمة المدينة"}
            style={receivableIconButtonStyle(Boolean(String(row.note || "").trim()))}
          >
            <StickyNote size={18} strokeWidth={2.4} />
          </button>
        </div>
      ) : (
        <input
          type="number"
          value={row.amount}
          onChange={(event) => onUpdate({ amount: event.target.value })}
          placeholder="المبلغ"
          style={{ ...inputStyle, marginBottom: 8 }}
        />
      )}

      {options.length > 0 && (
        <select
          value={row.targetId}
          onChange={(event) => selectTarget(event.target.value)}
          style={{ ...inputStyle, marginBottom: 8 }}
        >
          <option value="">{allowNewTarget ? "أصل جديد" : "اختر الحساب"}</option>
          {options.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name || item.label}
            </option>
          ))}
        </select>
      )}

      {allowNewTarget && needsName && !row.targetId && (
        <input
          value={row.assetName}
          onChange={(event) => onUpdate({ assetName: event.target.value })}
          placeholder={row.allocation === "gold" ? "مثال: ذهب 21" : "اسم الأصل"}
          style={{ ...inputStyle, marginBottom: 8 }}
        />
      )}

      {isReceivable && (
        <div style={{ display: "grid", gap: 8 }}>
          <input
            value={row.assetName}
            onChange={(event) => onUpdate({ assetName: event.target.value })}
            placeholder="اسم المدين"
            style={inputStyle}
          />
        </div>
      )}

      {needsUnits && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <input
            type="number"
            value={row.units}
            onChange={(event) => onUpdate({ units: event.target.value })}
            placeholder={row.allocation === "stock" ? "عدد الأسهم" : "عدد الوحدات"}
            style={inputStyle}
          />
          <input
            type="number"
            value={row.price}
            onChange={(event) => onUpdate({ price: event.target.value })}
            placeholder="سعر الشراء"
            style={inputStyle}
          />
        </div>
      )}
    </div>
  );
}
