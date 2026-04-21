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
            shippingChargeEnabled, shippingCharge, deliveryItems, exchangeItems,
            finYearId, storeId, posPayments, originalPosId, userId,
            netAmount, receivedAmount // passed from frontend
        } = await body;

        let finYearDate = await getFinYearStartTimeEndTime(finYearId);
        const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startDateStartTime, finYearDate?.endDateEndTime) : "";
        let newSRDocId = await getNextDocId(branchId, shortCode, finYearDate?.startDateStartTime, finYearDate?.endDateEndTime);

        // Get original bill for reference
        let originalBill = null;
        if (originalPosId) {
            originalBill = await prisma.pos.findUnique({ where: { id: parseInt(originalPosId) } });
        }

        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Sales Return
            const salesReturn = await tx.salesReturn.create({
                data: {
                    docId: newSRDocId,
                    customerId: customerId ? parseInt(customerId) : undefined,
                    branchId: branchId ? parseInt(branchId) : undefined,
                    salesDeliveryId: salesDeliveryId ? parseInt(salesDeliveryId) : undefined,
                    storeId: storeId ? parseInt(storeId) : undefined,
                    packingChargeEnabled: Boolean(packingChargeEnabled),
                    packingCharge: packingChargeEnabled ? String(packingCharge || 0) : null,
                    shippingChargeEnabled: Boolean(shippingChargeEnabled),
                    shippingCharge: shippingChargeEnabled ? String(shippingCharge || 0) : null,
                    posId: originalPosId ? parseInt(originalPosId) : undefined,
                    createdById: userId ? parseInt(userId) : undefined,
                    SalesReturnItems: {
                        create: (deliveryItems || []).filter(i => i.itemId).map(i => mapSalesReturnItem(i, false)),
                    }
                },
            });

            const stockEntries = [];
            const retailStoreId = parseInt(storeId || 9);

            // 2. Inward Returned Items
            for (const item of (deliveryItems || []).filter(i => i.itemId)) {
                stockEntries.push({
                    itemId: parseInt(item.itemId),
                    sizeId: item.sizeId ? parseInt(item.sizeId) : null,
                    colorId: item.colorId ? parseInt(item.colorId) : null,
                    uomId: item.uomId ? parseInt(item.uomId) : null,
                    branchId: parseInt(branchId),
                    storeId: retailStoreId,
                    qty: parseFloat(item.qty || 0),
                    price: parseFloat(item.price || 0),
                    inOrOut: "SalesReturn",
                    transactionId: salesReturn.id,
                    barcode: item.barcode
                });
            }

            // 3. Handle Exchange via POS
            if (exchangeItems?.length > 0) {
                // Get next POS Doc ID
                let lastPos = await tx.pos.findFirst({
                    where: { branchId: parseInt(branchId), createdAt: { gte: finYearDate?.startDateStartTime, lte: finYearDate?.endDateEndTime } },
                    orderBy: { id: 'desc' }
                });
                const branchObj = await getTableRecordWithId(branchId, "branch");
                let nextPosDocId = `${branchObj.branchCode}/${shortCode}/POS/1`;
                if (lastPos) {
                    nextPosDocId = `${branchObj.branchCode}/${shortCode}/POS/${parseInt(lastPos.docId.split("/").at(-1)) + 1}`;
                }

                const exchangePos = await tx.pos.create({
                    data: {
                        docId: nextPosDocId,
                        customerId: customerId ? parseInt(customerId) : undefined,
                        branchId: branchId ? parseInt(branchId) : undefined,
                        // salesReturnId: salesReturn.id,
                        // originalPosId: originalPosId ? parseInt(originalPosId) : undefined, // Direct link to original bill
                        createdById: userId ? parseInt(userId) : undefined,
                        description: originalBill ? `Exchange against Bill #${originalBill.docId}` : "Exchange Bill",
                        netAmount: String(netAmount || 0),
                        receivedAmount: String(receivedAmount || 0),
                        PosItems: {
                            createMany: {
                                data: (exchangeItems || []).filter(i => i.itemId).map(item => ({
                                    itemId: parseInt(item.itemId || item.id),
                                    sizeId: item.sizeId ? parseInt(item.sizeId) : null,
                                    colorId: item.colorId ? parseInt(item.colorId) : null,
                                    uomId: item.uomId ? parseInt(item.uomId) : null,
                                    qty: String(item.qty),
                                    price: String(item.price),
                                    salesPersonId: item.salesPersonId ? parseInt(item.salesPersonId) : undefined,
                                    priceType: item.priceType || 'SalesPrice',
                                }))
                            }
                        },
                        PosPayments: {
                            createMany: {
                                data: (posPayments || []).map(p => ({
                                    amount: String(p.amount),
                                    paymentMode: p.paymentMode,
                                    reference_no: p.referenceNo || p.reference_no,
                                }))
                            }
                        }
                    }
                });

                // Stock Out for Exchange Items
                const exchangeFulfillmentLines = exchangeItems
                    .filter((item) => item?.itemId)
                    .map((item, lineIndex) => ({
                        ...item,
                        lineIndex,
                        itemId: parseInt(item.itemId),
                        storeId: item.sourceStoreId ? parseInt(item.sourceStoreId) : retailStoreId,
                        fulfillmentAllocations: item?.fulfillmentAllocations || item?.allocations || [],
                        branchId: parseInt(branchId),
                    }));

                const resolution = await resolveHybridFulfillmentLines(tx, exchangeFulfillmentLines, { branchId });
                const resolutionError = getHybridFulfillmentResolutionError(resolution);
                if (resolutionError) throw resolutionError;

                const allocations = extractResolvedAllocations(resolution);
                for (const allocation of allocations) {
                    const sourceStoreId = parseInt(allocation.storeId);
                    const qty = parseFloat(allocation.allocatedQty);
                    const itemLine = exchangeFulfillmentLines[allocation.lineIndex];
                    const price = parseFloat(itemLine?.price || 0);

                    const baseEntry = {
                        itemId: allocation.itemId,
                        sizeId: allocation.sizeId,
                        colorId: allocation.colorId,
                        uomId: allocation.uomId,
                        branchId: allocation.branchId,
                        barcode: allocation.barcode,
                        transactionId: exchangePos.id, // Linked to POS transaction
                        price: price,
                    };

                    if (sourceStoreId === retailStoreId) {
                        stockEntries.push({ ...baseEntry, qty: -qty, storeId: retailStoreId, inOrOut: "POS" });
                    } else {
                        stockEntries.push({ ...baseEntry, qty: -qty, storeId: sourceStoreId, inOrOut: "StockTransferOut" });
                        stockEntries.push({ ...baseEntry, qty: qty, storeId: retailStoreId, inOrOut: "StockTransferIn" });
                        stockEntries.push({ ...baseEntry, qty: -qty, storeId: retailStoreId, inOrOut: "POS" });
                    }
                }
            }

            // 4. Handle Refund as Expense
            // If return value > exchange value, netAmount passed from UI will be negative or we check directly
            const returnTotalValue = (deliveryItems || []).reduce((sum, item) => sum + (parseFloat(item.qty || 0) * parseFloat(item.price || 0)), 0);
            const exchangeTotalValue = (exchangeItems || []).reduce((sum, item) => sum + (parseFloat(item.qty || 0) * parseFloat(item.price || 0)), 0);

            if (returnTotalValue > exchangeTotalValue) {
                const refundAmount = returnTotalValue - exchangeTotalValue;
                await tx.expense.create({
                    data: {
                        amount: String(refundAmount),
                        description: `Refund for Sales Return ${newSRDocId}`,
                        salesReturnId: salesReturn.id,
                        branchId: parseInt(branchId),
                        createdById: userId ? parseInt(userId) : undefined,
                        date: new Date()
                    }
                });
            }

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
            shippingChargeEnabled, shippingCharge, deliveryItems, exchangeItems,
            storeId, posPayments, userId, netAmount, receivedAmount, originalPosId
        } = await body;

        const result = await prisma.$transaction(async (tx) => {
            // Find existing linked POS record
            const existingSR = await tx.salesReturn.findUnique({
                where: { id: parseInt(id) },
                include: { ExchangePos: true }
            });
            const linkedPosId = existingSR?.ExchangePos?.[0]?.id;

            // 1. Cleanup existing records
            await tx.stock.deleteMany({ where: { transactionId: parseInt(id), inOrOut: "SalesReturn" } });
            if (linkedPosId) {
                await tx.stock.deleteMany({ where: { transactionId: linkedPosId, inOrOut: { in: ["POS", "StockTransferOut", "StockTransferIn"] } } });
                await tx.posItems.deleteMany({ where: { PosId: linkedPosId } });
                await tx.posPayments.deleteMany({ where: { PosId: linkedPosId } });
            }
            await tx.salesReturnItems.deleteMany({ where: { salesReturnId: parseInt(id) } });
            await tx.expense.deleteMany({ where: { salesReturnId: parseInt(id) } });

            // 2. Update Header
            const salesReturn = await tx.salesReturn.update({
                where: { id: parseInt(id) },
                data: {
                    customerId: customerId ? parseInt(customerId) : undefined,
                    branchId: branchId ? parseInt(branchId) : undefined,
                    salesDeliveryId: salesDeliveryId ? parseInt(salesDeliveryId) : undefined,
                    storeId: storeId ? parseInt(storeId) : undefined,
                    packingChargeEnabled: Boolean(packingChargeEnabled),
                    packingCharge: packingChargeEnabled ? String(packingCharge || 0) : null,
                    shippingChargeEnabled: Boolean(shippingChargeEnabled),
                    shippingCharge: shippingChargeEnabled ? String(shippingCharge || 0) : null,
                    updatedById: userId ? parseInt(userId) : undefined,
                    originalPosId: originalPosId ? parseInt(originalPosId) : undefined,
                    SalesReturnItems: {
                        create: (deliveryItems || []).filter(i => i.itemId).map(i => mapSalesReturnItem(i, false)),
                    }
                },
            });

            const stockEntries = [];
            const retailStoreId = parseInt(storeId);

            // 3. Stock for Return Items
            for (const item of (deliveryItems || []).filter(i => i.itemId)) {
                stockEntries.push({
                    itemId: parseInt(item.itemId),
                    sizeId: item.sizeId ? parseInt(item.sizeId) : null,
                    colorId: item.colorId ? parseInt(item.colorId) : null,
                    uomId: item.uomId ? parseInt(item.uomId) : null,
                    branchId: parseInt(branchId),
                    storeId: retailStoreId,
                    qty: parseFloat(item.qty || 0),
                    price: parseFloat(item.price || 0),
                    inOrOut: "SalesReturn",
                    transactionId: salesReturn.id,
                    barcode: item.barcode
                });
            }

            // 4. Update/Create Linked POS for Exchange
            if (exchangeItems?.length > 0) {
                if (linkedPosId) {
                    await tx.pos.update({
                        where: { id: linkedPosId },
                        data: {
                            customerId: customerId ? parseInt(customerId) : undefined,
                            netAmount: String(netAmount || 0),
                            receivedAmount: String(receivedAmount || 0),
                            updatedById: userId ? parseInt(userId) : undefined,
                            originalPosId: originalPosId ? parseInt(originalPosId) : undefined,
                            PosItems: {
                                createMany: {
                                    data: (exchangeItems || []).filter(i => i.itemId).map(item => ({
                                        itemId: parseInt(item.itemId || item.id),
                                        sizeId: item.sizeId ? parseInt(item.sizeId) : null,
                                        colorId: item.colorId ? parseInt(item.colorId) : null,
                                        uomId: item.uomId ? parseInt(item.uomId) : null,
                                        qty: String(item.qty),
                                        price: String(item.price),
                                        salesPersonId: item.salesPersonId ? parseInt(item.salesPersonId) : undefined,
                                        priceType: item.priceType || 'SalesPrice',
                                    }))
                                }
                            },
                            PosPayments: {
                                createMany: {
                                    data: (posPayments || []).map(p => ({
                                        amount: String(p.amount),
                                        paymentMode: p.paymentMode,
                                        reference_no: p.referenceNo || p.reference_no,
                                    }))
                                }
                            }
                        }
                    });
                } else {
                    // Get next POS Doc ID if creating new during update
                    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
                    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startDateStartTime, finYearDate?.endDateEndTime) : "";
                    let lastPos = await tx.pos.findFirst({
                        where: { branchId: parseInt(branchId), createdAt: { gte: finYearDate?.startDateStartTime, lte: finYearDate?.endDateEndTime } },
                        orderBy: { id: 'desc' }
                    });
                    const branchObj = await getTableRecordWithId(branchId, "branch");
                    let nextPosDocId = `${branchObj.branchCode}/${shortCode}/POS/1`;
                    if (lastPos) nextPosDocId = `${branchObj.branchCode}/${shortCode}/POS/${parseInt(lastPos.docId.split("/").at(-1)) + 1}`;

                    const newExchangePos = await tx.pos.create({
                        data: {
                            docId: nextPosDocId,
                            customerId: customerId ? parseInt(customerId) : undefined,
                            branchId: branchId ? parseInt(branchId) : undefined,
                            salesReturnId: salesReturn.id,
                            originalPosId: originalPosId ? parseInt(originalPosId) : undefined,
                            createdById: userId ? parseInt(userId) : undefined,
                            description: `Exchange Against SR #${salesReturn.docId}`,
                            netAmount: String(netAmount || 0),
                            receivedAmount: String(receivedAmount || 0),
                            PosItems: {
                                createMany: {
                                    data: (exchangeItems || []).filter(i => i.itemId).map(item => ({
                                        itemId: parseInt(item.itemId || item.id),
                                        sizeId: item.sizeId ? parseInt(item.sizeId) : null,
                                        colorId: item.colorId ? parseInt(item.colorId) : null,
                                        uomId: item.uomId ? parseInt(item.uomId) : null,
                                        qty: String(item.qty),
                                        price: String(item.price),
                                        salesPersonId: item.salesPersonId ? parseInt(item.salesPersonId) : undefined,
                                        priceType: item.priceType || 'SalesPrice',
                                    }))
                                }
                            },
                            PosPayments: {
                                createMany: {
                                    data: (posPayments || []).map(p => ({
                                        amount: String(p.amount),
                                        paymentMode: p.paymentMode,
                                        reference_no: p.referenceNo || p.reference_no,
                                    }))
                                }
                            }
                        }
                    });
                    // Re-assign for stock entries
                    linkedPosId = newExchangePos.id;
                }

                // Handle Stock OUT for Exchange (same logic as create)
                const exchangeFulfillmentLines = exchangeItems
                    .filter((item) => item?.itemId)
                    .map((item, lineIndex) => ({
                        ...item, lineIndex, itemId: parseInt(item.itemId),
                        storeId: item.sourceStoreId ? parseInt(item.sourceStoreId) : retailStoreId,
                        fulfillmentAllocations: item?.fulfillmentAllocations || item?.allocations || [],
                        branchId: parseInt(branchId),
                    }));

                const resolution = await resolveHybridFulfillmentLines(tx, exchangeFulfillmentLines, { branchId });
                const allocations = extractResolvedAllocations(resolution);
                for (const allocation of allocations) {
                    const sourceStoreId = parseInt(allocation.storeId);
                    const qty = parseFloat(allocation.allocatedQty);
                    const itemLine = exchangeFulfillmentLines[allocation.lineIndex];
                    const price = parseFloat(itemLine?.price || 0);

                    const baseEntry = {
                        itemId: allocation.itemId, sizeId: allocation.sizeId, colorId: allocation.colorId,
                        uomId: allocation.uomId, branchId: allocation.branchId, barcode: allocation.barcode,
                        transactionId: linkedPosId || salesReturn.id, price: price,
                    };

                    if (sourceStoreId === retailStoreId) {
                        stockEntries.push({ ...baseEntry, qty: -qty, storeId: retailStoreId, inOrOut: "POS" });
                    } else {
                        stockEntries.push({ ...baseEntry, qty: -qty, storeId: sourceStoreId, inOrOut: "StockTransferOut" });
                        stockEntries.push({ ...baseEntry, qty: qty, storeId: retailStoreId, inOrOut: "StockTransferIn" });
                        stockEntries.push({ ...baseEntry, qty: -qty, storeId: retailStoreId, inOrOut: "POS" });
                    }
                }
            }

            // 5. Refund Handle
            const returnTotalValue = (deliveryItems || []).reduce((sum, item) => sum + (parseFloat(item.qty || 0) * parseFloat(item.price || 0)), 0);
            const exchangeTotalValue = (exchangeItems || []).reduce((sum, item) => sum + (parseFloat(item.qty || 0) * parseFloat(item.price || 0)), 0);
            if (returnTotalValue > exchangeTotalValue) {
                const refundAmount = returnTotalValue - exchangeTotalValue;
                await tx.expense.create({
                    data: {
                        amount: String(refundAmount),
                        description: `Refund for Sales Return ${salesReturn.docId}`,
                        salesReturnId: salesReturn.id,
                        branchId: parseInt(branchId),
                        createdById: userId ? parseInt(userId) : undefined,
                        date: new Date()
                    }
                });
            }

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
