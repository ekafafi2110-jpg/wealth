const iconButtonStyle = (color) => ({
  width: 34,
  height: 34,
  borderRadius: 10,
  border: "1px solid var(--border-soft)",
  background: "var(--bg-card)",
  color,
  cursor: "pointer",
  fontWeight: 900,
  fontFamily: "inherit",
});

export default function StructuralLiabilitiesSettingsSection({
  open,
  items,
  showForm,
  name,
  monthly,
  onToggle,
  onToggleForm,
  onDelete,
  onUpdate,
  onCloseForm,
  onNameChange,
  onMonthlyChange,
  onSave,
  inputStyle,
}) {
  return (
    <div
      style={{
        borderTop: "1px solid var(--border-soft)",
        paddingTop: 12,
        marginTop: 8,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            type="button"
            onClick={onToggleForm}
            style={iconButtonStyle("#86efac")}
          >
            +
          </button>
          <button type="button" onClick={onToggle} style={iconButtonStyle("var(--text-body)")}>
            {open ? "−" : "⋯"}
          </button>
        </div>
        <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text-heading)" }}>
          🏗 الالتزامات
        </div>
      </div>

      {open && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "34px 0.9fr 1.4fr",
              gap: 6,
              color: "var(--text-faint)",
              fontSize: 10,
              marginBottom: 5,
              padding: "0 4px",
            }}
          >
            <span />
            <span>القسط</span>
            <span>الاسم</span>
          </div>

          {items.map((item) => (
            <div
              key={item.id}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-soft)",
                borderRadius: 12,
                padding: 8,
                marginBottom: 8,
                display: "grid",
                gridTemplateColumns: "34px 0.9fr 1.4fr",
                gap: 6,
                alignItems: "center",
              }}
            >
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                style={iconButtonStyle("#fecaca")}
              >
                🗑
              </button>
              <input
                type="number"
                value={item.monthly ?? item.monthlyAmount ?? item.amount ?? 0}
                onChange={(event) => onUpdate(item.id, "monthly", event.target.value)}
                placeholder="القسط"
                style={{ ...inputStyle, padding: "9px 8px", fontSize: 12 }}
              />
              <input
                value={item.name}
                onChange={(event) => onUpdate(item.id, "name", event.target.value)}
                placeholder="الاسم"
                style={{ ...inputStyle, padding: "9px 8px", fontSize: 12 }}
              />
            </div>
          ))}

          {showForm && (
            <div
              style={{
                background: "var(--bg-secondary)",
                border: "1px dashed var(--border-soft)",
                borderRadius: 12,
                padding: 10,
                marginTop: 12,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "38px 0.9fr 1.4fr",
                  gap: 6,
                }}
              >
                <button
                  type="button"
                  onClick={onCloseForm}
                  style={iconButtonStyle("#fecaca")}
                >
                  ×
                </button>
                <input
                  type="number"
                  value={monthly}
                  onChange={(event) => onMonthlyChange(event.target.value)}
                  placeholder="القسط"
                  style={{ ...inputStyle, padding: "9px 8px", fontSize: 12 }}
                />
                <input
                  value={name}
                  onChange={(event) => onNameChange(event.target.value)}
                  placeholder="الاسم"
                  style={{ ...inputStyle, padding: "9px 8px", fontSize: 12 }}
                />
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
                حفظ الالتزام
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
