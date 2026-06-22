import { useEffect, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
} from "recharts";
import {
  X,
} from "lucide-react";
import visualIdentity from "../../theme/visualIdentity";
import { useLocale } from "../../i18n/locale";
import goldBarsIcon from "../../assets/icons/gold-bars.svg";
import cashWalletIcon from "../../assets/icons/cash-wallet.svg";
import bankBuildingIcon from "../../assets/icons/bank-building.svg";
import stocksUpIcon from "../../assets/icons/stocks-up.svg";
import silverBarsIcon from "../../assets/icons/silver-bars.svg";
import propertyHouseIcon from "../../assets/icons/property-house.svg";
import goodsBoxIcon from "../../assets/icons/goods-box.svg";

const ASSET_ICON_FILES = {
  cash: cashWalletIcon,
  bank: bankBuildingIcon,
  gold: goldBarsIcon,
  stock: stocksUpIcon,
  silver: silverBarsIcon,
  fixed: propertyHouseIcon,
  goods: goodsBoxIcon,
};

const SUMMARY_LABEL_KEYS = {
  cash: "expenses.cash",
  banks: "assets.bankAccounts",
  gold: "assets.gold",
  stocks: "assets.stocks",
  other: "assets.other",
};

const money = (value) =>
  Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const iconBox = (color) => ({
  width: 42,
  height: 42,
  flex: "0 0 42px",
  borderRadius: 13,
  display: "grid",
  placeItems: "center",
  fontSize: 20,
  background: `${color}1f`,
  border: `1px solid ${color}66`,
  boxShadow: `inset 0 0 16px ${color}18, 0 5px 15px rgba(2,20,44,0.2)`,
});

function AssetIcon({ name, size = 22 }) {
  const iconFile = ASSET_ICON_FILES[name] || cashWalletIcon;
  return (
    <img
      src={iconFile}
      alt=""
      aria-hidden="true"
      style={{ width: size + 7, height: size + 7, objectFit: "contain" }}
    />
  );
}

