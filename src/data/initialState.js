export const INITIAL_STATE = {
  settings: {
    month: "مايو 2025",
    salary: 1000,

    market: {
      goldGramPrice: 41.2,
      silverGramPrice: 0.55,
    },
  },

  assets: {
    cash: 200,

    banks: [
      {
        id: 1,
        name: "البنك العربي",
        balance: 1500,
      },
    ],

    gold: [
      {
        id: 1,
        label: "ذهب 21",
        units: 5,
        wac: 38.5,
      },
    ],

    silver: [],

    stocks: [
      {
        id: 1,
        name: "البنك العربي",
        units: 100,
        wac: 4.2,
        currentPrice: 4.85,
      },
    ],

    custom: [],
  },
  extraCash: [],
  expenseCategories: {
  items: [
    { id: "food", label: "طعام", icon: "🍽️", color: "#f59e0b", pinned: true },
    { id: "transport", label: "مواصلات", icon: "🚗", color: "#3b82f6", pinned: true },
    { id: "shopping", label: "تسوق", icon: "🛒", color: "#a855f7", pinned: true },
    { id: "health", label: "صحة", icon: "💚", color: "#22c55e", pinned: true },
    { id: "entertainment", label: "ترفيه", icon: "🎮", color: "#ec4899", pinned: true },
    { id: "bills", label: "فواتير", icon: "🧾", color: "#64748b", pinned: true },
    { id: "fuel", label: "بنزين", icon: "⛽", color: "#f97316", pinned: true },
    { id: "other", label: "أخرى", icon: "•••", color: "#94a3b8", isOther: true, pinned: true },

    { id: "clothes", label: "ملابس", icon: "👕", color: "#38bdf8", pinned: false },
    { id: "gifts", label: "هدايا", icon: "🎁", color: "#f472b6", pinned: false },
    { id: "stationery", label: "قرطاسية", icon: "✏️", color: "#a78bfa", pinned: false },
    { id: "school_installments", label: "أقساط مدارس", icon: "🏫", color: "#facc15", pinned: false },
    { id: "car_maintenance", label: "صيانة سيارة", icon: "🔧", color: "#fb923c", pinned: false },
    { id: "home_maintenance", label: "صيانة بيت", icon: "🏠", color: "#34d399", pinned: false },
  ],
},

  structuralLiabilities: [
    {
      id: 1,
      name: "قرض سيارة",
      monthlyAmount: 10,
      dueDay: 1,
    },

    {
      id: 2,
      name: "قرض عقار",
      monthlyAmount: 150,
      dueDay: 5,
    },
  ],

  currentLiabilities: [
    {
      id: 1,
      type: "card",

      name: "فيزا البنك العربي",

      balance: 25,

      payableBuffer: 0,

      uncoveredDebt: 25,

      dueDay: 15,

      status: "pending",
    },

    {
      id: 2,
      type: "personal",

      name: "دين خالد",

      amount: 20,

      dueDay: 10,

      status: "pending",
    },
  ],

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
currentMonth: new Date().toISOString().slice(0, 7),

  assetHistory: [],
};
