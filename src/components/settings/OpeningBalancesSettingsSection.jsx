const iconButtonStyle = (color) => ({
  width: 32,
  height: 32,
  borderRadius: 10,
  border: `1px solid ${color}55`,
  background: "var(--bg-secondary)",
  color,
  cursor: "pointer",
  fontWeight: 900,
  fontFamily: "inherit",
});

export default function OpeningBalancesSettingsSection({
  open,
  snapshotsCount,
  onToggle,
  onToggleForm,
  cardStyle,
  children,
}) {
  return (
    <div className="asset-dashboard-card" style={cardStyle}>
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
          📦 الأرصدة الافتتاحية
        </div>
      </div>

      {open && <div>{children}</div>}

      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>
        عدد اللقطات التاريخية المحفوظة: {snapshotsCount}
      </div>
    </div>
  );
}
