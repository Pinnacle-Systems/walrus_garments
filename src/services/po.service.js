import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';
import { balanceCancelQtyCalculation, balanceQtyCalculation, getDateFromDateTime, getDateTimeRange, getYearShortCode, getYearShortCodeForFinYear, substract } from '../utils/helper.js';
import { getTableRecordWithId } from "../utils/helperQueries.js"
import { getFinYearStartTimeEndTime } from '../utils/finYearHelper.js';
import { poUpdateValidator } from '../validators/po.validator.js';
import { getTotalQty } from '../utils/poHelpers/getTotalQuantity.js';
const prisma = new PrismaClient()

async function getNextDocId(branchId, shortCode, startTime, endTime) {
    let lastObject = await prisma.po.findFirst({
        where: {
            branchId: parseInt(branchId),
            // AND: [
            //     {
            //         createdAt: {
            //             gte: startTime

            //         }
            //     },
            //     {
            //         createdAt: {
            //             lte: endTime
            //         }
            //     }
            // ],
        },
        orderBy: {
            id: 'desc'
        }
    });
    console.log(branchId, shortCode, startTime, endTime, "branchId, shortCode, startTime, endTime")
    const branchObj = await getTableRecordWithId(branchId, "branch")
    let newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/PO/1`
    if (lastObject) {
        newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/PO/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
    }
    return newDocId
}


function manualFilterSearchData(searchPoDate, searchDueDate, searchPoType, data) {
    return data.filter(item =>
        (searchPoDate ? String(getDateFromDateTime(item.createdAt)).includes(searchPoDate) : true) &&
        (searchDueDate ? String(getDateFromDateTime(item.dueDate)).includes(searchDueDate) : true) &&
        (searchPoType ? (item.transType.toLowerCase().includes(searchPoType.toLowerCase())) : true)
    )
}

async function get(req) {
    const { branchId, active, pagination, pageNumber, dataPerPage,
        finYearId,
        searchDocId, searchPoDate, searchSupplierAliasName, searchPoType, searchDueDate, supplierId, startDate, endDate, filterParties, supplier,
        filterPoTypes, serachDocNo, searchClientName, searchDate, searchMaterial
    } = req.query
    const { startTime: startDateStartTime } = getDateTimeRange(startDate);
    const { endTime: endDateEndTime } = getDateTimeRange(endDate);
    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    console.log(finYearDate, "")
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startDateStartTime, finYearDate?.endDateEndTime) : "";
    let data = await prisma.po.findMany({
        where: {
            AND: [
                {
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
                },
                {
                    AND: (startDate && endDate) ? [
                        {
                            createdAt: {
                                gte: startDateStartTime
                            }
                        },
                        {
                            createdAt: {
                                lte: endDateEndTime
                            }
                        }
                    ] : undefined,
                }
            ],
            branchId: branchId ? parseInt(branchId) : undefined,
            active: active ? Boolean(active) : undefined,
            docId: Boolean(serachDocNo) ?
                {
                    contains: serachDocNo
                }
                : undefined,
            transType: (filterPoTypes && filterPoTypes.length > 0) ? {
                in: filterPoTypes.split(",").map(i => i)
            } : undefined,
            OR: supplierId || Boolean(filterParties) ? [
                {
                    supplierId: supplierId ? parseInt(supplierId) : undefined,
                },
                {
                    supplierId: Boolean(filterParties) ? {
                        in: filterParties.split(",").map(i => parseInt(i))
                    } : undefined,
                }
            ] : undefined,
            supplier: {
                aliasName: Boolean(searchSupplierAliasName) ? { contains: searchSupplierAliasName } : undefined,
                name: Boolean(supplier) ? { contains: supplier } : undefined,
            },
            poMaterial: searchMaterial ? { contains: searchMaterial } : undefined,

        },
        orderBy: {
            id: "desc",
        },
        include: {
            supplier: {
                select: {
                    aliasName: true,
                    name: true
                }
            },

            PoItems: {
                select: {
                    qty: true
                }
            }
        }
    });
    data = manualFilterSearchData(searchDate, searchDueDate, searchPoType, data)
    const totalCount = data.length
    data = await getTotalQty(data);
    // if (pagination) {
    //     data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)
    // }



    let docId = finYearDate ? (await getNextDocId(branchId, shortCode, finYearDate?.startDateStartTime, finYearDate?.endDateEndTime)) : "";
    // console.log(data, "data")
    return { statusCode: 0, data, nextDocId: docId, totalCount };
}


async function getOne(id) {
    const childRecord = 0;

    // Fetch PO with relations
    let po = await prisma.po.findUnique({
        where: { id: parseInt(id) },
        include: {
            PoItems: {
                select: {
                    id: true,
                    yarnId: true,
                    colorId: true,
                    uomId: true,
                    requiredQty: true,
                    qty: true,
                    price: true,
                    poId: true,
                    count: true,
                    isDeleted: true,
                    requirementPlanningItemsId: true,
                    orderId: true,
                    taxPercent: true,
                    hsnId: true,
                    orderDetailsId: true,
                    isPurchaseCancel: true,
                    RequirementPlanningItems: {
                        select: { requiredQty: true }
                    }
                }
            },
            supplier: {
                select: {
                    aliasName: true,
                    contactPersonName: true,
                    gstNo: true,
                    address: true,
                    pincode: true,
                    City: {
                        select: { name: true }
                    }
                }
            },
            DeliveryParty: {
                select: {
                    name: true,
                    address: true,
                    contactPersonName: true
                }
            },
            DeliveryBranch: {
                select: {
                    branchName: true,
                    contactName: true,
                    address: true
                }
            }
        }
    });

    if (!po) return NoRecordFound("po");

    // Compute PoItems with balanceQty
    const updatedItems = po.PoItems?.map(item => {
        const qty = parseFloat(item.qty) || 0;
        const req = parseFloat(item?.RequirementPlanningItems?.requiredQty) || 0;

        return {
            ...item,
            balanceQty: Math.max(0,parseFloat(req) - parseFloat(qty)),
            requiredQty: req
        };
    }) || [];

    // Assign updated PoItems back to PO object
    po.PoItems = updatedItems;

    return {
        statusCode: 0,
        data: {
            ...po,
            childRecord,
        }
    };
}




async function getSearch(req) {
    const { companyId, active } = req.query
    const { searchKey } = req.params
    const data = await prisma.po.findMany({
        where: {
            country: {
                companyId: companyId ? parseInt(companyId) : undefined,
            },
            active: active ? Boolean(active) : undefined,
            OR: [
                {
                    name: {
                        contains: searchKey,
                    },
                }
            ],
        }
    })
    return { statusCode: 0, data: data };
}

function manualFilterSearchDataPoItems(searchPoDate, searchDueDate, searchPoType, data) {
    return data.filter(item =>
        (searchPoDate ? String(getDateFromDateTime(item.Po.createdAt)).includes(searchPoDate) : true) &&
        (searchDueDate ? String(getDateFromDateTime(item.Po.dueDate)).includes(searchDueDate) : true) &&
        (searchPoType ? (item.Po.transType.toLowerCase().includes(searchPoType.toLowerCase())) : true)
    )
}

export async function getPoItems(req) {
    const { branchId, active, supplierId, poType, pagination, dataPerPage,
        searchDocId, searchPoDate, searchSupplierAliasName, searchPoType, searchDueDate,
        isPurchaseInwardFilter, isPurchaseCancelFilter, isPurchaseReturnFilter, poInwardOrDirectInward,

    } = req.query


    let data;

    // let po = poInwardOrDirectInward === "GeneralInward" ? "General Purchase" : poInwardOrDirectInward === "PurchaseInward" ? "Order Purchase" : undefined
    //  po  == poType ?  

    let po


    if (poInwardOrDirectInward == "Order Purchase" || poInwardOrDirectInward == "General Purchase") {
        po = poInwardOrDirectInward
    }
    else {
        po = poInwardOrDirectInward === "GeneralInward" ? "General Purchase" : poInwardOrDirectInward === "PurchaseInward" ? "Order Purchase" : poInwardOrDirectInward === "GeneralReturn" ? "General Purchase" : "Order Purchase"
    }


    console.log(po, "pooooo")
    let totalCount;





    if (pagination) {

        data = await prisma.poItems.findMany({
            where: {
                Po:
                {
                    docId: Boolean(searchDocId) ?
                        {
                            contains: searchDocId
                        }
                        : undefined,
                    supplierId: supplierId ? parseInt(supplierId) : undefined,
                    // transType: poType ? poType : undefined,

                },
            },
            include: {
                Po: true,
                Yarn: {
                    select: {
                        name: true
                    }
                }
            }
        });
        // console.log(data, "poType",poType)

        data = manualFilterSearchDataPoItems(searchPoDate, searchDueDate, searchPoType, data)

        // totalCount = data.length
        // data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)
        // if (poInwardOrDirectInward != "PurchaseReturn" && poInwardOrDirectInward != "GeneralReturn") {
        // }

        console.log(data, "databefore filter")


        data = data?.filter(i => i.Po.supplierId == supplierId && i.Po.poMaterial == poType && i.Po.poType === po)



        console.log(data, "Bef0ore")

        data = await getAllDataPoItems(data, poType, poInwardOrDirectInward)

        console.log(data, "After")


        if (isPurchaseInwardFilter) {

            data = data.filter(item => parseFloat(balanceQtyCalculation(item?.qty, item?.alreadyCancelData?._sum?.qty, item?.alreadyInwardedData?._sum?.qty, item?.alreadyReturnedData?._sum?.qty)) > 0)

            data = data?.filter(j => parseFloat(j.balanceQty) > 0)

        }

        if (isPurchaseCancelFilter) {
            data = data.filter(item => parseFloat(balanceCancelQtyCalculation(item?.qty, item?.alreadyCancelData?._sum?.qty, item?.alreadyInwardedData?._sum?.qty, item?.alreadyReturnedData?._sum?.qty)) > 0)


        }
        if (isPurchaseReturnFilter) {
            data = data.filter(item => substract(item.alreadyInwardedData?._sum?.qty ? item.alreadyInwardedData._sum.qty : 0, item.alreadyReturnedData?._sum?.qty ? item.alreadyReturnedData?._sum?.qty : 0) > 0)
        }



    } else {
        data = await prisma.poItems.findMany({
            where: {
                branchId: branchId ? parseInt(branchId) : undefined,
                active: active ? Boolean(active) : undefined,
            }
        });
    }

    return { statusCode: 0, data, totalCount };
}


export async function getAllDataPoItems(data, poType, poInwardOrDirectInward) {

    console.log(data, "data")

    let promises = data?.map(async (item) => {
        let data = await getPoItemById(item.id, null, null, null, null, poType, poInwardOrDirectInward)


        return data.data
    }
    )
    return Promise.all(promises)
}


export async function getPoItemById(id, purchaseInwardReturnId, stockId, storeId, billEntryId, poType, poInwardOrDirectInward) {



    let data = await prisma.poItems.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            order: {
                select: {
                    docId: true
                }
            },
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
            },

        }
    });

    console.log(data, "dataInPoItemasId503", )


    const alreadyInwardedData = await prisma?.directItems?.aggregate({
        where: {
            poItemsId: parseInt(id),
            // DirectInwardOrReturn: {
            //     poInwardOrDirectInward: "PurchaseInward"
            // },
            directInwardOrReturnId: {
                lt: JSON.parse(purchaseInwardReturnId) ? parseInt(purchaseInwardReturnId) : undefined
            }
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
            cancelType: "CANCEL",
            purchaseCancelId: {
                lt: JSON.parse(purchaseInwardReturnId) ? parseInt(purchaseInwardReturnId) : undefined
            }
        },
        _sum: {
            qty: true,

        }
    });


    // const alreadyBillData = await prisma?.billEntryItems?.aggregate({
    //     where: {
    //         poItemsId: parseInt(id),
    //         // DirectReturnOrPoReturn: {
    //         //     poInwardOrDirectInward: "PurchaseReturn"
    //         // },
    //         // directReturnOrPoReturnId: {
    //         //     lt: JSON.parse(purchaseInwardReturnId) ? parseInt(purchaseInwardReturnId) : undefined
    //         // }
    //     },
    //     _sum: {
    //         qty: true,

    //     }
    // });
    const alreadyBillData = await prisma.billEntryItems.aggregate({
        where: {
            poItemsId: parseInt(id),
            billEntryId: {
                lt: JSON.parse(billEntryId) ? parseInt(billEntryId) : undefined
            }
        },
        _sum: {
            qty: true,
        }
    });


    async function getLotWiseDatas(inwardData) {


        return {
            lotNo: inwardData?.lotNo,
            inwardNoOfRolls: inwardData?.noOfRolls,
            inwardQty: inwardData?.qty,
            qty: 0,
            noOfRolls: 0,
            alreadyReturnedRolls: (await getLotWiseReturnRolls(inwardData?.lotNo, id))?.lotRolls,
            alreadyReturnedQty: (await getLotWiseReturnRolls(inwardData?.lotNo, id))?.lotQty,
            stockQty: parseFloat((await getStockQtyByLot(inwardData?.lotNo, storeId, poType, data?.accessoryId, data?.colorId, data?.uomId, data?.designId, data?.gaugeId, data?.loopLengthId, data?.gsmId, data?.sizeId, data?.fabricId, data?.kDiaId, data?.fDiaId))?.stockQty || 0),

            allowedReturnQty: parseFloat(parseFloat(inwardData?.qty) - parseFloat((await getLotWiseReturnRolls(inwardData?.lotNo, id))?.lotQty || 0))
        }

    }






    let poQty = parseFloat(data?.qty || 0).toFixed(3)
    let cancelQty = alreadyCancelData?._sum.qty ? parseFloat(alreadyCancelData?._sum.qty).toFixed(3) : "0.000";
    let alreadyInwardedQty = alreadyInwardedData?._sum?.qty ? parseFloat(alreadyInwardedData._sum.qty).toFixed(3) : "0.000";
    let alreadyReturnedQty = alreadyReturnedData?._sum?.qty ? parseFloat(alreadyReturnedData._sum.qty).toFixed(3) : "0.000";
    let alreadyInwardedRolls = alreadyInwardedData?._sum?.noOfRolls ? parseInt(alreadyInwardedData._sum.noOfRolls) : "0";
    let alreadyReturnedRolls = alreadyReturnedData?._sum?.noOfRolls ? parseInt(alreadyReturnedData._sum.noOfRolls) : "0";
    console.log(poQty, cancelQty, substract(poQty, cancelQty), "subtract", alreadyInwardedQty, alreadyReturnedQty, "substract", substract(alreadyInwardedQty, alreadyReturnedQty))
    let balanceQty = substract(substract(poQty, cancelQty), substract(alreadyInwardedQty, alreadyReturnedQty))
    // let balanceQty = substract(substract(poQty, cancelQty), alreadyReturnedQty)
    let alreadyBilledQty = alreadyBillData?._sum?.qty ? parseInt(alreadyBillData._sum.qty) : "0";

    let allowedReturnRolls = substract(alreadyInwardedRolls, alreadyReturnedRolls)
    let allowedReturnQty = substract(alreadyInwardedQty, alreadyReturnedQty)





    let stockQty = parseFloat((await getStockQty(storeId, poType, data?.accessoryId, data?.colorId, data?.uomId, data?.designId, data?.gaugeId, data?.loopLengthId, data?.gsmId, data?.sizeId, data?.fabricId, data?.kDiaId, data?.fDiaId, data?.yarnId))?.stockQty || 0)
    // let stockRolls = parseInt((await getStockQty(storeId, poType, data?.accessoryId, data?.colorId, data?.uomId, data?.designId, data?.gaugeId, data?.loopLengthId, data?.gsmId, data?.sizeId, data?.fabricId, data?.kDiaId, data?.fDiaId,))?.stockRolls || 0)

  

    // let stockQty = substract(alreadyInwardedQty, alreadyReturnedQty)
    // let stockRolls = substract(alreadyInwardedRolls, alreadyReturnedRolls)
    let alreadyInwardLotWiseData = [];



    //     let inwardLotDetailsdata = `select lotNo, sum(inwardLotDetails.qty) as qty ,sum(inwardLotDetails.noOfRolls) as noOfRolls from poItems
    //  left join directItems on directItems.poitemsid=poItems.id left join inwardLotDetails on inwardLotDetails.directItemsId=directItems.id
    //  WHERE  poItems.ID=${id}
    //  group By lotNo`

    //     inwardLotDetailsdata = await prisma.$queryRawUnsafe(inwardLotDetailsdata);



    //     for (let i = 0; i < inwardLotDetailsdata?.length; i++) {
    //         let inwardData = inwardLotDetailsdata[i]
    //         alreadyInwardLotWiseData.push(await getLotWiseDatas(inwardData))
    //     }
    //     const poItemObj = getStockObject(data.Po.transType, data)


    // let stockData;
    // if (data.Po.transType === "Accessory") {
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
    //             storeId: JSON.parse(storeId) ? parseInt(storeId) : undefined,
    //             id: {
    //                 lt: JSON.parse(stockId) ? parseInt(stockId) : undefined
    //             },

    //         },
    //         by: ["yarnId", "colorId", "uomId", "fabricId", "gaugeId", "loopLengthId", "designId", "gsmId", "kDiaId", "fDiaId", "sizeId", "storeId", "branchId", "lotNo"],
    //         _sum: {
    //             qty: true,
    //             noOfBags: true,
    //             noOfRolls: true
    //         }
    //     });

    // }




    return {
        statusCode: 0, data: {
            ...data,

            alreadyInwardedData,
            balanceQty,
            cancelQty,
            poQty,
            stockQty,
            // stockRolls,
            allowedReturnRolls,
            allowedReturnQty,
            alreadyInwardedQty,
            alreadyReturnedQty,
            alreadyReturnedData,
            alreadyCancelData,
            alreadyBilledQty,
            alreadyBillData
            // stockData,
            // alreadyInwardLotWiseData: alreadyInwardLotWiseData?.filter(val => parseFloat(val?.stockQty) !== 0),

        }
    };
}


