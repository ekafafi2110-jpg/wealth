import visualIdentity from "../../theme/visualIdentity";

export default function ExpenseCategoryGrid({
  categories,
  selectedCategory,
  onSelect,
  getTileStyle,
  icons,
  pendingByCategory = {},
  variant = "compact",
}) {
  const large = variant === "large";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        gap: large ? 8 : 7,
        marginBottom: large ? 12 : 10,
        padding: large ? 9 : 8,
        background: visualIdentity.gradients.innerCard,
        border: visualIdentity.cards.inner.border,
        borderRadius: visualIdentity.cards.inner.borderRadius,
        boxShadow: visualIdentity.cards.inner.boxShadow,
      }}
    >
      {categories
        .filter((item) => !item.isOther)
        .slice(0, 8)
        .map((item) => {
          const category = item.label;
          const active = selectedCategory === category;
          const tile = getTileStyle(category);
          const accent = item.color || tile.icon || visualIdentity.colors.cyan;
          const pendingAmount = Number(pendingByCategory[category] || 0);

          return (
            <button
              key={category}
              type="button"
              onClick={() => onSelect(category)}
              style={{
                position: "relative",
                minHeight: large ? 72 : 64,
                borderRadius: large ? 15 : 13,
                border: active
                  ? `1.5px solid ${visualIdentity.colors.gold}`
                  : pendingAmount > 0
                  ? "1.5px solid rgba(245,200,66,0.70)"
                  : "1px solid rgba(255,255,255,0.14)",
                background: active
                  ? "rgba(255,198,45,0.17)"
                  : pendingAmount > 0
                  ? "rgba(245,200,66,0.16)"
                  : "rgba(255,255,255,0.075)",
                color: visualIdentity.colors.white,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: large ? 6 : 5,
                padding: large ? "8px 5px" : "7px 4px",
                cursor: "pointer",
                fontFamily: "inherit",
                fontWeight: 800,
                boxShadow: large
                  ? active
                    ? "0 8px 20px rgba(255,198,45,0.14)"
                    : "inset 0 1px 0 rgba(255,255,255,0.08)"
                  : undefined,
              }}
            >
              {active && (
                <span
                  style={{
                    position: "absolute",
                    top: large ? -8 : -7,
                    right: large ? -8 : -7,
                    width: large ? 21 : 19,
                    height: large ? 21 : 19,
                    borderRadius: "999px",
                    background: visualIdentity.colors.gold,
                    color: visualIdentity.colors.navy,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: large ? 11 : 10,
                    fontWeight: 900,
                    boxShadow: large
                      ? "0 6px 14px rgba(255,198,45,0.24)"
                      : undefined,
                  }}
                >
                  ✓
                </span>
              )}

              {pendingAmount > 0 && !active && (
                <span
                  style={{
                    position: "absolute",
                    top: -7,
                    right: -7,
                    minWidth: 24,
                    height: 22,
                    padding: "0 5px",
                    borderRadius: 999,
                    background: visualIdentity.colors.gold,
                    color: visualIdentity.colors.blueDeep,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 9,
                    fontWeight: 900,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {pendingAmount.toFixed(0)}
                </span>
              )}

              <span
                style={{
                  width: large ? 34 : 30,
                  height: large ? 34 : 30,
                  borderRadius: large ? 11 : 10,
                  background: `${accent}1F`,
                  color: accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: large ? 19 : 17,
                  lineHeight: 1,
                  flex: large ? "0 0 auto" : undefined,
                  boxShadow:
                    pendingAmount > 0
                      ? "0 0 0 3px rgba(245,200,66,0.22)"
                      : `inset 0 1px 0 ${accent}2A`,
                }}
              >
                {item.icon || icons[category] || "📌"}
              </span>

              <span
                style={{
                  fontSize: large ? 10.5 : 9.5,
                  ...visualIdentity.typography.onDarkBody,
                  textAlign: "center",
                  lineHeight: 1.2,
                  maxWidth: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {category}
              </span>
            </button>
          );
        })}
    </div>
  );
}
