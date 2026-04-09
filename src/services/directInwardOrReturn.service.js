import { NoRecordFound } from '../configs/Responses.js';
import { billItemsFiltration, getDateFromDateTime, getRemovedItems, getYearShortCodeForFinYear, substract, balanceQtyCalculation, balanceReturnQtyCalculation, getYearShortCode } from '../utils/helper.js';
import { getTableRecordWithId } from "../utils/helperQueries.js"
import { createManyStockWithId, updateManyStockWithId } from '../utils/stockHelper.js';
import { getPoItemObject } from './po.service.js';
import { getDirectInwardReturnItemsAlreadyData, getDirectInwardReturnItemsLotBreakUp } from '../utils/directInwardReturnQueries.js';
import { getFinYearStartTimeEndTime } from '../utils/finYearHelper.js';
import dataIntegrityValidation from "../validators/DataIntegregityValidation/index.js";
import { prisma } from '../lib/prisma.js';
import {
    getBarcodeGenerationMethod,
    validateVariantRowShape,
} from './itemVariantValidation.js';
import { pickStockRuntimeFieldValues } from './stockRuntimeFields.js';

function getInwardOrReturnShortCode(poInwardOrDirectInward) {
    switch (poInwardOrDirectInward) {
        case "DirectInward":
            return "DI"
        case "PurchaseInward":
            return "PI"
        case "GeneralInward":
            return "GI"
        default:
            break;
    }
}

async function getNextDocId(branchId, poInwardOrDirectInward, shortCode, startTime, endTime) {


    let lastObject = await prisma.directInwardOrReturn.findFirst({
        where: {
            // poInwardOrDirectInward,
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

async function validateActiveItemsForInward(directInwardReturnItems = []) {
    const itemIds = [...new Set(
        (directInwardReturnItems || [])
            .map((item) => item?.itemId ? parseInt(item.itemId) : null)
            .filter(Boolean)
    )];

    if (!itemIds.length) {
        return;
    }

    const inactiveItems = await prisma.item.findMany({
        where: {
            id: {
                in: itemIds
            },
            active: false
        },
        select: {
            id: true,
            name: true,
            code: true
        }
    });

    if (!inactiveItems.length) {
        return;
    }

    const itemLabel = inactiveItems
        .map((item) => item?.name || item?.code || `#${item.id}`)
        .join(", ");

    throw {
        statusCode: 1,
        message: `Inactive items cannot be used in inward operations: ${itemLabel}`
    };
}

async function validateInventoryVariantRows(directInwardReturnItems = [], rowLabelPrefix) {
    const itemIds = [...new Set(
        (directInwardReturnItems || [])
            .map((item) => item?.itemId ? parseInt(item.itemId) : null)
            .filter(Boolean)
    )];

    if (!itemIds.length) {
        return;
    }

    const [barcodeGenerationMethod, items] = await Promise.all([
        getBarcodeGenerationMethod(),
        prisma.item.findMany({
            where: {
                id: {
                    in: itemIds,
                },
            },
            select: {
                id: true,
                isLegacy: true,
            },
        }),
    ]);

    const itemMap = new Map(items.map((item) => [item.id, item]));

    (directInwardReturnItems || []).forEach((item, index) => {
        const itemId = item?.itemId ? parseInt(item.itemId) : null;
        if (!itemId) {
            return;
        }

        validateVariantRowShape({
            flowType: "canonical",
            isLegacy: itemMap.get(itemId)?.isLegacy,
            barcodeGenerationMethod,
            row: item,
            rowLabel: `${rowLabelPrefix} ${index + 1}`,
        });
    });
}



function getPurchaseInwardStatus(inward) {


    console.log(inward?.DirectItems?.flatMap((item) => item?.DirectReturnItems), "selvamani")


    const inwardItems = inward.DirectItems || [];
    const returnItems = inward?.DirectItems?.flatMap((item) => item?.DirectReturnItems)
    // const billItems = inward?.DirectItems?.DirectBillItems || [];

    const totalInwardQty = inwardItems.reduce(
        (sum, item) => sum + (item.qty || 0),
        0,
    );

    const totalReturnQty = returnItems.reduce(
        (sum, item) => sum + (item.qty || 0),
        0,
    );

    // const totalBilledQty = billItems.reduce(
    //     (sum, item) => sum + (item.qty || 0),
    //     0,
    // );

    console.log(totalInwardQty, "find ststaus", totalReturnQty)
    if (totalInwardQty === 0) return "Pending";

    if (totalReturnQty > 0 && totalReturnQty < totalInwardQty) return "Partially Returned";


    if (totalReturnQty >= totalInwardQty) return "Fully Returned";

    // if (totalBilledQty >= totalInwardQty) return "Fully Billed";

    // if (totalBilledQty > 0 && totalReturnQty > 0)
    //     return "Partially Billed & Returned";

    // if (totalBilledQty > 0) return "Partially Billed";

    // if (totalReturnQty > 0) return "Partially Returned";

    return "Items Received";
}


async function get(req) {
    const { branchId, active, poInwardOrDirectInward, pageNumber, dataPerPage, serachDocNo, searchDate, supplier,
        searchDocId, searchPoDate, searchSupplierAliasName, searchPoType, searchDueDate, pagination, finYearId } = req.query
    let data;
    let totalCount;
    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startDateStartTime, finYearDate?.endDateEndTime) : "";
    if (pagination) {
        data = await prisma.directInwardOrReturn.findMany({
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
                docId: Boolean(serachDocNo) ?
                    {
                        contains: serachDocNo
                    }
                    : undefined,
                supplier: {
                    aliasName: Boolean(supplier) ? { contains: supplier } : undefined
                }
            },
            orderBy: {
                id: "desc",
            },
            include: {
                supplier: {
                    select: {
                        name: true,
                        BranchType: {
                            select: {
                                name: true
                            }
                        },
                        City: {
                            select: {
                                name: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        DirectReturnOrPoReturn: true
                    }
                },
                DirectItems: {
                    select: {
                        qty: true,
                        id: true,
                        DirectReturnItems: true

                    }
                },



            }
        });
        data = manualFilterSearchData(searchDate, searchDueDate, searchPoType, data)
        totalCount = data.length
        // data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)
    } else {

        data = await prisma.directInwardOrReturn.findMany({
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
            },
            orderBy: {
                id: "desc",
            },
            include: {
                supplier: {
                    select: {
                        name: true,
                        id: true,
                        aliasName: true
                    }
                },
                _count: {
                    select: {
                        DirectItems: true
                    }
                },
                DirectItems: {
                    select: {
                        qty: true,
                        id: true,
                        DirectReturnItems: true

                    }
                },
            }
        });

    }
    let docId = await getNextDocId(branchId, poInwardOrDirectInward, shortCode, finYearDate?.startDateStartTime, finYearDate?.endDateEndTime);


    return {
        statusCode: 0,
        data: data.map((item) => ({
            ...item,
            status: getPurchaseInwardStatus(item),

        })),
        nextDocId: docId, totalCount
    };
}


async function getOne(id, isReturnBalanceInwardItems) {
    const childRecord = 0;
    const data = await prisma.directInwardOrReturn.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            Store: true,
            PayTerm: true,
            DirectItems: {
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
                    directInwardOrReturnId: true,
                    weightPerBag: true,
                    noOfBags: true,
                    noOfRolls: true,
                    qty: true,
                    poQty: true,
                    cancelQty: true,
                    alreadyInwardedQty: true,
                    alreadyReturnedQty: true,
                    balanceQty: true,
                    poNo: true,
                    inwardLotDetails: true,
                    poItemsId: true,
                    itemId: true,
                    sectionId: true,
                    barcode: true,
                    DirectReturnItems: {
                        select: {
                            qty: true
                        }
                    },
                    field1: true,
                    field2: true,
                    field3: true,
                    field4: true,
                    field5: true,
                    field6: true,
                    field7: true,
                    field8: true,
                    field9: true,
                    field10: true,


                },


            },
            _count: {
                select: {
                    DirectReturnOrPoReturn: true
                }
            }


        },
    })


    data["DirectItems"] = await getDirectInwardReturnItemsAlreadyData(data.storeId, data?.poType, data?.DirectItems, data?.poInwardOrDirectInward, isReturnBalanceInwardItems)
    if (!data) return NoRecordFound("directInwardOrReturn");




    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

