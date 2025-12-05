import { NoRecordFound } from '../configs/Responses.js';
import { PrismaClient } from '@prisma/client'
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";
import { getDateFromDateTime, getYearShortCode, getYearShortCodeForFinYear } from "../utils/helper.js";
import { getTableRecordWithId } from '../utils/helperQueries.js';

const prisma = new PrismaClient()


function findIsNumber(docId) {
    const parts = docId?.split('/');
    const last = parts[parts?.length - 1];

    console.log(last, "lastttt")

    if (last == "Drift") {
        return false
    }
    else {
        return true
    }

    // return !isNaN(Number(last));
}

async function getNextDocId(branchId, shortCode, startTime, endTime, saveType, docId, isUpdate) {

    if (saveType) {
        return "Draft Save"
    }
    else if (isUpdate == "drift") {
        let lastObject = await prisma.StockTransfer.findFirst({
            where: {
                // branchId: parseInt(branchId),
                // docId: {
                //     not: findIsNumber(docId)
                // },
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
            fromOrder: {
                docId: fromOrderNo ? { contains: fromOrderNo } : undefined

            },
            toOrder: {
                docId: toOrderNo ? { contains: toOrderNo } : undefined

            }
            // partyId: partyId ? parseInt(partyId) : undefined,
        },
        include: {
            fromOrder: {
                select: {
                    docId: true
                }
            },
            toOrder: {
                select: {
                    docId: true
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

    // if (pagination) {
    //     data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)
    // }


    return { statusCode: 0, data, totalCount, nextDocId: newDocId };
}


async function getOne(id) {
    const childRecord = await prisma.po.count({ where: { requirementId: parseInt(id) } });

    let data = await prisma.StockTransfer.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            FromOrderTransferItems: true,
            ToOrderTransferTtems: {
                select: {
                    id: true,
                    stockTransferId: true,
                    RequirementPlanningId: true,
                    colorId: true,
                    orderId: true,
                    yarnId: true,
                    style: true,
                    transferQty: true,
                    balanceQty: true,
                    requiredQty: true,
                    Color: {
                        select: {
                            name: true
                        }
                    },
                    Yarn: {
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

async function createYarnStock(tx, poType, inOrOut, branchId, storeId, item, transactionId) {

    await tx.stock.create({
        data: {
            // itemType: inOrOut,
            inOrOut: "FromOrderTransferItems",
            yarnId: item["yarnId"] ? parseInt(item["yarnId"]) : undefined,
            gsmId: item["gsmId"] ? parseInt(item["gsmId"]) : undefined,
            colorId: item["colorId"] ? parseInt(item["colorId"]) : undefined,
            qty: item["transferQty"] ? 0 - parseFloat(item["transferQty"]) : 0,
            price: item["price"] ? parseFloat(item["price"]) : 0,
            orderId: item["orderId"] ? parseInt(item["orderId"]) : undefined,
            branchId: branchId ? parseInt(branchId) : undefined,
            storeId: storeId ? parseInt(storeId) : undefined,
            orderDetailsId: item["orderDetailsId"] ? parseInt(item["orderDetailsId"]) : undefined,
            requirementPlanningItemsId: item["requirementPlanningItemsId"] ? parseInt(item["requirementPlanningItemsId"]) : undefined,
            transactionId: transactionId ? transactionId : ''
        }
    })

}

async function createYarnStockAgainstOrder(tx, poType, inOrOut, branchId, storeId, item, transactionId, transferType) {


    if (transferType != "OrderToGeneral") {
        await tx.stock.create({
            data: {
                // itemType: poType,
                inOrOut: "ToOrderTransferTtems",
                yarnId: item["yarnId"] ? parseInt(item["yarnId"]) : undefined,
                gsmId: item["gsmId"] ? parseInt(item["gsmId"]) : undefined,
                colorId: item["colorId"] ? parseInt(item["colorId"]) : undefined,
                qty: item["transferQty"] ? parseFloat(item["transferQty"]) : 0,
                price: item["price"] ? parseFloat(item["price"]) : 0,
                orderId: item["orderId"] ? parseInt(item["orderId"]) : undefined,
                branchId: branchId ? parseInt(branchId) : undefined,
                storeId: storeId ? parseInt(storeId) : undefined,
                orderDetailsId: item["orderDetailsId"] ? parseInt(item["orderDetailsId"]) : undefined,
                requirementPlanningItemsId: item["id"] ? parseInt(item["id"]) : undefined,
                transactionId: transactionId ? transactionId : ""
            }
        })
    } else {
        await tx.stock.create({
            data: {
                // itemType: poType,
                inOrOut: inOrOut,
                yarnId: item["yarnId"] ? parseInt(item["yarnId"]) : undefined,
                gsmId: item["gsmId"] ? parseInt(item["gsmId"]) : undefined,
                colorId: item["colorId"] ? parseInt(item["colorId"]) : undefined,
                qty: item["transferQty"] ? parseFloat(item["transferQty"]) : 0,
                price: item["price"] ? parseFloat(item["price"]) : 0,
                orderId: item["orderId"] ? parseInt(item["orderId"]) : undefined,
                branchId: branchId ? parseInt(branchId) : undefined,
                storeId: storeId ? parseInt(storeId) : undefined,
                orderDetailsId: item["orderDetailsId"] ? parseInt(item["orderDetailsId"]) : undefined,
                requirementPlanningItemsId: item["requirementPlanningItemsId"] ? parseInt(item["requirementPlanningItemsId"]) : undefined,
                category: transferType == "OrderToGeneral" ? "FromOrder" : "",
                transactionId: transactionId ? transactionId : ""


            }
        })
    }



}

async function UpdateRequirementPlanningItems(tx, poType, inOrOut, branchId, storeId, item) {

    const existing = await tx.requirementPlanningItems.findUnique({
        where: { id: parseInt(item.id) },
        select: { tranferQty: true }
    });

    const oldQty = Number(existing?.tranferQty || 0);
    const newQty = Number(item?.transferQty || 0);

    const finalQty = oldQty + newQty;

    console.log("Old:", oldQty, "New:", newQty, "Final:", finalQty);

    await tx.requirementPlanningItems.update({
        where: { id: parseInt(item.id) },
        data: {
            tranferQty: finalQty
        }
    });
}


async function createStocktransferItems(
    tx,
    stockTransferId,
    stockItems,
    poType,
    inOrOut,
    storeId,
    branchId,
    orderItems,
    fromOrderId,
    transferType
) {
    if (stockItems?.length) {
        await Promise.all(
            stockItems?.map(async (item) => {
                await tx.FromOrderTransferItems.create({
                    data: {
                        stockTransferId: parseInt(stockTransferId),
                        yarnId: item?.yarnId ? parseInt(item.yarnId) : undefined,
                        colorId: item?.colorId ? parseInt(item.colorId) : undefined,
                        transferQty: item?.transferQty ? parseFloat(item.transferQty) : undefined,
                        stockQty: item?.stockQty ? parseFloat(item?.stockQty) : undefined,
                        orderDetailsId: item?.orderDetailsId ? parseInt(item?.orderDetailsId) : undefined,

                    },
                });

                await createYarnStock(tx, poType, inOrOut, branchId, storeId, item, data?.id);


                if (fromOrderId) {
                    await UpdateRequirementPlanningItemsFromOrder(tx, poType, inOrOut, branchId, storeId, item);
                }


            })
        );
    }


    if (orderItems?.length) {
        await Promise.all(
            orderItems?.map(async (item) => {
                await tx.ToOrderTransferTtems.create({
                    data: {
                        stockTransferId: parseInt(stockTransferId),
                        RequirementPlanningId: item?.RequirementPlanningId ? parseInt(item.RequirementPlanningId) : undefined,
                        colorId: item?.colorId ? parseInt(item.colorId) : undefined,
                        orderId: item?.orderId ? parseInt(item.orderId) : undefined,
                        yarnId: item?.yarnId ? parseInt(item.yarnId) : undefined,
                        style: item?.style ? item?.style : undefined,
                        transferQty: item?.transferQty ? parseFloat(item?.transferQty) : undefined,
                        qty: item?.qty ? parseFloat(item?.qty) : undefined,
                        balanceQty: item?.balanceQty ? parseFloat(item?.balanceQty) : undefined,
                        requiredQty: item?.requiredQty ? parseFloat(item?.requiredQty) : undefined,
                        orderDetailsId: item?.orderDetailsId ? parseInt(item?.orderDetailsId) : undefined,


                    },
                });

                await createYarnStockAgainstOrder(tx, poType, inOrOut, branchId, storeId, item, data?.id, transferType);

                if (transferType != "OrderToGeneral") {

                    await UpdateRequirementPlanningItems(tx, poType, inOrOut, branchId, storeId, item);
                }

            })
        );
    }
}



async function create(req) {

    const { userId, branchId, fromOrderId, toOrderId, finYearId, draftSave, transferType, fromCustomerId, toCustomerId,
        storeId, orderItems, stockItems, poType } = req.body


    let inOrOut = "StockTransfer"


    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    let docId = await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime, draftSave);



    let data;
    await prisma.$transaction(async (tx) => {

        data = await tx.StockTransfer.create({
            data: {
                docId,
                fromOrderId: fromOrderId ? parseInt(fromOrderId) : undefined,
                toOrderId: toOrderId ? parseInt(toOrderId) : undefined,
                transferType: transferType ? transferType : undefined,
                fromCustomerId: fromCustomerId ? parseInt(fromCustomerId) : undefined,
                toCustomerId: toCustomerId ? parseInt(toCustomerId) : undefined,


            },
        });
        await createStocktransferItems(tx, data.id, stockItems, poType, inOrOut, storeId, branchId, orderItems, fromOrderId, transferType)

    })

    return { statusCode: 0, data };

}



async function UpdateFromAccessoryStock(tx, item, transactionId) {

    console.log(transactionId, "FromOrderTransferItemsId")


    const data = await prisma.stock.updateMany({
        where: {
            transactionId: parseInt(transactionId),
            inOrOut: "FromOrderTransferItems"
        },
        data:
        {
            qty: item?.transferQty ? parseFloat(0 - item?.transferQty) : undefined,
        },
    })
}

async function UpdateToAccessoryStock(tx, item, transactionId) {
    console.log(transactionId, "ToOrderTransferTtemsId")


    const data = await prisma.stock.updateMany({
        where: {
            transactionId: parseInt(transactionId),
            inOrOut: "ToOrderTransferTtems"
        },
        data:
        {
            qty: item?.transferQty ? parseFloat(item?.transferQty) : undefined,
        },
    })
}




async function updateOrCreateFrom(tx, item) {

    if (item?.id) {


        let updatedata = await tx.FromOrderTransferItems.update({
            where: {
                id: parseInt(item.id)
            },
            data: {
                transferQty: item?.transferQty ? parseFloat(item?.transferQty) : undefined,


            }
        })

        await UpdateFromAccessoryStock(tx, item, item.id);

        return updatedata
    }
}

async function updateOrCreateTo(tx, item) {

    if (item?.id) {


        let updatedata = await tx.ToOrderTransferTtems.update({
            where: {
                id: parseInt(item.id)
            },
            data: {
                transferQty: item?.transferQty ? parseFloat(item?.transferQty) : undefined,


            }
        })

        await UpdateToAccessoryStock(tx, item, item.id);

        return updatedata
    }
}

async function updatFromYarnTransferItemsItems(tx, stockItems, poType, poInwardOrDirectInward, storeId, branchId) {
    let promises = stockItems?.map(async (item) => await updateOrCreateFrom(tx, item,))
    return Promise.all(promises)
}


async function updatToYarnTransferItemsItems(tx, orderItems, poType, poInwardOrDirectInward, storeId, branchId) {
    let promises = orderItems?.map(async (item) => await updateOrCreateTo(tx, item,))
    return Promise.all(promises)
}

const update = async (id, body) => {
    const { docId, draftSave, finYearId, userId, branchId, partyId, poType, inOrOut, storeId,
        address, phone, validDate, notes, term, transferType, orderYarnDetails, orderSizeDetails, orderItems, stockItems,
    } = body;

    // let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    // const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    // let docIdNumber = await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime, false, docId, "drift");


    const dataFound = await prisma.StockTransfer.findUnique({ where: { id: parseInt(id) } });
    if (!dataFound) return { statusCode: 404, message: "No record found for StockTransfer" };



    let data;

    await prisma.$transaction(async (tx) => {
        data = await tx.StockTransfer.update({
            where: {
                id: parseInt(id),

            },
            include: {
                FromOrderTransferItems: true,
                ToOrderTransferTtems: true,
            },
            data: {
                transferType: transferType ? transferType : "",
            }

        });

        await updatFromYarnTransferItemsItems(tx, stockItems, poType, storeId, branchId)

        await updatToYarnTransferItemsItems(tx, orderItems, poType, storeId, branchId)

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



















