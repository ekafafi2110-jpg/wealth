import visualIdentity from "../../theme/visualIdentity";
import { useLocale } from "../../i18n/locale";

export default function MonthlyExpenseTrendCard({ points }) {
  const { currencyLabel } = useLocale();
  const maxValue = Math.max(1, ...points.map((point) => Number(point.value || 0)));

  return (
    <section className="asset-dashboard-card" style={{ padding: 14, marginBottom: 14, borderRadius: 20, border: visualIdentity.cards.outer.border, background: visualIdentity.gradients.outerCard, boxShadow: visualIdentity.cards.outer.boxShadow }}>
      <div style={{ color: visualIdentity.colors.gold, fontSize: 15, fontWeight: 900 }}>الاتجاه الشهري للمصروفات</div>
      <div style={{ marginTop: 3, color: visualIdentity.colors.textSecondary, fontSize: 9 }}>آخر الأشهر المسجلة</div>
      <div style={{ height: 145, marginTop: 14, display: "grid", gridTemplateColumns: `repeat(${Math.max(points.length, 1)},minmax(0,1fr))`, alignItems: "end", gap: 8, padding: "8px 4px 0", borderBottom: "1px solid rgba(255,255,255,0.14)" }}>
        {points.length ? points.map((point) => {
          const height = 28 + (Number(point.value || 0) / maxValue) * 82;
          return (
            <div key={point.month} style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", textAlign: "center", minWidth: 0 }}>
              <small style={{ marginBottom: 4, color: visualIdentity.colors.textSecondary, fontSize: 7, overflow: "hidden", textOverflow: "ellipsis" }}>{Number(point.value || 0).toFixed(0)}</small>
              <div title={`${point.value.toFixed(2)} ${currencyLabel}`} style={{ height, minHeight: 18, borderRadius: "8px 8px 3px 3px", background: `linear-gradient(180deg, ${visualIdentity.colors.cyan}, #2678C5)`, boxShadow: `0 0 12px ${visualIdentity.colors.cyan}22` }} />
              <small style={{ marginTop: 5, color: visualIdentity.colors.textSecondary, fontSize: 8 }}>{String(point.month).slice(5, 7)}</small>
            </div>
          );
        }) : (
          <div style={{ alignSelf: "center", textAlign: "center", color: visualIdentity.colors.textSecondary, fontSize: 11 }}>لا توجد بيانات شهرية بعد</div>
        )}
      </div>
    </section>
  );
}
