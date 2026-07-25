import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useLocale } from "../../i18n/locale";
import visualIdentity from "../../theme/visualIdentity";

const FALLBACK_CATEGORY_COLORS = [
  "#E8A44A",
  "#7BBFF5",
  "#60C698",
  "#A78BF5",
  "#F07A7A",
  "#F5C96A",
  "#38BDF8",
  "#FF8A65",
  "#EC4899",
  "#B0A080",
];

const resolveCategoryColor = (category, index, categoryColors, usedColors) => {
  const configuredColor = String(categoryColors?.[category] || "").trim();
  const canUseConfigured =
    configuredColor &&
    !configuredColor.startsWith("var(") &&
    !usedColors.has(configuredColor.toLowerCase());

  if (canUseConfigured) {
    usedColors.add(configuredColor.toLowerCase());
    return configuredColor;
  }

  for (let offset = 0; offset < FALLBACK_CATEGORY_COLORS.length; offset += 1) {
    const color = FALLBACK_CATEGORY_COLORS[
      (index + offset) % FALLBACK_CATEGORY_COLORS.length
    ];
    const key = color.toLowerCase();
    if (!usedColors.has(key)) {
      usedColors.add(key);
      return color;
    }
  }

  return FALLBACK_CATEGORY_COLORS[index % FALLBACK_CATEGORY_COLORS.length];
};

export default function ExpenseDonut({
  expenses,
  mode = "donut",
  categoryColors = {},
  centerValue,
  centerLabel,
  centerColor = "var(--text-heading)",
  onCategorySelect,
}) {
  const { currencyLabel } = useLocale();
  const expenseCats = Array.from(
  new Set((expenses || []).map((e) => e.category).filter(Boolean))
);

const usedColors = new Set();
const grouped = expenseCats.map((cat, index) => ({
  name: cat,
  value: (expenses || [])
    .filter((e) => e.category === cat)
    .reduce((sum, e) => sum + Number(e.amount || 0), 0),
  color: resolveCategoryColor(cat, index, categoryColors, usedColors),
  })).filter((x) => x.value > 0);
  const total = grouped.reduce((sum, x) => sum + x.value, 0);
  const sortedGrouped = [...grouped].sort((a, b) => b.value - a.value);

  if (!grouped.length) {
    return (
      <div
        style={{
          textAlign: "center",
          color: visualIdentity.colors.textSecondary,
          padding: "24px 0",
          fontSize: 13,
        }}
      >
        لا توجد مصاريف بعد
      </div>
    );
  }

  if (mode === "bars") {
    const maxValue = Math.max(1, ...sortedGrouped.map((item) => item.value));

    return (
      <div style={{ display: "grid", gap: 8, marginTop: 4 }}>
        {sortedGrouped.map((item) => {
          const pct = total ? Math.round((item.value / total) * 100) : 0;
          const width = Math.max(8, (item.value / maxValue) * 100);

          return (
            <button
              key={item.name}
              type="button"
              onClick={() => onCategorySelect?.(item.name)}
              title={`فتح كشف مصروفات ${item.name}`}
              aria-label={`فتح كشف المصروفات مفلترًا على ${item.name}`}
              style={{
                width: "100%",
                padding: 0,
                border: "none",
                background: "transparent",
                color: "inherit",
                fontFamily: "inherit",
                textAlign: "right",
                cursor: onCategorySelect ? "pointer" : "default",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                <span style={{ color: item.color, fontSize: 11, fontWeight: 900 }}>
                  {item.value.toFixed(2)}
                </span>
                <span style={{ color: visualIdentity.colors.white, fontSize: 12 }}>
                  {item.name} · {pct}%
                </span>
              </div>
              <div style={{ height: 7, background: "rgba(255,255,255,0.10)", borderRadius: 4, overflow: "hidden" }}>
                <div
                  style={{
                    width: `${width}%`,
                    height: "100%",
                    background: item.color,
                    borderRadius: 4,
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div>
      <div style={{ height: 146, position: "relative" }}>
        <ResponsiveContainer width="100%" height={146}>
          <PieChart>
            <Pie
              data={grouped}
              cx="50%"
              cy="50%"
              innerRadius={43}
              outerRadius={62}
              dataKey="value"
              paddingAngle={3}
            >
              {grouped.map((d, i) => (
                <Cell key={i} fill={d.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>

        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <div style={{ fontSize: 17, fontWeight: 800, color: centerColor, fontVariantNumeric: "tabular-nums" }}>
            {Number(centerValue ?? total).toFixed(0)}
          </div>
          <div style={{ fontSize: 8, color: visualIdentity.colors.textSecondary, maxWidth: 72, lineHeight: 1.35 }}>
            {centerLabel || currencyLabel}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          justifyContent: "center",
          marginTop: 8,
        }}
      >
        {grouped.map((d) => (
          <div
            key={d.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <span style={{ color: d.color, fontSize: 11, fontWeight: 900 }}>
              {total ? Math.round((d.value / total) * 100) : 0}%
            </span>
            <span style={{ fontSize: 11, color: visualIdentity.colors.textSecondary }}>{d.name}</span>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: d.color,
                display: "inline-block",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
