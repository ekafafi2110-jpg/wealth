import { deductFromAsset } from "./assets.js";

export function recordExpense(state, expenseData) {
  const now = new Date().toISOString();
const today = now.slice(0, 10);
  const amount = Number(expenseData.amount || 0);

  if (amount <= 0) {
    return {
      success: false,
      nextState: state,
      message: "أدخل مبلغًا صحيحًا",
    };
  }

  const next = structuredClone(state);

  const spendingCap = Number(next.session.spendingCap || 0);
  const coveredSpent = Number(next.session.coveredSpent || 0);
  const remainingCap = Math.max(0, spendingCap - coveredSpent);

  const isEmergency = expenseData.paymentMethod === "emergency";
  const isAssetPayment = expenseData.paymentMethod === "asset";
  const emergencyFunding = expenseData.emergencyFunding || {};
  const emergencyMode = emergencyFunding.mode || "";
  const emergencyRemainderSource = emergencyFunding.remainderSource || "asset";

  let budgetCovered = isAssetPayment ? 0 : Math.min(amount, remainingCap);

  if (isEmergency) {
    if (!["asset", "liability", "mix"].includes(emergencyMode)) {
      return {
        success: false,
        nextState: state,
        message: "اختر طريقة تمويل المصروف الطارئ",
      };
    }

    budgetCovered =
      emergencyMode === "mix" ? Number(emergencyFunding.capAmount || 0) : 0;

    if (budgetCovered < 0 || budgetCovered > amount) {
      return {
        success: false,
        nextState: state,
        message: "جزء سقف الصرف غير صحيح",
      };
    }

    if (budgetCovered > remainingCap) {
      return {
        success: false,
        nextState: state,
        message: `المتاح من سقف الصرف فقط ${remainingCap.toFixed(2)} د.أ`,
      };
    }
  }

  const fundedOutsideCap = Math.max(0, amount - budgetCovered);
  const overBudget = isEmergency || isAssetPayment ? 0 : fundedOutsideCap;
  const isOverBudget = overBudget > 0;
  const emergencyAssetAmount = isEmergency
    ? emergencyMode === "asset"
      ? amount
      : emergencyMode === "mix" && emergencyRemainderSource === "asset"
      ? fundedOutsideCap
      : 0
    : 0;
  const emergencyLiabilityAmount = isEmergency
    ? emergencyMode === "liability"
      ? amount
      : emergencyMode === "mix" && emergencyRemainderSource === "liability"
      ? fundedOutsideCap
      : 0
    : 0;
  const expenseAmount = isEmergency
    ? Math.max(0, amount - emergencyLiabilityAmount)
    : amount;

  if (isAssetPayment) {
    const deduction = deductFromAsset(next, expenseData.assetKey || "cash", amount);

    if (!deduction.success) {
      return deduction;
    }

    Object.assign(next, deduction.nextState);
  }

  if (isEmergency && emergencyAssetAmount > 0) {
    const deduction = deductFromAsset(
      next,
      emergencyFunding.assetKey || "cash",
      emergencyAssetAmount
    );

    if (!deduction.success) {
      return deduction;
    }

    Object.assign(next, deduction.nextState);
  }

  if (isEmergency && emergencyLiabilityAmount > 0 && !emergencyFunding.dueDate) {
    return {
      success: false,
      nextState: state,
      message: "أدخل تاريخ استحقاق دين المصروف الطارئ",
    };
  }

  const expense = {
    id: Date.now(),
    amount: expenseAmount,
    originalAmount: amount,
    category: expenseData.category,
    paymentMethod: expenseData.paymentMethod,
    cardId: expenseData.cardId || null,
    note: expenseData.note || "",
    date: new Date().toISOString().split("T")[0],
createdAt: new Date().toISOString(),
    budgetCovered,
    overBudget,
    isOverBudget,
    emergencyFunding: isEmergency
      ? {
          mode: emergencyMode,
          capAmount: budgetCovered,
          outsideCapAmount: fundedOutsideCap,
          remainderSource: emergencyRemainderSource,
          assetKey: emergencyAssetAmount > 0 ? emergencyFunding.assetKey || "cash" : "",
          assetAmount: emergencyAssetAmount,
          liabilityAmount: emergencyLiabilityAmount,
        }
      : null,
  };

  next.expenses.push(expense);

  next.session.coveredSpent = Number(
    (Number(next.session.coveredSpent || 0) + budgetCovered).toFixed(2)
  );

  next.session.overBudgetSpent = Number(
    (Number(next.session.overBudgetSpent || 0) + overBudget).toFixed(2)
  );

  if (expenseData.paymentMethod === "card") {
    const card = next.currentLiabilities.find(
      (x) => x.id === Number(expenseData.cardId) && x.type === "card"
    );

    if (!card) {
      return {
        success: false,
        nextState: state,
        message: "اختر بطاقة صحيحة",
      };
    }

    const creditLimit = Number(card.creditLimit || 0);
    const nextCardBalance = Number((Number(card.balance || 0) + amount).toFixed(2));

    if (creditLimit > 0 && nextCardBalance > creditLimit) {
      return {
        success: false,
        nextState: state,
        message: "المبلغ يتجاوز سقف البطاقة",
      };
    }

    card.balance = nextCardBalance;

    card.payableBuffer = Number(
      (Number(card.payableBuffer || 0) + budgetCovered).toFixed(2)
    );

    card.uncoveredDebt = Math.max(
      0,
      Number((Number(card.balance || 0) - Number(card.payableBuffer || 0)).toFixed(2))
    );

    card.status = "pending";
  }

  if (expenseData.paymentMethod === "liability") {
  next.currentLiabilities.push({
    id: Date.now() + 1,
    type: "direct_liability",
    name: expenseData.liabilityName || "دين مباشر من مصروف",

    // إجمالي الدين
    amount,
    balance: amount,

    // الجزء المغطى من سقف الصرف، وهو مبلغ برسم الدفع
    payableBuffer: budgetCovered,

    // الجزء غير المغطى بسبب تجاوز السقف
    uncoveredDebt: overBudget,

    dueDate: expenseData.dueDate || "",
    dueDay: expenseData.dueDate
      ? new Date(expenseData.dueDate).getDate()
      : 1,

    status: "pending",
    source: "expense_payment",
    date: today,
createdAt: now,
    expenseId: expense.id,
  });
}

  if (isEmergency && emergencyLiabilityAmount > 0) {
  next.currentLiabilities.push({
    id: Date.now() + 1,
    type: "direct_liability",
    name: emergencyFunding.liabilityName || "دين مصروف طارئ",
    amount: emergencyLiabilityAmount,
    balance: emergencyLiabilityAmount,
    payableBuffer: 0,
    uncoveredDebt: 0,
    dueDate: emergencyFunding.dueDate || "",
    dueDay: emergencyFunding.dueDate
      ? new Date(emergencyFunding.dueDate).getDate()
      : 1,
    status: "pending",
    source: "emergency_expense",
    date: today,
createdAt: now,
    expenseId: expense.id,
  });
}

  if (isEmergency && emergencyAssetAmount > 0) {
    next.transactions.push({
      id: Date.now() + 3,
      type: "emergency_expense_covered_from_asset",
      amount: emergencyAssetAmount,
      assetKey: emergencyFunding.assetKey || "cash",
      expenseId: expense.id,
      date: now,
    });
  }

  if (isAssetPayment) {
    next.transactions.push({
      id: Date.now() + 3,
      type: "expense_paid_from_asset",
      amount,
      assetKey: expenseData.assetKey || "cash",
      expenseId: expense.id,
      date: now,
    });
  }

  next.transactions.push({
    id: Date.now() + 2,
    type: "expense_recorded",
    amount,
    category: expenseData.category,
    paymentMethod: expenseData.paymentMethod,
    budgetCovered,
    overBudget,
    date: new Date().toISOString(),
  });

  return {
    success: true,
    nextState: next,
  };
}
