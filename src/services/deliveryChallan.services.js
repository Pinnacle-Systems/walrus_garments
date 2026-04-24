import { NoRecordFound } from '../configs/Responses.js';
import { prisma } from '../lib/prisma.js';
import { getFinYearStartTimeEndTime } from '../utils/finYearHelper.js';
import { getYearShortCodeForFinYear } from '../utils/helper.js';
import { getTableRecordWithId } from '../utils/helperQueries.js';


async function getNextDocId(branchId, shortCode, startTime, endTime) {


    let lastObject = await prisma.deliveryChallan.findFirst({
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
    let newDocId = `${branchObj.branchCode}/${shortCode}/DC/1`
    if (lastObject) {
        newDocId = `${branchObj.branchCode}/${shortCode}/DC/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
    }
    return newDocId
}


async function get(req) {
    const { branchId, active } = req.query

    const data = await prisma.deliveryChallan.findMany({
        where: {
            branchId: branchId ? parseInt(branchId) : undefined,
        },
        include: {
            Branch: {
                select: {
                    branchName: true
                }
            },
            Party: {
                select: {
                    name: true,
                    aliasName: true
                }
            }
        },
        orderBy: {
            id: 'desc'
        }
    });

    return { statusCode: 0, data };
}

async function getOne(id) {
    const data = await prisma.deliveryChallan.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            DeliveryChallanItems: {
                include: {
                    Item: true,
                    Size: true,
                    Color: true,
                    UnitOfMeasurement: true,
                    Hsn: true
                }
            },
            Branch: true,
            Party: true
        }
    })
    if (!data) return NoRecordFound("Delivery Challan");
    return { statusCode: 0, data };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { branchId } = req.query
    const data = await prisma.deliveqryChallan.findMany({
        where: {
            branchId: branchId ? parseInt(branchId) : undefined,
            OR: [
                { docId: { contains: searchKey } },
                { description: { contains: searchKey } },
                { Party: { name: { contains: searchKey } } },
            ],
        }
    })
    return { statusCode: 0, data };
}

async function create(body) {
    const {
        finYearId, branchId, customerId, challanType, platForm, storeId, date, description,
        invoiceItems
    } = body

    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startDateStartTime, finYearDate?.endDateEndTime) : "";
    let docId = await getNextDocId(branchId, shortCode, finYearDate?.startDateStartTime, finYearDate?.endDateEndTime);


    const data = await prisma.$transaction(async (tx) => {
        const challan = await tx.deliveryChallan.create({
            data: {
                docId,
                branchId: branchId ? parseInt(branchId) : undefined,
                customerId: customerId ? parseInt(customerId) : undefined,
                challanType,
                platform: platForm ? String(platForm) : "",
                storeId: storeId ? parseInt(storeId) : undefined,
                date: date ? new Date(date) : new Date(),
                description,
            }
        });

        for (const item of invoiceItems) {
            const qtyValue = parseFloat(item.qty || 0);
            const priceValue = parseFloat(item.price || 0);

            // Determine stock quantity (negative for outward, positive for inward)
            const stockQty = challanType === "DcOutward" ? -qtyValue : qtyValue;

            const stockRecord = await tx.stock.create({
                data: {
                    inOrOut: challanType ? challanType : "",
                    itemId: item.itemId ? parseInt(item.itemId) : undefined,
                    sizeId: item.sizeId ? parseInt(item.sizeId) : undefined,
                    colorId: item.colorId ? parseInt(item.colorId) : undefined,
                    uomId: item.uomId ? parseInt(item.uomId) : undefined,
                    branchId: branchId ? parseInt(branchId) : undefined,
                    storeId: storeId ? parseInt(storeId) : undefined,
                    qty: stockQty,
                    price: priceValue,
                    // Use a placeholder or appropriate type if needed
                    // itemType: "Accessory", 
                }
            });

            await tx.deliveryChallanItems.create({
                data: {
                    deliveryChallanId: challan.id,
                    itemId: item.itemId ? parseInt(item.itemId) : undefined,
                    sizeId: item.sizeId ? parseInt(item.sizeId) : undefined,
                    colorId: item.colorId ? parseInt(item.colorId) : undefined,
                    uomId: item.uomId ? parseInt(item.uomId) : undefined,
                    hsnId: item.hsnId ? parseInt(item.hsnId) : undefined,
                    qty: String(item.qty),
                    price: String(item.price),
                    discountType: item.discountType,
                    discountValue: String(item.discountValue),
                    taxMethod: item.taxMethod,
                    taxType: item.taxType,
                    // stockId: stockRecord.id
                }
            });
        }

        return challan;
    });

    return { statusCode: 0, data };
}

async function update(id, body) {
    const {
        docId, branchId, customerId, challanType, platform, storeId, date, description,
        invoiceItems
    } = body

    const dataFound = await prisma.deliveryChallan.findUnique({
        where: { id: parseInt(id) },
        include: { DeliveryChallanItems: true }
    })
    if (!dataFound) return NoRecordFound("Delivery Challan");

    const data = await prisma.$transaction(async (tx) => {
        // 1. Update main record
        const updatedChallan = await tx.deliveryChallan.update({
            where: { id: parseInt(id) },
            data: {
                docId,
                branchId: branchId ? parseInt(branchId) : undefined,
                customerId: customerId ? parseInt(customerId) : undefined,
                challanType,
                platform,
                storeId: storeId ? parseInt(storeId) : undefined,
                date: date ? new Date(date) : new Date(),
                description,
                updatedAt: new Date(),
            }
        });

        // 2. Identify removed items and delete their stock records
        const currentItemIds = invoiceItems.filter(i => i.id).map(i => parseInt(i.id));
        const removedItems = dataFound.DeliveryChallanItems.filter(i => !currentItemIds.includes(i.id));

        for (const item of removedItems) {
            if (item.stockId) {
                await tx.stock.delete({ where: { id: item.stockId } });
            }
            await tx.deliveryChallanItems.delete({ where: { id: item.id } });
        }

        // 3. Update or Create items
        for (const item of invoiceItems) {
            const qtyValue = parseFloat(item.qty || 0);
            const priceValue = parseFloat(item.price || 0);
            const stockQty = challanType === "DcOutward" ? -qtyValue : qtyValue;

            if (item.id) {
                // Update existing item
                const existingItem = dataFound.DeliveryChallanItems.find(i => i.id === parseInt(item.id));
                if (existingItem?.stockId) {
                    await tx.stock.update({
                        where: { id: existingItem.stockId },
                        data: {
                            inOrOut: challanType,
                            itemId: item.itemId ? parseInt(item.itemId) : undefined,
                            sizeId: item.sizeId ? parseInt(item.sizeId) : undefined,
                            colorId: item.colorId ? parseInt(item.colorId) : undefined,
                            uomId: item.uomId ? parseInt(item.uomId) : undefined,
                            branchId: branchId ? parseInt(branchId) : undefined,
                            storeId: storeId ? parseInt(storeId) : undefined,
                            qty: stockQty,
                            price: priceValue,
                        }
                    });
                }
                await tx.deliveryChallanItems.update({
                    where: { id: parseInt(item.id) },
                    data: {
                        itemId: item.itemId ? parseInt(item.itemId) : undefined,
                        sizeId: item.sizeId ? parseInt(item.sizeId) : undefined,
                        colorId: item.colorId ? parseInt(item.colorId) : undefined,
                        uomId: item.uomId ? parseInt(item.uomId) : undefined,
                        hsnId: item.hsnId ? parseInt(item.hsnId) : undefined,
                        qty: String(item.qty),
                        price: String(item.price),
                        discountType: item.discountType,
                        discountValue: String(item.discountValue),
                        taxMethod: item.taxMethod,
                        taxType: item.taxType,
                    }
                });
            } else {
                // Create new item
                const stockRecord = await tx.stock.create({
                    data: {
                        inOrOut: challanType,
                        itemId: item.itemId ? parseInt(item.itemId) : undefined,
                        sizeId: item.sizeId ? parseInt(item.sizeId) : undefined,
                        colorId: item.colorId ? parseInt(item.colorId) : undefined,
                        uomId: item.uomId ? parseInt(item.uomId) : undefined,
                        branchId: branchId ? parseInt(branchId) : undefined,
                        storeId: storeId ? parseInt(storeId) : undefined,
                        qty: stockQty,
                        price: priceValue,
                    }
                });

                await tx.deliveryChallanItems.create({
                    data: {
                        deliveryChallanId: updatedChallan.id,
                        itemId: item.itemId ? parseInt(item.itemId) : undefined,
                        sizeId: item.sizeId ? parseInt(item.sizeId) : undefined,
                        colorId: item.colorId ? parseInt(item.colorId) : undefined,
                        uomId: item.uomId ? parseInt(item.uomId) : undefined,
                        hsnId: item.hsnId ? parseInt(item.hsnId) : undefined,
                        qty: String(item.qty),
                        price: String(item.price),
                        discountType: item.discountType,
                        discountValue: String(item.discountValue),
                        taxMethod: item.taxMethod,
                        taxType: item.taxType,
                        stockId: stockRecord.id
                    }
                });
            }
        }
        return updatedChallan;
    });

    return { statusCode: 0, data };
}

async function remove(id) {
    const dataFound = await prisma.deliveryChallan.findUnique({
        where: { id: parseInt(id) },
        include: { DeliveryChallanItems: true }
    });
    if (!dataFound) return NoRecordFound("Delivery Challan");

    const data = await prisma.$transaction(async (tx) => {
        for (const item of dataFound.DeliveryChallanItems) {
            if (item.stockId) {
                await tx.stock.delete({ where: { id: item.stockId } });
            }
        }
        return await tx.deliveryChallan.delete({
            where: { id: parseInt(id) },
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
