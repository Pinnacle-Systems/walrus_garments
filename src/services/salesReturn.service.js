import { NoRecordFound } from '../configs/Responses.js';
import { prisma } from '../lib/prisma.js';
import { getFinYearStartTimeEndTime } from '../utils/finYearHelper.js';
import { getYearShortCodeForFinYear } from '../utils/helper.js';
import { getTableRecordWithId } from '../utils/helperQueries.js';
import {
    buildStockOutEntries,
    extractResolvedAllocations,
    getHybridFulfillmentResolutionError,
    resolveHybridFulfillmentLines,
    validateFulfillmentAllocations,
} from './salesDeliveryConversionRules.js';

async function getNextDocId(branchId, shortCode, startTime, endTime) {
    let lastObject = await prisma.salesReturn.findFirst({
        where: {
            branchId: parseInt(branchId),
            createdAt: {
                gte: startTime,
                lte: endTime,
            },
        },
        orderBy: {
            id: 'desc',
        },
    });
    const branchObj = await getTableRecordWithId(branchId, "branch");
    let newDocId = `${branchObj.branchCode}/${shortCode}/SR/1`;

    if (lastObject) {
        newDocId = `${branchObj.branchCode}/${shortCode}/SR/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`;
    }

    return newDocId;
}

async function get(req) {
    const { active } = req.query;

    let data = await prisma.salesReturn.findMany({
        where: {
            active: active ? Boolean(active) : undefined,
        },
        include: {
            Party: {
                select: {
                    name: true,
                    BranchType: {
                        select: {
                            name: true,
                        },
                    },
                    City: {
                        select: {
                            name: true,
                        },
                    },
                },
            },
            SalesDelivery: {
                select: {
                    id: true,
                    docId: true,
                },
            },
        },
        orderBy: {
            id: "desc",
        },
    });

    return { statusCode: 0, data };
}

async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.salesReturn.findUnique({
        where: { id: parseInt(id) },
        include: {
            SalesReturnItems: {
                include: { Item: true, Color: true, Size: true, SalesPerson: true }
            },
            Party: true,
            Store: true,
            PosPayments: true
        }
    }); if (!data) return NoRecordFound("Sales Return");

    return { statusCode: 0, data: { ...data, childRecord } };
}

async function getSearch(req) {
    const { searchKey } = req.params;
    const { active } = req.query;

    const data = await prisma.salesReturn.findMany({
        where: {
            active: active ? Boolean(active) : undefined,
            docId: searchKey
                ? {
                    contains: searchKey,
                }
                : undefined,
        },
        include: {
            Party: {
                select: {
                    name: true,
                },
            },
        },
        orderBy: {
            id: "desc",
        },
    });

    return { statusCode: 0, data };
}

function mapSalesReturnItem(item = {}, isExchange = false) {
    return {
        itemId: item.itemId ? parseInt(item.itemId) : null,
        sizeId: item.sizeId ? parseInt(item.sizeId) : null,
        colorId: item.colorId ? parseInt(item.colorId) : null,
        uomId: item.uomId ? parseInt(item.uomId) : null,
        hsnId: item.hsnId ? parseInt(item.hsnId) : null,
        qty: item.qty ? item.qty.toString() : "0",
        price: item.price ? item.price.toString() : "0",
        discountType: item.discountType,
        discountValue: item.discountValue ? item.discountValue.toString() : null,
        taxMethod: item.taxMethod,
        taxType: item.taxType,
        // isExchange: isExchange,
        // salesPersonId: item.salesPersonId ? parseInt(item.salesPersonId) : null
    };
}

