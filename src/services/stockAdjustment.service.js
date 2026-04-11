import { prisma } from "../lib/prisma.js";
import { getTableRecordWithId } from "../utils/helperQueries.js";
import {
  getDateFromDateTime,
  getYearShortCode,
  getYearShortCodeForFinYear,
} from "../utils/helper.js";
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";
import { NoRecordFound } from "../configs/Responses.js";
import { buildStockRuntimeFieldWhere, pickStockRuntimeFieldValues, STOCK_RUNTIME_FIELD_KEYS } from "./stockRuntimeFields.js";




async function getOneBarcode(req) {
  const { barcode, styleId, sizeId } = req.query;
  const styleNum = styleId ? parseInt(styleId, 10) : null;
  const sizeNum = sizeId ? parseInt(sizeId, 10) : null;

  if (!barcode && !(styleNum && sizeNum)) {
    return {
      statusCode: 0,
      data: [],
      totalCount: 0,
      totalQty: 0,
      message: "Please provide either a barcode or both styleId and sizeId",
    };
  }

  if ((styleNum && !sizeNum) || (!styleNum && sizeNum)) {
    return {
      statusCode: 0,
      data: [],
      totalCount: 0,
      totalQty: 0,
      message: "Both styleId and sizeId must be provided together",
    };
  }

  // Build Prisma 'where' dynamically
  const where = {
    ...(barcode ? { barCode: barcode } : {}),
    ...(styleNum && sizeNum ? { styleId: styleNum, sizeId: sizeNum } : {}),
  };

  // Run both queries in one transaction
  const [data, aggregate] = await prisma.$transaction([
    prisma.stock.findMany({ where }),
    prisma.stock.aggregate({
      _sum: { qty: true },
      where,
    }),
  ]);

  if (!data || data.length === 0) {
    return NoRecordFound("Barcode No");
  }

  return {
    statusCode: 0,
    data,
    totalCount: data.length,
    totalQty: aggregate._sum.qty ?? 0,
  };
}


