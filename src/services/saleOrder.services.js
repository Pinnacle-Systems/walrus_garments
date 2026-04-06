import { NoRecordFound } from '../configs/Responses.js';
import { prisma } from '../lib/prisma.js';
import { getFinYearStartTimeEndTime } from '../utils/finYearHelper.js';
import { getYearShortCodeForFinYear } from '../utils/helper.js';
import { getTableRecordWithId } from '../utils/helperQueries.js';

function parseQty(value) {
    const parsed = parseFloat(value || 0);
    return Number.isFinite(parsed) ? parsed : 0;
}

function isSameSourceLine(saleOrderItem, deliveryItem) {
    return String(saleOrderItem?.itemId || "") === String(deliveryItem?.itemId || "")
        && String(saleOrderItem?.sizeId || "") === String(deliveryItem?.sizeId || "")
        && String(saleOrderItem?.colorId || "") === String(deliveryItem?.colorId || "")
        && String(saleOrderItem?.uomId || "") === String(deliveryItem?.uomId || "")
        && String(saleOrderItem?.hsnId || "") === String(deliveryItem?.hsnId || "");
}

function resolveSaleOrderItemId(deliveryItem, saleOrderItems = []) {
    if (deliveryItem?.saleOrderItemId) {
        return parseInt(deliveryItem.saleOrderItemId);
    }

    const matchedItem = saleOrderItems.find((saleOrderItem) => isSameSourceLine(saleOrderItem, deliveryItem));
    return matchedItem?.id ? parseInt(matchedItem.id) : null;
}

function buildRemainingSaleOrderItems(saleOrderItems = [], salesDeliveries = [], excludeSalesDeliveryId = null) {
    const deliveredQtyBySaleOrderItemId = new Map();

    for (const salesDelivery of salesDeliveries || []) {
        if (excludeSalesDeliveryId && parseInt(salesDelivery?.id) === parseInt(excludeSalesDeliveryId)) {
            continue;
        }

        for (const deliveryItem of salesDelivery?.SalesDeliveryItems || []) {
            const saleOrderItemId = resolveSaleOrderItemId(deliveryItem, saleOrderItems);
            if (!saleOrderItemId) continue;

            deliveredQtyBySaleOrderItemId.set(
                saleOrderItemId,
                (deliveredQtyBySaleOrderItemId.get(saleOrderItemId) || 0) + parseQty(deliveryItem?.qty)
            );
        }
    }

    return (saleOrderItems || [])
        .map((saleOrderItem) => {
            const orderedQty = parseQty(saleOrderItem?.qty);
            const deliveredQty = deliveredQtyBySaleOrderItemId.get(parseInt(saleOrderItem.id)) || 0;
            const remainingQty = Math.max(0, orderedQty - deliveredQty);

            return {
                ...saleOrderItem,
                saleOrderItemId: saleOrderItem?.id,
                orderedQty: orderedQty.toFixed(3),
                deliveredQty: deliveredQty.toFixed(3),
                remainingQty: remainingQty.toFixed(3),
                qty: remainingQty.toFixed(3),
            };
        })
        .filter((saleOrderItem) => parseQty(saleOrderItem?.remainingQty) > 0);
}

function getTotalReceivedAmountForSaleOrder(saleOrder) {
    return ((saleOrder?.Quotation?.paymentData || []).reduce(
        (acc, curr) => acc + parseFloat(curr?.paidAmount || 0),
        0
    ) || 0);
}

function calculateDeliveryNetAmount(deliveryItems = [], { packingChargeEnabled, packingCharge, shippingChargeEnabled, shippingCharge } = {}) {
    const lineNetAmount = (deliveryItems || []).reduce((acc, curr) => {
        const price = parseFloat(curr?.price || 0) || 0;
        const qty = parseFloat(curr?.qty || 0) || 0;
        const taxPercent = parseFloat(curr?.taxPercent || 0) || 0;
        const taxMethod = curr?.taxMethod || "Inclusive";
        const discountType = curr?.discountType;
        const discountValue = parseFloat(curr?.discountValue || 0) || 0;

        const gross = price * qty;
        let discountedAmount = gross;

        if (discountType === "Percentage") {
            discountedAmount = gross - (gross * discountValue) / 100;
        } else if (discountType === "Flat") {
            discountedAmount = gross - discountValue;
        }

        discountedAmount = Math.max(0, discountedAmount);

        if (taxMethod === "Inclusive" && taxPercent > 0) {
            return acc + discountedAmount;
        }

        return acc + discountedAmount + (discountedAmount * taxPercent) / 100;
    }, 0);

    const packingAmount = packingChargeEnabled ? (parseFloat(packingCharge || 0) || 0) : 0;
    const shippingAmount = shippingChargeEnabled ? (parseFloat(shippingCharge || 0) || 0) : 0;

    return lineNetAmount + packingAmount + shippingAmount;
}

