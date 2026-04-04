function normalizeId(value) {
  if (value === undefined || value === null || value === "") return "";
  return String(value);
}

export function findCatalogItem(items = [], itemId) {
  const normalizedItemId = normalizeId(itemId);
  if (!normalizedItemId) return null;
  return items.find((item) => normalizeId(item?.id) === normalizedItemId) || null;
}

export function getSellablePriceRows(items = [], itemPriceList = [], itemId) {
  const normalizedItemId = normalizeId(itemId);
  if (!normalizedItemId) return [];

  const flatRows = (itemPriceList || []).filter(
    (priceRow) => normalizeId(priceRow?.itemId) === normalizedItemId
  );

  if (flatRows.length) {
    return flatRows;
  }

  return findCatalogItem(items, itemId)?.ItemPriceList || [];
}

export function isLegacyCatalogItem(items = [], itemId) {
  return Boolean(findCatalogItem(items, itemId)?.isLegacy);
}

export function itemUsesSize(items = [], itemPriceList = [], itemId) {
  if (!normalizeId(itemId) || isLegacyCatalogItem(items, itemId)) return false;
  return getSellablePriceRows(items, itemPriceList, itemId).some((row) => normalizeId(row?.sizeId));
}

export function itemUsesColor(items = [], itemPriceList = [], itemId) {
  if (!normalizeId(itemId) || isLegacyCatalogItem(items, itemId)) return false;
  return getSellablePriceRows(items, itemPriceList, itemId).some((row) => normalizeId(row?.colorId));
}

export function getCatalogColumnVisibility(items = [], itemPriceList = []) {
  const canonicalItems = (items || []).filter((item) => !item?.isLegacy);

  return {
    showSize: canonicalItems.some((item) => itemUsesSize(items, itemPriceList, item?.id)),
    showColor: canonicalItems.some((item) => itemUsesColor(items, itemPriceList, item?.id)),
  };
}

export function getCatalogSizeOptions(items = [], itemPriceList = [], sizeList = [], itemId) {
  if (!itemUsesSize(items, itemPriceList, itemId)) return [];

  const availableOptionIds = [...new Set(
    getSellablePriceRows(items, itemPriceList, itemId)
      .map((priceRow) => normalizeId(priceRow?.sizeId))
      .filter(Boolean)
  )];

  return (sizeList || []).filter((option) => availableOptionIds.includes(normalizeId(option?.id)));
}

export function getCatalogColorOptions(items = [], itemPriceList = [], colorList = [], itemId, sizeId = "") {
  if (!itemUsesColor(items, itemPriceList, itemId)) return [];

  const normalizedSizeId = normalizeId(sizeId);
  const availableOptionIds = [...new Set(
    getSellablePriceRows(items, itemPriceList, itemId)
      .filter((priceRow) => {
        if (!normalizeId(priceRow?.colorId)) return false;
        if (!normalizedSizeId) return true;
        return normalizeId(priceRow?.sizeId) === normalizedSizeId;
      })
      .map((priceRow) => normalizeId(priceRow?.colorId))
      .filter(Boolean)
  )];

  return (colorList || []).filter((option) => availableOptionIds.includes(normalizeId(option?.id)));
}

export function resolveSellablePriceRow(items = [], itemPriceList = [], itemId, sizeId = "", colorId = "") {
  const rows = getSellablePriceRows(items, itemPriceList, itemId);
  if (!rows.length) return null;

  const normalizedSizeId = normalizeId(sizeId);
  const normalizedColorId = normalizeId(colorId);
  const requiresSize = itemUsesSize(items, itemPriceList, itemId);
  const requiresColor = itemUsesColor(items, itemPriceList, itemId);

  if (!requiresSize) {
    return rows.find((row) => !normalizeId(row?.sizeId) && !normalizeId(row?.colorId)) || rows[0];
  }

  if (!normalizedSizeId) return null;

  if (!requiresColor) {
    return rows.find((row) =>
      normalizeId(row?.sizeId) === normalizedSizeId && !normalizeId(row?.colorId)
    ) || rows.find((row) => normalizeId(row?.sizeId) === normalizedSizeId) || null;
  }

  if (!normalizedColorId) return null;

  return rows.find((row) =>
    normalizeId(row?.sizeId) === normalizedSizeId &&
    normalizeId(row?.colorId) === normalizedColorId
  ) || null;
}

export function getSalesRowMandatoryFields(items = [], itemPriceList = [], row = {}) {
  const fields = ["itemId", "uomId", "qty", "price"];

  if (itemUsesSize(items, itemPriceList, row?.itemId)) {
    fields.push("sizeId");
  }

  if (itemUsesColor(items, itemPriceList, row?.itemId)) {
    fields.push("colorId");
  }

  return fields;
}

export function areSalesRowsValid(rows = [], items = [], itemPriceList = []) {
  return (rows || []).every((row) => {
    const mandatoryFields = getSalesRowMandatoryFields(items, itemPriceList, row);
    return mandatoryFields.every((field) => {
      const value = row?.[field];
      if (value === undefined || value === null || value === "") return false;
      if (field === "qty" || field === "price") {
        return parseFloat(value) !== 0;
      }
      return true;
    });
  });
}
