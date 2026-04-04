import { NoRecordFound } from '../configs/Responses.js';
import { prisma } from '../lib/prisma.js';
import { normalizeLegacyBarcode, validateLegacyPriceRowShape } from './legacyStockRules.js';
import {
    getBarcodeGenerationMethod,
    validateVariantRows,
} from './itemVariantValidation.js';

const OPENING_STOCK_CREATION_SOURCE = "OPENING_STOCK";

function parseOptionalBoolean(value) {
    if (value === undefined || value === null || value === "") {
        return undefined;
    }

    if (typeof value === "boolean") {
        return value;
    }

    const normalizedValue = String(value).trim().toLowerCase();

    if (normalizedValue === "true") {
        return true;
    }

    if (normalizedValue === "false") {
        return false;
    }

    return Boolean(value);
}

function parseIntOrUndefined(value) {
    if (value === undefined || value === null || value === "") {
        return undefined;
    }

    return parseInt(value);
}

function normalizeItemName(name) {
    const normalizedName = name?.toString().trim().toUpperCase();
    return normalizedName || undefined;
}

async function ensureUniqueItemName(name, excludeItemId) {
    if (!name) {
        return;
    }

    const existingItem = await prisma.item.findFirst({
        where: {
            name,
            id: excludeItemId ? { not: parseInt(excludeItemId) } : undefined,
        },
        select: {
            id: true,
        }
    });

    if (existingItem) {
        throw Error("The Item Name already exists.");
    }
}

async function validateLegacyItemPayload({
    itemId,
    itemName,
    isLegacy,
    itemPriceList = [],
    existingItem,
    creationSource,
}) {
    if (!isLegacy) {
        if (existingItem?.isLegacy) {
            throw Error("Legacy items must remain in the flat legacy-item structure.");
        }
        return;
    }

    if (!existingItem && creationSource !== OPENING_STOCK_CREATION_SOURCE) {
        throw Error("Legacy items can only be created from Opening Stock.");
    }

    const { normalizedBarcode } = validateLegacyPriceRowShape(itemPriceList);

    const conflictingBarcodeRow = await prisma.itemPriceList.findFirst({
        where: {
            barcode: normalizedBarcode,
            item: {
                id: itemId ? { not: parseInt(itemId) } : undefined,
            }
        },
        include: {
            item: {
                select: {
                    id: true,
                    name: true,
                }
            }
        }
    });

    if (conflictingBarcodeRow?.item && conflictingBarcodeRow.item.name !== itemName) {
        throw Error(`Legacy barcode ${normalizedBarcode} is already associated with item ${conflictingBarcodeRow.item.name}.`);
    }
}

function validateAndNormalizeMinimumStockQtyRows(rows = []) {
    const seenLocations = new Set();
    const normalizedRows = [];

    rows?.forEach((row, index) => {
        const locationIdRaw = String(row?.locationId ?? "").trim();
        const minStockQtyRaw = String(row?.minStockQty ?? "").trim();
        const isBlank = !locationIdRaw && !minStockQtyRaw;

        if (isBlank) {
            return;
        }

        if (!locationIdRaw || !minStockQtyRaw) {
            throw Error(`Stock alert row ${index + 1} must include both location and minimum stock quantity`);
        }

        if (!/^\d+$/.test(locationIdRaw)) {
            throw Error(`Stock alert row ${index + 1} must use a valid location`);
        }

        if (!/^\d+$/.test(minStockQtyRaw)) {
            throw Error(`Stock alert row ${index + 1} must use a non-negative whole number`);
        }

        const locationId = parseInt(locationIdRaw);

        if (seenLocations.has(locationId)) {
            throw Error(`Location can be configured only once per item row`);
        }

        seenLocations.add(locationId);
        normalizedRows.push({
            minStockQty: minStockQtyRaw,
            locationId,
        });
    });

    return normalizedRows;
}

async function syncMinimumStockQty(tx, itemPriceListId, minimumStockQtyRows = []) {
    await tx.MinimumStockQty.deleteMany({
        where: {
            itemPriceListId: parseInt(itemPriceListId),
        }
    });

    const normalizedRows = validateAndNormalizeMinimumStockQtyRows(minimumStockQtyRows);

    if (!normalizedRows.length) {
        return;
    }

    await tx.MinimumStockQty.createMany({
        data: normalizedRows.map((row) => ({
            ...row,
            itemPriceListId: parseInt(itemPriceListId),
        }))
    });
}

