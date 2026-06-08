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
import { loadState, saveState, clearState } from "./storage/localStorage";
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
  طعام: "#f59e0b",
  مواصلات: "#3b82f6",
  تسوق: "#a855f7",
  صحة: "#22c55e",
  ترفيه: "#ec4899",
  فواتير: "#64748b",
  بنزين: "#f97316",
  ملابس: "#38bdf8",
هدايا: "#f472b6",
قرطاسية: "#a78bfa",
"أقساط مدارس": "#facc15",
"صيانة سيارة": "#fb923c",
"صيانة بيت": "#34d399",
  أخرى: "#94a3b8",
};

const G = {
  app: {
    minHeight: "100vh",
    background: "#080f1a",
    fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif",
    direction: "rtl",
    color: "#f8fafc",
    maxWidth: 440,
    margin: "0 auto",
    position: "relative",
    paddingBottom: 90,
  },
  hdr: {
    background: "#0c1525",
    borderBottom: "1px solid #1e293b",
    padding: "14px 16px 0",
    position: "sticky",
    top: 0,
    zIndex: 50,
  },
  scr: { padding: "14px" },
  card: (b) => ({
    background: "#0f172a",
    borderRadius: 16,
    border: `1px solid ${b || "#1e293b"}`,
    padding: "14px 16px",
    marginBottom: 12,
  }),
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid #1a2540",
  },
  lrow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
  },
  btn: (bg, col = "#fff", ex = {}) => ({
    background: bg,
    border: "none",
    borderRadius: 12,
    padding: "12px 20px",
    color: col,
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "inherit",
    ...ex,
  }),
  inp: (w = "100%") => ({
    width: w,
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: 10,
    padding: "10px 12px",
    color: "#f8fafc",
    fontSize: 14,
    fontFamily: "inherit",
    textAlign: "right",
    outline: "none",
  }),
};

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
  const col = pct >= 100 ? "#ef4444" : pct >= 70 ? "#f59e0b" : "#22c55e";

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
        <span style={{ color: "#64748b" }}>
          {spent.toFixed(2)} / {cap.toFixed(2)} د.أ
        </span>
        <span style={{ color: col, fontWeight: 700 }}>{pct}%</span>
      </div>
      <div
        style={{
          background: "#1e293b",
          borderRadius: 99,
          height: 10,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: col,
            borderRadius: 99,
          }}
        />
      </div>
    </div>
  );
}
function ExpenseDonut({ expenses }) {
  const expenseCats = Array.from(
  new Set((expenses || []).map((e) => e.category).filter(Boolean))
);

const grouped = expenseCats.map((cat) => ({
  name: cat,
  value: (expenses || [])
    .filter((e) => e.category === cat)
    .reduce((sum, e) => sum + Number(e.amount || 0), 0),
  color: CC[cat] || "#94a3b8",
})).filter((x) => x.value > 0);
  const total = grouped.reduce((sum, x) => sum + x.value, 0);

  if (!grouped.length) {
    return (
      <div
        style={{
          textAlign: "center",
          color: "#475569",
          padding: "24px 0",
          fontSize: 13,
        }}
      >
        لا توجد مصاريف بعد
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
              innerRadius={54}
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
          <div style={{ fontSize: 18, fontWeight: 800 }}>
            {total.toFixed(0)}
          </div>
          <div style={{ fontSize: 10, color: "#64748b" }}>د.أ</div>
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
              gap: 4,
              fontSize: 11,
              color: "#94a3b8",
            }}
          >
            <span style={{ color: d.color, fontWeight: 700 }}>
              {total ? Math.round((d.value / total) * 100) : 0}%
            </span>
            <span>{d.name}</span>
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: 2,
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

function Overview({ state, setState }) {
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
const [unusualFundingMode, setUnusualFundingMode] = useState("asset");
const [unusualCapAmount, setUnusualCapAmount] = useState("");
const [unusualAssetKey, setUnusualAssetKey] = useState("cash");
const [unusualLiabilityName, setUnusualLiabilityName] = useState("مصروف غير اعتيادي");
const [unusualDueDate, setUnusualDueDate] = useState("");
  const cards = state.currentLiabilities.filter((x) => x.type === "card");
  const recent = [...state.expenses].slice(-5).reverse();
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
  { id: "bills", label: "فواتير", icon: "🧾", color: "#64748b", pinned: true },
  { id: "fuel", label: "بنزين", icon: "⛽", color: "#f97316", pinned: true },
  { id: "other", label: "أخرى", icon: "•••", color: "#94a3b8", isOther: true, pinned: true },
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
    color: "#94a3b8",
    isOther: true,
    pinned: true,
  };

const mainExpenseCategories = pinnedExpenseCategories;
  const enteredAmount = Number(amount || 0);
const expectedOverBudget = Math.max(
  0,
  enteredAmount - Number(budget.remainingCap || 0)
);

  const submitExpense = () => {
    if (paymentMethod === "liability" && !dueDate) {
  alert("أدخل تاريخ استحقاق الدين المباشر");
  return;
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
    });

    if (!result.success) {
      alert(result.message);
      return;
    }

    let nextState = result.nextState;

const lastExpense =
  nextState.expenses[nextState.expenses.length - 1];

if (lastExpense?.overBudget > 0) {
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
setOverBudgetLiabilityName("تجاوز سقف الصرف");
setOverBudgetDueDate("");
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
          Number((Number(card.uncoveredDebt || 0) - overBudget).toFixed(2))
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
        tx.type === "over_budget_covered_from_asset"
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
      color: "#94a3b8",
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
              {dueCurrentLiabilities.length > 0 && (
  <div
    style={{
      background: "#3b0d0d",
      border: "1px solid #ef4444",
      color: "#fecaca",
      padding: 12,
      borderRadius: 12,
      marginBottom: 14,
      textAlign: "right",
    }}
  >
    ⚠️ لديك {dueCurrentLiabilities.length} التزام جاري مستحق هذا الشهر
  </div>
)}
        <div style={{ textAlign: "right", marginBottom: 12, color: "#94a3b8" }}>
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
          <div style={{ background: "#1a2540", borderRadius: 10, padding: 10 }}>
            <div style={{ fontSize: 10, color: "#64748b" }}>المتبقي</div>
            <div style={{ color: "#22c55e", fontWeight: 800 }}>
              {budget.remainingCap.toFixed(2)}
            </div>
          </div>

          {budget.overBudgetSpent > 0 && (
  <div style={{ background: "#1a0808", borderRadius: 10, padding: 10 }}>
    <div style={{ fontSize: 10, color: "#64748b" }}>التجاوز</div>
    <div style={{ color: "#ef4444", fontWeight: 800 }}>
      {budget.overBudgetSpent.toFixed(2)}
    </div>
  </div>
)}        </div>
      </div>

      <button
        onClick={() => setShowExpense(true)}
        disabled={!state.session.isOpen}
        style={G.btn(
          state.session.isOpen
            ? "linear-gradient(135deg,#c9a840,#e8c96a)"
            : "#1e293b",
          state.session.isOpen ? "#0f172a" : "#64748b",
          {
            width: "100%",
            marginBottom: 12,
            opacity: state.session.isOpen ? 1 : 0.6,
          }
        )}
      >
        + تسجيل مصروف
      </button>

      {!state.session.isOpen && (
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

      <div style={G.card()}>
        <div style={{ textAlign: "right", marginBottom: 12, color: "#94a3b8" }}>
          📊 توزيع المصاريف
        </div>
        <ExpenseDonut expenses={state.expenses} />
      </div>

      <div style={G.card()}>
        <div style={{ textAlign: "right", marginBottom: 10, color: "#94a3b8" }}>
          آخر المصاريف
        </div>

        {recent.map((e, i) => (
          <div key={e.id} style={i < recent.length - 1 ? G.row : G.lrow}>
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
      color: "#e8c96a",
      fontSize: 16,
      cursor: "pointer",
      padding: 0,
    }}
  >
    ✏️
  </button>

  <div style={{ fontSize: 15, fontWeight: 700 }}>
    {Number(e.amount || 0).toFixed(2)} د.أ
  </div>
</div>
              <div style={{ fontSize: 10, color: "#64748b" }}>
                مغطى: {Number(e.budgetCovered || 0).toFixed(2)} | تجاوز:{" "}
                {Number(e.overBudget || 0).toFixed(2)}
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13 }}>{e.note || e.category}</div>
              <div
                style={{
                  fontSize: 10,
                  color: CC[e.category] || "#94a3b8",
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
              color: "#475569",
              padding: "20px 0",
              fontSize: 13,
            }}
          >
            لا توجد مصاريف بعد
          </div>
        )}
      </div>

      <button
        onClick={() => {
          clearState();
          window.location.reload();
        }}
        style={G.btn("#7f1d1d", "#fff", { width: "100%" })}
      >
        تصفير البيانات التجريبية
      </button>

      {selectedExpense && (
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
        background: "#0c1525",
        borderRadius: "22px 22px 0 0",
        border: "1px solid #1e293b",
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
          background: "#0c1525",
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
            color: "#94a3b8",
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
          <div style={{ fontSize: 11, color: "#64748b" }}>
            تفاصيل العملية
          </div>
        </div>
      </div>

      <div style={G.card()}>
        <div style={G.row}>
          <span style={{ color: "#94a3b8" }}>المبلغ</span>
          <b>{Number(selectedExpense.amount || 0).toFixed(2)} د.أ</b>
        </div>

        <div style={G.row}>
          <span style={{ color: "#94a3b8" }}>التصنيف</span>
          <b>{selectedExpense.category}</b>
        </div>

        <div style={G.row}>
          <span style={{ color: "#94a3b8" }}>طريقة الدفع</span>
          <b>{selectedExpense.paymentMethod}</b>
        </div>

        <div style={G.row}>
          <span style={{ color: "#94a3b8" }}>المغطى من السقف</span>
          <b>{Number(selectedExpense.budgetCovered || 0).toFixed(2)} د.أ</b>
        </div>

        <div style={G.lrow}>
          <span style={{ color: "#94a3b8" }}>التجاوز</span>
          <b style={{ color: Number(selectedExpense.overBudget || 0) > 0 ? "#ef4444" : "#f8fafc" }}>
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
      zIndex: 540,
    }}
  >
    <div
      style={{
        position: "relative",
        background: "#0c1525",
        borderRadius: "22px 22px 0 0",
        border: "1px solid #1e293b",
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
          background: "#0c1525",
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
    background: "#1e293b",
    color: "#f8fafc",
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
    <div style={{ fontSize: 11, color: "#64748b" }}>
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
        color: "#64748b",
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
        color: "#e8c96a",
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
      style={G.btn("#1e293b", "#e8c96a", {
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
  style={G.btn("linear-gradient(135deg,#c9a840,#e8c96a)", "#0f172a", {
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
            background: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            zIndex: 500,
          }}
        >
          <div
            style={{
              background: "#0c1525",
padding: "18px 18px 22px",
maxHeight: "92vh",
overflowY: "auto",
overscrollBehavior: "contain",              border: "1px solid #1e293b",
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
                onClick={() => setShowExpense(false)}
                style={G.btn("#1e293b", "#94a3b8", {
                  padding: "5px 12px",
                  borderRadius: 8,
                })}
              >
                ✕
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
            <div
  style={{
    marginBottom: 10,
    border: isUnusualExpense
      ? "1px solid rgba(232,201,106,0.55)"
      : "1px solid rgba(148,163,184,0.18)",
    background: isUnusualExpense
      ? "rgba(232,201,106,0.08)"
      : "rgba(15,23,42,0.45)",
    borderRadius: 14,
    padding: 10,
  }}
>
  <button
    type="button"
    onClick={() => setIsUnusualExpense((v) => !v)}
    style={{
      width: "100%",
      border: "none",
      background: "transparent",
      color: isUnusualExpense ? "#e8c96a" : "#94a3b8",
      fontSize: 13,
      fontWeight: 900,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      cursor: "pointer",
      fontFamily: "inherit",
      padding: 0,
    }}
  >
    <span>⚠️ غير اعتيادي</span>
    <span style={{ fontSize: 11 }}>
      {isUnusualExpense ? "مفعّل" : "اختياري"}
    </span>
  </button>

  {isUnusualExpense && (
    <div style={{ marginTop: 10 }}>
      <div
        style={{
          fontSize: 11,
          color: "#cbd5e1",
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
                  ? "1px solid #e8c96a"
                  : "1px solid rgba(148,163,184,0.25)",
              background:
                unusualFundingMode === value
                  ? "rgba(232,201,106,0.14)"
                  : "#1e293b",
              color: unusualFundingMode === value ? "#e8c96a" : "#f8fafc",
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
      background: "#1a0808",
      border: "1px solid #ef444433",
      borderRadius: 10,
      padding: "10px 12px",
      marginBottom: 10,
      color: "#ef4444",
      fontSize: 12,
      fontWeight: 700,
      textAlign: "right",
    }}
  >
    ⚠️ هذا المصروف يتجاوز سقف الصرف بمبلغ{" "}
    {expectedOverBudget.toFixed(2)} د.أ
  </div>
)}{expectedOverBudget > 0 && paymentMethod === "cash" && (
  <div
    style={{
      background: "#111827",
      border: "1px solid #334155",
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
    }}
  >
    <div
      style={{
        fontSize: 12,
        color: "#c9a840",
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
          overBudgetSource === "asset" ? "#a855f7" : "#1e293b",
          "#fff",
          { padding: "10px" }
        )}
      >
        من أصل
      </button>

      <button
        onClick={() => setOverBudgetSource("liability")}
        style={G.btn(
          overBudgetSource === "liability" ? "#ef4444" : "#1e293b",
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
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: 8,
    marginBottom: 18,
  }}
>
              {mainExpenseCategories.slice(0, 12).map((catItem) => {
  const cat = catItem.label;
  const active = category === cat;

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
        minHeight: catItem.isOther ? 34 : 56,
width: catItem.isOther ? 34 : "auto",
borderRadius: catItem.isOther ? 12 : 12,
border: active
  ? "1px solid #e8c96a"
  : "1px solid rgba(148,163,184,0.28)",
background: catItem.isOther
  ? "linear-gradient(180deg, rgba(15,23,42,0.95), rgba(30,41,59,0.95))"
  : active
  ? "linear-gradient(180deg, rgba(232,201,106,0.18), rgba(15,23,42,0.95))"
  : "linear-gradient(180deg, rgba(30,41,59,0.95), rgba(15,23,42,0.95))",
color: active ? "#e8c96a" : "#cbd5e1",
display: "flex",
flexDirection: "column",
alignItems: "center",
justifyContent: "center",
gap: catItem.isOther ? 0 : 3,
cursor: "pointer",
fontFamily: "inherit",
fontWeight: active ? 900 : 700,
        boxShadow: active
          ? "0 10px 26px rgba(232,201,106,0.14)"
          : "none",
      }}
    >
      <span style={{ fontSize: 16, lineHeight: 1 }}>
{catItem.isOther ? "⚙️" : catItem.icon || CAT_ICONS[cat] || "📌"}      </span>
      <span style={{ fontSize: 10 }}>
{catItem.isOther ? "إدارة" : cat}      </span>
    </button>
  );
})}
            </div>
          <div
  style={{
    width: "100%",
    display: "flex",
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
      color: "#94a3b8",
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

            <label style={{ fontSize: 11, color: "#64748b" }}>طريقة الدفع</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{ ...G.inp(), marginBottom: 10 }}
            >
              <option value="cash">نقدا</option>
              <option value="card">بطاقة</option>
              <option value="liability">دين / التزام جديد</option>
            </select>

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

            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="ملاحظة"
              style={{ ...G.inp(), marginBottom: 12 }}
            />

            <button
              onClick={submitExpense}
              style={G.btn("linear-gradient(135deg,#c9a840,#e8c96a)", "#0f172a", {
                width: "100%",
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

function AssetsScreen({ state, setState, onAddExtraCash }) {
  const assets = calcAssets(state);

  const [showAddAsset, setShowAddAsset] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);

  const [fromAsset, setFromAsset] = useState("cash");
  const [toAsset, setToAsset] = useState("cash");
  const [transferAmount, setTransferAmount] = useState("");

  const [assetKind, setAssetKind] = useState("bank");
  const [assetName, setAssetName] = useState("");
  const [assetAmount, setAssetAmount] = useState("");
  const [assetUnits, setAssetUnits] = useState("");
  const [assetPrice, setAssetPrice] = useState("");

  const sources = getAssetSources(state);

  const addNewAsset = () => {
  if (!assetName.trim()) return alert("أدخل اسم الأصل");

  const next = structuredClone(state);
  const id = Date.now();
  const name = assetName.trim();

  if (assetKind === "bank") {
    const amount = Number(assetAmount || 0);

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
    type: "add_or_merge_asset",
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

  const applyTransfer = () => {
    const result = transferBetweenAssets(
      state,
      fromAsset,
      toAsset,
      Number(transferAmount || 0)
    );

    if (!result.success) {
      alert(result.message);
      return;
    }

    setState(result.nextState);
    setShowTransfer(false);
    setTransferAmount("");
  };

  return (
    <div style={G.scr}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
          gap: 8,
        }}
      >
        <button
          onClick={() => setShowAddAsset(true)}
          style={G.btn("linear-gradient(135deg,#c9a840,#e8c96a)", "#0f172a", {
            padding: "9px 14px",
            fontSize: 12,
            flex: 1,
          })}
        >
          + إضافة أصل
        </button>

        <button
          onClick={() => setShowTransfer(true)}
          style={G.btn("#1e293b", "#cbd5e1", {
            padding: "9px 14px",
            fontSize: 12,
            border: "1px solid #334155",
            flex: 1,
          })}
        >
          ⇄ مناقلة
        </button>
      </div>
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
    flex: 1,
  }}
>
  + نقد إضافي
</button>

      <div style={{ ...G.card("#c9a84022"), textAlign: "right" }}>
        <div style={{ fontSize: 12, color: "#c9a840" }}>إجمالي الأصول</div>
        <div style={{ fontSize: 32, fontWeight: 900 }}>
          {assets.totalAssets.toFixed(2)}{" "}
          <span style={{ fontSize: 13, color: "#64748b" }}>د.أ</span>
        </div>

        <div style={{ fontSize: 11, color: "#64748b", marginTop: 6 }}>
          صافي الثروة:{" "}
          <span style={{ color: "#c9a840", fontWeight: 800 }}>
            {assets.netWorth.toFixed(2)} د.أ
          </span>
        </div>
      </div>

      <div style={G.card("#22c55e22")}>
        <div style={G.lrow}>
          <strong>{Number(state.assets.cash || 0).toFixed(2)} د.أ</strong>
          <span>💵 كاش</span>
        </div>
      </div>

      <div style={G.card("#3b82f622")}>
        <div style={{ marginBottom: 10, color: "#3b82f6", fontWeight: 800 }}>
          🏦 الحسابات البنكية
        </div>
        {state.assets.banks.map((b, i) => (
          <div
            key={b.id}
            style={i < state.assets.banks.length - 1 ? G.row : G.lrow}
          >
            <strong>{Number(b.balance || 0).toFixed(2)} د.أ</strong>
            <span>{b.name}</span>
          </div>
        ))}
      </div>

      <div style={G.card("#f59e0b22")}>
        <div style={{ marginBottom: 10, color: "#f59e0b", fontWeight: 800 }}>
          🥇 الذهب
        </div>
        {state.assets.gold.map((g, i) => {
          const value =
            Number(g.units || 0) *
            Number(state.settings.market.goldGramPrice || 0);

          return (
            <div
              key={g.id}
              style={i < state.assets.gold.length - 1 ? G.row : G.lrow}
            >
              <div>
                <strong>{value.toFixed(2)} د.أ</strong>
                <div style={{ fontSize: 10, color: "#64748b" }}>
                  {Number(g.units || 0).toFixed(4)} غرام | WAC: {g.wac}
                </div>
              </div>
              <span>{g.label}</span>
            </div>
          );
        })}
      </div>

      {state.assets.silver.length > 0 && (
        <div style={G.card("#94a3b822")}>
          <div style={{ marginBottom: 10, color: "#94a3b8", fontWeight: 800 }}>
            🪙 الفضة
          </div>
          {state.assets.silver.map((s, i) => {
            const value =
              Number(s.units || 0) *
              Number(state.settings.market.silverGramPrice || 0);

            return (
              <div
                key={s.id}
                style={i < state.assets.silver.length - 1 ? G.row : G.lrow}
              >
                <div>
                  <strong>{value.toFixed(2)} د.أ</strong>
                  <div style={{ fontSize: 10, color: "#64748b" }}>
                    {Number(s.units || 0).toFixed(4)} غرام | WAC: {s.wac}
                  </div>
                </div>
                <span>{s.label}</span>
              </div>
            );
          })}
        </div>
      )}

      <div style={G.card("#a855f722")}>
        <div style={{ marginBottom: 10, color: "#a855f7", fontWeight: 800 }}>
          📊 الأسهم
        </div>
        {state.assets.stocks.map((s, i) => {
          const value = Number(s.units || 0) * Number(s.currentPrice || 0);

          return (
            <div
              key={s.id}
              style={i < state.assets.stocks.length - 1 ? G.row : G.lrow}
            >
              <div>
                <strong>{value.toFixed(2)} د.أ</strong>
                <div style={{ fontSize: 10, color: "#64748b" }}>
                  {Number(s.units || 0).toFixed(4)} سهم | السعر{" "}
                  {s.currentPrice}
                </div>
              </div>
              <span>{s.name}</span>
            </div>
          );
        })}
      </div>

      {state.assets.custom.length > 0 && (
        <div style={G.card("#64748b22")}>
          <div style={{ marginBottom: 10, color: "#94a3b8", fontWeight: 800 }}>
            📁 أصول مخصصة
          </div>

          {state.assets.custom.map((c, i) => {
            const value =
              c.type === "fixed"
                ? Number(c.amount || 0)
                : Number(c.units || 0) * Number(c.price || 0);

            return (
              <div
                key={c.id}
                style={i < state.assets.custom.length - 1 ? G.row : G.lrow}
              >
                <strong>{value.toFixed(2)} د.أ</strong>
                <span>{c.name}</span>
              </div>
            );
          })}
        </div>
      )}

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
              background: "#0c1525",
              borderRadius: "22px 22px 0 0",
              border: "1px solid #1e293b",
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
                style={G.btn("#1e293b", "#94a3b8", {
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
              style={G.btn("linear-gradient(135deg,#c9a840,#e8c96a)", "#0f172a", {
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
              background: "#0c1525",
              borderRadius: "22px 22px 0 0",
              border: "1px solid #1e293b",
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
                style={G.btn("#1e293b", "#94a3b8", {
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

            <label style={{ fontSize: 11, color: "#64748b" }}>من أصل</label>
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

            <label style={{ fontSize: 11, color: "#64748b" }}>إلى أصل</label>
            <select
              value={toAsset}
              onChange={(e) => setToAsset(e.target.value)}
              style={{ ...G.inp(), marginBottom: 10 }}
            >
              {sources.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
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

            <button
              onClick={applyTransfer}
              style={G.btn("linear-gradient(135deg,#c9a840,#e8c96a)", "#0f172a", {
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

function LiabilitiesScreen({ state, setState }) {
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

const sortedCurrent = [...currentList].sort(
  (a, b) => getDueValue(a) - getDueValue(b)
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
const [showAddCard, setShowAddCard] = useState(false);
const [selectedCardId, setSelectedCardId] = useState("");
const [cardMode, setCardMode] = useState("");
const [editCardName, setEditCardName] = useState("");
const [editCardBalance, setEditCardBalance] = useState("");

const addCreditCard = () => {
  if (!cardName.trim()) return alert("أدخل اسم البطاقة");

  const balance = Number(cardBalance || 0);
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
        payableBuffer: 0,
        uncoveredDebt: balance,
        status: "active",
        source: "manual_card",
        createdAt: new Date().toISOString(),
        date: new Date().toISOString().split("T")[0],
      },
    ],
  }));

  setCardName("");
  setCardBalance("");
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

  const totalCurrent = pendingCurrent.reduce((sum, l) => {
    if (l.type === "card") return sum + Number(l.balance || 0);
    return sum + Number(l.amount || 0);
  }, 0);

  const getLiabilityAmount = (l) => {
    if (l.type === "card") return Number(l.balance || 0);
    return Number(l.amount || 0);
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
    return "#94a3b8";
  };

  const getStatusLabel = (status) => {
    if (status === "paid") return "مسدد";
    if (status === "overdue") return "متأخر";
    if (status === "pending") return "مستحق";
    return status || "غير محدد";
  };

  return (
<div style={G.scr}>
        <div style={{ ...G.card("#ef444422"), textAlign: "center" }}>
        <div style={{ fontSize: 11, color: "#ef4444", marginBottom: 4 }}>
          إجمالي الخصوم الجارية
        </div>
        <div style={{ fontSize: 30, fontWeight: 900, color: "#ef4444" }}>
          {totalCurrent.toFixed(2)}{" "}
          <span style={{ fontSize: 13, color: "#64748b" }}>د.أ</span>
        </div>
      </div>
     <div style={{ ...G.card(), marginBottom: 12 }}>
  <div
    style={{
      fontSize: 14,
      fontWeight: 800,
      color: "#e5e7eb",
      marginBottom: 10,
    }}
  >
    إدارة البطاقات الائتمانية
  </div>

  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
    <button
      onClick={() => setCardMode(cardMode === "add" ? "" : "add")}
      style={G.btn("linear-gradient(135deg,#334155,#0f172a)", "#0f172a", {
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
      style={G.btn("linear-gradient(135deg,#1e3a8a,#172554)", "#172554", {
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
      <label style={{ display: "block", fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>
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
    <div style={{ marginTop: 12, fontSize: 12, color: "#94a3b8" }}>
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
    color: "#94a3b8",
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
              <div style={{ fontSize: 10, color: "#64748b" }}>
                يوم السداد: {s.dueDay}
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, color: "#cbd5e1" }}>{s.name}</div>
              <div style={{ fontSize: 10, color: "#475569" }}>
                قسط شهري طويل الأجل
              </div>
            </div>
          </div>
        ))}

        <div
          style={{
            marginTop: 10,
            paddingTop: 10,
            borderTop: "1px solid #1a2540",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <strong style={{ color: "#ef4444" }}>
            {structuralTotal.toFixed(2)} د.أ
          </strong>
          <span style={{ fontSize: 11, color: "#64748b" }}>
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
    color: "#f8fafc",
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
  <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 4 }}>
    رصيد الدين الكامل والمستحقات الشهرية
  </div>
</div>

<div style={{ textAlign: "left" }}>
  <div style={{ fontSize: 11, color: "#94a3b8" }}>
    إجمالي رصيد الدين
  </div>
  <div style={{ color: "#ef4444", fontWeight: 900 }}>
    {currentDebtTotal.toFixed(2)} د.أ
  </div>
  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>
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
                    color: l.status === "paid" ? "#64748b" : "#ef4444",
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
                <div style={{ fontSize: 13, color: "#cbd5e1" }}>{l.name}</div>
                {isDueThisMonth(l) && l.status !== "paid" && (
  <div style={{ fontSize: 10, color: "#f59e0b", fontWeight: 700, marginTop: 2 }}>
    مستحق هذا الشهر
  </div>
)}

                {l.dueDate ? (
                  <div style={{ fontSize: 10, color: "#f59e0b", marginTop: 3 }}>
                    تاريخ الاستحقاق: {l.dueDate}
                  </div>
                ) : (
                  <div style={{ fontSize: 10, color: "#64748b", marginTop: 3 }}>
                    يوم الاستحقاق: {l.dueDay || "-"}
                  </div>
                )}

                {(l.type === "card" || l.type === "direct_liability") && (
  <div style={{ fontSize: 10, color: "#64748b", marginTop: 3 }}>
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
              color: "#475569",
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
 const addStructuralLiability = () => {
  if (!structuralName.trim()) return alert("أدخل اسم الالتزام الهيكلي");

  const monthly = Number(structuralMonthly || 0);
  if (monthly <= 0) return alert("أدخل قيمة القسط الشهري");

  const dueDay = Number(structuralDueDay || 1);

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

  return (
    <div style={G.scr}>
      <div style={G.card()}>
        <div style={{ marginBottom: 12, color: "#c9a840", fontWeight: 800 }}>
          💼 بطاقة الراتب والالتزامات
        </div>


        <label style={{ fontSize: 11, color: "#64748b" }}>الراتب الشهري</label>
        <input
          type="number"
          value={state.settings.salary}
          onChange={(e) =>
            updateSetting("settings.salary", Number(e.target.value || 0))
          }
          style={{ ...G.inp(), marginBottom: 10 }}
        />
        <label style={{ fontSize: 11, color: "#64748b" }}>
  سقف الصرف الشهري
</label>
<input
  type="number"
  value={state.session.spendingCap}
  onChange={(e) => {
  const newCap = Number(e.target.value || 0);

  if (newCap > maxSpendingCap) {
    alert("سقف الصرف لا يجوز أن يتجاوز صافي الراتب بعد طرح الالتزامات الهيكلية");
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
  style={{ ...G.inp(), marginBottom: 10 }}
/>

<div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 12 }}>
  أقصى سقف صرف مسموح من الراتب: {maxSpendingCap.toFixed(2)}
</div>
<div
  style={{
    borderTop: "1px solid #1a2540",
    paddingTop: 12,
    marginTop: 8,
  }}
>
  <div
    style={{
      textAlign: "right",
      color: "#94a3b8",
      fontWeight: 800,
      marginBottom: 10,
      fontSize: 13,
    }}
  >
    🏗 الالتزامات الهيكلية
  </div>

  {(state.structuralLiabilities || state.structural || []).map((item) => (
    <div
      key={item.id}
      style={{
        background: "#0f172a",
        border: "1px solid #1e293b",
        borderRadius: 12,
        padding: 10,
        marginBottom: 10,
      }}
    >
      <input
        value={item.name}
        onChange={(e) =>
          updateStructuralLiability(item.id, "name", e.target.value)
        }
        placeholder="اسم الالتزام"
        style={{ ...G.inp(), marginBottom: 8 }}
      />

      <input
        type="number"
        value={item.monthly}
        onChange={(e) =>
          updateStructuralLiability(item.id, "monthly", e.target.value)
        }
        placeholder="القسط الشهري"
        style={{ ...G.inp(), marginBottom: 8 }}
      />

      <input
        type="number"
        min="1"
        max="31"
        value={item.dueDay}
        onChange={(e) =>
          updateStructuralLiability(item.id, "dueDay", e.target.value)
        }
        placeholder="يوم السداد"
        style={{ ...G.inp(), marginBottom: 8 }}
      />

      <button
        onClick={() => deleteStructuralLiability(item.id)}
        style={G.btn("#7f1d1d", "#fff", { width: "100%" })}
      >
        حذف الالتزام
      </button>
    </div>
  ))}

  <div
    style={{
      background: "#111827",
      border: "1px dashed #334155",
      borderRadius: 12,
      padding: 10,
      marginTop: 12,
    }}
  >
    <div
      style={{
        textAlign: "right",
        color: "#c9a840",
        fontWeight: 800,
        marginBottom: 10,
        fontSize: 13,
      }}
    >
      + إضافة التزام هيكلي
    </div>

    <input
      value={structuralName}
      onChange={(e) => setStructuralName(e.target.value)}
      placeholder="اسم الالتزام"
      style={{ ...G.inp(), marginBottom: 8 }}
    />

    <input
      type="number"
      value={structuralMonthly}
      onChange={(e) => setStructuralMonthly(e.target.value)}
      placeholder="القسط الشهري"
      style={{ ...G.inp(), marginBottom: 8 }}
    />

    <input
      type="number"
      min="1"
      max="31"
      value={structuralDueDay}
      onChange={(e) => setStructuralDueDay(e.target.value)}
      placeholder="يوم السداد"
      style={{ ...G.inp(), marginBottom: 8 }}
    />

    <button
      onClick={addStructuralLiability}
      style={G.btn("linear-gradient(135deg,#c9a840,#e8c96a)", "#0f172a", {
        width: "100%",
        fontWeight: 900,
      })}
    >
      إضافة الالتزام
    </button>
  </div>
</div>

        <label style={{ fontSize: 11, color: "#64748b" }}>الشهر الحالي</label>
        <input
          value={state.settings.month}
          onChange={(e) => updateSetting("settings.month", e.target.value)}
          style={G.inp()}
        />
      </div>

      <div style={G.card()}>
        <div style={{ marginBottom: 12, color: "#c9a840", fontWeight: 800 }}>
          🥇 بطاقة أسعار الذهب والفضة والأسهم
        </div>

        <label style={{ fontSize: 11, color: "#64748b" }}>سعر غرام الذهب</label>
        <input
          type="number"
          value={state.settings.market.goldGramPrice}
          onChange={(e) =>
            updateSetting(
              "settings.market.goldGramPrice",
              Number(e.target.value || 0)
            )
          }
          style={{ ...G.inp(), marginBottom: 10 }}
        />
        <div
  style={{
    marginTop: 14,
    paddingTop: 12,
    borderTop: "1px solid #1a2540",
  }}
>
  <div
    style={{
      textAlign: "right",
      marginBottom: 10,
      color: "#a855f7",
      fontWeight: 800,
      fontSize: 13,
    }}
  >
    📊 أسعار الأسهم
  </div>

  {state.assets.stocks.map((stock) => (
    <div
      key={stock.id}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1.2fr",
        gap: 8,
        alignItems: "center",
        marginBottom: 8,
      }}
    >
      <input
        type="number"
        value={stock.currentPrice || 0}
        onChange={(e) => updateStockPrice(stock.id, e.target.value)}
        placeholder="السعر الحالي"
        style={G.inp()}
      />

      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 13, color: "#cbd5e1", fontWeight: 700 }}>
          {stock.name}
        </div>
        <div style={{ fontSize: 10, color: "#64748b" }}>
          عدد الأسهم: {Number(stock.units || 0).toFixed(4)} | WAC:{" "}
          {Number(stock.wac || 0).toFixed(4)}
        </div>
      </div>
    </div>
  ))}

  {!state.assets.stocks.length && (
    <div
      style={{
        textAlign: "center",
        color: "#64748b",
        fontSize: 12,
        padding: "10px 0",
      }}
    >
      لا توجد أسهم مضافة بعد
    </div>
  )}
</div>

        <label style={{ fontSize: 11, color: "#64748b" }}>سعر غرام الفضة</label>
        <input
          type="number"
          value={state.settings.market.silverGramPrice}
          onChange={(e) =>
            updateSetting(
              "settings.market.silverGramPrice",
              Number(e.target.value || 0)
            )
          }
          style={G.inp()}
        />

        <button
  onClick={onCloseMonth}
  style={{
    width: "100%",
    marginTop: 16,
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #f59e0b",
    background: "transparent",
    color: "#f59e0b",
    fontWeight: 800,
    cursor: "pointer",
  }}
>
  إغلاق الشهر وحفظ لقطة تاريخية
</button>
<div style={{ fontSize: 12, color: "#94a3b8", marginTop: 8 }}>
  عدد اللقطات التاريخية المحفوظة: {(state.monthlySnapshots || []).length}

  
      </div>
    </div>
  </div>
);

}

function ExtraCashModal({ onSubmit, onClose }) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [direction, setDirection] = useState("spendingCap");

  function submit() {
    const n = Number(amount || 0);

    if (!n || n <= 0) {
      alert("أدخل مبلغًا صحيحًا");
      return;
    }

    onSubmit({
      amount: n,
      note,
      direction,
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
          background: "#0f172a",
          color: "white",
          border: "1px solid #334155",
          borderRadius: 16,
          padding: 16,
          width: "100%",
          maxWidth: 420,
          textAlign: "right",
        }}
      >
        <h3 style={{ marginTop: 0 }}>نقد إضافي</h3>

        <label style={{ display: "block", marginBottom: 6 }}>المبلغ</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="مثال: 300"
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 12,
            borderRadius: 10,
            border: "1px solid #334155",
            background: "#020617",
            color: "white",
          }}
        />

        <label style={{ display: "block", marginBottom: 6 }}>الوصف</label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="مثال: مكافأة، جائزة، دخل جانبي"
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 12,
            borderRadius: 10,
            border: "1px solid #334155",
            background: "#020617",
            color: "white",
          }}
        />

        <label style={{ display: "block", marginBottom: 6 }}>اتجاه النقد</label>
        <select
          value={direction}
          onChange={(e) => setDirection(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 16,
            borderRadius: 10,
            border: "1px solid #334155",
            background: "#020617",
            color: "white",
          }}
        >
          <option value="spendingCap">إضافة إلى سقف الصرف</option>
          <option value="cash">إضافة إلى النقد / الكاش</option>
        </select>

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
            تسجيل
          </button>

          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px 12px",
              border: "1px solid #334155",
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

    expensesByCategory: buildExpensesByCategory(state.expenses || []),

    assets: structuredClone(state.assets || {}),

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

export default function App() {
  const [state, setState] = useState(() => loadState() || INITIAL_STATE);
  const [tab, setTab] = useState("overview");
  const [menuOpen, setMenuOpen] = useState(false);
    const [showExtraCash, setShowExtraCash] = useState(false);
    const [selectedViewMonth, setSelectedViewMonth] = useState("current");
    useEffect(() => {
    saveState(state);
  }, [state]);
  function handleExtraCashSubmit(data) {
  const amount = Number(data.amount || 0);

  if (!amount || amount <= 0) {
    alert("أدخل مبلغًا صحيحًا");
    return;
  }

  setState((prev) => {
    const record = {
      id: Date.now(),
      type: "extra_cash",
      amount,
      note: data.note || "",
      direction: data.direction,
      date: new Date().toISOString(),
    };

    let next = {
      ...prev,
      extraCash: [...(prev.extraCash || []), record],
    };

    if (data.direction === "spendingCap") {
      next = {
        ...next,
        session: {
          ...next.session,
          spendingCap: Number(next.session.spendingCap || 0) + amount,
        },
      };
    }

    if (data.direction === "cash") {
      next = {
        ...next,
        assets: {
          ...next.assets,
          cash: Number(next.assets?.cash || 0) + amount,
        },
      };
    }

    return next;
  });

  setShowExtraCash(false);
}

function handleCloseMonth() {
  const confirmed = window.confirm(
    "هل تريد إغلاق الشهر؟ سيتم حفظ لقطة تاريخية وترحيل البيانات للشهر التالي."
  );

  if (!confirmed) return;

  setState((prev) => {
    const snapshot = buildMonthlySnapshot(prev);

    const nextMonth = getNextMonthKey(
      prev.currentMonth || new Date().toISOString().slice(0, 7)
    );

    const currentPlan = buildCurrentLiabilityPlan(
      prev.currentLiabilities || [],
      nextMonth
    );
    const rolledCurrentLiabilities = (prev.currentLiabilities || [])
  .filter((l) => l.status !== "paid")
  .map((l) => ({
    ...l,
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
      },

      structuralLiabilities: prev.structuralLiabilities || [],

      currentLiabilities: rolledCurrentLiabilities,
    };
  });
}

  
  const tabs = [
    { id: "overview", label: "الرئيسية" },
    { id: "assets", label: "الأصول" },
    { id: "liabilities", label: "الخصوم" },
    { id: "settings", label: "الإعدادات" },
  ];
  const snapshots = state.monthlySnapshots || [];

const selectedViewSnapshot =
  selectedViewMonth === "current"
    ? null
    : snapshots.find((snap) => snap.id === selectedViewMonth);
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
    display: "grid",
    gridTemplateColumns: "70px 1fr 150px",
    alignItems: "center",
    marginBottom: 12,
    minHeight: 44,
  }}
>
<div
  style={{
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
  }}
>
  {!menuOpen && (
    <button
      onClick={() => setMenuOpen(true)}
      style={{
        width: 34,
        height: 34,
        borderRadius: 11,
        border: "1px solid rgba(232, 201, 106, 0.18)",
        background: "rgba(30, 41, 59, 0.9)",
        color: "#e8c96a",
        boxShadow: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 18,
        cursor: "pointer",
      }}
    >
      ☰
    </button>
  )}
</div>
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <select
      value={selectedViewMonth}
      onChange={(e) => setSelectedViewMonth(e.target.value)}
      style={{
        fontSize: 11,
        color: "#cbd5e1",
        background: "#1e293b",
        padding: "4px 10px",
        borderRadius: 8,
        border: "1px solid #334155",
        outline: "none",
      }}
    >
      <option value="current">
        {state.settings?.month || state.currentMonth || "الشهر الحالي"}
      </option>

      {snapshots.map((snap) => (
        <option key={snap.id} value={snap.id}>
          {snap.month}
        </option>
      ))}
    </select>
  </div>

  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 8,
    }}
  >
    <div style={{ textAlign: "right" }}>
      <div style={{ fontSize: 13, fontWeight: 700 }}>
        مدير الثروة الذكي
      </div>
      <div style={{ fontSize: 10, color: "#64748b" }}>
        Smart Wealth Tracker
      </div>
    </div>

    <div
      style={{
        width: 32,
        height: 32,
        background: "linear-gradient(135deg,#c9a840,#e8c96a)",
        borderRadius: 9,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 16,
        fontWeight: 800,
        color: "#0f172a",
      }}
    >
      ث
    </div>
  </div>
</div>
        <style>
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
</style>

       <>
  
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
          background: "#020617",
animation: "drawerIn 0.28s ease-out",
          borderLeft: "1px solid rgba(201,168,64,0.22)",
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
              color: "#cbd5e1",
              fontSize: 30,
              cursor: "pointer",
            }}
          >
            ×
          </button>

          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#f8fafc", fontWeight: 900, fontSize: 18 }}>
              مدير الثروة
            </div>
            <div style={{ color: "#94a3b8", fontSize: 11 }}>
              Smart Wealth Tracker
            </div>
          </div>
        </div>

<div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {tabs.map((t) => {
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
color: tab === t.id ? "#f8fafc" : "#cbd5e1",
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
</>
</div>

{tab === "overview" && <Overview state={viewState} setState={setState} />}
      {tab === "assets" && (
  <AssetsScreen
state={viewState}
    setState={setState}
    onAddExtraCash={() => setShowExtraCash(true)}
  />
)}
     {tab === "liabilities" && (
  <LiabilitiesScreen state={viewState} setState={setState} />
)}
      {tab === "settings" && (
  <SettingsScreen
    state={state}
    setState={setState}
    onCloseMonth={handleCloseMonth}
  />
)}
      {showExtraCash && (
  <ExtraCashModal
    onSubmit={handleExtraCashSubmit}
    onClose={() => setShowExtraCash(false)}
  />
)}
    </div>
  );
  }
