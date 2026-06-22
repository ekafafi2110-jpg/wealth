import { Building2, CalendarDays, ChevronDown, ChevronUp } from "lucide-react";
import { useLocale } from "../../i18n/locale";
import visualIdentity from "../../theme/visualIdentity";

export default function StructuralLiabilitiesCard({ total, rows, open, onToggle }) {
  const { currencyLabel, t } = useLocale();
  const accent = visualIdentity.semantic.warning;

  return (
    <section className="asset-dashboard-card" style={{ position: "relative", marginBottom: 13, padding: 14, borderRadius: visualIdentity.cards.outer.borderRadius, border: `1px solid ${accent}70`, background: visualIdentity.gradients.outerCard, boxShadow: `${visualIdentity.cards.outer.boxShadow}, 0 0 22px ${accent}12`, color: visualIdentity.colors.white }}>
      <span aria-hidden="true" style={{ position: "absolute", insetInlineStart: 0, top: 18, bottom: 18, width: 3, borderRadius: 99, background: accent, boxShadow: `0 0 12px ${accent}88` }} />
      <button type="button" onClick={onToggle} aria-expanded={open} style={{ width: "100%", padding: 0, display: "grid", gridTemplateColumns: "44px minmax(0,1fr) auto", alignItems: "center", gap: 10, border: 0, background: "transparent", color: "inherit", fontFamily: "inherit", textAlign: "right", cursor: "pointer" }}>
        <span className="asset-icon-shell" style={{ width: 42, height: 42, borderRadius: 13, display: "grid", placeItems: "center", color: accent, border: `1px solid ${accent}66`, background: `${accent}18`, boxShadow: `inset 0 0 14px ${accent}12` }}><Building2 size={21} /></span>
        <span style={{ minWidth: 0 }}>
          <b style={{ display: "block", fontSize: 15 }}>{t("liabilities.fixed")}</b>
          <small style={{ display: "block", marginTop: 3, color: visualIdentity.colors.textSecondary, fontSize: 9 }}>أقساط ثابتة قادمة من الإعدادات</small>
        </span>
        <span style={{ textAlign: "left" }}>
          <b style={{ display: "block", color: accent, fontSize: 18 }}>{total.toFixed(2)} <small style={{ fontSize: 8 }}>{currencyLabel}</small></b>
          <span style={{ display: "flex", justifyContent: "flex-end", marginTop: 4, color: visualIdentity.colors.textSecondary }}>{open ? <ChevronUp size={17} /> : <ChevronDown size={17} />}</span>
        </span>
      </button>

      {open && (
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.12)" }}>
          {rows.map((item, index) => (
            <div key={item.id ?? index} style={{ minHeight: 58, padding: "8px 9px", marginBottom: index < rows.length - 1 ? 7 : 0, display: "grid", gridTemplateColumns: "34px minmax(0,1fr) auto", alignItems: "center", gap: 9, borderRadius: 13, border: visualIdentity.cards.inner.border, background: visualIdentity.gradients.innerCard, boxShadow: visualIdentity.cards.inner.boxShadow }}>
              <span style={{ width: 32, height: 32, borderRadius: 10, display: "grid", placeItems: "center", color: accent, background: `${accent}15` }}><CalendarDays size={16} /></span>
              <span style={{ minWidth: 0 }}><b style={{ display: "block", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</b><small style={{ display: "block", marginTop: 3, color: visualIdentity.colors.textSecondary, fontSize: 9 }}>يوم السداد: {item.dueDay || "-"}</small></span>
              <b style={{ color: accent, fontSize: 12, whiteSpace: "nowrap" }}>{item.amount.toFixed(2)} {currencyLabel}</b>
            </div>
          ))}
          {!rows.length && <div style={{ padding: 16, textAlign: "center", color: visualIdentity.colors.textSecondary, fontSize: 10 }}>{t("actions.noRecords")}</div>}
        </div>
      )}
    </section>
  );
}
