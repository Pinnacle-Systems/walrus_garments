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
        let lastObject = await prisma.order.findFirst({
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
        let newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/ORD/1`
        if (lastObject) {
            newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/ORD/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
        }
        return newDocId
    }
    else {
        let lastObject = await prisma.order.findFirst({
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
        let newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/ORD/1`
        if (lastObject) {
            newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/ORD/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
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
    const { pagination, pageNumber, dataPerPage, branchId, finYearId, serachDocNo, searchClientName, searchDate, partyId,

    } = req.query

    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    // let newDocId = await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime);
    let data = await xprisma.order.findMany({
        where: {
            branchId: branchId ? parseInt(branchId) : undefined,
            docId: Boolean(serachDocNo) ?
                {
                    contains: serachDocNo
                }
                : undefined,

            partyId: partyId ? parseInt(partyId) : undefined,
            Party:
            {
                name: searchClientName ? { contains: searchClientName } : undefined
            }
        },
        orderBy: {
            id: "desc",
        },
        include: {
            Party: {
                select: {
                    id: true,
                    name: true,

                }
            },
            orderDetails: {
                select: {
                    fiberContentId: true,
                    id: true,
                    orderId: true,
                    socksMaterialId: true,
                    filePath: true,
                    styleId: true,
                    orderSizeDetails: true,
                    orderYarnDetails: true,
                    isPlanning: true,
                    LegColor: {
                        select: {
                            name: true
                        }
                    }

                }
            },
            _count: {
                select: {
                    RequirementPlanningForm: true
                }
            }
        },


    });

    let totalCount = data?.length;

    if (searchDate) {
        data = data?.filter(item => String(getDateFromDateTime(item.createdAt)).includes(searchDate))
    }




    return {
        statusCode: 0,
        data: data = data.map(order => ({
            ...order,
            childRecord: order?._count.RequirementPlanningForm > 0
        })),
        totalCount
    };
}


async function getOne(id) {
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

            orderDetails: {
                select: {
                    fiberContentId: true,
                    id: true,
                    orderId: true,
                    socksMaterialId: true,
                    styleId: true,
                    socksTypeId: true,
                    filePath: true,
                    sizeId: true,
                    isPlanning: true,
                    legColorId: true,
                    footColorId: true,
                    stripesColorId: true,
                    nameAndLogo : true,
                    orderSizeDetails: true,
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
                                    name: true
                                }
                            },
                            Color: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    },
                    OrderAccessoryDetails: {
                        select: {
                            id: true,
                            accessoryId: true,
                            colorId: true,
                            sizeId: true,
                            uomId: true,
                            accessoryCategoryId: true,
                            accessoryGroupId: true,
                            accessoryTemplateId: true,
                            active: true,
                            qty: true,
                            Accessory: {
                                select: {
                                    aliasName: true,
                                }
                            },
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
                            Color: {
                                select: {
                                    name: true,
                                }
                            },
                            Size: {
                                select: {
                                    name: true,
                                }
                            },
                            Uom: {
                                select: {
                                    name: true,
                                }
                            },

                        }
                    },


                    style: {
                        select: {
                            name: true
                        }
                    }
                }
            },
            RequirementPlanningForm: {

                select: {
                    id: true,
                    isMaterialIssue: true,
                    isMaterialRequst: true,

                    OrderDetails: {
                        select: {
                            style: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    },

                    requirementSizeDetails: true,
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
                            Color: {
                                select: {
                                    name: true
                                }
                            }

                        }
                    }, id: true,
                    docId: true,
                    orderDetailsId: true,
                    orderId: true
                }
            },
            Stock: true,
            Po: {
                select: {

                    id: true,
                    supplier: true,
                    transType: true,
                    dueDate: true,
                    supplierId: true,
                    docId: true,
                    orderId: true,
                    PurchaseType: true,
                    order: true,

                    PoItems: {
                        select: {
                            accessoryGroupId: true,
                            accessoryId: true,
                            accessoryItemId: true,
                            colorId: true,
                            id: true,
                            poId: true,
                            price: true,
                            qty: true,
                            uomId: true,
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
                            }
                        }
                    },

                }

            },


        }

    })
    if (!data) return NoRecordFound("order");


    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

