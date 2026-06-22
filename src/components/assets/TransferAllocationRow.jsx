import visualIdentity from "../../theme/visualIdentity";

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
  ].filter(([value]) => !allowedAllocations || allowedAllocations.includes(value));

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

      <input
        type="number"
        value={row.amount}
        onChange={(event) => onUpdate({ amount: event.target.value })}
        placeholder="المبلغ"
        style={{ ...inputStyle, marginBottom: 8 }}
      />

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
