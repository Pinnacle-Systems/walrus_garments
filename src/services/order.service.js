import { NoRecordFound } from '../configs/Responses.js';
import { PrismaClient } from '@prisma/client'
import { getCuttingOrderPackingList, getCuttingOrderParams } from '../query/order.js';
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";
import { getDateFromDateTime, getYearShortCode, getYearShortCodeForFinYear } from "../utils/helper.js";
import { getAllProductionDeliveryDetailsItemsByOrderId, getAlreadyReceivedQtyByDeliveryDetailsId, getAlreadyReceivedQtyByDeliveryItemGroupBy, getAlreadyReceivedQtyByDeliveryItemPanelWise, getTableRecordWithId } from "../utils/helperQueries.js";

const prisma = new PrismaClient()

async function getNextDocId(branchId, shortCode, startTime, endTime) {
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
    const { pagination, pageNumber, dataPerPage, orderId, branchId, finYearId, searchDocId, searchDelDate, searchDocDate, searchSupplierName, partyId, isCuttingOrderParams, filterOrderImportIdList,
        filterColorIdList, filterClassOnlyIdList, filterSizeIdList,
        isCuttingOrderPackingList, filterStyleTypeIdList, filterStyleIdList
    } = req.query
    if (isCuttingOrderParams) {
        return await getCuttingOrderParams((filterOrderImportIdList && JSON.parse(filterOrderImportIdList)) || []);
    }
    if (isCuttingOrderPackingList) {
        return await getCuttingOrderPackingList((orderId), (filterOrderImportIdList && JSON.parse(filterOrderImportIdList)) || [], (filterColorIdList && JSON.parse(filterColorIdList)) || [],
            (filterClassOnlyIdList && JSON.parse(filterClassOnlyIdList)) || [],
            (filterSizeIdList && JSON.parse(filterSizeIdList)) || [],
            (filterStyleTypeIdList && JSON.parse(filterStyleTypeIdList)) || [],
            (filterStyleIdList && JSON.parse(filterStyleIdList)) || [],
        );


    }
    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    let newDocId = await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime);
    let data = await xprisma.order.findMany({
        where: {
            branchId: branchId ? parseInt(branchId) : undefined,
            docId: Boolean(searchDocId) ?
                {
                    contains: searchDocId
                }
                : undefined,
            partyId: partyId ? parseInt(partyId) : undefined,
            Party: { name: searchSupplierName ? { contains: searchSupplierName } : undefined }
        },
        orderBy: {
            id: "desc",
        },
        include: {
            Party: {
                select: {
                    id: true,
                    name: true
                }
            },

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


    return { statusCode: 0, data, totalCount, nextDocId: newDocId };
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
                    id: true,
                    orderId: true,
                    Order: true,
                    itemTypeId: true,
                    ItemType: true,
                    orderDetailsSubGrid: {
                        select: {
                            id: true,
                            uniformType: true,
                            orderDetailsId: true,
                            noOfSetMale: true,
                            noOfSetFemale: true,
                            isMaleColor: true,
                            isMaleColorId: true,
                            isFemaleColor: true,
                            isFemaleColorId: true,
                            isMaleStyle: true,
                            isMaleItemId: true,
                            isFemaleStyle: true,
                            isFemaleItemId: true,
                            classIds: {
                                select: {
                                    id: true,
                                    orderDetailsSubGridId: true,
                                    classId: true,
                                    Class: true
                                }
                            },
                            maleColorIds: {
                                select: {
                                    id: true,
                                    orderDetailsSubGridId: true,
                                    maleColorId: true,
                                    Color: true
                                }
                            },
                            femaleColorsIds: {
                                select: {
                                    id: true,
                                    orderDetailsSubGridId: true,
                                    femaleColorId: true,
                                    Color: true
                                }
                            },
                            malePanelProcess: {
                                select: {
                                    id: true,
                                    orderDetailsSubGridId: true,
                                    panelId: true,
                                    colorId: true,
                                    selectedAddons: true

                                }
                            },
                            feMalePanelProcess: {
                                select: {
                                    id: true,
                                    orderDetailsSubGridId: true,
                                    panelId: true,
                                    colorId: true,
                                    selectedAddons: true
                                }
                            },
                            // OrderDetails:{
                            //     select:{
                            //         itemTypeId:{
                            //             select:{
                            //                 name:true
                            //             }
                            //         }
                            //     }
                            // }
                        }
                    }
                }
            }
        }
    })
    if (!data) return NoRecordFound("order");

    // data = await getAllProductionDeliveryDetailsItemsByOrderId(id, data)
    // data["productionDeliveryDetailsItems"] = await getAlreadyReceivedQtyByDeliveryDetailsId(data?.productionDeliveryDetailsItems, id)
    // data["productionDeliveryDetailsItemPanelWise"] = await getAlreadyReceivedQtyByDeliveryItemPanelWise(data?.productionDeliveryDetailsItemPanelWise, id)
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
            orderDetails: {
                select: {
                    id: true,
                    orderId: true,
                    itemTypeId: true,
                    ItemType: true,
                    orderDetailsSubGrid: {
                        select: {
                            id: true,
                            uniformType: true,
                            orderDetailsId: true,
                            noOfSetMale: true,
                            noOfSetFemale: true,
                            isMaleColor: true,
                            isMaleColorId: true,
                            isFemaleColor: true,
                            isFemaleColorId: true,
                            isMaleStyle: true,
                            isMaleItemId: true,
                            isFemaleStyle: true,
                            isFemaleItemId: true,
                            classIds: {
                                select: {
                                    id: true,
                                    orderDetailsSubGridId: true,
                                    classId: true,
                                    Class: true
                                }
                            },
                            maleColorIds: {
                                select: {
                                    id: true,
                                    orderDetailsSubGridId: true,
                                    maleColorId: true,
                                    Color: true
                                }
                            },
                            femaleColorsIds: {
                                select: {
                                    id: true,
                                    orderDetailsSubGridId: true,
                                    femaleColorId: true,
                                    Color: true
                                }
                            },
                            malePanelProcess: {
                                select: {
                                    id: true,
                                    orderDetailsSubGridId: true,
                                    panelId: true,
                                    colorId: true,
                                    selectedAddons: true

                                }
                            },
                            feMalePanelProcess: {
                                select: {
                                    id: true,
                                    orderDetailsSubGridId: true,
                                    panelId: true,
                                    colorId: true,
                                    selectedAddons: true
                                }
                            }
                        }
                    }
                }
            }
        }
    })
    if (!data) return NoRecordFound("order");



    data = await getAllProductionDeliveryDetailsItemsByOrderId(id, data, prevProcessId, packingCategory, packingType)
    data["productionDeliveryDetailsItems"] = await getAlreadyReceivedQtyByDeliveryDetailsId(data?.productionDeliveryDetailsItems, id)
    data["productionDeliveryDetailsItemPanelWise"] = await getAlreadyReceivedQtyByDeliveryItemPanelWise(data?.productionDeliveryDetailsItemPanelWise, id)
    data["productionDeliveryDetailsItemGroupBy"] = await getAlreadyReceivedQtyByDeliveryItemGroupBy(data?.productionDeliveryDetailsItemGroupBy, id)
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function createmalePanelProcess(tx, orderDetailsSubGridId, malePanelProcess, feMalePanelProcess, skip = 0) {

    let malePanel = malePanelProcess?.length > 0 ? malePanelProcess?.map(async (value, index) =>
        await tx.malePanelProcess.create({
            data: {
                orderDetailsSubGridId: parseInt(orderDetailsSubGridId),
                panelId: value?.panelId ? parseInt(value.panelId) : undefined,
                colorId: value?.colorId ? parseInt(value.colorId) : undefined,
                selectedAddons: value.selectedAddons?.length > 0 ? {
                    createMany: {
                        data: value.selectedAddons.map(temp => ({ processId: temp.processId ? parseInt(temp.processId) : undefined }))
                    }
                } : undefined,
            }
        })

    ) : undefined;
    // return Promise.all(malePanel)




    let femalePanel = feMalePanelProcess?.length > 0 ? feMalePanelProcess?.map(async (value, index) =>
        await tx.femalePanelProcess.create({
            data: {
                orderDetailsSubGridId: parseInt(orderDetailsSubGridId),
                panelId: value?.panelId ? parseInt(value.panelId) : null,
                colorId: value?.colorId ? parseInt(value.colorId) : null,
                selectedAddons: value.selectedAddons?.length > 0 ? {
                    createMany: {
                        data: value.selectedAddons.map(temp => ({ processId: temp.processId ? parseInt(temp.processId) : null }))
                    }
                } : undefined,
            }
        })

    ) : undefined;

    return Promise.all(femalePanel, malePanel)
}



