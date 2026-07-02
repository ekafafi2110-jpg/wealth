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
import AssetDistributionCard from "./components/assets/AssetDistributionCard";
import ExtraCashModal from "./components/assets/ExtraCashModal";
import ExpenseSummaryReportCard from "./components/reports/ExpenseSummaryReportCard";
import ExpenseDonut from "./components/reports/ExpenseDonut";
import ExpenseReportLauncher from "./components/reports/ExpenseReportLauncher";
import AssetTrendReportCard from "./components/reports/AssetTrendReportCard";
import ExpenseReportModal from "./components/reports/ExpenseReportModal";
import OverBudgetReportModal from "./components/reports/OverBudgetReportModal";
import AssetTrendDetailsModal from "./components/reports/AssetTrendDetailsModal";
import ReportsOverview from "./components/reports/ReportsOverview";
import ReportViewHeader from "./components/reports/ReportViewHeader";
import CategoryBudgetGauges from "./components/reports/CategoryBudgetGauges";
import DailySpendingHeatmap from "./components/reports/DailySpendingHeatmap";
import MonthlyHighlights from "./components/reports/MonthlyHighlights";
import MonthlyExpenseTrendCard from "./components/reports/MonthlyExpenseTrendCard";
import ExpenseReportTabs from "./components/reports/ExpenseReportTabs";
import AssetReportTabs from "./components/reports/AssetReportTabs";
import SalaryCapSettingsSection from "./components/settings/SalaryCapSettingsSection";
import ExpenseCategoryCapsSettings from "./components/settings/ExpenseCategoryCapsSettings";
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
import ReservedPaymentsCard from "./components/liabilities/ReservedPaymentsCard";
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
const sumExpenseCategoryCaps = (caps = {}) =>
  Object.values(caps).reduce((sum, value) => sum + Math.max(0, Number(value || 0)), 0);

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

