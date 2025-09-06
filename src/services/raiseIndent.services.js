import { NoRecordFound } from '../configs/Responses.js';
import { PrismaClient } from '@prisma/client'
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";
import { getDateFromDateTime, getYearShortCode, getYearShortCodeForFinYear } from "../utils/helper.js";
import { getTableRecordWithId } from '../utils/helperQueries.js';

const prisma = new PrismaClient()



async function getNextDocId(branchId, shortCode, startTime, endTime, saveType, docId, isUpdate) {

    if (saveType) {
        return "Draft Save"
    }
    else if (isUpdate == "drift") {
        let lastObject = await prisma.raiseIndent.findFirst({
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
        let newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/MRTF/1`
        if (lastObject) {
            newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/MRTF/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
        }
        return newDocId
    }
    else {
        let lastObject = await prisma.raiseIndent.findFirst({
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
        let newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/MRTF/1`
        if (lastObject) {
            newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/MRTF/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
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
    const { pagination, pageNumber, dataPerPage, branchId, finYearId, searchDocId, searchDelDate, searchDocDate, partyId, materialIssue, indentRaise

    } = req.query

    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    let newDocId = await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime);
    let data = await xprisma.raiseIndent.findMany({
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

    if (pagination) {
        data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)
    }
    if (indentRaise) {
        data = data?.filter(item => item.isRaiseRendent && !item.isMaterialIssue)

    }


    return { statusCode: 0, data, totalCount, nextDocId: newDocId };
}


async function getOne(id) {
    const childRecord = await prisma.po.count({ where: { requirementId: parseInt(id) } });

    let data = await prisma.raiseIndent.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            RaiseIndentItems: {
                select: {
                    id: true,
                    raiseIndentId: true,
                    requirementPlanningFormId: true,
                    orderdetailsId: true,
                    OrderDetails: {
                        select: {
                            style: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    },
                    RaiseIndenetYarnItems: {
                        select: {
                            id: true,
                            raiseIndentItemsId: true,
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
                            count: true,
                            qty: true,
                            issueQty: true,
                            percentage: true,

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

    console.log(data, "data")



    //     for (let i = 0; i < data?.RaiseIndentItems?.length; i++) {
    //         let rendenetData = data?.RaiseIndentItems[i];



    //         const query = `
    //             SELECT SUM(qty) AS total
    //             FROM stock
    //             WHERE colorId = ${rendenetData?.colorId}
    //             AND yarnId = ${rendenetData?.yarnId}
    // `;


    //         const total = await prisma.$queryRawUnsafe(query);

    //         results.push({
    //             ...rendenetData,
    //             stockQty: total?.[0]?.total ?? 0
    //         });
    //     }
    let results = [];

    for (let i = 0; i < data?.RaiseIndentItems?.length; i++) {
        let rendenetData = data?.RaiseIndentItems[i];

        // enrich each yarnItem with stockQty
        const yarnsWithStock = [];
        for (let j = 0; j < rendenetData?.RaiseIndenetYarnItems?.length; j++) {
            let yarnItem = rendenetData.RaiseIndenetYarnItems[j];

            const query = `
      SELECT SUM(qty) AS total
      FROM stock
      WHERE colorId = ${yarnItem?.colorId}
      AND yarnId = ${yarnItem?.yarnId}
    `;

            const total = await prisma.$queryRawUnsafe(query);

            yarnsWithStock.push({
                ...yarnItem,
                stockQty: total?.[0]?.total ?? 0,
            });
        }

        results.push({
            ...rendenetData,
            RaiseIndenetYarnItems: yarnsWithStock, // updated yarns with stock
        });
    }


    console.log(results, "results")

    return results;
}



export async function getStockvalidationById(id) {


    const childRecord = 0;
    let data = await prisma.raiseIndent.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            RaiseIndentItems: {
                select: {
                    id: true,
                    raiseIndentId: true,
                    requirementPlanningFormId: true,
                    orderdetailsId: true,
                    OrderDetails: {
                        select: {
                            style: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    },
                    RaiseIndenetYarnItems: {
                        select: {
                            id: true,
                            raiseIndentItemsId: true,
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
                            count: true,
                            qty: true,
                            issueQty: true,
                            percentage: true,

                        }
                    }
                }
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
    let data = await prisma.orderDetails.findUnique({
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


async function create(req) {

    const { userId, branchId, partyId, finYearId, packingCoverType, notes, term, orderBy, draftSave, filePath,
        phone, contactPersonName, address, validDate, orderId, requirementId, orderDetailsId, isRaiseRendent, raiseIndentItems } = req.body



    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    let docId = await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime, draftSave);



    let data;
    await prisma.$transaction(async (tx) => {

        data = await tx.RaiseIndent.create({
            data: {
                docId,
                isRaiseRendent: Boolean(isRaiseRendent),
                contactPersonName: contactPersonName ?? "John",
                Party: partyId ? { connect: { id: parseInt(partyId) } } : undefined,
                Branch: branchId ? { connect: { id: parseInt(branchId) } } : undefined,
                createdBy: { connect: { id: parseInt(userId) } },
                Order: { connect: { id: parseInt(orderId) } },
                // OrderDetails: { connect: { id: parseInt(orderDetailsId) } },
                // RequirementPlanningForm: { connect: { id: parseInt(requirementId) } },
                // RaiseIndentItems: raiseIndentItems?.length > 0
                //     ? {
                //         createMany: {
                //             data: raiseIndentItems?.map((sub) => ({
                //                 colorId: sub?.colorId ? parseInt(sub.colorId) : undefined,
                //                 percentage: sub?.percentage ? parseFloat(sub.percentage) : undefined,
                //                 qty: sub?.qty ? parseFloat(sub.qty) : undefined,
                //                 sizeId: sub?.sizeId ? parseInt(sub.sizeId) : undefined,
                //                 weight: sub?.weight ? parseFloat(sub.weight) : undefined,
                //                 yarnId: sub?.yarnId ? parseInt(sub.yarnId) : undefined,

                //             })),
                //         },
                //     }
                //     : undefined,

                RaiseIndentItems: raiseIndentItems?.length > 0
                    ? {
                        create: raiseIndentItems.map((item) => ({
                            requirementPlanningFormId: item?.requirementPlanningFormId ? parseInt(item?.requirementPlanningFormId) : undefined,
                            orderdetailsId: item?.orderdetailsId ? parseInt(item?.orderdetailsId) : undefined,
                            RaiseIndenetYarnItems: item?.RaiseIndenetYarnItems?.length > 0
                                ? {
                                    createMany: {
                                        data: item.RaiseIndenetYarnItems.map((sub) => ({
                                            yarnId: sub?.yarnId ? parseInt(sub.yarnId) : undefined,
                                            colorId: sub?.colorId ? parseInt(sub.colorId) : undefined,
                                            count: sub?.count ? parseInt(sub.count) : undefined,
                                            qty: sub?.qty ? parseFloat(sub.qty) : undefined,
                                            percentage: sub?.percentage ? sub?.percentage : undefined,
                                        })),
                                    },
                                }
                                : undefined,


                        })),
                    }
                    : undefined,


            },
        });

    })

    return { statusCode: 0, data };

}







const update = async (id, body) => {
    const { docId, draftSave, finYearId, userId, branchId, partyId, orderDetails, contactPersonName, packingCoverType,
        address, phone, validDate, notes, term, orderBy, orderYarnDetails, orderSizeDetails, styleId, raiseIndentItems
    } = body;
    console.log(body, "body")

    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    let docIdNumber = await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime, false, docId, "drift");


    const dataFound = await prisma.raiseIndent.findUnique({ where: { id: parseInt(id) } });
    if (!dataFound) return { statusCode: 404, message: "No record found for order" };



    const incomingIds = raiseIndentItems?.filter(i => i.id).map(i => parseInt(i.id));

    let data;

    await prisma.$transaction(async (tx) => {
        data = await tx.raiseIndent.update({
            where: {
                id: parseInt(id),

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

                RaiseIndentItems: {
                    deleteMany: {
                        ...(incomingIds.length > 0 && {
                            id: { notIn: incomingIds }
                        })
                    },

                    update: raiseIndentItems.filter(item => item.id).map((item) => ({
                        where: { id: parseInt(item.id) },
                        data: {
                            requirementPlanningFormId: item?.requirementPlanningFormId ? parseInt(item?.requirementPlanningFormId) : undefined,
                            orderDetailsId: item?.orderDetailsId ? parseInt(item?.orderdetailsId) : undefined,

                            RaiseIndenetYarnItems: {
                                deleteMany: {},
                                createMany: {
                                    data: item?.RaiseIndenetYarnItems?.map((sub) => ({
                                        yarnId: sub?.yarnId ? parseInt(sub.yarnId) : undefined,
                                        colorId: sub?.colorId ? parseInt(sub.colorId) : undefined,
                                        count: sub?.count ? parseInt(sub.count) : undefined,
                                        qty: sub?.qty ? parseFloat(sub.qty) : undefined,
                                        percentage: sub?.percentage ? sub?.percentage : undefined,

                                    })) || [],
                                },
                            },



                        },
                    })),


                }

            },
        });


    });

    return { statusCode: 0, data };
};




async function remove(id) {
    const data = await prisma.raiseIndent.delete({
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



















