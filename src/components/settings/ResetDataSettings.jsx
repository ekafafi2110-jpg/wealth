import { AlertTriangle, Trash2 } from "lucide-react";
import { useState } from "react";
import { useLocale } from "../../i18n/locale";
import visualIdentity from "../../theme/visualIdentity";

export default function ResetDataSettings({ onReset }) {
  const { language, t } = useLocale();
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const requiredText = language === "en" ? "DELETE" : "حذف";
  const confirmed = confirmationText.trim() === requiredText;

  const reset = async () => {
    if (!confirmed || loading) return;
    setLoading(true);
    setError("");
    try {
      await onReset();
    } catch (resetError) {
      setError(resetError?.message || "تعذر تصفير البيانات");
      setLoading(false);
    }
  };

  return (
    <section className="asset-dashboard-card" style={{ padding: 16, borderRadius: 18, border: `1px solid ${visualIdentity.colors.red}66`, background: "linear-gradient(145deg, rgba(124,39,64,0.40), rgba(20,57,108,0.94))", boxShadow: visualIdentity.cards.outer.boxShadow, color: visualIdentity.colors.white }}>
      <div style={{ width: 58, height: 58, margin: "0 auto 12px", borderRadius: 16, display: "grid", placeItems: "center", color: visualIdentity.colors.red, border: `1px solid ${visualIdentity.colors.red}66`, background: `${visualIdentity.colors.red}18` }}>
        <AlertTriangle size={29} />
      </div>
      <h3 style={{ margin: 0, textAlign: "center", color: visualIdentity.colors.red, fontSize: 17 }}>{t("settings.reset")}</h3>
      <p style={{ margin: "9px 0 15px", textAlign: "center", color: visualIdentity.colors.textSecondary, fontSize: 11, lineHeight: 1.8 }}>
        سيتم حذف جميع المصاريف والأصول والخصوم والإعدادات المحفوظة نهائياً. لن يتم حذف حساب تسجيل الدخول.
      </p>

      {!confirmationOpen ? (
        <button type="button" onClick={() => setConfirmationOpen(true)} style={{ width: "100%", minHeight: 46, borderRadius: 13, border: `1px solid ${visualIdentity.colors.red}77`, background: `${visualIdentity.colors.red}18`, color: visualIdentity.colors.red, fontFamily: "inherit", fontWeight: 900, cursor: "pointer" }}>
          <Trash2 size={17} style={{ verticalAlign: "middle", marginInlineEnd: 7 }} />
          متابعة إلى التأكيد النهائي
        </button>
      ) : (
        <div style={{ padding: 12, borderRadius: 14, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.06)" }}>
          <label style={{ display: "block", marginBottom: 7, color: visualIdentity.colors.textSecondary, fontSize: 10 }}>
            اكتب <b style={{ color: visualIdentity.colors.white }}>{requiredText}</b> لتأكيد المسح النهائي
          </label>
          <input value={confirmationText} onChange={(event) => setConfirmationText(event.target.value)} autoComplete="off" style={{ width: "100%", minHeight: 42, marginBottom: 9, textAlign: "center" }} />
          {error && <div style={{ marginBottom: 8, color: visualIdentity.colors.red, textAlign: "center", fontSize: 10 }}>{error}</div>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <button type="button" onClick={() => { setConfirmationOpen(false); setConfirmationText(""); setError(""); }} disabled={loading} style={{ minHeight: 43, borderRadius: 12, border: "1px solid rgba(255,255,255,0.16)", background: "rgba(255,255,255,0.07)", color: visualIdentity.colors.white, fontFamily: "inherit", fontWeight: 800, cursor: "pointer" }}>{t("actions.cancel")}</button>
            <button type="button" onClick={reset} disabled={!confirmed || loading} style={{ minHeight: 43, borderRadius: 12, border: 0, background: visualIdentity.colors.red, color: visualIdentity.colors.white, fontFamily: "inherit", fontWeight: 900, cursor: confirmed && !loading ? "pointer" : "not-allowed", opacity: confirmed && !loading ? 1 : 0.45 }}>
              {loading ? t("actions.saving") : t("actions.confirm")}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
