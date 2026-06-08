import { prisma } from '../lib/prisma.js';
import { getFinYearStartTimeEndTime } from '../utils/finYearHelper.js';

function parseAmount(val) {
    const parsed = parseFloat(val || 0);
    return Number.isFinite(parsed) ? parsed : 0;
}

function getYearShortCode(fromDate, toDate) {
    if (!fromDate || !toDate) return "";
    const startYr = new Date(fromDate).getFullYear().toString().slice(-2);
    const endYr = new Date(toDate).getFullYear().toString().slice(-2);
    return `${startYr}-${endYr}`;
}

function calculateHeaderTotal(items = [], header = {}, isReturn = false) {
    const lineTotal = items.reduce((acc, curr) => {
        const price = parseAmount(curr.price);
        const qty = parseAmount(isReturn ? curr.qty : (curr.deliveryQty || curr.qty));

        const taxPercent = parseAmount(curr.taxPercent || curr.SalesDeliveryItems?.taxPercent);
        const taxMethod = curr.taxMethod || curr.SalesDeliveryItems?.taxMethod || "Inclusive";
        const discountType = curr.discountType || curr.SalesDeliveryItems?.discountType;
        const discountValue = parseAmount(curr.discountValue || curr.SalesDeliveryItems?.discountValue);

        let rowTotal = price * qty;
        if (discountType === "Percentage") {
            rowTotal -= (rowTotal * discountValue) / 100;
        } else if (discountType === "Flat") {
            rowTotal -= discountValue;
        }
        rowTotal = Math.max(0, rowTotal);

        if (taxMethod === "Exclusive") {
            rowTotal += (rowTotal * taxPercent) / 100;
        }
        return acc + rowTotal;
    }, 0);

    let packing = 0;
    let shipping = 0;
    let courier = 0;
    let returnChargeAmount = 0;

    if (!isReturn) {
        packing = header.packingChargeEnabled ? parseAmount(header.packingCharge) : 0;
        shipping = header.shippingChargeEnabled ? parseAmount(header.shippingCharge) : 0;
        courier = header.courierChargeEnabled ? parseAmount(header.courierCharge) : 0;
    } else {
        if (header.returnChargeEnabled) {
            const rawCharge = parseAmount(header.returnCharge);
            if (header.returnChargeType === "Percentage") {
                returnChargeAmount = (lineTotal * rawCharge) / 100;
            } else {
                returnChargeAmount = rawCharge;
            }
        }
    }

    const netTotal = isReturn ? (lineTotal - returnChargeAmount) : (lineTotal + packing + shipping + courier);
    return Math.round(netTotal * 100) / 100;
}

function calculateItemsWithDistributedCharges(items = [], header = {}, isReturn = false) {
    // 1. Calculate raw row totals for each item
    const rawItems = items.map(curr => {
        const price = parseAmount(curr.price);
        const qty = parseAmount(isReturn ? curr.qty : (curr.deliveryQty || curr.qty));

        const taxPercent = parseAmount(curr.taxPercent || curr.SalesDeliveryItems?.taxPercent);
        const taxMethod = curr.taxMethod || curr.SalesDeliveryItems?.taxMethod || "Inclusive";
        const discountType = curr.discountType || curr.SalesDeliveryItems?.discountType;
        const discountValue = parseAmount(curr.discountValue || curr.SalesDeliveryItems?.discountValue);

        let rowTotal = price * qty;
        if (discountType === "Percentage") {
            rowTotal -= (rowTotal * discountValue) / 100;
        } else if (discountType === "Flat") {
            rowTotal -= discountValue;
        }
        rowTotal = Math.max(0, rowTotal);

        if (taxMethod === "Exclusive") {
            rowTotal += (rowTotal * taxPercent) / 100;
        }
        
        return {
            itemRef: curr,
            price,
            qty,
            rawRowTotal: rowTotal
        };
    });

    const lineTotalSum = rawItems.reduce((acc, curr) => acc + curr.rawRowTotal, 0);

    // 2. Determine header-level adjustment
    let headerCharges = 0;
    if (!isReturn) {
        const packing = header.packingChargeEnabled ? parseAmount(header.packingCharge) : 0;
        const shipping = header.shippingChargeEnabled ? parseAmount(header.shippingCharge) : 0;
        const courier = header.courierChargeEnabled ? parseAmount(header.courierCharge) : 0;
        headerCharges = packing + shipping + courier;
    } else {
        if (header.returnChargeEnabled) {
            const rawCharge = parseAmount(header.returnCharge);
            const returnChargeAmount = header.returnChargeType === "Percentage"
                ? (lineTotalSum * rawCharge) / 100
                : rawCharge;
            headerCharges = -returnChargeAmount;
        }
    }

    // 3. Distribute charges/credits proportionally
    return rawItems.map(item => {
        let adjustedTotal = item.rawRowTotal;
        if (lineTotalSum > 0) {
            const share = item.rawRowTotal / lineTotalSum;
            adjustedTotal += share * headerCharges;
        }
        return {
            ...item,
            adjustedTotal: Math.round(adjustedTotal * 100) / 100
        };
    });
}

