import { NoRecordFound } from '../configs/Responses.js';
import { PrismaClient } from '@prisma/client'
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";
import { getDateFromDateTime, getYearShortCodeForFinYear, substract, getYearShortCode, } from "../utils/helper.js";
import { getTableRecordWithId } from "../utils/helperQueries.js";
import { getDataCuttingReceiptInwardDetails } from '../utils/directInwardReturnQueries.js';

const prisma = new PrismaClient()

async function getNextDocId(branchId, shortCode, startTime, endTime) {
    let lastObject = await prisma.cuttingOrder.findFirst({
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
    let newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/CO/1`
    if (lastObject) {
        newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/CO/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
    }
    return newDocId
}

const xprisma = prisma.$extends({
    result: {
        cuttingOrder: {
            docDate: {
                needs: { createdAt: true },
                compute(cuttingOrder) {
                    return getDateFromDateTime(cuttingOrder?.createdAt)
                },
            },
        }
    },
})

async function get(req) {
    const { pagination, pageNumber, dataPerPage, branchId, finYearId, searchDocId, searchDocDate, searchSupplierName, partyId,
        isCuttingDeliveryFilter, isCuttingReceiptFilter, searchOrderDocId
    } = req.query
    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    let newDocId = await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime);
    let data = await xprisma.cuttingOrder.findMany({
        where: {
            docId: Boolean(searchDocId) ?
                {
                    contains: searchDocId
                }
                : undefined,
            partyId: partyId ? parseInt(partyId) : undefined,
            Party: { name: searchSupplierName ? { contains: searchSupplierName } : undefined },
            Order: { docId: searchOrderDocId ? { contains: searchOrderDocId } : undefined }
        },
        orderBy: {
            id: "desc"
        },
        include: {
            _count: {
                select: {
                    CuttingDelivery: true
                }
            },
            CuttingDelivery: {
                include: {
                    CuttingDeliveryDetails: true
                }
            },
            Party: {
                select: {
                    id: true,
                    name: true
                }
            },
            Order: {
                select: {
                    docId: true,

                }
            },

        }

    });
    let totalCount = data.length;
    if (searchDocDate) {
        data = data.filter(i => i.docDate.includes(searchDocDate))
    }
    if (pagination) {
        data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)
    }

    // if (isCuttingDeliveryFilter) {
    //     data = data.filter(item => item._count.CuttingDelivery === 0)

    // }
    if (isCuttingReceiptFilter) {
        data = await (async function getAllReceivedQty() {
            const promises = data.map(async (cuttingOrder) => {
                let newItem = {};
                // let newItem = structuredClone(cuttingOrder)
                let totalDeliveredQty = await prisma.cuttingDeliveryDetails.aggregate({
                    where: {
                        CuttingDelivery: {
                            cuttingOrderId: parseInt(cuttingOrder.id)
                        }
                    },
                    _sum: {
                        delQty: true
                    }
                })
                totalDeliveredQty = totalDeliveredQty?._sum?.delQty ? totalDeliveredQty?._sum?.delQty : 0
                let totalConsumptionQty = await prisma.cuttingReceiptFabricConsumptionDetails.aggregate({
                    where: {
                        CuttingReceipt: {
                            cuttingOrderId: parseInt(cuttingOrder.id)
                        }
                    },
                    _sum: {
                        consumption: true
                    }
                })
                totalConsumptionQty = totalConsumptionQty?._sum?.consumption ? totalConsumptionQty?._sum?.consumption : 0
                let totalLossQty = await prisma.cuttingReceiptFabricLossDetails.aggregate({
                    where: {
                        CuttingReceiptFabricConsumptionDetails: {
                            CuttingReceipt: {
                                cuttingOrderId: parseInt(cuttingOrder.id)
                            }
                        }
                    },
                    _sum: {
                        lossQty: true
                    }
                })
                totalLossQty = totalLossQty?._sum?.lossQty ? totalLossQty?._sum?.lossQty : 0
                const balanceQty = substract(totalDeliveredQty, totalConsumptionQty + totalLossQty);

                // newItem["balanceQty"] = balanceQty
                newItem = { ...cuttingOrder, balanceQty: balanceQty }
                return newItem
            })
            return Promise.all(promises)
        })()
        data = data.filter(item => item.balanceQty > 0);
    }

    return { statusCode: 0, data, totalCount, nextDocId: newDocId };
}


async function restructureData(data) {


    return {
        ...data, cuttingOrderDetails: data?.cuttingOrderDetails?.map((item) => {
            return {
                itemTypeName: item?.ItemType?.name,
                itemTypeId: item?.itemTypeId,
                cuttingOrderId: item?.cuttingOrderId,
                items: item?.items?.map((val) => {
                    return {
                        itemName: val?.Item?.name,
                        itemId: val?.itemId,
                        cuttingOrderDetailsId: val?.cuttingOrderDetailsId,
                        colorList: val?.colorList?.map((j) => {
                            return {
                                name: j?.Color?.name,
                                id: j?.colorId,
                                itemsId: j?.itemsId,
                                sizeList: j?.sizeWiseDetails?.map((i) => {
                                    return {
                                        sizeId: i?.sizeId,
                                        sizeName: i?.Size?.name,
                                        cuttingQty: i?.cuttingQty,
                                        orderQty: i?.orderQty,
                                        noOfSet: i?.noOfSet,
                                        studentList: i?.studentList,
                                        colorListId: i?.colorListId
                                    }
                                })
                            }
                        })


                    }
                })
            }
        })
    }
}


async function getOne(id, cuttingReceiptId, cuttingExcessFabricReturnId) {

    const childRecord = 0;
    let data;
    data = await prisma.cuttingOrder.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            Party: {
                select: {
                    name: true
                }
            },
            Order: true,
            CuttingSize: true,
            CuttingColor: true,
            CuttingStyleType: true,
            CuttingStyle: true,
            CuttingClass: true,
            cuttingOrderDetails: {
                select: {
                    id: true,
                    cuttingOrderId: true,
                    ItemType: true,
                    itemTypeId: true,
                    items: {
                        select: {
                            cuttingOrderDetailsId: true,
                            Item: true,
                            itemId: true,
                            colorList: {
                                select: {
                                    colorId: true,
                                    Color: true,
                                    itemsId: true,
                                    sizeWiseDetails: {
                                        select: {
                                            colorListId: true,
                                            sizeId: true,
                                            Size: true,
                                            orderQty: true,
                                            cuttingQty: true,
                                            noOfSet: true,
                                            studentList: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            CuttingDelivery: {
                include: {
                    CuttingDeliveryDetails: {
                        include: {

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
                            Fabric: {
                                select: {
                                    aliasName: true,
                                    name: true
                                }
                            },
                            Gauge: {
                                select: {
                                    name: true
                                }
                            },
                            LoopLength: {
                                select: {
                                    name: true
                                }
                            },
                            Design: {
                                select: {
                                    name: true
                                }
                            },
                            Gsm: {
                                select: {
                                    name: true
                                }
                            },
                            KDia: {
                                select: {
                                    name: true
                                }
                            },
                            FDia: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                }
            }
        }
    })



    data["cuttingOrderDetailsForReceipt"] = await getDataCuttingReceiptInwardDetails(id)

    data["CuttingDelivery"] = await (async function getAlreadyUsedQty() {
        const promises = data.CuttingDelivery.map(async (item) => {
            let newItem = structuredClone(item)
            newItem["CuttingDeliveryDetails"] = await (async function getAlreadyUsed() {
                const promises = item.CuttingDeliveryDetails.map(async (deliveryItem) => {
                    let newItem = structuredClone(deliveryItem)
                    let consumedQty = await prisma.cuttingReceiptFabricConsumptionDetails.aggregate({
                        where: {
                            cuttingDeliveryDetailsId: parseInt(deliveryItem.id),
                            cuttingReceiptId: cuttingReceiptId ? {
                                lt: parseInt(cuttingReceiptId)
                            } : undefined
                        },
                        _sum: {
                            consumption: true
                        },
                    })
                    consumedQty = consumedQty?._sum?.consumption ? consumedQty?._sum?.consumption : 0;
                    let lossQty = await prisma.cuttingReceiptFabricLossDetails.aggregate({
                        where: {
                            CuttingReceiptFabricConsumptionDetails: {
                                cuttingDeliveryDetailsId: parseInt(deliveryItem.id),
                                cuttingReceiptId: cuttingReceiptId ? {
                                    lt: parseInt(cuttingReceiptId)
                                } : undefined
                            }
                        },
                        _sum: {
                            lossQty: true
                        }
                    })
                    lossQty = lossQty?._sum?.lossQty ? lossQty?._sum?.lossQty : 0;
                    newItem["alreadyUsedQty"] = consumedQty + lossQty;
                    let returnedExcessQty = await prisma.cuttingExcessFabricReturnDetails.aggregate({
                        where: {
                            cuttingDeliveryDetailsId: parseInt(deliveryItem.id),
                            cuttingExcessFabricReturnId: cuttingExcessFabricReturnId ? {
                                lt: parseInt(cuttingExcessFabricReturnId)
                            } : undefined
                        },
                        _sum: {
                            returnExcessQty: true
                        }
                    })
                    newItem["alreadyReturnExcessQty"] = returnedExcessQty?._sum?.returnExcessQty ? returnedExcessQty?._sum?.returnExcessQty : 0;
                    return newItem
                })
                return Promise.all(promises)
            }())
            return newItem
        })
        return Promise.all(promises);
    })()



    if (!data) return NoRecordFound("cuttingOrder");

    data = await restructureData(data)

    // data["cuttingOrderDetails"] = await (async function getAlreadyReceivedQty() {
    //     const promises = data.cuttingOrderDetails.map(async (item) => {
    //         let newItem = structuredClone(item)
    //         const data = await prisma.cuttingReceiptInwardDetails.aggregate({
    //             where: {
    //                 cuttingOrderDetailsId: parseInt(item.id),
    //                 cuttingReceiptId: cuttingReceiptId ? {
    //                     lt: parseInt(cuttingReceiptId)
    //                 } : undefined
    //             },
    //             _sum: {
    //                 receivedQty: true
    //             }
    //         })
    //         newItem["alreadyReceivedQty"] = data?._sum?.receivedQty ? data?._sum?.receivedQty : 0
    //         return newItem
    //     })
    //     return Promise.all(promises);
    // })()



    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}





async function createCuttingOrderDetailsSizeWise(tx, colorListId, sizeWiseDetails, skip = 0) {

    let promises = sizeWiseDetails?.map(async (value, index) => {
        await tx.sizeWiseDetails.create({
            data: {
                colorListId: parseInt(colorListId),
                sizeId: value?.sizeId ? parseInt(value.sizeId) : undefined,
                orderQty: value?.orderQty ? parseInt(value.orderQty) : undefined,
                cuttingQty: value?.cuttingQty ? parseInt(value.cuttingQty) : undefined,
                noOfSet: value?.noOfSet ? parseInt(value.noOfSet) : undefined,
                studentList: value.studentList ? {
                    createMany: {
                        data: value.studentList.map(temp => {
                            let newItem = {}
                            newItem["classId"] = parseInt(temp["classId"]);
                            newItem["studentId"] = parseInt(temp["studentId"]);
                            newItem["colorId"] = parseInt(temp["colorId"]);
                            newItem["sizeId"] = parseInt(temp["sizeId"]);
                            newItem["gender"] = temp["gender"];
                            newItem["name"] = temp["name"];

                            return newItem
                        }

                        )
                    }
                } : undefined,
            }
        })

    })

    return Promise.all(promises)
}


async function createCuttingOrderDetailsColorList(tx, itemsId, colorList, skip = 0) {


    let promises = colorList?.map(async (value, index) => {
        let data = await tx.colorList.create({
            data: {
                itemsId: parseInt(itemsId),
                colorId: value?.id ? parseInt(value.id) : undefined,
            }
        })
        return await createCuttingOrderDetailsSizeWise(tx, data?.id, value?.sizeList)
    })
    return Promise.all(promises)
}


async function createCuttingOrderDetailsItems(tx, cuttingOrderDetailsId, items, skip = 0) {

    let promises = items?.map(async (value, index) => {
        let data = await tx.items.create({
            data: {
                cuttingOrderDetailsId: parseInt(cuttingOrderDetailsId),
                itemId: value?.itemId ? parseInt(value.itemId) : undefined,
            }
        })
        return await createCuttingOrderDetailsColorList(tx, data?.id, value?.colorList)
    })
    return Promise.all(promises)
}

async function createCuttingOrderDetails(tx, cuttingOrderId, cuttingOrderDetails) {

    let promises = cuttingOrderDetails.map(async (value, index) => {
        let data = await tx.cuttingOrderDetails.create({
            data: {
                cuttingOrderId: parseInt(cuttingOrderId),
                itemTypeId: value.itemTypeId ? parseInt(value.itemTypeId) : undefined
            }
        })

        return await createCuttingOrderDetailsItems(tx, data?.id, value?.items)
    }
    )

    return Promise.all(promises)
}





async function create(req) {
    const { userId, branchId, partyId, finYearId, orderId, cuttingOrderDetails, companyId, selectedColorList,
        selectedSizeList,
        selectedClassList,
        selectedStyleList, deliveryType, deliveryToId,
        selectedStyleTypeList } = await req.body

    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    let docId = await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime);
    let data;
    await prisma.$transaction(async (tx) => {
        data = await tx.cuttingOrder.create(
            {
                data: {
                    docId,
                    partyId: partyId ? parseInt(partyId) : undefined,
                    branchId: branchId ? parseInt(branchId) : undefined,
                    orderId: orderId ? parseInt(orderId) : undefined,
                    createdById: parseInt(userId),
                    companyId: parseInt(companyId),
                    deliveryType,
                    deliveryBranchId: (deliveryType === "ToSelf") ? (deliveryToId ? parseInt(deliveryToId) : undefined) : undefined,
                    deliveryPartyId: (deliveryType === "ToParty") ? (deliveryToId ? parseInt(deliveryToId) : undefined) : undefined,
                }
            }
        )
        await createCuttingOrderDetails(tx, data.id, cuttingOrderDetails)
    })


    await prisma.cuttingColor.createMany(
        {
            data: selectedColorList.map(temp => {
                let newItem = {}
                newItem["cuttingOrderId"] = parseInt(data?.id);

                newItem["value"] = parseInt(temp["value"]);
                newItem["label"] = temp["label"];


                return newItem
            }

            )
        }
    )



    await prisma.cuttingSize.createMany(
        {
            data: selectedSizeList.map(temp => {
                let newItem = {}
                newItem["cuttingOrderId"] = parseInt(data?.id);
                newItem["value"] = parseInt(temp["value"]);
                newItem["label"] = temp["label"];


                return newItem
            }

            )
        }

    )

    await prisma.cuttingClass.createMany({
        data: selectedClassList.map(temp => {
            let newItem = {}
            newItem["cuttingOrderId"] = parseInt(data?.id);
            newItem["value"] = parseInt(temp["value"]);
            newItem["label"] = temp["label"];


            return newItem
        }

        )
    }

    )

    await prisma.cuttingStyle.createMany({
        data: selectedStyleList.map(temp => {
            let newItem = {}
            newItem["cuttingOrderId"] = parseInt(data?.id);
            newItem["value"] = parseInt(temp["value"]);
            newItem["label"] = temp["label"];


            return newItem
        }

        )
    }

    )

    await prisma.cuttingStyleType.createMany({
        data: selectedStyleTypeList.map(temp => {
            let newItem = {}
            newItem["cuttingOrderId"] = parseInt(data?.id);
            newItem["value"] = parseInt(temp["value"]);
            newItem["label"] = temp["label"];


            return newItem
        }

        )
    }
    )


    return { statusCode: 0, data };

}

async function update(id, body) {
    const { userId, branchId, partyId, orderId, deliveryType, deliveryToId, } = await body
    const dataFound = await prisma.cuttingOrder.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("cuttingOrder");
    const data = await prisma.cuttingOrder.update({
        where: {
            id: parseInt(id),
        },
        data:
        {
            partyId: partyId ? parseInt(partyId) : undefined,
            branchId: branchId ? parseInt(branchId) : undefined,
            updatedById: parseInt(userId),
            orderId: orderId ? parseInt(orderId) : undefined,
            deliveryType,
            deliveryBranchId: (deliveryType === "ToSelf") ? (deliveryToId ? parseInt(deliveryToId) : undefined) : undefined,
            deliveryPartyId: (deliveryType === "ToParty") ? (deliveryToId ? parseInt(deliveryToId) : undefined) : undefined,
        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.cuttingOrder.delete({
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
