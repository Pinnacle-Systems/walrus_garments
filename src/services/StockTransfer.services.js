import { NoRecordFound } from '../configs/Responses.js';
import { prisma } from '../lib/prisma.js';
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";
import { getDateFromDateTime, getYearShortCode, getYearShortCodeForFinYear } from "../utils/helper.js";
import { getTableRecordWithId } from '../utils/helperQueries.js';
import { buildStockRuntimeFieldWhere, pickStockRuntimeFieldValues, STOCK_RUNTIME_FIELD_KEYS } from "./stockRuntimeFields.js";

function findIsNumber(docId) {
    const parts = docId?.split('/');
    const last = parts[parts?.length - 1];


    if (last == "Drift") {
        return false
    }
    else {
        return true
    }

}

async function getNextDocId(branchId, shortCode, startTime, endTime, saveType, docId, isUpdate) {

    if (saveType) {
        return "Draft Save"
    }
    else if (isUpdate == "drift") {
        let lastObject = await prisma.StockTransfer.findFirst({
            where: {

                draftSave: false,
                AND: [
                    {
                        createdAt: {
                            gte: startTime

                        }
                    },
                    {
                        createdAt: {
                            lte: endTime
                        }
                    }
                ],
            },
            orderBy: {
                id: 'desc'
            }
        });



        const branchObj = await getTableRecordWithId(branchId, "branch")
        let newDocId = `${branchObj.branchCode}${shortCode}/ST/1`
        if (lastObject) {
            newDocId = `${branchObj.branchCode}${shortCode}/ST/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
        }
        return newDocId
    }
    else {
        let lastObject = await prisma.StockTransfer.findFirst({
            where: {
                // branchId: parseInt(branchId),
                AND: [
                    {
                        createdAt: {
                            gte: startTime

                        }
                    },
                    {
                        createdAt: {
                            lte: endTime
                        }
                    }
                ],
            },
            orderBy: {
                id: 'desc'
            }
        });

        const branchObj = await getTableRecordWithId(branchId ? branchId : 1, "branch")
        let newDocId = `${branchObj.branchCode}/${shortCode}/STR/1`
        // console.log(lastObject, "lastObject")

        if (lastObject) {
            newDocId = `${branchObj.branchCode}/${shortCode}/STR/${parseInt(lastObject?.docId?.split("/").at(-1)) + 1}`
        }
        return newDocId
    }

}

const xprisma = prisma.$extends({
    result: {
        order: {
            docDate: {
                needs: { createdAt: true },
                compute(order) {
                    return getDateFromDateTime(order?.createdAt)
                },
            },
            delDate: {
                needs: { validDate: true },
                compute(order) {
                    return getDateFromDateTime(order?.validDate)
                }
            }
        }
    },
})

async function get(req) {
    const { pagination, pageNumber, storeId, branchId, finYearId, serachDocNo, fromOrderNo, toOrderNo, searchDelDate, searchDocDate, partyId,

    } = req.query

    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    let newDocId = await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime);
    let data = await xprisma.StockTransfer.findMany({
        where: {
            storeId: Boolean(storeId) ?
                {
                    contains: storeId
                }
                : undefined, docId: Boolean(serachDocNo) ?
                    {
                        contains: serachDocNo
                    }
                    : undefined,

        },
        include: {
            FromLocation: {
                select: {
                    storeName: true
                }
            },
            ToLocation: {
                select: {
                    storeName: true
                }
            }
        },

        orderBy: {
            id: "desc",
        },



    });
    let totalCount = data.length;
    if (searchDocDate) {
        data = data.filter(i => i.docDate.includes(searchDocDate))
    }
    if (searchDelDate) {
        data = data.filter(i => i.delDate.includes(searchDelDate))
    }




    return { statusCode: 0, data, totalCount, nextDocId: newDocId };
}


async function getOne(id) {
    const childRecord = await prisma.po.count({ where: { requirementId: parseInt(id) } });

    let data = await prisma.StockTransfer.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            FromLocationTransferItems: {
                include: {
                    Item: { select: { name: true } },
                    Color: { select: { name: true } },
                    Size: { select: { name: true } }
                }
            },
            ToLocationTransferTtems: {
                include: {
                    Item: { select: { name: true } },
                    Color: { select: { name: true } },
                    Size: { select: { name: true } }
                }
            },
        }
    })

    if (!data) return NoRecordFound("Stock Transfer");

    const fromTransactionIds = (data.FromLocationTransferItems || []).map((item) => item.id).filter(Boolean);
    const toTransactionIds = (data.ToLocationTransferTtems || []).map((item) => item.id).filter(Boolean);
    const [fromStockRows, toStockRows] = await Promise.all([
        fromTransactionIds.length
            ? prisma.stock.findMany({
                where: {
                    inOrOut: "FromLocationTransferItems",
                    transactionId: { in: fromTransactionIds }
                },
                select: {
                    transactionId: true,
                    qty: true,
                    ...STOCK_RUNTIME_FIELD_KEYS.reduce((fields, key) => {
                        fields[key] = true;
                        return fields;
                    }, {})
                }
            })
            : [],
        toTransactionIds.length
            ? prisma.stock.findMany({
                where: {
                    inOrOut: "ToLocationTransferItems",
                    transactionId: { in: toTransactionIds }
                },
                select: {
                    transactionId: true,
                    qty: true,
                    ...STOCK_RUNTIME_FIELD_KEYS.reduce((fields, key) => {
                        fields[key] = true;
                        return fields;
                    }, {})
                }
            })
            : []
    ]);
    const fromStockMap = new Map(fromStockRows.map((row) => [row.transactionId, row]));
    const toStockMap = new Map(toStockRows.map((row) => [row.transactionId, row]));

    if (data.FromLocationTransferItems && data.FromLocationTransferItems.length > 0) {
        data.FromLocationTransferItems = await Promise.all(
            data.FromLocationTransferItems.map(async (item) => {
                const stockSnapshot = fromStockMap.get(item.id) || {};
                const stockResult = await prisma.stock.aggregate({
                    where: {
                        itemId: item.itemId,
                        sizeId: item.sizeId,
                        colorId: item.colorId,
                        storeId: data.fromLocationId,
                        ...buildStockRuntimeFieldWhere(stockSnapshot)
                    },
                    _sum: {
                        qty: true
                    }
                });
                console.log(stockResult, "stockResult", stockResult._sum.qty + item?.transferQty)
                return {
                    ...item,
                    ...stockSnapshot,
                    stockQty: stockResult._sum.qty + item?.transferQty
                };
            })
        );
    }

    if (data.ToLocationTransferTtems && data.ToLocationTransferTtems.length > 0) {
        data.ToLocationTransferTtems = await Promise.all(
            data.ToLocationTransferTtems.map(async (item) => {
                const stockSnapshot = toStockMap.get(item.id) || {};
                const stockResult = await prisma.stock.aggregate({
                    where: {
                        itemId: item.itemId,
                        sizeId: item.sizeId,
                        colorId: item.colorId,
                        storeId: data.toLocationId,
                        ...buildStockRuntimeFieldWhere(stockSnapshot)
                    },
                    _sum: {
                        qty: true
                    }
                });
                return {
                    ...item,
                    ...stockSnapshot,
                    stockQty: stockResult._sum.qty || 0
                };
            })
        );
    }

    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}


async function getStockValidationData(data) {

    let results = [];


    for (let i = 0; i < data?.RaiseIndentItems?.length; i++) {
        let rendenetData = data?.RaiseIndentItems[i];



        const query = `
            SELECT SUM(qty) AS total
            FROM stock
            WHERE colorId = ${rendenetData?.colorId}
            AND yarnId = ${rendenetData?.yarnId}
            AND inOrOut = 'PurchaseInward'
`;


        const total = await prisma.$queryRawUnsafe(query);

        results.push({
            ...rendenetData,
            stockQty: total?.[0]?.total ?? 0
        });
    }

    // console.log(results, "results");

    return results;
}



export async function getStockvalidationById(id) {


    const childRecord = 0;
    let data = await prisma.MaterialIssue.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            RaiseIndentItems: {
                select: {
                    Yarn: {
                        select: {
                            name: true
                        }
                    },
                    yarnId: true,
                    colorId: true,
                    id: true,
                    percentage: true,
                    qty: true,
                    raiseIndentId: true,
                    sizeId: true,
                    weight: true,
                },


            }
        }




    })

    const enrichedItems = await getStockValidationData(data);

    if (!data) return NoRecordFound("raiseIndent");




    return {
        statusCode: 0,
        data: {
            ...data,
            RaiseIndentItems: enrichedItems,
            childRecord
        }
    };
}


export async function getOrderItemsByIdNew(id, prevProcessId, packingCategory, packingType) {


    const childRecord = 0;
    let data = await prisma.MaterialIssue.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            orderSizeDetails: {
                select: {
                    id: true,
                    sizeMeasurement: true,
                    qty: true,
                    orderdetailsId: true,
                    sizeId: true,
                    weight: true,
                    size: {
                        select: {
                            name: true
                        }
                    }

                }
            },
            orderYarnDetails: {
                select: {
                    id: true,
                    yarncategoryId: true,
                    yarnId: true,
                    count: true,
                    yarnKneedleId: true,
                    colorId: true,

                    Yarn: {
                        select: {
                            name: true
                        }
                    },
                    Color: {
                        select: {
                            name: true
                        }
                    }
                }
            }
        }

    })
    if (!data) return NoRecordFound("order");




    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function UpdateRequirementPlanningItemsFromOrder(tx, poType, inOrOut, branchId, storeId, item) {

    const existing = await tx.requirementPlanningItems.findUnique({
        where: { id: parseInt(item.requirementPlanningItemsId) },
        select: { tranferQty: true }
    });

    const oldQty = Number(existing?.tranferQty || 0);
    const newQty = Number(-(item?.transferQty) || 0);

    const finalQty = oldQty + newQty;


    await tx.requirementPlanningItems.update({
        where: { id: parseInt(item.requirementPlanningItemsId) },
        data: {
            tranferQty: finalQty
        }
    });
}

async function createLocationTransferStock(
    tx,
    branchId,
    fromStoreId,
    toStoreId,
    item,
    transactionId,
    isDiscountSection
) {
    const regularBarcode = item?.barcode ? String(item.barcode) : null;
    const targetBarcode = (isDiscountSection && item?.clearanceBarcode)
        ? String(item.clearanceBarcode)
        : regularBarcode;

    const baseData = {
        transactionId: transactionId ? Number(transactionId) : null,
        itemId: item?.itemId ? Number(item.itemId) : null,
        sizeId: item?.sizeId ? Number(item.sizeId) : null,
        colorId: item?.colorId ? Number(item.colorId) : null,
        uomId: item?.uomId ? Number(item.uomId) : null,
        branchId: branchId ? Number(branchId) : null,
        transactionId: transactionId ? transactionId : null,
        ...pickStockRuntimeFieldValues(item),
    };

    const fromStockData = {
        ...baseData,
        barcode: regularBarcode,
        inOrOut: "FromLocationTransferItems",
        storeId: fromStoreId ? Number(fromStoreId) : null,
        price: item?.price ? Number(item.price) : 0,
        qty: item?.transferQty ? -Number(item.transferQty) : 0 // negative
    };

    const toStockData = {
        ...baseData,
        barcode: targetBarcode,
        inOrOut: "ToLocationTransferItems",
        storeId: toStoreId ? Number(toStoreId) : null,
        price:
            toStoreId == 4 && item?.discountPrice
                ? Number(item.discountPrice)
                : item?.price
                    ? Number(item.price)
                    : 0,
        qty: item?.transferQty ? Number(item.transferQty) : 0 // positive
    };

    await tx.stock.create({ data: fromStockData });
    await tx.stock.create({ data: toStockData });
}


async function createStocktransferItems(
    tx,
    stockTransferId,
    stockItems,
    fromLocationId,
    toLocationId,
    branchId

) {

    if (stockItems?.length) {
        const toLocation = await tx.location.findUnique({ where: { id: parseInt(toLocationId) } });
        const isDiscountSection = toLocation?.storeName === "DISCOUNT SECTION";

        const results = await Promise.all(
            stockItems.map(async (item) => {
                // Determine the correct barcode for the StockTransfer record
                let transferItemBarcode = item?.barcode ? String(item?.barcode) : undefined;

                if (isDiscountSection && item.clearanceBarcode) {
                    const itemRecord = await tx.item.findUnique({ where: { id: parseInt(item.itemId) } });
                    const isLegacy = itemRecord?.isLegacy;

                    const priceListEntry = await tx.itemPriceList.findFirst({
                        where: {
                            itemId: parseInt(item.itemId),
                            sizeId: isLegacy ? null : (item.sizeId ? parseInt(item.sizeId) : null),
                            colorId: isLegacy ? null : (item.colorId ? parseInt(item.colorId) : null),
                        }
                    });

                    if (priceListEntry) {
                        const existingBarcode = await tx.itemBarcode.findFirst({
                            where: {
                                itemPriceListId: priceListEntry.id,
                                barcode: String(item.clearanceBarcode).trim(),
                                active: true
                            }
                        });

                        if (!existingBarcode) {
                            await tx.itemBarcode.create({
                                data: {
                                    itemPriceListId: priceListEntry.id,
                                    barcode: String(item.clearanceBarcode).trim(),
                                    barcodeType: "CLEARANCE",
                                    active: true
                                }
                            });
                        }
                        // Use clearance barcode for the transfer record when destination is discount
                        transferItemBarcode = String(item.clearanceBarcode).trim();
                    }
                }

                const created = await tx.FromLocationTransferItems.create({
                    data: {
                        stockTransferId: parseInt(stockTransferId),
                        itemId: item?.itemId ? parseInt(item.itemId) : undefined,
                        sizeId: item?.sizeId ? parseInt(item.sizeId) : undefined,
                        colorId: item?.colorId ? parseInt(item.colorId) : undefined,
                        transferQty: item?.transferQty ? parseFloat(item.transferQty) : undefined,
                        stockQty: item?.orderDetailsId ? parseFloat(item.stockQty) : undefined,
                        barcode: transferItemBarcode,
                        discountPrice: item?.discountPrice ? String(item?.discountPrice) : undefined,

                    },
                });


                await createLocationTransferStock(tx, branchId, fromLocationId, toLocationId, item, created.id, isDiscountSection)

                return created;
            })
        );

    }

}








async function create(req) {

    const { userId, branchId, fromOrderId, toLocationId, fromLocationId, finYearId, draftSave, toCustomerId,
        storeId, stockItems, deliveryChallanNo } = req.body


    let inOrOut = "StockTransfer"


    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startDateStartTime, finYearDate?.endDateEndTime) : "";
    let docId = await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime, draftSave);



    let data;
    await prisma.$transaction(async (tx) => {
        // Validation for DISCOUNT SECTION
        // const toLocation = await tx.location.findUnique({ where: { id: parseInt(toLocationId) } });
        // if (toLocation?.storeName === "DISCOUNT SECTION") {
        //     for (const item of stockItems) {
        //         if (!item.itemId) continue;

        //         // 1. Check stock in From Location (must match transferQty)
        //         const currentStock = await tx.stock.aggregate({
        //             where: {
        //                 itemId: parseInt(item.itemId),
        //                 sizeId: item.sizeId ? parseInt(item.sizeId) : null,
        //                 colorId: item.colorId ? parseInt(item.colorId) : null,
        //                 storeId: parseInt(fromLocationId),
        //                 ...buildStockRuntimeFieldWhere(item)
        //             },
        //             _sum: { qty: true }
        //         });

        //         const availableQty = parseFloat(currentStock._sum.qty || 0);
        //         const transferQty = parseFloat(item.transferQty || 0);

        //         if (availableQty.toFixed(3) !== transferQty.toFixed(3)) {
        //             throw new Error(`Item ID ${item.itemId} must be transferred fully (${availableQty}) to DISCOUNT SECTION.`);
        //         }

        //         // 2. Check stock in OTHER locations (must be 0)
        //         const otherStock = await tx.stock.aggregate({
        //             where: {
        //                 itemId: parseInt(item.itemId),
        //                 sizeId: item.sizeId ? parseInt(item.sizeId) : null,
        //                 colorId: item.colorId ? parseInt(item.colorId) : null,
        //                 storeId: { not: parseInt(fromLocationId) },
        //                 ...buildStockRuntimeFieldWhere(item)
        //             },
        //             _sum: { qty: true }
        //         });

        //         console.log(otherStock, "otherStock")

        //         if (parseFloat(otherStock._sum.qty || 0) > 0) {
        //             throw new Error(`Item ID ${item.itemId} has stock (${parseFloat(otherStock._sum.qty).toFixed(3)}) in other locations. Clear that stock first.`);
        //         }
        //     }
        // }

        data = await tx.StockTransfer.create({
            data: {
                docId,
                fromLocationId: fromLocationId ? parseInt(fromLocationId) : undefined,
                toLocationId: toLocationId ? parseInt(toLocationId) : undefined,
                deliveryChallanNo: deliveryChallanNo ? deliveryChallanNo : undefined,

            },
        });
        await createStocktransferItems(tx, data.id, stockItems, fromLocationId, toLocationId, branchId)

    })

    return { statusCode: 0, data };

}



async function UpdateFromLocationStock(tx, item, transactionId, storeId) {
    const updateData = {
        qty: item?.transferQty ? parseFloat(0 - item?.transferQty) : undefined,
        ...pickStockRuntimeFieldValues(item),
    };

    await tx.stock.updateMany({
        where: {
            transactionId: parseInt(transactionId),
            inOrOut: "FromLocationTransferItems"
        },
        data: updateData
    });
}

async function UpdateToLocationStock(tx, item, transactionId, storeId) {
    const updateData = {
        qty: item?.transferQty ? parseFloat(item?.transferQty) : undefined,
        ...pickStockRuntimeFieldValues(item),
    };

    await tx.stock.updateMany({
        where: {
            transactionId: parseInt(transactionId),
            inOrOut: "ToLocationTransferItems"
        },
        data: updateData
    });
}

async function updateOrCreateFrom(tx, item, fromLocationId, branchId) {

    if (item?.id) {


        let updatedata = await tx.FromLocationTransferItems.update({
            where: {
                id: parseInt(item.id)
            },
            data: {
                transferQty: item?.transferQty ? parseFloat(item?.transferQty) : undefined,


            }
        })

        await UpdateFromLocationStock(tx, item, item.id, fromLocationId);

        return updatedata
    }
}

async function updateOrCreateTo(tx, item) {

    if (item?.id) {


        let updatedata = await tx.ToLocationTransferItems.update({
            where: {
                id: parseInt(item.id)
            },
            data: {
                transferQty: item?.transferQty ? parseFloat(item?.transferQty) : undefined,


            }
        })

        await UpdateToLocationStock(tx, item, item.id, toLocationId);

        return updatedata
    }
}

async function updatFromLocationTransferItemsItems(tx, stockItems, fromLocationId, branchId) {
    let promises = stockItems?.map(async (item) => await updateOrCreateFrom(tx, item, fromLocationId, branchId))
    return Promise.all(promises)
}


async function updatToLocationTransferItemsItems(tx, stockItems, toLocationId, branchId) {
    let promises = stockItems?.map(async (item) => await updateOrCreateTo(tx, item, toLocationId, branchId))
    return Promise.all(promises)
}

const update = async (id, body) => {
    const { branchId, poType, storeId, orderItems, stockItems, toLocationId, fromLocationId, deliveryChallanNo
    } = body;




    const dataFound = await prisma.stockTransfer.findUnique({ where: { id: parseInt(id) } });

    if (!dataFound) return { statusCode: 404, message: "No record found for StockTransfer" };



    let data;

    const updateData = {};
    if (deliveryChallanNo !== undefined) {
        updateData.deliveryChallanNo = deliveryChallanNo;
    }
    await prisma.$transaction(async (tx) => {
        // Validation for DISCOUNT SECTION (Update)
        const toLocId = toLocationId || dataFound.toLocationId;
        const fromLocId = fromLocationId || dataFound.fromLocationId;

        const toLocation = await tx.location.findUnique({ where: { id: parseInt(toLocId) } });
        if (toLocation?.storeName === "DISCOUNT SECTION") {
            for (const item of stockItems) {
                if (!item.itemId) continue;

                // 1. Check stock in From Location
                const currentStock = await tx.stock.aggregate({
                    where: {
                        itemId: parseInt(item.itemId),
                        sizeId: item.sizeId ? parseInt(item.sizeId) : null,
                        colorId: item.colorId ? parseInt(item.colorId) : null,
                        storeId: parseInt(fromLocId),
                        ...buildStockRuntimeFieldWhere(item)
                    },
                    _sum: { qty: true }
                });

                let existingItemQty = 0;
                if (item.id) {
                    const existingRecord = await tx.FromLocationTransferItems.findUnique({
                        where: { id: parseInt(item.id) },
                        select: { transferQty: true }
                    });
                    existingItemQty = parseFloat(existingRecord?.transferQty || 0);
                }

                const availableQty = parseFloat(currentStock._sum.qty || 0) + existingItemQty;
                const transferQty = parseFloat(item.transferQty || 0);

                if (availableQty.toFixed(3) !== transferQty.toFixed(3)) {
                    throw new Error(`Item ID ${item.itemId} must be transferred fully (${availableQty}) from this location.`);
                }

                // 2. Check stock in OTHER locations
                const otherStock = await tx.stock.aggregate({
                    where: {
                        itemId: parseInt(item.itemId),
                        sizeId: item.sizeId ? parseInt(item.sizeId) : null,
                        colorId: item.colorId ? parseInt(item.colorId) : null,
                        storeId: { not: parseInt(fromLocId) },
                        ...buildStockRuntimeFieldWhere(item)
                    },
                    _sum: { qty: true }
                });

                if (parseFloat(otherStock._sum.qty || 0) > 0) {
                    throw new Error(`Item ID ${item.itemId} has stock in other locations. Clear that stock first.`);
                }
            }
        }

        data = await tx.stockTransfer.update({
            where: {
                id: parseInt(id),
            },
            data: updateData,

        });


        console.log(data, "data for update")

        await updatFromLocationTransferItemsItems(tx, stockItems, fromLocationId, branchId)

        // await updatToLocationTransferItemsItems(tx, stockItems, toLocationId, branchId)

    });




    return { statusCode: 0, data };
};



async function remove(id) {
    const data = await prisma.StockTransfer.delete({
        where: {
            id: parseInt(id)
        },
    })
    return { statusCode: 0, data };
}

export {
    get,
    getOne,
    create,
    update,
    remove
}
