// async function createFemalePanelProcess(tx, orderDetailsSubGridId, feMalePanelProcess, skip = 0) {

//     let femalePanel = feMalePanelProcess?.length > 0 ? feMalePanelProcess?.map(async (value, index) =>
//         await tx.femalePanelProcess.create({
//             data: {
//                 orderDetailsSubGridId: parseInt(orderDetailsSubGridId),
//                 panelId: value?.panelId ? parseInt(value.panelId) : null,
//                 colorId: value?.colorId ? parseInt(value.colorId) : null,
//                 selectedAddons: value.selectedAddons?.length > 0 ? {
//                     createMany: {
//                         data: value.selectedAddons.map(temp => ({ processId: temp.processId ? parseInt(temp.processId) : null }))
//                     }
//                 } : undefined,
//             }
//         })

//     ) : undefined;

//     return Promise.all(femalePanel)
// }



async function createOrderDetailsSubGrid(tx, orderDetailsId, orderDetailsSubGrid, skip = 0) {
    let data;

    let promises = orderDetailsSubGrid?.map(async (value, index) => {
        data = await tx.orderDetailsSubGrid.create({
            data: {
                orderDetailsId: parseInt(orderDetailsId),
                uniformType: value?.uniformType ? value?.uniformType : null,
                isMaleColorId: value?.isMaleColorId ? parseInt(value.isMaleColorId) : null,
                noOfSetMale: value?.noOfSetMale ? parseInt(value.noOfSetMale) : null,
                noOfSetFemale: value?.noOfSetFemale ? parseInt(value.noOfSetFemale) : null,
                isFemaleColorId: value?.isFemaleColorId ? parseInt(value.isFemaleColorId) : null,
                isMaleItemId: (isNaN(value?.isMaleItemId) || value?.isMaleItemId == "") ? null : parseInt(value?.isMaleItemId),
                isFemaleItemId: (isNaN(value?.isFemaleItemId) || value?.isFemaleItemId == "") ? null : parseInt(value?.isFemaleItemId),
                classIds: value.classIds?.length > 0 ? {
                    createMany: {
                        data: value.classIds.map(temp => ({ classId: temp.classId ? parseInt(temp.classId) : null }))
                    }
                } : undefined,
                maleColorIds: value?.maleColorIds?.length > 0 ? {
                    createMany: {
                        data: value.maleColorIds.map(temp => {
                            let newItem = {}
                            newItem["maleColorId"] = temp["maleColorId"] ? parseInt(temp["maleColorId"]) : null;
                            return newItem
                        }

                        )
                    }
                } : undefined,
                femaleColorsIds: value?.femaleColorsIds?.length > 0 ? {
                    createMany: {
                        data: value.femaleColorsIds.map(temp => {
                            let newItem = {}
                            newItem["femaleColorId"] = temp["femaleColorId"] ? parseInt(temp["femaleColorId"]) : null;
                            return newItem
                        }

                        )
                    }
                } : undefined,
            }
        })

        // if (value?.malePanelProcess?.length > 0) {
        await createmalePanelProcess(tx, data?.id, (value?.malePanelProcess || []), (value?.feMalePanelProcess || []))
        // }

        // if (value?.feMalePanelProcess?.length > 0) {
        //     await createFemalePanelProcess(tx, data?.id, (value?.feMalePanelProcess || []));
        // }


    })
    return Promise.all(promises)
}



