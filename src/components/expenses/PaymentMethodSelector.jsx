import visualIdentity from "../../theme/visualIdentity";
import { useLocale } from "../../i18n/locale";

export default function PaymentMethodSelector({
  options,
  value,
  activeValues,
  onChange,
  variant = "plain",
}) {
  const glass = variant === "glass";
  const { t } = useLocale();
  const optionLabelKeys = {
    cash: "expenses.cash",
    card: "expenses.card",
    liability: "expenses.newLiability",
    emergency: "expenses.emergency",
  };

  return (
    <div
      style={{
        marginBottom: 8,
        padding: 7,
        background: visualIdentity.gradients.innerCard,
        border: visualIdentity.cards.inner.border,
        borderRadius: visualIdentity.cards.inner.borderRadius,
        boxShadow: visualIdentity.cards.inner.boxShadow,
        fontFamily: visualIdentity.typography.fontFamily,
      }}
    >
      <div
        style={{
          fontSize: 12.5,
          ...visualIdentity.typography.onDarkTitle,
          textAlign: "right",
          marginBottom: 6,
        }}
      >
        {t("expenses.paymentMethod")}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${Math.max(1, options.length)}, minmax(0, 1fr))`,
          gap: 5,
          background: "rgba(255,255,255,0.045)",
          backdropFilter: "blur(10px)",
          border: visualIdentity.cards.inner.border,
          borderRadius: 12,
          padding: 4,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10)",
        }}
      >
        {options.map((item) => {
          const active = Array.isArray(activeValues)
            ? activeValues.includes(item.value)
            : value === item.value;

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onChange(item.value)}
              style={{
                minHeight: glass ? 43 : 45,
                borderRadius: 11,
                border: active
                  ? `1.5px solid ${visualIdentity.colors.gold}`
                  : "1px solid rgba(255,255,255,0.12)",
                background: active
                  ? visualIdentity.gradients.gold
                  : "rgba(255,255,255,0.07)",
                color: active
                  ? visualIdentity.colors.blueDeep
                  : visualIdentity.typography.bodyColor,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                cursor: "pointer",
                fontFamily: "inherit",
                fontWeight: active ? 900 : 700,
                padding: "4px 2px",
                backdropFilter: "blur(5px)",
                boxShadow: active
                  ? "0 5px 14px rgba(217,172,47,0.28), inset 0 1px 0 rgba(255,255,255,0.35)"
                  : "inset 0 1px 0 rgba(255,255,255,0.08)",
              }}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>{item.icon}</span>
              <span
                style={{
                  fontSize: 9.5,
                  fontWeight: visualIdentity.typography.onDarkBody.fontWeight,
                  lineHeight: 1.15,
                  whiteSpace: "nowrap",
                  textShadow: active
                    ? "none"
                    : visualIdentity.typography.onDarkBody.textShadow,
                }}
              >
                {t(optionLabelKeys[item.value], item.label)}
              </span>
              {item.amountLabel && (
                <span
                  style={{
                    fontSize: 8,
                    lineHeight: 1,
                    fontWeight: 900,
                    opacity: 0.86,
                  }}
                >
                  {item.amountLabel}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
