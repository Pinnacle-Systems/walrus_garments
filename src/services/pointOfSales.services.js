import { NoRecordFound } from '../configs/Responses.js';
import { prisma } from '../lib/prisma.js';
import { getFinYearStartTimeEndTime } from '../utils/finYearHelper.js';
import { getDateFromDateTime, getDateFromDateTimeYear, getRemovedItems, getYearShortCodeForFinYear } from '../utils/helper.js';
import { getTableRecordWithId } from '../utils/helperQueries.js';





async function getNextDocId(branchId, shortCode, startTime, endTime, isReturn) {




    let lastObject = await prisma.pos.findFirst({
        where: {
            branchId: parseInt(branchId),
            isReturn: isReturn ? true : false,
            docId: { not: "DRAFT" },
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

    let prefix = "POS"

    if (isReturn) {
        prefix = "RE"
    }

    const branchObj = await getTableRecordWithId(branchId, "branch")

    console.log(branchObj, 'branchObj')

    let newDocId = `${branchObj.branchCode}/${shortCode}/${prefix}/1`
    if (lastObject) {
        newDocId = `${branchObj.branchCode}/${shortCode}/${prefix}/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
    }
    return newDocId
}


function manualFilterSearchData(searchPoDate, searchDueDate, searchPoType, data) {
    return data.filter(item =>
        (searchPoDate ? (
            String(getDateFromDateTime(item.createdAt)).includes(searchPoDate) ||
            String(getDateFromDateTimeYear(item.createdAt)).includes(searchPoDate)
        ) : true) &&
        (searchDueDate ? (
            String(getDateFromDateTime(item.dueDate)).includes(searchDueDate) ||
            String(getDateFromDateTimeYear(item.dueDate)).includes(searchDueDate)
        ) : true) &&
        (searchPoType ? (item.poType.toLowerCase().includes(searchPoType.toLowerCase())) : true)
    )
}

async function get(req) {


    const { branchId, serachDocNo, searchDate, searchCustomerName, isExchnage, approvalStatus, userRole, reportsTransactionType } = req.query;


    let where = {
        branchId: branchId ? parseInt(branchId) : undefined,
        docId: serachDocNo ? { contains: serachDocNo } : undefined,
        Party: searchCustomerName ? { name: { contains: searchCustomerName } } : undefined,
        approvalStatus: approvalStatus ? approvalStatus : undefined,
        customerId: req.query.customerId ? parseInt(req.query.customerId) : undefined,
        isReturn: reportsTransactionType === "RETURN" ? true : reportsTransactionType === "SALE" ? false : undefined,

    };



    let totalCount = 0;


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
            },
            PosPayments: true,
        },
        orderBy: {
            id: "desc"
        },
    });

    // Resolve LinkedReturnBill for each record (Self-join for reports)
    data = await Promise.all(data.map(async (item) => {
        if (item.isRetrunBillId) {
            const linked = await prisma.pos.findUnique({
                where: { id: item.isRetrunBillId },
                select: { id: true, docId: true }
            });
            return { ...item, LinkedReturnBill: linked };
        }
        return item;
    }));

    // console.log(data, "data")

    if (approvalStatus) {

        if (userRole == "ADMIN" || userRole == "DEFAULT ADMIN") {
            data = data.filter(item => item.approvalStatus == "PENDING");
            // console.log(data, "data 1")
        } else {
            data = data.filter(item => item.approvalStatus == "APPROVED");
        }

    }
    data = manualFilterSearchData(searchDate, "", "", data)


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

    if (data && data.isRetrunBillId) {
        data.LinkedReturnBill = await prisma.pos.findUnique({
            where: { id: data.isRetrunBillId },
            select: { id: true, docId: true }
        });
    }



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
            netAmount, approvalStatus, transactionType
        } = await body;


        let finYearDate = await getFinYearStartTimeEndTime(finYearId);
        const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startDateStartTime, finYearDate?.endDateEndTime) : "";
        const isReturn = transactionType === "RETURN" || (transactionType === "EXCHNAGE/RETURN" && parseFloat(netAmount || 0) < 0);
        let docId = await getNextDocId(branchId, shortCode, finYearDate?.startDateStartTime, finYearDate?.endDateEndTime, isReturn);

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
                    approvalStatus: approvalStatus || "NONE",
                    bilStatus: body.bilStatus || "PAID",
                    transactionType: transactionType ? transactionType : "DEFAULT",
                    isReturn: isReturn,
                    isRetrunBillId: body.isRetrunBillId ? parseInt(body.isRetrunBillId) : undefined,
                    availableCredit: body.availableCredit ? parseInt(body.availableCredit) : undefined,
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
                                barcode: item.barcode || null,
                                barcodeType: item.barcodeType || null,
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
                                date: new Date()
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

                        // Pessimistic Lock to prevent concurrent sales of the same item
                        await tx.$executeRaw`SELECT id FROM item WHERE id = ${itemId} FOR UPDATE`;

                        const currentStock = await tx.stock.aggregate({
                            _sum: { qty: true },
                            where: {
                                itemId,
                                sizeId: baseEntry.sizeId,
                                colorId: baseEntry.colorId,
                                uomId: baseEntry.uomId,
                                storeId: fStoreId,
                                branchId: baseEntry.branchId,
                                barcode: baseEntry?.barcode
                            }
                        });

                        // console.log({
                        //     itemId,
                        //     sizeId: baseEntry.sizeId,
                        //     colorId: baseEntry.colorId,
                        //     uomId: baseEntry.uomId,
                        //     storeId: fStoreId,
                        //     branchId: baseEntry.branchId,
                        //     barcode: baseEntry?.barcode
                        // }, "currentStock")

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

            await tx.ledger.create({
                data: {
                    EntryType: isReturn ? "Credit_Note" : "Sales",
                    LedgerType: "Customer",
                    creditOrDebit: isReturn ? "Credit" : "Debit",
                    partyId: parseInt(customerId),
                    amount: Math.abs(parseFloat(netAmount || 0)),
                    partyBillNo: posRecord.docId,
                    partyBillDate: new Date(),
                    posId: posRecord.id
                }
            });

            // Remaining credit balance (original credit - bill amount - instant refunds) is naturally
            // preserved as active credit in the customer's ledger balance. We explicitly do NOT debit
            // the customer account for the remaining credit, allowing them to redeem it in future bills.


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
            netAmount, taxAmount, discountValue, transactionType, finYearId, bilStatus
        } = await body;



        const dataFound = await prisma.pos.findUnique({ where: { id: parseInt(id) }, include: { PosItems: true } });

        if (!dataFound) return NoRecordFound("POS");

        const result = await prisma.$transaction(async (tx) => {
            let finalDocId = dataFound.docId;

            const isReturn = transactionType === "RETURN" || (transactionType === "EXCHNAGE/RETURN" && parseFloat(netAmount || 0) < 0);

            // console.log(body, 'body')
            // console.log(finalDocId, "finalDocId", bilStatus, 'bilStatus')

            console.log(dataFound.docId, "dataFound.docId", finYearId)

            if ((dataFound.docId === 'DRAFT')) {
                const finYearDate = await getFinYearStartTimeEndTime(finYearId);
                const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startDateStartTime, finYearDate?.endDateEndTime) : "";
                finalDocId = await getNextDocId(branchId, shortCode, finYearDate?.startDateStartTime, finYearDate?.endDateEndTime, isReturn);
            }

            if (body.approvalStatus === 'COMPLETED' || body.approvalStatus === 'NONE' || body.bilStatus === 'PAID' || body.bilStatus === 'UNPAID' || dataFound.approvalStatus === 'COMPLETED' || dataFound.approvalStatus === 'NONE') {
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
                    approvalStatus: (body.bilStatus === 'PAID' || body.bilStatus === 'UNPAID') ? "COMPLETED" : (body.approvalStatus || dataFound.approvalStatus),
                    bilStatus: body.bilStatus || dataFound.bilStatus || "PAID",
                    discountValue: discountValue ? String(discountValue) : undefined,
                    netAmount: String(netAmount || dataFound.netAmount),
                    transactionType: transactionType ? transactionType : "DEFAULT",
                    isReturn: isReturn,
                    isRetrunBillId: body.isRetrunBillId ? parseInt(body.isRetrunBillId) : undefined,
                    availableCredit: body.availableCredit ? parseInt(body.availableCredit) : undefined,

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
                    barcode: item.barcode || null,
                    barcodeType: item.barcodeType || null,
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

            if (body.approvalStatus === 'COMPLETED' || body.approvalStatus === 'NONE' || body.bilStatus === 'PAID' || body.bilStatus === 'UNPAID') {
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

                            // Pessimistic Lock to prevent concurrent sales of the same item
                            await tx.$executeRaw`SELECT id FROM item WHERE id = ${itemId} FOR UPDATE`;

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

            // Refresh Ledger Entries
            await tx.ledger.deleteMany({
                where: { posId: parseInt(id) }
            });

            await tx.ledger.create({
                data: {
                    EntryType: isReturn ? "Credit_Note" : "Sales",
                    LedgerType: "Customer",
                    creditOrDebit: isReturn ? "Credit" : "Debit",
                    partyId: parseInt(customerId || updatedPos.customerId),
                    amount: Math.abs(parseFloat(netAmount || updatedPos.netAmount || 0)),
                    partyBillNo: updatedPos.docId,
                    partyBillDate: new Date(),
                    posId: parseInt(id)
                }
            });

            // Remaining credit balance is naturally preserved as active credit in the customer's ledger
            // balance. We do not debit or adjust the customer's account for this saved credit.

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

            const posDetails = await tx.pos.findUnique({
                where: { id: parseInt(id) },

            });

            const stockDetails = await tx.stock.findMany({
                where: {
                    transactionId: parseInt(id),
                    OR: [
                        { inOrOut: "POS" },
                        { inOrOut: "StockTransferOut" },
                        { inOrOut: "StockTransferIn" }
                    ]
                }
            });

            // ✅ இப்போ delete பண்ணு
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

            await tx.pos.delete({ where: { id: parseInt(id) } });

            return {
                deletedPos: posDetails,
                deletedStock: stockDetails
            };
        });

        console.log(result, "result")

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

async function getPartyCreditBalance(req) {
    const { partyId } = req.query;
    if (!partyId) return { statusCode: 0, data: 0 };

    const ledgerDebit = await prisma.ledger.aggregate({
        _sum: { amount: true },
        where: { partyId: parseInt(partyId), creditOrDebit: 'Debit' }
    });

    const ledgerCredit = await prisma.ledger.aggregate({
        _sum: { amount: true },
        where: { partyId: parseInt(partyId), creditOrDebit: 'Credit' }
    });

    const posPayments = await prisma.posPayments.findMany({
        where: {
            Pos: { customerId: parseInt(partyId) },
            // paymentMode: { not: 'STORE_CREDIT' }
        },
        select: { amount: true, paymentMode: true }
    });


    // console.log("ledgerCredit", ledgerCredit)
    // console.log("ledgerDebit", ledgerDebit)
    // console.log("posPayments", posPayments)

    const totalDebit = ledgerDebit._sum.amount || 0;
    const totalCredit = ledgerCredit._sum.amount || 0;

    const totalPayments = posPayments.reduce((acc, curr) => {
        const amt = parseFloat(curr.amount) || 0;
        const mode = (curr.paymentMode || "").toLowerCase();

        if (mode === 'store_credit') return acc;
        if (mode.includes('refund')) return acc - amt;
        return acc + amt;
    }, 0);

    // Balance = (Returns + Payments) - Sales
    const availableCredit = (totalCredit + totalPayments) - totalDebit;

    return { statusCode: 0, data: Math.max(0, availableCredit) };
}

async function cancel(id) {
    try {
        const dataFound = await prisma.pos.findUnique({
            where: { id: parseInt(id) },
            include: { PosItems: true }
        });

        if (!dataFound) return NoRecordFound("POS");
        if (dataFound.bilStatus !== 'UNPAID') {
            return { statusCode: 1, message: "Only unpaid bills can be canceled." };
        }
        if (dataFound.isCancel) {
            return { statusCode: 1, message: "Bill is already canceled." };
        }

        const result = await prisma.$transaction(async (tx) => {
            // 1. Mark as canceled
            const updatedPos = await tx.pos.update({
                where: { id: parseInt(id) },
                data: { isCancel: true }
            });

            // 2. Reverse Stock
            // We delete the existing stock entries for this POS transaction
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

            // 3. Reverse Ledger
            await tx.ledger.deleteMany({
                where: { posId: parseInt(id) }
            });

            return updatedPos;
        });

        return { statusCode: 0, data: result };
    } catch (error) {
        console.error("POS Cancellation Error:", error);
        return { statusCode: 1, message: "Failed to cancel sale: " + error.message };
    }
}

async function requestDiscount(body) {
    try {
        const {
            customerId, posItems, branchId, netAmount, transactionType
        } = await body;

        const result = await prisma.pos.create({
            data: {
                customerId: customerId ? parseInt(customerId) : undefined,
                docId: "DRAFT",
                branchId: branchId ? parseInt(branchId) : undefined,
                createdById: body.userId ? parseInt(body.userId) : undefined,
                netAmount: netAmount ? String(netAmount) : "0",
                approvalStatus: "PENDING",
                bilStatus: "DRAFT",
                transactionType: transactionType ? transactionType : "DEFAULT",
                isReturn: false,
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
                            barcode: item.barcode || null,
                            barcodeType: item.barcodeType || null,
                        }))
                    }
                }
            }
        });
        return { statusCode: 0, data: result };
    } catch (error) {
        console.error("Discount Request Creation Error:", error);
        return { statusCode: 1, message: "Discount request failed: " + error.message };
    }
}

async function approveDiscount(id, body) {
    try {
        const { discountValue } = await body;
        const posRecord = await prisma.pos.findUnique({
            where: { id: parseInt(id) },
            include: { PosItems: true }
        });

        if (!posRecord) return { statusCode: 1, message: "POS bill draft not found" };

        const itemsTotal = posRecord.PosItems.reduce((sum, item) => {
            return sum + (parseFloat(item.price || 0) * parseFloat(item.qty || 0));
        }, 0);
        const finalNet = Math.max(0, Math.round(itemsTotal - parseFloat(discountValue || 0)));

        const updated = await prisma.pos.update({
            where: { id: parseInt(id) },
            data: {
                discountValue: String(discountValue),
                netAmount: String(finalNet),
                docId: "DRAFT",
                approvalStatus: "APPROVED",
                bilStatus: "DRAFT"
            }
        });

        return { statusCode: 0, data: updated };
    } catch (error) {
        console.error("Discount Request Approval Error:", error);
        return { statusCode: 1, message: "Approval update failed: " + error.message };
    }
}

export {
    get,
    getOne,
    getSearch,
    create,
    update,
    remove,
    cancel,
    checkReferenceNumber,
    getPartyCreditBalance,
    requestDiscount,
    approveDiscount
}