async function createOrderDetails(tx, orderId, orderDetails) {

    let promises = orderDetails.map(async (value, index) => {
        let data = await tx.orderDetails.create({
            data: {
                orderId: parseInt(orderId),
                itemTypeId: value.itemTypeId ? parseInt(value.itemTypeId) : null
            }
        })

        return await createOrderDetailsSubGrid(tx, data?.id, value?.orderDetailsSubGrid)
    }
    )

    return Promise.all(promises)
}





async function create(req) {
    const { userId, branchId, partyId, finYearId, companyId, active, orderQty, noOfSet, isForOrderImportItems, packingCoverType,
        phone, contactPersonName, address, validDate, orderDetails } = await req.body
    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    let docId = await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime);


    let data;
    await prisma.$transaction(async (tx) => {

        data = await tx.order.create(
            {
                data: {
                    docId,
                    // noOfSet: parseInt(noOfSet), isForOrderImportItems,
                    packingCoverType,
                    partyId: partyId ? parseInt(partyId) : undefined,
                    branchId: branchId ? parseInt(branchId) : undefined,
                    createdById: parseInt(userId), contactPersonName, address, phone, validDate: validDate ? new Date(validDate) : undefined,

                }
            }
        )



        await createOrderDetails(tx, data.id, orderDetails)
    })

    return { statusCode: 0, data };

}

