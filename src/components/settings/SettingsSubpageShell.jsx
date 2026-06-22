import { ArrowRight } from "lucide-react";
import visualIdentity from "../../theme/visualIdentity";
import { useLocale } from "../../i18n/locale";

export default function SettingsSubpageShell({ title, subtitle, onBack, children }) {
  const { direction, t } = useLocale();
  return (
    <div style={{ direction, color: visualIdentity.colors.white }}>
      <header style={{ display: "grid", gridTemplateColumns: "38px minmax(0,1fr)", gap: 10, alignItems: "center", marginBottom: 16 }}>
        <button type="button" onClick={onBack} title={t("actions.back")} aria-label={t("actions.back")} style={{ width: 38, height: 38, borderRadius: 11, border: "1px solid rgba(255,255,255,0.16)", background: "rgba(255,255,255,0.08)", color: visualIdentity.colors.white, display: "grid", placeItems: "center", cursor: "pointer" }}>
          <ArrowRight size={19} />
        </button>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>{title}</h2>
          {subtitle && <div style={{ marginTop: 3, color: visualIdentity.colors.textSecondary, fontSize: 10 }}>{subtitle}</div>}
        </div>
      </header>
      {children}
    </div>
  );
}
