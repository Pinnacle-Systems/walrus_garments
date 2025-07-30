import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';



import { billItemsFiltration, getDateFromDateTime, getRemovedItems, getYearShortCodeForFinYear, substract, balanceQtyCalculation, balanceReturnQtyCalculation, getYearShortCode } from '../utils/helper.js';
import { getTableRecordWithId } from "../utils/helperQueries.js"
import { createManyStockWithId, updateManyStockWithId } from '../utils/stockHelper.js';
import { getAllDataPoItems, getPoItemObject } from './po.service.js';
import { getCancelItemsAlreadyData, getDirectInwardReturnItemsAlreadyData, getDirectInwardReturnItemsLotBreakUp } from '../utils/directInwardReturnQueries.js';
import { getFinYearStartTimeEndTime } from '../utils/finYearHelper.js';
import dataIntegrityValidation from "../validators/DataIntegregityValidation/index.js";
const prisma = new PrismaClient()


async function getNextDocId(branchId, poInwardOrDirectInward, shortCode, startTime, endTime) {



    let lastObject = await prisma.purchaseCancel.findFirst({
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
    let newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/PC/1`
    if (lastObject) {
        newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/PC/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
    }
    return newDocId
}


function manualFilterSearchData(searchPoDate, searchDueDate, searchPoType, data) {
    return data.filter(item =>
        (searchPoDate ? String(getDateFromDateTime(item.createdAt)).includes(searchPoDate) : true) &&
        (searchDueDate ? String(getDateFromDateTime(item.dueDate)).includes(searchDueDate) : true) &&
        (searchPoType ? (item.poType.toLowerCase().includes(searchPoType.toLowerCase())) : true)
    )
}


async function get(req) {
    const { branchId, active, poInwardOrDirectInward, pageNumber, dataPerPage,
        searchDocId, searchPoDate, searchSupplierAliasName, searchPoType, searchDueDate, pagination, finYearId } = req.query
    let data;
    let totalCount;
    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    if (pagination) {
        data = await prisma.purchaseCancel.findMany({
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
                // poInwardOrDirectInward,
                docId: Boolean(searchDocId) ?
                    {
                        contains: searchDocId
                    }
                    : undefined,
                supplier: {
                    aliasName: Boolean(searchSupplierAliasName) ? { contains: searchSupplierAliasName } : undefined
                }
            },
            orderBy: {
                id: "desc",
            },
            include: {
                supplier: {
                    select: {
                        aliasName: true,
                        name: true,
                    }
                }
            }
        });
        data = manualFilterSearchData(searchPoDate, searchDueDate, searchPoType, data)
        totalCount = data.length
        data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)
    } else {
        data = await prisma.purchaseCancel.findMany({
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
                // poInwardOrDirectInward,
            }
        });
    }
    let docId = await getNextDocId(branchId, poInwardOrDirectInward, shortCode, finYearDate?.startTime, finYearDate?.endTime);
    return { statusCode: 0, data, nextDocId: docId, totalCount };
}



function manualFilterSearchDatacancelItems(searchPoDate, searchDueDate, searchPoType, data) {
    return data.filter(item =>
        (searchPoDate ? String(getDateFromDateTime(item.Po.createdAt)).includes(searchPoDate) : true) &&
        (searchDueDate ? String(getDateFromDateTime(item.Po.dueDate)).includes(searchDueDate) : true) &&
        (searchPoType ? (item.purchaseCancel.poType.toLowerCase().includes(searchPoType.toLowerCase())) : true)
    )
}

function manualFilterSearchDataPoItems(searchPoDate, searchDueDate, searchPoType, data) {
    return data.filter(item =>
        (searchPoDate ? String(getDateFromDateTime(item.Po.createdAt)).includes(searchPoDate) : true) &&
        (searchDueDate ? String(getDateFromDateTime(item.Po.dueDate)).includes(searchDueDate) : true) &&
        (searchPoType ? (item.Po.transType.toLowerCase().includes(searchPoType.toLowerCase())) : true)
    )
}




async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.purchaseCancel.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            cancelItems: {
                select: {
                    id: true,
                    Fabric: true,
                    fabricId: true,
                    Yarn: true,
                    yarnId: true,
                    Accessory: true,
                    accessoryId: true,
                    Color: true,
                    colorId: true,
                    Uom: true,
                    uomId: true,
                    Design: true,
                    Gauge: true,
                    LoopLength: true,
                    Gsm: true,
                    price: true,

                    Size: true,
                    designId: true,
                    gaugeId: true,
                    loopLengthId: true,
                    gsmId: true,
                    sizeId: true,
                    KDia: true,
                    kDiaId: true,
                    FDia: true,
                    fDiaId: true,
                    purchaseCancelId: true,

                    qty: true,


                    poNo: true,
                    poQty: true,

                    poItemsId: true,
                }
            }

        },
    })

console.log(data,"data")
    data["cancelItems"] = await getCancelItemsAlreadyData(data.id, "PurchaseCancel", data?.poType, data?.cancelItems)
    if (!data) return NoRecordFound("purchaseCancel");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { companyId, active } = req.query
    const { searchKey } = req.params
    const data = await prisma.purchaseCancel.findMany({
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

// async function createLotGridItems(tx, cancelItemsId, inwardLotDetails, item, poType, poInwardOrDirectInward, storeId, branchId) {
//     let processValid = false;
//     let promises = inwardLotDetails.map(async (temp, index) => {
//         await tx.inwardLotDetails.create({
//             data: {
//                 cancelItemsId: parseInt(cancelItemsId),
//                 lotNo: temp["lotNo"],
//                 qty: parseFloat(temp["qty"]),
//                 noOfRolls: parseInt(temp["noOfRolls"]),
//                 Stock: {
//                     create: {
//                         itemType: poType,
//                         inOrOut: poInwardOrDirectInward,
//                         branchId: parseInt(branchId),
//                         fabricId: item?.fabricId ? parseInt(item.fabricId) : undefined,
//                         colorId: item?.colorId ? parseInt(item.colorId) : undefined,
//                         uomId: item?.uomId ? parseInt(item.uomId) : undefined,
//                         designId: item?.designId ? parseInt(item.designId) : undefined,
//                         gaugeId: item?.gaugeId ? parseInt(item.gaugeId) : undefined,
//                         loopLengthId: item?.loopLengthId ? parseInt(item.loopLengthId) : undefined,
//                         gsmId: item?.gsmId ? parseInt(item.gsmId) : undefined,
//                         kDiaId: item?.kDiaId ? parseInt(item.kDiaId) : undefined,
//                         fDiaId: item?.fDiaId ? parseInt(item.fDiaId) : undefined,
//                         noOfBags: item?.noOfBags ? parseInt(item.noOfBags) : undefined,
//                         storeId: parseInt(storeId),
//                         noOfRolls: temp?.noOfRolls ? parseInt(temp.noOfRolls) : undefined,
//                         qty: parseFloat(temp.qty),
//                         lotNo: temp?.lotNo ? temp.lotNo : undefined,
//                     }
//                 }
//             }
//         })
//     }
//     )
//     await dataIntegrityValidation(tx, processValid = false);
//     return Promise.all(promises)
// }




async function createCancelItems(tx, purchaseCancelId, cancelItems, poType, poInwardOrDirectInward, storeId, branchId) {
    let promises

    console.log(poType == "DyedYarn"  ||  poType == "GreyYarn"  )
    if (poType == "DyedYarn"  ||  poType == "GreyYarn"   ) {

        promises = cancelItems.map(async (item, index) => {
            const data = await tx.cancelItems.create({
                data: {
                    purchaseCancelId: parseInt(purchaseCancelId),
                    yarnId: item["yarnId"] ? parseInt(item["yarnId"]) : undefined,
                    uomId: item["uomId"] ? parseInt(item["uomId"]) : undefined,
                    colorId: item["colorId"] ? parseInt(item["colorId"]) : undefined,
                    poQty: item["poQty"] ? parseFloat(item["poQty"]) : 0,
                    poNo: item["poNo"] ? item["poNo"] : undefined,
                    qty: item["qty"] ? parseFloat(item["qty"]) : 0,
                    price: item["price"] ? parseFloat(item["price"]) : 0,
                    poItemsId: item["poItemsId"] ? parseInt(item["poItemsId"]) : undefined,
                    // gsmId: item["gsmId"] ? parseInt(item["gsmId"]) : undefined,
                



                }
            })


        }
        )


    }
    else {

        promises = cancelItems.map(async (item, index) => {
            const data = await tx.cancelItems.create({
                data: {

                    purchaseCancelId :  purchaseCancelId  ?  parseInt(purchaseCancelId)  :  ""   ,
                    accessoryId  :  item["accessoryId"]   ?   parseInt(item["accessoryId"])  :  ""  ,
                    accessoryGroupId  :    item["accessoryGroupId"]   ?     parseInt(item["accessoryGroupId"])   :  ""  ,
                    accessoryItemId   :  item["accessoryItemId"] ?  parseInt(item["accessoryItemId"])   :  ""  ,
                    sizeId   :   item["sizeId"] ? parseInt(item["sizeId"]) : ""  ,
                    colorId: item["colorId"] ? parseInt(item["colorId"]) : "" ,
                    uomId: item["uomId"] ? parseInt(item["uomId"]) : "",

                    qty: item["qty"] ? parseFloat(item["qty"]) : 0,
                    price: item["price"] ? parseFloat(item["price"]) : 0,
                    poQty: item["poQty"] ? parseFloat(item["poQty"]) : 0,
                    poNo: item["poNo"] ? item["poNo"] : "",
                    poItemsId: item["poItemsId"] ? parseInt(item["poItemsId"]) : "",

                    // purchaseCancelId: parseInt(purchaseCancelId),
                    // accessoryId: parseInt(item["accessoryId"]),
                    // accessoryGroupId: parseInt(item["accessoryGroupId"]),
                    // accessoryItemId: parseInt(item["accessoryItemId"]),
                    // sizeId: item["sizeId"] ? parseInt(item["sizeId"]) : "",
                    // colorId: item["colorId"] ? parseInt(item["colorId"]) : "",
                   
            


                }
            })
        }



        )
    }



    return Promise.all(promises)
}


async function create(body) {
    const { poType, poInwardOrDirectInward,
        supplierId, cancelItems, dcNo, dcDate, storeId,
        payTermId,
        vehicleNo, specialInstructions, remarks,
        branchId, active, userId, finYearId } = await body
    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    let docId = await getNextDocId(branchId, poInwardOrDirectInward, shortCode, finYearDate?.startTime, finYearDate?.endTime);
    let data;
    let processValid;

    await prisma.$transaction(async (tx) => {

        data = await tx.purchaseCancel.create({
            data: {
                poType, poInwardOrDirectInward,
                supplierId: parseInt(supplierId),
                branchId: parseInt(branchId),

                active,
                createdById: parseInt(userId),
                remarks,
                docId

            },
        })
        await createCancelItems(tx, data.id, cancelItems, poType, poInwardOrDirectInward, branchId)
        // await dataIntegrityValidation(tx, processValid = false);
    })
    return { statusCode: 0, data };
}





// async function deletePurchaseInwardReturnItems(tx, removeItemsPurchaseInwardReturnIds) {
//     return await tx.cancelItems.deleteMany({
//         where: {
//             id: {
//                 in: removeItemsPurchaseInwardReturnIds
//             }
//         }
//     })
// }







// async function updateOrCreate(tx, item, purchaseCancelId, poType, poInwardOrDirectInward, storeId, branchId) {

//     if (item?.id) {

//         const updatedata = await tx.cancelItems.update({
//             where: {
//                 id: parseInt(item.id)
//             },
//             data: {
//                 purchaseCancelId: parseInt(purchaseCancelId),
//                 fabricId: item["fabricId"] ? parseInt(item["fabricId"]) : undefined,
//                 designId: item["designId"] ? parseInt(item["designId"]) : undefined,
//                 gaugeId: item["gaugeId"] ? parseInt(item["gaugeId"]) : undefined,
//                 loopLengthId: item["loopLengthId"] ? parseInt(item["loopLengthId"]) : undefined,
//                 gsmId: item["gsmId"] ? parseInt(item["gsmId"]) : undefined,
//                 kDiaId: item["kDiaId"] ? parseInt(item["kDiaId"]) : undefined,
//                 fDiaId: item["fDiaId"] ? parseInt(item["fDiaId"]) : undefined,
//                 uomId: item["uomId"] ? parseInt(item["uomId"]) : undefined,
//                 colorId: item["colorId"] ? parseInt(item["colorId"]) : undefined,
//                 qty: item["qty"] ? parseFloat(item["qty"]) : 0,

//                 poQty: item["poQty"] ? parseFloat(item["poQty"]) : 0,
//                 poNo: item["poNo"] ? item["poNo"] : undefined,
//                 noOfRolls: item["noOfRolls"] ? parseInt(item["noOfRolls"]) : 0,
//                 price: item["price"] ? parseFloat(item["price"]) : 0,
//                 poItemsId: item["poItemsId"] ? parseInt(item["poItemsId"]) : undefined,
//                 taxPercent: item["taxPercent"] ? parseFloat(item["taxPercent"]) : 0,
//                 inwardLotDetails: {
//                     deleteMany: {},
//                 }
//             }
//         })


//         return await createLotGridItems(tx, updatedata?.id, item?.inwardLotDetails, item, poType, poInwardOrDirectInward, storeId, branchId)

//     } else {
//         const data = await tx.cancelItems.create({
//             data: {
//                 purchaseCancelId: parseInt(purchaseCancelId),
//                 fabricId: item["fabricId"] ? parseInt(item["fabricId"]) : undefined,
//                 designId: item["designId"] ? parseInt(item["designId"]) : undefined,
//                 gaugeId: item["gaugeId"] ? parseInt(item["gaugeId"]) : undefined,
//                 loopLengthId: item["loopLengthId"] ? parseInt(item["loopLengthId"]) : undefined,
//                 gsmId: item["gsmId"] ? parseInt(item["gsmId"]) : undefined,
//                 kDiaId: item["kDiaId"] ? parseInt(item["kDiaId"]) : undefined,
//                 fDiaId: item["fDiaId"] ? parseInt(item["fDiaId"]) : undefined,
//                 uomId: item["uomId"] ? parseInt(item["uomId"]) : undefined,
//                 colorId: item["colorId"] ? parseInt(item["colorId"]) : undefined,
//                 qty: item["qty"] ? parseFloat(item["qty"]) : 0,

//                 poQty: item["poQty"] ? parseFloat(item["poQty"]) : 0,
//                 poNo: item["poNo"] ? item["poNo"] : undefined,

//                 price: item["price"] ? parseFloat(item["price"]) : 0,
//                 poItemsId: item["poItemsId"] ? parseInt(item["poItemsId"]) : undefined,
//                 taxPercent: item["taxPercent"] ? parseFloat(item["taxPercent"]) : 0,
//             }
//         })
//         return await createLotGridItems(tx, data?.id, item?.inwardLotDetails, item, poType, poInwardOrDirectInward, storeId, branchId)
//     }

// }

// async function updateAllPInwardReturnItems(tx, directInwardReturnItems, purchaseCancelId, poType, poInwardOrDirectInward, storeId, branchId) {
//     let promises = directInwardReturnItems.map(async (item) => await updateOrCreate(tx, item, purchaseCancelId, poType, poInwardOrDirectInward, storeId, branchId))
//     return Promise.all(promises)
// }

async function update(id, body) {

    let processValid = false;
    const { poType, poInwardOrDirectInward,
        supplierId, cancelItems,
        remarks,
        branchId, active, userId } = await body


    const dataFound = await prisma.purchaseCancel.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            cancelItems: true
        }
    })
    if (!dataFound) return NoRecordFound("purchaseCancel");
    let piData;

    await prisma.$transaction(async (tx) => {

        piData = await tx.purchaseCancel.update({
            where: {
                id: parseInt(id)
            },
            data: {
                poType, poInwardOrDirectInward,
                supplierId: parseInt(supplierId),
                branchId: parseInt(branchId),
                remarks,
                active,
                updatedById: parseInt(userId),
                cancelItems: {
                    deleteMany: {},
                    createMany: cancelItems?.length > 0 ? {
                        data: cancelItems.map(item => {

                            let newItem = {};
                            newItem["fabricId"] = item["fabricId"] ? parseInt(item["fabricId"]) : undefined,
                                newItem["accessoryId"] = item["accessoryId"] ? parseInt(item["accessoryId"]) : undefined,
                                accessoryGroupId = item["accessoryGroupId"] ? parseInt(item["accessoryGroupId"]) : undefined,
                                accessoryItemId = item["accessoryItemId"] ? parseInt(item["accessoryItemId"]) : undefined,
                                newItem["designId"] = item["designId"] ? parseInt(item["designId"]) : undefined,
                                newItem["gaugeId"] = item["gaugeId"] ? parseInt(item["gaugeId"]) : undefined,
                                newItem["loopLengthId"] = item["loopLengthId"] ? parseInt(item["loopLengthId"]) : undefined,
                                newItem["gsmId"] = item["gsmId"] ? parseInt(item["gsmId"]) : undefined,
                                newItem["kDiaId"] = item["kDiaId"] ? parseInt(item["kDiaId"]) : undefined,
                                newItem["fDiaId"] = item["fDiaId"] ? parseInt(item["fDiaId"]) : undefined,
                                newItem["uomId"] = item["uomId"] ? parseInt(item["uomId"]) : undefined,
                                newItem["colorId"] = item["colorId"] ? parseInt(item["colorId"]) : undefined,
                                newItem["qty"] = item["qty"] ? parseFloat(item["qty"]) : 0,
                                newItem["sizeId"] = item["sizeId"] ? parseInt(item["sizeId"]) : undefined,
                                newItem["poQty"] = item["poQty"] ? parseFloat(item["poQty"]) : 0,
                                newItem["poNo"] = item["poNo"] ? item["poNo"] : undefined,

                                newItem["price"] = item["price"] ? parseFloat(item["price"]) : 0,
                                newItem["poItemsId"] = item["poItemsId"] ? parseInt(item["poItemsId"]) : undefined;
                            return newItem
                        })
                    } : undefined
                }

            },
        })

        // await dataIntegrityValidation(tx, processValid = false);
    })
    return { statusCode: 0, data: piData };
}




async function remove(id) {
    const data = await prisma.purchaseCancel.delete({
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




// export async function getcancelItems(req) {
//     const { branchId, active, poInwardOrDirectInward, dataPerPage,
//         searchDocId, searchPoDate, searchSupplierAliasName, searchPoType, searchDueDate, isDirectInwardFilter, supplierId, poType, pagination, pageNumber,
//         isPurchaseCancelFilter = false, isPurchaseReturnFilter = false } = req.query
//     let data;
//     let totalCount;
//     if (pagination) {
//         data = await prisma.cancelItems.findMany({
//             where: {
//                 purchaseCancel:
//                 {
//                     branchId: branchId ? parseInt(branchId) : undefined,
//                     docId: Boolean(searchDocId) ?
//                         {
//                             contains: searchDocId
//                         }
//                         : undefined,
//                     supplierId: supplierId ? parseInt(supplierId) : undefined,
//                     poType,
//                     supplier: {
//                         aliasName: Boolean(searchSupplierAliasName) ? { contains: searchSupplierAliasName } : undefined
//                     }
//                 },
//             },
//             include: {
//                 purchaseCancel: {
//                     select: {
//                         poInwardOrDirectInward: true,
//                     }
//                 },
//                 DirectReturnItems: true,
//                 Yarn: {
//                     select: {
//                         aliasName: true
//                     }
//                 },
//                 Color: {
//                     select: {
//                         name: true
//                     }
//                 },
//                 Uom: {
//                     select: {
//                         name: true
//                     }
//                 },
//                 Fabric: {
//                     select: {
//                         aliasName: true
//                     }
//                 },
//                 Gauge: {
//                     select: {
//                         name: true
//                     }
//                 },
//                 LoopLength: {
//                     select: {
//                         name: true
//                     }
//                 },
//                 Design: {
//                     select: {
//                         name: true
//                     }
//                 },
//                 Gsm: {
//                     select: {
//                         name: true
//                     }
//                 },
//                 KDia: {
//                     select: {
//                         name: true
//                     }
//                 },
//                 FDia: {
//                     select: {
//                         name: true
//                     }
//                 },
//                 Accessory: {
//                     select: {
//                         aliasName: true,
//                         accessoryItem: {
//                             select: {
//                                 name: true,
//                                 AccessoryGroup: {
//                                     select: {
//                                         name: true
//                                     }
//                                 }
//                             }
//                         }
//                     }
//                 },
//                 Size: {
//                     select: {
//                         name: true
//                     }
//                 }
//             }
//         });
//         data = manualFilterSearchDatacancelItems(searchPoDate, searchDueDate, searchPoType, data)
//         totalCount = data.length
//         data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)
//         // data = await getAllDataPoItems(data)
//         data = await getAllDatacancelItems(data)


//         if (isDirectInwardFilter) {
//             data = data?.filter(val => val.purchaseCancel?.poInwardOrDirectInward == "DirectInward")?.filter(item => balanceReturnQtyCalculation(item.qty, 0, item.alreadyInwardedQty, item.alreadyReturnedData._sum?.qty) > 0)
//         }

//         if (isPurchaseCancelFilter) {
//             data = data.filter(item => balanceQtyCalculation(item.qty, item.alreadyCancelData._sum?.qty, item.alreadyInwardedData._sum?.qty, item.alreadyReturnedData._sum?.qty) > 0)
//         }
//         if (isPurchaseReturnFilter) {
//             data = data.filter(item => substract(item.alreadyInwardedData?._sum?.qty ? item.alreadyInwardedData._sum?.qty : 0, item.alreadyReturnedData?._sum?.qty ? item.alreadyReturnedData?._sum?.qty : 0) > 0)
//         }
//     } else {
//         data = await prisma.cancelItems.findMany({
//             where: {
//                 branchId: branchId ? parseInt(branchId) : undefined,
//                 active: active ? Boolean(active) : undefined,
//             }
//         });
//     }
//     return { statusCode: 0, data, totalCount };
// }

// export async function getAllDatacancelItems(data) {
//     let promises = data.map(async (item) => {
//         let data = await getDirectItemById(item.id, null, null, null, null)
//         return data.data
//     }
//     )
//     return Promise.all(promises)
// }

// export async function getDirectItemById(id, billEntryId, directReturnOrPoReturnId, storeId, stockId) {
//     let data = await prisma.cancelItems.findUnique({
//         where: {
//             id: parseInt(id)
//         },
//         include: {
//             inwardLotDetails: true,
//             DirectReturnItems: true,
//             purchaseCancel: {
//                 select: {
//                     docId: true,
//                     poInwardOrDirectInward: true,
//                     dcNo: true,
//                     dcDate: true,
//                     createdAt: true,
//                 }
//             },
//             Yarn: {
//                 select: {
//                     aliasName: true
//                 }
//             },
//             Color: {
//                 select: {
//                     name: true
//                 }
//             },
//             Uom: {
//                 select: {
//                     name: true
//                 }
//             },
//             Fabric: {
//                 select: {
//                     aliasName: true,
//                     name: true,
//                 }
//             },
//             Gauge: {
//                 select: {
//                     name: true
//                 }
//             },
//             LoopLength: {
//                 select: {
//                     name: true
//                 }
//             },
//             Design: {
//                 select: {
//                     name: true
//                 }
//             },
//             Gsm: {
//                 select: {
//                     name: true
//                 }
//             },
//             KDia: {
//                 select: {
//                     name: true
//                 }
//             },
//             FDia: {
//                 select: {
//                     name: true
//                 }
//             },
//             Accessory: {
//                 select: {
//                     aliasName: true,
//                     accessoryItem: {
//                         select: {
//                             name: true,
//                             AccessoryGroup: {
//                                 select: {
//                                     name: true
//                                 }
//                             }
//                         }
//                     }
//                 }
//             },
//             Size: {
//                 select: {
//                     name: true
//                 }
//             }
//         }
//     });




// const alreadyInwardedData = await prisma.cancelItems.aggregate({
//     where: {
//         poItemsId: parseInt(id),
//         purchaseCancel: {
//             poInwardOrDirectInward: "PurchaseInward"
//         },
//         purchaseCancelId: {
//             lt: JSON.parse(purchaseInwardReturnId) ? parseInt(purchaseInwardReturnId) : undefined
//         }
//     },
//     _sum: {
//         qty: true,
//         noOfBags: true,
//         noOfRolls: true
//     }
// });


// const alreadyReturnedData = await prisma.directReturnItems.aggregate({
//     where: {
//         cancelItemsId: parseInt(id),
//         DirectReturnOrPoReturn: {
//             poInwardOrDirectInward: "DirectReturn"
//         },
//         directReturnOrPoReturnId: {
//             lt: JSON.parse(directReturnOrPoReturnId) ? parseInt(directReturnOrPoReturnId) : undefined
//         }
//     },
//     _sum: {
//         qty: true,
//         noOfBags: true,
//         noOfRolls: true
//     }
// });



// const alreadyInwardedLotWiseData = data?.inwardLotDetails




// const alreadyInwardedLotWiseData = await prisma.cancelItems.groupBy({
//     where: {
//         poItemsId: parseInt(id),
//         purchaseCancel: {
//             poInwardOrDirectInward: "PurchaseInward"
//         },
//         purchaseCancelId: {
//             lt: JSON.parse(purchaseInwardReturnId) ? parseInt(purchaseInwardReturnId) : undefined
//         }
//     },
//     by: ["poItemsId"],
//     _sum: {
//         qty: true,
//         noOfBags: true,
//         noOfRolls: true
//     }
// });
// const alreadyReturnedLotWiseData = await prisma.directReturnItems.groupBy({
//     where: {
//         cancelItemsId: parseInt(id),
//         DirectReturnOrPoReturn: {
//             poInwardOrDirectInward: "DirectReturn"
//         },
//         directReturnOrPoReturnId: {
//             lt: JSON.parse(directReturnOrPoReturnId) ? parseInt(directReturnOrPoReturnId) : undefined
//         }
//     },
//     by: ["cancelItemsId"],
//     _sum: {
//         qty: true,
//         noOfBags: true,
//         noOfRolls: true
//     }
// });


// const alreadyInwardReturnLotWiseData = []

// const alreadyCancelData = await prisma.cancelItems.aggregate({
//     where: {
//         poItemsId: parseInt(id),
//         purchaseCancel: {
//             poInwardOrDirectInward: "PurchaseCancel"
//         },
//         purchaseCancelId: {
//             lt: JSON.parse(purchaseInwardReturnId) ? parseInt(purchaseInwardReturnId) : undefined
//         }
//     },
//     _sum: {
//         qty: true,
//         noOfBags: true,
//     }
// });




// let inwardQty = parseFloat(data?.qty || 0).toFixed(3)

// let alreadyInwardedQty = data?.qty ? parseFloat(data?.qty).toFixed(3) : "0.000";
// let alreadyReturnedQty = alreadyReturnedData?._sum?.qty ? parseFloat(alreadyReturnedData._sum?.qty).toFixed(3) : "0.000";

// let alreadyInwardedRolls = data?.noOfRolls ? parseInt(data?.noOfRolls) : "0";
// let alreadyReturnedRolls = alreadyReturnedData?._sum?.noOfRolls ? parseInt(alreadyReturnedData._sum?.noOfRolls) : "0";



// let balanceQty = substract(alreadyInwardedQty, alreadyReturnedQty)
// let allowedReturnRolls = substract(alreadyInwardedRolls, alreadyReturnedRolls)
// let allowedReturnQty = substract(alreadyInwardedQty, alreadyReturnedQty)
// let stockQty = substract(alreadyInwardedQty, alreadyReturnedQty)
// let stockRolls = substract(alreadyInwardedRolls, alreadyReturnedRolls)

// const poItemObj = getStockObject(data?.purchaseCancel?.poType, data)
// let stockData;
// if (data?.purchaseCancel?.poType === "Accessory") {
//     stockData = await prisma.stock.aggregate({
//         where: {
//             ...poItemObj,
//             storeId: JSON.parse(storeId) ? parseInt(storeId) : undefined,
//             id: {
//                 lt: JSON.parse(stockId) ? parseInt(stockId) : undefined
//             },

//         },
//         _sum: {
//             qty: true,
//             noOfBags: true,
//             noOfRolls: true
//         }
//     });
// } else {
//     stockData = await prisma.stock.groupBy({
//         where: {
//             ...poItemObj,
//             inOrOut: (data?.purchaseCancel?.poInwardOrDirectInward),
//             storeId: JSON.parse(storeId) ? parseInt(storeId) : undefined,
//             id: {
//                 lt: JSON.parse(stockId) ? parseInt(stockId) : undefined
//             },

//         },
//         by: ["yarnId", "colorId", "uomId", "fabricId", "gaugeId", "loopLengthId", "designId", "gsmId", "kDiaId", "fDiaId", "sizeId", "storeId", "branchId"],
//         _sum: {
//             qty: true,
//             noOfBags: true,
//             noOfRolls: true
//         }
//     });




//     alreadyInwardedLotWiseData.forEach(inItem => {
//         let newItem = {}
//         newItem["lotNo"] = inItem.lotNo
//         newItem["inwardBags"] = inItem?.noOfBags ? inItem?.noOfBags : 0
//         newItem["inwardRolls"] = inItem?.noOfRolls ? inItem?.noOfRolls : 0
//         newItem["inwardQty"] = inItem?.qty
//         let returnObjIndex = alreadyReturnedLotWiseData.findIndex(reItem => (inItem?.lotNo ? inItem?.lotNo : null) === (reItem?.lotNo ? reItem?.lotNo : null))
//         if (returnObjIndex === -1) {
//             newItem["returnBags"] = 0
//             newItem["returnRolls"] = 0
//             newItem["returnQty"] = 0
//         } else {
//             newItem["returnBags"] = alreadyReturnedLotWiseData[returnObjIndex]?._sum?.noOfBags ? alreadyReturnedLotWiseData[returnObjIndex]._sum?.noOfBags : 0
//             newItem["returnRolls"] = alreadyReturnedLotWiseData[returnObjIndex]?._sum?.noOfRolls ? alreadyReturnedLotWiseData[returnObjIndex]._sum?.noOfRolls : 0
//             newItem["returnQty"] = (alreadyReturnedLotWiseData[returnObjIndex]?._sum?.qty || 0)
//         }
//         let stockObjIndex = stockData.findIndex(stockItem => (inItem?.lotNo ? inItem?.lotNo : null) === (stockItem?.lotNo ? stockItem?.lotNo : null))
//         if (stockObjIndex === -1) {
//             newItem["stockBags"] = 0
//             newItem["stockRolls"] = 0
//             newItem["stockQty"] = 0
//         } else {
//             newItem["stockBags"] = stockData[stockObjIndex]?._sum?.noOfBags ? stockData[stockObjIndex]._sum?.noOfBags : 0
//             newItem["stockRolls"] = stockData[stockObjIndex]?._sum?.noOfRolls ? stockData[stockObjIndex]._sum?.noOfRolls : 0
//             newItem["stockQty"] = (stockData[stockObjIndex]?._sum?.qty || 0)
//         }
//         alreadyInwardReturnLotWiseData.push(newItem)
//     })
// }



// return {
//     statusCode: 0, data: {
//         ...data,
//         balanceQty,
//         inwardQty,
//         stockQty,
//         stockRolls,
//         allowedReturnRolls,
//         allowedReturnQty,
//         alreadyInwardedQty,
//         alreadyInwardedRolls,
//         alreadyReturnedQty,
//         alreadyReturnedData,
//         stockData,
//         alreadyInwardReturnLotWiseData
//     }
// };


// function getStockObject(transType, item, poInwardOrDirectInward = null) {
//     let newItem = {};
//     if ((transType === "GreyYarn") || (transType === "DyedYarn")) {
//         newItem["yarnId"] = parseInt(item["yarnId"]);
//     } else if ((transType === "GreyFabric") || (transType === "DyedFabric")) {
//         newItem["fabricId"] = parseInt(item["fabricId"]);
//         newItem["designId"] = parseInt(item["designId"]);
//         newItem["gaugeId"] = parseInt(item["gaugeId"]);
//         newItem["loopLengthId"] = parseInt(item["loopLengthId"]);
//         newItem["gsmId"] = parseInt(item["gsmId"]);
//         newItem["kDiaId"] = parseInt(item["kDiaId"]);
//         newItem["fDiaId"] = parseInt(item["fDiaId"]);
//     } else if (transType === "Accessory") {
//         newItem["accessoryId"] = parseInt(item["accessoryId"])
//         newItem["sizeId"] = item["sizeId"] ? parseInt(item["sizeId"]) : undefined;
//     }
//     newItem["uomId"] = parseInt(item["uomId"])
//     newItem["colorId"] = parseInt(item["colorId"])

//     return newItem
// }






// const alreadyBillData = await prisma.billEntryItems.aggregate({
//     where: {
//         cancelItemsId: parseInt(id),
//         billEntryId: {
//             lt: JSON.parse(billEntryId) ? parseInt(billEntryId) : undefined
//         }
//     },
//     _sum: {
//         qty: true,
//     }
// });

// return {
//     statusCode: 0, data: {
//         ...data,
//         alreadyBillData,
//     }
// };
// }


// export async function getPoItemsandDirectInwardItems(req) {
//     const { branchId, active, pageNumber, dataPerPage, poType,
//         searchDocId, searchPoDate, searchSupplierAliasName, searchPoType, searchDueDate, pagination, supplierId } = req.query
//     let poItems;
//     let cancelItems;
//     let data;
//     let totalCount;
//     if (pagination) {
//         cancelItems = await prisma.cancelItems.findMany({
//             where: {
//                 purchaseCancel:
//                 {
//                     branchId: branchId ? parseInt(branchId) : undefined,
//                     docId: Boolean(searchDocId) ?
//                         {
//                             contains: searchDocId
//                         }
//                         : undefined,
//                     supplierId: supplierId ? parseInt(supplierId) : undefined,
//                     poType,
//                     supplier: {
//                         aliasName: Boolean(searchSupplierAliasName) ? { contains: searchSupplierAliasName } : undefined
//                     }
//                 },
//             }
//         });
//         cancelItems = manualFilterSearchDatacancelItems(searchPoDate, searchDueDate, searchPoType, cancelItems)
//         poItems = await prisma.poItems.findMany({
//             where: {
//                 Po:
//                 {
//                     branchId: branchId ? parseInt(branchId) : undefined,
//                     docId: Boolean(searchDocId) ?
//                         {
//                             contains: searchDocId
//                         }
//                         : undefined,
//                     supplierId: supplierId ? parseInt(supplierId) : undefined,
//                     transType: poType,
//                     supplier: {
//                         aliasName: Boolean(searchSupplierAliasName) ? { contains: searchSupplierAliasName } : undefined
//                     }
//                 },
//             },
//             include: {
//                 Po: true,
//             }
//         });
//         poItems = manualFilterSearchDataPoItems(searchPoDate, searchDueDate, searchPoType, poItems)
//         poItems = await getAllDataPoItems(poItems)
//         poItems = poItems.filter(item =>
//             billItemsFiltration(
//                 item?.alreadyInwardedData?._sum?.qty ? item.alreadyInwardedData?._sum?.qty : 0,
//                 item?.alreadyReturnedData?._sum?.qty ? item.alreadyReturnedData._sum?.qty : 0))
//         poItems = poItems.map(item => { return { ...item, isPoItem: true } })
//         data = [...poItems, ...cancelItems]
//         totalCount = data.length
//         data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)
//         let poItemsAfterSlice = data.filter(item => item.isPoItem)
//         let cancelItemsAfterSlice = data.filter(item => !(item.isPoItem))
//         cancelItemsAfterSlice = await getAllDatacancelItems(cancelItemsAfterSlice)
//         data = [...cancelItemsAfterSlice, ...poItemsAfterSlice]
//     } else {
//         data = await prisma.cancelItems.findMany({
//             where: {
//                 branchId: branchId ? parseInt(branchId) : undefined,
//                 active: active ? Boolean(active) : undefined,
//             }
//         });
//     }
//     return { statusCode: 0, data, totalCount };
// }









// async function create(body) {
//     const { poType, poInwardOrDirectInward,
//         supplierId, directInwardReturnItems, dcNo, dcDate, storeId,
//         payTermId, taxTemplateId,
//         vehicleNo, specialInstructions, remarks,
//         branchId, active, userId, finYearId } = await body
//     let finYearDate = await getFinYearStartTimeEndTime(finYearId);
//     const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
//     let docId = await getNextDocId(branchId, poInwardOrDirectInward, shortCode, finYearDate?.startTime, finYearDate?.endTime);
//     let piData;
//     let directInwardReturnItemsMultipliedItems = [];
//     if (poType === "GreyYarn" || poType === "DyedYarn" || poType === "GreyFabric" || poType === "DyedFabric") {
//         directInwardReturnItems.forEach((poInwardReturn, lotNoCommonIndex) => {
//             poInwardReturn.lotDetails.forEach(lotItem => {
//                 let newItem = structuredClone(poInwardReturn)
//                 newItem["lotNoCommonIndex"] = lotNoCommonIndex;
//                 newItem["noOfBags"] = lotItem.noOfBags;
//                 newItem["noOfRolls"] = lotItem.noOfRolls;
//                 newItem["weightPerBag"] = lotItem.weightPerBag;
//                 newItem["qty"] = lotItem.qty;
//                 newItem["lotNo"] = lotItem.lotNo;
//                 newItem["stockId"] = lotItem.stockId;
//                 directInwardReturnItemsMultipliedItems.push(newItem)
//             })
//         });
//     } else {
//         directInwardReturnItemsMultipliedItems = structuredClone(directInwardReturnItems)
//     }
//     await prisma.$transaction(async (tx) => {
//         const itemsWithStockId = await createManyStockWithId(tx, poType, poInwardOrDirectInward, directInwardReturnItemsMultipliedItems, storeId, branchId);
//         piData = await tx.purchaseCancel.create({
//             data: {
//                 poType, poInwardOrDirectInward,
//                 supplierId: parseInt(supplierId),
//                 branchId: parseInt(branchId),
//                 storeId: parseInt(storeId),
//                 dcNo,
//                 payTermId: parseInt(payTermId),
//                 taxTemplateId: parseInt(taxTemplateId),
//                 dcDate: dcDate ? new Date(dcDate) : undefined,
//                 active,
//                 createdById: parseInt(userId),
//                 vehicleNo, specialInstructions, remarks,
//                 docId,
//                 cancelItems: {
//                     createMany: {
//                         data: itemsWithStockId.map(item => {
//                             let newItem = { ...getPoItemObject(poType, item) }
//                             if (item.hasOwnProperty("lotNoCommonIndex") && item["lotNoCommonIndex"] !== null) {
//                                 newItem["lotNoCommonIndex"] = parseInt(item.lotNoCommonIndex);
//                             }
//                             newItem["qty"] = parseFloat(item["qty"]);
//                             newItem["lotNo"] = item["lotNo"];
//                             if (poType === "GreyYarn" || poType === "DyedYarn") {
//                                 newItem["noOfBags"] = parseInt(item["noOfBags"]);
//                             } else if (poType === "GreyFabric" || poType === "DyedFabric") {
//                                 newItem["noOfRolls"] = parseInt(item["noOfRolls"]);
//                             }
//                             newItem["stockId"] = parseInt(item["stockId"]);
//                             return newItem
//                         })
//                     }
//                 }
//             },
//         })
//         await dataIntegrityValidation(tx);
//     })
//     return { statusCode: 0, data: piData };
// }






// function findRemovedItems(dataFound, directInwardReturnItems) {
//     let removedItems = dataFound.cancelItems.filter(oldItem => {
//         let result = directInwardReturnItems.find(newItem => newItem.id === oldItem.id)
//         if (result) return false
//         return true
//     })
//     return removedItems
// }

// async function deleteItemsFromStock(tx, removeItemsStockIds) {
//     return await tx.stock.deleteMany({
//         where: {
//             id: {
//                 in: removeItemsStockIds
//             }
//         }
//     })
// }

// async function deletePurchaseInwardReturnItems(tx, removeItemsPurchaseInwardReturnIds) {
//     return await tx.cancelItems.deleteMany({
//         where: {
//             id: {
//                 in: removeItemsPurchaseInwardReturnIds
//             }
//         }
//     })
// }



// async function updateOrCreate(tx, item, purchaseCancelId, poType) {
//     let newItem = { ...getPoItemObject(poType, item) }
//     newItem["qty"] = parseFloat(item["qty"]);
//     newItem["lotNo"] = item["lotNo"];
//     if (item.hasOwnProperty("lotNoCommonIndex") && item["lotNoCommonIndex"] !== null) {
//         newItem["lotNoCommonIndex"] = parseInt(item.lotNoCommonIndex);
//     }
//     if (poType === "GreyYarn" || poType === "DyedYarn") {
//         newItem["noOfBags"] = parseInt(item["noOfBags"]);
//         newItem["weightPerBag"] = parseFloat(item["weightPerBag"]);
//     } else if (poType === "GreyFabric" || poType === "DyedFabric") {
//         newItem["noOfRolls"] = parseInt(item["noOfRolls"]);
//     }
//     newItem["stockId"] = parseInt(item["stockId"]);
//     if (item?.id) {
//         await tx.cancelItems.update({
//             where: {
//                 id: parseInt(item.id)
//             },
//             data: newItem
//         })
//     } else {
//         await tx.cancelItems.create({
//             data: {
//                 ...newItem,
//                 purchaseCancelId: parseInt(purchaseCancelId)
//             }
//         })
//     }
//     return newItem
// }

// async function updateAllPInwardReturnItems(tx, directInwardReturnItems, purchaseCancelId, poType) {
//     let promises = directInwardReturnItems.map(async (item) => await updateOrCreate(tx, item, purchaseCancelId, poType))
//     return Promise.all(promises)
// }

// async function update(id, body) {
//     const { poType, poInwardOrDirectInward,
//         supplierId, directInwardReturnItems, dcNo, dcDate, storeId,
//         vehicleNo, specialInstructions, remarks,
//         branchId, active, userId } = await body
//     const dataFound = await prisma.purchaseCancel.findUnique({
//         where: {
//             id: parseInt(id)
//         },
//         include: {
//             cancelItems: true
//         }
//     })
//     if (!dataFound) return NoRecordFound("purchaseCancel");
//     let piData;
//     let directInwardReturnItemsMultipliedItems = [];
//     if (poType === "GreyYarn" || poType === "DyedYarn" || poType === "GreyFabric" || poType === "DyedFabric") {
//         directInwardReturnItems.forEach((poInwardReturn, lotNoCommonIndex) => {
//             poInwardReturn.lotDetails.forEach(lotItem => {
//                 let newItem = structuredClone(poInwardReturn)
//                 newItem["id"] = lotItem.id;
//                 newItem["lotNoCommonIndex"] = lotNoCommonIndex;
//                 newItem["noOfRolls"] = lotItem.noOfRolls;
//                 newItem["noOfBags"] = lotItem.noOfBags;
//                 newItem["weightPerBag"] = lotItem.weightPerBag;
//                 newItem["qty"] = lotItem.qty;
//                 newItem["lotNo"] = lotItem.lotNo;
//                 newItem["stockId"] = lotItem.stockId;
//                 directInwardReturnItemsMultipliedItems.push(newItem)
//             })
//         });
//     } else {
//         directInwardReturnItemsMultipliedItems = structuredClone(directInwardReturnItems)
//     }
//     let removedItems = findRemovedItems(dataFound, directInwardReturnItemsMultipliedItems);
//     let removeItemsStockIds = removedItems.map(item => parseInt(item.stockId))
//     let removeItemsPurchaseInwardReturnIds = removedItems.map(item => parseInt(item.id))
//     await prisma.$transaction(async (tx) => {
//         const itemsWithStockId = await updateManyStockWithId(tx, poType, poInwardOrDirectInward, directInwardReturnItemsMultipliedItems, storeId, branchId);
//         await deleteItemsFromStock(tx, removeItemsStockIds);
//         await deletePurchaseInwardReturnItems(tx, removeItemsPurchaseInwardReturnIds);
//         piData = await tx.purchaseCancel.update({
//             where: {
//                 id: parseInt(id)
//             },
//             data: {
//                 poType, poInwardOrDirectInward,
//                 supplierId: parseInt(supplierId),
//                 branchId: parseInt(branchId),
//                 storeId: parseInt(storeId),
//                 dcNo,
//                 dcDate: dcDate ? new Date(dcDate) : undefined,
//                 vehicleNo, specialInstructions, remarks,
//                 active,
//                 updatedById: parseInt(userId),
//             },
//         })
//         await updateAllPInwardReturnItems(tx, itemsWithStockId, piData.id, poType)
//         await dataIntegrityValidation(tx);
//     })
//     return { statusCode: 0, data: piData };
// }









