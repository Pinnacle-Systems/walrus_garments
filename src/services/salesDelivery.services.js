import { NoRecordFound } from '../configs/Responses.js';
import { prisma } from '../lib/prisma.js';
import { getFinYearStartTimeEndTime } from '../utils/finYearHelper.js';
import { getYearShortCodeForFinYear } from '../utils/helper.js';
import { getTableRecordWithId } from '../utils/helperQueries.js';
import {
    buildStockOutEntries,
    getRemainingPaymentCapacity,
    getRemainingQtyBySaleOrderItemId,
} from './salesDeliveryConversionRules.js';

function parseAmount(value) {
    const parsed = parseFloat(value || 0);
    return Number.isFinite(parsed) ? parsed : 0;
}

function roundMoney(value) {
    return Math.round((parseFloat(value || 0) || 0) * 100) / 100;
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

function buildRemainingReturnItems(salesDeliveryItems = [], salesReturns = [], excludeSalesReturnId = null) {
    return (salesDeliveryItems || [])
        .map((deliveryItem) => {
            const deliveredQty = parseAmount(deliveryItem?.qty);
            const returnedQty = (salesReturns || []).reduce((returnAcc, salesReturn) => {
                if (excludeSalesReturnId && parseInt(salesReturn?.id) === parseInt(excludeSalesReturnId)) {
                    return returnAcc;
                }

                return returnAcc + (salesReturn?.SalesReturnItems || []).reduce((itemAcc, returnItem) => (
                    itemAcc + (isSameDeliveryReturnLine(deliveryItem, returnItem) ? parseAmount(returnItem?.qty) : 0)
                ), 0);
            }, 0);
            const remainingQty = Math.max(0, deliveredQty - returnedQty);

            return {
                ...deliveryItem,
                salesDeliveryItemId: deliveryItem?.id,
                deliveredQty: deliveredQty.toFixed(3),
                returnedQty: returnedQty.toFixed(3),
                remainingQty: remainingQty.toFixed(3),
                qty: remainingQty.toFixed(3),
            };
        })
        .filter((deliveryItem) => parseAmount(deliveryItem?.remainingQty) > 0);
}

function getSalesDeliveryReturnState(salesDelivery, excludeSalesReturnId = null) {
    const remainingReturnItems = buildRemainingReturnItems(
        salesDelivery?.SalesDeliveryItems,
        salesDelivery?.SalesReturn,
        excludeSalesReturnId
    );
    const deliveredQty = (salesDelivery?.SalesDeliveryItems || []).reduce((acc, curr) => acc + parseAmount(curr?.qty), 0);
    const remainingQty = remainingReturnItems.reduce((acc, curr) => acc + parseAmount(curr?.remainingQty), 0);
    const returnedQty = Math.max(0, deliveredQty - remainingQty);
    const returnStatus = returnedQty <= 0.0001
        ? "Delivered"
        : (remainingQty > 0.0001 ? "Partially Returned" : "Fully Returned");

    return {
        remainingReturnItems,
        returnedQty: returnedQty.toFixed(3),
        remainingReturnQty: remainingQty.toFixed(3),
        returnStatus,
        canConvertToReturn: remainingQty > 0.0001,
    };
}

async function getSaleOrderValidationState(saleOrderId, excludeSalesDeliveryId = null, db = prisma) {
    if (!saleOrderId) return null;

    const saleOrder = await db.saleorder.findUnique({
        where: {
            id: parseInt(saleOrderId),
        },
        include: {
            SaleOrderItems: true,
            SalesDelivery: {
                include: {
                    SalesDeliveryItems: true,
                }
            },
            Quotation: {
                select: {
                    id: true,
                }
            }
        }
    });

    if (!saleOrder) return null;

    const quotationPaymentData = saleOrder?.Quotation?.id
        ? await db.payment.findMany({
            where: {
                transactionType: "QUOTATION",
                transactionId: saleOrder.Quotation.id,
            },
        })
        : [];

    return {
        saleOrder,
        remainingQtyBySaleOrderItemId: getRemainingQtyBySaleOrderItemId(saleOrder, excludeSalesDeliveryId),
        totalReceivedAmount: roundMoney(quotationPaymentData.reduce(
            (acc, curr) => acc + parseAmount(curr?.paidAmount),
            0
        )),
        remainingPaymentCapacity: roundMoney(getRemainingPaymentCapacity(
            quotationPaymentData.reduce((acc, curr) => acc + parseAmount(curr?.paidAmount), 0),
            saleOrder?.SalesDelivery,
            excludeSalesDeliveryId
        )),
    };
}




async function getNextDocId(branchId, shortCode, startTime, endTime) {


    let lastObject = await prisma.SalesDelivery.findFirst({
        where: {
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
    let newDocId = `${branchObj.branchCode}/${shortCode}/SD/1`
    if (lastObject) {
        newDocId = `${branchObj.branchCode}/${shortCode}/SD/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
    }
    return newDocId
}

async function get(req) {

    const { companyId, active } = req.query

    console.log(companyId, active, "companyId, active ")

    let data = await prisma.salesDelivery.findMany({
        where: {
            active: active ? Boolean(active) : undefined,
        },
        include: {
            Party: {
                select: {
                    name: true,
                    // branchId: true,
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
                },
            },
            SalesDeliveryItems: true,
            Saleorder: {
                select: {
                    id: true,
                    docId: true,
                }
            },
            SalesReturn: {
                include: {
                    SalesReturnItems: true,
                }
            },
        }
    });



    return {
        statusCode: 0,
        data: data.map((salesDelivery) => ({
            ...salesDelivery,
            ...getSalesDeliveryReturnState(salesDelivery),
        }))
    };
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.SalesDelivery.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            SalesDeliveryItems: true,
            FulfillmentAllocations: true,
            SalesReturn: {
                include: {
                    SalesReturnItems: true,
                }
            },
            Saleorder: {
                select: {
                    id: true,
                    docId: true,
                    createdAt: true,
                }
            }
        }
    })
    if (!data) return NoRecordFound("size");
    return { statusCode: 0, data: { ...data, ...getSalesDeliveryReturnState(data), childRecord } };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active, } = req.query
    const data = await prisma.saleOrder.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
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

async function create(body) {
    const {
        customerId,
        discountType,
        discountValue,
        deliveryItems,
        finYearId,
        branchId,
        storeId,
        saleOrderId,
        packingChargeEnabled,
        packingCharge,
        shippingChargeEnabled,
        shippingCharge,
    } = await body

    // Validation removed as per user request



    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startDateStartTime, finYearDate?.endDateEndTime) : "";
    let docId = await getNextDocId(branchId, shortCode, finYearDate?.startDateStartTime, finYearDate?.endDateEndTime);


    try {
        let data;
        await prisma.$transaction(async (tx) => {
            // Transactional validation removed as per user request


            data = await tx.salesDelivery.create({
                data: {
                    customerId: customerId ? parseInt(customerId) : undefined,
                    branchId: branchId ? parseInt(branchId) : "",
                    saleOrderId: saleOrderId ? parseInt(saleOrderId) : undefined,
                    packingChargeEnabled: Boolean(packingChargeEnabled),
                    packingCharge: packingChargeEnabled ? String(packingCharge || 0) : null,
                    shippingChargeEnabled: Boolean(shippingChargeEnabled),
                    shippingCharge: shippingChargeEnabled ? String(shippingCharge || 0) : null,
                    docId: docId,
                }
            });

            // Retail Stock Validation
            const retailStore = await tx.location.findFirst({
                where: { storeName: "RETAIL" }
            });

            if (retailStore) {
                for (const item of (deliveryItems || []).filter(i => i.itemId && parseAmount(i.qty) > 0)) {
                    const stockRows = await tx.stock.findMany({
                        where: {
                            itemId: parseInt(item.itemId),
                            sizeId: item.sizeId ? parseInt(item.sizeId) : null,
                            colorId: item.colorId ? parseInt(item.colorId) : null,
                            storeId: retailStore.id,
                            branchId: branchId ? parseInt(branchId) : undefined,
                        }
                    });

                    const availableQty = stockRows.reduce((acc, curr) => acc + parseAmount(curr.qty), 0);
                    const requestedQty = parseAmount(item.qty);

                    if (requestedQty > availableQty + 0.0001) {
                        const itemData = await tx.item.findUnique({ where: { id: parseInt(item.itemId) }, select: { name: true } });
                        const colorData = item.colorId ? await tx.color.findUnique({ where: { id: parseInt(item.colorId) }, select: { name: true } }) : null;
                        const sizeData = item.sizeId ? await tx.size.findUnique({ where: { id: parseInt(item.sizeId) }, select: { name: true } }) : null;

                        const itemName = itemData?.name || "Item";
                        const colorName = colorData?.name || "";
                        const sizeName = sizeData?.name || "";

                        throw new Error(`Item "${itemName} - ${colorName} - ${sizeName}" has only ${availableQty.toFixed(3)} ss available in stock.`);
                    }
                }
            }

            const sourceDeliveryItems = (deliveryItems || []).filter((temp) => temp?.itemId && parseAmount(temp?.qty) > 0);
            const persistedDeliveryItems = [];

            for (const temp of sourceDeliveryItems) {
                const savedItem = await tx.salesDeliveryItems.create({
                    data: {
                        salesDeliveryId: parseInt(data.id),
                        saleOrderItemId: temp["saleOrderItemId"] ? parseInt(temp["saleOrderItemId"]) : null,
                        itemId: temp["itemId"] ? parseInt(temp["itemId"]) : null,
                        sizeId: temp["sizeId"] ? parseInt(temp["sizeId"]) : null,
                        colorId: temp["colorId"] ? parseInt(temp["colorId"]) : null,
                        uomId: temp["uomId"] ? parseInt(temp["uomId"]) : null,
                        hsnId: temp["hsnId"] ? parseInt(temp["hsnId"]) : null,
                        qty: temp["qty"] ? temp["qty"] : null,
                        price: temp["price"] ? temp["price"] : null,
                        discountType: temp["discountType"] || null,
                        discountValue: temp["discountValue"] || null,
                        taxPercent: temp["taxPercent"] || null,
                        taxMethod: temp["taxMethod"] || null,
                        priceType: temp["priceType"] || null,
                    }
                });

                persistedDeliveryItems.push({
                    ...savedItem,
                    barcode: temp?.barcode || null,
                    fulfillmentAllocations: temp?.fulfillmentAllocations || temp?.allocations || [],
                });
            }

            const allocations = persistedDeliveryItems.map((item) => ({
                salesDeliveryId: parseInt(data.id),
                salesDeliveryItemId: item.id,
                saleOrderItemId: item.saleOrderItemId,
                itemId: item.itemId,
                sizeId: item.sizeId,
                colorId: item.colorId,
                uomId: item.uomId,
                storeId: retailStore?.id || 9,
                branchId: branchId ? parseInt(branchId) : null,
                barcode: item.barcode || null,
                allocatedQty: parseAmount(item.qty),
            }));

            if (allocations.length > 0) {
                await tx.salesDeliveryFulfillmentAllocation.createMany({
                    data: allocations.map((allocation) => ({
                        salesDeliveryId: parseInt(data.id),
                        salesDeliveryItemId: allocation.salesDeliveryItemId,
                        saleOrderItemId: allocation.saleOrderItemId,
                        itemId: allocation.itemId,
                        sizeId: allocation.sizeId,
                        colorId: allocation.colorId,
                        uomId: allocation.uomId,
                        storeId: allocation.storeId,
                        branchId: allocation.branchId,
                        barcode: allocation.barcode,
                        allocatedQty: allocation.allocatedQty,
                    }))
                });

                await tx.stock.createMany({
                    data: buildStockOutEntries(allocations, {
                        transactionId: data.id,
                        inOrOut: "SalesDelivery",
                    })
                });
            }
        });

        return { statusCode: 0, data };
    } catch (error) {
        return {
            statusCode: 1,
            message: error.message || "Failed to save sales delivery.",
            data: error?.fulfillmentResolution ? { fulfillmentResolution: error.fulfillmentResolution } : undefined,
        };
    }
}

async function updateOrCreate(tx, item, quotationId, poType, poInwardOrDirectInward, storeId, branchId) {

    if (item?.id) {


        let updatedata = await tx.SalesDeliveryItems.update({
            where: {
                id: parseInt(item.id)
            },
            data: {
                quotationId: parseInt(quotationId),
                saleOrderItemId: item["saleOrderItemId"] ? parseInt(item["saleOrderItemId"]) : null,
                itemId: item["itemId"] ? parseInt(item["itemId"]) : undefined,
                sizeId: item["sizeId"] ? parseInt(item["sizeId"]) : undefined,
                colorId: item["colorId"] ? parseInt(item["colorId"]) : undefined,
                uomId: item["uomId"] ? parseInt(item["uomId"]) : undefined,
                hsnId: item["hsnId"] ? parseInt(item["hsnId"]) : 0,
                qty: item["qty"] ? item["qty"] : 0,
                price: item["price"] ? item["price"] : 0,




            }
        })





    }


    else {
        let data = await tx.SalesDeliveryItems.create({
            data: {
                quotationId: parseInt(quotationId),
                saleOrderItemId: item["saleOrderItemId"] ? parseInt(item["saleOrderItemId"]) : null,
                itemId: item["itemId"] ? parseInt(item["itemId"]) : undefined,
                sizeId: item["sizeId"] ? parseInt(item["sizeId"]) : undefined,
                colorId: item["colorId"] ? parseInt(item["colorId"]) : undefined,
                uomId: item["uomId"] ? parseInt(item["uomId"]) : undefined,
                hsnId: item["hsnId"] ? parseInt(item["hsnId"]) : 0,
                qty: item["qty"] ? item["qty"] : 0,
                price: item["price"] ? item["price"] : 0,
            }
        })


    }
}

async function updateAllPInwardReturnItems(tx, directInwardReturnItems, directInwardOrReturnId, poType, poInwardOrDirectInward, storeId, branchId) {
    let promises = directInwardReturnItems?.map(async (item) => await updateOrCreate(tx, item, directInwardOrReturnId, poType, poInwardOrDirectInward, storeId, branchId))
    return Promise.all(promises)
}

async function update(id, body) {
    const {
        customerId,
        discountType,
        discountValue,
        deliveryItems,
        branchId,
        storeId,
        saleOrderId,
        packingChargeEnabled,
        packingCharge,
        shippingChargeEnabled,
        shippingCharge,
    } = await body

    // Validation removed as per user request


    const dataFound = await prisma.SalesDelivery.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            SalesDeliveryItems: true,
            FulfillmentAllocations: true,
        }
    })
    if (!dataFound) return NoRecordFound("Sale Order");

    let oldItemIds = dataFound?.SalesDeliveryItems.map(item => parseInt(item.id))
    let currentItemIds = deliveryItems.filter(i => i?.id)?.map(item => parseInt(item.id))
    let removedItemIds = oldItemIds.filter(id => !currentItemIds.includes(id));

    let salesDeliveryData;

    try {
        await prisma.$transaction(async (tx) => {
            // Transactional validation removed as per user request


            // Delete removed items
            if (removedItemIds.length > 0) {
                await tx.salesDeliveryItems.deleteMany({
                    where: {
                        id: { in: removedItemIds }
                    }
                });
            }

            await tx.salesDeliveryFulfillmentAllocation.deleteMany({
                where: {
                    salesDeliveryId: parseInt(id)
                }
            });

            await tx.stock.deleteMany({
                where: {
                    transactionId: parseInt(id),
                    inOrOut: "SalesDelivery"
                }
            });

            // Retail Stock Validation
            const retailStore = await tx.location.findFirst({
                where: { storeName: "RETAIL" }
            });

            if (retailStore) {
                for (const item of (deliveryItems || []).filter(i => i.itemId && parseAmount(i.qty) > 0)) {
                    const stockRows = await tx.stock.findMany({
                        where: {
                            itemId: parseInt(item.itemId),
                            sizeId: item.sizeId ? parseInt(item.sizeId) : null,
                            colorId: item.colorId ? parseInt(item.colorId) : null,
                            storeId: retailStore.id,
                            branchId: branchId ? parseInt(branchId) : undefined,
                        }
                    });

                    const availableQty = stockRows.reduce((acc, curr) => acc + parseAmount(curr.qty), 0);
                    const requestedQty = parseAmount(item.qty);

                    if (requestedQty > availableQty + 0.0001) {
                        const itemData = await tx.item.findUnique({ where: { id: parseInt(item.itemId) }, select: { name: true } });
                        const colorData = item.colorId ? await tx.color.findUnique({ where: { id: parseInt(item.colorId) }, select: { name: true } }) : null;
                        const sizeData = item.sizeId ? await tx.size.findUnique({ where: { id: parseInt(item.sizeId) }, select: { name: true } }) : null;

                        const itemName = itemData?.name || "Item";
                        const colorName = colorData?.name || "";
                        const sizeName = sizeData?.name || "";

                        throw new Error(`Item ${itemName} ${colorName} ${sizeName} ku retail stock ${availableQty.toFixed(3)} thaan irukku.`);
                    }
                }
            }

            // Update main record
            salesDeliveryData = await tx.SalesDelivery.update({
                where: {
                    id: parseInt(id)
                },
                data: {
                    customerId: customerId ? parseInt(customerId) : undefined,

                    branchId: branchId ? parseInt(branchId) : undefined,
                    saleOrderId: saleOrderId ? parseInt(saleOrderId) : dataFound?.saleOrderId,
                    packingChargeEnabled: Boolean(packingChargeEnabled),
                    packingCharge: packingChargeEnabled ? String(packingCharge || 0) : null,
                    shippingChargeEnabled: Boolean(shippingChargeEnabled),
                    shippingCharge: shippingChargeEnabled ? String(shippingCharge || 0) : null,
                },
            })

            const persistedDeliveryItems = [];

            for (const item of (deliveryItems || []).filter(i => i.itemId)) {
                if (item.id) {
                    const savedItem = await tx.salesDeliveryItems.update({
                        where: { id: parseInt(item.id) },
                        data: {
                            saleOrderItemId: item.saleOrderItemId ? parseInt(item.saleOrderItemId) : null,
                            itemId: item.itemId ? parseInt(item.itemId) : null,
                            sizeId: item.sizeId ? parseInt(item.sizeId) : null,
                            colorId: item.colorId ? parseInt(item.colorId) : null,
                            uomId: item.uomId ? parseInt(item.uomId) : null,
                            hsnId: item.hsnId ? parseInt(item.hsnId) : null,
                            qty: item.qty ? item.qty.toString() : "0",
                            price: item.price ? item.price.toString() : "0",
                            discountType: item.discountType || null,
                            discountValue: item.discountValue || null,
                            taxPercent: item.taxPercent || null,
                            taxMethod: item.taxMethod || null,
                            priceType: item.priceType || null,
                        }
                    });
                    persistedDeliveryItems.push({
                        ...savedItem,
                        barcode: item?.barcode || null,
                        fulfillmentAllocations: item?.fulfillmentAllocations || item?.allocations || [],
                    });
                } else {
                    const savedItem = await tx.salesDeliveryItems.create({
                        data: {
                            salesDeliveryId: salesDeliveryData.id,
                            saleOrderItemId: item.saleOrderItemId ? parseInt(item.saleOrderItemId) : null,
                            itemId: item.itemId ? parseInt(item.itemId) : null,
                            sizeId: item.sizeId ? parseInt(item.sizeId) : null,
                            colorId: item.colorId ? parseInt(item.colorId) : null,
                            uomId: item.uomId ? parseInt(item.uomId) : null,
                            hsnId: item.hsnId ? parseInt(item.hsnId) : null,
                            qty: item.qty ? item.qty.toString() : "0",
                            price: item.price ? item.price.toString() : "0",
                            discountType: item.discountType || null,
                            discountValue: item.discountValue || null,
                            taxPercent: item.taxPercent || null,
                            taxMethod: item.taxMethod || null,
                            priceType: item.priceType || null,
                        }
                    });
                    persistedDeliveryItems.push({
                        ...savedItem,
                        barcode: item?.barcode || null,
                        fulfillmentAllocations: item?.fulfillmentAllocations || item?.allocations || [],
                    });
                }
            }

            const allocations = persistedDeliveryItems.map((item) => ({
                salesDeliveryId: parseInt(id),
                salesDeliveryItemId: item.id,
                saleOrderItemId: item.saleOrderItemId,
                itemId: item.itemId,
                sizeId: item.sizeId,
                colorId: item.colorId,
                uomId: item.uomId,
                storeId: retailStore?.id || 9,
                branchId: branchId ? parseInt(branchId) : null,
                barcode: item.barcode || null,
                allocatedQty: parseAmount(item.qty),
            }));

            if (allocations.length > 0) {
                await tx.salesDeliveryFulfillmentAllocation.createMany({
                    data: allocations.map((allocation) => ({
                        salesDeliveryId: parseInt(id),
                        salesDeliveryItemId: allocation.salesDeliveryItemId,
                        saleOrderItemId: allocation.saleOrderItemId,
                        itemId: allocation.itemId,
                        sizeId: allocation.sizeId,
                        colorId: allocation.colorId,
                        uomId: allocation.uomId,
                        storeId: allocation.storeId,
                        branchId: allocation.branchId,
                        barcode: allocation.barcode,
                        allocatedQty: allocation.allocatedQty,
                    }))
                });

                await tx.stock.createMany({
                    data: buildStockOutEntries(allocations, {
                        transactionId: id,
                        inOrOut: "SalesDelivery",
                    })
                });
            }
        });
        return { statusCode: 0, data: salesDeliveryData };
    } catch (error) {
        return {
            statusCode: 1,
            message: error.message || "Failed to update sales delivery.",
            data: error?.fulfillmentResolution ? { fulfillmentResolution: error.fulfillmentResolution } : undefined,
        };
    }
}

async function remove(id) {
    let data;
    await prisma.$transaction(async (tx) => {
        await tx.salesDeliveryFulfillmentAllocation.deleteMany({
            where: {
                salesDeliveryId: parseInt(id)
            }
        });
        await tx.stock.deleteMany({
            where: {
                transactionId: parseInt(id),
                inOrOut: "SalesDelivery"
            }
        });
        data = await tx.SalesDelivery.delete({
            where: {
                id: parseInt(id)
            },
        });
    });
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