// async function updateOrderDetailsSubGrid(tx, orderDetailsId, orderDetailsSubGrid, skip = 0) {


//     let promises = orderDetailsSubGrid?.map(async (value, index) =>
//         await tx.orderDetailsSubGrid.update({
//             where: {
//                 id: parseInt(value.id),
//             },
//             data: {
//                 orderDetailsId: parseInt(orderDetailsId),
//                 isMaleColorId: value?.isMaleColorId ? parseInt(value.isMaleColorId) : undefined,
//                 noOfSetMale: value?.noOfSetMale ? value.noOfSetMale : undefined,
//                 noOfSetFemale: value?.noOfSetFemale ? value.noOfSetFemale : undefined,
//                 isFemaleColorId: value?.isFemaleColorId ? parseInt(value.isFemaleColorId) : undefined,
//                 isMaleItemId: value?.isMaleItemId ? parseInt(value?.isMaleItemId) : undefined,
//                 isFemaleItemId: value?.isFemaleItemId ? parseInt(value?.isFemaleItemId) : undefined,
//                 classIds: {
//                     deleteMany: {},
//                     createMany: {
//                         data: value.classIds.map(temp => {
//                             let newItem = {}
//                             newItem["classId"] = parseInt(temp["classId"]);
//                             return newItem
//                         }

//                         )
//                     }
//                 }
//             }
//         })
//     )
//     return Promise.all(promises)
// }
// async function updateOrderDetails(tx, orderId, orderDetails) {

//     let promises = orderDetails.map(async (value, index) => {
//         let data = await tx.orderDetails.update({
//             where: {
//                 id: parseInt(value.id),
//             },
//             data: {
//                 orderId: parseInt(orderId),
//                 itemTypeId: value.itemTypeId ? parseInt(value.itemTypeId) : undefined
//             }
//         })

//         return await updateOrderDetailsSubGrid(tx, value?.id, value?.orderDetailsSubGrid)
//     }
//     )

//     return Promise.all(promises)
// }
// async function update(id, body) {
//     const { userId, branchId, partyId, finYearId, companyId, active, orderQty, noOfSet,
//         phone, contactPersonName, address, validDate, orderDetails } = await body


//     const dataFound = await prisma.order.findUnique({
//         where: {
//             id: parseInt(id)
//         }
//     })
//     if (!dataFound) return NoRecordFound("order");

//     let data;
//     await prisma.$transaction(async (tx) => {
//         data = await tx.order.update({
//             where: {
//                 id: parseInt(id),
//             },
//             data:
//             {
//                 partyId: partyId ? parseInt(partyId) : undefined, noOfSet,
//                 branchId: branchId ? parseInt(branchId) : undefined,
//                 contactPersonName, address, phone, validDate: validDate ? new Date(validDate) : undefined,
//                 updatedById: parseInt(userId),
//             },
//         })

//         await updateOrderDetails(tx, id, orderDetails)

//     })
//     return { statusCode: 0, data };
// };
// Helper to filter existing items for delete, update, and create
const getChanges = (existing, incoming) => {
    const toDelete = existing.filter(existingItem => !incoming.some(incomingItem => incomingItem.id === existingItem.id));
    const toUpdate = incoming.filter(incomingItem => existing.some(existingItem => incomingItem.id === existingItem.id));
    const toCreate = incoming.filter(incomingItem => !existing.some(existingItem => incomingItem.id === existingItem.id));
    return { toDelete, toUpdate, toCreate };
};

