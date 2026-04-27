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

function parseAmount(value) {
    const parsed = parseFloat(value || 0);
    return Number.isFinite(parsed) ? parsed : 0;
}

function isSameDeliveryReturnLine(deliveryItem, returnItem) {
    if (returnItem?.salesDeliveryItemId) {
        return parseInt(returnItem.salesDeliveryItemId) === parseInt(deliveryItem?.id);
    }

    return String(deliveryItem?.itemId || "") === String(returnItem?.itemId || "")
        && String(deliveryItem?.sizeId || "") === String(returnItem?.sizeId || "")
        && String(deliveryItem?.colorId || "") === String(returnItem?.colorId || "")
        && String(deliveryItem?.uomId || "") === String(returnItem?.uomId || "")
        && String(deliveryItem?.hsnId || "") === String(returnItem?.hsnId || "");
}

function buildRemainingReturnQtyByDeliveryItemId(salesDelivery, excludeSalesReturnId = null) {
    const remainingQtyByDeliveryItemId = new Map();

    for (const deliveryItem of salesDelivery?.SalesDeliveryItems || []) {
        const deliveredQty = parseAmount(deliveryItem?.qty);
        const returnedQty = (salesDelivery?.SalesReturn || []).reduce((returnAcc, salesReturn) => {
            if (excludeSalesReturnId && parseInt(salesReturn?.id) === parseInt(excludeSalesReturnId)) {
                return returnAcc;
            }

            return returnAcc + (salesReturn?.SalesReturnItems || []).reduce((itemAcc, returnItem) => (
                itemAcc + (isSameDeliveryReturnLine(deliveryItem, returnItem) ? parseAmount(returnItem?.qty) : 0)
            ), 0);
        }, 0);

        remainingQtyByDeliveryItemId.set(parseInt(deliveryItem.id), Math.max(0, deliveredQty - returnedQty));
    }

    return remainingQtyByDeliveryItemId;
}

async function getSalesDeliveryReturnValidationState(tx, salesDeliveryId, excludeSalesReturnId = null) {
    if (!salesDeliveryId) return null;

    const salesDelivery = await tx.salesDelivery.findUnique({
        where: {
            id: parseInt(salesDeliveryId),
        },
        include: {
            SalesDeliveryItems: true,
            SalesReturn: {
                include: {
                    SalesReturnItems: true,
                }
            }
        }
    });

    if (!salesDelivery) return null;

    return {
        salesDelivery,
        remainingQtyByDeliveryItemId: buildRemainingReturnQtyByDeliveryItemId(salesDelivery, excludeSalesReturnId),
    };
}

function validateLinkedReturnItems(deliveryItems = [], validationState) {
    if (!validationState) return null;

    for (const item of (deliveryItems || []).filter(i => i.itemId)) {
        if (!item?.salesDeliveryItemId) {
            return "Each converted return line must be tied to a sales delivery line.";
        }

        const salesDeliveryItemId = parseInt(item.salesDeliveryItemId);
        const remainingQty = validationState.remainingQtyByDeliveryItemId.get(salesDeliveryItemId);
        if (remainingQty === undefined) {
            return "One or more return lines are not part of the selected sales delivery.";
        }

        if (parseAmount(item?.qty) > remainingQty + 0.0001) {
            return "One or more return quantities exceed the remaining sales delivery quantity.";
        }
    }

    return null;
}

async function validateReturnStore(tx, storeId, branchId) {
    if (!storeId) {
        throw new Error("Return location is required.");
    }

    const store = await tx.location.findFirst({
        where: {
            id: parseInt(storeId),
            locationId: branchId ? parseInt(branchId) : undefined,
            active: true,
        },
        select: {
            id: true,
        }
    });

    if (!store) {
        throw new Error("Invalid return location.");
    }

    return store.id;
}

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
                include: { Item: true, Color: true, Size: true }
            },
            Party: true,
            Store: true,
            // PosPayments: true
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
        salesDeliveryItemId: item.salesDeliveryItemId ? parseInt(item.salesDeliveryItemId) : null,
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
            const effectiveStoreId = await validateReturnStore(tx, storeId, branchId);
            const validationState = await getSalesDeliveryReturnValidationState(tx, salesDeliveryId);
            const validationMessage = validateLinkedReturnItems(deliveryItems, validationState);
            if (validationMessage) {
                throw new Error(validationMessage);
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

            // 3. Stock Inward for returned goods
            const stockEntries = (deliveryItems || []).filter(i => i.itemId).map(item => ({
                itemId: parseInt(item.itemId),
                sizeId: item.sizeId ? parseInt(item.sizeId) : null,
                colorId: item.colorId ? parseInt(item.colorId) : null,
                uomId: item.uomId ? parseInt(item.uomId) : null,
                branchId: parseInt(branchId),
                storeId: effectiveStoreId,
                qty: parseFloat(item.qty || 0),
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
            await tx.stock.deleteMany({ where: { transactionId: parseInt(id), inOrOut: "SalesReturn" } });
            await tx.salesReturnItems.deleteMany({ where: { salesReturnId: parseInt(id) } });

            const effectiveStoreId = await validateReturnStore(tx, storeId, branchId);
            const validationState = await getSalesDeliveryReturnValidationState(tx, salesDeliveryId, id);
            const validationMessage = validateLinkedReturnItems(deliveryItems, validationState);
            if (validationMessage) {
                throw new Error(validationMessage);
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

            // 4. Stock Inward for returned goods
            const stockEntries = (deliveryItems || []).filter(i => i.itemId).map(item => ({
                itemId: parseInt(item.itemId),
                sizeId: item.sizeId ? parseInt(item.sizeId) : null,
                colorId: item.colorId ? parseInt(item.colorId) : null,
                uomId: item.uomId ? parseInt(item.uomId) : null,
                branchId: parseInt(branchId),
                storeId: effectiveStoreId,
                qty: parseFloat(item.qty || 0),
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
