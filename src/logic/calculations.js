export function calcStructuralTotal(state) {
  const structuralList = state.structuralLiabilities || state.structural || [];

  return structuralList.reduce(
    (sum, item) =>
      sum + Number(item.monthlyAmount ?? item.monthly ?? item.amount ?? 0),
    0
  );
}

export function calcCardDebt(card) {
  return Number(card.balance || 0);
}

export function calcCurrentLiabilitiesTotal(state) {
  return state.currentLiabilities.reduce((sum, item) => {
    if (item.status === "paid") return sum;

    if (item.type === "card") {
      return sum + Number(item.balance || 0);
    }

    return sum + Number(item.balance ?? item.amount ?? 0);
  }, 0);
}

export function calcAssets(state) {
  const goldPrice = Number(state.settings.market.goldGramPrice || 0);
  const silverPrice = Number(state.settings.market.silverGramPrice || 0);

  const cash = Number(state.assets.cash || 0);

  const banks = state.assets.banks.reduce(
    (sum, b) => sum + Number(b.balance || 0),
    0
  );

  const gold = state.assets.gold.reduce(
    (sum, g) => sum + Number(g.units || 0) * goldPrice,
    0
  );

  const silver = state.assets.silver.reduce(
    (sum, s) => sum + Number(s.units || 0) * silverPrice,
    0
  );

  const stocks = state.assets.stocks.reduce(
    (sum, s) => sum + Number(s.units || 0) * Number(s.currentPrice || 0),
    0
  );

  const custom = state.assets.custom.reduce((sum, a) => {
    if (a.type === "fixed") return sum + Number(a.amount || 0);
    return sum + Number(a.units || 0) * Number(a.price || 0);
  }, 0);

  const totalAssets = cash + banks + gold + silver + stocks + custom;
  const currentLiabilities = calcCurrentLiabilitiesTotal(state);

  return {
    cash,
    banks,
    gold,
    silver,
    stocks,
    custom,
    totalAssets,
    currentLiabilities,
    netWorth: totalAssets - currentLiabilities,
  };
}

export function calcBudget(state) {
  const spendingCap = Number(state.session.spendingCap || 0);
  const coveredSpent = Number(state.session.coveredSpent || 0);
  const overBudgetSpent = Number(state.session.overBudgetSpent || 0);
  const remainingCap = Math.max(0, spendingCap - coveredSpent);

  return {
    spendingCap,
    coveredSpent,
    overBudgetSpent,
    remainingCap,
    totalSpent: coveredSpent + overBudgetSpent,
  };
}
