import { useEffect, useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { INITIAL_STATE } from "./data/initialState";
import { recordExpense } from "./logic/expenses";
import {
  authErrorMessage,
  getSessionFromUrl,
  resetPasswordForEmail,
  signInWithPassword,
  signUpWithPassword,
} from "./storage/supabaseAuth";
import { loadState, saveState, clearState } from "./storage/supabaseStorage";
import {
  calcAssets,
  calcBudget,
  calcStructuralTotal,
} from "./logic/calculations";
import {
  getAssetSources,
  addToAsset,
  deductFromAsset,
  transferBetweenAssets,
} from "./logic/assets";
const CATS = ["طعام", "مواصلات", "تسوق", "صحة", "ترفيه", "فواتير", "بنزين", "أخرى"];

const CAT_ICONS = {
  طعام: "🍽️",
  مواصلات: "🚗",
  تسوق: "🛒",
  صحة: "💚",
  ترفيه: "🎮",
  فواتير: "🧾",
  بنزين: "⛽",
  أخرى: "•••",
};
const CC = {
  طعام: "#E8A44A",
  مواصلات: "#A78BF5",
  تسوق: "#F5C96A",
  صحة: "#F07A7A",
  ترفيه: "#60C698",
  فواتير: "#7BBFF5",
  بنزين: "#E8A44A",
  ملابس: "#7BBFF5",
هدايا: "#A78BF5",
قرطاسية: "#F5C96A",
"أقساط مدارس": "#F5C96A",
"صيانة سيارة": "#E8A44A",
"صيانة بيت": "#60C698",
  أخرى: "#B0A080",
};

const ICONS = {
  cash: "💵",
  bank: "🏦",
  stock: "📊",
  gold: "🥇",
  silver: "🪙",
  goods: "📦",
  income: "+",
  transfer: "⇄",
};

const CATEGORY_TILE_STYLE = {
  طعام: { bg: "#FFF0D5", icon: "#E8A44A" },
  ترفيه: { bg: "#EDF9F3", icon: "#60C698" },
  فواتير: { bg: "#EEF5FE", icon: "#7BBFF5" },
  صحة: { bg: "#FFF0F0", icon: "#F07A7A" },
  مواصلات: { bg: "#F3F0FF", icon: "#A78BF5" },
};

const getCategoryTileStyle = (category) =>
  CATEGORY_TILE_STYLE[category] || { bg: "var(--gold-light)", icon: "var(--gold-dark)" };

const SUMMARY_CARD_STYLE = {
  total: {
    background: "#FFFBF0",
    border: "1.5px solid var(--gold-border)",
    value: "var(--gold-dark)",
  },
  danger: {
    background: "var(--red-bg)",
    border: "1.5px solid var(--red-border)",
    value: "#D95555",
  },
  success: {
    background: "var(--green-bg)",
    border: "1.5px solid var(--green-border)",
    value: "#2A9E60",
  },
};

const summaryCard = (type) => ({
  background: SUMMARY_CARD_STYLE[type].background,
  border: SUMMARY_CARD_STYLE[type].border,
  borderRadius: 14,
  padding: "11px 10px",
  textAlign: "center",
});

const summaryValue = (type) => ({
  color: SUMMARY_CARD_STYLE[type].value,
  fontSize: 17,
  fontWeight: 800,
  fontVariantNumeric: "tabular-nums",
});

const labelText = {
  fontSize: 10,
  fontWeight: 700,
  color: "var(--text-muted)",
};

const sectionHeading = {
  fontSize: 12,
  fontWeight: 800,
  color: "var(--text-heading)",
};

const G = {
  app: {
    minHeight: "100vh",
    background: "var(--bg-page)",
    fontFamily: "'Tajawal', sans-serif",
    direction: "rtl",
    color: "var(--text-body)",
    maxWidth: 440,
    margin: "0 auto",
    position: "relative",
    paddingBottom: 82,
  },
  hdr: {
    background: "linear-gradient(135deg, var(--bg-card) 0%, #FDF5E6 100%)",
    borderBottom: "1px solid var(--border-soft)",
    padding: "14px 16px 0",
    position: "sticky",
    top: 0,
    zIndex: 50,
  },
  scr: { padding: "14px" },
  iconBtn: (active, color = "var(--gold-primary)") => ({
    width: 42,
    height: 42,
    borderRadius: 12,
    border: active ? `1px solid ${color}` : "1px solid var(--border-soft)",
    background: active ? "var(--gold-light)" : "var(--bg-card)",
    color,
    cursor: "pointer",
    fontSize: 17,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }),
  card: () => ({
    background: "var(--bg-card)",
    borderRadius: 18,
    border: "1px solid var(--border-soft)",
    padding: "14px 16px",
    marginBottom: 14,
    color: "var(--text-body)",
    fontFamily: "inherit",
    fontSize: 14,
    boxShadow: "none",
  }),
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid var(--border-soft)",
    color: "var(--text-body)",
    fontSize: 13,
  },
  lrow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    color: "var(--text-body)",
    fontSize: 13,
  },
  btn: (bg, col = "#fff", ex = {}) => ({
    background: bg,
    border: bg === "transparent" ? "1.5px solid var(--gold-border)" : "none",
    borderRadius: 12,
    padding: bg === "transparent" ? "9px 18px" : "10px 20px",
    color: String(bg).includes("gold-primary") ? "#fff" : bg === "transparent" ? "var(--gold-dark)" : col,
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "opacity 0.15s ease",
    ...ex,
  }),
  inp: (w = "100%") => ({
    width: w,
    background: "var(--bg-secondary)",
    border: "1px solid var(--border-soft)",
    borderRadius: 10,
    padding: "10px 12px",
    color: "var(--text-body)",
    fontSize: 14,
    fontFamily: "inherit",
    textAlign: "right",
    outline: "none",
  }),
};

const NAV_ICONS = {
  overview: (
    <path d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1v-8.5Z" />
  ),
  reports: (
    <>
      <path d="M5 19V9" />
      <path d="M12 19V5" />
      <path d="M19 19v-7" />
      <path d="M4 19h16" />
    </>
  ),
  assets: (
    <>
      <path d="M4 8.5 12 4l8 4.5-8 4.5L4 8.5Z" />
      <path d="m4 13 8 4.5L20 13" />
      <path d="m4 17 8 4.5L20 17" />
    </>
  ),
  liabilities: (
    <>
      <path d="M6 4h12v16H6z" />
      <path d="M9 8h6" />
      <path d="M9 12h6" />
      <path d="M9 16h3" />
    </>
  ),
  settings: (
    <>
      <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.05.05a2 2 0 0 1-2.83 2.83l-.05-.05A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 1.55V21a2 2 0 0 1-4 0v-.05A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.88.34l-.05.05a2 2 0 1 1-2.83-2.83l.05-.05A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3a2 2 0 0 1 0-4h.05A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.88l-.05-.05a2 2 0 1 1 2.83-2.83l.05.05A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.55V3a2 2 0 0 1 4 0v.05A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.88-.34l.05-.05a2 2 0 1 1 2.83 2.83l-.05.05A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 1.55 1H21a2 2 0 0 1 0 4h-.05A1.7 1.7 0 0 0 19.4 15Z" />
    </>
  ),
};

function NavIcon({ id, active = false }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={active ? "21" : "20"}
      height={active ? "21" : "20"}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? "2" : "1.85"}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {NAV_ICONS[id] || NAV_ICONS.overview}
    </svg>
  );
}

function FloatingBottomBar({ tabs, activeTab, onSelect }) {
  return (
    <nav
      aria-label="التنقل الرئيسي"
      style={{
        position: "fixed",
        left: "50%",
        bottom: 0,
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 440,
        zIndex: 520,
        direction: "rtl",
        background: "var(--bg-card)",
        borderTop: "1px solid var(--border-soft)",
        padding: "4px 0 calc(1px + env(safe-area-inset-bottom))",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          justifyContent: "space-around",
        }}
      >
        {tabs.map((item) => {
          const active = item.id === activeTab;

          return (
            <button
              key={item.id}
              type="button"
              aria-label={item.label}
              title={item.label}
              aria-current={active ? "page" : undefined}
              onClick={() => onSelect(item.id)}
              style={{
                position: "relative",
                flex: "1 1 0",
                border: "none",
                borderTop: active ? "2.5px solid #FACC15" : "2.5px solid transparent",
                marginTop: active ? -2.5 : 0,
                background: active
                  ? "linear-gradient(180deg, rgba(254,249,195,0.95), rgba(255,253,248,0))"
                  : "transparent",
                color: "#211A12",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                minWidth: 0,
                minHeight: 44,
                padding: "3px 2px 2px",
                transition: "color 0.18s ease, border-color 0.18s ease, background 0.18s ease, opacity 0.15s ease",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {active && (
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: -3,
                    left: "50%",
                    width: 36,
                    height: 28,
                    transform: "translateX(-50%)",
                    background:
                      "radial-gradient(circle at 50% 0%, rgba(250,204,21,0.58), rgba(250,204,21,0.22) 42%, rgba(250,204,21,0) 72%)",
                    pointerEvents: "none",
                  }}
                />
              )}
              {active && (
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "50%",
                    width: 24,
                    height: 3,
                    borderRadius: 99,
                    transform: "translateX(-50%)",
                    background: "#FACC15",
                    boxShadow: "0 0 12px rgba(250,204,21,0.9)",
                    pointerEvents: "none",
                  }}
                />
              )}
              <span
                style={{
                  position: "relative",
                  zIndex: 1,
                  color: active ? "#111111" : "#2B2418",
                  filter: active ? "drop-shadow(0 0 5px rgba(250,204,21,0.52))" : "none",
                  lineHeight: 1,
                }}
              >
                <NavIcon id={item.id} active={active} />
              </span>
              <span
                style={{
                  position: "relative",
                  zIndex: 1,
                  color: active ? "#111111" : "#2B2418",
                  fontSize: 8.5,
                  fontWeight: 800,
                  lineHeight: 1.15,
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function Tag({ label, col }) {
  return (
    <span
      style={{
        fontSize: 10,
        padding: "2px 8px",
        borderRadius: 99,
        background: `${col}22`,
        color: col,
        fontWeight: 700,
      }}
    >
      {label}
    </span>
  );
}

function SpendBar({ spent, cap }) {
  const pct = cap > 0 ? Math.min(100, Math.round((spent / cap) * 100)) : 0;
  const col = pct >= 100 ? "#F07A7A" : pct >= 70 ? "#E8A44A" : "#60C698";

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          marginBottom: 5,
        }}
      >
        <span style={{ color: "var(--text-faint)" }}>
          {spent.toFixed(2)} / {cap.toFixed(2)} د.أ
        </span>
        <span style={{ color: col, fontWeight: 700 }}>{pct}%</span>
      </div>
      <div
        style={{
          background: "var(--bg-secondary)",
          borderRadius: 4,
          height: 7,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: col,
            borderRadius: 4,
          }}
        />
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "غير محدد";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("ar-JO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

const incomeEntryStyle = (isIncome) =>
  isIncome
    ? {
        background: "var(--green-bg)",
        border: "1px solid var(--green-border)",
        borderRadius: 12,
        padding: "9px 10px",
        marginBottom: 8,
      }
    : null;

const incomeEntryAmount = (entry) =>
  Number(entry?.isIncomeEntry ? entry.originalAmount || 0 : entry?.amount || 0);

const incomeEntryMeta = (entry) =>
  entry?.isIncomeEntry
    ? "دخل إلى سقف الصرف"
    : `مغطى: ${Number(entry?.budgetCovered || 0).toFixed(2)} | تجاوز: ${Number(
        entry?.overBudget || 0
      ).toFixed(2)}`;

function assetBreakdownFromAssets(assets = {}, market = {}) {
  const goldPrice = Number(market.goldGramPrice || 0);
  const silverPrice = Number(market.silverGramPrice || 0);
  const rows = [];

  rows.push({
    key: "cash",
    label: "كاش ادخار",
    value: Number(assets.cash || 0),
  });

  (assets.banks || []).forEach((item) =>
    rows.push({
      key: `bank:${item.id}`,
      label: item.name || "حساب بنكي",
      value: Number(item.balance || 0),
    })
  );

  (assets.gold || []).forEach((item) =>
    rows.push({
      key: `gold:${item.id}`,
      label: item.label || "ذهب",
      value: Number(item.units || 0) * goldPrice,
    })
  );

  (assets.silver || []).forEach((item) =>
    rows.push({
      key: `silver:${item.id}`,
      label: item.label || "فضة",
      value: Number(item.units || 0) * silverPrice,
    })
  );

  (assets.stocks || []).forEach((item) =>
    rows.push({
      key: `stock:${item.id}`,
      label: item.name || "سهم",
      value: Number(item.units || 0) * Number(item.currentPrice || 0),
    })
  );

  (assets.custom || []).forEach((item) =>
    rows.push({
      key: `custom:${item.id}`,
      label: item.name || "أصل",
      value:
        item.type === "fixed"
          ? Number(item.amount || 0)
          : Number(item.units || 0) * Number(item.price || 0),
    })
  );

  return rows;
}

function summarizeAssetReasons(state, month) {
  const labels = {
    over_budget_covered_from_asset: "تجاوز سقف",
    emergency_expense_covered_from_asset: "مصروف طارئ",
    expense_paid_from_asset: "مصروف من أصل",
    liability_paid_from_asset: "سداد التزام",
  };
  const transferLabels = {
    transfer_out: "مناقلة بين الأصول",
    transfer_to_spending_cap: "مناقلة إلى السقف",
    transfer_to_cash: "مناقلة بين الأصول",
    transfer_to_bank: "مناقلة بين الأصول",
    transfer_in_units: "مناقلة بين الأصول",
  };
  const totals = {};
  const transfers = {};

  const add = (reason, amount) => {
    const value = Number(amount || 0);
    if (!reason || value <= 0) return;
    totals[reason] = Number((Number(totals[reason] || 0) + value).toFixed(2));
  };
  const addTransfer = (reason, amount) => {
    const value = Number(amount || 0);
    if (!reason || value <= 0) return;
    transfers[reason] = Number((Number(transfers[reason] || 0) + value).toFixed(2));
  };

  (state.transactions || []).forEach((tx) => {
    if (getMonthKey(tx.date) !== month) return;
    add(labels[tx.type], tx.amount);
    addTransfer(transferLabels[tx.type], tx.amount);
  });

  (state.assetHistory || []).forEach((tx) => {
    if (getMonthKey(tx.date) !== month) return;
    add(labels[tx.type], tx.amount);
    addTransfer(transferLabels[tx.type], tx.amount);
  });

  return {
    real: Object.entries(totals).map(([reason, amount]) => ({ reason, amount })),
    transfers: Object.entries(transfers).map(([reason, amount]) => ({ reason, amount })),
  };
}

function buildAssetComparisons(points, state) {
  return points.slice(1).map((point, index) => {
    const previous = points[index];
    const before = new Map((previous.breakdown || []).map((item) => [item.key, item]));
    const after = new Map((point.breakdown || []).map((item) => [item.key, item]));
    const keys = Array.from(new Set([...before.keys(), ...after.keys()]));

    const changes = keys
      .map((key) => {
        const prev = before.get(key);
        const next = after.get(key);
        const change = Number(next?.value || 0) - Number(prev?.value || 0);
        return {
          key,
          label: next?.label || prev?.label || "أصل",
          change,
        };
      })
      .filter((item) => Math.abs(item.change) >= 0.01)
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

    return {
      month: point.month,
      totalChange: Number(point.totalAssets || 0) - Number(previous.totalAssets || 0),
      changes,
      reasons: summarizeAssetReasons(state, point.month),
    };
  });
}

function ExpenseDonut({ expenses, mode = "donut" }) {
  const expenseCats = Array.from(
  new Set((expenses || []).map((e) => e.category).filter(Boolean))
);

const grouped = expenseCats.map((cat) => ({
  name: cat,
  value: (expenses || [])
    .filter((e) => e.category === cat)
    .reduce((sum, e) => sum + Number(e.amount || 0), 0),
  color: CC[cat] || "var(--text-muted)",
  })).filter((x) => x.value > 0);
  const total = grouped.reduce((sum, x) => sum + x.value, 0);
  const sortedGrouped = [...grouped].sort((a, b) => b.value - a.value);

  if (!grouped.length) {
    return (
      <div
        style={{
          textAlign: "center",
          color: "var(--text-disabled)",
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
            <div key={item.name} style={{ textAlign: "right" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                <span style={{ color: item.color, fontSize: 11, fontWeight: 900 }}>
                  {item.value.toFixed(2)}
                </span>
                <span style={{ color: "var(--text-body)", fontSize: 12 }}>
                  {item.name} · {pct}%
                </span>
              </div>
              <div style={{ height: 7, background: "var(--bg-secondary)", borderRadius: 4, overflow: "hidden" }}>
                <div
                  style={{
                    width: `${width}%`,
                    height: "100%",
                    background: item.color,
                    borderRadius: 4,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div>
      <div style={{ height: 180, position: "relative" }}>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={grouped}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={80}
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
          <div style={{ fontSize: 17, fontWeight: 800, color: "var(--gold-dark)", fontVariantNumeric: "tabular-nums" }}>
            {total.toFixed(0)}
          </div>
          <div style={{ fontSize: 9, color: "var(--text-faint)" }}>د.أ</div>
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
            <span style={{ color: "var(--text-body)", fontSize: 12, fontWeight: 700 }}>
              {total ? Math.round((d.value / total) * 100) : 0}%
            </span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{d.name}</span>
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

function rebalanceCurrentLiabilityCoverage(state) {
  const next = structuredClone(state);
  const currentLiabilities = next.currentLiabilities || [];
  let availableCap = Math.max(
    0,
    Number(next.session?.spendingCap || 0) -
      Number(next.session?.coveredSpent || 0)
  );

  if (availableCap <= 0 || !currentLiabilities.length) return next;

  const dueValue = (item) => {
    if (item.dueDate) {
      const time = new Date(item.dueDate).getTime();
      if (Number.isFinite(time)) return time;
    }
    return Number(item.dueDay || 31);
  };

  const ordered = [...currentLiabilities]
    .filter((item) => item.status !== "paid")
    .sort((a, b) => dueValue(a) - dueValue(b));

  for (const item of ordered) {
    if (availableCap <= 0) break;

    const balance = Number(
      item.type === "card" ? item.balance || 0 : item.balance || item.amount || 0
    );
    const covered = Math.max(0, Number(item.payableBuffer || 0));
    const uncovered = Math.min(
      Math.max(0, Number(item.uncoveredDebt || 0)),
      Math.max(0, balance - covered)
    );
    const coverable = Math.max(0, Math.min(uncovered, balance - covered));
    const moveAmount = Math.min(availableCap, coverable);

    if (moveAmount <= 0) continue;

    item.payableBuffer = Number((covered + moveAmount).toFixed(2));
    item.uncoveredDebt = Number((uncovered - moveAmount).toFixed(2));
    availableCap = Number((availableCap - moveAmount).toFixed(2));
    next.session.coveredSpent = Number(
      (Number(next.session?.coveredSpent || 0) + moveAmount).toFixed(2)
    );
    next.session.overBudgetSpent = Math.max(
      0,
      Number((Number(next.session?.overBudgetSpent || 0) - moveAmount).toFixed(2))
    );
  }

  return next;
}

function Overview({
  state,
  setState,
  onOpenReports,
  onOpenDueLiabilities,
  onAllocateSurplus,
  readOnly = false,
}) {
  const budget = calcBudget(state);
  const [showExpense, setShowExpense] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("طعام");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [cardId, setCardId] = useState("");
  const [note, setNote] = useState("");
  const [liabilityName, setLiabilityName] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [overBudgetSource, setOverBudgetSource] = useState("liability");
const [overBudgetAssetKey, setOverBudgetAssetKey] = useState("cash");
const [overBudgetLiabilityName, setOverBudgetLiabilityName] = useState("تجاوز سقف الصرف");
const [overBudgetDueDate, setOverBudgetDueDate] = useState("");
const [isUnusualExpense, setIsUnusualExpense] = useState(false);
const [showUnusualPicker, setShowUnusualPicker] = useState(false);
const [unusualFundingMode, setUnusualFundingMode] = useState("asset");
const [unusualCapAmount, setUnusualCapAmount] = useState("");
const [unusualRemainderSource, setUnusualRemainderSource] = useState("asset");
const [unusualAssetKey, setUnusualAssetKey] = useState("cash");
const [unusualLiabilityName, setUnusualLiabilityName] = useState("مصروف غير اعتيادي");
const [unusualDueDate, setUnusualDueDate] = useState("");
const [assetPaymentKey, setAssetPaymentKey] = useState("cash");
  const cards = state.currentLiabilities.filter((x) => x.type === "card");
  const recent = [...state.expenses].slice(-3).reverse();
  const dueCurrentLiabilities = (state.currentLiabilities || []).filter((l) => {
  if (!l.dueDate || l.status === "paid") return false;

  const due = new Date(l.dueDate);
  const now = new Date();

  return (
    due.getFullYear() === now.getFullYear() &&
    due.getMonth() === now.getMonth()
  );
});
  const assetSources = getAssetSources(state);
  const defaultExpenseCategories = [
  { id: "food", label: "طعام", icon: "🍽️", color: "#f59e0b", pinned: true },
  { id: "transport", label: "مواصلات", icon: "🚗", color: "#3b82f6", pinned: true },
  { id: "shopping", label: "تسوق", icon: "🛒", color: "#a855f7", pinned: true },
  { id: "health", label: "صحة", icon: "💚", color: "#22c55e", pinned: true },
  { id: "entertainment", label: "ترفيه", icon: "🎮", color: "#ec4899", pinned: true },
  { id: "bills", label: "فواتير", icon: "🧾", color: "var(--text-faint)", pinned: true },
  { id: "fuel", label: "بنزين", icon: "⛽", color: "#f97316", pinned: true },
  { id: "other", label: "أخرى", icon: "•••", color: "var(--text-muted)", isOther: true, pinned: true },
];

const savedExpenseCategories =
  state.expenseCategories?.items ||
  [
    ...(state.expenseCategories?.main || []),
    ...(state.expenseCategories?.extra || []),
  ];

const allExpenseCategories = [
  ...defaultExpenseCategories.map((base) => {
    const saved = savedExpenseCategories.find((item) => item.id === base.id);
    return saved ? { ...base, ...saved } : base;
  }),
  ...savedExpenseCategories.filter(
    (saved) =>
      !defaultExpenseCategories.some((base) => base.id === saved.id)
  ),
];

const pinnedExpenseCategories = allExpenseCategories
  .filter((cat) => cat.pinned && !cat.isOther)
  .slice(0, 12);

const otherExpenseCategory =
  allExpenseCategories.find((cat) => cat.isOther) || {
    id: "other",
    label: "أخرى",
    icon: "•••",
    color: "var(--text-muted)",
    isOther: true,
    pinned: true,
  };

const mainExpenseCategories = pinnedExpenseCategories;
  const enteredAmount = Number(amount || 0);
  const selectedExpenseTotal = Number(
    selectedExpense?.originalAmount ?? selectedExpense?.amount ?? 0
  );
  const selectedExpenseRecorded = Number(selectedExpense?.amount || 0);
  const selectedExpenseDebt = Number(
    selectedExpense?.emergencyFunding?.liabilityAmount || 0
  );
  const selectedExpenseAsset = Number(
    selectedExpense?.emergencyFunding?.assetAmount || 0
  );
const hasSpendingCap = Number(budget.remainingCap || 0) > 0;
const expectedOverBudget = ["emergency", "asset"].includes(paymentMethod) ? 0 : Math.max(
  0,
  enteredAmount - Number(budget.remainingCap || 0)
);

useEffect(() => {
  if (!hasSpendingCap && paymentMethod === "cash") {
    setPaymentMethod("asset");
  }

  if (!hasSpendingCap && unusualFundingMode === "mix") {
    setUnusualFundingMode("asset");
  }
}, [hasSpendingCap, paymentMethod, unusualFundingMode]);

  const submitExpense = () => {
    if (paymentMethod === "liability" && !dueDate) {
  alert("أدخل تاريخ استحقاق الدين المباشر");
  return;
}
    if (paymentMethod === "card") {
      const selectedCard = cards.find((card) => String(card.id) === String(cardId));
      if (!selectedCard) {
        alert("اختر بطاقة صحيحة");
        return;
      }

      const creditLimit = Number(selectedCard.creditLimit || 0);
      const nextCardBalance =
        Number(selectedCard.balance || 0) + Number(amount || 0);

      if (creditLimit > 0 && nextCardBalance > creditLimit) {
        alert("المبلغ يتجاوز سقف البطاقة");
        return;
      }
    }
    if (paymentMethod === "asset" && !assetPaymentKey) {
      alert("اختر الأصل الذي سيدفع المصروف");
      return;
    }
    if (paymentMethod === "emergency") {
      if (!unusualFundingMode) {
        alert("اختر طريقة تمويل المصروف الطارئ");
        return;
      }

      const emergencyCapAmount =
        unusualFundingMode === "mix" ? Number(unusualCapAmount || 0) : 0;
      const emergencyRemainder = Number(amount || 0) - emergencyCapAmount;
      const needsEmergencyAsset =
        unusualFundingMode === "asset" ||
        (unusualFundingMode === "mix" && unusualRemainderSource === "asset");
      const needsEmergencyLiability =
        unusualFundingMode === "liability" ||
        (unusualFundingMode === "mix" && unusualRemainderSource === "liability");

      if (unusualFundingMode === "mix") {
        if (emergencyCapAmount <= 0 || emergencyCapAmount >= Number(amount || 0)) {
          alert("أدخل جزءًا صحيحًا من سقف الصرف، أقل من مبلغ المصروف");
          return;
        }

        if (emergencyCapAmount > Number(budget.remainingCap || 0)) {
          alert(`المتاح من سقف الصرف فقط ${Number(budget.remainingCap || 0).toFixed(2)} د.أ`);
          return;
        }

        if (emergencyRemainder <= 0) {
          alert("باقي المصروف غير صحيح");
          return;
        }
      }

      if (needsEmergencyAsset && !unusualAssetKey) {
        alert("اختر الأصل الذي سيموّل المصروف الطارئ");
        return;
      }

      if (needsEmergencyLiability && !unusualDueDate) {
        alert("أدخل تاريخ استحقاق دين المصروف الطارئ");
        return;
      }
    }
    if (expectedOverBudget > 0) {
  if (
  paymentMethod === "cash" &&
  overBudgetSource === "liability" &&
  !overBudgetDueDate
) {
  alert("أدخل تاريخ استحقاق الدين الإضافي الناتج عن العجز");
  return;
}

  const ok = window.confirm(
    `هذا المصروف يتجاوز سقف الصرف بمبلغ ${expectedOverBudget.toFixed(
      2
    )} د.أ. هل تريد المتابعة؟`
  );

  if (!ok) return;
}

    const result = recordExpense(state, {
      amount: Number(amount || 0),
      category,
      paymentMethod,
      cardId,
      note,
      liabilityName,
      dueDate,
      assetKey: assetPaymentKey,
      emergencyFunding:
        paymentMethod === "emergency"
          ? {
              mode: unusualFundingMode,
              capAmount:
                unusualFundingMode === "mix" ? Number(unusualCapAmount || 0) : 0,
              remainderSource: unusualRemainderSource,
              assetKey: unusualAssetKey,
              liabilityName: unusualLiabilityName,
              dueDate: unusualDueDate,
            }
          : null,
    });

    if (!result.success) {
      alert(result.message);
      return;
    }

    let nextState = result.nextState;

const lastExpense =
  nextState.expenses[nextState.expenses.length - 1];

if (lastExpense?.overBudget > 0 && paymentMethod !== "emergency") {
  if (paymentMethod !== "card" && paymentMethod !== "liability") {
    if (overBudgetSource === "asset") {
      const deduction = deductFromAsset(
        nextState,
        overBudgetAssetKey,
        lastExpense.overBudget
      );

      if (!deduction.success) {
        alert(deduction.message);
        return;
      }

      nextState = deduction.nextState;

      nextState.transactions.push({
        id: Date.now(),
        type: "over_budget_covered_from_asset",
        amount: lastExpense.overBudget,
        assetKey: overBudgetAssetKey,
        expenseId: lastExpense.id,
        date: new Date().toISOString(),
      });
    }

    if (overBudgetSource === "liability") {
nextState.currentLiabilities.push({
  id: Date.now(),
  type: "over_budget",
  name: overBudgetLiabilityName || "تجاوز سقف الصرف",
  amount: Number(lastExpense.overBudget || 0),
  dueDate: overBudgetDueDate || "",
  dueDay: overBudgetDueDate
    ? new Date(overBudgetDueDate).getDate()
    : 1,
  status: "pending",
  source: "over_budget_expense",
  expenseId: lastExpense.id,
});
      nextState.transactions.push({
        id: Date.now() + 1,
        type: "over_budget_added_as_liability",
        amount: lastExpense.overBudget,
        expenseId: lastExpense.id,
        date: new Date().toISOString(),
      });
    }
  }

  alert(
    `تنبيه: تجاوزت سقف الصرف بمبلغ ${lastExpense.overBudget.toFixed(
      2
    )} د.أ في هذه العملية.`
  );
}

setState(nextState);
    setShowExpense(false);

    setAmount("");
    setCategory("طعام");
    setPaymentMethod("cash");
    setCardId("");
    setNote("");
    setLiabilityName("");
    setDueDate("");
setOverBudgetSource("liability");
setOverBudgetAssetKey("cash");
setAssetPaymentKey("cash");
setOverBudgetLiabilityName("تجاوز سقف الصرف");
setOverBudgetDueDate("");
setIsUnusualExpense(false);
setShowUnusualPicker(false);
setUnusualFundingMode("asset");
setUnusualCapAmount("");
setUnusualRemainderSource("asset");
setUnusualAssetKey("cash");
setUnusualLiabilityName("مصروف طارئ");
setUnusualDueDate("");
  };
  function cancelExpense(expenseId) {
  const ok = window.confirm("هل تريد إلغاء هذا المصروف وعكس أثره المالي؟");
  if (!ok) return;

  setState((prev) => {
    const expense = (prev.expenses || []).find((e) => e.id === expenseId);
    if (!expense) return prev;

    let next = structuredClone(prev);

    const amount = Number(expense.amount || 0);
    const budgetCovered = Number(expense.budgetCovered || 0);
    const overBudget = Number(expense.overBudget || 0);

    next.expenses = (next.expenses || []).filter((e) => e.id !== expenseId);

    next.session = {
      ...next.session,
      coveredSpent: Math.max(
        0,
        Number((Number(next.session?.coveredSpent || 0) - budgetCovered).toFixed(2))
      ),
      overBudgetSpent: Math.max(
        0,
        Number((Number(next.session?.overBudgetSpent || 0) - overBudget).toFixed(2))
      ),
    };

    if (expense.paymentMethod === "card") {
      const card = (next.currentLiabilities || []).find(
        (x) => x.id === Number(expense.cardId) && x.type === "card"
      );

      if (card) {
        card.balance = Math.max(
          0,
          Number((Number(card.balance || 0) - amount).toFixed(2))
        );
        card.payableBuffer = Math.max(
          0,
          Number((Number(card.payableBuffer || 0) - budgetCovered).toFixed(2))
        );
        card.uncoveredDebt = Math.max(
          0,
          Number(
            Math.min(
              Number(card.uncoveredDebt || 0) - overBudget,
              Number(card.balance || 0) - Number(card.payableBuffer || 0)
            ).toFixed(2)
          )
        );

        if (Number(card.balance || 0) <= 0) {
          card.status = "paid";
        }
      }
    }

    next.currentLiabilities = (next.currentLiabilities || []).filter(
      (l) =>
        l.expenseId !== expenseId ||
        (l.type !== "direct_liability" && l.type !== "over_budget")
    );

    const assetCoverageTx = (next.transactions || []).find(
      (tx) =>
        tx.expenseId === expenseId &&
        (tx.type === "over_budget_covered_from_asset" ||
          tx.type === "emergency_expense_covered_from_asset" ||
          tx.type === "expense_paid_from_asset")
    );

    if (assetCoverageTx?.assetKey && Number(assetCoverageTx.amount || 0) > 0) {
      next = addToAsset(
        next,
        assetCoverageTx.assetKey,
        Number(assetCoverageTx.amount || 0)
      );
    }

    next.transactions = (next.transactions || []).filter(
      (tx) => tx.expenseId !== expenseId
    );

    next = rebalanceCurrentLiabilityCoverage(next);

    next.transactions.push({
      id: Date.now(),
      type: "expense_cancelled",
      amount,
      expenseId,
      date: new Date().toISOString(),
    });

    return next;
  });
}
function getExpenseCategoryIconByName(name) {
  const text = String(name || "").trim().toLowerCase();

  const rules = [
    { words: ["مدرس", "مدارس", "تعليم", "دراسة", "جامعة", "روضة"], icon: "🏫" },
    { words: ["سيارة", "سياره", "صيانة سيارة", "كراج", "ميكانيك"], icon: "🚗" },
    { words: ["بيت", "منزل", "شقة", "ايجار", "إيجار", "صيانة بيت"], icon: "🏠" },
    { words: ["مطعم", "مطاعم", "اكل", "أكل", "غداء", "عشاء", "فطور"], icon: "🍽️" },
    { words: ["قهوة", "كوفي", "كافيه", "شاي"], icon: "☕" },
    { words: ["ملابس", "لبس", "حذاء", "أحذية", "احذية"], icon: "👕" },
    { words: ["هدية", "هدايا", "مناسبة", "عيد"], icon: "🎁" },
    { words: ["دواء", "علاج", "طبيب", "مستشفى", "صيدلية", "أسنان", "اسنان"], icon: "💊" },
    { words: ["بنزين", "وقود", "ديزل"], icon: "⛽" },
    { words: ["فاتورة", "فواتير", "كهرباء", "ماء", "انترنت", "جوال", "هاتف"], icon: "🧾" },
    { words: ["سفر", "رحلة", "فندق", "طيران", "تذاكر"], icon: "✈️" },
    { words: ["ترفيه", "سينما", "لعب", "العاب", "ألعاب"], icon: "🎮" },
    { words: ["مواصلات", "تاكسي", "اوبر", "أوبر", "كريم", "باص"], icon: "🚕" },
    { words: ["تسوق", "شراء", "سوق", "طلبات"], icon: "🛒" },
    { words: ["اشتراك", "نتفلكس", "شاهد", "تطبيق", "برنامج"], icon: "📱" },
    { words: ["رياضة", "نادي", "جيم", "سباحة"], icon: "🏋️" },
    { words: ["حلاق", "صالون", "تجميل"], icon: "💈" },
    { words: ["تبرع", "صدقة", "زكاة"], icon: "🤲" },
  ];

  const matchedRule = rules.find((rule) =>
    rule.words.some((word) => text.includes(word))
  );

  return matchedRule?.icon || "📌";
}

function addExtraExpenseCategory() {
  const label = prompt("اكتب اسم نوع المصروف الجديد");
  const cleanLabel = String(label || "").trim();

  if (!cleanLabel) return;

  setState((prev) => {
    const items =
      prev.expenseCategories?.items ||
      [
        ...(prev.expenseCategories?.main || []),
        ...(prev.expenseCategories?.extra || []),
      ];

    const exists = items.some(
      (item) => String(item.label || "").trim() === cleanLabel
    );

    if (exists) {
      alert("هذا النوع موجود مسبقًا");
      return prev;
    }

    const newCategory = {
      id: `extra-${Date.now()}`,
      label: cleanLabel,
      icon: getExpenseCategoryIconByName(cleanLabel),
      color: "var(--text-muted)",
      pinned: false,
    };

    return {
      ...prev,
      expenseCategories: {
        items: [...items, newCategory],
      },
    };
  });
}
function toggleExpenseCategoryPinned(catId) {
  setState((prev) => {
    const savedItems =
      prev.expenseCategories?.items ||
      [
        ...(prev.expenseCategories?.main || []),
        ...(prev.expenseCategories?.extra || []),
      ];

    const mergedItems = [
      ...defaultExpenseCategories.map((base) => {
        const saved = savedItems.find((item) => item.id === base.id);
        return saved ? { ...base, ...saved } : base;
      }),
      ...savedItems.filter(
        (saved) =>
          !defaultExpenseCategories.some((base) => base.id === saved.id)
      ),
    ];

    const target = mergedItems.find((cat) => cat.id === catId);
    if (!target) return prev;

    const pinnedCount = mergedItems.filter(
      (cat) => cat.pinned && !cat.isOther
    ).length;

    if (!target.pinned && pinnedCount >= 12) {
      alert("الحد الأقصى للشاشة الرئيسية هو 12 نوعًا");
      return prev;
    }

    return {
      ...prev,
      expenseCategories: {
        items: mergedItems.map((cat) =>
          cat.id === catId ? { ...cat, pinned: !cat.pinned } : cat
        ),
      },
    };
  });
}
 return (
    <div style={G.scr}>
            <div style={G.card()}>
              {!readOnly && dueCurrentLiabilities.length > 0 && (
  <button
    type="button"
    onClick={onOpenDueLiabilities}
    style={{
      background: "rgba(239,68,68,0.10)",
      border: "1px solid rgba(248,113,113,0.35)",
      color: "#fecaca",
      padding: "7px 10px",
      borderRadius: 999,
      marginBottom: 12,
      textAlign: "right",
      fontSize: 0,
      fontWeight: 800,
      cursor: "pointer",
      fontFamily: "inherit",
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      maxWidth: "100%",
    }}
  >
    <span style={{ fontSize: 11 }}>!</span>
    <span style={{ fontSize: 11 }}>{dueCurrentLiabilities.length} مستحق هذا الشهر</span>
    ⚠️ لديك {dueCurrentLiabilities.length} التزام جاري مستحق هذا الشهر
  </button>
)}
        <div style={{ textAlign: "right", marginBottom: 12, color: "var(--text-muted)" }}>
          🎯 سقف الصرف الشهري
        </div>

        <SpendBar spent={budget.coveredSpent} cap={budget.spendingCap} />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
            marginTop: 12,
          }}
        >
          <div style={summaryCard("success")}>
            <div style={{ fontSize: 10, color: "var(--text-faint)" }}>المتبقي</div>
            <div style={summaryValue("success")}>
              {budget.remainingCap.toFixed(2)}
            </div>
          </div>

          {budget.overBudgetSpent > 0 && (
  <div style={summaryCard("danger")}>
    <div style={{ fontSize: 10, color: "var(--text-faint)" }}>التجاوز</div>
    <div style={summaryValue("danger")}>
      {budget.overBudgetSpent.toFixed(2)}
    </div>
  </div>
)}        </div>
      </div>

      {!readOnly && (
      <div style={{ display: "flex", justifyContent: "center", margin: "14px 0 16px" }}>
        <button
          type="button"
          title="تسجيل مصروف"
          onClick={() => setShowExpense(true)}
          disabled={!state.session.isOpen}
          style={{
            width: 76,
            height: 76,
            borderRadius: "50%",
            border: state.session.isOpen
              ? "1px solid rgba(232,201,106,0.65)"
              : "1px solid var(--border-soft)",
            background: state.session.isOpen
              ? "linear-gradient(135deg,var(--gold-primary),var(--gold-border))"
              : "var(--bg-secondary)",
            color: state.session.isOpen ? "var(--text-heading)" : "var(--text-faint)",
            boxShadow: state.session.isOpen
              ? "0 14px 34px rgba(201,168,64,0.28)"
              : "none",
            cursor: state.session.isOpen ? "pointer" : "not-allowed",
            opacity: state.session.isOpen ? 1 : 0.6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 34,
            fontWeight: 900,
          }}
        >
          💸
        </button>
      </div>
      )}

      {!readOnly && !state.session.isOpen && (
        <button
          onClick={() => {
            const structuralTotal = calcStructuralTotal(state);
            const net = state.settings.salary - structuralTotal;
            const rolledCurrentLiabilities =
  (state.currentLiabilities || [])
    .filter((l) => l.status !== "paid")
    .map((l) => ({
      ...l,
      paymentMethod: "",
      newDueDate: "",
      salaryPaidAmount: 0,
    }));

            setState((p) => ({
              ...p,
                currentLiabilities: rolledCurrentLiabilities,
              transactions: [
                ...(p.transactions || []),
                {
                  id: Date.now(),
                  type: "salary_month_opened",
                  cashFlow: "salary",
                  amount: Number(p.settings?.salary || 0),
                  structuralTotal,
                  spendingCap: Math.floor(net * 0.8),
                  plannedSavings: net - Math.floor(net * 0.8),
                  date: new Date().toISOString(),
                },
              ],

              session: {
                ...p.session,
                isOpen: true,
                salaryNetAfterStructural: net,
                salaryNetAfterCurrentLiabilities: net,
                spendingCap: Math.floor(net * 0.8),
                coveredSpent: 0,
                overBudgetSpent: 0,
                savingsAmount: net - Math.floor(net * 0.8),
              },
            }));
          }}
          style={G.btn("linear-gradient(135deg,#22c55e,#16a34a)", "#fff", {
            width: "100%",
            marginBottom: 12,
          })}
        >
          🗓 بدء شهر تجريبي
        </button>
      )}

      {!readOnly && Number(state.session?.pendingSurplus || 0) > 0 && (
        <div
          style={{
            ...G.card("rgba(34,197,94,0.12)"),
            border: "1px solid rgba(34,197,94,0.35)",
            padding: 12,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
            <button
              type="button"
              onClick={() => onAllocateSurplus(Number(state.session.pendingSurplus || 0))}
              style={G.btn("#17341f", "#86efac", {
                width: 42,
                height: 34,
                padding: 0,
              })}
            >
              ↗
            </button>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#86efac", fontSize: 12, fontWeight: 900 }}>
                فائض راتب ينتظر التوجيه
              </div>
              <div style={{ color: "var(--text-body)", fontSize: 18, fontWeight: 900 }}>
                {Number(state.session.pendingSurplus || 0).toFixed(2)} د.أ
              </div>
            </div>
          </div>
        </div>
      )}

      {false && <div style={G.card()}>
        {selectedExpenseTotal !== selectedExpenseRecorded && (
          <div
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid rgba(232,201,106,0.22)",
              borderRadius: 12,
              padding: 10,
              marginBottom: 10,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: "var(--text-muted)", fontSize: 11 }}>إجمالي المصروف</span>
              <b>{selectedExpenseTotal.toFixed(2)} د.أ</b>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: "var(--text-muted)", fontSize: 11 }}>من سقف الصرف</span>
              <b style={{ color: "#86efac" }}>
                {Number(selectedExpense.budgetCovered || 0).toFixed(2)} د.أ
              </b>
            </div>
            {selectedExpenseDebt > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "var(--text-muted)", fontSize: 11 }}>سجل كدين</span>
                <b style={{ color: "#fecaca" }}>{selectedExpenseDebt.toFixed(2)} د.أ</b>
              </div>
            )}
            {selectedExpenseAsset > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)", fontSize: 11 }}>ممَول من أصل</span>
                <b style={{ color: "var(--gold-border)" }}>{selectedExpenseAsset.toFixed(2)} د.أ</b>
              </div>
            )}
          </div>
        )}
        <div style={{ textAlign: "right", marginBottom: 12, color: "var(--text-muted)" }}>
          📊 توزيع المصاريف
        </div>
      </div>}

      <div style={G.card()}>
        <div style={{ textAlign: "right", marginBottom: 10, color: "var(--text-muted)" }}>
          آخر المصاريف
        </div>

        {recent.map((e, i) => (
          <div
            key={e.id}
            style={{
              ...(i < recent.length - 1 ? G.row : G.lrow),
              ...(incomeEntryStyle(e.isIncomeEntry) || {}),
            }}
          >
            <div>
              <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 8,
  }}
>
  <button
onClick={() => setSelectedExpense(e)}    style={{
      background: "transparent",
      border: "none",
      color: "var(--gold-border)",
      fontSize: 16,
      cursor: "pointer",
      padding: 0,
    }}
  >
    ✏️
  </button>

  <div style={{ fontSize: 15, fontWeight: 700 }}>
    <span style={{ color: e.isIncomeEntry ? "#2A9E60" : "var(--text-heading)" }}>
      {e.isIncomeEntry ? "+" : ""}
      {incomeEntryAmount(e).toFixed(2)} د.أ
    </span>
  </div>
</div>
              <div style={{ fontSize: 10, color: e.isIncomeEntry ? "#2A9E60" : "var(--text-faint)" }}>
                {incomeEntryMeta(e)}
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13 }}>{e.note || e.category}</div>
              <div
                style={{
                  fontSize: 10,
                  color: e.isIncomeEntry ? "#2A9E60" : CC[e.category] || "var(--text-muted)",
                  marginTop: 2,
                }}
              >
                {e.category} | {e.paymentMethod}
              </div>
            </div>
          </div>
        ))}

        {!recent.length && (
          <div
            style={{
              textAlign: "center",
              color: "var(--text-disabled)",
              padding: "20px 0",
              fontSize: 13,
            }}
          >
            لا توجد مصاريف بعد
          </div>
        )}
      </div>

      {!readOnly && (
      <button
        onClick={async () => {
          try {
            await clearState(authSession);
            window.location.reload();
          } catch (err) {
            console.error("Clear Error:", err);
            setStorageError("تعذر حذف البيانات من Supabase. لم يتم استخدام تخزين محلي.");
          }
        }}
        style={G.btn("#7f1d1d", "#fff", { width: "100%" })}
      >
        تصفير البيانات التجريبية
      </button>
      )}

      {!readOnly && selectedExpense && (
  <div
    onClick={(ev) => ev.target === ev.currentTarget && setSelectedExpense(null)}
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.8)",
      backdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
      zIndex: 520,
    }}
  >
    <div
      style={{
        position: "relative",
        background: "var(--bg-card)",
        borderRadius: "22px 22px 0 0",
        border: "1px solid var(--border-soft)",
        padding: "22px 18px 34px",
        width: "100%",
        maxWidth: 440,
        maxHeight: "82vh",
        overflowY: "auto",
        direction: "rtl",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "var(--bg-card)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
          paddingBottom: 12,
          borderBottom: "1px solid rgba(148,163,184,0.12)",
        }}
      >
        <button
          onClick={() => setSelectedExpense(null)}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-muted)",
            fontSize: 24,
            cursor: "pointer",
          }}
        >
          ×
        </button>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 18, fontWeight: 900 }}>
            إدارة المصروف
          </div>
          <div style={{ fontSize: 11, color: "var(--text-faint)" }}>
            تفاصيل العملية
          </div>
        </div>
      </div>

      <div style={G.card()}>
        {selectedExpenseTotal !== selectedExpenseRecorded && (
          <div
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid rgba(232,201,106,0.22)",
              borderRadius: 12,
              padding: 10,
              marginBottom: 10,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: "var(--text-muted)", fontSize: 11 }}>إجمالي المصروف</span>
              <b>{selectedExpenseTotal.toFixed(2)} د.أ</b>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: "var(--text-muted)", fontSize: 11 }}>من سقف الصرف</span>
              <b style={{ color: "#86efac" }}>
                {Number(selectedExpense.budgetCovered || 0).toFixed(2)} د.أ
              </b>
            </div>
            {selectedExpenseDebt > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "var(--text-muted)", fontSize: 11 }}>سجل كدين</span>
                <b style={{ color: "#fecaca" }}>{selectedExpenseDebt.toFixed(2)} د.أ</b>
              </div>
            )}
            {selectedExpenseAsset > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)", fontSize: 11 }}>ممَول من أصل</span>
                <b style={{ color: "var(--gold-border)" }}>{selectedExpenseAsset.toFixed(2)} د.أ</b>
              </div>
            )}
          </div>
        )}
        <div style={G.row}>
          <span style={{ color: "var(--text-muted)" }}>المبلغ</span>
          <b>{Number(selectedExpense.amount || 0).toFixed(2)} د.أ</b>
        </div>

        <div style={G.row}>
          <span style={{ color: "var(--text-muted)" }}>التصنيف</span>
          <b>{selectedExpense.category}</b>
        </div>

        <div style={G.row}>
          <span style={{ color: "var(--text-muted)" }}>طريقة الدفع</span>
          <b>{selectedExpense.paymentMethod}</b>
        </div>

        <div style={G.row}>
          <span style={{ color: "var(--text-muted)" }}>المغطى من السقف</span>
          <b>{Number(selectedExpense.budgetCovered || 0).toFixed(2)} د.أ</b>
        </div>

        <div style={G.lrow}>
          <span style={{ color: "var(--text-muted)" }}>التجاوز</span>
          <b style={{ color: Number(selectedExpense.overBudget || 0) > 0 ? "#ef4444" : "var(--text-heading)" }}>
            {Number(selectedExpense.overBudget || 0).toFixed(2)} د.أ
          </b>
        </div>
        <button
  onClick={() => {
    cancelExpense(selectedExpense.id);
    setSelectedExpense(null);
  }}
  style={G.btn("#7f1d1d", "#fff", {
    width: "100%",
    marginTop: 10,
  })}
