import test from "node:test";
import assert from "node:assert/strict";

import {
  buildStockRuntimeFieldWhere,
  getConfiguredStockRuntimeFieldDefinitions,
  getStockRuntimeFieldSelect,
  pickStockRuntimeFieldValues,
} from "./stockRuntimeFields.js";

test("configured runtime field definitions are exposed as optional capture fields", () => {
  const definitions = getConfiguredStockRuntimeFieldDefinitions({
    field1: "Lot",
    field3: "Shade",
  });

  assert.deepEqual(definitions, [
    { key: "field1", label: "Lot", required: false, type: "custom" },
    { key: "field3", label: "Shade", required: false, type: "custom" },
  ]);
});

test("runtime field helpers preserve captured values and normalize blanks", () => {
  const values = pickStockRuntimeFieldValues(
    {
      field1: "LOT-A",
      field2: "",
      field3: 42,
    },
    ["field1", "field2", "field3"]
  );

  assert.deepEqual(values, {
    field1: "LOT-A",
    field2: undefined,
    field3: "42",
  });

  const where = buildStockRuntimeFieldWhere(values, ["field1", "field2", "field3"]);
  assert.deepEqual(where, {
    field1: "LOT-A",
    field2: null,
    field3: "42",
  });
});

test("runtime field select helper exposes all requested stock field keys", () => {
  assert.deepEqual(getStockRuntimeFieldSelect(["field1", "field10"]), {
    field1: true,
    field10: true,
  });
});