async function getLotWiseReturnRolls(lotNo, poItemsId) {
    let returnDatas = `select sum(ReturnLotDetails.qty) as lotQty,sum(ReturnLotDetails.noOfRolls) as lotRolls from directReturnItems left join DirectReturnOrPoReturn on DirectReturnOrPoReturn.id=directReturnItems.directReturnOrPoReturnId
    left join ReturnLotDetails on ReturnLotDetails.directReturnItemsId=directReturnItems.id
    where directReturnItems.poItemsId=${poItemsId}  and DirectReturnOrPoReturn.poInwardOrDirectInward="PurchaseReturn" ;
    `
    const alreadyReturnData = await prisma.$queryRawUnsafe(returnDatas);
    return alreadyReturnData[0]

}

async function getStockQty(storeId, itemType, accessoryId, colorId, uomId, designId, gaugeId, loopLengthId, gsmId, sizeId, fabricId, kDiaId, fDiaId, yarnId) {
    let sql;

    console.log("itemTypePOID", itemType == "Accessory", colorId, uomId, sizeId, accessoryId, storeId)


    if (itemType == "Accessory") {

        sql = `select sum(qty) as stockQty, sum(noOfRolls) as stockRolls  from stock
        where colorId=${colorId} and uomId=${uomId}  and sizeId=${sizeId} and accessoryId=${accessoryId} and  storeId=${storeId}; 
                `
    }
    else {
        sql = `select sum(qty) as stockQty,sum(noOfRolls) as stockRolls  from stock
        where yarnId=${yarnId} and colorId=${colorId} and uomId=${uomId} ;`
    }

    console.log(sql, "sqlstock")

    const stockData = await prisma.$queryRawUnsafe(sql);
    return stockData[0]



}

