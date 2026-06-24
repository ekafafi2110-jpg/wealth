import { ArrowRight } from "lucide-react";
import visualIdentity from "../../theme/visualIdentity";

export default function ReportViewHeader({ title, subtitle, onBack }) {
  return (
    <header style={{ display: "grid", gridTemplateColumns: "38px minmax(0,1fr)", gap: 10, alignItems: "center", marginBottom: 14 }}>
      <button
        type="button"
        onClick={onBack}
        aria-label="العودة إلى ملخص التقارير"
        title="العودة"
        style={{
          width: 38,
          height: 38,
          borderRadius: 11,
          border: "1px solid rgba(255,255,255,0.16)",
          background: "rgba(255,255,255,0.08)",
          color: visualIdentity.colors.white,
          display: "grid",
          placeItems: "center",
          cursor: "pointer",
        }}
      >
        <ArrowRight size={19} />
      </button>
      <div>
        <h2 style={{ margin: 0, color: visualIdentity.colors.gold, fontSize: 21, fontWeight: 900 }}>{title}</h2>
        <div style={{ marginTop: 3, color: visualIdentity.colors.textSecondary, fontSize: 9 }}>{subtitle}</div>
      </div>
    </header>
  );
}
