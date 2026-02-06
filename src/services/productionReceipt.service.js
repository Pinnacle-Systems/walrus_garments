import { NoRecordFound } from '../configs/Responses.js';
import { getTableRecordWithId } from '../utils/helperQueries.js';
import { getDateFromDateTime, getYearShortCodeForFinYear, getYearShortCode } from '../utils/helper.js';
import { groupByMultipleKeys } from '../utils/groupbyMultipleKeys.js';
import { getFinYearStartTimeEndTime } from '../utils/finYearHelper.js';
import dataIntegrityValidation from "../validators/DataIntegregityValidation/index.js";
import { getProductionReceiptDetails, getProductionReceiptDetailsForPacking } from '../utils/directInwardReturnQueries.js';
import { prisma } from '../lib/prisma.js';


async function getNextDocId(branchId, shortCode, startTime, endTime) {
    let lastObject = await prisma.productionReceipt.findFirst({
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
    let newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/PDR/1`
    if (lastObject) {
        newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/PDR/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
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
        searchDocId, searchDelDate, searchSupplierAliasName, searchStyle, searchCuttingOrderDocId, finYearId
    } = req.query
    let data;
    let totalCount;
    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    if (pagination) {
        data = await prisma.productionReceipt.findMany({
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
                docId: Boolean(searchDocId) ?
                    {
                        contains: searchDocId
                    }
                    : undefined,
                Supplier: Boolean(searchSupplierAliasName) ? {
                    name: { contains: searchSupplierAliasName }
                } : undefined,
            },
            orderBy: {
                id: "desc"
            },
            include: {
                Supplier: {
                    select: {
                        aliasName: true,
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
        data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)
    } else {

        data = await prisma.productionReceipt.findMany({
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
    const data = await prisma.productionReceipt.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            Order: true,
            PrevProcess: {
                select: {
                    isPacking: true,
                    isStitching: true

                }
            },
            Supplier: {
                select: {
                    aliasName: true,
                    name: true
                }
            },
            ProductionDelivery: {
                select: {
                    productionType: true
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
            PrevProcess: {
                select: {
                    name: true
                }
            },
            productionReceiptDetails: {
                include: {
                    ProductionDeliveryDetails: true,
                    lossDetails: true,
                    productionConsumptionDetails: {
                        select: {
                            lossDetails: true,
                            colorId: true,
                            itemId: true,
                            sizeId: true,
                            panelId: true,
                            Item: true,
                            Color: true,
                            Size: true,
                            Panel: true

                        }
                    },
                    Class: {
                        select: {
                            name: true
                        }
                    },
                    Item: {
                        select: {
                            name: true
                        }
                    },
                    Size: {
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
    })
    if (!data) return NoRecordFound("Production Receipt");
    // if (data?.PrevProcess?.isPacking) {
    // let items = data.productionReceiptDetails.map(i => ({
    //     ...i, colorId: i.colorId,
    //     sizeId: i.sizeId,
    //     classId: i.classId
    // }))
    // const groupedItems = groupByMultipleKeys(items, ["classId", "sizeId"]);
    // console.log(groupedItems, "groupedItems")



    //     const groupBy = (array, key) => {
    //         return array.reduce((result, item) => {
    //             const groupKey = item[key];
    //             if (!result[groupKey]) {
    //                 result[groupKey] = { classId: groupKey, items: [] };
    //             }
    //             result[groupKey].items.push(item);
    //             return result;
    //         }, {});
    //     };




    //     let groupData = (Object.values(groupBy(data?.productionReceiptDetails, "classId")))

    //     console.log(groupData, "groupDatagroupData")


    //     data["ProductionReceiptDetails"] = groupData

    // }

    data["productionReceiptDetails"] = await getProductionReceiptDetails(data.id, data?.productionReceiptDetails, data?.orderId, data?.PrevProcess?.isStitching, data?.prevProcessId)



    // if (data?.PrevProcess?.isPacking) {

    //     data["productionReceiptDetails"] = await getProductionReceiptDetailsForPacking(data.id, data?.productionReceiptDetails, data?.orderId, data?.prevProcessId, data)

    // }

    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}


async function getSearch(req) {
    const { companyId, active } = req.query
    const { searchKey } = req.params
    const data = await prisma.productionReceipt.findMany({
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



async function createProductionReceiptConsuptionDetails(tx, productionReceiptDetailsId, productionConsumptionDetails, lossDetails, prevProcessId) {

    let promises = productionConsumptionDetails.map(async (temp, index) => {
        await tx.productionConsumptionDetails.create({
            data: {
                productionReceiptDetailsId: parseInt(productionReceiptDetailsId),
                colorId: temp?.colorId ? parseInt(temp?.colorId) : undefined,
                itemId: temp?.itemId ? parseInt(temp?.itemId) : undefined,
                sizeId: temp?.sizeId ? parseInt(temp?.sizeId) : undefined,
                panelId: temp?.panelId ? parseInt(temp?.panelId) : undefined,
                panelColorId: temp.panelColorId ? parseInt(temp.panelColorId) : undefined,
                consumption: temp?.consumption ? parseFloat(temp?.consumption) : 0,
                prevProcessId: prevProcessId ? parseInt(prevProcessId) : undefined,
                isPackingOver: temp?.isPackingOver,
                lossDetails: lossDetails ? {
                    createMany: {
                        data: lossDetails?.filter(j => j.lossQty)?.map(lossItem => ({ lossReasonId: parseInt(lossItem.lossReasonId), lossQty: parseFloat(lossItem.lossQty) }))
                    }
                } : undefined

            }
        })
    }
    )

    return Promise.all(promises)
}




async function createProductionReceiptDetailsForSet(tx, productionReceiptDetails, productionReceipt, isStitching, orderId, isPacking, isIroning) {

    let productionReceiptArray = []

    for (let i = 0; i < productionReceiptDetails?.length; i++) {
        let receiptObj = productionReceiptDetails[i]

        if (receiptObj?.totalInwardQty > 0) {
            for (let j = 0; j < receiptObj?.maleSet?.length; j++) {
                let maleObj = receiptObj?.maleSet[j]
                let newObj = {
                    ...receiptObj,
                    receivedQty: parseFloat(receiptObj?.totalInwardQty),
                    colorId: maleObj?.isMaleColorId ? parseInt(maleObj?.isMaleColorId) : undefined,
                    itemId: maleObj?.isMaleItemId ? parseInt(maleObj?.isMaleItemId) : undefined,
                    // readyQty: maleObj?.readyQty ? parseInt(maleObj?.readyQty + ) : undefined,
                    sizeId: receiptObj?.sizeId ? parseInt(receiptObj?.sizeId) : undefined,
                    classId: receiptObj?.classId ? parseInt(receiptObj?.classId) : undefined,
                    productionConsumptionDetails: [
                        {
                            colorId: maleObj?.isMaleColorId ? parseInt(maleObj?.isMaleColorId) : undefined,
                            itemId: maleObj?.isMaleItemId ? parseInt(maleObj?.isMaleItemId) : undefined,
                            sizeId: receiptObj?.sizeId ? parseInt(receiptObj?.sizeId) : undefined,

                            consumption: receiptObj?.totalInwardQty ? parseFloat(receiptObj?.totalInwardQty) : 0,
                        }
                    ]
                }
                productionReceiptArray.push(newObj)
            }
        }

        else if (receiptObj?.maleInwardQty > 0) {
            for (let j = 0; j < receiptObj?.maleSet?.length; j++) {
                let maleObj = receiptObj?.maleSet[j]
                let newObj = {
                    ...receiptObj,
                    receivedQty: parseFloat(receiptObj?.maleInwardQty),
                    colorId: maleObj?.isMaleColorId ? parseInt(maleObj?.isMaleColorId) : undefined,
                    itemId: maleObj?.isMaleItemId ? parseInt(maleObj?.isMaleItemId) : undefined,
                    readyQty: maleObj?.readyQty ? parseInt(maleObj?.readyQty) : undefined,
                    sizeId: receiptObj?.sizeId ? parseInt(receiptObj?.sizeId) : undefined,
                    classId: receiptObj?.classId ? parseInt(receiptObj?.classId) : undefined,
                    productionConsumptionDetails: [
                        {
                            colorId: maleObj?.isMaleColorId ? parseInt(maleObj?.isMaleColorId) : undefined,
                            itemId: maleObj?.isMaleItemId ? parseInt(maleObj?.isMaleItemId) : undefined,
                            sizeId: receiptObj?.sizeId ? parseInt(receiptObj?.sizeId) : undefined,

                            consumption: receiptObj?.maleInwardQty ? parseFloat(receiptObj?.maleInwardQty) : 0,
                        }
                    ]
                }
                productionReceiptArray.push(newObj)
            }
        }

        else if (receiptObj?.femaleInwardQty > 0) {
            for (let j = 0; j < receiptObj?.femaleSet?.length; j++) {
                let femaleObj = receiptObj?.femaleSet[j]
                let newObj = {
                    ...receiptObj,
                    receivedQty: parseFloat(receiptObj?.femaleInwardQty),
                    colorId: femaleObj?.isFemaleColorId ? parseInt(femaleObj?.isFemaleColorId) : undefined,
                    itemId: femaleObj?.isfeMaleItemId ? parseInt(femaleObj?.isfeMaleItemId) : undefined,
                    readyQty: femaleObj?.readyQty ? parseInt(femaleObj?.readyQty) : undefined,
                    sizeId: receiptObj?.sizeId ? parseInt(receiptObj?.sizeId) : undefined,
                    classId: receiptObj?.classId ? parseInt(receiptObj?.classId) : undefined,
                    productionConsumptionDetails: [
                        {
                            colorId: femaleObj?.isfemaleColorId ? parseInt(femaleObj?.isfemaleColorId) : undefined,
                            itemId: femaleObj?.isfeMaleItemId ? parseInt(femaleObj?.isfeMaleItemId) : undefined,
                            sizeId: receiptObj?.sizeId ? parseInt(receiptObj?.sizeId) : undefined,

                            consumption: receiptObj?.femaleInwardQty ? parseFloat(receiptObj?.femaleInwardQty) : 0,
                        }
                    ]
                }

                productionReceiptArray.push(newObj)
            }
        }

        else if (receiptObj?.receivedQty > 0) {
            let newObj = {
                ...receiptObj,
                receivedQty: parseFloat(receiptObj?.receivedQty),
                colorId: receiptObj?.colorId ? parseInt(receiptObj?.colorId) : undefined,
                itemId: receiptObj?.itemId ? parseInt(receiptObj?.itemId) : undefined,
                // readyQty: maleObj?.readyQty ? parseInt(maleObj?.readyQty + ) : undefined,
                sizeId: receiptObj?.sizeId ? parseInt(receiptObj?.sizeId) : undefined,
                classId: receiptObj?.classId ? parseInt(receiptObj?.classId) : undefined,
                productionConsumptionDetails: [
                    {
                        colorId: receiptObj?.colorId ? parseInt(receiptObj?.colorId) : undefined,
                        itemId: receiptObj?.itemId ? parseInt(receiptObj?.itemId) : undefined,
                        sizeId: receiptObj?.sizeId ? parseInt(receiptObj?.sizeId) : undefined,

                        consumption: receiptObj?.receivedQty ? parseFloat(receiptObj?.receivedQty) : 0,
                    }
                ]
            }
            productionReceiptArray.push(newObj)

        }
        else {
            continue
        }

    }

    return Promise.all(productionReceiptArray)
}



async function createProductionReceiptDetails(tx, productionReceiptDetails, productionReceipt, isStitching, orderId, isPacking, isIroning) {




    const promises = productionReceiptDetails.map(async (item) => {
        // const productionDeliveryDetail = await getTableRecordWithId(item.productionDeliveryDetailsId, "productionDeliveryDetails")

        const data = await tx.productionReceiptDetails.create({
            data: {
                productionReceiptId: parseInt(productionReceipt.id),
                productionDeliveryDetailsId: item.productionDeliveryDetailsId ? parseInt(item.productionDeliveryDetailsId) : undefined,
                receivedQty: parseInt(item.receivedQty),
                colorId: item?.colorId ? parseInt(item?.colorId) : undefined,
                classId: item?.classId ? parseInt(item?.classId) : undefined,
                itemId: item?.itemId ? parseInt(item?.itemId) : undefined,
                readyQty: item?.readyQty ? parseInt(item?.readyQty) : undefined,
                sizeId: item?.sizeId ? parseInt(item?.sizeId) : undefined,
                panelId: item?.panelId ? parseInt(item?.panelId) : undefined,
                panelColorId: item.panelColorId ? parseInt(item.panelColorId) : undefined,
                box: item?.box ? parseInt(item?.box) : undefined,
                processCost: item?.processCost ? parseFloat(item?.processCost) : undefined,
                maleInwardQty: item?.maleInwardQty ? parseFloat(item?.maleInwardQty) : undefined,
                femaleInwardQty: item?.femaleInwardQty ? parseFloat(item?.femaleInwardQty) : undefined,
                isPackingOver: item?.isPackingOver,
                lossDetails: item?.lossDetails ? {
                    createMany: {
                        data: item?.lossDetails?.filter(j => j.lossQty)?.map(lossItem => ({
                            lossReasonId: parseInt(lossItem.lossReasonId),
                            lossQty: parseFloat(lossItem.lossQty)
                        }))
                    }
                } : undefined,
                StockForPanels: {
                    create: {
                        inOrOut: "In",
                        prevProcessId: parseInt(productionReceipt.prevProcessId),
                        orderId: parseInt(orderId),
                        colorId: item?.colorId ? parseInt(item?.colorId) : undefined,
                        itemId: item?.itemId ? parseInt(item?.itemId) : undefined,
                        sizeId: item?.sizeId ? parseInt(item?.sizeId) : undefined,
                        panelId: item?.panelId ? parseInt(item?.panelId) : undefined,
                        panelColorId: item.panelColorId ? parseInt(item.panelColorId) : undefined,
                        storeId: parseInt(productionReceipt.storeId),
                        branchId: parseInt(productionReceipt.branchId),
                        qty: parseInt(item.receivedQty),
                        stage: (isStitching || isIroning || isPacking) ? "Stitching" : "Panel",
                        isPackingOver: item?.isPackingOver,
                    }
                }
            }
        })

        return await createProductionReceiptConsuptionDetails(tx, data?.id, item?.productionConsumptionDetails, item?.lossDetails, productionReceipt?.prevProcessId)
    }
    )
    return Promise.all(promises)
}

async function createProductionReceiptDetailsForPacking(tx, productionReceiptDetails, productionReceipt, productionDelivery, styleOnPortion, orderId) {
    const promises = productionReceiptDetails.map(async (item) => {
        const productionDeliveryDetail = await getTableRecordWithId(item.productionDeliveryDetailsId, "productionDeliveryDetails")
        const productionDeliveryDetails = await tx.productionDeliveryDetails.findMany({
            where: {
                productionDeliveryId: parseInt(productionDelivery.id),
                colorId: parseInt(productionDeliveryDetail.colorId),
                uomId: parseInt(productionDeliveryDetail.uomId),
                sizeId: parseInt(productionDeliveryDetail.sizeId),
            }
        })
        let innerPromises = productionDeliveryDetails.map(async (productionDeliveryDetailsItem, index) => {
            return await tx.productionReceiptDetails.create({
                data: {
                    productionReceiptId: parseInt(productionReceipt.id),
                    productionDeliveryDetailsId: parseInt(productionDeliveryDetailsItem.id),
                    receivedQty: parseInt(item.receivedQty),
                    lossDetails: {
                        createMany: {
                            data: (item?.lossDetails ? item.lossDetails : []).map(
                                lossItem => ({
                                    lossReasonId: parseInt(lossItem.lossReasonId),
                                    lossQty: parseFloat(lossItem.lossQty)
                                }))
                        }
                    },
                    StockForPcs: index === 0 ? {
                        create: {
                            inOrOut: "In",
                            orderId: parseInt(orderId),
                            prevProcessId: parseInt(productionDelivery.toProcessId),
                            colorId: parseInt(productionDeliveryDetail.colorId),
                            uomId: parseInt(productionDeliveryDetail.uomId),
                            styleId: parseInt(productionReceipt.styleId),
                            sizeId: parseInt(productionDeliveryDetail.sizeId),
                            storeId: parseInt(productionReceipt.storeId),
                            branchId: parseInt(productionReceipt.branchId),
                            qty: parseInt(item.receivedQty)
                        }
                    } : undefined
                }
            })
        })
        return Promise.all(innerPromises)
    })
    return Promise.all(promises)
}

async function create(body) {
    const { supplierId, deliveryId, branchId, active, userId, orderId, packingType, packingCategory,
        vehicleNo, remarks, productionDeliveryId, storeId, specialInstructions, productionReceiptDetails, supplierDc, prevProcessId,
        finYearId } = await body
    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    let newDocId = await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime)
    let data;

    const process = await getTableRecordWithId(prevProcessId, "process")
    const isStitching = process ? process.isStitching : false;
    const isPacking = process ? process.isPacking : false;
    const isIroning = process ? process.isIroning : false;

    await prisma.$transaction(async (tx) => {
        data = await tx.productionReceipt.create({
            data: {
                docId: newDocId,
                supplierId: supplierId ? parseInt(supplierId) : undefined,
                deliveryId: deliveryId ? parseInt(deliveryId) : undefined,
                packingType: packingType ? packingType : undefined,
                packingCategory: packingCategory ? packingCategory : undefined,
                orderId: parseInt(orderId),
                storeId: parseInt(storeId),
                branchId: parseInt(branchId),
                prevProcessId: parseInt(prevProcessId),
                vehicleNo,
                remarks,
                specialInstructions,
                createdById: parseInt(userId),
                active,
                supplierDc
            },
        });
        // if (isPacking && styleOnPortion.length > 0) {
        //     await createProductionReceiptDetailsForPacking(tx, productionReceiptDetails, data, productionDelivery, styleOnPortion)
        // }

        if (isPacking && ((packingCategory == "CLASSWISE" && packingType == "SET") || (packingCategory == "CLASSWISE" && packingType == "MIXED"))) {



            let productionReceiptDetailsForSet = await createProductionReceiptDetailsForSet(tx, productionReceiptDetails, data, isStitching, orderId, isPacking, isIroning)
            await createProductionReceiptDetails(tx, productionReceiptDetailsForSet, data, isStitching, orderId, isPacking, isIroning)
        }
        else {
            await createProductionReceiptDetails(tx, productionReceiptDetails, data, isStitching, orderId, isPacking, isIroning)
        }



        // await dataIntegrityValidation(tx);
    })
    return { statusCode: 0, data };
}


async function update(id, body) {
    const { supplierId, deliveryId, branchId, active, userId, orderId, packingType, packingCategory,
        vehicleNo, remarks, productionDeliveryId, storeId, specialInstructions, productionReceiptDetails, supplierDc, prevProcessId } = await body
    let data;
    const dataFound = await prisma.productionReceipt.findUnique({
        where: {
            id: parseInt(id)
        },
    })
    if (!dataFound) return NoRecordFound("productionReceipt");
    // const productionDelivery = await getTableRecordWithId(productionDeliveryId, "productionDelivery")
    const process = await getTableRecordWithId(prevProcessId, "process")

    const isStitching = process ? process.isStitching : false;
    const isPacking = process ? process.isPacking : false;
    const isIroning = process ? process.isIroning : false;
    // const styleOnPortion = await prisma.styleOnPortion.findMany({
    //     where: {
    //         styleId: parseInt(styleId)
    //     }
    // })
    await prisma.$transaction(async (tx) => {
        data = await tx.productionReceipt.update({
            where: {
                id: parseInt(id),
            },
            data: {
                supplierId: supplierId ? parseInt(supplierId) : undefined,
                deliveryId: deliveryId ? parseInt(deliveryId) : undefined,
                packingType: packingType ? packingType : undefined,
                packingCategory: packingCategory ? packingCategory : undefined,
                orderId: parseInt(orderId),
                storeId: parseInt(storeId),
                branchId: parseInt(branchId),
                prevProcessId: parseInt(prevProcessId),
                vehicleNo,
                remarks,
                specialInstructions,
                createdById: parseInt(userId),
                active,
                supplierDc,
                productionReceiptDetails: {
                    deleteMany: {}
                }
            }
        });



        if (isPacking && ((packingCategory == "CLASSWISE" && packingType == "SET") || (packingCategory == "CLASSWISE" && packingType == "MIXED"))) {

            let productionReceiptDetailsForSet = await createProductionReceiptDetailsForSet(tx, productionReceiptDetails, data, isStitching, orderId, isPacking, isIroning)
            await createProductionReceiptDetails(tx, productionReceiptDetailsForSet, data, isStitching, orderId, isPacking, isIroning)
        }
        else {
            await createProductionReceiptDetails(tx, productionReceiptDetails, data, isStitching, orderId, isPacking, isIroning)
        }
        // await dataIntegrityValidation(tx);
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.productionReceipt.delete({
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
