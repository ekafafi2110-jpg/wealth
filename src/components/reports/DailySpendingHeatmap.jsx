import visualIdentity from "../../theme/visualIdentity";
import { useLocale } from "../../i18n/locale";

const weekDays = ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

const dayKey = (value) => String(value || "").slice(0, 10);
const spendingLevels = [
  { min: 0, max: 0, label: "0", color: "rgba(255,255,255,0.10)", textColor: visualIdentity.colors.textSecondary },
  { min: 1, max: 10, label: "1-10", color: "#00C853", textColor: visualIdentity.colors.navy },
  { min: 11, max: 20, label: "11-20", color: "#B7E84B", textColor: visualIdentity.colors.navy },
  { min: 21, max: 50, label: "21-50", color: "#FFC62D", textColor: visualIdentity.colors.navy },
  { min: 51, max: 100, label: "51-100", color: "#FF8A00", textColor: visualIdentity.colors.navy },
  { min: 101, max: Infinity, label: "101+", color: visualIdentity.colors.red, textColor: visualIdentity.colors.white },
];

export default function DailySpendingHeatmap({
  expenses,
  monthKey,
  dailyTotals,
  monthOptions = [],
  onMonthChange,
}) {
  const { currencyLabel } = useLocale();
  const [year, month] = String(monthKey || new Date().toISOString().slice(0, 7))
    .split("-")
    .map(Number);
  const safeYear = year || new Date().getFullYear();
  const safeMonth = month || new Date().getMonth() + 1;
  const daysInMonth = new Date(safeYear, safeMonth, 0).getDate();
  const firstDay = new Date(safeYear, safeMonth - 1, 1).getDay();
  const totals = dailyTotals || (expenses || []).reduce((map, expense) => {
    if (expense.isIncomeEntry) return map;
    const date = dayKey(expense.date || expense.createdAt);
    if (!date.startsWith(`${safeYear}-${String(safeMonth).padStart(2, "0")}`)) return map;
    map[date] = Number(map[date] || 0) + Number(expense.amount || 0);
    return map;
  }, {});
  const cells = [
    ...Array.from({ length: firstDay }, (_, index) => ({ id: `blank-${index}`, blank: true })),
    ...Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      const date = `${safeYear}-${String(safeMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      return { id: date, day, value: Number(totals[date] || 0) };
    }),
  ];
  const levelFor = (value) => {
    const amount = Number(value || 0);
    return spendingLevels.find((level) => amount >= level.min && amount <= level.max) || spendingLevels[0];
  };

  return (
    <section className="asset-dashboard-card" style={{ padding: 14, marginBottom: 14, borderRadius: 20, border: visualIdentity.cards.outer.border, background: visualIdentity.gradients.outerCard, boxShadow: visualIdentity.cards.outer.boxShadow }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{ color: visualIdentity.colors.gold, fontSize: 15, fontWeight: 900 }}>خريطة الإنفاق اليومي</div>
        {monthOptions.length > 1 ? (
          <select
            value={monthKey}
            onChange={(event) => onMonthChange?.(event.target.value)}
            aria-label="شهر خريطة الإنفاق"
            style={{
              minHeight: 26,
              padding: "0 8px",
              borderRadius: 999,
              border: `1px solid ${visualIdentity.colors.cyan}66`,
              background: "rgba(255,255,255,0.08)",
              color: visualIdentity.colors.cyan,
              fontSize: 9,
              fontWeight: 900,
              outline: "none",
            }}
          >
            {monthOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <span style={{ padding: "4px 8px", borderRadius: 999, border: `1px solid ${visualIdentity.colors.cyan}66`, color: visualIdentity.colors.cyan, fontSize: 9 }}>
            {safeYear} / {String(safeMonth).padStart(2, "0")}
          </span>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", gap: 5, marginBottom: 5 }}>
        {weekDays.map((day) => <div key={day} style={{ textAlign: "center", color: visualIdentity.colors.textSecondary, fontSize: 8 }}>{day}</div>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", gap: 5 }}>
        {cells.map((cell) => {
          const level = levelFor(cell.value);
          return (
            <div
              key={cell.id}
              title={cell.blank ? "" : `${cell.day}: ${cell.value.toFixed(2)} ${currencyLabel}`}
              style={{
                aspectRatio: "1 / 0.9",
                minHeight: 32,
                borderRadius: 8,
                display: "grid",
                placeItems: "center",
                background: cell.blank ? "transparent" : level.color,
                border: cell.blank ? 0 : "1px solid rgba(255,255,255,0.12)",
                color: level.textColor,
                fontSize: 9,
                fontWeight: 900,
                boxShadow: cell.value ? `0 4px 10px ${level.color}33` : "none",
              }}
            >
              {!cell.blank && cell.day}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6, flexWrap: "wrap", color: visualIdentity.colors.textFaint, fontSize: 8 }}>
        <span style={{ color: visualIdentity.colors.textSecondary, fontWeight: 900 }}>دليل الأرقام</span>
        {spendingLevels.map((level) => (
          <span key={level.label} style={{ display: "inline-flex", alignItems: "center", gap: 4, color: visualIdentity.colors.textSecondary, fontWeight: 800 }}>
            <i style={{ width: 13, height: 8, borderRadius: 3, background: level.color, border: "1px solid rgba(255,255,255,0.12)" }} />
            {level.label}
          </span>
        ))}
        <span>{currencyLabel}</span>
      </div>
    </section>
  );
}
