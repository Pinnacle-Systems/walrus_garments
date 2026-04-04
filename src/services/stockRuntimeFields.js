export const STOCK_RUNTIME_FIELD_KEYS = [
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

function normalizeFieldLabel(value) {
  return value?.toString().trim() || "";
}

export function getConfiguredStockRuntimeFieldDefinitions(stockReportControl = {}) {
  return STOCK_RUNTIME_FIELD_KEYS.reduce((definitions, key) => {
    const label = normalizeFieldLabel(stockReportControl?.[key]);
    if (!label) {
      return definitions;
    }

    definitions.push({ key, label, required: false, type: "custom" });
    return definitions;
  }, []);
}

export function getConfiguredStockRuntimeFieldKeys(stockReportControl = {}) {
  return getConfiguredStockRuntimeFieldDefinitions(stockReportControl).map((field) => field.key);
}

export function pickStockRuntimeFieldValues(source = {}, keys = STOCK_RUNTIME_FIELD_KEYS) {
  return keys.reduce((result, key) => {
    const value = source?.[key];
    result[key] = value === undefined || value === null || value === "" ? undefined : String(value);
    return result;
  }, {});
}

export function buildStockRuntimeFieldWhere(source = {}, keys = STOCK_RUNTIME_FIELD_KEYS) {
  return keys.reduce((result, key) => {
    result[key] = source?.[key] ? String(source[key]) : null;
    return result;
  }, {});
}

export function getStockRuntimeFieldSelect(keys = STOCK_RUNTIME_FIELD_KEYS) {
  return keys.reduce((result, key) => {
    result[key] = true;
    return result;
  }, {});
}
