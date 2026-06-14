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
  iconBtn: (active, color = "#e8c96a") => ({
    width: 42,
    height: 42,
    borderRadius: 12,
    border: active ? `1px solid ${color}` : "1px solid #334155",
    background: active ? "rgba(232,201,106,0.12)" : "#111827",
    color,
    cursor: "pointer",
    fontSize: 17,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }),
  card: (b) => ({
    background: "#0f172a",
    borderRadius: 16,
    border: `1px solid ${b || "#1e293b"}`,
    padding: "14px 16px",
    marginBottom: 12,
    color: "#f8fafc",
    fontFamily: "inherit",
    fontSize: 14,
  }),
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid #1a2540",
    color: "#f8fafc",
    fontSize: 13,
  },
  lrow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    color: "#f8fafc",
    fontSize: 13,
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

function Overview({ state, setState, onOpenReports, onOpenDueLiabilities }) {
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
const expectedOverBudget = paymentMethod === "emergency" ? 0 : Math.max(
  0,
  enteredAmount - Number(budget.remainingCap || 0)
);

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
          tx.type === "emergency_expense_covered_from_asset")
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
        {selectedExpenseTotal !== selectedExpenseRecorded && (
          <div
            style={{
              background: "#111827",
              border: "1px solid rgba(232,201,106,0.22)",
              borderRadius: 12,
              padding: 10,
              marginBottom: 10,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: "#94a3b8", fontSize: 11 }}>إجمالي المصروف</span>
              <b>{selectedExpenseTotal.toFixed(2)} د.أ</b>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: "#94a3b8", fontSize: 11 }}>من سقف الصرف</span>
              <b style={{ color: "#86efac" }}>
                {Number(selectedExpense.budgetCovered || 0).toFixed(2)} د.أ
              </b>
            </div>
            {selectedExpenseDebt > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "#94a3b8", fontSize: 11 }}>سجل كدين</span>
                <b style={{ color: "#fecaca" }}>{selectedExpenseDebt.toFixed(2)} د.أ</b>
              </div>
            )}
            {selectedExpenseAsset > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#94a3b8", fontSize: 11 }}>ممَول من أصل</span>
                <b style={{ color: "#e8c96a" }}>{selectedExpenseAsset.toFixed(2)} د.أ</b>
              </div>
            )}
          </div>
        )}
        <div style={{ textAlign: "right", marginBottom: 12, color: "#94a3b8" }}>
          📊 توزيع المصاريف
        </div>
        <button
          type="button"
          onClick={onOpenReports}
          style={G.btn("#1e293b", "#e8c96a", { width: "100%" })}
        >
          عرض التقارير والكشف الكامل
        </button>
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
        {selectedExpenseTotal !== selectedExpenseRecorded && (
          <div
            style={{
              background: "#111827",
              border: "1px solid rgba(232,201,106,0.22)",
              borderRadius: 12,
              padding: 10,
              marginBottom: 10,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: "#94a3b8", fontSize: 11 }}>إجمالي المصروف</span>
              <b>{selectedExpenseTotal.toFixed(2)} د.أ</b>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: "#94a3b8", fontSize: 11 }}>من سقف الصرف</span>
              <b style={{ color: "#86efac" }}>
                {Number(selectedExpense.budgetCovered || 0).toFixed(2)} د.أ
              </b>
            </div>
            {selectedExpenseDebt > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "#94a3b8", fontSize: 11 }}>سجل كدين</span>
                <b style={{ color: "#fecaca" }}>{selectedExpenseDebt.toFixed(2)} د.أ</b>
              </div>
            )}
            {selectedExpenseAsset > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#94a3b8", fontSize: 11 }}>ممَول من أصل</span>
                <b style={{ color: "#e8c96a" }}>{selectedExpenseAsset.toFixed(2)} د.أ</b>
              </div>
            )}
          </div>
        )}
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
        background: "#0f172a",
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
        <div style={{ fontSize: 15, fontWeight: 900, color: "#f8fafc" }}>
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
            background: "#1e293b",
            color: "#cbd5e1",
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
                  ? "1px solid #e8c96a"
                  : "1px solid rgba(148,163,184,0.24)",
              background:
                unusualFundingMode === value
                  ? "rgba(232,201,106,0.12)"
                  : "#1e293b",
              color: unusualFundingMode === value ? "#e8c96a" : "#f8fafc",
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
            color: "#94a3b8",
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
)}{false && expectedOverBudget > 0 && paymentMethod === "cash" && (
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
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 8,
    marginBottom: 18,
  }}
