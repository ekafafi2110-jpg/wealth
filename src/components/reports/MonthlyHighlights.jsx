import { ArrowDown, ArrowUp, CircleMinus } from "lucide-react";
import visualIdentity from "../../theme/visualIdentity";
import { useLocale } from "../../i18n/locale";

const money = (value) =>
  Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function MonthlyHighlights({ currentByCategory, previousByCategory, previousMonth }) {
  const { currencyLabel } = useLocale();
  const hasPrevious = Boolean(previousMonth && previousMonth !== "—");
  const categories = Array.from(
    new Set([
      ...Object.keys(currentByCategory || {}),
      ...Object.keys(previousByCategory || {}),
    ])
  );
  const changes = categories
    .map((category) => {
      const current = Number(currentByCategory?.[category] || 0);
      const previous = Number(previousByCategory?.[category] || 0);
      const difference = current - previous;
      const percent = previous > 0 ? (difference / previous) * 100 : current > 0 ? 100 : 0;
      return { category, current, previous, difference, percent };
    })
    .filter((item) => item.difference !== 0)
    .sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference))
    .slice(0, 5);

  return (
    <section className="asset-dashboard-card" style={{ padding: 14, marginBottom: 14, borderRadius: 20, border: visualIdentity.cards.outer.border, background: visualIdentity.gradients.outerCard, boxShadow: visualIdentity.cards.outer.boxShadow }}>
      <div style={{ color: visualIdentity.colors.gold, fontSize: 15, fontWeight: 900 }}>أبرز التغيرات هذا الشهر</div>
      <div style={{ marginTop: 3, marginBottom: 10, color: visualIdentity.colors.textSecondary, fontSize: 9 }}>
        {hasPrevious ? `مقارنة بشهر ${previousMonth}` : "تظهر المقارنة بعد توفر شهر مغلق سابق"}
      </div>

      {!hasPrevious ? (
        <div style={{ padding: "18px 8px", textAlign: "center", color: visualIdentity.colors.textSecondary, fontSize: 11 }}>
          لا توجد بيانات شهر سابق كافية للمقارنة بعد.
        </div>
      ) : changes.length ? (
        <div style={{ display: "grid", gap: 7 }}>
          {changes.map((item) => {
            const up = item.difference > 0;
            const color = up ? visualIdentity.colors.red : visualIdentity.colors.green;
            const Icon = up ? ArrowUp : item.difference < 0 ? ArrowDown : CircleMinus;
            return (
              <div key={item.category} style={{ minHeight: 52, padding: "8px 9px", display: "grid", gridTemplateColumns: "32px minmax(0,1fr) auto", alignItems: "center", gap: 8, borderRadius: 13, border: `1px solid ${color}44`, background: `${color}12` }}>
                <span style={{ width: 30, height: 30, borderRadius: 9, display: "grid", placeItems: "center", color, background: `${color}18` }}>
                  <Icon size={16} />
                </span>
                <span style={{ minWidth: 0 }}>
                  <b style={{ display: "block", fontSize: 11 }}>{item.category}</b>
                  <small style={{ display: "block", marginTop: 3, color: visualIdentity.colors.textSecondary, fontSize: 8 }}>
                    {money(item.previous)} ← {money(item.current)} {currencyLabel}
                  </small>
                </span>
                <b style={{ color, fontSize: 11, whiteSpace: "nowrap" }}>
                  {up ? "+" : ""}{item.percent.toFixed(0)}%
                </b>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ padding: "18px 8px", textAlign: "center", color: visualIdentity.colors.textSecondary, fontSize: 11 }}>
          لم تتغير المصروفات مقارنة بالشهر السابق.
        </div>
      )}
    </section>
  );
}
