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
        let lastObject = await prisma.requirementPlanningForm.findFirst({
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
        let newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/RPL/1`
        if (lastObject) {
            newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/RPL/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
        }
        return newDocId
    }
    else {
        let lastObject = await prisma.requirementPlanningForm.findFirst({
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
        let newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/RPL/1`
        if (lastObject) {
            newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/RPL/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
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
    const { pagination, pageNumber, dataPerPage, branchId, finYearId, serachDocNo, searchOrderNo, searchDelDate, searchDocDate, partyId, searchStyleNo,

    } = req.query

    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    let newDocId = await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime);
    let data = await xprisma.RequirementPlanningForm.findMany({
        where: {
            branchId: branchId ? parseInt(branchId) : undefined,
            docId: Boolean(serachDocNo) ?
                {
                    contains: serachDocNo
                }
                : undefined,
            order: {
                docId: searchOrderNo ? { contains: searchOrderNo } : undefined,

            },
            ...(searchStyleNo
                ? {
                    OrderDetails: {
                        is: {
                            style: {
                                name: { contains: searchStyleNo }
                            }
                        }
                    }
                }
                : {})

        },
        include: {
            requirementSizeDetails: true,
            RequirementYarnDetails: {
                select: {
                    RequirementPlanningId: true,
                    colorId: true,
                    count: true,
                    id: true,
                    percentage: true,
                    yarnId: true,
                    yarnKneedleId: true,
                    Color: {
                        select: {
                            name: true,
                        }
                    }

                }
            },
            Party: {
                select:
                {
                    name: true
                },
            },
            order: {
                select: {
                    id: true,
                    docId: true,

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
        // data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)
        data = data?.map(item => {
            const allColors = item.RequirementYarnDetails
                ?.map(yarn => yarn?.Color?.name)
                .filter(Boolean)
                .join(" - "); // combine into string

            return {
                ...item,
                allColors // new field
            };
        });
    }


    return { statusCode: 0, data, totalCount, nextDocId: newDocId };
}


async function getOne(id) {
    const childRecord = await prisma.po.count({ where: { requirementId: parseInt(id) } });

    let data = await prisma.requirementPlanningForm.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {

            requirementSizeDetails: {
                select: {
                    id: true,
                    qty: true,
                    requirementPlanningFormId: true,
                    size: {
                        select: {
                            name: true
                        }
                    },
                    weight: true,
                    sizeId: true
                }
            },
            RequirementYarnDetails: {
                select: {
                    id: true,
                    RequirementPlanningId: true,
                    colorId: true,
                    percentage: true,
                    yarncategoryId: true,
                    yarnId: true,
                    count: true,
                    yarnKneedleId: true,
                    percentage: true,
                    Yarn: {
                        select: {
                            name: true
                        }
                    },
                    YarnType: {
                        select: {
                            name: true
                        }
                    },

                }
            },
        }


    })
    if (!data) return NoRecordFound("order");


    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}



export async function getOrderItemsById(id, prevProcessId, packingCategory, packingType) {


    const childRecord = 0;
    let data = await prisma.order.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            Party: {
                select: {
                    name: true
                }
            },
            orderDetails: true



        }
    })
    if (!data) return NoRecordFound("order");




    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
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
        phone, contactPersonName, address, validDate, orderId, orderSizeDetails, orderYarnDetails, styleId, jobNumber ,requirementForm } = req.body



    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    let docId = await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime, draftSave);



    let data;
    await prisma.$transaction(async (tx) => {

        data = await tx.RequirementPlanningForm.create({
            data: {
                docId,
                packingCoverType,
                partyId: partyId ? parseInt(partyId) : undefined,
                branchId: branchId ? parseInt(branchId) : undefined,
                createdById: parseInt(userId),
                contactPersonName,
                address,
                phone,
                notes,
                term,
                orderBy,
                validDate: validDate ? new Date(validDate) : undefined,
                orderId: parseInt(orderId),
                orderDetailsId: parseInt(styleId),
                jobNumber: jobNumber,

                // orderDetails: orderDetails?.length > 0
                //     ? {
                //         create: JSON.parse(orderDetails).map((item) => ({
                //             styleId: item?.styleId ? parseInt(item.styleId) : undefined,
                //             fiberContentId: item?.fiberContentId ? parseInt(item.fiberContentId) : undefined,
                //             socksMaterialId: item?.socksMaterialId ? parseInt(item.socksMaterialId) : undefined,
                //             socksTypeId: item?.socksTypeId ? parseInt(item.socksTypeId) : undefined,
                //             filePath: item?.filePath ? item?.filePath : undefined,

                requirementSizeDetails: orderSizeDetails?.length > 0
                    ? {
                        createMany: {
                            data: orderSizeDetails?.map((sub) => ({
                                sizeId: sub?.sizeId ? parseInt(sub.sizeId) : undefined,
                                // sizeMeasurement: sub?.sizeMeasurement || undefined,
                                qty: sub?.qty ? parseFloat(sub.qty) : undefined,
                                weight: sub?.weight ? parseFloat(sub.weight) : undefined,
                            })),
                        },
                    }
                    : undefined,

                RequirementYarnDetails: orderYarnDetails?.length > 0
                    ? {
                        createMany: {
                            data: orderYarnDetails.map((yarn) => ({
                                colorId: yarn?.colorId ? parseInt(yarn.colorId) : undefined,
                                percentage: yarn?.percentage ? parseFloat(yarn.percentage) : undefined,
                                yarncategoryId: yarn?.yarncategoryId ? parseInt(yarn.yarncategoryId) : undefined,
                                yarnId: yarn?.yarnId ? parseInt(yarn.yarnId) : undefined,
                                count: yarn?.count ? parseInt(yarn?.count) : undefined,
                                yarnKneedleId: yarn?.yarnKneedleId ? parseInt(yarn.yarnKneedleId) : undefined,
                                styleId: yarn?.styleId ? parseInt(yarn.styleId) : undefined
                            })),
                        },
                    }
                    : undefined,

            },
        });





    })

    return { statusCode: 0, data };

}



const update = async (id, body) => {
    const { docId, draftSave, finYearId, userId, branchId, partyId, orderDetails, contactPersonName, packingCoverType,
        address, phone, validDate, notes, term, orderBy, orderYarnDetails, orderSizeDetails, styleId, jobNumber,
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
        data = await tx.requirementPlanningForm.update({
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
                jobNumber: jobNumber,
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
    const data = await prisma.requirementPlanningForm.delete({
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



