>
  إلغاء المصروف
</button>
      </div>
    </div>
  </div>
)}

{showCategoryManager && (
  <div
    onClick={(ev) =>
      ev.target === ev.currentTarget && setShowCategoryManager(false)
    }
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.8)",
      backdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
      zIndex: 1100,
    }}
  >
    <div
      style={{
        position: "relative",
        background: "var(--bg-card)",
        borderRadius: "22px 22px 0 0",
        border: "1px solid var(--border-soft)",
        padding: "22px 18px 34px",
        width: "100%",
        maxWidth: 440,
        height: "82vh",
maxHeight: "82vh",
overflow: "hidden",
direction: "rtl",
display: "flex",
flexDirection: "column",
      }}
    >
      <div
       style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "var(--bg-card)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
          paddingBottom: 12,
          borderBottom: "1px solid rgba(148,163,184,0.12)",
        }}
      >
       <button
  type="button"
  onClick={() => setShowCategoryManager(false)}
  style={{
    width: 36,
    height: 36,
    borderRadius: 12,
    border: "1px solid rgba(148,163,184,0.28)",
    background: "var(--bg-secondary)",
    color: "var(--text-heading)",
    fontSize: 22,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1,
  }}
>
  ×
  </button>
<div
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 14,
  }}
>
  
  <div style={{ textAlign: "right", flex: 1 }}>
    <div style={{ fontSize: 18, fontWeight: 900 }}>
      إدارة أنواع المصروف
    </div>
    <div style={{ fontSize: 11, color: "var(--text-faint)" }}>
      التصنيفات الإضافية
    </div>
  </div>
</div>
      </div>

<div
  style={{
    ...G.card(),
    flex: 1,
    overflowY: "auto",
    marginBottom: 14,
  }}
>  {allExpenseCategories.filter((cat) => !cat.isOther).length === 0 ? (
    <div
      style={{
        textAlign: "center",
        color: "var(--text-faint)",
        padding: "18px 0",
        fontSize: 13,
      }}
    >
      لا توجد أنواع مصروف إضافية بعد
    </div>
  ) : (
    allExpenseCategories
      .filter((cat) => !cat.isOther)
      .map((catItem) => (
        <div key={catItem.id} style={G.row}>
  <span>
    {catItem.icon} {catItem.label}
  </span>

  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <button
      type="button"
      onClick={() => toggleExpenseCategoryPinned(catItem.id)}
      style={{
        background: "transparent",
        border: "none",
        color: "var(--gold-border)",
        fontSize: 20,
        cursor: "pointer",
        padding: 0,
        lineHeight: 1,
      }}
    >
      {catItem.pinned ? "★" : "☆"}
    </button>

    <button
      type="button"
      onClick={() => {
        setCategory(catItem.label);
        setShowCategoryManager(false);
      }}
      style={G.btn("var(--bg-secondary)", "var(--gold-border)", {
        padding: "7px 10px",
        fontSize: 12,
      })}
    >
      اختيار
    </button>
  </div>
</div>
      ))
  )}
</div>
      <button
  type="button"
  onClick={addExtraExpenseCategory}
  style={G.btn("linear-gradient(135deg,var(--gold-primary),var(--gold-border))", "var(--text-heading)", {
    width: "100%",
    marginTop: 10,
  })}
>
  + إضافة نوع مصروف
</button>
    </div>
  </div>
)}
      {showExpense && (
        <div
          onClick={(e) => e.target === e.currentTarget && setShowExpense(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(250,247,242,0.72)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "stretch",
            justifyContent: "center",
            zIndex: 900,
          }}
        >
          <div
            style={{
              background: "var(--bg-card)",
              height: "100dvh",
              maxHeight: "100dvh",
              overflowY: "auto",
              overscrollBehavior: "contain",
              border: "1px solid var(--border-soft)",
              borderRadius: 0,
              padding: "16px 18px calc(18px + env(safe-area-inset-bottom))",
              width: "100%",
              maxWidth: 440,
              direction: "rtl",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
                position: "sticky",
                top: 0,
                zIndex: 5,
                background: "var(--bg-card)",
                paddingBottom: 10,
                borderBottom: "1px solid var(--border-soft)",
              }}
            >
              <button
                onClick={() => setShowExpense(false)}
                style={G.btn("var(--bg-secondary)", "var(--text-muted)", {
                  padding: "7px 12px",
                  borderRadius: 10,
                  fontSize: 12,
                })}
              >
                رجوع
              </button>

              <span style={{ fontSize: 15, fontWeight: 700 }}>
                تسجيل مصروف
              </span>
            </div>

            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="المبلغ"
              style={{ ...G.inp(), marginBottom: 10, fontSize: 22 }}
            />
          <div style={{ display: "none" }}>
 
{showUnusualPicker && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.55)",
      zIndex: 10000,
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
      padding: 16,
    }}
    onClick={() => setShowUnusualPicker(false)}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: "100%",
        maxWidth: 420,
        background: "var(--bg-card)",
        border: "1px solid rgba(148,163,184,0.22)",
        borderRadius: "20px 20px 0 0",
        padding: 16,
        boxShadow: "0 -18px 40px rgba(0,0,0,0.35)",
        direction: "rtl",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 900, color: "var(--text-heading)" }}>
          ⚠️ تمويل المصروف
        </div>

        <button
          type="button"
          onClick={() => setShowUnusualPicker(false)}
          style={{
            width: 34,
            height: 34,
            borderRadius: 12,
            border: "none",
            background: "var(--bg-secondary)",
            color: "var(--text-body)",
            cursor: "pointer",
            fontSize: 18,
          }}
        >
          ×
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 10,
        }}
      >
        {[
          ["asset", "🏦", "من أصل"],
          ["liability", "🧾", "التزام"],
          ["mix", "🔀", "مكس"],
        ].map(([value, icon, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setIsUnusualExpense(true);
              setUnusualFundingMode(value);
              setShowUnusualPicker(false);
            }}
            style={{
              minHeight: 76,
              borderRadius: 16,
              border:
                unusualFundingMode === value
                  ? "1px solid var(--gold-border)"
                  : "1px solid rgba(148,163,184,0.24)",
              background:
                unusualFundingMode === value
                  ? "rgba(232,201,106,0.12)"
                  : "var(--bg-secondary)",
              color: unusualFundingMode === value ? "var(--gold-border)" : "var(--text-heading)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              cursor: "pointer",
              fontFamily: "inherit",
              fontWeight: 900,
            }}
          >
            <span style={{ fontSize: 24, lineHeight: 1 }}>{icon}</span>
            <span style={{ fontSize: 12 }}>{label}</span>
          </button>
        ))}
      </div>

      {isUnusualExpense && (
        <button
          type="button"
          onClick={() => {
            setIsUnusualExpense(false);
            setShowUnusualPicker(false);
          }}
          style={{
            width: "100%",
            marginTop: 12,
            border: "none",
            background: "transparent",
            color: "var(--text-muted)",
            fontSize: 12,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          إلغاء التحديد
        </button>
      )}
    </div>
  </div>
)}
{false && isUnusualExpense && (
      <div style={{ marginTop: 10 }}>
      <div
        style={{
          fontSize: 11,
          color: "var(--text-body)",
          marginBottom: 8,
          textAlign: "right",
        }}
      >
        توزيع المصروف غير الاعتيادي
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginBottom: 10,
        }}
      >
        {[
          ["asset", "كله من أصل"],
          ["liability", "كله التزام"],
          ["cap_asset", "جزء من السقف + أصل"],
          ["cap_liability", "جزء من السقف + التزام"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setUnusualFundingMode(value)}
            style={{
              border:
                unusualFundingMode === value
                  ? "1px solid var(--gold-border)"
                  : "1px solid rgba(148,163,184,0.25)",
              background:
                unusualFundingMode === value
                  ? "rgba(232,201,106,0.14)"
                  : "var(--bg-secondary)",
              color: unusualFundingMode === value ? "var(--gold-border)" : "var(--text-heading)",
              borderRadius: 12,
              padding: "9px 8px",
              fontSize: 11,
              fontWeight: 800,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {(unusualFundingMode === "cap_asset" ||
        unusualFundingMode === "cap_liability") && (
        <input
          type="number"
          value={unusualCapAmount}
          onChange={(e) => setUnusualCapAmount(e.target.value)}
          placeholder="المبلغ من السقف"
          style={{ ...G.inp(), marginBottom: 8 }}
        />
      )}

      {(unusualFundingMode === "asset" ||
        unusualFundingMode === "cap_asset") && (
        <select
          value={unusualAssetKey}
          onChange={(e) => setUnusualAssetKey(e.target.value)}
          style={{ ...G.inp(), marginBottom: 8 }}
        >
          {assetSources.map((asset) => (
            <option key={asset.key} value={asset.key}>
              {asset.label}
            </option>
          ))}
        </select>
      )}

      {(unusualFundingMode === "liability" ||
        unusualFundingMode === "cap_liability") && (
        <>
          <input
            value={unusualLiabilityName}
            onChange={(e) => setUnusualLiabilityName(e.target.value)}
            placeholder="اسم الالتزام"
            style={{ ...G.inp(), marginBottom: 8 }}
          />
          <input
            type="date"
            value={unusualDueDate}
            onChange={(e) => setUnusualDueDate(e.target.value)}
            style={{ ...G.inp(), marginBottom: 0 }}
          />
        </>
      )}
    </div>
  )}
</div>
{expectedOverBudget > 0 && (
  <div
    style={{
      background: "var(--red-bg)",
      border: "1.5px solid var(--red-border)",
      borderRadius: 14,
      padding: "10px 12px",
      marginBottom: 10,
      color: "#D95555",
      fontSize: 12,
      fontWeight: 700,
      textAlign: "right",
    }}
  >
    ⚠️ هذا المصروف يتجاوز سقف الصرف بمبلغ{" "}
    {expectedOverBudget.toFixed(2)} د.أ
  </div>
)}{false && expectedOverBudget > 0 && paymentMethod === "cash" && (
  <div
    style={{
      background: "var(--bg-secondary)",
      border: "1px solid var(--border-soft)",
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
    }}
  >
    <div
      style={{
        fontSize: 12,
        color: "var(--gold-primary)",
        fontWeight: 800,
        marginBottom: 10,
        textAlign: "right",
      }}
    >
      تمويل العجز
    </div>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 8,
        marginBottom: 10,
      }}
    >
      <button
        onClick={() => setOverBudgetSource("asset")}
        style={G.btn(
          overBudgetSource === "asset" ? "#a855f7" : "var(--bg-secondary)",
          "#fff",
          { padding: "10px" }
        )}
      >
        من أصل
      </button>

      <button
        onClick={() => setOverBudgetSource("liability")}
        style={G.btn(
          overBudgetSource === "liability" ? "#ef4444" : "var(--bg-secondary)",
          "#fff",
          { padding: "10px" }
        )}
      >
        دين إضافي
      </button>
    </div>

    {overBudgetSource === "asset" && (
      <select
        value={overBudgetAssetKey}
        onChange={(e) => setOverBudgetAssetKey(e.target.value)}
        style={{ ...G.inp(), marginBottom: 10 }}
      >
        {assetSources.map((s) => (
          <option key={s.key} value={s.key}>
            {s.label} — متاح {Number(s.available || 0).toFixed(2)} د.أ
          </option>
        ))}
      </select>
    )}

    {overBudgetSource === "liability" && (
      <>
        <input
          value={overBudgetLiabilityName}
          onChange={(e) => setOverBudgetLiabilityName(e.target.value)}
          placeholder="اسم الالتزام"
          style={{ ...G.inp(), marginBottom: 10 }}
        />

        <input
          type="date"
          value={overBudgetDueDate}
          onChange={(e) => setOverBudgetDueDate(e.target.value)}
          style={{ ...G.inp(), marginBottom: 10 }}
        />
      </>
    )}
  </div>
)}

            <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 7,
    marginBottom: 12,
  }}
>
              {mainExpenseCategories.slice(0, 8).map((catItem) => {
  const cat = catItem.label;
  const active = category === cat;
  const tile = getCategoryTileStyle(cat);

  return (
    <button
      key={cat}
      type="button"
      onClick={() => {
  if (catItem.isOther) {
    setShowCategoryManager(true);
    return;
  }

  setCategory(cat);
}}
      style={{
minHeight: 42,
width: "auto",
borderRadius: 10,
border: active
  ? "1px solid var(--gold-border)"
  : "1px solid transparent",
background: active ? "var(--gold-light)" : "var(--bg-page)",
color: "var(--text-body)",
display: "flex",
flexDirection: "column",
alignItems: "center",
justifyContent: "center",
gap: 3,
padding: "6px 4px",
cursor: "pointer",
fontFamily: "inherit",
fontWeight: 700,
        boxShadow: "none",
      }}
    >
      <span
        style={{
          width: 24,
          height: 24,
          borderRadius: 8,
          background: catItem.isOther ? "var(--bg-secondary)" : tile.bg,
          color: catItem.isOther ? "var(--text-muted)" : tile.icon,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          lineHeight: 1,
          flex: "0 0 auto",
        }}
      >
{catItem.isOther ? "⚙️" : catItem.icon || CAT_ICONS[cat] || "📌"}      </span>
      <span style={{ fontSize: 9, color: "var(--text-muted)", textAlign: "center", lineHeight: 1.1 }}>
{catItem.isOther ? "إدارة" : cat}      </span>
    </button>
  );
})}
<button
  type="button"
  onClick={() => setShowCategoryManager(true)}
  style={{
    minHeight: 42,
    borderRadius: 10,
    border: "1px solid transparent",
    background: "var(--bg-page)",
    color: "var(--text-muted)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    padding: "6px 4px",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: 800,
  }}
