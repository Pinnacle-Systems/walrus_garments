export const DEFAULT_BARCODE_GENERATION_METHOD = "STANDARD";

export function getItemVariantSizeOptions(masterData, allData, key, itemId) {
  const item = masterData?.find((entry) => String(entry.id) === String(itemId));
  const availableOptionIds = [...new Set(
    (item?.ItemPriceList || [])
      .filter((priceRow) => priceRow?.[key])
      .map((priceRow) => String(priceRow[key]))
  )];

  if (!availableOptionIds.length) {
    return allData;
  }

  return allData?.filter((option) => availableOptionIds.includes(String(option?.id)));
}

export function getItemVariantColorOptions(masterData, allData, key, itemId, sizeId = "") {
  const item = masterData?.find((entry) => String(entry.id) === String(itemId));
  const priceRows = (item?.ItemPriceList || []).filter((priceRow) => {
    if (!priceRow?.[key]) return false;
    if (!sizeId) return true;
    return String(priceRow.sizeId) === String(sizeId);
  });

  const availableOptionIds = [...new Set(priceRows.map((priceRow) => String(priceRow[key])))];

  if (!availableOptionIds.length) {
    return allData;
  }

  return allData?.filter((option) => availableOptionIds.includes(String(option?.id)));
}

export function resolveBarcodeGenerationMethod(itemControlPanel) {
  return itemControlPanel?.barcodeGenerationMethod || DEFAULT_BARCODE_GENERATION_METHOD;
}

export function getStockMaintenanceConfig(stockReportControl) {
  const config = stockReportControl || {};

  return {
    trackItem: Boolean(config.itemWise ?? true),
    trackSize: Boolean(config.sizeWise || config.sizeColorWise),
    trackColor: Boolean(config.sizeColorWise),
  };
}