export async function getOneNew(id) {

    const childRecord = 0;
    let data = await prisma.order.findUnique({
        where: {
            id: parseInt(id),
            // isPlanning: false,

        },
        include: {
            Party: {
                select: {
                    name: true
                }
            },

            orderDetails: {
                where: {
                    isPlanning: false
                },
                select: {
                    fiberContentId: true,
                    id: true,
                    orderId: true,
                    socksMaterialId: true,
                    styleId: true,
                    socksTypeId: true,
                    filePath: true,
                    sizeId: true,
                    isPlanning: true,
                    legColorId: true,
                    footColorId: true,
                    stripesColorId: true,
                    nameAndLogo : true,
                    orderSizeDetails: true,
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
                                    name: true
                                }
                            },
                            Color: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    },

                    style: {
                        select: {
                            name: true
                        }
                    }
                }
            },
            RequirementPlanningForm: {

                select: {
                    id: true,
                    isMaterialIssue: true,
                    isMaterialRequst: true,

                    OrderDetails: {
                        select: {
                            style: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    },

                    requirementSizeDetails: true,
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
                            Color: {
                                select: {
                                    name: true
                                }
                            }

                        }
                    }, id: true,
                    docId: true,
                    orderDetailsId: true,
                    orderId: true
                }
            },
            Stock: true,
            Po: {
                select: {

                    id: true,
                    supplier: true,
                    transType: true,
                    dueDate: true,
                    supplierId: true,
                    docId: true,
                    orderId: true,
                    PurchaseType: true,
                    order: true,

                    PoItems: {
                        select: {
                            accessoryGroupId: true,
                            accessoryId: true,
                            accessoryItemId: true,
                            colorId: true,
                            id: true,
                            poId: true,
                            price: true,
                            qty: true,
                            uomId: true,
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
                            }
                        }
                    },

                }

            },


        }

    })
    if (!data) return NoRecordFound("order");


    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

export async function getOrderItems(req) {


    const childRecord = 0;
    const data = await prisma.orderItems.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
        }
    });
    if (!data) return NoRecordFound("order");




    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

export async function getOrderItemsById(id, prevProcessId, packingCategory, packingType) {


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
                    uomId: true,
                    Uom: {
                        select: {
                            name: true
                        }
                    },
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
                            name: true,
                            YarnOnYarnBlend: {
                                select: {
                                    id: true,
                                    yarnBlendId: true,
                                    percentage: true,

                                }
                            }
                        }
                    },
                    YarnType: {
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
            },
            OrderAccessoryDetails: {
                select: {
                    id: true,
                    accessoryId: true,
                    accessoryCategoryId: true,
                    accessoryGroupId: true,
                    colorId: true,
                    sizeId: true,
                    active: true,
                    uomId: true,
                    orderdetailsId: true,
                    qty: true,
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
                }
            },
            Order: {
                select: {
                    poNumber: true,
                }
            }
        }
    })


    const GeneralYarnStock = await prisma.$queryRawUnsafe(`
SELECT 
  yarnId,
  COALESCE(colorId, 0) AS colorId,
  SUM(qty) AS qty
FROM stock
WHERE inorout = 'GeneralInward'
GROUP BY yarnId, colorId

`);
    const GeneralAccessoryStock = await prisma.$queryRawUnsafe(`
SELECT 
  accessoryId,
  accessoryGroupId,
  accessoryCategoryId,
  COALESCE(colorId, 0) AS colorId,
  sizeId,
  SUM(qty) AS qty
FROM AccessoryStock
WHERE inorout = 'GeneralInward'
GROUP BY accessoryId, accessoryGroupId,accessoryCategoryId,colorId,sizeId`);

    const YarnStock = GeneralYarnStock || [];
    const AccessoryStock = GeneralAccessoryStock || [];

    console.log("data", data)

    const updatedData = {
        ...data,
        yarnStock: YarnStock,
        accessoryStock: AccessoryStock,
    };

    if (!data) return NoRecordFound("order");




    return { statusCode: 0, data: { ...updatedData, ...{ childRecord } } };
}


