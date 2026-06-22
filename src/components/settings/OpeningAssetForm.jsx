export default function OpeningAssetForm({
  open,
  kind,
  target,
  name,
  units,
  price,
  choices,
  canCreateNew,
  isNew,
  onClose,
  onKindChange,
  onTargetChange,
  onNameChange,
  onUnitsChange,
  onPriceChange,
  onSave,
  inputStyle,
}) {
  if (!open) return null;

  const cashLike = kind === "cash" || kind === "bank";

  return (
    <div
      style={{
        background: "var(--bg-secondary)",
        border: "1px dashed var(--border-soft)",
        borderRadius: 12,
        padding: 10,
        marginBottom: 12,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "38px 1fr 1fr",
          gap: 6,
          marginBottom: 8,
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            border: "1px solid var(--border-soft)",
            background: "var(--bg-card)",
            color: "#fecaca",
            cursor: "pointer",
            fontFamily: "inherit",
            fontWeight: 900,
          }}
        >
          ×
        </button>
        <select
          value={kind}
          onChange={(event) => onKindChange(event.target.value)}
          style={{ ...inputStyle, padding: "9px 8px", fontSize: 12 }}
        >
          <option value="cash">كاش ادخار</option>
          <option value="bank">حساب بنكي</option>
          <option value="gold">ذهب</option>
          <option value="silver">فضة</option>
          <option value="stock">أسهم</option>
          <option value="goods">بضاعة</option>
        </select>

        {kind === "cash" ? (
          <input
            value="كاش ادخار"
            disabled
            style={{ ...inputStyle, padding: "9px 8px", fontSize: 12 }}
          />
        ) : (
          <select
            value={target}
            onChange={(event) => onTargetChange(event.target.value)}
            style={{ ...inputStyle, padding: "9px 8px", fontSize: 12 }}
          >
            {choices.map((choice) => (
              <option key={choice} value={choice}>
                {choice}
              </option>
            ))}
            {canCreateNew && <option value="__new__">أصل جديد</option>}
          </select>
        )}
      </div>

      {isNew && (
        <input
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder={
            kind === "bank"
              ? "اسم البنك الجديد"
              : kind === "stock"
              ? "اسم السهم الجديد"
              : "اسم البضاعة الجديدة"
          }
          style={{
            ...inputStyle,
            padding: "9px 8px",
            fontSize: 12,
            marginBottom: 8,
          }}
        />
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: cashLike ? "1fr" : "1fr 1fr",
          gap: 6,
        }}
      >
        <input
          type="number"
          value={units}
          onChange={(event) => onUnitsChange(event.target.value)}
          placeholder={cashLike ? "الرصيد" : "عدد الوحدات"}
          style={{ ...inputStyle, padding: "9px 8px", fontSize: 12 }}
        />
        {!cashLike && (
          <input
            type="number"
            value={price}
            onChange={(event) => onPriceChange(event.target.value)}
            placeholder="السعر"
            style={{ ...inputStyle, padding: "9px 8px", fontSize: 12 }}
          />
        )}
      </div>

      <button
        type="button"
        onClick={onSave}
        style={{
          width: "100%",
          marginTop: 8,
          padding: "9px 12px",
          border: 0,
          borderRadius: 12,
          background:
            "linear-gradient(135deg,var(--gold-primary),var(--gold-border))",
          color: "var(--text-heading)",
          cursor: "pointer",
          fontFamily: "inherit",
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        حفظ الأصل
      </button>
    </div>
  );
}
