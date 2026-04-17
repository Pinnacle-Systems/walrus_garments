import { NoRecordFound } from '../configs/Responses.js';
import { prisma } from '../lib/prisma.js';
import { getStockProperty } from '../utils/helper.js';
import { getFinishedGoodsStockReport, getStockReportForCuttingDelivery } from '../utils/stockHelper.js';
import moment from "moment"
import {
    buildBarcodeSnapshotMatches,
    resolveOpeningStockLegacyItems,
    validateResolvedOpeningStockLegacyItems
} from './legacyStockRules.js';
import { pickStockRuntimeFieldValues, STOCK_RUNTIME_FIELD_KEYS } from './stockRuntimeFields.js';

const xprisma = prisma.$extends({
    result: {
        stock: {
            gross: {
                needs: { price: true, qty: true },
                compute(stock) {
                    return stock.price * stock.qty
                }
            },
        }
    },
})

export async function getPcsStock(req) {
    const {
        pagination = false, dataPerPage = 5, pageNumber = 1, storeId, prevProcessId, itemId, orderId,
        productionDeliveryId, isPacking, finishedGoodsSalesId, finishedGoodsSalesDeliveryId, branchId,
        stockTransferFinishedGoodsId, onlineSalesId, searchStyleNo, isForProductionDelivery, toProcessId,
    } = req.query
    let processId;

    let toProcessData;
    if (prevProcessId) {
        toProcessData = await prisma.process.findUnique({
            where: {
                id: parseInt(toProcessId)
            }
        })


    }

    let processData;
    if (prevProcessId) {
        processData = await prisma.process.findUnique({
            where: {
                id: parseInt(prevProcessId)
            }
        })

        // processId = prevProcessId;
        // if (processData?.isCutting) {
        //     processId = null
        // }
    }
    const storeFilter = `stockForPanels.storeId = ${storeId}`
    const processFilter = processId ? `stockForPanels.prevProcessId = ${prevProcessId}` : `stockForPanels.prevProcessId IS NULL`
    const productionDeliveryIdFilter = `(productionDelivery.id < ${productionDeliveryId} or productionDelivery.id IS NULL)`
    const isPackingFilter = isPacking ? `process.isPacking = 1` : `(process.isPacking = 0 OR process.isPacking IS NULL)`
    let filterConditions = []
    if (itemId) {
        filterConditions.push(`stockForPanels.itemId = ${itemId}`)
    }
    if (productionDeliveryId) {
        filterConditions.push(productionDeliveryIdFilter)
    }
    if (finishedGoodsSalesId) {
        filterConditions.push(`(finishedGoodsSales.id < ${finishedGoodsSalesId} or finishedGoodsSales.id IS NULL)`)
    }
    if (finishedGoodsSalesDeliveryId) {
        filterConditions.push(`(finishedGoodsSalesDelivery.id < ${finishedGoodsSalesDeliveryId} or finishedGoodsSalesDelivery.id IS NULL)`)
    }
    if (stockTransferFinishedGoodsId) {
        filterConditions.push(`(stockTransferdelivery.id < ${stockTransferFinishedGoodsId} or stockTransferdelivery.id IS NULL)
            `)
    }
    if (onlineSalesId) {
        filterConditions.push(`(onlineSales.id < ${onlineSalesId} or onlineSales.id IS NULL)
            `)
    }
    // if (searchStyleNo) {
    //     filterConditions.push(`LOWER(style.sku) LIKE LOWER('%${searchStyleNo}%')`)
    // }
    if (storeId) {
        filterConditions.push(storeFilter)
    }
    if (processId) {
        filterConditions.push(processFilter)
    }
    if (isPacking) {
        filterConditions.push(isPackingFilter)
    }
    if (branchId) {
        filterConditions.push(`stockForPanels.branchId = ${branchId}`)
    }

    const where = `where ${filterConditions.join(' and ')}`
    let filterStockByProcess;
    if (processData?.isIroning || processData?.isStitching || processData?.isPacking) {
        filterStockByProcess = "Stitching"
    }
    else {
        filterStockByProcess = "Panel"
    }

    let sql;
    if (isForProductionDelivery) {

        if ((filterStockByProcess == "Stitching") || (toProcessData?.isPacking || toProcessData?.isIroning)) {
            sql = `
    select item.name as itemName,stockForPanels.itemId,stockForPanels.panelId,panel.name as panelName, stockForPanels.sizeId,stockForPanels.colorId,stockForPanels.panelColorId,color.name as colorName, stockForPanels.uomId, uom.name as uomName, 
      size.name as sizeName, stockForPanels.stage as stage, sum(stockForPanels.qty) as qty
      from stockForPanels
      left join productionDeliveryDetails on productionDeliveryDetails.id = stockForPanels.productionDeliveryDetailsId 
      left join productionDelivery on productionDelivery.id = productionDeliveryDetails.productionDeliveryId
      left join item on item.id = stockForPanels.itemId
      left join size on size.id = stockForPanels.sizeId
      left join color on color.id = stockForPanels.colorId
      left join process on process.id = stockForPanels.prevProcessId 
      left join panel on panel.id = stockForPanels.panelId 
      left join uom on uom.id = stockForPanels.uomId 
      where stockForPanels.orderId=${orderId} and  stockForPanels.stage="${filterStockByProcess}" and stockForPanels.prevProcessId =${prevProcessId} and stockForPanels.storeId=${storeId} and
    ((stockForPanels.prevProcessId !=${toProcessId} OR stockForPanels.productionReceiptDetailsId is null) or stockForPanels.prevProcessId is null)    
      group by stockForPanels.itemId,stockForPanels.panelId, stockForPanels.sizeId, 
        stockForPanels.panelColorId, stockForPanels.uomId, stockForPanels.stage,stockForPanels.colorId;
      `
        }
        else {
            sql = `
    select item.name as itemName,stockForPanels.itemId,stockForPanels.panelId,panel.name as panelName, stockForPanels.sizeId,stockForPanels.panelColorId,stockForPanels.colorId,color.name as colorName, stockForPanels.uomId, uom.name as uomName, 
      size.name as sizeName, stockForPanels.stage as stage, sum(stockForPanels.qty) as qty
      from stockForPanels
      left join productionDeliveryDetails on productionDeliveryDetails.id = stockForPanels.productionDeliveryDetailsId 
      left join productionDelivery on productionDelivery.id = productionDeliveryDetails.productionDeliveryId
      left join item on item.id = stockForPanels.itemId
      left join size on size.id = stockForPanels.sizeId
      left join color on color.id = stockForPanels.panelColorId
      left join process on process.id = stockForPanels.prevProcessId 
      left join panel on panel.id = stockForPanels.panelId 
      left join uom on uom.id = stockForPanels.uomId 
      where stockForPanels.orderId=${orderId} and  stockForPanels.stage="${filterStockByProcess}" and stockForPanels.storeId=${storeId} and
    ((stockForPanels.prevProcessId !=${toProcessId} OR stockForPanels.productionReceiptDetailsId is null) or stockForPanels.prevProcessId is null) 
     group by stockForPanels.itemId,stockForPanels.panelId, stockForPanels.sizeId,
      stockForPanels.panelColorId, stockForPanels.uomId, stockForPanels.stage,stockForPanels.colorId;

      `
        }

    }
    else {
        sql = `
    select item.name as itemName,stockForPanels.itemId,stockForPanels.panelId,panel.name as panelName,stockForPanels.panelColorId, stockForPanels.sizeId,stockForPanels.colorId,color.name as colorName, stockForPanels.uomId, uom.name as uomName, 
      size.name as sizeName, stockForPanels.stage as stage, sum(stockForPanels.qty) as qty
      from stockForPanels
      left join productionDeliveryDetails on productionDeliveryDetails.id = stockForPanels.productionDeliveryDetailsId 
      left join productionDelivery on productionDelivery.id = productionDeliveryDetails.productionDeliveryId
      left join item on item.id = stockForPanels.itemId
      left join size on size.id = stockForPanels.sizeId
      left join color on color.id = stockForPanels.panelColorId
      left join process on process.id = stockForPanels.prevProcessId 
      left join panel on panel.id = stockForPanels.panelId 
      left join uom on uom.id = stockForPanels.uomId 
      where stockForPanels.orderId=${orderId} 
      group by stockForPanels.itemId,stockForPanels.panelId, stockForPanels.sizeId, 
       stockForPanels.panelColorId, stockForPanels.uomId, stockForPanels.stage,stockForPanels.colorId;
     
      `
    }



    // group by stockForPanels.itemId,stockForPanels.panelId, stockForPanels.sizeId, ----
    // stockForPanels.colorId, stockForPanels.uomId, stockForPanels.stage ;

    let data = await prisma.$queryRawUnsafe(sql)

    data = data?.filter(val => val.qty > 0)

    if (processData?.isIroning || processData?.isStitching || processData?.isPacking) {
        data = data?.filter(val => val.stage !== "Panel")
    }

    let totalCount = data.length
    if (pagination) {
        data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)
    }

    return { statusCode: 0, data, totalCount };
}