// export async function getStockvalidationById(id) {


//     const childRecord = 0;
//     let data = await prisma.order.findUnique({
//         where: {
//             id: parseInt(id)
//         },
//         include: {
//             Party: {
//                 select: {
//                     name: true
//                 }
//             },
//             orderDetails: {
//                 select: {
//                     fiberContentId: true,
//                     id: true,
//                     orderId: true,
//                     socksMaterialId: true,
//                     styleId: true,
//                     socksTypeId: true,
//                     filePath: true,
//                     sizeId: true,
//                     baseColorId: true,
//                     Color: {
//                         select: {
//                             name: true
//                         }
//                     },
//                     orderSizeDetails: true,
//                     orderYarnDetails: {
//                         select: {
//                             id: true,
//                             yarncategoryId: true,
//                             yarnId: true,
//                             count: true,
//                             yarnKneedleId: true,
//                             orderdetailsId: true,
//                             colorId: true,
//                             Yarn: {
//                                 select: {
//                                     name: true
//                                 }
//                             },
//                             Color: {
//                                 select: {
//                                     name: true
//                                 }
//                             }
//                         }
//                     },

//                     style: {
//                         select: {
//                             name: true
//                         }
//                     }
//                 }
//             },
//             RequirementPlanningForm: {

//                 select: {
//                     id: true,
//                     isMaterialIssue: true,
//                     isMaterialRequst: true,

//                     OrderDetails: {
//                         select: {
//                             style: {
//                                 select: {
//                                     name: true
//                                 }
//                             }
//                         }
//                     },

//                     requirementSizeDetails: true,
//                     RequirementYarnDetails: {
//                         select: {
//                             id: true,
//                             RequirementPlanningId: true,

//                             colorId: true,
//                             percentage: true,
//                             yarncategoryId: true,
//                             yarnId: true,
//                             count: true,
//                             yarnKneedleId: true,
//                             percentage: true,
//                             Yarn: {
//                                 select: {
//                                     name: true
//                                 }
//                             },
//                             YarnType: {
//                                 select: {
//                                     name: true
//                                 }
//                             },
//                             Color: {
//                                 select: {
//                                     name: true
//                                 }
//                             }

//                         }
//                     }, id: true,
//                     docId: true,
//                     orderDetailsId: true,
//                     orderId: true
//                 }
//             },
//             Stock: true
//         }

//     })


//     if (!data) return NoRecordFound("raiseIndent");




//     return {
//         statusCode: 0,
//         data: {
//             ...data,
//             RaiseIndentItems: enrichedItems,
//             childRecord
//         }
//     };
// }

