const gridStyle = {
  display: "grid",
  gridTemplateColumns: "0.9fr 0.72fr 0.72fr 0.72fr 1fr",
  gap: 6,
  marginBottom: 8,
};

import { useLocale } from "../../i18n/locale";

export default function OpeningBalancesTable({
  cash,
  rows,
  onCashChange,
  onUpdate,
  onSave,
  hasChanges,
  inputStyle,
}) {
  const { currencyLabel } = useLocale();
  const compactInput = { ...inputStyle, padding: "9px 7px", fontSize: 11 };

  return (
    <>
      <div
        style={{
          ...gridStyle,
          color: "var(--text-faint)",
          fontSize: 10,
          marginBottom: 5,
        }}
      >
        <span>الإجمالي</span>
        <span>السعر</span>
        <span>الوحدة</span>
        <span>العدد</span>
        <span>الأصل</span>
      </div>

      <div style={gridStyle}>
        <input
          readOnly
          value={cash.toFixed(2)}
          placeholder="الإجمالي"
          style={{ ...compactInput, color: "var(--text-body)" }}
        />
        <input
          readOnly
          value="1"
          placeholder="السعر"
          style={{ ...compactInput, color: "var(--text-muted)" }}
        />
        <select value={currencyLabel} disabled style={{ ...compactInput, opacity: 0.9 }}>
          <option value={currencyLabel}>{currencyLabel}</option>
        </select>
        <input
          type="number"
          value={cash}
          onChange={(event) => onCashChange(Number(event.target.value || 0))}
          placeholder="الرصيد"
          style={compactInput}
        />
        <input
          readOnly
          value="كاش ادخار"
          placeholder="الأصل"
          style={{ ...compactInput, color: "var(--text-body)" }}
        />
      </div>

      {rows.map((row) => (
        <div key={row.key} style={gridStyle}>
          <input
            readOnly
            value={row.total.toFixed(2)}
            placeholder="الإجمالي"
            style={{ ...compactInput, color: "var(--text-body)" }}
          />
          <input
            type="number"
            value={row.price}
            readOnly={row.kind === "bank" || row.kind === "fixed"}
            onChange={(event) =>
              onUpdate(row.group, row.id, {
                [row.priceField]: Number(event.target.value || 0),
              })
            }
            placeholder="السعر"
            style={{
              ...compactInput,
              color: row.kind === "bank" || row.kind === "fixed" ? "var(--text-muted)" : undefined,
            }}
          />
          <select value={row.unitLabel} disabled style={{ ...compactInput, opacity: 0.9 }}>
            <option value={row.unitLabel}>{row.unitLabel}</option>
          </select>
          <input
            type="number"
            value={row.units}
            onChange={(event) =>
              onUpdate(row.group, row.id, {
                [row.unitsField]: Number(event.target.value || 0),
              })
            }
            placeholder={row.kind === "bank" ? "الرصيد" : "العدد"}
            style={compactInput}
          />
          <input
            value={row.name}
            onChange={(event) =>
              onUpdate(row.group, row.id, { [row.nameField]: event.target.value })
            }
            placeholder={row.namePlaceholder}
            style={compactInput}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={onSave}
        disabled={!hasChanges}
        style={{
          width: "100%",
          marginTop: 10,
          padding: "10px 12px",
          border: 0,
          borderRadius: 12,
          background: hasChanges
            ? "linear-gradient(135deg,var(--gold-primary),var(--gold-border))"
            : "rgba(255,255,255,0.10)",
          color: hasChanges ? "var(--text-heading)" : "var(--text-muted)",
          cursor: hasChanges ? "pointer" : "default",
          fontFamily: "inherit",
          fontSize: 12,
          fontWeight: 900,
        }}
      >
        حفظ إعادة التعيين
      </button>
    </>
  );
}
