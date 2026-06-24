import visualIdentity from "../../theme/visualIdentity";
import { useLocale } from "../../i18n/locale";

const weekDays = ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

const dayKey = (value) => String(value || "").slice(0, 10);

export default function DailySpendingHeatmap({ expenses, monthKey }) {
  const { currencyLabel } = useLocale();
  const [year, month] = String(monthKey || new Date().toISOString().slice(0, 7))
    .split("-")
    .map(Number);
  const safeYear = year || new Date().getFullYear();
  const safeMonth = month || new Date().getMonth() + 1;
  const daysInMonth = new Date(safeYear, safeMonth, 0).getDate();
  const firstDay = new Date(safeYear, safeMonth - 1, 1).getDay();
  const totals = (expenses || []).reduce((map, expense) => {
    if (expense.isIncomeEntry) return map;
    const date = dayKey(expense.date || expense.createdAt);
    if (!date.startsWith(`${safeYear}-${String(safeMonth).padStart(2, "0")}`)) return map;
    map[date] = Number(map[date] || 0) + Number(expense.amount || 0);
    return map;
  }, {});
  const maxValue = Math.max(0, ...Object.values(totals));
  const cells = [
    ...Array.from({ length: firstDay }, (_, index) => ({ id: `blank-${index}`, blank: true })),
    ...Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      const date = `${safeYear}-${String(safeMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      return { id: date, day, value: Number(totals[date] || 0) };
    }),
  ];
  const colorFor = (value) => {
    if (!value || !maxValue) return "rgba(255,255,255,0.075)";
    const ratio = value / maxValue;
    if (ratio >= 0.8) return visualIdentity.semantic.warning;
    if (ratio >= 0.55) return "#4AAEF0";
    if (ratio >= 0.3) return "#3686C9";
    return "#2B659D";
  };

  return (
    <section className="asset-dashboard-card" style={{ padding: 14, marginBottom: 14, borderRadius: 20, border: visualIdentity.cards.outer.border, background: visualIdentity.gradients.outerCard, boxShadow: visualIdentity.cards.outer.boxShadow }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{ color: visualIdentity.colors.gold, fontSize: 15, fontWeight: 900 }}>خريطة الإنفاق اليومي</div>
        <span style={{ padding: "4px 8px", borderRadius: 999, border: `1px solid ${visualIdentity.colors.cyan}66`, color: visualIdentity.colors.cyan, fontSize: 9 }}>
          {String(safeMonth).padStart(2, "0")} / {safeYear}
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", gap: 5, marginBottom: 5 }}>
        {weekDays.map((day) => <div key={day} style={{ textAlign: "center", color: visualIdentity.colors.textSecondary, fontSize: 8 }}>{day}</div>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", gap: 5 }}>
        {cells.map((cell) => (
          <div
            key={cell.id}
            title={cell.blank ? "" : `${cell.day}: ${cell.value.toFixed(2)} ${currencyLabel}`}
            style={{
              aspectRatio: "1 / 0.9",
              minHeight: 32,
              borderRadius: 8,
              display: "grid",
              placeItems: "center",
              background: cell.blank ? "transparent" : colorFor(cell.value),
              border: cell.blank ? 0 : "1px solid rgba(255,255,255,0.10)",
              color: cell.value / Math.max(1, maxValue) >= 0.8 ? visualIdentity.colors.navy : visualIdentity.colors.white,
              fontSize: 9,
              fontWeight: 900,
              boxShadow: cell.value ? `0 4px 10px ${colorFor(cell.value)}22` : "none",
            }}
          >
            {!cell.blank && cell.day}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 9, display: "flex", alignItems: "center", gap: 6, color: visualIdentity.colors.textFaint, fontSize: 8 }}>
        <span>أقل</span>
        {["rgba(255,255,255,0.075)", "#2B659D", "#3686C9", "#4AAEF0", visualIdentity.semantic.warning].map((color) => (
          <i key={color} style={{ width: 13, height: 8, borderRadius: 3, background: color }} />
        ))}
        <span>أعلى</span>
      </div>
    </section>
  );
}
