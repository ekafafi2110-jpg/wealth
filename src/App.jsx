// Test Cline Integration
import { useEffect, useRef, useState } from "react";
import { INITIAL_STATE } from "./data/initialState";
import { recordExpense } from "./logic/expenses";
import {
  authErrorMessage,
  getSessionFromUrl,
  resetPasswordForEmail,
  signInWithPassword,
  signUpWithPassword,
  updatePassword,
} from "./storage/supabaseAuth";
import { loadState, saveState, clearState } from "./storage/supabaseStorage";
import {
  calcAssets,
  calcBudget,
  calcStructuralTotal,
} from "./logic/calculations";
import {
  getAssetSources,
  getAssetAvailable,
  addToAsset,
  deductFromAsset,
  liquidateAssetUnits,
} from "./logic/assets";
import BottomNavigation from "./components/common/BottomNavigation";
import ExpenseSubmitButton from "./components/expenses/ExpenseSubmitButton";
import PaymentMethodSelector from "./components/expenses/PaymentMethodSelector";
import ExpenseCategoryGrid from "./components/expenses/ExpenseCategoryGrid";
import ExpenseEntryPad from "./components/expenses/ExpenseEntryPad";
import PendingExpensesReview from "./components/expenses/PendingExpensesReview";
import PendingSurplusCard from "./components/overview/PendingSurplusCard";
import SpendingCapCard from "./components/overview/SpendingCapCard";
import AllExpensesModal from "./components/overview/AllExpensesModal";
import AssetsToolbar from "./components/assets/AssetsToolbar";
import AssetsSummaryCard from "./components/assets/AssetsSummaryCard";
import AssetSectionCard from "./components/assets/AssetSectionCard";
import AddAssetModal from "./components/assets/AddAssetModal";
import AssetTransferModal from "./components/assets/AssetTransferModal";
import AssetDetailsList from "./components/assets/AssetDetailsList";
import AssetsDashboard from "./components/assets/AssetsDashboard";
import ExtraCashModal from "./components/assets/ExtraCashModal";
import ExpenseSummaryReportCard from "./components/reports/ExpenseSummaryReportCard";
import ExpenseDonut from "./components/reports/ExpenseDonut";
import ExpenseReportLauncher from "./components/reports/ExpenseReportLauncher";
import AssetTrendReportCard from "./components/reports/AssetTrendReportCard";
import ExpenseReportModal from "./components/reports/ExpenseReportModal";
import OverBudgetReportModal from "./components/reports/OverBudgetReportModal";
import AssetTrendDetailsModal from "./components/reports/AssetTrendDetailsModal";
import SalaryCapSettingsSection from "./components/settings/SalaryCapSettingsSection";
import SettingsDashboard from "./components/settings/SettingsDashboard";
import SettingsSubpageShell from "./components/settings/SettingsSubpageShell";
import AccountSecuritySettings from "./components/settings/AccountSecuritySettings";
import ResetDataSettings from "./components/settings/ResetDataSettings";
import NotificationSettings from "./components/settings/NotificationSettings";
import CreditCardsSettingsSection from "./components/settings/CreditCardsSettingsSection";
import StructuralLiabilitiesSettingsSection from "./components/settings/StructuralLiabilitiesSettingsSection";
import OpeningAssetForm from "./components/settings/OpeningAssetForm";
import OpeningBalancesTable from "./components/settings/OpeningBalancesTable";
import OpeningBalancesSettingsSection from "./components/settings/OpeningBalancesSettingsSection";
import AuthScreen from "./components/common/AuthScreen";
import StorageErrorScreen from "./components/common/StorageErrorScreen";
import AppHeader from "./components/common/AppHeader";
import CalendarDatePicker from "./components/common/CalendarDatePicker";
import StructuralLiabilitiesCard from "./components/liabilities/StructuralLiabilitiesCard";
import CurrentLiabilitiesCard from "./components/liabilities/CurrentLiabilitiesCard";
import visualIdentity from "./theme/visualIdentity";
import { LocaleProvider, currencyLabels, useLocale } from "./i18n/locale";
import {
  buildNotificationPlan,
  notificationPermission,
  registerNotificationServiceWorker,
  showAppNotification,
} from "./notifications/appNotifications";
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

const createOperationId = () => Date.now();
const getCurrencyLabel = (state) =>
  currencyLabels[state.settings?.locale?.currency || "JOD"] || "JOD";

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

const G = {
  app: {
    minHeight: "100vh",
    background: visualIdentity.gradients.appBackground,
    fontFamily: "'Tajawal', sans-serif",
    direction: "rtl",
    color: visualIdentity.colors.white,
    maxWidth: 440,
    margin: "0 auto",
    position: "relative",
    paddingBottom: 82,
  },
  hdr: {
    background: "rgba(11,43,82,0.82)",
    borderBottom: "1px solid rgba(255,255,255,0.10)",
    padding: "12px 14px 1px",
    backdropFilter: "blur(16px)",
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

const HOME_UI = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(4,20,40,0.76)",
    backdropFilter: "blur(10px)",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  sheet: {
    width: "100%",
    maxWidth: 440,
    maxHeight: "82vh",
    overflowY: "auto",
    padding: "18px 16px calc(24px + env(safe-area-inset-bottom))",
    borderRadius: "20px 20px 0 0",
    background: visualIdentity.gradients.appBackground,
    border: visualIdentity.cards.outer.border,
    boxShadow: "0 -18px 42px rgba(3,18,37,0.34)",
    color: visualIdentity.colors.white,
    direction: "rtl",
  },
  sheetHeader: {
    position: "sticky",
    top: 0,
    zIndex: 20,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    paddingBottom: 12,
    background: "rgba(18,58,107,0.94)",
    borderBottom: "1px solid rgba(255,255,255,0.12)",
  },
  innerCard: {
    padding: 14,
    borderRadius: visualIdentity.cards.inner.borderRadius,
    background: visualIdentity.gradients.outerCard,
    border: visualIdentity.cards.outer.border,
    boxShadow: visualIdentity.cards.outer.boxShadow,
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 44,
    padding: "9px 0",
    borderBottom: "1px solid rgba(255,255,255,0.11)",
    color: visualIdentity.colors.white,
    fontSize: 12,
  },
  lastRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 44,
    padding: "9px 0",
    color: visualIdentity.colors.white,
    fontSize: 12,
  },
  muted: visualIdentity.colors.textSecondary,
};

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

function rebalanceExpenseCoverageAfterCapIncrease(state) {
  const next = structuredClone(state);
  let availableCap = Math.max(
    0,
    Number(next.session?.spendingCap || 0) -
      Number(next.session?.coveredSpent || 0)
  );

  if (availableCap <= 0) return next;

  for (const expense of next.expenses || []) {
    if (availableCap <= 0) break;
    if (expense.isIncomeEntry || Number(expense.overBudget || 0) <= 0) continue;

    const moveAmount = Math.min(availableCap, Number(expense.overBudget || 0));
    if (moveAmount <= 0) continue;

    expense.budgetCovered = Number(
      (Number(expense.budgetCovered || 0) + moveAmount).toFixed(2)
    );
    expense.overBudget = Number(
      Math.max(0, Number(expense.overBudget || 0) - moveAmount).toFixed(2)
    );
    expense.isOverBudget = expense.overBudget > 0;

    next.session.coveredSpent = Number(
      (Number(next.session?.coveredSpent || 0) + moveAmount).toFixed(2)
    );
    next.session.overBudgetSpent = Number(
      Math.max(0, Number(next.session?.overBudgetSpent || 0) - moveAmount).toFixed(2)
    );
    availableCap = Number((availableCap - moveAmount).toFixed(2));

    const relatedLiabilities = (next.currentLiabilities || []).filter(
      (item) => item.status !== "paid" && String(item.expenseId || "") === String(expense.id)
    );

    if (expense.paymentMethod === "card" && expense.cardId) {
      const card = (next.currentLiabilities || []).find(
        (item) => item.type === "card" && String(item.id) === String(expense.cardId)
      );
      if (card && !relatedLiabilities.includes(card)) relatedLiabilities.push(card);
    }

    if (expense.overBudgetFunding?.type === "card" && expense.overBudgetFunding.cardId) {
      const fundingCard = (next.currentLiabilities || []).find(
        (item) =>
          item.type === "card" &&
          String(item.id) === String(expense.overBudgetFunding.cardId)
      );
      if (fundingCard && !relatedLiabilities.includes(fundingCard)) {
        relatedLiabilities.push(fundingCard);
      }
      expense.overBudgetFunding.capCovered = Number(
        (Number(expense.overBudgetFunding.capCovered || 0) + moveAmount).toFixed(2)
      );
    }

    relatedLiabilities.forEach((item) => {
      item.payableBuffer = Number(
        (Number(item.payableBuffer || 0) + moveAmount).toFixed(2)
      );
      item.uncoveredDebt = Number(
        Math.max(0, Number(item.uncoveredDebt || 0) - moveAmount).toFixed(2)
      );
    });
  }

  return next;
}

function Overview({
  state,
  setState,
  onOpenDueLiabilities,
  onAllocateSurplus,
  readOnly = false,
}) {
  const { currencyLabel: localeCurrencyLabel, t } = useLocale();
  const budget = calcBudget(state);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showAllExpenses, setShowAllExpenses] = useState(false);
  const deficitLiabilityNameRef = useRef(null);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("طعام");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [cardId, setCardId] = useState("");
  const [note, setNote] = useState("");
  const [pendingExpenses, setPendingExpenses] = useState([]);
  const [liabilityName, setLiabilityName] = useState("");
  const [dueDate, setDueDate] = useState("");

const [deficitTransfer, setDeficitTransfer] = useState(null);
const [, setOverBudgetSource] = useState("");
const [overBudgetAssetKey, setOverBudgetAssetKey] = useState("cash");
const [deficitFundingType, setDeficitFundingType] = useState("");
const [overBudgetLiabilityName, setOverBudgetLiabilityName] = useState("تجاوز سقف الصرف");
const [overBudgetDueDate, setOverBudgetDueDate] = useState("");
const [unusualFundingMode, setUnusualFundingMode] = useState("asset");
const [unusualCapAmount, setUnusualCapAmount] = useState("");
const [unusualRemainderSource, setUnusualRemainderSource] = useState("asset");
const [unusualAssetKey, setUnusualAssetKey] = useState("");
const [unusualLiabilityName, setUnusualLiabilityName] = useState("مصروف غير اعتيادي");
const [unusualDueDate, setUnusualDueDate] = useState("");
  const cards = state.currentLiabilities.filter((x) => x.type === "card");
  const recent = [...state.expenses].slice(-3).reverse();
  const allExpenses = [...state.expenses].reverse();
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
  const isGoodsSource = (source) => {
    if (source.type !== "custom") return false;
    const id = Number(String(source.key).split(":")[1]);
    return (state.assets.custom || []).some(
      (item) => item.id === id && item.type === "unit"
    );
  };
  const bankAssetSources = assetSources.filter((source) => source.type === "bank");
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
  .slice(0, 9);

const mainExpenseCategories = pinnedExpenseCategories;
  const enteredAmount = Number(amount || 0);
  const pendingTotal = pendingExpenses.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );
  const pendingCount = pendingExpenses.length;
  const pendingByCategory = pendingExpenses.reduce((acc, item) => {
    acc[item.category] = Number((Number(acc[item.category] || 0) + Number(item.amount || 0)).toFixed(2));
    return acc;
  }, {});
  const spendingProgress =
    Number(budget.spendingCap || 0) > 0
      ? Math.min(100, (Number(budget.coveredSpent || 0) / Number(budget.spendingCap || 0)) * 100)
      : 0;
        const spendingCapValue = Number(budget.spendingCap || 0);
  const spentValue = Number(budget.coveredSpent || 0);
  const remainingValue = Math.max(0, Number(budget.remainingCap || 0));

  const saveButtonTitle = pendingCount > 0 ? t("expenses.logMany") : t("expenses.logOne");
  const saveButtonMeta =
    pendingCount === 0
      ? ""
      : pendingCount === 1
      ? `${t("expenses.pendingReview")}: ${pendingTotal.toFixed(2)} ${localeCurrencyLabel} | 1`
      : `${t("expenses.pendingReview")}: ${pendingTotal.toFixed(2)} ${localeCurrencyLabel} | ${pendingCount}`;
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
const uncoveredAmount = Math.max(
  0,
  enteredAmount - Number(budget.remainingCap || 0)
);
const amountExceedsCap = enteredAmount > Number(budget.remainingCap || 0);
const emergencyAssetRequired =
  unusualFundingMode === "mix"
    ? Math.max(0, enteredAmount - Number(unusualCapAmount || 0))
    : enteredAmount;
const selectedDeficitSource = deficitTransfer?.sources.find(
  (source) => source.key === deficitTransfer.fromAsset
);
const deficitSourceNeedsSale = Boolean(
  selectedDeficitSource &&
    !["cash", "bank"].includes(selectedDeficitSource.type)
);
const showLegacyDeficitPanel = false;

