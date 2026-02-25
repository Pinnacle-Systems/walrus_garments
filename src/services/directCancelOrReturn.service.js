import { NoRecordFound } from '../configs/Responses.js';
import { billItemsFiltration, getDateFromDateTime, getRemovedItems, getYearShortCode, getYearShortCodeForFinYear } from '../utils/helper.js';
import { getTableRecordWithId } from "../utils/helperQueries.js"
import { createManyStockWithId, updateManyStockWithId } from '../utils/stockHelper.js';
import { getAllDataPoItems, getPoItemObject } from './po.service.js';
import { getDirectInwardReturnItemsLotBreakUp, getPurchaseReturnItemsAlreadyData } from '../utils/directInwardReturnQueries.js';
import { getFinYearStartTimeEndTime } from '../utils/finYearHelper.js';
import dataIntegrityValidation from "../validators/DataIntegregityValidation/index.js";
import { prisma } from '../lib/prisma.js';

function getInwardOrReturnShortCode(poInwardOrDirectInward) {
    switch (poInwardOrDirectInward) {
        case "PurchaseReturn":
            return "RET"
        case "GeneralReturn":
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
    let newDocId = `${branchObj.branchCode}/${shortCode}/${getInwardOrReturnShortCode(poInwardOrDirectInward)}/1`
    if (lastObject) {
        newDocId = `${branchObj.branchCode}/${shortCode}/${getInwardOrReturnShortCode(poInwardOrDirectInward)}/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
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
    console.log(poInwardOrDirectInward, "poInwardOrDirectInward")
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
                supplier: {
                    select: {
                        name: true,

                    }
                }
            }
        });
        data = manualFilterSearchData(searchPoDate, searchDueDate, searchPoType, data)
        // totalCount = data.length
        // data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)
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
            include: {
                supplier: {
                    select: {
                        name: true
                    }
                }
            }
        });
    }
    let docId = await getNextDocId(branchId, poInwardOrDirectInward, shortCode, finYearDate?.startTime, finYearDate?.endTime);
    return { statusCode: 0, data, nextDocId: docId, totalCount };
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
                    storeName: true,
                }
            },
            Branch: {
                select: {
                    branchName: true
                }
            },
            supplier: {
                select: {
                    name: true
                }
            },
            PayTerm: true,
            directReturnItems: {
                select: {
                    id: true,

                    itemId: true,
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

    console.log(data, 'data')
    // data["DirectItems"] = await getDirectInwardReturnItemsLotBreakUp(data.id, data.poType)
    data["directReturnItems"] = await getPurchaseReturnItemsAlreadyData(data.id, data.poInwardOrDirectInward, data?.poType, data?.directReturnItems, data?.storeId, data?.createdAt)
    if (!data) return NoRecordFound("directReturnOrPoReturn");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
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

    const alreadyBillData = await prisma.billEntryItems.aggregate({
        where: {
            directItemsId: parseInt(id),
            // billEntryId: {
            //     lt: JSON.parse(billEntryId) ? parseInt(billEntryId) : undefined
            // }
        },
        _sum: {
            qty: true,
        }
    });

    return {
        statusCode: 0, data: {
            ...data,
            alreadyBillData,
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
async function createYarnStock(tx, poType, poInwardOrDirectInward, branchId, storeId, item, directReturnOrPoReturnId, supplierId) {

    await tx.stock.create({
        data: {
            itemType: poType,
            inOrOut: poInwardOrDirectInward,
            transactionId: directReturnOrPoReturnId ? parseInt(directReturnOrPoReturnId) : undefined,
            itemId: item["itemId"] ? parseInt(item["itemId"]) : undefined,
            sizeId: item["sizeId"] ? parseInt(item["sizeId"]) : undefined,

            colorId: item["colorId"] ? parseInt(item["colorId"]) : undefined,
            uomId: item["uomId"] ? parseInt(item["uomId"]) : undefined,
            supplierId: supplierId ? parseInt(supplierId) : undefined,
            noOfBags: item["noOfBags"] ? parseInt(item["noOfBags"]) : undefined,
            gsmId: item["gsmId"] ? parseInt(item["gsmId"]) : undefined,
            kDiaId: item["kDiaId"] ? parseInt(item["kDiaId"]) : undefined,
            fDiaId: item["fDiaId"] ? parseInt(item["fDiaId"]) : undefined,
            qty: item["returnQty"] ? 0 - parseFloat(item["returnQty"]) : 0,
            price: item["price"] ? parseFloat(item["price"]) : 0,



        }
    })

}



async function createDirectInwardReturnItems(tx, directReturnOrPoReturnId, directReturnItems, poType, poInwardOrDirectInward, storeId, branchId, supplierId) {


    let promises


    promises = directReturnItems.map(async (item, index) => {
        let data = await tx.directReturnItems.create({
            data: {
                directReturnOrPoReturnId: parseInt(directReturnOrPoReturnId),
                itemId: item["itemId"] ? parseInt(item["itemId"]) : undefined,
                sizeId: item["sizeId"] ? parseInt(item["sizeId"]) : undefined,
                uomId: item["uomId"] ? parseInt(item["uomId"]) : undefined,
                colorId: item["colorId"] ? parseInt(item["colorId"]) : undefined,
                qty: item["qty"] ? parseFloat(item["qty"]) : 0,
                price: item["price"] ? parseFloat(item["price"]) : 0,
                directItemsId: item["directItemsId"] ? parseInt(item["directItemsId"]) : undefined,


            }
        })
        // return await createReturnLotGridItems(tx, data?.id, item?.returnLotDetails, item, poType, poInwardOrDirectInward, storeId, branchId)
        await createYarnStock(tx, poType, poInwardOrDirectInward, branchId, storeId, item)

    }
    )





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
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startDateStartTime, finYearDate?.endDateEndTime) : "";
    let docId = await getNextDocId(branchId, poInwardOrDirectInward, shortCode, finYearDate?.startDateStartTime, finYearDate?.endDateEndTime);
    let data;

    await prisma.$transaction(async (tx) => {

        data = await tx.directReturnOrPoReturn.create({
            data: {
                poType, poInwardOrDirectInward,
                supplierId: supplierId ? parseInt(supplierId) : null,
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
        await createDirectInwardReturnItems(tx, data.id, directReturnItems, poType, poInwardOrDirectInward, storeId, branchId, supplierId)
    })
    return { statusCode: 0, data };
}












async function deletePurchaseInwardReturnItems(tx, removeItemsPurchaseInwardReturnIds) {
    return await tx.directReturnItems.deleteMany({
        where: {
            id: {
                in: removeItemsPurchaseInwardReturnIds
            }
        }
    })
}

async function createYarnItemsUpdateStock(tx, poType, poInwardOrDirectInward, branchId, storeId, item, stockTransactionId) {
    await tx.stock.updateMany({
        where: {
            transactionId: parseInt(stockTransactionId),
            inOrOut: poInwardOrDirectInward,
        },
        data: {

            qty: (item.qty) ? parseFloat(0 - item.qty) : undefined,
        }
    })
    console.log("Eror")
}






async function updateOrCreate(tx, item, directReturnOrPoReturnId, poType, poInwardOrDirectInward, storeId, branchId) {


    if (item?.id) {


        const updatedata = await tx.directReturnItems.update({
            where: {
                id: parseInt(item.id)
            },
            data: {
                directReturnOrPoReturnId: parseInt(directReturnOrPoReturnId),
                itemId: item["itemId"] ? parseInt(item["itemId"]) : undefined,
                sizeId: item["sizeId"] ? parseInt(item["sizeId"]) : undefined,
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
                orderId: item["orderId"] ? parseInt(item["orderId"]) : undefined,
                orderDetailsId: item["orderDetailsId"] ? parseInt(item["orderDetailsId"]) : undefined,
                requirementPlanningItemsId: item["requirementPlanningItemsId"] ? parseInt(item["requirementPlanningItemsId"]) : undefined,

            }
        })

        await createYarnItemsUpdateStock(tx, poType, poInwardOrDirectInward, branchId, storeId, item, item?.id)






    }

    else {
        promises = directReturnItems.map(async (item, index) => {
            let data = await tx.directReturnItems.create({
                data: {
                    directReturnOrPoReturnId: parseInt(directReturnOrPoReturnId),
                    itemId: item["itemId"] ? parseInt(item["itemId"]) : undefined,
                    sizeId: item["sizeId"] ? parseInt(item["sizeId"]) : undefined,
                    weightPerBag: item["weightPerBag"] ? parseInt(item["weightPerBag"]) : undefined,
                    discountType: item["discountType"] ? (item["discountType"]) : undefined,
                    noOfBags: item["noOfBags"] ? parseInt(item["noOfBags"]) : undefined,
                    gsmId: item["gsmId"] ? parseInt(item["gsmId"]) : undefined,
                    kDiaId: item["kDiaId"] ? parseInt(item["kDiaId"]) : undefined,
                    fDiaId: item["fDiaId"] ? parseInt(item["fDiaId"]) : undefined,
                    uomId: item["uomId"] ? parseInt(item["uomId"]) : undefined,
                    colorId: item["colorId"] ? parseInt(item["colorId"]) : undefined,
                    qty: item["qty"] ? parseFloat(item["qty"]) : 0,
                    poQty: item["poQty"] ? parseFloat(item["poQty"]) : 0,
                    poNo: item["poNo"] ? item["poNo"] : undefined,
                    price: item["price"] ? parseFloat(item["price"]) : 0,
                    directItemsId: item["directItemsId"] ? parseInt(item["directItemsId"]) : undefined,
                    taxPercent: item["taxPercent"] ? parseFloat(item["taxPercent"]) : 0,
                    orderId: item["orderId"] ? parseInt(item["orderId"]) : undefined,
                    orderDetailsId: item["orderDetailsId"] ? parseInt(item["orderDetailsId"]) : undefined,
                    requirementPlanningItemsId: item["requirementPlanningItemsId"] ? parseInt(item["requirementPlanningItemsId"]) : undefined,


                }
            })

            await createYarnStock(tx, poType, poInwardOrDirectInward, branchId, storeId, item)

        }
        )




    }

}

async function updateAllPInwardReturnItems(tx, directReturnItems, directReturnOrPoReturnId, poType, poInwardOrDirectInward, storeId, branchId) {

    console.log(directReturnItems, "")

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
