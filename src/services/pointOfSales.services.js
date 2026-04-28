import { NoRecordFound } from '../configs/Responses.js';
import { prisma } from '../lib/prisma.js';
import { getFinYearStartTimeEndTime } from '../utils/finYearHelper.js';
import { getRemovedItems, getYearShortCodeForFinYear } from '../utils/helper.js';
import { getTableRecordWithId } from '../utils/helperQueries.js';





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
    const { branchId, active, pagination, pageNumber, dataPerPage, serachDocNo, searchDate, searchCustomerName, isExchnage, approvalStatus, userRole } = req.query;
    console.log(userRole, "userRole", userRole == "ADMIN" || userRole == "DEFAULT ADMIN")

    let where = {
        // branchId: branchId ? parseInt(branchId) : undefined,
        // active: active ? Boolean(active) : undefined,
        // docId: serachDocNo ? { contains: serachDocNo } : undefined,
        // Party: searchCustomerName ? { name: { contains: searchCustomerName } } : undefined,
        // approvalStatus: approvalStatus ? approvalStatus : { not: "NONE" }
    };

    if (searchDate) {
        where.date = {
            gte: new Date(`${searchDate}T00:00:00.000Z`),
            lte: new Date(`${searchDate}T23:59:59.999Z`),
        };
    }

    let totalCount = 0;
    // if (pagination) {
    //     totalCount = await prisma.pos.count({ where });
    // }

    let data = await prisma.pos.findMany({
        where,
        include: {
            Party: {
                select: {
                    id: true,
                    name: true,
                    contact: true,
                    isB2C: true
                }
            },
            PosItems: {
                include: {
                    Item: true,
                    Color: true,
                    Size: true
                }
            }
        },
        orderBy: {
            id: "desc"
        },
        // skip: pagination ? (parseInt(pageNumber) - 1) * parseInt(dataPerPage) : undefined,
        // take: pagination ? parseInt(dataPerPage) : undefined,
    });

    console.log(data, "data")

    if (approvalStatus) {

        if (userRole == "ADMIN" || userRole == "DEFAULT ADMIN") {
            data = data.filter(item => item.approvalStatus == "PENDING");
            console.log(data, "data 1")
        } else {
            data = data.filter(item => item.approvalStatus == "APPROVED");
        }

    }


    return { statusCode: 0, data, totalCount };
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.pos.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            PosItems: {
                include: {
                    Item: true,
                    Color: true,
                    Size: true,
                    ReturnItems: true,
                    Uom: true,
                    Employee: true
                }
            },
            Party: {
                select: {
                    id: true,
                    name: true,
                    contact: true,
                    isB2C: true,

                }
            },
            PosPayments: true
        }
    })



    data.PosItems = data.PosItems.map(item => ({
        ...item,
        returnedQty: item.ReturnItems.reduce((acc, curr) => acc + parseFloat(curr.qty || 0), 0)
    }));

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
        const {
            customerId, posItems, posPayments, finYearId, branchId, storeId, exchangeSalesNo,
            netAmount, taxAmount, discountValue, discountType,
            manualDiscount, promotionalDiscount, roundOff,
            paidCash, paidUPI, paidCard, paidOnline,
            receivedAmount, balanceReturn, paymentMethod,
            approvalStatus // Add this
        } = await body;


        let finYearDate = await getFinYearStartTimeEndTime(finYearId);
        const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startDateStartTime, finYearDate?.endDateEndTime) : "";
        let docId = await getNextDocId(branchId, shortCode, finYearDate?.startDateStartTime, finYearDate?.endDateEndTime);

        const result = await prisma.$transaction(async (tx) => {
            // Stage 1: Initial Request from Salesperson
            const finalDocId = approvalStatus === 'PENDING' ? 'DRAFT' : (approvalStatus === 'APPROVED' ? 'PROCEED' : docId);

            const posRecord = await tx.pos.create({
                data: {
                    customerId: customerId ? parseInt(customerId) : undefined,
                    docId: finalDocId,
                    branchId: branchId ? parseInt(branchId) : undefined,
                    createdById: body.userId ? parseInt(body.userId) : undefined,
                    netAmount: netAmount ? String(netAmount) : "0",
                    approvalStatus: approvalStatus || "NONE", // Save approval status
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
                                isReturn: item.isReturn || false,
                                originalItemId: item.originalItemId || null,
                                retunBillId: item.retunBillId || null,

                            }))
                        }
                    },
                    PosPayments: {
                        createMany: {
                            data: (posPayments || []).map(p => ({
                                amount: String(p.amount),
                                paymentMode: p.paymentMode,
                                reference_no: p.reference_no,
                                transaction_id: p.transaction_id,
                                retunBillId: exchangeSalesNo ? parseInt(exchangeSalesNo) : null,

                            }))
                        }
                    }
                }
            });

            // IMPORTANT: If approval is pending, don't deduct stock yet
            if (approvalStatus === 'PENDING') {
                return posRecord;
            }

            const stockEntries = [];
            const retailStoreId = parseInt(storeId);

            for (const item of (posItems || [])) {
                if (!item.itemId && !item.id) continue;

                const itemId = parseInt(item.itemId || item.id);
                const fulfillments = item.fulfillments && !item.isReturn ? item.fulfillments : [{ storeId: item.sourceStoreId || retailStoreId, qty: item.qty }];
                const price = parseFloat(item.price || 0);

                const baseEntry = {
                    itemId,
                    sizeId: item.sizeId ? parseInt(item.sizeId) : null,
                    colorId: item.colorId ? parseInt(item.colorId) : null,
                    uomId: item.uomId ? parseInt(item.uomId) : null,
                    branchId: item.branchId ? parseInt(item.branchId) : parseInt(branchId),
                    barcode: item.barcode || null,
                    transactionId: posRecord.id,
                    price: price,
                };

                // VALIDATION: Check stock for each fulfillment
                if (!item.isReturn) {
                    for (const f of fulfillments) {
                        const fQty = parseFloat(f.qty);
                        if (fQty <= 0) continue;

                        const fStoreId = parseInt(f.storeId);
                        const currentStock = await tx.stock.aggregate({
                            _sum: { qty: true },
                            where: {
                                itemId,
                                sizeId: baseEntry.sizeId,
                                colorId: baseEntry.colorId,
                                uomId: baseEntry.uomId,
                                storeId: fStoreId,
                                branchId: baseEntry.branchId
                            }
                        });

                        const available = parseFloat(currentStock._sum.qty || 0);
                        if (available < fQty) {
                            throw new Error(`Insufficient stock in ${f.storeName || 'Store'}. Available: ${available}, Required: ${fQty}`);
                        }

                        // Create Stock reduction/transfer
                        if (fStoreId !== retailStoreId) {
                            stockEntries.push({ ...baseEntry, qty: -fQty, storeId: fStoreId, inOrOut: "StockTransferOut" });
                            stockEntries.push({ ...baseEntry, qty: fQty, storeId: retailStoreId, inOrOut: "StockTransferIn" });
                        }

                        stockEntries.push({ ...baseEntry, qty: -fQty, storeId: retailStoreId, inOrOut: "POS" });
                    }
                } else {
                    // Return logic (Always to retailStoreId)
                    stockEntries.push({ ...baseEntry, qty: parseFloat(item.qty), storeId: retailStoreId, inOrOut: "POSReturn" });
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
        const {
            customerId, posItems, posPayments, branchId, storeId,
            netAmount, taxAmount, discountValue, discountType,
            manualDiscount, promotionalDiscount, roundOff,
            paidCash, paidUPI, paidCard, paidOnline,
            receivedAmount, balanceReturn, paymentMethod
        } = await body;



        const dataFound = await prisma.pos.findUnique({ where: { id: parseInt(id) }, include: { PosItems: true } });

        if (!dataFound) return NoRecordFound("POS");

        const result = await prisma.$transaction(async (tx) => {
            let finalDocId = dataFound.docId;

            // Transition logic
            if (finalDocId === 'DRAFT' && body.approvalStatus === 'APPROVED') {
                finalDocId = 'PROCEED';
            } else if (finalDocId === 'PROCEED' && body.approvalStatus === 'COMPLETED') {
                const finYearDate = await getFinYearStartTimeEndTime(body.finYearId);
                const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startDateStartTime, finYearDate?.endDateEndTime) : "";
                finalDocId = await getNextDocId(branchId, shortCode, finYearDate?.startDateStartTime, finYearDate?.endDateEndTime);
            } else if (!finalDocId && body.approvalStatus === 'NONE') {
                // For regular sales
                const finYearDate = await getFinYearStartTimeEndTime(body.finYearId);
                const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startDateStartTime, finYearDate?.endDateEndTime) : "";
                finalDocId = await getNextDocId(branchId, shortCode, finYearDate?.startDateStartTime, finYearDate?.endDateEndTime);
            }

            // DELETE existing stock only if we are doing a real stock transaction
            if (body.approvalStatus === 'COMPLETED' || body.approvalStatus === 'NONE' || dataFound.approvalStatus === 'COMPLETED' || dataFound.approvalStatus === 'NONE') {
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
            }

            const updatedPos = await tx.pos.update({
                where: { id: parseInt(id) },
                data: {
                    customerId: customerId ? parseInt(customerId) : undefined,
                    branchId: branchId ? parseInt(branchId) : undefined,
                    docId: finalDocId,
                    approvalStatus: body.approvalStatus || dataFound.approvalStatus,
                    discountValue: String(discountValue || dataFound.discountValue),
                    netAmount: String(netAmount || dataFound.netAmount),
                    // updatedBy: body.userId ? { connect: { id: parseInt(body.userId) } } : undefined,
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
                    isReturn: item.isReturn || false,
                }))
            });

            await tx.posPayments.deleteMany({ where: { PosId: parseInt(id) } });
            await tx.posPayments.createMany({
                data: (posPayments || []).map(p => ({
                    PosId: parseInt(id),
                    amount: String(p.amount),
                    paymentMode: p.paymentMode,
                    reference_no: p.reference_no,
                    transaction_id: p.transaction_id
                }))
            });

            const stockEntries = [];
            const retailStoreId = parseInt(storeId);

            if (body.approvalStatus === 'COMPLETED' || body.approvalStatus === 'NONE') {
                for (const item of (posItems || [])) {
                    if (!item.itemId && !item.id) continue;

                    const itemId = parseInt(item.itemId || item.id);
                    const fulfillments = item.fulfillments && !item.isReturn ? item.fulfillments : [{ storeId: item.sourceStoreId || retailStoreId, qty: item.qty }];
                    const price = parseFloat(item.price || 0);

                    const baseEntry = {
                        itemId,
                        sizeId: item.sizeId ? parseInt(item.sizeId) : null,
                        colorId: item.colorId ? parseInt(item.colorId) : null,
                        uomId: item.uomId ? parseInt(item.uomId) : null,
                        branchId: item.branchId ? parseInt(item.branchId) : parseInt(branchId),
                        barcode: item.barcode || null,
                        transactionId: parseInt(id),
                        price: price,
                    };

                    if (!item.isReturn) {
                        for (const f of fulfillments) {
                            const fQty = parseFloat(f.qty);
                            if (fQty <= 0) continue;

                            const fStoreId = parseInt(f.storeId);
                            const currentStock = await tx.stock.aggregate({
                                _sum: { qty: true },
                                where: {
                                    itemId,
                                    sizeId: baseEntry.sizeId,
                                    colorId: baseEntry.colorId,
                                    uomId: baseEntry.uomId,
                                    storeId: fStoreId,
                                    branchId: baseEntry.branchId
                                }
                            });

                            const available = parseFloat(currentStock._sum.qty || 0);
                            if (available < fQty) {
                                throw new Error(`Insufficient stock in ${f.storeName || 'Store'}. Available: ${available}, Required: ${fQty}`);
                            }

                            if (fStoreId !== retailStoreId) {
                                stockEntries.push({ ...baseEntry, qty: -fQty, storeId: fStoreId, inOrOut: "StockTransferOut" });
                                stockEntries.push({ ...baseEntry, qty: fQty, storeId: retailStoreId, inOrOut: "StockTransferIn" });
                            }

                            stockEntries.push({ ...baseEntry, qty: -fQty, storeId: retailStoreId, inOrOut: "POS" });
                        }
                    } else {
                        stockEntries.push({ ...baseEntry, qty: parseFloat(item.qty), storeId: retailStoreId, inOrOut: "POS" });
                    }
                }

                await tx.stock.createMany({ data: stockEntries });
            }

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

async function checkReferenceNumber(req) {
    const { refNo } = req.query;
    if (!refNo) return { statusCode: 1, message: "Reference number is required" };

    const posPayment = await prisma.posPayments.findFirst({
        where: { reference_no: refNo }
    });

    const payment = await prisma.payment.findFirst({
        where: { paymentRefNo: refNo }
    });

    return {
        statusCode: 0,
        exists: !!(posPayment || payment),
        source: posPayment ? "POS" : (payment ? "Payments" : null)
    };
}

export {
    get,
    getOne,
    getSearch,
    create,
    update,
    remove,
    checkReferenceNumber
}
