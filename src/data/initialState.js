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
