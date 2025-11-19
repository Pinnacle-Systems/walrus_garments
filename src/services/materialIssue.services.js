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
    const { pagination, pageNumber, dataPerPage, branchId, finYearId, searchDocId, searchDelDate, searchDocDate, partyId,

    } = req.query

    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    let newDocId = await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime);
    let data = await xprisma.MaterialIssue.findMany({
        where: {
            branchId: branchId ? parseInt(branchId) : undefined,
            docId: Boolean(searchDocId) ?
                {
                    contains: searchDocId
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
                    styleColor: true,
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
                    }
                }
            },
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

async function createIssueItems(tx, MaterialIssueId, issueItems, poType, poInwardOrDirectInward, storeId, branchId, indentRaiseId, orderId, materialRequstId) {

    let promises


    promises = issueItems.map(async (item, index) => {
        let data = await tx.MaterialIssueItems.create({
            data: {
                materialIssueId: parseInt(MaterialIssueId),
                orderId: orderId ? parseInt(orderId) : undefined,
                requirementPlanningFormId: item?.requirementPlanningFormId ? parseInt(item?.requirementPlanningFormId) : undefined,
                yarnId: item?.yarnId ? parseInt(item.yarnId) : undefined,
                colorId: item?.colorId ? parseInt(item.colorId) : undefined,
                qty: item?.qty ? parseFloat(item.qty) : undefined,
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

async function create(req) {

    const { userId, branchId, partyId, finYearId, packingCoverType, notes, term, orderBy, draftSave, filePath,
        phone, contactPersonName, materialRequstId, storeId, orderId, indentRaiseId, orderDetailsId, isMaterialIssue, issueItems, poType } = req.body


    let poInwardOrDirectInward = "MaterialIssue"


    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    let docId = await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime, draftSave);



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




            },
        });
        await createIssueItems(tx, data.id, issueItems, poType, poInwardOrDirectInward, storeId, branchId, indentRaiseId, orderId, materialRequstId)

    })






    return { statusCode: 0, data };

}



const update = async (id, body) => {
    const { docId, draftSave, finYearId, userId, branchId, partyId, orderDetails, contactPersonName, packingCoverType,
        address, phone, validDate, notes, term, orderBy, orderYarnDetails, orderSizeDetails, styleId,
    } = body;

    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    let docIdNumber = await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime, false, docId, "drift");


    const dataFound = await prisma.order.findUnique({ where: { id: parseInt(id) } });
    if (!dataFound) return { statusCode: 404, message: "No record found for order" };


    const parsedOrderDetails = JSON.parse(orderDetails || "[]");

    const incomingSizeIds = orderSizeDetails?.filter(i => i.id).map(i => parseInt(i.id));
    const incomingYarnIds = orderYarnDetails?.filter(i => i.id).map(i => parseInt(i.id));

    let data;

    await prisma.$transaction(async (tx) => {
        data = await tx.MaterialIssue.update({
            where: {
                id: parseInt(id),

            },
            include: {
                orderDetails: true
            },
            data: {
                docId: draftSave ? docIdNumber : dataFound?.docId,
                partyId: partyId ? parseInt(partyId) : undefined,
                packingCoverType,
                branchId: branchId ? parseInt(branchId) : undefined,
                contactPersonName,
                address,
                phone,
                validDate: validDate ? new Date(validDate) : undefined,
                updatedById: parseInt(userId), notes, term, orderBy, draftSave: Boolean(draftSave),
                orderDetailsId: parseInt(styleId),
                RequirementYarnDetails: {
                    deleteMany: {
                        ...(incomingSizeIds?.length > 0 && {
                            id: { notIn: incomingSizeIds }
                        })
                    },

                    update: orderSizeDetails
                        .filter(item => item.id)
                        .map((sub) => ({
                            where: { id: parseInt(sub.id) },
                            data: {
                                sizeId: sub?.sizeId ? parseInt(sub.sizeId) : undefined,
                                // sizeMeasurement: sub?.sizeMeasurement || undefined,
                                qty: sub?.qty ? parseFloat(sub.qty) : undefined,
                                weight: sub?.weight ? parseFloat(sub.weight) : undefined,
                            },
                        })),
                },

                requirementSizeDetails: {
                    deleteMany: {
                        ...(incomingYarnIds?.length > 0 && {
                            id: { notIn: incomingYarnIds }
                        })
                    },

                    update: orderYarnDetails?.filter(item => item.id)?.map((sub) => ({
                        where: { id: parseInt(sub.id) },
                        data: {
                            colorId: yarn?.colorId ? parseInt(yarn.colorId) : undefined,
                            percentage: yarn?.percentage ? parseFloat(yarn.percentage) : undefined,
                            yarncategoryId: yarn?.yarncategoryId ? parseInt(yarn.yarncategoryId) : undefined,
                            yarnId: yarn?.yarnId ? parseInt(yarn.yarnId) : undefined,
                            count: yarn?.count ? parseInt(yarn?.count) : undefined,
                            yarnKneedleId: yarn?.yarnKneedleId ? parseInt(yarn.yarnKneedleId) : undefined,
                            styleId: yarn?.styleId ? parseInt(yarn.styleId) : undefined,
                        },
                    })),
                }


            },
        });


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



















