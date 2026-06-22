import {
  Bell,
  ChevronLeft,
  CircleUserRound,
  CreditCard,
  Database,
  Download,
  Globe2,
  Info,
  Settings2,
  Share2,
  ShieldCheck,
  Trash2,
  UserRound,
  WalletCards,
} from "lucide-react";
import visualIdentity from "../../theme/visualIdentity";
import { useLocale } from "../../i18n/locale";

const money = (value) => Number(value || 0).toFixed(2);

const iconColors = {
  gold: visualIdentity.colors.gold,
  cyan: visualIdentity.colors.cyan,
  green: visualIdentity.colors.green,
  purple: visualIdentity.colors.purple,
  red: visualIdentity.colors.red,
  sky: visualIdentity.colors.sky,
};

function IconBox({ icon: Icon, tone = "sky" }) {
  const color = iconColors[tone] || iconColors.sky;
  return (
    <span
      style={{
        width: 34,
        height: 34,
        borderRadius: 10,
        display: "grid",
        placeItems: "center",
        flex: "0 0 34px",
        color,
        border: `1px solid ${color}55`,
        background: `${color}18`,
        boxShadow: `inset 0 0 14px ${color}12`,
      }}
    >
      <Icon size={18} strokeWidth={1.9} />
    </span>
  );
}

function SettingsRow({ item, onNavigate, isLast }) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={() => onNavigate(item.view)}
      style={{
        width: "100%",
        minHeight: 54,
        padding: "8px 10px",
        display: "grid",
        gridTemplateColumns: "34px minmax(0,1fr) 18px",
        alignItems: "center",
        gap: 9,
        border: 0,
        borderBottom: isLast ? 0 : "1px solid rgba(255,255,255,0.11)",
        background: "transparent",
        color: item.tone === "red" ? visualIdentity.colors.red : visualIdentity.colors.white,
        fontFamily: "inherit",
        textAlign: "right",
        cursor: "pointer",
      }}
    >
      <IconBox icon={Icon} tone={item.tone} />
      <span style={{ minWidth: 0 }}>
        <b style={{ display: "block", fontSize: 12 }}>{item.label}</b>
        {item.meta && (
          <small style={{ display: "block", marginTop: 2, color: visualIdentity.colors.textSecondary, fontSize: 9 }}>
            {item.meta}
          </small>
        )}
      </span>
      <ChevronLeft size={17} color={visualIdentity.colors.textSecondary} />
    </button>
  );
}

function SettingsGroup({ title, icon: Icon, tone, items, onNavigate }) {
  return (
    <section style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7, color: iconColors[tone], fontSize: 13, fontWeight: 900 }}>
        <Icon size={17} />
        <span>{title}</span>
      </div>
      <div
        className="asset-dashboard-card"
        style={{
          borderRadius: 17,
          border: visualIdentity.cards.outer.border,
          background: "linear-gradient(145deg, rgba(46,105,166,0.72), rgba(16,61,116,0.88))",
          boxShadow: visualIdentity.cards.outer.boxShadow,
          overflow: "hidden",
        }}
      >
        {items.map((item, index) => (
          <SettingsRow key={item.view} item={item} onNavigate={onNavigate} isLast={index === items.length - 1} />
        ))}
      </div>
    </section>
  );
}

