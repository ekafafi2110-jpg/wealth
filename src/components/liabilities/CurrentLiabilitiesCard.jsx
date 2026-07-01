import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Gauge,
  Gem,
  ReceiptText,
} from "lucide-react";
import { useLocale } from "../../i18n/locale";
import visualIdentity from "../../theme/visualIdentity";

function CurrentLiabilityItem({
  row,
  assetKey,
  assetSources,
  onAssetKeyChange,
  onToggle,
  onPayReserved,
  onPayFromCap,
  onToggleAssets,
  onTogglePostpone,
  onPayFromAsset,
  onPostponePart,
  onConfirmPostpone,
  inputStyle,
  iconButtonStyle,
  confirmAssetButtonStyle,
}) {
  const { currencyLabel } = useLocale();
  const { item } = row;
  const currentYear = new Date().getFullYear();
  const accent = row.uncovered > 0
    ? visualIdentity.semantic.danger
    : row.isCard
    ? visualIdentity.colors.cyan
    : visualIdentity.semantic.warning;
  const cardLimit = Number(row.creditLimit || 0);
  const cardUsed = Number(row.amount || 0);
  const cardCovered = Math.min(cardUsed, Math.max(0, Number(row.covered || 0)));
  const cardUncovered = Math.min(
    Math.max(0, cardUsed - cardCovered),
    Math.max(0, Number(row.uncovered || 0))
  );
  const cardCoveredPct = cardLimit > 0 ? Math.min(100, (cardCovered / cardLimit) * 100) : 0;
  const cardUncoveredPct = cardLimit > 0 ? Math.min(100 - cardCoveredPct, (cardUncovered / cardLimit) * 100) : 0;

  return (
    <div
      style={{
        background: visualIdentity.gradients.innerCard,
        border: row.isOpen
          ? `1px solid ${accent}88`
          : visualIdentity.cards.inner.border,
        borderRadius: 15,
        padding: 12,
        marginBottom: 8,
        boxShadow: row.isOpen
          ? `${visualIdentity.cards.inner.boxShadow}, 0 0 20px ${accent}18`
          : visualIdentity.cards.inner.boxShadow,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <div
          style={{
            textAlign: "right",
            display: "flex",
            gap: 10,
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              background: `${accent}18`,
              color: accent,
              border: `1px solid ${accent}55`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            {row.isCard ? <CreditCard size={19} /> : item.type === "over_budget" ? <AlertTriangle size={19} /> : <ReceiptText size={19} />}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 900, color: visualIdentity.colors.white }}>
              {row.name}
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: visualIdentity.colors.textSecondary, marginTop: 3 }}>
              {row.subtitle}
            </div>
            {row.isOpen && (
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: visualIdentity.semantic.warning,
                  marginTop: 3,
                }}
              >
                {row.typeLabel} · الاستحقاق: {row.dueText}
              </div>
            )}
          </div>
        </div>

        <div style={{ textAlign: "left" }}>
          <div style={{ fontSize: 17, fontWeight: 900, color: accent }}>
            {row.amount.toFixed(2)}
            <button
              type="button"
              onClick={() => onToggle(item.id)}
              style={{
                marginRight: 8,
                width: 30,
                height: 30,
                borderRadius: 10,
                border: `1px solid ${accent}55`,
                background: `${accent}12`,
                color: accent,
                cursor: "pointer",
                fontWeight: 900,
              }}
            >
              ⋯
            </button>
          </div>
          <div style={{ fontSize: 10, color: visualIdentity.colors.textSecondary }}>{currencyLabel}</div>
        </div>
      </div>

      {row.isOpen && (
        <>
          {row.isCard ? (
            <div
              style={{
                marginTop: 10,
              }}
            >
              <div
                style={{
                  height: 9,
                  display: "flex",
                  overflow: "hidden",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.16)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.20)",
                }}
                title={`سقف البطاقة ${cardLimit.toFixed(2)} ${currencyLabel}`}
              >
                {cardCoveredPct > 0 && (
                  <span
                    style={{
                      width: `${cardCoveredPct}%`,
                      background: `linear-gradient(90deg, ${visualIdentity.semantic.success}, ${visualIdentity.colors.green})`,
                      boxShadow: `0 0 9px ${visualIdentity.semantic.success}66`,
                    }}
                  />
                )}
                {cardUncoveredPct > 0 && (
                  <span
                    style={{
                      width: `${cardUncoveredPct}%`,
                      background: `linear-gradient(90deg, ${visualIdentity.colors.red}, ${visualIdentity.semantic.danger})`,
                      boxShadow: `0 0 9px ${visualIdentity.semantic.danger}66`,
                    }}
                  />
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 5,
                  color: visualIdentity.colors.textSecondary,
                  fontSize: 8.5,
                  fontWeight: 800,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                <span>مغطى {cardCovered.toFixed(2)}</span>
                <span>سقف {cardLimit.toFixed(2)}</span>
                <span style={{ color: visualIdentity.colors.red }}>غير مغطى {cardUncovered.toFixed(2)}</span>
              </div>
            </div>
          ) : (
            <div
              style={{
                height: 7,
                background: "rgba(255,255,255,0.10)",
                borderRadius: 999,
                overflow: "hidden",
                marginTop: 10,
              }}
            >
              <div
                style={{
                  width: `${row.coveragePct}%`,
                  height: "100%",
                  background: `linear-gradient(90deg,${visualIdentity.semantic.success},${visualIdentity.semantic.warning})`,
                  boxShadow: `0 0 9px ${visualIdentity.semantic.success}66`,
                }}
              />
            </div>
          )}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
              marginTop: 10,
            }}
          >
            <div style={{ padding: 7, borderRadius: 10, background: `${visualIdentity.semantic.success}12`, fontSize: 10, color: visualIdentity.semantic.success }}>
              مغطى ومحجوز: <b>{row.covered.toFixed(2)}</b>
            </div>
            <div style={{ padding: 7, borderRadius: 10, background: `${visualIdentity.semantic.danger}12`, fontSize: 10, color: visualIdentity.semantic.danger }}>
              غير مغطى: <b>{row.uncovered.toFixed(2)}</b>
            </div>
          </div>

          <div style={{ marginTop: 10 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                gap: 8,
                marginBottom: 8,
                direction: "ltr",
              }}
            >
              {row.covered > 0 && (
                <button
                  type="button"
                  title="سداد من المحجوز"
                  onClick={() => onPayReserved(item)}
                  style={iconButtonStyle(false, visualIdentity.semantic.success)}
                >
                  <CheckCircle2 size={17} />
                </button>
              )}
              {row.canPayFromCap && (
                <button
                  type="button"
                  title="سداد من سقف الصرف"
                  onClick={() => onPayFromCap(item)}
                  style={iconButtonStyle(false, visualIdentity.semantic.info)}
                >
                  <Gauge size={17} />
                </button>
              )}
              <button
                type="button"
                title="سداد من أصل"
                onClick={() => onToggleAssets(item)}
                style={iconButtonStyle(
                  item.paymentMethod === "assets",
                  visualIdentity.semantic.warning
                )}
              >
                <Gem size={17} />
              </button>
              <button
                type="button"
                title="تأجيل الاستحقاق"
                onClick={() => onTogglePostpone(item)}
                style={iconButtonStyle(
                  item.paymentMethod === "postpone",
                  visualIdentity.semantic.warning
                )}
              >
                <CalendarClock size={17} />
              </button>
            </div>

            {item.paymentMethod === "assets" && (
              <>
                <select
                  value={assetKey}
                  onChange={(event) => onAssetKeyChange(event.target.value)}
                  style={{ ...inputStyle, marginBottom: 8 }}
                >
                  {assetSources.map((asset) => (
                    <option key={asset.key} value={asset.key}>
                      {asset.label} - متاح {Number(asset.available || 0).toFixed(2)} {currencyLabel}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => onPayFromAsset(item)}
                  style={confirmAssetButtonStyle}
                >
                  تأكيد السداد من الأصل
                </button>
              </>
            )}

            {item.paymentMethod === "postpone" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "0.8fr 0.8fr 1fr 42px",
                  gap: 6,
                  alignItems: "center",
                  direction: "rtl",
                }}
              >
                <select
                  value={row.postponeParts.day}
                  onChange={(event) =>
                    onPostponePart(item.id, "day", event.target.value)
                  }
                  style={{ ...inputStyle, marginBottom: 0, padding: "9px 8px", fontSize: 12 }}
                >
                  {Array.from({ length: 31 }, (_, index) =>
                    String(index + 1).padStart(2, "0")
                  ).map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
                <select
                  value={row.postponeParts.month}
                  onChange={(event) =>
                    onPostponePart(item.id, "month", event.target.value)
                  }
                  style={{ ...inputStyle, marginBottom: 0, padding: "9px 8px", fontSize: 12 }}
                >
                  {Array.from({ length: 12 }, (_, index) =>
                    String(index + 1).padStart(2, "0")
                  ).map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
                <select
                  value={row.postponeParts.year}
                  onChange={(event) =>
                    onPostponePart(item.id, "year", event.target.value)
                  }
                  style={{ ...inputStyle, marginBottom: 0, padding: "9px 8px", fontSize: 12 }}
                >
                  {Array.from({ length: 4 }, (_, index) => String(currentYear + index)).map(
                    (year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    )
                  )}
                </select>
                <button
                  type="button"
                  title="تأكيد التاريخ"
                  onClick={() => onConfirmPostpone(item.id)}
                  style={iconButtonStyle(false, visualIdentity.semantic.success)}
                >
                  <CheckCircle2 size={17} />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function CurrentLiabilitiesCard({
  title,
  subtitle,
  icon = "card",
  accentColor,
  showSummary = true,
  total,
  coveredTotal,
  uncoveredTotal,
  rows,
  open,
  assetKey,
  assetSources,
  onToggleDetails,
  onAssetKeyChange,
  onToggleItem,
  onPayReserved,
  onPayFromCap,
  onToggleAssets,
  onTogglePostpone,
  onPayFromAsset,
  onPostponePart,
  onConfirmPostpone,
  inputStyle,
  iconButtonStyle,
  confirmAssetButtonStyle,
}) {
  const { currencyLabel, t } = useLocale();
  const danger = visualIdentity.semantic.danger;
  const accent = accentColor || danger;
  const HeaderIcon = icon === "liability" ? ReceiptText : CreditCard;
  return (
    <section className="asset-dashboard-card" style={{ position: "relative", padding: 14, marginBottom: 13, borderRadius: visualIdentity.cards.outer.borderRadius, border: `1px solid ${accent}66`, background: visualIdentity.gradients.outerCard, boxShadow: `${visualIdentity.cards.outer.boxShadow}, 0 0 22px ${accent}10`, color: visualIdentity.colors.white }}>
      <span aria-hidden="true" style={{ position: "absolute", insetInlineStart: 0, top: 18, bottom: 18, width: 3, borderRadius: 99, background: accent, boxShadow: `0 0 12px ${accent}88` }} />
      <div
        onClick={onToggleDetails}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") onToggleDetails();
        }}
        style={{
          display: "grid",
          gridTemplateColumns: "44px minmax(0,1fr) auto",
          alignItems: "center",
          gap: 10,
          marginBottom: 12,
          cursor: "pointer",
        }}
      >
        <span className="asset-icon-shell" style={{ width: 42, height: 42, borderRadius: 13, display: "grid", placeItems: "center", color: accent, border: `1px solid ${accent}66`, background: `${accent}18` }}><HeaderIcon size={21} /></span>
        <div style={{ minWidth: 0, textAlign: "right" }}>
          <div style={{ fontSize: 15, fontWeight: 900 }}>{title || t("liabilities.cards")}</div>
          {subtitle && (
            <div style={{ fontSize: 9, color: visualIdentity.colors.textSecondary, marginTop: 3 }}>
              {subtitle}
            </div>
          )}
          <div style={{ display: subtitle ? "none" : "block", fontSize: 9, color: visualIdentity.colors.textSecondary, marginTop: 3 }}>
            ديون قصيرة الأجل وبطاقات مستحقة
          </div>
        </div>
        <div style={{ textAlign: "left" }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: accent }}>
            {total.toFixed(2)}
            <span style={{ fontSize: 8, color: visualIdentity.colors.textSecondary }}> {currencyLabel}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4, color: visualIdentity.colors.textSecondary }}>
            {open ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
          </div>
        </div>
      </div>

      {showSummary && (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <div style={{ padding: 10, borderRadius: 13, border: `1px solid ${visualIdentity.semantic.success}55`, background: `${visualIdentity.semantic.success}12`, textAlign: "center" }}>
          <div style={{ fontSize: 9, color: visualIdentity.colors.textSecondary }}>محجوز من السقف</div>
          <div style={{ marginTop: 4, color: visualIdentity.semantic.success, fontSize: 16, fontWeight: 900 }}>{coveredTotal.toFixed(2)}</div>
        </div>
        <div style={{ padding: 10, borderRadius: 13, border: `1px solid ${danger}55`, background: `${danger}12`, textAlign: "center" }}>
          <div style={{ fontSize: 9, color: visualIdentity.colors.textSecondary }}>غير مغطى</div>
          <div style={{ marginTop: 4, color: danger, fontSize: 16, fontWeight: 900 }}>{uncoveredTotal.toFixed(2)}</div>
        </div>
      </div>
      )}

      {open &&
        rows.map((row) => (
          <CurrentLiabilityItem
            key={row.item.id}
            row={row}
            assetKey={assetKey}
            assetSources={assetSources}
            onAssetKeyChange={onAssetKeyChange}
            onToggle={onToggleItem}
            onPayReserved={onPayReserved}
            onPayFromCap={onPayFromCap}
            onToggleAssets={onToggleAssets}
            onTogglePostpone={onTogglePostpone}
            onPayFromAsset={onPayFromAsset}
            onPostponePart={onPostponePart}
            onConfirmPostpone={onConfirmPostpone}
            inputStyle={inputStyle}
            iconButtonStyle={iconButtonStyle}
            confirmAssetButtonStyle={confirmAssetButtonStyle}
          />
        ))}

      {!rows.length && (
        <div
          style={{
            textAlign: "center",
            color: visualIdentity.colors.textSecondary,
            padding: "18px 0",
            fontSize: 13,
          }}
        >
          {t("actions.noRecords")}
        </div>
      )}
    </section>
  );
}