>
  <span style={{ width: 24, height: 24, borderRadius: 8, background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, lineHeight: 1 }}>+</span>
  <span style={{ fontSize: 9, color: "var(--text-muted)", lineHeight: 1.1 }}>المزيد</span>
</button>
            </div>
          <div
  style={{
    width: "100%",
    display: "none",
    justifyContent: "flex-start",
    direction: "ltr",
    marginTop: 6,
    marginBottom: 2,
  }}
>
  <button
    type="button"
    onClick={() => setShowCategoryManager(true)}
    title="إدارة أنواع المصروف"
    style={{
      width: 38,
      height: 38,
      padding: 0,
      borderRadius: 12,
      border: "none",
      background: "transparent",
      color: "var(--text-muted)",
      fontSize: 19,
      fontWeight: 900,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
    }}
  >
    ⚙️
  </button>
</div>

            <label style={{ fontSize: 11, color: "var(--text-faint)" }}>طريقة الدفع</label>
            <select
              value={paymentMethod}
onChange={(e) => {
  const value = e.target.value;

  if (value === "emergency") {
    setPaymentMethod(value);
    setIsUnusualExpense(true);
    setUnusualFundingMode("asset");
    setShowUnusualPicker(false);
    return;
  }

  setPaymentMethod(value);
  setIsUnusualExpense(false);
  setUnusualFundingMode("");
  setShowUnusualPicker(false);
}}
style={{ ...G.inp(), marginBottom: 10 }}
            >
              {hasSpendingCap && <option value="cash">نقدا</option>}
              <option value="asset">من أصل</option>
              <option value="card">بطاقة</option>
              <option value="liability">دين / التزام جديد</option>
              <option value="emergency">مصروف طارئ</option>
            </select>
            {paymentMethod === "emergency" && isUnusualExpense && (
  <div
    style={{
      display: "none",
      marginTop: -4,
      marginBottom: 10,
      padding: "8px 10px",
      borderRadius: 12,
      background: "rgba(232,201,106,0.08)",
      color: "var(--gold-border)",
      fontSize: 12,
      fontWeight: 800,
      textAlign: "right",
      border: "1px solid rgba(232,201,106,0.22)",
    }}
  >
    ⚠️ مصروف طارئ ·{" "}
    {unusualFundingMode === "asset"
      ? "من أصل"
      : unusualFundingMode === "liability"
      ? "التزام"
      : "مكس"}
  </div>
)}

            {paymentMethod === "emergency" && isUnusualExpense && (
  <div
    style={{
      background: "var(--bg-secondary)",
      border: "1px solid rgba(232,201,106,0.28)",
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
      direction: "rtl",
    }}
  >
    <div
      style={{
        fontSize: 12,
        color: "var(--gold-border)",
        fontWeight: 900,
        marginBottom: 10,
        textAlign: "right",
      }}
    >
      تمويل المصروف من أصل
    </div>

    <select
      value={unusualFundingMode}
      onChange={(e) => setUnusualFundingMode(e.target.value)}
      style={{ ...G.inp(), marginBottom: 8 }}
    >
      <option value="asset">كاملًا من أصل</option>
      <option value="liability">كاملًا كدين</option>
      {hasSpendingCap && (
        <option value="mix">مكس: جزء من السقف والباقي من أصل أو دين</option>
      )}
    </select>

    <div
      style={{
        display: "none",
        gridTemplateColumns: "1fr",
        gap: 8,
        marginBottom: 10,
      }}
    >
      {[
        ["asset", "كاملًا من أصل"],
        ["liability", "كاملًا كدين"],
        ["mix", "مكس: جزء من سقف الصرف والباقي من أصل أو دين"],
      ].map(([value, label]) => (
        <button
          key={value}
          type="button"
          onClick={() => setUnusualFundingMode(value)}
          style={G.btn(
            unusualFundingMode === value ? "var(--gold-primary)" : "var(--bg-secondary)",
            unusualFundingMode === value ? "var(--text-heading)" : "#fff",
            { padding: "10px", textAlign: "right" }
          )}
        >
          {label}
        </button>
      ))}
    </div>

    {unusualFundingMode === "mix" && (
      <>
        <input
          type="number"
          value={unusualCapAmount}
          onChange={(e) => setUnusualCapAmount(e.target.value)}
          placeholder="الجزء من سقف الصرف"
          style={{ ...G.inp(), marginBottom: 8 }}
        />

        <select
          value={unusualRemainderSource}
          onChange={(e) => setUnusualRemainderSource(e.target.value)}
          style={{ ...G.inp(), marginBottom: 8 }}
        >
          <option value="asset">الباقي من أصل</option>
          <option value="liability">الباقي كدين</option>
        </select>

        <div
          style={{
            display: "none",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
            marginBottom: 8,
          }}
        >
          <button
            type="button"
            onClick={() => setUnusualRemainderSource("asset")}
            style={G.btn(
              unusualRemainderSource === "asset" ? "#a855f7" : "var(--bg-secondary)",
              "#fff",
              { padding: "9px" }
            )}
          >
            الباقي من أصل
          </button>
          <button
            type="button"
            onClick={() => setUnusualRemainderSource("liability")}
            style={G.btn(
              unusualRemainderSource === "liability" ? "#ef4444" : "var(--bg-secondary)",
              "#fff",
              { padding: "9px" }
            )}
          >
            الباقي دين
          </button>
        </div>
      </>
    )}

    {(unusualFundingMode === "asset" ||
      (unusualFundingMode === "mix" && unusualRemainderSource === "asset")) && (
      <select
        value={unusualAssetKey}
        onChange={(e) => setUnusualAssetKey(e.target.value)}
        style={{ ...G.inp(), marginBottom: 8 }}
      >
        {assetSources.map((s) => (
          <option key={s.key} value={s.key}>
            {s.label} — متاح {Number(s.available || 0).toFixed(2)} د.أ
          </option>
        ))}
      </select>
    )}

    {(unusualFundingMode === "liability" ||
      (unusualFundingMode === "mix" && unusualRemainderSource === "liability")) && (
      <>
        <input
          value={unusualLiabilityName}
          onChange={(e) => setUnusualLiabilityName(e.target.value)}
          placeholder="اسم الدين"
          style={{ ...G.inp(), marginBottom: 8 }}
        />

        <input
          type="date"
          value={unusualDueDate}
          onChange={(e) => setUnusualDueDate(e.target.value)}
          style={{ ...G.inp(), marginBottom: 0 }}
        />
      </>
    )}
  </div>
)}

            {paymentMethod === "card" && (
              <select
                value={cardId}
                onChange={(e) => setCardId(e.target.value)}
                style={{ ...G.inp(), marginBottom: 10 }}
              >
                <option value="">اختر البطاقة</option>
                {cards.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — الرصيد {Number(c.balance || 0).toFixed(2)}
                  </option>
                ))}
              </select>
            )}

            {paymentMethod === "asset" && (
              <select
                value={assetPaymentKey}
                onChange={(e) => setAssetPaymentKey(e.target.value)}
                style={{ ...G.inp(), marginBottom: 10 }}
              >
                {assetSources.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label} — متاح {Number(s.available || 0).toFixed(2)} د.أ
                  </option>
                ))}
              </select>
            )}

            {paymentMethod === "liability" && (
              <>
                <input
                  value={liabilityName}
                  onChange={(e) => setLiabilityName(e.target.value)}
                  placeholder="اسم الالتزام"
                  style={{ ...G.inp(), marginBottom: 10 }}
                />

                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  style={{ ...G.inp(), marginBottom: 10 }}
                />
              </>
            )}

            {expectedOverBudget > 0 && paymentMethod === "cash" && (
              <div
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.24)",
                  borderRadius: 12,
                  padding: 10,
                  marginBottom: 10,
                  textAlign: "right",
                }}
              >
                <div
                  style={{
                    color: "#fecaca",
                    fontSize: 11,
                    fontWeight: 800,
                    marginBottom: 8,
                  }}
                >
                  تغطية التجاوز: {expectedOverBudget.toFixed(2)} د.أ
                </div>

                <select
                  value={overBudgetSource}
                  onChange={(e) => setOverBudgetSource(e.target.value)}
                  style={{ ...G.inp(), marginBottom: 8 }}
                >
                  <option value="asset">خصم التجاوز من أصل</option>
                  <option value="liability">تسجيل التجاوز كدين</option>
                </select>

                {overBudgetSource === "asset" && (
                  <select
                    value={overBudgetAssetKey}
                    onChange={(e) => setOverBudgetAssetKey(e.target.value)}
                    style={{ ...G.inp(), marginBottom: 0 }}
                  >
                    {assetSources.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.label} - متاح {Number(s.available || 0).toFixed(2)} د.أ
                      </option>
                    ))}
                  </select>
                )}

                {overBudgetSource === "liability" && (
                  <>
                    <input
                      value={overBudgetLiabilityName}
                      onChange={(e) => setOverBudgetLiabilityName(e.target.value)}
                      placeholder="اسم دين التجاوز"
                      style={{ ...G.inp(), marginBottom: 8 }}
                    />

                    <input
                      type="date"
                      value={overBudgetDueDate}
                      onChange={(e) => setOverBudgetDueDate(e.target.value)}
                      style={{ ...G.inp(), marginBottom: 0 }}
                    />
                  </>
                )}
              </div>
            )}

            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="ملاحظة"
              style={{ ...G.inp(), marginBottom: 12 }}
            />

            <button
              type="button"
              onClick={submitExpense}
              style={G.btn("linear-gradient(135deg,var(--gold-primary),var(--gold-border))", "var(--text-heading)", {
                width: "100%",
                minHeight: 44,
                marginTop: 6,
                marginBottom: 0,
                display: "block",
              })}
            >
              ✓ تسجيل المصروف
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ReportsScreen({ state }) {
  const [showAssetTrendDetails, setShowAssetTrendDetails] = useState(false);
  const [showExpenseReport, setShowExpenseReport] = useState(false);
  const [showOverBudgetReport, setShowOverBudgetReport] = useState(false);
  const [assetTrendMonths, setAssetTrendMonths] = useState(6);
  const [selectedTrendAssetKey, setSelectedTrendAssetKey] = useState("");
  const [expenseChartMode, setExpenseChartMode] = useState("donut");
  const [selectedExpense, setSelectedExpense] = useState(null);
  const expenses = [...(state.expenses || [])].reverse();
  const total = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const selectedExpenseTotal = Number(
    selectedExpense?.originalAmount ?? selectedExpense?.amount ?? 0
  );
  const selectedExpenseRecorded = Number(selectedExpense?.amount || 0);
  const selectedExpenseDebt = Number(
    selectedExpense?.emergencyFunding?.liabilityAmount || 0
  );
  const selectedExpenseAsset = Number(
    selectedExpense?.emergencyFunding?.assetAmount || 0
  );
  const overBudgetItems = expenses.filter((item) => Number(item.overBudget || 0) > 0);
  const overBudgetTotal = overBudgetItems.reduce(
    (sum, item) => sum + Number(item.overBudget || 0),
    0
  );
  const budget = calcBudget(state);
  const currentAssets = calcAssets(state);
  const assetTrendByMonth = new Map();
  (state.monthlySnapshots || []).forEach((snapshot) => {
    assetTrendByMonth.set(snapshot.month, {
      month: snapshot.month,
      totalAssets: Number(snapshot.assetTotals?.totalAssets || 0),
      netWorth: Number(snapshot.assetTotals?.netWorth || 0),
      breakdown: assetBreakdownFromAssets(snapshot.assets || {}, state.settings?.market || {}),
      closed: true,
    });
  });
  assetTrendByMonth.set(state.currentMonth || new Date().toISOString().slice(0, 7), {
    month: state.currentMonth || new Date().toISOString().slice(0, 7),
    totalAssets: Number(currentAssets.totalAssets || 0),
    netWorth: Number(currentAssets.netWorth || 0),
    breakdown: assetBreakdownFromAssets(state.assets || {}, state.settings?.market || {}),
    closed: false,
  });
  const assetTrend = Array.from(assetTrendByMonth.values()).sort((a, b) =>
    String(a.month).localeCompare(String(b.month))
  );
  const assetTrendPoints = assetTrend.slice(-Number(assetTrendMonths || 6));
  const assetComparisons = buildAssetComparisons(assetTrendPoints, state);
  const assetChangeRows = assetComparisons
    .flatMap((month) =>
      month.changes.map((change) => ({
        ...change,
        month: month.month,
        reasons: month.reasons,
      }))
    )
    .reduce((map, item) => {
      const current = map.get(item.key) || {
        key: item.key,
        label: item.label,
        change: 0,
        months: [],
      };
      current.change = Number((current.change + item.change).toFixed(2));
      current.months.push(item);
      map.set(item.key, current);
      return map;
    }, new Map());
  const assetDetailRows = Array.from(assetChangeRows.values()).sort(
    (a, b) => Math.abs(b.change) - Math.abs(a.change)
  );
  const selectedTrendAsset =
    assetDetailRows.find((row) => row.key === selectedTrendAssetKey) || assetDetailRows[0] || null;
  const maxAssetDetailChange = Math.max(
    1,
    ...assetDetailRows.map((row) => Math.abs(Number(row.change || 0)))
  );
  const firstAssetPoint = assetTrendPoints[0];
  const lastAssetPoint = assetTrendPoints[assetTrendPoints.length - 1];
  const assetChange =
    firstAssetPoint && lastAssetPoint
      ? Number(lastAssetPoint.totalAssets || 0) - Number(firstAssetPoint.totalAssets || 0)
      : 0;
  const assetChangePct =
    firstAssetPoint && Number(firstAssetPoint.totalAssets || 0) > 0
      ? (assetChange / Number(firstAssetPoint.totalAssets || 0)) * 100
      : 0;
  const maxAssetTrendValue = Math.max(
    1,
    ...assetTrendPoints.map((point) => Number(point.totalAssets || 0))
  );
  const minAssetTrendValue = Math.min(
    ...assetTrendPoints.map((point) => Number(point.totalAssets || 0)),
    maxAssetTrendValue
  );
  const assetTrendRange = Math.max(1, maxAssetTrendValue - minAssetTrendValue);
  const assetTrendChanges = assetTrendPoints.map((point, index) => {
    const previous = assetTrendPoints[index - 1];
    return previous ? Number(point.totalAssets || 0) - Number(previous.totalAssets || 0) : 0;
  });
  const bestAssetTrendChange = Math.max(0, ...assetTrendChanges);
  const assetChangeColor = assetChange > 0 ? "#B8922E" : assetChange < 0 ? "#D95555" : "var(--text-disabled)";
  const pendingCurrent = [];
  const getLiabilityAmount = () => 0;
  const getCoveredAmount = () => 0;
  const getUncoveredAmount = () => 0;

  const getDueText = (item) => {
    if (item.dueDate) return formatDate(item.dueDate);
    if (item.dueDay) return `يوم ${item.dueDay}`;
    return "غير محدد";
  };

  const updateCurrentPaymentMethod = (liability, value) => {
    setState((prev) => ({
      ...prev,
      currentLiabilities: prev.currentLiabilities.map((item) =>
        item.id === liability.id ? { ...item, paymentMethod: value } : item
      ),
    }));
  };

  const payCurrentFromReserved = (liability) => {
    const amount = Number(
      liability.payableBuffer ||
        liability.dueThisMonth ||
        liability.monthlyDue ||
        liability.amount ||
        liability.balance ||
        0
    );

    setState((prev) => ({
      ...prev,
      currentLiabilities: prev.currentLiabilities.map((item) =>
        item.id === liability.id
          ? {
              ...item,
              balance: Math.max(0, Number(item.balance || item.amount || 0) - amount),
              status: "paid",
              paymentMethod: "salary",
              salaryPaidAmount: 0,
            }
          : item
      ),
      transactions: [
        ...(prev.transactions || []),
        {
          id: Date.now(),
          type: "liability_paid_from_reserved_cap",
          name: `سداد التزام - ${liability.name}`,
          amount,
          liabilityId: liability.id,
          date: new Date().toISOString(),
        },
      ],
    }));
  };
  const payCurrentFromCap = (liability) => {
    const amount = getLiabilityAmount(liability);
    const remainingCap = Math.max(
      0,
      Number(state.session?.spendingCap || 0) -
        Number(state.session?.coveredSpent || 0)
    );

    if (remainingCap < amount) {
      alert("الرصيد المتاح من سقف الصرف لا يكفي لسداد هذا الالتزام");
      return;
    }

    setState((prev) => ({
      ...prev,
      session: {
        ...prev.session,
        coveredSpent: Number(
          (Number(prev.session?.coveredSpent || 0) + amount).toFixed(2)
        ),
      },
      currentLiabilities: prev.currentLiabilities.map((item) =>
        item.id === liability.id
          ? {
              ...item,
              balance: 0,
              status: "paid",
              paymentMethod: "cap",
              payableBuffer: amount,
              uncoveredDebt: 0,
            }
          : item
      ),
      transactions: [
        ...(prev.transactions || []),
        {
          id: Date.now(),
          type: "liability_paid_from_cap",
          amount,
          liabilityId: liability.id,
          date: new Date().toISOString(),
        },
      ],
    }));
  };

  const setPostponeDate = (liability, value) => {
    setState((prev) => ({
      ...prev,
      currentLiabilities: prev.currentLiabilities.map((item) =>
        item.id === liability.id ? { ...item, newDueDate: value } : item
      ),
    }));
  };

  const confirmPostpone = (liability) => {
    setState((prev) => ({
      ...prev,
      currentLiabilities: prev.currentLiabilities.map((item) =>
        item.id === liability.id
          ? { ...item, dueDate: item.newDueDate, newDueDate: "" }
          : item
      ),
    }));
  };

  const getPostponeParts = (item) => {
    const source =
      item.newDueDate ||
      item.dueDate ||
      new Date().toISOString().slice(0, 10);
    const [year, month, day] = String(source).split("-");
    return {
      year: year || String(new Date().getFullYear()),
      month: month || "01",
      day: day || "01",
    };
  };
  const setPostponePart = (liabilityId, part, value) => {
    setState((prev) => ({
      ...prev,
      currentLiabilities: prev.currentLiabilities.map((liability) => {
        if (liability.id !== liabilityId) return liability;
        const parts = getPostponeParts(liability);
        const nextParts = { ...parts, [part]: value };
        return {
          ...liability,
          newDueDate: `${nextParts.year}-${nextParts.month}-${nextParts.day}`,
        };
      }),
    }));
  };
  const confirmPostponeDate = (liabilityId) => {
    setState((prev) => ({
      ...prev,
      currentLiabilities: prev.currentLiabilities.map((liability) =>
        liability.id === liabilityId
          ? {
              ...liability,
              dueDate: liability.newDueDate || liability.dueDate,
              dueDay: Number(
                String(liability.newDueDate || liability.dueDate || "")
                  .split("-")[2] || liability.dueDay || 1
              ),
              newDueDate: "",
              paymentMethod: "",
            }
          : liability
      ),
    }));
  };
  const coveredCurrentTotal = pendingCurrent.reduce(
    (sum, item) => sum + getCoveredAmount(item),
    0
  );
  const uncoveredCurrentTotal = pendingCurrent.reduce(
    (sum, item) => sum + getUncoveredAmount(item),
    0
  );

  return (
    <div style={G.scr}>
      <div style={G.card()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ display: "flex", gap: 6 }}>
            {[
              { id: "donut", icon: "◔", title: "دائرة المصاريف" },
              { id: "bars", icon: "▥", title: "أعمدة المصاريف" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                title={item.title}
                onClick={() => setExpenseChartMode(item.id)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  border:
                    expenseChartMode === item.id
                      ? "1.5px solid #0284C7"
                      : "1px solid #7DD3FC",
                  background: expenseChartMode === item.id ? "linear-gradient(135deg,#38BDF8,#0284C7)" : "#EEF5FE",
                  color: expenseChartMode === item.id ? "#fff" : "#0369A1",
                  cursor: "pointer",
                  fontSize: 15,
                  fontWeight: 800,
                }}
              >
                {item.icon}
              </button>
            ))}
          </div>
          <div style={{ textAlign: "right", ...sectionHeading }}>
            ملخص المصروفات
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: overBudgetTotal > 0 ? "1fr 1fr 1fr" : "1fr 1fr",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <div style={summaryCard("total")}>
            <div style={{ fontSize: 10, color: "var(--text-faint)" }}>إجمالي المصروف</div>
            <div style={summaryValue("total")}>
              {total.toFixed(2)}
            </div>
          </div>

          <div style={summaryCard("success")}>
            <div style={{ fontSize: 10, color: "var(--text-faint)" }}>المتبقي من السقف</div>
            <div style={summaryValue("success")}>
              {budget.remainingCap.toFixed(2)}
            </div>
          </div>

          {overBudgetTotal > 0 && (
            <button
              type="button"
              onClick={() => setShowOverBudgetReport(true)}
              style={{
                ...summaryCard("danger"),
                color: "#D95555",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <div style={{ fontSize: 10, color: "var(--text-faint)" }}>التجاوز</div>
              <div style={summaryValue("danger")}>
                {overBudgetTotal.toFixed(2)}
              </div>
            </button>
          )}
        </div>

        <ExpenseDonut expenses={state.expenses} mode={expenseChartMode} />
      </div>

      <div style={G.card()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              type="button"
              title="تفاصيل التغير"
              onClick={() => setShowAssetTrendDetails((v) => !v)}
              style={{
                width: 30,
                height: 30,
                borderRadius: 10,
                border: "1px solid rgba(148,163,184,0.28)",
                background: showAssetTrendDetails ? "var(--bg-secondary)" : "var(--bg-secondary)",
                color: "var(--text-body)",
                cursor: "pointer",
                fontWeight: 900,
              }}
            >
              ⓘ
            </button>
            <div
              style={{
                color: assetChangeColor,
                fontSize: 12,
                fontWeight: 900,
                background: assetChange >= 0 ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                border: `1px solid ${assetChange >= 0 ? "rgba(34,197,94,0.35)" : "rgba(239,68,68,0.35)"}`,
                borderRadius: 999,
                padding: "5px 8px",
              }}
            >
              {assetChange >= 0 ? "+" : ""}
              {assetChange.toFixed(2)}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={sectionHeading}>
              تغير الأصول الشهري
            </div>
            <select
              value={assetTrendMonths}
              onChange={(e) => setAssetTrendMonths(Number(e.target.value || 6))}
              style={{
                ...G.inp(),
                width: 112,
                padding: "5px 7px",
                fontSize: 10,
                marginTop: 4,
              }}
            >
              <option value={3}>آخر 3 أشهر</option>
              <option value={6}>آخر 6 أشهر</option>
              <option value={9}>آخر 9 أشهر</option>
              <option value={12}>آخر 12 شهر</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
          <div style={{ background: "var(--bg-secondary)", borderRadius: 10, padding: 9, textAlign: "right" }}>
            <div style={labelText}>الأصول الآن</div>
            <b style={{ ...summaryValue("total"), color: "var(--text-heading)" }}>{Number(lastAssetPoint?.totalAssets || 0).toFixed(2)}</b>
          </div>
          <div style={{ background: "var(--bg-secondary)", borderRadius: 10, padding: 9, textAlign: "right" }}>
            <div style={labelText}>النسبة</div>
            <b style={{ ...summaryValue("total"), color: assetChangeColor }}>
              {assetChange >= 0 ? "+" : ""}
              {assetChangePct.toFixed(1)}%
            </b>
          </div>
        </div>

        <div
          style={{
            height: 96,
            display: "grid",
            gridTemplateColumns: `repeat(${Math.max(assetTrendPoints.length, 1)}, 1fr)`,
            gap: 7,
            alignItems: "end",
            borderTop: "1px solid var(--border-soft)",
            paddingTop: 10,
          }}
        >
          {assetTrendPoints.length ? (
            assetTrendPoints.map((point, index) => {
              const height =
                assetTrendPoints.length === 1
                  ? 54
                  : 28 + ((Number(point.totalAssets || 0) - minAssetTrendValue) / assetTrendRange) * 52;
              const previous = assetTrendPoints[index - 1];
              const pointChange = previous
                ? Number(point.totalAssets || 0) - Number(previous.totalAssets || 0)
                : 0;
              const pointColor =
                index === 0
                  ? "var(--text-disabled)"
                  : pointChange < 0
                  ? "#F07A7A"
                  : pointChange === bestAssetTrendChange && bestAssetTrendChange > 0
                  ? "#60C698"
                  : "#E8A44A";

              return (
                <div key={`${point.month}-${index}`} style={{ textAlign: "center" }}>
                  <div
                    title={`${point.month}: ${Number(point.totalAssets || 0).toFixed(2)}`}
                    style={{
                      height,
                      minHeight: 18,
                      borderRadius: "8px 8px 4px 4px",
                      background: pointColor,
                      border: "none",
                    }}
                  />
                  <div style={{ color: "var(--text-muted)", fontSize: 9, marginTop: 5 }}>
                    {String(point.month || "").slice(5, 7) || "--"}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ color: "var(--text-faint)", fontSize: 12, textAlign: "center" }}>
              لا توجد لقطات شهرية بعد
            </div>
          )}
        </div>
      </div>

      <div style={G.card()}>
        <button
          type="button"
          onClick={() => setShowExpenseReport(true)}
          style={G.btn("linear-gradient(135deg,var(--gold-primary),var(--gold-dark))", "#fff", {
            width: "100%",
            fontSize: 13,
            fontWeight: 800,
          })}
        >
          كشف المصروفات
        </button>

        {false && expenses.map((e, i) => (
          <div
            key={e.id}
            style={{
              ...(i < expenses.length - 1 ? G.row : G.lrow),
              ...(incomeEntryStyle(e.isIncomeEntry) || {}),
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: e.isIncomeEntry ? "#2A9E60" : "var(--text-heading)",
                }}
              >
                {e.isIncomeEntry ? "+" : ""}
                {incomeEntryAmount(e).toFixed(2)} د.أ
              </div>
              <div style={{ fontSize: 10, color: e.isIncomeEntry ? "#2A9E60" : "var(--text-faint)" }}>
                {incomeEntryMeta(e)}
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13 }}>{e.note || e.category}</div>
              <div
                style={{
                  fontSize: 10,
                  color: e.isIncomeEntry ? "#2A9E60" : CC[e.category] || "var(--text-muted)",
                  marginTop: 2,
                }}
              >
                {e.category} | {e.paymentMethod}
              </div>
            </div>
          </div>
        ))}

        {false && !expenses.length && (
          <div
            style={{
              textAlign: "center",
              color: "var(--text-disabled)",
              padding: "20px 0",
              fontSize: 13,
            }}
          >
            لا توجد مصروفات بعد
          </div>
        )}
      </div>

      {showExpenseReport && (
        <div
          onClick={(e) => e.target === e.currentTarget && setShowExpenseReport(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.78)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            zIndex: 555,
          }}
        >
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-soft)",
              borderRadius: "22px 22px 0 0",
              width: "100%",
              maxWidth: 440,
              maxHeight: "82vh",
              overflowY: "auto",
              padding: "18px 16px 28px",
              direction: "rtl",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <button
                type="button"
                onClick={() => setShowExpenseReport(false)}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  border: "1px solid rgba(148,163,184,0.28)",
                  background: "var(--bg-secondary)",
                  color: "var(--text-body)",
                  cursor: "pointer",
                  fontSize: 20,
                }}
              >
                ×
              </button>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "var(--gold-primary)", fontWeight: 900, fontSize: 15 }}>
                  كشف المصروفات
                </div>
                <div style={{ color: "var(--text-faint)", fontSize: 10 }}>
                  {expenses.length} حركة
                </div>
              </div>
            </div>

            {expenses.map((e, i) => (
              <div
                key={e.id}
                style={{
                  ...(i < expenses.length - 1 ? G.row : G.lrow),
                  ...(incomeEntryStyle(e.isIncomeEntry) || {}),
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                      type="button"
                      title="تفاصيل المصروف"
                      onClick={() => {
                        setShowExpenseReport(false);
                        setSelectedExpense(e);
                      }}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 9,
                        border: "1px solid var(--gold-border)",
                        background: "var(--gold-light)",
                        color: "var(--gold-dark)",
                        cursor: "pointer",
                        fontSize: 13,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      ✎
                    </button>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 800,
                        color: e.isIncomeEntry ? "#2A9E60" : "var(--text-heading)",
                      }}
                    >
                      {e.isIncomeEntry ? "+" : ""}
                      {incomeEntryAmount(e).toFixed(2)} د.أ
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: e.isIncomeEntry ? "#2A9E60" : "var(--text-faint)" }}>
                    {incomeEntryMeta(e)}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13 }}>{e.note || e.category}</div>
                  <div
                    style={{
                      fontSize: 10,
                      color: e.isIncomeEntry ? "#2A9E60" : CC[e.category] || "var(--text-muted)",
                      marginTop: 2,
                    }}
                  >
                    {e.category} | {e.paymentMethod}
                  </div>
                </div>
              </div>
            ))}

            {!expenses.length && (
              <div
                style={{
                  textAlign: "center",
                  color: "var(--text-disabled)",
                  padding: "20px 0",
                  fontSize: 13,
                }}
              >
                لا توجد مصروفات بعد
              </div>
            )}
          </div>
        </div>
      )}

      {selectedExpense && (
        <div
          onClick={(e) => e.target === e.currentTarget && setSelectedExpense(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.78)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            zIndex: 559,
          }}
        >
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-soft)",
              borderRadius: "22px 22px 0 0",
              width: "100%",
              maxWidth: 440,
              maxHeight: "82vh",
              overflowY: "auto",
              padding: "18px 16px 28px",
              direction: "rtl",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <button
                type="button"
                onClick={() => setSelectedExpense(null)}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  border: "1px solid rgba(148,163,184,0.28)",
                  background: "var(--bg-secondary)",
                  color: "var(--text-body)",
                  cursor: "pointer",
                  fontSize: 20,
                }}
              >
                ×
              </button>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "var(--gold-primary)", fontWeight: 900, fontSize: 15 }}>
                  تفاصيل المصروف
                </div>
                <div style={{ color: "var(--text-faint)", fontSize: 10 }}>
                  عرض من كشف المصروفات
                </div>
              </div>
            </div>

            {selectedExpenseTotal !== selectedExpenseRecorded && (
              <div
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid rgba(232,201,106,0.22)",
                  borderRadius: 12,
                  padding: 10,
                  marginBottom: 10,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ color: "var(--text-muted)", fontSize: 11 }}>إجمالي المصروف</span>
                  <b>{selectedExpenseTotal.toFixed(2)} د.أ</b>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ color: "var(--text-muted)", fontSize: 11 }}>من سقف الصرف</span>
                  <b style={{ color: "#2A9E60" }}>
                    {Number(selectedExpense.budgetCovered || 0).toFixed(2)} د.أ
                  </b>
                </div>
                {selectedExpenseDebt > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ color: "var(--text-muted)", fontSize: 11 }}>سجل كدين</span>
                    <b style={{ color: "#D95555" }}>{selectedExpenseDebt.toFixed(2)} د.أ</b>
                  </div>
                )}
                {selectedExpenseAsset > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: 11 }}>ممّول من أصل</span>
                    <b style={{ color: "var(--gold-dark)" }}>{selectedExpenseAsset.toFixed(2)} د.أ</b>
                  </div>
                )}
              </div>
            )}

            <div style={G.card()}>
              <div style={G.row}>
                <span style={{ color: "var(--text-muted)" }}>المبلغ</span>
                <b>{Number(selectedExpense.amount || 0).toFixed(2)} د.أ</b>
              </div>
              <div style={G.row}>
                <span style={{ color: "var(--text-muted)" }}>التصنيف</span>
                <b>{selectedExpense.category}</b>
              </div>
              <div style={G.row}>
                <span style={{ color: "var(--text-muted)" }}>طريقة الدفع</span>
                <b>{selectedExpense.paymentMethod}</b>
              </div>
              <div style={G.row}>
                <span style={{ color: "var(--text-muted)" }}>المغطى من السقف</span>
                <b>{Number(selectedExpense.budgetCovered || 0).toFixed(2)} د.أ</b>
              </div>
              <div style={G.row}>
                <span style={{ color: "var(--text-muted)" }}>الملاحظة</span>
                <b>{selectedExpense.note || "بدون ملاحظة"}</b>
              </div>
              <div style={G.lrow}>
                <span style={{ color: "var(--text-muted)" }}>التجاوز</span>
                <b style={{ color: Number(selectedExpense.overBudget || 0) > 0 ? "#D95555" : "var(--text-heading)" }}>
                  {Number(selectedExpense.overBudget || 0).toFixed(2)} د.أ
                </b>
              </div>
            </div>
          </div>
        </div>
      )}

      {showOverBudgetReport && (
        <div
          onClick={(e) => e.target === e.currentTarget && setShowOverBudgetReport(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.78)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            zIndex: 558,
          }}
        >
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-soft)",
              borderRadius: "22px 22px 0 0",
              width: "100%",
              maxWidth: 440,
              maxHeight: "82vh",
              overflowY: "auto",
              padding: "18px 16px 28px",
              direction: "rtl",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <button
                type="button"
                onClick={() => setShowOverBudgetReport(false)}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  border: "1px solid rgba(148,163,184,0.28)",
                  background: "var(--bg-secondary)",
                  color: "var(--text-body)",
                  cursor: "pointer",
                  fontSize: 20,
                }}
              >
                ×
              </button>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "#fecaca", fontWeight: 900, fontSize: 15 }}>
                  تفاصيل التجاوز
                </div>
                <div style={{ color: "var(--text-faint)", fontSize: 10 }}>
                  الإجمالي {overBudgetTotal.toFixed(2)} د.أ
                </div>
              </div>
            </div>

            {overBudgetItems.map((item) => (
              <div
                key={item.id}
                style={{
                  background: "rgba(239,68,68,0.10)",
                  border: "1px solid rgba(239,68,68,0.28)",
                  borderRadius: 12,
                  padding: 10,
                  marginBottom: 8,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <b style={{ color: "#fecaca" }}>
                    {Number(item.overBudget || 0).toFixed(2)} د.أ
                  </b>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "var(--text-heading)", fontSize: 13, fontWeight: 800 }}>
                      {item.category || "مصروف"}
                    </div>
                    <div style={{ color: "var(--text-muted)", fontSize: 10 }}>
                      {item.note || "بدون ملاحظة"}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {!overBudgetItems.length && (
              <div style={{ color: "var(--text-faint)", fontSize: 12, textAlign: "center", padding: 20 }}>
                لا يوجد تجاوز في هذا الشهر
              </div>
            )}
          </div>
        </div>
      )}

      {showAssetTrendDetails && (
        <div
          onClick={(e) => e.target === e.currentTarget && setShowAssetTrendDetails(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.78)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            zIndex: 560,
          }}
        >
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-soft)",
              borderRadius: "22px 22px 0 0",
              width: "100%",
              maxWidth: 440,
              maxHeight: "82vh",
              overflowY: "auto",
              padding: "18px 16px 28px",
              direction: "rtl",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <button
                type="button"
                onClick={() => setShowAssetTrendDetails(false)}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  border: "1px solid rgba(148,163,184,0.28)",
                  background: "var(--bg-secondary)",
                  color: "var(--text-body)",
                  cursor: "pointer",
                  fontSize: 20,
                }}
              >
                ×
              </button>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "var(--gold-primary)", fontWeight: 900, fontSize: 15 }}>
                  تفاصيل تغير الأصول
                </div>
                <div style={{ color: "var(--text-faint)", fontSize: 10 }}>
                  {assetTrendMonths} أشهر
                </div>
              </div>
            </div>

            {assetDetailRows.length ? (
              <>
                <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
                  {assetDetailRows.map((asset) => {
                    const width = Math.max(8, (Math.abs(asset.change) / maxAssetDetailChange) * 100);
                    const isSelected = selectedTrendAsset?.key === asset.key;
                    const color = asset.change >= 0 ? "#22c55e" : "#ef4444";

                    return (
                      <button
                        key={asset.key}
                        type="button"
                        onClick={() => setSelectedTrendAssetKey(asset.key)}
                        style={{
                          border: `1px solid ${isSelected ? color : "var(--bg-secondary)"}`,
                          background: isSelected ? "rgba(201,168,76,0.12)" : "var(--bg-card)",
                          borderRadius: 12,
                          padding: 9,
                          color: "var(--text-heading)",
                          cursor: "pointer",
                          fontFamily: "inherit",
                          textAlign: "right",
                        }}
                      >
                        <div style={{ display: "grid", gridTemplateColumns: "0.8fr 1.2fr", gap: 8, alignItems: "center" }}>
                          <div style={{ textAlign: "left" }}>
                            <b style={{ color }}>
                              {asset.change >= 0 ? "+" : ""}
                              {asset.change.toFixed(2)}
                            </b>
                            <div style={{ color: "var(--text-faint)", fontSize: 10 }}>
                              {asset.change >= 0 ? "نما" : "نقص"}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 800 }}>{asset.label}</div>
                            <div style={{ height: 7, background: "var(--bg-secondary)", borderRadius: 4, marginTop: 6, overflow: "hidden" }}>
                              <div
                                style={{
                                  height: "100%",
                                  width: `${width}%`,
                                  background: color,
                                  borderRadius: 4,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {selectedTrendAsset && (
                  <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-soft)", borderRadius: 12, padding: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <b style={{ color: selectedTrendAsset.change >= 0 ? "#86efac" : "#fecaca" }}>
                        {selectedTrendAsset.change >= 0 ? "+" : ""}
                        {selectedTrendAsset.change.toFixed(2)}
                      </b>
                      <span style={{ color: "var(--text-body)", fontSize: 12 }}>{selectedTrendAsset.label}</span>
                    </div>

                    {selectedTrendAsset.months.map((month) => (
                      <div key={`${selectedTrendAsset.key}-${month.month}`} style={{ borderTop: "1px solid var(--border-soft)", paddingTop: 7, marginTop: 7 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 5 }}>
                          <span style={{ color: month.change >= 0 ? "#86efac" : "#fecaca" }}>
                            {month.change >= 0 ? "+" : ""}
                            {month.change.toFixed(2)}
                          </span>
                          <span style={{ color: "var(--text-muted)" }}>{month.month}</span>
                        </div>

                        {month.reasons.real.length > 0 ? (
                          month.reasons.real.map((reason) => (
                            <div key={`${month.month}-${reason.reason}`} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                              <span style={{ color: "#fecaca" }}>-{reason.amount.toFixed(2)}</span>
                              <span style={{ color: "var(--text-body)" }}>{reason.reason}</span>
                            </div>
                          ))
                        ) : (
                          <div style={{ color: "var(--text-faint)", fontSize: 11, marginBottom: 4 }}>
                            لا يوجد سبب مصروف مباشر مسجل
                          </div>
                        )}

                        {month.reasons.transfers.length > 0 && (
                          <div style={{ marginTop: 6, paddingTop: 6, borderTop: "1px dashed var(--border-soft)" }}>
                            {month.reasons.transfers.map((reason) => (
                              <div key={`${month.month}-${reason.reason}`} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                                <span style={{ color: "#93c5fd" }}>{reason.amount.toFixed(2)}</span>
                                <span style={{ color: "#93c5fd" }}>{reason.reason} · ليست نقصاً فعلياً</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={{ color: "var(--text-faint)", fontSize: 12, textAlign: "center", padding: 20 }}>
                تحتاج إلى إغلاق شهرين على الأقل للمقارنة
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AssetsScreen({ state, setState, onAddExtraCash, readOnly = false }) {
  const assets = calcAssets(state);

  const [showAddAsset, setShowAddAsset] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);

  const [fromAsset, setFromAsset] = useState("cash");
  const [toAsset, setToAsset] = useState("cash");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferAllocations, setTransferAllocations] = useState([
    { id: 1, allocation: "cash", amount: "", targetId: "", assetName: "", units: "", price: "" },
  ]);

  const [assetKind, setAssetKind] = useState("bank");
  const [assetName, setAssetName] = useState("");
  const [assetAmount, setAssetAmount] = useState("");
  const [assetUnits, setAssetUnits] = useState("");
  const [assetPrice, setAssetPrice] = useState("");
  const [openAssetCard, setOpenAssetCard] = useState("cash");

  const sources = getAssetSources(state);

  const bankTotal = (state.assets.banks || []).reduce(
    (sum, b) => sum + Number(b.balance || 0),
    0
  );
  const goldPrice = Number(state.settings.market.goldGramPrice || 0);
  const silverPrice = Number(state.settings.market.silverGramPrice || 0);
  const goldTotal = (state.assets.gold || []).reduce(
    (sum, g) => sum + Number(g.units || 0) * goldPrice,
    0
  );
  const silverTotal = (state.assets.silver || []).reduce(
    (sum, s) => sum + Number(s.units || 0) * silverPrice,
    0
  );
  const stockTotal = (state.assets.stocks || []).reduce(
    (sum, s) => sum + Number(s.units || 0) * Number(s.currentPrice || 0),
    0
  );
  const stockUnitsTotal = (state.assets.stocks || []).reduce(
    (sum, s) => sum + Number(s.units || 0),
    0
  );
  const stockCostTotal = (state.assets.stocks || []).reduce(
    (sum, s) => sum + Number(s.units || 0) * Number(s.wac || 0),
    0
  );
  const stockAverageCost =
    stockUnitsTotal > 0 ? stockCostTotal / stockUnitsTotal : 0;
  const customTotal = (state.assets.custom || []).reduce((sum, c) => {
    if (c.type === "fixed") return sum + Number(c.amount || 0);
    return sum + Number(c.units || 0) * Number(c.price || 0);
  }, 0);

  const openAddAsset = (kind) => {
    setAssetKind(kind);
    setAssetName("");
    setAssetAmount("");
    setAssetUnits("");
    setAssetPrice("");
    setShowAddAsset(true);
  };

  const assetCardStyle = (color) => ({
    ...G.card(`${color}22`),
    padding: "12px",
  });

  const renderAssetHeader = ({ id, icon, title, total, color, addKind }) => {
    const isOpen = openAssetCard === id;

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {!readOnly && addKind && (
            <button
              type="button"
              title="إضافة"
              onClick={(e) => {
                e.stopPropagation();
                openAddAsset(addKind);
              }}
              style={{
                width: 30,
                height: 30,
                borderRadius: 10,
                border: `1px solid ${color}66`,
                background: "var(--bg-secondary)",
                color,
                cursor: "pointer",
                fontWeight: 900,
              }}
            >
              +
            </button>
          )}
          <button
            type="button"
            title={isOpen ? "إخفاء" : "فتح"}
            onClick={() => setOpenAssetCard(isOpen ? "" : id)}
            style={{
              width: 30,
              height: 30,
              borderRadius: 10,
              border: "1px solid var(--border-soft)",
              background: isOpen ? `${color}22` : "var(--bg-secondary)",
              color,
              cursor: "pointer",
              fontWeight: 900,
            }}
          >
            {isOpen ? "-" : "⋯"}
          </button>
        </div>

        <div style={{ textAlign: "right", flex: 1 }}>
          <div style={{ color, fontSize: 14, fontWeight: 900 }}>
            {icon} {title}
          </div>
          <div style={{ fontSize: 21, fontWeight: 900, marginTop: 2 }}>
            {Number(total || 0).toFixed(2)}
            <span style={{ fontSize: 11, color: "var(--text-faint)" }}> د.أ</span>
          </div>
        </div>
      </div>
    );
  };

  const renderEmptyAsset = (text) => (
    <div style={{ textAlign: "center", color: "var(--text-faint)", fontSize: 12, padding: "12px 0 4px" }}>
      {text}
    </div>
  );

  const addNewAsset = () => {
  if (!assetName.trim()) return alert("أدخل اسم الأصل");

  const next = structuredClone(state);
  const id = Date.now();
  const name = assetName.trim();
  let allocationAmount = 0;

  if (assetKind === "bank") {
    const amount = Number(assetAmount || 0);
    if (amount <= 0) return alert("أدخل رصيدًا صحيحًا");
    allocationAmount = amount;

    const existing = next.assets.banks.find(
      (b) => b.name.trim() === name
    );

    if (existing) {
      existing.balance = Number(
        (Number(existing.balance || 0) + amount).toFixed(2)
      );
    } else {
      next.assets.banks.push({
        id,
        name,
        balance: amount,
      });
    }
  }

  if (assetKind === "gold") {
    const newUnits = Number(assetUnits || 0);
    const purchasePrice = Number(
      assetPrice || state.settings.market.goldGramPrice || 0
    );
    if (newUnits <= 0 || purchasePrice <= 0) {
      return alert("أدخل عدد غرامات وسعرًا صحيحًا");
    }
    allocationAmount = newUnits * purchasePrice;

    const existing = next.assets.gold.find(
      (g) => g.label.trim() === name
    );

    if (existing) {
      const oldUnits = Number(existing.units || 0);
      const oldWac = Number(existing.wac || 0);

      const oldValue = oldUnits * oldWac;
      const newValue = newUnits * purchasePrice;
      const totalUnits = oldUnits + newUnits;

      existing.units = Number(totalUnits.toFixed(4));
      existing.wac =
        totalUnits > 0
          ? Number(((oldValue + newValue) / totalUnits).toFixed(4))
          : purchasePrice;
    } else {
      next.assets.gold.push({
        id,
        label: name,
        units: newUnits,
        wac: purchasePrice,
      });
    }
  }

  if (assetKind === "silver") {
    const newUnits = Number(assetUnits || 0);
    const purchasePrice = Number(
      assetPrice || state.settings.market.silverGramPrice || 0
    );
    if (newUnits <= 0 || purchasePrice <= 0) {
      return alert("أدخل عدد غرامات وسعرًا صحيحًا");
    }
    allocationAmount = newUnits * purchasePrice;

    const existing = next.assets.silver.find(
      (s) => s.label.trim() === name
    );

    if (existing) {
      const oldUnits = Number(existing.units || 0);
      const oldWac = Number(existing.wac || 0);

      const oldValue = oldUnits * oldWac;
      const newValue = newUnits * purchasePrice;
      const totalUnits = oldUnits + newUnits;

      existing.units = Number(totalUnits.toFixed(4));
      existing.wac =
        totalUnits > 0
          ? Number(((oldValue + newValue) / totalUnits).toFixed(4))
          : purchasePrice;
    } else {
      next.assets.silver.push({
        id,
        label: name,
        units: newUnits,
        wac: purchasePrice,
      });
    }
  }

  if (assetKind === "stock") {
    const newUnits = Number(assetUnits || 0);
    const purchasePrice = Number(assetPrice || 0);
    if (newUnits <= 0 || purchasePrice <= 0) {
      return alert("أدخل عدد الأسهم وسعرًا صحيحًا");
    }
    allocationAmount = newUnits * purchasePrice;

    const existing = next.assets.stocks.find(
      (s) => s.name.trim() === name
    );

    if (existing) {
      const oldUnits = Number(existing.units || 0);
      const oldWac = Number(existing.wac || 0);

      const oldValue = oldUnits * oldWac;
      const newValue = newUnits * purchasePrice;
      const totalUnits = oldUnits + newUnits;

      existing.units = Number(totalUnits.toFixed(4));
      existing.wac =
        totalUnits > 0
          ? Number(((oldValue + newValue) / totalUnits).toFixed(4))
          : purchasePrice;

      existing.currentPrice = purchasePrice || existing.currentPrice;
    } else {
      next.assets.stocks.push({
        id,
        name,
        units: newUnits,
        wac: purchasePrice,
        currentPrice: purchasePrice,
      });
    }
  }

  if (assetKind === "fixed") {
    const amount = Number(assetAmount || 0);
    if (amount <= 0) return alert("أدخل قيمة صحيحة");
    allocationAmount = amount;

    const existing = next.assets.custom.find(
      (c) => c.name.trim() === name && c.type === "fixed"
    );

    if (existing) {
      existing.amount = Number(
        (Number(existing.amount || 0) + amount).toFixed(2)
      );
    } else {
      next.assets.custom.push({
        id,
        name,
        type: "fixed",
        amount,
      });
    }
  }

  if (assetKind === "unit") {
    const newUnits = Number(assetUnits || 0);
    const purchasePrice = Number(assetPrice || 1);
    if (newUnits <= 0 || purchasePrice <= 0) {
      return alert("أدخل عددًا وسعرًا صحيحًا");
    }
    allocationAmount = newUnits * purchasePrice;

    const existing = next.assets.custom.find(
      (c) => c.name.trim() === name && c.type === "unit"
    );

    if (existing) {
      const oldUnits = Number(existing.units || 0);
      const oldPrice = Number(existing.price || 0);

      const oldValue = oldUnits * oldPrice;
      const newValue = newUnits * purchasePrice;
      const totalUnits = oldUnits + newUnits;

      existing.units = Number(totalUnits.toFixed(4));
      existing.price =
        totalUnits > 0
          ? Number(((oldValue + newValue) / totalUnits).toFixed(4))
          : purchasePrice;
    } else {
      next.assets.custom.push({
        id,
        name,
        type: "unit",
        units: newUnits,
        price: purchasePrice,
      });
    }
  }

  next.transactions.push({
    id,
    type: "positive_cash_allocated_to_asset",
    cashFlow: "positive",
    allocation: "asset",
    assetKind,
    amount: Number((allocationAmount || 0).toFixed(2)),
    date: new Date().toISOString(),
    note: `إضافة/دمج أصل: ${name}`,
  });

  setState(next);

  setShowAddAsset(false);
  setAssetName("");
  setAssetAmount("");
  setAssetUnits("");
  setAssetPrice("");
};

  const transferDestinationOptions = (allocation) => {
    if (allocation === "bank") return state.assets.banks || [];
    if (allocation === "stock") return state.assets.stocks || [];
    if (allocation === "gold") {
      return [
        ...(state.assets.gold || []),
        ...["ذهب 21", "ذهب 24"]
          .filter(
            (label) =>
              !(state.assets.gold || []).some(
                (item) => String(item.label || "").trim() === label
              )
          )
          .map((label) => ({ id: `new:${label}`, label, isPreset: true })),
      ];
    }
    if (allocation === "silver") return state.assets.silver || [];
    if (allocation === "goods") {
      return (state.assets.custom || []).filter((item) => item.type === "unit");
    }
    return [];
  };

  const updateTransferAllocation = (rowId, patch) => {
    setTransferAllocations((rows) =>
      rows.map((row) => (row.id === rowId ? { ...row, ...patch } : row))
    );
  };

  const addTransferAllocationRow = () => {
    setTransferAllocations((rows) => [
      ...rows,
      {
        id: Date.now(),
        allocation: "cash",
        amount: "",
        targetId: "",
        assetName: "",
        units: "",
        price: "",
      },
    ]);
  };

  const removeTransferAllocationRow = (rowId) => {
    setTransferAllocations((rows) =>
      rows.length <= 1 ? rows : rows.filter((row) => row.id !== rowId)
    );
  };

  const applyTransfer = () => {
    const amount = Number(transferAmount || 0);
    if (amount <= 0) return alert("أدخل قيمة المناقلة");
    const now = new Date().toISOString();

    const rows = transferAllocations.map((row) => ({
      ...row,
      amount: Number(row.amount || 0),
      units: Number(row.units || 0),
      price: Number(row.price || 0),
      assetName: String(row.assetName || "").trim(),
    }));

    const allocatedTotal = rows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    if (Math.abs(allocatedTotal - amount) > 0.01) {
      alert("مجموع التوزيع يجب أن يساوي قيمة المناقلة");
      return;
    }

    const deduction = deductFromAsset(state, fromAsset, amount);
    if (!deduction.success) {
      alert(deduction.message);
      return;
    }

    let next = {
      ...deduction.nextState,
      assetHistory: [
        ...(deduction.nextState.assetHistory || []),
        {
          id: `${Date.now()}-out`,
          date: now,
          type: "transfer_out",
          source: "asset_transfer",
          assetKey: fromAsset,
          amount,
          note: "مناقلة من أصل",
        },
      ],
    };

    const addUnitAsset = ({ row, listName, nameField, type }) => {
      if (row.units <= 0 || row.price <= 0) {
        alert("أدخل العدد والسعر لحساب متوسط التكلفة");
        return false;
      }

      if (Math.abs(row.units * row.price - row.amount) > 0.01) {
        alert("مبلغ التوزيع يجب أن يساوي العدد × السعر");
        return false;
      }

      const list = next.assets[listName] || [];
      const existing = row.targetId
        ? list.find((item) => String(item.id) === String(row.targetId))
        : list.find((item) => String(item[nameField] || "").trim() === row.assetName);

      if (existing) {
        const oldUnits = Number(existing.units || 0);
        const oldAverage =
          type === "custom" ? Number(existing.price || 0) : Number(existing.wac || 0);
        const totalUnits = oldUnits + row.units;
        const nextAverage =
          totalUnits > 0
            ? Number(((oldUnits * oldAverage + row.amount) / totalUnits).toFixed(4))
            : row.price;

        existing.units = Number(totalUnits.toFixed(4));
        if (type === "custom") existing.price = nextAverage;
        else existing.wac = nextAverage;
        if (listName === "stocks") existing.currentPrice = row.price;
        next.assetHistory.push({
          id: `${Date.now()}-${row.id}`,
          date: now,
          type: "transfer_in_units",
          source: "asset_transfer",
          assetKind: listName,
          assetId: existing.id,
          assetName: existing.name || existing.label,
          amount: row.amount,
          unitsAdded: row.units,
          unitPrice: row.price,
          unitsBefore: oldUnits,
          unitsAfter: Number(totalUnits.toFixed(4)),
          averageBefore: oldAverage,
          averageAfter: nextAverage,
        });
      } else {
        if (!row.assetName) {
          alert("أدخل اسم الأصل الجديد");
          return false;
        }

        const id = Date.now() + Math.floor(Math.random() * 1000);
        if (listName === "stocks") {
          list.push({
            id,
            name: row.assetName,
            units: row.units,
            wac: row.price,
            currentPrice: row.price,
          });
        } else if (listName === "custom") {
          list.push({
            id,
            name: row.assetName,
            type: "unit",
            units: row.units,
            price: row.price,
          });
        } else {
          list.push({
            id,
            label: row.assetName,
            units: row.units,
            wac: row.price,
          });
        }
        next.assetHistory.push({
          id: `${Date.now()}-${row.id}`,
          date: now,
          type: "transfer_in_units",
          source: "asset_transfer",
          assetKind: listName,
          assetId: id,
          assetName: row.assetName,
          amount: row.amount,
          unitsAdded: row.units,
          unitPrice: row.price,
          unitsBefore: 0,
          unitsAfter: row.units,
          averageBefore: 0,
          averageAfter: row.price,
        });
      }

      next.assets[listName] = list;
      return true;
    };

    for (const row of rows) {
      if (row.amount <= 0) {
        alert("أدخل مبلغًا صحيحًا لكل توزيع");
        return;
      }

      if (row.allocation === "spendingCap") {
        next.session.spendingCap = Number(next.session.spendingCap || 0) + row.amount;
        next.assetHistory.push({
          id: `${Date.now()}-${row.id}`,
          date: now,
          type: "transfer_to_spending_cap",
          source: "asset_transfer",
          amount: row.amount,
          note: "توزيع من أصل إلى سقف الصرف",
        });
      }

      if (row.allocation === "cash") {
        next.assets.cash = Number((Number(next.assets.cash || 0) + row.amount).toFixed(2));
        next.assetHistory.push({
          id: `${Date.now()}-${row.id}`,
          date: now,
          type: "transfer_to_cash",
          source: "asset_transfer",
          assetKind: "cash",
          amount: row.amount,
          balanceAfter: next.assets.cash,
        });
      }

      if (row.allocation === "bank") {
        const existing = row.targetId
          ? (next.assets.banks || []).find((bank) => String(bank.id) === String(row.targetId))
          : (next.assets.banks || []).find(
              (bank) => String(bank.name || "").trim() === row.assetName
            );

        if (existing) {
          existing.balance = Number((Number(existing.balance || 0) + row.amount).toFixed(2));
          next.assetHistory.push({
            id: `${Date.now()}-${row.id}`,
            date: now,
            type: "transfer_to_bank",
            source: "asset_transfer",
            assetKind: "bank",
            assetId: existing.id,
            assetName: existing.name,
            amount: row.amount,
            balanceAfter: existing.balance,
          });
        } else {
          if (!row.assetName) return alert("أدخل اسم البنك");
          const id = Date.now() + Math.floor(Math.random() * 1000);
          next.assets.banks.push({
            id,
            name: row.assetName,
            balance: row.amount,
          });
          next.assetHistory.push({
            id: `${Date.now()}-${row.id}`,
            date: now,
            type: "transfer_to_bank",
            source: "asset_transfer",
            assetKind: "bank",
            assetId: id,
            assetName: row.assetName,
            amount: row.amount,
            balanceAfter: row.amount,
          });
        }
      }

      if (row.allocation === "stock") {
        if (!addUnitAsset({ row, listName: "stocks", nameField: "name", type: "stock" })) return;
      }

      if (row.allocation === "gold") {
        if (!addUnitAsset({ row, listName: "gold", nameField: "label", type: "metal" })) return;
      }

      if (row.allocation === "silver") {
        if (!addUnitAsset({ row, listName: "silver", nameField: "label", type: "metal" })) return;
      }

      if (row.allocation === "goods") {
        if (!addUnitAsset({ row, listName: "custom", nameField: "name", type: "custom" })) return;
      }
    }

    next.transactions.push({
      id: Date.now(),
      type: "asset_transfer_split",
      fromAsset,
      amount,
      allocations: rows,
      date: new Date().toISOString(),
    });

    setState(next);
    setShowTransfer(false);
    setTransferAmount("");
    setTransferAllocations([
      { id: 1, allocation: "cash", amount: "", targetId: "", assetName: "", units: "", price: "" },
    ]);
  };

  return (
    <div style={G.scr}>
      {!readOnly && (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 44px", gap: 8, marginBottom: 12 }}>
        <button
          onClick={onAddExtraCash}
          style={{
            background: "#22c55e",
            color: "white",
            padding: "9px 14px",
            fontSize: 12,
            border: "0",
            borderRadius: 12,
            cursor: "pointer",
            width: "100%",
          }}
        >
          + دخل إضافي
        </button>
        <button
          type="button"
          title="مناقلة"
          onClick={() => setShowTransfer(true)}
          style={{
            width: 44,
            height: 38,
            borderRadius: 12,
            border: "1px solid var(--border-soft)",
            background: "var(--bg-secondary)",
            color: "var(--text-body)",
            cursor: "pointer",
            fontWeight: 900,
          }}
        >
          {ICONS.transfer}
        </button>
      </div>
      )}

      <div style={{ ...G.card("rgba(201,168,76,0.14)"), textAlign: "right" }}>
        <div style={{ fontSize: 12, color: "var(--gold-primary)" }}>إجمالي الأصول</div>
        <div style={{ fontSize: 32, fontWeight: 900 }}>
          {assets.totalAssets.toFixed(2)}{" "}
          <span style={{ fontSize: 13, color: "var(--text-faint)" }}>د.أ</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
          <div style={summaryCard("success")}>
            <div style={{ fontSize: 10, color: "var(--text-faint)" }}>ادخار سائل</div>
            <b style={summaryValue("success")}>{(Number(state.assets.cash || 0) + bankTotal).toFixed(2)}</b>
          </div>
          <div style={summaryCard("total")}>
            <div style={{ fontSize: 10, color: "var(--text-muted)" }}>صافي</div>
            <b style={summaryValue("total")}>{assets.netWorth.toFixed(2)}</b>
          </div>
        </div>
      </div>

      <div style={assetCardStyle("#22c55e")}>
        {renderAssetHeader({
          id: "cash",
          icon: ICONS.cash,
          title: "الكاش الاحتياطي",
          total: Number(state.assets.cash || 0),
          color: "#22c55e",
        })}
        {openAssetCard === "cash" && (
          <div style={{ ...G.lrow, marginTop: 8 }}>
            <strong>{Number(state.assets.cash || 0).toFixed(2)} د.أ</strong>
            <span style={{ color: "var(--text-muted)", fontSize: 12 }}>ادخار نقدي</span>
          </div>
        )}
      </div>

      <div style={assetCardStyle("#3b82f6")}>
        {renderAssetHeader({
          id: "banks",
          icon: ICONS.bank,
          title: "الحسابات البنكية",
          total: bankTotal,
          color: "#3b82f6",
        })}
        {openAssetCard === "banks" && (
          <div style={{ marginTop: 8 }}>
            {(state.assets.banks || []).map((b, i) => (
              <div key={b.id} style={i < state.assets.banks.length - 1 ? G.row : G.lrow}>
                <strong>{Number(b.balance || 0).toFixed(2)} د.أ</strong>
                <span>{b.name}</span>
              </div>
            ))}
            {!state.assets.banks?.length && renderEmptyAsset("لا توجد حسابات")}
          </div>
        )}
      </div>

      <div style={assetCardStyle("#a855f7")}>
        {renderAssetHeader({
          id: "stocks",
          icon: ICONS.stock,
          title: "الأسهم",
          total: stockTotal,
          color: "#a855f7",
        })}
        <div style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "right", marginTop: 6 }}>
          {stockUnitsTotal.toFixed(4)} سهم · متوسط {stockAverageCost.toFixed(4)}
        </div>
        {openAssetCard === "stocks" && (
          <div style={{ marginTop: 8 }}>
            {(state.assets.stocks || []).map((s, i) => {
              const value = Number(s.units || 0) * Number(s.currentPrice || 0);

              return (
                <div key={s.id} style={i < state.assets.stocks.length - 1 ? G.row : G.lrow}>
                  <div>
                    <strong>{value.toFixed(2)} د.أ</strong>
                    <div style={{ fontSize: 10, color: "var(--text-faint)" }}>
                      {Number(s.units || 0).toFixed(4)} سهم · سعر {Number(s.currentPrice || 0).toFixed(4)} · متوسط {Number(s.wac || 0).toFixed(4)}
                    </div>
                  </div>
                  <span>{s.name}</span>
                </div>
              );
            })}
            {!state.assets.stocks?.length && renderEmptyAsset("لا توجد أسهم")}
          </div>
        )}
      </div>

      <div style={assetCardStyle("#f59e0b")}>
        {renderAssetHeader({
          id: "gold",
          icon: ICONS.gold,
          title: "الذهب",
          total: goldTotal,
          color: "#f59e0b",
        })}
        {openAssetCard === "gold" && (
          <div style={{ marginTop: 8 }}>
            {(state.assets.gold || []).map((g, i) => {
              const value = Number(g.units || 0) * goldPrice;

              return (
                <div key={g.id} style={i < state.assets.gold.length - 1 ? G.row : G.lrow}>
                  <div>
                    <strong>{value.toFixed(2)} د.أ</strong>
                    <div style={{ fontSize: 10, color: "var(--text-body)", fontWeight: 700 }}>
                      {Number(g.units || 0).toFixed(4)} غ · متوسط {Number(g.wac || 0).toFixed(4)}
                    </div>
                  </div>
                  <span>{g.label}</span>
                </div>
              );
            })}
            {!state.assets.gold?.length && renderEmptyAsset("لا يوجد ذهب")}
          </div>
        )}
      </div>

      <div style={assetCardStyle("var(--text-muted)")}>
        {renderAssetHeader({
          id: "silver",
          icon: ICONS.silver,
          title: "الفضة",
          total: silverTotal,
          color: "var(--text-muted)",
        })}
        {openAssetCard === "silver" && (
          <div style={{ marginTop: 8 }}>
            {(state.assets.silver || []).map((s, i) => {
              const value = Number(s.units || 0) * silverPrice;

              return (
                <div key={s.id} style={i < state.assets.silver.length - 1 ? G.row : G.lrow}>
                  <div>
                    <strong>{value.toFixed(2)} د.أ</strong>
                    <div style={{ fontSize: 10, color: "var(--text-faint)" }}>
                      {Number(s.units || 0).toFixed(4)} غ · سعر {silverPrice.toFixed(4)} · متوسط {Number(s.wac || 0).toFixed(4)}
                    </div>
                  </div>
                  <span>{s.label}</span>
                </div>
              );
            })}
            {!state.assets.silver?.length && renderEmptyAsset("لا توجد فضة")}
          </div>
        )}
      </div>

      <div style={assetCardStyle("var(--text-faint)")}>
        {renderAssetHeader({
          id: "custom",
          icon: ICONS.goods,
          title: "بضائع / أخرى",
          total: customTotal,
          color: "var(--text-muted)",
        })}
        {openAssetCard === "custom" && (
          <div style={{ marginTop: 8 }}>
            {(state.assets.custom || []).map((c, i) => {
              const value =
                c.type === "fixed"
                  ? Number(c.amount || 0)
                  : Number(c.units || 0) * Number(c.price || 0);

              return (
                <div key={c.id} style={i < state.assets.custom.length - 1 ? G.row : G.lrow}>
                  <div>
                    <strong>{value.toFixed(2)} د.أ</strong>
                    {c.type === "unit" && (
                      <div style={{ fontSize: 10, color: "var(--text-faint)" }}>
                        {Number(c.units || 0).toFixed(4)} وحدة · سعر {Number(c.price || 0).toFixed(4)}
                      </div>
                    )}
                  </div>
                  <span>{c.name}</span>
                </div>
              );
            })}
            {!state.assets.custom?.length && renderEmptyAsset("لا توجد بضائع")}
          </div>
        )}
      </div>

      {showAddAsset && (
        <div
          onClick={(e) => e.target === e.currentTarget && setShowAddAsset(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            zIndex: 400,
          }}
        >
          <div
            style={{
              position: "relative",
              background: "var(--bg-card)",
              borderRadius: "22px 22px 0 0",
              border: "1px solid var(--border-soft)",
              padding: "22px 18px 44px",
              width: "100%",
              maxWidth: 440,
              direction: "rtl",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <button
                onClick={() => setShowAddAsset(false)}
                style={G.btn("var(--bg-secondary)", "var(--text-muted)", {
                  padding: "5px 12px",
                  borderRadius: 8,
                })}
              >
                ✕
              </button>
              <span style={{ fontSize: 15, fontWeight: 700 }}>
                ➕ أصل جديد
              </span>
            </div>

            <select
              value={assetKind}
              onChange={(e) => setAssetKind(e.target.value)}
              style={{ ...G.inp(), marginBottom: 10 }}
            >
              <option value="bank">حساب بنكي</option>
              <option value="gold">ذهب</option>
              <option value="silver">فضة</option>
              <option value="stock">أسهم</option>
              <option value="fixed">أصل مبلغ ثابت</option>
              <option value="unit">أصل وحدات مخصص</option>
            </select>

            <input
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
              placeholder="اسم الأصل"
              style={{ ...G.inp(), marginBottom: 10 }}
            />

            {(assetKind === "bank" || assetKind === "fixed") && (
              <input
                type="number"
                value={assetAmount}
                onChange={(e) => setAssetAmount(e.target.value)}
                placeholder="القيمة / الرصيد"
                style={{ ...G.inp(), marginBottom: 10 }}
              />
            )}

            {["gold", "silver", "stock", "unit"].includes(assetKind) && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                <input
                  type="number"
                  value={assetUnits}
                  onChange={(e) => setAssetUnits(e.target.value)}
                  placeholder="عدد الوحدات"
                  style={G.inp()}
                />
                <input
                  type="number"
                  value={assetPrice}
                  onChange={(e) => setAssetPrice(e.target.value)}
                  placeholder="سعر الوحدة"
                  style={G.inp()}
                />
              </div>
            )}

            <button
              onClick={addNewAsset}
              style={G.btn("linear-gradient(135deg,var(--gold-primary),var(--gold-border))", "var(--text-heading)", {
                width: "100%",
              })}
            >
              ✓ إضافة الأصل
            </button>
          </div>
        </div>
      )}

      {showTransfer && (
        <div
          onClick={(e) => e.target === e.currentTarget && setShowTransfer(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            zIndex: 450,
          }}
        >
          <div
            style={{
              background: "var(--bg-card)",
              borderRadius: "22px 22px 0 0",
              border: "1px solid var(--border-soft)",
              padding: "22px 18px 44px",
              width: "100%",
              maxWidth: 440,
              direction: "rtl",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <button
                onClick={() => setShowTransfer(false)}
                style={G.btn("var(--bg-secondary)", "var(--text-muted)", {
                  padding: "5px 12px",
                  borderRadius: 8,
                })}
              >
                ✕
              </button>

              <span style={{ fontSize: 15, fontWeight: 700 }}>
                ⇄ مناقلة بين الأصول
              </span>
            </div>

            <label style={{ fontSize: 11, color: "var(--text-faint)" }}>من أصل</label>
            <select
              value={fromAsset}
              onChange={(e) => setFromAsset(e.target.value)}
              style={{ ...G.inp(), marginBottom: 10 }}
            >
              {sources.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label} — متاح {Number(s.available || 0).toFixed(2)} د.أ
                </option>
              ))}
            </select>

            <input
              type="number"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              placeholder="قيمة المناقلة"
              style={{ ...G.inp(), marginBottom: 12 }}
            />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <button
                type="button"
                onClick={addTransferAllocationRow}
                style={G.btn("var(--bg-secondary)", "var(--text-body)", { padding: "7px 10px", fontSize: 12 })}
              >
                +
              </button>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>توزيع القيمة</div>
            </div>

            {transferAllocations.map((row) => {
              const needsUnits = ["stock", "gold", "silver", "goods"].includes(row.allocation);
              const needsName = ["bank", "stock", "gold", "silver", "goods"].includes(row.allocation);
              const options = transferDestinationOptions(row.allocation);

              return (
                <div
                  key={row.id}
                  style={{
                    border: "1px solid var(--border-soft)",
                    borderRadius: 12,
                    padding: 10,
                    marginBottom: 10,
                    background: "var(--bg-card)",
                  }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "42px 1fr", gap: 8, marginBottom: 8 }}>
                    <button
                      type="button"
                      onClick={() => removeTransferAllocationRow(row.id)}
                      style={G.iconBtn(false, "#ef4444")}
                    >
                      ×
                    </button>
                    <select
                      value={row.allocation}
                      onChange={(e) =>
                        updateTransferAllocation(row.id, {
                          allocation: e.target.value,
                          targetId: "",
                          assetName: "",
                          units: "",
                          price: "",
                        })
                      }
                      style={G.inp()}
                    >
                      <option value="cash">كاش احتياطي</option>
                      <option value="spendingCap">سقف الصرف</option>
                      <option value="bank">حساب بنكي</option>
                      <option value="stock">أسهم</option>
                      <option value="gold">ذهب</option>
                      <option value="silver">فضة</option>
                      <option value="goods">بضاعة</option>
                    </select>
                  </div>

                  <input
                    type="number"
                    value={row.amount}
                    onChange={(e) => updateTransferAllocation(row.id, { amount: e.target.value })}
                    placeholder="المبلغ"
                    style={{ ...G.inp(), marginBottom: 8 }}
                  />

                  {options.length > 0 && (
                    <select
                      value={row.targetId}
                      onChange={(e) => {
                        const value = e.target.value;
                        const preset = options.find((item) => String(item.id) === value && item.isPreset);
                        if (preset) {
                          updateTransferAllocation(row.id, {
                            targetId: "",
                            assetName: preset.label,
                          });
                          return;
                        }
                        updateTransferAllocation(row.id, { targetId: value, assetName: "" });
                      }}
                      style={{ ...G.inp(), marginBottom: 8 }}
                    >
                      <option value="">أصل جديد</option>
                      {options.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name || item.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {needsName && !row.targetId && (
                    <input
                      value={row.assetName}
                      onChange={(e) => updateTransferAllocation(row.id, { assetName: e.target.value })}
                      placeholder={row.allocation === "gold" ? "مثال: ذهب 21" : "اسم الأصل"}
                      style={{ ...G.inp(), marginBottom: 8 }}
                    />
                  )}

                  {needsUnits && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <input
                        type="number"
                        value={row.units}
                        onChange={(e) => updateTransferAllocation(row.id, { units: e.target.value })}
                        placeholder={row.allocation === "stock" ? "عدد الأسهم" : "عدد الوحدات"}
                        style={G.inp()}
                      />
                      <input
                        type="number"
                        value={row.price}
                        onChange={(e) => updateTransferAllocation(row.id, { price: e.target.value })}
                        placeholder="سعر الشراء"
                        style={G.inp()}
                      />
                    </div>
                  )}
                </div>
              );
            })}

            <button
              onClick={applyTransfer}
              style={G.btn("linear-gradient(135deg,var(--gold-primary),var(--gold-border))", "var(--text-heading)", {
                width: "100%",
              })}
            >
              تنفيذ المناقلة
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function LiabilitiesScreen({ state, setState, focusDueOnly = false }) {
  const [showStructuralDetails, setShowStructuralDetails] = useState(false);
const [showCurrentDetails, setShowCurrentDetails] = useState(false);

const structuralList = state.structural || state.structuralLiabilities || [];
const currentList = state.currentLiabilities || [];


const isDueThisMonth = (item) => {
  if (!item.dueDate) return false;

  const due = new Date(item.dueDate);
  const now = new Date();

  return (
    due.getFullYear() === now.getFullYear() &&
    due.getMonth() === now.getMonth()
  );
};

const getDueValue = (item) => {
  if (isDueThisMonth(item) && item.status !== "paid") return 0;
  if (item.dueDate) return new Date(item.dueDate).getTime();
  return 999999999;
};

const sortedCurrent = [...currentList]
  .filter((item) => item.status !== "paid")
  .filter((item) => !focusDueOnly || isDueThisMonth(item))
  .sort(
  (a, b) => getDueValue(b) - getDueValue(a)
);
  const structuralTotal = calcStructuralTotal(state);

  const pendingCurrent = currentList.filter(
  (l) => l.status !== "paid"
);
const getCurrentDebtBalance = (l) => {
  if (l.type === "card") return Number(l.balance || 0);
  return Number(l.balance ?? l.amount ?? 0);
};

const getDueAmountThisMonth = (l) => {
  return Number(
    l.dueThisMonth ??
      l.monthlyDue ??
      l.installment ??
      l.minimumPayment ??
      l.amount ??
      0
  );
};

const currentMonthKey =
  state.currentMonth || new Date().toISOString().slice(0, 7);



const currentDebtTotal = pendingCurrent.reduce(
  (sum, l) => sum + getCurrentDebtBalance(l),
  0
);

const dueThisMonthList = pendingCurrent.filter(isDueThisMonth);

const dueThisMonthTotal = dueThisMonthList.reduce(
  (sum, l) => sum + getDueAmountThisMonth(l),
  0
);

const futureCurrentList = pendingCurrent.filter((l) => !isDueThisMonth(l));
const [cardName, setCardName] = useState("");
const [cardBalance, setCardBalance] = useState("");
const [cardLimit, setCardLimit] = useState("");
const [cardDueDate, setCardDueDate] = useState("");
const [showAddCard, setShowAddCard] = useState(false);
const [selectedCardId, setSelectedCardId] = useState("");
const [cardMode, setCardMode] = useState("");
const [openCurrentId, setOpenCurrentId] = useState(null);
const [liabilityAssetKey, setLiabilityAssetKey] = useState("cash");
const [editCardName, setEditCardName] = useState("");
const [editCardBalance, setEditCardBalance] = useState("");

useEffect(() => {
  if (focusDueOnly) {
    setShowCurrentDetails(true);
  }
}, [focusDueOnly]);

const addCreditCard = () => {
  if (!cardName.trim()) return alert("أدخل اسم البطاقة");

  const balance = Number(cardBalance || 0);
  const creditLimit = Number(cardLimit || 0);
  if (creditLimit <= 0) return alert("أدخل سقف البطاقة الائتمانية");
  if (balance > creditLimit) return alert("رصيد البطاقة الحالي لا يجوز أن يتجاوز سقفها");
  if (!cardDueDate) return alert("أدخل تاريخ استحقاق البطاقة");
  if (balance < 0) return alert("رصيد البطاقة لا يجوز أن يكون سالبًا");

  setState((p) => ({
    ...p,
    currentLiabilities: [
      ...(p.currentLiabilities || []),
      {
        id: Date.now(),
        type: "card",
        name: cardName.trim(),
        amount: balance,
        balance,
        creditLimit,
        payableBuffer: 0,
        uncoveredDebt: balance,
        dueDate: cardDueDate,
        dueDay: new Date(cardDueDate).getDate(),
        status: "active",
        source: "manual_card",
        createdAt: new Date().toISOString(),
        date: new Date().toISOString().split("T")[0],
      },
    ],
  }));

  setCardName("");
  setCardBalance("");
  setCardLimit("");
  setCardDueDate("");
  setShowAddCard(false);
};

const deleteCreditCard = (id) => {
  const card = (state.currentLiabilities || []).find((item) => item.id === id);
  if (!card) return;

  const balance = Number(card.balance || 0);

  if (balance > 0) {
    return alert("لا يمكن حذف بطاقة عليها رصيد. يجب تصفير الرصيد أولًا.");
  }

  if (!window.confirm("هل تريد حذف هذه البطاقة؟")) return;

  setState((p) => ({
    ...p,
    currentLiabilities: (p.currentLiabilities || []).filter(
      (item) => item.id !== id
    ),
  }));
};
const deleteSelectedCreditCard = () => {
  if (!selectedCardId) return alert("اختر البطاقة المراد حذفها");

  deleteCreditCard(Number(selectedCardId));
  setSelectedCardId("");
};
const saveEditCreditCard = () => {
  if (!selectedCardId) return alert("اختر البطاقة المراد تعديلها");
  if (!editCardName.trim()) return alert("أدخل اسم البطاقة");

  const balance = Number(editCardBalance || 0);
  if (balance < 0) return alert("الرصيد لا يجوز أن يكون سالبًا");

  setState((p) => ({
    ...p,
    currentLiabilities: (p.currentLiabilities || []).map((item) =>
      String(item.id) === String(selectedCardId)
        ? {
            ...item,
            name: editCardName.trim(),
            amount: balance,
            balance,
            uncoveredDebt: balance,
            updatedAt: new Date().toISOString(),
          }
        : item
    ),
  }));

  setSelectedCardId("");
  setEditCardName("");
  setEditCardBalance("");
  setCardMode("");
};
const prepareEditCreditCard = (id) => {
  setSelectedCardId(id);

  const card = (state.currentLiabilities || []).find(
    (item) => String(item.id) === String(id)
  );

  if (!card) {
    setEditCardName("");
    setEditCardBalance("");
    return;
  }

  setEditCardName(card.name || "");
  setEditCardBalance(String(card.balance || card.amount || 0));
};

  const getPostponeParts = (item) => {
    const source =
      item.newDueDate ||
      item.dueDate ||
      new Date().toISOString().slice(0, 10);
    const [year, month, day] = String(source).split("-");
    return {
      year: year || String(new Date().getFullYear()),
      month: month || "01",
      day: day || "01",
    };
  };
  const setPostponePart = (liabilityId, part, value) => {
    setState((prev) => ({
      ...prev,
      currentLiabilities: prev.currentLiabilities.map((liability) => {
        if (liability.id !== liabilityId) return liability;
        const parts = getPostponeParts(liability);
        const nextParts = { ...parts, [part]: value };
        return {
          ...liability,
          newDueDate: `${nextParts.year}-${nextParts.month}-${nextParts.day}`,
        };
      }),
    }));
  };
  const confirmPostponeDate = (liabilityId) => {
    setState((prev) => ({
      ...prev,
      currentLiabilities: prev.currentLiabilities.map((liability) =>
        liability.id === liabilityId
          ? {
              ...liability,
              dueDate: liability.newDueDate || liability.dueDate,
              dueDay: Number(
                String(liability.newDueDate || liability.dueDate || "")
                  .split("-")[2] || liability.dueDay || 1
              ),
              newDueDate: "",
              paymentMethod: "",
            }
          : liability
      ),
    }));
  };

  const totalCurrent = pendingCurrent.reduce((sum, l) => {
    if (l.type === "card") return sum + Number(l.balance || 0);
    return sum + Number(l.balance ?? l.amount ?? 0);
  }, 0);

  const getLiabilityAmount = (l) => {
    if (l.type === "card") return Number(l.balance || 0);
    return Number(l.balance ?? l.amount ?? 0);
  };

  const getTypeLabel = (l) => {
    if (l.type === "card") return "بطاقة";
    if (l.type === "over_budget") return "تجاوز سقف الصرف";
    if (l.type === "personal") return "شخصي";
    if (l.type === "loan") return "قرض";
    return l.type || "أخرى";
  };

  const getTypeColor = (l) => {
    if (l.type === "card") return "#3b82f6";
    if (l.type === "over_budget") return "#ef4444";
    if (l.type === "personal") return "#f59e0b";
    return "var(--text-muted)";
  };

  const getStatusLabel = (status) => {
    if (status === "paid") return "مسدد";
    if (status === "overdue") return "متأخر";
    if (status === "pending") return "مستحق";
    return status || "غير محدد";
  };

  const getStructuralAmount = (item) =>
    Number(item.monthlyAmount ?? item.monthly ?? item.amount ?? 0);
  const liabilityAssetSources = getAssetSources(state);
  const getCoveredAmount = (item) => Math.max(0, Number(item.payableBuffer || 0));
  const getUncoveredAmount = (item) => {
    const balance = getLiabilityAmount(item);
    const explicit = Number(item.uncoveredDebt || 0);
    const actualGap = Math.max(0, balance - getCoveredAmount(item));
    return explicit > 0 ? Math.min(explicit, actualGap) : actualGap;
  };
  const getDueText = (item) =>
    item.dueDate ? formatDate(item.dueDate) : item.dueDay ? `يوم ${item.dueDay}` : "غير محدد";
  const coveredCurrentTotal = pendingCurrent.reduce(
    (sum, item) => sum + getCoveredAmount(item),
    0
  );
  const uncoveredCurrentTotal = pendingCurrent.reduce(
    (sum, item) => sum + getUncoveredAmount(item),
    0
  );
  const updateCurrentPaymentMethod = (liability, value) => {
    setState((prev) => ({
      ...prev,
      currentLiabilities: prev.currentLiabilities.map((item) =>
        item.id === liability.id ? { ...item, paymentMethod: value } : item
      ),
    }));
  };
  const payCurrentFromReserved = (liability) => {
    const amount = Math.min(
      getLiabilityAmount(liability),
      Math.max(0, Number(liability.payableBuffer || 0))
    );
    if (amount <= 0) return;

    setState((prev) => ({
      ...prev,
      currentLiabilities: prev.currentLiabilities.map((item) =>
        item.id === liability.id
          ? (() => {
              const nextBalance = Math.max(
                0,
                Number((Number(item.balance || item.amount || 0) - amount).toFixed(2))
              );
              return {
                ...item,
                balance: nextBalance,
                amount: item.type === "card" ? item.amount : nextBalance,
                payableBuffer: Math.max(
                  0,
                  Number((Number(item.payableBuffer || 0) - amount).toFixed(2))
                ),
                status: nextBalance <= 0 ? "paid" : "pending",
                paymentMethod: "",
              };
            })()
          : item
      ),
      transactions: [
        ...(prev.transactions || []),
        {
          id: Date.now(),
          type: "liability_paid_from_reserved_cap",
          amount,
          liabilityId: liability.id,
          date: new Date().toISOString(),
        },
      ],
    }));
  };
  const payCurrentFromCap = (liability) => {
    setState((prev) => {
      const current = (prev.currentLiabilities || []).find(
        (item) => item.id === liability.id
      );

      if (!current || current.status === "paid") return prev;

      const amount =
        current.type === "card"
          ? Number(current.balance || 0)
          : Number(current.balance ?? current.amount ?? 0);
      const covered = Math.min(amount, Math.max(0, Number(current.payableBuffer || 0)));
      const remainingCap = Math.max(
        0,
        Number(prev.session?.spendingCap || 0) -
          Number(prev.session?.coveredSpent || 0)
      );
      const availableForPayment = remainingCap + covered;
      const capCharge = Math.max(0, amount - covered);

      if (amount <= 0) return prev;

      if (availableForPayment < amount) {
        alert("سقف الصرف لا يغطي هذا السداد");
        return prev;
      }

      const now = new Date().toISOString();
      const expenseId = Date.now();
      const creditorName = current.name || "دائن";
      const overBudgetRelief = Math.min(
        Number(prev.session?.overBudgetSpent || 0),
        Math.max(0, Number(current.uncoveredDebt || 0)),
        capCharge
      );

      return {
        ...prev,
        session: {
          ...prev.session,
          coveredSpent: Number(
            (Number(prev.session?.coveredSpent || 0) + capCharge).toFixed(2)
          ),
          overBudgetSpent: Math.max(
            0,
            Number((Number(prev.session?.overBudgetSpent || 0) - overBudgetRelief).toFixed(2))
          ),
        },
        expenses: [
          ...(prev.expenses || []),
          {
            id: expenseId,
            amount,
            category: "سداد التزام",
            paymentMethod: "cap_liability",
            note: `سداد من سقف الصرف - ${current.name || "التزام"}`,
            date: now.slice(0, 10),
            createdAt: now,
            budgetCovered: capCharge,
            overBudget: 0,
            isOverBudget: false,
            liabilityId: current.id,
            category: "سداد دين",
            note: creditorName,
          },
        ],
        currentLiabilities: (prev.currentLiabilities || []).map((item) =>
          item.id === current.id
            ? {
                ...item,
                amount: item.type === "card" ? item.amount : 0,
                balance: 0,
                payableBuffer: 0,
                uncoveredDebt: 0,
                status: "paid",
                paymentMethod: "",
                paidAt: now,
              }
            : item
        ),
        transactions: [
          ...(prev.transactions || []),
          {
            id: expenseId + 1,
            type: "liability_paid_from_cap",
            amount,
            capCharge,
            liabilityId: current.id,
            expenseId,
            date: now,
          },
        ],
      };
    });
    setOpenCurrentId(null);
  };
  const payCurrentFromAsset = (liability) => {
    setState((prev) => {
      const current = (prev.currentLiabilities || []).find(
        (item) => item.id === liability.id
      );

      if (!current || current.status === "paid") return prev;

      const amount =
        current.type === "card"
          ? Number(current.balance || 0)
          : Number(current.balance ?? current.amount ?? 0);

      if (amount <= 0) return prev;

      const deduction = deductFromAsset(prev, liabilityAssetKey, amount);
      if (!deduction.success) {
        alert(deduction.message);
        return prev;
      }

      return {
        ...deduction.nextState,
        currentLiabilities: (deduction.nextState.currentLiabilities || []).map((item) =>
          item.id === liability.id
            ? {
                ...item,
                amount: item.type === "card" ? item.amount : 0,
                balance: 0,
                payableBuffer: 0,
                uncoveredDebt: 0,
                status: "paid",
                paymentMethod: "",
                paidAt: new Date().toISOString(),
              }
            : item
        ),
        transactions: [
          ...(deduction.nextState.transactions || []),
          {
            id: Date.now(),
            type: "liability_paid_from_asset",
            amount,
            assetKey: liabilityAssetKey,
            liabilityId: liability.id,
            date: new Date().toISOString(),
          },
        ],
      };
    });
    setOpenCurrentId(null);
  };

  return (
    <div style={G.scr}>
      <button
        type="button"
        onClick={() => setShowStructuralDetails((v) => !v)}
        style={{
          ...G.card("#ef444422"),
          width: "100%",
          textAlign: "right",
          cursor: "pointer",
          color: "var(--text-heading)",
          fontFamily: "inherit",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontSize: 15, color: "var(--text-heading)", fontWeight: 900, marginBottom: 4 }}>
              الالتزامات الهيكلية
            </div>
            <div style={{ fontSize: 11, color: "var(--text-faint)" }}>
              أقساط ثابتة قادمة من الإعدادات
            </div>
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#ef4444" }}>
              {structuralTotal.toFixed(2)}
              <span style={{ fontSize: 11, color: "var(--text-faint)" }}> د.أ</span>
            </div>
            <div style={{ fontSize: 11, color: "var(--gold-border)" }}>
              {showStructuralDetails ? "إخفاء التفاصيل" : "عرض التفاصيل"}
            </div>
          </div>
        </div>

        {showStructuralDetails && (
          <div style={{ marginTop: 12, borderTop: "1px solid var(--border-soft)", paddingTop: 8 }}>
            {structuralList.map((item, index) => (
              <div key={item.id || index} style={index < structuralList.length - 1 ? G.row : G.lrow}>
                <strong>{getStructuralAmount(item).toFixed(2)} د.أ</strong>
                <div style={{ textAlign: "right", display: "flex", gap: 10, alignItems: "center" }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      background: "var(--bg-secondary)",
                      color: "var(--gold-border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      flexShrink: 0,
                    }}
                  >
                    🏗
                  </div>
                  <div>
                  <div style={{ fontSize: 13 }}>{item.name}</div>
                  <div style={{ fontSize: 10, color: "var(--text-faint)" }}>
                    يوم السداد: {item.dueDay || "-"}
                  </div>
                </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </button>

      <div style={G.card("#ef444422")}>
        <div
          onClick={() => setShowCurrentDetails((v) => !v)}
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 12,
            cursor: "pointer",
          }}
        >
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 15, fontWeight: 900 }}>الالتزامات الجارية</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>
              ديون قصيرة الأجل وبطاقات مستحقة
            </div>
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#ef4444" }}>
              {currentDebtTotal.toFixed(2)}
              <span style={{ fontSize: 11, color: "var(--text-faint)" }}> د.أ</span>
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
              {showCurrentDetails ? "إخفاء التفاصيل" : "عرض التفاصيل"}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
          <div style={summaryCard("success")}>
            <div style={{ fontSize: 10, color: "var(--text-faint)" }}>محجوز من السقف</div>
            <div style={summaryValue("success")}>
              {coveredCurrentTotal.toFixed(2)}
            </div>
          </div>
          <div style={summaryCard("danger")}>
            <div style={{ fontSize: 10, color: "var(--text-faint)" }}>غير مغطى</div>
            <div style={summaryValue("danger")}>
              {uncoveredCurrentTotal.toFixed(2)}
            </div>
          </div>
        </div>

        {showCurrentDetails && sortedCurrent.map((item) => {
          const amount = getLiabilityAmount(item);
          const covered = getCoveredAmount(item);
          const uncovered = getUncoveredAmount(item);
          const coveragePct = amount > 0 ? Math.min(100, (covered / amount) * 100) : 0;
          const isCard = item.type === "card";
          const isOpen = openCurrentId === item.id;
          const creditLimit = Number(item.creditLimit || 0);
          const availableCredit = Math.max(0, creditLimit - Number(item.balance || 0));
          const itemIcon = isCard ? "💳" : item.type === "over_budget" ? "⚠" : "🧾";
          const primaryName = isCard ? item.name || "بطاقة ائتمانية" : item.name || "دائن";
          const remainingCap = Math.max(
            0,
            Number(state.session?.spendingCap || 0) -
              Number(state.session?.coveredSpent || 0)
          );
          const capAvailableForPayment = remainingCap + Math.min(covered, amount);

          return (
            <div
              key={item.id}
              style={{
                background: isOpen ? "var(--bg-secondary)" : "var(--bg-secondary)",
                border: isOpen ? "1px solid rgba(232,201,106,0.62)" : "1px solid var(--border-soft)",
                borderRadius: 12,
                padding: 12,
                marginBottom: 10,
                boxShadow: isOpen ? "0 12px 28px rgba(232,201,106,0.10)" : "none",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div style={{ textAlign: "right", display: "flex", gap: 10, alignItems: "center" }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      background: isCard ? "var(--gold-light)" : "var(--bg-secondary)",
                      color: isCard ? "#93c5fd" : "var(--gold-border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      flexShrink: 0,
                    }}
                  >
                    {itemIcon}
                  </div>
                  <div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: "var(--text-heading)" }}>{primaryName}</div>
                  {isCard && (
                    <div style={{ ...labelText, color: "var(--text-muted)", marginTop: 3 }}>
                      السقف: {creditLimit.toFixed(2)} · المستخدم: {Number(item.balance || 0).toFixed(2)} · المتاح: {availableCredit.toFixed(2)}
                    </div>
                  )}
                  {!isCard && (
                    <div style={{ ...labelText, color: "var(--text-muted)", marginTop: 3 }}>
                      اسم الدائن
                    </div>
                  )}
                  <div style={{ display: openCurrentId === item.id ? "block" : "none", ...labelText, color: "var(--text-muted)", marginTop: 3 }}>
                    {getTypeLabel(item)} · الاستحقاق: {getDueText(item)}
                  </div>
                </div>
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 17, fontWeight: 900, color: "var(--text-heading)" }}>
                    {amount.toFixed(2)}
                    <button
                      type="button"
                      onClick={() =>
                        setOpenCurrentId(openCurrentId === item.id ? null : item.id)
                      }
                      style={{
                        marginRight: 8,
                        width: 30,
                        height: 30,
                        borderRadius: 10,
                        border: "1px solid var(--border-soft)",
                        background: "var(--bg-secondary)",
                        color: "var(--gold-border)",
                        cursor: "pointer",
                        fontWeight: 900,
                      }}
                    >
                      ⋯
                    </button>
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-faint)" }}>د.أ</div>
                </div>
              </div>

              <div style={{ display: openCurrentId === item.id ? "block" : "none", height: 7, background: "var(--bg-secondary)", borderRadius: 999, overflow: "hidden", marginTop: 10 }}>
                <div style={{ width: `${coveragePct}%`, height: "100%", background: "linear-gradient(90deg,#22c55e,var(--gold-border))" }} />
              </div>

              <div style={{ display: openCurrentId === item.id ? "grid" : "none", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
                <div style={{ fontSize: 11, color: "#86efac" }}>
                  مغطى ومحجوز: <b>{covered.toFixed(2)}</b>
                </div>
                <div style={{ fontSize: 11, color: "#fecaca" }}>
                  غير مغطى: <b>{uncovered.toFixed(2)}</b>
                </div>
              </div>

              <div style={{ display: openCurrentId === item.id ? "block" : "none", marginTop: 10 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    gap: 8,
                    marginBottom: 8,
                    direction: "ltr",
                  }}
                >
                  {covered > 0 && (
                    <button
                      type="button"
                      title="سداد من المحجوز"
                      onClick={() => payCurrentFromReserved(item)}
                      style={G.iconBtn(false, "#86efac")}
                    >
                      ✓
                    </button>
                  )}
                  {amount > 0 && capAvailableForPayment >= amount && (
                    <button
                      type="button"
                      title="سداد من سقف الصرف"
                      onClick={() => payCurrentFromCap(item)}
                      style={G.iconBtn(false, "#38bdf8")}
                    >
                      ⌁
                    </button>
                  )}
                  <button
                    type="button"
                    title="سداد من أصل"
                    onClick={() => updateCurrentPaymentMethod(item, item.paymentMethod === "assets" ? "" : "assets")}
                    style={G.iconBtn(item.paymentMethod === "assets", "var(--gold-border)")}
                  >
                    ◈
                  </button>
                  <button
                    type="button"
                    title="تأجيل الاستحقاق"
                    onClick={() => updateCurrentPaymentMethod(item, item.paymentMethod === "postpone" ? "" : "postpone")}
                    style={G.iconBtn(item.paymentMethod === "postpone", "var(--text-body)")}
                  >
                    ◷
                  </button>
                </div>

                {item.paymentMethod === "assets" && (
                  <>
                    <select
                      value={liabilityAssetKey}
                      onChange={(e) => setLiabilityAssetKey(e.target.value)}
                      style={{ ...G.inp(), marginBottom: 8 }}
                    >
                      {liabilityAssetSources.map((asset) => (
                        <option key={asset.key} value={asset.key}>
                          {asset.label} - متاح {Number(asset.available || 0).toFixed(2)} د.أ
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => payCurrentFromAsset(item)}
                      style={G.btn("var(--bg-secondary)", "var(--gold-border)", { width: "100%", padding: "9px" })}
                    >
                      تأكيد السداد من الأصل
                    </button>
                  </>
                )}
                {item.paymentMethod === "postpone" && (() => {
                  const parts = getPostponeParts(item);
                  const currentYear = new Date().getFullYear();
                  return (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "0.8fr 0.8fr 1fr 42px",
                        gap: 6,
                        alignItems: "center",
                        direction: "rtl",
                      }}
                    >
                      <select
                        value={parts.day}
                        onChange={(e) => setPostponePart(item.id, "day", e.target.value)}
                        style={{ ...G.inp(), marginBottom: 0, padding: "9px 8px", fontSize: 12 }}
                      >
                        {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0")).map((day) => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                      <select
                        value={parts.month}
                        onChange={(e) => setPostponePart(item.id, "month", e.target.value)}
                        style={{ ...G.inp(), marginBottom: 0, padding: "9px 8px", fontSize: 12 }}
                      >
                        {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((month) => (
                          <option key={month} value={month}>{month}</option>
                        ))}
                      </select>
                      <select
                        value={parts.year}
                        onChange={(e) => setPostponePart(item.id, "year", e.target.value)}
                        style={{ ...G.inp(), marginBottom: 0, padding: "9px 8px", fontSize: 12 }}
                      >
                        {Array.from({ length: 4 }, (_, i) => String(currentYear + i)).map((year) => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        title="تأكيد التاريخ"
                        onClick={() => confirmPostponeDate(item.id)}
                        style={G.iconBtn(false, "#86efac")}
                      >
                        ✓
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>
          );
        })}

        {!sortedCurrent.length && (
          <div style={{ textAlign: "center", color: "var(--text-faint)", padding: "18px 0", fontSize: 13 }}>
            لا توجد التزامات جارية
          </div>
        )}
      </div>

      <div style={{ ...G.card(), display: "none" }}>
        <div style={{ fontSize: 13, fontWeight: 900, marginBottom: 10, textAlign: "right" }}>
          إدارة البطاقات الائتمانية
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <button type="button" onClick={() => setCardMode(cardMode === "add" ? "" : "add")} style={G.btn("var(--bg-secondary)", "var(--text-body)", { width: "100%" })}>
            إضافة بطاقة
          </button>
          <button type="button" onClick={() => setCardMode(cardMode === "delete" ? "" : "delete")} style={G.btn("#2b1111", "#fecaca", { width: "100%" })}>
            حذف بطاقة
          </button>
        </div>
        {cardMode === "add" && (
          <div style={{ marginTop: 12 }}>
            <input
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="اسم البطاقة"
              style={{ ...G.inp(), marginBottom: 8 }}
            />
            <input
              type="number"
              value={cardLimit}
              onChange={(e) => setCardLimit(e.target.value)}
              placeholder="سقف البطاقة"
              style={{ ...G.inp(), marginBottom: 8 }}
            />
            <input
              type="number"
              value={cardBalance}
              onChange={(e) => setCardBalance(e.target.value)}
              placeholder="الرصيد المستخدم حاليًا"
              style={{ ...G.inp(), marginBottom: 8 }}
            />
            <input
              type="date"
              value={cardDueDate}
              onChange={(e) => setCardDueDate(e.target.value)}
              style={{ ...G.inp(), marginBottom: 8 }}
            />
            <button
              type="button"
              onClick={addCreditCard}
              style={G.btn("#17341f", "#86efac", { width: "100%" })}
            >
              حفظ البطاقة
            </button>
          </div>
        )}
        {cardMode === "delete" && (
          <div style={{ marginTop: 12 }}>
            <select
              value={selectedCardId}
              onChange={(e) => setSelectedCardId(e.target.value)}
              style={{ ...G.inp(), marginBottom: 8 }}
            >
              <option value="">اختر البطاقة</option>
              {currentList
                .filter((item) => item.type === "card")
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} - الرصيد: {Number(item.balance || 0).toFixed(2)}
                  </option>
                ))}
            </select>
            <button
              type="button"
              onClick={deleteSelectedCreditCard}
              style={G.btn("#2b1111", "#fecaca", { width: "100%" })}
            >
              حذف البطاقة المختارة
            </button>
          </div>
        )}
      </div>
    </div>
  );
  return (
<div style={G.scr}>
        <div style={{ ...G.card("#ef444422"), textAlign: "center" }}>
        <div style={{ fontSize: 11, color: "#ef4444", marginBottom: 4 }}>
          إجمالي الخصوم الجارية
        </div>
        <div style={{ fontSize: 30, fontWeight: 900, color: "#ef4444" }}>
          {totalCurrent.toFixed(2)}{" "}
          <span style={{ fontSize: 13, color: "var(--text-faint)" }}>د.أ</span>
        </div>
      </div>
     <div style={{ ...G.card(), marginBottom: 12 }}>
  <div
    style={{
      fontSize: 14,
      fontWeight: 800,
      color: "var(--text-body)",
      marginBottom: 10,
    }}
  >
    إدارة البطاقات الائتمانية
  </div>

  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
    <button
      onClick={() => setCardMode(cardMode === "add" ? "" : "add")}
      style={G.btn("linear-gradient(135deg,var(--bg-secondary),var(--border-soft))", "var(--text-heading)", {
        width: "100%",
        fontWeight: 900,
      })}
    >
      إضافة
    </button>

    <button
      onClick={() => setCardMode(cardMode === "delete" ? "" : "delete")}
      style={G.btn("linear-gradient(135deg,#7f1d1d,#450a0a)", "#450a0a", {
        width: "100%",
        fontWeight: 900,
      })}
    >
      إلغاء
    </button>

    <button
      onClick={() => setCardMode(cardMode === "edit" ? "" : "edit")}
      style={G.btn("linear-gradient(135deg,var(--gold-light),var(--gold-border))", "var(--gold-light)", {
        width: "100%",
        fontWeight: 900,
      })}
    >
      تعديل
    </button>
  </div>

  {cardMode === "add" && (
    <div style={{ marginTop: 12 }}>
      <input
        value={cardName}
        onChange={(e) => setCardName(e.target.value)}
        placeholder="اسم البطاقة"
        style={{ ...G.inp(), marginBottom: 8 }}
      />

      <input
        type="number"
        value={cardBalance}
        onChange={(e) => setCardBalance(e.target.value)}
        placeholder="الرصيد الحالي"
        style={{ ...G.inp(), marginBottom: 8 }}
      />

      <button
        onClick={addCreditCard}
        style={G.btn("linear-gradient(135deg,#22c55e,#16a34a)", "#052e16", {
          width: "100%",
          fontWeight: 900,
        })}
      >
        حفظ البطاقة
      </button>
    </div>
  )}

  {cardMode === "delete" && (
    <div style={{ marginTop: 12 }}>
      <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>
        اختر البطاقة
      </label>

      <select
        value={selectedCardId}
        onChange={(e) => setSelectedCardId(e.target.value)}
        style={{ ...G.inp(), marginBottom: 8 }}
      >
        <option value="">اختر البطاقة</option>
        {currentList
          .filter((item) => item.type === "card")
          .map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} - الرصيد: {Number(item.balance || 0).toFixed(2)}
            </option>
          ))}
      </select>

      <button
        onClick={deleteSelectedCreditCard}
        style={{
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid #ef4444",
          background: "transparent",
          color: "#ef4444",
          cursor: "pointer",
          width: "100%",
          fontWeight: 900,
        }}
      >
        حذف البطاقة المختارة
      </button>
    </div>
  )}

  {cardMode === "edit" && (
    <div style={{ marginTop: 12, fontSize: 12, color: "var(--text-muted)" }}>
      سنضيف تعديل الاسم والسقف في الخطوة التالية بعد تثبيت الإضافة والإلغاء.
    </div>
  )}
</div>

      <div style={G.card()}>
        <div
  onClick={() => setShowStructuralDetails((v) => !v)}
  style={{
    textAlign: "right",
    marginBottom: 10,
    fontSize: 13,
    fontWeight: 800,
    color: "var(--text-muted)",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  }}
>
  <span style={{ color: "#ef4444" }}>{structuralTotal.toFixed(2)} د.أ</span>
  <span>🏗 الالتزامات الهيكلية {showStructuralDetails ? "▲" : "▼"}</span>
</div>

        {showStructuralDetails &&
  structuralList.map((s, i) => (
          <div
            key={s.id}
            style={i < structuralList.length - 1 ? G.row : G.lrow}
          >
            <div>
              <div style={{ fontSize: 15, fontWeight: 800 }}>
                {Number(s.monthly || 0).toFixed(2)} د.أ
              </div>
              <div style={{ fontSize: 10, color: "var(--text-faint)" }}>
                يوم السداد: {s.dueDay}
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, color: "var(--text-body)" }}>{s.name}</div>
              <div style={{ fontSize: 10, color: "var(--text-disabled)" }}>
                قسط شهري طويل الأجل
              </div>
            </div>
          </div>
        ))}

        <div
          style={{
            marginTop: 10,
            paddingTop: 10,
            borderTop: "1px solid var(--border-soft)",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <strong style={{ color: "#ef4444" }}>
            {structuralTotal.toFixed(2)} د.أ
          </strong>
          <span style={{ fontSize: 11, color: "var(--text-faint)" }}>
            إجمالي الأقساط الشهرية
          </span>
        </div>
      </div>

      <div style={G.card("#ef444422")}>
        <div
  onClick={() => setShowCurrentDetails((v) => !v)}
  style={{
    textAlign: "right",
    marginBottom: 10,
    fontSize: 13,
    fontWeight: 800,
    color: "var(--text-heading)",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  }}
>
  <div>
  <div style={{ fontSize: 13, fontWeight: 900 }}>
    📋 إدارة الالتزامات الجارية {showCurrentDetails ? "▲" : "▼"}
  </div>
  <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>
    رصيد الدين الكامل والمستحقات الشهرية
  </div>
</div>

<div style={{ textAlign: "left" }}>
  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
    إجمالي رصيد الدين
  </div>
  <div style={{ color: "#ef4444", fontWeight: 900 }}>
    {currentDebtTotal.toFixed(2)} د.أ
  </div>
  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
    المستحق هذا الشهر
  </div>
  <div style={{ color: "#f59e0b", fontWeight: 900 }}>
    {dueThisMonthTotal.toFixed(2)} د.أ
  </div>
</div>
</div>
        {showCurrentDetails &&
  sortedCurrent.map((l, i) => {
          const amount = getLiabilityAmount(l);
          const typeColor = getTypeColor(l);

          return (
            <div
              key={l.id}
              style={i < (state.currentLiabilities || []).length - 1 ? G.row : G.lrow}
            >
              <div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: l.status === "paid" ? "var(--text-faint)" : "#ef4444",
                  }}
                >
                  {amount.toFixed(2)} د.أ
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    marginTop: 4,
                    flexWrap: "wrap",
                  }}
                >
                  <Tag label={getStatusLabel(l.status)} col="#ef4444" />
                  <Tag label={getTypeLabel(l)} col={typeColor} />
                </div>
              </div>
              
              <div style={{ textAlign: "right", maxWidth: "58%" }}>
                <div style={{ fontSize: 13, color: "var(--text-body)" }}>{l.name}</div>
                {isDueThisMonth(l) && l.status !== "paid" && (
  <div style={{ fontSize: 10, color: "#f59e0b", fontWeight: 700, marginTop: 2 }}>
    مستحق هذا الشهر
  </div>
)}

                {l.dueDate ? (
                  <div style={{ fontSize: 10, color: "#f59e0b", marginTop: 3 }}>
                    تاريخ الاستحقاق: {formatDate(l.dueDate)}
                  </div>
                ) : (
                  <div style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 3 }}>
                    يوم الاستحقاق: {l.dueDay || "-"}
                  </div>
                )}

                {(l.type === "card" || l.type === "direct_liability") && (
  <div style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 3 }}>
    برسم الدفع: {Number(l.payableBuffer || 0).toFixed(2)}
    <br />
    خارج السقف: {Number(l.uncoveredDebt || 0).toFixed(2)}
    <br />
   طريقة السداد:{" "}
{l.paymentMethod === "salary"
  ? "من الراتب"
  : l.paymentMethod === "assets"
  ? "من الأصول"
  : l.paymentMethod === "postpone"
  ? "تأجيل الاستحقاق"
  : "لم تحدد بعد"}
      <br />
<select
  value={l.paymentMethod || ""}
 onChange={(e) => {
  const value = e.target.value;

  setState((prev) => {
    const currentItem = prev.currentLiabilities.find((item) => item.id === l.id);
    const paidAmount = Number(currentItem?.salaryPaidAmount || 0);
    const wasCreatedThisMonthPaid =
  currentItem?.createdThisMonthPaidFromSalary === true;
    const shouldReverseSalaryPayment =
  currentItem?.paymentMethod === "salary" &&
  value !== "salary" &&
  (paidAmount > 0 || wasCreatedThisMonthPaid);

    return {
      ...prev,

      session: {
  ...prev.session,
  coveredSpent: Math.max(
    0,
    Number(prev.session.coveredSpent || 0) -
      (shouldReverseSalaryPayment ? paidAmount : 0)
  ),
},

transactions: shouldReverseSalaryPayment
  ? (prev.transactions || []).filter(
      (t) =>
        !(
          t.type === "liability_paid_from_salary" &&
          t.liabilityId === l.id
        )
    )
  : prev.transactions,
      currentLiabilities: prev.currentLiabilities.map((item) =>
        item.id === l.id
          ? {
              ...item,
              paymentMethod: value,
              status: shouldReverseSalaryPayment ? "pending" : item.status,
              balance: shouldReverseSalaryPayment
                ? Number(item.balance || 0) + paidAmount
                : item.balance,
              salaryPaidAmount: shouldReverseSalaryPayment ? 0 : item.salaryPaidAmount,
createdThisMonthPaidFromSalary: shouldReverseSalaryPayment
  ? false
  : item.createdThisMonthPaidFromSalary,
            }
          : item
      ),
    };
  });
}}
>
  <option value="">لم تحدد بعد</option>
  <option value="salary">من الراتب</option>
  <option value="assets">من الأصول</option>
  <option value="postpone">تأجيل الاستحقاق</option>
</select>
{l.paymentMethod === "postpone" && (
  <input
    type="date"
    value={l.newDueDate || ""}
    onChange={(e) => {
      const value = e.target.value;
      setState((prev) => ({
        ...prev,
        currentLiabilities: prev.currentLiabilities.map((item) =>
          item.id === l.id ? { ...item, newDueDate: value } : item
        ),
      }));
    }}
  />
)}
{l.paymentMethod === "postpone" && l.newDueDate && (
  <button
    onClick={() => {
      setState((prev) => ({
        ...prev,
        currentLiabilities: prev.currentLiabilities.map((item) =>
          item.id === l.id
            ? { ...item, dueDate: item.newDueDate, newDueDate: "" }
            : item
        ),
      }));
    }}
    
  >
    تأكيد التأجيل
  </button>
)}
{l.paymentMethod === "salary" && (
  <button
    onClick={() => {
      const amount = Number(
  l.payableBuffer || l.dueThisMonth || l.monthlyDue || l.amount || l.balance || 0
);
const created = l.createdAt ? new Date(l.createdAt) : null;
const now = new Date();

const createdThisMonth =
  created &&
  created.getFullYear() === now.getFullYear() &&
  created.getMonth() === now.getMonth();

const remainingCap = Math.max(
  0,
  Number(state.session?.spendingCap || 0) -
    Number(state.session?.coveredSpent || 0)
);

if (!createdThisMonth && remainingCap < amount) {
  alert("سقف الصرف لا يغطي هذا السداد. اختر السداد من الأصول أو تأجيل الاستحقاق.");
  return;
}
  

      setState((prev) => ({
        ...prev,
        session: {
          ...prev.session,
          coveredSpent:
  Number(prev.session.coveredSpent || 0) +
  (createdThisMonth ? 0 : amount),
        },
      transactions: createdThisMonth
  ? prev.transactions
  : [
      ...(prev.transactions || []).filter(
        (t) =>
          !(
            t.type === "liability_paid_from_salary" &&
            t.liabilityId === l.id
          )
      ),
      {
        id: Date.now(),
        type: "liability_paid_from_salary",
        name: `سداد دين - ${l.name}`,
        amount,
        liabilityId: l.id,
        date: new Date().toISOString(),
      },
    ],
        currentLiabilities: prev.currentLiabilities.map((item) =>
          item.id === l.id
            ? {
                ...item,
                balance: Math.max(0, Number(item.balance || item.amount || 0) - amount),
                status: "paid",
salaryPaidAmount: createdThisMonth ? 0 : amount,
createdThisMonthPaidFromSalary: createdThisMonth,
paymentMethod: "salary",
              }
            : item
        ),
      }));
    }}
  >
    سداد من الراتب
  </button>
)}
  </div>
)}
                  
                

                {l.type === "over_budget" && (
                  <div style={{ fontSize: 10, color: "#ef4444", marginTop: 3 }}>
                    ناتج عن مصروف تجاوز سقف الصرف
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {!currentList.length && (
          <div
            style={{
              textAlign: "center",
              color: "var(--text-disabled)",
              fontSize: 13,
              padding: "20px 0",
            }}
          >
            لا توجد التزامات جارية
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsScreen({ state, setState, onCloseMonth }) {
  const structuralTotal = calcStructuralTotal(state);
const salary = Number(state.settings?.salary || 0);
const maxSpendingCap = Math.max(0, salary - structuralTotal);
const snapshotsCount = (state.monthlySnapshots || []).length;
const rolloverUnpaidLiabilities = () => {
  setState((prev) => ({
    ...prev,
    currentLiabilities: (prev.currentLiabilities || [])
      .filter((l) => l.status !== "paid")
      .map((l) => ({
        ...l,
        paymentMethod: "",
        newDueDate: "",
        salaryPaidAmount: 0,
        createdThisMonthPaidFromSalary: false,
      })),
  }));
};
function clampSpendingCapAfterStructuralChange(nextState) {
  const nextStructuralTotal = calcStructuralTotal(nextState);
  const nextSalary = Number(nextState.settings?.salary || 0);
  const nextMaxCap = Math.max(0, nextSalary - nextStructuralTotal);

  const currentCap = Number(
    nextState.session?.spendingCap ??
      nextState.settings?.spendingCap ??
      0
  );

  return {
    ...nextState,
    session: {
      ...nextState.session,
      spendingCap: Math.min(currentCap, nextMaxCap),
    },
  };
}

  const updateSetting = (path, value) => {
    setState((prev) => {
      const copy = structuredClone(prev);
      const maxSpendingCap = Math.max(0, salary - structuralTotal);
      const keys = path.split(".");
      let ref = copy;
      for (let i = 0; i < keys.length - 1; i++) ref = ref[keys[i]];
      ref[keys[keys.length - 1]] = value;
      return copy;
    });
  };
  const [structuralName, setStructuralName] = useState("");
const [structuralMonthly, setStructuralMonthly] = useState("");
const [structuralDueDay, setStructuralDueDay] = useState("");
const [settingsCardName, setSettingsCardName] = useState("");
const [settingsCardLimit, setSettingsCardLimit] = useState("");
const [settingsCardBalance, setSettingsCardBalance] = useState("");
const [settingsCardDueDay, setSettingsCardDueDay] = useState("");
const [settingsCardMode, setSettingsCardMode] = useState("");
const [settingsSelectedCardId, setSettingsSelectedCardId] = useState("");
const [openingAssetKind, setOpeningAssetKind] = useState("cash");
const [openingAssetTarget, setOpeningAssetTarget] = useState("");
const [openingAssetName, setOpeningAssetName] = useState("");
const [openingAssetUnits, setOpeningAssetUnits] = useState("");
const [openingAssetPrice, setOpeningAssetPrice] = useState("");
const [showOpeningAssetForm, setShowOpeningAssetForm] = useState(false);
const [showStructuralForm, setShowStructuralForm] = useState(false);
const [settingsSectionsOpen, setSettingsSectionsOpen] = useState({
  cards: false,
  structural: false,
  opening: false,
});
const structuralList = state.structuralLiabilities || state.structural || [];
const creditCards = (state.currentLiabilities || []).filter((item) => item.type === "card");
const openingAssetChoices = (() => {
  if (openingAssetKind === "cash") return [];
  if (openingAssetKind === "gold") return ["ذهب 21", "ذهب 24"];
  if (openingAssetKind === "silver") return ["فضة"];
  if (openingAssetKind === "bank") {
    return (state.assets.banks || []).map((item) => item.name).filter(Boolean);
  }
  if (openingAssetKind === "stock") {
    return (state.assets.stocks || []).map((item) => item.name).filter(Boolean);
  }
  if (openingAssetKind === "goods") {
    return (state.assets.custom || [])
      .filter((item) => item.type === "unit")
      .map((item) => item.name)
      .filter(Boolean);
  }
  return [];
})();
const openingAssetCanCreateNew = ["bank", "stock", "goods"].includes(openingAssetKind);
const openingAssetEffectiveTarget =
  openingAssetTarget ||
  (openingAssetKind === "gold"
    ? "ذهب 21"
    : openingAssetKind === "silver"
    ? "فضة"
    : openingAssetCanCreateNew
    ? openingAssetChoices[0] || "__new__"
    : "");
const openingAssetIsNew = openingAssetCanCreateNew && openingAssetEffectiveTarget === "__new__";
const sectionTitle = (icon, title, action = null) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    }}
  >
    <div
      style={{
        color: "var(--text-faint)",
        fontWeight: 700,
        fontSize: 10,
        letterSpacing: "0.09em",
        textTransform: "uppercase",
      }}
    >
      {icon} {title}
    </div>
    {action}
  </div>
);
const collapsibleSectionTitle = (key, icon, title, action = null) => {
  const isOpen = settingsSectionsOpen[key];

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {action}
        {smallIconButton(isOpen ? "−" : "⋯", () =>
          setSettingsSectionsOpen((prev) => ({ ...prev, [key]: !prev[key] }))
        , "var(--text-body)")}
      </div>
      <button
        type="button"
        onClick={() =>
          setSettingsSectionsOpen((prev) => ({ ...prev, [key]: !prev[key] }))
        }
        style={{
          border: 0,
          background: "transparent",
          color: "var(--text-faint)",
          fontWeight: 700,
          fontSize: 10,
          letterSpacing: "0.09em",
          textTransform: "uppercase",
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        {icon} {title}
      </button>
    </div>
  );
};
const smallIconButton = (label, onClick, color = "var(--text-body)") => (
  <button
    type="button"
    title={label}
    onClick={onClick}
    style={{
      width: 32,
      height: 32,
      borderRadius: 10,
      border: label === "+" ? "1px solid #0EA5E9" : `1px solid ${color}55`,
      background: label === "+" ? "linear-gradient(135deg,#38BDF8,#0284C7)" : "var(--bg-secondary)",
      color: label === "+" ? "#fff" : color,
      cursor: "pointer",
      fontWeight: 900,
      fontSize: label === "+" ? 18 : 15,
      boxShadow: label === "+" ? "0 6px 14px rgba(2,132,199,0.22)" : "none",
    }}
  >
    {label}
  </button>
);
const openNewSettingsCard = () => {
  setSettingsSelectedCardId("");
  setSettingsCardName("");
  setSettingsCardLimit("");
  setSettingsCardBalance("");
  setSettingsCardDueDay("");
  setSettingsSectionsOpen((prev) => ({ ...prev, cards: true }));
  setSettingsCardMode(settingsCardMode === "add" ? "" : "add");
};
const openingBalanceRow = ({ keyPrefix, item, group, nameField, unitLabel, priceField = "wac", valueField = "name" }) => {
  const units = Number(item.units || 0);
  const price = Number(item[priceField] || 0);
  const total = units * price;

  return (
    <div key={`${keyPrefix}-${item.id}`} style={{ display: "grid", gridTemplateColumns: "0.9fr 0.72fr 0.72fr 0.72fr 1fr", gap: 6, marginBottom: 8 }}>
      <input readOnly value={total.toFixed(2)} placeholder="الإجمالي" style={{ ...G.inp(), padding: "9px 7px", fontSize: 11, color: "var(--text-body)" }} />
      <input type="number" value={price} onChange={(e) => updateAssetItem(group, item.id, { [priceField]: Number(e.target.value || 0) })} placeholder="السعر" style={{ ...G.inp(), padding: "9px 7px", fontSize: 11 }} />
      <select value={unitLabel} disabled style={{ ...G.inp(), padding: "9px 6px", fontSize: 11, opacity: 0.9 }}>
        <option value="غم">غم</option>
        <option value="سهم">سهم</option>
        <option value="وحدة">وحدة</option>
      </select>
      <input type="number" value={units} onChange={(e) => updateAssetItem(group, item.id, { units: Number(e.target.value || 0) })} placeholder="العدد" style={{ ...G.inp(), padding: "9px 7px", fontSize: 11 }} />
      <input value={item[nameField] || ""} onChange={(e) => updateAssetItem(group, item.id, { [nameField]: e.target.value })} placeholder={valueField} style={{ ...G.inp(), padding: "9px 7px", fontSize: 11 }} />
    </div>
  );
};
  const updateStockPrice = (stockId, price) => {
  setState((p) => ({
    ...p,
    assets: {
      ...p.assets,
      stocks: p.assets.stocks.map((s) =>
        s.id === stockId
          ? {
              ...s,
              currentPrice: Number(price || 0),
            }
          : s
      ),
    },
  }));
};
const updateAssetItem = (assetGroup, itemId, patch) => {
  setState((p) => ({
    ...p,
    assets: {
      ...p.assets,
      [assetGroup]: (p.assets[assetGroup] || []).map((item) =>
        item.id === itemId
          ? {
              ...item,
              ...patch,
              ...(assetGroup === "stocks" && patch.wac !== undefined
                ? { currentPrice: patch.wac }
                : {}),
            }
          : item
      ),
    },
  }));
};
const addOpeningAsset = () => {
  const rawName = String(openingAssetName || "").trim();
  const selectedName = String(openingAssetEffectiveTarget || "").trim();
  const name =
    openingAssetKind === "cash"
      ? ""
      : openingAssetCanCreateNew && selectedName && selectedName !== "__new__"
      ? selectedName
      : openingAssetKind === "gold"
      ? selectedName || rawName || "ذهب 21"
      : openingAssetKind === "silver"
      ? "فضة"
      : rawName;
  const units = Number(openingAssetUnits || 0);
  const price = Number(openingAssetPrice || 0);

  if (["bank", "stock", "goods"].includes(openingAssetKind) && !name) {
    return alert("أدخل اسم الأصل");
  }

  setState((p) => {
    const next = structuredClone(p);
    const id = Date.now();
    const historyPatch = {};

    const mergeUnitAsset = ({ listName, nameField, priceField = "wac", extraNew = {} }) => {
      const list = next.assets[listName] || [];
      const existing = list.find(
        (item) =>
          String(item[nameField] || "").trim() === name &&
          (listName !== "custom" || !extraNew.type || item.type === extraNew.type)
      );

      if (existing) {
        const oldUnits = Number(existing.units || 0);
        const oldAverage = Number(existing[priceField] || 0);
        const oldValue = oldUnits * oldAverage;
        const newValue = units * price;
        const totalUnits = oldUnits + units;
        const average =
          totalUnits > 0
            ? Number(((oldValue + newValue) / totalUnits).toFixed(4))
            : price;

        existing.units = Number(totalUnits.toFixed(4));
        existing[priceField] = average;
        if (listName === "stocks") existing.currentPrice = price;

        historyPatch.assetId = existing.id;
        historyPatch.unitsBefore = oldUnits;
        historyPatch.unitsAfter = existing.units;
        historyPatch.averageBefore = oldAverage;
        historyPatch.averageAfter = average;
        historyPatch.merged = true;
      } else {
        const newItem = {
          id,
          [nameField]: name,
          units,
          [priceField]: price,
          ...extraNew,
        };
        list.push(newItem);
        next.assets[listName] = list;

        historyPatch.assetId = id;
        historyPatch.unitsBefore = 0;
        historyPatch.unitsAfter = units;
        historyPatch.averageBefore = 0;
        historyPatch.averageAfter = price;
        historyPatch.merged = false;
      }
    };

    if (openingAssetKind === "cash") {
      if (units <= 0) {
        alert("أدخل رصيد الكاش");
        return p;
      }
      next.assets.cash = Number((Number(next.assets.cash || 0) + units).toFixed(2));
    }

    if (openingAssetKind === "bank") {
      if (units <= 0) {
        alert("أدخل رصيد الحساب");
        return p;
      }
      const existing = (next.assets.banks || []).find(
        (bank) => String(bank.name || "").trim() === name
      );

      if (existing) {
        existing.balance = Number((Number(existing.balance || 0) + units).toFixed(2));
        historyPatch.assetId = existing.id;
        historyPatch.merged = true;
      } else {
        next.assets.banks.push({ id, name, balance: units });
        historyPatch.assetId = id;
        historyPatch.merged = false;
      }
    }

    if (["gold", "silver", "stock", "goods"].includes(openingAssetKind)) {
      if (units <= 0 || price <= 0) {
        alert("أدخل العدد والسعر");
        return p;
      }

      if (openingAssetKind === "gold") {
        mergeUnitAsset({ listName: "gold", nameField: "label" });
      }

      if (openingAssetKind === "silver") {
        mergeUnitAsset({ listName: "silver", nameField: "label" });
      }

      if (openingAssetKind === "stock") {
        mergeUnitAsset({
          listName: "stocks",
          nameField: "name",
          extraNew: { currentPrice: price },
        });
      }

      if (openingAssetKind === "goods") {
        mergeUnitAsset({
          listName: "custom",
          nameField: "name",
          priceField: "price",
          extraNew: { type: "unit" },
        });
      }
    }

    next.assetHistory = [
      ...(next.assetHistory || []),
      {
        id: `${id}-opening`,
        date: new Date().toISOString(),
        type: "opening_balance",
        source: "settings",
        assetKind: openingAssetKind,
        assetName: name || "كاش ادخار",
        amount: openingAssetKind === "cash" || openingAssetKind === "bank" ? units : units * price,
        units,
        unitPrice: price || null,
        ...historyPatch,
      },
    ];

    return next;
  });

  setOpeningAssetName("");
  setOpeningAssetTarget(
    openingAssetKind === "gold" ? "ذهب 21" : openingAssetKind === "silver" ? "فضة" : ""
  );
  setOpeningAssetUnits("");
  setOpeningAssetPrice("");
  setShowOpeningAssetForm(false);
};
 const addStructuralLiability = () => {
  if (!structuralName.trim()) return alert("أدخل اسم الالتزام الهيكلي");

  const monthly = Number(structuralMonthly || 0);
  if (monthly <= 0) return alert("أدخل قيمة القسط الشهري");

  const dueDay = 1;

  setState((p) => {
    const list = p.structuralLiabilities || p.structural || [];

    const next = {
      ...p,
      structuralLiabilities: [
        ...list,
        {
          id: Date.now(),
          name: structuralName.trim(),
          monthly,
          dueDay,
        },
      ],
    };

    return clampSpendingCapAfterStructuralChange(next);
  });

  setStructuralName("");
  setStructuralMonthly("");
  setStructuralDueDay("");
  setShowStructuralForm(false);
};
const updateStructuralLiability = (id, field, value) => {
  setState((p) => {
    const list = p.structuralLiabilities || p.structural || [];

    const next = {
      ...p,
      structuralLiabilities: list.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]:
                field === "monthly" || field === "dueDay"
                  ? Number(value || 0)
                  : value,
            }
          : item
      ),
    };

    return clampSpendingCapAfterStructuralChange(next);
  });
};
const deleteStructuralLiability = (id) => {
  if (!window.confirm("هل تريد حذف هذا الالتزام الهيكلي؟")) return;

  setState((p) => {
    const list = p.structuralLiabilities || p.structural || [];

    const next = {
      ...p,
      structuralLiabilities: list.filter((item) => item.id !== id),
    };

    return clampSpendingCapAfterStructuralChange(next);
  });
};
const addSettingsCreditCard = () => {
  if (!settingsCardName.trim()) return alert("أدخل اسم البطاقة");
  const creditLimit = Number(settingsCardLimit || 0);
  const balance = Number(settingsCardBalance || 0);
  if (creditLimit <= 0) return alert("أدخل سقف البطاقة");
  if (balance < 0) return alert("الرصيد المستخدم لا يجوز أن يكون سالبًا");
  if (balance > creditLimit) return alert("الرصيد المستخدم لا يجوز أن يتجاوز سقف البطاقة");
  const dueDay = Number(settingsCardDueDay || 0);
  if (dueDay < 1 || dueDay > 31) return alert("أدخل يوم استحقاق بين 1 و31");

  setState((p) => ({
    ...p,
    currentLiabilities: [
      ...(p.currentLiabilities || []),
      {
        id: Date.now(),
        type: "card",
        name: settingsCardName.trim(),
        amount: balance,
        balance,
        creditLimit,
        payableBuffer: 0,
        uncoveredDebt: balance,
        dueDate: "",
        dueDay,
        status: "active",
        source: "manual_card",
        createdAt: new Date().toISOString(),
        date: new Date().toISOString().split("T")[0],
      },
    ],
  }));

  setSettingsCardName("");
  setSettingsCardLimit("");
  setSettingsCardBalance("");
  setSettingsCardDueDay("");
  setSettingsCardMode("");
};

const deleteSettingsCreditCard = () => {
  if (!settingsSelectedCardId) return alert("اختر البطاقة");
  const card = (state.currentLiabilities || []).find(
    (item) => String(item.id) === String(settingsSelectedCardId)
  );
  if (!card) return;
  if (Number(card.balance || 0) > 0) {
    return alert("لا يمكن حذف بطاقة عليها رصيد. يجب تصفير الرصيد أولًا.");
  }
  setState((p) => ({
    ...p,
    currentLiabilities: (p.currentLiabilities || []).filter(
      (item) => String(item.id) !== String(settingsSelectedCardId)
    ),
  }));
  setSettingsSelectedCardId("");
  setSettingsCardMode("");
};

const prepareSettingsCardEdit = (card) => {
  if (settingsCardMode === "edit" && String(settingsSelectedCardId) === String(card.id)) {
    setSettingsSelectedCardId("");
    setSettingsCardName("");
    setSettingsCardLimit("");
    setSettingsCardBalance("");
    setSettingsCardDueDay("");
    setSettingsCardMode("");
    return;
  }

  setSettingsSelectedCardId(card.id);
  setSettingsCardName(card.name || "");
  setSettingsCardLimit(String(card.creditLimit || 0));
  setSettingsCardBalance(String(card.balance || 0));
  setSettingsCardDueDay(String(card.dueDay || (card.dueDate ? new Date(card.dueDate).getDate() : "")));
  setSettingsCardMode("edit");
};

const saveSettingsCreditCardEdit = () => {
  if (!settingsSelectedCardId) return alert("اختر البطاقة");
  const creditLimit = Number(settingsCardLimit || 0);
  const balance = Number(settingsCardBalance || 0);
  if (!settingsCardName.trim()) return alert("أدخل اسم البطاقة");
  if (creditLimit <= 0) return alert("أدخل سقف البطاقة");
  if (balance < 0 || balance > creditLimit) return alert("تحقق من الرصيد والسقف");
  const dueDay = Number(settingsCardDueDay || 0);
  if (dueDay < 1 || dueDay > 31) return alert("أدخل يوم استحقاق بين 1 و31");

  setState((p) => ({
    ...p,
    currentLiabilities: (p.currentLiabilities || []).map((item) =>
      String(item.id) === String(settingsSelectedCardId)
        ? {
            ...item,
            name: settingsCardName.trim(),
            creditLimit,
            balance,
            amount: balance,
            uncoveredDebt: Math.max(0, balance - Number(item.payableBuffer || 0)),
            dueDate: "",
            dueDay,
          }
        : item
    ),
  }));

  setSettingsSelectedCardId("");
  setSettingsCardName("");
  setSettingsCardLimit("");
  setSettingsCardBalance("");
  setSettingsCardDueDay("");
  setSettingsCardMode("");
};

  return (
    <div style={G.scr}>
      <div style={G.card()}>
        {sectionTitle("💼", "الراتب والسقف")}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
          <div>
            <label style={{ fontSize: 10, color: "var(--text-faint)" }}>الراتب</label>
            <input
              type="number"
              value={state.settings.salary}
              onChange={(e) =>
                updateSetting("settings.salary", Number(e.target.value || 0))
              }
              style={G.inp()}
            />
          </div>
          <div>
            <label style={{ fontSize: 10, color: "var(--text-faint)" }}>السقف</label>
            <input
              type="number"
              value={state.session.spendingCap}
              onChange={(e) => {
                const newCap = Number(e.target.value || 0);

                if (newCap > maxSpendingCap) {
                  alert("سقف الصرف لا يجوز أن يتجاوز صافي الراتب بعد الالتزامات الهيكلية");
                  return;
                }

                setState({
                  ...state,
                  session: {
                    ...state.session,
                    spendingCap: newCap,
                  },
                });
              }}
              style={G.inp()}
            />
          </div>
        </div>

        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 12 }}>
          الحد: {maxSpendingCap.toFixed(2)} د.أ
        </div>

        <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: 12, marginTop: 8 }}>
          {collapsibleSectionTitle(
            "cards",
            "💳",
            "البطاقات",
            smallIconButton("+", openNewSettingsCard, "#86efac")
          )}

          {settingsSectionsOpen.cards && (
          <>
          <div style={{ display: "grid", gap: 8, marginBottom: settingsCardMode ? 10 : 0 }}>
            {creditCards.map((card) => {
              const used = Number(card.balance || 0);
              const limit = Number(card.creditLimit || 0);
              const available = Math.max(0, limit - used);

              return (
                <div
                  key={card.id}
                  style={{
                    border: "1px solid var(--border-soft)",
                    borderRadius: 12,
                    padding: 10,
                    background: "linear-gradient(135deg,var(--gold-light),var(--bg-card))",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      {smallIconButton("✎", () => prepareSettingsCardEdit(card), "#93c5fd")}
                      {smallIconButton("🗑", () => {
                        setSettingsSelectedCardId(card.id);
                        setSettingsCardMode("delete");
                      }, "#fecaca")}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 900, fontSize: 13 }}>{card.name}</div>
                      <div style={{ color: "#93c5fd", fontSize: 10 }}>
                        {used.toFixed(2)} / {limit.toFixed(2)} · متاح {available.toFixed(2)}
                      </div>
                      <div style={{ color: "var(--text-body)", fontSize: 10, marginTop: 2 }}>
                        {card.dueDay ? `يوم الاستحقاق ${card.dueDay}` : "بلا يوم استحقاق"}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {!creditCards.length && (
              <div style={{ color: "var(--text-faint)", fontSize: 12, textAlign: "center", padding: 8 }}>
                لا توجد بطاقات
              </div>
            )}
          </div>

  {(settingsCardMode === "add" || settingsCardMode === "edit") && (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 8 }}>
        {smallIconButton("×", () => {
          setSettingsSelectedCardId("");
          setSettingsCardName("");
          setSettingsCardLimit("");
          setSettingsCardBalance("");
          setSettingsCardDueDay("");
          setSettingsCardMode("");
        }, "#fecaca")}
      </div>
      <label style={{ fontSize: 10, color: "var(--text-faint)" }}>اسم البطاقة</label>
      <input value={settingsCardName} onChange={(e) => setSettingsCardName(e.target.value)} placeholder="مثال: فيزا البنك" style={{ ...G.inp(), marginBottom: 8 }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div>
          <label style={{ fontSize: 10, color: "var(--text-faint)" }}>سقف البطاقة</label>
          <input type="number" value={settingsCardLimit} onChange={(e) => setSettingsCardLimit(e.target.value)} placeholder="0.00" style={{ ...G.inp(), marginBottom: 8 }} />
        </div>
        <div>
          <label style={{ fontSize: 10, color: "var(--text-faint)" }}>المستخدم الآن</label>
          <input type="number" value={settingsCardBalance} onChange={(e) => setSettingsCardBalance(e.target.value)} placeholder="0.00" style={{ ...G.inp(), marginBottom: 8 }} />
        </div>
      </div>
      <label style={{ fontSize: 10, color: "var(--text-faint)" }}>يوم الاستحقاق الشهري</label>
      <input
        type="number"
        min="1"
        max="31"
        value={settingsCardDueDay}
        onChange={(e) => setSettingsCardDueDay(e.target.value)}
        placeholder="مثال: 20"
        style={{ ...G.inp(), marginBottom: 8 }}
      />
      <button type="button" onClick={settingsCardMode === "edit" ? saveSettingsCreditCardEdit : addSettingsCreditCard} style={G.btn("#17341f", "#86efac", { width: "100%" })}>
        {settingsCardMode === "edit" ? "حفظ التعديل" : "حفظ البطاقة"}
      </button>
    </div>
  )}
  {settingsCardMode === "delete" && (
    <div>
      <select value={settingsSelectedCardId} onChange={(e) => setSettingsSelectedCardId(e.target.value)} style={{ ...G.inp(), marginBottom: 8 }}>
        <option value="">اختر البطاقة</option>
        {(state.currentLiabilities || [])
          .filter((item) => item.type === "card")
          .map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} - الرصيد: {Number(item.balance || 0).toFixed(2)}
            </option>
          ))}
      </select>
      <button type="button" onClick={deleteSettingsCreditCard} style={G.btn("#2b1111", "#fecaca", { width: "100%" })}>
        حذف البطاقة المختارة
      </button>
    </div>
  )}
          </>
          )}
</div>
<div
  style={{
    borderTop: "1px solid var(--border-soft)",
    paddingTop: 12,
    marginTop: 8,
  }}
>
  {collapsibleSectionTitle(
    "structural",
    "🏗",
    "الالتزامات",
    smallIconButton("+", () => {
      setSettingsSectionsOpen((prev) => ({ ...prev, structural: true }));
      setShowStructuralForm((v) => !v);
    }, "#86efac")
  )}

  {settingsSectionsOpen.structural && (
  <>
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "34px 0.9fr 1.4fr",
      gap: 6,
      color: "var(--text-faint)",
      fontSize: 10,
      marginBottom: 5,
      padding: "0 4px",
    }}
  >
    <span />
    <span>القسط</span>
    <span>الاسم</span>
  </div>

  {structuralList.map((item) => (
    <div
      key={item.id}
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-soft)",
        borderRadius: 12,
        padding: 8,
        marginBottom: 8,
        display: "grid",
        gridTemplateColumns: "34px 0.9fr 1.4fr",
        gap: 6,
        alignItems: "center",
      }}
    >
      {smallIconButton("🗑", () => deleteStructuralLiability(item.id), "#fecaca")}
      <input
        type="number"
        value={item.monthly ?? item.monthlyAmount ?? item.amount ?? 0}
        onChange={(e) =>
          updateStructuralLiability(item.id, "monthly", e.target.value)
        }
        placeholder="القسط"
        style={{ ...G.inp(), padding: "9px 8px", fontSize: 12 }}
      />
      <input
        value={item.name}
        onChange={(e) =>
          updateStructuralLiability(item.id, "name", e.target.value)
        }
        placeholder="الاسم"
        style={{ ...G.inp(), padding: "9px 8px", fontSize: 12 }}
      />
    </div>
  ))}

  {showStructuralForm && (
  <div
    style={{
      background: "var(--bg-secondary)",
      border: "1px dashed var(--border-soft)",
      borderRadius: 12,
      padding: 10,
      marginTop: 12,
    }}
  >
    <div style={{ display: "grid", gridTemplateColumns: "38px 0.9fr 1.4fr", gap: 6 }}>
      {smallIconButton("×", () => setShowStructuralForm(false), "#fecaca")}
      <input
        type="number"
        value={structuralMonthly}
        onChange={(e) => setStructuralMonthly(e.target.value)}
        placeholder="القسط"
        style={{ ...G.inp(), padding: "9px 8px", fontSize: 12 }}
      />
      <input
        value={structuralName}
        onChange={(e) => setStructuralName(e.target.value)}
        placeholder="الاسم"
        style={{ ...G.inp(), padding: "9px 8px", fontSize: 12 }}
      />
    </div>
    <button
      type="button"
      onClick={addStructuralLiability}
      style={G.btn("linear-gradient(135deg,var(--gold-primary),var(--gold-border))", "var(--text-heading)", {
        width: "100%",
        padding: "9px 12px",
        fontSize: 12,
        marginTop: 8,
      })}
    >
      حفظ الالتزام
    </button>
  </div>
  )}
  </>
  )}
</div>
      </div>

      <div style={G.card()}>
        {collapsibleSectionTitle(
          "opening",
          "📦",
          "الأرصدة الافتتاحية",
          smallIconButton("+", () => {
            setSettingsSectionsOpen((prev) => ({ ...prev, opening: true }));
            setShowOpeningAssetForm((v) => !v);
          }, "#86efac")
        )}

        {settingsSectionsOpen.opening && (
        <div>
          {showOpeningAssetForm && (
          <div
            style={{
              background: "var(--bg-secondary)",
              border: "1px dashed var(--border-soft)",
              borderRadius: 12,
              padding: 10,
              marginBottom: 12,
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "38px 1fr 1fr", gap: 6, marginBottom: 8 }}>
              {smallIconButton("×", () => setShowOpeningAssetForm(false), "#fecaca")}
              <select
                value={openingAssetKind}
                onChange={(e) => {
                  const nextKind = e.target.value;
                  setOpeningAssetKind(nextKind);
                  setOpeningAssetTarget(
                    nextKind === "gold" ? "ذهب 21" : nextKind === "silver" ? "فضة" : ""
                  );
                  setOpeningAssetName(
                    nextKind === "gold" ? "ذهب 21" : nextKind === "silver" ? "فضة" : ""
                  );
                  setOpeningAssetUnits("");
                  setOpeningAssetPrice("");
                }}
                style={{ ...G.inp(), padding: "9px 8px", fontSize: 12 }}
              >
                <option value="cash">كاش ادخار</option>
                <option value="bank">حساب بنكي</option>
                <option value="gold">ذهب</option>
                <option value="silver">فضة</option>
                <option value="stock">أسهم</option>
                <option value="goods">بضاعة</option>
              </select>
              {openingAssetKind === "cash" ? (
                <input
                  value="كاش ادخار"
                  disabled
                  style={{ ...G.inp(), padding: "9px 8px", fontSize: 12 }}
                />
              ) : (
                <select
                  value={openingAssetEffectiveTarget}
                  onChange={(e) => {
                    const value = e.target.value;
                    setOpeningAssetTarget(value);
                    setOpeningAssetName(value === "__new__" ? "" : value);
                  }}
                  style={{ ...G.inp(), padding: "9px 8px", fontSize: 12 }}
                >
                  {openingAssetChoices.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                  {openingAssetCanCreateNew && <option value="__new__">أصل جديد</option>}
                </select>
              )}
            </div>

            {openingAssetIsNew && (
              <input
                value={openingAssetName}
                onChange={(e) => setOpeningAssetName(e.target.value)}
                placeholder={
                  openingAssetKind === "bank"
                    ? "اسم البنك الجديد"
                    : openingAssetKind === "stock"
                    ? "اسم السهم الجديد"
                    : "اسم البضاعة الجديدة"
                }
                style={{ ...G.inp(), padding: "9px 8px", fontSize: 12, marginBottom: 8 }}
              />
            )}

            <div style={{ display: "grid", gridTemplateColumns: openingAssetKind === "cash" || openingAssetKind === "bank" ? "1fr" : "1fr 1fr", gap: 6 }}>
              <input
                type="number"
                value={openingAssetUnits}
                onChange={(e) => setOpeningAssetUnits(e.target.value)}
                placeholder={openingAssetKind === "cash" || openingAssetKind === "bank" ? "الرصيد" : "عدد الوحدات"}
                style={{ ...G.inp(), padding: "9px 8px", fontSize: 12 }}
              />
              {!["cash", "bank"].includes(openingAssetKind) && (
                <input
                  type="number"
                  value={openingAssetPrice}
                  onChange={(e) => setOpeningAssetPrice(e.target.value)}
                  placeholder="السعر"
                  style={{ ...G.inp(), padding: "9px 8px", fontSize: 12 }}
                />
              )}
            </div>
            <button
              type="button"
              onClick={addOpeningAsset}
              style={G.btn("linear-gradient(135deg,var(--gold-primary),var(--gold-border))", "var(--text-heading)", {
                width: "100%",
                padding: "9px 12px",
                fontSize: 12,
                marginTop: 8,
              })}
            >
              حفظ الأصل
            </button>
          </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "0.9fr 0.72fr 0.72fr 0.72fr 1fr", gap: 6, color: "var(--text-faint)", fontSize: 10, marginBottom: 5 }}>
            <span>الإجمالي</span>
            <span>السعر</span>
            <span>الوحدة</span>
            <span>العدد</span>
            <span>الأصل</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "0.9fr 0.72fr 0.72fr 0.72fr 1fr", gap: 6, marginBottom: 8 }}>
            <input readOnly value={Number(state.assets.cash || 0).toFixed(2)} placeholder="الإجمالي" style={{ ...G.inp(), padding: "9px 7px", fontSize: 11, color: "var(--text-body)" }} />
            <input readOnly value="1" placeholder="السعر" style={{ ...G.inp(), padding: "9px 7px", fontSize: 11, color: "var(--text-muted)" }} />
            <select value="د.أ" disabled style={{ ...G.inp(), padding: "9px 6px", fontSize: 11, opacity: 0.9 }}>
              <option value="د.أ">د.أ</option>
            </select>
            <input
              type="number"
              value={Number(state.assets.cash || 0)}
              onChange={(e) =>
                setState((p) => ({
                  ...p,
                  assets: {
                    ...p.assets,
                    cash: Number(e.target.value || 0),
                  },
                }))
              }
              placeholder="الرصيد"
              style={{ ...G.inp(), padding: "9px 7px", fontSize: 11 }}
            />
            <input readOnly value="كاش ادخار" placeholder="الأصل" style={{ ...G.inp(), padding: "9px 7px", fontSize: 11, color: "var(--text-body)" }} />
          </div>

          {(state.assets.banks || []).map((bank) => (
            <div key={`bank-${bank.id}`} style={{ display: "grid", gridTemplateColumns: "0.9fr 0.72fr 0.72fr 0.72fr 1fr", gap: 6, marginBottom: 8 }}>
              <input readOnly value={Number(bank.balance || 0).toFixed(2)} placeholder="الإجمالي" style={{ ...G.inp(), padding: "9px 7px", fontSize: 11, color: "var(--text-body)" }} />
              <input readOnly value="1" placeholder="السعر" style={{ ...G.inp(), padding: "9px 7px", fontSize: 11, color: "var(--text-muted)" }} />
              <select value="د.أ" disabled style={{ ...G.inp(), padding: "9px 6px", fontSize: 11, opacity: 0.9 }}>
                <option value="د.أ">د.أ</option>
              </select>
              <input
                type="number"
                value={Number(bank.balance || 0)}
                onChange={(e) => updateAssetItem("banks", bank.id, { balance: Number(e.target.value || 0) })}
                placeholder="الرصيد"
                style={{ ...G.inp(), padding: "9px 7px", fontSize: 11 }}
              />
              <input
                value={bank.name || ""}
                onChange={(e) => updateAssetItem("banks", bank.id, { name: e.target.value })}
                placeholder="اسم البنك"
                style={{ ...G.inp(), padding: "9px 7px", fontSize: 11 }}
              />
            </div>
          ))}

          {(state.assets.gold || []).map((item) =>
            openingBalanceRow({
              keyPrefix: "gold",
              item,
              group: "gold",
              nameField: "label",
              unitLabel: "غم",
              priceField: "wac",
              valueField: "العيار",
            })
          )}

          {(state.assets.silver || []).map((item) =>
            openingBalanceRow({
              keyPrefix: "silver",
              item,
              group: "silver",
              nameField: "label",
              unitLabel: "غم",
              priceField: "wac",
              valueField: "فضة",
            })
          )}

          {(state.assets.stocks || []).map((item) =>
            openingBalanceRow({
              keyPrefix: "stock",
              item,
              group: "stocks",
              nameField: "name",
              unitLabel: "سهم",
              priceField: "wac",
              valueField: "السهم",
            })
          )}

          {(state.assets.custom || [])
            .filter((item) => item.type === "unit")
            .map((item) =>
              openingBalanceRow({
                keyPrefix: "custom",
                item,
                group: "custom",
                nameField: "name",
                unitLabel: "وحدة",
                priceField: "price",
                valueField: "الأصل",
              })
            )}
        </div>
        )}
<div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>
  عدد اللقطات التاريخية المحفوظة: {(state.monthlySnapshots || []).length}

  
      </div>
    </div>
  </div>
);

}

function ExtraCashModal({ state, onSubmit, onClose, preset = null }) {
  const [amount, setAmount] = useState(preset?.amount ? String(preset.amount) : "");
  const [note, setNote] = useState(preset?.note || "");
  const [allocation, setAllocation] = useState("spendingCap");
  const [targetId, setTargetId] = useState("");
  const [assetName, setAssetName] = useState("");
  const [units, setUnits] = useState("");
  const [price, setPrice] = useState("");

  const needsAssetName = ["bank", "stock", "gold", "silver", "goods", "fixed"].includes(allocation);
  const needsUnits = ["stock", "gold", "silver", "goods"].includes(allocation);

  const targetOptions =
    allocation === "bank"
      ? state.assets.banks || []
      : allocation === "stock"
      ? state.assets.stocks || []
      : allocation === "gold"
      ? [
          ...(state.assets.gold || []),
          ...["ذهب 21", "ذهب 24"]
            .filter(
              (label) =>
                !(state.assets.gold || []).some(
                  (item) => String(item.label || "").trim() === label
                )
            )
            .map((label) => ({ id: `new:${label}`, label, isPreset: true })),
        ]
      : allocation === "silver"
      ? state.assets.silver || []
      : allocation === "goods"
      ? (state.assets.custom || []).filter((item) => item.type === "unit")
      : [];

  const targetLabel = (item) => item.name || item.label || "";

  const resetTarget = (value) => {
    setAllocation(value);
    setTargetId("");
    setAssetName("");
    setUnits("");
    setPrice("");
  };

  function submit() {
    const n = Number(preset?.lockedAmount ? preset.amount : amount || 0);
    const unitCount = Number(units || 0);
    const unitPrice = Number(price || 0);

    if (!n || n <= 0) {
      alert("أدخل مبلغًا صحيحًا");
      return;
    }

    if (needsAssetName && !targetId && !assetName.trim()) {
      alert("اختر أصلًا موجودًا أو اكتب اسم أصل جديد");
      return;
    }

    if (needsUnits) {
      if (unitCount <= 0 || unitPrice <= 0) {
        alert("أدخل العدد والسعر لحساب متوسط التكلفة");
        return;
      }

      if (Math.abs(unitCount * unitPrice - n) > 0.01) {
        alert("قيمة الدخل يجب أن تساوي العدد × السعر");
        return;
      }
    }

    onSubmit({
      amount: n,
      note,
      allocation,
      targetId,
      assetName,
      units: unitCount,
      price: unitPrice,
      source: preset?.source || "extra_income",
    });
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 16,
      }}
    >
      <div
        style={{
          background: "var(--bg-card)",
          color: "white",
          border: "1px solid var(--border-soft)",
          borderRadius: 16,
          padding: 16,
          width: "100%",
          maxWidth: 420,
          textAlign: "right",
        }}
      >
        <h3 style={{ marginTop: 0 }}>{preset?.source === "salary_surplus" ? "توجيه فائض الراتب" : "دخل إضافي"}</h3>

        <label style={{ display: "block", marginBottom: 6 }}>المبلغ الداخل</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={Boolean(preset?.lockedAmount)}
          placeholder="مثال: 300"
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 12,
            borderRadius: 10,
            border: "1px solid var(--border-soft)",
            background: "var(--bg-card)",
            color: "white",
          }}
        />

        <label style={{ display: "block", marginBottom: 6 }}>المصدر</label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={Boolean(preset?.lockedNote)}
          placeholder="مثال: بونص، هدية، زيادة"
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 12,
            borderRadius: 10,
            border: "1px solid var(--border-soft)",
            background: "var(--bg-card)",
            color: "white",
          }}
        />

        <label style={{ display: "block", marginBottom: 6 }}>تخصيص الدخل</label>
        <select
          value={allocation}
          onChange={(e) => resetTarget(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 16,
            borderRadius: 10,
            border: "1px solid var(--border-soft)",
            background: "var(--bg-card)",
            color: "white",
          }}
        >
          <option value="spendingCap">زيادة سقف الصرف</option>
          <option value="cash">ادخار كاش احتياطي</option>
          <option value="bank">حساب بنكي</option>
          <option value="stock">أسهم</option>
          <option value="gold">ذهب</option>
          <option value="silver">فضة</option>
          <option value="goods">بضاعة / وحدات</option>
          <option value="fixed">أصل ثابت</option>
        </select>

        {targetOptions.length > 0 && (
          <select
            value={targetId}
            onChange={(e) => {
              const value = e.target.value;
              const preset = targetOptions.find((item) => String(item.id) === value && item.isPreset);
              if (preset) {
                setTargetId("");
                setAssetName(preset.label);
                return;
              }
              setTargetId(value);
              setAssetName("");
            }}
            style={{
              width: "100%",
              padding: 10,
              marginBottom: 10,
              borderRadius: 10,
              border: "1px solid var(--border-soft)",
              background: "var(--bg-card)",
              color: "white",
            }}
          >
            <option value="">أصل جديد</option>
            {targetOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {targetLabel(item)}
              </option>
            ))}
          </select>
        )}

        {needsAssetName && !targetId && (
          <input
            value={assetName}
            onChange={(e) => setAssetName(e.target.value)}
            placeholder={
              allocation === "gold"
                ? "مثال: ذهب 21"
                : allocation === "silver"
                ? "مثال: فضة"
                : allocation === "stock"
                ? "اسم السهم"
                : allocation === "bank"
                ? "اسم البنك"
                : "اسم الأصل"
            }
            style={{
              width: "100%",
              padding: 10,
              marginBottom: 10,
              borderRadius: 10,
              border: "1px solid var(--border-soft)",
              background: "var(--bg-card)",
              color: "white",
            }}
          />
        )}

        {needsUnits && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
            <input
              type="number"
              value={units}
              onChange={(e) => setUnits(e.target.value)}
              placeholder={allocation === "stock" ? "عدد الأسهم" : "عدد الوحدات"}
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 10,
                border: "1px solid var(--border-soft)",
                background: "var(--bg-card)",
                color: "white",
              }}
            />
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="سعر الشراء"
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 10,
                border: "1px solid var(--border-soft)",
                background: "var(--bg-card)",
                color: "white",
              }}
            />
          </div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={submit}
            style={{
              flex: 1,
              padding: "10px 12px",
              border: 0,
              borderRadius: 10,
              background: "#22c55e",
              color: "white",
              cursor: "pointer",
            }}
          >
            حفظ
          </button>

          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px 12px",
              border: "1px solid var(--border-soft)",
              borderRadius: 10,
              background: "transparent",
              color: "white",
              cursor: "pointer",
            }}
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
function getMonthKey(dateValue) {
  if (!dateValue) return "";
  return String(dateValue).slice(0, 7);
}

