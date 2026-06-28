export const INITIAL_STATE = {
  settings: {
    month: new Date().toISOString().slice(0, 7),
    salary: 0,
    expenseCategoryCaps: {},

    market: {
      goldGramPrice: 0,
      silverGramPrice: 0,
    },
    notifications: {
      budget: true,
      liabilities: true,
      expenses: false,
      reports: false,
      sent: {},
    },
  },

  assets: {
    cash: 0,
    banks: [],
    gold: [],
    silver: [],
    stocks: [],
    custom: [],
  },

  extraCash: [],

  expenseCategories: {
    items: [],
  },

  structuralLiabilities: [],
  currentLiabilities: [],
  reservedPayments: [],

  session: {
    isOpen: false,
    salaryNetAfterStructural: 0,
    salaryNetAfterCurrentLiabilities: 0,
    spendingCap: 0,
    coveredSpent: 0,
    overBudgetSpent: 0,
    savingsAmount: 0,
  },

  expenses: [],
  transactions: [],
  monthlySnapshots: [],
  assetDailySnapshots: [],
  currentMonth: new Date().toISOString().slice(0, 7),
  assetHistory: [],
};
