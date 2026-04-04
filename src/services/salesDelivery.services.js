import { NoRecordFound } from '../configs/Responses.js';
import { prisma } from '../lib/prisma.js';
import { getFinYearStartTimeEndTime } from '../utils/finYearHelper.js';
import { getYearShortCodeForFinYear } from '../utils/helper.js';
import { getTableRecordWithId } from '../utils/helperQueries.js';
import {
    buildFulfillmentAllocations,
    buildStockOutEntries,
    getRemainingPaymentCapacity,
    getRemainingQtyBySaleOrderItemId,
    validateConvertedDelivery,
    validateFulfillmentAllocations,
} from './salesDeliveryConversionRules.js';

function parseAmount(value) {
    const parsed = parseFloat(value || 0);
    return Number.isFinite(parsed) ? parsed : 0;
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
        remainingPaymentCapacity: getRemainingPaymentCapacity(
            quotationPaymentData.reduce((acc, curr) => acc + parseAmount(curr?.paidAmount), 0),
            saleOrder?.SalesDelivery,
            excludeSalesDeliveryId
        ),
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
            FulfillmentAllocations: true,
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
        storeId,
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


    try {
        let data;
        await prisma.$transaction(async (tx) => {
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
                                newItem["discountType"] = temp["discountType"] || null;
                                newItem["discountValue"] = temp["discountValue"] || null;
                                newItem["taxPercent"] = temp["taxPercent"] || null;
                                newItem["taxMethod"] = temp["taxMethod"] || null;
                                newItem["priceType"] = temp["priceType"] || null;
                                return newItem
                            })
                        } : undefined
                    }
                }
            });

            const savedDelivery = await tx.salesDelivery.findUnique({
                where: { id: parseInt(data.id) },
                include: {
                    SalesDeliveryItems: true,
                    Saleorder: {
                        include: {
                            SaleOrderItems: true,
                        }
                    }
                }
            });

            const allocations = buildFulfillmentAllocations(savedDelivery?.SalesDeliveryItems, {
                saleOrderItems: savedDelivery?.Saleorder?.SaleOrderItems,
                storeId: body?.storeId,
                branchId,
            });

            const allocationValidationMessage = await validateFulfillmentAllocations(tx, allocations);
            if (allocationValidationMessage) {
                throw new Error(allocationValidationMessage);
            }

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
        return { statusCode: 1, message: error.message || "Failed to save sales delivery." };
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
                        discountType: item.discountType || null,
                        discountValue: item.discountValue || null,
                        taxPercent: item.taxPercent || null,
                        taxMethod: item.taxMethod || null,
                        priceType: item.priceType || null,
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
                        discountType: item.discountType || null,
                        discountValue: item.discountValue || null,
                        taxPercent: item.taxPercent || null,
                        taxMethod: item.taxMethod || null,
                        priceType: item.priceType || null,
                    }
                });
            }
        }

        const savedDelivery = await tx.salesDelivery.findUnique({
            where: { id: parseInt(id) },
            include: {
                SalesDeliveryItems: true,
                Saleorder: {
                    include: {
                        SaleOrderItems: true,
                    }
                }
            }
        });

        const allocations = buildFulfillmentAllocations(savedDelivery?.SalesDeliveryItems, {
            saleOrderItems: savedDelivery?.Saleorder?.SaleOrderItems,
            storeId,
            branchId,
        });

        const allocationValidationMessage = await validateFulfillmentAllocations(tx, allocations);
        if (allocationValidationMessage) {
            throw new Error(allocationValidationMessage);
        }

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
        return { statusCode: 1, message: error.message || "Failed to update sales delivery." };
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