function formatMonthKey(monthKey) {
  if (!monthKey) return "الشهر الحالي";
  const [year, month] = String(monthKey).split("-").map(Number);
  if (!year || !month) return String(monthKey);

  return `${year}/${month}`;
}

function getNextMonthKey(monthKey) {
  const [year, month] = String(monthKey).split("-").map(Number);
  const d = new Date(year, month, 1);
  return d.toISOString().slice(0, 7);
}

function buildExpensesByCategory(expenses = []) {
  return expenses.reduce((acc, expense) => {
    const category = expense.category || expense.type || "غير مصنف";
    const amount = Number(expense.amount || 0);

    acc[category] = Number(acc[category] || 0) + amount;

    return acc;
  }, {});
}

function buildCurrentLiabilityPlan(currentLiabilities = [], targetMonth) {
  const dueThisMonth = [];
  const upcomingByMonth = {};
  let notDueTotal = 0;
  let total = 0;

  currentLiabilities.forEach((liability) => {
    const balance = Number(liability.balance ?? liability.amount ?? 0);
    if (!balance || balance <= 0) return;

    total += balance;

    const dueMonth = getMonthKey(liability.dueDate);

    if (dueMonth === targetMonth) {
      dueThisMonth.push(liability);
    } else {
      notDueTotal += balance;

      const key = dueMonth || "بدون تاريخ";
      upcomingByMonth[key] = Number(upcomingByMonth[key] || 0) + balance;
    }
  });

  return {
    dueThisMonth,
    notDueTotal,
    upcomingByMonth,
    total,
  };
}

