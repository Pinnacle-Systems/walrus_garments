import { prisma } from '../lib/prisma.js';
import moment from 'moment';

async function getDayBookSummary(req) {
    const { date, branchId } = req.query;
    const searchDate = date ? moment(date).startOf('day').toDate() : moment().startOf('day').toDate();
    const endDate = moment(searchDate).endOf('day').toDate();
    const bid = branchId ? parseInt(branchId) : undefined;

    // 1. Fetch POS Payments
    const posPayments = await prisma.posPayments.findMany({
        where: {
            date: {
                gte: searchDate,
                lte: endDate
            },
            Pos: {
                branchId: bid
            }
        },
        include: {
            Pos: {
                include: {
                    Party: true
                }
            }
        }
    });

    // 2. Fetch Bulk Sales Payments (from Payment model)
    const bulkPayments = await prisma.payment.findMany({
        where: {
            date: {
                gte: searchDate,
                lte: endDate
            },
            branchId: bid,
            isDeleted: false
        },
        include: {
            Party: true
        }
    });

    // 3. Fetch Expenses
    const expenses = await prisma.expenseEntryItems.findMany({
        where: {
            Expense: {
                date: {
                    gte: searchDate,
                    lte: endDate
                },
                branchId: bid
            }
        },
        include: {
            Expense: true,
            ExpenseCategory: true
        }
    });

    // 4. Fetch Previous Day Closing Balance (Opening Balance)
    // Note: This assumes DayBook table exists or will exist.
    // For now, we will handle the case where it's missing or no record found.
    let openingBalance = 0;
    try {
        const prevDay = await prisma.dayBook.findFirst({
            where: {
                date: {
                    lt: searchDate
                },
                branchId: bid
            },
            orderBy: {
                date: 'desc'
            }
        });
        if (prevDay) {
            openingBalance = prevDay.physicalCash || 0;
        }
    } catch (err) {
        console.log("DayBook table might not exist yet or error fetching opening balance");
    }

    // 5. Check if Today is already closed
    let isClosed = false;
    let closedData = null;
    try {
        closedData = await prisma.dayBook.findFirst({
            where: {
                date: {
                    gte: searchDate,
                    lte: endDate
                },
                branchId: bid
            }
        });
        if (closedData) isClosed = true;
    } catch (err) { }

    return {
        statusCode: 0,
        data: {
            openingBalance,
            posPayments,
            bulkPayments,
            expenses,
            isClosed,
            closedData
        }
    };
}

async function createDayBook(body) {
    const {
        date,
        branchId,
        openingBalance,
        posCashSales,
        bulkCashSales,
        otherReceipts,
        cashExpenses,
        otherPayments,
        expectedCash,
        physicalCash,
        difference,
        totalUpi,
        totalCard,
        totalOnline,
        denominations,
        remarks,
        closedById
    } = body;

    const data = await prisma.dayBook.create({
        data: {
            date: moment(date).startOf('day').toDate(),
            branchId: parseInt(branchId),
            openingBalance: parseFloat(openingBalance) || 0,
            posCashSales: parseFloat(posCashSales) || 0,
            bulkCashSales: parseFloat(bulkCashSales) || 0,
            otherReceipts: parseFloat(otherReceipts) || 0,
            cashExpenses: parseFloat(cashExpenses) || 0,
            otherPayments: parseFloat(otherPayments) || 0,
            expectedCash: parseFloat(expectedCash) || 0,
            physicalCash: parseFloat(physicalCash) || 0,
            difference: parseFloat(difference) || 0,
            totalUpi: parseFloat(totalUpi) || 0,
            totalCard: parseFloat(totalCard) || 0,
            totalOnline: parseFloat(totalOnline) || 0,
            denominations: denominations, // Should be passed as JSON object
            remarks,
            status: "CLOSED",
            closedById: parseInt(closedById)
        }
    });

    return { statusCode: 0, data };
}

export {
    getDayBookSummary,
    createDayBook
};
