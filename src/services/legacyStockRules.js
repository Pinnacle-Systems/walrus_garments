import { STOCK_RUNTIME_FIELD_KEYS } from "./stockRuntimeFields.js";

export function normalizeLegacyBarcode(barcode) {
    const normalizedBarcode = barcode?.toString().trim();
    return normalizedBarcode || undefined;
}

export function normalizeLegacySkuCode(skuCode) {
    const normalizedSkuCode = skuCode?.toString().trim();
    return normalizedSkuCode || undefined;
}

export function validateLegacyPriceRowShape(itemPriceList = []) {
    if (!Array.isArray(itemPriceList) || itemPriceList.length !== 1) {
        throw Error("Legacy items must include exactly one price row.");
    }

    const legacyRow = itemPriceList[0] || {};

    if (legacyRow?.sizeId || legacyRow?.colorId) {
        throw Error("Legacy items cannot store size or color pricing rows.");
    }

    const barcodeFromRow = normalizeLegacyBarcode(legacyRow?.barcode);
    const barcodesFromItems = (legacyRow?.ItemBarcodes || [])
        .map(b => normalizeLegacyBarcode(b.barcode))
        .filter(Boolean);

    const firstBarcode = barcodeFromRow || barcodesFromItems[0];

    if (!firstBarcode) {
        throw Error("Legacy items require a barcode on the single price row.");
    }

    return {
        normalizedBarcode: firstBarcode,
        allBarcodes: [...new Set([barcodeFromRow, ...barcodesFromItems].filter(Boolean))],
        legacyRow,
    };
}

function getOpeningStockRowBarcode(item = {}) {
    return item?.barcode_no ? String(item.barcode_no).trim() : item?.barcode ? String(item.barcode).trim() : "";
}

export function resolveOpeningStockLegacyItems(stockItems = [], items = [], options = {}) {
    const { storeName } = options;
    const isDiscountSection = storeName === "DISCOUNT SECTION";

    const itemMap = new Map(items.map((item) => [item.id, item]));
    const barcodeMap = new Map();

    items.forEach((item) => {
        // Look at all barcodes associated with the single legacy variant row
        const barcodes = item?.ItemPriceList?.[0]?.ItemBarcodes || [];
        barcodes.forEach(b => {
            // We resolve by any active barcode to identify the item, 
            // refined validation happens in the next step.
            if (b.active === false) return;

            const normalizedBarcode = normalizeLegacyBarcode(b.barcode);
            if (!normalizedBarcode) return;

            const existingItems = barcodeMap.get(normalizedBarcode) || [];
            existingItems.push(item);
            barcodeMap.set(normalizedBarcode, existingItems);
        });
    });

    return stockItems.map((item, index) => {
        const itemId = item?.itemId ? parseInt(item.itemId) : undefined;
        if (itemId && itemMap.has(itemId)) {
            return item;
        }

        const rowBarcode = getOpeningStockRowBarcode(item);
        if (!rowBarcode) {
            return item;
        }

        const barcodeMatches = barcodeMap.get(rowBarcode) || [];
        if (barcodeMatches.length > 1) {
            throw Error(`Opening stock row ${index + 1} barcode ${rowBarcode} matches multiple existing items.`);
        }

        if (barcodeMatches.length === 1) {
            return {
                ...item,
                itemId: barcodeMatches[0].id,
            };
        }

        return item;
    });
}

export function validateResolvedOpeningStockLegacyItems(stockItems = [], itemMap = new Map(), options = {}) {
    const { storeName } = options;
    const isDiscountSection = storeName === "DISCOUNT SECTION";
    const targetType = isDiscountSection ? "CLEARANCE" : "REGULAR";
    const forbiddenType = isDiscountSection ? "REGULAR" : "CLEARANCE";

    stockItems.forEach((item, index) => {
        const itemId = item?.itemId ? parseInt(item.itemId) : undefined;
        if (!itemId) {
            throw Error(`Opening stock row ${index + 1} is missing a resolved legacy item.`);
        }

        const existingItem = itemMap.get(itemId);
        if (!existingItem) {
            throw Error(`Opening stock row ${index + 1} references an unknown item.`);
        }

        if (!existingItem.active) {
            throw Error(`Opening stock row ${index + 1} cannot use inactive item ${existingItem.name}.`);
        }

        if (!existingItem.isLegacy) {
            throw Error(`Opening stock row ${index + 1} must use a legacy item created from Opening Stock.`);
        }

        if ((existingItem.ItemPriceList || []).length !== 1) {
            throw Error(`Legacy item ${existingItem.name} must contain exactly one price row.`);
        }

        const legacyPriceRow = existingItem.ItemPriceList[0];
        if (legacyPriceRow?.sizeId || legacyPriceRow?.colorId) {
            throw Error(`Legacy item ${existingItem.name} cannot use size or color pricing rows.`);
        }

        const rowBarcode = getOpeningStockRowBarcode(item);
        if (!rowBarcode) {
            throw Error(`Opening stock row ${index + 1} must include a barcode.`);
        }

        const barcodeRecords = (legacyPriceRow?.ItemBarcodes || []);
        const targetBarcode = barcodeRecords.find(b => b.barcodeType === targetType && String(b.barcode).trim() === rowBarcode);
        const forbiddenBarcode = barcodeRecords.find(b => b.barcodeType === forbiddenType && String(b.barcode).trim() === rowBarcode);

        if (forbiddenBarcode) {
            const typeLabel = isDiscountSection ? "Regular" : "Clearance";
            const targetLabel = isDiscountSection ? "Clearance" : "Regular";
            throw Error(`Opening stock row ${index + 1} barcode ${rowBarcode} is a ${typeLabel} barcode for item ${existingItem.name}. Cannot use it as a ${targetLabel} barcode.`);
        }

        // Note: Global uniqueness and auto-creation of missing target-type barcodes 
        // are handled in the service layer before this validation is called.
        if (!targetBarcode) {
            throw Error(`Opening stock row ${index + 1} barcode ${rowBarcode} does not match the item's existing ${targetType} barcodes. The system should have created it if it were valid.`);
        }
    });
}

