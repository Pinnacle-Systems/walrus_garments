import { prisma } from '../lib/prisma.js';

async function getSalesReport(query) {
    try {
        const { fromDate, toDate, branchId, saleType = 'ALL' } = query;

        const from = fromDate ? new Date(fromDate) : undefined;
        const to = toDate ? new Date(toDate) : undefined;

        if (from) from.setHours(0, 0, 0, 0);
        if (to) to.setHours(23, 59, 59, 999);

        const commonWhere = {
            branchId: branchId ? parseInt(branchId) : undefined,
            // createdAt: {
            //     gte: from,
            //     lte: to
            // }
        };

        let posSales = [];
        let bulkSales = [];
        let expenses = [];

        if (saleType === 'ALL' || saleType === 'POS') {
            posSales = await prisma.pos.findMany({
                where: commonWhere,
                include: {
                    Party: true,
                    PosPayments: true
                },
                orderBy: { createdAt: 'desc' }
            });
        }

        if (saleType === 'ALL' || saleType === 'BULK') {
            bulkSales = await prisma.salesInvoice.findMany({
                where: commonWhere,
                include: {
                    Party: true,
                    SalesInvoiceItems: true
                },
                orderBy: { createdAt: 'desc' }
            });
        }

        if (saleType === 'ALL' || saleType === 'EXPENSE') {
            expenses = await prisma.Expense.findMany({
                where: commonWhere,
                include: {
                    ExpenseEntryItems: true
                },
                // orderBy: { createdAt: 'desc' }
            });
        }

        console.log(expenses, "expenses")

        // Format POS Sales
        const formattedPos = posSales.map(sale => {
            const payments = sale.PosPayments || [];
            const getPayment = (mode) => {
                const p = payments.find(pay => pay.paymentMode && pay.paymentMode.toLowerCase() === mode.toLowerCase());
                return parseFloat(p?.amount || 0);
            };

            return {
                id: `pos-${sale.id}`,
                date: sale.date || sale.createdAt,
                docId: sale.docId,
                customerName: sale.Party?.name || 'Walk-in',
                type: 'POS',
                cash: getPayment('Cash'),
                upi: getPayment('UPI'),
                card: getPayment('Card'),
                online: getPayment('Online'),
                totalAmount: parseFloat(sale.netAmount || 0)
            };
        });

        // Format Bulk Sales
        const formattedBulk = bulkSales.map(sale => {
            const itemsAmount = (sale.SalesInvoiceItems || []).reduce((acc, curr) => {
                const price = parseFloat(curr.price || 0);
                const qty = parseFloat(curr.qty || 0);
                const taxPercent = parseFloat(curr.taxPercent || 0);
                const taxMethod = curr.taxMethod || "Inclusive";
                const lineDiscountType = curr.discountType;
                const lineDiscountValue = parseFloat(curr.discountValue || 0);

                let rowTotal = price * qty;
                if (lineDiscountType === "Percentage") {
                    rowTotal -= (rowTotal * lineDiscountValue) / 100;
                } else if (lineDiscountType === "Flat") {
                    rowTotal -= lineDiscountValue;
                }
                rowTotal = Math.max(0, rowTotal);

                if (taxMethod === "Exclusive") {
                    rowTotal += (rowTotal * taxPercent) / 100;
                }

                return acc + rowTotal;
            }, 0);

            const packingCharge = parseFloat(sale.packingCharge || 0);
            const shippingCharge = parseFloat(sale.shippingCharge || 0);
            const netAmount = itemsAmount + packingCharge + shippingCharge;

            return {
                id: `bulk-${sale.id}`,
                date: sale.date || sale.createdAt,
                docId: sale.docId,
                customerName: sale.Party?.name || '',
                type: 'Bulk',
                cash: 0,
                upi: 0,
                card: 0,
                online: 0,
                totalAmount: netAmount
            };
        });

        // Format Expenses
        const formattedExpenses = expenses.map(expense => {
            const totalAmount = (expense.ExpenseEntryItems || []).reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);

            return {
                id: `expense-${expense.id}`,
                date: expense.date || expense.createdAt,
                docId: expense.docId,
                customerName: 'Expense',
                type: 'Expense',
                cash: 0, // We could potentially extract payment method from items if needed
                upi: 0,
                card: 0,
                online: 0,
                totalAmount: totalAmount
            };
        });

        const allSales = [...formattedPos, ...formattedBulk, ...formattedExpenses].sort((a, b) => new Date(b.date) - new Date(a.date));

        return { statusCode: 0, data: allSales };
    } catch (error) {
        console.error("Sales Report Service Error:", error);
        return { statusCode: 1, message: error.message };
    }
}