async function get(req) {
    const active = parseOptionalBoolean(req.query?.active);
    const data = await prisma.item.findMany({
        where: {
            active,
        },
        include: {
            ItemPriceList: true,
            _count: {
                select: {
                    DirectItems: true,
                    DirectReturnItems: true,
                    QuotationItems: true,
                    SaleOrderItems: true,
                    SalesDeliveryItems: true,
                    SalesReturnItems: true,
                    Stock: true,
                }
            }
        },

    });


    data = data.map((item) => {
        const types = [];

        if (item._count.DirectItems) types.push("Purchase Inward Items");
        if (item._count.DirectReturnItems) types.push("Purchase Return Items");
        if (item._count.QuotationItems) types.push("Quotation Items");
        if (item._count.SaleOrderItems) types.push("Sale Order Items");
        if (item._count.SalesDeliveryItems) types.push("Sales Delivery Items");
        if (item._count.SalesReturnItems) types.push("Sales Return Items");
        if (item._count.Stock) types.push("Stock");


        return {
            ...item,
            referencedIn: types.join(", ")

        };
    });

    return { statusCode: 0, data };
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.item.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            ItemPriceList: {
                select: {
                    id: true,
                    itemId: true,
                    colorId: true,
                    Color: {
                        select: {
                            name: true
                        }
                    },
                    Size: {
                        select: {
                            name: true
                        }
                    },
                    sizeId: true,
                    purchasePrice: true,
                    salesPrice: true,
                    offerPrice: true,
                    MinimumStockQty: true,
                    sku: true,
                    barcode: true,



                }
            },
            _count: {
                select: {
                    DirectItems: true,
                    DirectReturnItems: true,
                    QuotationItems: true,
                    SaleOrderItems: true,
                    SalesDeliveryItems: true,
                    SalesReturnItems: true,
                    Stock: true,
                }
            }
        },

    })
    if (!data) return NoRecordFound("item");

    return { statusCode: 0, data: { ...data, childRecord } };
}


export async function getItemPriceList(req) {
    const active = parseOptionalBoolean(req.query?.active);
    const data = await prisma.itemPriceList.findMany({
        where: {
            item: {
                active,
            }
        },
        include: {
            item: true,
            Color: true,
            Size: true,

        }
    });
    return { statusCode: 0, data };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId } = req.query
    const active = parseOptionalBoolean(req.query?.active);
    const data = await prisma.item.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active,
            OR: [
                {
                    name: {
                        contains: searchKey,
                    },
                }
            ]
        },
        include: {
            ItemPriceList: true,
        }
    })
    return { statusCode: 0, data };
}
async function create(body) {
    const { styleId, sizeId, name, hsnId, code, itemType, salesPrice, purchasePrice, aliasName, itemPriceList, active,
        sectionId, sectionType, subCategory, mainCategory, isLegacy, creationSource
    } = body
    const barcodeGenerationMethod = await getBarcodeGenerationMethod();
    const normalizedName = normalizeItemName(name);
    const normalizedIsLegacy = parseOptionalBoolean(isLegacy) ?? false;
    await ensureUniqueItemName(normalizedName);
    await validateLegacyItemPayload({
        itemName: normalizedName,
        isLegacy: normalizedIsLegacy,
        itemPriceList,
        creationSource,
    });
    validateVariantRows({
        flowType: "canonical",
        isLegacy: normalizedIsLegacy,
        barcodeGenerationMethod,
        rows: itemPriceList,
        rowLabelPrefix: "Item price row",
    });
    const data = await prisma.item.create({
        data: {
            styleId: parseIntOrUndefined(styleId),
            sizeId: parseIntOrUndefined(sizeId),
            name: normalizedName,
            hsnId: parseIntOrUndefined(hsnId),
            code: code ? code : undefined,
            sectionId: parseIntOrUndefined(sectionId),
            mainCategoryId: parseIntOrUndefined(mainCategory),
            subCategoryId: parseIntOrUndefined(subCategory),
            aliasName: aliasName ? aliasName : undefined,
            isLegacy: normalizedIsLegacy,
            active: parseOptionalBoolean(active),

            ItemPriceList: itemPriceList?.length > 0
                ? {
                    create: itemPriceList.map((item) => ({
                        ...(function () {
                            const minimumStockQtyRows = validateAndNormalizeMinimumStockQtyRows(item?.MinimumStockQty);
                            return {
                                colorId: parseIntOrUndefined(item?.colorId),
                                sizeId: parseIntOrUndefined(item?.sizeId),
                                offerPrice: item?.offerPrice || undefined,
                                salesPrice: item?.salesPrice || undefined,
                                sku: item?.sku ? item?.sku : undefined,
                                barcode: normalizeLegacyBarcode(item?.barcode),

                                MinimumStockQty: minimumStockQtyRows.length > 0
                                    ? {
                                        create: minimumStockQtyRows,
                                    }
                                    : undefined,
                            };
                        })()
                    })),
                }
                : undefined,


        }
    });
    return { statusCode: 0, data: { data } };
}

