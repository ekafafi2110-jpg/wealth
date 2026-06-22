import { useLocale } from "../../i18n/locale";

export default function SalaryCapSettingsSection({
  salary,
  spendingCap,
  maxSpendingCap,
  onSalaryChange,
  onSpendingCapChange,
  inputStyle,
}) {
  const { currencyLabel } = useLocale();
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <div
          style={{
            color: "var(--text-faint)",
            fontWeight: 700,
            fontSize: 10,
            letterSpacing: "0.09em",
            textTransform: "uppercase",
          }}
        >
          💼 الراتب والسقف
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <div>
          <label style={{ fontSize: 10, color: "var(--text-faint)" }}>الراتب</label>
          <input
            type="number"
            value={salary}
            onChange={(event) => onSalaryChange(Number(event.target.value || 0))}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ fontSize: 10, color: "var(--text-faint)" }}>السقف</label>
          <input
            type="number"
            value={spendingCap}
            onChange={(event) =>
              onSpendingCapChange(Number(event.target.value || 0))
            }
            style={inputStyle}
          />
        </div>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 12 }}>
        الحد: {maxSpendingCap.toFixed(2)} {currencyLabel}
      </div>
    </>
  );
}
