import { normalizeLegacyBarcode, normalizeLegacySkuCode } from "./legacyStockRules.js";

export function collectNormalizedItemBarcodes(itemPriceList = []) {
    return itemPriceList.reduce((entries, row, rowIndex) => {
        const barcodes = row?.ItemBarcodes || [];

        if (barcodes.length > 0) {
            barcodes.forEach((b, bIndex) => {
                const normalizedBarcode = normalizeLegacyBarcode(b?.barcode);
                if (!normalizedBarcode) return;

                entries.push({
                    barcode: normalizedBarcode,
                    rowIndex,
                    bIndex,
                    id: b?.id ? parseInt(b.id) : undefined,
                    barcodeType: b?.barcodeType || "REGULAR"
                });
            });
        } else {
            const normalizedBarcode = normalizeLegacyBarcode(row?.barcode);
            if (normalizedBarcode) {
                entries.push({
                    barcode: normalizedBarcode,
                    rowIndex,
                    bIndex: 0,
                    id: undefined,
                    barcodeType: row?.barcodeType || "REGULAR"
                });
            }
        }

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


export function collectNormalizedItemSkuCodes(itemPriceList = []) {
    return itemPriceList.reduce((entries, row, index) => {
        const normalizedSkuCode = normalizeLegacySkuCode(row?.sku);
        if (!normalizedSkuCode) {
            return entries;
        }

        entries.push({
            sku: normalizedSkuCode,
            rowIndex: index,
            rowId: row?.id ? parseInt(row.id) : undefined,
        });

        return entries;
    }, []);
}


export function validateUniqueSkuCodesWithinPayload(itemPriceList = []) {
    const skuCodeEntries = collectNormalizedItemSkuCodes(itemPriceList);
    const firstSeenRowBySku = new Map();

    skuCodeEntries.forEach(({ sku, rowIndex }) => {
        const firstSeenRow = firstSeenRowBySku.get(sku);
        if (firstSeenRow !== undefined) {
            throw Error(`SKU ${sku} is duplicated in item price rows ${firstSeenRow + 1} and ${rowIndex + 1}.`);
        }

        firstSeenRowBySku.set(sku, rowIndex);
    });

    return skuCodeEntries;
}
