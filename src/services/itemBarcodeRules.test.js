import test from "node:test";
import assert from "node:assert/strict";
import {
    collectNormalizedItemBarcodes,
    validateUniqueBarcodesWithinPayload,
} from "./itemBarcodeRules.js";

test("collectNormalizedItemBarcodes trims and skips blank barcodes", () => {
    const entries = collectNormalizedItemBarcodes([
        { barcode: " ABC-001 " },
        { barcode: "" },
        { barcode: null },
        { barcode: "XYZ-002" },
    ]);

    assert.deepEqual(entries, [
        { barcode: "ABC-001", rowIndex: 0, rowId: undefined },
        { barcode: "XYZ-002", rowIndex: 3, rowId: undefined },
    ]);
});

test("validateUniqueBarcodesWithinPayload rejects duplicate barcodes in the same payload", () => {
    assert.throws(
        () => validateUniqueBarcodesWithinPayload([
            { barcode: "ABC-001" },
            { barcode: " ABC-001 " },
        ]),
        /Barcode ABC-001 is duplicated in item price rows 1 and 2/i
    );
});

test("validateUniqueBarcodesWithinPayload accepts distinct barcodes", () => {
    const entries = validateUniqueBarcodesWithinPayload([
        { barcode: "ABC-001" },
        { barcode: "XYZ-002" },
    ]);

    assert.equal(entries.length, 2);
});