async function getTotalSales(req) {
    try {
        const { companyId, branchId, finYearId, SalesType = 'All' } = req.query;

        // 1. Resolve branch filters
        let targetBranchIds = [];
        if (branchId) {
            targetBranchIds = [parseInt(branchId)];
        } else if (companyId) {
            const branches = await prisma.branch.findMany({
                where: { companyId: parseInt(companyId), active: true },
                select: { id: true }
            });
            targetBranchIds = branches.map(b => b.id);
        }

        const branchFilter = targetBranchIds.length > 0 ? { in: targetBranchIds } : undefined;

        // 2. Fetch financial years to evaluate
        let finYears = [];
        if (finYearId) {
            const fy = await prisma.finYear.findUnique({
                where: { id: parseInt(finYearId) },
                include: { Company: { select: { name: true } } }
            });
            if (fy) finYears = [fy];
        } else {
            finYears = await prisma.finYear.findMany({
                where: {
                    companyId: companyId ? parseInt(companyId) : undefined,
                    active: true
                },
                include: { Company: { select: { name: true } } },
                orderBy: { from: 'asc' }
            });
        }

        const data = await Promise.all(
            finYears.map(async (fy) => {
                const boundaries = await getFinYearStartTimeEndTime(fy.id);
                if (!boundaries) {
                    return {
                        year: getYearShortCode(fy.from, fy.to),
                        company: fy.Company?.name || 'N/A',
                        totalSales: 0,
                        b2bSales: 0,
                        b2cSales: 0
                    };
                }

                const { startDateStartTime, endDateEndTime } = boundaries;

                const dateFilter = {
                    OR: [
                        { date: { gte: startDateStartTime, lte: endDateEndTime } },
                        { date: null, createdAt: { gte: startDateStartTime, lte: endDateEndTime } }
                    ]
                };

                const commonWhere = {
                    branchId: branchFilter,
                    ...dateFilter
                };

                // Fetch B2C Pos records
                const posRecords = await prisma.pos.findMany({
                    where: {
                        ...commonWhere,
                        isCancel: false
                    },
                    select: {
                        netAmount: true,
                        isReturn: true
                    }
                });

                // Fetch B2B Sales Delivery records
                const deliveries = await prisma.salesDelivery.findMany({
                    where: {
                        ...commonWhere,
                        isDeleted: false,
                        status: "APPROVED"
                    },
                    include: {
                        SalesDeliveryItems: true
                    }
                });

                // Fetch B2B Sales Return records
                const salesReturns = await prisma.salesReturn.findMany({
                    where: {
                        ...commonWhere,
                        isDeleted: false
                    },
                    include: {
                        SalesReturnItems: {
                            include: {
                                SalesDeliveryItems: true
                            }
                        }
                    }
                });

                // Calculate B2C Totals
                let posSalesTotal = 0;
                let posReturnTotal = 0;
                posRecords.forEach((rec) => {
                    const amt = parseAmount(rec.netAmount);
                    if (rec.isReturn) {
                        posReturnTotal += amt;
                    } else {
                        posSalesTotal += amt;
                    }
                });
                const b2cTotal = posSalesTotal - posReturnTotal;

                // Calculate B2B Totals
                const b2bSalesTotal = deliveries.reduce(
                    (sum, del) => sum + calculateHeaderTotal(del.SalesDeliveryItems, del, false),
                    0
                );
                const b2bReturnTotal = salesReturns.reduce(
                    (sum, ret) => sum + calculateHeaderTotal(ret.SalesReturnItems, ret, true),
                    0
                );
                const b2bTotal = b2bSalesTotal - b2bReturnTotal;

                const salesTotal = posSalesTotal + b2bSalesTotal;
                const returnTotal = posReturnTotal + b2bReturnTotal;

                let finalTotal = 0;
                if (SalesType === "Sales") {
                    finalTotal = salesTotal;
                } else if (SalesType === "Returns") {
                    finalTotal = returnTotal;
                } else {
                    finalTotal = salesTotal - returnTotal;
                }

                return {
                    year: getYearShortCode(fy.from, fy.to),
                    finYearId: fy.id,
                    company: fy.Company?.name || 'N/A',
                    totalSales: Math.round(finalTotal * 100) / 100,
                    salesTotal: Math.round(salesTotal * 100) / 100,
                    returnTotal: Math.round(returnTotal * 100) / 100,
                    b2bSales: Math.round(b2bTotal * 100) / 100,
                    b2cSales: Math.round(b2cTotal * 100) / 100
                };
            })
        );

        return { statusCode: 0, data };
    } catch (error) {
        console.error("Error in getTotalSales service:", error.message);
        return { statusCode: 1, message: error.message || "Failed to calculate total sales." };
    }
}

