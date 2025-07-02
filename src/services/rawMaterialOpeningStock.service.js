// import prisma from "../models/getPrisma.js"
import { NoRecordFound } from '../configs/Responses.js';
import { getTableRecordWithId } from '../utils/helperQueries.js';
import { getDateFromDateTime, getYearShortCode, getYearShortCodeForFinYear } from '../utils/helper.js';
import { getFinYearStartTimeEndTime } from '../utils/finYearHelper.js';
import dataIntegrityValidation from "../validators/DataIntegregityValidation/index.js";
import { PrismaClient } from '@prisma/client'
import moment from 'moment';
const prisma = new PrismaClient()

async function getNextDocId(branchId, shortCode, startTime, endTime) {
    let lastObject = await prisma.rawMaterialOpeningStock.findFirst({
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
    let newDocId = `${branchObj.branchCode}/${getYearShortCode(new Date())}/OST/1`
    if (lastObject) {
        newDocId = `${branchObj.branchCode}/${getYearShortCode(new Date())}/OST/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
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
    const { branchId, active, pagination, pageNumber, dataPerPage,
        searchDocId, searchDelDate, searchDueDate, finYearId,stock,rawMaterialType,endDate,storeId
    } = req.query
  
    let data;
    let totalCount;
    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    data = await prisma.rawMaterialOpeningStock.findMany({
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
        },
        include: {
            Store: true,
            RawMaterialOpeningStockItems: true

        }
    });
    data = manualFilterSearchData(searchDelDate, searchDueDate, data)
    totalCount = data.length
    if (pagination) {
        data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)
    }
    let newDocId = await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime)
  

    let StockReport;
    console.log(req.query,"req")

    if (stock) {
      
    StockReport = await prisma.$queryRaw`
    SELECT * FROM stock WHERE createdAt < STR_TO_DATE(${endDate}, '%Y-%m-%d') AND itemType = ${rawMaterialType} AND storeId = ${storeId} ;
    `;
    
   
    }
   
 


    return { statusCode: 0, data, nextDocId: newDocId, totalCount,StockReport };
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.rawMaterialOpeningStock.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            Store: {
                select: {
                    locationId: true
                }
            },
            RawMaterialOpeningStockItems: true
        }
    })
    if (!data) return NoRecordFound("rawMaterialOpeningStock");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { companyId, active } = req.query
    const { searchKey } = req.params
    const data = await prisma.rawMaterialOpeningStock.findMany({
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
    const { branchId, active, rawMaterialOpeningStockItems, userId,
        storeId, rawMaterialType, finYearId } = await body
    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    let newDocId = await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime)
    let data;
    await prisma.$transaction(async (tx) => {
        data = await tx.rawMaterialOpeningStock.create({
            data: {
                docId: newDocId,
                storeId: parseInt(storeId),
                createdById: parseInt(userId),
                active, branchId: parseInt(branchId),
                rawMaterialType,
            },
        });
        await (async function createRawMaterialOpeningStockItems() {
            let promises = rawMaterialOpeningStockItems.map(async (stockDetail) => {
                return await tx.rawMaterialOpeningStockItems.create({
                    data: {
                        rawMaterialOpeningStockId: parseInt(data.id),
                        yarnId: stockDetail?.yarnId ? parseInt(stockDetail.yarnId) : null,
                        fabricId: stockDetail?.fabricId ? parseInt(stockDetail.fabricId) : null,
                        colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
                        accessoryId: stockDetail?.accessoryId ? parseInt(stockDetail.accessoryId) : null,
                        uomId: stockDetail?.uomId ? parseInt(stockDetail.uomId) : null,
                        designId: stockDetail?.designId ? parseInt(stockDetail.designId) : null,
                        gaugeId: stockDetail?.gaugeId ? parseInt(stockDetail.gaugeId) : null,
                        loopLengthId: stockDetail?.loopLengthId ? parseInt(stockDetail.loopLengthId) : null,
                        gsmId: stockDetail?.gsmId ? parseInt(stockDetail.gsmId) : null,
                        sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
                        kDiaId: stockDetail?.kDiaId ? parseInt(stockDetail.kDiaId) : null,
                        fDiaId: stockDetail?.fDiaId ? parseInt(stockDetail.fDiaId) : null,
                        lotNo: stockDetail?.lotNo ? stockDetail.lotNo.toString() : null,
                        noOfBags: stockDetail?.noOfBags ? parseInt(stockDetail.noOfBags) : null,
                        noOfRolls: stockDetail?.noOfRolls ? parseInt(stockDetail.noOfRolls) : null,
                        qty: parseFloat(stockDetail.qty),
                        price: parseFloat(stockDetail.price),
                        prevProcessId: stockDetail?.prevProcessId ? parseInt(stockDetail.prevProcessId) : null,
                        Stock: {
                            create: {
                                itemType: rawMaterialType,
                                inOrOut: "RawMaterialOpeningStock",
                                branchId: parseInt(branchId),
                                yarnId: stockDetail?.yarnId ? parseInt(stockDetail.yarnId) : null,
                                fabricId: stockDetail?.fabricId ? parseInt(stockDetail.fabricId) : null,
                                accessoryId: stockDetail?.accessoryId ? parseInt(stockDetail.accessoryId) : null,
                                colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
                                uomId: stockDetail?.uomId ? parseInt(stockDetail.uomId) : null,
                                designId: stockDetail?.designId ? parseInt(stockDetail.designId) : null,
                                gaugeId: stockDetail?.gaugeId ? parseInt(stockDetail.gaugeId) : null,
                                loopLengthId: stockDetail?.loopLengthId ? parseInt(stockDetail.loopLengthId) : null,
                                gsmId: stockDetail?.gsmId ? parseInt(stockDetail.gsmId) : null,
                                sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
                                kDiaId: stockDetail?.kDiaId ? parseInt(stockDetail.kDiaId) : null,
                                fDiaId: stockDetail?.fDiaId ? parseInt(stockDetail.fDiaId) : null,
                                lotNo: stockDetail?.lotNo ? stockDetail.lotNo.toString() : null,
                                noOfBags: stockDetail?.noOfBags ? parseInt(stockDetail.noOfBags) : null,
                                noOfRolls: stockDetail?.noOfRolls ? parseInt(stockDetail.noOfRolls) : null,
                                qty: parseFloat(stockDetail.qty),
                                price: parseFloat(stockDetail.price),
                                storeId: parseInt(storeId),
                                processId: stockDetail?.prevProcessId ? parseInt(stockDetail.prevProcessId) : null,
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

function findRemovedItems(dataFound, rawMaterialOpeningStockItems) {
    let removedItems = dataFound.RawMaterialOpeningStockItems.filter(oldItem => {
        let result = rawMaterialOpeningStockItems.find(newItem => parseInt(newItem.id) === parseInt(oldItem.id))
        if (result) return false
        return true
    })
    return removedItems
}

async function deleteItemsFromStock(tx, removeItemsStockIds) {
    return await tx.stock.deleteMany({
        where: {
            id: {
                in: removeItemsStockIds
            }
        }
    })
}


async function update(id, body) {
    const { branchId, active, rawMaterialOpeningStockItems, userId,
        storeId, rawMaterialType } = await body
    let data;
    const dataFound = await prisma.rawMaterialOpeningStock.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            RawMaterialOpeningStockItems: {
                select: {
                    id: true
                }
            }
        }
    })
    if (!dataFound) return NoRecordFound("rawMaterialOpeningStock");
    let removedItems = findRemovedItems(dataFound, rawMaterialOpeningStockItems);
    let removeItemsIds = removedItems.map(item => parseInt(item.id))
    await prisma.$transaction(async (tx) => {
        await deleteItemsFromStock(tx, removeItemsIds);
        data = await tx.rawMaterialOpeningStock.update({
            where: {
                id: parseInt(id),
            },
            data: {
                storeId: parseInt(storeId),
                updatedById: parseInt(userId),
                active,
                branchId: parseInt(branchId),
                rawMaterialType,
            },
        });
        await (async function updateOpeningStockGridDetails() {
            let promises = rawMaterialOpeningStockItems.map(async (stockDetail) => {
                if (stockDetail.id) {
                    return await tx.rawMaterialOpeningStockItems.update({
                        where: {
                            id: parseInt(stockDetail.id)
                        },
                        data: {
                            yarnId: stockDetail?.yarnId ? parseInt(stockDetail.yarnId) : null,
                            fabricId: stockDetail?.fabricId ? parseInt(stockDetail.fabricId) : null,
                            accessoryId: stockDetail?.accessoryId ? parseInt(stockDetail.accessoryId) : null,
                            colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
                            uomId: stockDetail?.uomId ? parseInt(stockDetail.uomId) : null,
                            designId: stockDetail?.designId ? parseInt(stockDetail.designId) : null,
                            gaugeId: stockDetail?.gaugeId ? parseInt(stockDetail.gaugeId) : null,
                            loopLengthId: stockDetail?.loopLengthId ? parseInt(stockDetail.loopLengthId) : null,
                            gsmId: stockDetail?.gsmId ? parseInt(stockDetail.gsmId) : null,
                            sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
                            kDiaId: stockDetail?.kDiaId ? parseInt(stockDetail.kDiaId) : null,
                            fDiaId: stockDetail?.fDiaId ? parseInt(stockDetail.fDiaId) : null,
                            lotNo: stockDetail?.lotNo ? stockDetail.lotNo.toString() : null,
                            noOfBags: stockDetail?.noOfBags ? parseInt(stockDetail.noOfBags) : null,
                            noOfRolls: stockDetail?.noOfRolls ? parseInt(stockDetail.noOfRolls) : null,
                            qty: parseFloat(stockDetail.qty),
                            price: parseFloat(stockDetail.price),
                            prevProcessId: stockDetail?.prevProcessId ? parseInt(stockDetail.prevProcessId) : null,
                            Stock: {
                                update: {
                                    itemType: rawMaterialType,
                                    inOrOut: "RawMaterialOpeningStock",
                                    branchId: parseInt(branchId),
                                    yarnId: stockDetail?.yarnId ? parseInt(stockDetail.yarnId) : null,
                                    accessoryId: stockDetail?.accessoryId ? parseInt(stockDetail.accessoryId) : null,
                                    fabricId: stockDetail?.fabricId ? parseInt(stockDetail.fabricId) : null,
                                    colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
                                    uomId: stockDetail?.uomId ? parseInt(stockDetail.uomId) : null,
                                    designId: stockDetail?.designId ? parseInt(stockDetail.designId) : null,
                                    gaugeId: stockDetail?.gaugeId ? parseInt(stockDetail.gaugeId) : null,
                                    loopLengthId: stockDetail?.loopLengthId ? parseInt(stockDetail.loopLengthId) : null,
                                    gsmId: stockDetail?.gsmId ? parseInt(stockDetail.gsmId) : null,
                                    sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
                                    kDiaId: stockDetail?.kDiaId ? parseInt(stockDetail.kDiaId) : null,
                                    fDiaId: stockDetail?.fDiaId ? parseInt(stockDetail.fDiaId) : null,
                                    lotNo: stockDetail?.lotNo ? stockDetail.lotNo.toString() : null,
                                    noOfBags: stockDetail?.noOfBags ? parseInt(stockDetail.noOfBags) : null,
                                    noOfRolls: stockDetail?.noOfRolls ? parseInt(stockDetail.noOfRolls) : null,
                                    qty: parseFloat(stockDetail.qty),
                                    price: parseFloat(stockDetail.price),
                                    storeId: parseInt(storeId),
                                    processId: stockDetail.prevProcessId ? parseInt(stockDetail.prevProcessId) : null,
                                }
                            }
                        }
                    })
                } else {
                    return await tx.rawMaterialOpeningStockItems.create({
                        data: {
                            rawMaterialOpeningStockId: parseInt(data.id),
                            yarnId: stockDetail?.yarnId ? parseInt(stockDetail.yarnId) : null,
                            fabricId: stockDetail?.fabricId ? parseInt(stockDetail.fabricId) : null,
                            accessoryId: stockDetail?.accessoryId ? parseInt(stockDetail.accessoryId) : null,
                            colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
                            uomId: stockDetail?.uomId ? parseInt(stockDetail.uomId) : null,
                            designId: stockDetail?.designId ? parseInt(stockDetail.designId) : null,
                            gaugeId: stockDetail?.gaugeId ? parseInt(stockDetail.gaugeId) : null,
                            loopLengthId: stockDetail?.loopLengthId ? parseInt(stockDetail.loopLengthId) : null,
                            gsmId: stockDetail?.gsmId ? parseInt(stockDetail.gsmId) : null,
                            sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
                            kDiaId: stockDetail?.kDiaId ? parseInt(stockDetail.kDiaId) : null,
                            fDiaId: stockDetail?.fDiaId ? parseInt(stockDetail.fDiaId) : null,
                            lotNo: stockDetail?.lotNo ? stockDetail.lotNo.toString() : null,
                            noOfBags: stockDetail?.noOfBags ? parseInt(stockDetail.noOfBags) : null,
                            noOfRolls: stockDetail?.noOfRolls ? parseInt(stockDetail.noOfRolls) : null,
                            qty: parseFloat(stockDetail.qty),
                            price: parseFloat(stockDetail.price),
                            prevProcessId: stockDetail?.prevProcessId ? parseInt(stockDetail.prevProcessId) : null,
                            Stock: {
                                create: {
                                    itemType: rawMaterialType,
                                    inOrOut: "RawMaterialOpeningStock",
                                    branchId: parseInt(branchId),
                                    yarnId: stockDetail?.yarnId ? parseInt(stockDetail.yarnId) : null,
                                    accessoryId: stockDetail?.accessoryId ? parseInt(stockDetail.accessoryId) : null,
                                    fabricId: stockDetail?.fabricId ? parseInt(stockDetail.fabricId) : null,
                                    colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
                                    uomId: stockDetail?.uomId ? parseInt(stockDetail.uomId) : null,
                                    designId: stockDetail?.designId ? parseInt(stockDetail.designId) : null,
                                    gaugeId: stockDetail?.gaugeId ? parseInt(stockDetail.gaugeId) : null,
                                    loopLengthId: stockDetail?.loopLengthId ? parseInt(stockDetail.loopLengthId) : null,
                                    gsmId: stockDetail?.gsmId ? parseInt(stockDetail.gsmId) : null,
                                    sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
                                    kDiaId: stockDetail?.kDiaId ? parseInt(stockDetail.kDiaId) : null,
                                    fDiaId: stockDetail?.fDiaId ? parseInt(stockDetail.fDiaId) : null,
                                    lotNo: stockDetail?.lotNo ? stockDetail.lotNo.toString() : null,
                                    noOfBags: stockDetail?.noOfBags ? parseInt(stockDetail.noOfBags) : null,
                                    noOfRolls: stockDetail?.noOfRolls ? parseInt(stockDetail.noOfRolls) : null,
                                    qty: parseFloat(stockDetail.qty),
                                    price: parseFloat(stockDetail.price),
                                    storeId: parseInt(storeId),
                                    processId: stockDetail.prevProcessId ? parseInt(stockDetail.prevProcessId) : null,
                                }
                            }
                        }
                    })
                }

            })
            return Promise.all(promises)
        })()
        // await dataIntegrityValidation(tx);
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    console.log(id,"id")
    const data = await prisma.rawMaterialOpeningStock.delete({
        where: {
            id: parseInt(id)
        },
    })
    console.log(data,"data")

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
