export const findDefaultPriceRow = (item) => {
    const priceRows = item?.ItemPriceList || [];
    return priceRows.find((row) => !row?.sizeId && !row?.colorId) || priceRows[0] || null;
};

export const normalizeLocalItemForPos = (item, branchId, storeId) => {
    const defaultPriceRow = findDefaultPriceRow(item);
    if (!item || !defaultPriceRow) {
        return null;
    }

    return {
        id: item.id,
        itemId: item.id,
        Item: item,
        Size: null,
        Color: null,
        sizeId: null,
        colorId: null,
        uomId: null,
        branchId,
        storeId,
        barcode: defaultPriceRow?.ItemBarcodes?.find(b => b.barcodeType === "REGULAR")?.barcode || defaultPriceRow?.ItemBarcodes?.[0]?.barcode || "",
        itemName: item?.name || "",
        itemCode: item?.code || "",
        salesPrice: defaultPriceRow?.salesPrice || item?.salesPrice || 0,
        offerPrice: defaultPriceRow?.offerPrice || 0,
        price: defaultPriceRow?.salesPrice || item?.salesPrice || 0,
        priceType: "SalesPrice",
    };
};

export const buildResolutionLabel = (match) =>
    `${match.item_name || match?.Item?.name || "Item"} / ${match.size || match?.Size?.name || "-"} / ${match.color || match?.Color?.name || "-"} / Loc: ${match.location || "-"} / Qty ${match.stockQty || 0}`;

/**
 * Greedy stock allocation across stores/warehouses prioritizing retail location.
 */
export const allocateStock = (totalQty, stockDetails, retailStoreId) => {
    let remaining = parseFloat(totalQty) || 0;
    const fulfillments = [];
    const sortedStocks = [...(stockDetails || [])].sort((a, b) => {
        const isARetail = a.storeName?.toLowerCase().includes('retail') || parseInt(a.storeId) === parseInt(retailStoreId);
        const isBRetail = b.storeName?.toLowerCase().includes('retail') || parseInt(b.storeId) === parseInt(retailStoreId);
        if (isARetail && !isBRetail) return -1;
        if (!isARetail && isBRetail) return 1;
        return 0;
    });

    sortedStocks.forEach(s => {
        const take = Math.min(remaining, parseFloat(s.stockQty) || 0);
        fulfillments.push({ storeId: s.storeId, storeName: s.storeName, qty: take });
        remaining -= take;
    });

    if (remaining > 0 && fulfillments.length > 0) {
        fulfillments[0].qty += remaining;
    }

    return fulfillments;
};

/**
 * Pure helper function to search and filter product item suggestions by name, code or barcode matches.
 */
export const filterSearchSuggestions = ({ query, items, itemPriceList, retailStoreId }) => {
    let allMatches = [];
    const barcodeMap = new Map();

    const addMatch = (match) => {
        if (!barcodeMap.has(match.barcode)) {
            barcodeMap.set(match.barcode, true);
            allMatches.push(match);
        }
    };
    // const matchingItems = items.filter(i =>
    //     i.name?.toLowerCase().includes(query) ||
    //     i.code?.toLowerCase().includes(query)
    // );

    const queryWords = query.split(/\s+/).filter(Boolean);
    console.log(queryWords, "queryWords ")
    const matchingItems = items.filter(i => {
        const itemName = i.name?.toLowerCase() || "";
        const itemCode = i.code?.toLowerCase() || "";
        return queryWords.every(word => itemName.includes(word) || itemCode.includes(word));
    });


    matchingItems.forEach(item => {
        const variants = itemPriceList?.filter(p => p.itemId === item.id) || [];
        variants.forEach(variant => {
            variant.ItemBarcodes?.forEach(bc => {
                addMatch({
                    barcode: bc.barcode,
                    barcodeType: bc.barcodeType,
                    item_name: item.name,
                    size: variant.Size?.name || "-",
                    color: variant.Color?.name || "-",
                    itemId: item.id,
                    sizeId: variant.sizeId,
                    colorId: variant.colorId,
                    uomId: item.uomId,
                    storeId: retailStoreId,
                    salesPrice: variant.salesPrice || 0,
                });
            });
        });
    });

    const barcodeMatches = items.filter(i =>
        i.ItemPriceList?.some(row => row.ItemBarcodes?.some(b => b.barcode.toLowerCase().includes(query)))
    );

    barcodeMatches.forEach(item => {
        const variants = itemPriceList?.filter(p => p.itemId === item.id) || [];
        variants.forEach(variant => {
            variant.ItemBarcodes?.forEach(bc => {
                if (bc.barcode.toLowerCase().includes(query)) {
                    addMatch({
                        barcode: bc.barcode,
                        barcodeType: bc.barcodeType,
                        item_name: item.name,
                        size: variant.Size?.name || "-",
                        color: variant.Color?.name || "-",
                        itemId: item.id,
                        sizeId: variant.sizeId,
                        colorId: variant.colorId,
                        uomId: item.uomId,
                        storeId: retailStoreId,
                        salesPrice: variant.salesPrice || 0,
                    });
                }
            });
        });
    });

    return allMatches;
};
