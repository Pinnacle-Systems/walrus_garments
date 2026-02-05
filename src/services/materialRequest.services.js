import { NoRecordFound } from '../configs/Responses.js';
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";
import { getDateFromDateTime, getYearShortCode, getYearShortCodeForFinYear } from "../utils/helper.js";
import { getTableRecordWithId } from '../utils/helperQueries.js';
import { Material } from '../routes/index.js';
import { prisma } from '../lib/prisma.js';

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
        let newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/MRF/1`
        if (lastObject) {
            newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/MRF/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
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
        let newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/MRT/1`
        if (lastObject) {
            newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/MRT/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
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
    const { pagination, pageNumber, dataPerPage, branchId, finYearId, serachDocNo, searchDate, searchOrderNo, searchClientName, partyId, materialIssue, isReport

    } = req.query



    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    let newDocId = await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime);
    let data = await xprisma.raiseIndent.findMany({
        where: {
            branchId: branchId ? parseInt(branchId) : undefined,
            docId: Boolean(serachDocNo) ?
                {
                    contains: serachDocNo
                }
                : undefined,
            Order: {
                docId: searchOrderNo ? { contains: searchOrderNo } : undefined
            },


            Party: {
                name: searchClientName ? { contains: searchClientName } : undefined,
            }


        },
        include: {
            RaiseIndentItems: {
                select: {
                    id: true,
                    raiseIndentId: true,
                    colorId: true,
                    yarnId: true,
                    requirementPlanningFormId: true,
                    requiredQty: true,
                    requirementPlanningItemsId: true,
                    styleColor: true,
                    orderDetailsId: true,
                    MaterialIssueItems: true

                }
            },
            AccessoryRaiseIndentItems: true,
            MaterialTypeList: true,
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

    if (searchDate) {
        data = data.filter(i => i?.createdAt?.includes(searchDate))
    }


    // if (pagination) {
    //     data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)
    // }
    // if (isReport == "Material Request") {
    //     // data = data?.filter(item => item.isMaterialRequset )
    // }
    // if (isReport == "All") {
    //     data = data
    // }





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
                    requirementPlanningItemsId: true,
                    RequirementPlanningItems: {
                        select: {
                            requiredQty: true
                        }
                    },
                    orderDetailsId: true,
                    yarnId: true,
                    requiredQty: true,
                    MaterialIssueItems: true,

                    Yarn: {
                        select: {
                            name: true
                        }
                    },
                    styleColor: true,
                    Color: {
                        select: {
                            name: true
                        }
                    },
                    colorId: true,
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
                            requirementPlanningId: true,
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
                    },

                }
            },
            AccessoryRaiseIndentItems: {
                select: {
                    id: true,
                    raiseIndentId: true,
                    accessoryId: true,
                    Accessory: {
                        select: {
                            aliasName: true
                        }
                    },
                    accessoryCategoryId: true,
                    AccessoryCategory: {
                        select: {
                            name: true
                        }
                    },
                    accessoryGroupId: true,
                    accessoryGroup: {
                        select: {
                            name: true
                        }
                    },
                    styleColor: true,

                    colorId: true,
                    Color: {
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
                    uomId: true,
                    Uom: {
                        select: {
                            name: true
                        }
                    },
                    requiredQty: true,
                    orderDetailsId: true,
                    accessoryRequirementPlanningId: true,
                    requirementPlanningFormId: true,
                    AccessoryRequirementPlanning: {
                        select: {
                            requiredQty: true
                        }
                    }

                }
            },
            MaterialTypeList: true,


        }

    })
    if (!data) return NoRecordFound("order");


    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getStockValidationData(data) {


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
                            orderId: true,
                            orderDetailsId: true,
                            requirementPlanningItemsId: true,
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
                            // accessoryCategoryId : true,
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
            MaterialTypeList: true,
            RaiseIndentItems: {
                select: {
                    id: true,
                    raiseIndentId: true,
                    requirementPlanningFormId: true,
                    requirementPlanningItemsId: true,
                    // uomId
                    orderDetailsId: true,
                    yarnId: true,
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
                    colorId: true,
                    requiredQty: true,
                    styleColor: true,
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
                    },

                }


            },
            AccessoryRaiseIndentItems: {
                select: {
                    id: true,
                    raiseIndentId: true,
                    accessoryId: true,
                    Accessory: {
                        select: {
                            aliasName: true,
                        }
                    },
                    accessoryCategoryId: true,
                    AccessoryCategory: {
                        select: {
                            name: true
                        }
                    },
                    accessoryGroup: {
                        select: {
                            name: true
                        }
                    },
                    accessoryGroupId: true,

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
                    styleColor: true,
                    requiredQty: true,
                    accessoryRequirementPlanningId: true,
                    orderDetailsId: true,

                }
            },
            AccessoryMaterialIssueItems: true,
            MaterialIssue: {
                select: {
                    id: true,
                    MaterialIssueItems: true
                }
            },
            materialIssueItems: true

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
        phone, contactPersonName, address, validDate, orderId, requirementId, accessoryRaiseIndentItems, materialTypeList, raiseIndentItems } = req.body


    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    let docId = await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime, draftSave);

    const formIds = raiseIndentItems?.map(item => item?.requirementPlanningItemsId ? parseInt(item?.requirementPlanningItemsId) : null).filter(Boolean);
    const accessoryFormIds = accessoryRaiseIndentItems?.map(item => item?.accessoryRequirementPlanningId ? parseInt(item?.accessoryRequirementPlanningId) : null).filter(Boolean);
    console.log(formIds, "formIds")


    let data;
    await prisma.$transaction(async (tx) => {

        data = await tx.RaiseIndent.create({
            data: {
                docId,
                // isMaterialRequset: Boolean(isMaterialRequset),
                contactPersonName: contactPersonName ?? "John",
                Party: partyId ? { connect: { id: parseInt(partyId) } } : undefined,
                Branch: branchId ? { connect: { id: parseInt(branchId) } } : undefined,
                createdBy: { connect: { id: parseInt(userId) } },
                Order: { connect: { id: parseInt(orderId) } },



                RaiseIndentItems: raiseIndentItems?.length > 0
                    ? {
                        create: raiseIndentItems?.map((item) => ({
                            requirementPlanningFormId: item?.requirementPlanningFormId ? parseInt(item?.requirementPlanningFormId) : undefined,
                            yarnId: item?.yarnId ? parseInt(item.yarnId) : undefined,
                            colorId: item?.colorId ? parseInt(item.colorId) : undefined,
                            styleColor: item?.styleColor ? item?.styleColor : undefined,
                            requiredQty: item?.requiredQty ? parseFloat(item?.requiredQty) : undefined,
                            orderDetailsId: item?.orderDetailsId ? parseInt(item?.orderDetailsId) : undefined,
                            requirementPlanningItemsId: item?.requirementPlanningItemsId ? parseInt(item?.requirementPlanningItemsId) : undefined,

                        })),
                    }
                    : undefined,
                MaterialTypeList: materialTypeList?.length > 0
                    ? {
                        create: materialTypeList?.map((item) => ({

                            name: item?.show ? item?.show : undefined,
                            value: item?.value ? item?.value : undefined,
                        })),
                    }
                    : undefined,

                AccessoryRaiseIndentItems: accessoryRaiseIndentItems?.length > 0
                    ? {
                        create: accessoryRaiseIndentItems?.map((item) => ({
                            orderDetailsId: item?.orderDetailsId ? parseInt(item?.orderDetailsId) : undefined,
                            requirementPlanningFormId: item?.requirementPlanningFormId ? parseInt(item?.requirementPlanningFormId) : undefined,
                            accessoryId: item?.accessoryId ? parseInt(item.accessoryId) : undefined,
                            accessoryCategoryId: item?.accessoryCategoryId ? parseInt(item.accessoryCategoryId) : undefined,
                            accessoryGroupId: item?.accessoryGroupId ? parseInt(item.accessoryGroupId) : undefined,

                            colorId: item?.colorId ? parseInt(item.colorId) : undefined,
                            sizeId: item?.sizeId ? parseInt(item.sizeId) : undefined,
                            uomId: item?.uomId ? parseInt(item.uomId) : undefined,

                            styleColor: item?.styleColor ? item?.styleColor : undefined,
                            requiredQty: item?.requiredQty ? parseFloat(item?.requiredQty) : undefined,
                            accessoryRequirementPlanningId: item?.accessoryRequirementPlanningId ? parseInt(item?.accessoryRequirementPlanningId) : undefined,




                        })),
                    }
                    : undefined,



            },

        });




        for (const id of formIds) {
            await tx.requirementPlanningItems.update({
                where: {
                    id: parseInt(id),
                },
                data: {
                    isMaterialRequst: true,
                },
            });
        }
        for (const id of accessoryFormIds) {
            await tx.AccessoryRequirementPlanning.update({
                where: {
                    id: parseInt(id),
                },
                data: {
                    isMaterialRequst: true,
                },
            });
        }
    })

    return { statusCode: 0, data };

}







