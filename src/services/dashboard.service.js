import { prisma } from '../lib/prisma.js';
import {
    calculateTodayAnalytics,
    calculateWeeklyAnalytics,
    calculateMonthlyAnalytics,
    calculateYearlyAnalytics,
    calculatePaymentModeDistribution,
    calculateCategoryDistribution,
    calculateSlowMovingAging
} from './dashboard.helpers.js';

/**
 * Management Dashboard Service
 * Provides aggregated financial and operational insights
 */

async function getManagementInsights(query) {
    try {
        const { fromDate, toDate, branchId } = query;
        const from = fromDate ? new Date(fromDate) : new Date(new Date().setHours(0, 0, 0, 0));
        const to = toDate ? new Date(toDate) : new Date(new Date().setHours(23, 59, 59, 999));
        const commonWhere = { branchId: branchId ? parseInt(branchId) : undefined };

        // 1. Fetch all data segments in parallel
        const [
            salesData,
            collectionData,
            pipelineData,
            advanceData,
            expenseData,
            topProducts,
            recentDeliveries
        ] = await Promise.all([
            getSalesData(commonWhere, from, to),
            getCollectionData(commonWhere, from, to),
            getOrderPipeline(commonWhere),
            getCustomerAdvanceData(commonWhere, from, to),
            getExpenseData(commonWhere, from, to),
            getTopSellingProducts(commonWhere),
            getRecentDeliveries(commonWhere)
        ]);

        return {
            statusCode: 0,
            data: {
                kpis: {
                    todaySales: salesData.total,
                    todaySalesReturns: salesData.returnsTotal,
                    todayCollections: collectionData.total,
                    customerAdvances: advanceData.total,
                    customerAdvancesReceived: advanceData.advanceReceived,
                    customerAdvancesPayout: advanceData.advancePayout,
                    todayExpenses: expenseData.total,
                    pendingQuotations: pipelineData.quotationsCount,
                    pendingDeliveries: pipelineData.deliveriesCount
                },
                breakups: {
                    todaySales: salesData.breakup,
                    todaySalesReturns: salesData.returnsBreakup,
                    todayCollections: collectionData.breakup,
                    customerAdvances: advanceData.breakup,
                    todayExpenses: [...expenseData.breakup],
                    pendingQuotations: pipelineData.quotationsBreakup,
                    pendingDeliveries: pipelineData.deliveriesBreakup
                },
                topProducts,
                recentOrders: recentDeliveries
            }
        };
    } catch (error) {
        console.error("Dashboard Service Error:", error);
        return { statusCode: 1, message: error.message };
    }
}

// --- HELPER FUNCTIONS ---

async function getSalesData(where, from, to) {
    const posSales = await prisma.pos.findMany({
        where: { ...where, createdAt: { gte: from, lte: to }, isReturn: false },
        include: { Party: { select: { name: true } } }
    });

    const posReturns = await prisma.pos.findMany({
        where: { ...where, createdAt: { gte: from, lte: to }, isReturn: true },
        include: { Party: { select: { name: true } } }
    });

    const bulkSales = await prisma.salesDelivery.findMany({
        where: { ...where, createdAt: { gte: from, lte: to }, isDeleted: false },
        include: {
            Party: { select: { name: true } },
            SalesDeliveryItems: { select: { deliveryQty: true, price: true } }
        }
    });

    const bulkReturns = await prisma.salesReturn.findMany({
        where: { ...where, createdAt: { gte: from, lte: to }, isDeleted: false },
        include: {
            Party: { select: { name: true } },
            SalesReturnItems: { select: { qty: true, price: true } }
        }
    });

    const bulkSalesBreakup = bulkSales.map(s => {
        const amount = s.SalesDeliveryItems.reduce((acc, item) => acc + (parseFloat(item.deliveryQty || 0) * parseFloat(item.price || 0)), 0);
        return { id: s.docId || s.id, party: s.Party?.name || 'N/A', amount, type: 'Bulk' };
    });

    const bulkReturnsBreakup = bulkReturns.map(s => {
        const amount = s.SalesReturnItems.reduce((acc, item) => acc + (parseFloat(item.qty || 0) * parseFloat(item.price || 0)), 0);
        return { id: s.docId || s.id, party: s.Party?.name || 'N/A', amount, type: 'Bulk' };
    });


    const posTotal = posSales.reduce((acc, curr) => acc + parseFloat(curr.netAmount || 0), 0);
    const bulkTotal = bulkSalesBreakup.reduce((acc, curr) => acc + curr.amount, 0);

    const posReturnsTotal = posReturns.reduce((acc, curr) => acc + Math.abs(parseFloat(curr.netAmount || 0)), 0);
    const bulkReturnsTotal = bulkReturnsBreakup.reduce((acc, curr) => acc + Math.abs(parseFloat(curr.amount || 0)), 0);





    return {
        total: posTotal + bulkTotal,
        returnsTotal: posReturnsTotal + bulkReturnsTotal,
        breakup: [
            ...posSales.map(p => ({ id: p.docId || p.id, party: p.Party?.name || 'Walk-in', amount: parseFloat(p.netAmount || 0), type: 'POS' })),
            ...bulkSalesBreakup
        ],
        returnsBreakup: [
            ...posReturns.map(p => ({ id: p.docId || p.id, party: p.Party?.name || 'Walk-in', amount: parseFloat(p.netAmount || 0), type: 'POS' })),
            ...bulkReturnsBreakup
        ]
    };
}

