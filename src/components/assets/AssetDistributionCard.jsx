import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import visualIdentity from "../../theme/visualIdentity";
import { useLocale } from "../../i18n/locale";
import goldBarsIcon from "../../assets/icons/gold-bars.svg";
import cashWalletIcon from "../../assets/icons/cash-wallet.svg";
import bankBuildingIcon from "../../assets/icons/bank-building.svg";
import stocksUpIcon from "../../assets/icons/stocks-up.svg";
import goodsBoxIcon from "../../assets/icons/goods-box.svg";

const labelKeys = {
  cash: "expenses.cash",
  banks: "assets.bankAccounts",
  gold: "assets.gold",
  stocks: "assets.stocks",
  other: "assets.other",
};

const icons = {
  cash: cashWalletIcon,
  banks: bankBuildingIcon,
  gold: goldBarsIcon,
  stocks: stocksUpIcon,
  other: goodsBoxIcon,
};

const money = (value) =>
  Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function DistributionDonut({ distribution, totalAssets, currencyLabel, size = 136, fluid = false }) {
  const innerRadius = size >= 150 ? 48 : 43;
  const outerRadius = size >= 150 ? 70 : 63;
  return (
    <div style={{ width: fluid ? "100%" : size, height: fluid ? "100%" : size, position: "relative", filter: "drop-shadow(0 7px 13px rgba(2,32,70,0.30))" }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={distribution}
            dataKey="value"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={0.8}
            cornerRadius={5}
            stroke="none"
            startAngle={90}
            endAngle={-270}
            isAnimationActive={false}
          >
            {distribution.map((item) => <Cell key={item.key} fill={item.color} />)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div style={{ position: "absolute", inset: size >= 150 ? 34 : 28, borderRadius: "50%", display: "grid", placeContent: "center", textAlign: "center", pointerEvents: "none", background: "radial-gradient(circle, rgba(47,109,174,0.88), rgba(24,70,128,0.54) 68%, transparent 70%)" }}>
        <b style={{ color: visualIdentity.colors.white, fontSize: size >= 150 ? 16 : 15, lineHeight: 1.1, fontVariantNumeric: "tabular-nums" }}>
          {money(totalAssets)}
        </b>
        <span style={{ color: visualIdentity.colors.textSecondary, fontSize: 8 }}>{currencyLabel}</span>
      </div>
    </div>
  );
}

export default function AssetDistributionCard({
  distribution,
  totalAssets,
  currencyLabel,
  summaryItems = [],
  variant = "compact",
}) {
  const { t } = useLocale();
  const detailed = variant === "detailed";
  const cardStyle = {
    padding: detailed ? 15 : "17px 16px 16px",
    marginBottom: detailed ? 14 : 8,
    borderRadius: 18,
    background: "linear-gradient(145deg, rgba(58,118,180,0.96), rgba(31,79,139,0.98))",
    border: "1px solid rgba(145,215,255,0.34)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.13), 0 12px 28px rgba(1,22,50,0.24)",
  };

  if (detailed) {
    return (
      <section className="asset-dashboard-card asset-distribution-card" style={cardStyle}>
        <div style={{ color: visualIdentity.colors.gold, fontSize: 16, fontWeight: 900, marginBottom: 10, textAlign: "right" }}>
          {t("assets.allocation")}
        </div>
        {summaryItems.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 14,
              paddingBottom: 3,
              overflowX: "auto",
              direction: "rtl",
              scrollSnapType: "x proximity",
              scrollbarWidth: "thin",
              scrollbarColor: `${visualIdentity.colors.cyan}55 transparent`,
            }}
          >
            {summaryItems.map((item) => (
              <div
                key={item.key}
                style={{
                  flex: "0 0 106px",
                  minHeight: 112,
                  padding: "9px 7px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  scrollSnapAlign: "center",
                  borderRadius: 15,
                  border: `1px solid ${item.color}66`,
                  background: `linear-gradient(145deg, ${item.color}2b, rgba(34,80,139,0.92))`,
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.12), 0 8px 18px ${item.color}12`,
                }}
              >
                <span style={{ width: 33, height: 33, borderRadius: 10, display: "grid", placeItems: "center", border: `1px solid ${item.color}66`, background: `${item.color}1d` }}>
                  <img src={icons[item.key] || goodsBoxIcon} alt="" aria-hidden="true" style={{ width: 28, height: 28, objectFit: "contain" }} />
                </span>
                <b style={{ marginTop: 5, minHeight: 25, display: "grid", placeItems: "center", fontSize: 9.5, lineHeight: 1.25 }}>
                  {t(labelKeys[item.key], item.label)}
                </b>
                <strong style={{ marginTop: "auto", fontSize: 11 }}>{money(item.value)}</strong>
                <small style={{ marginTop: 3, color: item.change >= 0 ? visualIdentity.colors.green : visualIdentity.colors.red, fontSize: 8.5, fontWeight: 900 }}>
                  {item.change >= 0 ? "▲" : "▼"} {Math.abs(item.change).toFixed(1)}%
                </small>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: "grid", placeItems: "center", marginBottom: 13 }}>
          <DistributionDonut distribution={distribution} totalAssets={totalAssets} currencyLabel={currencyLabel} size={158} />
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {distribution.map((item) => (
            <div key={item.key} style={{ display: "grid", gridTemplateColumns: "78px minmax(0,1fr) auto", gap: 8, alignItems: "center" }}>
              <span style={{ color: visualIdentity.colors.textSecondary, fontSize: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {t(labelKeys[item.key], item.label)}
              </span>
              <span style={{ height: 8, borderRadius: 99, overflow: "hidden", background: "rgba(255,255,255,0.10)", boxShadow: "inset 0 1px 2px rgba(0,18,48,0.25)" }}>
                <i style={{ display: "block", width: `${Math.max(2, item.percent)}%`, height: "100%", borderRadius: 99, background: item.color, boxShadow: `0 0 8px ${item.color}88` }} />
              </span>
              <span style={{ minWidth: 82, textAlign: "left" }}>
                <b style={{ display: "block", color: item.color, fontSize: 11 }}>{item.percent.toFixed(1)}%</b>
                <small style={{ color: visualIdentity.colors.textSecondary, fontSize: 8 }}>{money(item.value)}</small>
              </span>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="asset-dashboard-card asset-distribution-card" style={cardStyle}>
      <div style={{ color: visualIdentity.colors.gold, fontSize: 16, fontWeight: 900, marginBottom: 13, textAlign: "right" }}>
        {t("assets.allocation")}
      </div>
      <div className="asset-distribution-layout" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 136px", alignItems: "center", gap: 12, direction: "ltr" }}>
        <div className="asset-distribution-legend" style={{ display: "grid", gap: 10, minWidth: 0 }}>
          {distribution.map((item) => (
            <div key={item.key} style={{ display: "grid", gridTemplateColumns: "70px minmax(20px,1fr) 28px 39px", alignItems: "center", gap: 6, minWidth: 0, fontSize: 10 }}>
              <span style={{ color: visualIdentity.colors.textSecondary, direction: "rtl", textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {t(labelKeys[item.key], item.label)}
              </span>
              <span aria-hidden="true" style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,0.09)", boxShadow: "inset 0 1px 2px rgba(0,18,48,0.25)" }} />
              <i aria-hidden="true" style={{ display: "block", width: 27, height: 4, borderRadius: 99, background: item.color, boxShadow: `0 0 8px ${item.color}cc` }} />
              <b style={{ color: item.color, fontSize: 11, fontVariantNumeric: "tabular-nums", textAlign: "right" }}>{item.percent.toFixed(0)}%</b>
            </div>
          ))}
        </div>
        <div className="asset-distribution-chart" style={{ width: 136, height: 136 }}>
          <DistributionDonut distribution={distribution} totalAssets={totalAssets} currencyLabel={currencyLabel} fluid />
        </div>
      </div>
    </section>
  );
}
