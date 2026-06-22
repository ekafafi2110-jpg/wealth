import visualIdentity from "../../theme/visualIdentity";

const { colors, gradients } = visualIdentity;

export default function AppHeader({
  selectedMonth,
  currentMonthLabel,
  snapshots,
  snapshotView,
  onMonthChange,
  onLogout,
  headerStyle,
  formatMonth,
}) {
  return (
    <header className="wealth-app-header" style={headerStyle}>
      <div
        style={{
          minHeight: 52,
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) auto",
          alignItems: "center",
          gap: 10,
          marginBottom: 10,
          direction: "rtl",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
          <div
            aria-hidden="true"
            style={{
              width: 38,
              height: 38,
              transform: "rotate(45deg)",
              border: `4px solid ${colors.gold}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: "0 0 auto",
              boxShadow: "0 0 14px rgba(255,198,45,0.16)",
            }}
          >
            <span
              style={{
                width: 12,
                height: 12,
                borderTop: `3px solid ${colors.gold}`,
                borderLeft: `3px solid ${colors.gold}`,
              }}
            />
          </div>
          <div style={{ minWidth: 0, textAlign: "right" }}>
            <strong
              style={{
                display: "block",
                overflow: "hidden",
                color: colors.white,
                fontSize: 15,
                fontWeight: 900,
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              مدير الثروة الذكي
            </strong>
            <span
              style={{
                display: "block",
                marginTop: 2,
                color: colors.gold,
                fontSize: 8,
                fontWeight: 800,
                letterSpacing: 0,
              }}
            >
              SMART WEALTH TRACKER
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, direction: "ltr" }}>
          <button
            type="button"
            onClick={onLogout}
            title="تسجيل خروج"
            style={{
              minHeight: 34,
              padding: "0 10px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.16)",
              background: "rgba(255,255,255,0.07)",
              color: colors.textSecondary,
              fontSize: 9,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            خروج
          </button>
          <select
            value={selectedMonth}
            onChange={(event) => onMonthChange(event.target.value)}
            aria-label="الشهر"
            style={{
              minHeight: 34,
              maxWidth: 104,
              padding: "0 9px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.16)",
              background: "rgba(255,255,255,0.08)",
              color: colors.white,
              fontSize: 9,
              fontWeight: 800,
              outline: "none",
            }}
          >
            <option value="current">{currentMonthLabel}</option>
            {snapshots.map((snapshot) => (
              <option key={snapshot.id} value={snapshot.id}>
                {formatMonth(snapshot.month)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {snapshotView && (
        <div
          style={{
            marginBottom: 8,
            padding: "5px 9px",
            borderRadius: 10,
            background: gradients.innerCard,
            color: colors.gold,
            fontSize: 9,
            fontWeight: 800,
            textAlign: "center",
          }}
        >
          عرض محفوظ للقراءة فقط
        </div>
      )}
    </header>
  );
}