async function getYearlySales(req) {
    try {
        const { year, selectedCompany, type = 'All', SalesType = 'All' } = req.query;

        if (!year) {
            return { statusCode: 1, message: "year is required." };
        }

        // 1. Find financial years matching the year code (e.g. "25-26")
        const finYears = await prisma.finYear.findMany({
            include: { Company: true }
        });

        const targetFinYears = finYears.filter(fy => getYearShortCode(fy.from, fy.to) === year);
        if (targetFinYears.length === 0) {
            return { statusCode: 0, data: [] };
        }

        let results = [];

        // 2. Decide grouping strategy: Group by Branch or Group by Company
        const isGroupingByBranch = selectedCompany && selectedCompany !== "All";

        if (isGroupingByBranch) {
            // Find the company matching selectedCompany
            const company = await prisma.company.findFirst({
                where: { name: selectedCompany, active: true }
            });
            if (!company) {
                return { statusCode: 0, data: [] };
            }

            // Find target financial year for this specific company
            const fy = targetFinYears.find(f => f.companyId === company.id);
            if (!fy) {
                return { statusCode: 0, data: [] };
            }

            // Get boundaries for this financial year
            const boundaries = await getFinYearStartTimeEndTime(fy.id);
            if (!boundaries) return { statusCode: 0, data: [] };

            const { startDateStartTime, endDateEndTime } = boundaries;
            const dateFilter = {
                OR: [
                    { date: { gte: startDateStartTime, lte: endDateEndTime } },
                    { date: null, createdAt: { gte: startDateStartTime, lte: endDateEndTime } }
                ]
            };

            // Fetch branches of this company
            const branches = await prisma.branch.findMany({
                where: { companyId: company.id, active: true }
            });

            for (const branch of branches) {
                const commonWhere = {
                    branchId: branch.id,
                    ...dateFilter
                };

                let posSalesTotal = 0;
                let posReturnTotal = 0;
                let b2bSalesTotal = 0;
                let b2bReturnTotal = 0;

                if (type === 'All' || type === 'B2C') {
                    const posRecords = await prisma.pos.findMany({
                        where: { ...commonWhere, isCancel: false },
                        select: { netAmount: true, isReturn: true }
                    });
                    posRecords.forEach(rec => {
                        const amt = parseAmount(rec.netAmount);
                        if (rec.isReturn) posReturnTotal += amt;
                        else posSalesTotal += amt;
                    });
                }

                if (type === 'All' || type === 'B2B') {
                    const deliveries = await prisma.salesDelivery.findMany({
                        where: { ...commonWhere, isDeleted: false, status: "APPROVED" },
                        include: { SalesDeliveryItems: true }
                    });
                    const salesReturns = await prisma.salesReturn.findMany({
                        where: { ...commonWhere, isDeleted: false },
                        include: {
                            SalesReturnItems: {
                                include: { SalesDeliveryItems: true }
                            }
                        }
                    });

                    b2bSalesTotal = deliveries.reduce(
                        (sum, del) => sum + calculateHeaderTotal(del.SalesDeliveryItems, del, false),
                        0
                    );
                    b2bReturnTotal = salesReturns.reduce(
                        (sum, ret) => sum + calculateHeaderTotal(ret.SalesReturnItems, ret, true),
                        0
                    );
                }

                const salesTotal = posSalesTotal + b2bSalesTotal;
                const returnTotal = posReturnTotal + b2bReturnTotal;

                let finalTotal = 0;
                if (SalesType === "Sales") {
                    finalTotal = salesTotal;
                } else if (SalesType === "Returns") {
                    finalTotal = returnTotal;
                } else {
                    finalTotal = salesTotal - returnTotal;
                }

                results.push({
                    company: branch.branchName, // frontend displays this as label
                    totalSales: Math.max(0, Math.round(finalTotal * 100) / 100),
                    salesTotal: Math.round(salesTotal * 100) / 100,
                    returnTotal: Math.round(returnTotal * 100) / 100
                });
            }
        } else {
            // Group by Company
            for (const fy of targetFinYears) {
                const boundaries = await getFinYearStartTimeEndTime(fy.id);
                if (!boundaries) continue;

                const { startDateStartTime, endDateEndTime } = boundaries;
                const dateFilter = {
                    OR: [
                        { date: { gte: startDateStartTime, lte: endDateEndTime } },
                        { date: null, createdAt: { gte: startDateStartTime, lte: endDateEndTime } }
                    ]
                };

                // Get branch IDs for this company
                const branches = await prisma.branch.findMany({
                    where: { companyId: fy.companyId, active: true },
                    select: { id: true }
                });
                const branchIds = branches.map(b => b.id);

                if (branchIds.length === 0) continue;

                const commonWhere = {
                    branchId: { in: branchIds },
                    ...dateFilter
                };

                let posSalesTotal = 0;
                let posReturnTotal = 0;
                let b2bSalesTotal = 0;
                let b2bReturnTotal = 0;

                if (type === 'All' || type === 'B2C') {
                    const posRecords = await prisma.pos.findMany({
                        where: { ...commonWhere, isCancel: false },
                        select: { netAmount: true, isReturn: true }
                    });
                    posRecords.forEach(rec => {
                        const amt = parseAmount(rec.netAmount);
                        if (rec.isReturn) posReturnTotal += amt;
                        else posSalesTotal += amt;
                    });
                }

                if (type === 'All' || type === 'B2B') {
                    const deliveries = await prisma.salesDelivery.findMany({
                        where: { ...commonWhere, isDeleted: false, status: "APPROVED" },
                        include: { SalesDeliveryItems: true }
                    });
                    const salesReturns = await prisma.salesReturn.findMany({
                        where: { ...commonWhere, isDeleted: false },
                        include: {
                            SalesReturnItems: {
                                include: { SalesDeliveryItems: true }
                            }
                        }
                    });

                    b2bSalesTotal = deliveries.reduce(
                        (sum, del) => sum + calculateHeaderTotal(del.SalesDeliveryItems, del, false),
                        0
                    );
                    b2bReturnTotal = salesReturns.reduce(
                        (sum, ret) => sum + calculateHeaderTotal(ret.SalesReturnItems, ret, true),
                        0
                    );
                }

                const salesTotal = posSalesTotal + b2bSalesTotal;
                const returnTotal = posReturnTotal + b2bReturnTotal;

                let finalTotal = 0;
                if (SalesType === "Sales") {
                    finalTotal = salesTotal;
                } else if (SalesType === "Returns") {
                    finalTotal = returnTotal;
                } else {
                    finalTotal = salesTotal - returnTotal;
                }

                results.push({
                    company: fy.Company?.name || 'N/A',
                    totalSales: Math.max(0, Math.round(finalTotal * 100) / 100),
                    salesTotal: Math.round(salesTotal * 100) / 100,
                    returnTotal: Math.round(returnTotal * 100) / 100
                });
            }
        }

        return { statusCode: 0, data: results };
    } catch (error) {
        console.error("Error in getYearlySales service:", error.message);
        return { statusCode: 1, message: error.message || "Failed to calculate yearly sales." };
    }
}
async function getQuarterSales(req) {
    try {
        const { selectedYear, selectedCompany, type = 'All', SalesType = 'All' } = req.query;

        if (!selectedYear) {
            return { statusCode: 1, message: "selectedYear is required." };
        }

        // 1. Find the target financial year(s) matching the selectedYear short code (e.g. "25-26")
        const finYears = await prisma.finYear.findMany({
            include: { Company: true }
        });

        let targetFinYears = [];
        if (selectedYear === "All") {
            const uniqueYears = new Map();
            finYears.forEach(fy => {
                const code = getYearShortCode(fy.from, fy.to);
                if (!uniqueYears.has(code)) {
                    uniqueYears.set(code, fy);
                }
            });
            targetFinYears = Array.from(uniqueYears.values());
        } else {
            const targetFinYear = finYears.find(fy => getYearShortCode(fy.from, fy.to) === selectedYear);
            if (!targetFinYear) {
                return { statusCode: 1, message: `Financial year code ${selectedYear} not found.` };
            }
            targetFinYears = [targetFinYear];
        }

        // 2. Resolve branch filters based on selectedCompany name
        let branchFilter = undefined;
        if (selectedCompany && selectedCompany !== "All") {
            const company = await prisma.company.findFirst({
                where: { name: selectedCompany, active: true },
                select: { id: true }
            });
            if (company) {
                const branches = await prisma.branch.findMany({
                    where: { companyId: company.id, active: true },
                    select: { id: true }
                });
                branchFilter = { in: branches.map(b => b.id) };
            } else {
                const branch = await prisma.branch.findFirst({
                    where: { branchName: selectedCompany, active: true },
                    select: { id: true }
                });
                if (branch) {
                    branchFilter = branch.id;
                }
            }
        }

        // 3. Get start & end time for the financial year
        let dateFilters = [];
        for (const fy of targetFinYears) {
            const boundaries = await getFinYearStartTimeEndTime(fy.id);
            if (boundaries) {
                dateFilters.push({ date: { gte: boundaries.startDateStartTime, lte: boundaries.endDateEndTime } });
                dateFilters.push({ date: null, createdAt: { gte: boundaries.startDateStartTime, lte: boundaries.endDateEndTime } });
            }
        }

        if (dateFilters.length === 0) {
            return { statusCode: 0, data: [] };
        }

        const commonWhere = {
            branchId: branchFilter,
            OR: dateFilters
        };

        // 4. Fetch sales transactions based on type filter ('All', 'B2B', 'B2C')
        let posRecords = [];
        let deliveries = [];
        let salesReturns = [];

        if (type === 'All' || type === 'B2C') {
            posRecords = await prisma.pos.findMany({
                where: { ...commonWhere, isCancel: false },
                select: { netAmount: true, isReturn: true, date: true, createdAt: true }
            });
        }

        if (type === 'All' || type === 'B2B') {
            deliveries = await prisma.salesDelivery.findMany({
                where: { ...commonWhere, isDeleted: false, status: "APPROVED" },
                include: { SalesDeliveryItems: true }
            });
            salesReturns = await prisma.salesReturn.findMany({
                where: { ...commonWhere, isDeleted: false },
                include: {
                    SalesReturnItems: {
                        include: { SalesDeliveryItems: true }
                    }
                }
            });
        }

        // 5. Initialize the 12 financial year monthly buckets (April -> March)
        const buckets = [];
        for (const fy of targetFinYears) {
            const startDate = new Date(fy.from);
            const finyrCode = getYearShortCode(fy.from, fy.to);

            for (let i = 0; i < 12; i++) {
                const d = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
                const y = d.getFullYear();
                const m = d.getMonth() + 1;
                const monthStr = m.toString().padStart(2, '0');
                const order = `${y}-${monthStr}`;

                let quarter = "Q1";
                if ([4, 5, 6].includes(m)) quarter = "Q1";
                else if ([7, 8, 9].includes(m)) quarter = "Q2";
                else if ([10, 11, 12].includes(m)) quarter = "Q3";
                else if ([1, 2, 3].includes(m)) quarter = "Q4";

                buckets.push({
                    order,
                    quarter,
                    totalSales: 0,
                    salesTotal: 0,
                    returnTotal: 0,
                    finyr: finyrCode,
                    company: selectedCompany || "All",
                    month: m
                });
            }
        }

        // Helper to find bucket for a given date
        const addToBucket = (dateVal, amount, isReturn) => {
            if (!dateVal) return;
            const d = new Date(dateVal);
            const y = d.getFullYear();
            const m = d.getMonth() + 1;
            const key = `${y}-${m.toString().padStart(2, '0')}`;
            const bucket = buckets.find(b => b.order === key);
            if (bucket) {
                if (isReturn) {
                    bucket.returnTotal += amount;
                } else {
                    bucket.salesTotal += amount;
                }
            }
        };

        // 6. Aggregate POS (B2C) Sales
        posRecords.forEach(rec => {
            const amt = parseAmount(rec.netAmount);
            addToBucket(rec.date || rec.createdAt, amt, rec.isReturn);
        });

        // 7. Aggregate B2B Sales Deliveries
        deliveries.forEach(del => {
            const amt = calculateHeaderTotal(del.SalesDeliveryItems, del, false);
            addToBucket(del.date || del.createdAt, amt, false);
        });

        // 8. Aggregate B2B Sales Returns (subtract from sales)
        salesReturns.forEach(ret => {
            const amt = calculateHeaderTotal(ret.SalesReturnItems, ret, true);
            addToBucket(ret.date || ret.createdAt, amt, true); // passing positive amount with true
        });

        // 9. Format totals
        buckets.forEach(b => {
            let finalTotal = 0;
            if (SalesType === "Sales") {
                finalTotal = b.salesTotal;
            } else if (SalesType === "Returns") {
                finalTotal = b.returnTotal;
            } else {
                finalTotal = b.salesTotal - b.returnTotal;
            }

            b.totalSales = Math.round(finalTotal * 100) / 100;
            b.salesTotal = Math.round(b.salesTotal * 100) / 100;
            b.returnTotal = Math.round(b.returnTotal * 100) / 100;
        });

        return { statusCode: 0, data: buckets };
    } catch (error) {
        console.error("Error in getQuarterSales service:", error.message);
        return { statusCode: 1, message: error.message || "Failed to calculate quarterly sales." };
    }
}