export function buildBarcodeSnapshotMatches(records = []) {
    const snapshotMap = new Map();

    records.forEach((record) => {
        const snapshotKey = [
            record.itemId ?? "",
            record.sizeId ?? "",
            record.colorId ?? "",
            record.uomId ?? "",
            record.storeId ?? "",
            record.barcode ?? "",
            ...STOCK_RUNTIME_FIELD_KEYS.map((key) => record?.[key] ?? ""),
        ].join("|");

        if (!snapshotMap.has(snapshotKey)) {
            const snapshot = {
                ...record,
                itemId: record.itemId,
                sizeId: record.sizeId,
                colorId: record.colorId,
                uomId: record.uomId,
                barcode: record.barcode,
                item_name: record.Item?.name,
                size: record.Size?.name,
                color: record.Color?.name,
                uom: record.Uom?.name,
                location: record.Store?.storeName,
                price: record.price,
                stockQty: 0,
            };

            STOCK_RUNTIME_FIELD_KEYS.forEach((key) => {
                snapshot[key] = record?.[key] ?? null;
            });

            snapshotMap.set(snapshotKey, snapshot);
        }

        const snapshot = snapshotMap.get(snapshotKey);
        snapshot.stockQty += record.qty || 0;
    });

    // console.log(Array.from(snapshotMap.values()), "snapshotMap")
    // return Array.from(snapshotMap.values());
    return Array.from(snapshotMap.values()).filter(
        (item) => item.stockQty > 0
    );
}

function normalizeReconciliationValue(value) {
    return value === undefined || value === null || value === "" ? "" : String(value);
}

export function buildReconciliationEntries(records = [], dimensions = []) {
    const grouped = new Map();

    records.forEach((record) => {
        const key = dimensions.map((dimension) => normalizeReconciliationValue(record?.[dimension])).join("|");

        if (!grouped.has(key)) {
            const snapshot = { key, qty: 0 };
            dimensions.forEach((dimension) => {
                snapshot[dimension] = record?.[dimension] ?? null;
            });
            grouped.set(key, snapshot);
        }

        grouped.get(key).qty += Number(record?.qty || 0);
    });

    return Array.from(grouped.values());
}

export function compareReconciliationEntries(legacyEntries = [], stockEntries = []) {
    const legacyMap = new Map(legacyEntries.map((entry) => [entry.key, entry]));
    const stockMap = new Map(stockEntries.map((entry) => [entry.key, entry]));
    const allKeys = [...new Set([...legacyMap.keys(), ...stockMap.keys()])];

    const comparisons = allKeys.map((key) => {
        const legacyEntry = legacyMap.get(key);
        const stockEntry = stockMap.get(key);
        const legacyQty = Number(legacyEntry?.qty || 0);
        const stockQty = Number(stockEntry?.qty || 0);

        return {
            ...(legacyEntry || stockEntry || {}),
            key,
            legacyQty,
            stockQty,
            deltaQty: stockQty - legacyQty,
            status: legacyEntry && stockEntry
                ? (legacyQty === stockQty ? "match" : "mismatch")
                : legacyEntry
                    ? "legacy_only"
                    : "stock_only",
        };
    });

    return {
        comparisons,
        summary: {
            comparedKeyCount: comparisons.length,
            exactMatchCount: comparisons.filter((entry) => entry.status === "match").length,
            mismatchCount: comparisons.filter((entry) => entry.status === "mismatch").length,
            legacyOnlyCount: comparisons.filter((entry) => entry.status === "legacy_only").length,
            stockOnlyCount: comparisons.filter((entry) => entry.status === "stock_only").length,
            legacyQtyTotal: comparisons.reduce((sum, entry) => sum + entry.legacyQty, 0),
            stockQtyTotal: comparisons.reduce((sum, entry) => sum + entry.stockQty, 0),
        }
    };
}
