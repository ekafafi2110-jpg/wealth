import { ChevronLeft, StickyNote } from "lucide-react";
import visualIdentity from "../../theme/visualIdentity";

const { colors, gradients, cards } = visualIdentity;

export default function RecentExpensesPreview({
  items,
  onSelect,
  onShowAll,
  onEditNote,
  incomeAmount,
  currencyLabel,
}) {
  return (
    <section
      style={{
        marginBottom: 12,
        background: gradients.innerCard,
        border: cards.inner.border,
        borderRadius: cards.inner.borderRadius,
        boxShadow: cards.inner.boxShadow,
        direction: "rtl",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          minHeight: 38,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          padding: "7px 9px",
          borderBottom: "1px solid rgba(255,255,255,0.10)",
        }}
      >
        <strong style={{ color: colors.white, fontSize: 12, fontWeight: 900 }}>
          آخر 5 مصاريف
        </strong>
        <button
          type="button"
          onClick={onShowAll}
          title="عرض كشف المصاريف كاملا"
          aria-label="عرض كشف المصاريف كاملا"
          style={{
            width: 26,
            height: 26,
            borderRadius: 9,
            border: "1px solid rgba(255,198,45,0.34)",
            background: "rgba(255,198,45,0.10)",
            color: colors.gold,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flex: "0 0 auto",
          }}
        >
          <ChevronLeft size={15} strokeWidth={2.7} />
        </button>
      </div>

      {items.length ? (
        items.map((expense, index) => {
          const income = Boolean(expense.isIncomeEntry);
          const amount = Number(incomeAmount(expense) || 0);
          const amountColor = income ? colors.green : "#FF5F6D";
          const hasNote = Boolean(String(expense.note || "").trim());

          return (
            <div
              key={expense.id || `${expense.date}-${index}`}
              style={{
                minHeight: 44,
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) 34px 58px",
                alignItems: "center",
                gap: 7,
                padding: "7px 8px",
                borderBottom:
                  index < items.length - 1 ? "1px solid rgba(255,255,255,0.08)" : 0,
                direction: "rtl",
              }}
            >
              <button
                type="button"
                onClick={() => onSelect(expense)}
                title="تفاصيل المصروف"
                aria-label="تفاصيل المصروف"
                style={{
                  minWidth: 0,
                  padding: 0,
                  border: 0,
                  background: "transparent",
                  color: colors.white,
                  fontFamily: "inherit",
                  cursor: "pointer",
                  textAlign: "right",
                }}
              >
                <b
                  style={{
                    display: "block",
                    overflow: "hidden",
                    color: colors.white,
                    fontSize: 11,
                    fontWeight: 900,
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {expense.category || "غير مصنف"}
                </b>
                <small
                  style={{
                    display: "block",
                    marginTop: 2,
                    overflow: "hidden",
                    color: colors.textSecondary,
                    fontSize: 8.5,
                    fontWeight: 700,
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {expense.note || expense.paymentMethod || "بدون ملاحظة"}
                </small>
              </button>
              <button
                type="button"
                onClick={() => onEditNote?.(expense)}
                title={hasNote ? "تعديل الملاحظة" : "إضافة ملاحظة"}
                aria-label={hasNote ? "تعديل ملاحظة المصروف" : "إضافة ملاحظة للمصروف"}
                style={{
                  width: 30,
                  height: 30,
                  justifySelf: "center",
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
              <button
                type="button"
                onClick={() => onSelect(expense)}
                style={{
                  minHeight: 28,
                  padding: 0,
                  border: "none",
                  background: "transparent",
                  color: amountColor,
                  justifySelf: "stretch",
                  fontFamily: "inherit",
                  fontSize: 12,
                  fontWeight: 950,
                  fontVariantNumeric: "tabular-nums",
                  whiteSpace: "nowrap",
                  textAlign: "left",
                  direction: "ltr",
                  textShadow: `0 0 9px ${amountColor}77`,
                  cursor: "pointer",
                }}
              >
                {income ? "+" : "-"}
                {amount.toFixed(0)}
                <small style={{ marginInlineStart: 3, fontSize: 8 }}>{currencyLabel}</small>
              </button>
            </div>
          );
        })
      ) : (
        <div
          style={{
            padding: "16px 10px",
            color: colors.textSecondary,
            fontSize: 11,
            fontWeight: 800,
            textAlign: "center",
          }}
        >
          لا توجد مصاريف بعد
        </div>
      )}
    </section>
  );
}