function manualFilterSearchData(searchYarnAliasName, searchColor, data) {
    if (!searchYarnAliasName && !searchColor) return data

    let color = searchColor.toUpperCase();
    let fabric = searchYarnAliasName.toUpperCase();

    if (searchYarnAliasName && searchColor) {

        return data.filter(item =>
            (color ? String(item.name).includes(color) : true && fabric ? String(item.fabricName).includes(fabric) : true)
        )
    }
    else {
        return data.filter(item =>
            (color ? String(item.name).includes(color) : true || fabric ? String(item.fabricName).includes(fabric) : true)
        )
    }

}

async function get(req) {
    const { branchId, storeId,
        pagination = false, dataPerPage = 5, pageNumber = 1,
        searchYarnAliasName,
        sizeId, colorId, uomId, itemId,
        searchSize, searchItem, searchColor,
    } = req.query

    // console.log(req)
    let data;

    data = await xprisma.stock.groupBy({
        where: {
            branchId: branchId ? parseInt(branchId) : undefined,
            storeId: storeId ? parseInt(storeId) : undefined,
            itemId: itemId ? (itemId) : undefined,
            sizeId: sizeId ? (sizeId) : undefined,
            colorId: colorId ? (colorId) : undefined,
            uomId: uomId ? parseInt(uomId) : undefined,
            Item: {
                name: Boolean(searchItem) ? { contains: searchItem } : undefined
            },
            Size: {
                name: Boolean(searchSize) ? { contains: searchSize } : undefined
            },
            Color: {
                name: Boolean(searchColor) ? { contains: searchColor } : undefined

            }


        },
        by: [
            "itemId",
            "sizeId",
            "colorId",
            "uomId",
            'price',
            'sectionId',
            ...STOCK_RUNTIME_FIELD_KEYS,
        ],
        _sum: {
            qty: true,
        },
    })
    data = data.filter(item => (item._sum.qty > 0));


    // Add random unique ID to each item
    data = data.map(item => ({
        ...item,
        id: Math.floor(Math.random() * 10000000)
    }));


    data = manualFilterSearchData(searchYarnAliasName, searchColor, data)

    let totalCount = data?.length
    if (pagination) {


        data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)
    }
    return { statusCode: 0, data, totalCount };
}