function getRemainingPaymentCapacityForSaleOrder(saleOrder) {
    const totalReceivedAmount = getTotalReceivedAmountForSaleOrder(saleOrder);
    const consumedAmount = (saleOrder?.SalesDelivery || []).reduce((acc, salesDelivery) => (
        acc + calculateDeliveryNetAmount(salesDelivery?.SalesDeliveryItems, salesDelivery)
    ), 0);

    return Math.max(0, totalReceivedAmount - consumedAmount);
}



async function getNextDocId(branchId, shortCode, startTime, endTime) {


    let lastObject = await prisma.saleorder.findFirst({
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
    let newDocId = `${branchObj.branchCode}/${shortCode}/SO/1`
    if (lastObject) {
        newDocId = `${branchObj.branchCode}/${shortCode}/SO/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
    }
    return newDocId
}

async function get(req) {
    const { companyId, active } = req.query
    let data = await prisma.saleorder.findMany({
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
            SaleOrderItems: {
                select: {
                    id: true,
                    itemId: true,
                    sizeId: true,
                    colorId: true,
                    uomId: true,
                    hsnId: true,
                    qty: true,
                }
            },
            SalesDelivery: {
                select: {
                    id: true,
                    docId: true,
                    SalesDeliveryItems: {
                        select: {
                            saleOrderItemId: true,
                            itemId: true,
                            sizeId: true,
                            colorId: true,
                            uomId: true,
                            hsnId: true,
                            qty: true,
                        }
                    }
                }
            },
            _count: {
                select: {
                    SalesDelivery: true,
                }
            }

        },
        orderBy: {
            id: "desc"
        }
    });

    const enrichedData = data.map((saleOrder) => {
        const remainingSaleOrderItems = buildRemainingSaleOrderItems(
            saleOrder?.SaleOrderItems,
            saleOrder?.SalesDelivery
        );
        const hasSalesDeliveries = (saleOrder?.SalesDelivery || []).length > 0;
        const deliveryStatus = remainingSaleOrderItems.length === 0
            ? (hasSalesDeliveries ? "complete" : "pending")
            : (hasSalesDeliveries ? "partial" : "pending");

        return {
            ...saleOrder,
            remainingSaleOrderItems,
            canConvertToDelivery: remainingSaleOrderItems.length > 0,
            deliveryStatus,
        };
    });

    return { statusCode: 0, data: enrichedData };
}

async function getOne(id) {
    const data = await prisma.saleorder.findUnique({
        where: {
            id: parseInt(id)
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
                    docId: true,
                    id: true,
                }
            }
        }
    })
    if (!data) return NoRecordFound("Sale Order");

    let quotationWithPayments = data?.Quotation;
    if (data?.Quotation?.id) {
        const paymentData = await prisma.payment.findMany({
            where: {
                transactionType: "QUOTATION",
                transactionId: data.Quotation.id,
            },
        });

        quotationWithPayments = {
            ...data.Quotation,
            paymentData,
        };
    }

    const remainingSaleOrderItems = buildRemainingSaleOrderItems(
        data?.SaleOrderItems,
        data?.SalesDelivery
    );
    const totalReceivedAmount = getTotalReceivedAmountForSaleOrder({ ...data, Quotation: quotationWithPayments });
    const remainingPaymentCapacity = getRemainingPaymentCapacityForSaleOrder({ ...data, Quotation: quotationWithPayments });

    return {
        statusCode: 0,
        data: {
            ...data,
            Quotation: quotationWithPayments,
            remainingSaleOrderItems,
            totalReceivedAmount,
            remainingPaymentCapacity,
            canConvertToDelivery: remainingSaleOrderItems.length > 0,
        }
    };
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
        saleOrderItems,
        finYearId,
        branchId,
        quoteId,
        packingChargeEnabled,
        packingCharge,
        shippingChargeEnabled,
        shippingCharge,
    } = await body

    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startDateStartTime, finYearDate?.endDateEndTime) : "";
    let docId = await getNextDocId(branchId, shortCode, finYearDate?.startDateStartTime, finYearDate?.endDateEndTime);

    const data = await prisma.saleorder.create(
        {
            data: {
                customerId: customerId ? parseInt(customerId) : undefined,
                discountType: discountType || "",
                discountValue: discountValue || "",
                branchId: branchId ? parseInt(branchId) : undefined,
                quotationId: quoteId ? parseInt(quoteId) : undefined,
                packingChargeEnabled: Boolean(packingChargeEnabled),
                packingCharge: packingChargeEnabled ? String(packingCharge || 0) : null,
                shippingChargeEnabled: Boolean(shippingChargeEnabled),
                shippingCharge: shippingChargeEnabled ? String(shippingCharge || 0) : null,
                docId: docId,
                SaleOrderItems: {
                    createMany: saleOrderItems?.length > 0 ? {
                        data: saleOrderItems?.filter(temp => temp.itemId).map((temp) => {
                            let newItem = {}
                            newItem["itemId"] = temp["itemId"] ? parseInt(temp["itemId"]) : null;
                            newItem["sizeId"] = temp["sizeId"] ? parseInt(temp["sizeId"]) : null;
                            newItem["colorId"] = temp["colorId"] ? parseInt(temp["colorId"]) : null;
                            newItem["uomId"] = temp["uomId"] ? parseInt(temp["uomId"]) : null;
                            newItem["hsnId"] = temp["hsnId"] ? parseInt(temp["hsnId"]) : null;
                            newItem["qty"] = temp["qty"] ? temp["qty"].toString() : "0";
                            newItem["price"] = temp["price"] ? temp["price"].toString() : "0";

                            newItem["discountType"] = temp["discountType"];
                            newItem["discountValue"] = temp["discountValue"] || "";
                            newItem["taxPercent"] = temp["taxPercent"];

                            return newItem
                        })
                    } : undefined
                }
            }
        }
    )
    return { statusCode: 0, data };
}

async function update(id, body) {
    const {
        customerId,
        discountType,
        discountValue,
        saleOrderItems,
        branchId,
        packingChargeEnabled,
        packingCharge,
        shippingChargeEnabled,
        shippingCharge,
    } = await body

    const dataFound = await prisma.saleorder.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            SaleOrderItems: true
        }
    })
    if (!dataFound) return NoRecordFound("Sale Order");

    let oldItemIds = dataFound?.SaleOrderItems.map(item => parseInt(item.id))
    let currentItemIds = saleOrderItems.filter(i => i?.id)?.map(item => parseInt(item.id))
    let removedItemIds = oldItemIds.filter(id => !currentItemIds.includes(id));

    let piData;

    await prisma.$transaction(async (tx) => {
        // Delete removed items
        if (removedItemIds.length > 0) {
            await tx.saleOrderItems.deleteMany({
                where: {
                    id: { in: removedItemIds }
                }
            });
        }

        // Update main record
        piData = await tx.saleorder.update({
            where: {
                id: parseInt(id)
            },
            data: {
                customerId: customerId ? parseInt(customerId) : undefined,
                discountType: discountType || "",
                discountValue: discountValue || "",
                branchId: branchId ? parseInt(branchId) : undefined,
                packingChargeEnabled: Boolean(packingChargeEnabled),
                packingCharge: packingChargeEnabled ? String(packingCharge || 0) : null,
                shippingChargeEnabled: Boolean(shippingChargeEnabled),
                shippingCharge: shippingChargeEnabled ? String(shippingCharge || 0) : null,
            },
        })

        // Process items (Update or Create)
        for (const item of (saleOrderItems || []).filter(i => i.itemId)) {
            if (item.id) {
                await tx.saleOrderItems.update({
                    where: { id: parseInt(item.id) },
                    data: {
                        itemId: item.itemId ? parseInt(item.itemId) : null,
                        sizeId: item.sizeId ? parseInt(item.sizeId) : null,
                        colorId: item.colorId ? parseInt(item.colorId) : null,
                        uomId: item.uomId ? parseInt(item.uomId) : null,
                        hsnId: item.hsnId ? parseInt(item.hsnId) : null,
                        qty: item.qty ? item.qty.toString() : "0",
                        price: item.price ? item.price.toString() : "0",

                        discountType: item["discountType"] ? item["discountType"] : "",
                        discountValue: item["discountValue"] ? item["discountValue"] : "",
                        taxPercent: item["taxPercent"] ? item["taxPercent"] : "",
                    }
                });
            } else {
                await tx.saleOrderItems.create({
                    data: {
                        saleOrderId: piData.id,
                        itemId: item.itemId ? parseInt(item.itemId) : null,
                        sizeId: item.sizeId ? parseInt(item.sizeId) : null,
                        colorId: item.colorId ? parseInt(item.colorId) : null,
                        uomId: item.uomId ? parseInt(item.uomId) : null,
                        hsnId: item.hsnId ? parseInt(item.hsnId) : null,
                        qty: item.qty ? item.qty.toString() : "0",
                        price: item.price ? item.price.toString() : "0",

                        discountType: item["discountType"] ? item["discountType"] : "",
                        discountValue: item["discountValue"] ? item["discountValue"] : "",
                        taxPercent: item["taxPercent"] ? item["taxPercent"] : "",
                    }
                });
            }
        }
    })
    return { statusCode: 0, data: piData };
}

async function remove(id) {
    const data = await prisma.saleorder.delete({
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