export default function AssetsDashboard({
  totalAssets,
  summaryItems,
  assetRows,
  distribution,
  trendPoints,
  onAddIncome,
  onTransfer,
  readOnly,
  currencyLabel = "JOD",
}) {
  const { direction, t } = useLocale();
  const [selectedAssetKey, setSelectedAssetKey] = useState("");
  const [animatedNetWorth, setAnimatedNetWorth] = useState(0);
  const detailRef = useRef(null);
  const selectedAsset = assetRows.find((row) => row.id === selectedAssetKey);

  useEffect(() => {
    if (selectedAssetKey) {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedAssetKey]);

  useEffect(() => {
    const target = Number(totalAssets || 0);
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let frameId;
    if (reduceMotion) {
      frameId = window.requestAnimationFrame(() => setAnimatedNetWorth(target));
      return () => window.cancelAnimationFrame(frameId);
    }

    const duration = 950;
    let startedAt;
    const animate = (timestamp) => {
      if (startedAt == null) startedAt = timestamp;
      const progress = Math.min(1, (timestamp - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedNetWorth(target * eased);
      if (progress < 1) frameId = window.requestAnimationFrame(animate);
    };

    frameId = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frameId);
  }, [totalAssets]);

  const card = {
    background:
      "linear-gradient(145deg, rgba(55,126,188,0.94), rgba(23,72,132,0.96))",
    border: "1px solid rgba(145,215,255,0.42)",
    boxShadow:
      "inset 0 1px 0 rgba(255,255,255,0.12), 0 12px 28px rgba(1,22,50,0.24)",
    borderRadius: 18,
  };

  return (
    <div
      className="assets-dashboard-live"
      style={{
        color: visualIdentity.colors.white,
        direction,
        "--card-sheen-color": visualIdentity.lighting.cardSheen,
        "--card-hover-border": visualIdentity.lighting.hoverBorder,
        "--card-hover-glow": visualIdentity.lighting.hoverGlow,
        "--card-sheen-duration": visualIdentity.motion.cardSheenDuration,
        "--icon-glow-duration": visualIdentity.motion.iconGlowDuration,
        "--effect-hover-duration": visualIdentity.motion.hoverDuration,
        "--effect-stagger-step": visualIdentity.motion.staggerStep,
        "--icon-brightness-from": visualIdentity.lighting.iconBrightnessFrom,
        "--icon-brightness-to": visualIdentity.lighting.iconBrightnessTo,
        "--icon-saturation-to": visualIdentity.lighting.iconSaturationTo,
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900 }}>{t("nav.assets")}</h1>
          <div style={{ marginTop: 3, color: visualIdentity.colors.textSecondary, fontSize: 11 }}>
            جميع أصولك واستثماراتك في مكان واحد
          </div>
        </div>

        {!readOnly && (
          <div style={{ display: "flex", gap: 7 }}>
            <button
              type="button"
              onClick={onAddIncome}
              style={{
                minHeight: 36,
                padding: "0 11px",
                borderRadius: 11,
                border: `1px solid ${visualIdentity.colors.green}88`,
                background: "linear-gradient(135deg, rgba(76,229,140,0.24), rgba(22,112,86,0.18))",
                color: "#9CFFC3",
                fontFamily: "inherit",
                fontSize: 10,
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              + {t("assets.extraIncome")}
            </button>
            <button
              type="button"
              onClick={onTransfer}
              style={{
                minHeight: 36,
                padding: "0 11px",
                borderRadius: 11,
                border: `1px solid ${visualIdentity.colors.gold}88`,
                background: "rgba(255,198,45,0.10)",
                color: visualIdentity.colors.gold,
                fontFamily: "inherit",
                fontSize: 10,
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              ⇄ {t("assets.transfer")}
            </button>
          </div>
        )}
      </header>

      <section
        className="asset-dashboard-card asset-hero-card"
        style={{
          ...card,
          background: "linear-gradient(135deg, rgba(48,124,194,0.98), rgba(17,75,139,0.97) 58%, rgba(7,45,96,0.98))",
          border: "1px solid rgba(100,220,255,0.48)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.16), 0 14px 32px rgba(0,25,58,0.30)",
          minHeight: 170,
          padding: 16,
          marginBottom: 12,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "70px minmax(0,1fr) 92px",
            alignItems: "center",
            gap: 10,
            minHeight: 136,
          }}
        >
          <div className="asset-icon-shell" style={{ ...iconBox(visualIdentity.colors.gold), width: 70, height: 70, fontSize: 31 }}>
            <AssetIcon name="cash" color={visualIdentity.colors.gold} size={32} />
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: visualIdentity.colors.textSecondary, fontSize: 14, fontWeight: 800 }}>
              {t("assets.totalWealth")}
            </div>
            <div style={{ marginTop: 5, fontSize: 30, fontWeight: 900, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
              {money(animatedNetWorth)} <span style={{ fontSize: 14 }}>{currencyLabel}</span>
            </div>
            <div style={{ marginTop: 3, color: visualIdentity.colors.textSecondary, fontSize: 11 }}>
              إجمالي قيمة أصولك اليوم
            </div>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: visualIdentity.colors.textSecondary, fontSize: 9 }}>مؤشر الأصول</div>
            <div style={{ color: visualIdentity.colors.green, fontWeight: 900, fontSize: 15 }}>
              {totalAssets > 0 ? "▲ نشط" : "—"}
            </div>
            <div style={{ width: "100%", height: 62, marginTop: 4 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendPoints} margin={{ top: 4, right: 2, left: 2, bottom: 2 }}>
                  <defs>
                    <linearGradient id="assetTrendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#42E6C1" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#42E6C1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#5BEED4"
                    strokeWidth={2}
                    fill="url(#assetTrendFill)"
                    dot={false}
                    isAnimationActive
                    animationBegin={100}
                    animationDuration={1050}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      <div
        className="asset-summary-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gap: 8,
          marginBottom: 12,
        }}
      >
        {summaryItems.map((item) => (
          <div
            key={item.key}
            className="asset-dashboard-card asset-summary-tile"
            style={{
              ...card,
              padding: "10px 6px",
              minWidth: 0,
              minHeight: 132,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              background: `linear-gradient(145deg, ${item.color}32 0%, rgba(49,108,171,0.94) 46%, rgba(23,70,128,0.96) 100%)`,
              border: `1px solid ${item.color}66`,
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.14), 0 10px 24px ${item.color}18`,
            }}
          >
            <div style={{ minHeight: 68, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", gap: 5 }}>
              <div className="asset-icon-shell" style={{ ...iconBox(item.color), width: 34, height: 34, flexBasis: 34, fontSize: 16 }}>
                <AssetIcon name={item.icon} color={item.color} size={18} />
              </div>
              <span style={{ minHeight: 27, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ["banks", "other"].includes(item.key) ? 9 : 10.5, fontWeight: 900, lineHeight: 1.25, whiteSpace: "normal", overflowWrap: "anywhere" }}>
                {t(SUMMARY_LABEL_KEYS[item.key], item.label)}
              </span>
            </div>
            <div style={{ marginTop: "auto", width: "100%", fontSize: 12, fontWeight: 900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {money(item.value)}
            </div>
            <div style={{ marginTop: 3, color: item.change >= 0 ? visualIdentity.colors.green : visualIdentity.colors.red, fontSize: 10, fontWeight: 900 }}>
              {item.change >= 0 ? "▲" : "▼"} {Math.abs(item.change).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>

      {selectedAsset && (
        <section
          ref={detailRef}
          className="asset-dashboard-card asset-detail-panel"
          style={{
            ...card,
            padding: 14,
            marginBottom: 12,
            scrollMarginTop: 78,
            border: `1px solid ${selectedAsset.color}88`,
            background: `linear-gradient(145deg, ${selectedAsset.color}25, rgba(24,73,133,0.97) 48%)`,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "46px minmax(0,1fr) auto 34px",
              alignItems: "center",
              gap: 10,
              paddingBottom: 12,
              borderBottom: "1px solid rgba(255,255,255,0.13)",
            }}
          >
            <div className="asset-icon-shell" style={iconBox(selectedAsset.color)}>
              <AssetIcon name={selectedAsset.icon} color={selectedAsset.color} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 900 }}>{selectedAsset.name}</div>
              <div style={{ marginTop: 3, color: visualIdentity.colors.textSecondary, fontSize: 10 }}>
                {selectedAsset.meta}
              </div>
            </div>
            <div style={{ textAlign: "left" }}>
              <b style={{ fontSize: 18 }}>{money(selectedAsset.value)} {currencyLabel}</b>
              <div style={{ marginTop: 2, color: selectedAsset.change >= 0 ? visualIdentity.colors.green : visualIdentity.colors.red, fontSize: 11, fontWeight: 900 }}>
                {selectedAsset.change >= 0 ? "+" : ""}{selectedAsset.change.toFixed(1)}%
              </div>
            </div>
            <button
              type="button"
              aria-label={t("actions.close")}
              title={t("actions.close")}
              onClick={() => setSelectedAssetKey("")}
              style={{ width: 32, height: 32, borderRadius: 10, border: "1px solid rgba(255,255,255,0.16)", background: "rgba(255,255,255,0.08)", color: visualIdentity.colors.white, display: "grid", placeItems: "center", cursor: "pointer" }}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ marginTop: 11, fontSize: 13, fontWeight: 900 }}>{t("assets.activity")}</div>
          {selectedAsset.movements?.length ? (
            <div style={{ marginTop: 5 }}>
              {selectedAsset.movements.map((movement, index) => (
                <div
                  key={movement.id}
                  style={{
                    minHeight: 52,
                    display: "grid",
                    gridTemplateColumns: "minmax(0,1fr) auto",
                    gap: 10,
                    alignItems: "center",
                    borderBottom: index < selectedAsset.movements.length - 1 ? "1px solid rgba(255,255,255,0.10)" : "none",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800 }}>{movement.label}</div>
                    <div style={{ marginTop: 2, color: visualIdentity.colors.textFaint, fontSize: 9 }}>{movement.date}</div>
                  </div>
                  <b style={{ color: movement.direction === "out" ? visualIdentity.colors.red : visualIdentity.colors.green, fontSize: 12 }}>
                    {movement.direction === "out" ? "−" : "+"}{money(movement.amount)} {currencyLabel}
                  </b>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: "18px 0 6px", textAlign: "center", color: visualIdentity.colors.textSecondary, fontSize: 11 }}>
              {t("actions.noRecords")}
            </div>
          )}
        </section>
      )}

      <section className="asset-dashboard-card asset-list-card" style={{ ...card, padding: "5px 14px", marginBottom: 12 }}>
        {assetRows.map((row, index) => (
          <div
            key={row.id}
            style={{
              minHeight: 72,
              display: "grid",
              gridTemplateColumns: "48px minmax(0,1fr) auto 72px 16px",
              gap: 8,
              alignItems: "center",
              borderBottom: index < assetRows.length - 1 ? "1px solid rgba(255,255,255,0.12)" : "none",
            }}
          >
            <div className="asset-icon-shell" style={iconBox(row.color)}>
              <AssetIcon name={row.icon} color={row.color} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 900, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {row.name}
              </div>
              <div style={{ marginTop: 3, color: visualIdentity.colors.textSecondary, fontSize: 9 }}>
                {row.meta || "آخر تحديث: اليوم"}
              </div>
            </div>
            <strong style={{ fontSize: 14, whiteSpace: "nowrap" }}>{money(row.value)} {currencyLabel}</strong>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: row.change >= 0 ? visualIdentity.colors.green : visualIdentity.colors.red, fontSize: 11, fontWeight: 900 }}>
                {row.change >= 0 ? "+" : ""}{row.change.toFixed(1)}%
              </div>
              <div style={{ color: visualIdentity.colors.textFaint, fontSize: 8 }}>من التكلفة</div>
            </div>
            <button
              type="button"
              aria-label={`عرض تفاصيل ${row.name}`}
              title="عرض التفاصيل"
              onClick={() => setSelectedAssetKey(row.id)}
              style={{ width: 28, height: 34, border: 0, background: "transparent", color: visualIdentity.colors.white, fontSize: 23, cursor: "pointer", padding: 0 }}
            >
              ‹
            </button>
          </div>
        ))}
      </section>

      <section className="asset-dashboard-card asset-distribution-card" style={{ ...card, padding: 14, marginBottom: 8 }}>
        <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 8 }}>{t("assets.allocation")} ⓘ</div>
        <div style={{ display: "grid", gridTemplateColumns: "150px minmax(0,1fr)", alignItems: "center", gap: 8 }}>
          <div style={{ width: 150, height: 150, position: "relative" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={distribution} dataKey="value" innerRadius={43} outerRadius={66} paddingAngle={1} stroke="none" isAnimationActive={false}>
                  {distribution.map((item) => <Cell key={item.key} fill={item.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: "absolute", inset: 0, display: "grid", placeContent: "center", textAlign: "center", pointerEvents: "none" }}>
              <b style={{ fontSize: 18 }}>{money(totalAssets)}</b>
              <span style={{ color: visualIdentity.colors.textSecondary, fontSize: 9 }}>{currencyLabel}</span>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 12px" }}>
            {distribution.map((item) => (
              <div key={item.key} style={{ display: "flex", justifyContent: "space-between", gap: 6, fontSize: 10 }}>
                <span><i style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: item.color, marginLeft: 5 }} />{t({ cash: "expenses.cash", banks: "assets.bankAccounts", gold: "assets.gold", stocks: "assets.stocks", other: "assets.other" }[item.key], item.label)}</span>
                <b>{item.percent.toFixed(1)}%</b>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