async function getSalesmanSummaryReport(query) {
    try {
        const { fromDate, toDate, branchId, salesPersonId, performanceFilter } = query;

        const from = fromDate ? new Date(fromDate) : undefined;
        const to = toDate ? new Date(toDate) : undefined;

        if (from) from.setHours(0, 0, 0, 0);
        if (to) to.setHours(23, 59, 59, 999);

        const posItems = await prisma.posItems.findMany({
            where: {
                salesPersonId: salesPersonId ? parseInt(salesPersonId) : undefined,
                Pos: {
                    branchId: branchId ? parseInt(branchId) : undefined,
                    // date: {
                    //     gte: from,
                    //     lte: to
                    // },
                    approvalStatus: { not: "PENDING" } // Only include processed sales
                }
            },
            include: {
                Employee: true,
                Pos: true
            }
        });


        // Group by Salesman
        const salesmanMap = {};

        posItems.forEach(item => {
            const salesmanId = item.salesPersonId || 0;
            const salesmanName = item.Employee?.name || 'Unassigned';
            const salesmanCode = item?.Employee?.employeeId || 'N/A';

            if (!salesmanMap[salesmanId]) {
                salesmanMap[salesmanId] = {
                    id: salesmanId,
                    name: salesmanName,
                    code: salesmanCode,
                    totalBills: new Set(),
                    totalQty: 0,
                    totalAmount: 0,
                    returnQty: 0,
                    returnAmount: 0
                };
            }

            const qty = parseFloat(item.qty || 0);
            const price = parseFloat(item.price || 0);
            const amount = qty * price;

            if (item.isReturn) {
                salesmanMap[salesmanId].returnQty += qty;
                salesmanMap[salesmanId].returnAmount += amount;
            } else {
                salesmanMap[salesmanId].totalQty += qty;
                salesmanMap[salesmanId].totalAmount += amount;
                if (item.PosId) {
                    salesmanMap[salesmanId].totalBills.add(item.PosId);
                }
            }
        });

        let result = Object.values(salesmanMap).map(s => ({
            ...s,
            totalBills: s.totalBills.size,
            netQty: s.totalQty - s.returnQty,
            netAmount: s.totalAmount - s.returnAmount
        }));

        // Apply performance filter (sorting)
        if (performanceFilter === 'HIGHEST') {
            result.sort((a, b) => b.netAmount - a.netAmount);
        } else if (performanceFilter === 'LOWEST') {
            result.sort((a, b) => a.netAmount - b.netAmount);
        }

        return { statusCode: 0, data: result };
    } catch (error) {
        console.error("Salesman Summary Report Service Error:", error);
        return { statusCode: 1, message: error.message };
    }
}

async function getOnlineSalesDeliveryReport(query) {
    try {
        const { fromDate, toDate, branchId, challanType, orderBy = 'itemName', sortOrder = 'asc' } = query;

        const from = fromDate ? new Date(fromDate) : undefined;
        const to = toDate ? new Date(toDate) : undefined;

        if (from) from.setHours(0, 0, 0, 0);
        if (to) to.setHours(23, 59, 59, 999);

        const challanItems = await prisma.deliveryChallanItems.findMany({
            where: {
                DeliveryChallan: {
                    branchId: branchId ? parseInt(branchId) : undefined,
                    date: {
                        gte: from,
                        lte: to
                    },
                    platform: { not: "" },
                    challanType: challanType || undefined
                }
            },
            include: {
                DeliveryChallan: true,
                Item: true,
                Size: true,
                Color: true
            }
        });

        // Group by Item + Size + Color
        const itemMap = {};

        challanItems.forEach(item => {
            const key = `${item.itemId}-${item.sizeId}-${item.colorId}`;
            const itemName = item.Item?.name || 'Unknown Item';
            const sizeName = item.Size?.name || 'N/A';
            const colorName = item.Color?.name || 'N/A';
            const platform = item.DeliveryChallan?.platform || 'N/A';

            if (!itemMap[key]) {
                itemMap[key] = {
                    key,
                    itemName,
                    sizeName,
                    colorName,
                    platform,
                    inwardQty: 0,
                    outwardQty: 0,
                    inwardAmount: 0,
                    outwardAmount: 0
                };
            }

            const qty = parseFloat(item.qty || 0);
            const price = parseFloat(item.price || 0);
            const amount = qty * price;

            if (item.DeliveryChallan?.challanType === "DcOutward") {
                itemMap[key].outwardQty += qty;
                itemMap[key].outwardAmount += amount;
            } else {
                itemMap[key].inwardQty += qty;
                itemMap[key].inwardAmount += amount;
            }
        });

        let result = Object.values(itemMap).map(i => ({
            ...i,
            netQty: i.inwardQty - i.outwardQty,
            netAmount: i.inwardAmount - i.outwardAmount
        }));

        // Sorting logic
        result.sort((a, b) => {
            let valA = a[orderBy];
            let valB = b[orderBy];

            if (typeof valA === 'string') {
                valA = valA.toLowerCase();
                valB = valB.toLowerCase();
            }

            if (sortOrder === 'desc') {
                return valB > valA ? 1 : -1;
            } else {
                return valA > valB ? 1 : -1;
            }
        });

        return { statusCode: 0, data: result };
    } catch (error) {
        console.error("Online Sales Delivery Report Service Error:", error);
        return { statusCode: 1, message: error.message };
    }
}

export { getSalesReport, getSalesmanSummaryReport, getOnlineSalesDeliveryReport };