async function getStockQtyByLot(lotNo, storeId, itemType, accessoryId, colorId, uomId, designId, gaugeId, loopLengthId, gsmId, sizeId, fabricId, kDiaId, fDiaId) {
    let sql;



    if (itemType == "DyedFabric") {
        sql = `select sum(qty) as stockQty,sum(noOfRolls) as stockRolls  from stock
        where colorId=${colorId} and uomId=${uomId} and designId=${designId} and gaugeId=${gaugeId} and loopLengthId=${loopLengthId}
         and gsmId=${gsmId}  and 
        fabricId=${fabricId} and   kDiaId=${kDiaId} and fDiaId=${fDiaId} 

                `
    }
    else {
        sql = `select sum(qty) as stockQty,sum(noOfRolls) as stockRolls  from stock
        where colorId=${colorId} and uomId=${uomId} 
       and sizeId=${sizeId} and 
        accessoryId=${accessoryId}  ;
                `
    }

    const stockData = await prisma.$queryRawUnsafe(sql);
    return stockData[0]


}


function getStockObject(transType, item) {
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

export function getPoItemObject(poMaterial, item) {
    console.log(item, "item")

    let newItem = {};
    if (poMaterial === "GreyYarn" || poMaterial === "DyedYarn") {
        newItem.yarnId = parseInt(item.yarnId);
        newItem.noOfBags = item.noOfBags ? parseInt(item.noOfBags) : null;
        newItem.weightPerBag = item.weightPerBag ? parseFloat(item.weightPerBag) : null;
        newItem.percentage = item.percentage ? parseFloat(item.percentage) : null;
        newItem.requiredQty = item.requiredQty ? parseFloat(item.requiredQty) : null;
        newItem.count = item.count ? parseInt(item.count) : null;
        newItem.hsnId = item.hsnId ? parseInt(item.hsnId) : null;


    } else if (poMaterial === "GreyFabric" || poMaterial === "DyedFabric") {
        newItem.fabricId = parseInt(item.fabricId);
        newItem.designId = parseInt(item.designId);
        newItem.gaugeId = parseInt(item.gaugeId);
        newItem.loopLengthId = parseInt(item.loopLengthId);
        newItem.gsmId = parseInt(item.gsmId);
        newItem.kDiaId = parseInt(item.kDiaId);
        newItem.fDiaId = parseInt(item.fDiaId);

    } else if (poMaterial === "Accessory") {
        newItem.accessoryId = parseInt(item.accessoryId);
        newItem.sizeId = item.sizeId ? parseInt(item.sizeId) : undefined;
        newItem.accessoryGroupId = parseInt(item.accessoryGroupId)
        newItem.accessoryItemId = parseInt(item.accessoryItemId)
    }

    newItem.requirementPlanningItemsId = item?.RequirementPlanningItemsId ? parseInt(item?.RequirementPlanningItemsId) : undefined,
        newItem.orderId = item?.orderId ? parseInt(item?.orderId) : undefined,
        newItem.orderDetailsId = item?.orderDetailsId ? parseInt(item?.orderDetailsId) : undefined,
        newItem.uomId = item.uomId ? parseInt(item.uomId) : null;
    newItem.colorId = item.colorId ? parseInt(item.colorId) : undefined;
    newItem.qty = parseFloat(item.qty);
    newItem.price = parseFloat(item.price);
    newItem.discountType = item.discountType ?? null;
    newItem.discountValue = parseFloat(item.discountValue ?? 0);
    newItem.tax = parseFloat(item.tax ?? 0);
    newItem.taxPercent = parseFloat(item.taxPercent ?? 0);
    return newItem;
}





async function create(body) {
    const {
        transType, dueDate, poType, poMaterial,
        supplierId, poItems, term, remarks,
        branchId, active, userId, deliveryType, discountValue, discountType,
        deliveryToId, finYearId, orderId, PurchaseType, requirementId, taxTemplateId
    } = await body;

    const finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate.startTime, finYearDate.endTime) : "";
    const docId = await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime);
    // const prismaTransType = transType.replace(/\s/g, '');

    const filteredPoItems = poItems?.filter(val => val.qty > 0)?.map(item => getPoItemObject(poMaterial, item));

    console.log(filteredPoItems, "filteredPoItems")

    const data = await prisma.po.create({
        data: {
            transType: poMaterial ? poMaterial : "",
            poType: poType,
            poMaterial: poMaterial,
            orderId: orderId ? parseInt(orderId) : '',
            docId,
            dueDate: dueDate ? new Date(dueDate) : undefined,
            supplierId: parseInt(supplierId),
            branchId: parseInt(branchId),
            active: active ?? true,
            remarks: remarks ?? "",
            deliveryType: deliveryType ? deliveryType : "ToSelf",
            deliveryBranchId: deliveryType === "ToSelf" ? (deliveryToId ? parseInt(deliveryToId) : null) : null,
            deliveryPartyId: deliveryType === "ToParty" ? (deliveryToId ? parseInt(deliveryToId) : null) : null,
            createdById: parseInt(userId),
            orderId: orderId ? parseInt(orderId) : undefined,
            requirementId: requirementId ? parseInt(requirementId) : undefined,
            taxTemplateId: taxTemplateId ? parseInt(taxTemplateId) : undefined,
            discountType: discountType ? discountType : null,
            discountValue: discountValue ? parseFloat(discountValue) : undefined,
            termsAndCondtion: term ? term : undefined,
            PurchaseType: PurchaseType,
            PoItems: {
                createMany: {
                    data: filteredPoItems,
                },
            },
        },
    });

    return { statusCode: 0, data };
}


