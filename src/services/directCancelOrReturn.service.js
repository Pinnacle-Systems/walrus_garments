import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';
import { billItemsFiltration, getDateFromDateTime, getRemovedItems, getYearShortCode, getYearShortCodeForFinYear } from '../utils/helper.js';
import { getTableRecordWithId } from "../utils/helperQueries.js"
import { createManyStockWithId, updateManyStockWithId } from '../utils/stockHelper.js';
import { getAllDataPoItems, getPoItemObject } from './po.service.js';
import { getDirectInwardReturnItemsLotBreakUp, getPurchaseReturnItemsAlreadyData } from '../utils/directInwardReturnQueries.js';
import { getFinYearStartTimeEndTime } from '../utils/finYearHelper.js';
import dataIntegrityValidation from "../validators/DataIntegregityValidation/index.js";
const prisma = new PrismaClient()
function getInwardOrReturnShortCode(poInwardOrDirectInward) {
    switch (poInwardOrDirectInward) {
        case "PurchaseReturn":
            return "RET"
        case "DirectReturn":
            return "DRET"
        default:
            break;
    }
}

async function getNextDocId(branchId, poInwardOrDirectInward, shortCode, startTime, endTime) {

    let lastObject = await prisma.directReturnOrPoReturn.findFirst({
        where: {
            poInwardOrDirectInward,
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
    let newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/${getInwardOrReturnShortCode(poInwardOrDirectInward)}/1`
    if (lastObject) {
        newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/${getInwardOrReturnShortCode(poInwardOrDirectInward)}/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
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
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startDateStartTime, finYearDate?.endDateEndTime) : "";
    console.log(poInwardOrDirectInward,"poInwardOrDirectInward")
    if (pagination) {
        data = await prisma.directReturnOrPoReturn.findMany({
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
                poInwardOrDirectInward,
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
                    supplier : {
                        select : {
                            name : true,
                            
                        }
                    }
            }
        });
        data = manualFilterSearchData(searchPoDate, searchDueDate, searchPoType, data)
        totalCount = data.length
        data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)
    } else {
        data = await prisma.directReturnOrPoReturn.findMany({
            where: {
                AND: (finYearDate) ? [
                    {
                        createdAt: {
                            gte: finYearDate.startDateStartTime

                        }
                    },
                    {
                        createdAt: {
                            lte: finYearDate.endDateEndTime
                        }
                    }
                ] : undefined,
                branchId: branchId ? parseInt(branchId) : undefined,
                active: active ? Boolean(active) : undefined,
                // poInwardOrDirectInward,
            },
            orderBy: {
                id: "desc",
            },
            include : {
                supplier : {
                    select : {
                        name : true
                    }
                }
            }
        });
    }
    let docId = await getNextDocId(branchId, poInwardOrDirectInward, shortCode, finYearDate?.startTime, finYearDate?.endTime);
    return { statusCode: 0, data, nextDocId: docId, totalCount };
}


export async function getDirectReturnItems(req) {
    const { branchId, active, poInwardOrDirectInward, pageNumber, dataPerPage,
        searchDocId, searchPoDate, searchSupplierAliasName, searchPoType, searchDueDate, pagination } = req.query
    if (pagination) {
        data = await prisma.directReturnItems.findMany({
            where: {
                DirectReturnOrPoReturn:
                {
                    branchId: branchId ? parseInt(branchId) : undefined,
                    docId: Boolean(searchDocId) ?
                        {
                            contains: searchDocId
                        }
                        : undefined,
                    supplierId: supplierId ? parseInt(supplierId) : undefined,
                    poType,
                    supplier: {
                        aliasName: Boolean(searchSupplierAliasName) ? { contains: searchSupplierAliasName } : undefined
                    }
                },
            },
            include: {
                Yarn: {
                    select: {
                        aliasName: true
                    }
                },
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
                        aliasName: true
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
                },
                Accessory: {
                    select: {
                        aliasName: true,
                        accessoryItem: {
                            select: {
                                name: true,
                                AccessoryGroup: {
                                    select: {
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                },
                Size: {
                    select: {
                        name: true
                    }
                }
            }
        });
        data = manualFilterSearchDataDirectItems(searchPoDate, searchDueDate, searchPoType, data)
        totalCount = data.length
        data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)
        data = await getAllDataPoItems(data)
        if (isPurchaseInwardFilter) {
            data = data.filter(item => balanceQtyCalculation(item.qty, item.alreadyCancelData._sum.qty, item.alreadyInwardedData._sum.qty, item.alreadyReturnedData._sum.qty) > 0)
        }
        if (isPurchaseCancelFilter) {
            data = data.filter(item => balanceQtyCalculation(item.qty, item.alreadyCancelData._sum.qty, item.alreadyInwardedData._sum.qty, item.alreadyReturnedData._sum.qty) > 0)
        }
        if (isPurchaseReturnFilter) {
            data = data.filter(item => substract(item.alreadyInwardedData?._sum?.qty ? item.alreadyInwardedData._sum.qty : 0, item.alreadyReturnedData?._sum?.qty ? item.alreadyReturnedData?._sum?.qty : 0) > 0)
        }
    } else {
        data = await prisma.directReturnItems.findMany({
            where: {
                branchId: branchId ? parseInt(branchId) : undefined,
                active: active ? Boolean(active) : undefined,
            }
        });
    }
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

function manualFilterSearchDataDirectItems(searchPoDate, searchDueDate, searchPoType, data) {
    return data.filter(item =>
        (searchPoDate ? String(getDateFromDateTime(item.Po.createdAt)).includes(searchPoDate) : true) &&
        (searchDueDate ? String(getDateFromDateTime(item.Po.dueDate)).includes(searchDueDate) : true) &&
        (searchPoType ? (item.DirectReturnOrPoReturn.poType.toLowerCase().includes(searchPoType.toLowerCase())) : true)
    )
}

function manualFilterSearchDataPoItems(searchPoDate, searchDueDate, searchPoType, data) {
    return data.filter(item =>
        (searchPoDate ? String(getDateFromDateTime(item.Po.createdAt)).includes(searchPoDate) : true) &&
        (searchDueDate ? String(getDateFromDateTime(item.Po.dueDate)).includes(searchDueDate) : true) &&
        (searchPoType ? (item.Po.transType.toLowerCase().includes(searchPoType.toLowerCase())) : true)
    )
}

export async function getAllDataDirectItems(data) {
    let promises = data.map(async (item) => {
        let data = await getDirectReturnItemById(item.id, null)
        return data.data
    }
    )
    return Promise.all(promises)
}

export async function getDirectReturnItemById(id, billEntryId) {
    let data = await prisma.directReturnItems.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            DirectReturnOrPoReturn: true,
            Yarn: {
                select: {
                    aliasName: true
                }
            },
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
                    aliasName: true
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
            },
            Accessory: {
                select: {
                    aliasName: true,
                    accessoryItem: {
                        select: {
                            name: true,
                            AccessoryGroup: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                }
            },
            Size: {
                select: {
                    name: true
                }
            }
        }
    });

    // const alreadyBillData = await prisma.billEntryItems.aggregate({
    //     where: {
    //         directItemsId: parseInt(id),
    //         billEntryId: {
    //             lt: JSON.parse(billEntryId) ? parseInt(billEntryId) : undefined
    //         }
    //     },
    //     _sum: {
    //         qty: true,
    //     }
    // });

    return {
        statusCode: 0, data: {
            ...data,
            // alreadyBillData,
        }
    };
}


export async function getPoItemsandDirectReturnItems(req) {
    const { branchId, active, pageNumber, dataPerPage, poType,
        searchDocId, searchPoDate, searchSupplierAliasName, searchPoType, searchDueDate, pagination, supplierId } = req.query
    let poItems;
    let directItems;
    let data;
    let totalCount;
    if (pagination) {
        directItems = await prisma.directReturnItems.findMany({
            where: {
                DirectReturnOrPoReturn:
                {
                    branchId: branchId ? parseInt(branchId) : undefined,
                    docId: Boolean(searchDocId) ?
                        {
                            contains: searchDocId
                        }
                        : undefined,
                    supplierId: supplierId ? parseInt(supplierId) : undefined,
                    poType,
                    supplier: {
                        aliasName: Boolean(searchSupplierAliasName) ? { contains: searchSupplierAliasName } : undefined
                    }
                },
            }
        });
        directItems = manualFilterSearchDataDirectItems(searchPoDate, searchDueDate, searchPoType, directItems)
        poItems = await prisma.poItems.findMany({
            where: {
                Po:
                {
                    branchId: branchId ? parseInt(branchId) : undefined,
                    docId: Boolean(searchDocId) ?
                        {
                            contains: searchDocId
                        }
                        : undefined,
                    supplierId: supplierId ? parseInt(supplierId) : undefined,
                    transType: poType,
                    supplier: {
                        aliasName: Boolean(searchSupplierAliasName) ? { contains: searchSupplierAliasName } : undefined
                    }
                },
            },
            include: {
                Po: true,
            }
        });
        poItems = manualFilterSearchDataPoItems(searchPoDate, searchDueDate, searchPoType, poItems)
        poItems = await getAllDataPoItems(poItems)
        poItems = poItems.filter(item =>
            billItemsFiltration(
                item?.alreadyInwardedData?._sum?.qty ? item.alreadyInwardedData?._sum?.qty : 0,
                item?.alreadyReturnedData?._sum?.qty ? item.alreadyReturnedData._sum.qty : 0))
        poItems = poItems.map(item => { return { ...item, isPoItem: true } })
        data = [...poItems, ...directItems]
        totalCount = data.length
        data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)
        let poItemsAfterSlice = data.filter(item => item.isPoItem)
        let directItemsAfterSlice = data.filter(item => !(item.isPoItem))
        directItemsAfterSlice = await getAllDataDirectItems(directItemsAfterSlice)
        data = [...directItemsAfterSlice, ...poItemsAfterSlice]
    } else {
        data = await prisma.directReturnItems.findMany({
            where: {
                branchId: branchId ? parseInt(branchId) : undefined,
                active: active ? Boolean(active) : undefined,
            }
        });
    }
    return { statusCode: 0, data, totalCount };
}



async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.directReturnOrPoReturn.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            Store: {
                select: {
                    locationId: true,
                    storeName:true,
                }
            },
            Branch:{
                select:{
                    branchName:true
                }
            },
            supplier:{
                select:{
                    name:true
                }
            },
            PayTerm: true,
            directReturnItems: {
                select: {
                    id: true,
                    Fabric: true,
                    fabricId: true,
                    Yarn: true,
                    yarnId: true,
                    Accessory: true,
                    accessoryId: true,
                    accessoryGroupId: true,
                    accessoryItemId: true,
                    Color: true,
                    colorId: true,
                    Uom: true,
                    uomId: true,
                    Design: true,
                    Gauge: true,
                    LoopLength: true,
                    Gsm: true,
                    price: true,
                    discountType: true,
                    discountValue: true,
                    taxPercent: true,
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
                    directReturnOrPoReturnId: true,
                    weightPerBag: true,
                    noOfBags: true,
                    noOfRolls: true,
                    qty: true,

                    poNo: true,
                    poQty: true,
                    returnLotDetails: {
                        select: {
                            id: true,
                            directReturnItemsId: true,
                            lotNo: true,
                            qty: true,
                            noOfRolls: true,
                            // Stock: true
                        }
                    },
                    poItemsId: true,
                    directItemsId: true
                }
            }

        },
    })

    console.log(data , 'data')
    // data["DirectItems"] = await getDirectInwardReturnItemsLotBreakUp(data.id, data.poType)
    data["directReturnItems"] = await getPurchaseReturnItemsAlreadyData(data.id, data.poInwardOrDirectInward, data?.poType, data?.directReturnItems, data?.storeId, data?.createdAt)
    if (!data) return NoRecordFound("directReturnOrPoReturn");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { companyId, active } = req.query
    const { searchKey } = req.params
    const data = await prisma.directCancelOrReturn.findMany({
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

// async function createReturnLotGridItems(tx, directReturnItemsId, returnLotDetails, item, poType, poInwardOrDirectInward, storeId, branchId) {

//     let promises = returnLotDetails?.filter(item => parseFloat(item.qty) !== 0).map(async (temp, index) => {
//         await tx.returnLotDetails.create({
//             data: {
//                 directReturnItemsId: parseInt(directReturnItemsId),
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
//                         qty: temp.qty ? 0 - parseFloat(temp.qty) : undefined,
//                         price: parseFloat(item.price),
//                         lotNo: temp?.lotNo ? temp.lotNo : undefined,
//                     }
//                 }
//             }
//         })
//     }
//     )
//     // await dataIntegrityValidation(tx, processValid);
//     return Promise.all(promises)
// }



async function createAccessoryStock(tx, poType, poInwardOrDirectInward, branchId, storeId, item) {

    await tx.stock.create({
        data: {
            itemType: poType,
            inOrOut: poInwardOrDirectInward,
            branchId: parseInt(branchId),
            sizeId: item?.sizeId ? parseInt(item?.sizeId) : undefined,
            accessoryId: item?.accessoryId ? parseInt(item.accessoryId) : undefined,
            accessoryGroupId: item?.accessoryGroupId ? parseInt(item.accessoryGroupId) : undefined,
            accessoryItemId: item?.accessoryItemId ? parseInt(item.accessoryItemId) : undefined,
            colorId: item?.colorId ? parseInt(item.colorId) : undefined,
            uomId: item?.uomId ? parseInt(item.uomId) : undefined,
            storeId: parseInt(storeId),
            qty: item.returnQty ? 0 - parseFloat(item.returnQty) : undefined,
            price: parseFloat(item.price)
        }
    })

}
async function createYarnStock(tx, poType, poInwardOrDirectInward, branchId, storeId, item) {

    await tx.stock.create({
        data: {
                    itemType: poType,
                    inOrOut: poInwardOrDirectInward,
                    yarnId: item["yarnId"] ? parseInt(item["yarnId"]) : undefined,
                    // weightPerBag: item["weightPerBag"] ? parseInt(item["weightPerBag"]) : undefined,
                    // discountType: item["discountType"] ? (item["discountType"]) : undefined,
                    noOfBags: item["noOfBags"] ? parseInt(item["noOfBags"]) : undefined,
                    gsmId: item["gsmId"] ? parseInt(item["gsmId"]) : undefined,
                    kDiaId: item["kDiaId"] ? parseInt(item["kDiaId"]) : undefined,
                    fDiaId: item["fDiaId"] ? parseInt(item["fDiaId"]) : undefined,
                    uomId: item["uomId"] ? parseInt(item["uomId"]) : undefined,
                    colorId: item["colorId"] ? parseInt(item["colorId"]) : undefined,
                    qty: item["returnQty"] ?  0 - parseFloat(item["returnQty"]) : 0,

                    // poNo: item["poNo"] ? item["poNo"] : undefined,
                    // noOfRolls: item["noOfRolls"] ? parseInt(item["noOfRolls"]) : 0,
                    price: item["price"] ? parseFloat(item["price"]) : 0,
                    // poItemsId: item["poItemsId"] ? parseInt(item["poItemsId"]) : undefined,
                    // taxPercent: item["taxPercent"] ? parseFloat(item["taxPercent"]) : 0,
        }
    })

}



async function createDirectInwardReturnItems(tx, directReturnOrPoReturnId, directReturnItems, poType, poInwardOrDirectInward, storeId, branchId) {
    console.log(((poType == "DyedYarn" || poType == "GreyYarn" ) && (poInwardOrDirectInward == "PurchaseReturn")),"condition")
    let promises

    if ((poType == "DyedYarn" || poType == "GreyYarn" ) && (poInwardOrDirectInward == "PurchaseReturn")) {
        
        promises = directReturnItems.map(async (item, index) => {
            let data = await tx.directReturnItems.create({
                data: {
                    directReturnOrPoReturnId: parseInt(directReturnOrPoReturnId),
                    yarnId: item["yarnId"] ? parseInt(item["yarnId"]) : undefined,
                    weightPerBag: item["weightPerBag"] ? parseInt(item["weightPerBag"]) : undefined,
                    discountType: item["discountType"] ? (item["discountType"]) : undefined,
                    noOfBags: item["noOfBags"] ? parseInt(item["noOfBags"]) : undefined,
                    gsmId: item["gsmId"] ? parseInt(item["gsmId"]) : undefined,
                    kDiaId: item["kDiaId"] ? parseInt(item["kDiaId"]) : undefined,
                    fDiaId: item["fDiaId"] ? parseInt(item["fDiaId"]) : undefined,
                    uomId: item["uomId"] ? parseInt(item["uomId"]) : undefined,
                    colorId: item["colorId"] ? parseInt(item["colorId"]) : undefined,
                    qty: item["returnQty"] ?  parseFloat(item["returnQty"]) : 0,

                    poQty: item["poQty"] ? parseFloat(item["poQty"]) : 0,
                    poNo: item["poNo"] ? item["poNo"] : undefined,
                    directItemsId: item["directItemsId"] ? parseInt(item["directItemsId"]) : undefined,
                    price: item["price"] ? parseFloat(item["price"]) : 0,
                    poItemsId: item["poItemsId"] ? parseInt(item["poItemsId"]) : undefined,
                    directItemsId: item["poItemsId"] ? parseInt(item["poItemsId"]) : undefined,

                    taxPercent: item["taxPercent"] ? parseFloat(item["taxPercent"]) : 0,
                    alreadyInwardedQty : item["alreadyInwardedQty"]  ?   parseInt(item["alreadyInwardedQty"])   :  undefined  ,
                    alreadyReturnedQty : item["alreadyReturnedQty"]  ?   parseInt(item["alreadyReturnedQty"])   :  undefined  ,
                    balanceQty : item["balanceQty"]  ?   parseInt(item["balanceQty"])   :  undefined  ,
                    cancelQty : item["cancelQty"]  ?   parseInt(item["cancelQty"])   :  undefined  ,
                   
                }
            })
            // return await createReturnLotGridItems(tx, data?.id, item?.returnLotDetails, item, poType, poInwardOrDirectInward, storeId, branchId)
                await createYarnStock(tx, poType, poInwardOrDirectInward, branchId, storeId, item)

        }
        )


    }

    else if ((poType == "DyedYarn" || poType == "GreyYarn" ) && (poInwardOrDirectInward == "DirectReturn")) {
        promises = directReturnItems.map(async (item, index) => {
            let data = await tx.directReturnItems.create({
                data: {
                     directReturnOrPoReturnId: parseInt(directReturnOrPoReturnId),
                    yarnId: item["yarnId"] ? parseInt(item["yarnId"]) : undefined,
                    weightPerBag: item["weightPerBag"] ? parseInt(item["weightPerBag"]) : undefined,
                    discountType: item["discountType"] ? (item["discountType"]) : undefined,
                    noOfBags: item["noOfBags"] ? parseInt(item["noOfBags"]) : undefined,
                    gsmId: item["gsmId"] ? parseInt(item["gsmId"]) : undefined,
                    kDiaId: item["kDiaId"] ? parseInt(item["kDiaId"]) : undefined,
                    fDiaId: item["fDiaId"] ? parseInt(item["fDiaId"]) : undefined,
                    uomId: item["uomId"] ? parseInt(item["uomId"]) : undefined,
                    colorId: item["colorId"] ? parseInt(item["colorId"]) : undefined,
                    qty: item["returnQty"] ? parseFloat(item["returnQty"]) : 0,

                    poQty: item["poQty"] ? parseFloat(item["poQty"]) : 0,
                    poNo: item["poNo"] ? item["poNo"] : undefined,
                    // noOfRolls: item["noOfRolls"] ? parseInt(item["noOfRolls"]) : 0,
                    price: item["price"] ? parseFloat(item["price"]) : 0,

                    directItemsId: item["poItemsId"] ? parseInt(item["poItemsId"]) : undefined,
                    taxPercent: item["taxPercent"] ? parseFloat(item["taxPercent"]) : 0,
                }
            })
            // return await createReturnLotGridItems(tx, data?.id, item?.returnLotDetails, item, poType, poInwardOrDirectInward, storeId, branchId)
                await createYarnStock(tx, poType, poInwardOrDirectInward, branchId, storeId, item)

        }
        )
    }

   
        if ((poType == "Accessory") && (poInwardOrDirectInward == "PurchaseReturn")) {
            promises = directReturnItems.map(async (item, index) => {
                console.log(item["returnQty"] ? true : false);
                
                let data = await tx.directReturnItems.create({
                    data: {
                        directReturnOrPoReturnId: parseInt(directReturnOrPoReturnId),
                        accessoryId: parseInt(item["accessoryId"]),
                        accessoryGroupId: parseInt(item["accessoryGroupId"]),
                        accessoryItemId: parseInt(item["accessoryItemId"]),
                        sizeId: item["sizeId"] ? parseInt(item["sizeId"]) : undefined,
                        uomId: item["uomId"] ? parseInt(item["uomId"]) : undefined,
                        colorId: item["colorId"] ? parseInt(item["colorId"]) : undefined,
                        qty: item["returnQty"] ? parseFloat(item["returnQty"]) : 0,
                        price: item["price"] ? parseFloat(item["price"]) : 0,
                        taxPercent: item["taxPercent"] ? parseFloat(item["taxPercent"]) : 0,
                        poQty: item["poQty"] ? parseFloat(item["poQty"]) : 0,
                        poNo: item["poNo"] ? item["poNo"] : undefined,
                        poItemsId: item["poItemsId"] ? parseInt(item["poItemsId"]) : undefined,
                        // Stock: {
                        //     create: {
                        //         itemType: poType,
                        //         inOrOut: poInwardOrDirectInward,
                        //         branchId: parseInt(branchId),
                        //         sizeId: item?.sizeId ? parseInt(item?.sizeId) : undefined,
                        //         accessoryId: item?.accessoryId ? parseInt(item.accessoryId) : undefined,
                        //         accessoryGroupId: item?.accessoryGroupId ? parseInt(item.accessoryGroupId) : undefined,
                        //         accessoryItemId: item?.accessoryItemId ? parseInt(item.accessoryItemId) : undefined,
                        //         colorId: item?.colorId ? parseInt(item.colorId) : undefined,
                        //         uomId: item?.uomId ? parseInt(item.uomId) : undefined,
                        //         storeId: parseInt(storeId),
                        //         qty: item.qty ? 0 - parseFloat(item.qty) : 0,
                        //         price: parseFloat(item.price)
                        //     }
                        // }
                    }
                })
                await createAccessoryStock(tx, poType, poInwardOrDirectInward, branchId, storeId, item)
            }
            )

        }
        else {
            promises = directReturnItems.map(async (item, index) => {
                let data = await tx.directReturnItems.create({
                    data: {
                        directReturnOrPoReturnId: parseInt(directReturnOrPoReturnId),
                        accessoryId: parseInt(item["accessoryId"]),
                        accessoryGroupId: parseInt(item["accessoryGroupId"]),
                        accessoryItemId: parseInt(item["accessoryItemId"]),
                        sizeId: item["sizeId"] ? parseInt(item["sizeId"]) : undefined,
                        uomId: item["uomId"] ? parseInt(item["uomId"]) : undefined,
                        colorId: item["colorId"] ? parseInt(item["colorId"]) : undefined,
                        qty: item["qty"] ? parseFloat(item["qty"]) : 0,
                        price: item["price"] ? parseFloat(item["price"]) : 0,
                        taxPercent: item["taxPercent"] ? parseFloat(item["taxPercent"]) : 0,
                        poQty: item["poQty"] ? parseFloat(item["poQty"]) : 0,
                        poNo: item["poNo"] ? item["poNo"] : undefined,
                        directItemsId: item["poItemsId"] ? parseInt(item["poItemsId"]) : undefined,
                        // Stock: {
                        //     create: {
                        //         itemType: poType,
                        //         inOrOut: poInwardOrDirectInward,
                        //         branchId: parseInt(branchId),
                        //         sizeId: item?.sizeId ? parseInt(item?.sizeId) : undefined,
                        //         accessoryId: item?.accessoryId ? parseInt(item.accessoryId) : undefined,
                        //         accessoryGroupId: item?.accessoryGroupId ? parseInt(item.accessoryGroupId) : undefined,
                        //         accessoryItemId: item?.accessoryItemId ? parseInt(item.accessoryItemId) : undefined,
                        //         colorId: item?.colorId ? parseInt(item.colorId) : undefined,
                        //         uomId: item?.uomId ? parseInt(item.uomId) : undefined,
                        //         storeId: parseInt(storeId),
                        //         qty: item.qty ? 0 - parseFloat(item.qty) : 0,
                        //         price: parseFloat(item.price)
                        //     }
                        // }
                    }
                })
                await createAccessoryStock(tx, poType, poInwardOrDirectInward, branchId, storeId, item)
            }
            )
        }

    

    return Promise.all(promises)
}


async function create(body) {
    const { poType, poInwardOrDirectInward,
        supplierId, directReturnItems, dcNo, dcDate, storeId,
        payTermId,
        vehicleNo, specialInstructions, remarks,
        branchId, active, userId, finYearId } = await body

    let processValid = false;



    const finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    let docId = await getNextDocId(branchId, poInwardOrDirectInward, shortCode, finYearDate?.startTime, finYearDate?.endTime);
    let data;

    await prisma.$transaction(async (tx) => {

        data = await tx.directReturnOrPoReturn.create({
            data: {
                poType, poInwardOrDirectInward,
                supplierId: supplierId ?   parseInt(supplierId) :   null, 
                branchId: parseInt(branchId),
                storeId: parseInt(storeId),
                dcNo,
                // payTermId: parseInt(payTermId),
                dcDate: dcDate ? new Date(dcDate) : undefined,
                active,
                createdById: parseInt(userId),
                vehicleNo, specialInstructions, remarks,
                docId

            },
        })
        await createDirectInwardReturnItems(tx, data.id, directReturnItems, poType, poInwardOrDirectInward, storeId, branchId)
        // await dataIntegrityValidation(tx, processValid);
    })
    return { statusCode: 0, data };
}






// function findRemovedItems(dataFound, directInwardReturnItems) {
//     let removedItems = dataFound.directItems.filter(oldItem => {
//         let result = directInwardReturnItems.find(newItem => parseInt(newItem.id) === parseInt(oldItem.id))
//         if (result) return false
//         return true
//     })
//     return removedItems
// }

// async function deleteItemsFromStock(tx, removeItemsStockIds) {
//     return await tx.stock.deleteMany({
//         where: {
//             inwardLotDetailsId: {
//                 in: removeItemsStockIds
//             }
//         }
//     })
// }






async function deletePurchaseInwardReturnItems(tx, removeItemsPurchaseInwardReturnIds) {
    return await tx.directReturnItems.deleteMany({
        where: {
            id: {
                in: removeItemsPurchaseInwardReturnIds
            }
        }
    })
}



// async function updateOrCreate(tx, item, directCancelOrReturnId, poType) {
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
//         await tx.directItems.update({
//             where: {
//                 id: parseInt(item.id)
//             },
//             data: newItem
//         })
//     } else {
//         await tx.directItems.create({
//             data: {
//                 ...newItem,
//                 directCancelOrReturnId: parseInt(directCancelOrReturnId)
//             }
//         })
//     }
//     return newItem
// }



async function updateOrCreate(tx, item, directReturnOrPoReturnId, poType, poInwardOrDirectInward, storeId, branchId) {

    if (item?.id) {
        if ((poType == "DyedFabric") && (poInwardOrDirectInward == "PurchaseReturn")) {
            const updatedata = await tx.directReturnItems.update({
                where: {
                    id: parseInt(item.id)
                },
                data: {
                    directReturnOrPoReturnId: parseInt(directReturnOrPoReturnId),
                    fabricId: item["fabricId"] ? parseInt(item["fabricId"]) : undefined,
                    designId: item["designId"] ? parseInt(item["designId"]) : undefined,
                    gaugeId: item["gaugeId"] ? parseInt(item["gaugeId"]) : undefined,
                    loopLengthId: item["loopLengthId"] ? parseInt(item["loopLengthId"]) : undefined,
                    gsmId: item["gsmId"] ? parseInt(item["gsmId"]) : undefined,
                    kDiaId: item["kDiaId"] ? parseInt(item["kDiaId"]) : undefined,
                    fDiaId: item["fDiaId"] ? parseInt(item["fDiaId"]) : undefined,
                    uomId: item["uomId"] ? parseInt(item["uomId"]) : undefined,
                    colorId: item["colorId"] ? parseInt(item["colorId"]) : undefined,
                    qty: item["qty"] ? parseFloat(item["qty"]) : 0,
                    poQty: item["poQty"] ? parseFloat(item["poQty"]) : 0,
                    poNo: item["poNo"] ? item["poNo"] : undefined,
                    noOfRolls: item["noOfRolls"] ? parseInt(item["noOfRolls"]) : 0,
                    price: item["price"] ? parseFloat(item["price"]) : 0,
                    poItemsId: item["poItemsId"] ? parseInt(item["poItemsId"]) : undefined,
                    taxPercent: item["taxPercent"] ? parseFloat(item["taxPercent"]) : 0,
                    returnLotDetails: {
                        deleteMany: {},
                    }
                }
            })


            return await createReturnLotGridItems(tx, updatedata?.id, item?.returnLotDetails, item, poType, poInwardOrDirectInward, storeId, branchId)
        }

        else if ((poType == "DyedFabric") && (poInwardOrDirectInward == "DirectReturn")) {
            const updatedata = await tx.directReturnItems.update({
                where: {
                    id: parseInt(item.id)
                },
                data: {
                    directReturnOrPoReturnId: parseInt(directReturnOrPoReturnId),
                    fabricId: item["fabricId"] ? parseInt(item["fabricId"]) : undefined,
                    designId: item["designId"] ? parseInt(item["designId"]) : undefined,
                    gaugeId: item["gaugeId"] ? parseInt(item["gaugeId"]) : undefined,
                    loopLengthId: item["loopLengthId"] ? parseInt(item["loopLengthId"]) : undefined,
                    gsmId: item["gsmId"] ? parseInt(item["gsmId"]) : undefined,
                    kDiaId: item["kDiaId"] ? parseInt(item["kDiaId"]) : undefined,
                    fDiaId: item["fDiaId"] ? parseInt(item["fDiaId"]) : undefined,
                    uomId: item["uomId"] ? parseInt(item["uomId"]) : undefined,
                    colorId: item["colorId"] ? parseInt(item["colorId"]) : undefined,
                    qty: item["qty"] ? parseFloat(item["qty"]) : 0,
                    poQty: item["poQty"] ? parseFloat(item["poQty"]) : 0,
                    poNo: item["poNo"] ? item["poNo"] : undefined,
                    noOfRolls: item["noOfRolls"] ? parseInt(item["noOfRolls"]) : 0,
                    price: item["price"] ? parseFloat(item["price"]) : 0,
                    directItemsId: item["poItemsId"] ? parseInt(item["poItemsId"]) : undefined,
                    taxPercent: item["taxPercent"] ? parseFloat(item["taxPercent"]) : 0,
                    returnLotDetails: {
                        deleteMany: {},
                    }
                }
            })


            return await createReturnLotGridItems(tx, updatedata?.id, item?.returnLotDetails, item, poType, poInwardOrDirectInward, storeId, branchId)
        }

        else if ((poType == "Accessory") && (poInwardOrDirectInward == "DirectReturn")) {
            return await tx.directReturnItems.update({
                where: {
                    id: parseInt(item.id)
                },
                data: {
                    directReturnOrPoReturnId: parseInt(directReturnOrPoReturnId),
                    accessoryId: parseInt(item["accessoryId"]),
                    accessoryGroupId: parseInt(item["accessoryGroupId"]),
                    accessoryItemId: parseInt(item["accessoryItemId"]),
                    sizeId: item["sizeId"] ? parseInt(item["sizeId"]) : undefined,
                    uomId: item["uomId"] ? parseInt(item["uomId"]) : undefined,
                    colorId: item["colorId"] ? parseInt(item["colorId"]) : undefined,
                    qty: item["qty"] ? parseFloat(item["qty"]) : 0,
                    price: item["price"] ? parseFloat(item["price"]) : 0,
                    taxPercent: item["taxPercent"] ? parseFloat(item["taxPercent"]) : 0,
                    poQty: item["poQty"] ? parseFloat(item["poQty"]) : 0,
                    poNo: item["poNo"] ? item["poNo"] : undefined,
                    directItemsId: item["poItemsId"] ? parseInt(item["poItemsId"]) : undefined,
                    // Stock: {
                    //     create: {
                    //         itemType: poType,
                    //         inOrOut: poInwardOrDirectInward,
                    //         branchId: parseInt(branchId),
                    //         sizeId: item?.sizeId ? parseInt(item?.sizeId) : undefined,
                    //         accessoryId: item?.accessoryId ? parseInt(item.accessoryId) : undefined,
                    //         accessoryGroupId: item?.accessoryGroupId ? parseInt(item.accessoryGroupId) : undefined,
                    //         accessoryItemId: item?.accessoryItemId ? parseInt(item.accessoryItemId) : undefined,
                    //         colorId: item?.colorId ? parseInt(item.colorId) : undefined,
                    //         uomId: item?.uomId ? parseInt(item.uomId) : undefined,
                    //         storeId: parseInt(storeId),
                    //         qty: item.qty ? 0 - parseFloat(item.qty) : 0,
                    //         price: parseFloat(item.price)
                    //     }
                    // }
                }
            })
            await createAccessoryStock(tx, poType, poInwardOrDirectInward, branchId, storeId, item)
        }
        else {
            return await tx.directReturnItems.update({
                where: {
                    id: parseInt(item.id)
                },
                data: {
                    directReturnOrPoReturnId: parseInt(directReturnOrPoReturnId),
                    accessoryId: parseInt(item["accessoryId"]),
                    accessoryGroupId: parseInt(item["accessoryGroupId"]),
                    accessoryItemId: parseInt(item["accessoryItemId"]),
                    sizeId: item["sizeId"] ? parseInt(item["sizeId"]) : undefined,
                    uomId: item["uomId"] ? parseInt(item["uomId"]) : undefined,
                    colorId: item["colorId"] ? parseInt(item["colorId"]) : undefined,
                    qty: 0 - item["qty"] ? parseFloat(item["qty"]) : 0,
                    price: item["price"] ? parseFloat(item["price"]) : 0,
                    taxPercent: item["taxPercent"] ? parseFloat(item["taxPercent"]) : 0,
                    poQty: item["poQty"] ? parseFloat(item["poQty"]) : 0,
                    poNo: item["poNo"] ? item["poNo"] : undefined,
                    poItemsId: item["poItemsId"] ? parseInt(item["poItemsId"]) : undefined,
                    // Stock: {
                    //     create: {
                    //         itemType: poType,
                    //         inOrOut: poInwardOrDirectInward,
                    //         branchId: parseInt(branchId),
                    //         sizeId: item?.sizeId ? parseInt(item?.sizeId) : undefined,
                    //         accessoryId: item?.accessoryId ? parseInt(item.accessoryId) : undefined,
                    //         accessoryGroupId: item?.accessoryGroupId ? parseInt(item.accessoryGroupId) : undefined,
                    //         accessoryItemId: item?.accessoryItemId ? parseInt(item.accessoryItemId) : undefined,
                    //         colorId: item?.colorId ? parseInt(item.colorId) : undefined,
                    //         uomId: item?.uomId ? parseInt(item.uomId) : undefined,
                    //         storeId: parseInt(storeId),
                    //         qty: item.qty ? 0 - parseFloat(item.qty) : 0,
                    //         price: parseFloat(item.price)
                    //     }
                    // }
                }
            })
            await createAccessoryStock(tx, poType, poInwardOrDirectInward, branchId, storeId, item)
        }

    } else {
        if ((poType == "DyedFabric") && (poInwardOrDirectInward == "PurchaseReturn")) {
            const data = await tx.directReturnItems.create({
                data: {
                    directReturnOrPoReturnId: parseInt(directReturnOrPoReturnId),
                    fabricId: item["fabricId"] ? parseInt(item["fabricId"]) : undefined,
                    designId: item["designId"] ? parseInt(item["designId"]) : undefined,
                    gaugeId: item["gaugeId"] ? parseInt(item["gaugeId"]) : undefined,
                    loopLengthId: item["loopLengthId"] ? parseInt(item["loopLengthId"]) : undefined,
                    gsmId: item["gsmId"] ? parseInt(item["gsmId"]) : undefined,
                    kDiaId: item["kDiaId"] ? parseInt(item["kDiaId"]) : undefined,
                    fDiaId: item["fDiaId"] ? parseInt(item["fDiaId"]) : undefined,
                    uomId: item["uomId"] ? parseInt(item["uomId"]) : undefined,
                    colorId: item["colorId"] ? parseInt(item["colorId"]) : undefined,
                    qty: item["qty"] ? parseFloat(item["qty"]) : 0,

                    poQty: item["poQty"] ? parseFloat(item["poQty"]) : 0,
                    poNo: item["poNo"] ? item["poNo"] : undefined,
                    noOfRolls: item["noOfRolls"] ? parseInt(item["noOfRolls"]) : 0,
                    price: item["price"] ? parseFloat(item["price"]) : 0,
                    poItemsId: item["poItemsId"] ? parseInt(item["poItemsId"]) : undefined,
                    taxPercent: item["taxPercent"] ? parseFloat(item["taxPercent"]) : 0,
                }

            })

            return await createReturnLotGridItems(tx, data?.id, item?.returnLotDetails, item, poType, poInwardOrDirectInward, storeId, branchId)
        }
        else if ((poType == "DyedFabric") && (poInwardOrDirectInward == "DirectReturn")) {
            const data = await tx.directReturnItems.create({
                data: {
                    directReturnOrPoReturnId: parseInt(directReturnOrPoReturnId),
                    fabricId: item["fabricId"] ? parseInt(item["fabricId"]) : undefined,
                    designId: item["designId"] ? parseInt(item["designId"]) : undefined,
                    gaugeId: item["gaugeId"] ? parseInt(item["gaugeId"]) : undefined,
                    loopLengthId: item["loopLengthId"] ? parseInt(item["loopLengthId"]) : undefined,
                    gsmId: item["gsmId"] ? parseInt(item["gsmId"]) : undefined,
                    kDiaId: item["kDiaId"] ? parseInt(item["kDiaId"]) : undefined,
                    fDiaId: item["fDiaId"] ? parseInt(item["fDiaId"]) : undefined,
                    uomId: item["uomId"] ? parseInt(item["uomId"]) : undefined,
                    colorId: item["colorId"] ? parseInt(item["colorId"]) : undefined,
                    qty: item["qty"] ? parseFloat(item["qty"]) : 0,

                    poQty: item["poQty"] ? parseFloat(item["poQty"]) : 0,
                    poNo: item["poNo"] ? item["poNo"] : undefined,
                    noOfRolls: item["noOfRolls"] ? parseInt(item["noOfRolls"]) : 0,
                    price: item["price"] ? parseFloat(item["price"]) : 0,
                    directItemsId: item["poItemsId"] ? parseInt(item["poItemsId"]) : undefined,
                    taxPercent: item["taxPercent"] ? parseFloat(item["taxPercent"]) : 0,
                }

            })

            return await createReturnLotGridItems(tx, data?.id, item?.returnLotDetails, item, poType, poInwardOrDirectInward, storeId, branchId)

        }
        else if ((poType == "Accessory") && (poInwardOrDirectInward == "DirectReturn")) {
            return await tx.directReturnItems.create({
                data: {
                    directReturnOrPoReturnId: parseInt(directReturnOrPoReturnId),
                    accessoryId: parseInt(item["accessoryId"]),
                    accessoryGroupId: parseInt(item["accessoryGroupId"]),
                    accessoryItemId: parseInt(item["accessoryItemId"]),
                    sizeId: item["sizeId"] ? parseInt(item["sizeId"]) : undefined,
                    uomId: item["uomId"] ? parseInt(item["uomId"]) : undefined,
                    colorId: item["colorId"] ? parseInt(item["colorId"]) : undefined,
                    qty: 0 - item["qty"] ? parseFloat(item["qty"]) : 0,
                    price: item["price"] ? parseFloat(item["price"]) : 0,
                    taxPercent: item["taxPercent"] ? parseFloat(item["taxPercent"]) : 0,
                    poQty: item["poQty"] ? parseFloat(item["poQty"]) : 0,
                    poNo: item["poNo"] ? item["poNo"] : undefined,
                    directItemsId: item["poItemsId"] ? parseInt(item["poItemsId"]) : undefined,
                    // Stock: {
                    //     create: {
                    //         itemType: poType,
                    //         inOrOut: poInwardOrDirectInward,
                    //         branchId: parseInt(branchId),
                    //         sizeId: item?.sizeId ? parseInt(item?.sizeId) : undefined,
                    //         accessoryId: item?.accessoryId ? parseInt(item.accessoryId) : undefined,
                    //         accessoryGroupId: item?.accessoryGroupId ? parseInt(item.accessoryGroupId) : undefined,
                    //         accessoryItemId: item?.accessoryItemId ? parseInt(item.accessoryItemId) : undefined,
                    //         colorId: item?.colorId ? parseInt(item.colorId) : undefined,
                    //         uomId: item?.uomId ? parseInt(item.uomId) : undefined,
                    //         storeId: parseInt(storeId),
                    //         qty: item.qty ? 0 - parseFloat(item.qty) : 0,
                    //         price: parseFloat(item.price)
                    //     }
                    // }
                }
            })
            await createAccessoryStock(tx, poType, poInwardOrDirectInward, branchId, storeId, item)
        }

        else {
            return await tx.directReturnItems.create({
                data: {
                    directReturnOrPoReturnId: parseInt(directReturnOrPoReturnId),
                    accessoryId: parseInt(item["accessoryId"]),
                    accessoryGroupId: parseInt(item["accessoryGroupId"]),
                    accessoryItemId: parseInt(item["accessoryItemId"]),
                    sizeId: item["sizeId"] ? parseInt(item["sizeId"]) : undefined,
                    uomId: item["uomId"] ? parseInt(item["uomId"]) : undefined,
                    colorId: item["colorId"] ? parseInt(item["colorId"]) : undefined,
                    qty: 0 - item["qty"] ? parseFloat(item["qty"]) : 0,
                    price: item["price"] ? parseFloat(item["price"]) : 0,
                    taxPercent: item["taxPercent"] ? parseFloat(item["taxPercent"]) : 0,
                    poQty: item["poQty"] ? parseFloat(item["poQty"]) : 0,
                    poNo: item["poNo"] ? item["poNo"] : undefined,
                    poItemsId: item["poItemsId"] ? parseInt(item["poItemsId"]) : undefined,
                    // Stock: {
                    //     create: {
                    //         itemType: poType,
                    //         inOrOut: poInwardOrDirectInward,
                    //         branchId: parseInt(branchId),
                    //         sizeId: item?.sizeId ? parseInt(item?.sizeId) : undefined,
                    //         accessoryId: item?.accessoryId ? parseInt(item.accessoryId) : undefined,
                    //         accessoryGroupId: item?.accessoryGroupId ? parseInt(item.accessoryGroupId) : undefined,
                    //         accessoryItemId: item?.accessoryItemId ? parseInt(item.accessoryItemId) : undefined,
                    //         colorId: item?.colorId ? parseInt(item.colorId) : undefined,
                    //         uomId: item?.uomId ? parseInt(item.uomId) : undefined,
                    //         storeId: parseInt(storeId),
                    //         qty: item.qty ? 0 - parseFloat(item.qty) : 0,
                    //         price: parseFloat(item.price)
                    //     }
                    // }
                }
            })
            await createAccessoryStock(tx, poType, poInwardOrDirectInward, branchId, storeId, item)
        }
    }

}

async function updateAllPInwardReturnItems(tx, directReturnItems, directReturnOrPoReturnId, poType, poInwardOrDirectInward, storeId, branchId) {
    let promises = directReturnItems.map(async (item) => await updateOrCreate(tx, item, directReturnOrPoReturnId, poType, poInwardOrDirectInward, storeId, branchId))
    return Promise.all(promises)
}

async function update(id, body) {
    let processValid = false;
    const { poType, poInwardOrDirectInward,
        supplierId, directReturnItems, dcNo, dcDate, storeId,
        vehicleNo, specialInstructions, remarks,
        branchId, active, userId } = await body


    const dataFound = await prisma.directReturnOrPoReturn.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            directReturnItems: true
        }
    })
    if (!dataFound) return NoRecordFound("directReturnOrPoReturn");
    let piData;


    const oldDirectReturnIds = dataFound.directReturnItems.map(item => parseInt(item.id))
    const currentDirectReturnIds = directReturnItems.filter(i => i?.id)?.map(item => parseInt(item.id))
    const removeItemsPurchaseInwardReturnIds = getRemovedItems(oldDirectReturnIds, currentDirectReturnIds);

    await prisma.$transaction(async (tx) => {

        await deletePurchaseInwardReturnItems(tx, removeItemsPurchaseInwardReturnIds);
        piData = await tx.directReturnOrPoReturn.update({
            where: {
                id: parseInt(id)
            },
            data: {
                poType, poInwardOrDirectInward,
                supplierId: parseInt(supplierId),
                branchId: parseInt(branchId),
                storeId: parseInt(storeId),
                dcNo,
                dcDate: dcDate ? new Date(dcDate) : undefined,
                vehicleNo, specialInstructions, remarks,
                active,
                updatedById: parseInt(userId),
            },
        })
        await updateAllPInwardReturnItems(tx, directReturnItems, piData.id, poType, poInwardOrDirectInward, storeId, branchId)
        // await dataIntegrityValidation(tx, processValid = false);
    })
    return { statusCode: 0, data: piData };
}






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
//         piData = await tx.directCancelOrReturn.create({
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
//                 DirectItems: {
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
//     let removedItems = dataFound.DirectItems.filter(oldItem => {
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
//     return await tx.directItems.deleteMany({
//         where: {
//             id: {
//                 in: removeItemsPurchaseInwardReturnIds
//             }
//         }
//     })
// }



// async function updateOrCreate(tx, item, directCancelOrReturnId, poType) {
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
//         await tx.directItems.update({
//             where: {
//                 id: parseInt(item.id)
//             },
//             data: newItem
//         })
//     } else {
//         await tx.directItems.create({
//             data: {
//                 ...newItem,
//                 directCancelOrReturnId: parseInt(directCancelOrReturnId)
//             }
//         })
//     }
//     return newItem
// }

// async function updateAllPInwardReturnItems(tx, directInwardReturnItems, directCancelOrReturnId, poType) {
//     let promises = directInwardReturnItems.map(async (item) => await updateOrCreate(tx, item, directCancelOrReturnId, poType))
//     return Promise.all(promises)
// }

// async function update(id, body) {
//     const { poType, poInwardOrDirectInward,
//         supplierId, directInwardReturnItems, dcNo, dcDate, storeId,
//         vehicleNo, specialInstructions, remarks,
//         branchId, active, userId } = await body
//     const dataFound = await prisma.directCancelOrReturn.findUnique({
//         where: {
//             id: parseInt(id)
//         },
//         include: {
//             DirectItems: true
//         }
//     })
//     if (!dataFound) return NoRecordFound("directCancelOrReturn");
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
//         piData = await tx.directCancelOrReturn.update({
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








async function remove(id) {
    const data = await prisma.directReturnOrPoReturn.delete({
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
