import visualIdentity from "../../theme/visualIdentity";
import { useLocale } from "../../i18n/locale";

const money = (value) =>
  Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

function Gauge({ percent, color }) {
  const safePercent = Math.min(100, Math.max(0, percent));
  const dash = `${safePercent} ${100 - safePercent}`;
  return (
    <svg viewBox="0 0 120 68" width="100%" aria-hidden="true">
      <path d="M 14 58 A 46 46 0 0 1 106 58" pathLength="100" fill="none" stroke="rgba(24,67,120,0.12)" strokeWidth="13" strokeLinecap="round" />
      <path d="M 14 58 A 46 46 0 0 1 106 58" pathLength="100" fill="none" stroke={color} strokeWidth="13" strokeLinecap="round" strokeDasharray={dash} style={{ filter: `drop-shadow(0 2px 4px ${color}45)` }} />
    </svg>
  );
}

export default function CategoryBudgetGauges({ categories, expensesByCategory, caps }) {
  const { currencyLabel } = useLocale();
  const visibleCategories = categories.filter(
    (category) => Number(caps?.[category.label] || 0) > 0 || Number(expensesByCategory?.[category.label] || 0) > 0
  );

  return (
    <section
      className="asset-dashboard-card"
      style={{
        padding: 14,
        marginBottom: 14,
        borderRadius: 20,
        border: visualIdentity.cards.outer.border,
        background: "linear-gradient(145deg, rgba(240,248,255,0.96), rgba(217,235,250,0.93))",
        boxShadow: visualIdentity.cards.outer.boxShadow,
        color: visualIdentity.colors.navy,
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 900, marginBottom: 2 }}>الميزانية التقديرية حسب الفئة</div>
      <div style={{ color: "rgba(11,43,82,0.62)", fontSize: 9, marginBottom: 12 }}>
        مقارنة مصروف كل بند بسقفه المخطط
      </div>

      {visibleCategories.length ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "14px 10px" }}>
          {visibleCategories.map((category) => {
            const spent = Number(expensesByCategory?.[category.label] || 0);
            const cap = Number(caps?.[category.label] || 0);
            const percent = cap > 0 ? (spent / cap) * 100 : 0;
            const color = cap <= 0
              ? "#91A9BF"
              : percent >= 100
              ? visualIdentity.colors.red
              : percent >= 70
              ? visualIdentity.semantic.warning
              : visualIdentity.semantic.success;

            return (
              <div key={category.id || category.label} style={{ minWidth: 0, textAlign: "center" }}>
                <div style={{ minHeight: 22, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontSize: 11, fontWeight: 900 }}>
                  <span>{category.icon || "•"}</span>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{category.label}</span>
                </div>
                <div style={{ position: "relative", height: 74 }}>
                  <Gauge percent={percent} color={color} />
                  <b style={{ position: "absolute", left: 0, right: 0, bottom: 7, color, fontSize: 16, fontVariantNumeric: "tabular-nums" }}>
                    {cap > 0 ? `${Math.round(percent)}%` : "—"}
                  </b>
                </div>
                <div style={{ color: "rgba(11,43,82,0.62)", fontSize: 9 }}>
                  {money(spent)} / {cap > 0 ? money(cap) : "غير محدد"} {currencyLabel}
                </div>
                <div style={{ marginTop: 4, color, fontSize: 9, fontWeight: 900 }}>
                  {cap <= 0 ? "أضف سقفًا من الإعدادات" : percent >= 100 ? "تجاوز" : percent >= 70 ? "اقترب من السقف" : "ضمن المخطط"}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ padding: "22px 8px", textAlign: "center", color: "rgba(11,43,82,0.58)", fontSize: 11 }}>
          أضف سقوف بنود المصروف من إعدادات الراتب والسقف لتظهر مؤشرات المتابعة هنا.
        </div>
      )}
    </section>
  );
}