async function getNextDocId(
  branchId,
  shortCode,
  startTime,
  endTime,
  saveType,
  docId,
  isUpdate
) {
  // Case 1: Draft save
  if (saveType) {
    return "Draft Save";
  } else if (isUpdate === "drift") {
    lastObject = await prisma.stockAdjustment.findFirst({
      where: {
        branchId: parseInt(branchId),
        draftSave: false,
        AND: [
          { createdAt: { gte: startTime } },
          { createdAt: { lte: endTime } },
        ],
      },
      orderBy: { id: "desc" },
    });
    const branchObj = await getTableRecordWithId(branchId, "branch");
    let newDocId = `${branchObj.branchCode}${shortCode}/STA/1`;

    if (lastObject) {
      newDocId = `${branchObj.branchCode}${shortCode}/STA/${parseInt(lastObject.docId.split("/").at(-1)) + 1
        }`;
    }

    return newDocId;
  } else {
    let lastObject = await prisma.stockAdjustment.findFirst({
      where: {
        branchId: parseInt(branchId),
        AND: [
          {
            createdAt: {
              gte: startTime,
            },
          },
          {
            createdAt: {
              lte: endTime,
            },
          },
        ],
      },
      orderBy: {
        id: "desc",
      },
    });

    const branchObj = await getTableRecordWithId(branchId, "branch");
    let newDocId = `${branchObj.branchCode}${getYearShortCode(
      new Date()
    )}/SA/1`;
    if (lastObject) {
      newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/SA/${parseInt(lastObject.docId.split("/").at(-1)) + 1
        }`;
    }
    return newDocId;
  }
}

async function get(req) {
  const {
    branchId,
    pagination,
    pageNumber,
    dataPerPage,
    serachDocNo,
    searchDocDate,
    searchStore,
    finYearId,
  } = req.query;

  let finYearDate = await getFinYearStartTimeEndTime(finYearId);
  const shortCode = finYearDate
    ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime)
    : "";
  let newDocId = await getNextDocId(
    branchId,
    shortCode,
    finYearDate?.startDateStartTime,
    finYearDate?.endDateEndTime
  );
  let data;
  let totalCount;
  data = await prisma.stockAdjustment.findMany({
    where: {
      branchId: branchId ? parseInt(branchId) : undefined,
      AND: finYearDate
        ? [
          {
            createdAt: {
              gte: finYearDate.startTime,
            },
          },
          {
            createdAt: {
              lte: finYearDate.endTime,
            },
          },
        ]
        : undefined,
      docId: Boolean(serachDocNo)
        ? {
          contains: serachDocNo,
        }
        : undefined,
      Store: {
        storeName: searchStore ? { contains: searchStore } : undefined,
      },
    },
    include: {
      Store: {
        select: {
          id: true,
          storeName: true,
        },
      },
      StockAdjustmentItems: true,
    },
    orderBy: {
      createdAt: "desc", // 🔥 Descending Order
    },
  });
  totalCount = data.length;
  if (searchDocDate) {
    data = data?.filter((item) =>
      String(getDateFromDateTime(item.createdAt)).includes(searchDocDate)
    );
  }
  // if (pagination) {
  //   data = data.slice(
  //     (pageNumber - 1) * parseInt(dataPerPage),
  //     pageNumber * dataPerPage
  //   );
  // }
  return {
    statusCode: 0,
    data,
    nextDocId: newDocId,
    totalCount,
  };
}

async function getOne(id) {
  const data = await prisma.stockAdjustment.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      Store: {
        select: {
          locationId: true,
        },
      },
      StockAdjustmentItems: true
    },
  });
  if (!data) return NoRecordFound("stockAdjustment");

  const transactionIds = (data.StockAdjustmentItems || []).map((item) => item.id).filter(Boolean);
  const stockRows = transactionIds.length
    ? await prisma.stock.findMany({
      where: {
        inOrOut: "stockAdjustment",
        transactionId: { in: transactionIds },
      },
      select: {
        transactionId: true,
        ...STOCK_RUNTIME_FIELD_KEYS.reduce((fields, key) => {
          fields[key] = true;
          return fields;
        }, {}),
      },
    })
    : [];
  const stockRowMap = new Map(stockRows.map((row) => [row.transactionId, row]));

  return {
    statusCode: 0,
    data: {
      ...data,
      StockAdjustmentItems: (data.StockAdjustmentItems || []).map((item) => ({
        ...item,
        ...(stockRowMap.get(item.id) || {}),
      })),
    },
  };
}



async function getExistingStockQty(tx, stockDetail, branchId, storeId) {

  console.log(stockDetail, "stockDetail")
  console.log(branchId, "branchId")
  console.log(storeId, "storeId")


  const sql = `select * from stock where branchId = ${branchId} and storeId = ${storeId} and itemId = ${stockDetail?.itemId} and sizeId = ${stockDetail?.sizeId} and colorId = ${stockDetail?.colorId} and uomId = ${stockDetail?.uomId}`


  console.log(sql, "sql")
  const aggregate = await tx.stock.aggregate({
    where: {
      branchId: parseInt(branchId),
      storeId: parseInt(storeId),
      itemId: stockDetail?.itemId ? parseInt(stockDetail.itemId) : null,
      sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
      colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
      uomId: stockDetail?.uomId ? parseInt(stockDetail.uomId) : null,
      // ...buildStockRuntimeFieldWhere(stockDetail),
    },
    _sum: {
      qty: true,
    },
  });


  console.log(aggregate, "aggregate",)



  return aggregate?._sum?.qty || 0;
}

async function validateStockAdjustmentItems(tx, stockAdjustmentItems, branchId, storeId) {
  for (const stockDetail of stockAdjustmentItems || []) {
    if (!stockDetail?.itemId || stockDetail?.adjType !== "MINUS") continue;

    const existingQty = await getExistingStockQty(tx, stockDetail, branchId, storeId);
    if (existingQty <= 0) {
      throw new Error("Negative adjustment is allowed only for stock combinations that already exist.");
      // return { statusCode: 1, message: "Negative adjustment is allowed only for stock combinations that already exist." };
    }
  }
  return null;
}

function getAdjustmentQty(stockDetail) {
  if (stockDetail?.adjType === "PLUS") {
    return stockDetail?.qty ? parseFloat(stockDetail.qty) : null;
  }

  if (stockDetail?.adjType === "MINUS") {
    return stockDetail?.qty ? parseFloat(0 - stockDetail.qty) : null;
  }

  return null;
}

async function createStockAdjustmentItems(
  tx,
  stockAdjustmentItems,
  stockAdjustment,
  userId,
  branchId,
  storeId
) {
  const promises = stockAdjustmentItems.map(async (stockDetail) => {
    const createdItem = await tx.stockAdjustmentItems.create({
      data: {
        stockAdjustmentId: parseInt(stockAdjustment.id),

        barcode: stockDetail?.barcode ? stockDetail?.barcode : undefined,
        itemId: stockDetail?.itemId ? parseInt(stockDetail.itemId) : null,
        sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
        colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,

        uomId: stockDetail?.uomId ? parseInt(stockDetail.uomId) : null,
        hsnId: stockDetail?.hsnId ? parseInt(stockDetail.hsnId) : null,
        qty: stockDetail?.qty ? String(stockDetail.qty) : null,
        price: stockDetail?.price ? String(stockDetail.price) : null,


        adjType: stockDetail?.adjType ? stockDetail?.adjType : undefined,



      },
    });
    const qty = getAdjustmentQty(stockDetail);

    const baseData = {
      inOrOut: "stockAdjustment",
      transactionId: parseInt(createdItem.id),
      branchId: parseInt(branchId),
      storeId: parseInt(storeId),
      barcode: stockDetail?.barcode ? stockDetail?.barcode : undefined,
      itemId: stockDetail?.itemId ? parseInt(stockDetail.itemId) : null,
      sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
      colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
      uomId: stockDetail?.uomId ? parseInt(stockDetail.uomId) : null,
      qty,
      price: stockDetail?.price ? parseFloat(stockDetail.price) : undefined,
      ...pickStockRuntimeFieldValues(stockDetail),
    };
    await tx.stock.create({ data: baseData });

    return createdItem;
  });

  return Promise.all(promises);
}

async function create(body) {
  const {
    userId,
    branchId,
    storeId,
    stockAdjustmentItems,
    finYearId,
    docDate,
    draftSave,
    locationId,
  } = await body;
  let finYearDate = await getFinYearStartTimeEndTime(finYearId);
  const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startDateStartTime, finYearDate?.endDateEndTime) : "";
  let newDocId = await getNextDocId(branchId, shortCode, finYearDate?.startDateStartTime, finYearDate?.endDateEndTime, draftSave);

  let data;

  await prisma.$transaction(async (tx) => {
    await validateStockAdjustmentItems(tx, stockAdjustmentItems, branchId, storeId);
    data = await tx.StockAdjustment.create({
      data: {
        docId: newDocId,
        branchId: parseInt(branchId),
        storeId: parseInt(storeId),
      },
    });
    await createStockAdjustmentItems(tx, stockAdjustmentItems, data, userId, branchId, storeId);
  });
  return { statusCode: 0, data };
}


function findRemovedItems(dataFound, stockAdjustmentItems) {
  let removedItems = dataFound.StockAdjustmentItems.filter((oldItem) => {
    let result = stockAdjustmentItems.find(
      (newItem) => parseInt(newItem.id) === parseInt(oldItem.id)
    );
    if (result) return false;
    return true;
  });
  return removedItems;
}


async function update(id, body) {
  const {
    branchId,
    stockAdjustmentItems,
    userId,
    storeId,
  } = await body;

  const dataFound = await prisma.stockAdjustment.findUnique({
    where: { id: parseInt(id) },
    include: { StockAdjustmentItems: true },
  });
  if (!dataFound) return NoRecordFound("stockAdjustment");

  // Identify items that were removed from the grid
  const removedItems = dataFound.StockAdjustmentItems.filter((oldItem) =>
    !stockAdjustmentItems.some((newItem) => newItem.id && parseInt(newItem.id) === parseInt(oldItem.id))
  );
  const removeItemsIds = removedItems.map((item) => parseInt(item.id));

  let piData;

  await prisma.$transaction(async (tx) => {
    // 1. Handle Deletions
    if (removeItemsIds.length > 0) {
      const stockDetails = await tx.stock.findMany({
        where: {
          inOrOut: "stockAdjustment",
          transactionId: { in: removeItemsIds },
        },
      });

      for (const stockItem of stockDetails) {
        if (stockItem.qty > 0) {
          const currentQty = await getExistingStockQty(tx, stockItem, dataFound.branchId, dataFound.storeId);
          if (currentQty < stockItem.qty) {
            throw new Error(`Insufficient stock for item ${stockItem.itemId}. Cannot revert adjustment.`);
          }
        }
      }

      await tx.stock.deleteMany({
        where: {
          inOrOut: "stockAdjustment",
          transactionId: { in: removeItemsIds },
        },
      });
      await tx.stockAdjustmentItems.deleteMany({
        where: { id: { in: removeItemsIds } },
      });
    }

    // 2. Validate new/updated items for negative adjustments
    await validateStockAdjustmentItems(tx, stockAdjustmentItems, branchId, storeId);

    // 3. Update main record
    piData = await tx.stockAdjustment.update({
      where: { id: parseInt(id) },
      data: {
        storeId: storeId ? parseInt(storeId) : undefined,
      },
    });

    // 4. Update or Create Items
    for (const item of (stockAdjustmentItems || []).filter(i => i.itemId)) {
      const qty = getAdjustmentQty(item);
      const itemData = {
        barcode: item?.barcode || undefined,
        itemId: item?.itemId ? parseInt(item.itemId) : null,
        sizeId: item?.sizeId ? parseInt(item.sizeId) : null,
        colorId: item?.colorId ? parseInt(item.colorId) : null,
        uomId: item?.uomId ? parseInt(item.uomId) : null,
        hsnId: item?.hsnId ? parseInt(item.hsnId) : null,
        qty: item?.qty ? String(item.qty) : null,
        price: item?.price ? String(item.price) : null,
        adjType: item?.adjType || undefined,
      };

      const stockData = {
        branchId: parseInt(branchId),
        storeId: parseInt(storeId),
        barcode: itemData.barcode,
        itemId: itemData.itemId,
        sizeId: itemData.sizeId,
        colorId: itemData.colorId,
        uomId: itemData.uomId,
        qty,
        price: item?.price ? parseFloat(item.price) : undefined,
        ...pickStockRuntimeFieldValues(item),
      };

      if (item.id) {
        // Update both item and stock record
        await tx.stockAdjustmentItems.update({
          where: { id: parseInt(item.id) },
          data: itemData,
        });

        await tx.stock.updateMany({
          where: {
            inOrOut: "stockAdjustment",
            transactionId: parseInt(item.id),
          },
          data: stockData,
        });
      } else {
        // Create new item and stock record
        const createdItem = await tx.stockAdjustmentItems.create({
          data: {
            stockAdjustmentId: piData.id,
            ...itemData,
          },
        });

        await tx.stock.create({
          data: {
            ...stockData,
            inOrOut: "stockAdjustment",
            transactionId: createdItem.id,
          },
        });
      }
    }
  });

  return { statusCode: 0, data: piData };
}




async function deleteItemsFromStock(tx, removeItemsStockIds) {
  return await tx.stock.deleteMany({
    where: {
      id: {
        in: removeItemsStockIds,
      },
    },
  });
}

async function remove(id) {
  const data = await prisma.stockAdjustment.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

export { getOneBarcode, remove, get, getOne, create, update };