async function update(id, body) {
    const { transType, dueDate, taxTemplateId, remarks, payTermDay, poType, poMaterial,
        supplierId, poItems, term, deliveryType, deliveryToId, discountValue, discountType,
        branchId, active, userId, requirementId, orderId } = await body
    console.log(discountType ? true : false, "discountType")
    const dataFound = await prisma.po.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            PoItems: true
        }
    })
    if (!dataFound) return NoRecordFound("po");
    // const isValid = await poUpdateValidator(poItems)

    // if (!isValid) return { statusCode: 1, message: "Child Record Exists" };

    const isAlreadyItemAdded = id => {
        let item = dataFound.PoItems.find(item => parseInt(item.id) === parseInt(id))
        if (!item) return false
        return true
    }

    let newPoItems = poItems.filter(item => !item?.id)
    let updatePoItems = poItems.filter(item => isAlreadyItemAdded(item.id))
    let deletedItems = dataFound.PoItems.filter(item => {
        return !(poItems.filter(item => item?.id).some(poItem => parseInt(poItem.id) === parseInt(item.id)))
    }).map(item => parseInt(item.id))
    let data;
    await prisma.$transaction(async (tx) => {
        data = await tx.po.update({
            where: {
                id: parseInt(id),
            },
            data: {
                transType,
                // taxTemplateId: parseInt(taxTemplateId) ? parseInt(taxTemplateId) : undefined,
                poMaterial: poMaterial,
                poType: poType,
                payTermDay: payTermDay,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                supplierId: parseInt(supplierId),
                branchId: parseInt(branchId),
                active,
                remarks,
                updatedById: parseInt(userId),
                deliveryType,
                deliveryBranchId: (deliveryType === "ToSelf") ? (deliveryToId ? parseInt(deliveryToId) : undefined) : undefined,
                deliveryPartyId: (deliveryType === "ToParty") ? (deliveryToId ? parseInt(deliveryToId) : undefined) : undefined,
                orderId: orderId ? parseInt(orderId) : undefined,
                requirementId: requirementId ? parseInt(requirementId) : undefined,
                taxTemplateId: taxTemplateId ? parseInt(taxTemplateId) : undefined,
                discountType: discountType ? discountType : "",
                discountValue: discountValue ? parseFloat(discountValue) : undefined,
                termsAndCondtion: term ? term : undefined,

                PoItems: {
                    createMany: {
                        data: newPoItems?.map(item => getPoItemObject(poMaterial, item))
                    }
                }
            }
        });
        const updatePoItemsFunc = async () => {
            let promises = updatePoItems.map(async (item) => {
                return await tx.poItems.update({
                    where: {
                        id: parseInt(item.id)
                    },
                    data: getPoItemObject(transType, item)
                })
            })
            return Promise.all(promises)
        }
        await updatePoItemsFunc()
        await tx.poItems.deleteMany({
            where: {
                id: {
                    in: deletedItems
                }
            }
        })
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.po.delete({
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