function buildMonthlySnapshot(state) {
  const currentMonth = state.currentMonth || new Date().toISOString().slice(0, 7);
  const nextMonth = getNextMonthKey(currentMonth);

  const structuralTotal = calcStructuralTotal(state);
  const assetTotals = calcAssets(state);

  const currentPlan = buildCurrentLiabilityPlan(
    state.currentLiabilities || [],
    nextMonth
  );

  
    return {
  id: `${currentMonth}-${Date.now()}`,
  month: currentMonth,
    closedAt: new Date().toISOString(),

    salary: Number(state.settings?.salary || 0),
    spendingCap: Number(state.session?.spendingCap || state.settings?.spendingCap || 0),

    expenses: structuredClone(state.expenses || []),
    expensesByCategory: buildExpensesByCategory(state.expenses || []),
    extraCash: structuredClone(state.extraCash || []),
    transactions: structuredClone(state.transactions || []),

    assetTotals: {
      totalAssets: assetTotals.totalAssets,
      currentLiabilities: assetTotals.currentLiabilities,
      netWorth: assetTotals.netWorth,
    },

    assets: structuredClone(state.assets || {}),
    assetHistory: structuredClone(state.assetHistory || []),

    liabilities: {
      structuralLiabilities: structuredClone(state.structuralLiabilities || []),
      structuralTotal,

      currentDueNextMonth: structuredClone(currentPlan.dueThisMonth || []),
      currentNotDueTotal: currentPlan.notDueTotal,
      currentUpcomingByMonth: currentPlan.upcomingByMonth,
      currentTotal: currentPlan.total,
    },
  };
}

