import test from "node:test";
import assert from "node:assert/strict";
import {
    buildBarcodeSnapshotMatches,
    buildReconciliationEntries,
    compareReconciliationEntries,
    validateLegacyPriceRowShape,
    resolveOpeningStockLegacyItems,
    validateResolvedOpeningStockLegacyItems,
} from "./legacyStockRules.js";

test("validateLegacyPriceRowShape accepts one flat legacy price row", () => {
    const result = validateLegacyPriceRowShape([
        { barcode: " LEG-001 ", sizeId: null, colorId: null }
    ]);

    assert.equal(result.normalizedBarcode, "LEG-001");
});

test("validateLegacyPriceRowShape rejects variant rows", () => {
    assert.throws(
        () => validateLegacyPriceRowShape([{ barcode: "LEG-001", sizeId: 4, colorId: null }]),
        /cannot store size or color pricing rows/i
    );
});

test("validateResolvedOpeningStockLegacyItems rejects inactive resolved items", () => {
    const stockItems = [{ itemId: 10, barcode: "LEG-001" }];
    const itemMap = new Map([
        [10, {
            id: 10,
            name: "LEGACY SHIRT",
            active: false,
            isLegacy: true,
            ItemPriceList: [{ sizeId: null, colorId: null, ItemBarcodes: [{ barcode: "LEG-001" }] }],
        }]
    ]);

    assert.throws(
        () => validateResolvedOpeningStockLegacyItems(stockItems, itemMap),
        /cannot use inactive item/i
    );
});

test("validateResolvedOpeningStockLegacyItems rejects barcode mismatches", () => {
    const stockItems = [{ itemId: 10, barcode: "LEG-999" }];
    const itemMap = new Map([
        [10, {
            id: 10,
            name: "LEGACY SHIRT",
            active: true,
            isLegacy: true,
            ItemPriceList: [{ sizeId: null, colorId: null, ItemBarcodes: [{ barcode: "LEG-001" }] }],
        }]
    ]);

    assert.throws(
        () => validateResolvedOpeningStockLegacyItems(stockItems, itemMap),
        /barcode does not match legacy item/i
    );
});

test("resolveOpeningStockLegacyItems fills a missing itemId from a unique barcode match", () => {
    const stockItems = [{ itemId: null, barcode: "LEG-001" }];
    const items = [
        {
            id: 10,
            name: "LEGACY SHIRT RENAMED",
            active: true,
            isLegacy: true,
            ItemPriceList: [{ sizeId: null, colorId: null, ItemBarcodes: [{ barcode: "LEG-001" }] }],
        }
    ];

    const resolvedItems = resolveOpeningStockLegacyItems(stockItems, items);

    assert.equal(resolvedItems[0].itemId, 10);
});

test("resolveOpeningStockLegacyItems rejects ambiguous barcode matches", () => {
    const stockItems = [{ itemId: null, barcode: "LEG-001" }];
    const items = [
        {
            id: 10,
            name: "LEGACY SHIRT A",
            active: true,
            isLegacy: true,
            ItemPriceList: [{ sizeId: null, colorId: null, ItemBarcodes: [{ barcode: "LEG-001" }] }],
        },
        {
            id: 11,
            name: "LEGACY SHIRT B",
            active: true,
            isLegacy: true,
            ItemPriceList: [{ sizeId: null, colorId: null, ItemBarcodes: [{ barcode: "LEG-001" }] }],
        }
    ];

    assert.throws(
        () => resolveOpeningStockLegacyItems(stockItems, items),
        /matches multiple existing items/i
    );
});

