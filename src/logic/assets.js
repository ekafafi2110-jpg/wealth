export function getAssetSources(state) {
  const goldPrice = Number(state.settings.market.goldGramPrice || 0);
  const silverPrice = Number(state.settings.market.silverGramPrice || 0);

  const list = [
    {
      key: "cash",
      label: "كاش",
      type: "cash",
      available: Number(state.assets.cash || 0),
    },
  ];

  state.assets.banks.forEach((b) => {
    list.push({
      key: `bank:${b.id}`,
      label: b.name,
      type: "bank",
      available: Number(b.balance || 0),
    });
  });

  state.assets.gold.forEach((g) => {
    list.push({
      key: `gold:${g.id}`,
      label: g.label,
      type: "gold",
      available: Number(g.units || 0) * goldPrice,
    });
  });

  state.assets.silver.forEach((s) => {
    list.push({
      key: `silver:${s.id}`,
      label: s.label,
      type: "silver",
      available: Number(s.units || 0) * silverPrice,
    });
  });

  state.assets.stocks.forEach((s) => {
    list.push({
      key: `stock:${s.id}`,
      label: s.name,
      type: "stock",
      available: Number(s.units || 0) * Number(s.currentPrice || 0),
    });
  });

  state.assets.custom.forEach((c) => {
    const value =
      c.type === "fixed"
        ? Number(c.amount || 0)
        : Number(c.units || 0) * Number(c.price || 0);

    list.push({
      key: `custom:${c.id}`,
      label: c.name,
      type: "custom",
      available: value,
    });
  });

  return list;
}

export function getAssetAvailable(state, key) {
  const item = getAssetSources(state).find((x) => x.key === key);
  return item ? Number(item.available || 0) : 0;
}

export function addToAsset(state, key, amount) {
  const value = Number(amount || 0);
  if (value <= 0) return state;

  const next = structuredClone(state);
  const goldPrice = Number(next.settings.market.goldGramPrice || 0);
  const silverPrice = Number(next.settings.market.silverGramPrice || 0);

  if (key === "cash") {
    next.assets.cash = Number(next.assets.cash || 0) + value;
    return next;
  }

  const [type, idRaw] = key.split(":");
  const id = Number(idRaw);

  if (type === "bank") {
    const item = next.assets.banks.find((x) => x.id === id);
    if (item) item.balance = Number(item.balance || 0) + value;
    return next;
  }

  if (type === "gold") {
    const item = next.assets.gold.find((x) => x.id === id);
    if (item && goldPrice > 0) {
      const addedUnits = value / goldPrice;
      const oldUnits = Number(item.units || 0);
      const oldWac = Number(item.wac || goldPrice);
      const newUnits = oldUnits + addedUnits;

      item.wac =
        newUnits > 0
          ? Number(((oldUnits * oldWac + addedUnits * goldPrice) / newUnits).toFixed(3))
          : goldPrice;

      item.units = Number(newUnits.toFixed(4));
    }
    return next;
  }

  if (type === "silver") {
    const item = next.assets.silver.find((x) => x.id === id);
    if (item && silverPrice > 0) {
      const addedUnits = value / silverPrice;
      const oldUnits = Number(item.units || 0);
      const oldWac = Number(item.wac || silverPrice);
      const newUnits = oldUnits + addedUnits;

      item.wac =
        newUnits > 0
          ? Number(((oldUnits * oldWac + addedUnits * silverPrice) / newUnits).toFixed(3))
          : silverPrice;

      item.units = Number(newUnits.toFixed(4));
    }
    return next;
  }

  if (type === "stock") {
    const item = next.assets.stocks.find((x) => x.id === id);
    if (item && Number(item.currentPrice || 0) > 0) {
      const price = Number(item.currentPrice || 0);
      const addedUnits = value / price;
      const oldUnits = Number(item.units || 0);
      const oldWac = Number(item.wac || price);
      const newUnits = oldUnits + addedUnits;

      item.wac =
        newUnits > 0
          ? Number(((oldUnits * oldWac + addedUnits * price) / newUnits).toFixed(3))
          : price;

      item.units = Number(newUnits.toFixed(4));
    }
    return next;
  }

  if (type === "custom") {
    const item = next.assets.custom.find((x) => x.id === id);

    if (item) {
      if (item.type === "fixed") {
        item.amount = Number(item.amount || 0) + value;
      } else {
        const price = Number(item.price || 1);
        item.units = Number(item.units || 0) + value / price;
      }
    }

    return next;
  }

  return next;
}

export function deductFromAsset(state, key, amount) {
  const value = Number(amount || 0);
  if (value <= 0) return { nextState: state, success: false, message: "المبلغ غير صحيح" };

  const available = getAssetAvailable(state, key);

  if (value > available) {
    return {
      nextState: state,
      success: false,
      message: `الرصيد غير كافٍ. المتاح فقط ${available.toFixed(2)} د.أ`,
    };
  }

  const next = structuredClone(state);
  const goldPrice = Number(next.settings.market.goldGramPrice || 0);
  const silverPrice = Number(next.settings.market.silverGramPrice || 0);

  if (key === "cash") {
    next.assets.cash = Number(next.assets.cash || 0) - value;
    return { nextState: next, success: true };
  }

  const [type, idRaw] = key.split(":");
  const id = Number(idRaw);

  if (type === "bank") {
    const item = next.assets.banks.find((x) => x.id === id);
    if (item) item.balance = Number(item.balance || 0) - value;
    return { nextState: next, success: true };
  }

  if (type === "gold") {
    const item = next.assets.gold.find((x) => x.id === id);
    if (item && goldPrice > 0) {
      item.units = Number((Number(item.units || 0) - value / goldPrice).toFixed(4));
    }
    return { nextState: next, success: true };
  }

  if (type === "silver") {
    const item = next.assets.silver.find((x) => x.id === id);
    if (item && silverPrice > 0) {
      item.units = Number((Number(item.units || 0) - value / silverPrice).toFixed(4));
    }
    return { nextState: next, success: true };
  }

  if (type === "stock") {
    const item = next.assets.stocks.find((x) => x.id === id);
    if (item && Number(item.currentPrice || 0) > 0) {
      item.units = Number(
        (Number(item.units || 0) - value / Number(item.currentPrice || 0)).toFixed(4)
      );
    }
    return { nextState: next, success: true };
  }

  if (type === "custom") {
    const item = next.assets.custom.find((x) => x.id === id);

    if (item) {
      if (item.type === "fixed") {
        item.amount = Number(item.amount || 0) - value;
      } else {
        const price = Number(item.price || 1);
        item.units = Number(item.units || 0) - value / price;
      }
    }

    return { nextState: next, success: true };
  }

  return { nextState: state, success: false, message: "لم يتم العثور على الأصل" };
}

export function transferBetweenAssets(state, fromKey, toKey, amount) {
  const value = Number(amount || 0);

  if (value <= 0) {
    return {
      success: false,
      nextState: state,
      message: "أدخل مبلغًا صحيحًا",
    };
  }

  if (fromKey === toKey) {
    return {
      success: false,
      nextState: state,
      message: "لا يمكن المناقلة إلى نفس الأصل",
    };
  }

  const deduction = deductFromAsset(state, fromKey, value);

  if (!deduction.success) {
    return deduction;
  }

  const next = addToAsset(deduction.nextState, toKey, value);

  next.transactions.push({
    id: Date.now(),
    type: "asset_transfer",
    from: fromKey,
    to: toKey,
    amount: value,
    date: new Date().toISOString(),
  });

  return {
    success: true,
    nextState: next,
  };
}