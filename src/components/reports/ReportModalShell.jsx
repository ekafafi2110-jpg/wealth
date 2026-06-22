import visualIdentity from "../../theme/visualIdentity";

export default function ReportModalShell({
  open,
  title,
  subtitle,
  zIndex,
  onClose,
  children,
}) {
  if (!open) return null;

  return (
    <div
      onClick={(event) => event.target === event.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(5,20,40,0.82)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex,
      }}
    >
      <div
        style={{
          background: visualIdentity.gradients.appBackground,
          border: visualIdentity.cards.outer.border,
          borderRadius: "22px 22px 0 0",
          width: "100%",
          maxWidth: 440,
          maxHeight: "82vh",
          overflowY: "auto",
          padding: "18px 16px 28px",
          direction: "rtl",
          boxShadow: "0 -18px 42px rgba(5,20,40,0.34)",
          fontFamily: visualIdentity.typography.fontFamily,
          color: visualIdentity.colors.white,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <button
            type="button"
            aria-label="إغلاق"
            onClick={onClose}
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.14)",
              background: visualIdentity.gradients.innerCard,
              color: visualIdentity.colors.white,
              cursor: "pointer",
              fontSize: 20,
              fontFamily: "inherit",
            }}
          >
            ×
          </button>

          <div style={{ textAlign: "right" }}>
            <div
              style={{
                ...visualIdentity.typography.onDarkTitle,
                color: visualIdentity.colors.gold,
                fontSize: 15,
              }}
            >
              {title}
            </div>
            {subtitle && (
              <div
                style={{
                  ...visualIdentity.typography.onDarkSecondary,
                  fontSize: 10,
                }}
              >
                {subtitle}
              </div>
            )}
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