async function getCollectionData(where, from, to) {
    const [bulkRaw, posRaw] = await Promise.all([
        prisma.payment.findMany({
            where: { ...where, date: { gte: from, lte: to }, isDeleted: false },
            include: { Party: { select: { name: true } } }
        }),
        prisma.posPayments.findMany({
            where: { date: { gte: from, lte: to } },
            include: { Pos: { select: { Party: { select: { name: true } } } } }
        })
    ]);

    const bulkBreakup = bulkRaw.map(c => ({
        id: c.docId || c.id, party: c.Party?.name || 'N/A', amount: c.paidAmount || 0, mode: c.paymentMode || 'Bulk', type: 'Bulk'
    }));
    const posBreakup = posRaw.map(c => ({
        id: c.id, party: c.Pos?.Party?.name || 'Walk-in', amount: c.paidAmount || 0, mode: 'POS Payment', type: 'POS'
    }));

    const total = bulkBreakup.reduce((a, b) => a + b.amount, 0) + posBreakup.reduce((a, b) => a + b.amount, 0);

    return { total, breakup: [...bulkBreakup, ...posBreakup] };
}

function calculateNetAmount(items = [], parent = {}) {
    const parseVal = (v) => {
        const p = parseFloat(v || 0);
        return Number.isFinite(p) ? p : 0;
    };

    const lineNetAmount = (items || []).reduce((acc, curr) => {
        const price = parseVal(curr?.price);
        const qty = parseVal(curr?.qty);
        const taxPercent = parseVal(curr?.taxPercent);
        const taxMethod = curr?.taxMethod || "Inclusive";
        const discountType = curr?.discountType;
        const discountValue = parseVal(curr?.discountValue);

        const gross = price * qty;
        let discountedAmount = gross;

        if (discountType === "Percentage") {
            discountedAmount = gross - (gross * discountValue) / 100;
        } else if (discountType === "Flat") {
            discountedAmount = gross - discountValue;
        }

        discountedAmount = Math.max(0, discountedAmount);

        if (taxMethod === "Inclusive" && taxPercent > 0) {
            return acc + discountedAmount;
        }

        return acc + discountedAmount + (discountedAmount * taxPercent) / 100;
    }, 0);

    const packingAmount = parent?.packingChargeEnabled ? parseVal(parent?.packingCharge) : 0;
    const shippingAmount = parent?.shippingChargeEnabled ? parseVal(parent?.shippingCharge) : 0;
    const courierAmount = parent?.courierChargeEnabled ? parseVal(parent?.courierCharge) : 0;

    return Math.round((lineNetAmount + packingAmount + shippingAmount + courierAmount) * 100) / 100;
}

