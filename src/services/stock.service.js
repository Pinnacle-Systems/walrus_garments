import { NoRecordFound } from '../configs/Responses.js';
import { prisma } from '../lib/prisma.js';
import { getStockProperty } from '../utils/helper.js';
import { getFinishedGoodsStockReport, getStockReportForCuttingDelivery } from '../utils/stockHelper.js';
import moment from "moment"

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

        ],
        _sum: {
            qty: true,
        },
    })
    // data = data.filter(item => (item._sum.qty > 0));


    // console.log(data, 'data')




    data = manualFilterSearchData(searchYarnAliasName, searchColor, data)

    let totalCount = data?.length
    if (pagination) {


        data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)
    }
    return { statusCode: 0, data, totalCount };
}

export async function getUnifiedStock(req) {
    const { storeId, branchId, ...rest } = req.query;

    if (!storeId) {
        return { statusCode: 1, message: "storeId is required" };
    }

    const location = await prisma.location.findUnique({
        where: { id: parseInt(storeId) }
    });

    if (!location) {
        return { statusCode: 1, message: "Location not found" };
    }

    // Check if the location is 'old-warehouse'
    if (location.storeName.toLowerCase().includes('old') || location.storeName.toLowerCase().includes('warehouse')) {
        // Fetch from LegacyStock
        const legacyData = await prisma.legacyStock.findMany({
            where: {
                // branchId: branchId ? parseInt(branchId) : undefined,
                itemId: rest.itemId ? parseInt(rest.itemId) : undefined,
                sizeId: rest.sizeId ? parseInt(rest.sizeId) : undefined,
                colorId: rest.colorId ? parseInt(rest.colorId) : undefined,
                uomId: rest.uomId ? parseInt(rest.uomId) : undefined,
            },
            include: {
                Item: { select: { name: true } },
                Size: { select: { name: true } },
                Color: { select: { name: true } }
            }
        });

        // Map to match the standard Stock response format if necessary
        const mappedData = legacyData.map(item => ({
            ...item,
            _sum: { qty: item.qty },
            qty: item.qty
        }));

        return {
            statusCode: 0,
            data: mappedData,
            totalCount: mappedData.length
        };
    } else {
        // Fetch from regular Stock
        return await get(req);
    }
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



export async function getStockReport(req) {
    const { itemId, sizeId, colorId, storeId, toDate, barcode } = req.query


    const DateFormatted = moment(toDate).format("YYYY-MM-DD");
    let data;

    let sql;

    let conditions = [];


    if (itemId) {
        conditions.push(`ST.itemId = '${itemId}'`);
    }

    if (sizeId) {
        conditions.push(`ST.sizeId = '${sizeId}'`);
    }

    if (colorId) {
        conditions.push(`ST.colorId = '${colorId}'`);
    }

    if (storeId) {
        conditions.push(`ST.storeId = '${storeId}'`);
    }

    if (DateFormatted) {
        conditions.push(`DATE(ST.createdAt) <= '${DateFormatted}'`);
    }

    let whereClause = conditions.length > 0
        ? "WHERE " + conditions.join(" AND ")
        : "";

    sql =
        `
  SELECT
      I.name AS Item,
      S.name AS  Size,
	  C.name AS  Color,
      SUM(ST.qty) AS total_qty
  FROM stock ST
  LEFT JOIN Item I ON I.id = ST.itemId
  LEFT JOIN Size S ON S.id = ST.sizeId
  LEFT JOIN Color C on C.id =  ST.colorId
 ${whereClause}

  GROUP BY
       I.name,
       S.name,
       C.name
HAVING 
    SUM(ST.qty) > 0
  ORDER BY
       I.name,
       S.name,
       C.name
`


    console.log(sql, "sql for stock report")

    data = await prisma.$queryRawUnsafe(sql);




    return { statusCode: 0, data };
}

export async function getUnifiedStockReport(req) {
    const { storeId, branchId, toDate, ...rest } = req.query;

    if (!storeId) {
        return { statusCode: 1, message: "storeId is required" };
    }

    const location = await prisma.location.findUnique({
        where: { id: parseInt(storeId) }
    });

    if (!location) {
        return { statusCode: 1, message: "Location not found" };
    }

    // console.log(location.storeName, "location.storeName", location.storeName.toLowerCase().includes('old'))

    if (location.storeName.toLowerCase().includes('old')) {
        const DateFormatted = toDate ? moment(toDate).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");

        const legacyData = await prisma.legacyStock.groupBy({
            where: {
                // branchId: branchId ? parseInt(branchId) : undefined,
                itemId: rest.itemId ? parseInt(rest.itemId) : undefined,
                sizeId: rest.sizeId ? parseInt(rest.sizeId) : undefined,
                colorId: rest.colorId ? parseInt(rest.colorId) : undefined,
                uomId: rest.uomId ? parseInt(rest.uomId) : undefined,
                // createdAt: { lte: new Date(DateFormatted) }
            },
            by: ['itemId', 'sizeId', 'colorId'],
            _sum: { qty: true }
        });

        // We need to fetch names for the response
        const itemIds = legacyData.map(d => d.itemId).filter(id => id);
        const sizeIds = legacyData.map(d => d.sizeId).filter(id => id);
        const colorIds = legacyData.map(d => d.colorId).filter(id => id);

        const [items, sizes, colors] = await Promise.all([
            prisma.item.findMany({ where: { id: { in: itemIds } }, select: { id: true, name: true } }),
            prisma.size.findMany({ where: { id: { in: sizeIds } }, select: { id: true, name: true } }),
            prisma.color.findMany({ where: { id: { in: colorIds } }, select: { id: true, name: true } })
        ]);

        const itemMap = Object.fromEntries(items.map(i => [i.id, i.name]));
        const sizeMap = Object.fromEntries(sizes.map(s => [s.id, s.name]));
        const colorMap = Object.fromEntries(colors.map(c => [c.id, c.name]));

        const mappedData = legacyData.map(d => ({
            Item: itemMap[d.itemId] || 'N/A',
            Size: sizeMap[d.sizeId] || 'N/A',
            Color: colorMap[d.colorId] || 'N/A',
            total_qty: d._sum.qty || 0
        }));

        return {
            statusCode: 0,
            data: mappedData
        };
    } else {
        // Fetch from regular Stock Report
        return await getStockReport(req);
    }
}

export async function getUnifiedStockByBarcode(req) {
    const { barcode, storeId, branchId } = req.query;

    if (!barcode) {
        return { statusCode: 1, message: "Barcode is required" };
    }

    let isLegacy = false;

    if (storeId) {
        const location = await prisma.location.findUnique({
            where: { id: Number(storeId) }
        });

        if (
            location &&
            (location.storeName?.toLowerCase().includes("old"))
        ) {
            isLegacy = true;
        }
    }

    // ================= LEGACY =================
    if (isLegacy) {

        const records = await prisma.legacyStock.findMany({
            where: {
                barcode: String(barcode),
                storeId: storeId ? Number(storeId) : undefined,
                branchId: branchId ? Number(branchId) : undefined
            },
            include: {
                Item: true,
                Size: true,
                Color: true,
                Uom: true
            }
        });

        if (!records.length) {
            return {
                statusCode: 1,
                message: "No stock found for this barcode in Old Warehouse"
            };
        }

        // ✅ SUM qty based on barcode
        const totalQty = records.reduce((sum, r) => sum + (r.qty || 0), 0);

        const first = records[0]; // for display info

        return {
            statusCode: 0,
            data: {
                itemId: first.itemId,
                barcode: first.barcode,
                sizeId: first.sizeId,
                colorId: first.colorId,
                uomId: first.uomId,
                item_name: first.Item?.name,
                size: first.Size?.name,
                color: first.Color?.name,
                uom: first.Uom?.name,
                price: first.price,
                stockQty: totalQty
            }
        };
    }

    // ================= NORMAL STOCK =================
    else {

        const records = await prisma.stock.findMany({
            where: {
                barcode: String(barcode),
                storeId: storeId ? Number(storeId) : undefined,
                branchId: branchId ? Number(branchId) : undefined
            },
            include: {
                Item: true,
                Size: true,
                Color: true,
                Uom: true
            }
        });

        if (!records.length) {
            return { statusCode: 1, message: "No stock found for this barcode" };
        }
        const totalQty = records.reduce((sum, r) => sum + (r.qty || 0), 0);


        const first = records[0];

        return {
            statusCode: 0,
            data: {
                itemId: first.itemId,
                barcode: first.barcode,
                sizeId: first.sizeId,
                colorId: first.colorId,
                uomId: first.uomId,
                sectionId: first.sectionId,
                item_name: first.Item?.name,
                size: first.Size?.name,
                color: first.Color?.name,
                uom: first.Uom?.name,
                price: first.price,
                stockQty: totalQty
            }
        };
    }
}


async function getMinStockData(itemPriceListData) {
    let directItemsData = [];
    for (let i = 0; i < itemPriceListData?.length; i++) {

        let directItem = itemPriceListData[i]

        if (directItem?.minStockQty) {
            return minStockQty
        } else {
            let sql =
                ` select * from MinimumStockQty where    `


            // console.log(sql, "sql")

            data = await prisma.$queryRawUnsafe(sql);
        }




    }
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
            IP.minStockQty as minQtyForallSizes,
            MS.minStockQty as minQtyForThatItem, 
            Ms.locationId,

            MS.id as minimumStockId
            from itemPriceList IP 
            LEFT JOIN MinimumStockQty MS ON MS.itemPriceListId = IP.id `


    // console.log(sql, "sql")

    let itemWiseStockMinQty = await prisma.$queryRawUnsafe(sql);


    // console.log(itemWiseStockMinQty, "itemWiseStockMinQty")

    // console.log(stockData, "stockData")




    const result = await itemWiseStockMinQty.map(minItem => {

        // console.log(minItem?.minQtyForallSizes ? true : false)

        let totalQty
        if (minItem?.minQtyForallSizes) {
            totalQty = stockData?.filter(i => i.itemId == minItem?.itemId).reduce((sum, s) => sum + s._sum?.qty, 0);
        } else {
            totalQty = stockData
                .filter(s =>
                    s.itemId == minItem.itemId &&
                    s.sizeId == minItem.sizeId &&
                    s.storeId == minItem.locationId
                )
                .reduce((sum, s) => sum + s._sum?.qty, 0);

        }

        const minimumQty =
            minItem.minQtyForallSizes ?? minItem.minQtyForThatItem;





        return {
            ...minItem,
            availableQty: totalQty,
            isLowStock: totalQty < minimumQty
        };
    });




    return { statusCode: 0, data: result?.filter(i => i.isLowStock), allItemsdata: result };
}


export {
    get,
    getOne,
    getSearch,
    create,
    update,
    remove,
}









