async function getMonthlySales(req) {
    try {
        const { selectedYear, selectedCompany, type = 'All', SalesType = 'All' } = req.query;

        if (!selectedYear) {
            return { statusCode: 1, message: "selectedYear is required." };
        }

        // 1. Find target financial year
        const finYears = await prisma.finYear.findMany({ include: { Company: true } });
        const targetFinYear = finYears.find(fy => getYearShortCode(fy.from, fy.to) === selectedYear);
        if (!targetFinYear) {
            return { statusCode: 1, message: `Financial year code ${selectedYear} not found.` };
        }

        // 2. Resolve branch filters based on selectedCompany name
        let branchFilter = undefined;
        if (selectedCompany && selectedCompany !== "All") {
            const company = await prisma.company.findFirst({
                where: { name: selectedCompany, active: true },
                select: { id: true }
            });
            if (company) {
                const branches = await prisma.branch.findMany({
                    where: { companyId: company.id, active: true },
                    select: { id: true }
                });
                branchFilter = { in: branches.map(b => b.id) };
            } else {
                const branch = await prisma.branch.findFirst({
                    where: { branchName: selectedCompany, active: true },
                    select: { id: true }
                });
                if (branch) branchFilter = branch.id;
            }
        }

        // 3. Get start & end boundaries for the year
        const boundaries = await getFinYearStartTimeEndTime(targetFinYear.id);
        if (!boundaries) return { statusCode: 0, data: [] };

        const { startDateStartTime, endDateEndTime } = boundaries;
        const dateFilter = {
            OR: [
                { date: { gte: startDateStartTime, lte: endDateEndTime } },
                { date: null, createdAt: { gte: startDateStartTime, lte: endDateEndTime } }
            ]
        };

        const commonWhere = { branchId: branchFilter, ...dateFilter };

        // 4. Fetch sales transactions based on type
        let posRecords = [];
        let deliveries = [];
        let salesReturns = [];

        if (type === 'All' || type === 'B2C') {
            posRecords = await prisma.pos.findMany({
                where: { ...commonWhere, isCancel: false },
                select: { netAmount: true, isReturn: true, date: true, createdAt: true }
            });
        }

        if (type === 'All' || type === 'B2B') {
            deliveries = await prisma.salesDelivery.findMany({
                where: { ...commonWhere, isDeleted: false, status: "APPROVED" },
                include: { SalesDeliveryItems: true }
            });
            salesReturns = await prisma.salesReturn.findMany({
                where: { ...commonWhere, isDeleted: false },
                include: {
                    SalesReturnItems: { include: { SalesDeliveryItems: true } }
                }
            });
        }

        // 5. Initialize the 12 financial year monthly buckets (chronological Apr -> Mar)
        const startDate = new Date(targetFinYear.from);
        const buckets = [];
        const MONTH_NAMES = {
            1: "Jan", 2: "Feb", 3: "Mar",
            4: "Apr", 5: "May", 6: "Jun",
            7: "Jul", 8: "Aug", 9: "Sep",
            10: "Oct", 11: "Nov", 12: "Dec",
        };

        for (let i = 0; i < 12; i++) {
            const d = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
            const y = d.getFullYear();
            const m = d.getMonth() + 1;
            const monthStr = m.toString().padStart(2, '0');
            const order = `${y}-${monthStr}`;

            buckets.push({
                payPeriod: MONTH_NAMES[m],
                totalSales: 0,
                salesTotal: 0,
                returnTotal: 0,
                finyr: selectedYear,
                company: selectedCompany || "All",
                order,
                month: m
            });
        }

        // Helper to find bucket for a given date
        const addToBucket = (dateVal, amount, isReturn) => {
            if (!dateVal) return;
            const d = new Date(dateVal);
            const y = d.getFullYear();
            const m = d.getMonth() + 1;
            const key = `${y}-${m.toString().padStart(2, '0')}`;
            const bucket = buckets.find(b => b.order === key);
            if (bucket) {
                if (isReturn) {
                    bucket.returnTotal += amount;
                } else {
                    bucket.salesTotal += amount;
                }
            }
        };

        // 6. Aggregate Sales Data
        posRecords.forEach(rec => {
            const amt = parseAmount(rec.netAmount);
            addToBucket(rec.date || rec.createdAt, amt, rec.isReturn);
        });

        deliveries.forEach(del => {
            const amt = calculateHeaderTotal(del.SalesDeliveryItems, del, false);
            addToBucket(del.date || del.createdAt, amt, false);
        });

        salesReturns.forEach(ret => {
            const amt = calculateHeaderTotal(ret.SalesReturnItems, ret, true);
            addToBucket(ret.date || ret.createdAt, amt, true); // positive amount with true
        });

        // 7. Format final response
        buckets.forEach(b => {
            let finalTotal = 0;
            if (SalesType === "Sales") {
                finalTotal = b.salesTotal;
            } else if (SalesType === "Returns") {
                finalTotal = b.returnTotal;
            } else {
                finalTotal = b.salesTotal - b.returnTotal;
            }

            b.totalSales = Math.round(finalTotal * 100) / 100;
            b.salesTotal = Math.round(b.salesTotal * 100) / 100;
            b.returnTotal = Math.round(b.returnTotal * 100) / 100;
        });

        return { statusCode: 0, data: buckets };
    } catch (error) {
        console.error("Error in getMonthlySales service:", error.message);
        return { statusCode: 1, message: error.message || "Failed to calculate monthly sales." };
    }
}

