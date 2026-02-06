import { NoRecordFound } from '../configs/Responses.js';

import { getTableRecordWithId } from '../utils/helperQueries.js';
import { getDateFromDateTime, getYearShortCode, getYearShortCodeForFinYear } from '../utils/helper.js';
import { getFinYearStartTimeEndTime } from '../utils/finYearHelper.js';
import dataIntegrityValidation from "../validators/DataIntegregityValidation/index.js";
import { getStockQty } from '../utils/stockHelper.js';
import { prisma } from '../lib/prisma.js';

async function getNextDocId(branchId, shortCode, startTime, endTime) {
    let lastObject = await prisma.cuttingDelivery.findFirst({
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
    let newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/CD/1`
    if (lastObject) {
        newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/CD/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
    }
    return newDocId
}

function manualFilterSearchData(searchDelDate, searchDueDate, data) {
    return data.filter(item =>
        (searchDelDate ? String(getDateFromDateTime(item.createdAt)).includes(searchDelDate) : true) &&
        (searchDueDate ? String(getDateFromDateTime(item.dueDate)).includes(searchDueDate) : true)
    )
}

async function get(req) {
    const { branchId, active, storeId, pagination, pageNumber, dataPerPage,
        searchDocId, searchDelDate, searchSupplierAliasName, searchDueDate, searchCuttingOrderDocId, supplierId, finYearId
    } = req.query
    let data;
    let totalCount;
    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    data = await prisma.cuttingDelivery.findMany({
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
            Supplier: {
                aliasName: Boolean(searchSupplierAliasName) ? { contains: searchSupplierAliasName } : undefined
            },
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
                include: {
                    cuttingOrderDetails: {
                        select: {
                            ItemType: true,
                            itemTypeId: true,
                            cuttingOrderId: true,
                            items: {
                                select: {
                                    cuttingOrderDetailsId: true,
                                    Item: true,
                                    itemId: true,
                                    colorList: {
                                        select: {
                                            itemsId: true,
                                            Items: true,
                                            Color: true,
                                            colorId: true,
                                            sizeWiseDetails: true
                                        }
                                    }

                                }
                            },
                        }
                    }
                }
            },
            Supplier: {
                select: {
                    aliasName: true,
                    name: true
                }
            }
        }
    });
    data = manualFilterSearchData(searchDelDate, searchDueDate, data)
    totalCount = data.length
    if (pagination) {
        data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)
    }
    let newDocId = await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime);

    return { statusCode: 0, data, nextDocId: newDocId, totalCount };
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.cuttingDelivery.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            CuttingOrder:{
                select:{
                    docId:true
                }
            },
            Supplier: {
                select: {

                    name: true
                }
            },
            
            Branch: {
                select: {
                    branchName: true
                }
            },
            Store:{
                select:{
                    storeName:true
                }
            },
            DeliveryTo:{
                select:{
                    name:true
                }
            },
            
          
            CuttingDeliveryDetails: {

                include: {
                    Fabric:{
                        select:{
                            name:true
                        }
                    },
                    Color:{
                       select:{
                        name:true
                       }
                    },
                    Design:{
                        select:{
                            name:true
                        }
                    },
                    Gsm:{
                        select:{
                            name:true
                        }
                    },
                    Stock: {
                        select: {
                            id: true
                        }
                    },
                    Uom:{
                        select:{
                            name:true
                        }
                    },
                    Gauge:{
                        select:{
                            name:true
                        }
                    },
                    LoopLength:{
                        select:{
                            name:true
                        }
                    },
                    KDia:true,
                    FDia:true
                  
                
                }
            }
        }
    })




    if (!data) return NoRecordFound("cuttingDelivery");

    data["CuttingDeliveryDetails"] = await getStockQty(data);

    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}
async function getSearch(req) {
    const { companyId, active } = req.query
    const { searchKey } = req.params
    const data = await prisma.cuttingDelivery.findMany({
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
    const { supplierId, deliveryId, branchId, active, cuttingDeliveryDetails, userId,
        vehicleNo, remarks, cuttingOrderId, storeId, specialInstructions, dueDate, finYearId } = await body
    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    let newDocId = await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime);
    let data;
    await prisma.$transaction(async (tx) => {
        data = await tx.cuttingDelivery.create({
            data: {
                supplierId: parseInt(supplierId),
                deliveryId: parseInt(deliveryId),
                docId: newDocId,
                cuttingOrderId: parseInt(cuttingOrderId),
                storeId: parseInt(storeId),
                vehicleNo,
                remarks,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                specialInstructions,
                createdById: parseInt(userId),
                active, branchId: parseInt(branchId)
            },
        });
        await (async function createCuttingDetails() {
            let promises = cuttingDeliveryDetails.map(async (cuttingDetail) => {
                return await tx.cuttingDeliveryDetails.create({
                    data: {
                        cuttingDeliveryId: parseInt(data.id),
                        yarnId: cuttingDetail?.yarnId ? parseInt(cuttingDetail.yarnId) : undefined,
                        fabricId: cuttingDetail?.fabricId ? parseInt(cuttingDetail.fabricId) : undefined,
                        colorId: cuttingDetail?.colorId ? parseInt(cuttingDetail.colorId) : undefined,
                        uomId: cuttingDetail?.uomId ? parseInt(cuttingDetail.uomId) : undefined,
                        designId: cuttingDetail?.designId ? parseInt(cuttingDetail.designId) : undefined,
                        gaugeId: cuttingDetail?.gaugeId ? parseInt(cuttingDetail.gaugeId) : undefined,
                        loopLengthId: cuttingDetail?.loopLengthId ? parseInt(cuttingDetail.loopLengthId) : undefined,
                        gsmId: cuttingDetail?.gsmId ? parseInt(cuttingDetail.gsmId) : undefined,
                        sizeId: cuttingDetail?.sizeId ? parseInt(cuttingDetail.sizeId) : undefined,
                        kDiaId: cuttingDetail?.kDiaId ? parseInt(cuttingDetail.kDiaId) : undefined,
                        fDiaId: cuttingDetail?.fDiaId ? parseInt(cuttingDetail.fDiaId) : undefined,
                        lotNo: cuttingDetail?.lotNo ? cuttingDetail.lotNo : undefined,
                        delRolls: cuttingDetail?.delRolls ? parseInt(cuttingDetail.delRolls) : undefined,
                        delQty: parseFloat(cuttingDetail.delQty),
                        stockPrice: cuttingDetail.stockPrice ? parseFloat(cuttingDetail.stockPrice) : undefined,

                        storeId: parseInt(cuttingDetail.storeId),
                        Stock: {
                            create: {
                                itemType: "DyedFabric",
                                inOrOut: "CuttingDelivery",
                                branchId: parseInt(branchId),
                                fabricId: cuttingDetail?.fabricId ? parseInt(cuttingDetail.fabricId) : undefined,
                                colorId: cuttingDetail?.colorId ? parseInt(cuttingDetail.colorId) : undefined,
                                uomId: cuttingDetail?.uomId ? parseInt(cuttingDetail.uomId) : undefined,
                                designId: cuttingDetail?.designId ? parseInt(cuttingDetail.designId) : undefined,
                                gaugeId: cuttingDetail?.gaugeId ? parseInt(cuttingDetail.gaugeId) : undefined,
                                loopLengthId: cuttingDetail?.loopLengthId ? parseInt(cuttingDetail.loopLengthId) : undefined,
                                gsmId: cuttingDetail?.gsmId ? parseInt(cuttingDetail.gsmId) : undefined,
                                sizeId: cuttingDetail?.sizeId ? parseInt(cuttingDetail.sizeId) : undefined,
                                kDiaId: cuttingDetail?.kDiaId ? parseInt(cuttingDetail.kDiaId) : undefined,
                                fDiaId: cuttingDetail?.fDiaId ? parseInt(cuttingDetail.fDiaId) : undefined,
                                lotNo: cuttingDetail?.lotNo ? cuttingDetail.lotNo : undefined,
                                noOfRolls: cuttingDetail?.delRolls ? 0 - parseInt(cuttingDetail.delRolls) : undefined,
                                qty: 0 - parseFloat(cuttingDetail.delQty),
                                price: cuttingDetail.stockPrice ? parseFloat(cuttingDetail.stockPrice) : undefined,
                                storeId: parseInt(storeId),
                                processId: cuttingDetail.processId ? parseInt(cuttingDetail.processId) : undefined,
                            }
                        }
                    }
                })
            })
            return Promise.all(promises)
        })()
        // await dataIntegrityValidation(tx);
    })
    return { statusCode: 0, data };
}

function findRemovedItems(dataFound, cuttingDeliveryDetails) {
    let removedItems = dataFound.CuttingDeliveryDetails.filter(oldItem => {
        let result = cuttingDeliveryDetails.find(newItem => parseInt(newItem.id) === parseInt(oldItem.id))
        if (result) return false
        return true
    }
    )
    return removedItems
}

async function deleteItemsFromStock(tx, removeItemsStockIds) {
    return await tx.cuttingDeliveryDetails.deleteMany({
        where: {
            id: {
                in: removeItemsStockIds
            }
        }
    })
}


async function update(id, body) {
    const { supplierId, deliveryId, branchId, active, cuttingDeliveryDetails, userId,
        vehicleNo, remarks, storeId, specialInstructions, dueDate } = await body
    let data;

    const dataFound = await prisma.cuttingDelivery.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            CuttingDeliveryDetails: {
                include: {
                    Stock: {
                        select: {
                            id: true
                        }
                    }
                }
            }
        }
    })
    if (!dataFound) return NoRecordFound("cuttingDelivery");
    let newCuttingDeliveryDetailItems = cuttingDeliveryDetails.filter(i => i.id);
    let removedItems = findRemovedItems(dataFound, newCuttingDeliveryDetailItems);
    let removeItemsStockIds = removedItems.map(item => parseInt(item.id))
    await prisma.$transaction(async (tx) => {
        await deleteItemsFromStock(tx, removeItemsStockIds);
        data = await tx.cuttingDelivery.update({
            where: {
                id: parseInt(id),
            },
            data: {
                supplierId: parseInt(supplierId),
                deliveryId: parseInt(deliveryId),
                storeId: parseInt(storeId),
                vehicleNo,
                remarks,
                specialInstructions,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                updatedById: parseInt(userId),
                active, branchId: parseInt(branchId)
            },
        });
        await (async function updateCuttingDetails() {
            let promises = cuttingDeliveryDetails.map(async (cuttingDetail) => {
                if (cuttingDetail.id) {
                    return await tx.cuttingDeliveryDetails.update({
                        where: {
                            id: parseInt(cuttingDetail.id)
                        },
                        data: {
                            cuttingDeliveryId: parseInt(data.id),
                            yarnId: cuttingDetail?.yarnId ? parseInt(cuttingDetail.yarnId) : undefined,
                            fabricId: cuttingDetail?.fabricId ? parseInt(cuttingDetail.fabricId) : undefined,
                            colorId: cuttingDetail?.colorId ? parseInt(cuttingDetail.colorId) : undefined,
                            uomId: cuttingDetail?.uomId ? parseInt(cuttingDetail.uomId) : undefined,
                            designId: cuttingDetail?.designId ? parseInt(cuttingDetail.designId) : undefined,
                            gaugeId: cuttingDetail?.gaugeId ? parseInt(cuttingDetail.gaugeId) : undefined,
                            loopLengthId: cuttingDetail?.loopLengthId ? parseInt(cuttingDetail.loopLengthId) : undefined,
                            gsmId: cuttingDetail?.gsmId ? parseInt(cuttingDetail.gsmId) : undefined,
                            sizeId: cuttingDetail?.sizeId ? parseInt(cuttingDetail.sizeId) : undefined,
                            kDiaId: cuttingDetail?.kDiaId ? parseInt(cuttingDetail.kDiaId) : undefined,
                            fDiaId: cuttingDetail?.fDiaId ? parseInt(cuttingDetail.fDiaId) : undefined,
                            lotNo: cuttingDetail?.lotNo ? cuttingDetail.lotNo : undefined,
                            delRolls: cuttingDetail?.delRolls ? parseInt(cuttingDetail.delRolls) : undefined,
                            delQty: parseFloat(cuttingDetail.delQty),
                            stockPrice: parseFloat(cuttingDetail.stockPrice),
                            // processId: cuttingDetail?.processId ? parseInt(cuttingDetail.processId) : undefined,
                            storeId: parseInt(cuttingDetail.storeId),
                            Stock: {
                                update: {
                                    itemType: "DyedFabric",
                                    inOrOut: "CuttingDelivery",
                                    branchId: parseInt(branchId),
                                    yarnId: cuttingDetail?.yarnId ? parseInt(cuttingDetail.yarnId) : undefined,
                                    fabricId: cuttingDetail?.fabricId ? parseInt(cuttingDetail.fabricId) : undefined,
                                    colorId: cuttingDetail?.colorId ? parseInt(cuttingDetail.colorId) : undefined,
                                    uomId: cuttingDetail?.uomId ? parseInt(cuttingDetail.uomId) : undefined,
                                    designId: cuttingDetail?.designId ? parseInt(cuttingDetail.designId) : undefined,
                                    gaugeId: cuttingDetail?.gaugeId ? parseInt(cuttingDetail.gaugeId) : undefined,
                                    loopLengthId: cuttingDetail?.loopLengthId ? parseInt(cuttingDetail.loopLengthId) : undefined,
                                    gsmId: cuttingDetail?.gsmId ? parseInt(cuttingDetail.gsmId) : undefined,
                                    sizeId: cuttingDetail?.sizeId ? parseInt(cuttingDetail.sizeId) : undefined,
                                    kDiaId: cuttingDetail?.kDiaId ? parseInt(cuttingDetail.kDiaId) : undefined,
                                    fDiaId: cuttingDetail?.fDiaId ? parseInt(cuttingDetail.fDiaId) : undefined,
                                    lotNo: cuttingDetail?.lotNo ? cuttingDetail.lotNo : undefined,
                                    noOfRolls: cuttingDetail?.delRolls ? 0 - parseInt(cuttingDetail.delRolls) : undefined,
                                    qty: 0 - parseFloat(cuttingDetail.delQty),
                                    price: parseFloat(cuttingDetail.stockPrice),
                                    storeId: parseInt(storeId),
                                    // processId: cuttingDetail.processId ? parseInt(cuttingDetail.processId) : undefined,
                                }
                            }
                        }
                    })
                } else {
                    return await tx.cuttingDeliveryDetails.create({
                        data: {
                            cuttingDeliveryId: parseInt(data.id),
                            yarnId: cuttingDetail?.yarnId ? parseInt(cuttingDetail.yarnId) : undefined,
                            fabricId: cuttingDetail?.fabricId ? parseInt(cuttingDetail.fabricId) : undefined,
                            colorId: cuttingDetail?.colorId ? parseInt(cuttingDetail.colorId) : undefined,
                            uomId: cuttingDetail?.uomId ? parseInt(cuttingDetail.uomId) : undefined,
                            designId: cuttingDetail?.designId ? parseInt(cuttingDetail.designId) : undefined,
                            gaugeId: cuttingDetail?.gaugeId ? parseInt(cuttingDetail.gaugeId) : undefined,
                            loopLengthId: cuttingDetail?.loopLengthId ? parseInt(cuttingDetail.loopLengthId) : undefined,
                            gsmId: cuttingDetail?.gsmId ? parseInt(cuttingDetail.gsmId) : undefined,
                            sizeId: cuttingDetail?.sizeId ? parseInt(cuttingDetail.sizeId) : undefined,
                            kDiaId: cuttingDetail?.kDiaId ? parseInt(cuttingDetail.kDiaId) : undefined,
                            fDiaId: cuttingDetail?.fDiaId ? parseInt(cuttingDetail.fDiaId) : undefined,
                            lotNo: cuttingDetail?.lotNo ? cuttingDetail.lotNo : undefined,
                            delRolls: cuttingDetail?.delRolls ? parseInt(cuttingDetail.delRolls) : undefined,
                            delQty: parseFloat(cuttingDetail.delQty),
                            stockPrice: parseFloat(cuttingDetail.stockPrice),
                            // processId: cuttingDetail?.processId ? parseInt(cuttingDetail.processId) : undefined,
                            storeId: parseInt(cuttingDetail.storeId),
                            Stock: {
                                create: {
                                    itemType: "DyedFabric",
                                    inOrOut: "CuttingDelivery",
                                    branchId: parseInt(branchId),
                                    yarnId: cuttingDetail?.yarnId ? parseInt(cuttingDetail.yarnId) : undefined,
                                    fabricId: cuttingDetail?.fabricId ? parseInt(cuttingDetail.fabricId) : undefined,
                                    colorId: cuttingDetail?.colorId ? parseInt(cuttingDetail.colorId) : undefined,
                                    uomId: cuttingDetail?.uomId ? parseInt(cuttingDetail.uomId) : undefined,
                                    designId: cuttingDetail?.designId ? parseInt(cuttingDetail.designId) : undefined,
                                    gaugeId: cuttingDetail?.gaugeId ? parseInt(cuttingDetail.gaugeId) : undefined,
                                    loopLengthId: cuttingDetail?.loopLengthId ? parseInt(cuttingDetail.loopLengthId) : undefined,
                                    gsmId: cuttingDetail?.gsmId ? parseInt(cuttingDetail.gsmId) : undefined,
                                    sizeId: cuttingDetail?.sizeId ? parseInt(cuttingDetail.sizeId) : undefined,
                                    kDiaId: cuttingDetail?.kDiaId ? parseInt(cuttingDetail.kDiaId) : undefined,
                                    fDiaId: cuttingDetail?.fDiaId ? parseInt(cuttingDetail.fDiaId) : undefined,
                                    lotNo: cuttingDetail?.lotNo ? cuttingDetail.lotNo : undefined,
                                    noOfRolls: cuttingDetail?.delRolls ? 0 - parseInt(cuttingDetail.delRolls) : undefined,
                                    qty: 0 - parseFloat(cuttingDetail.delQty),
                                    price: parseFloat(cuttingDetail.stockPrice),
                                    storeId: parseInt(storeId),
                                    // processId: cuttingDetail.processId ? parseInt(cuttingDetail.processId) : undefined,
                                }
                            }
                        }
                    })
                }

            })
            return Promise.all(promises)
        })()
        await dataIntegrityValidation(tx);
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.cuttingDelivery.delete({
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
