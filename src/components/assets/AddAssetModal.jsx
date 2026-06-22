import visualIdentity from "../../theme/visualIdentity";

export default function AddAssetModal({
  open,
  kind,
  name,
  amount,
  units,
  price,
  onClose,
  onKindChange,
  onNameChange,
  onAmountChange,
  onUnitsChange,
  onPriceChange,
  onSubmit,
  inputStyle,
  closeButtonStyle,
  submitButtonStyle,
}) {
  if (!open) return null;

  const usesAmount = kind === "bank" || kind === "fixed";
  const usesUnits = ["gold", "silver", "stock", "unit"].includes(kind);

  return (
    <div
      onClick={(event) => event.target === event.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(4,20,40,0.78)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 1200,
      }}
    >
      <div
        className="asset-modal"
        style={{
          position: "relative",
          background: visualIdentity.gradients.appBackground,
          color: visualIdentity.colors.white,
          borderRadius: "20px 20px 0 0",
          border: visualIdentity.cards.outer.border,
          boxShadow: "0 -18px 42px rgba(3,18,37,0.34)",
          padding: "22px 18px 44px",
          width: "100%",
          maxWidth: 440,
          direction: "rtl",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <button type="button" onClick={onClose} style={closeButtonStyle}>
            ✕
          </button>
          <span style={{ fontSize: 15, fontWeight: 900, color: visualIdentity.colors.white }}>
            أصل جديد
          </span>
        </div>

        <select
          value={kind}
          onChange={(event) => onKindChange(event.target.value)}
          style={{ ...inputStyle, marginBottom: 10 }}
        >
          <option value="bank">حساب بنكي</option>
          <option value="gold">ذهب</option>
          <option value="silver">فضة</option>
          <option value="stock">أسهم</option>
          <option value="fixed">أصل مبلغ ثابت</option>
          <option value="unit">أصل وحدات مخصص</option>
        </select>

        <input
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder="اسم الأصل"
          style={{ ...inputStyle, marginBottom: 10 }}
        />

        {usesAmount && (
          <input
            type="number"
            value={amount}
            onChange={(event) => onAmountChange(event.target.value)}
            placeholder="القيمة / الرصيد"
            style={{ ...inputStyle, marginBottom: 10 }}
          />
        )}

        {usesUnits && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
              marginBottom: 10,
            }}
          >
            <input
              type="number"
              value={units}
              onChange={(event) => onUnitsChange(event.target.value)}
              placeholder="عدد الوحدات"
              style={inputStyle}
            />
            <input
              type="number"
              value={price}
              onChange={(event) => onPriceChange(event.target.value)}
              placeholder="سعر الوحدة"
              style={inputStyle}
            />
          </div>
        )}

        <button type="button" onClick={onSubmit} style={submitButtonStyle}>
          ✓ إضافة الأصل
        </button>
      </div>
    </div>
  );
}