async function getWeeklySales(req) {
    try {
        const { selectedYear, selectedCompany, type = 'All', month, SalesType = 'All' } = req.query;

        if (!selectedYear) {
            return { statusCode: 1, message: "selectedYear is required." };
        }

        // 1. Find target financial year
        const finYears = await prisma.finYear.findMany({ include: { Company: true } });
        const targetFinYear = finYears.find(fy => getYearShortCode(fy.from, fy.to) === selectedYear);
        if (!targetFinYear) {
            return { statusCode: 1, message: `Financial year code ${selectedYear} not found.` };
        }

        // 2. Resolve branch filters based on selectedCompany name
        let branchFilter = undefined;
        if (selectedCompany && selectedCompany !== "All") {
            const company = await prisma.company.findFirst({
                where: { name: selectedCompany, active: true },
                select: { id: true }
            });
            if (company) {
                const branches = await prisma.branch.findMany({
                    where: { companyId: company.id, active: true },
                    select: { id: true }
                });
                branchFilter = { in: branches.map(b => b.id) };
            } else {
                const branch = await prisma.branch.findFirst({
                    where: { branchName: selectedCompany, active: true },
                    select: { id: true }
                });
                if (branch) branchFilter = branch.id;
            }
        }

        // 3. Determine start and end date based on month parameter
        let activeMonth = month;
        if (!activeMonth || activeMonth === "" || activeMonth === "null" || activeMonth === "undefined" || activeMonth === "All") {
            const now = new Date();
            const startYear = new Date(targetFinYear.from).getFullYear();
            const endYear = new Date(targetFinYear.to).getFullYear();

            if (now >= new Date(targetFinYear.from) && now <= new Date(targetFinYear.to)) {
                const currentMonthName = now.toLocaleString("default", { month: "long" });
                const currentYear = now.getFullYear();
                activeMonth = `${currentMonthName} ${currentYear}`;
            } else {
                activeMonth = `April ${startYear}`;
            }
        }

        let startDate, endDate;
        if (activeMonth.includes(" ")) {
            const parts = activeMonth.split(" ");
            const monthName = parts[0];
            const yearNum = parseInt(parts[1]);
            const monthIndex = new Date(`${monthName} 1, ${yearNum}`).getMonth();
            if (!isNaN(monthIndex) && !isNaN(yearNum)) {
                startDate = new Date(yearNum, monthIndex, 1);
                endDate = new Date(yearNum, monthIndex + 1, 0, 23, 59, 59, 999);
            }
        } else {
            const MONTH_MAP = {
                january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
                july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
                jan: 0, feb: 1, mar: 2, apr: 3, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
            };
            const monthLower = activeMonth.toLowerCase();
            if (monthLower in MONTH_MAP) {
                const monthIndex = MONTH_MAP[monthLower];
                const startYear = new Date(targetFinYear.from).getFullYear();
                const yearNum = monthIndex >= 3 ? startYear : startYear + 1;
                startDate = new Date(yearNum, monthIndex, 1);
                endDate = new Date(yearNum, monthIndex + 1, 0, 23, 59, 59, 999);
            }
        }

        if (!startDate || isNaN(startDate.getTime())) {
            startDate = new Date(targetFinYear.from);
            endDate = new Date(targetFinYear.to);
        }

        // Set database query start/end dates
        const queryStartDate = new Date(startDate);
        queryStartDate.setHours(0, 0, 0, 0);
        const queryEndDate = new Date(endDate);
        queryEndDate.setHours(23, 59, 59, 999);

        const dateFilter = {
            OR: [
                { date: { gte: queryStartDate, lte: queryEndDate } },
                { date: null, createdAt: { gte: queryStartDate, lte: queryEndDate } }
            ]
        };

        const commonWhere = { branchId: branchFilter, ...dateFilter };

        // 4. Fetch sales transactions based on type
        let posRecords = [];
        let deliveries = [];
        let salesReturns = [];

        if (type === 'All' || type === 'B2C') {
            posRecords = await prisma.pos.findMany({
                where: { ...commonWhere, isCancel: false },
                select: { netAmount: true, isReturn: true, date: true, createdAt: true }
            });
        }

        if (type === 'All' || type === 'B2B') {
            deliveries = await prisma.salesDelivery.findMany({
                where: { ...commonWhere, isDeleted: false, status: "APPROVED" },
                include: { SalesDeliveryItems: true }
            });
            salesReturns = await prisma.salesReturn.findMany({
                where: { ...commonWhere, isDeleted: false },
                include: {
                    SalesReturnItems: { include: { SalesDeliveryItems: true } }
                }
            });
        }

        // 5. Initialize the weekly buckets (chronological)
        const buckets = [];
        let currentStart = new Date(startDate);
        let weekNumber = 1;

        while (currentStart <= endDate) {
            const currentEnd = new Date(currentStart);
            currentEnd.setDate(currentEnd.getDate() + 6);
            currentEnd.setHours(23, 59, 59, 999);

            const displayEnd = currentEnd > endDate ? endDate : currentEnd;

            const startDay = currentStart.getDate().toString().padStart(2, '0');
            const startMonth = currentStart.toLocaleString('default', { month: 'short' });

            const endDay = displayEnd.getDate().toString().padStart(2, '0');
            const endMonth = displayEnd.toLocaleString('default', { month: 'short' });

            const payPeriod = `W${weekNumber} (${startDay} ${startMonth} - ${endDay} ${endMonth})`;

            buckets.push({
                payPeriod,
                totalSales: 0,
                salesTotal: 0,
                returnTotal: 0,
                finyr: selectedYear,
                company: selectedCompany || "All",
                weekNumber,
                startDate: new Date(currentStart),
                endDate: new Date(displayEnd)
            });

            currentStart.setDate(currentStart.getDate() + 7);
            weekNumber++;
        }

        // Helper to find bucket for a given date
        const addToBucket = (dateVal, amount, isReturn) => {
            if (!dateVal) return;
            const d = new Date(dateVal);
            const bucket = buckets.find(b => d >= b.startDate && d <= b.endDate);
            if (bucket) {
                if (isReturn) {
                    bucket.returnTotal += amount;
                } else {
                    bucket.salesTotal += amount;
                }
            }
        };

        // 6. Aggregate Sales Data
        posRecords.forEach(rec => {
            const amt = parseAmount(rec.netAmount);
            addToBucket(rec.date || rec.createdAt, amt, rec.isReturn);
        });

        deliveries.forEach(del => {
            const amt = calculateHeaderTotal(del.SalesDeliveryItems, del, false);
            addToBucket(del.date || del.createdAt, amt, false);
        });

        salesReturns.forEach(ret => {
            const amt = calculateHeaderTotal(ret.SalesReturnItems, ret, true);
            addToBucket(ret.date || ret.createdAt, amt, true); // positive amount with true
        });

        // 7. Format final response
        const formattedBuckets = buckets.map(b => {
            let finalTotal = 0;
            if (SalesType === "Sales") {
                finalTotal = b.salesTotal;
            } else if (SalesType === "Returns") {
                finalTotal = b.returnTotal;
            } else {
                finalTotal = b.salesTotal - b.returnTotal;
            }

            return {
                payPeriod: b.payPeriod,
                totalSales: Math.round(finalTotal * 100) / 100,
                salesTotal: Math.round(b.salesTotal * 100) / 100,
                returnTotal: Math.round(b.returnTotal * 100) / 100,
                finyr: b.finyr,
                company: b.company
            };
        });

        return { statusCode: 0, data: formattedBuckets };
    } catch (error) {
        console.error("Error in getWeeklySales service:", error.message);
        return { statusCode: 1, message: error.message || "Failed to calculate weekly sales." };
    }
}


