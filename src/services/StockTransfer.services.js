import { NoRecordFound } from '../configs/Responses.js';
import { prisma } from '../lib/prisma.js';
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";
import { getDateFromDateTime, getYearShortCode, getYearShortCodeForFinYear } from "../utils/helper.js";
import { getTableRecordWithId } from '../utils/helperQueries.js';

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
        let newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/STFR/1`
        if (lastObject) {
            newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/STFR/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
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
        let newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/STFR/1`
        console.log(lastObject, "lastObject")

        if (lastObject) {
            newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/STFR/${parseInt(lastObject?.docId?.split("/").at(-1)) + 1}`
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
    const { pagination, pageNumber, dataPerPage, branchId, finYearId, serachDocNo, fromOrderNo, toOrderNo, searchDelDate, searchDocDate, partyId,

    } = req.query

    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    let newDocId = await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime);
    let data = await xprisma.StockTransfer.findMany({
        where: {
            // branchId: branchId ? parseInt(branchId) : undefined,
            docId: Boolean(serachDocNo) ?
                {
                    contains: serachDocNo
                }
                : undefined,

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
                FromLocationTransferItems : true,
                ToLocationTransferTtems : true,
        }

    })
    if (!data) return NoRecordFound("order");


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

    console.log(results, "results");

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

async function createFromLocationStock(tx, branchId, storeId, item, transactionId) {

    await tx.stock.create({
        data: {
            inOrOut: "FromLocationTransferItems",
            itemId: item["itemId"] ? parseInt(item["itemId"]) : undefined,
            sizeId: item["sizeId"] ? parseInt(item["sizeId"]) : undefined,
            colorId: item["colorId"] ? parseInt(item["colorId"]) : undefined,
            price: item["price"] ? parseFloat(item["price"]) : 0,
            qty: item["transferQty"] ? 0 - parseFloat(item["transferQty"]) : 0,

            branchId: branchId ? parseInt(branchId) : undefined,
            storeId: storeId ? parseInt(storeId) : undefined,
            transactionId: transactionId ? transactionId : ''
        }
    })

}

async function createToLocationStock(tx, branchId, storeId, item, transactionId, transferType) {



    await tx.stock.create({
        data: {
            inOrOut: "ToLocationTransferItems",
            itemId: item["itemId"] ? parseInt(item["itemId"]) : undefined,
            sizeId: item["sizeId"] ? parseInt(item["sizeId"]) : undefined,
            colorId: item["colorId"] ? parseInt(item["colorId"]) : undefined,
            price: item["price"] ? parseFloat(item["price"]) : 0,
            qty: item["transferQty"] ? parseFloat(item["transferQty"]) : 0,

            branchId: branchId ? parseInt(branchId) : undefined,
            storeId: storeId ? parseInt(storeId) : undefined,
            transactionId: transactionId ? transactionId : ''

        }
    })




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
        const results = await Promise.all(
            stockItems.map(async (item) => {

                const created = await tx.FromLocationTransferItems.create({
                    data: {
                        stockTransferId: parseInt(stockTransferId),
                        itemId: item?.itemId ? parseInt(item.itemId) : undefined,
                        sizeId: item?.sizeId ? parseInt(item.sizeId) : undefined,
                        colorId: item?.colorId ? parseInt(item.colorId) : undefined,
                        transferQty: item?.transferQty ? parseFloat(item.transferQty) : undefined,
                        stockQty: item?.orderDetailsId ? parseFloat(item.stockQty) : undefined,
                    },
                });


                await createFromLocationStock(
                    tx,
                    branchId,
                    fromLocationId,
                    item,
                    created.id
                );


                return created;
            })
        );

        console.log(results, "ALL CREATED ITEMS");
    }



    if (stockItems?.length) {

        const data = await Promise.all(
            stockItems.map(async (item) => {

                // Create and store the created row
                const created = await tx.ToLocationTransferTtems.create({
                    data: {
                        stockTransferId: parseInt(stockTransferId),
                        itemId: item?.itemId ? parseInt(item.itemId) : undefined,
                        sizeId: item?.sizeId ? parseInt(item.sizeId) : undefined,
                        colorId: item?.colorId ? parseInt(item.colorId) : undefined,
                        transferQty: item?.transferQty ? parseFloat(item.transferQty) : undefined,
                        stockQty: item?.orderDetailsId ? parseFloat(item.stockQty) : undefined,
                    },
                });

                // Must use created.id
                await createToLocationStock(
                    tx,
                    branchId,
                    toLocationId,
                    item,
                    created.id,
                );


                return created;
            })
        );

        console.log("Saved records:", data);
    }

}



async function create(req) {

    const { userId, branchId, fromOrderId, toLocationId, fromLocationId, finYearId, draftSave, toCustomerId,
        storeId, stockItems, } = req.body


    let inOrOut = "StockTransfer"


    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    let docId = await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime, draftSave);



    let data;
    await prisma.$transaction(async (tx) => {

        data = await tx.StockTransfer.create({
            data: {
                docId,
                fromLocationId: fromLocationId ? parseInt(fromLocationId) : undefined,
                toLocationId: toLocationId ? parseInt(toLocationId) : undefined,

            },
        });
        await createStocktransferItems(tx, data.id, stockItems, fromLocationId, toLocationId, branchId)

    })

    return { statusCode: 0, data };

}



async function UpdateFromLocationStock(tx, item, transactionId) {



    const data = await prisma.stock.updateMany({
        where: {
            transactionId: parseInt(transactionId),
            inOrOut: "FromLocationTransferItems"
        },
        data:
        {
            qty: item?.transferQty ? parseFloat(0 - item?.transferQty) : undefined,
        },
    })
}

async function UpdateToLocationStock(tx, item, transactionId) {


    const data = await prisma.stock.updateMany({
        where: {
            transactionId: parseInt(transactionId),
            inOrOut: "ToLocationTransferItems"
        },
        data:
        {
            qty: item?.transferQty ? parseFloat(item?.transferQty) : undefined,
        },
    })
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

        await UpdateFromLocationStock(tx, item, item.id);

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

        await UpdateToLocationStock(tx, item, item.id);

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
    const { branchId, poType, storeId, orderItems, stockItems, toLocationId, fromLocationId,
    } = body;




    const dataFound = await prisma.StockTransfer.findUnique({ where: { id: parseInt(id) } });

    if (!dataFound) return { statusCode: 404, message: "No record found for StockTransfer" };



    let data;

    await prisma.$transaction(async (tx) => {
        data = await tx.StockTransfer.update({
            where: {
                id: parseInt(id),

            },



        });

        await updatFromLocationTransferItemsItems(tx, stockItems, fromLocationId, branchId)

        await updatToLocationTransferItemsItems(tx, orderItems, toLocationId, branchId)

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



