test("buildBarcodeSnapshotMatches aggregates duplicate stock rows into one snapshot", () => {
    const matches = buildBarcodeSnapshotMatches([
        {
            itemId: 1,
            sizeId: null,
            colorId: null,
            uomId: 2,
            storeId: 3,
            barcode: "LEG-001",
            qty: 5,
            price: 120,
            Item: { name: "LEGACY SHIRT" },
            Size: null,
            Color: null,
            Uom: { name: "PCS" },
        },
        {
            itemId: 1,
            sizeId: null,
            colorId: null,
            uomId: 2,
            storeId: 3,
            barcode: "LEG-001",
            qty: 7,
            price: 120,
            Item: { name: "LEGACY SHIRT" },
            Size: null,
            Color: null,
            Uom: { name: "PCS" },
        }
    ]);

    assert.equal(matches.length, 1);
    assert.equal(matches[0].stockQty, 12);
    assert.equal(matches[0].item_name, "LEGACY SHIRT");
});

test("buildBarcodeSnapshotMatches preserves multiple combinations for later resolution", () => {
    const matches = buildBarcodeSnapshotMatches([
        {
            itemId: 1,
            sizeId: 11,
            colorId: null,
            uomId: 2,
            storeId: 3,
            barcode: "CAN-001",
            qty: 5,
            price: 120,
            Item: { name: "CANONICAL SHIRT" },
            Size: { name: "M" },
            Color: null,
            Uom: { name: "PCS" },
        },
        {
            itemId: 1,
            sizeId: 12,
            colorId: null,
            uomId: 2,
            storeId: 3,
            barcode: "CAN-001",
            qty: 7,
            price: 120,
            Item: { name: "CANONICAL SHIRT" },
            Size: { name: "L" },
            Color: null,
            Uom: { name: "PCS" },
        }
    ]);

    assert.equal(matches.length, 2);
});

test("buildBarcodeSnapshotMatches keeps custom stock-field combinations separate", () => {
    const matches = buildBarcodeSnapshotMatches([
        {
            itemId: 1,
            sizeId: 11,
            colorId: 21,
            uomId: 2,
            storeId: 3,
            barcode: "CAN-002",
            field1: "LOT-A",
            qty: 5,
            price: 120,
            Item: { name: "CANONICAL SHIRT" },
            Size: { name: "M" },
            Color: { name: "RED" },
            Uom: { name: "PCS" },
        },
        {
            itemId: 1,
            sizeId: 11,
            colorId: 21,
            uomId: 2,
            storeId: 3,
            barcode: "CAN-002",
            field1: "LOT-B",
            qty: 7,
            price: 120,
            Item: { name: "CANONICAL SHIRT" },
            Size: { name: "M" },
            Color: { name: "RED" },
            Uom: { name: "PCS" },
        }
    ]);

    assert.equal(matches.length, 2);
    assert.deepEqual(matches.map((entry) => entry.field1).sort(), ["LOT-A", "LOT-B"]);
});

test("buildReconciliationEntries groups quantities by reconciliation dimensions", () => {
    const entries = buildReconciliationEntries([
        { itemId: 1, sizeId: null, storeId: 2, qty: 3 },
        { itemId: 1, sizeId: null, storeId: 2, qty: 4 },
        { itemId: 2, sizeId: null, storeId: 2, qty: 5 },
    ], ["itemId", "sizeId", "storeId"]);

    assert.equal(entries.length, 2);
    assert.equal(entries.find((entry) => entry.itemId === 1).qty, 7);
});

test("compareReconciliationEntries reports mismatches and one-sided keys", () => {
    const legacyEntries = [
        { key: "A", itemId: 1, qty: 5 },
        { key: "B", itemId: 2, qty: 3 },
    ];
    const stockEntries = [
        { key: "A", itemId: 1, qty: 5 },
        { key: "B", itemId: 2, qty: 4 },
        { key: "C", itemId: 3, qty: 2 },
    ];

    const comparison = compareReconciliationEntries(legacyEntries, stockEntries);

    assert.equal(comparison.summary.exactMatchCount, 1);
    assert.equal(comparison.summary.mismatchCount, 1);
    assert.equal(comparison.summary.stockOnlyCount, 1);
    assert.equal(comparison.summary.legacyOnlyCount, 0);
});
