import { NoRecordFound } from '../configs/Responses.js';
import { prisma } from '../lib/prisma.js';
import { getDateTimeRangeForCurrentYear, getYearShortCode } from '../utils/helper.js';
import { getTableRecordWithId } from '../utils/helperQueries.js';

async function getNextDocId(branchId) {
    const { startTime, endTime } = getDateTimeRangeForCurrentYear(new Date());
    let lastObject = await prisma.salesReturn.findFirst({
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
            id: 'desc',
        },
    });
    const branchObj = await getTableRecordWithId(branchId, "branch");
    let newDocId = `${branchObj.branchCode}/${getYearShortCode(new Date())}/SR/1`;

    if (lastObject) {
        newDocId = `${branchObj.branchCode}/${getYearShortCode(new Date())}/SR/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`;
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
        where: {
            id: parseInt(id),
        },
        include: {
            SalesReturnItems: true,
            SalesDelivery: {
                select: {
                    id: true,
                    docId: true,
                },
            },
        },
    });

    if (!data) return NoRecordFound("Sales Return");

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

function mapSalesReturnItem(item = {}) {
    return {
        itemId: item.itemId ? parseInt(item.itemId) : null,
        sizeId: item.sizeId ? parseInt(item.sizeId) : null,
        colorId: item.colorId ? parseInt(item.colorId) : null,
        uomId: item.uomId ? parseInt(item.uomId) : null,
        hsnId: item.hsnId ? parseInt(item.hsnId) : null,
        qty: item.qty ? item.qty.toString() : "0",
        price: item.price ? item.price.toString() : "0",
        discountType: item.discountType || "",
        discountValue: item.discountValue ? item.discountValue.toString() : "",
        taxMethod: item.taxMethod || "",
        taxType: item.taxType || item.tax || "",
    };
}

async function create(body) {
    const {
        customerId,
        deliveryItems,
        branchId,
        salesDeliveryId,
        packingChargeEnabled,
        packingCharge,
        shippingChargeEnabled,
        shippingCharge,
    } = await body;

    const docId = await getNextDocId(branchId);

    const data = await prisma.salesReturn.create({
        data: {
            docId,
            customerId: customerId ? parseInt(customerId) : undefined,
            branchId: branchId ? parseInt(branchId) : undefined,
            salesDeliveryId: salesDeliveryId ? parseInt(salesDeliveryId) : undefined,
            packingChargeEnabled: Boolean(packingChargeEnabled),
            packingCharge: packingChargeEnabled ? String(packingCharge || 0) : null,
            shippingChargeEnabled: Boolean(shippingChargeEnabled),
            shippingCharge: shippingChargeEnabled ? String(shippingCharge || 0) : null,
            SalesReturnItems: {
                createMany: deliveryItems?.length > 0
                    ? {
                        data: deliveryItems.filter((item) => item?.itemId).map(mapSalesReturnItem),
                    }
                    : undefined,
            },
        },
    });

    return { statusCode: 0, data };
}

async function update(id, body) {
    const {
        customerId,
        deliveryItems,
        branchId,
        salesDeliveryId,
        packingChargeEnabled,
        packingCharge,
        shippingChargeEnabled,
        shippingCharge,
    } = await body;

    const dataFound = await prisma.salesReturn.findUnique({
        where: {
            id: parseInt(id),
        },
        include: {
            SalesReturnItems: true,
        },
    });

    if (!dataFound) return NoRecordFound("Sales Return");

    const oldItemIds = dataFound.SalesReturnItems.map((item) => parseInt(item.id));
    const currentItemIds = (deliveryItems || []).filter((item) => item?.id).map((item) => parseInt(item.id));
    const removedItemIds = oldItemIds.filter((itemId) => !currentItemIds.includes(itemId));

    let salesReturnData;

    await prisma.$transaction(async (tx) => {
        if (removedItemIds.length > 0) {
            await tx.salesReturnItems.deleteMany({
                where: {
                    id: { in: removedItemIds },
                },
            });
        }

        salesReturnData = await tx.salesReturn.update({
            where: {
                id: parseInt(id),
            },
            data: {
                customerId: customerId ? parseInt(customerId) : undefined,
                branchId: branchId ? parseInt(branchId) : undefined,
                salesDeliveryId: salesDeliveryId ? parseInt(salesDeliveryId) : undefined,
                packingChargeEnabled: Boolean(packingChargeEnabled),
                packingCharge: packingChargeEnabled ? String(packingCharge || 0) : null,
                shippingChargeEnabled: Boolean(shippingChargeEnabled),
                shippingCharge: shippingChargeEnabled ? String(shippingCharge || 0) : null,
            },
        });

        for (const item of (deliveryItems || []).filter((entry) => entry?.itemId)) {
            if (item.id) {
                await tx.salesReturnItems.update({
                    where: {
                        id: parseInt(item.id),
                    },
                    data: mapSalesReturnItem(item),
                });
            } else {
                await tx.salesReturnItems.create({
                    data: {
                        salesReturnId: salesReturnData.id,
                        ...mapSalesReturnItem(item),
                    },
                });
            }
        }
    });

    return { statusCode: 0, data: salesReturnData };
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
