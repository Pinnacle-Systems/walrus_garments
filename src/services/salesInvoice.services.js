import { NoRecordFound } from '../configs/Responses.js';
import { prisma } from '../lib/prisma.js';
import { getFinYearStartTimeEndTime } from '../utils/finYearHelper.js';
import { getRemovedItems, getYearShortCodeForFinYear } from '../utils/helper.js';
import { getTableRecordWithId } from '../utils/helperQueries.js';

function calculateInvoiceNetAmount(invoiceItems = []) {
    return (invoiceItems || []).reduce((acc, curr) => {
        const price = parseFloat(curr?.price || 0);
        const qty = parseFloat(curr?.qty || 0);
        const taxPercent = parseFloat(curr?.taxPercent || 0);
        const taxMethod = curr?.taxMethod || "Inclusive";
        const lineDiscountType = curr?.discountType;
        const lineDiscountValue = parseFloat(curr?.discountValue || 0);

        const gross = price * qty;
        let discountedAmount = gross;

        if (lineDiscountType === "Percentage") {
            discountedAmount = gross - (gross * lineDiscountValue) / 100;
        } else if (lineDiscountType === "Flat") {
            discountedAmount = gross - lineDiscountValue;
        }

        discountedAmount = Math.max(0, discountedAmount);

        if (taxMethod === "Inclusive" && taxPercent > 0) {
            return acc + discountedAmount;
        }

        return acc + discountedAmount + (discountedAmount * taxPercent) / 100;
    }, 0);
}

function getSalesInvoiceLedgerData({ customerId, amount, docId }) {
    return {
        EntryType: "Sales",
        LedgerType: "Customer",
        creditOrDebit: "Debit",
        partyId: parseInt(customerId),
        amount,
        partyBillNo: docId,
        partyBillDate: new Date(),
    };
}