function getDueDateForMonth(item, monthKey) {
  const day = Number(item.dueDay || (item.dueDate ? String(item.dueDate).split("-")[2] : 1) || 1);
  const safeDay = Math.min(28, Math.max(1, day));
  return `${monthKey}-${String(safeDay).padStart(2, "0")}`;
}

function closeMonthState(prev, targetMonth = new Date().toISOString().slice(0, 7)) {
  const snapshot = buildMonthlySnapshot(prev);
  const nextMonth = getNextMonthKey(prev.currentMonth || targetMonth);
  const structuralTotal = calcStructuralTotal(prev);
  const netSalary = Math.max(0, Number(prev.settings?.salary || 0) - structuralTotal);
  const spendingCap = Number(prev.session?.spendingCap || 0);
  const pendingSurplus = Math.max(0, netSalary - spendingCap);

  const rolledCurrentLiabilities = (prev.currentLiabilities || [])
    .filter((l) => l.status !== "paid")
    .map((l) => ({
      ...l,
      dueDate: getDueDateForMonth(l, nextMonth),
      dueDay: Number(l.dueDay || (l.dueDate ? String(l.dueDate).split("-")[2] : 1) || 1),
      status: "pending",
      paymentMethod: "",
      newDueDate: "",
      salaryPaidAmount: 0,
      createdThisMonthPaidFromSalary: false,
    }));

  return {
    ...prev,
    monthlySnapshots: [
      ...(prev.monthlySnapshots || []).filter((s) => s.month !== snapshot.month),
      snapshot,
    ],
    currentMonth: nextMonth,
    expenses: [],
    extraCash: [],
    session: {
      ...prev.session,
      coveredSpent: 0,
      overBudgetSpent: 0,
      pendingSurplus: Number(pendingSurplus.toFixed(2)),
    },
    structuralLiabilities: prev.structuralLiabilities || [],
    currentLiabilities: rolledCurrentLiabilities,
  };
}

