import DueLiabilitiesButton from "./DueLiabilitiesButton";
import visualIdentity from "../../theme/visualIdentity";
import { useLocale } from "../../i18n/locale";

const { colors, gradients, cards, typography } = visualIdentity;

function LatestExpenseRow({ expense, onSelect, onShowAll, incomeAmount }) {
  const { currencyLabel } = useLocale();

  if (!expense) {
    return (
      <div
        style={{
          minHeight: 30,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 7,
          padding: "5px 7px",
          borderRadius: 12,
          background: "rgba(255,255,255,0.055)",
          border: "1px solid rgba(255,255,255,0.10)",
          color: colors.textSecondary,
          fontSize: 9,
          fontWeight: 800,
        }}
      >
        <span>لا توجد مصاريف بعد</span>
        <button
          type="button"
          onClick={onShowAll}
          title="عرض كل المصاريف"
          aria-label="عرض كل المصاريف"
          style={latestArrowStyle}
        >
          ‹
        </button>
      </div>
    );
  }

  const income = Boolean(expense.isIncomeEntry);
  const amount = incomeAmount(expense);
  const amountColor = income ? colors.green : colors.red;

  return (
    <div
      style={{
        minHeight: 32,
        display: "grid",
        gridTemplateColumns: "26px minmax(0, 1fr) auto",
        alignItems: "center",
        gap: 6,
        padding: "4px 6px",
        borderRadius: 12,
        background: "rgba(255,255,255,0.055)",
        border: "1px solid rgba(255,255,255,0.10)",
      }}
    >
      <button
        type="button"
        onClick={onShowAll}
        title="عرض كل المصاريف"
        aria-label="عرض كل المصاريف"
        style={latestArrowStyle}
      >
        ‹
      </button>

      <button
        type="button"
        onClick={() => onSelect(expense)}
        title="تفاصيل المصروف"
        style={{
          minWidth: 0,
          padding: 0,
          border: "none",
          background: "transparent",
          color: colors.white,
          cursor: "pointer",
          fontFamily: "inherit",
          textAlign: "right",
        }}
      >
        <strong
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            overflow: "hidden",
            color: colors.white,
            fontSize: 10,
            fontWeight: 900,
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          <small
            style={{
              color: colors.textSecondary,
              fontSize: 8,
              fontWeight: 800,
              flex: "0 0 auto",
            }}
          >
            آخر مصروف
          </small>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
            {expense.category || "غير مصنف"}
          </span>
          <small
            style={{
              color: colors.textSecondary,
              fontSize: 8,
              fontWeight: 700,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            · {expense.note || expense.paymentMethod || "بدون ملاحظة"}
          </small>
        </strong>
      </button>

      <strong
        style={{
          color: amountColor,
          padding: "4px 6px",
          borderRadius: 9,
          background: income ? `${colors.green}14` : `${colors.red}16`,
          border: `1px solid ${income ? colors.green : colors.red}3d`,
          fontSize: 11,
          fontWeight: 900,
          fontVariantNumeric: "tabular-nums",
          whiteSpace: "nowrap",
          textShadow: `0 0 7px ${amountColor}66`,
        }}
      >
        {income ? "+" : "-"}
        {amount.toFixed(0)}
        <small style={{ marginInlineStart: 3, fontSize: 8 }}>{currencyLabel}</small>
      </strong>
    </div>
  );
}

const latestArrowStyle = {
  width: 24,
  height: 24,
  borderRadius: 9,
  border: "1px solid rgba(255,198,45,0.34)",
  background: "rgba(255,198,45,0.10)",
  color: colors.gold,
  fontSize: 16,
  lineHeight: 1,
  cursor: "pointer",
  flex: "0 0 auto",
};

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
}) {
  const { currencyLabel, t } = useLocale();
  const safeProgress = Math.min(100, Math.max(0, Number(spendingProgress || 0)));
  const statusColor =
    safeProgress >= 85
      ? colors.red
      : safeProgress >= 55
        ? "#FF9F43"
        : colors.green;
  const statusColorSoft =
    safeProgress >= 85
      ? "rgba(255,112,112,0.28)"
      : safeProgress >= 55
        ? "rgba(255,159,67,0.26)"
        : "rgba(76,229,140,0.24)";
  const spentFitsInside = safeProgress >= 26;
  const remainingFitsInside = 100 - safeProgress >= 30;
  const remainingShowsAtEnd = !remainingFitsInside;
  const exceededCap = Number(overBudgetSpent || 0) > 0;
  const totalWithOverBudget = Math.max(
    1,
    Number(spendingCapValue || 0) + Number(overBudgetSpent || 0)
  );
  const capWidthPercent = exceededCap
    ? Math.max(50, Math.min(88, (Number(spendingCapValue || 0) / totalWithOverBudget) * 100))
    : 100;
  const overWidthPercent = 100 - capWidthPercent;
  const spentLabel = `${spentValue.toFixed(0)} ${currencyLabel}`;
  const remainingLabel = `${Math.max(0, remainingValue).toFixed(0)} ${currencyLabel}`;
  const capSpentLabel = `${spendingCapValue.toFixed(0)} ${currencyLabel}`;
  const overBudgetLabel = `${Number(overBudgetSpent || 0).toFixed(0)} ${currencyLabel}`;
  const latestExpense = recentExpenses?.[0];

  return (
    <section
      aria-label="ملخص سقف الصرف وآخر المصاريف"
      style={{
        marginBottom: 11,
        direction: "rtl",
      }}
    >
      <div
        style={{
          minWidth: 0,
          padding: "8px 9px 7px",
          borderRadius: cards.outer.borderRadius,
          background: gradients.outerCard,
          border: cards.outer.border,
          boxShadow: cards.outer.boxShadow,
          direction: "rtl",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "32px minmax(0, 1fr)",
            alignItems: "center",
            gap: 8,
            marginBottom: 6,
          }}
        >
          <span
            style={{
              width: 32,
              height: 30,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <DueLiabilitiesButton count={dueLiabilitiesCount} onClick={onOpenDueLiabilities} />
          </span>
          <strong
            style={{
              ...typography.onDarkTitle,
              minWidth: 0,
              textAlign: "right",
              fontSize: 12.5,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {t("expenses.limit")}{" "}
            <span
              style={{
                color: colors.white,
                fontWeight: 900,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {spendingCapValue.toFixed(0)} {currencyLabel}
            </span>
          </strong>
        </div>

        <div
          style={{
            marginBottom: 7,
          }}
        >
          <div
            style={{
              position: "relative",
              display: "flex",
              justifyContent: "center",
              marginBottom: 4,
            }}
          >
            <strong
              style={{
                color: statusColor,
                fontSize: 15,
                fontWeight: 900,
                fontVariantNumeric: "tabular-nums",
                lineHeight: 1,
                textShadow: `0 0 9px ${statusColor}66`,
              }}
            >
              {exceededCap ? "تجاوز السقف" : `${safeProgress.toFixed(0)}%`}
            </strong>
          </div>

          {exceededCap ? (
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 6,
              }}
            >
              <div
                style={{
                  position: "relative",
                  flex: `0 1 ${capWidthPercent}%`,
                  minWidth: 0,
                  height: 28,
                  borderRadius: 999,
                  background: `linear-gradient(90deg, ${colors.green}, ${visualIdentity.semantic.success})`,
                  border: "1px solid rgba(255,255,255,0.58)",
                  boxShadow: `inset 0 1px 3px rgba(0,0,0,0.18), 0 0 12px ${visualIdentity.semantic.success}44`,
                  overflow: "hidden",
                  transition: "flex-basis 420ms ease, background 240ms ease",
                }}
              >
                <span
                  style={{
                    ...progressValueStyle,
                    insetInlineStart: 9,
                    maxWidth: "calc(100% - 18px)",
                    color: colors.white,
                    background: "rgba(5,24,48,0.38)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    borderRadius: 999,
                    padding: "3px 7px",
                    textShadow: "0 1px 4px rgba(0,0,0,0.46)",
                  }}
                >
                  من السقف {capSpentLabel}
                </span>
              </div>
              <div
                style={{
                  position: "relative",
                  flex: `0 1 ${overWidthPercent}%`,
                  minWidth: 58,
                  transition: "flex-basis 420ms ease",
                }}
              >
                <strong
                  style={{
                    display: "block",
                    marginBottom: 3,
                    color: colors.red,
                    fontSize: 9,
                    fontWeight: 900,
                    lineHeight: 1,
                    textAlign: "center",
                    textShadow: `0 0 8px ${colors.red}66`,
                  }}
                >
                  تجاوز
                </strong>
                <div
                  style={{
                    position: "relative",
                    height: 28,
                    borderRadius: 999,
                    background: `linear-gradient(90deg, #FF7070, #E53935)`,
                    border: "1px solid rgba(255,255,255,0.50)",
                    boxShadow: `inset 0 1px 3px rgba(0,0,0,0.16), 0 0 16px ${colors.red}55`,
                    overflow: "visible",
                  }}
                >
                  <span
                    style={{
                      ...progressValueStyle,
                      insetInlineStart: 7,
                      maxWidth: "calc(100% - 28px)",
                      color: colors.white,
                      background: "rgba(5,24,48,0.38)",
                      border: "1px solid rgba(255,255,255,0.18)",
                      borderRadius: 999,
                      padding: "3px 7px",
                      textShadow: "0 1px 4px rgba(0,0,0,0.46)",
                    }}
                  >
                    {overBudgetLabel}
                  </span>
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      insetInlineEnd: 3,
                      top: "50%",
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(255,223,223,0.92))",
                      border: "1px solid rgba(255,255,255,0.74)",
                      boxShadow: `0 4px 10px rgba(4,24,48,0.22), 0 0 12px ${colors.red}66`,
                      color: colors.red,
                      fontSize: 12,
                      transform: "translateY(-50%)",
                      animation: "warningPulse 1.8s ease-in-out infinite",
                    }}
                  >
                    ⚠️
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <div
                style={{
                  position: "relative",
                  flex: 1,
                  minWidth: 0,
                  height: 28,
                  borderRadius: 999,
                  background: "rgba(245,250,255,0.90)",
                  border: "1px solid rgba(255,255,255,0.66)",
                  boxShadow: "inset 0 1px 4px rgba(0,0,0,0.22), 0 0 12px rgba(85,217,255,0.10)",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    insetBlock: 3,
                    insetInlineStart: 3,
                    width: `calc(${safeProgress}% - 4px)`,
                    minWidth: safeProgress > 0 ? 16 : 0,
                    maxWidth: "calc(100% - 6px)",
                    borderRadius: 999,
                    background: `linear-gradient(90deg, ${statusColor}, ${statusColorSoft})`,
                    boxShadow: `0 0 10px ${statusColor}66`,
                    overflow: "hidden",
                    transition: "width 420ms ease, background 240ms ease",
                  }}
                >
                  {spentFitsInside && (
                    <span
                      style={{
                        ...progressValueStyle,
                        insetInlineStart: 8,
                        color: colors.white,
                        background: "rgba(5,24,48,0.40)",
                        border: "1px solid rgba(255,255,255,0.18)",
                        borderRadius: 999,
                        padding: "3px 7px",
                        textShadow: "0 1px 4px rgba(0,0,0,0.46)",
                      }}
                    >
                      {spentLabel}
                    </span>
                  )}
                </div>

                {remainingFitsInside && (
                  <span
                    style={{
                      ...progressValueStyle,
                      insetInlineEnd: 8,
                      color: "#07345f",
                      background: "rgba(255,255,255,0.78)",
                      border: "1px solid rgba(8,52,95,0.16)",
                      borderRadius: 999,
                      padding: "3px 7px",
                      textShadow: "0 1px 0 rgba(255,255,255,0.70)",
                    }}
                  >
                    {remainingLabel}
                  </span>
                )}

                {!spentFitsInside && (
                  <span
                    style={{
                      ...progressOutsideValueStyle,
                      insetInlineStart: 4,
                      transform: "translateY(calc(-100% - 4px))",
                      color: statusColor,
                    }}
                  >
                    {spentLabel}
                  </span>
                )}

                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    insetInlineStart: `calc(${safeProgress}% - 12px)`,
                    top: -8,
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(145deg, rgba(255,255,255,0.96), rgba(214,238,255,0.84))",
                    border: "1px solid rgba(255,255,255,0.72)",
                    boxShadow: `0 6px 13px rgba(4,24,48,0.22), 0 0 14px ${statusColor}50`,
                    color: statusColor,
                    fontSize: 13,
                    transform: "translateX(50%)",
                    animation: "cashFloat 2.2s ease-in-out infinite",
                    transition: "inset-inline-start 420ms ease, color 240ms ease",
                  }}
                >
                  💸
                </span>
              </div>
              {remainingShowsAtEnd && (
                <span style={progressEndLabelStyle}>{remainingLabel}</span>
              )}
            </div>
          )}
        </div>

        <LatestExpenseRow
          expense={latestExpense}
          onSelect={onSelectExpense}
          onShowAll={onShowAllExpenses}
          incomeAmount={incomeAmount}
        />
      </div>

      <style>
        {`
          @keyframes cashFloat {
            0%, 100% { transform: translateX(50%) translateY(0) rotate(-7deg); }
            50% { transform: translateX(50%) translateY(-4px) rotate(8deg); }
          }

          @keyframes warningPulse {
            0%, 100% { transform: translateY(-50%) scale(1); }
            50% { transform: translateY(-50%) scale(1.08); }
          }

          @media (prefers-reduced-motion: reduce) {
            * {
              animation-duration: 0.001ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.001ms !important;
            }
          }
        `}
      </style>
    </section>
  );
}

const progressEndLabelStyle = {
  color: colors.gold,
  fontSize: 11,
  fontWeight: 900,
  fontVariantNumeric: "tabular-nums",
  whiteSpace: "nowrap",
  textShadow: `0 0 8px ${colors.gold}66`,
};

const progressValueStyle = {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  zIndex: 2,
  maxWidth: "54%",
  overflow: "hidden",
  fontSize: 11,
  fontWeight: 900,
  fontVariantNumeric: "tabular-nums",
  lineHeight: 1,
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const progressOutsideValueStyle = {
  position: "absolute",
  top: -2,
  zIndex: 3,
  maxWidth: "44%",
  overflow: "hidden",
  fontSize: 10,
  fontWeight: 900,
  fontVariantNumeric: "tabular-nums",
  lineHeight: 1,
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  textShadow: "0 1px 3px rgba(0,0,0,0.28)",
};