// --- Sales Table Helpers & Services ---

async function fetchAndFlattenSalesTableData(commonWhere, finYearString, type = 'All', SalesType = 'All') {
    let posRecords = [];
    let deliveries = [];
    let salesReturns = [];

    // 1. Fetch POS
    if (type === 'All' || type === 'B2C') {
        const posWhere = { ...commonWhere, isCancel: false };
        if (SalesType === 'Sales') posWhere.isReturn = false;
        if (SalesType === 'Returns') posWhere.isReturn = true;

        posRecords = await prisma.pos.findMany({
            where: posWhere,
            include: {
                Party: true,
                PosItems: { include: { Item: true } }
            }
        });
    }

    // 2. Fetch Sales Delivery
    if ((type === 'All' || type === 'B2B') && (SalesType === 'All' || SalesType === 'Sales')) {
        deliveries = await prisma.salesDelivery.findMany({
            where: { ...commonWhere, isDeleted: false, status: "APPROVED" },
            include: {
                Party: true,
                SalesDeliveryItems: { include: { Item: true } }
            }
        });
    }

    // 3. Fetch Sales Return
    if ((type === 'All' || type === 'B2B') && (SalesType === 'All' || SalesType === 'Returns')) {
        salesReturns = await prisma.salesReturn.findMany({
            where: { ...commonWhere, isDeleted: false },
            include: {
                Party: true,
                SalesReturnItems: { include: { Item: true, SalesDeliveryItems: true } }
            }
        });
    }


    console.log(posRecords, "posRecords", posRecords?.length)

    const flatArray = [];

    posRecords.forEach(pos => {
        const salesType = pos.isReturn ? "B2C Return" : "B2C Sales";
        const customer = pos.Party?.name || 'Walk-in';
        flatArray.push({
            finYear: finYearString,
            docId: pos.docId,
            docDate: pos.date || pos.createdAt,
            salesType,
            customer,
            amount: Number(pos.netAmount),
            isReturn: pos.isReturn ? true : false
        });
    });

    deliveries.forEach(del => {
        const customer = del.Party?.name || 'Unknown';
        const calculatedItems = calculateItemsWithDistributedCharges(del.SalesDeliveryItems, del, false);
        
        calculatedItems.forEach(calc => {
            const item = calc.itemRef;
            flatArray.push({
                finYear: finYearString,
                docId: del.docId,
                docDate: del.date || del.createdAt,
                salesType: "B2B Sales",
                customer,
                itemName: item.Item?.name || 'Unknown',
                amount: calc.adjustedTotal,
                isReturn: false
            });
        });
    });

    salesReturns.forEach(ret => {
        const customer = ret.Party?.name || 'Unknown';
        const calculatedItems = calculateItemsWithDistributedCharges(ret.SalesReturnItems, ret, true);
        
        calculatedItems.forEach(calc => {
            const item = calc.itemRef;
            flatArray.push({
                finYear: finYearString,
                docId: ret.docId,
                docDate: ret.date || ret.createdAt,
                salesType: "B2B Return",
                customer,
                itemName: item.Item?.name || 'Unknown',
                amount: calc.adjustedTotal,
                isReturn: true
            });
        });
    });

    flatArray.sort((a, b) => new Date(b.docDate) - new Date(a.docDate));
    return flatArray;
}

