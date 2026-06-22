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
            readOnly={row.kind === "bank"}
            onChange={(event) =>
              onUpdate(row.group, row.id, {
                [row.priceField]: Number(event.target.value || 0),
              })
            }
            placeholder="السعر"
            style={{
              ...compactInput,
              color: row.kind === "bank" ? "var(--text-muted)" : undefined,
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
    </>
  );
}