function manualFilterSearchDataDirectItems(searchPoDate, searchDueDate, searchPoType, data) {
    return data.filter(item =>
        (searchPoDate ? String(getDateFromDateTime(item.DirectInwardOrReturn.createdAt)).includes(searchPoDate) : true) &&
        (searchDueDate ? String(getDateFromDateTime(item.DirectInwardOrReturn.dcDate)).includes(searchDueDate) : true) &&
        (searchPoType ? (item.DirectInwardOrReturn.poType.toLowerCase().includes(searchPoType.toLowerCase())) : true)
    )
}

export async function getDirectItems(req) {
    const { branchId, active, poInwardOrDirectInward, dataPerPage, storeId,
        searchDocId, searchPoDate,
        searchSupplierAliasName,
        searchPoType, searchDueDate,
        isDirectInwardFilter, supplierId, poType, pagination, pageNumber,
        isPurchaseCancelFilter = false,
        isPurchaseReturnFilter = false, purchaseInwardId,
        searchItem,
        searchSize,
        searchColor,
        searchUom
    } = req.query
    let data;
    let totalCount;

    console.log(searchPoDate, "searchPoDate", searchDueDate, "searchDueDate", searchPoType, "searchPoType", searchSupplierAliasName, "searchSupplierAliasName")

    if (pagination) {
        data = await prisma.directItems.findMany({
            where: {
                DirectInwardOrReturn:
                {
                    branchId: branchId ? parseInt(branchId) : undefined,
                    docId: Boolean(searchDocId) ?
                        {
                            contains: searchDocId
                        }
                        : undefined,
                    supplierId: supplierId ? parseInt(supplierId) : undefined,
                    storeId: storeId ? parseInt(storeId) : undefined,
                    poType,
                    supplier: {
                        aliasName: Boolean(searchSupplierAliasName) ? { contains: searchSupplierAliasName } : undefined
                    }
                },
                Item: {
                    name: Boolean(searchItem) ? { contains: searchItem } : undefined,
                },
                Size: {
                    name: Boolean(searchSize) ? { contains: searchSize } : undefined,
                },
                Color: {
                    name: Boolean(searchColor) ? { contains: searchColor } : undefined,
                },
                Uom: {
                    name: Boolean(searchUom) ? { contains: searchUom } : undefined,
                }
            },
            include: {
                DirectInwardOrReturn: {
                    select: {
                        poInwardOrDirectInward: true,
                        poType: true,
                        supplierId: true,
                        createdAt: true,
                        dcDate: true
                    }
                },
                DirectReturnItems: true,
                Yarn: {
                    select: {
                        aliasName: true,
                        name: true
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
        // data = await getAllDataPoItems(data)

        console.log(data, "datadata")

        if (purchaseInwardId) {
            data = await data?.filter(val => val.directInwardOrReturnId == purchaseInwardId)
        }

        data = await getAllDataDirectItems(data, storeId)


        if (isDirectInwardFilter) {
            data = data?.filter(val => val.DirectInwardOrReturn?.poInwardOrDirectInward == "DirectInward" && val.directInwardOrReturnId == purchaseInwardId)?.filter(item => balanceReturnQtyCalculation(item.qty, 0, item.alreadyInwardedQty, item.alreadyReturnedData._sum?.qty) > 0)
        }

        if (isPurchaseCancelFilter) {
            data = data.filter(item => balanceQtyCalculation(item.qty, item.alreadyCancelData._sum?.qty, item.alreadyInwardedData._sum?.qty, item.alreadyReturnedData._sum?.qty) > 0)
        }
        if (isPurchaseReturnFilter) {
            data = data.filter(item => substract(item.alreadyInwardedData?._sum?.qty ? item.alreadyInwardedData._sum?.qty : 0, item.alreadyReturnedData?._sum?.qty ? item.alreadyReturnedData?._sum?.qty : 0) > 0)
        }
    }
    else {
        data = await prisma.directItems.findMany({
            where: {
                branchId: branchId ? parseInt(branchId) : undefined,
                active: active ? Boolean(active) : undefined,
            }
        });
    }
    return { statusCode: 0, data, totalCount };
}



function manualFilterSearchDataPoItems(searchPoDate, searchDueDate, searchPoType, data) {
    return data.filter(item =>
        (searchPoDate ? String(getDateFromDateTime(item.Po.createdAt)).includes(searchPoDate) : true) &&
        (searchDueDate ? String(getDateFromDateTime(item.Po.dueDate)).includes(searchDueDate) : true) &&
        (searchPoType ? (item.Po.transType.toLowerCase().includes(searchPoType.toLowerCase())) : true)
    )
}

export async function getAllDataDirectItems(data, storeId) {


    let promises = data.map(async (item) => {
        let data = await getDirectItemById(item.id, null, null, storeId, null)
        return data.data
    }
    )
    return Promise.all(promises)
}

export async function getDirectItemById(id, billEntryId, directReturnOrPoReturnId, storeId, stockId) {
    let data = await prisma.directItems.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            inwardLotDetails: true,
            DirectReturnItems: true,
            DirectInwardOrReturn: {
                select: {
                    docId: true,
                    storeId: true,
                    poInwardOrDirectInward: true,
                    dcNo: true,
                    dcDate: true,
                    createdAt: true,
                    poType: true
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
            Size: {
                select: {
                    name: true
                }
            },
            Item: {
                select: {
                    name: true
                }
            }








        }
    });


    const alreadyReturnedData = await prisma.directReturnItems.aggregate({
        where: {
            directItemsId: parseInt(id),
            DirectReturnOrPoReturn: {
                poInwardOrDirectInward: "DirectReturn"
            },
            // directReturnOrPoReturnId: {
            //     lt: JSON.parse(directReturnOrPoReturnId) ? parseInt(directReturnOrPoReturnId) : undefined
            // }
        },
        _sum: {
            qty: true,
            noOfBags: true,
            noOfRolls: true
        }
    });

    console.log(alreadyReturnedData, "alreadyReturnedData", id)



    const alreadyReturnedLotWiseData = await prisma.directReturnItems.groupBy({
        where: {
            directItemsId: parseInt(id),
            DirectReturnOrPoReturn: {
                poInwardOrDirectInward: "DirectReturn"
            },
            directReturnOrPoReturnId: {
                lt: JSON.parse(directReturnOrPoReturnId) ? parseInt(directReturnOrPoReturnId) : undefined
            }
        },
        by: ["directItemsId"],
        _sum: {
            qty: true,
            noOfBags: true,
            noOfRolls: true
        }
    });




    let alreadyInwardLotWiseData = [];
    let inwardQty = parseFloat(data?.qty || 0).toFixed(3)
    let alreadyInwardedQty = data?.qty ? parseFloat(data?.qty).toFixed(3) : "0.00";
    let alreadyInwardedRolls = data?.noOfRolls ? parseInt(data?.noOfRolls) : "0";
    let alreadyReturnedRolls = alreadyReturnedData?._sum?.noOfRolls ? parseInt(alreadyReturnedData._sum?.noOfRolls) : "0";
    let alreadyReturnedQty = alreadyReturnedData?._sum?.qty ? parseFloat(alreadyReturnedData._sum?.qty).toFixed(3) : "0.000";
    let balanceQty = substract(alreadyInwardedQty, alreadyReturnedQty)
    let allowedReturnRolls = substract(alreadyInwardedRolls, alreadyReturnedRolls)
    let allowedReturnQty = substract(alreadyInwardedQty, alreadyReturnedQty)

    console.log(alreadyInwardedQty, "alreadyInwardedQty", alreadyReturnedQty, "alreadyReturnedQty")

    console.log(substract(alreadyInwardedQty, alreadyReturnedQty), "allowedReturnQty")

    let stockQty = parseFloat((await getStockQty(storeId, data?.itemId, data?.sizeId, data?.colorId, data?.uomId))?.stockQty || 0)









    async function getLotWiseReturnRolls(lotNo, directItemsID) {


        let returnDatas = `
    select sum(ReturnLotDetails.qty) as lotQty,sum(ReturnLotDetails.noOfRolls) as lotRolls from directReturnItems left join DirectReturnOrPoReturn on DirectReturnOrPoReturn.id=directReturnItems.directReturnOrPoReturnId
    left join ReturnLotDetails on ReturnLotDetails.directReturnItemsId=directReturnItems.id
    where directReturnItems.poItemsId  is null and DirectReturnOrPoReturn.poInwardOrDirectInward="DirectReturn" and ReturnLotDetails.lotNo=${lotNo} AND directReturnItems.directItemsID=${directItemsID} ;
    `


        const alreadyReturnData = await prisma.$queryRawUnsafe(returnDatas);


        return alreadyReturnData[0]
    }











    return {
        statusCode: 0, data: {
            ...data,
            balanceQty,
            inwardQty,
            stockQty,
            allowedReturnRolls,
            allowedReturnQty,
            alreadyInwardedQty,
            alreadyInwardedRolls,
            alreadyReturnedQty,
            alreadyReturnedData,
            // stockData,

            alreadyInwardLotWiseData: alreadyInwardLotWiseData?.filter(val => parseFloat(val?.stockQty) !== 0),
        }
    };







    async function getStockQtyByLot(lotNo, storeId, itemType, accessoryId, colorId, uomId, designId, gaugeId, loopLengthId, gsmId, sizeId, fabricId, kDiaId, fDiaId) {
        let sql;



        if (itemType == "DyedFabric") {
            sql = `select 
            sum(qty) as stockQty,sum(noOfRolls) as stockRolls  from stock
            where colorId=${colorId} and uomId=${uomId} and designId=${designId} and gaugeId=${gaugeId} and loopLengthId=${loopLengthId}
             and gsmId=${gsmId}  and 
            fabricId=${fabricId} and   kDiaId=${kDiaId} and fDiaId=${fDiaId} and 
            storeId=${storeId} and lotNo=${lotNo}
                    `
        }
        else {
            sql = `select
            sum(qty) as stockQty,sum(noOfRolls) as stockRolls  from stock
            where colorId=${colorId} and uomId=${uomId} 
           and sizeId=${sizeId} and 
            accessoryId=${accessoryId} and  
            storeId=${storeId} 
                    `
        }

        const stockData = await prisma.$queryRawUnsafe(sql);
        return stockData[0]
    }



    function getStockObject(transType, item, poInwardOrDirectInward = null) {
        let newItem = {};
        if ((transType === "GreyYarn") || (transType === "DyedYarn")) {
            newItem["yarnId"] = parseInt(item["yarnId"]);
        } else if ((transType === "GreyFabric") || (transType === "DyedFabric")) {
            newItem["fabricId"] = parseInt(item["fabricId"]);
            newItem["designId"] = parseInt(item["designId"]);
            newItem["gaugeId"] = parseInt(item["gaugeId"]);
            newItem["loopLengthId"] = parseInt(item["loopLengthId"]);
            newItem["gsmId"] = parseInt(item["gsmId"]);
            newItem["kDiaId"] = parseInt(item["kDiaId"]);
            newItem["fDiaId"] = parseInt(item["fDiaId"]);
        } else if (transType === "Accessory") {
            newItem["accessoryId"] = parseInt(item["accessoryId"])
            newItem["sizeId"] = item["sizeId"] ? parseInt(item["sizeId"]) : undefined;
        }
        newItem["uomId"] = parseInt(item["uomId"])
        newItem["colorId"] = parseInt(item["colorId"])

        return newItem
    }







}


async function getStockQty(storeId, itemId, sizeId, colorId, uomId) {
    let sql;



    sql = `select sum(qty) as stockQty from stock
            where storeId = ${storeId} and itemId = ${itemId} and sizeId = ${sizeId} and  colorId=${colorId} and uomId=${uomId}  `

    console.log(sql, "sql for stockQty")

    const stockData = await prisma.$queryRawUnsafe(sql);
    return stockData[0]
}

async function getAllDataPoItems(data, poType, poInwardOrDirectInward) {


    let promises = data?.map(async (item) => {
        let data = await getPoItemById(item.id, null, null, null, null, poType, poInwardOrDirectInward)


        return data.data
    }
    )
    return Promise.all(promises)
}


async function getPoItemById(id, purchaseInwardReturnId, stockId, storeId, billEntryId, poType, poInwardOrDirectInward) {


    let data = await prisma.poItems.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            Po: true,
            directItems: {
                include: {
                    inwardLotDetails: true,
                    DirectReturnItems: true,
                    DirectInwardOrReturn: {
                        select: {
                            docId: true,
                            poInwardOrDirectInward: true,
                            dcNo: true,
                            dcDate: true,
                            createdAt: true,
                            poType: true,
                        }
                    }
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
            Yarn: {
                select: {
                    name: true,
                }
            },
            Fabric: {
                select: {
                    aliasName: true,
                    // name: true,
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



    const alreadyInwardedData = await prisma?.directItems?.aggregate({
        where: {
            poItemsId: parseInt(id),
            // DirectInwardOrReturn: {
            //     poInwardOrDirectInward: "PurchaseInward"
            // },
            // directInwardOrReturnId: {
            //     lt: JSON.parse(purchaseInwardReturnId) ? parseInt(purchaseInwardReturnId) : undefined
            // }
        },
        _sum: {
            qty: true,
            noOfBags: true,
            noOfRolls: true
        }
    });


    const alreadyReturnedData = await prisma?.directReturnItems?.aggregate({
        where: {
            poItemsId: parseInt(id),
            // DirectReturnOrPoReturn: {
            //     poInwardOrDirectInward: "PurchaseReturn"
            // },
            // directReturnOrPoReturnId: {
            //     lt: JSON.parse(purchaseInwardReturnId) ? parseInt(purchaseInwardReturnId) : undefined
            // }
        },
        _sum: {
            qty: true,
            noOfBags: true,
            noOfRolls: true
        }
    });



    const alreadyCancelData = await prisma.cancelItems.aggregate({
        where: {
            poItemsId: parseInt(id),
            // PurchaseCancel: {
            //     poInwardOrDirectInward: "PurchaseCancel"
            // },
            // purchaseCancelId: {
            //     lt: JSON.parse(purchaseInwardReturnId) ? parseInt(purchaseInwardReturnId) : undefined
            // }
        },
        _sum: {
            qty: true,

        }
    });





    const alreadyBillEntryData = await prisma?.billEntryItems?.aggregate({
        where: {
            poItemsId: parseInt(id),
            // DirectReturnOrPoReturn: {
            //     poInwardOrDirectInward: "PurchaseReturn"
            // },
            // directReturnOrPoReturnId: {
            //     lt: JSON.parse(purchaseInwardReturnId) ? parseInt(purchaseInwardReturnId) : undefined
            // }
        },
        _sum: {
            qty: true,

        }
    });

    console.log(alreadyBillEntryData, "alreadyBillEntryData")
    console.log(alreadyCancelData, "alreadyCancelData")



    let poQty = parseFloat(data?.qty || 0).toFixed(3)
    let cancelQty = alreadyCancelData?._sum.qty ? parseFloat(alreadyCancelData?._sum.qty).toFixed(3) : "0.000";
    let alreadyInwardedQty = alreadyInwardedData?._sum?.qty ? parseFloat(alreadyInwardedData._sum.qty).toFixed(3) : "0.000";
    let alreadyReturnedQty = alreadyReturnedData?._sum?.qty ? parseFloat(alreadyReturnedData._sum.qty).toFixed(3) : "0.000";
    let alreadyInwardedRolls = alreadyInwardedData?._sum?.noOfRolls ? parseInt(alreadyInwardedData._sum.noOfRolls) : "0";
    let alreadyReturnedRolls = alreadyReturnedData?._sum?.noOfRolls ? parseInt(alreadyReturnedData._sum.noOfRolls) : "0";
    console.log(poQty, cancelQty, substract(poQty, cancelQty), "subtract", alreadyInwardedQty, alreadyReturnedQty, "substract", substract(alreadyInwardedQty, alreadyReturnedQty))
    let balanceQty = substract(substract(poQty, cancelQty), substract(alreadyInwardedQty, alreadyReturnedQty))
    // let balanceQty = substract(substract(poQty, cancelQty), alreadyReturnedQty)

    let allowedReturnRolls = substract(alreadyInwardedRolls, alreadyReturnedRolls)
    let allowedReturnQty = substract(alreadyInwardedQty, alreadyReturnedQty)





    let stockQty = parseFloat((await getStockQty(storeId, data?.itemId, data?.sizeId, data?.colorId, data?.uomId))?.stockQty || 0)
    let alreadyBillEntryQty = alreadyBillEntryData?._sum?.qty ? parseInt(alreadyBillEntryData._sum.qty) : "0";









    return {
        statusCode: 0, data: {
            ...data,

            alreadyInwardedData,
            balanceQty,
            cancelQty,
            poQty,
            stockQty,
            allowedReturnRolls,
            allowedReturnQty,
            alreadyInwardedQty,
            alreadyReturnedQty,
            alreadyReturnedData,
            alreadyCancelData,
            alreadyBillEntryData,
            alreadyBillEntryQty,

        }
    };
}

export async function getPoItemsandDirectInwardItems(req) {
    const { branchId, active, pageNumber, dataPerPage, poType,
        searchDocId, searchPoDate,
        searchSupplierAliasName,
        searchPoType,
        searchDueDate,
        pagination,
        supplierId,
        isYarnFilter,
        searchItem,
        searchSize,
        searchColor,
        searchUom
    } = req.query
    let poItems;
    let directItems;
    let data;
    let totalCount;


    if (pagination) {
        directItems = await prisma.directItems.findMany({
            where: {
                DirectInwardOrReturn:
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
                Item: {
                    name: Boolean(searchItem) ? { contains: searchItem } : undefined,
                },
                Size: {
                    name: Boolean(searchSize) ? { contains: searchSize } : undefined,
                },
                Color: {
                    name: Boolean(searchColor) ? { contains: searchColor } : undefined,
                },
                Uom: {
                    name: Boolean(searchUom) ? { contains: searchUom } : undefined,
                }

            }
        });
        directItems = manualFilterSearchDataDirectItems(searchPoDate, searchDueDate, searchPoType, directItems)

        poItems = await prisma.poItems.findMany({
            // where: {
            //     Po:
            //     {
            //         branchId: branchId ? parseInt(branchId) : undefined,
            //         docId: Boolean(searchDocId) ?
            //             {
            //                 contains: searchDocId
            //             }
            //             : undefined,
            //         supplierId: supplierId ? parseInt(supplierId) : undefined,
            //         transType: poType,
            //         supplier: {
            //             aliasName: Boolean(searchSupplierAliasName) ? { contains: searchSupplierAliasName } : undefined
            //         }
            //     },
            // },
            include: {
                Po: true,
            }
        });
        poItems = manualFilterSearchDataPoItems(searchPoDate, searchDueDate, searchPoType, poItems)



        console.log("poItems", poItems)
        if (isYarnFilter) {
            poItems = poItems?.filter(item => item?.Po?.poMaterial == poType && item?.Po?.supplierId == supplierId)
        }
        console.log("AfterFilterpoItems", poItems)


        poItems = await getAllDataPoItems(poItems)

        console.log("poItemsAter", poItems)

        poItems = poItems?.filter(item =>
            billItemsFiltration(
                item?.alreadyInwardedData?._sum?.qty ? item.alreadyInwardedData?._sum?.qty : 0,
                item?.alreadyReturnedData?._sum?.qty ? item.alreadyReturnedData._sum?.qty : 0
            ))

        console.log("billItemsFiltration", poItems)

        data = [...poItems]


        // poItems = poItems.map(item => { return { ...item, isPoItem: true } })


        // data = [...poItems, ...directItems]


        // totalCount = data.length

        // data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)

        // let poItemsAfterSlice = data.filter(item => item.isPoItem)

        // let directItemsAfterSlice = data.filter(item => !(item.isPoItem))

        // directItemsAfterSlice = await getAllDataDirectItems(directItemsAfterSlice)

        // data = [...directItemsAfterSlice, ...poItemsAfterSlice]




    } else {
        data = await prisma.directItems.findMany({
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
    const data = await prisma.directInwardOrReturn.findMany({
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


async function createYarnItemsStock(tx, poType, poInwardOrDirectInward, branchId, storeId, item, directInwardOrReturnGridId, partyId) {
    await tx.stock.create({
        data: {
            // itemType: poType,
            transactionId: directInwardOrReturnGridId ? parseInt(directInwardOrReturnGridId) : undefined,
            inOrOut: poInwardOrDirectInward,
            branchId: parseInt(branchId),
            supplierId: partyId ? parseInt(partyId) : undefined,
            storeId: storeId ? parseInt(storeId) : undefined,

            itemId: item.itemId ? parseInt(item.itemId) : undefined,
            itemCode: item.itemCode ? parseInt(item.itemCode) : undefined,
            sizeId: item?.sizeId ? parseInt(item.sizeId) : undefined,
            colorId: item?.colorId ? parseInt(item.colorId) : undefined,
            uomId: item?.uomId ? parseInt(item.uomId) : undefined,
            qty: (item.qty) ? parseFloat(item.qty) : undefined,
            price: item.price ? parseFloat(item.price) : undefined,
            sectionId: item?.sectionId ? parseInt(item?.sectionId) : undefined,
            barcode: item?.barcode ? String(item?.barcode) : undefined,
            ...pickStockRuntimeFieldValues(item),
        }
    })
}

async function createDirectInwardReturnItems(tx, directInwardOrReturnId, directItems, poType, poInwardOrDirectInward, storeId, branchId, partyId) {
    let promises


    promises = directItems?.map(async (item, index) => {
        const data = await tx.directItems.create({
            data: {
                directInwardOrReturnId: parseInt(directInwardOrReturnId),
                itemId: item["itemId"] ? parseInt(item["itemId"]) : undefined,
                itemCode: item["itemCode"] ? parseInt(item["itemCode"]) : undefined,
                sizeId: item["sizeId"] ? parseInt(item["sizeId"]) : undefined,
                colorId: item["colorId"] ? parseInt(item["colorId"]) : undefined,
                uomId: item["uomId"] ? parseInt(item["uomId"]) : undefined,
                qty: item["qty"] ? parseFloat(item["qty"]) : 0,
                price: item["price"] ? parseFloat(item["price"]) : 0,
                poNo: item["poNo"] ? item["poNo"] : undefined,
                sectionId: item["sectionId"] ? parseInt(item["sectionId"]) : undefined,
                barcode: item["barcode"] ? item["barcode"] : undefined,



                field1: item["field1"] ? (item["field1"]) : undefined,
                field2: item["field2"] ? (item["field2"]) : undefined,
                field3: item["field3"] ? (item["field3"]) : undefined,
                field4: item["field4"] ? (item["field4"]) : undefined,
                field5: item["field5"] ? (item["field5"]) : undefined,
                field6: item["field6"] ? (item["field6"]) : undefined,
                field7: item["field7"] ? (item["field7"]) : undefined,
                field8: item["field8"] ? (item["field8"]) : undefined,
                field9: item["field9"] ? (item["field9"]) : undefined,
                field10: item["field10"] ? (item["field10"]) : undefined,



                noOfBags: item["noOfBags"] ? parseInt(item["noOfBags"]) : 0,
                poItemsId: item["poItemsId"] ? parseInt(item["poItemsId"]) : undefined,
                taxPercent: item["taxPercent"] ? parseFloat(item["taxPercent"]) : 0,
                poQty: item["poQty"] ? parseFloat(item["poQty"]) : 0,




            }
        })
        await createYarnItemsStock(tx, poType, poInwardOrDirectInward, branchId, storeId, item, data?.id, partyId)

    }
    )





    return Promise.all(promises)
}


async function create(body) {
    const { poType, poInwardOrDirectInward,
        partyId, directInwardReturnItems, dcNo, dcDate, storeId,
        payTermId, processValid = false,
        vehicleNo, specialInstructions, remarks, orderId, locationId,
        branchId, active, userId, finYearId } = await body
    // await validateActiveItemsForInward(directInwardReturnItems);
    // await validateInventoryVariantRows(directInwardReturnItems, `${poInwardOrDirectInward} row`);
    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startDateStartTime, finYearDate?.endDateEndTime) : "";
    let docId = await getNextDocId(branchId, poInwardOrDirectInward, shortCode, finYearDate?.startDateStartTime, finYearDate?.endDateEndTime);
    let data;

    await prisma.$transaction(async (tx) => {

        data = await tx.directInwardOrReturn.create({
            data: {
                poType,
                branchId: branchId ? parseInt(branchId) : undefined,
                poInwardOrDirectInward: poInwardOrDirectInward ? poInwardOrDirectInward : undefined,
                locationId: locationId ? parseInt(locationId) : undefined,
                storeId: storeId ? parseInt(storeId) : undefined,
                supplierId: partyId ? parseInt(partyId) : undefined,
                dcNo,
                dcDate: dcDate ? new Date(dcDate) : undefined,
                payTermId: payTermId ? parseInt(payTermId) : undefined,
                active,
                createdById: parseInt(userId),
                vehicleNo,
                specialInstructions,
                remarks,
                docId,

            },
        })

        await createDirectInwardReturnItems(tx, data.id, directInwardReturnItems, poType, poInwardOrDirectInward, storeId, branchId, partyId)
    })
    return { statusCode: 0, data };
}











async function deletePurchaseInwardReturnItems(tx, removeItemsPurchaseInwardReturnIds) {

    return await tx.directItems.deleteMany({
        where: {
            id: {
                in: removeItemsPurchaseInwardReturnIds
            }
        }
    })
}

async function deleteStockReturnItems(tx, removeItemsPurchaseInwardReturnIds) {

    console.log(removeItemsPurchaseInwardReturnIds, "removeItemsPurchaseInwardReturnIds")


    const existingStock = await tx.Stock.findMany({
        where: {
            transactionId: {
                in: removeItemsPurchaseInwardReturnIds
            },
            inOrOut: "DirectInward"
        }
    });

    console.log(existingStock, "existingStock")

    if (!existingStock.length) {
        return
    }

    return await tx.Stock.deleteMany({
        where: {
            transactionId: {
                in: removeItemsPurchaseInwardReturnIds
            },
            inOrOut: "DirectInward"
        }
    });
}



async function createYarnItemsUpdateStock(tx, poType, poInwardOrDirectInward, branchId, storeId, item, stockTransactionId) {
    await tx.stock.updateMany({
        where: {
            transactionId: parseInt(stockTransactionId),
            inOrOut: poInwardOrDirectInward,
        },
        data: {
            itemId: item["itemId"] ? parseInt(item["itemId"]) : undefined,
            itemCode: item["itemCode"] ? parseInt(item["itemCode"]) : undefined,
            sizeId: item["sizeId"] ? parseInt(item["sizeId"]) : undefined,
            colorId: item["colorId"] ? parseInt(item["colorId"]) : undefined,
            uomId: item["uomId"] ? parseInt(item["uomId"]) : undefined,
            qty: item["qty"] ? parseFloat(item["qty"]) : undefined,
            price: item["price"] ? parseFloat(item["price"]) : undefined,
            sectionId: item["sectionId"] ? parseFloat(item["sectionId"]) : undefined,
            ...pickStockRuntimeFieldValues(item),
        }
    })
}




async function updateOrCreate(tx, item, directInwardOrReturnId, poType, poInwardOrDirectInward, storeId, branchId, partyId) {

    if (item?.id) {


        let updatedata = await tx.directItems.update({
            where: {
                id: parseInt(item.id)
            },
            data: {
                directInwardOrReturnId: parseInt(directInwardOrReturnId),
                itemId: item["itemId"] ? parseInt(item["itemId"]) : undefined,
                itemCode: item["itemCode"] ? parseInt(item["itemCode"]) : undefined,
                sizeId: item["sizeId"] ? parseInt(item["sizeId"]) : undefined,
                colorId: item["colorId"] ? parseInt(item["colorId"]) : undefined,
                uomId: item["uomId"] ? parseInt(item["uomId"]) : undefined,
                qty: item["qty"] ? parseFloat(item["qty"]) : undefined,
                price: item["price"] ? parseFloat(item["price"]) : undefined,
                sectionId: item["sectionId"] ? parseFloat(item["sectionId"]) : undefined,
                barcode: item["barcode"] ? item["barcode"] : undefined,

                field1: item["field1"] ? (item["field1"]) : undefined,
                field2: item["field2"] ? (item["field2"]) : undefined,
                field3: item["field3"] ? (item["field3"]) : undefined,
                field4: item["field4"] ? (item["field4"]) : undefined,
                field5: item["field5"] ? (item["field5"]) : undefined,
                field6: item["field6"] ? (item["field6"]) : undefined,
                field7: item["field7"] ? (item["field7"]) : undefined,
                field8: item["field8"] ? (item["field8"]) : undefined,
                field9: item["field9"] ? (item["field9"]) : undefined,
                field10: item["field10"] ? (item["field10"]) : undefined,


            }
        })

        await createYarnItemsUpdateStock(tx, poType, poInwardOrDirectInward, branchId, storeId, item, item?.id)




    }


    else {
        let data = await tx.directItems.create({
            data: {
                directInwardOrReturnId: parseInt(directInwardOrReturnId),
                itemId: item["itemId"] ? parseInt(item["itemId"]) : undefined,
                itemCode: item["itemCode"] ? parseInt(item["itemCode"]) : undefined,
                sizeId: item["sizeId"] ? parseInt(item["sizeId"]) : undefined,
                colorId: item["colorId"] ? parseInt(item["colorId"]) : undefined,
                uomId: item["uomId"] ? parseInt(item["uomId"]) : undefined,
                qty: item["qty"] ? parseFloat(item["qty"]) : undefined,
                price: item["price"] ? parseFloat(item["price"]) : undefined,
                sectionId: item["sectionId"] ? parseFloat(item["sectionId"]) : undefined,
                barcode: item["barcode"] ? item["barcode"] : undefined,

                field1: item["field1"] ? (item["field1"]) : undefined,
                field2: item["field2"] ? (item["field2"]) : undefined,
                field3: item["field3"] ? (item["field3"]) : undefined,
                field4: item["field4"] ? (item["field4"]) : undefined,
                field5: item["field5"] ? (item["field5"]) : undefined,
                field6: item["field6"] ? (item["field6"]) : undefined,
                field7: item["field7"] ? (item["field7"]) : undefined,
                field8: item["field8"] ? (item["field8"]) : undefined,
                field9: item["field9"] ? (item["field9"]) : undefined,
                field10: item["field10"] ? (item["field10"]) : undefined,
            }
        })

        await createYarnItemsStock(tx, poType, poInwardOrDirectInward, branchId, storeId, item, data?.id, partyId)
        // await createYarnItemsStock(tx, poType, poInwardOrDirectInward, branchId, storeId, item, data?.id, partyId)

    }
}

async function updateAllPInwardReturnItems(tx, directInwardReturnItems, directInwardOrReturnId, poType, poInwardOrDirectInward, storeId, branchId, partyId) {
    let promises = directInwardReturnItems?.map(async (item) => await updateOrCreate(tx, item, directInwardOrReturnId, poType, poInwardOrDirectInward, storeId, branchId, partyId))
    return Promise.all(promises)
}

async function update(id, body) {

    const { poType, poInwardOrDirectInward,
        supplierId, directInwardReturnItems, dcNo, dcDate, storeId,
        vehicleNo, specialInstructions, remarks, orderId, locationId, partyId,
        branchId, active, userId } = await body
    await validateActiveItemsForInward(directInwardReturnItems);
    await validateInventoryVariantRows(directInwardReturnItems, `${poInwardOrDirectInward} row`);


    const dataFound = await prisma.directInwardOrReturn.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            DirectItems: true
        }
    })
    if (!dataFound) return NoRecordFound("directInwardOrReturn");
    let piData;


    let oldDirectInwardReturnIds = dataFound?.DirectItems.map(item => parseInt(item.id))
    let currentDirectInwardReturnIds = directInwardReturnItems.filter(i => i?.id)?.map(item => parseInt(item.id))
    let removeItemsPurchaseInwardReturnIds = getRemovedItems(oldDirectInwardReturnIds, currentDirectInwardReturnIds);

    console.log(removeItemsPurchaseInwardReturnIds, 'removeItemsPurchaseInwardReturnIds')

    await prisma.$transaction(async (tx) => {

        await deletePurchaseInwardReturnItems(tx, removeItemsPurchaseInwardReturnIds);
        await deleteStockReturnItems(tx, removeItemsPurchaseInwardReturnIds);

        piData = await tx.directInwardOrReturn.update({
            where: {
                id: parseInt(id)
            },
            data: {
                poType, poInwardOrDirectInward,
                supplierId: parseInt(partyId),
                branchId: parseInt(branchId),
                locationId: parseInt(locationId),
                storeId: parseInt(storeId),
                dcNo,
                dcDate: dcDate ? new Date(dcDate) : undefined,
                vehicleNo, specialInstructions, remarks,
                active,
                updatedById: parseInt(userId),


            },
        })
        await updateAllPInwardReturnItems(tx, directInwardReturnItems, piData.id, poType, poInwardOrDirectInward, storeId, branchId, partyId)
    })
    return { statusCode: 0, data: piData };
}













async function remove(id) {



    const data = await prisma.directInwardOrReturn.delete({
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
