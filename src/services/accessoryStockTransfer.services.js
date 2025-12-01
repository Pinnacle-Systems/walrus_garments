import { NoRecordFound } from '../configs/Responses.js';
import { PrismaClient } from '@prisma/client'
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";
import { getDateFromDateTime, getYearShortCode, getYearShortCodeForFinYear } from "../utils/helper.js";
import { getTableRecordWithId } from '../utils/helperQueries.js';
import { access } from 'fs';

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
        let lastObject = await prisma.AccessoyStockTransfer.findFirst({
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
        let newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/AST/1`
        if (lastObject) {
            newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/AST/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
        }
        return newDocId
    }
    else {
        let lastObject = await prisma.AccessoyStockTransfer.findFirst({
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
        let newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/AST/1`
        console.log(lastObject, "lastObject")

        if (lastObject) {
            newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/AST/${parseInt(lastObject?.docId?.split("/").at(-1)) + 1}`
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
    let data = await xprisma.AccessoyStockTransfer.findMany({
        // where: {
        //     // branchId: branchId ? parseInt(branchId) : undefined,
        //     docId: Boolean(serachDocNo) ?
        //         {
        //             contains: serachDocNo
        //         }
        //         : undefined,
        //     fromOrder: {
        //         docId: fromOrderNo ? { contains: fromOrderNo } : undefined

        //     },
        //     toOrsder: {
        //         docId: toOrderNo ? { contains: toOrderNo } : undefined

        //     }
        //     // partyId: partyId ? parseInt(partyId) : undefined,
        // },
        // include: {
        //     fromOrder: {
        //         select: {
        //             docId: true
        //         }
        //     },
        //     toOrder: {
        //         select: {
        //             docId: true
        //         }
        //     }
        // },

        // orderBy: {
        //     id: "desc",
        // },



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

async function getStockValidationDataNew(data) {


    console.log(data, "data in service")
    if (!data) return data;

    const processItems = async (items, orderIdFilter) => {
        if (!Array.isArray(items) || items.length === 0) return items;

        const updated = await Promise.all(items.map(async (i) => {
            // safe, parameterized query via prisma.$queryRaw with interpolation
            // orderIdFilter can be: null (means IS NULL), or a specific id value
            let totalResult;
            if (orderIdFilter === null) {
                totalResult = await prisma.$queryRaw`
          SELECT SUM(qty) AS total
          FROM accessoryStock
          WHERE accessoryId = ${i.accessoryId}
            AND colorId = ${i.colorId}
            AND uomId = ${i.uomId}
            AND sizeId = ${i.sizeId}
            AND orderId IS NULL
        `;
            } else {
                totalResult = await prisma.$queryRaw`
          SELECT SUM(qty) AS total
          FROM accessoryStock
          WHERE accessoryId = ${i.accessoryId}
            AND colorId = ${i.colorId}
            AND uomId = ${i.uomId}
            AND sizeId = ${i.sizeId}
            AND orderId = ${orderIdFilter}
        `;
            }

            const stock = parseFloat(totalResult?.[0]?.total ?? 0);
            const transferQty = parseFloat(i.transferQty ?? i.tranferQty ?? 0); // handle possible typo
            const balance = parseFloat(transferQty) + parseFloat(stock);

            return {
                ...i,
                currectStockQty: stock,
                stockQty: balance,
                requiredQty: i?.AccessoryRequirementPlanning?.requiredQty || 0
            };
        }));

        return updated;
    };

    const updatedData = { ...data }; // shallow clone

    // CASE: General transfer (orderId IS NULL) — update FromAccessoryTransferItems
    if (data.transferType == "General") {
        updatedData.FromAccessoryTransferItems = await processItems(
            data.FromAccessoryTransferItems,
            null
        );
    }

    // CASE: Order transfer — may need to update From and/or To (if present)
    if (data.transferType == "Order") {
        if (data.fromOrderId) {
            updatedData.FromAccessoryTransferItems = await processItems(
                data.FromAccessoryTransferItems,
                data.fromOrderId
            );
        }

    }
    if (data.toOrderId) {
        console.log("toOrderId present:", data.toOrderId);
        updatedData.ToAccessoryTransferItems = await processItems(
            data.ToAccessoryTransferItems,
            data.toOrderId
        );
    }

    return updatedData;


}


async function getOne(id) {
    const childRecord = await prisma.po.count({ where: { requirementId: parseInt(id) } });

    let data = await prisma.AccessoyStockTransfer.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            FromAccessoryTransferItems: {
                select: {
                    id: true,
                    stockTransferId: true,
                    accessoryId: true,
                    colorId: true,
                    sizeId: true,
                    uomId: true,
                    transferQty: true,
                    accessoryCategoryId: true,
                    accessoryGroupId: true,
                    // orderDetailsId: true,
                    AccessoryRequirementPlanning: {
                        select: {
                            requiredQty: true
                        }
                    },
                    Accessory: {
                        select: {
                            aliasName: true
                        }
                    },
                    AccessoryCategory: {
                        select: {
                            name: true
                        }
                    },
                    AccessoryGroup: {
                        select: {
                            name: true
                        }
                    },
                    Color: {
                        select: {
                            name: true
                        }
                    },
                    Uom: {
                        select: {
                            name: true
                        }
                    },
                    Size: {
                        select: {
                            name: true
                        }
                    },
                    OrderDetails: {
                        select: {
                            style: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }

                }
            },
            ToAccessoryTransferItems: {
                select: {
                    id: true,
                    stockTransferId: true,
                    accessoryId: true,
                    colorId: true,
                    sizeId: true,
                    uomId: true,
                    transferQty: true,
                    accessoryCategoryId: true,
                    accessoryGroupId: true,
                    // orderDetailsId: true,
                    AccessoryRequirementPlanning: {
                        select: {
                            requiredQty: true
                        }
                    },
                    Accessory: {
                        select: {
                            aliasName: true
                        }
                    },
                    AccessoryCategory: {
                        select: {
                            name: true
                        }
                    },
                    AccessoryGroup: {
                        select: {
                            name: true
                        }
                    },
                    Color: {
                        select: {
                            name: true
                        }
                    },
                    Uom: {
                        select: {
                            name: true
                        }
                    },
                    Size: {
                        select: {
                            name: true
                        }
                    },
                    OrderDetails: {
                        select: {
                            style: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }

                }
            },
        }

    })

    data = await getStockValidationDataNew(data);

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

async function createAccessoryStock(tx, poType, inOrOut, branchId, storeId, item, transactionId) {



    await tx.accessoryStock.create({
        data: {
            // itemType: inOrOut,
            inOrOut: "FromAccessoryTransferItems",
            branchId: branchId ? parseInt(branchId) : undefined,
            storeId: storeId ? parseInt(storeId) : undefined,
            accessoryId: item?.accessoryId ? parseInt(item.accessoryId) : undefined,
            accessoryGroupId: item?.accessoryGroupId ? parseInt(item.accessoryGroupId) : undefined,
            accessoryCategoryId: item?.accessoryCategoryId ? parseInt(item.accessoryCategoryId) : undefined,
            colorId: item["colorId"] ? parseInt(item["colorId"]) : undefined,
            sizeId: item["sizeId"] ? parseInt(item["sizeId"]) : undefined,
            uomId: item["uomId"] ? parseInt(item["uomId"]) : undefined,

            qty: item["transferQty"] ? 0 - parseFloat(item["transferQty"]) : 0,
            price: item["price"] ? parseFloat(item["price"]) : 0,
            transactionId: transactionId ? parseInt(transactionId) : undefined,
            orderId: item.orderId ? parseInt(item.orderId) : undefined,
            orderDetailsId: item?.orderDetailsId ? parseInt(item?.orderDetailsId) : undefined,
            accessoryRequirementPlanningId: item?.accessoryRequirementPlanningId ? parseInt(item?.accessoryRequirementPlanningId) : undefined,


        }
    })

}

async function createAccessoryStockAgainstOrder(tx, poType, inOrOut, branchId, storeId, item, transactionId) {

    await tx.accessoryStock.create({
        data: {
            inOrOut: "ToAccessoryTransferItems",
            branchId: branchId ? parseInt(branchId) : undefined,
            storeId: storeId ? parseInt(storeId) : undefined,
            accessoryId: item?.accessoryId ? parseInt(item.accessoryId) : undefined,
            accessoryGroupId: item?.accessoryGroupId ? parseInt(item.accessoryGroupId) : undefined,
            accessoryCategoryId: item?.accessoryCategoryId ? parseInt(item.accessoryCategoryId) : undefined,
            colorId: item["colorId"] ? parseInt(item["colorId"]) : undefined,
            sizeId: item["sizeId"] ? parseInt(item["sizeId"]) : undefined,
            uomId: item["uomId"] ? parseInt(item["uomId"]) : undefined,
            transactionId: transactionId ? parseInt(transactionId) : undefined,

            qty: item["transferQty"] ? parseFloat(item["transferQty"]) : 0,
            price: item["price"] ? parseFloat(item["price"]) : 0,
            transactionId: transactionId ? parseInt(transactionId) : undefined,
            orderId: item.orderId ? parseInt(item.orderId) : undefined,
            orderDetailsId: item?.orderDetailsId ? parseInt(item?.orderDetailsId) : undefined,
            accessoryRequirementPlanningId: item?.id ? parseInt(item?.id) : undefined,



        }
    })

}

// async function UpdateRequirementPlanningItems(tx, poType, inOrOut, branchId, storeId, item) {


//     console.log(item.id, "item?.transferQty", item?.transferQty)

//     await tx.AccessoryRequirementPlanning.update({
//         where: {
//             id: parseInt(item.id),

//         },
//         data: {
//             tranferQty: item?.transferQty ? item?.transferQty : 0


//         }
//     })

// }

async function UpdateRequirementPlanningItems(tx, poType, inOrOut, branchId, storeId, item) {

    const existing = await tx.AccessoryRequirementPlanning.findUnique({
        where: { id: parseInt(item.id) },
        select: { tranferQty: true }
    });

    const oldQty = Number(existing?.tranferQty || 0);
    const newQty = Number(item?.transferQty || 0);

    const finalQty = oldQty + newQty;

    console.log("Old:", oldQty, "New:", newQty, "Final:", finalQty);

    await tx.AccessoryRequirementPlanning.update({
        where: { id: parseInt(item.id) },
        data: {
            tranferQty: finalQty
        }
    });
}

async function createAccessoryStocktransferItems(
    tx,
    stockTransferId,
    stockItems,
    poType,
    inOrOut,
    storeId,
    branchId,
    orderItems,
) {


    if (stockItems?.length) {
        await Promise.all(
            stockItems.map(async (item) => {
                const data = await tx.FromAccessoryTransferItems.create({
                    data: {
                        stockTransferId: parseInt(stockTransferId),
                        accessoryId: item?.accessoryId ? parseInt(item.accessoryId) : undefined,
                        accessoryGroupId: item?.accessoryGroupId ? parseInt(item.accessoryGroupId) : undefined,
                        accessoryCategoryId: item?.accessoryCategoryId ? parseInt(item.accessoryCategoryId) : undefined,
                        colorId: item?.colorId ? parseInt(item.colorId) : undefined,
                        sizeId: item?.sizeId ? parseInt(item.sizeId) : undefined,
                        uomId: item?.uomId ? parseInt(item.uomId) : undefined,
                        transferQty: item?.transferQty ? parseFloat(item.transferQty) : undefined,
                        stockQty: item?.stockQty ? parseFloat(item?.stockQty) : undefined,
                        orderDetailsId: item?.orderDetailsId ? parseInt(item?.orderDetailsId) : undefined,
                        accessoryRequirementPlanningId: item?.id ? parseInt(item?.id) : undefined,

                    },
                });

                await createAccessoryStock(

                    tx,
                    poType,
                    inOrOut,
                    branchId,
                    storeId,
                    item,
                    data?.id,
                );
            })
        );
    }


    if (orderItems?.length) {
        await Promise.all(
            orderItems?.map(async (item) => {
                const data = await tx.toAccessoryTransferItems.create({
                    data: {
                        stockTransferId: stockTransferId ? parseInt(stockTransferId) : undefined,
                        accessoryId: item?.accessoryId ? parseInt(item.accessoryId) : undefined,
                        accessoryGroupId: item?.accessoryGroupId ? parseInt(item.accessoryGroupId) : undefined,
                        accessoryCategoryId: item?.accessoryCategoryId ? parseInt(item.accessoryCategoryId) : undefined,
                        //  style: item?.style ? item?.style : undefined,
                        colorId: item?.colorId ? parseInt(item.colorId) : undefined,
                        sizeId: item?.sizeId ? parseInt(item.sizeId) : undefined,
                        uomId: item?.uomId ? parseInt(item.uomId) : undefined,
                        transferQty: item?.transferQty ? parseFloat(item?.transferQty) : undefined,
                        orderDetailsId: item?.orderDetailsId ? parseInt(item?.orderDetailsId) : undefined,
                        accessoryRequirementPlanningId: item?.id ? parseInt(item?.id) : undefined,



                    },
                });

                await createAccessoryStockAgainstOrder(tx, poType, inOrOut, branchId, storeId, item, data?.id,
                );

                await UpdateRequirementPlanningItems(tx, poType, inOrOut, branchId, storeId, item);

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

        data = await tx.AccessoyStockTransfer.create({
            data: {
                docId,
                fromOrderId: fromOrderId ? parseInt(fromOrderId) : undefined,
                toOrderId: toOrderId ? parseInt(toOrderId) : undefined,
                transferType: transferType ? transferType : undefined,
                fromCustomerId: fromCustomerId ? parseInt(fromCustomerId) : undefined,
                toCustomerId: toCustomerId ? parseInt(toCustomerId) : undefined,


            },
        });
        await createAccessoryStocktransferItems(tx, data.id, stockItems, poType, inOrOut, storeId, branchId, orderItems)

    })






    return { statusCode: 0, data };

}



async function UpdateFromAccessoryStock(tx, item, transactionId) {


    const data = await prisma.accessoryStock.updateMany({
        where: {
            transactionId: parseInt(transactionId),
            inOrOut: "FromAccessoryTransferItems"
        },
        data:
        {
            qty: item?.transferQty ? parseFloat(0 - item?.transferQty) : undefined,
        },
    })
}

async function UpdateToAccessoryStock(tx,item, transactionId) {


    const data = await prisma.accessoryStock.updateMany({
        where: {
            transactionId: parseInt(transactionId),
            inOrOut: "ToAccessoryTransferItems"
        },
        data:
        {
            qty: item?.transferQty ? parseFloat(item?.transferQty) : undefined,
        },
    })
}





async function updateToAccessoryTransferItems(tx, item, poType, inOrOut, branchId, storeId) {

    const updated = await tx.fromAccessoryTransferItems.update({
        where: { id: item.id },
        data: {
            tranferQty: item.tranferQty
        }
    });

    await UpdateToAccessoryStock(
        tx,
        poType,
        inOrOut,
        branchId,
        storeId,
        item,
        item.id
    );

    return updated;
}
async function updateOrCreateFrom(tx, item) {

    if (item?.id) {


        let updatedata = await tx.FromAccessoryTransferItems.update({
            where: {
                id: parseInt(item.id)
            },
            data: {
                transferQty: item?.transferQty ? parseFloat(item?.transferQty) : undefined,


            }
        })

        await UpdateFromAccessoryStock(tx,  item , item.id);

        return updatedata
    }
}

async function updateOrCreateTo(tx, item) {

    if (item?.id) {


        let updatedata = await tx.ToAccessoryTransferItems.update({
            where: {
                id: parseInt(item.id)
            },
            data: {
                transferQty: item?.transferQty ? parseFloat(item?.transferQty) : undefined,


            }
        })

        await UpdateToAccessoryStock(tx,  item , item.id);

        return updatedata
    }
}

async function updatFromAccessoryTransferItemsItems(tx, stockItems, poType, poInwardOrDirectInward, storeId, branchId) {
    let promises = stockItems?.map(async (item) => await updateOrCreateFrom(tx, item, ))
    return Promise.all(promises)
}


async function updatToAccessoryTransferItemsItems(tx, orderItems, poType, poInwardOrDirectInward, storeId, branchId) {
    let promises = orderItems?.map(async (item) => await updateOrCreateTo(tx, item, ))
    return Promise.all(promises)
}

const update = async (id, body) => {
    const { docId, draftSave, finYearId, userId, branchId, partyId, poType, inOrOut, storeId,
        address, phone, validDate, notes, term, transferType, orderYarnDetails, orderSizeDetails, orderItems, stockItems,
    } = body;

    // let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    // const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    // let docIdNumber = await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime, false, docId, "drift");


    const dataFound = await prisma.AccessoyStockTransfer.findUnique({ where: { id: parseInt(id) } });
    if (!dataFound) return { statusCode: 404, message: "No record found for AccessoyStockTransfer" };



    let data;

    await prisma.$transaction(async (tx) => {
        data = await tx.AccessoyStockTransfer.update({
            where: {
                id: parseInt(id),

            },
            include: {
                FromAccessoryTransferItems: true,
                ToAccessoryTransferItems: true,
            },
            data : {
                transferType : transferType ? transferType : "",
            }

        });

        await updatFromAccessoryTransferItemsItems(tx, stockItems, poType, storeId, branchId)

        await updatToAccessoryTransferItemsItems(tx, orderItems, poType, storeId, branchId)

  });

    return { statusCode: 0, data };
};


async function remove(id) {
    const data = await prisma.AccessoyStockTransfer.delete({
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



