const update = async (id, body) => {
    const { docId, draftSave, finYearId, userId, branchId, partyId, orderDetails, contactPersonName, packingCoverType,
        address, phone, validDate, notes, term, orderBy, orderYarnDetails, orderSizeDetails, accessoryRaiseIndentItems, raiseIndentItems, materialTypeList } = body;

    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    let docIdNumber = await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime, false, docId, "drift");


    const dataFound = await prisma.raiseIndent.findUnique({ where: { id: parseInt(id) } });
    if (!dataFound) return { statusCode: 404, message: "No record found for order" };



    const incomingIds = raiseIndentItems?.filter(i => i.id).map(i => parseInt(i.id));
    const incomingAccesssoryIds = accessoryRaiseIndentItems?.filter(i => i.id).map(i => parseInt(i.id));
    const incomingmaterialIssueTypeListIds = materialTypeList?.filter(i => i.id).map(i => parseInt(i.id));

    console.log(incomingIds?.length, "incomingIds", raiseIndentItems)


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
                            yarnId: item?.yarnId ? parseInt(item.yarnId) : undefined,
                            colorId: item?.colorId ? parseInt(item.colorId) : undefined,
                            styleColor: item?.styleColor ? item?.styleColor : undefined,
                            requiredQty: item?.requiredQty ? parseFloat(item?.requiredQty) : undefined,
                            orderDetailsId: item?.orderDetailsId ? parseInt(item?.orderDetailsId) : undefined,
                            requirementPlanningItemsId: item?.requirementPlanningItemsId ? parseInt(item?.requirementPlanningItemsId) : undefined,


                        },
                    })),


                },

                AccessoryRaiseIndentItems: {
                    deleteMany: {
                        ...(incomingAccesssoryIds.length > 0 && {
                            id: { notIn: incomingAccesssoryIds }
                        })
                    },

                    update: accessoryRaiseIndentItems?.filter(item => item.id).map((item) => ({
                        where: { id: parseInt(item.id) },
                        data: {
                            orderDetailsId: item?.orderDetailsId ? parseInt(item?.orderDetailsId) : undefined,
                            accessoryRequirementPlanningId: item?.accessoryRequirementPlanningId ? parseInt(item?.accessoryRequirementPlanningId) : undefined,
                            requirementPlanningFormId: item?.requirementPlanningFormId ? parseInt(item?.requirementPlanningFormId) : undefined,
                            accessoryId: item?.accessoryId ? parseInt(item.accessoryId) : undefined,
                            accessoryCategoryId: item?.accessoryCategoryId ? parseInt(item.accessoryCategoryId) : undefined,
                            accessoryGroupId: item?.accessoryGroupId ? parseInt(item.accessoryGroupId) : undefined,

                            colorId: item?.colorId ? parseInt(item.colorId) : undefined,
                            sizeId: item?.sizeId ? parseInt(item.sizeId) : undefined,
                            uomId: item?.uomId ? parseInt(item.uomId) : undefined,

                            styleColor: item?.styleColor ? item?.styleColor : undefined,
                            requiredQty: item?.requiredQty ? parseFloat(item?.requiredQty) : undefined,


                        },
                    })),


                },
                MaterialTypeList: {
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


    });





    return { statusCode: 0, data };
};






async function remove(id, body) {

    const yarnIds = body?.RaiseIndenetYarnItems?.map(item => item?.requirementPlanningItemsId ? parseInt(item?.requirementPlanningItemsId) : null)
    const accessoryIds = body?.RaiseIndenetAccessoryItems?.map(item => item?.accessoryRequirementPlanningId ? parseInt(item?.accessoryRequirementPlanningId) : null)
    console.log(body, "formIds", id)



    let data;
    await prisma.$transaction(async (tx) => {

        data = await tx.raiseIndent.delete({
            where: {
                id: parseInt(id)
            },
        })





        for (const id of yarnIds) {
            await tx.requirementPlanningItems.update({
                where: {
                    id: parseInt(id),
                },
                data: {
                    isMaterialRequst: false,
                },
            });
        }
        for (const id of accessoryIds) {
            await tx.AccessoryRequirementPlanning.update({
                where: {
                    id: parseInt(id),
                },
                data: {
                    isMaterialRequst: false,
                },
            });
        }

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



















