import { NoRecordFound } from '../configs/Responses.js';
import { prisma } from '../lib/prisma.js';
import { getFinYearStartTimeEndTime } from '../utils/finYearHelper.js';
import { getYearShortCodeForFinYear } from '../utils/helper.js';
import { getTableRecordWithId } from '../utils/helperQueries.js';

function parseAmount(value) {
    const parsed = parseFloat(value || 0);
    return Number.isFinite(parsed) ? parsed : 0;
}

function calculateDeliveryNetAmount(deliveryItems = [], { packingChargeEnabled, packingCharge, shippingChargeEnabled, shippingCharge }) {
    const lineNetAmount = (deliveryItems || []).reduce((acc, curr) => {
        const price = parseAmount(curr?.price);
        const qty = parseAmount(curr?.qty);
        const taxPercent = parseAmount(curr?.taxPercent);
        const taxMethod = curr?.taxMethod || "Inclusive";
        const discountType = curr?.discountType;
        const discountValue = parseAmount(curr?.discountValue);

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

    const packingAmount = packingChargeEnabled ? parseAmount(packingCharge) : 0;
    const shippingAmount = shippingChargeEnabled ? parseAmount(shippingCharge) : 0;

    return lineNetAmount + packingAmount + shippingAmount;
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

function getRemainingQtyBySaleOrderItemId(saleOrder, excludeSalesDeliveryId = null) {
    const saleOrderItems = saleOrder?.SaleOrderItems || [];
    const deliveredQtyBySaleOrderItemId = new Map();

    for (const salesDelivery of saleOrder?.SalesDelivery || []) {
        if (excludeSalesDeliveryId && parseInt(salesDelivery?.id) === parseInt(excludeSalesDeliveryId)) {
            continue;
        }

        for (const deliveryItem of salesDelivery?.SalesDeliveryItems || []) {
            const saleOrderItemId = resolveSaleOrderItemId(deliveryItem, saleOrderItems);
            if (!saleOrderItemId) continue;

            deliveredQtyBySaleOrderItemId.set(
                saleOrderItemId,
                (deliveredQtyBySaleOrderItemId.get(saleOrderItemId) || 0) + parseAmount(deliveryItem?.qty)
            );
        }
    }

    const remainingQtyBySaleOrderItemId = new Map();

    for (const saleOrderItem of saleOrderItems) {
        const orderedQty = parseAmount(saleOrderItem?.qty);
        const deliveredQty = deliveredQtyBySaleOrderItemId.get(parseInt(saleOrderItem.id)) || 0;
        remainingQtyBySaleOrderItemId.set(
            parseInt(saleOrderItem.id),
            Math.max(0, orderedQty - deliveredQty)
        );
    }

    return remainingQtyBySaleOrderItemId;
}

async function getSaleOrderValidationState(saleOrderId, excludeSalesDeliveryId = null) {
    if (!saleOrderId) return null;

    const saleOrder = await prisma.saleorder.findUnique({
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
        ? await prisma.payment.findMany({
            where: {
                transactionType: "QUOTATION",
                transactionId: saleOrder.Quotation.id,
            },
        })
        : [];

    return {
        saleOrder,
        remainingQtyBySaleOrderItemId: getRemainingQtyBySaleOrderItemId(saleOrder, excludeSalesDeliveryId),
        totalReceivedAmount: quotationPaymentData.reduce(
            (acc, curr) => acc + parseAmount(curr?.paidAmount),
            0
        ),
    };
}

function validateConvertedDelivery({ saleOrderValidationState, deliveryItems, packingChargeEnabled, packingCharge, shippingChargeEnabled, shippingCharge }) {
    if (!saleOrderValidationState) return null;

    const deliveryNetAmount = calculateDeliveryNetAmount(deliveryItems, {
        packingChargeEnabled,
        packingCharge,
        shippingChargeEnabled,
        shippingCharge,
    });

    if (saleOrderValidationState.totalReceivedAmount < deliveryNetAmount) {
        return `Payment received is insufficient for this delivery. Required ${deliveryNetAmount.toFixed(2)}, received ${saleOrderValidationState.totalReceivedAmount.toFixed(2)}.`;
    }

    for (const deliveryItem of (deliveryItems || []).filter((item) => item?.itemId)) {
        const saleOrderItemId = resolveSaleOrderItemId(deliveryItem, saleOrderValidationState.saleOrder?.SaleOrderItems);
        if (!saleOrderItemId) {
            return "Each converted delivery line must be tied to a sale order line.";
        }

        const remainingQty = saleOrderValidationState.remainingQtyBySaleOrderItemId.get(parseInt(saleOrderItemId)) || 0;
        const requestedQty = parseAmount(deliveryItem?.qty);

        if (requestedQty > remainingQty + 0.0001) {
            return "One or more delivery quantities exceed the remaining sale order quantity.";
        }
    }

    return null;
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
            // _count: {
            //     select: {
            //         SalesInvoice: true,
            //     }
            // }
        }
    });



    return { statusCode: 0, data };
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.SalesDelivery.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            SalesDeliveryItems: true,
            Saleorder: {
                select: {
                    id: true,
                    docId: true,
                    date: true,
                    createdAt: true,
                }
            }
        }
    })
    if (!data) return NoRecordFound("size");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
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
        saleOrderId,
        packingChargeEnabled,
        packingCharge,
        shippingChargeEnabled,
        shippingCharge,
    } = await body

    const saleOrderValidationState = await getSaleOrderValidationState(saleOrderId);
    const validationMessage = validateConvertedDelivery({
        saleOrderValidationState,
        deliveryItems,
        packingChargeEnabled,
        packingCharge,
        shippingChargeEnabled,
        shippingCharge,
    });

    if (validationMessage) {
        return { statusCode: 1, message: validationMessage };
    }


    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startDateStartTime, finYearDate?.endDateEndTime) : "";
    let docId = await getNextDocId(branchId, shortCode, finYearDate?.startDateStartTime, finYearDate?.endDateEndTime);


    const data = await prisma.salesDelivery.create(
        {
            data: {
                customerId: customerId ? parseInt(customerId) : undefined,
                // discountType: discountType ? discountType : "",
                // discountValue: discountValue ? discountValue : "",
                branchId: branchId ? parseInt(branchId) : "",
                saleOrderId: saleOrderId ? parseInt(saleOrderId) : undefined,
                packingChargeEnabled: Boolean(packingChargeEnabled),
                packingCharge: packingChargeEnabled ? String(packingCharge || 0) : null,
                shippingChargeEnabled: Boolean(shippingChargeEnabled),
                shippingCharge: shippingChargeEnabled ? String(shippingCharge || 0) : null,
                docId: docId,
                SalesDeliveryItems: {
                    createMany: deliveryItems?.length > 0 ? {
                        data: deliveryItems?.map((temp) => {
                            let newItem = {}
                            newItem["saleOrderItemId"] = temp["saleOrderItemId"] ? parseInt(temp["saleOrderItemId"]) : null;
                            newItem["itemId"] = temp["itemId"] ? parseInt(temp["itemId"]) : null;
                            newItem["sizeId"] = temp["sizeId"] ? parseInt(temp["sizeId"]) : null;
                            newItem["colorId"] = temp["colorId"] ? parseInt(temp["colorId"]) : null;
                            newItem["uomId"] = temp["uomId"] ? parseInt(temp["uomId"]) : null;
                            newItem["hsnId"] = temp["hsnId"] ? parseInt(temp["hsnId"]) : null;
                            newItem["qty"] = temp["qty"] ? temp["qty"] : null;
                            newItem["price"] = temp["price"] ? temp["price"] : null;


                            return newItem
                        })
                    } : undefined
                }
            }
        }
    )
    return { statusCode: 0, data };
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
        saleOrderId,
        packingChargeEnabled,
        packingCharge,
        shippingChargeEnabled,
        shippingCharge,
    } = await body

    const saleOrderValidationState = await getSaleOrderValidationState(saleOrderId, id);
    const validationMessage = validateConvertedDelivery({
        saleOrderValidationState,
        deliveryItems,
        packingChargeEnabled,
        packingCharge,
        shippingChargeEnabled,
        shippingCharge,
    });

    if (validationMessage) {
        return { statusCode: 1, message: validationMessage };
    }

    const dataFound = await prisma.SalesDelivery.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            SalesDeliveryItems: true
        }
    })
    if (!dataFound) return NoRecordFound("Sale Order");

    let oldItemIds = dataFound?.SalesDeliveryItems.map(item => parseInt(item.id))
    let currentItemIds = deliveryItems.filter(i => i?.id)?.map(item => parseInt(item.id))
    let removedItemIds = oldItemIds.filter(id => !currentItemIds.includes(id));

    let salesDeliveryData;

    await prisma.$transaction(async (tx) => {
        // Delete removed items
        if (removedItemIds.length > 0) {
            await tx.salesDeliveryItems.deleteMany({
                where: {
                    id: { in: removedItemIds }
                }
            });
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

        for (const item of (deliveryItems || []).filter(i => i.itemId)) {
            if (item.id) {
                await tx.salesDeliveryItems.update({
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
                    }
                });
            } else {
                await tx.salesDeliveryItems.create({
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
                    }
                });
            }
        }
    })
    return { statusCode: 0, data: salesDeliveryData };
}

async function remove(id) {
    const data = await prisma.SalesDelivery.delete({
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