export async function getStockvalidationById(id) {
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
            orderDetails: {
                select: {
                    fiberContentId: true,
                    id: true,
                    orderId: true,
                    socksMaterialId: true,
                    styleId: true,
                    socksTypeId: true,
                    filePath: true,
                    sizeId: true,
                    baseColorId: true,
                    Color: {
                        select: {
                            name: true
                        }
                    },
                    orderSizeDetails: true,
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
                                    name: true
                                }
                            },
                            Color: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    },

                    style: {
                        select: {
                            name: true
                        }
                    }
                }
            },
            RequirementPlanningForm: {

                select: {
                    id: true,
                    isMaterialIssue: true,
                    isMaterialRequst: true,

                    OrderDetails: {
                        select: {
                            style: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    },
                    RequirementPlanningItems: {
                        select: {
                            id: true,
                            requirementPlanningFormId: true,
                            orderId: true,
                            orderDetailsId: true,
                            percentage: true,
                            colorId: true,
                            yarnId: true,
                            count: true,
                            poType: true,
                            transType: true,
                            partyId: true,
                            requiredQty: true,
                            tranferQty: true,
                            isMaterialRequst: true,
                            yarnType: true,
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
                            Po: true,
                            PoItems: true,
                            OrderDetails: {
                                select: {
                                    style: {
                                        select: {
                                            name: true
                                        }
                                    }
                                }
                            },
                            materialIssueItems: true


                        }
                    },
                    AccessoryRequirementPlanning: {

                        select: {
                            id: true,
                            requiredQty: true,
                            AccessoryPoItems: true,
                            Accessory: {
                                select: {
                                    aliasName: true,

                                }
                            },
                            Color: {
                                select: {
                                    name: true
                                }
                            },
                            Size: {
                                select: {
                                    name: true
                                }
                            },
                            Uom: {
                                select: {
                                    name: true
                                }
                            },
                            AccessoryMaterialIssueItems: true,
                            RequirementPlanningForm: true,
                            AccessoryPoItems: true,
                            order: {
                                select: {
                                    docId: true,
                                    orderDetails: {
                                        select: {
                                            style: {
                                                select: {
                                                    name: true
                                                }
                                            },


                                        }
                                    }
                                }

                            },
                            orderId: true,
                            orderDetailsId: true,
                            accessoryId: true,
                            colorId: true,
                            sizeId: true,
                            uomId: true,
                            accessoryCategoryId: true,
                            accessoryGroupId: true,
                            isMaterialRequst: true,
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
                    requirementSizeDetails: true,
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
                            Color: {
                                select: {
                                    name: true
                                }
                            }

                        }
                    }, id: true,
                    docId: true,
                    orderDetailsId: true,
                    orderId: true
                }
            },
            Stock: {
                // where: {
                //     inOrOut: "StockTransfer",
                // },
                select: {
                    id: true,
                    itemType: true,
                    inOrOut: true,
                    yarnId: true,
                    colorId: true,
                    uomId: true,
                    qty: true,
                    price: true,
                    storeId: true,
                    branchId: true,
                    active: true,
                    orderId: true,
                    orderDetailsId: true,
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
            },
            Po: {
                select: {

                    id: true,
                    supplier: true,
                    transType: true,
                    dueDate: true,
                    supplierId: true,
                    docId: true,
                    orderId: true,
                    PurchaseType: true,
                    order: true,

                    PoItems: {
                        select: {
                            accessoryGroupId: true,
                            accessoryId: true,
                            accessoryItemId: true,
                            colorId: true,
                            id: true,
                            poId: true,
                            price: true,
                            qty: true,
                            uomId: true,
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
                            }
                        }
                    },

                }

            },
            PoItems: {
                select: {
                    accessoryGroupId: true,
                    accessoryId: true,
                    accessoryItemId: true,
                    colorId: true,
                    id: true,
                    poId: true,
                    price: true,
                    qty: true,
                    uomId: true,
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
                    }
                }
            },
            RaiseIndent: {
                select: {
                    id: true,
                    docId: true,
                    branchId: true,
                    partyId: true,
                    orderId: true,
                    isMaterialIssue: true,
                    isMaterialRequset: true,
                    RaiseIndentItems: {
                        select: {
                            RaiseIndenetYarnItems: true,
                            id: true,
                            raiseIndentId: true,
                            requirementPlanningFormId: true,
                            orderDetailsId: true,
                            requirementPlanningItemsId: true
                        }
                    },

                }
            },
            MaterialIssueItems: true,
            AccessoryMaterialIssueItems: true



        }

    })


    if (!data) return NoRecordFound("order");
    const poSummary = data?.Po?.reduce((acc, po) => {
        po?.PoItems?.forEach(item => {
            const existing = acc.find(
                x =>
                    x.orderId === po.orderId &&
                    x.yarnId === item.yarnId &&
                    x.colorId === item.colorId
            );

            if (existing) {
                existing.qty += item.qty;
            } else {
                acc.push({
                    orderId: po.orderId,
                    yarnId: item.yarnId,
                    colorId: item.colorId,
                    yarnName: item.Yarn?.name || "",
                    colorName: item.Color?.name || "",
                    qty: item.qty
                });
            }
        });

        return acc;
    }, []);



    return {
        statusCode: 0, data: {
            ...data,
            childRecord,
            poSummary
        }
    };
}

