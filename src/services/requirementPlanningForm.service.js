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
                // draftSave: false,
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
            RequirementPlanningItems: true,
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
            OrderDetails: {
                select: {
                    style: {
                        select: {
                            name: true
                        }
                    }
                }
            },
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
            RequirementPlanningItems: {
                select: {
                    id: true,
                    requirementPlanningFormId: true,
                    colorId: true,
                    yarnId: true,
                    count: true,
                    yarnType: true,
                    processId: true,
                    isProcess: true,
                    lossPercentage: true,
                    requiredQty: true,
                    orderDetailsId: true,
                    orderId: true,
                    percentage: true,
                    wastagePercentage: true,

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

                    RequirementPlanningProcessList: true
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
                    processId: true,
                    isProcess: true,
                    lossPercentage: true,
                    wastagePercentage: true,
                    yarnType: true,
                    RequirementYarnProcessList: true,
                    Yarn: {
                        select: {
                            name: true
                        }
                    },
                    Color: {
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


export async function getRequirementItems(req) {

    const { poMaterial } = req.query
    console.log(req, "Hit")


    const childRecord = 0;
    let data = await prisma.RequirementPlanningItems.findMany({
        where: {

        },

        select: {
            id: true,
            requirementPlanningFormId: true,
            colorId: true,
            // yarncategoryId: true,
            yarnId: true,
            count: true,
            // yarnKneedleId: true,
            yarnType: true,
            processId: true,
            isProcess: true,
            lossPercentage: true,
            requiredQty: true,
            orderId : true ,
            orderDetailsId : true,
            partyId : true,
            Yarn: {
                select: {
                    name: true,
                    countsId: true,
                    hsnId: true,
                    Hsn: {
                        select: {
                            tax: true
                        }
                    }

                }
            },
            Color: {
                select: {
                    name: true
                }
            },
            yarnCounts: {
                select: {
                    name: true
                }
            },
            order: {
                select: {
                    docId: true
                }
            },
            PoItems: {
                select: {
                    id: true,
                    fabricId: true,
                    yarnId: true,
                    accessoryId: true,
                    accessoryGroupId: true,
                    accessoryItemId: true,
                    colorId: true,
                    uomId: true,
                    noOfBags: true,
                    weightPerBag: true,
                    percentage: true,
                    requiredQty: true,
                    qty: true,
                    price: true,
                    discountType: true,
                    discountValue: true,
                    sizeId: true,
                    YarnType: true,
                    yarncategoryId: true,
                    weight: true,
                    designId: true,
                    gaugeId: true,
                    loopLengthId: true,
                    gsmId: true,
                    poId: true,
                    KDia: true,
                    kDiaId: true,
                    FDia: true,
                    fDiaId: true,
                    yarnCounts: true,
                    count: true,
                    isPurchaseCancel: true,
                    RequirementPlanningItemsId: true,
                    taxPercent: true,
                    hsnId: true,
                    CancelItems: true,

                }
            },
            Po: true,
            OrderDetails: {

                select: {
                    style: {
                        select: {
                            name: true
                        }
                    },
                    orderYarnDetails: {
                        select: {
                            id: true,
                            yarncategoryId: true,
                            yarnId: true,
                            count: true,
                            yarnKneedleId: true,
                            orderdetailsId: true,
                            colorId: true,
                            Yarn: {
                                select: {
                                    name: true,
                                    hsnId: true,

                                }
                            },
                            Color: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    },

                }
            }

        },





    });

    console.log(data, "data")

    data = data
        ?.filter(item => {
            const poQty = item?.PoItems?.reduce((t, p) => t + (p.qty || 0), 0) || 0;

            let cancelQty = 0;
            let shortCloseQty = 0;

            // Loop through all PO items
            item?.PoItems?.forEach(p => {
                p?.CancelItems?.forEach(c => {
                    const qty = c?.qty || 0;
                    if (c?.cancelType == "CANCEL") {
                        cancelQty += qty;
                    } else if (c?.cancelType == "SHORTCLOSE") {
                        shortCloseQty += qty;
                    }
                });
            });

            // console.log(cancelQty, "cancelQty", poQty)
            // console.log(shortCloseQty, "shortCloseQty")
            console.log(poQty - cancelQty + shortCloseQty, item?.requiredQty)

            // return (parseFloat(poQty) - parseFloat(cancelQty) + parseFloat(shortCloseQty)) < parseFloat(item?.requiredQty || 0);
            return (parseFloat(poQty) - parseFloat(cancelQty) ) < parseFloat(item?.requiredQty || 0);

        })
        ?.map(item => {
            const yarns = item?.OrderDetails || [];


            const combinedColors = yarns?.orderYarnDetails?.map(yarn => yarn?.Color?.name)
                .filter(Boolean)
                .join("/");

            const styleName = yarns?.style?.name

            const poQty = item?.PoItems?.reduce((total, poItem) => {
                return total + (poItem.qty || 0);
            }, 0) || 0;


            let cancelQty = 0;
            let shortCloseQty = 0;

            item?.PoItems?.forEach(poItem => {
                poItem?.CancelItems?.forEach(c => {
                    const qty = c?.qty || 0;
                    if (c?.cancelType === "CANCEL") {
                        cancelQty += qty;
                    } else if (c?.cancelType === "SHORTCLOSE") {
                        shortCloseQty += qty;
                    }
                });
            });

            console.log(cancelQty, "cancelQty", poQty)
            console.log(shortCloseQty, "shortCloseQty")

            return {
                ...item,
                allColors: `${combinedColors} - ${styleName}`,
                alreadyPoqty: poQty,
                alreadyCancelQty: cancelQty,
                balanceQty: (item?.requiredQty || 0) - (poQty - cancelQty )

            };
        });
    // if (poMaterial === "GreyYarn") {
    //     data = data?.filter(i => i?.yarnType === "GreyYarn")
    // }
    // if (poMaterial === "DyedYarn") {
    //     data = data?.filter(i => i?.yarnType === "DyedYarn")

    // }
    console.log(data, "data")

    return { statusCode: 0, data, childRecord };
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
        phone, contactPersonName, address, validDate, orderId, orderSizeDetails, orderYarnDetails, styleId, jobNumber, requirementItems } = req.body



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
                RequirementPlanningItems: requirementItems?.length > 0
                    ? {
                        create: requirementItems.map((sub) => ({
                            orderId: sub?.orderId ? parseInt(sub.orderId) : undefined,
                            orderDetailsId: sub?.orderDetailsId ? parseInt(sub?.orderDetailsId) : undefined,
                            percentage: sub?.percentage ? parseFloat(sub.percentage) : undefined,
                            colorId: sub?.colorId ? parseInt(sub.colorId) : undefined,
                            yarnId: sub?.yarnId ? parseInt(sub.yarnId) : undefined,
                            count: sub?.count ? parseInt(sub.count) : undefined,
                            partyId: sub?.partyId ? parseInt(sub.partyId) : undefined,
                            requiredQty: sub?.requiredQty ? parseFloat(sub.requiredQty) : undefined,
                            isProcess: sub?.isProcess ?? undefined,
                            processId: sub?.processId ? parseInt(sub.processId) : undefined,
                            lossPercentage: sub?.lossPercentage ? parseFloat(sub.lossPercentage) : undefined,
                            wastagePercentage: sub?.wastagePercentage ? parseFloat(sub.wastagePercentage) : undefined,
                            yarnType: sub?.yarnType ? sub?.yarnType : undefined,

                            RequirementPlanningProcessList: sub?.RequirementYarnProcessList?.length
                                ? {
                                    create: sub?.RequirementYarnProcessList?.filter(item => item?.processId && item?.lossPercentage)?.map((sub) => ({
                                        processId: sub?.processId ? parseInt(sub.processId) : undefined,
                                        lossPercentage: sub?.lossPercentage ? parseFloat(sub.lossPercentage) : undefined,
                                    })),
                                }
                                : undefined,
                        })),
                    }
                    : undefined,





                RequirementYarnDetails: orderYarnDetails?.length > 0
                    ? {
                        create: orderYarnDetails.map((yarn) => ({
                            colorId: yarn?.colorId ? parseInt(yarn.colorId) : undefined,
                            percentage: yarn?.percentage ? parseFloat(yarn.percentage) : undefined,
                            yarncategoryId: yarn?.yarncategoryId ? parseInt(yarn.yarncategoryId) : undefined,
                            yarnId: yarn?.yarnId ? parseInt(yarn.yarnId) : undefined,
                            count: yarn?.count ? parseInt(yarn?.count) : undefined,
                            yarnKneedleId: yarn?.yarnKneedleId ? parseInt(yarn.yarnKneedleId) : undefined,
                            styleId: yarn?.styleId ? parseInt(yarn.styleId) : undefined,
                            isProcess: yarn?.isProcess ? yarn.isProcess : undefined,
                            processId: yarn?.processId ? parseInt(yarn.processId) : undefined,
                            lossPercentage: yarn?.lossPercentage ? parseFloat(yarn.lossPercentage) : undefined,
                            wastagePercentage: yarn?.wastagePercentage ? parseFloat(yarn.wastagePercentage) : undefined,

                            RequirementYarnProcessList: yarn?.RequirementYarnProcessList?.length > 0
                                ? {
                                    create: yarn?.RequirementYarnProcessList?.filter(item => item?.processId && item?.lossPercentage)?.map((sub) => ({
                                        processId: sub?.processId ? parseInt(sub.processId) : undefined,
                                        lossPercentage: sub?.lossPercentage ? parseFloat(sub.lossPercentage) : undefined,
                                    })),

                                }
                                : undefined,
                        })),

                    }
                    : undefined,

            },



        });

        await tx.orderDetails.update({
            where: { id: parseInt(styleId) },
            data: { isPlanning: true },
        });


        await tx.order.updateMany({
            where: {
                id: parseInt(orderId),
                orderDetails: {
                    every: { isPlanning: true },
                },
            },
            data: { isPlanning: true },
        });





    })

    return { statusCode: 0, data };

}