async function create(body) {
    try {
        const {
            customerId, branchId, salesDeliveryId, packingChargeEnabled, packingCharge,
            shippingChargeEnabled, shippingCharge, deliveryItems,
            finYearId, storeId, userId
        } = await body;

        let finYearDate = await getFinYearStartTimeEndTime(finYearId);
        const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startDateStartTime, finYearDate?.endDateEndTime) : "";
        let newSRDocId = await getNextDocId(branchId, shortCode, finYearDate?.startDateStartTime, finYearDate?.endDateEndTime);

        const result = await prisma.$transaction(async (tx) => {
            let effectiveStoreId = storeId ? parseInt(storeId) : null;

            if (!effectiveStoreId) {
                const warehouse = await tx.location.findFirst({
                    where: {
                        // branchId: parseInt(branchId),
                        storeName: { contains: "WAREHOUSE" },
                        active: true
                    },
                    select: { id: true }
                });
                effectiveStoreId = warehouse?.id;
            }

            if (!effectiveStoreId) {
                throw new Error("Store (Warehouse) not found for this branch. Please specify a store.");
            }

            // 1. Stock Validation
            for (const item of (deliveryItems || []).filter(i => i.itemId)) {
                const requestedQty = parseFloat(item.qty || 0);
                if (requestedQty <= 0) continue;

                const stockData = await tx.stock.aggregate({
                    where: {
                        itemId: parseInt(item.itemId),
                        sizeId: item.sizeId ? parseInt(item.sizeId) : null,
                        colorId: item.colorId ? parseInt(item.colorId) : null,
                        uomId: item.uomId ? parseInt(item.uomId) : null,
                        storeId: effectiveStoreId,
                        branchId: parseInt(branchId),
                    },
                    _sum: { qty: true }
                });

                const availableQty = parseFloat(stockData._sum.qty || 0);
                if (availableQty < requestedQty) {
                    const itemMaster = await tx.item.findUnique({
                        where: { id: parseInt(item.itemId) },
                        select: { name: true }
                    });
                    throw new Error(`Insufficient stock for item: ${itemMaster?.name || item.itemId}. Available: ${availableQty}, Required: ${requestedQty}`);
                }
            }

            // 2. Create Sales Return
            const salesReturn = await tx.salesReturn.create({
                data: {
                    docId: newSRDocId,
                    customerId: customerId ? parseInt(customerId) : undefined,
                    branchId: branchId ? parseInt(branchId) : undefined,
                    salesDeliveryId: salesDeliveryId ? parseInt(salesDeliveryId) : undefined,
                    storeId: effectiveStoreId,
                    packingChargeEnabled: Boolean(packingChargeEnabled),
                    packingCharge: packingChargeEnabled ? String(packingCharge || 0) : null,
                    shippingChargeEnabled: Boolean(shippingChargeEnabled),
                    shippingCharge: shippingChargeEnabled ? String(shippingCharge || 0) : null,
                    createdById: userId ? parseInt(userId) : undefined,
                    SalesReturnItems: {
                        create: (deliveryItems || []).filter(i => i.itemId).map(i => mapSalesReturnItem(i, false)),
                    }
                },
            });

            // 3. Stock Reduction (Minus)
            const stockEntries = (deliveryItems || []).filter(i => i.itemId).map(item => ({
                itemId: parseInt(item.itemId),
                sizeId: item.sizeId ? parseInt(item.sizeId) : null,
                colorId: item.colorId ? parseInt(item.colorId) : null,
                uomId: item.uomId ? parseInt(item.uomId) : null,
                branchId: parseInt(branchId),
                storeId: effectiveStoreId,
                qty: -parseFloat(item.qty || 0), // MINUS stock
                price: parseFloat(item.price || 0),
                inOrOut: "SalesReturn",
                transactionId: salesReturn.id,
                barcode: item.barcode
            }));

            if (stockEntries.length > 0) {
                await tx.stock.createMany({ data: stockEntries });
            }

            return salesReturn;
        });

        return { statusCode: 0, data: result };
    } catch (e) {
        console.error("SalesReturn Error:", e);
        return { statusCode: 1, message: e.message };
    }
}