export async function getOrderItemsByIdNew(id, stockValidation) {

    const childRecord = 0;
    let data = await prisma.order.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            RequirementPlanningForm: {

                select: {
                    id: true,
                    isMaterialIssue: true,
                    isMaterialRequst: true,

                    OrderDetails: {
                        select: {
                            style: {
                                select: {
                                    name: true
                                }
                            },
                            orderYarnDetails: {
                                select: {
                                    Color: {
                                        select: {
                                            name: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    order: {
                        select: {
                            partyId: true,


                        }
                    },
                    requirementSizeDetails: true,
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
                            Color: {
                                select: {
                                    name: true
                                }
                            }

                        }
                    },
                    RequirementPlanningItems: {
                        select: {
                            id: true,
                            requirementPlanningFormId: true,
                            orderId: true,
                            orderDetailsId: true,
                            percentage: true,
                            colorId: true,
                            yarnId: true,
                            count: true,
                            requiredQty: true,
                            poType: true,
                            partyId: true,
                            isMaterialRequst: true,
                            Party: {
                                select: {
                                    name: true
                                }
                            },
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
                            // Counts: {
                            //     select: {
                            //         name: true
                            //     }
                            // },
                            OrderDetails: {
                                select: {
                                    style: {
                                        select: {
                                            name: true
                                        }
                                    }
                                }
                            },
                            order: {
                                select: {
                                    docId: true,
                                }
                            },
                            materialIssueItems: true
                        }
                    },
                    AccessoryRequirementPlanning: {
                        select: {
                            id: true,
                            RequirementPlanningId: true,
                            accessoryId: true,
                            accessoryCategoryId: true,
                            accessoryGroupId: true,
                            requiredQty: true,
                            colorId: true,
                            sizeId: true,
                            uomId: true,
                            orderId: true,
                            isMaterialRequst: true,
                            orderDetailsId: true,
                            poQty: true,
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
                            Size: {
                                select: {
                                    name: true
                                }
                            },
                            Uom: {
                                select: {
                                    name: true
                                }
                            }

                        }
                    },
                    id: true,
                    docId: true,
                    orderDetailsId: true,
                }
            },

            Stock: {

                select: {
                    id: true,
                    itemType: true,
                    inOrOut: true,
                    yarnId: true,
                    colorId: true,
                    uomId: true,
                    qty: true,
                    price: true,
                    storeId: true,
                    branchId: true,
                    active: true,
                    orderId: true,
                }
            },
            Po: {
                select: {

                    id: true,
                    supplier: true,
                    transType: true,
                    dueDate: true,
                    supplierId: true,
                    docId: true,
                    orderId: true,
                    PurchaseType: true,
                    order: true,

                    PoItems: {
                        select: {
                            accessoryGroupId: true,
                            accessoryId: true,
                            accessoryItemId: true,
                            colorId: true,
                            id: true,
                            poId: true,
                            price: true,
                            qty: true,
                            uomId: true,
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
                            }
                        }
                    },

                }

            },
            RaiseIndent: {
                select: {
                    id: true,
                    docId: true,
                    branchId: true,
                    partyId: true,
                    orderId: true,
                    isMaterialIssue: true,
                    isMaterialRequset: true,
                    RaiseIndentItems: {
                        select: {
                            RaiseIndenetYarnItems: {
                                select: {
                                    id: true,
                                    raiseIndentItemsId: true,
                                    yarnId: true,
                                    yarnNeedleId: true,
                                    colorId: true,
                                    qty: true,
                                    issueQty: true,
                                    percentage: true,
                                    Yarn: {
                                        select: {
                                            aliasName: true,
                                            name: true
                                        }
                                    },
                                    Color: {
                                        select: {
                                            name: true
                                        }
                                    }

                                }
                            },
                            id: true,
                            raiseIndentId: true,
                            requirementPlanningFormId: true,
                            orderDetailsId: true
                        }
                    },

                }
            },
            MaterialIssueItems: true

        }


    })
    if (!data) return NoRecordFound("order");


    data = {
        ...data,
        RequirementPlanningForm: data?.RequirementPlanningForm?.filter(
            (item) => !item.isMaterialRequst
        ) || [],
    };

    if (stockValidation) {
        let stockData = await prisma.stock.findMany({
            where: {
                orderId: parseInt(id)
            },
        })

        // let stockQty = parseFloat((await getStockQty(storeId, poType, data?.accessoryId, data?.colorId, data?.uomId, data?.designId, data?.gaugeId, data?.loopLengthId, data?.gsmId, data?.sizeId, data?.fabricId, data?.kDiaId, data?.fDiaId, data?.yarnId))?.stockQty || 0)

        console.log(stockData, "stockData")
    }




    return {
        statusCode: 0, data: { ...data, ...{ childRecord } }
    };
}