useEffect(() => {
  const timer = window.setTimeout(() => {
    if (!hasSpendingCap && unusualFundingMode === "mix") {
      setUnusualFundingMode("asset");
    }

    if (!hasSpendingCap && paymentMethod === "cash") {
      setPaymentMethod("");
    }

    if (hasSpendingCap && !amountExceedsCap && ["", "asset"].includes(paymentMethod)) {
      setPaymentMethod("cash");
    }
  }, 0);

  return () => window.clearTimeout(timer);
}, [amountExceedsCap, hasSpendingCap, paymentMethod, unusualFundingMode]);

  const resetExpenseDraft = () => {
    setAmount("");
    setCategory("طعام");
    setPaymentMethod("cash");
    setCardId("");
    setNote("");
    setPendingExpenses([]);
    setLiabilityName("");
    setDueDate("");
    setOverBudgetSource("");
    setOverBudgetAssetKey("cash");
    setDeficitFundingType("");
    setDeficitTransfer(null);
    setOverBudgetLiabilityName("تجاوز سقف الصرف");
    setOverBudgetDueDate("");
    setUnusualFundingMode("asset");
    setUnusualCapAmount("");
    setUnusualRemainderSource("asset");
    setUnusualAssetKey("");
    setUnusualLiabilityName("مصروف طارئ");
    setUnusualDueDate("");
  };

  const appendAmountDigit = (digit) => {
    setAmount((prev) => {
      const next = String(prev || "");
      if (digit === "." && next.includes(".")) return next;
      if (digit === "." && !next) return "0.";
      if (next === "0" && digit !== ".") return String(digit);
      return `${next}${digit}`;
    });
  };

  const addPendingExpense = () => {
    const value = Number(amount || 0);

    if (!value || value <= 0) {
      alert("أدخل مبلغاً أكبر من صفر");
      return;
    }
    if (!String(category || "").trim()) {
      alert("اختر تصنيف المصروف");
      return;
    }
    if (!paymentMethod) {
      alert("اختر أسلوب الدفع قبل إضافة البند");
      return;
    }
    if (paymentMethod === "emergency") {
      alert("تسجيل عدة مصاريف مع المصروف الطارئ غير مدعوم حالياً. سجل كل مصروف على حدة.");
      return;
    }
    if (paymentMethod === "asset") {
      alert("المصاريف الممولة من الأصول تسجل حالياً بنداً بنداً لإكمال المناقلة بأمان.");
      return;
    }

    setPendingExpenses((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${prev.length}`,
        category,
        amount: value,
        note,
        date: new Date().toISOString().slice(0, 10),
        paymentMethod,
        cardId,
        liabilityName,
        dueDate,
      },
    ]);
    setAmount("");
    setNote("");
    setCategory("طعام");
  };

  const removePendingExpense = (id) => {
    setPendingExpenses((items) => items.filter((item) => item.id !== id));
  };

  const editExpenseNote = () => {
    const nextNote = window.prompt("اكتب ملاحظة المصروف", note || "");
    if (nextNote !== null) {
      setNote(nextNote);
    }
  };

  const changePaymentMethod = (value) => {
    if (pendingExpenses.length > 0 && value !== paymentMethod) {
      alert("لديك مصروفات غير مسجلة. سجلها أولاً أو قم بإلغائها قبل تغيير اسلوب الدفع.");
      return;
    }

    if (value === "emergency") {
      setPaymentMethod(value);
      setUnusualFundingMode("asset");
      setUnusualAssetKey("");
      return;
    }

    if (value === "asset") {
      setPaymentMethod(value);
      openDeficitTransfer("all");
      return;
    }

    setPaymentMethod(value);
    setUnusualFundingMode("");
  };

  const paymentOptions = [
    ...(hasSpendingCap ? [{ value: "cash", label: "كاش", icon: "💵" }] : []),
    ...(amountExceedsCap ? [{ value: "asset", label: "أصل", icon: "🏦" }] : []),
    { value: "card", label: "بطاقة", icon: "💳" },
    { value: "liability", label: "التزام جديد", icon: "🧾" },
    { value: "emergency", label: "مصروف طارئ", icon: "⚡" },
  ];

  const submitExpenseWithState = (baseState, fundingOverride = null) => {
    const effectivePaymentMethod =
      fundingOverride?.paymentMethod ?? paymentMethod;
    const effectiveOverBudgetSource = fundingOverride?.source ?? "";
    const effectiveOverBudgetAssetKey = fundingOverride?.assetKey ?? "";
    const effectiveEmergencyAssetKey =
      fundingOverride?.assetKey ?? unusualAssetKey;
    const effectiveOverBudget = ["emergency", "asset"].includes(
      effectivePaymentMethod
    )
      ? 0
      : uncoveredAmount;
    const baseCards = (baseState.currentLiabilities || []).filter(
      (item) => item.type === "card"
    );

    if (!effectivePaymentMethod) {
      alert("اختر أسلوب الدفع");
      return;
    }

    if (effectivePaymentMethod === "asset") {
      alert("أكمل مناقلة الأصل أولاً لتسجيل المصروف");
      return;
    }

    if (!enteredAmount || enteredAmount <= 0) {
      alert("أدخل مبلغًا صحيحًا");
      return;
    }

    if (effectivePaymentMethod === "liability" && !dueDate) {
  alert("أدخل تاريخ استحقاق الدين المباشر");
  return;
}
    if (effectivePaymentMethod === "card") {
      const selectedCard = baseCards.find((card) => String(card.id) === String(cardId));
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
    if (effectivePaymentMethod === "emergency") {
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
          alert(`المتاح من سقف الصرف فقط ${Number(budget.remainingCap || 0).toFixed(2)} ${localeCurrencyLabel}`);
          return;
        }

        if (emergencyRemainder <= 0) {
          alert("باقي المصروف غير صحيح");
          return;
        }
      }

      if (needsEmergencyAsset && !effectiveEmergencyAssetKey) {
        alert("اختر الأصل الذي سيموّل المصروف الطارئ");
        return;
      }

      if (needsEmergencyLiability && !unusualDueDate) {
        alert("أدخل تاريخ استحقاق دين المصروف الطارئ");
        return;
      }
    }
    if (effectiveOverBudget > 0) {
  if (effectivePaymentMethod === "cash" && !effectiveOverBudgetSource) {
    alert("رصيد الكاش لا يغطي المصروف. اختر طريقة تمويل العجز.");
    return;
  }

  if (
    effectivePaymentMethod === "cash" &&
    effectiveOverBudgetSource === "asset" &&
    !effectiveOverBudgetAssetKey
  ) {
    alert("اختر الأصل الذي سيموّل العجز");
    return;
  }

  if (
    effectivePaymentMethod === "cash" &&
    effectiveOverBudgetSource === "liability" &&
    !dueDate
  ) {
    alert("أدخل تاريخ استحقاق الالتزام الناتج عن العجز");
    return;
  }

  const ok = window.confirm(
    `هذا المصروف يتجاوز سقف الصرف بمبلغ ${effectiveOverBudget.toFixed(
      2
    )} ${localeCurrencyLabel}. هل تريد المتابعة؟`
  );

  if (!ok) return;
}

    const operationId = createOperationId();
    const result = recordExpense(baseState, {
      amount: Number(amount || 0),
      category,
      paymentMethod: effectivePaymentMethod,
      cardId,
      note,
      liabilityName,
      dueDate,
      emergencyFunding:
        effectivePaymentMethod === "emergency"
          ? {
              mode: unusualFundingMode,
              capAmount:
                unusualFundingMode === "mix" ? Number(unusualCapAmount || 0) : 0,
              remainderSource: unusualRemainderSource,
              assetKey: effectiveEmergencyAssetKey,
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

if (lastExpense?.overBudget > 0 && effectivePaymentMethod !== "emergency") {
  if (effectivePaymentMethod !== "card" && effectivePaymentMethod !== "liability") {
    if (effectiveOverBudgetSource === "asset") {
      const deduction = deductFromAsset(
        nextState,
        effectiveOverBudgetAssetKey,
        lastExpense.overBudget
      );

      if (!deduction.success) {
        alert(deduction.message);
        return;
      }

      nextState = deduction.nextState;

      nextState.transactions.push({
        id: operationId,
        type: "over_budget_covered_from_asset",
        amount: lastExpense.overBudget,
        assetKey: effectiveOverBudgetAssetKey,
        expenseId: lastExpense.id,
        date: new Date().toISOString(),
      });
      lastExpense.overBudgetFunding = {
        type: "asset",
        assetKey: effectiveOverBudgetAssetKey,
        amount: Number(lastExpense.overBudget || 0),
      };
    }

  }

  alert(
    `تنبيه: تجاوزت سقف الصرف بمبلغ ${lastExpense.overBudget.toFixed(
      2
    )} ${localeCurrencyLabel} في هذه العملية.`
  );
}

setState(nextState);
    resetExpenseDraft();
  };
  const submitPendingExpenses = () => {
    if (Number(amount || 0) > 0) {
      alert("أضف البند الحالي إلى قائمة المراجعة أولاً");
      return;
    }

    const invalidItem = pendingExpenses.find(
      (item) => Number(item.amount || 0) <= 0 || !String(item.category || "").trim()
    );
    if (invalidItem) {
      alert("تحقق من مبلغ وتصنيف جميع البنود قبل التسجيل");
      return;
    }

    if (paymentMethod === "emergency") {
      alert("تسجيل عدة مصاريف مع المصروف الطارئ غير مدعوم حالياً. سجل كل مصروف على حدة.");
      return;
    }

    if (paymentMethod === "asset") {
      alert("المصاريف الممولة من الأصول تسجل حالياً بنداً بنداً لإكمال المناقلة بأمان.");
      return;
    }

    if (!paymentMethod) {
      alert("اختر أسلوب الدفع");
      return;
    }

    if (paymentMethod === "cash" && pendingTotal > Number(budget.remainingCap || 0)) {
      alert(
        `إجمالي المصاريف المؤقتة ${pendingTotal.toFixed(2)} ${localeCurrencyLabel} يتجاوز المتاح من سقف الصرف ${Number(
          budget.remainingCap || 0
        ).toFixed(2)} ${localeCurrencyLabel}. سجل البنود التي تحتاج تغطية بشكل منفرد.`
      );
      return;
    }

    if (paymentMethod === "card" && !cardId) {
      alert("اختر البطاقة التي ستستخدم لجميع البنود");
      return;
    }

    if (paymentMethod === "liability" && !dueDate) {
      alert("أدخل تاريخ استحقاق الالتزام قبل تسجيل البنود");
      return;
    }

    let nextState = structuredClone(state);
    const batchOperationId = Date.now();

    for (let index = 0; index < pendingExpenses.length; index += 1) {
      const item = pendingExpenses[index];
      const operationId = batchOperationId + index * 10;
      const result = recordExpense(nextState, {
        id: operationId,
        operationId,
        amount: Number(item.amount || 0),
        category: item.category,
        note: item.note || "",
        date: item.date,
        paymentMethod,
        cardId,
        liabilityName,
        dueDate,
        emergencyFunding: null,
      });

      if (!result.success) {
        alert(`لم يتم حفظ أي بند. تعذر تسجيل «${item.category}»: ${result.message}`);
        return;
      }

      nextState = result.nextState;
    }

    setState(nextState);
    resetExpenseDraft();
    alert(`تم تسجيل ${pendingExpenses.length} مصاريف بنجاح`);
  };

  const submitExpense = () =>
    pendingExpenses.length > 0
      ? submitPendingExpenses()
      : submitExpenseWithState(state);

  const getSaleSources = (type) =>
    assetSources.filter((source) => {
      if (type === "all") {
        return ["cash", "bank", "gold", "silver", "stock"].includes(
          source.type
        ) || isGoodsSource(source);
      }
      if (type === "gold") return source.type === "gold";
      if (type === "stock") return source.type === "stock";
      if (type === "goods") return isGoodsSource(source);
      return false;
    });

  const openDeficitTransfer = (
    type = "all",
    context = "overBudget",
    requiredAmount = uncoveredAmount
  ) => {
    const sources = getSaleSources(type);
    if (!sources.length) {
      alert("لا يوجد أصل متاح من هذا النوع للمناقلة");
      return;
    }

    const transferValue = Number(requiredAmount || 0).toFixed(2);
    setDeficitTransfer({
      type,
      context,
      requiredAmount: Number(requiredAmount || 0),
      sources,
      fromAsset: sources[0].key,
      amount: transferValue,
      sourceUnits: "",
      sourcePrice: "",
      allocations: [
        {
          id: 1,
          allocation: "cash",
          amount: transferValue,
          targetId: "",
          assetName: "",
          units: "",
          price: "",
        },
      ],
    });
  };

  const updateDeficitTransferRow = (patch) => {
    setDeficitTransfer((current) => ({
      ...current,
      allocations: current.allocations.map((row) =>
        row.id === 1 ? { ...row, ...patch } : row
      ),
    }));
  };

  const updateDeficitSaleField = (field, value) => {
    setDeficitTransfer((current) => {
      const next = { ...current, [field]: value };
      const saleAmount = Number(next.sourceUnits || 0) * Number(next.sourcePrice || 0);
      const amountValue = saleAmount > 0 ? saleAmount.toFixed(2) : "";
      return {
        ...next,
        amount: amountValue,
        allocations: next.allocations.map((row) => ({
          ...row,
          amount: amountValue,
        })),
      };
    });
  };

  const confirmDeficitTransfer = () => {
    if (!deficitTransfer) return;

    const requiredAmount = Number(deficitTransfer.requiredAmount || 0);
    const transferAmount = Number(deficitTransfer.amount || 0);
    const row = deficitTransfer.allocations[0];
    const allocationAmount = Number(row?.amount || 0);
    const selectedSource = deficitTransfer.sources.find(
      (source) => source.key === deficitTransfer.fromAsset
    );

    if (!selectedSource || requiredAmount <= 0) {
      alert("تعذر تحديد مصدر التمويل أو المبلغ المطلوب");
      return;
    }

    const completeExpense = (fundedState, destinationKey) => {
      setDeficitTransfer(null);
      submitExpenseWithState(fundedState, {
        source: "asset",
        assetKey: destinationKey,
        paymentMethod:
          deficitTransfer.context === "emergency" ? "emergency" : "cash",
      });
    };

    if (["cash", "bank"].includes(selectedSource.type)) {
      const finalReceiverBalance = getAssetAvailable(state, selectedSource.key);
      if (finalReceiverBalance < requiredAmount) {
        alert(
          `الرصيد لا يغطي المبلغ المطلوب. الرصيد المتاح ${finalReceiverBalance.toFixed(2)} ${localeCurrencyLabel}`
        );
        return;
      }
      completeExpense(state, selectedSource.key);
      return;
    }

    if (transferAmount <= 0 || allocationAmount <= 0) {
      alert("أدخل مبلغ مناقلة صحيحًا");
      return;
    }
    if (Math.abs(transferAmount - allocationAmount) > 0.01) {
      alert("قيمة التوزيع يجب أن تساوي قيمة المناقلة");
      return;
    }

    let destinationKey = "cash";
    if (row.allocation === "bank") {
      if (!row.targetId) {
        alert("اختر الحساب البنكي المستلم");
        return;
      }
      destinationKey = `bank:${row.targetId}`;
    }

    const transferResult = liquidateAssetUnits(
      state,
      deficitTransfer.fromAsset,
      destinationKey,
      deficitTransfer.sourceUnits,
      deficitTransfer.sourcePrice
    );

    if (!transferResult.success) {
      alert(transferResult.message);
      return;
    }

    const finalReceiverBalance = getAssetAvailable(
      transferResult.nextState,
      destinationKey
    );
    if (finalReceiverBalance < requiredAmount) {
      setState(transferResult.nextState);
      setDeficitTransfer(null);
      alert(
        `تمت المناقلة، لكن رصيد الحساب المستلم غير كافٍ. الرصيد النهائي ${finalReceiverBalance.toFixed(2)} ${localeCurrencyLabel}`
      );
      return;
    }

    completeExpense(transferResult.nextState, destinationKey);
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

    if (expense.overBudgetFunding?.type === "card") {
      const fundingCard = (next.currentLiabilities || []).find(
        (item) =>
          item.type === "card" &&
          String(item.id) === String(expense.overBudgetFunding.cardId)
      );
      const fundedAmount = Number(expense.overBudgetFunding.amount || 0);
      const capCovered = Math.min(
        fundedAmount,
        Number(expense.overBudgetFunding.capCovered || 0)
      );

      if (fundingCard && fundedAmount > 0) {
        fundingCard.balance = Number(
          Math.max(0, Number(fundingCard.balance || 0) - fundedAmount).toFixed(2)
        );
        fundingCard.uncoveredDebt = Number(
          Math.max(
            0,
            Number(fundingCard.uncoveredDebt || 0) - (fundedAmount - capCovered)
          ).toFixed(2)
        );
        fundingCard.payableBuffer = Number(
          Math.max(0, Number(fundingCard.payableBuffer || 0) - capCovered).toFixed(2)
        );
        if (fundingCard.balance <= 0) fundingCard.status = "paid";
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

    if (!target.pinned && pinnedCount >= 9) {
      alert("اكتمل العدد في قائمة المصاريف الرئيسية. قم بإلغاء تثبيت أحد المصاريف أولاً لإضافة مصروف جديد.");
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
    <div
      className="overview-screen"
      style={{
        ...G.scr,
        minHeight: "calc(100vh - 118px)",
        background: "linear-gradient(180deg, #083B76 0%, #064886 52%, #073264 100%)",
      }}
    >
<SpendingCapCard
        spendingProgress={spendingProgress}
        remainingValue={remainingValue}
        spentValue={spentValue}
        spendingCapValue={spendingCapValue}
        overBudgetSpent={budget.overBudgetSpent}
        dueLiabilitiesCount={dueCurrentLiabilities.length}
        onOpenDueLiabilities={onOpenDueLiabilities}
        recentExpenses={recent}
        onSelectExpense={setSelectedExpense}
        onShowAllExpenses={() => setShowAllExpenses(true)}
        incomeAmount={incomeEntryAmount}
        categoryColors={CC}
      />

            {!readOnly && state.session.isOpen && (
        <div
          className="home-expense-panel"
          style={{
            background: visualIdentity.gradients.outerCard,
            border: visualIdentity.cards.outer.border,
            borderRadius: visualIdentity.cards.outer.borderRadius,
            boxShadow: visualIdentity.cards.outer.boxShadow,
            margin: "12px 0 14px",
            padding: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              marginBottom: 8,
            }}
          >
            <button
              type="button"
              onClick={() => setShowCategoryManager(true)}
              title="المزيد"
              aria-label="المزيد"
              style={{
                width: 34,
                height: 34,
                borderRadius: 11,
                border: "1px solid rgba(255,255,255,0.16)",
                background: "rgba(255,255,255,0.08)",
                color: visualIdentity.colors.white,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: 17,
                fontWeight: 900,
                fontFamily: "inherit",
                flex: "0 0 auto",
              }}
            >
              ⋯
            </button>

            <div
              style={{
                fontSize: 14,
                fontWeight: 900,
                color: visualIdentity.colors.white,
                textAlign: "right",
                flex: 1,
              }}
            >
              تسجيل مصروف
            </div>
          </div>

<ExpenseCategoryGrid
            categories={mainExpenseCategories}
            selectedCategory={category}
            onSelect={setCategory}
            getTileStyle={getCategoryTileStyle}
            icons={CAT_ICONS}
            pendingByCategory={pendingByCategory}
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "42px minmax(0, 1fr)",
              alignItems: "stretch",
              gap: 7,
              marginBottom: 9,
              direction: "ltr",
            }}
          >
            <button
              type="button"
              onClick={submitExpense}
              title="تسجيل المصروف"
              aria-label="تسجيل المصروف"
              style={{
                width: 42,
                minHeight: 42,
                borderRadius: 12,
                border: `1px solid ${visualIdentity.colors.gold}`,
                background: visualIdentity.gradients.gold,
                color: visualIdentity.colors.navy,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 6px 14px rgba(255,184,0,0.18)",
              }}
            >
              <span aria-hidden="true" style={{ fontSize: 21, lineHeight: 1 }}>
                💸
              </span>
            </button>
            <input
              className="expense-amount-input"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="المبلغ"
              style={{ ...G.inp(), minHeight: 42, marginBottom: 0, fontSize: 18, direction: "rtl" }}
            />
          </div>

          <PaymentMethodSelector
            options={paymentOptions}
            value={paymentMethod}
            onChange={changePaymentMethod}
            variant="glass"
          />
                    {(paymentMethod === "card" ||
            paymentMethod === "liability" ||
            paymentMethod === "emergency") && (
            <div
              style={{
                marginBottom: 10,
                background: visualIdentity.gradients.innerCard,
                border: visualIdentity.cards.inner.border,
                borderRadius: visualIdentity.cards.inner.borderRadius,
                padding: 10,
                boxShadow: visualIdentity.cards.inner.boxShadow,
              }}
            >
              {paymentMethod === "card" && (
                <select
                  value={cardId}
                  onChange={(e) => setCardId(e.target.value)}
                  style={{ ...G.inp(), marginBottom: 0 }}
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
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "42px minmax(0, 1fr)",
                    alignItems: "center",
                    gap: 7,
                    direction: "ltr",
                  }}
                >
                  <CalendarDatePicker
                    value={dueDate}
                    onChange={setDueDate}
                    label="اختيار تاريخ استحقاق الالتزام"
                  />
                  <input
                    value={liabilityName}
                    onChange={(e) => setLiabilityName(e.target.value)}
                    placeholder="اسم الالتزام"
                    style={{ ...G.inp(), marginBottom: 0, direction: "rtl" }}
                  />
                </div>
              )}

              {paymentMethod === "emergency" && (
                <>
                  <select
                    value={unusualFundingMode}
                    onChange={(e) => {
                      setUnusualFundingMode(e.target.value);
                      setUnusualAssetKey("");
                    }}
                    style={{ ...G.inp(), marginBottom: 8 }}
                  >
                    <option value="asset">كاملًا من أصل</option>
                    <option value="liability">كاملًا كدين</option>
                    {hasSpendingCap && (
                      <option value="mix">جزء من السقف والباقي من أصل أو دين</option>
                    )}
                  </select>

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
                        onChange={(e) => {
                          setUnusualRemainderSource(e.target.value);
                          setUnusualAssetKey("");
                        }}
                        style={{ ...G.inp(), marginBottom: 8 }}
                      >
                        <option value="asset">الباقي من أصل</option>
                        <option value="liability">الباقي كدين</option>
                      </select>
                    </>
                  )}

                  {(unusualFundingMode === "asset" ||
                    (unusualFundingMode === "mix" &&
                      unusualRemainderSource === "asset")) && (
                    <button
                      type="button"
                      onClick={() => {
                        if (emergencyAssetRequired <= 0) {
                          alert("أدخل مبلغ المصروف والجزء المغطى من السقف بشكل صحيح");
                          return;
                        }
                        if (
                          unusualFundingMode === "mix" &&
                          Number(unusualCapAmount || 0) > Number(budget.remainingCap || 0)
                        ) {
                          alert(`المتاح من سقف الصرف فقط ${Number(budget.remainingCap || 0).toFixed(2)} ${localeCurrencyLabel}`);
                          return;
                        }
                        openDeficitTransfer(
                          "all",
                          "emergency",
                          emergencyAssetRequired
                        );
                      }}
                      style={G.btn(
                        "rgba(255,255,255,0.08)",
                        visualIdentity.colors.white,
                        {
                          width: "100%",
                          marginBottom: 8,
                          border: visualIdentity.cards.inner.border,
                        }
                      )}
                    >
                      اختيار الأصل وتمويل {emergencyAssetRequired.toFixed(2)} {localeCurrencyLabel}
                    </button>
                  )}

                  {(unusualFundingMode === "liability" ||
                    (unusualFundingMode === "mix" &&
                      unusualRemainderSource === "liability")) && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "42px minmax(0, 1fr)",
                        alignItems: "center",
                        gap: 7,
                        direction: "ltr",
                      }}
                    >
                      <CalendarDatePicker
                        value={unusualDueDate}
                        onChange={setUnusualDueDate}
                        label="اختيار تاريخ استحقاق الالتزام الطارئ"
                      />
                      <input
                        value={unusualLiabilityName}
                        onChange={(e) => setUnusualLiabilityName(e.target.value)}
                        placeholder="اسم الدين"
                        style={{ ...G.inp(), marginBottom: 0, direction: "rtl" }}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {showLegacyDeficitPanel && amountExceedsCap && paymentMethod !== "emergency" && (
            <div
              style={{
                marginBottom: 9,
                padding: 9,
                background: "rgba(255,198,45,0.10)",
                border: "1px solid rgba(255,198,45,0.28)",
                borderRadius: visualIdentity.cards.inner.borderRadius,
              }}
            >
              <div
                style={{
                  marginBottom: 8,
                  color: visualIdentity.colors.gold,
                  fontSize: 11,
                  fontWeight: 900,
                  lineHeight: 1.5,
                  textAlign: "right",
                }}
              >
                السقف يغطي {Number(budget.remainingCap || 0).toFixed(2)} {localeCurrencyLabel}، اختر تغطية الجزء غير المغطى ({uncoveredAmount.toFixed(2)} {localeCurrencyLabel})
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: 6,
                  marginBottom: deficitFundingType ? 8 : 0,
                }}
              >
                {[
                  ["cash", "كاش ادخاري", "💵"],
                  ["bank", "حساب بنكي", "🏦"],
                  ["sell_gold", "بيع ذهب", "🥇"],
                  ["sell_stock", "بيع أسهم", "📊"],
                  ["sell_goods", "بيع بضاعة", "📦"],
                  ["liability", "التزام جديد", "🧾"],
                ].map(([value, label, icon]) => {
                  const active = deficitFundingType === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        if (value === "cash") {
                          setDeficitFundingType(value);
                          setOverBudgetSource("asset");
                          setOverBudgetAssetKey("cash");
                          return;
                        }
                        if (value === "bank") {
                          if (!bankAssetSources.length) {
                            alert("لا يوجد حساب بنكي متاح");
                            return;
                          }
                          setDeficitFundingType(value);
                          setOverBudgetSource("asset");
                          setOverBudgetAssetKey(bankAssetSources[0].key);
                          return;
                        }
                        if (value === "liability") {
                          setDeficitFundingType(value);
                          setOverBudgetSource("liability");
                          window.setTimeout(() => {
                            deficitLiabilityNameRef.current?.focus();
                            deficitLiabilityNameRef.current?.scrollIntoView({
                              behavior: "smooth",
                              block: "center",
                            });
                          }, 0);
                          return;
                        }
                        openDeficitTransfer(value.replace("sell_", ""));
                      }}
                      style={{
                        minHeight: 42,
                        borderRadius: 11,
                        border: active
                          ? `1.5px solid ${visualIdentity.colors.gold}`
                          : "1px solid rgba(255,255,255,0.14)",
                        background: active
                          ? visualIdentity.gradients.gold
                          : "rgba(255,255,255,0.07)",
                        color: active
                          ? visualIdentity.colors.navy
                          : visualIdentity.colors.white,
                        fontFamily: "inherit",
                        fontSize: 10,
                        fontWeight: 900,
                        cursor: "pointer",
                      }}
                    >
                      <span style={{ marginInlineEnd: 4 }}>{icon}</span>
                      {label}
                    </button>
                  );
                })}
              </div>

              {deficitFundingType === "bank" && (
                <select
                  value={overBudgetAssetKey}
                  onChange={(event) => setOverBudgetAssetKey(event.target.value)}
                  style={{ ...G.inp(), marginBottom: 0 }}
                >
                  {bankAssetSources.map((source) => (
                    <option key={source.key} value={source.key}>
                      {source.label} — متاح {Number(source.available || 0).toFixed(2)} {localeCurrencyLabel}
                    </option>
                  ))}
                </select>
              )}

              {deficitFundingType === "liability" && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "42px minmax(0, 1fr)",
                    alignItems: "center",
                    gap: 7,
                    direction: "ltr",
                  }}
                >
                  <CalendarDatePicker
                    value={overBudgetDueDate}
                    onChange={setOverBudgetDueDate}
                    label="اختيار تاريخ استحقاق التزام العجز"
                  />
                  <input
                    ref={deficitLiabilityNameRef}
                    value={overBudgetLiabilityName}
                    onChange={(event) => setOverBudgetLiabilityName(event.target.value)}
                    placeholder="اسم الالتزام"
                    style={{ ...G.inp(), marginBottom: 0, direction: "rtl" }}
                  />
                </div>
              )}

            </div>
          )}

<ExpenseEntryPad
            onDigit={appendAmountDigit}
            onBackspace={() =>
              setAmount((prev) => String(prev || "").slice(0, -1))
            }
            note={note}
            onEditNote={editExpenseNote}
            onAdd={addPendingExpense}
            buttonStyle={G.btn}
          />

          <PendingExpensesReview
            items={pendingExpenses}
            total={pendingTotal}
            onRemove={removePendingExpense}
          />

          <ExpenseSubmitButton
            onSubmit={submitExpense}
            title={saveButtonTitle}
            meta={saveButtonMeta}
            buttonStyle={G.btn}
            background={visualIdentity.gradients.gold}
            color={visualIdentity.colors.navy}
            minHeight={46}
          />
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
          style={G.btn(visualIdentity.gradients.gold, visualIdentity.colors.navy, {
            width: "100%",
            marginBottom: 12,
            borderRadius: 16,
          })}
        >
          🗓 بدء شهر تجريبي
        </button>
      )}

      {!readOnly && (
        <PendingSurplusCard
          amount={state.session?.pendingSurplus}
          onAllocate={onAllocateSurplus}
          cardStyle={G.card}
          buttonStyle={G.btn}
        />
      )}


      <AssetTransferModal
        open={Boolean(deficitTransfer)}
        sources={deficitTransfer?.sources || []}
        fromAsset={deficitTransfer?.fromAsset || ""}
        amount={deficitTransfer?.amount || ""}
        allocations={deficitTransfer?.allocations || []}
        onClose={() => setDeficitTransfer(null)}
        onFromAssetChange={(value) =>
          setDeficitTransfer((current) => {
            const source = current.sources.find((item) => item.key === value);
            const isLiquid = ["cash", "bank"].includes(source?.type);
            const nextAmount = isLiquid
              ? Number(current.requiredAmount || 0).toFixed(2)
              : "";
            return {
              ...current,
              fromAsset: value,
              amount: nextAmount,
              sourceUnits: "",
              sourcePrice: "",
              allocations: current.allocations.map((row) => ({
                ...row,
                amount: nextAmount,
              })),
            };
          })
        }
        onAmountChange={(value) =>
          setDeficitTransfer((current) => ({ ...current, amount: value }))
        }
        onAddRow={() => {}}
        onRemoveRow={() => {}}
        onUpdateRow={(_, patch) => updateDeficitTransferRow(patch)}
        getDestinationOptions={(allocation) =>
          allocation === "bank" ? state.assets.banks || [] : []
        }
        onSubmit={confirmDeficitTransfer}
        sourceSaleFields={
          deficitSourceNeedsSale
            ? {
                units: deficitTransfer?.sourceUnits || "",
                price: deficitTransfer?.sourcePrice || "",
              }
            : null
        }
        onSourceUnitsChange={(value) =>
          updateDeficitSaleField("sourceUnits", value)
        }
        onSourcePriceChange={(value) =>
          updateDeficitSaleField("sourcePrice", value)
        }
        amountReadOnly
        showAllocations={deficitSourceNeedsSale}
        allowMultiple={false}
        allowedAllocations={["cash", "bank"]}
        allowNewTarget={false}
        inputStyle={G.inp()}
        closeButtonStyle={G.btn("transparent", visualIdentity.colors.gold, {
          width: 36,
          height: 36,
          padding: 0,
        })}
        addButtonStyle={G.btn("transparent", visualIdentity.colors.gold, {
          width: 36,
          height: 32,
          padding: 0,
        })}
        removeButtonStyle={G.btn("rgba(255,100,100,0.12)", visualIdentity.colors.red, {
          width: 36,
          height: 36,
          padding: 0,
        })}
        submitButtonStyle={G.btn(
          visualIdentity.gradients.gold,
          visualIdentity.colors.navy,
          { width: "100%", marginTop: 10 }
        )}
      />

      <AllExpensesModal
        open={showAllExpenses}
        items={allExpenses}
        onClose={() => setShowAllExpenses(false)}
        onSelect={setSelectedExpense}
        incomeAmount={incomeEntryAmount}
        categoryColors={CC}
      />

      {!readOnly && selectedExpense && (
  <div
    onClick={(ev) => ev.target === ev.currentTarget && setSelectedExpense(null)}
    style={{
      ...HOME_UI.overlay,
      zIndex: 520,
    }}
  >
    <div
      style={{
        ...HOME_UI.sheet,
        position: "relative",
      }}
    >
      <div
        style={{
          ...HOME_UI.sheetHeader,
        }}
      >
        <button
          onClick={() => setSelectedExpense(null)}
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.16)",
            color: visualIdentity.colors.white,
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
          <div style={{ fontSize: 11, color: HOME_UI.muted }}>
            تفاصيل العملية
          </div>
        </div>
      </div>

      <div style={HOME_UI.innerCard}>
        {selectedExpenseTotal !== selectedExpenseRecorded && (
          <div
            style={{
              background: visualIdentity.gradients.innerCard,
              border: "1px solid rgba(255,198,45,0.24)",
              borderRadius: 12,
              padding: 10,
              marginBottom: 10,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: HOME_UI.muted, fontSize: 11 }}>إجمالي المصروف</span>
              <b>{selectedExpenseTotal.toFixed(2)} {localeCurrencyLabel}</b>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: HOME_UI.muted, fontSize: 11 }}>من سقف الصرف</span>
              <b style={{ color: "#86efac" }}>
                {Number(selectedExpense.budgetCovered || 0).toFixed(2)} {localeCurrencyLabel}
              </b>
            </div>
            {selectedExpenseDebt > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: HOME_UI.muted, fontSize: 11 }}>سجل كدين</span>
                <b style={{ color: "#fecaca" }}>{selectedExpenseDebt.toFixed(2)} {localeCurrencyLabel}</b>
              </div>
            )}
            {selectedExpenseAsset > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: HOME_UI.muted, fontSize: 11 }}>ممَول من أصل</span>
                <b style={{ color: visualIdentity.colors.gold }}>{selectedExpenseAsset.toFixed(2)} {localeCurrencyLabel}</b>
              </div>
            )}
          </div>
        )}
        <div style={HOME_UI.row}>
          <span style={{ color: HOME_UI.muted }}>المبلغ</span>
          <b>{Number(selectedExpense.amount || 0).toFixed(2)} {localeCurrencyLabel}</b>
        </div>

        <div style={HOME_UI.row}>
          <span style={{ color: HOME_UI.muted }}>التصنيف</span>
          <b>{selectedExpense.category}</b>
        </div>

        <div style={HOME_UI.row}>
          <span style={{ color: HOME_UI.muted }}>اسلوب الدفع</span>
          <b>{selectedExpense.paymentMethod}</b>
        </div>

        <div style={HOME_UI.row}>
          <span style={{ color: HOME_UI.muted }}>المغطى من السقف</span>
          <b>{Number(selectedExpense.budgetCovered || 0).toFixed(2)} {localeCurrencyLabel}</b>
        </div>

        <div style={HOME_UI.lastRow}>
          <span style={{ color: HOME_UI.muted }}>التجاوز</span>
          <b style={{ color: Number(selectedExpense.overBudget || 0) > 0 ? visualIdentity.colors.red : visualIdentity.colors.white }}>
            {Number(selectedExpense.overBudget || 0).toFixed(2)} {localeCurrencyLabel}
          </b>
        </div>
        <button
  onClick={() => {
    cancelExpense(selectedExpense.id);
    setSelectedExpense(null);
  }}
  style={G.btn("rgba(255,100,100,0.14)", visualIdentity.colors.red, {
    width: "100%",
    marginTop: 10,
    border: "1px solid rgba(255,100,100,0.32)",
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
      ...HOME_UI.overlay,
      zIndex: 1100,
    }}
  >
    <div
      style={{
        ...HOME_UI.sheet,
        position: "relative",
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
          ...HOME_UI.sheetHeader,
        }}
      >
       <button
  type="button"
  onClick={() => setShowCategoryManager(false)}
  style={{
    width: 36,
    height: 36,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(255,255,255,0.08)",
    color: visualIdentity.colors.white,
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
    <div style={{ fontSize: 11, color: HOME_UI.muted }}>
      التصنيفات الإضافية
    </div>
  </div>
</div>
      </div>

<div
  style={{
    ...HOME_UI.innerCard,
    flex: 1,
    overflowY: "auto",
    marginBottom: 14,
  }}
>  {allExpenseCategories.filter((cat) => !cat.isOther).length === 0 ? (
    <div
      style={{
        textAlign: "center",
        color: HOME_UI.muted,
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
        <div key={catItem.id} style={HOME_UI.row}>
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
        color: visualIdentity.colors.gold,
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
      style={G.btn("rgba(255,255,255,0.08)", visualIdentity.colors.gold, {
        padding: "7px 10px",
        fontSize: 12,
        border: "1px solid rgba(255,198,45,0.30)",
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
  style={G.btn(visualIdentity.gradients.gold, visualIdentity.colors.navy, {
    width: "100%",
    marginTop: 10,
    borderRadius: 16,
  })}
>
  + إضافة نوع مصروف
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
  const assetTrendBars = assetTrendPoints.map((point, index) => {
    const height =
      assetTrendPoints.length === 1
        ? 54
        : 28 +
          ((Number(point.totalAssets || 0) - minAssetTrendValue) /
            assetTrendRange) *
            52;
    const previous = assetTrendPoints[index - 1];
    const pointChange = previous
      ? Number(point.totalAssets || 0) - Number(previous.totalAssets || 0)
      : 0;
    const color =
      index === 0
        ? "rgba(255,255,255,0.45)"
        : pointChange < 0
        ? "#F07A7A"
        : pointChange === bestAssetTrendChange && bestAssetTrendChange > 0
        ? "#60C698"
        : "#FFC62D";

    return {
      id: `${point.month}-${index}`,
      title: `${point.month}: ${Number(point.totalAssets || 0).toFixed(2)}`,
      height,
      color,
      label: String(point.month || "").slice(5, 7) || "--",
    };
  });
  const expenseReportRows = expenses.map((expense) => ({
    id: expense.id,
    expense,
    isIncome: expense.isIncomeEntry,
    amount: incomeEntryAmount(expense),
    meta: incomeEntryMeta(expense),
    title: expense.note || expense.category,
    category: expense.category,
    paymentMethod: expense.paymentMethod,
    categoryColor: expense.isIncomeEntry
      ? "#60C698"
      : CC[expense.category] || "rgba(255,255,255,0.72)",
  }));
  const assetDetailDisplayRows = assetDetailRows.map((asset) => ({
    ...asset,
    width: Math.max(
      8,
      (Math.abs(asset.change) / maxAssetDetailChange) * 100
    ),
    isSelected: selectedTrendAsset?.key === asset.key,
    color: asset.change >= 0 ? "#22c55e" : "#ef4444",
  }));

  return (
    <div style={G.scr}>
<ExpenseSummaryReportCard
        total={total}
        overBudgetTotal={overBudgetTotal}
        chartMode={expenseChartMode}
        onChartModeChange={setExpenseChartMode}
        onOpenOverBudget={() => setShowOverBudgetReport(true)}
      >
        <ExpenseDonut
          expenses={state.expenses}
          mode={expenseChartMode}
          categoryColors={CC}
        />
      </ExpenseSummaryReportCard>

<AssetTrendReportCard
        change={assetChange}
        changePct={assetChangePct}
        changeColor={assetChangeColor}
        currentAssets={Number(lastAssetPoint?.totalAssets || 0)}
        months={assetTrendMonths}
        bars={assetTrendBars}
        detailsOpen={showAssetTrendDetails}
        onToggleDetails={() => setShowAssetTrendDetails((value) => !value)}
        onMonthsChange={setAssetTrendMonths}
      />

<ExpenseReportLauncher onOpen={() => setShowExpenseReport(true)} />

<ExpenseReportModal
        open={showExpenseReport}
        rows={expenseReportRows}
        selectedExpense={selectedExpense}
        selectedTotal={selectedExpenseTotal}
        selectedRecorded={selectedExpenseRecorded}
        selectedDebt={selectedExpenseDebt}
        selectedAsset={selectedExpenseAsset}
        onClose={() => setShowExpenseReport(false)}
        onSelect={(expense) => {
          setShowExpenseReport(false);
          setSelectedExpense(expense);
        }}
        onCloseSelected={() => setSelectedExpense(null)}
      />

<OverBudgetReportModal
        open={showOverBudgetReport}
        total={overBudgetTotal}
        items={overBudgetItems}
        onClose={() => setShowOverBudgetReport(false)}
      />

<AssetTrendDetailsModal
        open={showAssetTrendDetails}
        months={assetTrendMonths}
        rows={assetDetailDisplayRows}
        selectedAsset={selectedTrendAsset}
        onSelect={setSelectedTrendAssetKey}
        onClose={() => setShowAssetTrendDetails(false)}
      />
    </div>
  );
}

function AssetsScreen({ state, setState, onAddExtraCash, readOnly = false }) {
  const assets = calcAssets(state);
  const currencyLabel = getCurrencyLabel(state);

  const [showAddAsset, setShowAddAsset] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);

  const [fromAsset, setFromAsset] = useState("cash");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferSourceUnits, setTransferSourceUnits] = useState("");
  const [transferSourcePrice, setTransferSourcePrice] = useState("");
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
  const selectedTransferSource = sources.find((source) => source.key === fromAsset);
  const transferSourceNeedsSale = Boolean(
    selectedTransferSource &&
      !["cash", "bank"].includes(selectedTransferSource.type) &&
      (selectedTransferSource.type !== "custom" ||
        (state.assets.custom || []).some(
          (item) =>
            `custom:${item.id}` === selectedTransferSource.key && item.type === "unit"
        ))
  );

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

    if (transferSourceNeedsSale) {
      const row = transferAllocations[0];
      if (!row || !["cash", "bank"].includes(row.allocation)) {
        alert("اختر الكاش الادخاري أو حساباً بنكياً لاستلام حصيلة البيع");
        return;
      }

      let destinationKey = "cash";
      if (row.allocation === "bank") {
        if (!row.targetId) {
          alert("اختر الحساب البنكي المستلم");
          return;
        }
        destinationKey = `bank:${row.targetId}`;
      }

      const result = liquidateAssetUnits(
        state,
        fromAsset,
        destinationKey,
        transferSourceUnits,
        transferSourcePrice
      );
      if (!result.success) {
        alert(result.message);
        return;
      }

      setState(result.nextState);
      setShowTransfer(false);
      setTransferAmount("");
      setTransferSourceUnits("");
      setTransferSourcePrice("");
      setTransferAllocations([
        { id: 1, allocation: "cash", amount: "", targetId: "", assetName: "", units: "", price: "" },
      ]);
      return;
    }

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

  const changeTransferSource = (value) => {
    const source = sources.find((item) => item.key === value);
    const needsSale = Boolean(
      source &&
        !["cash", "bank"].includes(source.type) &&
        (source.type !== "custom" ||
          (state.assets.custom || []).some(
            (item) => `custom:${item.id}` === source.key && item.type === "unit"
          ))
    );
    setFromAsset(value);
    setTransferSourceUnits("");
    setTransferSourcePrice("");
    setTransferAmount("");
    if (needsSale) {
      setTransferAllocations([
        { id: 1, allocation: "cash", amount: "", targetId: "", assetName: "", units: "", price: "" },
      ]);
    }
  };

  const updateTransferSaleField = (field, value) => {
    const nextUnits = field === "units" ? value : transferSourceUnits;
    const nextPrice = field === "price" ? value : transferSourcePrice;
    if (field === "units") setTransferSourceUnits(value);
    if (field === "price") setTransferSourcePrice(value);
    const saleAmount = Number(nextUnits || 0) * Number(nextPrice || 0);
    const amountValue = saleAmount > 0 ? saleAmount.toFixed(2) : "";
    setTransferAmount(amountValue);
    setTransferAllocations((rows) =>
      rows.map((row) => ({ ...row, amount: amountValue }))
    );
  };

  const cashAssetRows = [
    {
      id: "cash",
      assetKey: "cash",
      assetKind: "cash",
      name: "ادخار نقدي",
      value: Number(state.assets.cash || 0),
      nameStyle: { color: visualIdentity.colors.textSecondary, fontSize: 12 },
    },
  ];
  const bankAssetRows = (state.assets.banks || []).map((bank) => ({
    id: bank.id,
    name: bank.name,
    value: Number(bank.balance || 0),
  }));
  const stockAssetRows = (state.assets.stocks || []).map((stock) => ({
    id: stock.id,
    name: stock.name,
    value: Number(stock.units || 0) * Number(stock.currentPrice || 0),
    meta: `${Number(stock.units || 0).toFixed(4)} سهم · سعر ${Number(
      stock.currentPrice || 0
    ).toFixed(4)} · متوسط ${Number(stock.wac || 0).toFixed(4)}`,
  }));
  const goldAssetRows = (state.assets.gold || []).map((gold) => ({
    id: gold.id,
    name: gold.label,
    value: Number(gold.units || 0) * goldPrice,
    meta: `${Number(gold.units || 0).toFixed(4)} غ · متوسط ${Number(
      gold.wac || 0
    ).toFixed(4)}`,
    metaColor: visualIdentity.colors.textSecondary,
    metaWeight: 700,
  }));
  const silverAssetRows = (state.assets.silver || []).map((silver) => ({
    id: silver.id,
    name: silver.label,
    value: Number(silver.units || 0) * silverPrice,
    meta: `${Number(silver.units || 0).toFixed(4)} غ · سعر ${silverPrice.toFixed(
      4
    )} · متوسط ${Number(silver.wac || 0).toFixed(4)}`,
  }));
  const customAssetRows = (state.assets.custom || []).map((asset) => ({
    id: asset.id,
    name: asset.name,
    value:
      asset.type === "fixed"
        ? Number(asset.amount || 0)
        : Number(asset.units || 0) * Number(asset.price || 0),
    meta:
      asset.type === "unit"
        ? `${Number(asset.units || 0).toFixed(4)} وحدة · سعر ${Number(
            asset.price || 0
          ).toFixed(4)}`
        : "",
  }));

  const percentChange = (value, cost) =>
    Number(cost || 0) > 0
      ? ((Number(value || 0) - Number(cost || 0)) / Number(cost || 0)) * 100
      : 0;
  const goldCost = (state.assets.gold || []).reduce(
    (sum, item) => sum + Number(item.units || 0) * Number(item.wac || 0),
    0
  );
  const summaryItems = [
    { key: "cash", label: "كاش", icon: "cash", value: Number(state.assets.cash || 0), change: 0, color: visualIdentity.colors.green },
    { key: "banks", label: "بنوك", icon: "bank", value: bankTotal, change: 0, color: visualIdentity.colors.sky },
    { key: "gold", label: "ذهب", icon: "gold", value: goldTotal, change: percentChange(goldTotal, goldCost), color: "#FFC62D" },
    { key: "stocks", label: "أسهم", icon: "stock", value: stockTotal, change: percentChange(stockTotal, stockCostTotal), color: visualIdentity.colors.purple },
    { key: "other", label: "بضائع/أخرى", icon: "goods", value: customTotal, change: 0, color: visualIdentity.colors.coral },
  ];
  const dashboardRows = [
    {
      id: "cash",
      name: "الكاش الادخاري",
      value: Number(state.assets.cash || 0),
      change: 0,
      icon: "cash",
      color: visualIdentity.colors.green,
      meta: "رصيد سائل متاح",
    },
    ...(state.assets.banks || []).map((item) => ({
      id: `bank-${item.id}`,
      assetKey: `bank:${item.id}`,
      assetKind: "bank",
      assetId: item.id,
      name: item.name,
      value: Number(item.balance || 0),
      change: 0,
      icon: "bank",
      color: visualIdentity.colors.sky,
      meta: "حساب بنكي",
    })),
    ...(state.assets.gold || []).map((item) => ({
      id: `gold-${item.id}`,
      assetKey: `gold:${item.id}`,
      assetKind: "gold",
      assetId: item.id,
      name: item.label,
      value: Number(item.units || 0) * goldPrice,
      change: percentChange(goldPrice, item.wac),
      icon: "gold",
      color: "#FFC62D",
      meta: `${Number(item.units || 0).toFixed(4)} غرام · سعر ${goldPrice.toFixed(2)}`,
    })),
    ...(state.assets.stocks || []).map((item) => ({
      id: `stock-${item.id}`,
      assetKey: `stock:${item.id}`,
      assetKind: "stocks",
      assetId: item.id,
      name: item.name,
      value: Number(item.units || 0) * Number(item.currentPrice || 0),
      change: percentChange(item.currentPrice, item.wac),
      icon: "stock",
      color: visualIdentity.colors.purple,
      meta: `${Number(item.units || 0).toFixed(4)} سهم · سعر ${Number(item.currentPrice || 0).toFixed(2)}`,
    })),
    ...(state.assets.silver || []).map((item) => ({
      id: `silver-${item.id}`,
      assetKey: `silver:${item.id}`,
      assetKind: "silver",
      assetId: item.id,
      name: item.label,
      value: Number(item.units || 0) * silverPrice,
      change: percentChange(silverPrice, item.wac),
      icon: "silver",
      color: "#B7D3EA",
      meta: `${Number(item.units || 0).toFixed(4)} غرام · سعر ${silverPrice.toFixed(2)}`,
    })),
    ...(state.assets.custom || []).map((item) => ({
      id: `custom-${item.id}`,
      assetKey: `custom:${item.id}`,
      assetKind: "custom",
      assetId: item.id,
      name: item.name,
      value: item.type === "fixed"
        ? Number(item.amount || 0)
        : Number(item.units || 0) * Number(item.price || 0),
      change: 0,
      icon: item.type === "fixed" ? "fixed" : "goods",
      color: "#42CFE6",
      meta: item.type === "unit"
        ? `${Number(item.units || 0).toFixed(4)} وحدة · سعر ${Number(item.price || 0).toFixed(2)}`
        : "أصل ثابت",
    })),
  ];
  const movementLabels = {
    asset_units_liquidated: "تسييل وحدات من الأصل",
    transfer_out: "مناقلة صادرة",
    transfer_to_cash: "مناقلة إلى الكاش الادخاري",
    transfer_to_bank: "مناقلة إلى الحساب البنكي",
    transfer_in_units: "إضافة وحدات بالمناقلة",
    opening_balance: "رصيد افتتاحي",
    opening_asset: "إضافة أصل افتتاحي",
    extra_cash: "دخل إضافي",
  };
  const movementRows = (row) =>
    (state.assetHistory || [])
      .filter((movement) => {
        const directKeyMatch = [
          movement.assetKey,
          movement.destinationKey,
          movement.from,
          movement.to,
        ].includes(row.assetKey);
        const idMatch =
          row.assetId != null &&
          String(movement.assetId ?? "") === String(row.assetId) &&
          (!movement.assetKind || movement.assetKind === row.assetKind);
        const cashMatch =
          row.assetKey === "cash" && movement.assetKind === "cash";
        const nameMatch =
          row.name &&
          [movement.assetName, movement.name].some(
            (name) => String(name || "").trim() === String(row.name).trim()
          );
        return directKeyMatch || idMatch || cashMatch || nameMatch;
      })
      .map((movement, index) => {
        const isOutgoing =
          movement.assetKey === row.assetKey ||
          movement.from === row.assetKey ||
          ["transfer_out", "asset_units_liquidated"].includes(movement.type) &&
            movement.destinationKey !== row.assetKey;
        const date = movement.date ? new Date(movement.date) : null;
        return {
          id: `${movement.id ?? index}-${row.id}`,
          label: movementLabels[movement.type] || movement.note || "حركة على الأصل",
          amount: Number(movement.amount || 0),
          direction: isOutgoing ? "out" : "in",
          date:
            date && !Number.isNaN(date.getTime())
              ? date.toLocaleDateString("en-GB")
              : "—",
          sortDate: date?.getTime() || 0,
        };
      })
      .sort((a, b) => b.sortDate - a.sortDate);
  const dashboardRowsWithMovements = dashboardRows.map((row) => ({
    ...row,
    movements: movementRows(row),
  }));
  const otherTotal = silverTotal + customTotal;
  const distributionBase = [
    { key: "cash", label: "كاش", value: Number(state.assets.cash || 0), color: "#55E892" },
    { key: "banks", label: "بنوك", value: bankTotal, color: "#35AEEF" },
    { key: "gold", label: "ذهب", value: goldTotal, color: "#FFC62D" },
    { key: "stocks", label: "أسهم", value: stockTotal, color: "#9A72F5" },
    { key: "other", label: "أخرى", value: otherTotal, color: "#3B91A9" },
  ].filter((item) => item.value > 0);
  const distributionTotal = distributionBase.reduce((sum, item) => sum + item.value, 0);
  const distribution = distributionBase.map((item) => ({
    ...item,
    percent: distributionTotal > 0 ? (item.value / distributionTotal) * 100 : 0,
  }));
  const trendPoints = distributionBase.reduce(
    (points, item) => [
      ...points,
      { value: Number((points[points.length - 1].value + item.value).toFixed(2)) },
    ],
    [{ value: 0 }]
  );
  const showLegacyAssetsLayout = false;

  return (
    <div
      className="assets-screen"
      style={{
        ...G.scr,
        minHeight: "calc(100vh - 118px)",
        background: visualIdentity.gradients.appBackground,
        "--ambient-beam-color": visualIdentity.lighting.ambientBeam,
        "--ambient-light-duration": visualIdentity.motion.ambientLightDuration,
      }}
    >
      <AssetsDashboard
        totalAssets={assets.totalAssets}
        summaryItems={summaryItems}
        assetRows={dashboardRowsWithMovements}
        distribution={distribution}
        trendPoints={trendPoints}
        onAddIncome={onAddExtraCash}
        onTransfer={() => setShowTransfer(true)}
        readOnly={readOnly}
        currencyLabel={currencyLabel}
      />

      {showLegacyAssetsLayout && (
        <>
      {!readOnly && (
        <AssetsToolbar
          onAddIncome={onAddExtraCash}
          onTransfer={() => setShowTransfer(true)}
          transferIcon={ICONS.transfer}
        />
      )}

      <AssetsSummaryCard
        totalAssets={assets.totalAssets}
        liquidSavings={Number(state.assets.cash || 0) + bankTotal}
        netWorth={assets.netWorth}
        cardStyle={G.card("rgba(201,168,76,0.14)")}
        liquidCardStyle={summaryCard("success")}
        liquidValueStyle={summaryValue("success")}
        netCardStyle={summaryCard("total")}
        netValueStyle={summaryValue("total")}
      />

      <AssetSectionCard
        icon={ICONS.cash}
        title="الكاش الاحتياطي"
        total={Number(state.assets.cash || 0)}
        color={visualIdentity.colors.green}
        isOpen={openAssetCard === "cash"}
        readOnly={readOnly}
        onAdd={openAddAsset}
        onToggle={() => setOpenAssetCard(openAssetCard === "cash" ? "" : "cash")}
      >
        {openAssetCard === "cash" && (
          <AssetDetailsList
            rows={cashAssetRows}
            rowStyle={G.row}
            lastRowStyle={G.lrow}
          />
        )}
      </AssetSectionCard>

      <AssetSectionCard
        icon={ICONS.bank}
        title="الحسابات البنكية"
        total={bankTotal}
        color={visualIdentity.colors.cyan}
        isOpen={openAssetCard === "banks"}
        readOnly={readOnly}
        onAdd={openAddAsset}
        onToggle={() => setOpenAssetCard(openAssetCard === "banks" ? "" : "banks")}
      >
        {openAssetCard === "banks" && (
          <AssetDetailsList
            rows={bankAssetRows}
            emptyText="لا توجد حسابات"
            rowStyle={G.row}
            lastRowStyle={G.lrow}
          />
        )}
      </AssetSectionCard>

      <AssetSectionCard
        icon={ICONS.stock}
        title="الأسهم"
        total={stockTotal}
        color="#B48CFF"
        isOpen={openAssetCard === "stocks"}
        readOnly={readOnly}
        onAdd={openAddAsset}
        onToggle={() => setOpenAssetCard(openAssetCard === "stocks" ? "" : "stocks")}
      >
        <div style={{ fontSize: 10, color: visualIdentity.colors.textSecondary, textAlign: "right", marginTop: 6 }}>
          {stockUnitsTotal.toFixed(4)} سهم · متوسط {stockAverageCost.toFixed(4)}
        </div>
        {openAssetCard === "stocks" && (
          <AssetDetailsList
            rows={stockAssetRows}
            emptyText="لا توجد أسهم"
            rowStyle={G.row}
            lastRowStyle={G.lrow}
          />
        )}
      </AssetSectionCard>

      <AssetSectionCard
        icon={ICONS.gold}
        title="الذهب"
        total={goldTotal}
        color={visualIdentity.colors.gold}
        isOpen={openAssetCard === "gold"}
        readOnly={readOnly}
        onAdd={openAddAsset}
        onToggle={() => setOpenAssetCard(openAssetCard === "gold" ? "" : "gold")}
      >
        {openAssetCard === "gold" && (
          <AssetDetailsList
            rows={goldAssetRows}
            emptyText="لا يوجد ذهب"
            rowStyle={G.row}
            lastRowStyle={G.lrow}
          />
        )}
      </AssetSectionCard>

      <AssetSectionCard
        icon={ICONS.silver}
        title="الفضة"
        total={silverTotal}
        color={visualIdentity.colors.textSecondary}
        isOpen={openAssetCard === "silver"}
        readOnly={readOnly}
        onAdd={openAddAsset}
        onToggle={() => setOpenAssetCard(openAssetCard === "silver" ? "" : "silver")}
      >
        {openAssetCard === "silver" && (
          <AssetDetailsList
            rows={silverAssetRows}
            emptyText="لا توجد فضة"
            rowStyle={G.row}
            lastRowStyle={G.lrow}
          />
        )}
      </AssetSectionCard>

      <AssetSectionCard
        icon={ICONS.goods}
        title="بضائع / أخرى"
        total={customTotal}
        color={visualIdentity.colors.cyan}
        isOpen={openAssetCard === "custom"}
        readOnly={readOnly}
        onAdd={openAddAsset}
        onToggle={() => setOpenAssetCard(openAssetCard === "custom" ? "" : "custom")}
      >
        {openAssetCard === "custom" && (
          <AssetDetailsList
            rows={customAssetRows}
            emptyText="لا توجد بضائع"
            rowStyle={G.row}
            lastRowStyle={G.lrow}
          />
        )}
      </AssetSectionCard>

        </>
      )}

<AddAssetModal
        open={showAddAsset}
        kind={assetKind}
        name={assetName}
        amount={assetAmount}
        units={assetUnits}
        price={assetPrice}
        onClose={() => setShowAddAsset(false)}
        onKindChange={setAssetKind}
        onNameChange={setAssetName}
        onAmountChange={setAssetAmount}
        onUnitsChange={setAssetUnits}
        onPriceChange={setAssetPrice}
        onSubmit={addNewAsset}
        inputStyle={G.inp()}
        closeButtonStyle={G.btn("rgba(255,255,255,0.08)", visualIdentity.colors.gold, {
          padding: "5px 12px",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.16)",
        })}
        submitButtonStyle={G.btn(
          visualIdentity.gradients.gold,
          visualIdentity.colors.navy,
          { width: "100%" }
        )}
      />

<AssetTransferModal
        open={showTransfer}
        sources={sources}
        fromAsset={fromAsset}
        amount={transferAmount}
        allocations={transferAllocations}
        onClose={() => {
          setShowTransfer(false);
          setTransferAmount("");
          setTransferSourceUnits("");
          setTransferSourcePrice("");
          setTransferAllocations([
            { id: 1, allocation: "cash", amount: "", targetId: "", assetName: "", units: "", price: "" },
          ]);
        }}
        onFromAssetChange={changeTransferSource}
        onAmountChange={setTransferAmount}
        onAddRow={addTransferAllocationRow}
        onRemoveRow={removeTransferAllocationRow}
        onUpdateRow={updateTransferAllocation}
        getDestinationOptions={transferDestinationOptions}
        onSubmit={applyTransfer}
        sourceSaleFields={
          transferSourceNeedsSale
            ? { units: transferSourceUnits, price: transferSourcePrice }
            : null
        }
        onSourceUnitsChange={(value) => updateTransferSaleField("units", value)}
        onSourcePriceChange={(value) => updateTransferSaleField("price", value)}
        amountReadOnly={transferSourceNeedsSale}
        allowMultiple={!transferSourceNeedsSale}
        allowedAllocations={transferSourceNeedsSale ? ["cash", "bank"] : undefined}
        allowNewTarget={!transferSourceNeedsSale}
        inputStyle={G.inp()}
        closeButtonStyle={G.btn("rgba(255,255,255,0.08)", visualIdentity.colors.gold, {
          padding: "5px 12px",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.16)",
        })}
        addButtonStyle={G.btn("rgba(255,255,255,0.08)", visualIdentity.colors.gold, {
          padding: "7px 10px",
          fontSize: 12,
          border: "1px solid rgba(255,255,255,0.16)",
        })}
        removeButtonStyle={G.iconBtn(false, visualIdentity.colors.red)}
        submitButtonStyle={G.btn(
          visualIdentity.gradients.gold,
          visualIdentity.colors.navy,
          { width: "100%" }
        )}
      />
    </div>
  );
}

function LiabilitiesScreen({ state, setState, focusDueOnly = false }) {
  const { currencyLabel, t } = useLocale();
  const [showStructuralDetails, setShowStructuralDetails] = useState(false);
const [showCurrentDetails, setShowCurrentDetails] = useState(focusDueOnly);

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

const currentDebtTotal = pendingCurrent.reduce(
  (sum, l) => sum + getCurrentDebtBalance(l),
  0
);
const [openCurrentId, setOpenCurrentId] = useState(null);
const [liabilityAssetKey, setLiabilityAssetKey] = useState("cash");

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
            paymentMethod: "cap_liability",
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
  const structuralDisplayRows = structuralList.map((item) => ({
    id: item.id,
    name: item.name,
    dueDay: item.dueDay,
    amount: getStructuralAmount(item),
  }));
  const remainingSpendingCap = Math.max(
    0,
    Number(state.session?.spendingCap || 0) -
      Number(state.session?.coveredSpent || 0)
  );
  const currentLiabilityDisplayRows = sortedCurrent.map((item) => {
    const amount = getLiabilityAmount(item);
    const covered = getCoveredAmount(item);
    const uncovered = getUncoveredAmount(item);
    const isCard = item.type === "card";
    const creditLimit = Number(item.creditLimit || 0);
    const availableCredit = Math.max(
      0,
      creditLimit - Number(item.balance || 0)
    );

    return {
      item,
      amount,
      covered,
      uncovered,
      coveragePct:
        amount > 0 ? Math.min(100, (covered / amount) * 100) : 0,
      isCard,
      isOpen: openCurrentId === item.id,
      icon: isCard ? "💳" : item.type === "over_budget" ? "⚠" : "🧾",
      name: isCard
        ? item.name || "بطاقة ائتمانية"
        : item.name || "دائن",
      subtitle: isCard
        ? `السقف: ${creditLimit.toFixed(2)} · المستخدم: ${Number(
            item.balance || 0
          ).toFixed(2)} · المتاح: ${availableCredit.toFixed(2)}`
        : "اسم الدائن",
      typeLabel: getTypeLabel(item),
      dueText: getDueText(item),
      canPayFromCap:
        amount > 0 &&
        remainingSpendingCap + Math.min(covered, amount) >= amount,
      postponeParts: getPostponeParts(item),
    };
  });

  return (
    <div
      className="liabilities-screen"
      style={{
        ...G.scr,
        minHeight: "calc(100vh - 118px)",
        background: visualIdentity.gradients.appBackground,
        "--ambient-beam-color": visualIdentity.lighting.ambientBeam,
        "--ambient-light-duration": visualIdentity.motion.ambientLightDuration,
        "--card-sheen-color": visualIdentity.lighting.cardSheen,
        "--card-hover-border": visualIdentity.lighting.hoverBorder,
        "--card-hover-glow": visualIdentity.lighting.hoverGlow,
        "--card-sheen-duration": visualIdentity.motion.cardSheenDuration,
        "--effect-hover-duration": visualIdentity.motion.hoverDuration,
      }}
    >
      <header style={{ marginBottom: 14 }}>
        <h1 style={{ margin: 0, color: visualIdentity.colors.white, fontSize: 27, fontWeight: 900 }}>{t("nav.liabilities")}</h1>
        <div style={{ marginTop: 3, color: visualIdentity.colors.textSecondary, fontSize: 11 }}>إدارة الالتزامات ومتابعة التغطية والاستحقاقات</div>
      </header>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginBottom: 13 }}>
        <div className="asset-dashboard-card" style={{ padding: 11, borderRadius: 16, border: `1px solid ${visualIdentity.semantic.warning}66`, background: `linear-gradient(145deg, ${visualIdentity.semantic.warning}1F, rgba(29,76,132,0.92))`, textAlign: "center", color: visualIdentity.colors.white }}>
          <div style={{ color: visualIdentity.colors.textSecondary, fontSize: 9 }}>{t("liabilities.fixed")}</div>
          <b style={{ display: "block", marginTop: 4, color: visualIdentity.semantic.warning, fontSize: 17 }}>{structuralTotal.toFixed(2)} <small style={{ fontSize: 9 }}>{currencyLabel}</small></b>
        </div>
        <div className="asset-dashboard-card" style={{ padding: 11, borderRadius: 16, border: `1px solid ${visualIdentity.semantic.danger}66`, background: `linear-gradient(145deg, ${visualIdentity.semantic.danger}1F, rgba(29,76,132,0.92))`, textAlign: "center", color: visualIdentity.colors.white }}>
          <div style={{ color: visualIdentity.colors.textSecondary, fontSize: 9 }}>{t("liabilities.cards")}</div>
          <b style={{ display: "block", marginTop: 4, color: visualIdentity.semantic.danger, fontSize: 17 }}>{currentDebtTotal.toFixed(2)} <small style={{ fontSize: 9 }}>{currencyLabel}</small></b>
        </div>
      </div>
<StructuralLiabilitiesCard
        total={structuralTotal}
        rows={structuralDisplayRows}
        open={showStructuralDetails}
        onToggle={() => setShowStructuralDetails((value) => !value)}
      />

<CurrentLiabilitiesCard
        total={currentDebtTotal}
        coveredTotal={coveredCurrentTotal}
        uncoveredTotal={uncoveredCurrentTotal}
        rows={currentLiabilityDisplayRows}
        open={showCurrentDetails}
        assetKey={liabilityAssetKey}
        assetSources={liabilityAssetSources}
        onToggleDetails={() => setShowCurrentDetails((value) => !value)}
        onAssetKeyChange={setLiabilityAssetKey}
        onToggleItem={(itemId) =>
          setOpenCurrentId(openCurrentId === itemId ? null : itemId)
        }
        onPayReserved={payCurrentFromReserved}
        onPayFromCap={payCurrentFromCap}
        onToggleAssets={(item) =>
          updateCurrentPaymentMethod(
            item,
            item.paymentMethod === "assets" ? "" : "assets"
          )
        }
        onTogglePostpone={(item) =>
          updateCurrentPaymentMethod(
            item,
            item.paymentMethod === "postpone" ? "" : "postpone"
          )
        }
        onPayFromAsset={payCurrentFromAsset}
        onPostponePart={setPostponePart}
        onConfirmPostpone={confirmPostponeDate}
        inputStyle={G.inp()}
        iconButtonStyle={G.iconBtn}
        confirmAssetButtonStyle={G.btn(
          "rgba(255,209,43,0.14)",
          visualIdentity.semantic.warning,
          { width: "100%", padding: "9px" }
        )}
      />
    </div>
  );
}

function SettingsScreen({ state, setState, authSession, onResetAllData }) {
  const { t } = useLocale();
  const [settingsView, setSettingsView] = useState("menu");
  const currencyLabel = getCurrencyLabel(state);
  const structuralTotal = calcStructuralTotal(state);
const salary = Number(state.settings?.salary || 0);
const maxSpendingCap = Math.max(0, salary - structuralTotal);
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
      const keys = path.split(".");
      let ref = copy;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!ref[keys[i]] || typeof ref[keys[i]] !== "object") ref[keys[i]] = {};
        ref = ref[keys[i]];
      }
      ref[keys[keys.length - 1]] = value;
      return copy;
    });
  };
  const [structuralName, setStructuralName] = useState("");
const [structuralMonthly, setStructuralMonthly] = useState("");
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
const openNewSettingsCard = () => {
  setSettingsSelectedCardId("");
  setSettingsCardName("");
  setSettingsCardLimit("");
  setSettingsCardBalance("");
  setSettingsCardDueDay("");
  setSettingsSectionsOpen((prev) => ({ ...prev, cards: true }));
  setSettingsCardMode(settingsCardMode === "add" ? "" : "add");
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

const openingBalanceRows = [
  ...(state.assets.banks || []).map((bank) => ({
    key: `bank-${bank.id}`,
    kind: "bank",
    group: "banks",
    id: bank.id,
    total: Number(bank.balance || 0),
    price: 1,
    priceField: "balance",
    unitLabel: currencyLabel,
    units: Number(bank.balance || 0),
    unitsField: "balance",
    name: bank.name || "",
    nameField: "name",
    namePlaceholder: "اسم البنك",
  })),
  ...[
    ...(state.assets.gold || []).map((item) => ({
      item,
      keyPrefix: "gold",
      group: "gold",
      nameField: "label",
      unitLabel: "غم",
      priceField: "wac",
      namePlaceholder: "العيار",
    })),
    ...(state.assets.silver || []).map((item) => ({
      item,
      keyPrefix: "silver",
      group: "silver",
      nameField: "label",
      unitLabel: "غم",
      priceField: "wac",
      namePlaceholder: "فضة",
    })),
    ...(state.assets.stocks || []).map((item) => ({
      item,
      keyPrefix: "stock",
      group: "stocks",
      nameField: "name",
      unitLabel: "سهم",
      priceField: "wac",
      namePlaceholder: "السهم",
    })),
    ...(state.assets.custom || [])
      .filter((item) => item.type === "unit")
      .map((item) => ({
        item,
        keyPrefix: "custom",
        group: "custom",
        nameField: "name",
        unitLabel: "وحدة",
        priceField: "price",
        namePlaceholder: "الأصل",
      })),
  ].map((row) => {
    const units = Number(row.item.units || 0);
    const price = Number(row.item[row.priceField] || 0);
    return {
      key: `${row.keyPrefix}-${row.item.id}`,
      kind: "unit",
      group: row.group,
      id: row.item.id,
      total: units * price,
      price,
      priceField: row.priceField,
      unitLabel: row.unitLabel,
      units,
      unitsField: "units",
      name: row.item[row.nameField] || "",
      nameField: row.nameField,
      namePlaceholder: row.namePlaceholder,
    };
  }),
];

  const currentLiabilitiesTotal = calcAssets(state).currentLiabilities;
  const profileName = state.settings?.profile?.name || "مستخدم التطبيق";
  const profileSubtitle =
    state.settings?.profile?.email || "مدير الثروة الذكي · الأردن";
  const netSalary = Math.max(0, salary - structuralTotal);
  const settingsPageMeta = {
    salary: [t("settings.incomeLimit"), ""],
    cards: [t("liabilities.cards"), ""],
    opening: [t("settings.openingBalances"), ""],
    personal: [t("settings.profile"), ""],
    account: [t("settings.account"), t("settings.security")],
    notifications: [t("settings.notifications"), ""],
    locale: [t("settings.locale"), ""],
    export: [t("settings.export"), ""],
    reset: [t("settings.reset"), ""],
    share: [t("settings.share"), ""],
    about: [t("settings.about"), ""],
  };
  const openSettingsView = (view) => {
    if (view === "cards") {
      setSettingsSectionsOpen((prev) => ({ ...prev, cards: true, structural: true }));
    }
    if (view === "opening") {
      setSettingsSectionsOpen((prev) => ({ ...prev, opening: true }));
    }
    setSettingsView(view);
  };
  const exportSettingsData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `wealth-tracker-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const shareApplication = async () => {
    const shareData = { title: "مدير الثروة الذكي", url: window.location.href };
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }
    await navigator.clipboard.writeText(window.location.href);
    alert("تم نسخ رابط التطبيق");
  };
  const changeAccountPassword = async ({ currentPassword, newPassword }) => {
    const email = authSession?.user?.email;
    if (!email || !authSession?.access_token) {
      throw new Error("جلسة تسجيل الدخول غير متاحة");
    }
    try {
      const verifiedSession = await signInWithPassword(email, currentPassword);
      await updatePassword(
        verifiedSession.access_token || authSession.access_token,
        newPassword
      );
    } catch (passwordError) {
      throw new Error(authErrorMessage(passwordError), { cause: passwordError });
    }
  };
  const settingsPanelStyle = {
    ...G.card(),
    background: visualIdentity.gradients.outerCard,
    border: visualIdentity.cards.outer.border,
    boxShadow: visualIdentity.cards.outer.boxShadow,
    color: visualIdentity.colors.white,
  };

  if (settingsView === "menu") {
    return (
      <div className="settings-screen" style={{ ...G.scr, minHeight: "calc(100vh - 118px)" }}>
        <SettingsDashboard
          profileName={profileName}
          profileSubtitle={profileSubtitle}
          salary={salary}
          structuralTotal={structuralTotal}
          netSalary={netSalary}
          cardsTotal={currentLiabilitiesTotal}
          snapshotsCount={(state.monthlySnapshots || []).length}
          currencyLabel={currencyLabel}
          onNavigate={openSettingsView}
        />
      </div>
    );
  }

  return (
    <div className="settings-screen" style={{ ...G.scr, minHeight: "calc(100vh - 118px)" }}>
      <SettingsSubpageShell
        title={settingsPageMeta[settingsView]?.[0] || t("nav.settings")}
        subtitle={settingsPageMeta[settingsView]?.[1] || ""}
        onBack={() => setSettingsView("menu")}
      >
      {["salary", "cards"].includes(settingsView) && <div className="asset-dashboard-card" style={settingsPanelStyle}>
      {settingsView === "salary" && <>
<SalaryCapSettingsSection
          salary={state.settings.salary}
          spendingCap={state.session.spendingCap}
          maxSpendingCap={maxSpendingCap}
          onSalaryChange={(value) => updateSetting("settings.salary", value)}
          onSpendingCapChange={(value) => {
            if (value > maxSpendingCap) {
              alert("سقف الصرف لا يجوز أن يتجاوز صافي الراتب بعد الالتزامات الهيكلية");
              return;
            }

            setState({
              ...state,
              session: { ...state.session, spendingCap: value },
            });
          }}
          inputStyle={G.inp()}
        />

      </>}

      {settingsView === "cards" && <>
<CreditCardsSettingsSection
          open={settingsSectionsOpen.cards}
          cards={creditCards}
          mode={settingsCardMode}
          selectedCardId={settingsSelectedCardId}
          name={settingsCardName}
          limit={settingsCardLimit}
          balance={settingsCardBalance}
          dueDay={settingsCardDueDay}
          onToggle={() =>
            setSettingsSectionsOpen((prev) => ({ ...prev, cards: !prev.cards }))
          }
          onAdd={openNewSettingsCard}
          onEdit={prepareSettingsCardEdit}
          onPrepareDelete={(cardId) => {
            setSettingsSelectedCardId(cardId);
            setSettingsCardMode("delete");
          }}
          onCancel={() => {
            setSettingsSelectedCardId("");
            setSettingsCardName("");
            setSettingsCardLimit("");
            setSettingsCardBalance("");
            setSettingsCardDueDay("");
            setSettingsCardMode("");
          }}
          onNameChange={setSettingsCardName}
          onLimitChange={setSettingsCardLimit}
          onBalanceChange={setSettingsCardBalance}
          onDueDayChange={setSettingsCardDueDay}
          onSelectedCardChange={setSettingsSelectedCardId}
          onSave={
            settingsCardMode === "edit"
              ? saveSettingsCreditCardEdit
              : addSettingsCreditCard
          }
          onDelete={deleteSettingsCreditCard}
          inputStyle={G.inp()}
        />
<StructuralLiabilitiesSettingsSection
          open={settingsSectionsOpen.structural}
          items={structuralList}
          showForm={showStructuralForm}
          name={structuralName}
          monthly={structuralMonthly}
          onToggle={() =>
            setSettingsSectionsOpen((prev) => ({
              ...prev,
              structural: !prev.structural,
            }))
          }
          onToggleForm={() => {
            setSettingsSectionsOpen((prev) => ({ ...prev, structural: true }));
            setShowStructuralForm((value) => !value);
          }}
          onDelete={deleteStructuralLiability}
          onUpdate={updateStructuralLiability}
          onCloseForm={() => setShowStructuralForm(false)}
          onNameChange={setStructuralName}
          onMonthlyChange={setStructuralMonthly}
          onSave={addStructuralLiability}
          inputStyle={G.inp()}
        />
      </>}
      </div>
      }

      {settingsView === "opening" && <>
<OpeningBalancesSettingsSection
        open={settingsSectionsOpen.opening}
        snapshotsCount={(state.monthlySnapshots || []).length}
        onToggle={() =>
          setSettingsSectionsOpen((prev) => ({
            ...prev,
            opening: !prev.opening,
          }))
        }
        onToggleForm={() => {
          setSettingsSectionsOpen((prev) => ({ ...prev, opening: true }));
          setShowOpeningAssetForm((value) => !value);
        }}
        cardStyle={settingsPanelStyle}
      >
        <OpeningAssetForm
          open={showOpeningAssetForm}
          kind={openingAssetKind}
          target={openingAssetEffectiveTarget}
          name={openingAssetName}
          units={openingAssetUnits}
          price={openingAssetPrice}
          choices={openingAssetChoices}
          canCreateNew={openingAssetCanCreateNew}
          isNew={openingAssetIsNew}
          onClose={() => setShowOpeningAssetForm(false)}
          onKindChange={(nextKind) => {
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
          onTargetChange={(value) => {
            setOpeningAssetTarget(value);
            setOpeningAssetName(value === "__new__" ? "" : value);
          }}
          onNameChange={setOpeningAssetName}
          onUnitsChange={setOpeningAssetUnits}
          onPriceChange={setOpeningAssetPrice}
          onSave={addOpeningAsset}
          inputStyle={G.inp()}
        />

        <OpeningBalancesTable
          cash={Number(state.assets.cash || 0)}
          rows={openingBalanceRows}
          onCashChange={(value) =>
            setState((prev) => ({
              ...prev,
              assets: { ...prev.assets, cash: value },
            }))
          }
          onUpdate={updateAssetItem}
          inputStyle={G.inp()}
        />
      </OpeningBalancesSettingsSection>
      </>}

      {settingsView === "personal" && (
        <div className="asset-dashboard-card" style={settingsPanelStyle}>
          <label style={{ display: "block", marginBottom: 6, fontSize: 11, color: visualIdentity.colors.textSecondary }}>الاسم الكامل</label>
          <input value={state.settings?.profile?.name || ""} onChange={(event) => updateSetting("settings.profile.name", event.target.value)} placeholder="الاسم الكامل" style={G.inp()} />
          <label style={{ display: "block", marginBottom: 6, fontSize: 11, color: visualIdentity.colors.textSecondary }}>البريد الإلكتروني</label>
          <input type="email" value={state.settings?.profile?.email || ""} onChange={(event) => updateSetting("settings.profile.email", event.target.value)} placeholder="email@example.com" style={G.inp()} />
          <label style={{ display: "block", marginBottom: 6, fontSize: 11, color: visualIdentity.colors.textSecondary }}>رقم الهاتف</label>
          <input value={state.settings?.profile?.phone || ""} onChange={(event) => updateSetting("settings.profile.phone", event.target.value)} placeholder="رقم الهاتف" style={G.inp()} />
          <button type="button" onClick={() => alert("تم حفظ التفاصيل الشخصية")} style={G.btn(visualIdentity.gradients.gold, visualIdentity.colors.navy, { width: "100%" })}>حفظ التغييرات</button>
        </div>
      )}

      {settingsView === "locale" && (
        <div className="asset-dashboard-card" style={settingsPanelStyle}>
          <label style={{ display: "block", marginBottom: 6, fontSize: 11, color: visualIdentity.colors.textSecondary }}>اللغة</label>
          <select value={state.settings?.locale?.language || "ar"} onChange={(event) => updateSetting("settings.locale.language", event.target.value)} style={G.inp()}>
            <option value="ar">العربية</option><option value="en">English</option>
          </select>
          <label style={{ display: "block", marginBottom: 6, fontSize: 11, color: visualIdentity.colors.textSecondary }}>العملة</label>
          <select value={state.settings?.locale?.currency || "JOD"} onChange={(event) => updateSetting("settings.locale.currency", event.target.value)} style={G.inp()}>
            <option value="JOD">JOD</option><option value="USD">$</option><option value="SAR">SAR</option>
          </select>
        </div>
      )}

      {settingsView === "notifications" && (
        <NotificationSettings
          values={state.settings?.notifications}
          onChange={(key, value) => updateSetting(`settings.notifications.${key}`, value)}
        />
      )}

      {settingsView === "export" && (
        <button type="button" onClick={exportSettingsData} style={G.btn(visualIdentity.gradients.gold, visualIdentity.colors.navy, { width: "100%", minHeight: 48 })}>تصدير JSON</button>
      )}

      {settingsView === "share" && (
        <button type="button" onClick={() => shareApplication().catch(() => alert("تعذرت مشاركة الرابط"))} style={G.btn(visualIdentity.gradients.gold, visualIdentity.colors.navy, { width: "100%", minHeight: 48 })}>مشاركة التطبيق</button>
      )}

      {settingsView === "account" && (
        <AccountSecuritySettings
          email={authSession?.user?.email || profileSubtitle}
          onChangePassword={changeAccountPassword}
        />
      )}

      {settingsView === "reset" && (
        <ResetDataSettings onReset={onResetAllData} />
      )}

      {settingsView === "about" && (
        <div className="asset-dashboard-card" style={{ ...settingsPanelStyle, textAlign: "center", padding: 24 }}>
          <b style={{ display: "block", color: visualIdentity.colors.gold }}>{t("settings.comingSoon")}</b>
        </div>
      )}
      </SettingsSubpageShell>
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

function hydrateAppState(storedState) {
  if (!storedState || typeof storedState !== "object" || Array.isArray(storedState)) {
    return INITIAL_STATE;
  }

  return {
    ...INITIAL_STATE,
    ...storedState,
    settings: {
      ...INITIAL_STATE.settings,
      ...(storedState.settings || {}),
      market: {
        ...INITIAL_STATE.settings.market,
        ...(storedState.settings?.market || {}),
      },
      notifications: {
        ...INITIAL_STATE.settings.notifications,
        ...(storedState.settings?.notifications || {}),
        sent: storedState.settings?.notifications?.sent || {},
      },
    },
    assets: {
      ...INITIAL_STATE.assets,
      ...(storedState.assets || {}),
      banks: Array.isArray(storedState.assets?.banks) ? storedState.assets.banks : [],
      gold: Array.isArray(storedState.assets?.gold) ? storedState.assets.gold : [],
      silver: Array.isArray(storedState.assets?.silver) ? storedState.assets.silver : [],
      stocks: Array.isArray(storedState.assets?.stocks) ? storedState.assets.stocks : [],
      custom: Array.isArray(storedState.assets?.custom) ? storedState.assets.custom : [],
    },
    expenseCategories: {
      ...INITIAL_STATE.expenseCategories,
      ...(storedState.expenseCategories || {}),
      items: Array.isArray(storedState.expenseCategories?.items)
        ? storedState.expenseCategories.items
        : [],
    },
    session: {
      ...INITIAL_STATE.session,
      ...(storedState.session || {}),
    },
    extraCash: Array.isArray(storedState.extraCash) ? storedState.extraCash : [],
    structuralLiabilities: Array.isArray(storedState.structuralLiabilities)
      ? storedState.structuralLiabilities
      : [],
    currentLiabilities: Array.isArray(storedState.currentLiabilities)
      ? storedState.currentLiabilities
      : [],
    expenses: Array.isArray(storedState.expenses) ? storedState.expenses : [],
    transactions: Array.isArray(storedState.transactions) ? storedState.transactions : [],
    monthlySnapshots: Array.isArray(storedState.monthlySnapshots)
      ? storedState.monthlySnapshots
      : [],
    assetHistory: Array.isArray(storedState.assetHistory) ? storedState.assetHistory : [],
    currentMonth: storedState.currentMonth || INITIAL_STATE.currentMonth,
  };
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
  const appLanguage = state.settings?.locale?.language || "ar";
  const appDirection = appLanguage === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = appLanguage;
    document.documentElement.dir = appDirection;
    document.documentElement.dataset.currency =
      state.settings?.locale?.currency || "JOD";
  }, [appDirection, appLanguage, state.settings?.locale?.currency]);
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
      queueMicrotask(() => {
        if (!active) return;
        setStorageReady(false);
        setStorageError("");
        setState(INITIAL_STATE);
      });
      return () => {
        active = false;
      };
    }

    loadState(authSession)
      .then((storedState) => {
        if (!active) return;
        setState(hydrateAppState(storedState));
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
    registerNotificationServiceWorker().catch((error) => {
      console.error("Notification service worker registration failed:", error);
    });
  }, []);
  useEffect(() => {
    if (!storageReady || notificationPermission() !== "granted") return;
    let active = true;
    const deliver = async () => {
      const alerts = buildNotificationPlan(state);
      const results = await Promise.all(
        alerts.map(async (alert) => await showAppNotification(alert))
      );
      if (!active) return;
      const deliveredKeys = alerts.flatMap((alert, index) =>
        results[index] ? alert.markKeys : []
      );
      if (!deliveredKeys.length) return;
      setState((prev) => {
        const existing = prev.settings?.notifications?.sent || {};
        const newKeys = deliveredKeys.filter((key) => !existing[key]);
        if (!newKeys.length) return prev;
        const sent = { ...existing };
        newKeys.forEach((key) => {
          sent[key] = new Date().toISOString();
        });
        return {
          ...prev,
          settings: {
            ...prev.settings,
            notifications: {
              ...prev.settings?.notifications,
              sent,
            },
          },
        };
      });
    };
    deliver();
    const timer = window.setInterval(deliver, 60 * 60 * 1000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [state, storageReady]);
    useEffect(() => {
    if (!storageReady) return undefined;
    const initialTimer = window.setTimeout(() => {
      setState((prev) => rollStateToCurrentMonth(prev));
    }, 0);
    const timer = window.setInterval(() => {
      setState((prev) => rollStateToCurrentMonth(prev));
    }, 60 * 1000);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
    };
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
      next = rebalanceExpenseCoverageAfterCapIncrease(next);
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

async function handleClearState() {
  try {
    await clearState(authSession);
    window.location.reload();
  } catch (err) {
    console.error("Clear Error:", err);
    setStorageError("تعذر حذف البيانات من Supabase. لم يتم استخدام تخزين محلي.");
    throw err;
  }
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
const handleViewMonthChange = (month) => {
  setSelectedViewMonth(month);
  if (month !== "current" && !["overview", "reports", "assets"].includes(tab)) {
    setTab("overview");
  }
};

  if (!authSession) {
    return (
      <AuthScreen
        email={authEmail}
        password={authPassword}
        mode={authMode}
        loading={authLoading}
        error={authError}
        notice={authNotice}
        onEmailChange={setAuthEmail}
        onPasswordChange={setAuthPassword}
        onSubmit={handleAuthSubmit}
        onToggleMode={() => {
          setAuthMode(authMode === "signup" ? "signin" : "signup");
          setAuthError("");
          setAuthNotice("");
        }}
        onPasswordReset={handlePasswordReset}
        appStyle={G.app}
        cardStyle={G.card()}
        inputStyle={G.inp()}
        submitStyle={G.btn(
          "linear-gradient(135deg,var(--gold-primary),var(--gold-border))",
          "var(--text-heading)",
          { width: "100%", opacity: authLoading ? 0.7 : 1 }
        )}
      />
    );
  }
  if (storageError) {
    return (
      <StorageErrorScreen
        message={storageError}
        appStyle={G.app}
        cardStyle={G.card()}
      />
    );
  }

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
    <LocaleProvider
      language={appLanguage}
      currency={state.settings?.locale?.currency || "JOD"}
    >
    <div style={{ ...G.app, direction: appDirection }}>
<AppHeader
        selectedMonth={selectedViewMonth}
        currentMonthLabel={currentMonthLabel}
        snapshots={snapshots}
        snapshotView={Boolean(selectedViewSnapshot)}
        onMonthChange={handleViewMonthChange}
        onLogout={() => {
          setAuthSession(null);
          setStorageReady(false);
          setStorageError("");
        }}
        headerStyle={G.hdr}
        formatMonth={formatMonthKey}
      />

      <main key={`${tab}-${selectedViewMonth}`} className="tab-page-motion">
        {tab === "overview" && (
          <Overview
            state={viewState}
            setState={setState}
            readOnly={isSnapshotView}
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
            authSession={authSession}
            onResetAllData={handleClearState}
          />
        )}
      </main>

      <BottomNavigation
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
    </LocaleProvider>
  );
  }
