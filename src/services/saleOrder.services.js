import { NoRecordFound } from '../configs/Responses.js';
import { prisma } from '../lib/prisma.js';
import { getFinYearStartTimeEndTime } from '../utils/finYearHelper.js';
import { getYearShortCodeForFinYear } from '../utils/helper.js';
import { getTableRecordWithId } from '../utils/helperQueries.js';




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
                    name: true
                }
            },
            // Quotation: {
            //     select: {
            //         docId: true
            //     }
            // }
        }
    });
    return { statusCode: 0, data };
}

async function getOne(id) {
    const data = await prisma.saleorder.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            SaleOrderItems: true
        }
    })
    if (!data) return NoRecordFound("Sale Order");
    return { statusCode: 0, data };
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
    const { customerId, discountType, discountValue, saleOrderItems, finYearId, branchId, convertQuotationId } = await body

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
                quotationId: convertQuotationId ? parseInt(convertQuotationId) : undefined,
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
    const { customerId, discountType, discountValue, saleOrderItems, branchId } = await body

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