async function getOrderPipeline(where) {
    const convertedIds = await prisma.saleorder.findMany({
        where: { isDeleted: false, quotationId: { not: null } },
        select: { quotationId: true }
    }).then(res => res.map(o => o.quotationId));

    const quotations = await prisma.quotation.findMany({
        where: { ...where, isDeleted: false, id: { notIn: convertedIds } },
        include: {
            Party: { select: { name: true } },
            QuotationItems: true
        }
    });

    const orders = await prisma.saleorder.findMany({
        where: { ...where, isDeleted: false },
        include: {
            Party: { select: { name: true } },
            SaleOrderItems: { include: { SalesDeliveryItems: { select: { deliveryQty: true } } } }
        },
        take: 100
    });

    const deliveriesBreakup = orders.filter(so =>
        so.SaleOrderItems.some(i => parseFloat(i.qty || 0) > i.SalesDeliveryItems.reduce((s, d) => s + parseFloat(d.deliveryQty || 0), 0))
    ).map(o => ({
        id: o.docId || o.id,
        party: o.Party?.name || 'N/A',
        amount: calculateNetAmount(o.SaleOrderItems, o),
        date: o.createdAt
    }));

    return {
        quotationsCount: quotations.length,
        quotationsBreakup: quotations.map(q => ({
            id: q.docId || q.id,
            party: q.Party?.name || 'N/A',
            amount: calculateNetAmount(q.QuotationItems, q),
            date: q.createdAt
        })),
        deliveriesCount: deliveriesBreakup.length,
        deliveriesBreakup
    };
}

async function getCustomerAdvanceData(where, from, to) {
    // Fetch all non-deleted ADVANCE payments for this branch within the date range
    const advances = await prisma.payment.findMany({
        where: {
            ...where,
            // paymentFlow: "Receipt",
            isDeleted: false,
            createdAt: { gte: from, lte: to }
        },
        include: {
            Party: { select: { name: true } }
        }
    });

    let advanceReceived = 0;
    let advancePayout = 0;

    const breakup = advances.map(adv => {
        const amount = parseFloat(adv.paidAmount || 0);
        const isPayout = adv.paymentFlow === "Payout";

        if (isPayout) {
            advancePayout += amount;
        } else {
            advanceReceived += amount;
        }

        return {
            id: adv.docId || adv.id,
            party: adv.Party?.name || 'Walk-in',
            amount: amount,
            mode: adv.paymentMode || 'N/A',
            flow: adv.paymentFlow || 'Receipt',
            type: 'Advance'
        };
    });

    const netAdvance = advanceReceived - advancePayout;

    return {
        total: netAdvance,
        advanceReceived,
        advancePayout,
        breakup
    };
}

async function getExpenseData(where, from, to) {
    const raw = await prisma.expenseEntryItems.findMany({
        where: { Expense: { ...where, date: { gte: from, lte: to } } },
        include: {
            ExpenseCategory: { select: { name: true } },
            Expense: { select: { docId: true } }
        }
    });

    console.log("raw", raw);

    const breakup = raw.map(e => ({
        id: e.Expense?.docId || String(e.id),
        category: e.ExpenseCategory?.name || 'Other',
        amount: parseFloat(e.amount || 0),
        note: e.description || e.referenceNo || '-'
    }));

    return {
        total: breakup.reduce((acc, e) => acc + e.amount, 0),
        breakup
    };
}

/**
 * Gets Top 5 Selling Products (Combined POS + Bulk)
 */
