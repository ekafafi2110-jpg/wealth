import { ChartNoAxesCombined, PieChart } from "lucide-react";
import visualIdentity from "../../theme/visualIdentity";

const tabs = [
  { id: "growth", label: "النمو الشهري", icon: ChartNoAxesCombined },
  { id: "distribution", label: "توزيع الأصول", icon: PieChart },
];

export default function AssetReportTabs({ active, onChange }) {
  return (
    <nav
      aria-label="تقارير الأصول"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 6,
        marginBottom: 13,
        padding: 5,
        borderRadius: 15,
        border: "1px solid rgba(255,255,255,0.13)",
        background: "rgba(21,65,121,0.78)",
      }}
    >
      {tabs.map((tab) => {
        const selected = active === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(tab.id)}
            style={{
              minHeight: 39,
              borderRadius: 11,
              border: selected ? `1px solid ${visualIdentity.colors.cyan}77` : "1px solid transparent",
              background: selected
                ? "linear-gradient(145deg, rgba(105,173,235,0.48), rgba(68,123,183,0.62))"
                : "transparent",
              color: selected ? visualIdentity.colors.white : visualIdentity.colors.textSecondary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              fontFamily: "inherit",
              fontSize: 10,
              fontWeight: selected ? 900 : 700,
              cursor: "pointer",
            }}
          >
            <Icon size={15} />
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