// async function updateStylePanel(tx, sampleDetails, sampleData) {




async function createItemPanelProcess(tx, itemPanelId, ItemPanelProcess, item) {

    let promises = ItemPanelProcess.map(async (temp, index) => {
        await tx.itemPanelProcess.create({
            data: {
                itemPanelId: parseInt(itemPanelId),
                processId: temp ? parseInt(temp) : undefined

            }
        })
    }
    )

    return Promise.all(promises)
}



async function updateOrCreate(tx, item, itemId) {

    if (item?.id) {

        let updatedata = await tx.itemPanel.update({
            where: {
                id: parseInt(item.id)
            },
            data: {
                itemId: parseInt(itemId),
                panelId: item["panelId"] ? parseInt(item["panelId"]) : undefined,

                ItemPanelProcess: {
                    deleteMany: {},
                }
            }
        })


        return await createItemPanelProcess(tx, updatedata?.id, item?.selectedAddons, item)

    } else {
        let data = await tx.itemPanel.create({
            data: {
                itemId: parseInt(itemId),
                panelId: item["panelId"] ? parseInt(item["panelId"]) : undefined,
            }
        })
        return await createItemPanelProcess(tx, data?.id, item?.selectedAddons, item)
    }

}

async function updateItemPanelData(tx, panelIdArray, itemId) {
    let promises = panelIdArray.map(async (item) => await updateOrCreate(tx, item, itemId))
    return Promise.all(promises)
}


async function deleteItemPanelId(tx, removeItemPanelIds) {
    return await tx.itemPanel.deleteMany({
        where: {
            id: {
                in: removeItemPanelIds
            }
        }
    })
}





async function updateItemPriceList(tx, itemPriceList, item) {
    let removedItems = item?.ItemPriceList?.filter(oldItem => {
        let result = itemPriceList.find(newItem => newItem.id === oldItem.id)
        if (result) return false
        return true
    })

    console.log(itemPriceList, "item");

    let removedItemsId = removedItems.map(item => parseInt(item.id))

    await tx.ItemPriceList.deleteMany({
        where: {
            id: {
                in: removedItemsId
            }
        }
    })

    const promises = itemPriceList.map(async (priceItem) => {
        if (priceItem?.id) {
            return await tx.ItemPriceList.update({
                where: {
                    id: parseInt(priceItem.id)
                },

                data: {
                    itemId: priceItem?.itemId ? parseInt(priceItem?.itemId) : undefined,
                    sizeId: parseIntOrUndefined(priceItem?.sizeId),
                    offerPrice: priceItem?.offerPrice ? priceItem?.offerPrice : undefined,
                    colorId: parseIntOrUndefined(priceItem?.colorId),
                    salesPrice: priceItem?.salesPrice ? priceItem?.salesPrice : undefined,
                    sku: priceItem?.sku ? priceItem?.sku : undefined,
                    barcode: normalizeLegacyBarcode(priceItem?.barcode),


                }
            }).then(async (updatedPriceItem) => {
                await syncMinimumStockQty(tx, updatedPriceItem.id, priceItem?.MinimumStockQty);
                return updatedPriceItem;
            })
        } else {
            return await tx.ItemPriceList.create({
                data: {
                    itemId: parseInt(item?.id),
                    offerPrice: priceItem?.offerPrice ? priceItem?.offerPrice : undefined,
                    sizeId: parseIntOrUndefined(priceItem?.sizeId),
                    colorId: parseIntOrUndefined(priceItem?.colorId),
                    salesPrice: priceItem?.salesPrice ? priceItem?.salesPrice : undefined,
                    sku: priceItem?.sku ? priceItem?.sku : undefined,
                    barcode: normalizeLegacyBarcode(priceItem?.barcode),

                }
            }).then(async (createdPriceItem) => {
                await syncMinimumStockQty(tx, createdPriceItem.id, priceItem?.MinimumStockQty);
                return createdPriceItem;
            })
        }
    })
    return Promise.all(promises)
}


