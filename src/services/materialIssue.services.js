import { NoRecordFound } from '../configs/Responses.js';
import { prisma } from '../lib/prisma.js';
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";
import { getDateFromDateTime, getYearShortCode, getYearShortCodeForFinYear } from "../utils/helper.js";
import { getTableRecordWithId } from '../utils/helperQueries.js';

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
        let lastObject = await prisma.MaterialIssue.findFirst({
            where: {
                branchId: parseInt(branchId),
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
        let newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/MIS/1`
        if (lastObject) {
            newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/MIS/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
        }
        return newDocId
    }
    else {
        let lastObject = await prisma.MaterialIssue.findFirst({
            where: {
                branchId: parseInt(branchId),
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
        let newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/MIS/1`
        if (lastObject) {
            newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/MIS/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
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
    const { pagination, pageNumber, dataPerPage, branchId, finYearId, serachDocNo, searchDelDate, searchDate, partyId,

    } = req.query

    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    let newDocId = await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime);
    let data = await xprisma.materialIssue.findMany({
        where: {
            branchId: branchId ? parseInt(branchId) : undefined,
            docId: serachDocNo ?
                {
                    contains: serachDocNo
                }
                : undefined,
            partyId: partyId ? parseInt(partyId) : undefined,

        },
        include: {
            MaterialIssueItems: {
                select: {
                    id: true,
                    materialIssueId: true,
                    RaiseIndentItems: true,
                    colorId: true,
                    Color: {
                        select: {
                            name: true
                        }
                    },
                    Yarn: {
                        select: {
                            name: true
                        }
                    },
                    yarnId: true,
                    issueQty: true,
                    styleColor: true,
                }
            },

            Order: {
                select: {
                    docId: true
                }
            },
            Party: {
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
            },
            RequirementPlanningForm: {
                select: {
                    docId: true
                }
            },
        },
        orderBy: {
            id: "desc",
        },



    });
    let totalCount = data.length;
    if (searchDate) {
        data = data.filter(i => i.docDate.includes(searchDate))
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

    let data = await prisma.materialIssue.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            MaterialIssueItems: {
                select: {
                    id: true,
                    materialIssueId: true,
                    colorId: true,
                    Color: {
                        select: {
                            name: true
                        }
                    },
                    Yarn: {
                        select: {
                            name: true
                        }
                    },
                    yarnId: true,
                    issueQty: true,
                    qty: true,
                    styleColor: true,
                }
            },
            AccessoryMaterialIssueItems: {
                select: {
                    id: true,
                    materialIssueId: true,
                    orderDetailsId: true,
                    orderId: true,
                    accessoryId: true,
                    Accessory: {
                        select: {
                            aliasName: true
                        }
                    },
                    accessoryCategoryId: true,
                    AccessoryCategory: {
                        select: {
                            name: true,
                        }
                    },
                    AccessoryGroup: {
                        select: {
                            name: true,
                        }
                    },
                    accessoryGroupId: true,
                    uomId: true,
                    Uom: {
                        select: {
                            name: true
                        }
                    },
                    colorId: true,
                    Color: {
                        select: {
                            name: true,
                        }
                    },
                    sizeId: true,
                    Size: {
                        select: {
                            name: true
                        }
                    },
                    qty: true,
                    requiredQty: true,
                    issueQty: true,
                    raiseIndentId: true,
                    styleColor: true,
                    accessoryRaiseIndentItemsId: true,
                    accessoryRequirementPlanningId: true,

                }
            },
            Order: {
                select: {
                    Stock: {
                        select: {
                            yarnId: true,
                            Yarn: {
                                select: {
                                    name: true
                                }
                            },
                            colorId: true,
                            Color: {
                                select: {
                                    name: true
                                }
                            },
                            itemType: true,
                            inOrOut: true,
                            uomId: true,
                            qty: true,
                            price: true,
                            storeId: true,
                            branchId: true,
                            orderId: true
                        }
                    },
                    AccessoryStock: {
                        select: {
                            id: true,
                            itemType: true,
                            inOrOut: true,
                            accessoryId: true,
                            Accessory: {
                                select: {
                                    aliasName: true,
                                }
                            },
                            accessoryGroupId: true,
                            accessoryGroup: {
                                select: {
                                    name: true
                                }
                            },
                            // accessoryCategoryId : true ,
                            // Acc
                            // accessoryItem: {
                            //     select: {
                            //         name: true
                            //     }
                            // },
                            accessoryItemId: true,
                            colorId: true,
                            Color: {
                                select: {
                                    name: true
                                }
                            },
                            uomId: true,
                            Uom: {
                                select: {
                                    name: true
                                }
                            },
                            sizeId: true,
                            Size: {
                                select: {
                                    name: true
                                }
                            },
                            qty: true,
                            price: true,
                            storeId: true,
                            branchId: true,
                            active: true,
                            orderId: true,
                            orderDetailsId: true,
                            accessoryRequirementPlanningId: true,
                            category: true,
                            transactionId: true,
                        }
                    }
                }
            },

            MaterialIssueTypeList: true
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
        // include: {
        //     RaiseIndentItems: {
        //         select: {
        //             Yarn: {
        //                 select: {
        //                     name: true
        //                 }
        //             },
        //             yarnId: true,
        //             colorId: true,
        //             id: true,
        //             percentage: true,
        //             qty: true,
        //             raiseIndentId: true,
        //             sizeId: true,
        //             weight: true,
        //         },


        //     }
        // }




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

async function createYarnStock(tx, poType, poInwardOrDirectInward, branchId, storeId, item, orderId) {

    await tx.stock.create({
        data: {
            itemType: poType,
            inOrOut: poInwardOrDirectInward,
            orderId: orderId ? parseInt(orderId) : undefined,
            yarnId: item["yarnId"] ? parseInt(item["yarnId"]) : undefined,
            noOfBags: item["noOfBags"] ? parseInt(item["noOfBags"]) : undefined,
            gsmId: item["gsmId"] ? parseInt(item["gsmId"]) : undefined,
            kDiaId: item["kDiaId"] ? parseInt(item["kDiaId"]) : undefined,
            fDiaId: item["fDiaId"] ? parseInt(item["fDiaId"]) : undefined,
            uomId: item["uomId"] ? parseInt(item["uomId"]) : undefined,
            colorId: item["colorId"] ? parseInt(item["colorId"]) : undefined,
            qty: item["issueQty"] ? 0 - parseFloat(item["issueQty"]) : 0,
            price: item["price"] ? parseFloat(item["price"]) : 0,
            requirementPlanningItemsId: item["requirementPlanningItemsId"] ? item["requirementPlanningItemsId"] : undefined,
            orderDetailsId: item?.orderDetailsId ? parseInt(item["orderDetailsId"]) : undefined,


        }
    })

}

async function createYarnIssueItems(tx, MaterialIssueId, issueItems, poType, poInwardOrDirectInward, storeId, branchId, indentRaiseId, orderId, materialRequstId) {

    let promises


    promises = issueItems.map(async (item, index) => {
        let data = await tx.MaterialIssueItems.create({
            data: {
                materialIssueId: parseInt(MaterialIssueId),
                orderId: orderId ? parseInt(orderId) : undefined,
                requirementPlanningFormId: item?.requirementPlanningFormId ? parseInt(item?.requirementPlanningFormId) : undefined,
                yarnId: item?.yarnId ? parseInt(item.yarnId) : undefined,
                colorId: item?.colorId ? parseInt(item.colorId) : undefined,
                qty: item?.issueQty ? parseFloat(item.issueQty) : undefined,
                issueQty: item?.issueQty ? parseFloat(item.issueQty) : undefined,
                styleColor: item?.styleColor ? item?.styleColor : undefined,
                requirementPlanningItemsId: item?.requirementPlanningItemsId ? parseInt(item?.requirementPlanningItemsId) : undefined,
                orderDetailsId: item?.orderDetailsId ? parseInt(item?.orderDetailsId) : undefined,
                raiseIndentId: materialRequstId ? parseInt(materialRequstId) : undefined,
                raiseIndentItemsId: item?.id ? parseInt(item?.id) : undefined,
            }
        })

        await createYarnStock(tx, poType, poInwardOrDirectInward, branchId, storeId, item, orderId)
    })









    return Promise.all(promises)
}


async function createAccessoryStock(tx, poType, poInwardOrDirectInward, branchId, storeId, item, transactionId, orderId) {

    await tx.AccessoryStock.create({
        data: {
            itemType: poType ? poType : undefined,
            inOrOut: poInwardOrDirectInward ? poInwardOrDirectInward : undefined,
            branchId: branchId ? parseInt(branchId) : undefined,
            sizeId: item?.sizeId ? parseInt(item?.sizeId) : undefined,
            accessoryId: item?.accessoryId ? parseInt(item.accessoryId) : undefined,
            accessoryGroupId: item?.accessoryGroupId ? parseInt(item.accessoryGroupId) : undefined,
            accessoryCategoryId: item?.accessoryCategoryId ? parseInt(item.accessoryCategoryId) : undefined,
            colorId: item?.colorId ? parseInt(item.colorId) : undefined,
            uomId: item?.uomId ? parseInt(item.uomId) : undefined,
            storeId: storeId ? parseInt(storeId) : undefined,
            qty: item?.issueQty ? parseFloat(0 - item?.issueQty) : undefined,
            price: item.price ? parseInt(item.price) : undefined,
            transactionId: transactionId ? parseInt(transactionId) : undefined,
            orderId: orderId ? parseInt(orderId) : undefined,
            orderDetailsId: item?.orderDetailsId ? parseInt(item?.orderDetailsId) : undefined,
            accessoryRequirementPlanningId: item?.accessoryRequirementPlanningId ? parseInt(item?.accessoryRequirementPlanningId) : undefined,

        }
    })

}

async function createAccessoryIssueItems(tx, MaterialIssueId, accessoryIssueItems, poType, poInwardOrDirectInward, storeId, branchId, indentRaiseId, orderId, materialRequstId) {

    let promises


    promises = accessoryIssueItems.map(async (item, index) => {
        let data = await tx.AccessoryMaterialIssueItems.create({
            data: {
                materialIssueId: parseInt(MaterialIssueId),
                orderId: orderId ? parseInt(orderId) : undefined,
                orderDetailsId: item?.orderDetailsId ? parseInt(item?.orderDetailsId) : undefined,
                requirementPlanningFormId: item?.requirementPlanningFormId ? parseInt(item?.requirementPlanningFormId) : undefined,
                accessoryId: item?.accessoryId ? parseInt(item.accessoryId) : undefined,
                accessoryCategoryId: item?.accessoryCategoryId ? parseInt(item.accessoryCategoryId) : undefined,
                accessoryGroupId: item?.accessoryGroupId ? parseInt(item.accessoryGroupId) : undefined,
                uomId: item?.uomId ? parseInt(item.uomId) : undefined,
                sizeId: item?.sizeId ? parseInt(item.sizeId) : undefined,

                colorId: item?.colorId ? parseInt(item.colorId) : undefined,
                qty: item?.issueQty ? parseFloat(item.issueQty) : undefined,
                issueQty: item?.issueQty ? parseFloat(item.issueQty) : undefined,
                requiredQty: item?.requiredQty ? parseFloat(item.requiredQty) : undefined,
                raiseIndentId: materialRequstId ? parseInt(materialRequstId) : undefined,
                styleColor: item?.styleColor ? item?.styleColor : undefined,
                accessoryRaiseIndentItemsId: item?.id ? parseInt(item?.id) : undefined,
                accessoryRequirementPlanningId: item?.accessoryRequirementPlanningId ? parseInt(item?.accessoryRequirementPlanningId) : undefined,


            }
        })

        await createAccessoryStock(tx, poType, poInwardOrDirectInward, branchId, storeId, item, data?.id, orderId)
    })









    return Promise.all(promises)
}

async function create(req) {

    const { userId, branchId, partyId, finYearId, materialIssueTypeList, notes, term, orderBy, draftSave, filePath,
        phone, contactPersonName, materialRequstId, storeId, orderId, indentRaiseId, isMaterialIssue, issueItems, accessoryIssueItems, poType } = req.body


    let poInwardOrDirectInward = "MaterialIssue"


    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    let docId = await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime, draftSave);

    console.log(issueItems, 'issueItems')

    let data;
    await prisma.$transaction(async (tx) => {

        data = await tx.MaterialIssue.create({
            data: {
                docId,
                isMaterialIssue: Boolean(isMaterialIssue),
                contactPersonName: contactPersonName ?? "John",
                partyId: partyId ? parseInt(partyId) : undefined,
                branchId: branchId ? parseInt(branchId) : undefined,
                orderId: parseInt(orderId),
                raiseIndentId: materialRequstId ? parseInt(materialRequstId) : undefined,
                // orderDetailsId: parseInt(orderDetailsId),
                // requirementId:  parseInt(requirementId) ,


                MaterialIssueTypeList: materialIssueTypeList?.length > 0
                    ? {
                        create: materialIssueTypeList?.map((item) => ({

                            name: item?.show ? item?.show : undefined,
                            value: item?.value ? item?.value : undefined,
                        })),
                    }
                    : undefined,


            },
        });
        await createYarnIssueItems(tx, data.id, issueItems, poType, poInwardOrDirectInward, storeId, branchId, indentRaiseId, orderId, materialRequstId)
        await createAccessoryIssueItems(tx, data.id, accessoryIssueItems, poType, poInwardOrDirectInward, storeId, branchId, indentRaiseId, orderId, materialRequstId)


    })






    return { statusCode: 0, data };

}

async function UpdateYarnStock(tx, item, transactionId) {


    const data = await prisma.stock.updateMany({
        where: {
            transactionId: parseInt(transactionId),
            inOrOut: "MaterialIssue"
        },
        data:
        {
            qty: item?.issueQty ? parseFloat(0 - item?.issueQty) : undefined,
        },
    })
}

async function updateOrCreateYarnItems(tx, item) {

    console.log(item, "itemmmm")

    if (item?.id) {
        let updatedata = await tx.MaterialIssueItems.update({
            where: {
                id: parseInt(item.id)
            },
            data: {
                qty: item?.issueQty ? parseFloat(item?.issueQty) : undefined,
                issueQty: item?.issueQty ? parseFloat(item?.issueQty) : undefined,


            }
        })

        await UpdateYarnStock(tx, item, item.id);

        return updatedata
    }
}


async function UpdateAccessoryStock(tx, item, transactionId) {


    const data = await prisma.accessoryStock.updateMany({
        where: {
            transactionId: parseInt(transactionId),
            inOrOut: "MaterialIssue"
        },
        data:
        {
            qty: item?.issueQty ? parseFloat(0 - item?.issueQty) : undefined,
        },
    })
}


async function updateOrCreateAccessoryItems(tx, item) {

    if (item?.id) {
        let updatedata = await tx.AccessoryMaterialIssueItems.update({
            where: {
                id: parseInt(item.id)
            },
            data: {
                qty: item?.issueQty ? parseFloat(item?.issueQty) : undefined,
                issueQty: item?.issueQty ? parseFloat(item?.issueQty) : undefined,


            }
        })

        await UpdateAccessoryStock(tx, item, item.id);

        return updatedata
    }
}


async function updateAccessoryIssueItems(tx, MaterialIssueId, accessoryIssueItems) {
    let promises = (accessoryIssueItems || [])?.map(async (item) => await updateOrCreateAccessoryItems(tx, item))
    console.log(accessoryIssueItems, "accessoryIssueItems")

    return Promise.all(promises)
}


async function updateYarnIssueItems(tx, MaterialIssueId, yarnIssueItems) {
    let promises = (yarnIssueItems || [])?.map(async (item) => await updateOrCreateYarnItems(tx, item))
    console.log(yarnIssueItems, "yarnIssueItems")

    return Promise.all(promises)
}

const update = async (id, body) => {

    const { docId, draftSave, finYearId, userId, branchId, partyId, orderDetails, contactPersonName, packingCoverType,
        address, phone, validDate, notes, term, orderBy, orderYarnDetails, orderSizeDetails, orderId, materialIssueTypeList, accessoryIssueItems, issueItems
    } = body;




    const dataFound = await prisma.materialIssue.findUnique({ where: { id: parseInt(id) } });
    if (!dataFound) return { statusCode: 404, message: "No record found for MaterialIssue" };





    // const incomingYarnIds = issueItems?.filter(i => i.id).map(i => parseInt(i.id));
    // const incomingAccesssoryIds = accessoryIssueItems?.filter(i => i.id).map(i => parseInt(i.id));
    const incomingmaterialIssueTypeListIds = materialIssueTypeList?.filter(i => i.id).map(i => parseInt(i.id));

    let data;

    await prisma.$transaction(async (tx) => {
        data = await tx.MaterialIssue.update({
            where: {
                id: parseInt(id),

            },
            include: {
                MaterialIssueItems: true,
                AccessoryMaterialIssueItems: true,
            },
            data: {
                orderId: orderId ? parseInt(orderId) : undefined,
                MaterialIssueTypeList: {
                    deleteMany: {
                        ...(incomingmaterialIssueTypeListIds.length > 0 && {
                            id: { notIn: incomingmaterialIssueTypeListIds }
                        })
                    },

                    update: incomingmaterialIssueTypeListIds?.filter(item => item.id).map((item) => ({
                        where: { id: parseInt(item.id) },
                        data: {
                            name: item?.value ? item?.value : undefined,
                            value: item?.value ? item?.value : undefined,
                        },
                    })),


                }

            },
        });
        await updateYarnIssueItems(tx, data.id, issueItems)
        await updateAccessoryIssueItems(tx, data.id, accessoryIssueItems)

    });


    return { statusCode: 0, data };
};



async function remove(id) {
    const data = await prisma.MaterialIssue.delete({
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



















