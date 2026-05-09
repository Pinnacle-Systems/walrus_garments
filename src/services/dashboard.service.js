import { prisma } from '../lib/prisma.js';

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
            getCustomerAdvanceData(commonWhere),
            getExpenseData(commonWhere, from, to),
            getTopSellingProducts(commonWhere),
            getRecentDeliveries(commonWhere)
        ]);

        // 2. Prepare Final Response
        return {
            statusCode: 0,
            data: {
                kpis: {
                    todaySales: salesData.total,
                    todayCollections: collectionData.total,
                    customerAdvances: advanceData.total,
                    todayExpenses: expenseData.total + salesData.returnsTotal,
                    pendingQuotations: pipelineData.quotationsCount,
                    pendingDeliveries: pipelineData.deliveriesCount
                },
                breakups: {
                    todaySales: salesData.breakup,
                    todayCollections: collectionData.breakup,
                    customerAdvances: advanceData.breakup,
                    todayExpenses: [...expenseData.breakup, ...salesData.returnsBreakup],
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

    const posTotal = posSales.reduce((acc, curr) => acc + parseFloat(curr.netAmount || 0), 0);
    const returnsTotal = posReturns.reduce((acc, curr) => acc + Math.abs(parseFloat(curr.netAmount || 0)), 0);
    
    const bulkBreakup = bulkSales.map(s => {
        const amount = s.SalesDeliveryItems.reduce((acc, item) => acc + (parseFloat(item.deliveryQty || 0) * parseFloat(item.price || 0)), 0);
        return { id: s.docId || s.id, party: s.Party?.name || 'N/A', amount, type: 'Bulk' };
    });
    const bulkTotal = bulkBreakup.reduce((acc, curr) => acc + curr.amount, 0);

    return {
        total: posTotal + bulkTotal,
        returnsTotal,
        breakup: [
            ...posSales.map(p => ({ id: p.docId || p.id, party: p.Party?.name || 'Walk-in', amount: parseFloat(p.netAmount || 0), type: 'POS' })),
            ...bulkBreakup
        ],
        returnsBreakup: posReturns.map(p => ({
            category: 'Sales Returns',
            amount: Math.abs(parseFloat(p.netAmount || 0)),
            note: `Return from ${p.Party?.name || 'Walk-in'} (${p.docId || p.id})`
        }))
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

async function getOrderPipeline(where) {
    const convertedIds = await prisma.saleorder.findMany({
        where: { isDeleted: false, quotationId: { not: null } },
        select: { quotationId: true }
    }).then(res => res.map(o => o.quotationId));

    const quotations = await prisma.quotation.findMany({
        where: { ...where, isDeleted: false, id: { notIn: convertedIds } },
        include: { Party: { select: { name: true } } }
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
    ).map(o => ({ id: o.docId || o.id, party: o.Party?.name || 'N/A', amount: parseFloat(o.totalAmount || 0), date: o.createdAt }));

    return {
        quotationsCount: quotations.length,
        quotationsBreakup: quotations.map(q => ({ id: q.docId || q.id, party: q.Party?.name || 'N/A', amount: parseFloat(q.totalAmount || 0), date: q.createdAt })),
        deliveriesCount: deliveriesBreakup.length,
        deliveriesBreakup
    };
}

async function getCustomerAdvanceData(where) {
    const parties = await prisma.party.findMany({
        where: { active: true, isClient: true },
        select: { id: true, name: true }
    });

    const breakup = await Promise.all(parties.slice(0, 50).map(async (p) => {
        const salesRaw = await prisma.salesDeliveryItems.findMany({
            where: { SalesDelivery: { customerId: p.id, isDeleted: false, ...where } },
            select: { deliveryQty: true, price: true }
        });
        const salesTotal = salesRaw.reduce((a, b) => a + (parseFloat(b.deliveryQty || 0) * parseFloat(b.price || 0)), 0);
        
        const payments = await prisma.payment.aggregate({
            where: { partyId: p.id, isDeleted: false, ...where },
            _sum: { paidAmount: true }
        });
        
        const paidAmount = payments._sum.paidAmount || 0;
        const advance = paidAmount - salesTotal;
        return { party: p.name, amount: advance };
    }));

    const filtered = breakup.filter(b => b.amount > 0).sort((a, b) => b.amount - a.amount);
    return { total: filtered.reduce((a, b) => a + b.amount, 0), breakup: filtered.slice(0, 20) };
}

async function getExpenseData(where, from, to) {
    const raw = await prisma.expenseEntryItems.findMany({
        where: { Expense: { ...where, date: { gte: from, lte: to } } },
        include: { ExpenseCategory: { select: { name: true } } }
    });

    const breakup = raw.map(e => ({
        category: e.ExpenseCategory?.name || 'Other',
        amount: parseFloat(e.amount || 0),
        note: e.note || '-'
    }));

    return { total: breakup.reduce((a, b) => a + b.amount, 0), breakup };
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

export { getManagementInsights };
