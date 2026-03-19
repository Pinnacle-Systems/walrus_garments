import { prisma } from "../lib/prisma.js";
import { getTableRecordWithId } from "../utils/helperQueries.js";
import {
  getDateFromDateTime,
  getYearShortCode,
  getYearShortCodeForFinYear,
} from "../utils/helper.js";
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";
import { NoRecordFound } from "../configs/Responses.js";




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
    let newDocId = `${branchObj.branchCode}${getYearShortCode(
      new Date()
    )}/SA/1`;

    if (lastObject) {
      newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/SA/${parseInt(lastObject.docId.split("/").at(-1)) + 1
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

  return {
    statusCode: 0,
    data: {
      ...data,
    },
  };
}



async function isLegacyLocation(storeId) {
  if (!storeId) return false;
  const location = await prisma.location.findUnique({
    where: { id: parseInt(storeId) }
  });
  if (location && (location.storeName.toLowerCase().includes('old'))) {
    return true;
  }
  return false;
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
    let qty = null;
    if (stockDetail?.adjType == "PLUS") {
      qty = stockDetail?.qty;
    } else {
      qty = -stockDetail?.qty;
    }

    const isLegacy = await isLegacyLocation(storeId);




    const baseData = {
      inOrOut: "stockAdjustment",
      // createdById: parseInt(userId),
      branchId: parseInt(branchId),
      storeId: parseInt(storeId),
      barcode: stockDetail?.barcode ? stockDetail?.barcode : undefined,
      itemId: stockDetail?.itemId ? parseInt(stockDetail.itemId) : null,
      sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
      colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,

      uomId: stockDetail?.uomId ? parseInt(stockDetail.uomId) : null,
      // hsnId: stockDetail?.hsnId ? parseInt(stockDetail.hsnId) : null,

      qty,

    };


    console.log(baseData, "baseData", isLegacy)

    if (isLegacy) {
      await tx.legacyStock.create({ data: { ...baseData, } });


    } else {

      await tx.stock.create({ data: { ...baseData, } });
    }

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



async function update(id, body) {
  const {
    branchId,
    stockAdjustmentItems,
    userId,
    storeId,
    docDate,
    locationId,
  } = await body;
  let data;
  const dataFound = await prisma.stockAdjustment.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      StockAdjustmentItems: {
        select: {
          id: true,
        },
      },
    },
  });
  if (!dataFound) return NoRecordFound("stockAdjustment");
  let removedItems = findRemovedItems(dataFound, stockAdjustmentItems);
  let removeItemsIds = removedItems.map((item) => parseInt(item.id));
  await prisma.$transaction(async (tx) => {
    // await deleteItemsFromStock(tx, removeItemsIds);
    if (removeItemsIds.length > 0) {
      await tx.stockAdjustmentItems.deleteMany({
        where: { id: { in: removeItemsIds } },
      });
      // Try deleting from stock where stockAdjustmentId matches
      try { await tx.stock.deleteMany({ where: { stockAdjustmentId: { in: removeItemsIds } } }); } catch (e) { }
      // Try deleting from legacyStock where docId matches and barcode is one of removed items
      const removedBarcodes = removedItems.map(item => item.barcode).filter(Boolean);
      try {
        if (removedBarcodes.length > 0) {
          await tx.legacyStock.deleteMany({ where: { docId: dataFound.docId, barcode: { in: removedBarcodes } } });
        }
      } catch (e) { }
    }
    data = await tx.stockAdjustment.update({
      where: {
        id: parseInt(id),
      },
      data: {
        storeId: parseInt(storeId),
        branchId: parseInt(branchId),
      },
    });
    await updateOpeningStockItems(
      tx,
      stockAdjustmentItems,
      data,
      userId,
      branchId,
      storeId,
      dataFound.docId
    );
  });
  return { statusCode: 0, data };
}

async function updateOpeningStockItems(
  tx,
  stockAdjustmentItems,
  stockAdjustment,
  userId,
  branchId,
  storeId,
  docId
) {
  const isLegacy = await isLegacyLocation(storeId);


  const promises = stockAdjustmentItems.map(async (stockDetail) => {
    let qty = null;
    if (stockDetail?.adjType === "PLUS") {
      qty = stockDetail?.qty ? parseFloat(stockDetail.qty) : null;
    } else if (stockDetail?.adjType === "MINUS") {
      qty = stockDetail?.qty ? parseFloat(0 - stockDetail.qty) : null;
    }

    const baseData = {
      inOrOut: "stockAdjustment",
      branchId: parseInt(branchId),
      storeId: parseInt(storeId),
      barcode: stockDetail?.barcode ? stockDetail?.barcode : undefined,
      itemId: stockDetail?.itemId ? parseInt(stockDetail.itemId) : null,
      sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
      colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
      uomId: stockDetail?.uomId ? parseInt(stockDetail.uomId) : null,
      qty,
    };




  });
  return Promise.all(promises);
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