export async function getUnifiedStock(req) {
    const { storeId } = req.query;

    if (!storeId) {
        return { statusCode: 1, message: "storeId is required" };
    }

    return await get(req);
}





async function getOne(id, req) {

    const {
        branchId,
        storeId,
        yarnId,
        fabricId,
        designId,
        gaugeId,
        loopLengthId,
        gsmId,
        kDiaId,
        fDiaId,
        accessoryId,
        sizeId,
        colorId,
        uomId,
        lotNo,
        itemType,
        orderId
    } = req.query


    let data = await prisma.stock.findMany({
        where: {
            storeId: storeId ? parseInt(storeId) : undefined,
        },
        include: {

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

    })

    data = await (async function getPrice() {
        let promises = data.map(async (item) => {
            let newItem = structuredClone(item);
            newItem["price"] = await getStockProperty(itemType, item, "price", item.storeId, branchId);
            return newItem
        })
        return Promise.all(promises)
    })()


    if (!data) return NoRecordFound("stock");
    return { statusCode: 0, data };
}

async function getSearch(req) {
    const { companyId, active } = req.query
    const { searchKey } = req.params
    const data = await prisma.stock.findMany({
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
    const { aliasName, accessoryItemId, hsn, accessoryCategory, active, companyId } = await body
    const data = await prisma.stock.create({
        data: {
            aliasName, accessoryItemId: parseInt(accessoryItemId), hsn, accessoryCategory,
            active, companyId: parseInt(companyId)
        },
    });
    return { statusCode: 0, data };
}

export async function createOpeningStock(body) {
    const { stockItems = [], storeId, branchId } = body;

    let data;

    await prisma.$transaction(async (tx) => {
        const uniqueItemIds = [...new Set(
            stockItems
                .map((item) => item?.itemId)
                .filter(Boolean)
                .map((itemId) => parseInt(itemId))
        )];
        const rowBarcodes = [...new Set(
            stockItems
                .map((item) => item?.barcode_no ? String(item.barcode_no).trim() : item?.barcode ? String(item.barcode).trim() : "")
                .filter(Boolean)
        )];

        const items = uniqueItemIds.length > 0 || rowBarcodes.length > 0
            ? await tx.item.findMany({
                where: {
                    OR: [
                        uniqueItemIds.length > 0
                            ? {
                                id: {
                                    in: uniqueItemIds,
                                }
                            }
                            : undefined,
                        rowBarcodes.length > 0
                            ? {
                                ItemPriceList: {
                                    some: {
                                        barcode: {
                                            in: rowBarcodes,
                                        }
                                    }
                                }
                            }
                            : undefined,
                    ].filter(Boolean)
                },
                include: {
                    ItemPriceList: true,
                }
            })
            : [];

        const resolvedStockItems = resolveOpeningStockLegacyItems(stockItems, items);
        const itemMap = new Map(items.map((item) => [item.id, item]));

        validateResolvedOpeningStockLegacyItems(resolvedStockItems, itemMap);

        const formattedData = resolvedStockItems.map((item) => ({
            inOrOut: "OpeningStock",
            itemId: item?.itemId ? parseInt(item.itemId) : undefined,
            sizeId: item?.sizeId ? parseInt(item.sizeId) : undefined,
            colorId: item?.colorId ? parseInt(item.colorId) : undefined,
            uomId: item?.uomId ? parseInt(item.uomId) : undefined,
            price: item?.price ? parseFloat(item.price) : undefined,
            qty: item?.qty ? parseFloat(item.qty) : undefined,
            branchId: branchId ? parseInt(branchId) : undefined,
            storeId: storeId ? parseInt(storeId) : undefined,
            barcode: item?.barcode_no ? String(item.barcode_no) : item?.barcode ? String(item.barcode) : undefined,
            ...pickStockRuntimeFieldValues(item),
        }));

        data = await tx.stock.createMany({ data: formattedData });
    });

    return { statusCode: 0, data };
}

async function update(id, body) {
    const { aliasName, accessoryItemId, hsn, accessoryCategory, active, companyId } = await body
    const dataFound = await prisma.stock.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("stock");
    const data = await prisma.stock.update({
        where: {
            id: parseInt(id),
        },
        data: {
            aliasName, accessoryItemId: parseInt(accessoryItemId), hsn, accessoryCategory,
            active, companyId: parseInt(companyId)
        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.stock.delete({
        where: {
            id: parseInt(id)
        },
    })
    return { statusCode: 0, data };
}

export async function _getAccessory(req) {
    const { branchId, storeId, itemType, filterColors, isGetStockReport = false, status, orderId,
        pagination = false, dataPerPage = 5, pageNumber = 1,
        searchColor, searchUom, searchLotNo, searchPrevProcess, searchYarnAliasName, processInwardId, stockId, rawMaterialSalesId,
        yarnId, fabricId, designId, gaugeId, loopLengthId, gsmId, kDiaId, fDiaId, accessoryId, sizeId, colorId, uomId, lotNo, processId, stockReport, fromDate, toDate, finishedGoodsStockReport
    } = req.query
    let data;

    if (status == "Order") {
        data = await xprisma.accessoryStock.groupBy({
            where: {

            },
            by: [

                "accessoryId", "sizeId",
                "colorId",
                "uomId",
                "branchId", 'inOrOut'
            ],
            _sum: {
                qty: true,

            },
        })
        data = data.filter(item => (item._sum.qty > 0));
    }
    else {
        // console.log(storeId, "storeIddddddddd")

        data = await xprisma.accessoryStock.groupBy({
            where: {
                branchId: branchId ? parseInt(branchId) : undefined,
                // itemType,
                // yarnId: yarnId ? parseInt(yarnId) : undefined,
                // fabricId: fabricId ? parseInt(fabricId) : undefined,
                // designId: designId ? parseInt(designId) : undefined,
                // gaugeId: gaugeId ? parseInt(gaugeId) : undefined,
                // loopLengthId: loopLengthId ? parseInt(loopLengthId) : undefined,
                // gsmId: gsmId ? parseInt(gsmId) : undefined,
                // kDiaId: kDiaId ? parseInt(kDiaId) : undefined,
                // fDiaId: fDiaId ? parseInt(fDiaId) : undefined,
                // accessoryId: accessoryId ? parseInt(accessoryId) : undefined,
                // sizeId: sizeId ? parseInt(sizeId) : undefined,
                // colorId: colorId ? parseInt(colorId) : undefined,
                // uomId: uomId ? parseInt(uomId) : undefined,
                // lotNo,
                // processId: (processId && JSON.parse(processId)) ? parseInt(processId) : undefined,
                // Color: searchColor ? {
                //     name: {
                //         contains: searchColor
                //     }
                // } : undefined,
                // Uom: searchUom ? {
                //     name: {
                //         contains: searchUom
                //     }
                // } : undefined,
                // lotNo: searchLotNo ? {
                //     contains: searchLotNo
                // } : undefined,
                // Process: searchPrevProcess ? {
                //     name: {
                //         contains: searchPrevProcess
                //     }
                // } : undefined,
                // Yarn: searchYarnAliasName ? {
                //     aliasName: {
                //         contains: searchYarnAliasName
                //     }
                // } : undefined,
                // colorId: (filterColors && filterColors.length > 0) ? {
                //     in: filterColors.split(",").map(id => parseInt(id))
                // } : undefined,
                // id: stockId ? { lt: parseInt(stockId) } : undefined,
                // orderId: null,

                // OR: processInwardId ? [
                //     {
                //         ProgramInwardLotDetails: {
                //             processInwardProgramDetailsId: {
                //                 processInwardId: { lt: parseInt(processInwardId) }
                //             }
                //         }
                //     },
                //     { programInwardLotDetailsId: null }
                // ] : undefined,
                // OR: rawMaterialSalesId ? [
                //     {
                //         RawMaterialsSalesDetails: {
                //             rawMaterialsSalesId: {
                //                 lt: parseInt(rawMaterialSalesId)
                //             }
                //         },
                //     },
                //     { rawMaterialsSalesDetailsId: null }
                // ] : undefined
            },
            // by: ["storeId", "itemType", "processId",
            //     "yarnId",
            //     "fabricId", "designId", "gaugeId", "loopLengthId", "gsmId", "kDiaId", "fDiaId",
            //     "accessoryId", "sizeId",
            //     "colorId",
            //     "uomId",
            //     "lotNo", "branchId", 'inOrOut'
            // ],

            by: [


                "accessoryId", "sizeId",
                "colorId",

            ],
            _sum: {
                qty: true,
                gross: true,
                noOfRolls: true,
                noOfBags: true,
                orderId: true
            },
        })
        data = data.filter(item => (item._sum.qty > 0));
    }

    // data = data.filter(item => !(item._sum.qty === 0));
    let newItemArray = []
    data = await (async function getPrice() {
        for (let i = 0; i < data?.length; i++) {
            let item = data[i]
            let price = await getStockProperty(itemType, item, "price", item.storeId, branchId);
            let newObj = { ...item, price: price }
            newItemArray.push(newObj)
        }
        return Promise.all(newItemArray)
    })()

    // console.log(newItemArray, "newItemArray  ")


    data = newItemArray

    data = manualFilterSearchData(searchYarnAliasName, searchColor, data)

    let totalCount = data?.length
    if (pagination) {


        data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)
    }
    return { statusCode: 0, data, totalCount };
}


export async function _getOneAccessory(id, req) {

    const {
        branchId,
        storeId,
        yarnId,
        fabricId,
        designId,
        gaugeId,
        loopLengthId,
        gsmId,
        kDiaId,
        fDiaId,
        accessoryId,
        sizeId,
        colorId,
        uomId,
        lotNo,
        itemType,
        orderId
    } = req.query


    // console.log(storeId, "storeId")


    // let data = await xprisma.stock.groupBy({
    //     where: {
    // orderId: id ? parseInt(id) : undefined,
    // colorId: colorId ? parseInt(colorId) : undefined,
    // yarnId: yarnId ? parseInt(yarnId) : undefined,

    //     },

    //     by: [
    //         // "storeId", 
    //         "yarnId",
    //         "colorId",
    //         "orderId",
    //         "orderDetailsId"

    //     ],
    //     _sum: {
    //         qty: true,


    //     },

    // })


    let data = await prisma.accessoryStock.findMany({
        where: {
            // orderId: id ? parseInt(id) : undefined,
            // colorId: colorId ? parseInt(colorId) : undefined,
            // yarnId: yarnId ? parseInt(yarnId) : undefined,
        },
        // include: {
        //     Order: {
        //         select: {
        //             Party: {
        //                 select: {
        //                     name: true,
        //                     id : true
        //                 }
        //             },

        //         },
        //     },
        //     OrderDetails : {
        //         select : {
        //             style : {
        //                 select : {
        //                     name : true
        //                 }                    }
        //         }
        //     }


        // }

    })
    console.log(data, "dataaaaagetOne")

    data = await (async function getPrice() {
        let promises = data.map(async (item) => {
            let newItem = structuredClone(item);
            newItem["price"] = await getStockProperty(itemType, item, "price", item.storeId, branchId);
            return newItem
        })
        return Promise.all(promises)
    })()


    if (!data) return NoRecordFound("stock");
    return { statusCode: 0, data };
}



// export async function getStockReport(req) {

//     const { itemId, sizeId, colorId, storeId, toDate, } = req.query


//     const DateFormatted = moment(toDate).format("YYYY-MM-DD");
//     let data;

//     let sql;

//     let conditions = [];


//     if (itemId) {
//         conditions.push(`ST.itemId = '${itemId}'`);
//     }

//     if (sizeId) {
//         conditions.push(`ST.sizeId = '${sizeId}'`);
//     }

//     if (colorId) {
//         conditions.push(`ST.colorId = '${colorId}'`);
//     }

//     if (storeId) {
//         conditions.push(`ST.storeId = '${storeId}'`);
//     }

//     if (DateFormatted) {
//         conditions.push(`DATE(ST.createdAt) <= '${DateFormatted}'`);
//     }

//     let whereClause = conditions.length > 0
//         ? "WHERE " + conditions.join(" AND ")
//         : "";

//     sql =
//         `
//   SELECT
//       I.name AS Item,
//       S.name AS  Size,
// 	  C.name AS  Color,
//       ST.barcode As Barcode,
//       SUM(ST.qty) AS total_qty
//   FROM stock ST
//   LEFT JOIN Item I ON I.id = ST.itemId
//   LEFT JOIN Size S ON S.id = ST.sizeId
//   LEFT JOIN Color C on C.id =  ST.colorId
//  ${whereClause}

//   GROUP BY
//        I.name,
//        S.name,
//        C.name,
//        ST.barcode
// HAVING 
//     SUM(ST.qty) > 0
//   ORDER BY
//        I.name,
//        S.name,
//        C.name,
//        ST.barcode
// `


//     console.log(sql, "sql for stock report")

//     data = await prisma.$queryRawUnsafe(sql);




//     return { statusCode: 0, data };
// }



export async function getStockReport(req) {

    const { itemId, sizeId, colorId, storeId, toDate } = req.query;

    const DateFormatted = moment(toDate).format("YYYY-MM-DD");

    let conditions = [];

    if (itemId) conditions.push(`ST.itemId = '${itemId}'`);
    if (sizeId) conditions.push(`ST.sizeId = '${sizeId}'`);
    if (colorId) conditions.push(`ST.colorId = '${colorId}'`);
    if (storeId) conditions.push(`ST.storeId = '${storeId}'`);
    if (DateFormatted) conditions.push(`DATE(ST.createdAt) <= '${DateFormatted}'`);

    let whereClause = conditions.length > 0
        ? "WHERE " + conditions.join(" AND ")
        : "";

    // 🔥 Dynamic SELECT & GROUP BY
    let selectStore = "";
    let groupByStore = "";

    if (!storeId) {
        // 👉 No storeId → show store-wise
        selectStore = `, ST.storeId AS storeId`;
        groupByStore = `, ST.storeId`;
    }

    const sql = `
    SELECT
        I.name AS Item,
        S.name AS Size,
        C.name AS Color,
        ST.barcode AS Barcode
        ${selectStore},
        SUM(ST.qty) AS total_qty
    FROM stock ST
    LEFT JOIN Item I ON I.id = ST.itemId
    LEFT JOIN Size S ON S.id = ST.sizeId
    LEFT JOIN Color C ON C.id = ST.colorId
    ${whereClause}

    GROUP BY
        I.name,
        S.name,
        C.name,
        ST.barcode
        ${groupByStore}

    HAVING SUM(ST.qty) > 0

    ORDER BY
        I.name,
        S.name,
        C.name,
        ST.barcode
    `;

    console.log(sql, "sql for stock report");

    const data = await prisma.$queryRawUnsafe(sql);

    return { statusCode: 0, data };
}

export async function getUnifiedStockReport(req) {
    const { storeId } = req.query;

    // if (!storeId) {
    //     return { statusCode: 1, message: "storeId is required" };
    // }

    return await getStockReport(req);
}





export async function getUnifiedStockWithLegacyByBarcode(req) {
    const { barcode, branchId, storeId } = req.query;

    if (!barcode) {
        return { statusCode: 1, message: "Barcode is required" };
    }

    const normalizedBarcode = String(barcode).trim();
    const normalizedBranchId = branchId ? Number(branchId) : undefined;
    const normalizedStoreId = storeId ? Number(storeId) : undefined;

    const stockRecords = await prisma.stock.findMany({
        where: {
            barcode: normalizedBarcode,
            branchId: normalizedBranchId,
            storeId: normalizedStoreId,
        },
        include: {
            Item: {
                include: { Hsn: true }
            },
            Size: true,
            Color: true,
            Uom: true,
            Store: true
        }
    });

    console.log("stockRecords", stockRecords?.length)

    if (!stockRecords.length) {
        return { statusCode: 1, message: "No stock found for this barcode" };
    }

    const matches = buildBarcodeSnapshotMatches(stockRecords);

    if (matches.length > 1) {
        return {
            statusCode: 0,
            needsResolution: true,
            message: "Barcode matched multiple stock combinations. Please choose the intended stock row.",
            matches,
        };
    }

    const first = matches[0];

    return {
        statusCode: 0,
        data: first
    };
}





export async function getMinStockAlertReport(req) {
    const { itemId, sizeId, colorId, storeId, toDate } = req.query


    const DateFormatted = moment(toDate).format("YYYY-MM-DD");
    let stockData;

    stockData = await xprisma.stock.groupBy({
        where: {


        },

        by: [
            "itemId",
            "sizeId",
            "colorId",
            'storeId',


        ],
        _sum: {
            qty: true,
        },
    })
    let sql;

    let conditions = [];


    let whereClause = conditions.length > 0
        ? "WHERE " + conditions.join(" AND ")
        : "";

    sql =
        `select
            IP.id as ItemPriceListid,
            IP.itemId as itemId,
            IP.sizeId as sizeId,
            IP.colorId as colorId,
            MS.minStockQty as minQtyForThatItem, 
            Ms.locationId,

            MS.id as minimumStockId
            from itemPriceList IP 
            INNER JOIN MinimumStockQty MS ON MS.itemPriceListId = IP.id
            WHERE MS.locationId IS NOT NULL
            AND MS.minStockQty IS NOT NULL
            AND MS.minStockQty != '' `


    // console.log(sql, "sql")

    let itemWiseStockMinQty = await prisma.$queryRawUnsafe(sql);


    // console.log(itemWiseStockMinQty, "itemWiseStockMinQty")

    // console.log(stockData, "stockData")




    const result = await itemWiseStockMinQty.map(minItem => {

        const totalQty = stockData
            ?.filter(s =>
                s.itemId == minItem.itemId &&
                String(s.sizeId ?? "") === String(minItem.sizeId ?? "") &&
                String(s.colorId ?? "") === String(minItem.colorId ?? "") &&
                s.storeId == minItem.locationId
            )
            .reduce((sum, s) => sum + (s._sum?.qty || 0), 0) || 0;

        const minimumQty = Number(minItem.minQtyForThatItem);

        return {
            ...minItem,
            availableQty: totalQty,
            isLowStock: Number.isFinite(minimumQty) && totalQty < minimumQty
        };
    });




    return { statusCode: 0, data: result?.filter(i => i.isLowStock), allItemsdata: result };
}


export async function stockMovement() {

}


export {
    get,
    getOne,
    getSearch,
    create,
    update,
    remove,
}




