const DEFAULT_EXPENSE_CATEGORIES = [
  { id: "food", label: "طعام", icon: "🍽️", color: "#f59e0b", pinned: true },
  { id: "transport", label: "مواصلات", icon: "🚗", color: "#3b82f6", pinned: true },
  { id: "shopping", label: "تسوق", icon: "🛒", color: "#a855f7", pinned: true },
  { id: "health", label: "صحة", icon: "💚", color: "#22c55e", pinned: true },
  { id: "entertainment", label: "ترفيه", icon: "🎮", color: "#ec4899", pinned: true },
  { id: "bills", label: "فواتير", icon: "🧾", color: "#7BBFF5", pinned: true },
  { id: "fuel", label: "بنزين", icon: "⛽", color: "#f97316", pinned: true },
  { id: "other", label: "أخرى", icon: "•••", color: "#91A9BF", isOther: true, pinned: true },
];

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
  const unitPrice = (item, fallback = 0, referenceField = "wac") =>
    Number(item?.currentPrice || 0) ||
    Number(fallback || 0) ||
    Number(item?.[referenceField] || 0);
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
      value:
        Number(item.units || 0) *
        unitPrice(item, goldPrice, "wac"),
    })
  );

  (assets.silver || []).forEach((item) =>
    rows.push({
      key: `silver:${item.id}`,
      label: item.label || "فضة",
      value:
        Number(item.units || 0) *
        unitPrice(item, silverPrice, "wac"),
    })
  );

  (assets.stocks || []).forEach((item) =>
    rows.push({
      key: `stock:${item.id}`,
      label: item.name || "سهم",
      value: Number(item.units || 0) * unitPrice(item, 0, "wac"),
    })
  );

  (assets.custom || []).forEach((item) =>
    rows.push({
      key: `custom:${item.id}`,
      label: item.name || "أصل",
      value:
        item.type === "fixed"
          ? Number(item.amount || 0)
          : Number(item.units || 0) * unitPrice(item, 0, "price"),
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
    .filter((item) => item.status !== "paid" && item.source !== "expense_payment")
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

    if (expense.paymentMethod === "liability") {
      const actualLiability = relatedLiabilities.find(
        (item) => item.source === "expense_payment"
      );
      const transferable = Math.min(
        moveAmount,
        Math.max(0, Number(actualLiability?.balance ?? actualLiability?.amount ?? 0))
      );

      if (actualLiability && transferable > 0) {
        const existingReserved = (next.reservedPayments || []).find(
          (item) =>
            item.status !== "paid" &&
            String(item.expenseId) === String(expense.id)
        );

        next.reservedPayments = next.reservedPayments || [];
        if (existingReserved) {
          existingReserved.amount = Number(
            (Number(existingReserved.amount || 0) + transferable).toFixed(2)
          );
          existingReserved.balance = Number(
            (Number(existingReserved.balance || 0) + transferable).toFixed(2)
          );
        } else {
          next.reservedPayments.push({
            id: `${expense.id}-reserved-rebalanced`,
            amount: transferable,
            balance: transferable,
            status: "pending",
            source: "expense_payment",
            category: actualLiability.category || expense.category || "غير مصنف",
            note: actualLiability.note || expense.note || "",
            creditorName: actualLiability.creditorName || actualLiability.name || "دائن",
            dueDate: actualLiability.dueDate || "",
            dueDay: actualLiability.dueDay || 1,
            originMonth:
              actualLiability.originMonth ||
              next.currentMonth ||
              String(expense.date || "").slice(0, 7),
            expenseId: expense.id,
            date: expense.date || new Date().toISOString().slice(0, 10),
            createdAt: new Date().toISOString(),
          });
        }

        const nextBalance = Number(
          Math.max(0, Number(actualLiability.balance ?? actualLiability.amount ?? 0) - transferable).toFixed(2)
        );
        actualLiability.amount = nextBalance;
        actualLiability.balance = nextBalance;
        actualLiability.payableBuffer = 0;
        actualLiability.uncoveredDebt = nextBalance;
        actualLiability.status = nextBalance <= 0 ? "paid" : "pending";
      }
    }

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

    const coveredCard = relatedLiabilities.find((item) => item.type === "card");
    if (coveredCard) {
      const existingReserved = (next.reservedPayments || []).find(
        (item) =>
          item.status !== "paid" &&
          String(item.expenseId || "") === String(expense.id) &&
          String(item.cardId || "") === String(coveredCard.id)
      );
      const originMonth =
        next.currentMonth || String(expense.date || "").slice(0, 7);
      const [year, month] = String(originMonth).split("-").map(Number);
      const lastDay = new Date(year, month, 0).getDate();

      next.reservedPayments = next.reservedPayments || [];
      if (existingReserved) {
        existingReserved.amount = Number(
          (Number(existingReserved.amount || 0) + moveAmount).toFixed(2)
        );
        existingReserved.balance = Number(
          (Number(existingReserved.balance || 0) + moveAmount).toFixed(2)
        );
      } else {
        next.reservedPayments.push({
          id: `${expense.id}-reserved-card-rebalanced`,
          amount: moveAmount,
          balance: moveAmount,
          status: "pending",
          source: "card_payment",
          category: expense.category || "غير مصنف",
          note: expense.note || "",
          creditorName: coveredCard.name || "بطاقة",
          cardId: coveredCard.id,
          dueDate: `${originMonth}-${String(lastDay).padStart(2, "0")}`,
          dueDay: lastDay,
          originMonth,
          expenseId: expense.id,
          date: expense.date || new Date().toISOString().slice(0, 10),
          createdAt: new Date().toISOString(),
        });
      }
    }

    relatedLiabilities
      .filter((item) => item.source !== "expense_payment")
      .forEach((item) => {
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
  const amountInputRef = useRef(null);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("طعام");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [splitWithCash, setSplitWithCash] = useState(false);
  const [cashSelectionExplicit, setCashSelectionExplicit] = useState(false);
  const [cardId, setCardId] = useState("");
  const [note, setNote] = useState("");
  const [pendingExpenses, setPendingExpenses] = useState([]);
  const [liabilityName, setLiabilityName] = useState("");
  const [dueDate, setDueDate] = useState("");

const [deficitTransfer, setDeficitTransfer] = useState(null);
const [overBudgetSource, setOverBudgetSource] = useState("");
const [overBudgetAssetKey, setOverBudgetAssetKey] = useState("cash");
const [deficitFundingType, setDeficitFundingType] = useState("");
const [overBudgetLiabilityName, setOverBudgetLiabilityName] = useState("تجاوز سقف الصرف");
const [overBudgetDueDate, setOverBudgetDueDate] = useState("");
  const [unusualFundingMode, setUnusualFundingMode] = useState("asset");
  const [unusualCapAmount, setUnusualCapAmount] = useState("");
  const [unusualRemainderSource, setUnusualRemainderSource] = useState("asset");
  const [unusualAssetKey, setUnusualAssetKey] = useState("");
  const [unusualDueDate, setUnusualDueDate] = useState("");
  const [aiExpenseBusy, setAiExpenseBusy] = useState(false);
  const [voiceRecording, setVoiceRecording] = useState(false);
  const [receiptSourceMenuOpen, setReceiptSourceMenuOpen] = useState(false);
  const aiReceiptInputRef = useRef(null);
  const aiReceiptUploadInputRef = useRef(null);
  const aiRecorderRef = useRef(null);
  const aiAudioChunksRef = useRef([]);
  const aiVoiceStopTimerRef = useRef(null);
  const selectExpenseCategory = (nextCategory) => {
    setCategory(nextCategory);
    window.requestAnimationFrame(() => {
      amountInputRef.current?.focus();
      });
  };
  const cards = state.currentLiabilities.filter((x) => x.type === "card");
  const availableCards = cards.filter(
    (card) =>
      Number(card.creditLimit || 0) - Number(card.balance || 0) > 0.001
  );
  const recent = [...state.expenses].slice(-3).reverse();
  const allExpenses = [...state.expenses].reverse();
  const dueCurrentLiabilities = (state.currentLiabilities || []).filter((l) => {
  if (!l.dueDate || l.status === "paid") return false;

  const dueMonth = String(l.dueDate).slice(0, 7);
  const currentMonth = state.currentMonth || new Date().toISOString().slice(0, 7);
  return dueMonth <= currentMonth;
});
  const assetSources = getAssetSources(state);
  const accountingDate = getDateKey(new Date());
  const accountingDateTime = `${accountingDate}T12:00:00.000Z`;
  const accountingDateDisplay = accountingDate.split("-").reverse().join("/");
  const isGoodsSource = (source) => {
    if (source.type !== "custom") return false;
    const id = String(source.key).split(":")[1];
    return (state.assets.custom || []).some(
      (item) => String(item.id) === String(id) && item.type === "unit"
    );
  };
  const defaultExpenseCategories = DEFAULT_EXPENSE_CATEGORIES;

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
  const selectedPaymentCard = availableCards.find(
    (card) => String(card.id) === String(cardId)
  );
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
  const saveButtonMeta = "";
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
  const selectedExpenseFunding = selectedExpense?.overBudgetFunding || null;
  const selectedExpenseFundingLabel = selectedExpenseFunding
    ? selectedExpenseFunding.type === "card"
      ? `بطاقة — ${selectedExpenseFunding.label || "بطاقة"}`
      : selectedExpenseFunding.type === "liability"
        ? `التزام — ${selectedExpenseFunding.label || "دائن"}`
        : `أصل — ${selectedExpenseFunding.label || "أصل"}`
    : "";
  const selectedExpensePaymentParts =
    selectedExpense && selectedExpenseFundingLabel
      ? [
          {
            label: "كاش",
            amount: Number(selectedExpense.budgetCovered || 0),
            color: visualIdentity.semantic.success,
          },
          {
            label: selectedExpenseFundingLabel,
            amount: Number(
              selectedExpenseFunding?.amount || selectedExpense.overBudget || 0
            ),
            color:
              selectedExpenseFunding?.type === "asset"
                ? visualIdentity.colors.gold
                : selectedExpenseFunding?.type === "card"
                  ? visualIdentity.colors.cyan
                  : visualIdentity.colors.red,
          },
        ].filter((part) => Number(part.amount || 0) > 0)
      : [];
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
const isMixedPayment =
  splitWithCash &&
  hasSpendingCap &&
  amountExceedsCap &&
  !["", "cash", "emergency"].includes(paymentMethod);
const showLegacyDeficitPanel =
  amountExceedsCap && (paymentMethod === "cash" || isMixedPayment);

useEffect(() => {
  const timer = window.setTimeout(() => {
    if (!hasSpendingCap && unusualFundingMode === "mix") {
      setUnusualFundingMode("asset");
    }

    if (!hasSpendingCap && paymentMethod === "cash") {
      setPaymentMethod("");
      setSplitWithCash(false);
      setCashSelectionExplicit(false);
      setDeficitFundingType("");
      setOverBudgetSource("");
    }

    if (
      hasSpendingCap &&
      amountExceedsCap &&
      paymentMethod === "cash" &&
      !cashSelectionExplicit
    ) {
      setPaymentMethod("");
      setSplitWithCash(false);
    }

    if (hasSpendingCap && !amountExceedsCap && paymentMethod === "") {
      setPaymentMethod("cash");
    }

    if (!amountExceedsCap && splitWithCash) {
      setSplitWithCash(false);
    }
  }, 0);

  return () => window.clearTimeout(timer);
}, [
  amountExceedsCap,
  cashSelectionExplicit,
  hasSpendingCap,
  paymentMethod,
  splitWithCash,
  unusualFundingMode,
]);

  const resetExpenseDraft = () => {
    setAmount("");
    setCategory("طعام");
    setPaymentMethod("cash");
    setSplitWithCash(false);
    setCashSelectionExplicit(false);
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
  const openPendingSurplusAllocation = () => {
    const surplus = Number(state.session?.pendingSurplus || 0);
    if (surplus > 0.01) onAllocateSurplus(surplus);
  };
  const requiresLiabilityDecisionBeforeExpense = (sourceState = state) => {
    const currentMonth = sourceState.currentMonth || new Date().toISOString().slice(0, 7);
    const pendingReserved = (sourceState.reservedPayments || []).filter((item) => {
      const balance = Number(item.balance ?? item.amount ?? 0);
      const dueMonth = String(item.dueDate || item.originMonth || "").slice(0, 7);
      return item.status !== "paid" && balance > 0.01 && dueMonth && dueMonth < currentMonth;
    });
    const dueLiabilities = (sourceState.currentLiabilities || []).filter((item) => {
      const balance = Number(item.balance ?? item.amount ?? 0);
      const dueMonth = String(item.dueDate || "").slice(0, 7);
      return item.status !== "paid" && balance > 0.01 && dueMonth && dueMonth < currentMonth;
    });

    if (!pendingReserved.length && !dueLiabilities.length) return false;

    alert("قبل تسجيل أي مصروف جديد، راجع الالتزامات المستحقة وبرسم الدفع واتخذ قرار السداد أو التأجيل حتى لا تتراكم عبر الشهور.");
    onOpenDueLiabilities();
    return true;
  };

  const addPendingExpense = () => {
    if (requiresLiabilityDecisionBeforeExpense()) return;

    if (Number(state.session?.pendingSurplus || 0) > 0.01) {
      openPendingSurplusAllocation();
      return;
    }
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
    if (isMixedPayment) {
      alert("التسجيل المتعدد غير متاح مع تقسيم الدفع. سجل هذا المصروف منفرداً.");
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
        date: accountingDate,
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

    const canSplit = hasSpendingCap && amountExceedsCap;
    const configureMixedMethod = (method) => {
      setPaymentMethod(method);
      setSplitWithCash(true);
      setCashSelectionExplicit(true);
      setDeficitFundingType(method);
      setOverBudgetSource(method === "asset" ? "" : method);

      if (method === "liability") {
        setOverBudgetLiabilityName(liabilityName || "تجاوز سقف الصرف");
        setOverBudgetDueDate(dueDate || "");
        window.setTimeout(() => {
          deficitLiabilityNameRef.current?.focus();
        }, 0);
      }
    };

    if (value === "emergency") {
      setPaymentMethod(value);
      setSplitWithCash(false);
      setCashSelectionExplicit(false);
      setDeficitFundingType("");
      setOverBudgetSource("");
      setUnusualFundingMode("asset");
      setUnusualAssetKey("");
      return;
    }

    if (value === "cash") {
      if (canSplit && !["", "cash", "emergency"].includes(paymentMethod)) {
        if (isMixedPayment) {
          setSplitWithCash(false);
          setCashSelectionExplicit(false);
          setDeficitFundingType("");
          setOverBudgetSource("");
          if (paymentMethod === "liability") {
            setLiabilityName(overBudgetLiabilityName || liabilityName);
            setDueDate(overBudgetDueDate || dueDate);
          }
        } else {
          configureMixedMethod(paymentMethod);
        }
        return;
      }

      setPaymentMethod("cash");
      setSplitWithCash(false);
      setCashSelectionExplicit(true);
      setDeficitFundingType("");
      setOverBudgetSource("");
      return;
    }

    if (canSplit && (paymentMethod === "cash" || isMixedPayment)) {
      if (isMixedPayment && paymentMethod === value) {
        setPaymentMethod("cash");
        setSplitWithCash(false);
        setCashSelectionExplicit(true);
        setDeficitFundingType("");
        setOverBudgetSource("");
        return;
      }

      configureMixedMethod(value);
      if (value === "asset") {
        if (enteredAmount <= 0) return alert("أدخل مبلغ المصروف أولاً");
        openDeficitTransfer("all", "overBudget", uncoveredAmount);
      }
      return;
    }

    setPaymentMethod(value);
    setSplitWithCash(false);
    setCashSelectionExplicit(false);
    setDeficitFundingType("");
    setOverBudgetSource("");
    setUnusualFundingMode("");

    if (value === "asset") {
      if (enteredAmount <= 0) return alert("أدخل مبلغ المصروف أولاً");
      openDeficitTransfer(
        "all",
        "fullAsset",
        enteredAmount
      );
    }
  };

  const paymentOptions = [
    ...(hasSpendingCap ? [{ value: "cash", label: "كاش", icon: "💵" }] : []),
    { value: "asset", label: "أصل", icon: "🏦" },
    { value: "card", label: "بطاقة", icon: "💳" },
    { value: "liability", label: "التزام جديد", icon: "🧾" },
    { value: "emergency", label: "مصروف طارئ", icon: "⚡" },
  ];
  const activePaymentMethods = [
    paymentMethod,
    ...(isMixedPayment ? ["cash"] : []),
  ].filter(Boolean);
  const paymentOptionsWithAmounts = paymentOptions.map((option) => {
    if (!activePaymentMethods.includes(option.value) || enteredAmount <= 0) return option;
    if (isMixedPayment && option.value === "cash") {
      return { ...option, amountLabel: Number(budget.remainingCap || 0).toFixed(2) };
    }
    if (isMixedPayment && option.value === paymentMethod) {
      return { ...option, amountLabel: uncoveredAmount.toFixed(2) };
    }
    return { ...option, amountLabel: enteredAmount.toFixed(2) };
  });
  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const compressImageFile = (file) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        const maxSide = 1400;
        const ratio = Math.min(1, maxSide / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * ratio));
        canvas.height = Math.max(1, Math.round(image.height * ratio));
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      image.onerror = reject;
      image.src = URL.createObjectURL(file);
    });

  const applyAiExpenseSuggestion = (suggestion) => {
    const nextAmount = Number(suggestion?.amount || 0);
    if (nextAmount > 0) setAmount(String(nextAmount));

    const suggestedCategory = String(suggestion?.category || "").trim();
    const matchedCategory = allExpenseCategories.find(
      (item) =>
        String(item.label || "").trim() === suggestedCategory ||
        String(item.id || "").trim() === suggestedCategory
    );
    if (matchedCategory?.label) setCategory(matchedCategory.label);
    else if (suggestedCategory) setCategory(suggestedCategory);

    const nextNote = [suggestion?.note, suggestion?.summary]
      .filter(Boolean)
      .join(" - ");
    if (nextNote) setNote(nextNote);

    const suggestedPayment = suggestion?.paymentMethodSuggestion;
    if (suggestedPayment && paymentOptions.some((option) => option.value === suggestedPayment)) {
      changePaymentMethod(suggestedPayment);
    }
  };

  const sendAiExpenseRequest = async (payload) => {
    const context = {
      currency: localeCurrencyLabel,
      categories: allExpenseCategories.map((item) => item.label).filter(Boolean),
      paymentMethods: paymentOptions.map((option) => ({
        value: option.value,
        label: option.label,
      })),
    };
    const isVoiceRequest = payload?.mode === "voice";
    const audioDataUrl = isVoiceRequest ? payload.audioDataUrl : "";

    if (isVoiceRequest && !audioDataUrl) {
      alert("ابدأ التسجيل الصوتي أولاً ثم أعد المحاولة.");
      return;
    }

    const requestBody = isVoiceRequest
      ? { mode: "voice", audioDataUrl, context }
      : { ...payload, context };

    setAiExpenseBusy(true);
    try {
      const response = await fetch("/api/ai-expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "تعذر تحليل المصروف بالذكاء الاصطناعي");
      }
      applyAiExpenseSuggestion(data);
    } catch (error) {
      alert(error.message || "تعذر تحليل المصروف بالذكاء الاصطناعي");
    } finally {
      setAiExpenseBusy(false);
    }
  };

  const stopVoiceExpenseRecording = () => {
    if (aiVoiceStopTimerRef.current) {
      clearTimeout(aiVoiceStopTimerRef.current);
      aiVoiceStopTimerRef.current = null;
    }
    if (aiRecorderRef.current?.state === "recording") {
      aiRecorderRef.current.stop();
    }
  };

  const startVoiceExpenseRecording = async () => {
    if (voiceRecording) {
      stopVoiceExpenseRecording();
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      alert("تسجيل الصوت غير مدعوم في هذا المتصفح");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      aiAudioChunksRef.current = [];
      aiRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data?.size > 0) aiAudioChunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        setVoiceRecording(false);
        if (aiVoiceStopTimerRef.current) {
          clearTimeout(aiVoiceStopTimerRef.current);
          aiVoiceStopTimerRef.current = null;
        }
        stream.getTracks().forEach((track) => track.stop());
        const audioChunks = [...aiAudioChunksRef.current];
        aiAudioChunksRef.current = [];
        console.log("voice chunks:", audioChunks.length);
        if (!audioChunks.length) {
          alert("لم يتم التقاط صوت. حاول التسجيل مرة أخرى.");
          return;
        }
        const audioBlob = new Blob(audioChunks, { type: recorder.mimeType || "audio/webm" });
        console.log("voice blob size:", audioBlob.size);
        if (audioBlob.size <= 0) {
          alert("لم يتم التقاط صوت. حاول التسجيل مرة أخرى.");
          return;
        }
        const audioDataUrl = await fileToDataUrl(audioBlob);
        console.log("audioDataUrl exists:", Boolean(audioDataUrl));
        if (!audioDataUrl) {
          alert("ابدأ التسجيل الصوتي أولاً ثم أعد المحاولة.");
          return;
        }
        await sendAiExpenseRequest({ mode: "voice", audioDataUrl });
      };

      recorder.start(250);
      setVoiceRecording(true);
      aiVoiceStopTimerRef.current = setTimeout(() => {
        stopVoiceExpenseRecording();
      }, 7000);
    } catch {
      setVoiceRecording(false);
      if (aiVoiceStopTimerRef.current) {
        clearTimeout(aiVoiceStopTimerRef.current);
        aiVoiceStopTimerRef.current = null;
      }
      alert("لم أتمكن من تشغيل المايكروفون. تحقق من صلاحيات المتصفح.");
    }
  };

  const handleReceiptImageChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    setReceiptSourceMenuOpen(false);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("اختر صورة فاتورة أو إيصال");
      return;
    }

    try {
      const imageDataUrl = await compressImageFile(file);
      await sendAiExpenseRequest({ mode: "receipt", imageDataUrl });
    } catch (error) {
      alert(error.message || "تعذر قراءة صورة الفاتورة");
    }
  };

  const submitExpenseWithState = (baseState, fundingOverride = null) => {
    if (requiresLiabilityDecisionBeforeExpense(baseState)) return;

    const effectivePaymentMethod =
      fundingOverride?.paymentMethod ?? (isMixedPayment ? "cash" : paymentMethod);
    const effectiveOverBudgetSource = fundingOverride?.source ?? overBudgetSource;
    const effectiveOverBudgetAssetKey = fundingOverride?.assetKey ?? overBudgetAssetKey;
    const effectiveAssetPaymentKey = fundingOverride?.assetKey ?? overBudgetAssetKey;
    const effectiveEmergencyAssetKey =
      fundingOverride?.assetKey ?? unusualAssetKey;
    const effectiveOverBudget = effectivePaymentMethod === "emergency"
      ? 0
      : uncoveredAmount;
    const baseCards = (baseState.currentLiabilities || []).filter(
      (item) => item.type === "card"
    );

    if (!effectivePaymentMethod) {
      alert("اختر أسلوب الدفع");
      return;
    }

    if (effectivePaymentMethod === "asset" && !effectiveAssetPaymentKey) {
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
    if (effectivePaymentMethod === "cash" && effectiveOverBudgetSource === "card") {
      const selectedCard = baseCards.find(
        (card) => String(card.id) === String(cardId)
      );
      if (!selectedCard) {
        alert("اختر البطاقة التي ستموّل الفرق");
        return;
      }

      const availableCredit = Math.max(
        0,
        Number(selectedCard.creditLimit || 0) - Number(selectedCard.balance || 0)
      );
      if (effectiveOverBudget > availableCredit) {
        alert(
          `المتاح في البطاقة لا يغطي الفرق. المتاح ${availableCredit.toFixed(
            2
          )} ${localeCurrencyLabel}`
        );
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
    alert("سقف الصرف لا يغطي كامل المصروف. اختر أسلوب تمويل الفرق.");
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
    !overBudgetDueDate
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
      date: accountingDate,
      createdAt: accountingDateTime,
      liabilityName,
      dueDate,
      assetKey: effectivePaymentMethod === "asset" ? effectiveAssetPaymentKey : "",
      assetLabel:
        effectivePaymentMethod === "asset"
          ? getAssetSources(baseState).find(
              (source) => source.key === effectiveAssetPaymentKey
            )?.label || "أصل"
          : "",
      emergencyFunding:
        effectivePaymentMethod === "emergency"
          ? {
              mode: unusualFundingMode,
              capAmount:
                unusualFundingMode === "mix" ? Number(unusualCapAmount || 0) : 0,
              remainderSource: unusualRemainderSource,
              assetKey: effectiveEmergencyAssetKey,
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

if (
  lastExpense?.overBudget > 0 &&
  effectivePaymentMethod !== "emergency" &&
  effectivePaymentMethod !== "asset"
) {
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
      const assetExpenseLabel = [
        lastExpense.category || "غير مصنف",
        String(lastExpense.note || "").trim(),
      ].filter(Boolean).join(" - ");

      nextState.assetHistory = [
        ...(nextState.assetHistory || []),
        {
          id: `${operationId}-asset-history-over-budget`,
          date: new Date().toISOString(),
          recordedAt: new Date().toISOString(),
          type: "over_budget_covered_from_asset",
          source: "expense",
          assetKey: effectiveOverBudgetAssetKey,
          amount: lastExpense.overBudget,
          expenseId: lastExpense.id,
          expenseCategory: lastExpense.category || "غير مصنف",
          expenseNote: String(lastExpense.note || "").trim(),
          displayLabel: `تجاوز سقف - ${assetExpenseLabel}`,
          note: String(lastExpense.note || "").trim(),
        },
      ];

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
        label:
          getAssetSources(nextState).find(
            (source) => source.key === effectiveOverBudgetAssetKey
          )?.label || "أصل",
        amount: Number(lastExpense.overBudget || 0),
      };
    }

    if (effectiveOverBudgetSource === "liability") {
      const liabilityAmount = Number(lastExpense.overBudget || 0);
      const creditorName =
        String(overBudgetLiabilityName || "").trim() || "تجاوز سقف الصرف";
      const liabilityId = operationId + 4;

      nextState.currentLiabilities.push({
        id: liabilityId,
        type: "direct_liability",
        name: creditorName,
        amount: liabilityAmount,
        balance: liabilityAmount,
        payableBuffer: 0,
        uncoveredDebt: liabilityAmount,
        dueDate: overBudgetDueDate,
        dueDay: Number(String(overBudgetDueDate).split("-")[2] || 1),
        status: "pending",
        source: "expense_payment",
        category: lastExpense.category || "غير مصنف",
        note: lastExpense.note || "",
        creditorName,
        originMonth:
          nextState.currentMonth || new Date().toISOString().slice(0, 7),
        date: lastExpense.date,
        createdAt: new Date().toISOString(),
        expenseId: lastExpense.id,
      });
      lastExpense.overBudgetFunding = {
        type: "liability",
        amount: liabilityAmount,
        liabilityId,
        label: creditorName,
      };
    }

    if (effectiveOverBudgetSource === "card") {
      const fundingCard = nextState.currentLiabilities.find(
        (item) => item.type === "card" && String(item.id) === String(cardId)
      );
      const fundedAmount = Number(lastExpense.overBudget || 0);

      if (!fundingCard) {
        alert("تعذر العثور على البطاقة المختارة");
        return;
      }

      fundingCard.balance = Number(
        (Number(fundingCard.balance || 0) + fundedAmount).toFixed(2)
      );
      fundingCard.amount = fundingCard.balance;
      fundingCard.uncoveredDebt = Number(
        Math.max(
          0,
          Number(fundingCard.balance || 0) - Number(fundingCard.payableBuffer || 0)
        ).toFixed(2)
      );
      fundingCard.status = "pending";
      lastExpense.overBudgetFunding = {
        type: "card",
        cardId: fundingCard.id,
        label: fundingCard.name || "بطاقة",
        amount: fundedAmount,
        capCovered: 0,
      };
    }

  }

  alert(
    `تنبيه: تجاوزت سقف الصرف بمبلغ ${lastExpense.overBudget.toFixed(
      2
    )} ${localeCurrencyLabel} في هذه العملية.`
  );
}

if (lastExpense?.overBudget > 0 && effectivePaymentMethod === "asset") {
  lastExpense.overBudgetFunding = {
    type: "asset",
    assetKey: effectiveAssetPaymentKey,
    label:
      getAssetSources(nextState).find(
        (source) => source.key === effectiveAssetPaymentKey
      )?.label || "أصل",
    amount: Number(lastExpense.overBudget || 0),
  };

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
        createdAt: `${item.date || accountingDate}T12:00:00.000Z`,
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

  const submitExpense = () => {
    if (Number(state.session?.pendingSurplus || 0) > 0.01) {
      openPendingSurplusAllocation();
      return;
    }
    return pendingExpenses.length > 0
      ? submitPendingExpenses()
      : submitExpenseWithState(state);
  };

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
          deficitTransfer.context === "emergency"
            ? "emergency"
            : deficitTransfer.context === "fullAsset"
              ? "asset"
              : "cash",
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
    const liquidatedAmount = Number(transferResult.amount || 0);
    if (finalReceiverBalance < requiredAmount) {
      setState(transferResult.nextState);
      setDeficitTransfer(null);
      alert(
        `تمت المناقلة، لكن رصيد الحساب المستلم غير كافٍ. الرصيد النهائي ${finalReceiverBalance.toFixed(2)} ${localeCurrencyLabel}`
      );
      return;
    }

    const shortageCoveredFromReceiver = Math.max(0, requiredAmount - liquidatedAmount);
    const taggedAssetHistory = [...(transferResult.nextState.assetHistory || [])];
    const movementToTagIndex = taggedAssetHistory
      .map((movement, index) => ({ movement, index }))
      .reverse()
      .find(({ movement }) =>
        movement.type === "asset_units_liquidated" &&
        movement.assetKey === deficitTransfer.fromAsset &&
        movement.destinationKey === destinationKey &&
        Number(movement.amount || 0) === liquidatedAmount &&
        !movement.expensePurpose
      )?.index;

    if (movementToTagIndex != null) {
      taggedAssetHistory[movementToTagIndex] = {
        ...taggedAssetHistory[movementToTagIndex],
        expensePurpose: "expense_coverage",
        expenseCategory: category || "غير مصنف",
        note: `تسييل لتغطية مصروف — ${category || "غير مصنف"}`,
      };
    }

    const taggedTransferState = {
      ...transferResult.nextState,
      assetHistory: taggedAssetHistory,
    };

    if (shortageCoveredFromReceiver > 0) {
      alert(
        `تنبيه: مبلغ التسييل ${liquidatedAmount.toFixed(2)} ${localeCurrencyLabel} لم يغطِ كامل المطلوب. سيتم تغطية الفرق ${shortageCoveredFromReceiver.toFixed(2)} ${localeCurrencyLabel} من رصيد ${row.allocation === "bank" ? "الحساب البنكي" : "الكاش الادخاري"}.`
      );
    }

    completeExpense(taggedTransferState, destinationKey);
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
    const isLiabilityPayment =
      expense.paymentMethod === "cap_liability" && expense.liabilityId != null;
    const liabilityPaymentTx = (next.transactions || []).find(
      (tx) =>
        tx.type === "liability_paid_from_cap" &&
        String(tx.expenseId) === String(expense.id)
    );

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
        (x) => String(x.id) === String(expense.cardId) && x.type === "card"
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

    if (isLiabilityPayment) {
      const restoredLiability = (next.currentLiabilities || []).find(
        (item) => String(item.id) === String(expense.liabilityId)
      );
      const savedBefore =
        expense.liabilityPayment?.before ||
        liabilityPaymentTx?.liabilityBeforePayment;

      if (restoredLiability) {
        if (savedBefore) {
          restoredLiability.amount = Number(savedBefore.amount || 0);
          restoredLiability.balance = Number(savedBefore.balance || 0);
          restoredLiability.payableBuffer = Number(savedBefore.payableBuffer || 0);
          restoredLiability.uncoveredDebt = Number(savedBefore.uncoveredDebt || 0);
          restoredLiability.status = savedBefore.status || "pending";
          restoredLiability.paymentMethod = savedBefore.paymentMethod || "";
          if (savedBefore.paidAt) restoredLiability.paidAt = savedBefore.paidAt;
          else delete restoredLiability.paidAt;
        } else {
          const paidAmount = Number(liabilityPaymentTx?.amount || amount);
          const capCharge = Number(
            liabilityPaymentTx?.capCharge ?? budgetCovered ?? paidAmount
          );
          const restoredCovered = Math.max(0, paidAmount - capCharge);

          restoredLiability.balance = paidAmount;
          if (restoredLiability.type !== "card") {
            restoredLiability.amount = paidAmount;
          }
          restoredLiability.payableBuffer = restoredCovered;
          restoredLiability.uncoveredDebt = Math.max(
            0,
            paidAmount - restoredCovered
          );
          restoredLiability.status =
            restoredLiability.type === "card" ? "active" : "pending";
          restoredLiability.paymentMethod = "";
          delete restoredLiability.paidAt;
        }

        const originExpenseId =
          restoredLiability.originExpenseId ?? restoredLiability.expenseId;
        const originExpense = (next.expenses || []).find(
          (item) => String(item.id) === String(originExpenseId)
        );

        if (originExpense) {
          restoredLiability.category =
            originExpense.category || restoredLiability.category || "غير مصنف";
          restoredLiability.note =
            originExpense.note || restoredLiability.note || "";
          if (restoredLiability.source === "emergency_expense") {
            restoredLiability.name = `مصروف ${restoredLiability.category} طارئ`;
          }
        }
      }

      const overBudgetRelief = Number(
        expense.liabilityPayment?.overBudgetRelief ??
          liabilityPaymentTx?.overBudgetRelief ??
          0
      );
      next.session.overBudgetSpent = Number(
        (Number(next.session?.overBudgetSpent || 0) + overBudgetRelief).toFixed(2)
      );
    }

    next.currentLiabilities = (next.currentLiabilities || []).filter(
      (l) =>
        String(l.expenseId) !== String(expenseId) ||
        (l.type !== "direct_liability" && l.type !== "over_budget")
    );
    next.reservedPayments = (next.reservedPayments || []).filter(
      (item) => String(item.expenseId) !== String(expenseId)
    );

    const assetCoverageTransactions = (next.transactions || []).filter(
      (tx) =>
        String(tx.expenseId) === String(expenseId) &&
        (tx.type === "over_budget_covered_from_asset" ||
          tx.type === "emergency_expense_covered_from_asset" ||
          tx.type === "expense_paid_from_asset")
    );

    const assetRefunds = assetCoverageTransactions.reduce((groups, tx) => {
      const assetKey = String(tx.assetKey || "");
      const value = Number(tx.amount || 0);
      if (!assetKey || value <= 0) return groups;
      groups[assetKey] = Number((Number(groups[assetKey] || 0) + value).toFixed(2));
      return groups;
    }, {});

    Object.entries(assetRefunds).forEach(([assetKey, refundAmount]) => {
      next = addToAsset(
        next,
        assetKey,
        refundAmount
      );
    });

    next.transactions = (next.transactions || []).filter(
      (tx) => String(tx.expenseId) !== String(expenseId)
    );
    next.assetHistory = (next.assetHistory || []).filter(
      (movement) => String(movement.expenseId || "") !== String(expenseId)
    );

    if (!isLiabilityPayment) {
      next = rebalanceCurrentLiabilityCoverage(next);
    }

    next.transactions.push({
      id: Date.now(),
      type: "expense_cancelled",
      amount,
      expenseId,
      liabilityId: expense.liabilityId || null,
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
            padding: 6,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 7,
              marginBottom: 3,
            }}
          >
            <button
              type="button"
              onClick={() => setShowCategoryManager(true)}
              title="المزيد"
              aria-label="المزيد"
              style={{
                width: 26,
                height: 26,
                borderRadius: 9,
                border: "1px solid rgba(255,255,255,0.16)",
                background: "rgba(255,255,255,0.08)",
                color: visualIdentity.colors.white,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 900,
                fontFamily: "inherit",
                flex: "0 0 auto",
              }}
            >
              ⋯
            </button>

            <div
              style={{
                fontSize: 12,
                fontWeight: 900,
                color: visualIdentity.colors.white,
                textAlign: "right",
                flex: 1,
              }}
            >
              تسجيل مصروف
            </div>

            <div
              style={{
                minWidth: 78,
                paddingInline: 2,
                color: visualIdentity.colors.gold,
                fontSize: 10,
                fontWeight: 900,
                fontVariantNumeric: "tabular-nums",
                textAlign: "center",
                flex: "0 0 auto",
              }}
            >
              {accountingDateDisplay}
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                flex: "0 0 auto",
              }}
            >
              <button
                type="button"
                className={voiceRecording ? "voice-recording-pulse" : ""}
                onClick={startVoiceExpenseRecording}
                disabled={aiExpenseBusy}
                title={voiceRecording ? "التسجيل يعمل الآن، اضغط للإيقاف والتحليل" : "تسجيل المصروف بالصوت"}
                aria-label={voiceRecording ? "التسجيل يعمل الآن، اضغط للإيقاف والتحليل" : "تسجيل المصروف بالصوت"}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 9,
                  border: voiceRecording ? `1px solid ${visualIdentity.colors.red}88` : "1px solid rgba(255,198,45,0.30)",
                  background: voiceRecording ? `${visualIdentity.colors.red}22` : "rgba(255,198,45,0.10)",
                  color: voiceRecording ? visualIdentity.colors.red : visualIdentity.colors.gold,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: aiExpenseBusy ? "not-allowed" : "pointer",
                  opacity: aiExpenseBusy ? 0.6 : 1,
                  fontSize: 13,
                  fontWeight: 900,
                  fontFamily: "inherit",
                  boxShadow: voiceRecording
                    ? `0 0 0 4px ${visualIdentity.colors.red}18, 0 0 14px ${visualIdentity.colors.red}66, inset 0 1px 0 rgba(255,255,255,0.16)`
                    : "inset 0 1px 0 rgba(255,255,255,0.12)",
                }}
              >
                🎙️
              </button>
              <span style={{ position: "relative", display: "inline-flex" }}>
                <button
                  type="button"
                  onClick={() => setReceiptSourceMenuOpen((open) => !open)}
                  disabled={aiExpenseBusy || voiceRecording}
                  title="قراءة الفاتورة بالصورة"
                  aria-label="قراءة الفاتورة بالصورة"
                  aria-expanded={receiptSourceMenuOpen}
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 9,
                    border: "1px solid rgba(255,255,255,0.16)",
                    background: receiptSourceMenuOpen ? "rgba(85,217,255,0.16)" : "rgba(255,255,255,0.08)",
                    color: visualIdentity.colors.white,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: aiExpenseBusy || voiceRecording ? "not-allowed" : "pointer",
                    opacity: aiExpenseBusy || voiceRecording ? 0.6 : 1,
                    fontSize: 13,
                    fontWeight: 900,
                    fontFamily: "inherit",
                    boxShadow: receiptSourceMenuOpen
                      ? `0 0 0 3px ${visualIdentity.colors.cyan}18, inset 0 1px 0 rgba(255,255,255,0.14)`
                      : "inset 0 1px 0 rgba(255,255,255,0.12)",
                  }}
                >
                  📷
                </button>
                {receiptSourceMenuOpen && !aiExpenseBusy && !voiceRecording && (
                  <span
                    style={{
                      position: "absolute",
                      top: 31,
                      insetInlineEnd: 0,
                      zIndex: 20,
                      minWidth: 132,
                      padding: 5,
                      borderRadius: 12,
                      border: "1px solid rgba(255,255,255,0.18)",
                      background: "rgba(8,42,85,0.96)",
                      boxShadow: "0 12px 28px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.12)",
                      backdropFilter: "blur(14px)",
                      display: "grid",
                      gap: 4,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setReceiptSourceMenuOpen(false);
                        aiReceiptInputRef.current?.click();
                      }}
                      style={{
                        minHeight: 30,
                        borderRadius: 9,
                        border: 0,
                        background: "rgba(255,255,255,0.08)",
                        color: visualIdentity.colors.white,
                        fontFamily: "inherit",
                        fontSize: 11,
                        fontWeight: 900,
                        cursor: "pointer",
                        textAlign: "right",
                        padding: "6px 9px",
                      }}
                    >
                      التقاط بالكاميرا
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReceiptSourceMenuOpen(false);
                        aiReceiptUploadInputRef.current?.click();
                      }}
                      style={{
                        minHeight: 30,
                        borderRadius: 9,
                        border: 0,
                        background: "rgba(255,255,255,0.08)",
                        color: visualIdentity.colors.white,
                        fontFamily: "inherit",
                        fontSize: 11,
                        fontWeight: 900,
                        cursor: "pointer",
                        textAlign: "right",
                        padding: "6px 9px",
                      }}
                    >
                      تحميل صورة
                    </button>
                  </span>
                )}
              </span>
              <input
                ref={aiReceiptInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleReceiptImageChange}
                style={{ display: "none" }}
              />
              <input
                ref={aiReceiptUploadInputRef}
                type="file"
                accept="image/*"
                onChange={handleReceiptImageChange}
                style={{ display: "none" }}
              />
            </div>
          </div>

