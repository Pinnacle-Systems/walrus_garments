import { getStockMaintenanceConfig } from "../../../Utils/helper";

const ADDITIONAL_STOCK_FIELD_KEYS = ["field6", "field7", "field8", "field9", "field10"];

const FIXED_FIELD_DEFINITIONS = [
  {
    key: "uom",
    label: "Uom",
    required: true,
    type: "uom",
    widthClass: "w-32",
    sampleValue: "PCS",
  },
  {
    key: "barcode",
    label: "Barcode No",
    required: true,
    type: "text",
    widthClass: "w-40",
    sampleValue: "TSHIRT-XL-0001",
    aliases: ["barcode_no"],
  },
  {
    key: "price",
    label: "Price",
    required: false,
    type: "number",
    widthClass: "w-32",
    sampleValue: "499",
  },
  {
    key: "qty",
    label: "Qty",
    required: true,
    type: "number",
    widthClass: "w-24",
    sampleValue: "10",
  },
];

function normalizeHeaderValue(value = "") {
  return value.toString().trim().toLowerCase();
}

export function getOpeningStockFieldDefinitions(stockReportControl) {
  const stockMaintenance = getStockMaintenanceConfig(stockReportControl);
  const fieldDefinitions = [];

  if (stockMaintenance.trackItem) {
    fieldDefinitions.push({
      key: "item_name",
      label: "Item Name",
      required: true,
      type: "item",
      widthClass: "w-64",
      sampleValue: "Classic T-Shirt",
    });
  }

  if (stockMaintenance.trackSize) {
    fieldDefinitions.push({
      key: "size",
      label: "Size",
      required: true,
      type: "size",
      widthClass: "w-32",
      sampleValue: "XL",
    });
  }

  if (stockMaintenance.trackColor) {
    fieldDefinitions.push({
      key: "color",
      label: "Color",
      required: true,
      type: "color",
      widthClass: "w-32",
      sampleValue: "NAVY",
    });
  }

  ADDITIONAL_STOCK_FIELD_KEYS.forEach((fieldKey, index) => {
    const label = stockReportControl?.[fieldKey]?.toString().trim();
    if (!label) return;

    fieldDefinitions.push({
      key: fieldKey,
      label,
      required: true,
      type: "custom",
      widthClass: "w-32",
      sampleValue: `VALUE-${index + 1}`,
    });
  });

  return [...fieldDefinitions, ...FIXED_FIELD_DEFINITIONS];
}

export function createOpeningStockRowDefaults(fieldDefinitions = []) {
  const row = {
    itemId: "",
    sizeId: "",
    colorId: "",
    uomId: "",
  };

  fieldDefinitions.forEach((field) => {
    row[field.key] = field.key === "qty" || field.key === "price" ? "" : "";
  });

  return row;
}

export function getOpeningStockHeaderMap(fieldDefinitions = []) {
  const headerMap = new Map();

  fieldDefinitions.forEach((field) => {
    headerMap.set(normalizeHeaderValue(field.label), field.key);
    (field.aliases || []).forEach((alias) => {
      headerMap.set(normalizeHeaderValue(alias), field.key);
    });
  });

  return headerMap;
}

export function getOpeningStockTemplateRow(fieldDefinitions = []) {
  return fieldDefinitions.reduce((acc, field) => {
    acc[field.label] = field.sampleValue || "";
    return acc;
  }, {});
}