function rollStateToCurrentMonth(state) {
  const targetMonth = new Date().toISOString().slice(0, 7);
  let next = state;
  let guard = 0;

  while (
    String(next.currentMonth || targetMonth) < targetMonth &&
    guard < 24
  ) {
    next = closeMonthState(next, targetMonth);
    guard += 1;
  }

  return next;
}

export default function App() {
  const [state, setState] = useState(INITIAL_STATE);
  const [storageReady, setStorageReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  const [authSession, setAuthSession] = useState(null);
  const [authMode, setAuthMode] = useState("signin");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authNotice, setAuthNotice] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [tab, setTab] = useState("overview");
  const [liabilitiesFocusDueOnly, setLiabilitiesFocusDueOnly] = useState(false);
    const [showExtraCash, setShowExtraCash] = useState(false);
    const [extraCashPreset, setExtraCashPreset] = useState(null);
    const [selectedViewMonth, setSelectedViewMonth] = useState("current");
    useEffect(() => {
    let active = true;

    getSessionFromUrl()
      .then((session) => {
        if (!active || !session) return;
        setAuthSession(session);
        setAuthPassword("");
        setAuthError("");
        setAuthNotice("");
      })
      .catch((err) => {
        console.error("Auth Redirect Error:", err);
        if (!active) return;
        setAuthError(authErrorMessage(err));
      });

    return () => {
      active = false;
    };
  }, []);
    useEffect(() => {
    let active = true;

    if (!authSession) {
      setStorageReady(false);
      setStorageError("");
      setState(INITIAL_STATE);
      return () => {
        active = false;
      };
    }

    loadState(authSession)
      .then((storedState) => {
        if (!active) return;
        setState(storedState || INITIAL_STATE);
        setStorageError("");
        setStorageReady(true);
      })
      .catch((err) => {
        console.error("Load Error:", err);
        if (!active) return;
        setStorageError("تعذر الاتصال بـ Supabase. تأكد من متغيرات Vercel وجدول wealth_app_state.");
        setStorageReady(false);
      });

    return () => {
      active = false;
    };
  }, [authSession]);
    useEffect(() => {
    if (!storageReady || !authSession) return;
    saveState(state, authSession).catch((err) => {
      console.error("Save Error:", err);
      setStorageError("تعذر حفظ البيانات في Supabase. لم يتم استخدام تخزين محلي.");
    });
  }, [state, storageReady, authSession]);
    useEffect(() => {
    if (!storageReady) return undefined;
    setState((prev) => rollStateToCurrentMonth(prev));
    const timer = window.setInterval(() => {
      setState((prev) => rollStateToCurrentMonth(prev));
    }, 60 * 1000);
    return () => window.clearInterval(timer);
  }, [storageReady]);
function handleExtraCashSubmit(data) {
  const amount = Number(data.amount || 0);

  if (!amount || amount <= 0) {
    alert("أدخل مبلغًا صحيحًا");
    return;
  }

  setState((prev) => {
    const now = new Date().toISOString();
    const allocation = data.allocation || data.direction || "spendingCap";
    const isSalarySurplus = data.source === "salary_surplus";
    const targetName = String(data.assetName || data.note || "").trim();
    const units = Number(data.units || 0);
    const price = Number(data.price || 0);
    const purchaseValue = units * price;
    const record = {
      id: Date.now(),
      type: "positive_cash",
      cashFlow: "positive",
      amount,
      note: data.note || "",
      direction: allocation,
      allocation,
      date: now,
    };

    let next = {
      ...structuredClone(prev),
      extraCash: isSalarySurplus ? prev.extraCash || [] : [...(prev.extraCash || []), record],
      transactions: [...(prev.transactions || []), record],
      assetHistory: [...(prev.assetHistory || [])],
    };

    const addUnitAsset = ({ listName, idField = "id", nameField, type }) => {
      if (units <= 0 || price <= 0) {
        alert("أدخل العدد والسعر لحساب متوسط التكلفة");
        return false;
      }

      if (Math.abs(purchaseValue - amount) > 0.01) {
        alert("قيمة الشراء يجب أن تساوي الدخل الإضافي");
        return false;
      }

      const list = next.assets[listName] || [];
      const existing = data.targetId
        ? list.find((item) => String(item[idField]) === String(data.targetId))
        : list.find((item) => String(item[nameField] || "").trim() === targetName);

      if (existing) {
        const oldUnits = Number(existing.units || 0);
        const oldAverage =
          type === "custom" ? Number(existing.price || 0) : Number(existing.wac || 0);
        const totalUnits = oldUnits + units;
        const nextAverage =
          totalUnits > 0
            ? Number(((oldUnits * oldAverage + purchaseValue) / totalUnits).toFixed(4))
            : price;

        existing.units = Number(totalUnits.toFixed(4));
        if (type === "custom") {
          existing.price = nextAverage;
        } else {
          existing.wac = nextAverage;
        }
        if (listName === "stocks") existing.currentPrice = price;
        next.assetHistory.push({
          id: `${Date.now()}-${allocation}`,
          date: now,
          type: "buy_units",
          source: "extra_income",
          assetKind: listName,
          assetId: existing.id,
          assetName: existing.name || existing.label,
          amount,
          unitsAdded: units,
          unitPrice: price,
          unitsBefore: oldUnits,
          unitsAfter: Number(totalUnits.toFixed(4)),
          averageBefore: oldAverage,
          averageAfter: nextAverage,
          note: data.note || "",
        });
      } else {
        if (!targetName) {
          alert("أدخل اسم الأصل الجديد");
          return false;
        }

        const id = Date.now();
        if (listName === "stocks") {
          list.push({
            id,
            name: targetName,
            units,
            wac: price,
            currentPrice: price,
          });
        } else if (listName === "custom") {
          list.push({
            id,
            name: targetName,
            type: "unit",
            units,
            price,
          });
        } else {
          list.push({
            id,
            label: targetName,
            units,
            wac: price,
          });
        }
        next.assetHistory.push({
          id: `${Date.now()}-${allocation}`,
          date: now,
          type: "buy_units",
          source: "extra_income",
          assetKind: listName,
          assetId: id,
          assetName: targetName,
          amount,
          unitsAdded: units,
          unitPrice: price,
          unitsBefore: 0,
          unitsAfter: units,
          averageBefore: 0,
          averageAfter: price,
          note: data.note || "",
        });
      }

      next.assets[listName] = list;
      return true;
    };

    if (allocation === "spendingCap") {
      next = {
        ...next,
        session: {
          ...next.session,
          spendingCap: Number(next.session.spendingCap || 0) + amount,
        },
        expenses: [
          ...(next.expenses || []),
          {
            id: Date.now() + 1,
            amount: 0,
            originalAmount: amount,
            category: isSalarySurplus ? "فائض راتب موجه" : "نقد إضافي مدخل",
            paymentMethod: "income",
            note: data.note || (isSalarySurplus ? "فائض راتب إلى السقف" : "نقد إضافي مدخل"),
            date: now.slice(0, 10),
            createdAt: now,
            budgetCovered: 0,
            overBudget: 0,
            isIncomeEntry: true,
          },
        ],
      };
      next.assetHistory.push({
        id: `${Date.now()}-spendingCap`,
        date: now,
        type: "income_to_spending_cap",
        source: "extra_income",
        amount,
        note: data.note || "",
      });
    }

    if (allocation === "cash") {
      next = {
        ...next,
        assets: {
          ...next.assets,
          cash: Number(next.assets?.cash || 0) + amount,
        },
      };
      next.assetHistory.push({
        id: `${Date.now()}-cash`,
        date: now,
        type: "income_to_cash",
        source: "extra_income",
        assetKind: "cash",
        amount,
        balanceAfter: next.assets.cash,
        note: data.note || "",
      });
    }

    if (allocation === "bank") {
      const bankName = targetName;
      if (!bankName && !data.targetId) {
        alert("اختر حسابًا أو أدخل اسم بنك جديد");
        return prev;
      }

      const existing = data.targetId
        ? (next.assets.banks || []).find((bank) => String(bank.id) === String(data.targetId))
        : (next.assets.banks || []).find((bank) => String(bank.name || "").trim() === bankName);

      if (existing) {
        existing.balance = Number((Number(existing.balance || 0) + amount).toFixed(2));
        next.assetHistory.push({
          id: `${Date.now()}-bank`,
          date: now,
          type: "income_to_bank",
          source: "extra_income",
          assetKind: "bank",
          assetId: existing.id,
          assetName: existing.name,
          amount,
          balanceAfter: existing.balance,
          note: data.note || "",
        });
      } else {
        const id = Date.now();
        next.assets.banks.push({
          id,
          name: bankName,
          balance: amount,
        });
        next.assetHistory.push({
          id: `${Date.now()}-bank`,
          date: now,
          type: "income_to_bank",
          source: "extra_income",
          assetKind: "bank",
          assetId: id,
          assetName: bankName,
          amount,
          balanceAfter: amount,
          note: data.note || "",
        });
      }
    }

    if (allocation === "stock") {
      if (!addUnitAsset({ listName: "stocks", nameField: "name", type: "stock" })) return prev;
    }

    if (allocation === "gold") {
      if (!addUnitAsset({ listName: "gold", nameField: "label", type: "metal" })) return prev;
    }

    if (allocation === "silver") {
      if (!addUnitAsset({ listName: "silver", nameField: "label", type: "metal" })) return prev;
    }

    if (allocation === "goods") {
      if (!addUnitAsset({ listName: "custom", nameField: "name", type: "custom" })) return prev;
    }

    if (allocation === "fixed") {
      if (!targetName) {
        alert("أدخل اسم الأصل");
        return prev;
      }

      const existing = (next.assets.custom || []).find(
        (item) => item.type === "fixed" && String(item.name || "").trim() === targetName
      );

      if (existing) {
        existing.amount = Number((Number(existing.amount || 0) + amount).toFixed(2));
        next.assetHistory.push({
          id: `${Date.now()}-fixed`,
          date: now,
          type: "income_to_fixed_asset",
          source: "extra_income",
          assetKind: "fixed",
          assetId: existing.id,
          assetName: existing.name,
          amount,
          balanceAfter: existing.amount,
          note: data.note || "",
        });
      } else {
        const id = Date.now();
        next.assets.custom.push({
          id,
          name: targetName,
          type: "fixed",
          amount,
        });
        next.assetHistory.push({
          id: `${Date.now()}-fixed`,
          date: now,
          type: "income_to_fixed_asset",
          source: "extra_income",
          assetKind: "fixed",
          assetId: id,
          assetName: targetName,
          amount,
          balanceAfter: amount,
          note: data.note || "",
        });
      }
    }

    next.transactions = (next.transactions || []).map((tx) =>
      tx.id === record.id
        ? {
            ...tx,
            allocation,
            targetId: data.targetId || null,
            assetName: targetName,
            units: units || null,
            price: price || null,
            purchaseValue: purchaseValue || null,
          }
        : tx
    );

    if (isSalarySurplus) {
      next.session = {
        ...next.session,
        pendingSurplus: 0,
      };
    }

    return next;
  });

  setShowExtraCash(false);
  setExtraCashPreset(null);
}

function handleCloseMonth() {
  setState((prev) => closeMonthState(prev));
}

async function handleAuthSubmit(ev) {
  ev.preventDefault();
  setAuthError("");
  setAuthNotice("");
  setAuthLoading(true);

  try {
    const email = authEmail.trim();
    const password = authPassword;
    const result =
      authMode === "signup"
        ? await signUpWithPassword(email, password)
        : await signInWithPassword(email, password);

    if (!result.access_token) {
      setAuthNotice("تم إنشاء الحساب. تحقق من البريد الإلكتروني ثم سجل الدخول.");
      setAuthMode("signin");
      return;
    }

    setAuthSession(result);
    setAuthPassword("");
  } catch (err) {
    console.error("Auth Error:", err);
    setAuthError(authErrorMessage(err));
  } finally {
    setAuthLoading(false);
  }
}

async function handlePasswordReset() {
  setAuthError("");
  setAuthNotice("");

  const email = authEmail.trim();

  if (!email) {
    setAuthError("أدخل البريد الإلكتروني أولاً.");
    return;
  }

  setAuthLoading(true);

  try {
    await resetPasswordForEmail(email);
    setAuthNotice("تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني.");
  } catch (err) {
    console.error("Password Reset Error:", err);
    setAuthError(authErrorMessage(err));
  } finally {
    setAuthLoading(false);
  }
}

  if (!authSession) {
    return (
      <div
        style={{
          ...G.app,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 18,
        }}
      >
        <form
          onSubmit={handleAuthSubmit}
          style={{
            ...G.card(),
            width: "100%",
            textAlign: "right",
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text-heading)", marginBottom: 12 }}>
            تسجيل الدخول
          </div>

          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12, lineHeight: 1.7 }}>
            يرجى تسجيل الدخول أو إنشاء حساب للبدء
          </div>

          <input
            type="email"
            value={authEmail}
            onChange={(e) => setAuthEmail(e.target.value)}
            placeholder="البريد الإلكتروني"
            required
            style={{ ...G.inp(), marginBottom: 10 }}
          />

          <input
            type="password"
            value={authPassword}
            onChange={(e) => setAuthPassword(e.target.value)}
            placeholder="كلمة المرور"
            required
            minLength={6}
            style={{ ...G.inp(), marginBottom: 12 }}
          />

          {authError && (
            <div style={{ color: "#D95555", fontSize: 12, marginBottom: 10 }}>
              {authError}
            </div>
          )}

          {authNotice && (
            <div style={{ color: "#2A9E60", fontSize: 12, marginBottom: 10 }}>
              {authNotice}
            </div>
          )}

          <button
            type="submit"
            disabled={authLoading}
            style={G.btn("linear-gradient(135deg,var(--gold-primary),var(--gold-border))", "var(--text-heading)", {
              width: "100%",
              opacity: authLoading ? 0.7 : 1,
            })}
          >
            {authLoading ? "جاري الدخول" : authMode === "signup" ? "إنشاء حساب" : "دخول"}
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode(authMode === "signup" ? "signin" : "signup");
              setAuthError("");
              setAuthNotice("");
            }}
            style={{
              marginTop: 10,
              width: "100%",
              border: "none",
              background: "transparent",
              color: "var(--gold-dark)",
              fontFamily: "inherit",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {authMode === "signup" ? "لدي حساب" : "إنشاء حساب جديد"}
          </button>

          <button
            type="button"
            onClick={handlePasswordReset}
            disabled={authLoading}
            style={{
              marginTop: 8,
              width: "100%",
              border: "none",
              background: "transparent",
              color: "var(--text-muted)",
              fontFamily: "inherit",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            استعادة كلمة المرور
          </button>
        </form>
      </div>
    );
  }

  if (storageError) {
    return (
      <div
        style={{
          ...G.app,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 18,
        }}
      >
        <div
          style={{
            ...G.card(),
            width: "100%",
            textAlign: "right",
            border: "1.5px solid var(--red-border)",
            background: "var(--red-bg)",
            color: "var(--text-body)",
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 800, color: "#D95555", marginBottom: 8 }}>
            خطأ في الاتصال بقاعدة البيانات
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.8 }}>{storageError}</div>
        </div>
      </div>
    );
  }

  
  const tabs = [
    { id: "settings", label: "الإعدادات" },
    { id: "reports", label: "التقارير" },
    { id: "overview", label: "الرئيسية" },
    { id: "assets", label: "الأصول" },
    { id: "liabilities", label: "الخصوم" },
  ];
  const snapshots = state.monthlySnapshots || [];
  const currentMonthLabel = formatMonthKey(state.currentMonth || new Date().toISOString().slice(0, 7));