async function update(id, body) {
    const { styleId, sizeId, name, hsnId, code, active, itemPriceList, sectionId, fields, mainCategory, subCategory, aliasName, isLegacy } = body

    const barcodeGenerationMethod = await getBarcodeGenerationMethod();

    const dataFound = await prisma.item.findUnique({
        where:
        {
            id: parseInt(id)
        },
        include: {
            ItemPriceList: true
        }

    });
    if (!dataFound) return NoRecordFound("item");
    const normalizedName = normalizeItemName(name);
    const normalizedIsLegacy = parseOptionalBoolean(isLegacy) ?? dataFound.isLegacy ?? false;
    await ensureUniqueItemName(normalizedName, id);
    await validateLegacyItemPayload({
        itemId: id,
        itemName: normalizedName,
        isLegacy: normalizedIsLegacy,
        itemPriceList,
        existingItem: dataFound,
    });
    validateVariantRows({
        flowType: "canonical",
        isLegacy: normalizedIsLegacy,
        barcodeGenerationMethod,
        rows: itemPriceList,
        rowLabelPrefix: "Item price row",
    });
    let data;




    await prisma.$transaction(async (tx) => {

        data = await tx.item.update({
            where: {
                id: parseInt(id)
            },

            data: {
                styleId: parseIntOrUndefined(styleId),
                sizeId: parseIntOrUndefined(sizeId),
                name: normalizedName,
                hsnId: parseIntOrUndefined(hsnId),
                code: code ? code : undefined,
                sectionId: parseIntOrUndefined(sectionId),
                active: parseOptionalBoolean(active),
                isLegacy: normalizedIsLegacy,
                mainCategoryId: parseIntOrUndefined(mainCategory),
                subCategoryId: parseIntOrUndefined(subCategory),
                aliasName: aliasName ? aliasName : undefined,
                field1: fields?.[0] ?? "",
                field2: fields?.[1] ?? "",
                field3: fields?.[2] ?? "",
                field4: fields?.[3] ?? "",
                field5: fields?.[4] ?? "",

            },
            include: {
                ItemPriceList: true
            }





        })

        await updateItemPriceList(tx, itemPriceList, data)

    })
    return { statusCode: 0, data: data };
}





// async function update(id, body) {

//     await checkIsItemIsUsed(id)

//     const { name, code, companyId, active, itemTypeId, itemDescription, panelId } = await body;

//     const dataFound = await prisma.item.findUnique({
//         where: { id: parseInt(id) },
//     });
//     if (!dataFound) return NoRecordFound("style");

//     const data = await prisma.$transaction(async (tx) => {
//         const updatedStyle = await tx.item.update({
//             where: { id: parseInt(id) },
//             data: {
//                 name,
//                 code,
//                 itemDescription,
//                 companyId: parseInt(companyId),
//                 itemTypeId: itemTypeId ? parseInt(itemTypeId) : undefined,
//                 active
//             },
//             include: {
//                 ItemPanel: {
//                     include: {
//                         ItemPanelProcess: true
//                     }
//                 }
//             }
//         });

//         await updateStylePanel(tx, panelId, updatedStyle);

//         return updatedStyle;
//     });

//     return { statusCode: 0, data };
// }


async function checkIsItemIsUsed(itemId) {

    let data = await prisma.$queryRaw`select *
    from sample sam
     LEFT JOIN 
     SampleDetails sd on sam.id = sd.sampleId
    where sd.itemId = ${itemId}
    `

    if (data?.length > 0) throw Error("This Item Is Already used in Sample")
    return

}

async function remove(id) {
    let data;

    // await checkIsItemIsUsed(id)
    data = await prisma.item.delete({
        where: {
            id: parseInt(id)
        },
    })
    return { statusCode: 0, data };
}

export {
    get,
    getOne,
    getSearch,
    create,
    update,
    remove
}
