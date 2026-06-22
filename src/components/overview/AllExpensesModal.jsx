import visualIdentity from "../../theme/visualIdentity";

const { colors, gradients, cards } = visualIdentity;

export default function AllExpensesModal({
  open,
  items,
  onClose,
  onSelect,
  incomeAmount,
  categoryColors,
}) {
  if (!open) return null;

  return (
    <div
      onClick={(event) => event.target === event.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1120,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        background: "rgba(4,20,40,0.76)",
        backdropFilter: "blur(10px)",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 440,
          maxHeight: "82vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          padding: "15px 14px calc(18px + env(safe-area-inset-bottom))",
          borderRadius: "20px 20px 0 0",
          background: gradients.appBackground,
          border: cards.outer.border,
          boxShadow: "0 -18px 42px rgba(3,18,37,0.34)",
          direction: "rtl",
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: 12,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            title="إغلاق"
            aria-label="إغلاق"
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.16)",
              background: "rgba(255,255,255,0.08)",
              color: colors.white,
              fontSize: 20,
              cursor: "pointer",
            }}
          >
            ×
          </button>
          <div style={{ textAlign: "right" }}>
            <strong style={{ display: "block", color: colors.white, fontSize: 17, fontWeight: 900 }}>
              كل المصاريف
            </strong>
            <span style={{ color: colors.textSecondary, fontSize: 10, fontWeight: 700 }}>
              {items.length} عملية مسجلة
            </span>
          </div>
        </header>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            background: gradients.outerCard,
            border: cards.outer.border,
            borderRadius: cards.outer.borderRadius,
            boxShadow: cards.outer.boxShadow,
          }}
        >
          {items.map((expense, index) => {
            const income = Boolean(expense.isIncomeEntry);
            return (
              <button
                key={expense.id}
                type="button"
                onClick={() => {
                  onSelect(expense);
                  onClose();
                }}
                style={{
                  width: "100%",
                  minHeight: 62,
                  display: "grid",
                  gridTemplateColumns: "70px minmax(0, 1fr) 24px",
                  alignItems: "center",
                  gap: 8,
                  padding: "9px 11px",
                  border: "none",
                  borderBottom:
                    index < items.length - 1 ? "1px solid rgba(255,255,255,0.11)" : "none",
                  background: "transparent",
                  color: colors.white,
                  fontFamily: "inherit",
                  cursor: "pointer",
                  direction: "ltr",
                }}
              >
                <strong
                  style={{
                    color: income ? colors.green : colors.red,
                    fontSize: 12,
                    fontWeight: 900,
                    textAlign: "left",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {income ? "+" : "-"}{incomeAmount(expense).toFixed(2)}
                </strong>
                <span style={{ minWidth: 0, textAlign: "right", direction: "rtl" }}>
                  <strong
                    style={{
                      display: "block",
                      overflow: "hidden",
                      fontSize: 12,
                      fontWeight: 900,
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {expense.note || expense.category}
                  </strong>
                  <small
                    style={{
                      display: "block",
                      marginTop: 3,
                      color: categoryColors[expense.category] || colors.textSecondary,
                      fontSize: 9,
                      fontWeight: 700,
                    }}
                  >
                    {expense.category} · {expense.paymentMethod}
                  </small>
                </span>
                <span style={{ color: colors.gold, fontSize: 18 }}>‹</span>
              </button>
            );
          })}

          {!items.length && (
            <div style={{ padding: 28, color: colors.textSecondary, fontSize: 12, textAlign: "center" }}>
              لا توجد مصاريف بعد
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
