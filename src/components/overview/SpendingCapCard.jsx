import DueLiabilitiesButton from "./DueLiabilitiesButton";
import visualIdentity from "../../theme/visualIdentity";
import { useLocale } from "../../i18n/locale";

const { colors, gradients, cards, typography } = visualIdentity;

function CompactRecentExpenses({ items, onSelect, onShowAll, incomeAmount, categoryColors }) {
  const { currencyLabel } = useLocale();
  return (
    <div
      style={{
        minWidth: 0,
        overflow: "hidden",
        background: gradients.outerCard,
        border: cards.outer.border,
        borderRadius: cards.outer.borderRadius,
        boxShadow: cards.outer.boxShadow,
        direction: "rtl",
      }}
    >
      <div
        style={{
          height: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 10px",
          borderBottom: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <strong style={{ color: colors.white, fontSize: 12, fontWeight: 900 }}>
          آخر المصاريف
        </strong>
        <button
          type="button"
          onClick={onShowAll}
          title="عرض كل المصاريف"
          aria-label="عرض كل المصاريف"
          style={{
            width: 27,
            height: 27,
            borderRadius: 9,
            border: "1px solid rgba(255,198,45,0.34)",
            background: "rgba(255,198,45,0.10)",
            color: colors.gold,
            fontSize: 18,
            lineHeight: 1,
            cursor: "pointer",
          }}
        >
          ‹
        </button>
      </div>

      {items.map((expense, index) => {
        const income = Boolean(expense.isIncomeEntry);
        const amount = incomeAmount(expense);

        return (
          <button
            key={expense.id}
            type="button"
            onClick={() => onSelect(expense)}
            title="تفاصيل المصروف"
            style={{
              width: "100%",
              minHeight: 55,
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) 62px",
              alignItems: "center",
              gap: 7,
              padding: "8px 10px",
              border: "none",
              borderBottom:
                index < items.length - 1 ? "1px solid rgba(255,255,255,0.10)" : "none",
              background: "transparent",
              color: colors.white,
              cursor: "pointer",
              fontFamily: "inherit",
              textAlign: "right",
            }}
          >
            <span style={{ minWidth: 0 }}>
              <strong
                style={{
                  display: "block",
                  overflow: "hidden",
                  fontSize: 11,
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
                  fontSize: 8.5,
                  fontWeight: 700,
                }}
              >
                {expense.category}
              </small>
            </span>
            <strong
              style={{
                color: income ? colors.green : colors.red,
                fontSize: 11,
                fontWeight: 900,
                textAlign: "left",
                fontVariantNumeric: "tabular-nums",
                whiteSpace: "nowrap",
              }}
            >
              {income ? "+" : "-"}{amount.toFixed(0)}
              <small style={{ marginInlineStart: 2, fontSize: 7 }}>{currencyLabel}</small>
            </strong>
          </button>
        );
      })}

      {!items.length && (
        <div
          style={{
            minHeight: 165,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 12,
            color: colors.textSecondary,
            fontSize: 10,
            textAlign: "center",
          }}
        >
          لا توجد مصاريف بعد
        </div>
      )}
    </div>
  );
}

export default function SpendingCapCard({
  spendingProgress,
  remainingValue,
  spentValue,
  spendingCapValue,
  overBudgetSpent,
  dueLiabilitiesCount,
  onOpenDueLiabilities,
  recentExpenses,
  onSelectExpense,
  onShowAllExpenses,
  incomeAmount,
  categoryColors,
}) {
  const { currencyLabel, t } = useLocale();
  const safeProgress = Math.min(100, Math.max(0, Number(spendingProgress || 0)));
  const gaugeFill = safeProgress * 0.75;
  const statusColor = safeProgress > 70 ? colors.red : safeProgress >= 50 ? colors.gold : colors.green;

  return (
    <section
      aria-label="ملخص سقف الصرف وآخر المصاريف"
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.05fr) minmax(0, 0.95fr)",
        gap: 11,
        marginBottom: 15,
        direction: "ltr",
      }}
    >
      <CompactRecentExpenses
        items={recentExpenses}
        onSelect={onSelectExpense}
        onShowAll={onShowAllExpenses}
        incomeAmount={incomeAmount}
        categoryColors={categoryColors}
      />

      <div
        style={{
          minWidth: 0,
          minHeight: 201,
          padding: "12px 9px 11px",
          borderRadius: cards.outer.borderRadius,
          background: gradients.outerCard,
          border: cards.outer.border,
          boxShadow: cards.outer.boxShadow,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          direction: "rtl",
        }}
      >
        <div
          style={{
            width: "100%",
            minHeight: 28,
            display: "grid",
            gridTemplateColumns: "30px 1fr 30px",
            alignItems: "center",
          }}
        >
          <DueLiabilitiesButton count={dueLiabilitiesCount} onClick={onOpenDueLiabilities} />
          <strong
            style={{
              ...typography.onDarkTitle,
              gridColumn: 2,
              textAlign: "center",
              fontSize: 12,
            }}
          >
            {t("expenses.limit")}
          </strong>
        </div>

        <div
          style={{
            position: "relative",
            width: 122,
            height: 122,
            flex: "0 0 auto",
            borderRadius: "50%",
            background: `conic-gradient(from 225deg, ${statusColor} 0 ${gaugeFill}%, rgba(255,255,255,0.13) ${gaugeFill}% 75%, transparent 75% 100%)`,
            filter: `drop-shadow(0 0 8px ${statusColor}55)`,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 13,
              borderRadius: "50%",
              background: "linear-gradient(145deg, #346DA7, #2B5E95)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: colors.white,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10)",
            }}
          >
            <strong style={{ color: colors.gold, fontSize: 23, fontWeight: 900, lineHeight: 1 }}>
              {safeProgress.toFixed(0)}%
            </strong>
            <span
              style={{
                marginTop: 6,
                color: colors.textSecondary,
                fontSize: 9,
                fontWeight: 800,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {spentValue.toFixed(0)} / {spendingCapValue.toFixed(0)}
            </span>
          </div>
        </div>

        <strong
          style={{
            color: overBudgetSpent > 0 ? colors.red : colors.green,
            fontSize: 13,
            fontWeight: 900,
            textAlign: "center",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {overBudgetSpent > 0
            ? `${t("expenses.overLimit")} ${Number(overBudgetSpent).toFixed(0)} ${currencyLabel}`
            : `${t("expenses.remaining")} ${remainingValue.toFixed(0)} ${currencyLabel}`}
        </strong>
      </div>
    </section>
  );
}