>
              {mainExpenseCategories.slice(0, 8).map((catItem) => {
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
<button
  type="button"
  onClick={() => setShowCategoryManager(true)}
  style={{
    minHeight: 56,
    borderRadius: 12,
    border: "1px solid rgba(148,163,184,0.28)",
    background: "linear-gradient(180deg, rgba(15,23,42,0.95), rgba(30,41,59,0.95))",
    color: "#94a3b8",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: 800,
  }}
>
  <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
  <span style={{ fontSize: 10 }}>المزيد</span>
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
              <option value="cash">نقدا</option>
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
      color: "#e8c96a",
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
      background: "#111827",
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
        color: "#e8c96a",
        fontWeight: 900,
        marginBottom: 10,
        textAlign: "right",
      }}
    >
      تمويل المصروف الطارئ
    </div>

    <select
      value={unusualFundingMode}
      onChange={(e) => setUnusualFundingMode(e.target.value)}
      style={{ ...G.inp(), marginBottom: 8 }}
    >
      <option value="asset">كاملًا من أصل</option>
      <option value="liability">كاملًا كدين</option>
      <option value="mix">مكس: جزء من السقف والباقي من أصل أو دين</option>
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
            unusualFundingMode === value ? "#c9a840" : "#1e293b",
            unusualFundingMode === value ? "#0f172a" : "#fff",
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
              unusualRemainderSource === "asset" ? "#a855f7" : "#1e293b",
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
              unusualRemainderSource === "liability" ? "#ef4444" : "#1e293b",
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

function ReportsScreen({ state }) {
  const expenses = [...(state.expenses || [])].reverse();
  const total = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const budget = calcBudget(state);
  const pendingCurrent = [];
  const getLiabilityAmount = () => 0;
  const getCoveredAmount = () => 0;
  const getUncoveredAmount = () => 0;

  const getDueText = (item) => {
    if (item.dueDate) return item.dueDate;
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
        <div style={{ textAlign: "right", color: "#94a3b8", fontSize: 12, marginBottom: 10 }}>
          ملخص المصروفات
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <div style={{ background: "#1a2540", borderRadius: 10, padding: 10 }}>
            <div style={{ fontSize: 10, color: "#64748b" }}>إجمالي المصروف</div>
            <div style={{ color: "#f8fafc", fontWeight: 900 }}>
              {total.toFixed(2)}
            </div>
          </div>

          <div style={{ background: "#1a2540", borderRadius: 10, padding: 10 }}>
            <div style={{ fontSize: 10, color: "#64748b" }}>المتبقي من السقف</div>
            <div style={{ color: "#22c55e", fontWeight: 900 }}>
              {budget.remainingCap.toFixed(2)}
            </div>
          </div>
        </div>

        <ExpenseDonut expenses={state.expenses} />
      </div>

      <div style={G.card()}>
        <div style={{ textAlign: "right", marginBottom: 10, color: "#94a3b8" }}>
          كشف المصروفات
        </div>

        {expenses.map((e, i) => (
          <div key={e.id} style={i < expenses.length - 1 ? G.row : G.lrow}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800 }}>
                {Number(e.amount || 0).toFixed(2)} د.أ
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

        {!expenses.length && (
          <div
            style={{
              textAlign: "center",
              color: "#475569",
              padding: "20px 0",
              fontSize: 13,
            }}
          >
            لا توجد مصروفات بعد
          </div>
        )}
      </div>
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
    return "#94a3b8";
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
    item.dueDate ? item.dueDate : item.dueDay ? `يوم ${item.dueDay}` : "غير محدد";
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
          color: "#f8fafc",
          fontFamily: "inherit",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontSize: 15, color: "#f8fafc", fontWeight: 900, marginBottom: 4 }}>
              الالتزامات الهيكلية
            </div>
            <div style={{ fontSize: 11, color: "#64748b" }}>
              أقساط ثابتة قادمة من الإعدادات
            </div>
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#ef4444" }}>
              {structuralTotal.toFixed(2)}
              <span style={{ fontSize: 11, color: "#64748b" }}> د.أ</span>
            </div>
            <div style={{ fontSize: 11, color: "#e8c96a" }}>
              {showStructuralDetails ? "إخفاء التفاصيل" : "عرض التفاصيل"}
            </div>
          </div>
        </div>

        {showStructuralDetails && (
          <div style={{ marginTop: 12, borderTop: "1px solid #1e293b", paddingTop: 8 }}>
            {structuralList.map((item, index) => (
              <div key={item.id || index} style={index < structuralList.length - 1 ? G.row : G.lrow}>
                <strong>{getStructuralAmount(item).toFixed(2)} د.أ</strong>
                <div style={{ textAlign: "right", display: "flex", gap: 10, alignItems: "center" }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      background: "#1e293b",
                      color: "#e8c96a",
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
                  <div style={{ fontSize: 10, color: "#64748b" }}>
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
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>
              ديون قصيرة الأجل وبطاقات مستحقة
            </div>
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#ef4444" }}>
              {currentDebtTotal.toFixed(2)}
              <span style={{ fontSize: 11, color: "#64748b" }}> د.أ</span>
            </div>
            <div style={{ fontSize: 10, color: "#94a3b8" }}>
              {showCurrentDetails ? "إخفاء التفاصيل" : "عرض التفاصيل"}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
          <div style={{ background: "#13251d", borderRadius: 10, padding: 10 }}>
            <div style={{ fontSize: 10, color: "#86efac" }}>محجوز من السقف</div>
            <div style={{ color: "#22c55e", fontWeight: 900 }}>
              {coveredCurrentTotal.toFixed(2)}
            </div>
          </div>
          <div style={{ background: "#2b1111", borderRadius: 10, padding: 10 }}>
            <div style={{ fontSize: 10, color: "#fecaca" }}>غير مغطى</div>
            <div style={{ color: "#ef4444", fontWeight: 900 }}>
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
                background: isOpen ? "#111827" : "#0b1220",
                border: isOpen ? "1px solid rgba(232,201,106,0.62)" : "1px solid #1e293b",
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
                      background: isCard ? "#172554" : "#1e293b",
                      color: isCard ? "#93c5fd" : "#e8c96a",
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
                  <div style={{ fontSize: 14, fontWeight: 900 }}>{primaryName}</div>
                  {isCard && (
                    <div style={{ fontSize: 10, color: "#93c5fd", marginTop: 3 }}>
                      السقف: {creditLimit.toFixed(2)} · المستخدم: {Number(item.balance || 0).toFixed(2)} · المتاح: {availableCredit.toFixed(2)}
                    </div>
                  )}
                  {!isCard && (
                    <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 3 }}>
                      اسم الدائن
                    </div>
                  )}
                  <div style={{ display: openCurrentId === item.id ? "block" : "none", fontSize: 10, color: "#94a3b8", marginTop: 3 }}>
                    {getTypeLabel(item)} · الاستحقاق: {getDueText(item)}
                  </div>
                </div>
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 17, fontWeight: 900, color: "#f8fafc" }}>
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
                        border: "1px solid #334155",
                        background: "#111827",
                        color: "#e8c96a",
                        cursor: "pointer",
                        fontWeight: 900,
                      }}
                    >
                      ⋯
                    </button>
                  </div>
                  <div style={{ fontSize: 10, color: "#64748b" }}>د.أ</div>
                </div>
              </div>

              <div style={{ display: openCurrentId === item.id ? "block" : "none", height: 7, background: "#1e293b", borderRadius: 999, overflow: "hidden", marginTop: 10 }}>
                <div style={{ width: `${coveragePct}%`, height: "100%", background: "linear-gradient(90deg,#22c55e,#e8c96a)" }} />
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
                    style={G.iconBtn(item.paymentMethod === "assets", "#e8c96a")}
                  >
                    ◈
                  </button>
                  <button
                    type="button"
                    title="تأجيل الاستحقاق"
                    onClick={() => updateCurrentPaymentMethod(item, item.paymentMethod === "postpone" ? "" : "postpone")}
                    style={G.iconBtn(item.paymentMethod === "postpone", "#cbd5e1")}
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
                      style={G.btn("#1e293b", "#e8c96a", { width: "100%", padding: "9px" })}
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
          <div style={{ textAlign: "center", color: "#64748b", padding: "18px 0", fontSize: 13 }}>
            لا توجد التزامات جارية
          </div>
        )}
      </div>

      <div style={{ ...G.card(), display: "none" }}>
        <div style={{ fontSize: 13, fontWeight: 900, marginBottom: 10, textAlign: "right" }}>
          إدارة البطاقات الائتمانية
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <button type="button" onClick={() => setCardMode(cardMode === "add" ? "" : "add")} style={G.btn("#1e293b", "#cbd5e1", { width: "100%" })}>
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
const [settingsCardName, setSettingsCardName] = useState("");
const [settingsCardLimit, setSettingsCardLimit] = useState("");
const [settingsCardBalance, setSettingsCardBalance] = useState("");
const [settingsCardDueDate, setSettingsCardDueDate] = useState("");
const [settingsCardMode, setSettingsCardMode] = useState("");
const [settingsSelectedCardId, setSettingsSelectedCardId] = useState("");
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
const addSettingsCreditCard = () => {
  if (!settingsCardName.trim()) return alert("أدخل اسم البطاقة");
  const creditLimit = Number(settingsCardLimit || 0);
  const balance = Number(settingsCardBalance || 0);
  if (creditLimit <= 0) return alert("أدخل سقف البطاقة");
  if (balance < 0) return alert("الرصيد المستخدم لا يجوز أن يكون سالبًا");
  if (balance > creditLimit) return alert("الرصيد المستخدم لا يجوز أن يتجاوز سقف البطاقة");
  if (!settingsCardDueDate) return alert("أدخل تاريخ استحقاق البطاقة");

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
        dueDate: settingsCardDueDate,
        dueDay: new Date(settingsCardDueDate).getDate(),
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
  setSettingsCardDueDate("");
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
<div style={{ borderTop: "1px solid #1a2540", paddingTop: 12, marginTop: 8 }}>
  <div style={{ textAlign: "right", color: "#94a3b8", fontWeight: 800, marginBottom: 10, fontSize: 13 }}>
    إدارة البطاقات الائتمانية
  </div>
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
    <button
      type="button"
      onClick={() => setSettingsCardMode(settingsCardMode === "add" ? "" : "add")}
      style={G.btn("#1e293b", "#cbd5e1", { width: "100%" })}
    >
      إضافة بطاقة
    </button>
    <button
      type="button"
      onClick={() => setSettingsCardMode(settingsCardMode === "delete" ? "" : "delete")}
      style={G.btn("#2b1111", "#fecaca", { width: "100%" })}
    >
      حذف بطاقة
    </button>
  </div>
  {settingsCardMode === "add" && (
    <div>
      <input value={settingsCardName} onChange={(e) => setSettingsCardName(e.target.value)} placeholder="اسم البطاقة" style={{ ...G.inp(), marginBottom: 8 }} />
      <input type="number" value={settingsCardLimit} onChange={(e) => setSettingsCardLimit(e.target.value)} placeholder="سقف البطاقة" style={{ ...G.inp(), marginBottom: 8 }} />
      <input type="number" value={settingsCardBalance} onChange={(e) => setSettingsCardBalance(e.target.value)} placeholder="الرصيد المستخدم حاليًا" style={{ ...G.inp(), marginBottom: 8 }} />
      <input type="date" value={settingsCardDueDate} onChange={(e) => setSettingsCardDueDate(e.target.value)} style={{ ...G.inp(), marginBottom: 8 }} />
      <button type="button" onClick={addSettingsCreditCard} style={G.btn("#17341f", "#86efac", { width: "100%" })}>
        حفظ البطاقة
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
  const [liabilitiesFocusDueOnly, setLiabilitiesFocusDueOnly] = useState(false);
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
    { id: "reports", label: "التقارير" },
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

{tab === "overview" && (
  <Overview
    state={viewState}
    setState={setState}
    onOpenReports={() => setTab("reports")}
    onOpenDueLiabilities={() => {
      setLiabilitiesFocusDueOnly(true);
      setTab("liabilities");
    }}
  />
)}
      {tab === "reports" && <ReportsScreen state={viewState} />}
      {tab === "assets" && (
  <AssetsScreen
state={viewState}
    setState={setState}
    onAddExtraCash={() => setShowExtraCash(true)}
  />
)}
     {tab === "liabilities" && (
  <LiabilitiesScreen
    state={viewState}
    setState={setState}
    focusDueOnly={liabilitiesFocusDueOnly}
  />
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
