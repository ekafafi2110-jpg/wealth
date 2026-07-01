export function getAssetSources(state) {
  const goldPrice = Number(state.settings.market.goldGramPrice || 0);
  const silverPrice = Number(state.settings.market.silverGramPrice || 0);
  const unitPrice = (item, fallback = 0, referenceField = "wac") => {
    const current = Number(item?.currentPrice || 0);
    if (current > 0) return current;
    if (Number(fallback || 0) > 0) return Number(fallback || 0);
    return Number(item?.[referenceField] || 0);
  };

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
    const price = unitPrice(g, goldPrice, "wac");
    list.push({
      key: `gold:${g.id}`,
      label: g.label,
      type: "gold",
      available: Number(g.units || 0) * price,
      units: Number(g.units || 0),
      unitPrice: price,
      referencePrice: Number(g.wac || 0),
    });
  });

  state.assets.silver.forEach((s) => {
    const price = unitPrice(s, silverPrice, "wac");
    list.push({
      key: `silver:${s.id}`,
      label: s.label,
      type: "silver",
      available: Number(s.units || 0) * price,
      units: Number(s.units || 0),
      unitPrice: price,
      referencePrice: Number(s.wac || 0),
    });
  });

  state.assets.stocks.forEach((s) => {
    const price = unitPrice(s, 0, "wac");
    list.push({
      key: `stock:${s.id}`,
      label: s.name,
      type: "stock",
      available: Number(s.units || 0) * price,
      units: Number(s.units || 0),
      unitPrice: price,
      referencePrice: Number(s.wac || 0),
    });
  });

  state.assets.custom.forEach((c) => {
    const price = unitPrice(c, 0, "price");
    const value =
      c.type === "fixed"
        ? Number(c.amount || 0)
        : Number(c.units || 0) * price;

    list.push({
      key: `custom:${c.id}`,
      label: c.name,
      type: "custom",
      available: value,
      units: c.type === "unit" ? Number(c.units || 0) : null,
      unitPrice: c.type === "unit" ? price : null,
      referencePrice: c.type === "unit" ? Number(c.wac ?? c.price ?? 0) : null,
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
  const matchesAssetId = (item) => String(item.id) === String(idRaw);

  if (type === "bank") {
    const item = next.assets.banks.find(matchesAssetId);
    if (item) item.balance = Number(item.balance || 0) + value;
    return next;
  }

  if (type === "gold") {
    const item = next.assets.gold.find(matchesAssetId);
    const unitPrice = Number(item?.currentPrice || 0) || goldPrice || Number(item?.wac || 0);
    if (item && unitPrice > 0) {
      const addedUnits = value / unitPrice;
      const oldUnits = Number(item.units || 0);
      const oldWac = Number(item.wac || unitPrice);
      const newUnits = oldUnits + addedUnits;

      item.wac =
        newUnits > 0
          ? Number(((oldUnits * oldWac + addedUnits * unitPrice) / newUnits).toFixed(3))
          : unitPrice;

      item.units = Number(newUnits.toFixed(4));
    }
    return next;
  }

  if (type === "silver") {
    const item = next.assets.silver.find(matchesAssetId);
    const unitPrice = Number(item?.currentPrice || 0) || silverPrice || Number(item?.wac || 0);
    if (item && unitPrice > 0) {
      const addedUnits = value / unitPrice;
      const oldUnits = Number(item.units || 0);
      const oldWac = Number(item.wac || unitPrice);
      const newUnits = oldUnits + addedUnits;

      item.wac =
        newUnits > 0
          ? Number(((oldUnits * oldWac + addedUnits * unitPrice) / newUnits).toFixed(3))
          : unitPrice;

      item.units = Number(newUnits.toFixed(4));
    }
    return next;
  }

  if (type === "stock") {
    const item = next.assets.stocks.find(matchesAssetId);
    const price = Number(item?.currentPrice || 0) || Number(item?.wac || 0);
    if (item && price > 0) {
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
    const item = next.assets.custom.find(matchesAssetId);

    if (item) {
      if (item.type === "fixed") {
        item.amount = Number(item.amount || 0) + value;
      } else {
        const price = Number(item.currentPrice || 0) || Number(item.price || 1);
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
      message: `الرصيد غير كافٍ. المتاح فقط ${available.toFixed(2)}`,
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
  const matchesAssetId = (item) => String(item.id) === String(idRaw);

  if (type === "bank") {
    const item = next.assets.banks.find(matchesAssetId);
    if (!item) return { nextState: state, success: false, message: "لم يتم العثور على الأصل" };
    if (item) item.balance = Number(item.balance || 0) - value;
    return { nextState: next, success: true };
  }

  if (type === "gold") {
    const item = next.assets.gold.find(matchesAssetId);
    if (!item) return { nextState: state, success: false, message: "لم يتم العثور على الأصل" };
    const unitPrice = Number(item?.currentPrice || 0) || goldPrice || Number(item?.wac || 0);
    if (item && unitPrice > 0) {
      item.units = Number((Number(item.units || 0) - value / unitPrice).toFixed(4));
    }
    return { nextState: next, success: true };
  }

  if (type === "silver") {
    const item = next.assets.silver.find(matchesAssetId);
    if (!item) return { nextState: state, success: false, message: "لم يتم العثور على الأصل" };
    const unitPrice = Number(item?.currentPrice || 0) || silverPrice || Number(item?.wac || 0);
    if (item && unitPrice > 0) {
      item.units = Number((Number(item.units || 0) - value / unitPrice).toFixed(4));
    }
    return { nextState: next, success: true };
  }

  if (type === "stock") {
    const item = next.assets.stocks.find(matchesAssetId);
    if (!item) return { nextState: state, success: false, message: "لم يتم العثور على الأصل" };
    const price = Number(item?.currentPrice || 0) || Number(item?.wac || 0);
    if (item && price > 0) {
      item.units = Number(
        (Number(item.units || 0) - value / price).toFixed(4)
      );
    }
    return { nextState: next, success: true };
  }

  if (type === "custom") {
    const item = next.assets.custom.find(matchesAssetId);
    if (!item) return { nextState: state, success: false, message: "لم يتم العثور على الأصل" };

    if (item) {
      if (item.type === "fixed") {
        item.amount = Number(item.amount || 0) - value;
      } else {
        const price = Number(item.currentPrice || 0) || Number(item.price || 1);
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

export function liquidateAssetUnits(
  state,
  fromKey,
  toKey,
  units,
  unitPrice
) {
  const soldUnits = Number(units || 0);
  const salePrice = Number(unitPrice || 0);

  if (soldUnits <= 0 || salePrice <= 0) {
    return {
      success: false,
      nextState: state,
      message: "أدخل عدد الوحدات وسعر البيع بشكل صحيح",
    };
  }

  const next = structuredClone(state);
  const [type, idRaw] = String(fromKey).split(":");
  const matchesAssetId = (item) => String(item.id) === String(idRaw);
  let source;

  if (type === "gold") source = next.assets.gold.find(matchesAssetId);
  if (type === "silver") source = next.assets.silver.find(matchesAssetId);
  if (type === "stock") source = next.assets.stocks.find(matchesAssetId);
  if (type === "custom") {
    source = next.assets.custom.find(
      (item) => matchesAssetId(item) && item.type === "unit"
    );
  }

  if (!source) {
    return {
      success: false,
      nextState: state,
      message: "الأصل المختار لا يدعم البيع بالوحدات",
    };
  }

  const availableUnits = Number(source.units || 0);
  if (soldUnits > availableUnits) {
    return {
      success: false,
      nextState: state,
      message: `عدد الوحدات غير كافٍ. المتاح ${availableUnits.toFixed(4)}`,
    };
  }

  source.units = Number((availableUnits - soldUnits).toFixed(4));
  source.currentPrice = salePrice;
  if (type === "custom" && source.wac == null) {
    source.wac = Number(source.price || salePrice);
  }
  const saleAmount = Number((soldUnits * salePrice).toFixed(2));
  const fundedState = addToAsset(next, toKey, saleAmount);

  fundedState.assetHistory = [
    ...(fundedState.assetHistory || []),
    {
      id: `${Date.now()}-sale`,
      date: new Date().toISOString(),
      type: "asset_units_liquidated",
      source: "asset_transfer",
      assetKey: fromKey,
      destinationKey: toKey,
      unitsSold: soldUnits,
      unitPrice: salePrice,
      amount: saleAmount,
      unitsBefore: availableUnits,
      unitsAfter: source.units,
    },
  ];

  fundedState.transactions.push({
    id: Date.now(),
    type: "asset_units_liquidated",
    from: fromKey,
    to: toKey,
    units: soldUnits,
    unitPrice: salePrice,
    amount: saleAmount,
    date: new Date().toISOString(),
  });

  return {
    success: true,
    nextState: fundedState,
    amount: saleAmount,
  };
}
