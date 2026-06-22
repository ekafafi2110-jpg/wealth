import visualIdentity from "../../theme/visualIdentity";

const chartModes = [
  { id: "donut", icon: "◔", title: "دائرة المصاريف" },
  { id: "bars", icon: "▥", title: "أعمدة المصاريف" },
];

export default function ExpenseSummaryReportCard({
  total,
  overBudgetTotal,
  chartMode,
  onChartModeChange,
  onOpenOverBudget,
  children,
}) {
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
        <div style={{ display: "flex", gap: 6 }}>
          {chartModes.map((item) => {
            const active = chartMode === item.id;

            return (
              <button
                key={item.id}
                type="button"
                title={item.title}
                aria-label={item.title}
                onClick={() => onChartModeChange(item.id)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  border: active
                    ? `1.5px solid ${visualIdentity.colors.gold}`
                    : "1px solid rgba(255,255,255,0.14)",
                  background: active
                    ? visualIdentity.gradients.gold
                    : visualIdentity.gradients.innerCard,
                  color: active
                    ? visualIdentity.colors.blueDeep
                    : visualIdentity.colors.white,
                  cursor: "pointer",
                  fontSize: 15,
                  fontWeight: 800,
                  fontFamily: "inherit",
                }}
              >
                {item.icon}
              </button>
            );
          })}
        </div>

        <div style={{ ...visualIdentity.typography.onDarkTitle, fontSize: 14 }}>
          ملخص المصروفات
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: overBudgetTotal > 0 ? "1fr 1fr" : "1fr",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            ...visualIdentity.cards.inner,
            background: visualIdentity.gradients.innerCard,
            padding: "11px 10px",
            textAlign: "center",
          }}
        >
          <div style={{ ...visualIdentity.typography.onDarkSecondary, fontSize: 10 }}>
            إجمالي المصروف
          </div>
          <div style={{ ...visualIdentity.typography.onDarkTitle, fontSize: 17 }}>
            {total.toFixed(2)}
          </div>
        </div>

        {overBudgetTotal > 0 && (
          <button
            type="button"
            onClick={onOpenOverBudget}
            style={{
              ...visualIdentity.cards.inner,
              background: "rgba(217,85,85,0.16)",
              padding: "11px 10px",
              textAlign: "center",
              color: "#FF9B9B",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <div style={{ fontSize: 10 }}>التجاوز</div>
            <div style={{ fontSize: 17, fontWeight: 800 }}>
              {overBudgetTotal.toFixed(2)}
            </div>
          </button>
        )}
      </div>

      {children}
    </section>
  );
}