<ExpenseCategoryGrid
            categories={mainExpenseCategories}
            selectedCategory={category}
            onSelect={selectExpenseCategory}
            getTileStyle={getCategoryTileStyle}
            icons={CAT_ICONS}
            pendingByCategory={pendingByCategory}
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "70px 84px minmax(0, 1fr)",
              alignItems: "stretch",
              gap: 7,
              marginBottom: 7,
              direction: "ltr",
            }}
          >
            <button
              type="button"
              onClick={addPendingExpense}
              title="إضافة المصروف إلى قائمة المراجعة"
              aria-label="إضافة المصروف"
              style={{
                width: 72,
                minHeight: 42,
                borderRadius: 12,
                border: `1px solid ${visualIdentity.colors.gold}`,
                background: visualIdentity.gradients.gold,
                color: visualIdentity.colors.navy,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 10,
                fontWeight: 900,
                boxShadow: "0 6px 14px rgba(255,184,0,0.18)",
              }}
            >
              <span aria-hidden="true" style={{ fontSize: 16, lineHeight: 1 }}>+</span>
              <span>إضافة</span>
            </button>
            <button
              type="button"
              onClick={submitExpense}
              title="تسجيل المصروف مباشرة"
              aria-label="تسجيل مصروف"
              style={{
                width: 84,
                minHeight: 42,
                borderRadius: 12,
                border: `1px solid ${visualIdentity.colors.green}88`,
                background: visualIdentity.gradients.positive,
                color: "#A4FFC8",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 9,
                fontWeight: 900,
                boxShadow: "0 6px 14px rgba(4,201,92,0.12)",
              }}
            >
              <span aria-hidden="true" style={{ fontSize: 13, lineHeight: 1 }}>✓</span>
              <span>{pendingCount > 0 ? "تسجيل القائمة" : "تسجيل مصروف"}</span>
            </button>
            <input
              ref={amountInputRef}
              className="expense-amount-input"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="المبلغ"
              style={{ ...G.inp(), minHeight: 42, marginBottom: 0, fontSize: 18, direction: "rtl" }}
            />
          </div>

          <PaymentMethodSelector
            options={paymentOptionsWithAmounts}
            value={paymentMethod}
            activeValues={activePaymentMethods}
            onChange={changePaymentMethod}
            variant="glass"
          />
                    {(paymentMethod === "card" ||
            (paymentMethod === "cash" && deficitFundingType === "card") ||
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
              {(paymentMethod === "card" ||
                (paymentMethod === "cash" && deficitFundingType === "card")) && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    alignItems: "stretch",
                    gap: 7,
                    direction: "ltr",
                  }}
                >
                  <select
                    value={selectedPaymentCard ? cardId : ""}
                    onChange={(e) => setCardId(e.target.value)}
                    style={{ ...G.inp(), marginBottom: 0, minWidth: 0 }}
                  >
                    <option value="">
                      {availableCards.length
                        ? "اختر البطاقة"
                        : "لا توجد بطاقة بسقف متاح"}
                    </option>
                    {availableCards.map((c) => {
                      const available = Math.max(
                        0,
                        Number(c.creditLimit || 0) - Number(c.balance || 0)
                      );
                      return (
                        <option key={c.id} value={c.id}>
                          {c.name} — متاح {available.toFixed(2)}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {paymentMethod === "liability" && !isMixedPayment && (
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
                        value={`مصروف ${category || "غير مصنف"} طارئ`}
                        readOnly
                        aria-label="اسم الالتزام الطارئ"
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
                سقف الصرف لا يغطي كامل المصروف. يغطي {Number(
                  budget.remainingCap || 0
                ).toFixed(2)} {localeCurrencyLabel}، اختر أسلوب تمويل الفرق ({uncoveredAmount.toFixed(2)} {localeCurrencyLabel})
              </div>

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
            const salary = Number(state.settings?.salary || 0);
            if (salary <= 0) {
              alert("أدخل الراتب أولاً قبل بدء الشهر");
              return;
            }
            if (structuralTotal > salary) {
              alert("مجموع الالتزامات الهيكلية لا يجوز أن يتجاوز الراتب");
              return;
            }
            const net = salary - structuralTotal;
            const selectedCap = Math.min(
              Math.max(0, Number(state.settings?.spendingCap ?? state.session?.spendingCap ?? 0)),
              net
            );
            const salarySurplus = Math.max(0, net - selectedCap);
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
                  spendingCap: selectedCap,
                  plannedSavings: salarySurplus,
                  date: new Date().toISOString(),
                },
              ],

              session: {
                ...p.session,
                isOpen: true,
                salaryNetAfterStructural: net,
                salaryNetAfterCurrentLiabilities: net,
                spendingCap: selectedCap,
                coveredSpent: 0,
                overBudgetSpent: 0,
                savingsAmount: salarySurplus,
                pendingSurplus: salarySurplus,
              },
            }));
            if (salarySurplus > 0.01) {
              window.setTimeout(() => onAllocateSurplus(salarySurplus), 0);
            }
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
        directSubmit={Boolean(
          deficitTransfer?.sources
            ?.find((source) => source.key === deficitTransfer?.fromAsset)
            ?.type &&
            ["cash", "bank"].includes(
              deficitTransfer.sources.find((source) => source.key === deficitTransfer.fromAsset)?.type
            )
        )}
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
          <b>
            {selectedExpenseFundingLabel
              ? `كاش + ${selectedExpenseFundingLabel}`
              : selectedExpense.paymentMethod}
          </b>
        </div>
        {selectedExpensePaymentParts.length > 0 && (
          <div
            style={{
              display: "grid",
              gap: 6,
              padding: "7px 0",
              borderBottom: "1px solid rgba(255,255,255,0.10)",
            }}
          >
            {selectedExpensePaymentParts.map((part) => (
              <div
                key={part.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 8,
                  color: HOME_UI.muted,
                  fontSize: 11,
                }}
              >
                <span>{part.label}</span>
                <b style={{ color: part.color }}>
                  {Number(part.amount || 0).toFixed(2)} {localeCurrencyLabel}
                </b>
              </div>
            ))}
          </div>
        )}

        <div style={HOME_UI.row}>
          <span style={{ color: HOME_UI.muted }}>الملاحظة</span>
          <b style={{ textAlign: "left", maxWidth: "62%" }}>
            {selectedExpense.note || "بدون ملاحظة"}
          </b>
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
        {selectedExpenseFundingLabel && (
          <div style={HOME_UI.lastRow}>
            <span style={{ color: HOME_UI.muted }}>تغطية مبلغ التجاوز</span>
            <b style={{ color: visualIdentity.colors.cyan }}>
              {selectedExpenseFundingLabel} · {Number(
                selectedExpenseFunding.amount || selectedExpense.overBudget || 0
              ).toFixed(2)} {localeCurrencyLabel}
            </b>
          </div>
        )}
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
        selectExpenseCategory(catItem.label);
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

const aiReportParagraphStyle = {
  margin: 0,
  color: "rgba(255,255,255,0.72)",
  fontSize: 10,
  lineHeight: 1.8,
};

function ReportGlassBlock({ title, children }) {
  return (
    <section
      style={{
        marginTop: 12,
        padding: 12,
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.08)",
      }}
    >
      <h3 style={{ margin: "0 0 8px", color: "#F5C842", fontSize: 13, fontWeight: 900 }}>
        {title}
      </h3>
      {children}
    </section>
  );
}

function AiReportList({ items, color = "rgba(255,255,255,0.72)" }) {
  const rows = Array.isArray(items) ? items.filter(Boolean) : [];
  if (!rows.length) {
    return (
      <div style={{ color: "rgba(255,255,255,0.48)", fontSize: 10 }}>
        لا توجد ملاحظات كافية.
      </div>
    );
  }
  return (
    <ul style={{ margin: 0, paddingInlineStart: 18, color, fontSize: 10, lineHeight: 1.8 }}>
      {rows.map((item, index) => (
        <li key={`${item}-${index}`}>{item}</li>
      ))}
    </ul>
  );
}

