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
export const filterSearchSuggestions = ({ query, items, itemPriceList, retailStoreId, offersData }) => {

    console.log("query", query);


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
    /* console.log removed */
    const matchingItems = items.filter(i => {
        const itemName = i.name?.toLowerCase() || "";
        const itemCode = i.code?.toLowerCase() || "";
        return queryWords.every(word => itemName.includes(word) || itemCode.includes(word));
    });



    matchingItems.forEach(item => {
        const variants = itemPriceList?.filter(p => p.itemId === item.id) || [];
        console.log(variants, 'variants')
        variants.forEach(variant => {
            variant.ItemBarcodes?.forEach(bc => {
                let finalSalesPrice = variant.salesPrice || 0;

                if (bc.barcodeType === "CLEARANCE") {
                    const clearanceOffer = (offersData || []).find(offer =>
                        offer.scopeMode === 'Item' &&
                        offer.OfferScope?.some(s => parseInt(s.refId) === parseInt(item.id)) &&
                        offer.OfferRule?.some(rule =>
                            rule.conditions?.rules?.some(r =>
                                r.field === 'Specific Barcode' &&
                                r.operator === '==' &&
                                String(r.value).trim() === String(bc.barcode).trim()
                            )
                        )
                    );

                    if (clearanceOffer && clearanceOffer.discountType === "Override") {
                        finalSalesPrice = clearanceOffer.discountValue;
                    }
                }

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
                    salesPrice: finalSalesPrice,
                });
            });
        });
    });

    const barcodeMatches = items.filter(i =>
        i.ItemPriceList?.some(row => row.ItemBarcodes?.some(b => b.barcode.toLowerCase().includes(query)))
    );

    console.log(barcodeMatches, "barcodeMatches")


    barcodeMatches.forEach(item => {
        const variants = itemPriceList?.filter(p => p.itemId === item.id) || [];

        // console.log(variants, "variants")

        variants.forEach(variant => {
            variant.ItemBarcodes?.forEach(bc => {
                if (bc.barcode.toLowerCase().includes(query)) {
                    let finalSalesPrice = variant.salesPrice || 0;

                    if (bc.barcodeType === "CLEARANCE") {
                        const clearanceOffer = (offersData || []).find(offer =>
                            offer.scopeMode === 'Item' &&
                            offer.OfferScope?.some(s => parseInt(s.refId) === parseInt(item.id)) &&
                            offer.OfferRule?.some(rule =>
                                rule.conditions?.rules?.some(r =>
                                    r.field === 'Specific Barcode' &&
                                    r.operator === '==' &&
                                    String(r.value).trim() === String(bc.barcode).trim()
                                )
                            )
                        );

                        if (clearanceOffer && clearanceOffer.discountType === "Override") {
                            finalSalesPrice = clearanceOffer.discountValue;
                        }
                    }

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
                        salesPrice: finalSalesPrice,
                    });
                }
            });
        });
    });

    // Sort matches by relevance based on exact word matching
    const queryWordsForSort = query.toLowerCase().split(/\s+/).filter(Boolean);
    const lastQueryWord = queryWordsForSort[queryWordsForSort.length - 1];

    allMatches.sort((a, b) => {
        const aName = (a.item_name || "").toLowerCase();
        const bName = (b.item_name || "").toLowerCase();
        
        const aWords = aName.split(/\s+/).filter(Boolean);
        const bWords = bName.split(/\s+/).filter(Boolean);

        let aScore = 0;
        let bScore = 0;

        // 1. Exact barcode match gets highest priority
        if (a.barcode?.toLowerCase() === query.toLowerCase().trim()) aScore += 200;
        if (b.barcode?.toLowerCase() === query.toLowerCase().trim()) bScore += 200;

        // 2. Last Word Bonus (Usually size like L, XL, etc.)
        if (lastQueryWord) {
            if (aWords.includes(lastQueryWord)) aScore += 100;
            if (bWords.includes(lastQueryWord)) bScore += 100;
        }

        // 3. Count exact word matches
        queryWordsForSort.forEach(qWord => {
            if (aWords.includes(qWord)) aScore += 1;
            if (bWords.includes(qWord)) bScore += 1;
        });

        // 4. Exact full name match bonus
        if (aName === query.toLowerCase().trim()) aScore += 50;
        if (bName === query.toLowerCase().trim()) bScore += 50;

        // Sort descending (highest score first)
        return bScore - aScore; 
    });

    return allMatches;
};