async function update(id, body) {
    try {
        const {
            customerId, branchId, salesDeliveryId, packingChargeEnabled, packingCharge,
            shippingChargeEnabled, shippingCharge, deliveryItems,
            storeId, userId
        } = await body;

        const result = await prisma.$transaction(async (tx) => {
            // 1. Cleanup existing stock entries for this return to accurately check available stock
            await tx.stock.deleteMany({ where: { transactionId: parseInt(id), inOrOut: "SalesReturn" } });
            await tx.salesReturnItems.deleteMany({ where: { salesReturnId: parseInt(id) } });

            let effectiveStoreId = storeId ? parseInt(storeId) : null;

            if (!effectiveStoreId) {
                const warehouse = await tx.store.findFirst({
                    where: {
                        branchId: parseInt(branchId),
                        storeName: { contains: "WAREHOUSE" },
                        active: true
                    },
                    select: { id: true }
                });
                effectiveStoreId = warehouse?.id;
            }

            if (!effectiveStoreId) {
                throw new Error("Store (Warehouse) not found for this branch. Please specify a store.");
            }

            // 2. Stock Validation
            for (const item of (deliveryItems || []).filter(i => i.itemId)) {
                const requestedQty = parseFloat(item.qty || 0);
                if (requestedQty <= 0) continue;

                const stockData = await tx.stock.aggregate({
                    where: {
                        itemId: parseInt(item.itemId),
                        sizeId: item.sizeId ? parseInt(item.sizeId) : null,
                        colorId: item.colorId ? parseInt(item.colorId) : null,
                        uomId: item.uomId ? parseInt(item.uomId) : null,
                        storeId: effectiveStoreId,
                        branchId: parseInt(branchId),
                    },
                    _sum: { qty: true }
                });

                const availableQty = parseFloat(stockData._sum.qty || 0);
                if (availableQty < requestedQty) {
                    const itemMaster = await tx.itemMaster.findUnique({
                        where: { id: parseInt(item.itemId) },
                        select: { name: true }
                    });
                    throw new Error(`Insufficient stock for item: ${itemMaster?.name || item.itemId}. Available: ${availableQty}, Required: ${requestedQty}`);
                }
            }

            // 3. Update Header
            const salesReturn = await tx.salesReturn.update({
                where: { id: parseInt(id) },
                data: {
                    customerId: customerId ? parseInt(customerId) : undefined,
                    branchId: branchId ? parseInt(branchId) : undefined,
                    salesDeliveryId: salesDeliveryId ? parseInt(salesDeliveryId) : undefined,
                    storeId: effectiveStoreId,
                    packingChargeEnabled: Boolean(packingChargeEnabled),
                    packingCharge: packingChargeEnabled ? String(packingCharge || 0) : null,
                    shippingChargeEnabled: Boolean(shippingChargeEnabled),
                    shippingCharge: shippingChargeEnabled ? String(shippingCharge || 0) : null,
                    updatedById: userId ? parseInt(userId) : undefined,
                    SalesReturnItems: {
                        create: (deliveryItems || []).filter(i => i.itemId).map(i => mapSalesReturnItem(i, false)),
                    }
                },
            });

            // 4. Stock Reduction (Minus)
            const stockEntries = (deliveryItems || []).filter(i => i.itemId).map(item => ({
                itemId: parseInt(item.itemId),
                sizeId: item.sizeId ? parseInt(item.sizeId) : null,
                colorId: item.colorId ? parseInt(item.colorId) : null,
                uomId: item.uomId ? parseInt(item.uomId) : null,
                branchId: parseInt(branchId),
                storeId: effectiveStoreId,
                qty: -parseFloat(item.qty || 0), // MINUS stock
                price: parseFloat(item.price || 0),
                inOrOut: "SalesReturn",
                transactionId: salesReturn.id,
                barcode: item.barcode
            }));

            if (stockEntries.length > 0) {
                await tx.stock.createMany({ data: stockEntries });
            }

            return salesReturn;
        });

        return { statusCode: 0, data: result };
    } catch (e) {
        console.error("SalesReturn Update Error:", e);
        return { statusCode: 1, message: e.message };
    }
}

async function remove(id) {
    const data = await prisma.salesReturn.delete({
        where: {
            id: parseInt(id),
        },
    });
    return { statusCode: 0, data };
}

export {
    get,
    getOne,
    getSearch,
    create,
    update,
    remove,
};
