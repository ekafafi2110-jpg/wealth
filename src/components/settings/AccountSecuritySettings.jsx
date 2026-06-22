import { CheckCircle2, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useState } from "react";
import visualIdentity from "../../theme/visualIdentity";
import { useLocale } from "../../i18n/locale";

function PasswordField({ label, value, onChange }) {
  const [visible, setVisible] = useState(false);
  return (
    <label style={{ display: "block", marginBottom: 12 }}>
      <span style={{ display: "block", marginBottom: 6, color: visualIdentity.colors.textSecondary, fontSize: 11 }}>{label}</span>
      <span style={{ display: "grid", gridTemplateColumns: "40px minmax(0,1fr)", gap: 7, direction: "ltr" }}>
        <button type="button" onClick={() => setVisible((valueNow) => !valueNow)} title={visible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"} aria-label={visible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"} style={{ width: 40, height: 42, borderRadius: 11, border: "1px solid rgba(255,255,255,0.16)", background: "rgba(255,255,255,0.08)", color: visualIdentity.colors.cyan, display: "grid", placeItems: "center", cursor: "pointer" }}>
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
        <input type={visible ? "text" : "password"} value={value} onChange={(event) => onChange(event.target.value)} autoComplete="new-password" style={{ minHeight: 42, margin: 0, direction: "ltr" }} />
      </span>
    </label>
  );
}

export default function AccountSecuritySettings({ email, onChangePassword }) {
  const { direction, t } = useLocale();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const rules = [
    [newPassword.length >= 8, "8 أحرف على الأقل"],
    [/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword), "حرف كبير وحرف صغير"],
    [/[0-9]/.test(newPassword) && /[^A-Za-z0-9]/.test(newPassword), "رقم ورمز خاص"],
  ];
  const valid = currentPassword && rules.every(([passed]) => passed) && newPassword === confirmPassword;

  const submit = async () => {
    setError("");
    setMessage("");
    if (!valid) {
      setError("تحقق من كلمة المرور الحالية وشروط كلمة المرور الجديدة");
      return;
    }
    setLoading(true);
    try {
      await onChangePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage(t("actions.saved"));
    } catch (changeError) {
      setError(changeError?.message || "تعذر تغيير كلمة المرور");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="asset-dashboard-card" style={{ padding: 14, direction, borderRadius: 18, border: visualIdentity.cards.outer.border, background: visualIdentity.gradients.outerCard, boxShadow: visualIdentity.cards.outer.boxShadow }}>
      <div style={{ width: 70, height: 70, margin: "2px auto 16px", borderRadius: "50%", display: "grid", placeItems: "center", color: visualIdentity.colors.cyan, border: `1px solid ${visualIdentity.colors.cyan}77`, background: "rgba(85,217,255,0.12)", boxShadow: "0 0 24px rgba(85,217,255,0.14)" }}>
        <LockKeyhole size={34} strokeWidth={1.7} />
      </div>
      <div style={{ marginBottom: 13, textAlign: "center", color: visualIdentity.colors.textSecondary, fontSize: 10 }}>{email}</div>
      <PasswordField label={t("settings.currentPassword")} value={currentPassword} onChange={setCurrentPassword} />
      <PasswordField label={t("settings.newPassword")} value={newPassword} onChange={setNewPassword} />
      <PasswordField label={t("settings.confirmPassword")} value={confirmPassword} onChange={setConfirmPassword} />
      <div style={{ padding: 10, marginBottom: 12, borderRadius: 13, border: "1px solid rgba(255,255,255,0.13)", background: "rgba(255,255,255,0.06)" }}>
        {rules.map(([passed, label]) => <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6, marginBottom: 5, color: passed ? visualIdentity.colors.green : visualIdentity.colors.textSecondary, fontSize: 10 }}><span>{label}</span><CheckCircle2 size={14} /></div>)}
      </div>
      {error && <div style={{ marginBottom: 9, color: visualIdentity.colors.red, fontSize: 10, textAlign: "center" }}>{error}</div>}
      {message && <div style={{ marginBottom: 9, color: visualIdentity.colors.green, fontSize: 10, textAlign: "center" }}>{message}</div>}
      <button type="button" disabled={loading || !valid} onClick={submit} style={{ width: "100%", minHeight: 46, border: 0, borderRadius: 14, background: visualIdentity.gradients.gold, color: visualIdentity.colors.navy, fontFamily: "inherit", fontWeight: 900, cursor: loading || !valid ? "not-allowed" : "pointer", opacity: loading || !valid ? 0.55 : 1 }}>
        {loading ? t("actions.saving") : t("actions.save")}
      </button>
    </section>
  );
}
