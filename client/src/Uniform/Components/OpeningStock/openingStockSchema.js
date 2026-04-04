import { getConfiguredStockDrivenFields, getStockMaintenanceConfig } from "../../../Utils/helper";

const FIXED_FIELD_DEFINITIONS = [
  {
    key: "item_code",
    label: "Item Code",
    required: true,
    type: "text",
    widthClass: "w-40",
    sampleValue: "LEG-001",
    aliases: ["barcode", "barcode_no", "item code", "item_code"],
  },
  {
    key: "uom",
    label: "Uom",
    required: true,
    type: "uom",
    widthClass: "w-32",
    sampleValue: "PCS",
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
      required: false,
      type: "size",
      widthClass: "w-32",
      sampleValue: "XL",
    });
  }

  if (stockMaintenance.trackColor) {
    fieldDefinitions.push({
      key: "color",
      label: "Color",
      required: false,
      type: "color",
      widthClass: "w-32",
      sampleValue: "NAVY",
    });
  }

  fieldDefinitions.push(...getConfiguredStockDrivenFields(stockReportControl));

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
    row[field.key] = "";
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
