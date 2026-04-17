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
        barcode: defaultPriceRow?.barcode || "",
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
