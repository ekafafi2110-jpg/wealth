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

  const budgetCovered = Math.min(amount, remainingCap);
  const overBudget = Math.max(0, amount - budgetCovered);
  const isOverBudget = overBudget > 0;

  const expense = {
    id: Date.now(),
    amount,
    category: expenseData.category,
    paymentMethod: expenseData.paymentMethod,
    cardId: expenseData.cardId || null,
    note: expenseData.note || "",
    date: new Date().toISOString().split("T")[0],
createdAt: new Date().toISOString(),
    budgetCovered,
    overBudget,
    isOverBudget,
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

    card.balance = Number((Number(card.balance || 0) + amount).toFixed(2));

    card.payableBuffer = Number(
      (Number(card.payableBuffer || 0) + budgetCovered).toFixed(2)
    );

    card.uncoveredDebt = Number(
      (Number(card.uncoveredDebt || 0) + overBudget).toFixed(2)
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
    date: new Date().toISOString().split("T")[0],
createdAt: new Date().toISOString(),
    date: today,
createdAt: now,
    expenseId: expense.id,
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