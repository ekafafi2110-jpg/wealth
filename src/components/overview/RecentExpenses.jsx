import visualIdentity from "../../theme/visualIdentity";

const { colors, gradients, cards } = visualIdentity;

export default function RecentExpenses({
  items,
  onSelect,
  incomeAmount,
  incomeMeta,
  categoryColors,
}) {
  return (
    <section style={{ marginTop: 16, marginBottom: 14 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <span style={{ color: colors.gold, fontSize: 11, fontWeight: 800 }}>عرض الكل</span>
        <h2
          style={{
            margin: 0,
            color: colors.white,
            fontSize: 16,
            fontWeight: 900,
          }}
        >
          آخر المصاريف
        </h2>
      </div>

      <div
        style={{
          overflow: "hidden",
          background: gradients.outerCard,
          border: cards.outer.border,
          borderRadius: cards.outer.borderRadius,
          boxShadow: cards.outer.boxShadow,
        }}
      >
        {items.map((expense, index) => {
          const income = Boolean(expense.isIncomeEntry);
          const amountColor = income ? colors.green : colors.red;

          return (
            <div
              key={expense.id}
              style={{
                minHeight: 68,
                display: "grid",
                gridTemplateColumns: "72px minmax(0, 1fr) 38px",
                alignItems: "center",
                gap: 9,
                padding: "10px 12px",
                borderBottom:
                  index < items.length - 1 ? "1px solid rgba(255,255,255,0.12)" : "none",
                direction: "ltr",
              }}
            >
              <div style={{ minWidth: 0, textAlign: "left" }}>
                <strong
                  style={{
                    display: "block",
                    color: amountColor,
                    fontSize: 14,
                    fontWeight: 900,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {income ? "+" : "-"}{incomeAmount(expense).toFixed(2)}
                </strong>
                <span
                  style={{
                    display: "block",
                    marginTop: 3,
                    color: colors.textFaint,
                    fontSize: 8.5,
                    fontWeight: 700,
                  }}
                >
                  {incomeMeta(expense)}
                </span>
              </div>

              <div style={{ minWidth: 0, textAlign: "right", direction: "rtl" }}>
                <strong
                  style={{
                    display: "block",
                    overflow: "hidden",
                    color: colors.white,
                    fontSize: 13,
                    fontWeight: 900,
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {expense.note || expense.category}
                </strong>
                <span
                  style={{
                    display: "block",
                    marginTop: 4,
                    color: categoryColors[expense.category] || colors.textSecondary,
                    fontSize: 9,
                    fontWeight: 700,
                  }}
                >
                  {expense.category} · {expense.paymentMethod}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onSelect(expense)}
                title="تفاصيل المصروف"
                aria-label="تفاصيل المصروف"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(255,255,255,0.07)",
                  color: colors.gold,
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                ›
              </button>
            </div>
          );
        })}

        {!items.length && (
          <div
            style={{
              padding: "24px 12px",
              color: colors.textSecondary,
              fontSize: 12,
              textAlign: "center",
            }}
          >
            لا توجد مصاريف بعد
          </div>
        )}
      </div>
    </section>
  );
}
