import { StickyNote } from "lucide-react";
import visualIdentity from "../../theme/visualIdentity";

const { colors, gradients, cards } = visualIdentity;

export default function AllExpensesModal({
  open,
  items,
  onClose,
  onSelect,
  onEditNote,
  incomeAmount,
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
            gap: 10,
            paddingBottom: 12,
          }}
        >
          <div style={{ textAlign: "right" }}>
            <strong style={{ display: "block", color: colors.white, fontSize: 17, fontWeight: 900 }}>
              كل المصاريف
            </strong>
            <span style={{ color: colors.textSecondary, fontSize: 10, fontWeight: 700 }}>
              {items.length} عملية مسجلة
            </span>
          </div>
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
              flex: "0 0 auto",
            }}
          >
            x
          </button>
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
            const amountColor = income ? colors.green : colors.red;
            const hasNote = Boolean(String(expense.note || "").trim());

            return (
              <div
                key={expense.id || `${expense.date}-${index}`}
                style={{
                  minHeight: 62,
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) 76px 32px 20px",
                  alignItems: "center",
                  gap: 8,
                  padding: "9px 11px",
                  borderBottom:
                    index < items.length - 1 ? "1px solid rgba(255,255,255,0.11)" : "none",
                  direction: "rtl",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    onSelect(expense);
                    onClose();
                  }}
                  style={{
                    minWidth: 0,
                    padding: 0,
                    border: "none",
                    background: "transparent",
                    color: colors.white,
                    fontFamily: "inherit",
                    cursor: "pointer",
                    textAlign: "right",
                    direction: "rtl",
                  }}
                >
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
                    {expense.category || "غير مصنف"}
                  </strong>
                  <small
                    style={{
                      display: "block",
                      marginTop: 3,
                      overflow: "hidden",
                      color: colors.textSecondary,
                      fontSize: 9,
                      fontWeight: 700,
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {expense.note || "بدون ملاحظة"} · {expense.paymentMethod}
                  </small>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(expense);
                    onClose();
                  }}
                  style={{
                    minHeight: 30,
                    padding: "4px 6px",
                    borderRadius: 9,
                    border: `1px solid ${amountColor}44`,
                    background: income ? `${colors.green}18` : `${colors.red}1f`,
                    color: amountColor,
                    fontFamily: "inherit",
                    fontSize: 12,
                    fontWeight: 950,
                    textAlign: "center",
                    direction: "ltr",
                    fontVariantNumeric: "tabular-nums",
                    whiteSpace: "nowrap",
                    textShadow: `0 0 8px ${amountColor}66`,
                    cursor: "pointer",
                  }}
                >
                  {income ? "+" : "-"}{incomeAmount(expense).toFixed(2)}
                </button>
                <button
                  type="button"
                  onClick={() => onEditNote?.(expense)}
                  title={hasNote ? "تعديل الملاحظة" : "إضافة ملاحظة"}
                  aria-label={hasNote ? "تعديل ملاحظة المصروف" : "إضافة ملاحظة للمصروف"}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 10,
                    border: hasNote
                      ? `1px solid ${colors.cyan}88`
                      : "1px solid rgba(255,255,255,0.16)",
                    background: hasNote ? `${colors.cyan}22` : "rgba(255,255,255,0.08)",
                    color: hasNote ? colors.cyan : colors.textSecondary,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <StickyNote size={15} strokeWidth={2.3} />
                </button>
                <span style={{ color: colors.gold, fontSize: 18 }}>‹</span>
              </div>
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