async function resolveTableCommonWhere(year, company, month, startDateOverride, endDateOverride, quarter) {
    const finYears = await prisma.finYear.findMany({ include: { Company: true } });
    const targetFinYears = finYears.filter(fy => getYearShortCode(fy.from, fy.to) === year);
    if (targetFinYears.length === 0) return null;

    let branchIds = [];
    if (company && company !== "ALL" && company !== "All") {
        const comp = await prisma.company.findFirst({
            where: { name: company, active: true },
            select: { id: true }
        });
        if (comp) {
            const branches = await prisma.branch.findMany({
                where: { companyId: comp.id, active: true },
                select: { id: true }
            });
            branchIds = branches.map(b => b.id);
        } else {
            const branch = await prisma.branch.findFirst({
                where: { branchName: company, active: true },
                select: { id: true }
            });
            if (branch) branchIds = [branch.id];
        }
    } else {
        const cIds = targetFinYears.map(fy => fy.companyId);
        const branches = await prisma.branch.findMany({
            where: { companyId: { in: cIds }, active: true },
            select: { id: true }
        });
        branchIds = branches.map(b => b.id);
    }

    const commonWhere = { branchId: { in: branchIds } };
    const orConditions = [];

    if (startDateOverride && endDateOverride) {
        orConditions.push({ date: { gte: startDateOverride, lte: endDateOverride } });
        orConditions.push({ date: null, createdAt: { gte: startDateOverride, lte: endDateOverride } });
    } else if (quarter) {
        // Find boundaries for specific quarter within fin year
        const targetFinYear = targetFinYears[0];
        const startYear = new Date(targetFinYear.from).getFullYear();
        let startMonth, endMonth; // 0-indexed (Jan = 0)
        
        if (quarter === "Q1") {
            startMonth = 3; // April
            endMonth = 5;   // June
        } else if (quarter === "Q2") {
            startMonth = 6; // July
            endMonth = 8;   // September
        } else if (quarter === "Q3") {
            startMonth = 9; // October
            endMonth = 11;  // December
        } else if (quarter === "Q4") {
            startMonth = 0; // January
            endMonth = 2;   // March
        }

        if (startMonth !== undefined) {
            const startYearNum = startMonth >= 3 ? startYear : startYear + 1;
            const endYearNum = endMonth >= 3 ? startYear : startYear + 1;
            
            const startDate = new Date(startYearNum, startMonth, 1);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(endYearNum, endMonth + 1, 0, 23, 59, 59, 999);
            
            orConditions.push({ date: { gte: startDate, lte: endDate } });
            orConditions.push({ date: null, createdAt: { gte: startDate, lte: endDate } });
        }
    } else if (month) {
        // Find boundaries for specific month within fin year
        const targetFinYear = targetFinYears[0];
        const startYear = new Date(targetFinYear.from).getFullYear();
        let monthIndex;
        if (typeof month === "string" && isNaN(month)) {
            const MONTH_MAP = {
                january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
                july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
                jan: 0, feb: 1, mar: 2, apr: 3, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
            };
            const monthStr = month.split(" ")[0].toLowerCase();
            monthIndex = MONTH_MAP[monthStr];
        } else {
            monthIndex = parseInt(month) - 1; // 0-indexed if month comes as 1-12
        }

        if (monthIndex !== undefined && !isNaN(monthIndex)) {
            const yearNum = monthIndex >= 3 ? startYear : startYear + 1;
            const startDate = new Date(yearNum, monthIndex, 1);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(yearNum, monthIndex + 1, 0, 23, 59, 59, 999);
            orConditions.push({ date: { gte: startDate, lte: endDate } });
            orConditions.push({ date: null, createdAt: { gte: startDate, lte: endDate } });
        }
    } else {
        // Whole financial year
        for (const fy of targetFinYears) {
            const boundaries = await getFinYearStartTimeEndTime(fy.id);
            if (boundaries) {
                const { startDateStartTime, endDateEndTime } = boundaries;
                orConditions.push({ date: { gte: startDateStartTime, lte: endDateEndTime } });
                orConditions.push({ date: null, createdAt: { gte: startDateStartTime, lte: endDateEndTime } });
            }
        }
    }

    if (orConditions.length > 0) {
        commonWhere.OR = orConditions;
    }

    return commonWhere;
}

async function getYearlySalesTable(req) {
    try {
        const { finYear, companyName, type = 'All', SalesType = 'All' } = req.query;
        if (!finYear) return { statusCode: 1, message: "finYear is required" };
        const commonWhere = await resolveTableCommonWhere(finYear, companyName);
        if (!commonWhere) return { statusCode: 0, data: [] };
        const data = await fetchAndFlattenSalesTableData(commonWhere, finYear, type, SalesType);
        return { statusCode: 0, data };
    } catch (err) {
        console.error("Error in getYearlySalesTable:", err);
        return { statusCode: 1, message: err.message };
    }
}

async function getQuarterSalesTable(req) {
    try {
        const { finYear, company, quarter, type = 'All', SalesType = 'All' } = req.query;
        if (!finYear) return { statusCode: 1, message: "finYear is required" };
        const commonWhere = await resolveTableCommonWhere(finYear, company, null, null, null, quarter);
        if (!commonWhere) return { statusCode: 0, data: [] };
        const data = await fetchAndFlattenSalesTableData(commonWhere, finYear, type, SalesType);
        return { statusCode: 0, data };
    } catch (err) {
        console.error("Error in getQuarterSalesTable:", err);
        return { statusCode: 1, message: err.message };
    }
}

async function getMonthlySalesTable(req) {
    try {
        const { finYear, company, month, type = 'All', SalesType = 'All' } = req.query;
        if (!finYear) return { statusCode: 1, message: "finYear is required" };
        const commonWhere = await resolveTableCommonWhere(finYear, company, month);
        if (!commonWhere) return { statusCode: 0, data: [] };
        const data = await fetchAndFlattenSalesTableData(commonWhere, finYear, type, SalesType);
        return { statusCode: 0, data };
    } catch (err) {
        console.error("Error in getMonthlySalesTable:", err);
        return { statusCode: 1, message: err.message };
    }
}

