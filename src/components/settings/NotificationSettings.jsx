import { BellRing, Clock3, Gauge, LockKeyhole } from "lucide-react";
import { useState } from "react";
import visualIdentity from "../../theme/visualIdentity";
import {
  notificationPermission,
  requestNotificationPermission,
} from "../../notifications/appNotifications";

const rows = [
  { key: "budget", label: "تنبيهات سقف الصرف", meta: "عند 50% و70% و90% و100%", icon: Gauge, active: true },
  { key: "liabilities", label: "تذكير الالتزامات", meta: "قبل الاستحقاق بـ3 أيام وفي يومه", icon: Clock3, active: true },
  { key: "expenses", label: "تنبيهات المصروفات", meta: "قيد التجهيز", icon: BellRing, active: false },
  { key: "reports", label: "التقارير الأسبوعية", meta: "قيد التجهيز", icon: LockKeyhole, active: false },
];

export default function NotificationSettings({ values, onChange }) {
  const [permission, setPermission] = useState(notificationPermission());
  const [message, setMessage] = useState("");

  const toggle = async (row) => {
    if (!row.active) return;
    const preferred = values?.[row.key] ?? true;
    if (preferred && permission === "granted") {
      onChange(row.key, false);
      return;
    }
    let nextPermission = notificationPermission();
    if (nextPermission === "default") nextPermission = await requestNotificationPermission();
    setPermission(nextPermission);
    if (nextPermission !== "granted") {
      setMessage(nextPermission === "unsupported" ? "هذا المتصفح لا يدعم الإشعارات." : "يجب السماح بالإشعارات من إعدادات المتصفح أولاً.");
      return;
    }
    setMessage("");
    onChange(row.key, true);
  };

  return (
    <div className="asset-dashboard-card" style={{ borderRadius: 18, overflow: "hidden", border: visualIdentity.cards.outer.border, background: visualIdentity.gradients.outerCard, boxShadow: visualIdentity.cards.outer.boxShadow }}>
      <div style={{ padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.11)", color: permission === "granted" ? visualIdentity.colors.green : visualIdentity.colors.textSecondary, fontSize: 10, textAlign: "center" }}>
        {permission === "granted" ? "إذن الإشعارات مفعّل" : "سيُطلب إذن المتصفح عند تفعيل أول تنبيه"}
      </div>
      {rows.map((row, index) => {
        const enabled = row.active && permission === "granted" && (values?.[row.key] ?? true);
        const Icon = row.icon;
        return (
          <button key={row.key} type="button" role="switch" aria-checked={enabled} disabled={!row.active} onClick={() => toggle(row)} style={{ width: "100%", minHeight: 62, padding: "8px 11px", display: "grid", gridTemplateColumns: "42px minmax(0,1fr) 42px", alignItems: "center", gap: 9, border: 0, borderBottom: index < rows.length - 1 ? "1px solid rgba(255,255,255,0.11)" : 0, background: "transparent", color: visualIdentity.colors.white, fontFamily: "inherit", cursor: row.active ? "pointer" : "not-allowed", opacity: row.active ? 1 : 0.52, textAlign: "right" }}>
            <span style={{ width: 38, height: 38, borderRadius: 11, display: "grid", placeItems: "center", color: row.active ? visualIdentity.colors.cyan : visualIdentity.colors.textSecondary, border: "1px solid rgba(255,255,255,0.13)", background: "rgba(255,255,255,0.07)" }}><Icon size={18} /></span>
            <span><b style={{ display: "block", fontSize: 12 }}>{row.label}</b><small style={{ display: "block", marginTop: 3, color: visualIdentity.colors.textSecondary, fontSize: 9 }}>{row.meta}</small></span>
            <span style={{ width: 42, height: 24, borderRadius: 99, padding: 3, display: "flex", justifyContent: enabled ? "flex-end" : "flex-start", background: enabled ? visualIdentity.colors.green : "rgba(255,255,255,0.18)" }}><i style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff" }} /></span>
          </button>
        );
      })}
      {message && <div style={{ padding: 10, color: visualIdentity.colors.red, textAlign: "center", fontSize: 10 }}>{message}</div>}
    </div>
  );
}