const selectedViewSnapshot =
  selectedViewMonth === "current"
    ? null
    : snapshots.find((snap) => snap.id === selectedViewMonth);
const isSnapshotView = Boolean(selectedViewSnapshot);
const visibleTabs = isSnapshotView
  ? tabs.filter((item) => ["overview", "reports", "assets"].includes(item.id))
  : tabs;
useEffect(() => {
  if (isSnapshotView && !["overview", "reports", "assets"].includes(tab)) {
    setTab("overview");
  }
}, [isSnapshotView, tab]);
    const viewState = selectedViewSnapshot
  ? {
      ...state,
      currentMonth: selectedViewSnapshot.month || state.currentMonth,
      settings: {
        ...state.settings,
        month: selectedViewSnapshot.month || state.settings?.month,
        salary: selectedViewSnapshot.salary ?? state.settings?.salary,
      },
      session: {
        ...state.session,
        spendingCap:
          selectedViewSnapshot.spendingCap ??
          state.session?.spendingCap ??
          state.settings?.spendingCap,
      },
      assets: selectedViewSnapshot.assets || state.assets,
      expenses: selectedViewSnapshot.expenses || [],
      extraCash: selectedViewSnapshot.extraCash || [],
      currentLiabilities:
        selectedViewSnapshot.currentLiabilities ||
        selectedViewSnapshot.liabilities?.current ||
        [],
      structuralLiabilities:
        selectedViewSnapshot.structuralLiabilities ||
        selectedViewSnapshot.liabilities?.structural ||
        state.structuralLiabilities ||
        state.structural ||
        [],
      __isSnapshotView: true,
      __snapshot: selectedViewSnapshot,
    }
  : state;

  return (
    <div style={G.app}>
      <div style={G.hdr}>
        <div
  style={{
    position: "relative",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    minHeight: 44,
    direction: "ltr",
  }}
>
  <div
    style={{
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "center",
      minWidth: 0,
      direction: "rtl",
    }}
  >
    <select
      value={selectedViewMonth}
      onChange={(e) => setSelectedViewMonth(e.target.value)}
      style={{
        fontSize: 12,
        color: "#8A6820",
        background: "var(--gold-light)",
        padding: "6px 12px",
        borderRadius: 20,
        border: "1px solid var(--gold-border)",
        fontWeight: 600,
        outline: "none",
      }}
    >
      <option value="current">
        {currentMonthLabel}
      </option>

      {snapshots.map((snap) => (
        <option key={snap.id} value={snap.id}>
          {formatMonthKey(snap.month)}
        </option>
      ))}
    </select>
    {selectedViewSnapshot && (
      <span
        style={{
          marginRight: 6,
          color: "#8A6820",
          background: "var(--gold-light)",
          border: "1px solid var(--gold-border)",
          borderRadius: 999,
          padding: "3px 7px",
          fontSize: 9,
          fontWeight: 800,
        }}
      >
        عرض فقط
      </span>
    )}
    <button
      type="button"
      onClick={() => {
        setAuthSession(null);
        setStorageReady(false);
        setStorageError("");
      }}
      style={{
        marginRight: 6,
        border: "1px solid var(--border-soft)",
        background: "var(--bg-secondary)",
        color: "var(--text-muted)",
        borderRadius: 999,
        padding: "5px 8px",
        fontSize: 10,
        fontWeight: 700,
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      تسجيل خروج
    </button>
  </div>

  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 8,
      direction: "rtl",
    }}
  >
    <div style={{ textAlign: "right" }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-heading)" }}>
        مدير الثروة الذكي
      </div>
      <div style={{ fontSize: 10, color: "var(--text-faint)", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase" }}>
        Smart Wealth Tracker
      </div>
    </div>

    <div
      style={{
        width: 36,
        height: 36,
        background: "linear-gradient(135deg, var(--gold-primary), var(--gold-dark))",
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 16,
        fontWeight: 800,
        color: "#fff",
      }}
    >
      ◈
    </div>
  </div>
</div>
        {false && <style>
  {`
    @keyframes drawerIn {
      from {
        opacity: 0;
        transform: translateX(100%);
      }

      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `}
</style>}

       {false && <>
  
  {menuOpen && (
    <>
      <div
        onClick={() => setMenuOpen(false)}
        style={{
          position: "fixed",
          top: 0,
          right: "max(0px, calc((100vw - 480px) / 2))",
          width: "min(100vw, 480px)",
          height: "100dvh",
          zIndex: 600,
          background: "rgba(0,0,0,0.55)",
        }}
      />

      <div
        style={{
          position: "fixed",
          top: 0,
          right: "max(0px, calc((100vw - 480px) / 2))",
          width: "min(78vw, 360px)",
          height: "100dvh",
          zIndex: 650,
          background: "var(--bg-card)",
animation: "drawerIn 0.28s ease-out",
          borderLeft: "1px solid var(--gold-border)",
          boxShadow: "-18px 0 42px rgba(0,0,0,0.45)",
          padding: "22px 18px",
          direction: "rtl",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
justifyContent: "flex-end",
            marginBottom: 8,
          }}
        >
          <button
            onClick={() => setMenuOpen(false)}
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              border: "none",
              background: "transparent",
              color: "var(--text-body)",
              fontSize: 30,
              cursor: "pointer",
            }}
          >
            ×
          </button>

          <div style={{ textAlign: "right" }}>
            <div style={{ color: "var(--text-heading)", fontWeight: 900, fontSize: 18 }}>
              مدير الثروة
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: 11 }}>
              Smart Wealth Tracker
            </div>
          </div>
        </div>

<div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {visibleTabs.map((t) => {
            const icon =
              t.id === "overview"
                ? "▦"
                : t.id === "assets"
                ? "◇"
                : t.id === "liabilities"
                ? "▣"
                : "⚙";

            return (
              <button
                key={t.id}
                onClick={() => {
                  setLiabilitiesFocusDueOnly(false);
                  setTab(t.id);
                  setMenuOpen(false);
                }}
                style={{
                  width: "100%",
                  minHeight: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 18px",
                  borderRadius: 18,
                  cursor: "pointer",
                 background:
  tab === t.id
    ? "linear-gradient(135deg, rgba(201,168,64,0.24), rgba(232,201,106,0.14))"
    : "transparent",
border:
  tab === t.id
    ? "1px solid rgba(232,201,106,0.55)"
    : "1px solid transparent",
color: tab === t.id ? "var(--text-heading)" : "var(--text-body)",
fontFamily: "inherit",
fontSize: 16,
fontWeight: tab === t.id ? 900 : 700,
boxShadow:
  tab === t.id
    ? "0 10px 28px rgba(201,168,64,0.18)"
    : "none",
                }}
              >
                <span>{t.label}</span>
                <span style={{ fontSize: 24, opacity: tab === t.id ? 1 : 0.75 }}>
                  {icon}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  )}
</>}
</div>

      <main key={`${tab}-${selectedViewMonth}`} className="tab-page-motion">
        {tab === "overview" && (
          <Overview
            state={viewState}
            setState={setState}
            readOnly={isSnapshotView}
            onOpenReports={() => setTab("reports")}
            onOpenDueLiabilities={() => {
              if (isSnapshotView) return;
              setLiabilitiesFocusDueOnly(true);
              setTab("liabilities");
            }}
            onAllocateSurplus={(amount) => {
              setExtraCashPreset({
                amount,
                lockedAmount: true,
                lockedNote: true,
                note: "فائض راتب",
                source: "salary_surplus",
              });
              setShowExtraCash(true);
            }}
          />
        )}
        {tab === "reports" && <ReportsScreen state={viewState} />}
        {tab === "assets" && (
          <AssetsScreen
            state={viewState}
            setState={setState}
            readOnly={isSnapshotView}
            onAddExtraCash={() => {
              setExtraCashPreset(null);
              setShowExtraCash(true);
            }}
          />
        )}
        {!isSnapshotView && tab === "liabilities" && (
          <LiabilitiesScreen
            state={viewState}
            setState={setState}
            focusDueOnly={liabilitiesFocusDueOnly}
          />
        )}
        {!isSnapshotView && tab === "settings" && (
          <SettingsScreen
            state={state}
            setState={setState}
            onCloseMonth={handleCloseMonth}
          />
        )}
      </main>

      <FloatingBottomBar
        tabs={visibleTabs}
        activeTab={tab}
        onSelect={(id) => {
          setLiabilitiesFocusDueOnly(false);
          setTab(id);
        }}
      />
      {!isSnapshotView && showExtraCash && (
  <ExtraCashModal
    state={state}
    onSubmit={handleExtraCashSubmit}
    onClose={() => {
      setShowExtraCash(false);
      setExtraCashPreset(null);
    }}
    preset={extraCashPreset}
  />
)}
    </div>
  );
  }
