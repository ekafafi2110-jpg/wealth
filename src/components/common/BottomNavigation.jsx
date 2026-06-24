import visualIdentity from "../../theme/visualIdentity";
import { useLocale } from "../../i18n/locale";

const NAV_LABEL_KEYS = {
  overview: "nav.home",
  reports: "nav.reports",
  assets: "nav.assets",
  liabilities: "nav.liabilities",
  settings: "nav.settings",
};

const NAV_ICONS = {
  overview: <path d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1v-8.5Z" />,
  reports: (
    <>
      <path d="M5 19V9" />
      <path d="M12 19V5" />
      <path d="M19 19v-7" />
      <path d="M4 19h16" />
    </>
  ),
  assets: (
    <>
      <path d="M4 8.5 12 4l8 4.5-8 4.5L4 8.5Z" />
      <path d="m4 13 8 4.5L20 13" />
      <path d="m4 17 8 4.5L20 17" />
    </>
  ),
  liabilities: (
    <>
      <path d="M6 4h12v16H6z" />
      <path d="M9 8h6" />
      <path d="M9 12h6" />
      <path d="M9 16h3" />
    </>
  ),
  settings: (
    <>
      <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.05.05a2 2 0 0 1-2.83 2.83l-.05-.05A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 1.55V21a2 2 0 0 1-4 0v-.05A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.88.34l-.05.05a2 2 0 1 1-2.83-2.83l.05-.05A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3a2 2 0 0 1 0-4h.05A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.88l-.05-.05a2 2 0 1 1 2.83-2.83l.05.05A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.55V3a2 2 0 0 1 4 0v-.05A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.88-.34l.05-.05a2 2 0 1 1 2.83 2.83l-.05.05A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 1.55 1H21a2 2 0 0 1 0 4h-.05A1.7 1.7 0 0 0 19.4 15Z" />
    </>
  ),
};

function NavIcon({ id, active = false }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={active ? "21" : "20"}
      height={active ? "21" : "20"}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? "2" : "1.85"}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {NAV_ICONS[id] || NAV_ICONS.overview}
    </svg>
  );
}

export default function BottomNavigation({ tabs, activeTab, onSelect }) {
  const { direction, t } = useLocale();
  return (
    <nav
      aria-label="التنقل الرئيسي"
      style={{
        position: "fixed",
        left: "50%",
        bottom: 0,
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 440,
        zIndex: 520,
        direction: "ltr",
        background: "rgba(9,36,70,0.96)",
        borderTop: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 -10px 28px rgba(3,20,40,0.26)",
        backdropFilter: "blur(16px)",
        padding: "5px 0 calc(3px + env(safe-area-inset-bottom))",
      }}
    >
      <div style={{ display: "flex", alignItems: "stretch", justifyContent: "space-around" }}>
        {tabs.map((item) => {
          const active = item.id === activeTab;
          const label = t(NAV_LABEL_KEYS[item.id], item.label);

          return (
            <button
              key={item.id}
              type="button"
              aria-label={label}
              title={label}
              aria-current={active ? "page" : undefined}
              onClick={() => onSelect(item.id)}
              style={{
                position: "relative",
                flex: "1 1 0",
                border: "none",
                borderTop: active ? `2.5px solid ${visualIdentity.colors.gold}` : "2.5px solid transparent",
                marginTop: active ? -2.5 : 0,
                background: active ? "rgba(255,198,45,0.07)" : "transparent",
                color: visualIdentity.colors.textSecondary,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                minWidth: 0,
                minHeight: 44,
                padding: "3px 2px 2px",
                transition: "color 0.18s ease, border-color 0.18s ease, background 0.18s ease, opacity 0.15s ease",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {active && (
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "50%",
                    width: 24,
                    height: 3,
                    borderRadius: 99,
                    transform: "translateX(-50%)",
                    background: visualIdentity.colors.gold,
                    boxShadow: "0 0 10px rgba(255,198,45,0.72)",
                    pointerEvents: "none",
                  }}
                />
              )}
              <span
                style={{
                  position: "relative",
                  zIndex: 1,
                  direction,
                  color: active ? visualIdentity.colors.gold : visualIdentity.colors.textFaint,
                  filter: active ? "drop-shadow(0 0 4px rgba(255,198,45,0.36))" : "none",
                  lineHeight: 1,
                }}
              >
                <NavIcon id={item.id} active={active} />
              </span>
              <span
                style={{
                  position: "relative",
                  zIndex: 1,
                  color: active ? visualIdentity.colors.gold : visualIdentity.colors.textFaint,
                  fontSize: 8.5,
                  fontWeight: 800,
                  lineHeight: 1.15,
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
