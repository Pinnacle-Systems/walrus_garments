import { NoRecordFound } from '../configs/Responses.js';
import { getTableRecordWithId } from '../utils/helperQueries.js';
import { getDateFromDateTime, getItemPanel, getYearShortCode, getYearShortCodeForFinYear, stockDataUpdatePanelWise } from '../utils/helper.js';
import { getFinYearStartTimeEndTime } from '../utils/finYearHelper.js';
import dataIntegrityValidation from "../validators/DataIntegregityValidation/index.js";
import { getCuttingReceiptInwardDetailsAlreadyData, getFabricConsumptionAlreadyData } from '../utils/directInwardReturnQueries.js';
import { prisma } from '../lib/prisma.js';

async function getNextDocId(branchId, shortCode, startTime, endTime) {
    let lastObject = await prisma.cuttingReceipt.findFirst({
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
    let newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/CR/1`
    if (lastObject) {
        newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/CR/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
    }
    return newDocId
}

function manualFilterSearchData(searchDelDate, data) {
    return data.filter(item =>
        (searchDelDate ? String(getDateFromDateTime(item.createdAt)).includes(searchDelDate) : true)
    )
}

async function get(req) {
    const { branchId, active, pagination, pageNumber, dataPerPage,
        searchDocId, searchDelDate, searchSupplierAliasName, searchCuttingOrderDocId, finYearId
    } = req.query
    let data;
    let totalCount;
    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    if (pagination) {
        data = await prisma.cuttingReceipt.findMany({
            where: {
                AND: (finYearDate) ? [
                    {
                        createdAt: {
                            gte: finYearDate.startTime
                        }
                    },
                    {
                        createdAt: {
                            lte: finYearDate.endTime
                        }
                    }
                ] : undefined,
                branchId: branchId ? parseInt(branchId) : undefined,
                active: active ? Boolean(active) : undefined,
                docId: Boolean(searchDocId) ?
                    {
                        contains: searchDocId
                    }
                    : undefined,
                Supplier: Boolean(searchSupplierAliasName) ? {
                    aliasName: { contains: searchSupplierAliasName }
                } : undefined,
                CuttingOrder: searchCuttingOrderDocId ? {
                    docId: {
                        contains: searchCuttingOrderDocId
                    }
                } : undefined
            },
            orderBy: {
                id: "desc"
            },
            include: {
                CuttingOrder: {
                    select: {
                        docId: true
                    }
                }
            }
        });
        data = manualFilterSearchData(searchDelDate, data)
        totalCount = data.length
        data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)
    } else {
        data = await prisma.cuttingReceipt.findMany({
            where: {
                branchId: branchId ? parseInt(branchId) : undefined,
                active: active ? Boolean(active) : undefined,
            }
        });
    }
    let newDocId = await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime)
    return { statusCode: 0, data, nextDocId: newDocId, totalCount };
}


async function getOne(id) {


    const childRecord = 0;
    const data = await prisma.cuttingReceipt.findUnique({
        where: {
            id: parseInt(id)
        },

        include: {
            CuttingOrder: {
                select: {
                    docId: true,
                }
            },
            Supplier: {
                select: {
                    name: true
                }
            },
            Store: {
                select: {
                    storeName: true
                }
            },
            Branch: {
                select: {
                    branchName: true
                }
            },

            CuttingReceiptInwardDetails: {
                include: {
                    Color: {
                        select: {
                            name: true
                        }
                    },
                    Item: {
                        select: {
                            name: true
                        }
                    },
                    Panel: {
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

            CuttingReceiptFabricConsumptionDetails: {
                include: {

                    CuttingDeliveryDetails: {
                        select: {
                            CuttingDelivery: true
                        }
                    },
                    lossDetails: true
                }
            }
        }
    })
    if (!data) return NoRecordFound("cuttingReceipt");
    data["CuttingReceiptInwardDetails"] = await getCuttingReceiptInwardDetailsAlreadyData(data?.CuttingReceiptInwardDetails, data.id)
    data["CuttingReceiptFabricConsumptionDetails"] = await getFabricConsumptionAlreadyData(data?.CuttingReceiptFabricConsumptionDetails, data.id)


    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

export async function getCuttingOrderDetailAllReadyReceivedQty(cuttingOrderDetailsId, cuttingReceiptInwardDetailsId) {
    const data = await prisma.cuttingReceiptInwardDetails.aggregate({
        where: {
            cuttingOrderDetailsId: parseInt(cuttingOrderDetailsId),
            id: {
                lt: JSON.parse(cuttingReceiptInwardDetailsId) ? parseInt(cuttingReceiptInwardDetailsId) : undefined
            }
        },
        _sum: {
            receivedQty: true
        }
    })
    return { statusCode: 0, data: { alreadyReceivedQty: data?._sum?.receivedQty ? data?._sum?.receivedQty : 0 } };
}

export async function getCuttingOrderDeliveryDetailAllReadyConsumedQty(cuttingDeliveryDetailsId, fabricConsumptionDetailsId) {
    const data = await prisma.cuttingReceiptFabricConsumptionDetails.aggregate({
        where: {
            cuttingDeliveryDetailsId: parseInt(cuttingDeliveryDetailsId),
            id: {
                lt: JSON.parse(fabricConsumptionDetailsId) ? parseInt(fabricConsumptionDetailsId) : undefined
            }
        },
        _sum: {
            consumption: true
        }
    })
    return { statusCode: 0, data: { alreadyConsumedQty: data?._sum?.receivedQty ? data?._sum?.receivedQty : 0 } };
}


async function getSearch(req) {
    const { companyId, active } = req.query
    const { searchKey } = req.params
    const data = await prisma.cuttingReceipt.findMany({
        where: {
            country: {
                companyId: companyId ? parseInt(companyId) : undefined,
            },
            active: active ? Boolean(active) : undefined,
            OR: [
                {
                    aliasName: {
                        contains: searchKey,
                    },
                }
            ],
        }
    })
    return { statusCode: 0, data: data };
}


async function create(body) {
    const { supplierId, deliveryFromId, branchId, active, userId,
        vehicleNo, remarks, cuttingOrderId, storeId, specialInstructions, cuttingReceiptInwardDetails, cuttingReceiptFabricConsumptionDetails, supplierDc, finYearId } = await body
    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    let newDocId = await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime)
    let data;
    const cuttingOrder = await getTableRecordWithId(cuttingOrderId, "cuttingOrder");
    console.log(cuttingOrder, "cuttingOrder")
    await prisma.$transaction(async (tx) => {
        data = await tx.cuttingReceipt.create({
            data: {
                supplierId: parseInt(supplierId), deliveryFromId: parseInt(deliveryFromId),
                docId: newDocId,
                cuttingOrderId: parseInt(cuttingOrderId),
                storeId: parseInt(storeId),
                vehicleNo: vehicleNo ? vehicleNo : undefined,
                remarks: remarks ? remarks : undefined,
                specialInstructions: specialInstructions ? specialInstructions : undefined,
                createdById: parseInt(userId),
                active, branchId: parseInt(branchId),
                supplierDc: supplierDc ? supplierDc : undefined,
            },
        });
        let promises
        await (async function createCuttingReceiptInwardDetails() {
            promises = cuttingReceiptInwardDetails.map(async (item) => {
                // const cuttingOrderDetail = await getTableRecordWithId(item.cuttingOrderDetailsId, "cuttingOrderDetails")
                return await tx.cuttingReceiptInwardDetails.create({
                    data: {
                        cuttingReceiptId: parseInt(data.id),

                        cuttingOrderDetailsId: parseInt(item.cuttingOrderDetailsId),
                        sizeWiseDetailsId: parseInt(item.sizeWiseDetailsId),
                        receivedQty: parseInt(item.receivedQty),
                        colorId: item?.colorId ? parseInt(item?.colorId) : undefined,
                        itemId: item?.itemId ? parseInt(item?.itemId) : undefined,
                        sizeId: item?.sizeId ? parseInt(item?.sizeId) : undefined,
                        orderQty: item?.orderQty ? parseFloat(item?.orderQty) : undefined,
                        cuttingQty: item?.cuttingQty ? parseFloat(item?.cuttingQty) : undefined,
                        panelId: item?.panelId ? parseInt(item?.panelId) : undefined,
                        panelColorId: item?.panelColorId ? parseInt(item?.panelColorId) : undefined,
                        stockForPanels: {
                            create: {
                                inOrOut: "In",
                                stage: "Panel",
                                orderId: cuttingOrder?.orderId ? parseInt(cuttingOrder?.orderId) : undefined,
                                colorId: item?.colorId ? parseInt(item?.colorId) : undefined,
                                itemId: item?.itemId ? parseInt(item?.itemId) : undefined,
                                sizeId: item?.sizeId ? parseInt(item?.sizeId) : undefined,
                                panelId: item?.panelId ? parseInt(item?.panelId) : undefined,
                                panelColorId: item.panelColorId ? parseInt(item.panelColorId) : undefined,
                                storeId: parseInt(storeId),
                                branchId: parseInt(branchId),
                                qty: parseInt(item.receivedQty)
                            }
                        }
                    }
                })
            }
            )
            return Promise.all(promises)
        })()

        await (async function createCuttingFabricConsumptionDetails() {
            const promises = cuttingReceiptFabricConsumptionDetails.map(async (item) => {
                return await tx.cuttingReceiptFabricConsumptionDetails.create({
                    data: {
                        cuttingReceiptId: parseInt(data.id),
                        cuttingDeliveryDetailsId: parseInt(item.cuttingDeliveryDetailsId),
                        consumption: parseInt(item.consumption),
                        colorId: item?.colorId ? parseInt(item.colorId) : undefined,
                        delQty: item.delQty ? parseFloat(item.delQty) : undefined,
                        designId: item?.designId ? parseInt(item.designId) : undefined,
                        fDiaId: item?.fDiaId ? parseInt(item.fDiaId) : undefined,
                        fabricId: item?.fabricId ? parseInt(item.fabricId) : undefined,
                        gaugeId: item?.gaugeId ? parseInt(item.gaugeId) : undefined,
                        gsmId: item?.gsmId ? parseInt(item.gsmId) : undefined,
                        kDiaId: item?.kDiaId ? parseInt(item.kDiaId) : undefined,
                        loopLengthId: item?.loopLengthId ? parseInt(item.loopLengthId) : undefined,
                        uomId: item?.uomId ? parseInt(item.uomId) : undefined,
                        lossDetails: item?.lossDetails ? {
                            createMany: {
                                data: item?.lossDetails?.filter(j => j.lossQty)?.map(lossItem => ({ lossReasonId: parseInt(lossItem.lossReasonId), lossQty: parseFloat(lossItem.lossQty) }))
                            }
                        } : undefined
                    }
                })
            })
            return Promise.all(promises)
        })()

        // await dataIntegrityValidation(tx);
    })
    // await stockDataUpdatePanelWise(data?.id, storeId, branchId, data?.cuttingOrderId);
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { supplierId, deliveryFromId, branchId, active, userId,
        vehicleNo, remarks, cuttingOrderId, storeId, specialInstructions, cuttingReceiptInwardDetails, cuttingReceiptFabricConsumptionDetails, supplierDc } = await body
    let data;
    const dataFound = await prisma.cuttingReceipt.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            CuttingReceiptInwardDetails: true
        }
    })
    if (!dataFound) return NoRecordFound("cuttingReceipt");
    const cuttingOrder = await getTableRecordWithId(cuttingOrderId, "cuttingOrder");
    await prisma.$transaction(async (tx) => {
        data = await tx.cuttingReceipt.update({
            where: {
                id: parseInt(id),
            },
            data: {
                supplierId: parseInt(supplierId),
                deliveryFromId: parseInt(deliveryFromId),
                storeId: parseInt(storeId),
                vehicleNo: vehicleNo ? vehicleNo : undefined,
                remarks: remarks ? remarks : undefined,
                specialInstructions: specialInstructions ? specialInstructions : undefined,
                updatedById: parseInt(userId),
                active, branchId: parseInt(branchId),
                supplierDc: supplierDc ? supplierDc : undefined,
                CuttingReceiptFabricConsumptionDetails: {
                    deleteMany: {}
                },
                CuttingReceiptInwardDetails: {
                    deleteMany: {}
                }
            }
        });
        let promises;
        await (async function createCuttingReceiptInwardDetails() {
            promises = cuttingReceiptInwardDetails.map(async (item) => {
                // const cuttingOrderDetail = await getTableRecordWithId(item.cuttingOrderDetailsId, "cuttingOrderDetails")
                return await tx.cuttingReceiptInwardDetails.create({
                    data: {
                        cuttingReceiptId: parseInt(data.id),
                        cuttingOrderDetailsId: parseInt(item.cuttingOrderDetailsId),
                        sizeWiseDetailsId: parseInt(item.sizeWiseDetailsId),
                        receivedQty: parseInt(item.receivedQty),
                        colorId: item?.colorId ? parseInt(item?.colorId) : undefined,
                        itemId: item?.itemId ? parseInt(item?.itemId) : undefined,
                        sizeId: item?.sizeId ? parseInt(item?.sizeId) : undefined,
                        orderQty: item?.orderQty ? parseFloat(item?.orderQty) : undefined,
                        cuttingQty: item?.cuttingQty ? parseFloat(item?.cuttingQty) : undefined,
                        stockForPanels: {
                            create: {
                                inOrOut: "In",
                                stage: "Panel",
                                orderId: cuttingOrder?.orderId ? parseInt(cuttingOrder?.orderId) : undefined,
                                colorId: item?.colorId ? parseInt(item?.colorId) : undefined,
                                itemId: item?.itemId ? parseInt(item?.itemId) : undefined,
                                sizeId: item?.sizeId ? parseInt(item?.sizeId) : undefined,
                                panelId: item?.panelId ? parseInt(item?.panelId) : undefined,
                                panelColorId: item.panelColorId ? parseInt(item.panelColorId) : undefined,
                                storeId: parseInt(storeId),
                                branchId: parseInt(branchId),
                                qty: parseInt(item.receivedQty)
                            }
                        }
                    }
                })
            }
            )
            return Promise.all(promises)
        })()

        await (async function createCuttingFabricConsumptionDetails() {
            const promises = cuttingReceiptFabricConsumptionDetails.map(async (item) => {
                return await tx.cuttingReceiptFabricConsumptionDetails.create({
                    data: {
                        cuttingReceiptId: parseInt(data.id),
                        cuttingDeliveryDetailsId: parseInt(item.cuttingDeliveryDetailsId),
                        consumption: parseInt(item.consumption),
                        colorId: item?.colorId ? parseInt(item.colorId) : undefined,
                        delQty: item.delQty ? parseFlaot(item.delQty) : undefined,
                        designId: item?.designId ? parseInt(item.designId) : undefined,
                        fDiaId: item?.fDiaId ? parseInt(item.fDiaId) : undefined,
                        fabricId: item?.fabricId ? parseInt(item.fabricId) : undefined,
                        gaugeId: item?.gaugeId ? parseInt(item.gaugeId) : undefined,
                        gsmId: item?.gsmId ? parseInt(item.gsmId) : undefined,
                        kDiaId: item?.kDiaId ? parseInt(item.kDiaId) : undefined,
                        loopLengthId: item?.loopLengthId ? parseInt(item.loopLengthId) : undefined,
                        uomId: item?.uomId ? parseInt(item.uomId) : undefined,
                        lossDetails: item?.lossDetails ? {
                            createMany: {
                                data: item?.lossDetails?.filter(j => j.lossQty)?.map(lossItem => ({ lossReasonId: parseInt(lossItem.lossReasonId), lossQty: parseFloat(lossItem.lossQty) }))
                            }
                        } : undefined
                    }
                })
            })
            return Promise.all(promises)
        })()



        // await dataIntegrityValidation(tx);
    })

    // await stockDataUpdatePanelWise(data?.id, storeId, branchId, data?.cuttingOrderId);
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.cuttingReceipt.delete({
        where: {
            id: parseInt(id)
        },
    })
    return { statusCode: 0, data };
}

export {
    get,
    getOne,
    getSearch,
    create,
    update,
    remove
}