export default function SettingsDashboard({
  profileName,
  profileSubtitle,
  salary,
  structuralTotal,
  netSalary,
  cardsTotal,
  snapshotsCount,
  currencyLabel,
  onNavigate,
}) {
  const { direction, t } = useLocale();
  const groups = [
    {
      title: "الحساب",
      icon: CircleUserRound,
      tone: "cyan",
      items: [
        { view: "personal", label: t("settings.profile"), meta: t("settings.comingSoon"), icon: UserRound, tone: "cyan" },
        { view: "account", label: t("settings.account"), meta: t("settings.security"), icon: ShieldCheck, tone: "purple" },
      ],
    },
    {
      title: "المالية",
      icon: WalletCards,
      tone: "gold",
      items: [
        { view: "salary", label: t("settings.incomeLimit"), meta: `${money(salary)} / ${money(stateSafe(netSalary))} ${currencyLabel}`, icon: WalletCards, tone: "gold" },
        { view: "cards", label: t("liabilities.cards"), meta: `${money(cardsTotal)} ${currencyLabel}`, icon: CreditCard, tone: "red" },
      ],
    },
    {
      title: "البيانات",
      icon: Database,
      tone: "gold",
      items: [
        { view: "opening", label: t("settings.openingBalances"), meta: `${snapshotsCount}`, icon: Database, tone: "sky" },
        { view: "export", label: t("settings.export"), meta: "JSON / CSV", icon: Download, tone: "green" },
        { view: "reset", label: t("settings.reset"), meta: t("actions.confirm"), icon: Trash2, tone: "red" },
      ],
    },
    {
      title: "التطبيق",
      icon: Settings2,
      tone: "gold",
      items: [
        { view: "notifications", label: t("settings.notifications"), icon: Bell, tone: "sky" },
        { view: "locale", label: t("settings.locale"), meta: currencyLabel, icon: Globe2, tone: "cyan" },
        { view: "share", label: t("settings.share"), icon: Share2, tone: "purple" },
        { view: "about", label: t("settings.about"), icon: Info, tone: "sky" },
      ],
    },
  ];

  return (
    <div className="settings-dashboard-live" style={{ direction, color: visualIdentity.colors.white }}>
      <div style={{ marginBottom: 12 }}>
        <h1 style={{ margin: 0, fontSize: 25, fontWeight: 900 }}>{t("nav.settings")}</h1>
        <div style={{ marginTop: 3, color: visualIdentity.colors.textSecondary, fontSize: 10 }}>إدارة التطبيق والبيانات والحساب</div>
      </div>

      <button
        type="button"
        onClick={() => onNavigate("personal")}
        className="asset-dashboard-card"
        style={{
          width: "100%",
          padding: 14,
          marginBottom: 12,
          display: "grid",
          gridTemplateColumns: "74px minmax(0,1fr) 24px",
          alignItems: "center",
          gap: 12,
          borderRadius: 20,
          border: "1px solid rgba(98,206,255,0.48)",
          background: "linear-gradient(145deg, rgba(51,119,184,0.94), rgba(17,67,126,0.96))",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.16), 0 14px 30px rgba(0,25,58,0.28)",
          color: visualIdentity.colors.white,
          fontFamily: "inherit",
          textAlign: "right",
          cursor: "pointer",
        }}
      >
        <span style={{ width: 70, height: 70, borderRadius: "50%", display: "grid", placeItems: "center", border: `1px solid ${visualIdentity.colors.cyan}99`, background: "linear-gradient(145deg, rgba(121,208,255,0.34), rgba(36,92,155,0.38))", color: "#BDEBFF" }}>
          <CircleUserRound size={48} strokeWidth={1.5} />
        </span>
        <span>
          <b style={{ display: "block", fontSize: 19 }}>{profileName}</b>
          <span style={{ display: "block", marginTop: 4, color: visualIdentity.colors.textSecondary, fontSize: 11 }}>{profileSubtitle}</span>
        </span>
        <ChevronLeft size={22} />
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 8, marginBottom: 15 }}>
        {[
          ["الراتب", salary, visualIdentity.colors.gold],
          ["الأقساط", structuralTotal, visualIdentity.colors.red],
          ["الصافي", netSalary, visualIdentity.colors.green],
        ].map(([label, value, color]) => (
          <div key={label} className="asset-dashboard-card" style={{ padding: "10px 7px", borderRadius: 14, textAlign: "center", border: `1px solid ${color}55`, background: `linear-gradient(145deg, ${color}22, rgba(26,72,129,0.88))` }}>
            <div style={{ color: visualIdentity.colors.textSecondary, fontSize: 9 }}>{label}</div>
            <b style={{ display: "block", marginTop: 4, color, fontSize: 16 }}>{money(value)} <small style={{ fontSize: 8 }}>{currencyLabel}</small></b>
          </div>
        ))}
      </div>

      {groups.map((group) => <SettingsGroup key={group.title} {...group} onNavigate={onNavigate} />)}

    </div>
  );
}

function stateSafe(value) {
  return Math.max(0, Number(value || 0));
}
