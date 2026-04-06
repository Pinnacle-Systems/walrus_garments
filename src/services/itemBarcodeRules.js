import { normalizeLegacyBarcode } from "./legacyStockRules.js";

export function collectNormalizedItemBarcodes(itemPriceList = []) {
    return itemPriceList.reduce((entries, row, index) => {
        const normalizedBarcode = normalizeLegacyBarcode(row?.barcode);
        if (!normalizedBarcode) {
            return entries;
        }

        entries.push({
            barcode: normalizedBarcode,
            rowIndex: index,
            rowId: row?.id ? parseInt(row.id) : undefined,
        });

        return entries;
    }, []);
}

export function validateUniqueBarcodesWithinPayload(itemPriceList = []) {
    const barcodeEntries = collectNormalizedItemBarcodes(itemPriceList);
    const firstSeenRowByBarcode = new Map();

    barcodeEntries.forEach(({ barcode, rowIndex }) => {
        const firstSeenRow = firstSeenRowByBarcode.get(barcode);
        if (firstSeenRow !== undefined) {
            throw Error(`Barcode ${barcode} is duplicated in item price rows ${firstSeenRow + 1} and ${rowIndex + 1}.`);
        }

        firstSeenRowByBarcode.set(barcode, rowIndex);
    });

    return barcodeEntries;
}
