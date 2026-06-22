import visualIdentity from "../../theme/visualIdentity";

export default function AssetTrendReportCard({
  change,
  changePct,
  changeColor,
  currentAssets,
  months,
  bars,
  detailsOpen,
  onToggleDetails,
  onMonthsChange,
}) {
  const positive = change >= 0;

  return (
    <section
      style={{
        background: visualIdentity.gradients.outerCard,
        border: visualIdentity.cards.outer.border,
        borderRadius: visualIdentity.cards.outer.borderRadius,
        boxShadow: visualIdentity.cards.outer.boxShadow,
        padding: 14,
        marginBottom: 14,
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
            title="تفاصيل التغير"
            aria-label="تفاصيل تغير الأصول"
            onClick={onToggleDetails}
            style={{
              width: 30,
              height: 30,
              borderRadius: 10,
              border: detailsOpen
                ? `1px solid ${visualIdentity.colors.gold}`
                : "1px solid rgba(255,255,255,0.14)",
              background: detailsOpen
                ? "rgba(255,198,45,0.16)"
                : visualIdentity.gradients.innerCard,
              color: detailsOpen
                ? visualIdentity.colors.gold
                : visualIdentity.colors.white,
              cursor: "pointer",
              fontWeight: 900,
              fontFamily: "inherit",
            }}
          >
            ⓘ
          </button>

          <div
            style={{
              color: changeColor,
              fontSize: 12,
              fontWeight: 900,
              background: positive
                ? "rgba(34,197,94,0.16)"
                : "rgba(239,68,68,0.16)",
              border: `1px solid ${
                positive ? "rgba(34,197,94,0.38)" : "rgba(239,68,68,0.38)"
              }`,
              borderRadius: 999,
              padding: "5px 8px",
            }}
          >
            {positive ? "+" : ""}
            {change.toFixed(2)}
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ ...visualIdentity.typography.onDarkTitle, fontSize: 14 }}>
            تغير الأصول الشهري
          </div>
          <select
            value={months}
            onChange={(event) => onMonthsChange(Number(event.target.value || 6))}
            style={{
              width: 112,
              marginTop: 4,
              padding: "5px 7px",
              border: visualIdentity.cards.inner.border,
              borderRadius: 8,
              background: visualIdentity.gradients.innerCard,
              color: visualIdentity.colors.white,
              fontSize: 10,
              fontFamily: "inherit",
              textAlign: "right",
            }}
          >
            <option value={3}>آخر 3 أشهر</option>
            <option value={6}>آخر 6 أشهر</option>
            <option value={9}>آخر 9 أشهر</option>
            <option value={12}>آخر 12 شهر</option>
          </select>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            ...visualIdentity.cards.inner,
            background: visualIdentity.gradients.innerCard,
            padding: 9,
            textAlign: "right",
          }}
        >
          <div style={{ ...visualIdentity.typography.onDarkSecondary, fontSize: 10 }}>
            الأصول الآن
          </div>
          <b style={{ ...visualIdentity.typography.onDarkTitle, fontSize: 17 }}>
            {currentAssets.toFixed(2)}
          </b>
        </div>

        <div
          style={{
            ...visualIdentity.cards.inner,
            background: visualIdentity.gradients.innerCard,
            padding: 9,
            textAlign: "right",
          }}
        >
          <div style={{ ...visualIdentity.typography.onDarkSecondary, fontSize: 10 }}>
            النسبة
          </div>
          <b style={{ color: changeColor, fontSize: 17, fontWeight: 800 }}>
            {positive ? "+" : ""}
            {changePct.toFixed(1)}%
          </b>
        </div>
      </div>

      <div
        style={{
          height: 96,
          display: "grid",
          gridTemplateColumns: `repeat(${Math.max(bars.length, 1)}, 1fr)`,
          gap: 7,
          alignItems: "end",
          borderTop: "1px solid rgba(255,255,255,0.14)",
          paddingTop: 10,
        }}
      >
        {bars.length ? (
          bars.map((bar) => (
            <div key={bar.id} style={{ textAlign: "center" }}>
              <div
                title={bar.title}
                style={{
                  height: bar.height,
                  minHeight: 18,
                  borderRadius: "8px 8px 4px 4px",
                  background: bar.color,
                }}
              />
              <div
                style={{
                  ...visualIdentity.typography.onDarkSecondary,
                  fontSize: 9,
                  marginTop: 5,
                }}
              >
                {bar.label}
              </div>
            </div>
          ))
        ) : (
          <div
            style={{
              ...visualIdentity.typography.onDarkSecondary,
              fontSize: 12,
              textAlign: "center",
            }}
          >
            لا توجد لقطات شهرية بعد
          </div>
        )}
      </div>
    </section>
  );
}
