import visualIdentity from "../../theme/visualIdentity";
import { useLocale } from "../../i18n/locale";

export default function PendingSurplusCard({ amount, onAllocate }) {
  const { currencyLabel } = useLocale();
  if (Number(amount || 0) <= 0) return null;

  return (
    <div
      style={{
        marginBottom: 14,
        padding: 12,
        borderRadius: visualIdentity.cards.outer.borderRadius,
        background: visualIdentity.gradients.outerCard,
        border: visualIdentity.cards.outer.border,
        boxShadow: visualIdentity.cards.outer.boxShadow,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
        <button
          type="button"
          onClick={() => onAllocate(Number(amount || 0))}
          title="توجيه الفائض"
          aria-label="توجيه الفائض"
          style={{
            width: 40,
            height: 36,
            borderRadius: 12,
            border: "1px solid rgba(255,198,45,0.34)",
            background: "rgba(255,198,45,0.12)",
            color: visualIdentity.colors.gold,
            fontSize: 18,
            cursor: "pointer",
          }}
        >
          ↗
        </button>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: visualIdentity.colors.textSecondary, fontSize: 11, fontWeight: 800 }}>
            فائض راتب ينتظر التوجيه
          </div>
          <div
            style={{
              marginTop: 3,
              color: visualIdentity.colors.green,
              fontSize: 18,
              fontWeight: 900,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {Number(amount || 0).toFixed(2)} {currencyLabel}
          </div>
        </div>
      </div>
    </div>
  );
}
