import { ArrowLeft, ChartNoAxesCombined, PieChart, Sparkles, WalletCards } from "lucide-react";
import visualIdentity from "../../theme/visualIdentity";

const money = (value) =>
  Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const reportCards = {
  expenses: {
    title: "تقارير المصروفات",
    meta: "التوزيع، الاتجاه، سقوف البنود وخريطة الإنفاق",
    icon: PieChart,
    color: visualIdentity.colors.cyan,
  },
  assets: {
    title: "تقارير الأصول",
    meta: "النمو، التغيرات الشهرية وتفاصيل الأصول",
    icon: ChartNoAxesCombined,
    color: visualIdentity.colors.green,
  },
  weeklyAi: {
    title: "تقرير AI الأسبوعي",
    meta: "تحليل أسبوع أو أكثر من المصاريف والتغيرات مع نصائح ذكية للمستخدم",
    icon: Sparkles,
    color: visualIdentity.colors.purple,
  },
};

export default function ReportsOverview({ spendingCap, totalExpenses, overBudget, currencyLabel, onOpen }) {
  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <h1 style={{ margin: 0, fontSize: 25, fontWeight: 900 }}>التقارير</h1>
        <div style={{ marginTop: 3, color: visualIdentity.colors.textSecondary, fontSize: 10 }}>
          ملخص سريع وتقارير تفصيلية قابلة للاستخراج
        </div>
      </div>

      <section
        className="asset-dashboard-card"
        style={{
          padding: 13,
          marginBottom: 13,
          borderRadius: 19,
          border: visualIdentity.cards.outer.border,
          background: visualIdentity.gradients.outerCard,
          boxShadow: visualIdentity.cards.outer.boxShadow,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10, color: visualIdentity.colors.gold, fontWeight: 900, fontSize: 14 }}>
          <WalletCards size={17} />
          ملخص الميزانية
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 8 }}>
          {[
            ["سقف الصرف", spendingCap, visualIdentity.semantic.warning],
            ["إجمالي المصروف", totalExpenses, visualIdentity.colors.cyan],
            ["التجاوز", overBudget, overBudget > 0 ? visualIdentity.colors.red : visualIdentity.colors.green],
          ].map(([label, value, color]) => (
            <div
              key={label}
              style={{
                minWidth: 0,
                padding: "11px 6px",
                borderRadius: 14,
                textAlign: "center",
                border: `1px solid ${color}55`,
                background: `linear-gradient(145deg, ${color}20, rgba(35,83,143,0.84))`,
              }}
            >
              <div style={{ color: visualIdentity.colors.textSecondary, fontSize: 9 }}>{label}</div>
              <b style={{ display: "block", marginTop: 5, color, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {money(value)}
              </b>
              <small style={{ color: visualIdentity.colors.textFaint, fontSize: 8 }}>{currencyLabel}</small>
            </div>
          ))}
        </div>
      </section>

      {Object.entries(reportCards).map(([id, item]) => {
        const Icon = item.icon;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onOpen(id)}
            className="asset-dashboard-card"
            style={{
              width: "100%",
              minHeight: 132,
              marginBottom: 13,
              padding: 16,
              display: "grid",
              gridTemplateColumns: "58px minmax(0,1fr) 28px",
              alignItems: "center",
              gap: 12,
              borderRadius: 20,
              border: `1px solid ${item.color}66`,
              background: `linear-gradient(145deg, ${item.color}24, rgba(35,84,145,0.95) 44%, rgba(18,59,111,0.97))`,
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.13), 0 12px 28px ${item.color}12`,
              color: visualIdentity.colors.white,
              fontFamily: "inherit",
              textAlign: "right",
              cursor: "pointer",
            }}
          >
            <span style={{ width: 56, height: 56, borderRadius: 17, display: "grid", placeItems: "center", color: item.color, border: `1px solid ${item.color}66`, background: `${item.color}18`, boxShadow: `0 0 20px ${item.color}18` }}>
              <Icon size={28} />
            </span>
            <span>
              <b style={{ display: "block", color: visualIdentity.colors.gold, fontSize: 18 }}>{item.title}</b>
              <small style={{ display: "block", marginTop: 6, color: visualIdentity.colors.textSecondary, fontSize: 10, lineHeight: 1.6 }}>
                {item.meta}
              </small>
            </span>
            <ArrowLeft size={21} color={item.color} />
          </button>
        );
      })}
    </div>
  );
}