async function create(req) {

    const { userId, branchId, partyId, finYearId, packingCoverType, notes, term, orderBy, draftSave, filePath,
        phone, contactPersonName, address, validDate, orderDetails, accessoryTemplateItems, poNumber } = await req.body

    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    let docId = await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime, draftSave);

    console.log(accessoryTemplateItems?.length, "parsedAccessoryTemplateItems");

    let parsedAccessoryTemplateItems = JSON.parse(accessoryTemplateItems ? accessoryTemplateItems : "[]");



    let data;
    await prisma.$transaction(async (tx) => {

        data = await tx.order.create({
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
                draftSave: Boolean(draftSave),
                poNumber: poNumber ? poNumber : undefined,
                orderDetails: orderDetails?.length > 0
                    ? {
                        create: JSON.parse(orderDetails).map((item) => ({
                            styleId: item?.styleId ? parseInt(item.styleId) : undefined,
                            fiberContentId: item?.fiberContentId ? parseInt(item.fiberContentId) : undefined,
                            socksMaterialId: item?.socksMaterialId ? parseInt(item.socksMaterialId) : undefined,
                            socksTypeId: item?.socksTypeId ? parseInt(item.socksTypeId) : undefined,
                            filePath: item?.filePath ? item?.filePath : undefined,
                            accessoryTemplateId: item?.templateId ? parseInt(item?.templateId) : undefined,
                            legColorId: item?.legColorId ? parseInt(item?.legColorId) : undefined,
                            footColorId: item?.footColorId ? parseInt(item?.footColorId) : undefined,
                            stripesColorId: item?.stripesColorId ? parseInt(item?.stripesColorId) : undefined,
                            nameAndLogo: item?.nameAndLogo ? item?.nameAndLogo : undefined,

                            orderSizeDetails: item?.orderSizeDetails?.length > 0
                                ? {
                                    createMany: {
                                        data: item.orderSizeDetails.map((sub) => ({
                                            sizeId: sub?.sizeId ? parseInt(sub.sizeId) : undefined,
                                            sizeMeasurement: sub?.sizeMeasurement || undefined,
                                            qty: sub?.qty ? parseFloat(sub.qty) : undefined,
                                            weight: sub?.weight ? parseFloat(sub.weight) : undefined,
                                            uomId: sub?.uomId ? parseFloat(sub.uomId) : undefined,
                                        })),
                                    },
                                }
                                : undefined,

                            orderYarnDetails: item?.orderYarnDetails?.length > 0
                                ? {
                                    createMany: {
                                        data: item.orderYarnDetails.map((yarn) => ({
                                            colorId: yarn?.colorId ? parseInt(yarn.colorId) : undefined,
                                            yarncategoryId: yarn?.yarncategoryId ? parseInt(yarn.yarncategoryId) : undefined,
                                            yarnId: yarn?.yarnId ? parseInt(yarn.yarnId) : undefined,
                                            count: yarn?.count ? parseInt(yarn?.count) : undefined,
                                            yarnKneedleId: yarn?.yarnKneedleId ? parseInt(yarn.yarnKneedleId) : undefined,
                                        })),
                                    },
                                }
                                : undefined,
                            OrderAccessoryDetails: item?.OrderAccessoryDetails?.length > 0 ?

                                {
                                    create: item?.OrderAccessoryDetails?.map((sub) => ({
                                        accessoryId: sub?.accessoryId ? parseInt(sub.accessoryId) : undefined,
                                        accessoryCategoryId: sub?.accessoryCategoryId ? parseInt(sub.accessoryCategoryId) : undefined,
                                        accessoryGroupId: sub?.accessoryGroupId ? parseInt(sub.accessoryGroupId) : undefined,
                                        colorId: sub?.colorId ? parseInt(sub.colorId) : undefined,
                                        sizeId: sub?.sizeId ? parseInt(sub.sizeId) : undefined,
                                        uomId: sub?.uomId ? parseInt(sub.uomId) : undefined,
                                        qty: sub?.qty ? parseFloat(sub.qty) : undefined,

                                    })),
                                } : undefined,

                        })),
                    }
                    : undefined,

            },
        });










    })

    return { statusCode: 0, data };

}