async function getTopSellingProducts(where) {
    // 1. Fetch Bulk Delivery Items
    const deliveryItems = await prisma.salesDeliveryItems.findMany({
        where: { SalesDelivery: { ...where, isDeleted: false } },
        include: { Item: { select: { name: true } } },
        take: 1000
    });

    // 2. Fetch POS Items
    const posItems = await prisma.posItems.findMany({
        where: { Pos: { ...where, isReturn: false } },
        include: { Item: { select: { name: true } } },
        take: 1000
    });

    const aggregationMap = {};

    // Aggregate Bulk
    deliveryItems.forEach(item => {
        const name = item.Item?.name || 'Unknown Item';
        const qty = parseFloat(item.deliveryQty || 0);
        aggregationMap[name] = (aggregationMap[name] || 0) + qty;
    });

    // Aggregate POS
    posItems.forEach(item => {
        const name = item.Item?.name || 'Unknown Item';
        const qty = parseFloat(item.qty || 0);
        aggregationMap[name] = (aggregationMap[name] || 0) + qty;
    });

    return Object.entries(aggregationMap)
        .map(([name, sales]) => ({ name, sales }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);
}

async function getRecentDeliveries(where) {
    const [posRaw, bulkRaw] = await Promise.all([
        prisma.pos.findMany({
            where: { ...where, isReturn: false },
            include: { Party: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
            take: 5
        }),
        prisma.salesDelivery.findMany({
            where: { ...where, isDeleted: false },
            include: { Party: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
            take: 5
        })
    ]);

    const pos = posRaw.map(p => ({
        id: p.docId || p.id,
        party: p.Party?.name || 'Walk-in',
        date: p.createdAt,
        type: 'POS'
    }));

    const bulk = bulkRaw.map(b => ({
        id: b.docId || b.id,
        party: b.Party?.name || 'N/A',
        date: b.createdAt,
        type: 'Bulk'
    }));

    return [...pos, ...bulk]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
}

async function getSalesAnalytics(query) {
    try {
        const { branchId, customerType, finYear, saleTypeFilter } = query;
        const branchFilter = branchId ? parseInt(branchId) : undefined;
        const commonWhere = { branchId: branchFilter };

        const now = new Date();

        // 1. Today Date Window
        const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
        const todayEnd = new Date(new Date().setHours(23, 59, 59, 999));

        // 2. Weekly Date Window (Last 7 days)
        const weeklyStart = new Date();
        weeklyStart.setDate(weeklyStart.getDate() - 6);
        weeklyStart.setHours(0, 0, 0, 0);

        // 3. Monthly Date Window (Last 30 days)
        const monthlyStart = new Date();
        monthlyStart.setDate(monthlyStart.getDate() - 29);
        monthlyStart.setHours(0, 0, 0, 0);

        // 4. Yearly Date Window (Last 12 months)
        const yearlyStart = new Date();
        yearlyStart.setMonth(yearlyStart.getMonth() - 11);
        yearlyStart.setDate(1);
        yearlyStart.setHours(0, 0, 0, 0);

        let queryStartDate = yearlyStart;
        let queryEndDate = now;

        if (finYear && finYear !== 'All') {
            const parts = finYear.split('-');
            const startYr = 2000 + parseInt(parts[0]);
            const endYr = 2000 + parseInt(parts[1]);

            // Use UTC directly to avoid IST offset shift
            queryStartDate = new Date(Date.UTC(startYr, 3, 1, 0, 0, 0, 0));     // April 1st UTC
            queryEndDate = new Date(Date.UTC(endYr, 2, 31, 23, 59, 59, 999));   // March 31st UTC
        }
        console.log(queryStartDate, queryEndDate, "queryStartDate, queryEndDate")

        // --- QUERY DATA ---
        const [posSalesRaw, bulkSalesRaw, posReturnsRaw, bulkReturnsRaw] = await Promise.all([
            prisma.pos.findMany({
                where: { ...commonWhere, createdAt: { gte: queryStartDate, lte: queryEndDate }, isReturn: false },
                include: {
                    Party: { select: { name: true } },
                    PosItems: { include: { Item: { include: { MainCategory: true } } } },
                    PosPayments: true
                }
            }),
            prisma.salesDelivery.findMany({
                where: { ...commonWhere, createdAt: { gte: queryStartDate, lte: queryEndDate }, isDeleted: false },
                include: {
                    Party: { select: { name: true } },
                    SalesDeliveryItems: { include: { Item: { include: { MainCategory: true } } } }
                }
            }),
            prisma.pos.findMany({
                where: { ...commonWhere, createdAt: { gte: queryStartDate, lte: queryEndDate }, isReturn: true }
            }),
            prisma.salesReturn.findMany({
                where: { ...commonWhere, createdAt: { gte: queryStartDate, lte: queryEndDate }, isDeleted: false },
                include: {
                    SalesReturnItems: true
                }
            })
        ]);

        let posSales = posSalesRaw;
        let bulkSales = bulkSalesRaw;
        let posReturns = posReturnsRaw;
        let bulkReturns = bulkReturnsRaw;

        if (customerType === 'B2B') {
            posSales = [];
            posReturns = [];
        } else if (customerType === 'B2C') {
            bulkSales = [];
            bulkReturns = [];
        }

        if (saleTypeFilter === 'Sales') {
            posReturns = [];
            bulkReturns = [];
        } else if (saleTypeFilter === 'Returns') {
            posSales = [];
            bulkSales = [];
        }


        const today = calculateTodayAnalytics(posSales, bulkSales, posReturns, bulkReturns, todayStart, todayEnd, saleTypeFilter);
        const weekly = calculateWeeklyAnalytics(posSales, bulkSales, posReturns, bulkReturns, weeklyStart, saleTypeFilter);
        const monthly = calculateMonthlyAnalytics(posSales, bulkSales, posReturns, bulkReturns, monthlyStart, now, saleTypeFilter);
        const yearly = calculateYearlyAnalytics(posSales, bulkSales, posReturns, bulkReturns, yearlyStart, saleTypeFilter);

        const paymentMode = calculatePaymentModeDistribution(posSales);
        const categoryDist = calculateCategoryDistribution(posSales, bulkSales);

        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);

        const allItems = await prisma.item.findMany({
            take: 50,
            select: { id: true, name: true, code: true, salesPrice: true }
        });

        const slowMoving = calculateSlowMovingAging(allItems, posSales, bulkSales, last30Days);

        return {
            statusCode: 0,
            data: {
                today,
                weekly,
                monthly,
                yearly,
                charts: {
                    paymentMode,
                    categoryDist
                },
                slowMoving: slowMoving.slowMoving,
                slowMovingAging: slowMoving.slowMovingAging,
                posSales,
                bulkSales,
                posReturns,
                bulkReturns
            }
        };

    } catch (error) {
        console.error("Dashboard Sales Analytics Error:", error);
        return { statusCode: 1, message: error.message };
    }
}

async function getSalesBreakup(query) {
    try {
        const { branchId, timeframe, filterValue, customerType, finYear, saleTypeFilter } = query;
        const branchFilter = branchId ? parseInt(branchId) : undefined;
        const commonWhere = { branchId: branchFilter };

        const now = new Date();
        let startDate, endDate;
        let isStockQuery = false;

        if (timeframe === 'today') {
            const [time, modifier] = filterValue.split(" ");
            let hr = parseInt(time.split(":")[0]);
            if (modifier === "PM" && hr !== 12) {
                hr += 12;
            }
            if (modifier === "AM" && hr === 12) {
                hr = 0;
            }
            startDate = new Date(new Date().setHours(hr, 0, 0, 0));
            endDate = new Date(new Date().setHours(hr + 1, 59, 59, 999));
        } else if (timeframe === 'weekly') {
            let targetDate = new Date();
            for (let i = 0; i < 7; i++) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                if (d.toLocaleDateString('en-US', { weekday: 'short' }) === filterValue) {
                    targetDate = d;
                    break;
                }
            }
            startDate = new Date(targetDate.setHours(0, 0, 0, 0));
            endDate = new Date(targetDate.setHours(23, 59, 59, 999));
        } else if (timeframe === 'monthly') {
            const wkNum = parseInt(filterValue.replace("Week ", "")) - 1;

            const daysAgoEnd = (3 - wkNum) * 7.5;
            const daysAgoStart = daysAgoEnd + 7.5;

            startDate = new Date();
            startDate.setDate(startDate.getDate() - daysAgoStart);
            startDate.setHours(0, 0, 0, 0);

            endDate = new Date();
            endDate.setDate(endDate.getDate() - daysAgoEnd);
            endDate.setHours(23, 59, 59, 999);
        } else if (timeframe === 'yearly') {
            let targetYear = now.getFullYear();
            let targetMonth = now.getMonth();
            for (let i = 0; i < 12; i++) {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                if (d.toLocaleString('en-US', { month: 'short' }) === filterValue) {
                    targetYear = d.getFullYear();
                    targetMonth = d.getMonth();
                    break;
                }
            }
            startDate = new Date(targetYear, targetMonth, 1, 0, 0, 0, 0);
            endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);
        } else if (timeframe === 'slow_moving') {
            isStockQuery = true;
            const [minDays, maxDays] = filterValue.split('-').map(Number);
            startDate = new Date();
            startDate.setDate(startDate.getDate() - maxDays);
            startDate.setHours(0, 0, 0, 0);

            endDate = new Date();
            endDate.setDate(endDate.getDate() - minDays);
            endDate.setHours(23, 59, 59, 999);
        }

        if (isStockQuery) {
            const allItems = await prisma.item.findMany({
                where: {
                    ...commonWhere,
                    createdAt: { gte: startDate, lte: endDate }
                },
                select: { id: true, name: true, code: true, salesPrice: true }
            });

            const finalItems = allItems.length > 0 ? allItems : await prisma.item.findMany({
                take: 12,
                select: { id: true, name: true, code: true, salesPrice: true }
            });

            const itemsBreakup = finalItems.map((it, idx) => ({
                id: it.code || `ITM-${it.id}`,
                party: it.name || "N/A",
                amount: parseFloat(it.salesPrice || 0),
                type: "Stock Item",
                ageDays: parseInt(filterValue.split('-')[0]) + (idx % 29)
            }));

            return {
                statusCode: 0,
                data: itemsBreakup
            };
        } else {
            const [posRaw, bulkRaw, bulkReturnsRaw] = await Promise.all([
                prisma.pos.findMany({
                    where: { ...commonWhere, createdAt: { gte: startDate, lte: endDate } },
                    include: { Party: { select: { name: true } } }
                }),
                prisma.salesDelivery.findMany({
                    where: { ...commonWhere, createdAt: { gte: startDate, lte: endDate }, isDeleted: false },
                    include: {
                        Party: { select: { name: true } },
                        SalesDeliveryItems: true
                    }
                }),
                prisma.salesReturn.findMany({
                    where: { ...commonWhere, createdAt: { gte: startDate, lte: endDate }, isDeleted: false },
                    include: {
                        Party: { select: { name: true } },
                        SalesReturnItems: true
                    }
                })
            ]);

            const getBulkAmount = (delivery) => {
                return (delivery.SalesDeliveryItems || []).reduce((acc, item) => {
                    return acc + (parseFloat(item.deliveryQty || 0) * parseFloat(item.price || 0));
                }, 0);
            };

            const getBulkReturnAmount = (ret) => {
                return (ret.SalesReturnItems || []).reduce((acc, item) => {
                    return acc + (parseFloat(item.qty || 0) * parseFloat(item.price || 0));
                }, 0);
            };

            const pos = posRaw.map(p => ({
                id: p.docId || p.id,
                party: p.Party?.name || 'Walk-in Customer',
                amount: Math.abs(parseFloat(p.netAmount || 0)),
                type: p.isReturn ? 'POS Return' : 'POS Sale',
                date: p.createdAt
            }));

            const bulk = bulkRaw.map(b => ({
                id: b.docId || b.id,
                party: b.Party?.name || 'N/A',
                amount: getBulkAmount(b),
                type: 'Bulk Delivery',
                date: b.createdAt
            }));

            const bulkReturns = bulkReturnsRaw.map(b => ({
                id: b.docId || b.id,
                party: b.Party?.name || 'N/A',
                amount: getBulkReturnAmount(b),
                type: 'Bulk Return',
                date: b.createdAt
            }));

            let finalPos = pos;
            let finalBulk = bulk;
            let finalBulkReturns = bulkReturns;

            if (customerType === 'B2B') {
                finalPos = [];
            } else if (customerType === 'B2C') {
                finalBulk = [];
                finalBulkReturns = [];
            }

            if (saleTypeFilter === 'Sales') {
                finalPos = finalPos.filter(p => !p.type.includes('Return'));
                finalBulkReturns = [];
            } else if (saleTypeFilter === 'Returns') {
                finalPos = finalPos.filter(p => p.type.includes('Return'));
                finalBulk = [];
            }

            const breakupList = [...finalPos, ...finalBulk, ...finalBulkReturns].sort((a, b) => new Date(b.date) - new Date(a.date));

            return {
                statusCode: 0,
                data: breakupList,
                pos,
                bulk,
                bulkReturns
            };
        }

    } catch (error) {
        console.error("Dashboard Sales Breakup Error:", error);
        return { statusCode: 1, message: error.message };
    }
}

export { getManagementInsights, getSalesAnalytics, getSalesBreakup };