async function getNextDocId(branchId, shortCode, startTime, endTime) {


    let lastObject = await prisma.salesInvoice.findFirst({
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
    let newDocId = `${branchObj.branchCode}/${shortCode}/SIV/1`
    if (lastObject) {
        newDocId = `${branchObj.branchCode}/${shortCode}/SIV/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
    }
    return newDocId
}

async function get(req) {

    const { companyId, active } = req.query

    console.log(companyId, active, "companyId, active ")

    let data = await prisma.salesInvoice.findMany({
        where: {
            active: active ? Boolean(active) : undefined,
        },
        include: {
            SalesInvoiceItems: true,
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
            SalesDelivery: {
                select: {
                    id: true,
                    docId: true
                }
            },
            Saleorder: {
                select: {
                    quotationId: true,
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

    const result = await Promise.all(
        data.map(async (item) => {
            const paymentData = await prisma.payment.findMany({
                where: {
                    transactionType: "SALESINVOICE",
                    transactionId: item.id,
                },
            });

            const advancePaymentData = item?.Saleorder?.quotationId
                ? await prisma.payment.findMany({
                    where: {
                        transactionType: "QUOTATION",
                        transactionId: item.Saleorder.quotationId,
                    },
                })
                : [];

            return {
                ...item,
                paymentData,
                advancePaymentData,
            };
        })
    );

    return { statusCode: 0, data: result };
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.salesInvoice.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            SalesInvoiceItems: true,
            Saleorder: {
                select: {
                    docId: true,
                    quotationId: true,
                    Quotation: {
                        select: {
                            id: true,
                        }
                    }
                }
            }
        }
    })
    if (!data) return NoRecordFound("size");

    const salesInvoicePaymentData = await prisma.payment.findMany({
        where: {
            transactionType: "SALESINVOICE",
            transactionId: parseInt(id),
        },
    });

    let saleOrderWithQuotationPayments = data?.Saleorder;
    if (data?.Saleorder?.Quotation?.id) {
        const paymentData = await prisma.payment.findMany({
            where: {
                transactionType: "QUOTATION",
                transactionId: data.Saleorder.Quotation.id,
            },
        });

        saleOrderWithQuotationPayments = {
            ...data.Saleorder,
            Quotation: {
                ...data.Saleorder.Quotation,
                paymentData,
            }
        };
    }

    return {
        statusCode: 0,
        data: {
            ...data,
            paymentData: salesInvoicePaymentData,
            Saleorder: saleOrderWithQuotationPayments,
            ...{ childRecord }
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
    const { customerId, discountType, discountValue, invoiceItems, finYearId, branchId, saleOrderId } = await body


    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startDateStartTime, finYearDate?.endDateEndTime) : "";
    let docId = await getNextDocId(branchId, shortCode, finYearDate?.startDateStartTime, finYearDate?.endDateEndTime);
    const netAmount = calculateInvoiceNetAmount(invoiceItems);


    const data = await prisma.salesInvoice.create(
        {
            data: {
                customerId: customerId ? parseInt(customerId) : undefined,
                // discountType: discountType ? discountType : "",
                // discountValue: discountValue ? discountValue : "",
                // branchId: branchId ? parseInt(branchId) : "",
                saleOrderId: saleOrderId ? parseInt(saleOrderId) : undefined,
                docId: docId,
                SalesInvoiceItems: {
                    createMany: invoiceItems?.length > 0 ? {
                        data: invoiceItems?.map((temp) => {
                            let newItem = {}
                            newItem["itemId"] = temp["itemId"] ? parseInt(temp["itemId"]) : null;
                            newItem["sizeId"] = temp["sizeId"] ? parseInt(temp["sizeId"]) : null;
                            newItem["colorId"] = temp["colorId"] ? parseInt(temp["colorId"]) : null;
                            newItem["uomId"] = temp["uomId"] ? parseInt(temp["uomId"]) : null;
                            newItem["hsnId"] = temp["hsnId"] ? parseInt(temp["hsnId"]) : null;
                            newItem["qty"] = temp["qty"] ? String(temp["qty"]) : null;
                            newItem["price"] = temp["price"] ? String(temp["price"]) : null;


                            return newItem
                        })
                    } : undefined
                },
                Ledger: customerId ? {
                    create: getSalesInvoiceLedgerData({
                        customerId,
                        amount: netAmount,
                        docId,
                    })
                } : undefined
            }
        }
    )
    return { statusCode: 0, data };
}

async function updateOrCreate(tx, item, quotationId, poType, poInwardOrDirectInward, storeId, branchId) {

    if (item?.id) {


        let updatedata = await tx.SalesInvoiceItems.update({
            where: {
                id: parseInt(item.id)
            },
            data: {
                quotationId: parseInt(quotationId),
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
        let data = await tx.SalesInvoiceItems.create({
            data: {
                quotationId: parseInt(quotationId),
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
    const { customerId, discountType, discountValue, invoiceItems, branchId } = await body

    const dataFound = await prisma.salesInvoice.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            SalesInvoiceItems: true,
            Ledger: true,
        }
    })
    if (!dataFound) return NoRecordFound("Sale Order");

    let oldItemIds = dataFound?.SalesInvoiceItems.map(item => parseInt(item.id))
    let currentItemIds = invoiceItems.filter(i => i?.id)?.map(item => parseInt(item.id))
    let removedItemIds = oldItemIds.filter(id => !currentItemIds.includes(id));
    const netAmount = calculateInvoiceNetAmount(invoiceItems);

    let salesInvoiceData;

    await prisma.$transaction(async (tx) => {
        // Delete removed items
        if (removedItemIds.length > 0) {
            await tx.salesInvoiceItems.deleteMany({
                where: {
                    id: { in: removedItemIds }
                }
            });
        }

        // Update main record
        salesInvoiceData = await tx.salesInvoice.update({
            where: {
                id: parseInt(id)
            },
            data: {
                customerId: customerId ? parseInt(customerId) : undefined,

                branchId: branchId ? parseInt(branchId) : undefined,
                Ledger: customerId ? {
                    upsert: {
                        create: getSalesInvoiceLedgerData({
                            customerId,
                            amount: netAmount,
                            docId: dataFound.docId,
                        }),
                        update: getSalesInvoiceLedgerData({
                            customerId,
                            amount: netAmount,
                            docId: dataFound.docId,
                        }),
                    }
                } : undefined,
            },
        })

        for (const item of (invoiceItems || []).filter(i => i.itemId)) {
            if (item.id) {
                await tx.salesInvoiceItems.update({
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
                await tx.salesInvoiceItems.create({
                    data: {
                        salesInvoiceId: salesInvoiceData.id,
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
    return { statusCode: 0, data: salesInvoiceData };
}
async function remove(id) {
    const data = await prisma.salesInvoice.delete({
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
