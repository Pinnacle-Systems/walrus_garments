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
            createdAt: {
                gte: searchDate,
                lte: endDate,
            },
            Pos: {
                branchId: bid,
                isReturn: false
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

    // 1.1 Fetch POS Returns (Treat as Expense)
    const posReturns = await prisma.posPayments.findMany({
        where: {
            createdAt: {
                gte: searchDate,
                lte: endDate,
            },
            Pos: {
                branchId: bid,
                isReturn: true
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

    const bulkPayments = await prisma.payment.findMany({
        where: {
            createdAt: {
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
    const expenses = await prisma.ExpenseEntryItems.findMany({
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

    // Merge mapped POS Returns into Expenses
    const mappedPosReturns = posReturns.map(pr => ({
        id: `pos-ret-${pr.id}`,
        amount: pr.amount,
        paymentMode: pr.paymentMode,
        Expense: {
            docId: pr.Pos?.docId,
            date: pr.createdAt
        },
        ExpenseCategory: {
            name: "POS Return"
        },
        isPosReturn: true
    }));

    expenses.push(...mappedPosReturns);

    // 4. Fetch Payment Adjustments
    const paymentAdjustments = await prisma.paymentAdjustment.findMany({
        where: {
            date: {
                gte: searchDate,
                lte: endDate
            }
            // branchId: bid // Note: Schema doesn't have branchId yet, fetching all for the date
        },
        include: {
            createdBy: true
        }
    });

    // 5. Fetch Sales Returns
    const salesReturns = await prisma.salesReturn.findMany({
        where: {
            date: {
                gte: searchDate,
                lte: endDate
            },
            branchId: bid,
            isDeleted: false
        },
        include: {
            Party: true,
            Pos: true,
            SalesReturnItems: true
        }
    });

    // 6. Calculate Dynamic Opening Balance
    let openingBalance = 0;
    let pos = [];
    let bulk = [];
    let adj = [];
    let exp = [];
    let sr = [];
    try {


        const startDate = new Date(searchDate);
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(searchDate);
        endDate.setDate(endDate.getDate() - 1);
        endDate.setHours(23, 59, 59, 999);

        // Add POS Cash
        pos = await prisma.posPayments.findMany({
            where: {
                createdAt: { gte: startDate, lt: endDate },
                // paymentMode: { contains: 'cash' },
                Pos: { branchId: bid, isReturn: false }
            },
            select: { amount: true }
        });
        const posSum = pos.reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);
        openingBalance += posSum;

        // Add Bulk Cash
        bulk = await prisma.payment.findMany({
            where: {
                createdAt: { gte: startDate, lt: endDate },
                branchId: bid,
                // paymentMode: { contains: 'cash' },
                isDeleted: false
            },
            select: { paidAmount: true }
        });
        const bulkSum = bulk.reduce((acc, p) => acc + (parseFloat(p.paidAmount) || 0), 0);
        openingBalance += bulkSum;

        // Add/Sub Adjustments
        adj = await prisma.paymentAdjustment.findMany({
            where: {
                date: { gte: startDate, lt: endDate },
                // paymentMode: { contains: 'cash' },
                // createdBy: {
                //     UserOnBranch: {
                //         some: {
                //             branchId: bid
                //         }
                //     }
                // }
            },
            select: { adjustmentAmount: true, adjustmentType: true }
        });
        const adjSum = adj.reduce((acc, a) => {
            const amt = parseFloat(a.adjustmentAmount) || 0;
            return a.adjustmentType === 'PLUS' ? acc + amt : acc - amt;
        }, 0);
        openingBalance += adjSum;

        // Sub Expenses
        exp = await prisma.ExpenseEntryItems.findMany({
            where: {
                Expense: {
                    date: { gte: startDate, lt: endDate },
                    branchId: bid
                },
                // paymentMethod: { contains: 'cash' }
            },
            // select: { amount: true }
        });

        // Add POS Returns from yesterday to expense sum
        const posReturnsYesterday = await prisma.posPayments.findMany({
            where: {
                createdAt: { gte: startDate, lt: endDate },
                Pos: { branchId: bid, isReturn: true }
            },
            select: { amount: true }
        });
        const posReturnSumYesterday = posReturnsYesterday.reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);
        
        const expSum = exp.reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0) + posReturnSumYesterday;
        openingBalance -= expSum;

        // Sub Sales Returns
        sr = await prisma.salesReturn.findMany({
            where: {
                createdAt: { gte: startDate, lt: endDate },
                branchId: bid,
                // refundType: { contains: 'cash' },
                isDeleted: false
            },
            include: { SalesReturnItems: { select: { price: true, qty: true } } }
        });
        const srSum = sr.reduce((acc, s) => {
            const itemTotal = (s.SalesReturnItems || []).reduce((iAcc, item) => iAcc + (parseFloat(item.price) * parseFloat(item.qty)), 0);
            return acc + itemTotal;
        }, 0);
        openingBalance -= srSum;

        console.log(`---startDate---${startDate}`);
        console.log(`--- Opening Balance Debug [Branch: ${bid}, Before: ${searchDate}] ---`);
        console.log(`POS Cash: ${posSum}`);
        console.log(`Bulk Cash: ${bulkSum}`);
        console.log(`Adjustments (Net): ${adjSum}`);
        console.log(`Expenses: ${expSum}`);
        console.log(`Returns: ${srSum}`);
        console.log(`Total Opening Balance: ${openingBalance}`);
        console.log(`-----------------------------------------------------------`);

        console.log("adjustment", adj)

    } catch (err) {
        console.error("Error calculating dynamic opening balance:", err);
    }



    return {
        statusCode: 0,
        data: {
            openingBalance,
            posPayments,
            bulkPayments,
            salesReturns,
            paymentAdjustments,
            expenses,
            openingBalanceTransaction: {
                pointOfSals: pos,
                bulkSales: bulk,
                adjustments: adj,
                expenses: exp,
                salesReturns: sr
            }
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
