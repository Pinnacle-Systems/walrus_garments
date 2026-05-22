import { NoRecordFound } from '../configs/Responses.js';
import { attachCurrentTime, getDateFromDateTime, getYearShortCodeForFinYear } from '../utils/helper.js';
import { getTableRecordWithId } from '../utils/helperQueries.js';
import { getFinYearStartTimeEndTime } from '../utils/finYearHelper.js';
import { prisma } from '../lib/prisma.js';


async function getNextDocId(branchId, shortCode, startTime, endTime,) {
    let lastObject = await prisma.payment.findFirst({
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
    let newDocId = `${branchObj.branchCode}/${shortCode}/Pay/1`
    if (lastObject) {
        newDocId = `${branchObj.branchCode}/${shortCode}/Pay/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
    }
    return newDocId
}

function manualFilterSearchData(searchBillDate, searchMobileNo, searchType, searchDueDate, data) {
    return data.filter(item =>
        (searchBillDate ? String(getDateFromDateTime(item.cvv)).includes(searchBillDate) : true)
        && (searchDueDate ? String(getDateFromDateTime(item.cvv)).includes(searchDueDate) : true)

        && (searchMobileNo ? String(item.contactMobile).includes(searchMobileNo) : true)
        && (searchType ? String(item.paymentType).includes(searchType) : true)

    )
}

async function get(req) {
    const { active, branchId, pagination, pageNumber, dataPerPage, searchDocId, searchBillDate, searchDueDate, searchCustomerName, searchType, searchMobileNo, finYearId, serachDocNo, searchDate, supplier } = req.query
    console.log(searchBillDate, "searchBillDate")
    console.log(searchDueDate, "searchDueDate")

    let data = await prisma.payment.findMany({
        where: {
            active: active ? Boolean(active) : undefined,
            docId: Boolean(serachDocNo) ?
                {
                    contains: serachDocNo
                }
                : undefined,
            Party: {
                name: Boolean(supplier) ? {
                    contains: supplier
                } : undefined
            },
            isDeleted: false,
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
    data = manualFilterSearchData(searchDate, searchMobileNo, searchType, searchDueDate, data)

    const enrichedData = await Promise.all(data.map(async (payment) => {
        let isDeletable = true;

        if (payment.transactionType === "QUOTATION" && payment.transactionId) {
            const saleOrder = await prisma.saleorder.findFirst({
                where: { quotationId: payment.transactionId },
                include: {
                    _count: {
                        select: { SalesDelivery: true }
                    }
                }
            });
            if (saleOrder || saleOrder._count.SalesDelivery > 0) {
                isDeletable = false;
            }
        } else if (payment.transactionType === "SALESORDER" && payment.transactionId) {
            const saleOrder = await prisma.saleorder.findUnique({
                where: { id: payment.transactionId },
                include: {
                    _count: {
                        select: { SalesDelivery: true }
                    }
                }
            });
            if (saleOrder && saleOrder._count.SalesDelivery > 0) {
                isDeletable = false;
            }
        }

        return { ...payment, isDeletable };
    }));

    const totalCount = enrichedData.length
    // if (pagination) {
    //     data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)
    // }
    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startDateStartTime, finYearDate?.endDateEndTime) : "";
    let newDocId = finYearDate ? (await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime)) : "";
    return { statusCode: 0, nextDocId: newDocId, data: enrichedData, totalCount };
}
async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.payment.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            Party: true
        }
    })
    if (!data) return NoRecordFound("purchaseBill");

    let isDeletable = true;
    if (data.transactionType === "QUOTATION" && data.transactionId) {
        const saleOrder = await prisma.saleorder.findFirst({
            where: { quotationId: data.transactionId },
            include: { _count: { select: { SalesDelivery: true } } }
        });
        if (saleOrder && saleOrder._count.SalesDelivery > 0) {
            isDeletable = false;
        }
    } else if (data.transactionType === "SALESORDER" && data.transactionId) {
        const saleOrder = await prisma.saleorder.findUnique({
            where: { id: data.transactionId },
            include: { _count: { select: { SalesDelivery: true } } }
        });
        if (saleOrder && saleOrder._count.SalesDelivery > 0) {
            isDeletable = false;
        }
    }

    return { statusCode: 0, data: { ...data, ...{ childRecord }, isDeletable } };
}


async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.payment.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
            OR: [
                {
                    name: {
                        contains: searchKey,
                    },
                },
            ],
        },

    })
    return { statusCode: 0, data: data };
}



async function create(body) {
    let data;
    try {
        const { branchId, id, paymentMode, cvv, paymentType, paidAmount, discount, paymentRefNo, supplierId, userId, finYearId, totalBillAmount, totalAmount, paymentFlow, transactionType, refId, refDocId, transaction, transactionId, outstandingAmount } = body;

        let finYearDate = await getFinYearStartTimeEndTime(finYearId);
        const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startDateStartTime, finYearDate?.endDateEndTime) : "";
        let newDocId = finYearDate ? (await getNextDocId(branchId, shortCode, finYearDate?.startDateStartTime, finYearDate?.endDateEndTime)) : "";
        const dateOnly = attachCurrentTime(cvv)


        console.log(dateOnly, "dateOnly")

        await prisma.$transaction(async (tx) => {
            data = await tx.payment.create({
                data: {
                    docId: newDocId,
                    partyId: supplierId ? parseInt(supplierId) : null,
                    branchId: branchId ? parseInt(branchId) : null,
                    paymentMode: paymentMode ? paymentMode : null,
                    paidAmount: paidAmount ? parseFloat(paidAmount) : null,
                    paymentRefNo: paymentRefNo ? paymentRefNo : null,
                    createdById: parseInt(userId),
                    cvv: dateOnly ? new Date(dateOnly) : null,
                    paymentType: paymentType ? paymentType : null,
                    totalBillAmount: totalBillAmount ? parseInt(totalBillAmount) : undefined,
                    totalAmount: totalAmount ? parseInt(totalAmount) : undefined,
                    paymentFlow: paymentFlow ? paymentFlow : "",
                    transactionType: transactionType ? transactionType : "",
                    refId: refId ? parseInt(refId) : undefined,
                    refDocId: refDocId ? refDocId : "",
                    transaction: transaction ? transaction : "",
                    transactionId: transactionId ? parseInt(transactionId) : undefined,
                    date: dateOnly ? new Date(dateOnly) : null,
                    outstandingAmount: outstandingAmount ? parseFloat(outstandingAmount) : undefined,
                }
            });
        });

        return { statusCode: 0, data };
    } catch (error) {
        console.error("Error creating payment:", error);
        return { statusCode: 1, error: error.message || "An error occurred while creating the payment" };
    }
}



async function update(id, body) {
    let data
    const {
        branchId, paymentMode, cvv, paymentType, paidAmount, discount, supplierId, userId, paymentRefNo, partyId, finYearId, totalAmount,
        paymentFlow, transactionType, refId, refDocId, transaction, transactionId, outstandingAmount, totalBillAmount
    } = await body


    const dateOnly = attachCurrentTime(cvv)

    console.log(dateOnly, "dateOnly")
    const dataFound = await prisma.payment.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("payment");
    await prisma.$transaction(async (tx) => {
        data = await tx.payment.update({
            where: {
                id: parseInt(id),
            },
            data: {
                partyId: parseInt(supplierId),
                branchId: parseInt(branchId),
                paymentMode,
                paidAmount: parseFloat(paidAmount),
                discount: parseFloat(discount),
                createdById: parseInt(userId),
                cvv: dateOnly ? new Date(dateOnly) : null,
                paymentType,
                totalAmount: totalAmount ? parseInt(totalAmount) : undefined,
                paymentFlow: paymentFlow ? paymentFlow : "",
                transactionType: transactionType ? transactionType : "",
                refId: refId ? parseInt(refId) : undefined,
                refDocId: refDocId ? refDocId : "",
                transaction: transaction ? transaction : "",
                transactionId: transactionId ? parseInt(transactionId) : undefined,
                outstandingAmount: outstandingAmount ? parseFloat(outstandingAmount) : undefined,
                totalBillAmount: totalBillAmount ? parseInt(totalBillAmount) : undefined,


            },
        })
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const payment = await prisma.payment.findUnique({
        where: { id: parseInt(id) }
    });

    if (!payment) return NoRecordFound("payment");

    // If payment is against a Quotation, check if the resulting Sale Order has deliveries
    if (payment.transactionType === "QUOTATION" && payment.transactionId) {
        const saleOrder = await prisma.saleorder.findFirst({
            where: { quotationId: payment.transactionId },
            include: {
                _count: {
                    select: { SalesDelivery: true }
                }
            }
        });

        if (saleOrder && saleOrder._count.SalesDelivery > 0) {
            return {
                statusCode: 1,
                data: {
                    message: "Cannot delete payment: Linked Sale Order has active deliveries."
                }
            };
        }
    }

    // If payment is against a Sale Order, check if it has deliveries
    if (payment.transactionType === "SALESORDER" && payment.transactionId) {
        const saleOrder = await prisma.saleorder.findUnique({
            where: { id: payment.transactionId },
            include: {
                _count: {
                    select: { SalesDelivery: true }
                }
            }
        });

        if (saleOrder && saleOrder._count.SalesDelivery > 0) {
            return {
                statusCode: 1,
                data: {
                    message: "Cannot delete payment: Sale Order has active deliveries."
                }
            };
        }
    }

    const data = await prisma.payment.delete({
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