async function getWeeklySalesTable(req) {
    try {
        const { finYear, company, week, startDate, endDate, type = 'All', SalesType = 'All' } = req.query;
        if (!finYear) return { statusCode: 1, message: "finYear is required" };

        let sDate, eDate;
        if (week) {
            // week format example: "W1 (01 Apr - 07 Apr)"
            const match = week.match(/W\d+\s*\((\d{2}\s+[A-Za-z]{3})\s*-\s*(\d{2}\s+[A-Za-z]{3})\)/);
            if (match) {
                const startStr = match[1]; // "01 Apr"
                const endStr = match[2];   // "07 Apr"
                
                const finYears = await prisma.finYear.findMany();
                const targetFinYear = finYears.find(fy => getYearShortCode(fy.from, fy.to) === finYear);
                if (targetFinYear) {
                    const startYear = new Date(targetFinYear.from).getFullYear();
                    
                    const MONTH_MAP = {
                        jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
                        jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
                    };
                    
                    const [startDay, startMonthName] = startStr.split(/\s+/);
                    const [endDay, endMonthName] = endStr.split(/\s+/);
                    
                    const startMonthIdx = MONTH_MAP[startMonthName.toLowerCase().slice(0, 3)];
                    const endMonthIdx = MONTH_MAP[endMonthName.toLowerCase().slice(0, 3)];
                    
                    if (startMonthIdx !== undefined && endMonthIdx !== undefined) {
                        const startYearNum = startMonthIdx >= 3 ? startYear : startYear + 1;
                        const endYearNum = endMonthIdx >= 3 ? startYear : startYear + 1;
                        
                        sDate = new Date(startYearNum, startMonthIdx, parseInt(startDay));
                        sDate.setHours(0, 0, 0, 0);
                        
                        eDate = new Date(endYearNum, endMonthIdx, parseInt(endDay));
                        eDate.setHours(23, 59, 59, 999);
                    }
                }
            }
        }

        if (!sDate && startDate && endDate) {
            sDate = new Date(startDate);
            sDate.setHours(0, 0, 0, 0);
            eDate = new Date(endDate);
            eDate.setHours(23, 59, 59, 999);
        }

        const commonWhere = await resolveTableCommonWhere(finYear, company, null, sDate, eDate);
        if (!commonWhere) return { statusCode: 0, data: [] };
        const data = await fetchAndFlattenSalesTableData(commonWhere, finYear, type, SalesType);
        return { statusCode: 0, data };
    } catch (err) {
        console.error("Error in getWeeklySalesTable:", err);
        return { statusCode: 1, message: err.message };
    }
}

async function getSlowMovement(req) {
    try {
        const items = await prisma.item.findMany({
            where: { active: true },
            include: {
                MainCategory: true,
                Stock: {
                    where: { qty: { gt: 0 } },
                    orderBy: { createdAt: 'asc' },
                    take: 1
                }
            }
        });

        const now = new Date();
        const data = items.map(item => {
            const oldestStock = item.Stock?.[0];
            const createdAt = oldestStock?.createdAt ? new Date(oldestStock.createdAt) : now;
            const diffTime = Math.abs(now - createdAt);
            const aging = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            return {
                itemGroup: item.MainCategory?.name || 'Uncategorized',
                itemName: item.name || 'Unknown',
                docId: item.code || String(item.id),
                aging: aging
            };
        });

        data.sort((a, b) => b.aging - a.aging);
        return { statusCode: 0, data };
    } catch (error) {
        console.error("Error in getSlowMovement:", error.message);
        return { statusCode: 1, message: error.message };
    }
}

async function getLowVelocityItems(req) {
    try {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const posItems = await prisma.posItems.findMany({
            where: { Pos: { date: { gte: ninetyDaysAgo }, isCancel: false } },
            select: { itemId: true, qty: true }
        });

        const deliveryItems = await prisma.salesDeliveryItems.findMany({
            where: { SalesDelivery: { date: { gte: ninetyDaysAgo }, isDeleted: false, status: "APPROVED" } },
            select: { itemId: true, deliveryQty: true, qty: true }
        });

        const salesCount = {};
        posItems.forEach(pi => {
            if (pi.itemId) salesCount[pi.itemId] = (salesCount[pi.itemId] || 0) + parseFloat(pi.qty || 0);
        });
        deliveryItems.forEach(di => {
            if (di.itemId) salesCount[di.itemId] = (salesCount[di.itemId] || 0) + parseFloat(di.deliveryQty || di.qty || 0);
        });

        const lowVelocityIds = Object.keys(salesCount)
            .filter(id => salesCount[id] > 0 && salesCount[id] <= 20)
            .map(Number);

        const items = await prisma.item.findMany({
            where: { id: { in: lowVelocityIds }, active: true },
            include: {
                MainCategory: true,
                Stock: {
                    where: { qty: { gt: 0 } },
                    orderBy: { createdAt: 'asc' },
                    take: 1
                }
            }
        });

        const now = new Date();
        const data = items.map(item => {
            const oldestStock = item.Stock?.[0];
            const createdAt = oldestStock?.createdAt ? new Date(oldestStock.createdAt) : now;
            const diffTime = Math.abs(now - createdAt);
            const aging = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            return {
                itemGroup: item.MainCategory?.name || 'Uncategorized',
                itemName: item.name || 'Unknown',
                docId: item.code || String(item.id),
                aging: aging,
                qtySold: salesCount[item.id]
            };
        });

        data.sort((a, b) => a.qtySold - b.qtySold);
        return { statusCode: 0, data };
    } catch (error) {
        console.error("Error in getLowVelocityItems:", error.message);
        return { statusCode: 1, message: error.message };
    }
}

async function getDeadStockItems(req) {
    try {
        const oneYearAgo = new Date();
        oneYearAgo.setDate(oneYearAgo.getDate() - 365);

        const posItems = await prisma.posItems.findMany({
            where: { Pos: { date: { gte: oneYearAgo }, isCancel: false } },
            select: { itemId: true }
        });

        const deliveryItems = await prisma.salesDeliveryItems.findMany({
            where: { SalesDelivery: { date: { gte: oneYearAgo }, isDeleted: false, status: "APPROVED" } },
            select: { itemId: true }
        });

        const soldItemIds = new Set([
            ...posItems.map(p => p.itemId),
            ...deliveryItems.map(d => d.itemId)
        ].filter(Boolean));

        const stockItems = await prisma.stock.findMany({
            where: { qty: { gt: 0 } },
            select: { itemId: true }
        });

        const itemsWithStockIds = new Set(stockItems.map(s => s.itemId).filter(Boolean));
        const deadStockIds = [...itemsWithStockIds].filter(id => !soldItemIds.has(id));

        const items = await prisma.item.findMany({
            where: { id: { in: deadStockIds }, active: true },
            include: {
                MainCategory: true,
                Stock: {
                    where: { qty: { gt: 0 } },
                    orderBy: { createdAt: 'asc' },
                    take: 1
                }
            }
        });

        const now = new Date();
        const data = items.map(item => {
            const oldestStock = item.Stock?.[0];
            const createdAt = oldestStock?.createdAt ? new Date(oldestStock.createdAt) : now;
            const diffTime = Math.abs(now - createdAt);
            const aging = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            return {
                itemGroup: item.MainCategory?.name || 'Uncategorized',
                itemName: item.name || 'Unknown',
                docId: item.code || String(item.id),
                aging: aging
            };
        });

        data.sort((a, b) => b.aging - a.aging);
        return { statusCode: 0, data };
    } catch (error) {
        console.error("Error in getDeadStockItems:", error.message);
        return { statusCode: 1, message: error.message };
    }
}

export {
    getTotalSales,
    getQuarterSales,
    getYearlySales,
    getMonthlySales,
    getWeeklySales,
    getYearlySalesTable,
    getQuarterSalesTable,
    getMonthlySalesTable,
    getWeeklySalesTable,
    getSlowMovement,
    getLowVelocityItems,
    getDeadStockItems
};
