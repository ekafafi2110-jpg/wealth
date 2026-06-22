import visualIdentity from "../../theme/visualIdentity";
import { useLocale } from "../../i18n/locale";

export default function AssetsSummaryCard({ totalAssets, liquidSavings, netWorth }) {
  const { currencyLabel } = useLocale();
  return (
    <section
      style={{
        marginBottom: 14,
        padding: 14,
        borderRadius: visualIdentity.cards.outer.borderRadius,
        background: visualIdentity.gradients.outerCard,
        border: visualIdentity.cards.outer.border,
        boxShadow: visualIdentity.cards.outer.boxShadow,
        color: visualIdentity.colors.white,
        textAlign: "right",
      }}
    >
      <div style={{ fontSize: 11, color: visualIdentity.colors.textSecondary, fontWeight: 800 }}>
        إجمالي الأصول
      </div>
      <div style={{ marginTop: 3, fontSize: 30, fontWeight: 900, fontVariantNumeric: "tabular-nums" }}>
        {totalAssets.toFixed(2)}{" "}
        <span style={{ fontSize: 12, color: visualIdentity.colors.textSecondary }}>{currencyLabel}</span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginTop: 10,
        }}
      >
        <div
          style={{
            padding: "10px 9px",
            borderRadius: visualIdentity.cards.inner.borderRadius,
            background: visualIdentity.gradients.innerCard,
            border: visualIdentity.cards.inner.border,
          }}
        >
          <div style={{ fontSize: 9.5, color: visualIdentity.colors.textSecondary }}>ادخار سائل</div>
          <b style={{ display: "block", marginTop: 3, color: visualIdentity.colors.green }}>
            {liquidSavings.toFixed(2)}
          </b>
        </div>

        <div
          style={{
            padding: "10px 9px",
            borderRadius: visualIdentity.cards.inner.borderRadius,
            background: visualIdentity.gradients.innerCard,
            border: visualIdentity.cards.inner.border,
          }}
        >
          <div style={{ fontSize: 9.5, color: visualIdentity.colors.textSecondary }}>صافي الثروة</div>
          <b style={{ display: "block", marginTop: 3, color: visualIdentity.colors.gold }}>
            {netWorth.toFixed(2)}
          </b>
        </div>
      </div>
    </section>
  );
}