const updateSubGrid = async (tx, orderDetailsId, orderDetailsSubGrid) => {
    await tx.orderDetailsSubGrid.deleteMany({ where: { orderDetailsId } });
    let data;

    let promises = orderDetailsSubGrid?.map(async (value, index) => {
        data = await tx.orderDetailsSubGrid.create({
            data: {
                orderDetailsId: parseInt(orderDetailsId),
                uniformType: value?.uniformType ? value?.uniformType : undefined,
                isMaleColorId: value?.isMaleColorId ? parseInt(value.isMaleColorId) : undefined,
                noOfSetMale: value?.noOfSetMale ? parseInt(value.noOfSetMale) : undefined,
                noOfSetFemale: value?.noOfSetFemale ? parseInt(value.noOfSetFemale) : undefined,
                isFemaleColorId: value?.isFemaleColorId ? parseInt(value.isFemaleColorId) : undefined,
                isMaleItemId: value?.isMaleItemId ? parseInt(value?.isMaleItemId) : undefined,
                isFemaleItemId: value?.isFemaleItemId ? parseInt(value?.isFemaleItemId) : undefined,
                classIds: {
                    createMany: {
                        data: value.classIds.map(temp => ({ classId: temp.classId ? parseInt(temp.classId) : undefined }))
                    }
                },
                maleColorIds: value?.maleColorIds?.length > 0 ? {
                    createMany: {
                        data: value.maleColorIds.map(temp => {
                            let newItem = {}
                            newItem["maleColorId"] = temp["maleColorId"] ? parseInt(temp["maleColorId"]) : undefined;
                            return newItem
                        }

                        )
                    }
                } : undefined,
                femaleColorsIds: value?.femaleColorsIds?.length > 0 ? {
                    createMany: {
                        data: value.femaleColorsIds.map(temp => {
                            let newItem = {}
                            newItem["femaleColorId"] = temp["femaleColorId"] ? parseInt(temp["femaleColorId"]) : undefined;
                            return newItem
                        }

                        )
                    }
                } : undefined,
            }
        })

        // await createFemalePanelProcess(tx, data?.id, value?.feMalePanelProcess);
        await createmalePanelProcess(tx, data?.id, value?.malePanelProcess, value?.feMalePanelProcess)
    })
    return Promise.all(promises)

};



const updateOrderDetails = async (tx, orderId, orderDetails) => {
    const existingOrderDetails = await tx.orderDetails.findMany({
        where: { orderId: parseInt(orderId) },
        include: { orderDetailsSubGrid: true },
    });

    const { toDelete, toUpdate, toCreate } = getChanges(existingOrderDetails, orderDetails);

    await Promise.all(toDelete.map(item => tx.orderDetails.delete({ where: { id: parseInt(item.id) } })));

    await Promise.all(
        toUpdate.map(async (item) => {
            await tx.orderDetails.update({
                where: { id: parseInt(item.id) },
                data: {
                    orderId: parseInt(orderId),
                    itemTypeId: item.itemTypeId ? parseInt(item.itemTypeId) : null,
                },
            });
            await updateSubGrid(tx, item.id, item.orderDetailsSubGrid);
        })
    );

    await Promise.all(
        toCreate.map(async (item) => {
            const created = await tx.orderDetails.create({
                data: {
                    orderId: parseInt(orderId),
                    itemTypeId: item.itemTypeId ? parseInt(item.itemTypeId) : null,
                },
            });
            await updateSubGrid(tx, created.id, item.orderDetailsSubGrid);
        })
    );
};

const update = async (id, body) => {
    const { userId, branchId, partyId, orderDetails, contactPersonName, packingCoverType, address, phone, validDate, noOfSet, isForOrderImportItems } = body;

    const dataFound = await prisma.order.findUnique({ where: { id: parseInt(id) } });
    if (!dataFound) return { statusCode: 404, message: "No record found for order" };

    let data;
    await prisma.$transaction(async (tx) => {
        data = await tx.order.update({
            where: { id: parseInt(id) },
            data: {
                partyId: partyId ? parseInt(partyId) : undefined,
                packingCoverType,
                // noOfSet: parseInt(noOfSet),
                branchId: branchId ? parseInt(branchId) : undefined,
                contactPersonName,
                address,
                phone,
                validDate: validDate ? new Date(validDate) : undefined,
                updatedById: parseInt(userId), isForOrderImportItems,
                orderDetails: {
                    createMany: {
                        data: orderDetails.map(temp => {
                            let newItem = {}
                            newItem["styleId"] = temp["styleId"] ? parseInt(temp["styleId"]) : "";
                            newItem["colorId"] = temp["colorId"] ? parseInt(temp["colorId"]) : "";
                            newItem["sizeId"] = temp["sizeId"] ? parseInt(temp["sizeId"]) : "";
                            newItem["qty"] = temp["qty"] ? temp["qty"] : "";
                            return newItem
                        }
                        )
                    }
                }
            },
        });

        // await updateOrderDetails(tx, id, orderDetails);
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
