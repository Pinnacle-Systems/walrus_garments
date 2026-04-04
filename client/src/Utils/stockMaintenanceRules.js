export const DEFAULT_BARCODE_GENERATION_METHOD = "STANDARD";
export const STOCK_DRIVEN_FIELD_KEYS = [
  "field1",
  "field2",
  "field3",
  "field4",
  "field5",
  "field6",
  "field7",
  "field8",
  "field9",
  "field10",
];

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

export function getConfiguredStockDrivenFields(stockReportControl) {
  return STOCK_DRIVEN_FIELD_KEYS.reduce((fields, key, index) => {
    const label = stockReportControl?.[key]?.toString().trim();
    if (!label) {
      return fields;
    }

    fields.push({
      key,
      label,
      required: true,
      type: "custom",
      widthClass: "w-32",
      sampleValue: `VALUE-${index + 1}`,
    });
    return fields;
  }, []);
}