function ReportsScreen({ state }) {
  const [reportView, setReportView] = useState("overview");
  const [expenseReportView, setExpenseReportView] = useState("distribution");
  const [assetReportView, setAssetReportView] = useState("distribution");
  const [showAssetTrendDetails, setShowAssetTrendDetails] = useState(false);
  const [showExpenseReport, setShowExpenseReport] = useState(false);
  const [showOverBudgetReport, setShowOverBudgetReport] = useState(false);
  const [assetTrendMonths, setAssetTrendMonths] = useState(6);
  const [selectedTrendAssetKey, setSelectedTrendAssetKey] = useState("");
  const [expenseChartMode, setExpenseChartMode] = useState("donut");
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [aiWealthReport, setAiWealthReport] = useState(null);
  const [aiWealthReportLoading, setAiWealthReportLoading] = useState(false);
  const [aiWealthReportError, setAiWealthReportError] = useState("");
  const [selectedHeatmapMonth, setSelectedHeatmapMonth] = useState({
    baseMonth: state.currentMonth || new Date().toISOString().slice(0, 7),
    month: state.currentMonth || new Date().toISOString().slice(0, 7),
  });
  const expenses = [...(state.expenses || [])].reverse();
  const total = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const reportBudget = calcBudget(state);
  const remainingSpendingCap = Math.max(0, Number(reportBudget.remainingCap || 0));
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
    title: expense.category || "غير مصنف",
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

  const currentExpensesByCategory = buildExpensesByCategory(state.expenses || []);
  const previousSnapshots = (state.monthlySnapshots || [])
    .filter((snapshot) => String(snapshot.month || "") < String(state.currentMonth || ""))
    .sort((a, b) => String(a.month).localeCompare(String(b.month)));
  const previousSnapshot = previousSnapshots[previousSnapshots.length - 1] || null;
  const reportCategoryMap = new Map();
  DEFAULT_EXPENSE_CATEGORIES.forEach((category) =>
    reportCategoryMap.set(category.label, category)
  );
  (state.expenseCategories?.items || []).forEach((category) =>
    reportCategoryMap.set(category.label, {
      ...reportCategoryMap.get(category.label),
      ...category,
      color: category.color || CC[category.label] || visualIdentity.colors.cyan,
    })
  );
  Object.keys({
    ...currentExpensesByCategory,
    ...(state.settings?.expenseCategoryCaps || {}),
  }).forEach((label) => {
    if (!reportCategoryMap.has(label)) {
      reportCategoryMap.set(label, {
        id: `report-${label}`,
        label,
        icon: CAT_ICONS[label] || "•",
        color: CC[label] || visualIdentity.colors.cyan,
      });
    }
  });
  const reportCategories = Array.from(reportCategoryMap.values());
  const expenseTrendMap = new Map();
  (state.monthlySnapshots || []).forEach((snapshot) => {
    const value = (snapshot.expenses || []).reduce(
      (sum, expense) => sum + Number(expense.amount || 0),
      0
    );
    expenseTrendMap.set(snapshot.month, { month: snapshot.month, value });
  });
  expenseTrendMap.set(state.currentMonth, { month: state.currentMonth, value: total });
  const expenseTrendPoints = Array.from(expenseTrendMap.values())
    .sort((a, b) => String(a.month).localeCompare(String(b.month)))
    .slice(-6);
  const heatmapSnapshots = new Map();
  (state.monthlySnapshots || []).forEach((snapshot) => {
    if (!snapshot.month) return;
    heatmapSnapshots.set(snapshot.month, snapshot);
  });
  const heatmapMonthOptions = [
    ...Array.from(heatmapSnapshots.values())
      .sort((a, b) => String(a.month).localeCompare(String(b.month)))
      .map((snapshot) => ({
        value: snapshot.month,
        label: formatMonthKey(snapshot.month),
      })),
    {
      value: state.currentMonth || new Date().toISOString().slice(0, 7),
      label: formatMonthKey(state.currentMonth || new Date().toISOString().slice(0, 7)),
    },
  ].filter(
    (option, index, rows) =>
      rows.findIndex((row) => row.value === option.value) === index
  );
  const currentHeatmapMonth = state.currentMonth || new Date().toISOString().slice(0, 7);
  const activeHeatmapMonth =
    selectedHeatmapMonth.baseMonth === currentHeatmapMonth
      ? selectedHeatmapMonth.month
      : currentHeatmapMonth;
  const selectedHeatmapSnapshot = heatmapSnapshots.get(activeHeatmapMonth);
  const heatmapExpenses = selectedHeatmapSnapshot
    ? selectedHeatmapSnapshot.expenses || []
    : state.expenses || [];
  const heatmapDailyTotals =
    selectedHeatmapSnapshot?.dailySpendingHeatmap?.dailyTotals || null;
  const reportAssetGroups = {
    cash: 0,
    banks: 0,
    gold: 0,
    stocks: 0,
    other: 0,
  };
  assetBreakdownFromAssets(state.assets || {}, state.settings?.market || {}).forEach(
    (item) => {
      const key = String(item.key || "");
      const group =
        key === "cash"
          ? "cash"
          : key.startsWith("bank:")
          ? "banks"
          : key.startsWith("gold:")
          ? "gold"
          : key.startsWith("stock:")
          ? "stocks"
          : "other";
      reportAssetGroups[group] += Number(item.value || 0);
    }
  );
  const reportAssetDistributionTotal = Object.values(reportAssetGroups).reduce(
    (sum, value) => sum + Number(value || 0),
    0
  );
  const reportAssetDistribution = [
    { key: "cash", label: "كاش", value: reportAssetGroups.cash, color: visualIdentity.colors.green },
    { key: "banks", label: "بنوك", value: reportAssetGroups.banks, color: visualIdentity.colors.sky },
    { key: "gold", label: "ذهب", value: reportAssetGroups.gold, color: visualIdentity.semantic.warning },
    { key: "stocks", label: "أسهم", value: reportAssetGroups.stocks, color: visualIdentity.colors.purple },
    { key: "other", label: "أخرى", value: reportAssetGroups.other, color: visualIdentity.colors.coral },
  ]
    .filter((item) => item.value > 0)
    .map((item) => ({
      ...item,
      percent:
        reportAssetDistributionTotal > 0
          ? (item.value / reportAssetDistributionTotal) * 100
          : 0,
    }));
  const reportGoldCost = (state.assets?.gold || []).reduce(
    (sum, item) => sum + Number(item.units || 0) * Number(item.wac || 0),
    0
  );
  const reportStockCost = (state.assets?.stocks || []).reduce(
    (sum, item) => sum + Number(item.units || 0) * Number(item.wac || 0),
    0
  );
  const reportChange = (value, cost) =>
    Number(cost || 0) > 0
      ? ((Number(value || 0) - Number(cost || 0)) / Number(cost || 0)) * 100
      : 0;
  const reportAssetSummaryItems = [
    { key: "cash", label: "كاش", value: reportAssetGroups.cash, change: 0, color: visualIdentity.colors.green },
    { key: "banks", label: "بنوك", value: reportAssetGroups.banks, change: 0, color: visualIdentity.colors.sky },
    { key: "gold", label: "ذهب", value: reportAssetGroups.gold, change: reportChange(reportAssetGroups.gold, reportGoldCost), color: visualIdentity.semantic.warning },
    { key: "stocks", label: "أسهم", value: reportAssetGroups.stocks, change: reportChange(reportAssetGroups.stocks, reportStockCost), color: visualIdentity.colors.purple },
    { key: "other", label: "أخرى", value: reportAssetGroups.other, change: 0, color: visualIdentity.colors.coral },
  ];
  const paymentMethodsSummary = expenses.reduce((summary, expense) => {
    const key = expense.paymentMethod || "غير محدد";
    const current = summary[key] || { count: 0, total: 0 };
    current.count += 1;
    current.total = Number(
      (Number(current.total || 0) + Number(expense.originalAmount ?? expense.amount ?? 0)).toFixed(2)
    );
    summary[key] = current;
    return summary;
  }, {});
  const buildAiWealthPayload = () => ({
    currency: getCurrencyLabel(state),
    month: state.currentMonth || new Date().toISOString().slice(0, 7),
    summary: {
      salary: Number(state.settings?.salary || 0),
      monthlyCap: Number(reportBudget.spendingCap || 0),
      totalExpenses: Number(total || 0),
      remainingCap: Number(remainingSpendingCap || 0),
      savingsTotal: Number(state.session?.savingsAmount || 0),
      assetsTotal: Number(currentAssets.totalAssets || 0),
      liabilitiesTotal: Number(currentAssets.currentLiabilities || 0),
      netWorth: Number(currentAssets.netWorth || 0),
    },
    expensesByCategory: currentExpensesByCategory,
    recentExpenses: expenses.slice(0, 20).map((expense) => ({
      date: expense.date || expense.createdAt || "",
      category: expense.category || "غير مصنف",
      amount: Number(expense.originalAmount ?? expense.amount ?? 0),
      paymentMethod: expense.paymentMethod || "",
      overBudget: Number(expense.overBudget || 0),
      note: expense.note || "",
    })),
    assetsSummary: reportAssetSummaryItems.map((item) => ({
      label: item.label,
      value: Number(item.value || 0),
      changePct: Number(item.change || 0),
    })),
    assetsChanges: assetDetailRows.slice(0, 12).map((item) => ({
      label: item.label,
      change: Number(item.change || 0),
      months: (item.months || []).map((month) => ({
        month: month.month,
        change: Number(month.change || 0),
      })),
    })),
    paymentMethodsSummary,
  });
  const requestAiWealthReport = async () => {
    setAiWealthReportLoading(true);
    setAiWealthReportError("");
    try {
      const response = await fetch("/api/ai-wealth-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildAiWealthPayload()),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "تعذر إعداد التقرير الذكي حالياً. حاول مرة أخرى.");
      }
      setAiWealthReport(data);
    } catch (error) {
      setAiWealthReportError(error.message || "تعذر إعداد التقرير الذكي حالياً. حاول مرة أخرى.");
    } finally {
      setAiWealthReportLoading(false);
    }
  };

  return (
    <div style={G.scr}>
      {reportView === "overview" && (
        <ReportsOverview
          spendingCap={Number(reportBudget.spendingCap || 0)}
          totalExpenses={total}
          overBudget={overBudgetTotal}
          currencyLabel={getCurrencyLabel(state)}
          onOpen={(nextView) => {
            if (nextView === "assets") setAssetReportView("distribution");
            setReportView(nextView);
          }}
        />
      )}

      {reportView === "expenses" && (
        <>
          <ReportViewHeader
            title="تقارير المصروفات"
            subtitle="تحليل المصروفات ومراقبة سقوف البنود"
            onBack={() => setReportView("overview")}
          />
          <ExpenseReportTabs
            active={expenseReportView}
            onChange={setExpenseReportView}
          />

          {expenseReportView === "distribution" && (
            <>
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
                  centerValue={remainingSpendingCap}
                  centerLabel="المتبقي من السقف"
                  centerColor={
                    remainingSpendingCap > 0
                      ? visualIdentity.colors.green
                      : visualIdentity.colors.red
                  }
                />
              </ExpenseSummaryReportCard>
              <ExpenseReportLauncher onOpen={() => setShowExpenseReport(true)} />
            </>
          )}

          {expenseReportView === "trend" && (
            <MonthlyExpenseTrendCard points={expenseTrendPoints} />
          )}

          {expenseReportView === "caps" && (
            <CategoryBudgetGauges
              categories={reportCategories}
              expensesByCategory={currentExpensesByCategory}
              caps={state.settings?.expenseCategoryCaps || {}}
            />
          )}

          {expenseReportView === "heatmap" && (
            <DailySpendingHeatmap
              expenses={heatmapExpenses}
              monthKey={activeHeatmapMonth}
              dailyTotals={heatmapDailyTotals}
              monthOptions={heatmapMonthOptions}
              onMonthChange={(month) =>
                setSelectedHeatmapMonth({ baseMonth: currentHeatmapMonth, month })
              }
            />
          )}

          {expenseReportView === "highlights" && (
            <MonthlyHighlights
              currentByCategory={currentExpensesByCategory}
              previousByCategory={
                previousSnapshot?.expensesByCategory ||
                buildExpensesByCategory(previousSnapshot?.expenses || [])
              }
              previousMonth={previousSnapshot?.month || "—"}
            />
          )}

          {expenseReportView === "statement" && (
            <section
              className="asset-dashboard-card"
              style={{
                padding: 14,
                borderRadius: 20,
                border: visualIdentity.cards.outer.border,
                background: visualIdentity.gradients.outerCard,
                boxShadow: visualIdentity.cards.outer.boxShadow,
              }}
            >
              <div style={{ color: visualIdentity.colors.gold, fontSize: 15, fontWeight: 900 }}>
                كشف المصروفات
              </div>
              <div style={{ margin: "4px 0 12px", color: visualIdentity.colors.textSecondary, fontSize: 9 }}>
                عرض تفاصيل المصروفات وطرق الدفع ومصادر التغطية
              </div>
              <ExpenseReportLauncher onOpen={() => setShowExpenseReport(true)} />
            </section>
          )}
        </>
      )}

      {reportView === "weeklyAi" && (
        <>
          <ReportViewHeader
            title="تقرير AI الأسبوعي"
            subtitle="تحليل أسبوع أو أكثر من البيانات مع نصائح مالية ذكية"
            onBack={() => setReportView("overview")}
          />
          <section
            className="asset-dashboard-card"
            style={{
              padding: 16,
              borderRadius: 20,
              border: `1px solid ${visualIdentity.colors.purple}55`,
              background: `linear-gradient(145deg, ${visualIdentity.colors.purple}20, rgba(35,84,145,0.92))`,
              boxShadow: visualIdentity.cards.outer.boxShadow,
              color: visualIdentity.colors.white,
            }}
          >
            <div style={{ color: visualIdentity.colors.gold, fontSize: 15, fontWeight: 900 }}>
              تحليل ذكي للمصاريف والأصول
            </div>
            <div style={{ marginTop: 6, color: visualIdentity.colors.textSecondary, fontSize: 10, lineHeight: 1.7 }}>
              يرسل ملخصاً محدوداً من بيانات الشهر الحالي والأصول والحركة إلى الذكاء الاصطناعي لإعداد تقرير مرتب.
            </div>
            <button
              type="button"
              onClick={requestAiWealthReport}
              disabled={aiWealthReportLoading}
              style={{
                width: "100%",
                minHeight: 44,
                marginTop: 14,
                border: 0,
                borderRadius: 13,
                background: "linear-gradient(135deg, #F5C842, #FFB800)",
                color: visualIdentity.colors.navy,
                fontFamily: "inherit",
                fontSize: 13,
                fontWeight: 900,
                cursor: aiWealthReportLoading ? "not-allowed" : "pointer",
                opacity: aiWealthReportLoading ? 0.68 : 1,
              }}
            >
              {aiWealthReportLoading ? "جاري إعداد التقرير الذكي..." : "تحليل ذكي"}
            </button>
            {aiWealthReportError && (
              <div style={{ marginTop: 10, color: "#FF6B6B", fontSize: 10, fontWeight: 800 }}>
                {aiWealthReportError}
              </div>
            )}
          </section>

          {aiWealthReport && (
            <section
              className="asset-dashboard-card"
              style={{
                marginTop: 13,
                padding: 16,
                borderRadius: 20,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "linear-gradient(145deg, #245180, #2E6494 52%, #3A74A6)",
                boxShadow: visualIdentity.cards.outer.boxShadow,
                color: visualIdentity.colors.white,
              }}
            >
              <h2 style={{ margin: 0, color: "#F5C842", fontSize: 20, fontWeight: 900 }}>
                {aiWealthReport.title || "تقرير الثروة الذكي"}
              </h2>
              <ReportGlassBlock title="الملخص التنفيذي">
                <p style={aiReportParagraphStyle}>{aiWealthReport.executiveSummary}</p>
              </ReportGlassBlock>
              <ReportGlassBlock title="درجة الصحة المالية">
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <strong style={{ color: "#F5C842", fontSize: 28, fontWeight: 900 }}>
                    {Number(aiWealthReport.healthScore || 0).toFixed(0)}
                  </strong>
                  <span style={{ color: visualIdentity.colors.textSecondary, fontSize: 11 }}>
                    {aiWealthReport.status || "يحتاج انتباه"}
                  </span>
                </div>
              </ReportGlassBlock>
              <ReportGlassBlock title="أهم الملاحظات">
                <AiReportList items={aiWealthReport.keyInsights} />
              </ReportGlassBlock>
              <ReportGlassBlock title="تحليل المصاريف">
                <p style={aiReportParagraphStyle}>{aiWealthReport.expenseAnalysis?.summary}</p>
                <AiReportList items={aiWealthReport.expenseAnalysis?.highestCategories} />
                <AiReportList items={aiWealthReport.expenseAnalysis?.warnings} color="#FF6B6B" />
              </ReportGlassBlock>
              <ReportGlassBlock title="تحليل الأصول">
                <p style={aiReportParagraphStyle}>{aiWealthReport.assetsAnalysis?.summary}</p>
                <AiReportList items={aiWealthReport.assetsAnalysis?.positiveMovements} color="#52E5A0" />
                <AiReportList items={aiWealthReport.assetsAnalysis?.negativeMovements} color="#FF6B6B" />
              </ReportGlassBlock>
              <ReportGlassBlock title="التوصيات">
                {(aiWealthReport.recommendations || []).map((item, index) => {
                  const priorityColor =
                    item.priority === "high"
                      ? "#FF6B6B"
                      : item.priority === "low"
                        ? "#52E5A0"
                        : "#F5C842";
                  return (
                    <div key={`${item.title}-${index}`} style={{ marginTop: index ? 10 : 0 }}>
                      <b style={{ color: priorityColor, fontSize: 12 }}>{item.title}</b>
                      <div style={{ marginTop: 3, color: visualIdentity.colors.textSecondary, fontSize: 10, lineHeight: 1.7 }}>
                        {item.description}
                      </div>
                    </div>
                  );
                })}
              </ReportGlassBlock>
              <ReportGlassBlock title="خطوات مقترحة">
                <AiReportList items={aiWealthReport.nextActions} color="#F5C842" />
              </ReportGlassBlock>
              <div style={{ marginTop: 12, color: visualIdentity.colors.textFaint, fontSize: 9, lineHeight: 1.7 }}>
                {aiWealthReport.disclaimer}
              </div>
            </section>
          )}
        </>
      )}

      {reportView === "assets" && (
        <>
          <ReportViewHeader
            title="تقارير الأصول"
            subtitle="نمو الأصول وتوزيعها وأبرز التغيرات الشهرية"
            onBack={() => setReportView("overview")}
          />
          <AssetReportTabs active={assetReportView} onChange={setAssetReportView} />

          {assetReportView === "growth" && (
            <AssetTrendReportCard
              change={assetChange}
              changePct={assetChangePct}
              changeColor={assetChangeColor}
              currentAssets={Number(lastAssetPoint?.totalAssets || 0)}
              months={assetTrendMonths}
              bars={assetTrendBars}
              points={assetTrendPoints}
              detailsOpen={showAssetTrendDetails}
              onToggleDetails={() => setShowAssetTrendDetails((value) => !value)}
              onMonthsChange={setAssetTrendMonths}
            />
          )}

          {assetReportView === "distribution" && (
            <AssetDistributionCard
              distribution={reportAssetDistribution}
              totalAssets={reportAssetDistributionTotal}
              currencyLabel={getCurrencyLabel(state)}
              summaryItems={reportAssetSummaryItems}
              variant="detailed"
            />
          )}
        </>
      )}

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
  const getGoldUnitPrice = (item) =>
    Number(item?.currentPrice || 0) || goldPrice || Number(item?.wac || 0);
  const getSilverUnitPrice = (item) =>
    Number(item?.currentPrice || 0) || silverPrice || Number(item?.wac || 0);
  const getGenericUnitPrice = (item) =>
    Number(item?.currentPrice || 0) || Number(item?.price || 0);
  const getGenericReferencePrice = (item) =>
    Number(item?.wac ?? item?.price ?? 0);
  const goldTotal = (state.assets.gold || []).reduce(
    (sum, g) => sum + Number(g.units || 0) * getGoldUnitPrice(g),
    0
  );
  const silverTotal = (state.assets.silver || []).reduce(
    (sum, s) => sum + Number(s.units || 0) * getSilverUnitPrice(s),
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
    return sum + Number(c.units || 0) * getGenericUnitPrice(c);
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
      existing.currentPrice = purchasePrice;
    } else {
      next.assets.gold.push({
        id,
        label: name,
        units: newUnits,
        wac: purchasePrice,
        currentPrice: purchasePrice,
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
      existing.currentPrice = purchasePrice;
    } else {
      next.assets.silver.push({
        id,
        label: name,
        units: newUnits,
        wac: purchasePrice,
        currentPrice: purchasePrice,
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
      const oldPrice = Number(existing.wac ?? existing.price ?? 0);

      const oldValue = oldUnits * oldPrice;
      const newValue = newUnits * purchasePrice;
      const totalUnits = oldUnits + newUnits;

      existing.units = Number(totalUnits.toFixed(4));
      existing.wac =
        totalUnits > 0
          ? Number(((oldValue + newValue) / totalUnits).toFixed(4))
          : purchasePrice;
      existing.price = existing.wac;
      existing.currentPrice = purchasePrice;
    } else {
      next.assets.custom.push({
        id,
        name,
        type: "unit",
        units: newUnits,
        price: purchasePrice,
        wac: purchasePrice,
        currentPrice: purchasePrice,
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
          type === "custom" ? Number(existing.wac ?? existing.price ?? 0) : Number(existing.wac || 0);
        const totalUnits = oldUnits + row.units;
        const nextAverage =
          totalUnits > 0
            ? Number(((oldUnits * oldAverage + row.amount) / totalUnits).toFixed(4))
            : row.price;

        existing.units = Number(totalUnits.toFixed(4));
        if (type === "custom") {
          existing.wac = nextAverage;
          existing.price = nextAverage;
        } else {
          existing.wac = nextAverage;
        }
        if (["stocks", "gold", "silver", "custom"].includes(listName)) {
          existing.currentPrice = row.price;
        }
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
            wac: row.price,
            currentPrice: row.price,
          });
        } else {
          list.push({
            id,
            label: row.assetName,
            units: row.units,
            wac: row.price,
            currentPrice: row.price,
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
    value: Number(stock.units || 0) * (Number(stock.currentPrice || 0) || Number(stock.wac || 0)),
    meta: `اليوم ${Number(stock.currentPrice || stock.wac || 0).toFixed(2)} · متوسط ${Number(stock.wac || 0).toFixed(2)}`,
  }));
  const goldAssetRows = (state.assets.gold || []).map((gold) => ({
    id: gold.id,
    name: gold.label,
    value: Number(gold.units || 0) * getGoldUnitPrice(gold),
    meta: `اليوم ${getGoldUnitPrice(gold).toFixed(2)} · متوسط ${Number(gold.wac || 0).toFixed(2)}`,
    metaColor: visualIdentity.colors.textSecondary,
    metaWeight: 700,
  }));
  const silverAssetRows = (state.assets.silver || []).map((silver) => ({
    id: silver.id,
    name: silver.label,
    value: Number(silver.units || 0) * getSilverUnitPrice(silver),
    meta: `اليوم ${getSilverUnitPrice(silver).toFixed(2)} · متوسط ${Number(silver.wac || 0).toFixed(2)}`,
  }));
  const customAssetRows = (state.assets.custom || []).map((asset) => ({
    id: asset.id,
    name: asset.name,
    value:
      asset.type === "fixed"
        ? Number(asset.amount || 0)
        : Number(asset.units || 0) * getGenericUnitPrice(asset),
    meta:
      asset.type === "unit"
        ? `اليوم ${getGenericUnitPrice(asset).toFixed(2)} · متوسط ${getGenericReferencePrice(asset).toFixed(2)}`
        : "",
  }));

  const formatAssetUnits = (units, kind) => {
    const value = Number(units || 0);
    if (!value) return "";
    if (["gold", "silver"].includes(kind)) return `${value.toFixed(2)} غم`;
    if (kind === "stocks") return `${Math.round(value)} سهم`;
    return `${Math.round(value)} وحدة`;
  };
  const assetNameWithUnits = (name, units, kind) => {
    const unitText = formatAssetUnits(units, kind);
    return unitText ? `${name} ${unitText}` : name;
  };
  const todayKey = getDateKey(new Date());
  const currentMonthKey = state.currentMonth || new Date().toISOString().slice(0, 7);
  const previousMonthSnapshot = [...(state.monthlySnapshots || [])]
    .filter((snapshot) => String(snapshot.month || "") < String(currentMonthKey))
    .sort((a, b) => String(a.month).localeCompare(String(b.month)))
    .at(-1);
  const monthStartBreakdown = new Map(
    assetBreakdownFromAssets(
      previousMonthSnapshot?.assets || {},
      state.settings?.market || {}
    ).map((item) => [item.key, Number(item.value || 0)])
  );
  const monthStartTotal = previousMonthSnapshot
    ? Number(previousMonthSnapshot.assetTotals?.totalAssets || 0)
    : Number(assets.totalAssets || 0);
  const dailySnapshots = [...(state.assetDailySnapshots || [])]
    .filter((snapshot) => snapshot?.date)
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const previousDailySnapshot = dailySnapshots
    .filter((snapshot) => String(snapshot.date) < todayKey)
    .at(-1);
  const referenceAssetSnapshot = previousDailySnapshot || previousMonthSnapshot;
  const referenceBreakdown = new Map(
    assetBreakdownFromAssets(
      referenceAssetSnapshot?.assets || {},
      state.settings?.market || {}
    ).map((item) => [item.key, Number(item.value || 0)])
  );
  const previousChangePct = (assetKey, currentValue) => {
    const startValue = referenceBreakdown.has(assetKey)
      ? Number(referenceBreakdown.get(assetKey) || 0)
      : monthStartBreakdown.has(assetKey)
        ? Number(monthStartBreakdown.get(assetKey) || 0)
      : Number(currentValue || 0);
    if (startValue <= 0) return 0;
    return ((Number(currentValue || 0) - startValue) / startValue) * 100;
  };
  const compactAssetTrendPoints = () => {
    const daily = new Map([[`${currentMonthKey}-01`, Number(monthStartTotal || 0)]]);
    dailySnapshots
      .filter(
        (snapshot) =>
          String(snapshot.date) <= todayKey &&
          (snapshot.month === currentMonthKey || getMonthKey(snapshot.date) === currentMonthKey)
      )
      .forEach((snapshot) => {
        daily.set(
          snapshot.date,
          Number(Number(snapshot.assetTotals?.totalAssets || 0).toFixed(2))
        );
      });
    daily.set(todayKey, Number(Number(assets.totalAssets || 0).toFixed(2)));

    const points = [...daily.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value], index, rows) => ({
        label:
          index === 0
            ? "بداية"
            : index === rows.length - 1
              ? "اليوم"
              : new Date(date).toLocaleDateString("en-US", { day: "2-digit", month: "2-digit" }),
        value: Number(Number(value || 0).toFixed(2)),
      }));

    const values = points.map((point) => Number(point.value || 0));
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    if (points.length > 1 && maxValue - minValue < 0.01) {
      return points.map((point) => ({ ...point, value: Number(maxValue.toFixed(2)) }));
    }

    if (points.length <= 7) return points;
    const weekly = points.filter((_, index) => index === 0 || index === points.length - 1 || index % 7 === 0);
    return weekly.length >= 2 ? weekly : points.slice(-7);
  };
  const dashboardRows = [
    {
      id: "cash",
      assetKey: "cash",
      assetKind: "cash",
      name: "الكاش الادخاري",
      value: Number(state.assets.cash || 0),
      change: previousChangePct("cash", Number(state.assets.cash || 0)),
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
      change: previousChangePct(`bank:${item.id}`, Number(item.balance || 0)),
      icon: "bank",
      color: visualIdentity.colors.sky,
      meta: "حساب بنكي",
    })),
    ...(state.assets.gold || []).map((item) => ({
      id: `gold-${item.id}`,
      assetKey: `gold:${item.id}`,
      assetKind: "gold",
      assetId: item.id,
      name: assetNameWithUnits(item.label, item.units, "gold"),
      value: Number(item.units || 0) * getGoldUnitPrice(item),
      change: previousChangePct(`gold:${item.id}`, Number(item.units || 0) * getGoldUnitPrice(item)),
      icon: "gold",
      color: "#FFC62D",
      meta: `اليوم ${getGoldUnitPrice(item).toFixed(2)} · متوسط ${Number(item.wac || 0).toFixed(2)}`,
    })),
    ...(state.assets.stocks || []).map((item) => ({
      id: `stock-${item.id}`,
      assetKey: `stock:${item.id}`,
      assetKind: "stocks",
      assetId: item.id,
      name: assetNameWithUnits(item.name, item.units, "stocks"),
      value: Number(item.units || 0) * (Number(item.currentPrice || 0) || Number(item.wac || 0)),
      change: previousChangePct(`stock:${item.id}`, Number(item.units || 0) * (Number(item.currentPrice || 0) || Number(item.wac || 0))),
      icon: "stock",
      color: visualIdentity.colors.purple,
      meta: `اليوم ${Number(item.currentPrice || item.wac || 0).toFixed(2)} · متوسط ${Number(item.wac || 0).toFixed(2)}`,
    })),
    ...(state.assets.silver || []).map((item) => ({
      id: `silver-${item.id}`,
      assetKey: `silver:${item.id}`,
      assetKind: "silver",
      assetId: item.id,
      name: assetNameWithUnits(item.label, item.units, "silver"),
      value: Number(item.units || 0) * getSilverUnitPrice(item),
      change: previousChangePct(`silver:${item.id}`, Number(item.units || 0) * getSilverUnitPrice(item)),
      icon: "silver",
      color: "#B7D3EA",
      meta: `اليوم ${getSilverUnitPrice(item).toFixed(2)} · متوسط ${Number(item.wac || 0).toFixed(2)}`,
    })),
    ...(state.assets.custom || []).map((item) => ({
      id: `custom-${item.id}`,
      assetKey: `custom:${item.id}`,
      assetKind: "custom",
      assetId: item.id,
      name: item.type === "unit" ? assetNameWithUnits(item.name, item.units, "custom") : item.name,
      value: item.type === "fixed"
        ? Number(item.amount || 0)
        : Number(item.units || 0) * getGenericUnitPrice(item),
      change: previousChangePct(
        `custom:${item.id}`,
        item.type === "fixed"
          ? Number(item.amount || 0)
          : Number(item.units || 0) * getGenericUnitPrice(item)
      ),
      icon: item.type === "fixed" ? "fixed" : "goods",
      color: "#42CFE6",
      meta: item.type === "unit"
        ? `اليوم ${getGenericUnitPrice(item).toFixed(2)} · متوسط ${getGenericReferencePrice(item).toFixed(2)}`
        : "أصل ثابت",
    })),
  ];
  const movementLabels = {
    asset_units_liquidated: "تسييل وحدات من الأصل",
    expense_paid_from_asset: "خصم مصروف من أصل",
    over_budget_covered_from_asset: "خصم لتغطية تجاوز السقف",
    emergency_expense_covered_from_asset: "خصم لمصروف طارئ",
    reserved_asset_payment_paid: "سداد برسم الدفع للأصل",
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
        const directKeyMatch =
          Boolean(row.assetKey) &&
          [
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
        const incomingMovementTypes = [
          "reserved_asset_payment_paid",
          "opening_balance",
          "opening_asset",
          "extra_cash",
          "transfer_to_cash",
          "transfer_to_bank",
          "transfer_in_units",
        ];
        const isIncoming = incomingMovementTypes.includes(movement.type);
        const isOutgoing =
          !isIncoming &&
          (movement.assetKey === row.assetKey ||
            movement.from === row.assetKey ||
            (["transfer_out", "asset_units_liquidated"].includes(movement.type) &&
              movement.destinationKey !== row.assetKey));
        const date = movement.date ? new Date(movement.date) : null;
        const sortTime = new Date(movement.recordedAt || movement.createdAt || 0);
        const movementUnits =
          movement.unitsSold ??
          movement.unitsAdded ??
          movement.units ??
          null;
        const unitText =
          movementUnits != null && Number(movementUnits || 0) > 0
            ? `${isOutgoing ? "−" : "+"}${formatAssetUnits(movementUnits, row.assetKind)}`
            : "";
        const unitPriceText =
          Number(movement.unitPrice || 0) > 0
            ? `اليوم ${Number(movement.unitPrice || 0).toFixed(2)}`
            : "";
        const expenseMovementLabel = movement.displayLabel
          || [
            movement.expenseCategory,
            movement.expenseNote || movement.note,
          ].filter(Boolean).join(" - ");
        return {
          id: `${movement.id ?? index}-${row.id}`,
          label:
            movement.expensePurpose === "expense_coverage"
              ? movement.note || `تسييل لتغطية مصروف — ${movement.expenseCategory || "غير مصنف"}`
              : movement.source === "expense" && expenseMovementLabel
                ? expenseMovementLabel
              : movementLabels[movement.type] || movement.note || "حركة على الأصل",
          amount: Number(movement.amount || 0),
          unitText,
          unitPriceText,
          direction: isOutgoing ? "out" : "in",
          date:
            date && !Number.isNaN(date.getTime())
              ? date.toLocaleDateString("en-GB")
              : "—",
          sortRecordedAt: !Number.isNaN(sortTime.getTime()) ? sortTime.getTime() : 0,
          sortDate: date && !Number.isNaN(date.getTime()) ? date.getTime() : 0,
          sortSequence: Number(movement.sortSequence || 0),
          sortId: Number(String(movement.id || "").match(/\d+/)?.[0] || 0),
          sortIndex: index,
        };
      })
      .sort(
        (a, b) =>
          b.sortRecordedAt - a.sortRecordedAt ||
          b.sortSequence - a.sortSequence ||
          b.sortIndex - a.sortIndex ||
          b.sortDate - a.sortDate ||
          b.sortId - a.sortId
      );
  const dashboardRowsWithMovements = dashboardRows.map((row) => ({
    ...row,
    movements: movementRows(row),
  }));
  const otherTotal = silverTotal + customTotal;
  const distributionBase = [
    { key: "cash", label: "كاش", value: Number(state.assets.cash || 0), color: "#55E892" },
    { key: "banks", label: "بنوك", value: bankTotal, color: "#35AEEF" },
    { key: "gold", label: "ذهب", value: goldTotal, color: visualIdentity.semantic.warning },
    { key: "stocks", label: "أسهم", value: stockTotal, color: "#9A72F5" },
    { key: "other", label: "أخرى", value: otherTotal, color: "#3B91A9" },
  ].filter((item) => item.value > 0);
  const distributionTotal = distributionBase.reduce((sum, item) => sum + item.value, 0);
  const distribution = distributionBase.map((item) => ({
    ...item,
    percent: distributionTotal > 0 ? (item.value / distributionTotal) * 100 : 0,
  }));
  const trendPoints = compactAssetTrendPoints();
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

function LiabilitiesScreen({
  state,
  setState,
  focusDueOnly = false,
  onCloseDueFocus,
}) {
  const { currencyLabel, t } = useLocale();
  const [showStructuralDetails, setShowStructuralDetails] = useState(false);
const [showDirectLiabilityDetails, setShowDirectLiabilityDetails] = useState(focusDueOnly);
const [showCardLiabilityDetails, setShowCardLiabilityDetails] = useState(focusDueOnly);

const structuralList = state.structural || state.structuralLiabilities || [];
const currentList = state.currentLiabilities || [];
const reservedPaymentList = state.reservedPayments || [];


const isDueThisMonth = (item) => {
  if (!item.dueDate) return false;
  const dueMonth = String(item.dueDate).slice(0, 7);
  const currentMonth = state.currentMonth || new Date().toISOString().slice(0, 7);
  return dueMonth <= currentMonth;
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

  const payReservedPayment = (payment) => {
    const amount = Number(payment.balance ?? payment.amount ?? 0);
    if (amount <= 0 || !isDueThisMonth(payment)) return;

    setState((prev) => {
      const now = new Date().toISOString();
      let next = {
        ...prev,
        reservedPayments: (prev.reservedPayments || []).map((item) =>
          String(item.id) === String(payment.id)
            ? {
                ...item,
                balance: 0,
                status: "paid",
                paidAt: now,
              }
            : item
        ),
        currentLiabilities: payment.cardId
          ? (prev.currentLiabilities || []).map((item) => {
              if (String(item.id) !== String(payment.cardId)) return item;
              const nextBalance = Math.max(
                0,
                Number((Number(item.balance || 0) - amount).toFixed(2))
              );
              const nextBuffer = Math.max(
                0,
                Number((Number(item.payableBuffer || 0) - amount).toFixed(2))
              );
              return {
                ...item,
                balance: nextBalance,
                amount: nextBalance,
                payableBuffer: nextBuffer,
                uncoveredDebt: Math.max(0, nextBalance - nextBuffer),
                status: nextBalance <= 0 ? "paid" : "pending",
              };
            })
          : prev.currentLiabilities,
        transactions: [
          ...(prev.transactions || []),
          {
            id: Date.now(),
            type: "reserved_payment_paid",
            amount,
            reservedPaymentId: payment.id,
            expenseId: payment.expenseId,
            assetKey: payment.assetKey || "",
            date: now,
          },
        ],
      };

      if (payment.assetKey) {
        next = addToAsset(next, payment.assetKey, amount);
        next.assetHistory = [
          ...(next.assetHistory || []),
          {
            id: `${Date.now()}-reserved-asset-paid`,
            date: now,
            recordedAt: new Date().toISOString(),
            type: "reserved_asset_payment_paid",
            source: "reserved_payment",
            assetKey: payment.assetKey,
            amount,
            expenseId: payment.expenseId,
            expenseCategory: payment.category || "غير مصنف",
            expenseNote: payment.note || "",
            displayLabel: `سداد برسم الدفع - ${[
              payment.category || "غير مصنف",
              payment.note || "",
            ].filter(Boolean).join(" - ")}`,
          },
        ];
      }

      return next;
    });
  };

  const postponeReservedPayment = (payment, nextDueDate) => {
    if (!nextDueDate || String(nextDueDate) <= String(payment.dueDate || "")) {
      alert("اختر تاريخاً جديداً بعد تاريخ الاستحقاق الحالي");
      return;
    }

    setState((prev) => ({
      ...prev,
      reservedPayments: (prev.reservedPayments || []).map((item) =>
        String(item.id) === String(payment.id)
          ? {
              ...item,
              dueDate: nextDueDate,
              dueDay: Number(String(nextDueDate).split("-")[2] || 1),
              postponedAt: new Date().toISOString(),
            }
          : item
      ),
      transactions: [
        ...(prev.transactions || []),
        {
          id: Date.now(),
          type: "reserved_payment_postponed",
          amount: Number(payment.balance ?? payment.amount ?? 0),
          reservedPaymentId: payment.id,
          expenseId: payment.expenseId,
          dueDate: nextDueDate,
          date: new Date().toISOString(),
        },
      ],
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
      const currentMonth = prev.currentMonth || new Date().toISOString().slice(0, 7);
      const originMonth =
        current.originMonth || String(current.createdAt || current.date || "").slice(0, 7);
      const dueMonth = String(current.dueDate || "").slice(0, 7);
      const isExpenseLiability = current.source === "expense_payment";

      if (
        isExpenseLiability &&
        (!originMonth || originMonth >= currentMonth || !dueMonth || dueMonth > currentMonth)
      ) {
        alert("يتاح السداد من سقف الصرف لهذا الالتزام عند استحقاقه في شهر لاحق");
        return prev;
      }
      const covered = Math.min(amount, Math.max(0, Number(current.payableBuffer || 0)));
      const remainingCap = Math.max(
        0,
        Number(prev.session?.spendingCap || 0) -
          Number(prev.session?.coveredSpent || 0)
      );
      const capCharge = Math.max(0, amount - covered);

      if (amount <= 0) return prev;

      if (remainingCap < capCharge) {
        alert("سقف الصرف لا يغطي هذا السداد");
        return prev;
      }

      const now = new Date().toISOString();
      const expenseId = Date.now();
      const creditorName = current.name || "دائن";
      const settlementCategory = isExpenseLiability
        ? `سداد التزام — ${current.category || "غير مصنف"} — ${formatMonthKey(originMonth)}`
        : "سداد دين";
      const liabilityBeforePayment = {
        amount: Number(current.amount || 0),
        balance: Number(current.balance ?? current.amount ?? 0),
        payableBuffer: Number(current.payableBuffer || 0),
        uncoveredDebt: Number(current.uncoveredDebt || 0),
        status: current.status || "pending",
        paymentMethod: current.paymentMethod || "",
        paidAt: current.paidAt || null,
      };
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
            liabilityPayment: {
              liabilityId: current.id,
              before: liabilityBeforePayment,
              capCharge,
              overBudgetRelief,
            },
            category: settlementCategory,
            note: [creditorName, current.note].filter(Boolean).join(" — "),
            isLiabilitySettlement: isExpenseLiability,
            originExpenseId: current.expenseId || null,
            originMonth: originMonth || null,
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
            overBudgetRelief,
            liabilityBeforePayment,
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
  const pendingReservedPayments = reservedPaymentList.filter(
    (item) => item.status !== "paid" && Number(item.balance ?? item.amount ?? 0) > 0
  );
  const reservedAssetSources = getAssetSources(state);
  const reservedSourceLabel = (item) => {
    if (item.source === "card_payment" || item.cardId) {
      const card = currentList.find(
        (liability) =>
          liability.type === "card" && String(liability.id) === String(item.cardId)
      );
      return `برسم الدفع بطاقة ${card?.name || item.creditorName || "بطاقة"}`;
    }

    if (item.source === "asset_payment" || item.assetKey) {
      const asset = reservedAssetSources.find((source) => source.key === item.assetKey);
      const assetLabel = asset?.label || item.creditorName || "أصل";
      const assetPrefix =
        item.assetKey === "cash"
          ? "أصل حساب الكاش الادخاري"
          : asset?.type === "bank"
            ? "أصل حساب"
            : "أصل";
      return `برسم الدفع ${assetPrefix} ${assetLabel}`;
    }

    return `برسم الدفع التزام ${item.creditorName || item.name || "دائن"}`;
  };
  const reservedPaymentDisplayRows = pendingReservedPayments.map((item) => ({
    item,
    amount: Number(item.balance ?? item.amount ?? 0),
    category: item.category || "غير مصنف",
    note: item.note || "",
    creditorName: item.creditorName || "",
    sourceLabel: reservedSourceLabel(item),
    dueText: item.dueDate ? formatDate(item.dueDate) : "غير محدد",
    canAct: isDueThisMonth(item),
  }));
  const currentLiabilityDisplayRows = sortedCurrent.map((item) => {
    const amount = getLiabilityAmount(item);
    const covered = getCoveredAmount(item);
    const uncovered = getUncoveredAmount(item);
    const isCard = item.type === "card";
    const creditLimit = Number(item.creditLimit || 0);
    const capChargeNeeded = Math.max(0, amount - Math.min(covered, amount));
    const availableCredit = Math.max(
      0,
      creditLimit - Number(item.balance || 0)
    );
    const originExpenseId = item.originExpenseId ?? item.expenseId;
    const originExpense = (state.expenses || []).find(
      (expense) => String(expense.id) === String(originExpenseId)
    );
    const linkedCategory =
      item.category || originExpense?.category || "غير مصنف";
    const linkedNote = item.note || originExpense?.note || "";
    const isEmergencyLiability = item.source === "emergency_expense";
    const isExpenseLiability = item.source === "expense_payment";
    const creditorLabel = item.creditorName || item.name || "دائن";
    const originExpenseTotal = Number(
      originExpense?.originalAmount ?? originExpense?.amount ?? item.amount ?? 0
    );
    const expenseLiabilityLabel = `${creditorLabel} - تغطية جزء من مصروف ${linkedCategory} مبلغ ${originExpenseTotal.toFixed(2)} ${currencyLabel}`;

    return {
      item,
      amount,
      covered,
      uncovered,
      creditLimit,
      coveragePct:
        amount > 0 ? Math.min(100, (covered / amount) * 100) : 0,
      isCard,
      isOpen: openCurrentId === item.id,
      icon: isCard ? "💳" : item.type === "over_budget" ? "⚠" : "🧾",
      name: isCard
        ? item.name || "بطاقة ائتمانية"
        : isEmergencyLiability
          ? `مصروف ${linkedCategory} طارئ`
          : isExpenseLiability
            ? expenseLiabilityLabel
            : item.name || "دائن",
      subtitle: isCard
        ? `السقف: ${creditLimit.toFixed(2)} · المستخدم: ${Number(
            item.balance || 0
          ).toFixed(2)} · المتاح: ${availableCredit.toFixed(2)}`
        : isEmergencyLiability
          ? linkedNote || "مصروف طارئ"
          : linkedNote || "اسم الدائن",
      typeLabel: getTypeLabel(item),
      dueText: getDueText(item),
      canPayFromCap:
        amount > 0 &&
        capChargeNeeded > 0 &&
        remainingSpendingCap >= capChargeNeeded &&
        (item.source !== "expense_payment" ||
          ((item.originMonth || String(item.createdAt || item.date || "").slice(0, 7)) <
            (state.currentMonth || new Date().toISOString().slice(0, 7)) &&
            String(item.dueDate || "").slice(0, 7) <=
              (state.currentMonth || new Date().toISOString().slice(0, 7)))),
      postponeParts: getPostponeParts(item),
    };
  });
  const displayedCurrentTotal = focusDueOnly
    ? currentLiabilityDisplayRows.reduce((sum, row) => sum + Number(row.amount || 0), 0)
    : currentDebtTotal;
  const cardLiabilityRows = currentLiabilityDisplayRows.filter((row) => row.isCard);
  const directLiabilityRows = currentLiabilityDisplayRows.filter((row) => !row.isCard);
  const totalRowsAmount = (rows) =>
    rows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const totalRowsCovered = (rows) =>
    rows.reduce((sum, row) => sum + Number(row.covered || 0), 0);
  const totalRowsUncovered = (rows) =>
    rows.reduce((sum, row) => sum + Number(row.uncovered || 0), 0);

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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div>
            <h1 style={{ margin: 0, color: visualIdentity.colors.white, fontSize: 27, fontWeight: 900 }}>{t("nav.liabilities")}</h1>
            <div style={{ marginTop: 3, color: visualIdentity.colors.textSecondary, fontSize: 11 }}>
              {focusDueOnly
                ? "الالتزامات الجارية المستحقة خلال الشهر الحالي"
                : "إدارة الالتزامات ومتابعة التغطية والاستحقاقات"}
            </div>
          </div>
          {focusDueOnly && (
            <button
              type="button"
              onClick={onCloseDueFocus}
              title="العودة إلى الرئيسية"
              aria-label="العودة إلى الرئيسية"
              style={{
                width: 38,
                height: 38,
                flex: "0 0 38px",
                borderRadius: 11,
                border: "1px solid rgba(255,255,255,0.16)",
                background: "rgba(255,255,255,0.08)",
                color: visualIdentity.colors.white,
                display: "grid",
                placeItems: "center",
                fontSize: 22,
                cursor: "pointer",
              }}
            >
              ×
            </button>
          )}
        </div>
      </header>
      <div style={{ display: "grid", gridTemplateColumns: focusDueOnly ? "1fr" : "1fr 1fr", gap: 9, marginBottom: 13 }}>
        {!focusDueOnly && (
          <div className="asset-dashboard-card" style={{ padding: 11, borderRadius: 16, border: `1px solid ${visualIdentity.semantic.warning}66`, background: `linear-gradient(145deg, ${visualIdentity.semantic.warning}1F, rgba(29,76,132,0.92))`, textAlign: "center", color: visualIdentity.colors.white }}>
            <div style={{ color: visualIdentity.colors.textSecondary, fontSize: 9 }}>{t("liabilities.fixed")}</div>
            <b style={{ display: "block", marginTop: 4, color: visualIdentity.semantic.warning, fontSize: 17 }}>{structuralTotal.toFixed(2)} <small style={{ fontSize: 9 }}>{currencyLabel}</small></b>
          </div>
        )}
        <div className="asset-dashboard-card" style={{ padding: 11, borderRadius: 16, border: `1px solid ${visualIdentity.semantic.danger}66`, background: `linear-gradient(145deg, ${visualIdentity.semantic.danger}1F, rgba(29,76,132,0.92))`, textAlign: "center", color: visualIdentity.colors.white }}>
          <div style={{ color: visualIdentity.colors.textSecondary, fontSize: 9 }}>
            {focusDueOnly ? "إجمالي المستحق هذا الشهر" : t("liabilities.cards")}
          </div>
          <b style={{ display: "block", marginTop: 4, color: visualIdentity.semantic.danger, fontSize: 17 }}>{displayedCurrentTotal.toFixed(2)} <small style={{ fontSize: 9 }}>{currencyLabel}</small></b>
        </div>
      </div>
      {!focusDueOnly && (
        <StructuralLiabilitiesCard
          total={structuralTotal}
          rows={structuralDisplayRows}
          open={showStructuralDetails}
          onToggle={() => setShowStructuralDetails((value) => !value)}
        />
      )}

      {!focusDueOnly && (
        <ReservedPaymentsCard
          rows={reservedPaymentDisplayRows}
          onPay={payReservedPayment}
          onPostpone={postponeReservedPayment}
        />
      )}

      <CurrentLiabilitiesCard
        title="الالتزامات الجارية"
        subtitle="ديون ودائنون مستحقون دون بطاقات الائتمان"
        icon="liability"
        accentColor={visualIdentity.semantic.warning}
        showSummary={false}
        total={totalRowsAmount(directLiabilityRows)}
        coveredTotal={totalRowsCovered(directLiabilityRows)}
        uncoveredTotal={totalRowsUncovered(directLiabilityRows)}
        rows={directLiabilityRows}
        open={showDirectLiabilityDetails}
        assetKey={liabilityAssetKey}
        assetSources={liabilityAssetSources}
        onToggleDetails={() => setShowDirectLiabilityDetails((value) => !value)}
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

      <CurrentLiabilitiesCard
        title="البطاقات"
        subtitle="بطاقات ائتمان قائمة ومبالغها المغطاة وغير المغطاة"
        icon="card"
        accentColor={visualIdentity.semantic.danger}
        showSummary={false}
        total={totalRowsAmount(cardLiabilityRows)}
        coveredTotal={totalRowsCovered(cardLiabilityRows)}
        uncoveredTotal={totalRowsUncovered(cardLiabilityRows)}
        rows={cardLiabilityRows}
        open={showCardLiabilityDetails}
        assetKey={liabilityAssetKey}
        assetSources={liabilityAssetSources}
        onToggleDetails={() => setShowCardLiabilityDetails((value) => !value)}
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
const editableSpendingCap = Number(
  (state.session?.isOpen
    ? state.session?.spendingCap
    : state.settings?.spendingCap ?? state.session?.spendingCap) || 0
);
const getCoveredSpentFromCap = (sourceState) =>
  Math.max(
    Number(sourceState.session?.coveredSpent || 0),
    (sourceState.expenses || []).reduce(
      (sum, expense) => sum + Number(expense.budgetCovered || 0),
      0
    )
  );
function syncOpenMonthPendingSurplus(nextState) {
  if (!nextState.session?.isOpen) return nextState;
  if (Number(nextState.session?.pendingSurplus || 0) <= 0.01) return nextState;
  if (getCoveredSpentFromCap(nextState) > 0.01) return nextState;

  const nextStructuralTotal = calcStructuralTotal(nextState);
  const nextSalary = Number(nextState.settings?.salary || 0);
  const nextCap = Number(nextState.session?.spendingCap || nextState.settings?.spendingCap || 0);
  const pendingSurplus = Math.max(0, nextSalary - nextStructuralTotal - nextCap);

  return {
    ...nextState,
    session: {
      ...nextState.session,
      salaryNetAfterStructural: Math.max(0, nextSalary - nextStructuralTotal),
      salaryNetAfterCurrentLiabilities: Math.max(0, nextSalary - nextStructuralTotal),
      savingsAmount: pendingSurplus,
      pendingSurplus,
    },
  };
}
function applyFinancialSettingGuards(
  nextState,
  { blockMessage = true, allowCategoryCapOverage = false } = {}
) {
  const nextStructuralTotal = calcStructuralTotal(nextState);
  const nextSalary = Number(nextState.settings?.salary || 0);
  const nextMaxCap = Math.max(0, nextSalary - nextStructuralTotal);
  const coveredSpent = getCoveredSpentFromCap(nextState);

  const currentCap = Number(
    nextState.session?.spendingCap ??
      nextState.settings?.spendingCap ??
      0
  );

  if (nextStructuralTotal > 0 && nextSalary <= 0) {
    if (blockMessage) alert("أدخل الراتب أولاً قبل إضافة الالتزامات الهيكلية");
    return { ok: false, state: nextState };
  }

  if (nextStructuralTotal > nextSalary) {
    if (blockMessage) alert("مجموع الالتزامات الهيكلية لا يجوز أن يتجاوز الراتب");
    return { ok: false, state: nextState };
  }

  if (nextSalary < nextStructuralTotal + coveredSpent) {
    if (blockMessage) {
      alert(
        `لا يجوز أن يقل الراتب عن الالتزامات الهيكلية والمصروف فعلياً من سقف الصرف. الحد الأدنى ${(
          nextStructuralTotal + coveredSpent
        ).toFixed(2)} ${currencyLabel}`
      );
    }
    return { ok: false, state: nextState };
  }

  if (currentCap < coveredSpent) {
    if (blockMessage) {
      alert(
        `لا يجوز أن يقل سقف الصرف عن المبلغ المصروف فعلياً من السقف. الحد الأدنى ${coveredSpent.toFixed(
          2
        )} ${currencyLabel}`
      );
    }
    return { ok: false, state: nextState };
  }

  if (nextMaxCap < coveredSpent) {
    if (blockMessage) {
      alert(
        `التعديل غير ممكن لأن المتاح بعد الالتزامات أقل من المصروف فعلياً من سقف الصرف. الحد الأدنى للمتاح ${coveredSpent.toFixed(
          2
        )} ${currencyLabel}`
      );
    }
    return { ok: false, state: nextState };
  }

  const guardedCap = Math.min(currentCap, nextMaxCap);
  const plannedCapsTotal = Object.values(nextState.settings?.expenseCategoryCaps || {}).reduce(
    (sum, value) => sum + Math.max(0, Number(value || 0)),
    0
  );

  if (!allowCategoryCapOverage && plannedCapsTotal > guardedCap) {
    if (blockMessage) {
      alert(
        `مجموع سقوف بنود المصروفات لا يجوز أن يتجاوز سقف الصرف الجديد. خفّض سقوف البنود أولاً إلى ${guardedCap.toFixed(
          2
        )} ${currencyLabel} أو أقل`
      );
    }
    return { ok: false, state: nextState };
  }

  const guardedState = {
      ...nextState,
      session: {
        ...nextState.session,
        spendingCap: guardedCap,
      },
      settings: {
        ...nextState.settings,
        spendingCap: guardedCap,
      },
    };

  return {
    ok: true,
    state: syncOpenMonthPendingSurplus(guardedState),
  };
}
function clampSpendingCapAfterStructuralChange(nextState) {
  const guarded = applyFinancialSettingGuards(nextState);
  return guarded.ok ? guarded.state : null;
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
      if (path === "settings.salary" || path === "settings.spendingCap" || path === "session.spendingCap") {
        const guarded = applyFinancialSettingGuards(copy);
        return guarded.ok ? guarded.state : prev;
      }
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
const savedSettingsCategories = state.expenseCategories?.items || [];
const expenseCapCategories = [
  ...DEFAULT_EXPENSE_CATEGORIES.map((base) => {
    const saved = savedSettingsCategories.find((item) => item.id === base.id);
    return saved ? { ...base, ...saved } : base;
  }),
  ...savedSettingsCategories.filter(
    (saved) => !DEFAULT_EXPENSE_CATEGORIES.some((base) => base.id === saved.id)
  ),
];
const changeExpenseCategoryCap = (label, value) => {
  const currentCaps = state.settings?.expenseCategoryCaps || {};
  const nextCaps = { ...currentCaps, [label]: value };
  const currentTotal = sumExpenseCategoryCaps(currentCaps);
  const nextTotal = sumExpenseCategoryCaps(nextCaps);
  const mainCap = editableSpendingCap;
  const reducesExistingOverage = nextTotal < currentTotal;

  if (nextTotal > mainCap && !reducesExistingOverage) {
    alert(
      `مجموع سقوف البنود لا يجوز أن يتجاوز سقف الصرف. المتاح للإضافة ${Math.max(
        0,
        mainCap - (currentTotal - Number(currentCaps[label] || 0))
      ).toFixed(2)} ${currencyLabel}`
    );
    return;
  }

  updateSetting("settings.expenseCategoryCaps", nextCaps);
};
const canLeaveSalarySettings = () => {
  if (settingsView !== "salary") return true;

  const plannedCapsTotal = sumExpenseCategoryCaps(state.settings?.expenseCategoryCaps || {});
  if (plannedCapsTotal <= editableSpendingCap) return true;

  alert(
    `مجموع سقوف البنود (${plannedCapsTotal.toFixed(
      2
    )} ${currencyLabel}) أعلى من سقف الصرف (${editableSpendingCap.toFixed(
      2
    )} ${currencyLabel}). عدّل سقف الصرف أو خفّض سقوف البنود قبل الخروج.`
  );
  return false;
};
const addExpenseCategoryFromSettings = () => {
  const label = window.prompt("اكتب اسم بند المصروف الجديد");
  const cleanLabel = String(label || "").trim();
  if (!cleanLabel) return;

  const exists = expenseCapCategories.some(
    (item) => String(item.label || "").trim().toLowerCase() === cleanLabel.toLowerCase()
  );
  if (exists) {
    alert("هذا البند موجود مسبقًا");
    return;
  }

  setState((prev) => ({
    ...prev,
    expenseCategories: {
      ...prev.expenseCategories,
      items: [
        ...(prev.expenseCategories?.items || []),
        {
          id: `extra-${Date.now()}`,
          label: cleanLabel,
          icon: "📌",
          color: visualIdentity.colors.cyan,
          pinned: false,
        },
      ],
    },
  }));
};
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
              ...(["gold", "silver", "stocks"].includes(assetGroup) && patch.wac !== undefined
                ? { currentPrice: patch.wac }
                : {}),
              ...(assetGroup === "custom" && patch.price !== undefined
                ? { currentPrice: patch.price, wac: item.wac ?? item.price ?? patch.price }
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
        if (["stocks", "gold", "silver", "custom"].includes(listName)) {
          existing.currentPrice = price;
        }

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
          currentPrice: price,
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

    return clampSpendingCapAfterStructuralChange(next) || p;
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

    return clampSpendingCapAfterStructuralChange(next) || p;
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

    return clampSpendingCapAfterStructuralChange(next) || p;
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
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [settingsView]);
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
    <div className="settings-screen settings-screen-subpage" style={{ ...G.scr, paddingTop: 20, minHeight: "calc(100vh - 118px)" }}>
      <SettingsSubpageShell
        title={settingsPageMeta[settingsView]?.[0] || t("nav.settings")}
        subtitle={settingsPageMeta[settingsView]?.[1] || ""}
        onBack={() => {
          if (canLeaveSalarySettings()) setSettingsView("menu");
        }}
      >
      {["salary", "cards"].includes(settingsView) && <div className="asset-dashboard-card" style={settingsPanelStyle}>
      {settingsView === "salary" && <>
<SalaryCapSettingsSection
          salary={state.settings.salary}
          spendingCap={editableSpendingCap}
          maxSpendingCap={maxSpendingCap}
          onSalaryChange={(value) => updateSetting("settings.salary", value)}
          onSpendingCapChange={(value) => {
            if (value > maxSpendingCap) {
              alert("سقف الصرف لا يجوز أن يتجاوز صافي الراتب بعد الالتزامات الهيكلية");
              return;
            }

            setState((prev) => {
              const next = {
                ...prev,
                settings: { ...prev.settings, spendingCap: value },
                session: { ...prev.session, spendingCap: value },
              };
              const guarded = applyFinancialSettingGuards(next, {
                allowCategoryCapOverage: true,
              });
              return guarded.ok ? guarded.state : prev;
            });
          }}
          inputStyle={G.inp()}
        />
        <ExpenseCategoryCapsSettings
          categories={expenseCapCategories}
          caps={state.settings?.expenseCategoryCaps || {}}
          spendingCap={editableSpendingCap}
          inputStyle={G.inp()}
          onChange={changeExpenseCategoryCap}
          onAddCategory={addExpenseCategoryFromSettings}
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

function getDateKey(dateValue = new Date()) {
  if (!dateValue) return new Date().toISOString().slice(0, 10);
  if (typeof dateValue === "string") return dateValue.slice(0, 10);
  return dateValue.toISOString().slice(0, 10);
}

function getCoveredSpentFromCap(state) {
  return Math.max(
    Number(state.session?.coveredSpent || 0),
    (state.expenses || []).reduce(
      (sum, expense) => sum + Number(expense.budgetCovered || 0),
      0
    )
  );
}

function getRemainingSpendingCapAtClose(state) {
  return Math.max(
    0,
    Number(state.session?.spendingCap || 0) - getCoveredSpentFromCap(state)
  );
}

function formatMonthKey(monthKey) {
  if (!monthKey) return "الشهر الحالي";
  const [year, month] = String(monthKey).split("-").map(Number);
  if (!year || !month) return String(monthKey);

  return `${year}/${String(month).padStart(2, "0")}`;
}

function getNextMonthKey(monthKey) {
  const [year, month] = String(monthKey).split("-").map(Number);
  if (!year || !month) return "";

  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  return `${nextYear}-${String(nextMonth).padStart(2, "0")}`;
}

function buildExpensesByCategory(expenses = []) {
  return expenses.reduce((acc, expense) => {
    const category = expense.category || expense.type || "غير مصنف";
    const amount = Number(expense.amount || 0);

    acc[category] = Number(acc[category] || 0) + amount;

  return acc;
  }, {});
}

function buildDailySpendingTotals(expenses = [], monthKey = "") {
  return expenses.reduce((acc, expense) => {
    if (expense.isIncomeEntry) return acc;
    const date = getDateKey(expense.date || expense.createdAt);
    if (monthKey && !date.startsWith(monthKey)) return acc;
    acc[date] = Number(acc[date] || 0) + Number(expense.amount || 0);
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
    expenseCategoryCaps: structuredClone(state.settings?.expenseCategoryCaps || {}),

    expenses: structuredClone(state.expenses || []),
    reservedPayments: structuredClone(state.reservedPayments || []),
    expensesByCategory: buildExpensesByCategory(state.expenses || []),
    dailySpendingHeatmap: {
      month: currentMonth,
      dailyTotals: buildDailySpendingTotals(state.expenses || [], currentMonth),
    },
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
    structuralLiabilities: structuredClone(state.structuralLiabilities || []),
    currentLiabilities: structuredClone(state.currentLiabilities || []),
  };
}

function buildAssetDailySnapshot(state, dateValue = new Date()) {
  const date = getDateKey(dateValue);
  const assetTotals = calcAssets(state);

  return {
    id: `${date}-${Date.now()}`,
    date,
    month: date.slice(0, 7),
    assetTotals: {
      totalAssets: assetTotals.totalAssets,
      currentLiabilities: assetTotals.currentLiabilities,
      netWorth: assetTotals.netWorth,
    },
    assets: structuredClone(state.assets || {}),
  };
}

function syncAssetDailySnapshot(prev, dateValue = new Date()) {
  const date = getDateKey(dateValue);
  const snapshot = buildAssetDailySnapshot(prev, date);
  const existing = (prev.assetDailySnapshots || []).find((item) => item.date === date);
  const existingTotal = Number(existing?.assetTotals?.totalAssets || 0);
  const nextTotal = Number(snapshot.assetTotals.totalAssets || 0);

  if (existing && Math.abs(existingTotal - nextTotal) < 0.01) {
    return prev;
  }

  return {
    ...prev,
    assetDailySnapshots: [
      ...(prev.assetDailySnapshots || []).filter((item) => item.date !== date),
      snapshot,
    ].slice(-370),
  };
}

function closeMonthState(prev, targetMonth = new Date().toISOString().slice(0, 7)) {
  const snapshot = buildMonthlySnapshot(prev);
  const nextMonth = getNextMonthKey(prev.currentMonth || targetMonth);

  const rolledCurrentLiabilities = (prev.currentLiabilities || [])
    .filter((l) => l.status !== "paid")
    .map((l) => ({
      ...l,
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
    settings: {
      ...prev.settings,
      month: nextMonth,
    },
    expenses: [],
    extraCash: [],
    session: {
      ...prev.session,
      isOpen: false,
      spendingCap: Number(prev.settings?.spendingCap || 0),
      coveredSpent: 0,
      overBudgetSpent: 0,
      pendingSurplus: 0,
    },
    structuralLiabilities: prev.structuralLiabilities || [],
    currentLiabilities: rolledCurrentLiabilities,
    reservedPayments: (prev.reservedPayments || [])
      .filter((item) => item.status !== "paid")
      .map((item) => ({ ...item, paymentMethod: "", newDueDate: "" })),
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

  const storedExpenses = Array.isArray(storedState.expenses) ? storedState.expenses : [];
  let hydratedCurrentLiabilities = Array.isArray(storedState.currentLiabilities)
    ? storedState.currentLiabilities
    : [];
  let hydratedReservedPayments = Array.isArray(storedState.reservedPayments)
    ? storedState.reservedPayments
    : null;

  if (hydratedReservedPayments === null) {
    hydratedReservedPayments = [];
    const migratedLiabilities = [];

    hydratedCurrentLiabilities.forEach((liability) => {
      const balance = Number(liability.balance ?? liability.amount ?? 0);
      const covered = Math.min(balance, Math.max(0, Number(liability.payableBuffer || 0)));

      if (
        liability.source !== "expense_payment" ||
        liability.status === "paid" ||
        covered <= 0
      ) {
        migratedLiabilities.push(liability);
        return;
      }

      const originExpense = storedExpenses.find(
        (expense) => String(expense.id) === String(liability.expenseId)
      );
      const originMonth =
        liability.originMonth ||
        String(originExpense?.date || originExpense?.createdAt || liability.date || liability.createdAt || "").slice(0, 7) ||
        storedState.currentMonth ||
        INITIAL_STATE.currentMonth;

      hydratedReservedPayments.push({
        id: `${liability.id}-reserved`,
        amount: covered,
        balance: covered,
        status: "pending",
        source: "expense_payment",
        category: liability.category || originExpense?.category || "غير مصنف",
        note: liability.note || originExpense?.note || "",
        creditorName: liability.creditorName || liability.name || "دائن",
        dueDate: liability.dueDate || "",
        dueDay: liability.dueDay || 1,
        originMonth,
        expenseId: liability.expenseId,
        date: liability.date || originExpense?.date || "",
        createdAt: liability.createdAt || originExpense?.createdAt || "",
        migratedFromLegacy: true,
      });

      const actualBalance = Number(Math.max(0, balance - covered).toFixed(2));
      if (actualBalance > 0) {
        migratedLiabilities.push({
          ...liability,
          amount: actualBalance,
          balance: actualBalance,
          payableBuffer: 0,
          uncoveredDebt: actualBalance,
          originMonth,
        });
      }
    });

    hydratedCurrentLiabilities = migratedLiabilities;
  }

  const cardReservedBalanceById = hydratedReservedPayments.reduce((totals, item) => {
    if (item.status === "paid" || !item.cardId) return totals;
    const cardKey = String(item.cardId);
    totals[cardKey] = Number(
      (Number(totals[cardKey] || 0) + Number(item.balance ?? item.amount ?? 0)).toFixed(2)
    );
    return totals;
  }, {});
  const unrepresentedCardBuffer = new Map(
    hydratedCurrentLiabilities
      .filter((item) => item.type === "card")
      .map((card) => [
        String(card.id),
        Math.max(
          0,
          Number(card.payableBuffer || 0) -
            Number(cardReservedBalanceById[String(card.id)] || 0)
        ),
      ])
  );

  [...storedExpenses]
    .filter(
      (expense) =>
        expense.paymentMethod === "card" &&
        expense.cardId != null &&
        Number(expense.budgetCovered || 0) > 0
    )
    .sort(
      (a, b) =>
        String(a.date || a.createdAt || "").localeCompare(
          String(b.date || b.createdAt || "")
        )
    )
    .forEach((expense) => {
      const hasReservedRecord = hydratedReservedPayments.some(
        (item) =>
          String(item.expenseId || "") === String(expense.id) &&
          String(item.cardId || "") === String(expense.cardId)
      );
      if (hasReservedRecord) return;

      const cardKey = String(expense.cardId);
      const availableLegacyBuffer = Number(unrepresentedCardBuffer.get(cardKey) || 0);
      const covered = Math.min(
        Number(expense.budgetCovered || 0),
        availableLegacyBuffer
      );
      if (covered <= 0) return;

      const card = hydratedCurrentLiabilities.find(
        (item) => item.type === "card" && String(item.id) === cardKey
      );
      if (!card) return;

      const originMonth =
        String(expense.date || expense.createdAt || "").slice(0, 7) ||
        storedState.currentMonth ||
        INITIAL_STATE.currentMonth;
      const [year, month] = String(originMonth).split("-").map(Number);
      const lastDay = new Date(year, month, 0).getDate();

      hydratedReservedPayments.push({
        id: `${expense.id}-reserved-card-migrated`,
        amount: covered,
        balance: covered,
        status: "pending",
        source: "card_payment",
        category: expense.category || "غير مصنف",
        note: expense.note || "",
        creditorName: card.name || "بطاقة",
        cardId: card.id,
        dueDate: `${originMonth}-${String(lastDay).padStart(2, "0")}`,
        dueDay: lastDay,
        originMonth,
        expenseId: expense.id,
        date: expense.date || "",
        createdAt: expense.createdAt || "",
        migratedFromLegacy: true,
      });
      unrepresentedCardBuffer.set(
        cardKey,
        Number((availableLegacyBuffer - covered).toFixed(2))
      );
    });

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
    currentLiabilities: hydratedCurrentLiabilities,
    reservedPayments: hydratedReservedPayments,
    expenses: storedExpenses,
    transactions: Array.isArray(storedState.transactions) ? storedState.transactions : [],
    monthlySnapshots: Array.isArray(storedState.monthlySnapshots)
      ? storedState.monthlySnapshots
      : [],
    assetDailySnapshots: Array.isArray(storedState.assetDailySnapshots)
      ? storedState.assetDailySnapshots
      : [],
    assetHistory: Array.isArray(storedState.assetHistory) ? storedState.assetHistory : [],
    currentMonth: storedState.currentMonth || INITIAL_STATE.currentMonth,
  };
}

function OnboardingFlow({ state, setState, onComplete }) {
  const { currencyLabel } = useLocale();
  const [step, setStep] = useState(0);
  const [salary, setSalary] = useState(String(state.settings?.salary || ""));
  const [spendingCap, setSpendingCap] = useState(String(state.settings?.spendingCap || state.session?.spendingCap || ""));
  const [caps, setCaps] = useState(state.settings?.expenseCategoryCaps || {});
  const [hasCategoryCaps, setHasCategoryCaps] = useState(null);
  const [hasOpeningAssets, setHasOpeningAssets] = useState(null);
  const [openingAssetKind, setOpeningAssetKind] = useState("cash");
  const [openingAssetName, setOpeningAssetName] = useState("");
  const [openingAssetAmount, setOpeningAssetAmount] = useState("");
  const [openingAssetUnits, setOpeningAssetUnits] = useState("");
  const [openingAssetPrice, setOpeningAssetPrice] = useState("");
  const [openingAssetRows, setOpeningAssetRows] = useState([]);
  const [hasStructuralObligations, setHasStructuralObligations] = useState(null);
  const [structuralRows, setStructuralRows] = useState([]);
  const [showStructuralForm, setShowStructuralForm] = useState(false);
  const [structuralName, setStructuralName] = useState("");
  const [structuralMonthly, setStructuralMonthly] = useState("");
  const [liabilityRows, setLiabilityRows] = useState([]);
  const [hasCurrentObligations, setHasCurrentObligations] = useState(null);
  const [showLiabilityForm, setShowLiabilityForm] = useState(false);
  const [liabilityName, setLiabilityName] = useState("");
  const [liabilityAmount, setLiabilityAmount] = useState("");
  const [liabilityDueDate, setLiabilityDueDate] = useState("");
  const [cardRows, setCardRows] = useState([]);
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardName, setCardName] = useState("");
  const [cardLimit, setCardLimit] = useState("");
  const [cardBalance, setCardBalance] = useState("");
  const [cardDueDay, setCardDueDay] = useState("");

  const choiceButtonStyle = (active, color = visualIdentity.colors.cyan) => ({
    minHeight: 30,
    padding: "5px 10px",
    borderRadius: 999,
    border: `1px solid ${active ? color : "rgba(255,255,255,0.18)"}`,
    background: active ? `${color}22` : "rgba(255,255,255,0.055)",
    color: active ? color : visualIdentity.colors.textSecondary,
    fontSize: 10,
    fontWeight: 900,
    cursor: "pointer",
    fontFamily: "inherit",
  });
  const assetKindOptions = [
    ["cash", "كاش ادخار"],
    ["bank", "حساب بنكي"],
    ["gold", "ذهب"],
    ["silver", "فضة"],
    ["stock", "أسهم"],
    ["goods", "بضاعة / أصل"],
  ];
  const goldKaratOptions = ["ذهب 18", "ذهب 21", "ذهب 22", "ذهب 24"];
  const totalStructural = structuralRows.reduce((sum, row) => sum + Number(row.monthly || 0), 0);
  const safeSalary = Number(salary || 0);
  const safeCap = Number(spendingCap || 0);
  const maxCap = Math.max(0, safeSalary - totalStructural);
  const plannedCapsTotal = sumExpenseCategoryCaps(caps);
  const surplus = Math.max(0, safeSalary - totalStructural - safeCap);
  const canContinueRequired = safeSalary > 0 && safeCap > 0 && safeCap <= maxCap;
  const pendingStructuralMonthly = Number(structuralMonthly || 0);
  const candidateStructuralTotal =
    showStructuralForm && structuralName.trim() && pendingStructuralMonthly > 0
      ? totalStructural + pendingStructuralMonthly
      : totalStructural;
  const candidateMaxCap = Math.max(0, safeSalary - candidateStructuralTotal);
  const canContinueWithDraft = safeSalary > 0 && safeCap > 0 && safeCap <= candidateMaxCap;

  const addStructuralRow = () => {
    const monthly = Number(structuralMonthly || 0);
    if (!showStructuralForm || (!structuralName.trim() && monthly <= 0)) return true;
    if (!structuralName.trim() || monthly <= 0) {
      alert("أكمل اسم الالتزام الهيكلي وقيمته أو اترك الخانة فارغة.");
      return false;
    }
    setStructuralRows((rows) => [...rows, { id: `draft-structural-${rows.length}`, name: structuralName.trim(), monthly }]);
    setStructuralName("");
    setStructuralMonthly("");
    setShowStructuralForm(false);
    return true;
  };
  const addAnotherStructuralRow = () => {
    if (!addStructuralRow()) return;
    setShowStructuralForm(true);
  };
  const addLiabilityRow = () => {
    const amount = Number(liabilityAmount || 0);
    if (!showLiabilityForm || (!liabilityName.trim() && amount <= 0 && !liabilityDueDate)) return true;
    if (!liabilityName.trim() || amount <= 0 || !liabilityDueDate) {
      alert("أكمل اسم الالتزام الجاري والمبلغ وتاريخ الاستحقاق أو اترك الخانة فارغة.");
      return false;
    }
    setLiabilityRows((rows) => [...rows, { id: `draft-liability-${rows.length}`, name: liabilityName.trim(), amount, dueDate: liabilityDueDate }]);
    setLiabilityName("");
    setLiabilityAmount("");
    setLiabilityDueDate("");
    setShowLiabilityForm(false);
    return true;
  };
  const addCardRow = () => {
    const limit = Number(cardLimit || 0);
    const balance = Number(cardBalance || 0);
    const dueDay = Number(cardDueDay || 0);
    if (!showCardForm || (!cardName.trim() && limit <= 0 && balance <= 0 && dueDay <= 0)) return true;
    if (!cardName.trim() || limit <= 0 || balance < 0 || balance > limit || dueDay < 1 || dueDay > 31) {
      alert("أكمل بيانات البطاقة أو اترك الخانة فارغة.");
      return false;
    }
    setCardRows((rows) => [...rows, { id: `draft-card-${rows.length}`, name: cardName.trim(), creditLimit: limit, balance, dueDay }]);
    setCardName("");
    setCardLimit("");
    setCardBalance("");
    setCardDueDay("");
    setShowCardForm(false);
    return true;
  };
  const addOpeningAssetRow = () => {
    const amount = Number(openingAssetAmount || 0);
    const units = Number(openingAssetUnits || 0);
    const price = Number(openingAssetPrice || 0);
    const needsUnits = ["gold", "silver", "stock", "goods"].includes(openingAssetKind);
    const name = String(openingAssetName || "").trim();

    if (openingAssetKind === "cash") {
      if (amount <= 0) return alert("أدخل قيمة الكاش");
    } else if (openingAssetKind === "bank") {
      if (!name || amount <= 0) return alert("أدخل اسم البنك والرصيد");
    } else if (needsUnits) {
      if (!name || units <= 0 || price <= 0) return alert("أدخل الاسم والعدد والسعر");
    }

    setOpeningAssetRows((rows) => [
      ...rows,
      {
        id: `draft-asset-${rows.length}`,
        kind: openingAssetKind,
        name: openingAssetKind === "cash" ? "كاش ادخار" : name,
        amount,
        units,
        price,
      },
    ]);
    setOpeningAssetName("");
    setOpeningAssetAmount("");
    setOpeningAssetUnits("");
    setOpeningAssetPrice("");
  };
  const goNext = () => {
    if (step === 1) {
      if (!canContinueRequired) return alert("أدخل الراتب وسقف صرف صحيحين أولًا");
    }
    if (step === 2) {
      if (hasStructuralObligations === null) return alert("اختر نعم أو لا للالتزامات الشهرية الثابتة");
      if (hasCategoryCaps === null) return alert("اختر نعم أو لا لسقوف بنود الصرف");
      if (!addStructuralRow()) return;
      if (!canContinueWithDraft) return alert("سقف الصرف لا يجوز أن يتجاوز المتاح بعد الالتزامات الهيكلية");
      if (hasCategoryCaps === false) setCaps({});
      if (hasCategoryCaps === true && plannedCapsTotal > safeCap) return alert("مجموع سقوف البنود أعلى من سقف الصرف");
    }
    if (step === 3 && hasOpeningAssets === null) return alert("اختر نعم أو لا للمتابعة");
    if (step === 4) {
      if (hasCurrentObligations === null) return alert("اختر نعم أو لا للمتابعة");
      if (!addLiabilityRow()) return;
      if (!addCardRow()) return;
    }
    setStep((value) => value + 1);
  };

  const finishSetup = () => {
    if (!canContinueRequired) return;
    if (plannedCapsTotal > safeCap) {
      alert("مجموع سقوف البنود أعلى من سقف الصرف. خفّضها أو ارفع السقف قبل البدء.");
      return;
    }

    const now = new Date().toISOString();
    const currentMonth = state.currentMonth || state.settings?.month || now.slice(0, 7);
    const setupId = now.replace(/\D/g, "");
    const openingGroups = openingAssetRows.reduce(
      (groups, row, index) => {
        if (row.kind === "cash") {
          groups.cash += Number(row.amount || 0);
          groups.history.push({
            id: `setup-opening-cash-${setupId}-${index}`,
            date: now,
            type: "opening_balance",
            source: "setup",
            assetKind: "cash",
            assetName: "كاش ادخار",
            amount: Number(row.amount || 0),
          });
        } else if (row.kind === "bank") {
          const id = `setup-bank-${setupId}-${index}`;
          groups.banks.push({ id, name: row.name, balance: Number(row.amount || 0) });
          groups.history.push({ id: `setup-opening-bank-${setupId}-${index}`, date: now, type: "opening_balance", source: "setup", assetKind: "bank", assetId: id, assetName: row.name, amount: Number(row.amount || 0) });
        } else if (row.kind === "gold") {
          const id = `setup-gold-${setupId}-${index}`;
          groups.gold.push({ id, label: row.name, units: Number(row.units || 0), wac: Number(row.price || 0), currentPrice: Number(row.price || 0) });
          groups.history.push({ id: `setup-opening-gold-${setupId}-${index}`, date: now, type: "opening_balance", source: "setup", assetKind: "gold", assetId: id, assetName: row.name, amount: Number(row.units || 0) * Number(row.price || 0), units: Number(row.units || 0), unitPrice: Number(row.price || 0) });
        } else if (row.kind === "silver") {
          const id = `setup-silver-${setupId}-${index}`;
          groups.silver.push({ id, label: row.name, units: Number(row.units || 0), wac: Number(row.price || 0), currentPrice: Number(row.price || 0) });
          groups.history.push({ id: `setup-opening-silver-${setupId}-${index}`, date: now, type: "opening_balance", source: "setup", assetKind: "silver", assetId: id, assetName: row.name, amount: Number(row.units || 0) * Number(row.price || 0), units: Number(row.units || 0), unitPrice: Number(row.price || 0) });
        } else if (row.kind === "stock") {
          const id = `setup-stock-${setupId}-${index}`;
          groups.stocks.push({ id, name: row.name, units: Number(row.units || 0), wac: Number(row.price || 0), currentPrice: Number(row.price || 0) });
          groups.history.push({ id: `setup-opening-stock-${setupId}-${index}`, date: now, type: "opening_balance", source: "setup", assetKind: "stocks", assetId: id, assetName: row.name, amount: Number(row.units || 0) * Number(row.price || 0), units: Number(row.units || 0), unitPrice: Number(row.price || 0) });
        } else if (row.kind === "goods") {
          const id = `setup-custom-${setupId}-${index}`;
          groups.custom.push({ id, name: row.name, type: "unit", units: Number(row.units || 0), price: Number(row.price || 0), wac: Number(row.price || 0), currentPrice: Number(row.price || 0) });
          groups.history.push({ id: `setup-opening-custom-${setupId}-${index}`, date: now, type: "opening_balance", source: "setup", assetKind: "custom", assetId: id, assetName: row.name, amount: Number(row.units || 0) * Number(row.price || 0), units: Number(row.units || 0), unitPrice: Number(row.price || 0) });
        }
        return groups;
      },
      { cash: 0, banks: [], gold: [], silver: [], stocks: [], custom: [], history: [] }
    );
    const structuralLiabilities = structuralRows.map((row, index) => ({
      id: `setup-structural-${setupId}-${index}`,
      name: row.name,
      monthly: Number(row.monthly || 0),
      dueDay: 1,
    }));
    const manualLiabilities = liabilityRows.map((row, index) => ({
      id: `setup-liability-${setupId}-${index}`,
      type: "manual",
      name: row.name,
      amount: Number(row.amount || 0),
      balance: Number(row.amount || 0),
      payableBuffer: 0,
      uncoveredDebt: Number(row.amount || 0),
      dueDate: row.dueDate,
      dueDay: Number(String(row.dueDate || "").split("-")[2] || 1),
      status: "pending",
      source: "setup",
      creditorName: row.name,
      createdAt: now,
      date: now.slice(0, 10),
    }));
    const cards = cardRows.map((row, index) => ({
      id: `setup-card-${setupId}-${index}`,
      type: "card",
      name: row.name,
      creditLimit: Number(row.creditLimit || 0),
      balance: Number(row.balance || 0),
      amount: Number(row.balance || 0),
      payableBuffer: 0,
      uncoveredDebt: Number(row.balance || 0),
      dueDate: "",
      dueDay: Number(row.dueDay || 1),
      status: "active",
      source: "manual_card",
      createdAt: now,
      date: now.slice(0, 10),
    }));

    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        setupComplete: true,
        month: currentMonth,
        salary: safeSalary,
        spendingCap: safeCap,
        expenseCategoryCaps: structuredClone(caps),
      },
      assets: {
        ...prev.assets,
        cash: hasOpeningAssets ? openingGroups.cash : 0,
        banks: [...(prev.assets?.banks || []), ...openingGroups.banks],
        gold: [...(prev.assets?.gold || []), ...openingGroups.gold],
        silver: [...(prev.assets?.silver || []), ...openingGroups.silver],
        stocks: [...(prev.assets?.stocks || []), ...openingGroups.stocks],
        custom: [...(prev.assets?.custom || []), ...openingGroups.custom],
      },
      structuralLiabilities,
      currentLiabilities: [...manualLiabilities, ...cards],
      assetHistory: [...(prev.assetHistory || []), ...openingGroups.history],
      currentMonth,
      session: {
        ...prev.session,
        isOpen: true,
        salaryNetAfterStructural: Math.max(0, safeSalary - totalStructural),
        salaryNetAfterCurrentLiabilities: Math.max(0, safeSalary - totalStructural),
        spendingCap: safeCap,
        coveredSpent: 0,
        overBudgetSpent: 0,
        savingsAmount: surplus,
        pendingSurplus: surplus,
      },
      transactions: [
        ...(prev.transactions || []),
        {
          id: `setup-open-${setupId}`,
          type: "salary_month_opened",
          cashFlow: "salary",
          amount: safeSalary,
          structuralTotal: totalStructural,
          spendingCap: safeCap,
          plannedSavings: surplus,
          date: now,
        },
      ],
    }));
    onComplete(surplus);
  };

  const stitch = {
    background: "#08132a",
    surface: "#151f37",
    surfaceLow: "#101b33",
    surfaceHigh: "#1f2942",
    surfaceHighest: "#2a344d",
    outline: "#8f9097",
    outlineVariant: "#44474d",
    text: "#d9e2ff",
    textMuted: "#c5c6cd",
    secondary: "#e9c349",
    onSecondary: "#3c2f00",
    error: "#ffb4ab",
    errorContainer: "#93000a",
    font: "'IBM Plex Sans Arabic', sans-serif",
    numeral: "'Inter', sans-serif",
  };
  const stitchPanel = {
    background: "rgba(21,31,55,0.70)",
    border: "1px solid rgba(35,53,84,0.50)",
    borderRadius: 12,
    boxShadow: "0 16px 36px rgba(0,0,0,0.18)",
    backdropFilter: "blur(20px)",
  };
  const stitchInput = {
    width: "100%",
    minHeight: 44,
    border: `1px solid ${stitch.outlineVariant}`,
    borderRadius: 10,
    background: stitch.surfaceLow,
    color: stitch.text,
    padding: "10px 12px",
    fontFamily: stitch.font,
    fontSize: 14,
    outline: "none",
  };
  const stitchNumberInput = {
    ...stitchInput,
    direction: "ltr",
    textAlign: "left",
    fontFamily: stitch.numeral,
    fontWeight: 700,
  };
  const stitchChoice = (active) => ({
    flex: 1,
    minHeight: 42,
    borderRadius: 10,
    border: `1px solid ${active ? stitch.secondary : stitch.outlineVariant}`,
    background: active ? stitch.secondary : "transparent",
    color: active ? stitch.onSecondary : stitch.text,
    fontFamily: stitch.font,
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  });
  const stitchAddButton = {
    border: 0,
    background: "transparent",
    color: stitch.secondary,
    fontFamily: stitch.font,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    padding: "8px 0",
  };
  const openingAssetsTotal = openingAssetRows.reduce((sum, row) => {
    const value =
      row.kind === "cash" || row.kind === "bank"
        ? Number(row.amount || 0)
        : Number(row.units || 0) * Number(row.price || 0);
    return sum + value;
  }, 0);
  const currentObligationCount = liabilityRows.length + cardRows.length;
  const flowBase = Math.max(1, safeSalary);
  const structuralPct = Math.min(100, (totalStructural / flowBase) * 100);
  const spendingPct = Math.min(100, (safeCap / flowBase) * 100);
  const savingsPct = Math.min(100, (surplus / flowBase) * 100);

  const progressWidth = `${Math.min(100, Math.max(16, ((step + 1) / 6) * 100))}%`;

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
        background: "#eef0f2",
        fontFamily: stitch.font,
      }}
    >
      <section
        style={{
          position: "relative",
          width: "min(100%, 238px)",
          height: "min(100vh - 24px, 510px)",
          minHeight: 500,
          overflowY: "auto",
          overflowX: "hidden",
          borderRadius: 22,
          background: stitch.background,
          color: stitch.text,
          border: "6px solid #9aa4b2",
          boxShadow: "0 16px 35px rgba(0,0,0,0.28)",
          padding: "12px 10px 104px",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: 58,
            right: 58,
            height: 3,
            background: stitch.secondary,
            borderRadius: "0 0 999px 999px",
            zIndex: 2,
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: 3,
            width: progressWidth,
            background: stitch.secondary,
            opacity: 0.65,
            zIndex: 1,
          }}
        />

        {step === 0 && (
          <div
            style={{
              position: "relative",
              minHeight: "min(560px, calc(100vh - 170px))",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "16px 4px 10px",
              overflow: "hidden",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: -95,
                left: -80,
                width: 240,
                height: 240,
                borderRadius: "50%",
                background: `${stitch.secondary}14`,
                filter: "blur(72px)",
              }}
            />
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                right: -90,
                bottom: 18,
                width: 250,
                height: 250,
                borderRadius: "50%",
                background: `${stitch.primary || "#b9c7e4"}12`,
                filter: "blur(78px)",
              }}
            />

            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                borderRadius: 999,
                background: "rgba(255,255,255,0.10)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "20%",
                  height: "100%",
                  background: stitch.secondary,
                  boxShadow: `0 0 18px ${stitch.secondary}88`,
                }}
              />
            </div>

            <div
              style={{
                position: "relative",
                width: 88,
                height: 88,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                marginBottom: 20,
                background: "rgba(21,31,55,0.72)",
                border: "1px solid rgba(255,255,255,0.13)",
                boxShadow: `0 22px 55px rgba(0,0,0,0.24), 0 0 42px ${stitch.secondary}18`,
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: -9,
                  borderRadius: "50%",
                  border: `1px solid ${stitch.secondary}33`,
                }}
              />
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: 4,
                  right: -4,
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  background: "rgba(21,31,55,0.88)",
                  border: `1px solid ${stitch.secondary}55`,
                  color: stitch.secondary,
                  fontSize: 15,
                  fontWeight: 900,
                }}
              >
                ↗
              </div>
              <div
                aria-hidden="true"
                style={{
                  width: 50,
                  height: 40,
                  borderRadius: 14,
                  border: `3px solid ${stitch.secondary}`,
                  position: "relative",
                  boxShadow: `0 0 22px ${stitch.secondary}33`,
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: 8,
                    top: 14,
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: stitch.secondary,
                  }}
                />
              </div>
            </div>

            <h1
              style={{
                position: "relative",
                margin: "0 0 10px",
                color: stitch.secondary,
                fontSize: 24,
                lineHeight: 1.35,
                fontWeight: 950,
                textShadow: `0 0 24px ${stitch.secondary}33`,
              }}
            >
              مرحباً بك في مدير الثروة الذكي
            </h1>
            <p
              style={{
                position: "relative",
                margin: "0 auto 22px",
                maxWidth: 310,
                color: stitch.textMuted,
                fontSize: 13,
                lineHeight: 1.9,
                fontWeight: 700,
              }}
            >
              لنبدأ بضبط بياناتك الأساسية حتى يعمل التطبيق بشكل صحيح.
            </p>

            <div style={{ position: "relative", width: "100%", display: "grid", gap: 10 }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  width: "100%",
                  minHeight: 50,
                  borderRadius: 12,
                  border: `1px solid ${stitch.secondary}`,
                  background: stitch.secondary,
                  color: stitch.onSecondary,
                  fontFamily: stitch.font,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: `0 14px 36px ${stitch.secondary}2E`,
                  fontSize: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                <span>ابدأ الآن</span>
                <span aria-hidden="true" style={{ fontSize: 22 }}>←</span>
              </button>
            </div>

            <div
              aria-hidden="true"
              style={{
                display: "flex",
                alignItems: "end",
                justifyContent: "center",
                gap: 5,
                height: 42,
                marginTop: 22,
                opacity: 0.24,
              }}
            >
              {[16, 25, 36, 22, 31].map((height, index) => (
                <span
                  key={index}
                  style={{
                    width: 5,
                    height,
                    borderRadius: 99,
                    background: stitch.secondary,
                  }}
                />
              ))}
            </div>

            <div
              style={{
                position: "relative",
                marginTop: 12,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                padding: "9px 14px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(21,31,55,0.62)",
                color: stitch.textMuted,
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              <span aria-hidden="true" style={{ color: "#b9c7e4" }}>◇</span>
              <span>بياناتك محفوظة داخل التطبيق</span>
            </div>
          </div>
        )}

        {step === 1 && (
          <div style={{ position: "relative", display: "grid", gap: 18 }}>
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: -70,
                left: -85,
                width: 190,
                height: 190,
                borderRadius: "50%",
                background: `${stitch.secondary}10`,
                filter: "blur(68px)",
              }}
            />
            <div style={{ position: "relative" }}>
              <h1 style={{ margin: "0 0 8px", color: stitch.text, fontSize: 22, lineHeight: "30px", fontWeight: 700 }}>
                الإدارة المالية
              </h1>
              <p style={{ margin: 0, color: stitch.textMuted, fontSize: 10, lineHeight: "18px", fontWeight: 500 }}>
                حدد دخلك وسقف صرفك الشهري لبدء التخطيط الذكي.
              </p>
            </div>

            {[
              {
                id: "salary",
                label: "الراتب الشهري",
                value: salary,
                setter: setSalary,
                icon: "¤",
              },
              {
                id: "spendingCap",
                label: "سقف الصرف الشهري",
                value: spendingCap,
                setter: setSpendingCap,
                icon: "▣",
              },
            ].map((field) => (
              <label key={field.id} style={{ display: "grid", gap: 7 }}>
                <span style={{ color: stitch.textMuted, fontSize: 9, fontWeight: 700, paddingInline: 2 }}>
                  {field.label}
                </span>
                <span
                  style={{
                    minHeight: 48,
                    display: "grid",
                    gridTemplateColumns: "22px minmax(0,1fr) auto",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 10px",
                    borderRadius: 7,
                    background: "#112240",
                    border: "1px solid #233554",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      display: "grid",
                      placeItems: "center",
                      color: stitch.outline,
                      background: "rgba(255,255,255,0.06)",
                      fontWeight: 950,
                    }}
                  >
                    {field.icon}
                  </span>
                  <input
                    type="number"
                    value={field.value}
                    onChange={(event) => field.setter(event.target.value)}
                    placeholder="0.00"
                    style={{
                      width: "100%",
                      border: 0,
                      outline: "none",
                      background: "transparent",
                      color: "#8f9097",
                      textAlign: "left",
                      direction: "ltr",
                      fontSize: 22,
                      fontWeight: 700,
                      fontFamily: stitch.numeral,
                    }}
                  />
                  <span style={{ color: stitch.textMuted, fontSize: 10, fontWeight: 700 }}>
                    {currencyLabel}
                  </span>
                </span>
              </label>
            ))}

            <div
              style={{
                position: "relative",
                padding: 12,
                borderRadius: 7,
                background: "rgba(21,31,55,0.70)",
                border: "1px solid rgba(35,53,84,0.50)",
                boxShadow: "none",
                display: "grid",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                <span style={{ color: stitch.textMuted, fontSize: 10, fontWeight: 700 }}>
                  المتاح بعد الالتزامات
                </span>
                <span
                  style={{
                    color: canContinueRequired ? stitch.secondary : stitch.error,
                    fontSize: 14,
                    fontWeight: 700,
                    direction: "ltr",
                  }}
                >
                  {maxCap.toFixed(2)} {currencyLabel}
                </span>
              </div>
              <div style={{ height: 1, background: "rgba(68,71,77,0.45)" }} />
              <p style={{ margin: 0, color: stitch.textMuted, fontSize: 9, lineHeight: "16px" }}>
                المتاح بعد الالتزامات الشهرية الثابتة = الراتب - الالتزامات الهيكلية.
              </p>
              {!canContinueRequired && (safeSalary > 0 || safeCap > 0) && (
                <div style={{ color: stitch.error, fontSize: 10, fontWeight: 700 }}>
                  يجب أن يكون سقف الصرف أقل أو يساوي المتاح.
                </div>
              )}
            </div>

          </div>
        )}

        {step === 2 && (
          <div style={{ display: "grid", gap: 34, fontFamily: stitch.font, color: stitch.text, minHeight: 365 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <span style={{ color: stitch.textMuted, fontSize: 20 }}>→</span>
              <h1 style={{ margin: 0, color: stitch.secondary, fontSize: 18, lineHeight: "28px", fontWeight: 700 }}>
                مدير الثروة الذكي
              </h1>
              <span style={{ width: 20 }} />
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ textAlign: "right" }}>
                <h2 style={{ margin: "0 0 5px", color: stitch.text, fontSize: 16, lineHeight: "26px", fontWeight: 700 }}>
                  هل لديك التزامات شهرية ثابتة؟
                </h2>
                <p style={{ margin: 0, color: stitch.textMuted, fontSize: 12, lineHeight: "20px", fontWeight: 500 }}>
                  مثل الإيجار، القروض، أو أقساط القروض.
                </p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <button type="button" onClick={() => { setHasStructuralObligations(true); setShowStructuralForm(true); }} style={stitchChoice(hasStructuralObligations === true)}>نعم</button>
                <button type="button" onClick={() => { setHasStructuralObligations(false); setShowStructuralForm(false); setStructuralName(""); setStructuralMonthly(""); }} style={stitchChoice(hasStructuralObligations === false)}>لا</button>
              </div>
              {hasStructuralObligations === true && (
                <div style={{ ...stitchPanel, padding: 12, display: "grid", gap: 9 }}>
                  <div style={{ display: "flex", gap: 6, justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: stitch.textMuted, fontSize: 12, fontWeight: 700 }}>إدخال الالتزامات الشهرية الثابتة</span>
                    <button type="button" onClick={addAnotherStructuralRow} style={{ ...stitchAddButton, padding: 0 }}>+ إضافة</button>
                  </div>
                  {showStructuralForm && (
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 105px", gap: 8 }}>
                      <input value={structuralName} onChange={(event) => setStructuralName(event.target.value)} placeholder="مثال: إيجار" style={stitchInput} />
                      <input type="number" value={structuralMonthly} onChange={(event) => setStructuralMonthly(event.target.value)} placeholder="القسط" style={stitchNumberInput} />
                    </div>
                  )}
                  {showStructuralForm && (
                    <button type="button" onClick={addStructuralRow} style={{ ...stitchChoice(true), minHeight: 38 }}>
                      حفظ الالتزام
                    </button>
                  )}
                  {structuralRows.map((row) => (
                    <div key={row.id} style={{ color: stitch.textMuted, fontSize: 11 }}>
                      {row.name}: {Number(row.monthly).toFixed(2)} {currencyLabel}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ height: 1, background: "rgba(68,71,77,0.45)" }} />

            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ textAlign: "right" }}>
                <h2 style={{ margin: "0 0 5px", color: stitch.text, fontSize: 16, lineHeight: "26px", fontWeight: 700 }}>
                  هل تريد تحديد سقوف لبنود الصرف؟
                </h2>
                <p style={{ margin: 0, color: stitch.textMuted, fontSize: 12, lineHeight: "20px", fontWeight: 500 }}>
                  للتحكم في الصرف الشهري وضبط المصاريف.
                </p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <button type="button" onClick={() => setHasCategoryCaps(true)} style={stitchChoice(hasCategoryCaps === true)}>نعم</button>
                <button type="button" onClick={() => { setHasCategoryCaps(false); setCaps({}); }} style={stitchChoice(hasCategoryCaps === false)}>لا</button>
              </div>
              {hasCategoryCaps === true && (
                <div style={{ ...stitchPanel, padding: 12, display: "grid", gap: 8 }}>
                  {DEFAULT_EXPENSE_CATEGORIES.filter((category) => !category.isOther).map((category) => (
                    <label key={category.id} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 104px", gap: 8, alignItems: "center" }}>
                      <span style={{ color: stitch.text, fontSize: 12, fontWeight: 700 }}>{category.icon} {category.label}</span>
                      <input type="number" value={caps?.[category.label] || ""} onChange={(event) => setCaps((prev) => ({ ...prev, [category.label]: Math.max(0, Number(event.target.value || 0)) }))} style={stitchNumberInput} />
                    </label>
                  ))}
                  <div style={{ color: plannedCapsTotal > safeCap ? stitch.error : stitch.secondary, fontSize: 11, fontWeight: 700 }}>
                    مجموع سقوف البنود: {plannedCapsTotal.toFixed(2)} / {safeCap.toFixed(2)} {currencyLabel}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: "grid", gap: 16, fontFamily: stitch.font, color: stitch.text }}>
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 38, height: 38, borderRadius: 10, display: "grid", placeItems: "center", background: "rgba(233,195,73,0.10)", color: stitch.secondary, fontSize: 19 }}>▣</span>
                <h2 style={{ margin: 0, color: stitch.secondary, fontSize: 20, lineHeight: "28px", fontWeight: 700 }}>الأصول الحالية</h2>
              </div>
              <p style={{ margin: 0, color: stitch.textMuted, fontSize: 14, lineHeight: "24px" }}>
                لنقم بتحديد ممتلكاتك المالية الحالية لبدء إدارة ثروتك بدقة.
              </p>
            </div>

            <div style={{ ...stitchPanel, padding: 16, display: "grid", gap: 14 }}>
              <label style={{ color: stitch.textMuted, fontSize: 14, fontWeight: 600 }}>هل لديك أصول حالية؟</label>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={() => setHasOpeningAssets(true)} style={stitchChoice(hasOpeningAssets === true)}>نعم</button>
                <button type="button" onClick={() => setHasOpeningAssets(false)} style={stitchChoice(hasOpeningAssets === false)}>لا</button>
              </div>
            </div>

            {hasOpeningAssets && (
              <div style={{ display: "grid", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  {assetKindOptions.map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setOpeningAssetKind(value)}
                      style={{
                        ...stitchPanel,
                        minHeight: 44,
                        padding: "9px 6px",
                        color: openingAssetKind === value ? stitch.onSecondary : stitch.text,
                        background: openingAssetKind === value ? stitch.secondary : "rgba(21,31,55,0.70)",
                        fontFamily: stitch.font,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div style={{ ...stitchPanel, padding: 16, display: "grid", gap: 10 }}>
                  {openingAssetKind !== "cash" && (
                    <>
                      <label style={{ color: stitch.textMuted, fontSize: 12, fontWeight: 600 }}>
                        {openingAssetKind === "bank" ? "اسم البنك" : "اسم الأصل"}
                      </label>
                      {openingAssetKind === "gold" && (
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {goldKaratOptions.map((label) => (
                            <button key={label} type="button" onClick={() => setOpeningAssetName(label)} style={choiceButtonStyle(openingAssetName === label, stitch.secondary)}>
                              {label}
                            </button>
                          ))}
                        </div>
                      )}
                      <input value={openingAssetName} onChange={(event) => setOpeningAssetName(event.target.value)} placeholder={openingAssetKind === "gold" ? "مثال: ذهب 21" : openingAssetKind === "silver" ? "مثال: فضة" : openingAssetKind === "stock" ? "اسم السهم" : openingAssetKind === "goods" ? "اسم البضاعة أو الأصل" : "اسم البنك"} style={stitchInput} />
                    </>
                  )}
                  {openingAssetKind === "cash" || openingAssetKind === "bank" ? (
                    <>
                      <label style={{ color: stitch.textMuted, fontSize: 12, fontWeight: 600 }}>{openingAssetKind === "cash" ? "النقد (كاش)" : "الرصيد"}</label>
                      <div style={{ position: "relative" }}>
                        <input type="number" value={openingAssetAmount} onChange={(event) => setOpeningAssetAmount(event.target.value)} placeholder="0.00" style={{ ...stitchNumberInput, paddingLeft: 58 }} />
                        <span style={{ position: "absolute", left: 12, top: 13, color: stitch.textMuted, fontSize: 12, fontWeight: 700 }}>{currencyLabel}</span>
                      </div>
                    </>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
                      <input type="number" value={openingAssetUnits} onChange={(event) => setOpeningAssetUnits(event.target.value)} placeholder="جرام / وحدات" style={stitchNumberInput} />
                      <input type="number" value={openingAssetPrice} onChange={(event) => setOpeningAssetPrice(event.target.value)} placeholder="السعر" style={stitchNumberInput} />
                    </div>
                  )}
                  <button type="button" onClick={addOpeningAssetRow} style={{ ...stitchAddButton, borderTop: `1px solid ${stitch.outlineVariant}`, marginTop: 4 }}>
                    + إضافة الأصل
                  </button>
                </div>

                {openingAssetRows.map((row) => (
                  <div key={row.id} style={{ ...stitchPanel, padding: "10px 12px", color: stitch.textMuted, fontSize: 12 }}>
                    {row.name}: {row.kind === "cash" || row.kind === "bank" ? Number(row.amount || 0).toFixed(2) : `${row.units} × ${row.price}`} {currencyLabel}
                  </div>
                ))}
              </div>
            )}
            {hasOpeningAssets === false && (
              <div style={{ ...stitchPanel, padding: 14, color: stitch.textMuted, fontSize: 13 }}>
                تم تخطي الأرصدة الافتتاحية. يمكنك إضافتها لاحقًا من الإعدادات.
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div style={{ display: "grid", gap: 16, fontFamily: stitch.font, color: stitch.text }}>
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 38, height: 38, borderRadius: 10, display: "grid", placeItems: "center", background: "rgba(147,0,10,0.20)", color: stitch.error, fontSize: 19 }}>▤</span>
                <h2 style={{ margin: 0, color: stitch.secondary, fontSize: 20, lineHeight: "28px", fontWeight: 700 }}>الالتزامات والبطاقات</h2>
              </div>
              <p style={{ margin: 0, color: stitch.textMuted, fontSize: 14, lineHeight: "24px" }}>
                ساعدنا في تنظيم ديونك والتزاماتك الشهرية لإدارة تدفقاتك النقدية.
              </p>
            </div>

            <div style={{ ...stitchPanel, padding: 16, display: "grid", gap: 14 }}>
              <label style={{ color: stitch.textMuted, fontSize: 14, fontWeight: 600 }}>هل لديك التزامات جارية أو بطاقات ائتمان؟</label>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={() => setHasCurrentObligations(true)} style={stitchChoice(hasCurrentObligations === true)}>نعم</button>
                <button type="button" onClick={() => setHasCurrentObligations(false)} style={stitchChoice(hasCurrentObligations === false)}>لا</button>
              </div>
            </div>

            {hasCurrentObligations && (
              <div style={{ display: "grid", gap: 22 }}>
                <div style={{ display: "grid", gap: 10 }}>
                  <h3 style={{ margin: 0, paddingRight: 8, borderRight: `2px solid ${stitch.secondary}`, color: stitch.secondary, fontSize: 14, fontWeight: 700 }}>
                    الديون والالتزامات
                  </h3>
                  {showLiabilityForm && (
                    <div style={{ ...stitchPanel, padding: 16, display: "grid", gap: 12 }}>
                      <label style={{ display: "grid", gap: 5 }}>
                        <span style={{ color: stitch.textMuted, fontSize: 11, fontWeight: 700 }}>اسم الدائن</span>
                        <input value={liabilityName} onChange={(event) => setLiabilityName(event.target.value)} placeholder="بنك، شخص، جهة..." style={stitchInput} />
                      </label>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
                        <label style={{ display: "grid", gap: 5 }}>
                          <span style={{ color: stitch.textMuted, fontSize: 11, fontWeight: 700 }}>المبلغ الإجمالي</span>
                          <input type="number" value={liabilityAmount} onChange={(event) => setLiabilityAmount(event.target.value)} placeholder="0.00" style={stitchNumberInput} />
                        </label>
                        <label style={{ display: "grid", gap: 5 }}>
                          <span style={{ color: stitch.textMuted, fontSize: 11, fontWeight: 700 }}>تاريخ الاستحقاق</span>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, minHeight: 44, padding: "0 10px", borderRadius: 10, border: `1px solid ${stitch.outlineVariant}`, background: stitch.surfaceLow, color: liabilityDueDate ? stitch.text : stitch.textMuted }}>
                            <span style={{ fontSize: 11, fontWeight: 700 }}>{liabilityDueDate || "اختر التاريخ"}</span>
                            <CalendarDatePicker value={liabilityDueDate} onChange={setLiabilityDueDate} label="اختيار تاريخ استحقاق الالتزام" />
                          </div>
                        </label>
                      </div>
                      <button type="button" onClick={addLiabilityRow} style={{ ...stitchChoice(true), minHeight: 40 }}>
                        حفظ الالتزام الجاري
                      </button>
                    </div>
                  )}
                  {liabilityRows.map((row) => (
                    <div key={row.id} style={{ ...stitchPanel, padding: "10px 12px", color: stitch.textMuted, fontSize: 12 }}>
                      {row.name}: {row.amount.toFixed(2)} - {row.dueDate}
                    </div>
                  ))}
                  <button type="button" onClick={() => setShowLiabilityForm(true)} style={stitchAddButton}>
                    + إضافة التزام آخر
                  </button>
                </div>

                <div style={{ display: "grid", gap: 10 }}>
                  <h3 style={{ margin: 0, paddingRight: 8, borderRight: `2px solid ${stitch.secondary}`, color: stitch.secondary, fontSize: 14, fontWeight: 700 }}>
                    بطاقات الائتمان
                  </h3>
                  {showCardForm && (
                    <div style={{ ...stitchPanel, padding: 16, display: "grid", gap: 12 }}>
                      <label style={{ display: "grid", gap: 5 }}>
                        <span style={{ color: stitch.textMuted, fontSize: 11, fontWeight: 700 }}>اسم البطاقة</span>
                        <input value={cardName} onChange={(event) => setCardName(event.target.value)} placeholder="مثلاً: فيزا العربي" style={stitchInput} />
                      </label>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <label style={{ display: "grid", gap: 5 }}>
                          <span style={{ color: stitch.textMuted, fontSize: 11, fontWeight: 700 }}>الحد الائتماني</span>
                          <input type="number" value={cardLimit} onChange={(event) => setCardLimit(event.target.value)} placeholder="0.00" style={stitchNumberInput} />
                        </label>
                        <label style={{ display: "grid", gap: 5 }}>
                          <span style={{ color: stitch.textMuted, fontSize: 11, fontWeight: 700 }}>الرصيد المستخدم</span>
                          <input type="number" value={cardBalance} onChange={(event) => setCardBalance(event.target.value)} placeholder="0.00" style={stitchNumberInput} />
                        </label>
                      </div>
                      <label style={{ display: "grid", gap: 5 }}>
                        <span style={{ color: stitch.textMuted, fontSize: 11, fontWeight: 700 }}>يوم السداد شهرياً (1-31)</span>
                        <input type="number" min="1" max="31" value={cardDueDay} onChange={(event) => setCardDueDay(event.target.value)} placeholder="مثال: 25" style={stitchNumberInput} />
                      </label>
                      <button type="button" onClick={addCardRow} style={{ ...stitchChoice(true), minHeight: 40 }}>
                        حفظ البطاقة
                      </button>
                    </div>
                  )}
                  {cardRows.map((row) => (
                    <div key={row.id} style={{ ...stitchPanel, padding: "10px 12px", color: stitch.textMuted, fontSize: 12 }}>
                      {row.name}: {row.balance.toFixed(2)} / {row.creditLimit.toFixed(2)}
                    </div>
                  ))}
                  <button type="button" onClick={() => setShowCardForm(true)} style={stitchAddButton}>
                    + إضافة بطاقة أخرى
                  </button>
                </div>
              </div>
            )}
            {hasCurrentObligations === false && (
              <div style={{ ...stitchPanel, padding: 14, color: stitch.textMuted, fontSize: 13 }}>
                تم تخطي الالتزامات والبطاقات. يمكنك إضافتها لاحقًا من تبويب الخصوم أو الإعدادات.
              </div>
            )}
          </div>
        )}

        {step === 5 && (
          <div style={{ display: "grid", gap: 12, fontFamily: stitch.font, color: stitch.text }}>
            <header style={{ textAlign: "center", padding: "6px 0 2px" }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  margin: "0 auto 10px",
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  background: "rgba(233,195,73,0.10)",
                  color: stitch.secondary,
                  fontSize: 24,
                  fontWeight: 900,
                }}
              >
                ✓
              </div>
              <h1 style={{ margin: "0 0 5px", color: stitch.secondary, fontSize: 21, lineHeight: "30px", fontWeight: 700 }}>
                المراجعة النهائية
              </h1>
              <p style={{ margin: "0 auto", maxWidth: 190, color: "#ffe088", fontSize: 11, lineHeight: "18px" }}>
                تأكد من صحة البيانات المدخلة قبل البدء في رحلة إدارة ثروتك.
              </p>
            </header>

            <div style={{ ...stitchPanel, padding: 14, display: "grid", gap: 12, textAlign: "center" }}>
              <span style={{ color: "#ffe088", fontSize: 11, fontWeight: 700 }}>الراتب الشهري</span>
              <span style={{ color: "#fff", fontFamily: stitch.numeral, fontSize: 31, lineHeight: "36px", fontWeight: 700 }}>
                {safeSalary.toFixed(2)} <span style={{ fontFamily: stitch.font, fontSize: 13 }}>{currencyLabel}</span>
              </span>
              <div style={{ height: 1, background: "rgba(197,198,205,0.30)" }} />
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <div style={{ display: "grid", gap: 3, textAlign: "right" }}>
                  <span style={{ color: "#ffe088", fontSize: 10, fontWeight: 700 }}>سقف الصرف</span>
                  <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>{safeCap.toFixed(2)} {currencyLabel}</span>
                </div>
                <div style={{ display: "grid", gap: 3, textAlign: "left" }}>
                  <span style={{ color: "#ffe088", fontSize: 10, fontWeight: 700 }}>الالتزامات الثابتة</span>
                  <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>{totalStructural.toFixed(2)} {currencyLabel}</span>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div style={{ ...stitchPanel, padding: 12, display: "grid", gap: 5 }}>
                <span style={{ color: "#e9c349", fontSize: 18 }}>▣</span>
                <span style={{ color: "#ffe088", fontSize: 10, fontWeight: 700 }}>الأرصدة الحالية</span>
                <span style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>{openingAssetsTotal.toFixed(2)}</span>
                <span style={{ color: "#ffe088", fontSize: 9 }}>{currencyLabel}</span>
              </div>
              <div style={{ ...stitchPanel, padding: 12, display: "grid", gap: 5 }}>
                <span style={{ color: "#e9c349", fontSize: 18 }}>▤</span>
                <span style={{ color: "#ffe088", fontSize: 10, fontWeight: 700 }}>البطاقات والالتزامات</span>
                <span style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>{currentObligationCount}</span>
                <span style={{ color: "#ffe088", fontSize: 9 }}>عناصر مسجلة</span>
              </div>
            </div>

            <div style={{ ...stitchPanel, padding: 12, position: "relative", overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ margin: 0, color: stitch.text, fontSize: 15, fontWeight: 700 }}>توزيع التدفق المالي</h3>
                <span style={{ color: "#ffe088", fontSize: 18 }}>⌁</span>
              </div>
              {[
                ["الالتزامات", structuralPct, stitch.error],
                ["سقف الصرف", spendingPct, stitch.secondary],
                ["الادخار المتوقع", savingsPct, "#22c55e"],
              ].map(([label, pct, color]) => (
                <div key={label} style={{ marginBottom: 11 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#fff", fontSize: 11, marginBottom: 5 }}>
                    <span>{label}</span>
                    <span>{Number(pct).toFixed(0)}%</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 999, overflow: "hidden", background: "#d9e2ff" }}>
                    <div style={{ width: `${Number(pct).toFixed(0)}%`, height: "100%", background: color }} />
                  </div>
                </div>
              ))}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  right: -35,
                  bottom: -35,
                  width: 105,
                  height: 105,
                  borderRadius: "50%",
                  background: "rgba(233,195,73,0.10)",
                  filter: "blur(22px)",
                }}
              />
            </div>
          </div>
        )}

        {step > 0 && (
          <div
            style={{
              position: "absolute",
              left: 10,
              right: 10,
              bottom: 0,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
              padding: "22px 0 12px",
              background: "linear-gradient(180deg, rgba(8,19,42,0), rgba(8,19,42,0.98) 34%)",
            }}
          >
            <button
              type="button"
              onClick={() => setStep((value) => Math.max(0, value - 1))}
              style={{
                minHeight: 44,
                borderRadius: 10,
                border: `1px solid ${stitch.secondary}`,
                background: "transparent",
                color: stitch.secondary,
                fontFamily: stitch.font,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              رجوع
            </button>
              {step < 5 ? (
                <button
                type="button"
                onClick={goNext}
                style={{
                  minHeight: 44,
                  borderRadius: 10,
                  border: `1px solid ${stitch.secondary}`,
                  background: stitch.secondary,
                  color: stitch.onSecondary,
                  fontFamily: stitch.font,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 10px 24px rgba(233,195,73,0.22)",
                }}
              >
                {step === 1 ? "متابعة" : "التالي / تخطي"}
              </button>
            ) : (
              <button
                type="button"
                onClick={finishSetup}
                style={{
                  minHeight: 44,
                  borderRadius: 10,
                  border: `1px solid ${stitch.secondary}`,
                  background: stitch.secondary,
                  color: stitch.onSecondary,
                  fontFamily: stitch.font,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 10px 24px rgba(233,195,73,0.22)",
                }}
              >
                بدء استخدام التطبيق
              </button>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

export default function App() {
  const [state, setState] = useState(INITIAL_STATE);
  const [storageReady, setStorageReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  const saveQueueRef = useRef(Promise.resolve());
  const resettingStateRef = useRef(false);
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
    if (!storageReady || !authSession || resettingStateRef.current) return;
    const stateSnapshot = structuredClone(state);
    const queuedSave = saveQueueRef.current
      .catch(() => undefined)
      .then(() => {
        if (resettingStateRef.current) return undefined;
        return saveState(stateSnapshot, authSession);
      });
    saveQueueRef.current = queuedSave;
    queuedSave.catch((err) => {
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
    const rollOrRequestSurplusAllocation = (prev) => {
      const targetMonth = new Date().toISOString().slice(0, 7);
      const hasMonthToClose = String(prev.currentMonth || targetMonth) < targetMonth;
      const remainingCap = getRemainingSpendingCapAtClose(prev);
      if (hasMonthToClose && prev.session?.isOpen && remainingCap > 0.01) {
        setExtraCashPreset({
          amount: Number(remainingCap.toFixed(2)),
          lockedAmount: true,
          lockedNote: true,
          note: "فائض نهاية الشهر",
          source: "month_end_surplus",
        });
        setShowExtraCash(true);
        return prev;
      }
      return rollStateToCurrentMonth(prev);
    };
    const initialTimer = window.setTimeout(() => {
      setState((prev) => rollOrRequestSurplusAllocation(prev));
    }, 0);
    const timer = window.setInterval(() => {
      setState((prev) => rollOrRequestSurplusAllocation(prev));
    }, 60 * 1000);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
    };
  }, [storageReady]);
    useEffect(() => {
    if (!storageReady) return undefined;
    const timer = window.setTimeout(() => {
      setState((prev) => syncAssetDailySnapshot(prev, new Date()));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [storageReady, state.assets, state.settings?.market]);
function handleExtraCashSubmit(data) {
  const amount = Number(data.amount || 0);

  if (!amount || amount <= 0) {
    alert("أدخل مبلغًا صحيحًا");
    return;
  }

  setState((prev) => {
    const now = new Date().toISOString();
    const recordedAt = new Date().toISOString();
    const movementOrderBase = Date.now();
    let movementOrderStep = 0;
    const nextMovementMeta = (suffix) => {
      movementOrderStep += 1;
      return {
        id: `${movementOrderBase}-${movementOrderStep}-${suffix}`,
        recordedAt,
        sortSequence: movementOrderBase * 1000 + movementOrderStep,
      };
    };
    const allocation = data.allocation || data.direction || "spendingCap";
    const isSalarySurplus = data.source === "salary_surplus";
    const isMonthEndSurplus = data.source === "month_end_surplus";
    const isRequiredSurplus = isSalarySurplus || isMonthEndSurplus;
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
      extraCash: isRequiredSurplus ? prev.extraCash || [] : [...(prev.extraCash || []), record],
      transactions: isRequiredSurplus ? prev.transactions || [] : [...(prev.transactions || []), record],
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
          type === "custom" ? Number(existing.wac ?? existing.price ?? 0) : Number(existing.wac || 0);
        const totalUnits = oldUnits + units;
        const nextAverage =
          totalUnits > 0
            ? Number(((oldUnits * oldAverage + purchaseValue) / totalUnits).toFixed(4))
            : price;

        existing.units = Number(totalUnits.toFixed(4));
        if (type === "custom") {
          existing.wac = nextAverage;
          existing.price = nextAverage;
        } else {
          existing.wac = nextAverage;
        }
        if (["stocks", "gold", "silver", "custom"].includes(listName)) {
          existing.currentPrice = price;
        }
        next.assetHistory.push({
          ...nextMovementMeta(allocation),
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
            wac: price,
            currentPrice: price,
          });
        } else {
          list.push({
            id,
            label: targetName,
            units,
            wac: price,
            currentPrice: price,
          });
        }
        next.assetHistory.push({
          ...nextMovementMeta(allocation),
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
        ...nextMovementMeta("spendingCap"),
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
        ...nextMovementMeta("cash"),
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
          ...nextMovementMeta("bank"),
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
          ...nextMovementMeta("bank"),
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
          ...nextMovementMeta("fixed"),
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
          ...nextMovementMeta("fixed"),
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

    if (isMonthEndSurplus) {
      next.session = {
        ...next.session,
        spendingCap: getCoveredSpentFromCap(next),
        pendingSurplus: 0,
      };
      next = closeMonthState(next, next.currentMonth || getMonthKey(now));
      next = syncAssetDailySnapshot(next, new Date());
    }

    return next;
  });

  setShowExtraCash(false);
  setExtraCashPreset(null);
}

async function handleClearState() {
  resettingStateRef.current = true;
  setStorageReady(false);
  try {
    await saveQueueRef.current.catch(() => undefined);
    await clearState(authSession);
    const cleanState = structuredClone(INITIAL_STATE);
    cleanState.currentMonth = new Date().toISOString().slice(0, 7);
    cleanState.settings = {
      ...cleanState.settings,
      month: cleanState.currentMonth,
      setupComplete: false,
    };
    cleanState.assets = structuredClone(INITIAL_STATE.assets);
    cleanState.extraCash = [];
    cleanState.expenseCategories = structuredClone(INITIAL_STATE.expenseCategories);
    cleanState.structuralLiabilities = [];
    cleanState.currentLiabilities = [];
    cleanState.reservedPayments = [];
    cleanState.session = structuredClone(INITIAL_STATE.session);
    cleanState.expenses = [];
    cleanState.transactions = [];
    cleanState.monthlySnapshots = [];
    cleanState.assetDailySnapshots = [];
    cleanState.assetHistory = [];
    await saveState(cleanState, authSession);
    setState(cleanState);
    window.location.reload();
  } catch (err) {
    resettingStateRef.current = false;
    setStorageReady(true);
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
  const activeAccountingMonth = state.currentMonth || new Date().toISOString().slice(0, 7);
  const currentMonthLabel = formatMonthKey(activeAccountingMonth);

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
const canLeaveSettingsTab = () => {
  if (tab !== "settings") return true;

  const plannedCapsTotal = sumExpenseCategoryCaps(state.settings?.expenseCategoryCaps || {});
  const spendingCap = Number(
    (state.session?.isOpen
      ? state.session?.spendingCap
      : state.settings?.spendingCap ?? state.session?.spendingCap) || 0
  );
  if (plannedCapsTotal <= spendingCap) return true;

  const currencyLabel = getCurrencyLabel(state);
  alert(
    `مجموع سقوف البنود (${plannedCapsTotal.toFixed(
      2
    )} ${currencyLabel}) أعلى من سقف الصرف (${spendingCap.toFixed(
      2
    )} ${currencyLabel}). عدّل سقف الصرف أو خفّض سقوف البنود قبل الخروج.`
  );
  return false;
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

  const setupComplete = Boolean(
    state.settings?.setupComplete ||
      state.session?.isOpen ||
      (state.monthlySnapshots || []).length
  );

  if (!setupComplete && !selectedViewSnapshot) {
    return (
      <LocaleProvider
        language={appLanguage}
        currency={state.settings?.locale?.currency || "JOD"}
      >
        <div style={{ direction: appDirection }}>
          <OnboardingFlow
            state={state}
            setState={setState}
            onComplete={(surplus) => {
              setTab("overview");
              if (Number(surplus || 0) > 0.01) {
                setExtraCashPreset({
                  amount: Number(surplus),
                  lockedAmount: true,
                  lockedNote: true,
                  note: "فائض راتب",
                  source: "salary_surplus",
                });
                setShowExtraCash(true);
              }
            }}
          />
        </div>
      </LocaleProvider>
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
        expenseCategoryCaps:
          selectedViewSnapshot.expenseCategoryCaps ??
          state.settings?.expenseCategoryCaps ??
          {},
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
      reservedPayments: selectedViewSnapshot.reservedPayments || [],
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
            onCloseDueFocus={() => {
              setLiabilitiesFocusDueOnly(false);
              setTab("overview");
            }}
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
          if (id !== tab && !canLeaveSettingsTab()) return;
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
