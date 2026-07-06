import DueLiabilitiesButton from "./DueLiabilitiesButton";
import visualIdentity from "../../theme/visualIdentity";
import { useLocale } from "../../i18n/locale";

const { colors, gradients, cards, typography } = visualIdentity;

export default function SpendingCapCard({
  spendingProgress,
  remainingValue,
  spentValue,
  spendingCapValue,
  overBudgetSpent,
  dueLiabilitiesCount,
  onOpenDueLiabilities,
  accountingDateDisplay,
}) {
  const { currencyLabel, t } = useLocale();
  const safeProgress = Math.min(100, Math.max(0, Number(spendingProgress || 0)));
  const displayProgress =
    Number(spendingCapValue || 0) > 0
      ? ((Number(spentValue || 0) + Number(overBudgetSpent || 0)) / Number(spendingCapValue || 0)) * 100
      : safeProgress;
  const exceededCap = Number(overBudgetSpent || 0) > 0;
  const overBudgetPercent = exceededCap
    ? Math.min(
        100,
        Number(spendingCapValue || 0) > 0
          ? (Number(overBudgetSpent || 0) / Number(spendingCapValue || 0)) * 100
          : 100
      )
    : 0;
  const progressColor =
    safeProgress >= 85
      ? colors.red
      : safeProgress >= 55
        ? "#FF9F43"
        : colors.green;
  const progressGradient =
    safeProgress >= 85
      ? `linear-gradient(to left, ${colors.green}, #FF9F43 58%, ${colors.red})`
      : safeProgress >= 55
        ? `linear-gradient(to left, ${colors.green}, #FF9F43)`
        : `linear-gradient(to left, ${colors.green}, ${visualIdentity.semantic.success})`;
  const spentLabel = `${Number(spentValue || 0).toFixed(0)} ${currencyLabel}`;
  const remainingLabel = `${Math.max(0, Number(remainingValue || 0)).toFixed(0)} ${currencyLabel}`;
  const overBudgetLabel = `${Number(overBudgetSpent || 0).toFixed(0)} ${currencyLabel}`;
  const outerRingFill =
    safeProgress >= 85
      ? `${colors.green} 0deg, #FF9F43 208deg, ${colors.red} ${safeProgress * 3.6}deg`
      : safeProgress >= 55
        ? `${colors.green} 0deg, #FF9F43 ${safeProgress * 3.6}deg`
        : `${colors.green} 0deg, ${visualIdentity.semantic.success} ${safeProgress * 3.6}deg`;
  const outerRingBackground = `conic-gradient(${outerRingFill}, rgba(255,255,255,0.13) ${
    safeProgress * 3.6
  }deg, rgba(255,255,255,0.13) 360deg)`;
  const innerOverRingBackground = `conic-gradient(${colors.red} 0deg, ${colors.red} ${
    overBudgetPercent * 3.6
  }deg, rgba(255,255,255,0.12) ${overBudgetPercent * 3.6}deg, rgba(255,255,255,0.12) 360deg)`;

  return (
    <section aria-label="ملخص سقف الصرف" style={{ marginBottom: 11, direction: "rtl" }}>
      <div
        style={{
          minWidth: 0,
          padding: "13px 13px 14px",
          borderRadius: cards.outer.borderRadius,
          background: gradients.outerCard,
          border: cards.outer.border,
          boxShadow: cards.outer.boxShadow,
          direction: "rtl",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "stretch", gap: 14, direction: "rtl" }}>
          <div
            style={{
              flex: "1 1 auto",
              minWidth: 0,
              display: "grid",
              gridTemplateRows: "auto 1fr auto",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 8 }}>
              <span
                style={{
                  width: 32,
                  height: 30,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: "0 0 auto",
                }}
              >
                <DueLiabilitiesButton count={dueLiabilitiesCount} onClick={onOpenDueLiabilities} />
              </span>
              <strong
                style={{
                  ...typography.onDarkTitle,
                  minWidth: 0,
                  textAlign: "right",
                  fontSize: 16,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {t("expenses.limit")}
              </strong>
              {accountingDateDisplay && (
                <span
                  style={{
                    marginInlineStart: "auto",
                    color: colors.gold,
                    fontSize: 10,
                    fontWeight: 900,
                    fontVariantNumeric: "tabular-nums",
                    whiteSpace: "nowrap",
                  }}
                >
                  {accountingDateDisplay}
                </span>
              )}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1px 1fr",
                alignItems: "center",
                gap: 12,
              }}
            >
              <MetricBlock label="المصروف" value={spentLabel} color={colors.red} />
              <span aria-hidden="true" style={{ height: 38, background: "rgba(255,255,255,0.14)" }} />
              <MetricBlock label="المتبقي" value={remainingLabel} color={colors.green} />
            </div>

            <div>
              <ProgressTrack
                height={9}
                value={safeProgress}
                background="rgba(255,255,255,0.16)"
                fill={progressGradient}
                glow={progressColor}
              />
              {exceededCap && (
                <div style={{ marginTop: 7 }}>
                  <ProgressTrack
                    height={7}
                    value={overBudgetPercent}
                    background="rgba(255,255,255,0.11)"
                    fill={`linear-gradient(to left, #FF9F43, ${colors.red})`}
                    glow={colors.red}
                    anchor="right"
                  />
                  <div
                    style={{
                      marginTop: 4,
                      color: colors.red,
                      fontSize: 9,
                      fontWeight: 900,
                      textAlign: "center",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    تجاوز {overBudgetLabel}
                  </div>
                </div>
              )}
              <div
                style={{
                  marginTop: 7,
                  color: colors.textSecondary,
                  fontSize: 11,
                  fontWeight: 800,
                  textAlign: "center",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                من {Number(spendingCapValue || 0).toFixed(0)} {currencyLabel} هذا الشهر
              </div>
            </div>
          </div>

          <div
            aria-label={`نسبة استخدام سقف الصرف ${displayProgress.toFixed(0)}%`}
            style={{
              flex: "0 0 104px",
              alignSelf: "center",
              display: "grid",
              placeItems: "center",
              minHeight: 112,
              borderInlineStart: "1px solid rgba(255,255,255,0.14)",
              paddingInlineStart: 14,
            }}
          >
            <div
              style={{
                width: 91,
                height: 91,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                background: outerRingBackground,
                boxShadow: `0 0 18px ${progressColor}22`,
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  background: "linear-gradient(145deg, rgba(25,78,122,0.95), rgba(23,66,108,0.98))",
                  border: "1px solid rgba(255,255,255,0.13)",
                  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
                  position: "relative",
                }}
              >
                {exceededCap && (
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      background: innerOverRingBackground,
                      boxShadow: `0 0 13px ${colors.red}33`,
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background:
                          "linear-gradient(145deg, rgba(25,78,122,0.96), rgba(23,66,108,0.98))",
                      }}
                    />
                  </div>
                )}
                <strong
                  style={{
                    color: colors.white,
                    fontSize: 23,
                    fontWeight: 900,
                    fontVariantNumeric: "tabular-nums",
                    lineHeight: 1,
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {displayProgress.toFixed(0)}%
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProgressTrack({ height, value, background, fill, glow, anchor = "left" }) {
  return (
    <div
      style={{
        position: "relative",
        height,
        borderRadius: 999,
        background,
        overflow: "hidden",
        boxShadow: "inset 0 1px 5px rgba(5,24,48,0.28)",
      }}
    >
      <div
        style={{
          position: "absolute",
          insetBlock: 0,
          left: anchor === "left" ? 0 : "auto",
          right: anchor === "right" ? 0 : "auto",
          width: `${Math.min(100, Math.max(0, Number(value || 0)))}%`,
          minWidth: Number(value || 0) > 0 ? 8 : 0,
          borderRadius: 999,
          background: fill,
          boxShadow: `0 0 14px ${glow}66`,
          transition: "width 420ms ease, background 240ms ease",
        }}
      />
    </div>
  );
}

function MetricBlock({ label, value, color }) {
  return (
    <div style={{ minWidth: 0, textAlign: "center" }}>
      <div style={{ color: colors.textSecondary, fontSize: 11, fontWeight: 800 }}>{label}</div>
      <strong
        style={{
          display: "block",
          marginTop: 4,
          color,
          fontSize: 14,
          fontWeight: 900,
          fontVariantNumeric: "tabular-nums",
          whiteSpace: "nowrap",
          textShadow: `0 0 10px ${color}44`,
        }}
      >
        {value}
      </strong>
    </div>
  );
}
