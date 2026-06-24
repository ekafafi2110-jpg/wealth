import { useEffect, useRef } from "react";
import {
  CalendarDays,
  ChartColumn,
  Gauge,
  ListRestart,
  PieChart,
  ReceiptText,
} from "lucide-react";
import visualIdentity from "../../theme/visualIdentity";

const tabs = [
  { id: "distribution", label: "التوزيع", icon: PieChart },
  { id: "trend", label: "الاتجاه", icon: ChartColumn },
  { id: "caps", label: "سقوف البنود", icon: Gauge },
  { id: "heatmap", label: "الإنفاق اليومي", icon: CalendarDays },
  { id: "highlights", label: "أبرز التغيرات", icon: ListRestart },
  { id: "statement", label: "الكشف", icon: ReceiptText },
];

export default function ExpenseReportTabs({ active, onChange }) {
  const activeTabRef = useRef(null);

  useEffect(() => {
    activeTabRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [active]);

  return (
    <nav
      aria-label="تقارير المصروفات"
      style={{
        display: "flex",
        gap: 6,
        marginBottom: 13,
        padding: 5,
        overflowX: "auto",
        direction: "rtl",
        scrollbarWidth: "thin",
        scrollbarColor: `${visualIdentity.colors.cyan}66 transparent`,
        scrollSnapType: "x proximity",
        WebkitOverflowScrolling: "touch",
        borderRadius: 15,
        border: "1px solid rgba(255,255,255,0.13)",
        background: "rgba(21,65,121,0.78)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07)",
      }}
    >
      {tabs.map((tab) => {
        const selected = active === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            ref={selected ? activeTabRef : null}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(tab.id)}
            style={{
              flex: "0 0 92px",
              minWidth: 92,
              minHeight: 44,
              padding: "0 7px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              scrollSnapAlign: "center",
              borderRadius: 11,
              border: selected
                ? `1px solid ${visualIdentity.colors.cyan}77`
                : "1px solid transparent",
              background: selected
                ? "linear-gradient(145deg, rgba(105,173,235,0.48), rgba(68,123,183,0.62))"
                : "transparent",
              color: selected
                ? visualIdentity.colors.white
                : visualIdentity.colors.textSecondary,
              boxShadow: selected
                ? "inset 0 1px 0 rgba(255,255,255,0.14), 0 5px 13px rgba(3,30,66,0.18)"
                : "none",
              fontFamily: "inherit",
              fontSize: 10,
              fontWeight: selected ? 900 : 700,
              lineHeight: 1.3,
              whiteSpace: "nowrap",
              cursor: "pointer",
            }}
          >
            <Icon size={14} strokeWidth={2} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