const update = async (id, body) => {

    const { docId, draftSave, finYearId, userId, branchId, partyId, orderDetails, contactPersonName, packingCoverType, address, phone, validDate, notes, term, orderBy, accessoryTemplateItems, poNumber
    } = body;

    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    let docIdNumber = await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime, false, docId, "drift");

    const dataFound = await prisma.order.findUnique({ where: { id: parseInt(id) } });
    if (!dataFound) return { statusCode: 404, message: "No record found for order" };


    const parsedOrderDetails = JSON.parse(orderDetails || "[]");
    const parsedAccessoryDetails = JSON.parse(orderDetails || "[]");


    const incomingIds = parsedOrderDetails?.filter(i => i.id).map(i => parseInt(i.id));

    let data;
    await prisma.$transaction(async (tx) => {
        data = await tx.order.update({
            where: {
                id: parseInt(id),

            },
            include: {
                orderDetails: true,
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
                poNumber: poNumber ? poNumber : undefined,





                orderDetails: {
                    deleteMany: {
                        ...(incomingIds.length > 0 && {
                            id: { notIn: incomingIds }
                        })
                    },

                    update: parsedOrderDetails
                        .filter(item => item.id)
                        .map((item) => ({
                            where: { id: parseInt(item.id) },
                            data: {
                                styleId: item?.styleId ? parseInt(item.styleId) : undefined,
                                fiberContentId: item?.fiberContentId ? parseInt(item.fiberContentId) : undefined,
                                socksMaterialId: item?.socksMaterialId ? parseInt(item.socksMaterialId) : undefined,
                                socksTypeId: item?.socksTypeId ? parseInt(item.socksTypeId) : undefined,
                                filePath: item?.filePath ? item?.filePath : undefined,
                                baseColorId: item?.baseColorId ? parseInt(item?.baseColorId) : undefined,
                                accessoryTemplateId: item?.templateId ? parseInt(item?.templateId) : undefined,
                                legColorId: item?.legColorId ? parseInt(item?.legColorId) : undefined,
                                footColorId: item?.footColorId ? parseInt(item?.footColorId) : undefined,
                                stripesColorId: item?.stripesColorId ? parseInt(item?.stripesColorId) : undefined,
                                nameAndLogo: item?.nameAndLogo ? item?.nameAndLogo : undefined,

                                orderSizeDetails: {
                                    deleteMany: {},
                                    createMany: {
                                        data: item?.orderSizeDetails?.map((sub) => ({
                                            sizeId: sub?.sizeId ? parseInt(sub.sizeId) : undefined,
                                            sizeMeasurement: sub?.sizeMeasurement || undefined,
                                            qty: sub?.qty ? parseFloat(sub.qty) : undefined,
                                            weight: sub?.weight ? parseFloat(sub.weight) : undefined,

                                        })) || [],
                                    },
                                },

                                orderYarnDetails: {
                                    deleteMany: {},
                                    createMany: {
                                        data: item?.orderYarnDetails?.map((yarn) => ({
                                            colorId: yarn?.colorId ? parseInt(yarn.colorId) : undefined,
                                            yarncategoryId: yarn?.yarncategoryId ? parseInt(yarn.yarncategoryId) : undefined,
                                            yarnId: yarn?.yarnId ? parseInt(yarn.yarnId) : undefined,
                                            count: yarn?.count ? parseInt(yarn?.count) : undefined,
                                            yarnKneedleId: yarn?.yarnKneedleId ? parseInt(yarn.yarnKneedleId) : undefined,
                                        })) || [],
                                    },
                                },
                                OrderAccessoryDetails: {
                                    deleteMany: {},
                                    createMany: {
                                        data: item?.OrderAccessoryDetails?.map((sub) => ({
                                            accessoryId: sub?.accessoryId ? parseInt(sub.accessoryId) : undefined,
                                            accessoryCategoryId: sub?.accessoryCategoryId ? parseInt(sub.accessoryCategoryId) : undefined,
                                            accessoryGroupId: sub?.accessoryGroupId ? parseInt(sub.accessoryGroupId) : undefined,
                                            colorId: sub?.colorId ? parseInt(sub.colorId) : undefined,
                                            sizeId: sub?.sizeId ? parseInt(sub.sizeId) : undefined,
                                            uomId: sub?.uomId ? parseInt(sub.uomId) : undefined,
                                            qty: sub?.qty ? parseFloat(sub.qty) : undefined,
                                        })) || [],
                                    },
                                },
                            },
                        })),

                    create: parsedOrderDetails
                        .filter(item => !item.id)
                        .map((item) => ({
                            styleId: item?.styleId ? parseInt(item.styleId) : undefined,
                            fiberContentId: item?.fiberContentId ? parseInt(item.fiberContentId) : undefined,
                            socksMaterialId: item?.socksMaterialId ? parseInt(item.socksMaterialId) : undefined,
                            socksTypeId: item?.socksTypeId ? parseInt(item.socksTypeId) : undefined,
                            accessoryTemplateId: item?.templateId ? parseInt(item?.templateId) : undefined,
                            legColorId: item?.legColorId ? parseInt(item?.legColorId) : undefined,
                            footColorId: item?.footColorId ? parseInt(item?.footColorId) : undefined,
                            stripesColorId: item?.stripesColorId ? parseInt(item?.stripesColorId) : undefined,
                            nameAndLogo: item?.nameAndLogo ? item?.nameAndLogo : undefined,


                            orderSizeDetails: {
                                createMany: {
                                    data: item?.orderSizeDetails?.map((sub) => ({
                                        sizeId: sub?.sizeId ? parseInt(sub.sizeId) : undefined,
                                        sizeMeasurement: sub?.sizeMeasurement || undefined,
                                        qty: sub?.qty ? parseFloat(sub.qty) : undefined,
                                        weight: sub?.weight ? parseFloat(sub.weight) : undefined,

                                    })) || [],
                                },
                            },

                            orderYarnDetails: {
                                createMany: {
                                    data: item?.orderYarnDetails?.map((yarn) => ({
                                        yarncategoryId: yarn?.yarncategoryId ? parseInt(yarn.yarncategoryId) : undefined,
                                        yarnId: yarn?.yarnId ? parseInt(yarn.yarnId) : undefined,
                                        count: yarn?.count ? parseInt(yarn?.count) : undefined,
                                        yarnKneedleId: yarn?.yarnKneedleId ? parseInt(yarn.yarnKneedleId) : undefined,
                                    })) || [],
                                },
                            },
                            OrderAccessoryDetails: {
                                createMany: {
                                    data: item?.orderAccessoryDetails?.map((sub) => ({
                                        accessoryId: sub?.accessoryId ? parseInt(sub.accessoryId) : undefined,
                                        accessoryCategoryId: sub?.accessoryCategoryId ? parseInt(sub.accessoryCategoryId) : undefined,
                                        accessoryGroupId: sub?.accessoryGroupId ? parseInt(sub.accessoryGroupId) : undefined,
                                        colorId: sub?.colorId ? parseInt(sub.colorId) : undefined,
                                        sizeId: sub?.sizeId ? parseInt(sub.sizeId) : undefined,
                                        uomId: sub?.uomId ? parseInt(sub.uomId) : undefined,
                                        qty: sub?.qty ? parseFloat(sub.qty) : undefined,
                                    })) || [],
                                },
                            },
                        })),
                },






            },
        });


    });

    return { statusCode: 0, data };
};


async function remove(id) {

    const data = await prisma.order.delete({
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