const update = async (id, body) => {
    const { docId, draftSave, finYearId, userId, branchId, partyId, orderDetails, contactPersonName, packingCoverType,
        address, phone, validDate, notes, term, orderBy, orderYarnDetails, orderSizeDetails, styleId, jobNumber, requirementItems,
    } = body;

    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    let docIdNumber = await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime, false, docId, "drift");


    const dataFound = await prisma.requirementPlanningForm.findUnique({ where: { id: parseInt(id) } });

    if (!dataFound) return { statusCode: 404, message: "No record found for requirementPlanningForm" };


    const incomingSizeIds = orderSizeDetails?.filter(i => i.id).map(i => parseInt(i.id));
    const incomingYarnIds = orderYarnDetails?.filter(i => i.id).map(i => parseInt(i.id));
    const incomingRequirementItems = requirementItems?.filter(i => i.id).map(i => parseInt(i.id));

    console.log(requirementItems, "requirementItems")

    console.log(incomingRequirementItems, "incomingRequirementItems")

    let data;

    await prisma.$transaction(async (tx) => {
        data = await tx.requirementPlanningForm.update({
            where: {
                id: parseInt(id),

            },
            include: {
                RequirementPlanningItems: true,
                requirementSizeDetails: true,
                RequirementYarnDetails: true,
            },
            data: {
                // docId: draftSave ? docIdNumber : dataFound?.docId,
                partyId: partyId ? parseInt(partyId) : undefined,
                packingCoverType,
                branchId: branchId ? parseInt(branchId) : undefined,
                contactPersonName,
                address,
                phone,
                validDate: validDate ? new Date(validDate) : undefined,
                updatedById: parseInt(userId), notes, term, orderBy,
                // orderDetailsId: parseInt(styleId),
                jobNumber: jobNumber,
                // RequirementYarnDetails: {

                //     deleteMany: {
                //         ...(incomingYarnIds?.length > 0 && {
                //             id: { notIn: incomingYarnIds }
                //         })
                //     },
                //     update: orderYarnDetails?.filter(item => item.id)?.map((yarn) => ({
                //         where: { id: parseInt(yarn.id) },
                //         data: {
                //             colorId: yarn?.colorId ? parseInt(yarn.colorId) : undefined,
                //             percentage: yarn?.percentage ? parseFloat(yarn.percentage) : undefined,
                //             yarncategoryId: yarn?.yarncategoryId ? parseInt(yarn.yarncategoryId) : undefined,
                //             yarnId: yarn?.yarnId ? parseInt(yarn.yarnId) : undefined,
                //             count: yarn?.count ? parseInt(yarn?.count) : undefined,
                //             // yarnKneedleId: yarn?.yarnKneedleId ? parseInt(yarn.yarnKneedleId) : undefined,
                //             styleId: yarn?.styleId ? parseInt(yarn.styleId) : undefined,
                //             isProcess: yarn?.isProcess ? yarn.isProcess : undefined,
                //             processId: yarn?.processId ? parseInt(yarn.processId) : undefined,
                //             lossPercentage: yarn?.lossPercentage ? parseFloat(yarn.lossPercentage) : undefined,
                //             wastagePercentage: yarn?.wastagePercentage ? parseFloat(yarn.wastagePercentage) : undefined,
                //             yarnType: yarn?.yarnType ? yarn.yarnType : undefined,

                //         },
                //     })),

                // },
                // RequirementPlanningItems: {
                //     deleteMany: {
                //         ...(incomingRequirementItems?.length > 0 && {
                //             id: { notIn: incomingRequirementItems }
                //         })
                //     },
                //     update: requirementItems?.filter(item => item.id)?.map((yarn) => ({
                //         where: { id: parseInt(yarn.id) },
                //         data: {
                //             colorId: yarn?.colorId ? parseInt(yarn.colorId) : undefined,
                //             percentage: yarn?.percentage ? parseFloat(yarn.percentage) : undefined,
                //             yarncategoryId: yarn?.yarncategoryId ? parseInt(yarn.yarncategoryId) : undefined,
                //             yarnId: yarn?.yarnId ? parseInt(yarn.yarnId) : undefined,
                //             count: yarn?.count ? parseInt(yarn?.count) : undefined,
                //             // yarnKneedleId: yarn?.yarnKneedleId ? parseInt(yarn.yarnKneedleId) : undefined,
                //             styleId: yarn?.styleId ? parseInt(yarn.styleId) : undefined,
                //             isProcess: yarn?.isProcess ? yarn.isProcess : undefined,
                //             processId: yarn?.processId ? parseInt(yarn.processId) : undefined,
                //             lossPercentage: yarn?.lossPercentage ? parseFloat(yarn.lossPercentage) : undefined,
                //             wastagePercentage: yarn?.wastagePercentage ? parseFloat(yarn.wastagePercentage) : undefined,
                //             yarnType: yarn?.yarnType ? yarn.yarnType : undefined,

                //         },
                //     })),

                // },


                RequirementYarnDetails: {
                    deleteMany: {},
                    create: orderYarnDetails?.map((sub) => ({
                        orderId: sub?.orderId ? parseInt(sub.orderId) : undefined,
                        orderDetailsId: sub?.orderDetailsId ? parseInt(sub?.orderDetailsId) : undefined,
                        percentage: sub?.percentage ? parseFloat(sub.percentage) : undefined,
                        colorId: sub?.colorId ? parseInt(sub.colorId) : undefined,
                        yarnId: sub?.yarnId ? parseInt(sub.yarnId) : undefined,
                        count: sub?.count ? parseInt(sub.count) : undefined,
                        partyId: sub?.partyId ? parseInt(sub.partyId) : undefined,
                        // requiredQty: sub?.requiredQty ? parseFloat(sub.requiredQty) : undefined,
                        isProcess: sub?.isProcess ?? undefined,
                        processId: sub?.processId ? parseInt(sub.processId) : undefined,
                        lossPercentage: sub?.lossPercentage ? parseFloat(sub.lossPercentage) : undefined,
                        wastagePercentage: sub?.wastagePercentage ? parseFloat(sub.wastagePercentage) : undefined,
                        yarnType: sub?.yarnType ? sub?.yarnType : undefined,
                        RequirementYarnProcessList: sub?.RequirementYarnProcessList?.length > 0
                            ? {
                                create: sub?.RequirementYarnProcessList?.filter(item => item?.processId && item?.lossPercentage)?.map((sub) => ({
                                    processId: sub?.processId ? parseInt(sub.processId) : undefined,
                                    lossPercentage: sub?.lossPercentage ? parseFloat(sub.lossPercentage) : undefined,
                                })),

                            }
                            : undefined,

                    })),
                },

                RequirementPlanningItems: {
                    deleteMany: {},
                    create: requirementItems?.map((yarn) => ({
                        orderId: yarn?.orderId ? parseInt(yarn.orderId) : undefined,
                        orderDetailsId: yarn?.orderDetailsId ? parseInt(yarn?.orderDetailsId) : undefined,
                        colorId: yarn?.colorId ? parseInt(yarn.colorId) : undefined,
                        percentage: yarn?.percentage ? parseFloat(yarn.percentage) : undefined,
                        yarncategoryId: yarn?.yarncategoryId ? parseInt(yarn.yarncategoryId) : undefined,
                        yarnId: yarn?.yarnId ? parseInt(yarn.yarnId) : undefined,
                        count: yarn?.count ? parseInt(yarn?.count) : undefined,
                        requiredQty: yarn?.requiredQty ? parseFloat(yarn.requiredQty) : undefined,
                        styleId: yarn?.styleId ? parseInt(yarn.styleId) : undefined,
                        isProcess: yarn?.isProcess ? yarn.isProcess : undefined,
                        processId: yarn?.processId ? parseInt(yarn.processId) : undefined,
                        lossPercentage: yarn?.lossPercentage ? parseFloat(yarn.lossPercentage) : undefined,
                        wastagePercentage: yarn?.wastagePercentage ? parseFloat(yarn.wastagePercentage) : undefined,
                        yarnType: yarn?.yarnType ? yarn?.yarnType : undefined,

                        RequirementPlanningProcessList: yarn?.RequirementYarnProcessList?.length
                            ? {
                                create: yarn?.RequirementYarnProcessList?.filter(item => item?.processId && item?.lossPercentage)?.map((sub) => ({
                                    processId: sub?.processId ? parseInt(sub.processId) : undefined,
                                    lossPercentage: sub?.lossPercentage ? parseFloat(sub.lossPercentage) : undefined,
                                })),
                            }
                            : undefined,
                    })),

                },
                requirementSizeDetails: {
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
                                sizeMeasurement: sub?.sizeMeasurement || undefined,
                                qty: sub?.qty ? parseFloat(sub.qty) : undefined,
                                weight: sub?.weight ? parseFloat(sub.weight) : undefined,
                            },
                        })),

                }


            },
        });


    });

    return { statusCode: 0, data };
};


async function remove(id) {
    let data;
    await prisma.$transaction(async (tx) => {

        data = await prisma.requirementPlanningForm.delete({
            where: {
                id: parseInt(id)
            },
        })
        await tx.orderDetails.update({
            where: { id: parseInt(data?.orderDetailsId) },
            data: { isPlanning: false },
        });


        await tx.order.updateMany({
            where: {
                id: parseInt(data?.orderId),
                orderDetails: {
                    every: { isPlanning: false },
                },
            },
            data: { isPlanning: false },
        });
    })
    console.log(data, "data")

    return { statusCode: 0, data };
}

export {
    get,
    getOne,
    create,
    update,
    remove
}



















