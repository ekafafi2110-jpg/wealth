import visualIdentity from "../../theme/visualIdentity";
import { useLocale } from "../../i18n/locale";

export default function AssetSectionCard({
  icon,
  title,
  total,
  color,
  isOpen,
  readOnly,
  addKind,
  onAdd,
  onToggle,
  subtitle,
  children,
}) {
  const { currencyLabel } = useLocale();
  return (
    <div
      style={{
        background: visualIdentity.gradients.outerCard,
        borderRadius: visualIdentity.cards.outer.borderRadius,
        border: visualIdentity.cards.outer.border,
        padding: 12,
        marginBottom: 14,
        color: visualIdentity.colors.white,
        fontFamily: "inherit",
        fontSize: 14,
        boxShadow: visualIdentity.cards.outer.boxShadow,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {!readOnly && addKind && (
            <button
              type="button"
              title="إضافة"
              aria-label={`إضافة ${title}`}
              onClick={(event) => {
                event.stopPropagation();
                onAdd(addKind);
              }}
              style={{
                width: 30,
                height: 30,
                borderRadius: 10,
                border: `1px solid ${color}66`,
                background: "rgba(255,255,255,0.08)",
                color,
                cursor: "pointer",
                fontWeight: 900,
                fontFamily: "inherit",
              }}
            >
              +
            </button>
          )}

          <button
            type="button"
            title={isOpen ? "إخفاء" : "فتح"}
            aria-label={`${isOpen ? "إخفاء" : "فتح"} ${title}`}
            onClick={onToggle}
            style={{
              width: 30,
              height: 30,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.15)",
              background: isOpen ? `${color}24` : "rgba(255,255,255,0.08)",
              color,
              cursor: "pointer",
              fontWeight: 900,
              fontFamily: "inherit",
            }}
          >
            {isOpen ? "-" : "⋯"}
          </button>
        </div>

        <div style={{ textAlign: "right", flex: 1 }}>
          <div style={{ color, fontSize: 14, fontWeight: 900 }}>
            {icon} {title}
          </div>
          <div style={{ fontSize: 21, fontWeight: 900, marginTop: 2 }}>
            {Number(total || 0).toFixed(2)}
            <span style={{ fontSize: 11, color: visualIdentity.colors.textSecondary }}> {currencyLabel}</span>
          </div>
        </div>
      </div>

      {subtitle}
      {children}
    </div>
  );
}
