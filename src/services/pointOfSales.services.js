import { NoRecordFound } from '../configs/Responses.js';
import { prisma } from '../lib/prisma.js';
import { getFinYearStartTimeEndTime } from '../utils/finYearHelper.js';
import { getRemovedItems, getYearShortCodeForFinYear } from '../utils/helper.js';
import { getTableRecordWithId } from '../utils/helperQueries.js';
import {
    buildStockOutEntries,
    extractResolvedAllocations,
    getHybridFulfillmentResolutionError,
    resolveHybridFulfillmentLines,
    validateFulfillmentAllocations,
} from './salesDeliveryConversionRules.js';




async function getNextDocId(branchId, shortCode, startTime, endTime) {


    let lastObject = await prisma.pos.findFirst({
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
    let newDocId = `${branchObj.branchCode}/${shortCode}/POS/1`
    if (lastObject) {
        newDocId = `${branchObj.branchCode}/${shortCode}/POS/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
    }
    return newDocId
}

async function get(req) {

    const { companyId, active } = req.query

    console.log(companyId, active, "companyId, active ")

    let data = await prisma.pos.findMany({
        where: {
            active: active ? Boolean(active) : undefined,
        },
        include: {
            Party: {
                select: {
                    name: true
                }
            }
        },
        orderBy: {
            id: "desc"
        }
    });



    return { statusCode: 0, data };
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.pos.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            PosItems: true
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
    try {
        const { customerId, posItems, finYearId, branchId, storeId } = await body;

        let finYearDate = await getFinYearStartTimeEndTime(finYearId);
        const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startDateStartTime, finYearDate?.endDateEndTime) : "";
        let docId = await getNextDocId(branchId, shortCode, finYearDate?.startDateStartTime, finYearDate?.endDateEndTime);

        const result = await prisma.$transaction(async (tx) => {

            // 1. Create the Main POS Record
            const posRecord = await tx.pos.create({
                data: {
                    customerId: customerId ? parseInt(customerId) : undefined,
                    docId: docId,
                    branchId: branchId ? parseInt(branchId) : undefined,
                    createdById: body.userId ? parseInt(body.userId) : undefined,
                    PosItems: {
                        createMany: {
                            data: (posItems || []).map((item) => ({
                                itemId: parseInt(item.itemId || item.id),
                                sizeId: item.sizeId ? parseInt(item.sizeId) : null,
                                colorId: item.colorId ? parseInt(item.colorId) : null,
                                uomId: item.uomId ? parseInt(item.uomId) : null,
                                qty: String(item.qty),
                                price: String(item.price),
                                salesPersonId: item.salesPersonId ? parseInt(item.salesPersonId) : undefined,
                            }))
                        }
                    }
                }
            });

            // 2. Resolve Fulfillment and Stock
            const posFulfillmentLines = (posItems || [])
                .filter((item) => item?.itemId || item?.id)
                .map((item, lineIndex) => ({
                    ...item,
                    lineIndex,
                    itemId: parseInt(item.itemId || item.id),
                    storeId: item.sourceStoreId ? parseInt(item.sourceStoreId) : parseInt(storeId),
                    fulfillmentAllocations: item?.fulfillmentAllocations || item?.allocations || [],
                    branchId: item.branchId ? parseInt(item.branchId) : parseInt(branchId),
                }));

            const resolution = await resolveHybridFulfillmentLines(tx, posFulfillmentLines, {
                branchId,
            });
            const resolutionError = getHybridFulfillmentResolutionError(resolution);
            if (resolutionError) {
                throw resolutionError;
            }

            const allocations = extractResolvedAllocations(resolution);
            const allocationValidationMessage = await validateFulfillmentAllocations(tx, allocations);
            if (allocationValidationMessage) {
                throw new Error(allocationValidationMessage);
            }

            const stockEntries = [];
            const retailStoreId = parseInt(storeId);

            for (const allocation of allocations) {
                const sourceStoreId = parseInt(allocation.storeId);
                const qty = parseFloat(allocation.allocatedQty);
                const itemLine = posFulfillmentLines[allocation.lineIndex];
                const price = parseFloat(itemLine?.price || 0);

                const baseEntry = {
                    itemId: allocation.itemId,
                    sizeId: allocation.sizeId,
                    colorId: allocation.colorId,
                    uomId: allocation.uomId,
                    branchId: allocation.branchId,
                    barcode: allocation.barcode,
                    transactionId: posRecord.id,
                    price: price,
                };

                if (sourceStoreId === retailStoreId) {
                    stockEntries.push({
                        ...baseEntry,
                        qty: -qty,
                        storeId: retailStoreId,
                        inOrOut: "POS",
                    });
                } else {
                    stockEntries.push({
                        ...baseEntry,
                        qty: -qty,
                        storeId: sourceStoreId,
                        inOrOut: "StockTransferOut",
                    });
                    stockEntries.push({
                        ...baseEntry,
                        qty: qty,
                        storeId: retailStoreId,
                        inOrOut: "StockTransferIn",
                    });
                    stockEntries.push({
                        ...baseEntry,
                        qty: -qty,
                        storeId: retailStoreId,
                        inOrOut: "POS",
                    });
                }
            }

            await tx.stock.createMany({
                data: stockEntries
            });

            return posRecord;
        });

        return { statusCode: 0, data: result };

    } catch (error) {
        console.error("POS Creation Error:", error);
        return {
            statusCode: 1,
            message: "Failed to process sale: " + error.message,
            data: error?.fulfillmentResolution ? { fulfillmentResolution: error.fulfillmentResolution } : undefined,
        };
    }
}

async function update(id, body) {
    try {
        const { customerId, posItems, branchId, storeId } = await body;

        const dataFound = await prisma.pos.findUnique({
            where: { id: parseInt(id) },
            include: { PosItems: true }
        });
        if (!dataFound) return NoRecordFound("POS");

        const result = await prisma.$transaction(async (tx) => {
            await tx.stock.deleteMany({
                where: {
                    transactionId: parseInt(id),
                    OR: [
                        { inOrOut: "POS" },
                        { inOrOut: "StockTransferOut" },
                        { inOrOut: "StockTransferIn" }
                    ]
                }
            });

            const updatedPos = await tx.pos.update({
                where: { id: parseInt(id) },
                data: {
                    customerId: customerId ? parseInt(customerId) : undefined,
                    branchId: branchId ? parseInt(branchId) : undefined,
                    updatedBy: body.userId ? { connect: { id: parseInt(body.userId) } } : undefined,
                }
            });

            await tx.posItems.deleteMany({ where: { PosId: parseInt(id) } });
            await tx.posItems.createMany({
                data: (posItems || []).map((item) => ({
                    PosId: parseInt(id),
                    itemId: parseInt(item.itemId || item.id),
                    sizeId: item.sizeId ? parseInt(item.sizeId) : null,
                    colorId: item.colorId ? parseInt(item.colorId) : null,
                    uomId: item.uomId ? parseInt(item.uomId) : null,
                    qty: String(item.qty),
                    price: String(item.price),
                    salesPersonId: item.salesPersonId ? parseInt(item.salesPersonId) : undefined,
                }))
            });

            const posFulfillmentLines = (posItems || [])
                .filter((item) => item?.itemId || item?.id)
                .map((item, lineIndex) => ({
                    ...item,
                    lineIndex,
                    itemId: parseInt(item.itemId || item.id),
                    storeId: item.sourceStoreId ? parseInt(item.sourceStoreId) : parseInt(storeId),
                    fulfillmentAllocations: item?.fulfillmentAllocations || item?.allocations || [],
                    branchId: item.branchId ? parseInt(item.branchId) : parseInt(branchId),
                }));

            const resolution = await resolveHybridFulfillmentLines(tx, posFulfillmentLines, {
                branchId,
            });
            const resolutionError = getHybridFulfillmentResolutionError(resolution);
            if (resolutionError) throw resolutionError;

            const allocations = extractResolvedAllocations(resolution);
            const allocationValidationMessage = await validateFulfillmentAllocations(tx, allocations);
            if (allocationValidationMessage) throw new Error(allocationValidationMessage);

            const stockEntries = [];
            const retailStoreId = parseInt(storeId);

            for (const allocation of allocations) {
                const sourceStoreId = parseInt(allocation.storeId);
                const qty = parseFloat(allocation.allocatedQty);
                const itemLine = posFulfillmentLines[allocation.lineIndex];
                const price = parseFloat(itemLine?.price || 0);

                const baseEntry = {
                    itemId: allocation.itemId,
                    sizeId: allocation.sizeId,
                    colorId: allocation.colorId,
                    uomId: allocation.uomId,
                    branchId: allocation.branchId,
                    barcode: allocation.barcode,
                    transactionId: parseInt(id),
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

            await tx.stock.createMany({ data: stockEntries });

            return updatedPos;
        });

        return { statusCode: 0, data: result };
    } catch (error) {
        console.error("POS Update Error:", error);
        return { statusCode: 1, message: "Failed to update sale: " + error.message };
    }
}

async function remove(id) {
    try {
        const result = await prisma.$transaction(async (tx) => {
            await tx.stock.deleteMany({
                where: {
                    transactionId: parseInt(id),
                    OR: [{ inOrOut: "POS" }, { inOrOut: "StockTransferOut" }, { inOrOut: "StockTransferIn" }]
                }
            });
            await tx.pos.delete({ where: { id: parseInt(id) } });
        });
        return { statusCode: 0, data: result };
    } catch (error) {
        console.error("POS Deletion Error:", error);
        return { statusCode: 1, message: "Failed to delete sale: " + error.message };
    }
}

export {
    get,
    getOne,
    getSearch,
    create,
    update,
    remove
}
