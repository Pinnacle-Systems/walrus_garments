import { NoRecordFound } from '../configs/Responses.js';
import { createproductionReceiptByAuto, getTableRecordWithId } from '../utils/helperQueries.js';
import { getDateFromDateTime, getYearShortCode, getYearShortCodeForFinYear } from '../utils/helper.js';
import { getFinYearStartTimeEndTime } from '../utils/finYearHelper.js';
import dataIntegrityValidation from "../validators/DataIntegregityValidation/index.js";
import { prisma } from '../lib/prisma.js';

async function getNextDocId(branchId, shortCode, startTime, endTime) {
    let lastObject = await prisma.productionDelivery.findFirst({
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
    let newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/PD/1`
    if (lastObject) {
        newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/PD/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
    }
    return newDocId
}

function manualFilterSearchData(searchDelDate, data) {
    return data.filter(item =>
        (searchDelDate ? String(getDateFromDateTime(item.createdAt)).includes(searchDelDate) : true)
    )
}

async function get(req) {
    const { branchId, active, storeId, pagination, pageNumber, dataPerPage,
        searchDocId, searchDelDate, searchSupplierAliasName, styleId, finYearId
    } = req.query
    let data;
    let totalCount;
    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    data = await prisma.productionDelivery.findMany({
        where: {
            AND: (finYearDate) ? [
                {
                    createdAt: {
                        gte: finYearDate?.startTime
                    }
                },
                {
                    createdAt: {
                        lte: finYearDate?.endTime
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
            // itemId: (itemId ? JSON.parse(itemId) : null) ? parseInt(itemId) : undefined,
            Supplier: Boolean(searchSupplierAliasName) ? {
                aliasName: { contains: searchSupplierAliasName }
            } : undefined,
        },
        orderBy: {
            id: "desc"
        },
        include: {
            FromProcess: {
                select: {
                    name: true
                }
            },
            ToProcess: {
                select: {
                    name: true
                }
            },
            Order: {
                select: {
                    docId: true
                }
            },
        }
    });
    data = manualFilterSearchData(searchDelDate, data)
    totalCount = data.length
    if (pagination) {
        data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)
    }
    let newDocId = await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime)
    return { statusCode: 0, data, nextDocId: newDocId, totalCount };
}


async function getOne(id, productionReceiptId) {
    const childRecord = 0;
    const data = await prisma.productionDelivery.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            FromProcess: {
                select: {
                    name: true
                }
            },
            ToProcess: {
                select: {
                    name: true
                }
            },
            Order: {
                select: {
                    docId: true
                }
            },
            Store:{
                select:{
                    storeName:true
                }
            },
            Branch:{
                select:{
                    branchName:true
            }
        },
            productionDeliveryDetails: {
                include: {
                    Panel: {
                        select: {
                            name: true
                        }
                    },
                    Item: {
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
        }
    })
    data["productionDeliveryDetails"] = await (async function getAlreadyReceivedQty() {


        let productDeliveryData = [];
        for (let i = 0; i < data?.productionDeliveryDetails?.length; i++) {

            let deliveryItem = data?.productionDeliveryDetails[i]
            let obj = {
                ...deliveryItem,
                qty: (await getStockQtyForProductionDelivery(deliveryItem?.id, deliveryItem?.sizeId, deliveryItem?.itemId, data?.storeId, deliveryItem?.colorId, deliveryItem?.panelId))?.total

            }


            productDeliveryData.push(obj)

        }

        return Promise.all(productDeliveryData);




        // const promises = data.productionDeliveryDetails.map(async (item, itemIndex) => {
        //     let newItem = structuredClone(item)

        //     let receivedQty = await prisma.productionReceiptDetails.aggregate({
        //         where: {
        //             productionDeliveryDetailsId: parseInt(item.id),
        //             productionReceiptId: productionReceiptId ? {
        //                 lt: parseInt(productionReceiptId)
        //             } : undefined
        //         },
        //         _sum: {
        //             receivedQty: true
        //         }
        //     })
        //     receivedQty = receivedQty?._sum?.receivedQty ? receivedQty?._sum?.receivedQty : 0
        //     let lossQty = await prisma.productionReceiptLossDetails.aggregate({
        //         where: {
        //             ProductionReceiptDetails: {
        //                 productionDeliveryDetailsId: parseInt(item.id),
        //                 productionReceiptId: productionReceiptId ? {
        //                     lt: parseInt(productionReceiptId)
        //                 } : undefined
        //             }
        //         },
        //         _sum: {
        //             lossQty: true
        //         }
        //     })
        //     lossQty = lossQty?._sum?.lossQty ? lossQty?._sum?.lossQty : 0
        //     newItem["alreadyReceivedQty"] = receivedQty + lossQty;

        //     return newItem

        // })

    })()
    if (!data) return NoRecordFound("productionDelivery");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}


async function getStockQtyForProductionDelivery(productiondeliverydetailsid, sizeId, itemId, storeId, colorId, panelId) {

    console.log(productiondeliverydetailsid, sizeId, itemId, storeId, colorId, panelId, "productiondeliverydetailsid, sizeId, itemId, storeId, colorId, panelId")

    const total = `
    SELECT sum(qty) as total FROM stockForPanels WHERE id < (select id from stockForPanels 
    where productiondeliverydetailsid=${productiondeliverydetailsid}) AND (panelId=${panelId} or panelId is null) and colorid=${colorId} 
    and storeId=${storeId} 
  and itemId=${itemId} and sizeId=${sizeId} 
      `
    const beforeIdTotalStock = await prisma.$queryRawUnsafe(total);
    return beforeIdTotalStock[0]
}


async function getSearch(req) {
    const { companyId, active } = req.query
    const { searchKey } = req.params
    const data = await prisma.productionDelivery.findMany({
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

async function createproductionDeliveryDetails(tx, productionDeliveryDetails, productionDelivery, orderId, fromProcessId) {

    let stage;
    let processId = productionDelivery?.fromProcessId;
    if (processId) {
        let processData = await prisma.process.findUnique({
            where: {
                id: parseInt(processId)
            }
        })
        if (processData?.isIroning || processData?.isStitching || processData?.isPacking) {
            stage = "Stitching"
        }
        else {
            stage = "Panel"
        }
    }
    const promises = productionDeliveryDetails.map(async (item) => {
        return await tx.productionDeliveryDetails.create({
            data: {
                productionDeliveryId: parseInt(productionDelivery.id),
                panelId: item?.panelId ? parseInt(item.panelId) : null,
                itemId: parseInt(item.itemId),
                uomId: item.uomId ? parseInt(item.uomId) : undefined,
                colorId: item.colorId ? parseInt(item.colorId) : undefined,
                panelColorId: item.panelColorId ? parseInt(item.panelColorId) : undefined,
                sizeId: parseInt(item.sizeId),
                delQty: parseFloat(item.delQty),
                processCost: item.processCost ? parseFloat(item.processCost) : 0,
                prevProcessId: processId ? parseInt(processId) : undefined,
                StockForPanels: {
                    create: {
                        inOrOut: "Out",
                        orderId: orderId ? parseInt(orderId) : undefined,
                        panelId: item?.panelId ? parseInt(item.panelId) : null,
                        prevProcessId: processId ? parseInt(processId) : undefined,
                        colorId: item.colorId ? parseInt(item.colorId) : undefined,
                        panelColorId: item.panelColorId ? parseInt(item.panelColorId) : undefined,
                        uomId: item.uomId ? parseInt(item.uomId) : undefined,
                        itemId: parseInt(item.itemId),
                        sizeId: parseInt(item.sizeId),
                        storeId: parseInt(productionDelivery.storeId),
                        branchId: parseInt(productionDelivery.branchId),
                        qty: 0 - parseInt(item.delQty),
                        stage: stage
                    }
                }
            }
        })
    }
    )
    return Promise.all(promises)
}


async function create(body) {
    const { supplierId, branchId, userId, orderId, packingType, packingCategory, stitchingCost, packingCost, ironingCost,
        vehicleNo, remarks, storeId, specialInstructions, dueDate, productionDeliveryDetails, productionType, styleId, fromProcessId, toProcessId, finYearId, deliveryId } = await body
    let finYearDate = await getFinYearStartTimeEndTime(finYearId);

    const process = await getTableRecordWithId(fromProcessId, "process")
    const stitchingProcess = await getTableRecordWithId(toProcessId, "process")
    const isStitching = process ? process.isStitching : false;
    const isIroning = process ? process.isIroning : false;
    const isPacking = stitchingProcess ? stitchingProcess.isPacking : false;

    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    let newDocId = await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime)
    let data;
    await prisma.$transaction(async (tx) => {
        data = await tx.productionDelivery.create({
            data: {
                docId: newDocId,
                supplierId: supplierId ? parseInt(supplierId) : undefined,
                deliveryId: deliveryId ? parseInt(deliveryId) : undefined,
                storeId: parseInt(storeId),
                orderId: orderId ? parseInt(orderId) : undefined,
                fromProcessId: parseInt(fromProcessId),
                toProcessId: parseInt(toProcessId),
                productionType,
                vehicleNo,
                remarks,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                specialInstructions,
                createdById: parseInt(userId),
                branchId: parseInt(branchId),
                packingType: packingType ? packingType : undefined,
                packingCategory: packingCategory ? packingCategory : undefined,
                stitchingCost: stitchingCost ? parseFloat(stitchingCost) : undefined,
                packingCost: packingCost ? parseFloat(packingCost) : undefined,
                ironingCost: ironingCost ? parseFloat(ironingCost) : undefined,
            },
        });
        await createproductionDeliveryDetails(tx, productionDeliveryDetails, data, orderId, fromProcessId)
        // await dataIntegrityValidation(tx);
    })

    if ((isStitching || isIroning) && productionType == "INHOUSE" && !isPacking) {

        await createproductionReceiptByAuto(data, finYearId, branchId,)
    }

    return { statusCode: 0, data };
}

async function updateProductionDeliveryDetails(tx, productionDeliveryDetails, productionDelivery, orderId) {
    let stage;
    let removedItems = productionDelivery?.productionDeliveryDetails?.filter(oldItem => {
        let result = productionDeliveryDetails.find(newItem => newItem.id === oldItem.id)
        if (result) return false
        return true
    })
    let removedItemsId = removedItems.map(item => parseInt(item))
    await tx.ProductionDeliveryDetails.deleteMany({
        where: {
            id: {
                in: removedItemsId
            }
        }
    })
    let processId = productionDelivery?.fromProcessId;
    if (processId) {
        let processData = await prisma.process.findUnique({
            where: {
                id: parseInt(processId)
            }
        })
        if (processData?.isIroning || processData?.isStitching || processData?.isPacking) {
            stage = "Stitching"
        }
        else {
            stage = "Panel"
        }
    }
    const promises = productionDeliveryDetails.map(async (item) => {
        if (item?.id) {
            return await tx.productionDeliveryDetails.update({
                where: {
                    id: parseInt(item.id)
                },
                data: {
                    productionDeliveryId: parseInt(productionDelivery.id),
                    panelId: item?.panelId ? parseInt(item.panelId) : null,
                    itemId: parseInt(item.itemId),
                    uomId: item.uomId ? parseInt(item.uomId) : undefined,
                    colorId: item.colorId ? parseInt(item.colorId) : undefined,
                    panelColorId: item.panelColorId ? parseInt(item.panelColorId) : undefined,
                    sizeId: parseInt(item.sizeId),
                    delQty: parseFloat(item.delQty),
                    prevProcessId: processId ? parseInt(processId) : undefined,
                    processCost: item.processCost ? parseFloat(item.processCost) : 0,
                    StockForPanels: {
                        update: {
                            inOrOut: "Out",
                            orderId: orderId ? parseInt(orderId) : undefined,
                            panelId: item?.panelId ? parseInt(item.panelId) : null,
                            prevProcessId: processId ? parseInt(processId) : undefined,
                            colorId: item.colorId ? parseInt(item.colorId) : undefined,
                            panelColorId: item.panelColorId ? parseInt(item.panelColorId) : undefined,
                            uomId: item.uomId ? parseInt(item.uomId) : undefined,
                            itemId: parseInt(item.itemId),
                            sizeId: parseInt(item.sizeId),
                            storeId: parseInt(productionDelivery.storeId),
                            branchId: parseInt(productionDelivery.branchId),
                            qty: 0 - parseInt(item.delQty),
                            stage: stage
                        }
                    }
                }
            })
        } else {
            return await tx.productionDeliveryDetails.create({
                data: {
                    productionDeliveryId: parseInt(productionDelivery.id),
                    panelId: item?.panelId ? parseInt(item.panelId) : null,
                    itemId: parseInt(item.itemId),
                    uomId: item.uomId ? parseInt(item.uomId) : undefined,
                    colorId: item.colorId ? parseInt(item.colorId) : undefined,
                    panelColorId: item.panelColorId ? parseInt(item.panelColorId) : undefined,
                    sizeId: parseInt(item.sizeId),
                    delQty: parseFloat(item.delQty),
                    processCost: item.processCost ? parseFloat(item.processCost) : 0,
                    prevProcessId: processId ? parseInt(processId) : undefined,
                    StockForPanels: {
                        create: {
                            inOrOut: "Out",
                            orderId: orderId ? parseInt(orderId) : undefined,
                            panelId: item?.panelId ? parseInt(item.panelId) : null,
                            prevProcessId: processId ? parseInt(processId) : undefined,
                            colorId: item.colorId ? parseInt(item.colorId) : undefined,
                            panelColorId: item.panelColorId ? parseInt(item.panelColorId) : undefined,
                            uomId: item.uomId ? parseInt(item.uomId) : undefined,
                            itemId: parseInt(item.itemId),
                            sizeId: parseInt(item.sizeId),
                            storeId: parseInt(productionDelivery.storeId),
                            branchId: parseInt(productionDelivery.branchId),
                            qty: 0 - parseInt(item.delQty),
                            stage: stage
                        }
                    }
                }
            })
        }
    })
    return Promise.all(promises)
}

async function update(id, body) {
    const { supplierId, branchId, userId, orderId, packingType, packingCategory, stitchingCost, packingCost, ironingCost,
        vehicleNo, remarks, storeId, specialInstructions, dueDate, productionDeliveryDetails, productionType, styleId, fromProcessId, toProcessId, deliveryId } = await body
    let data;
    const dataFound = await prisma.productionDelivery.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            productionDeliveryDetails: true
        }
    })
    if (!dataFound) return NoRecordFound("productionDelivery");
    await prisma.$transaction(async (tx) => {
        data = await tx.productionDelivery.update({
            where: {
                id: parseInt(id),
            },
            data: {
                supplierId: supplierId ? parseInt(supplierId) : undefined,
                deliveryId: deliveryId ? parseInt(deliveryId) : undefined,
                storeId: parseInt(storeId),
                // styleId: parseInt(styleId),
                fromProcessId: parseInt(fromProcessId),
                toProcessId: parseInt(toProcessId),
                productionType,
                vehicleNo,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                remarks,
                orderId: orderId ? parseInt(orderId) : undefined,
                specialInstructions,
                updatedById: parseInt(userId),
                branchId: parseInt(branchId),
                packingType: packingType ? packingType : undefined,
                packingCategory: packingCategory ? packingCategory : undefined,
                stitchingCost: stitchingCost ? parseFloat(stitchingCost) : undefined,
                packingCost: packingCost ? parseFloat(packingCost) : undefined,
                ironingCost: ironingCost ? parseFoat(ironingCost) : undefined,
            },
            // include: {
            //     ProductionDeliveryDetails: true
            // }
        });
        await updateProductionDeliveryDetails(tx, productionDeliveryDetails, dataFound, orderId)
        // await dataIntegrityValidation(tx);
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.productionDelivery.delete({
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
