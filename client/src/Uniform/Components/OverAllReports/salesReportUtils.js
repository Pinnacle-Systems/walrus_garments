// ─────────────────────────────────────────────────────────────────────────────
//  salesReportUtils.js
//  Pure helpers used by the Overall Sales Report component.
// ─────────────────────────────────────────────────────────────────────────────

export function fmtDate(d) {
    if (!d) return "—";
    const dt = new Date(d);
    if (isNaN(dt)) return String(d);
    const dd = String(dt.getDate()).padStart(2, "0");
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const yyyy = dt.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
}

export function fmtCurrency(val) {
    const n = typeof val === "number" ? val : parseFloat(val) || 0;
    return n.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

/**
 * computeSalesRow
 * Refresh/Pre-process each transaction row.
 */
export function computeSalesRow(r) {
    return {
        ...r,
        cash: parseFloat(r.cash || 0),
        upi: parseFloat(r.upi || 0),
        card: parseFloat(r.card || 0),
        online: parseFloat(r.online || 0),
        totalAmount: parseFloat(r.totalAmount || 0),
    };
}

// Build groups for the grouping bar feature
export function buildGroups(data, keys, dirs, depth = 0) {
    if (!keys.length) return data;
    const [k, ...rest] = keys;
    const map = new Map();
    data.forEach((r) => {
        const v = String(r[k] ?? "");
        if (!map.has(v)) map.set(v, []);
        map.get(v).push(r);
    });
    return [...map.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]) * (dirs[k] || 1))
        .map(([val, rows]) => ({
            _group: true,
            _key: k,
            _val: val,
            _depth: depth,
            _count: rows.length,
            _children: buildGroups(rows, rest, dirs, depth + 1),
        }));
}

export const COLUMNS = [
    { key: "date", label: "Date", w: "100px" },
    { key: "docId", label: "Bill No", w: "120px" },
    { key: "customerName", label: "Customer / Party", w: "220px" },
    { key: "type", label: "Sale Type", w: "130px" },
    { key: "platform", label: "Platform", w: "120px" },
    { key: "salesman", label: "Salesman", w: "130px" },
    { key: "cash", label: "Cash", w: "100px" },
    { key: "upi", label: "UPI", w: "100px" },
    { key: "card", label: "Card", w: "100px" },
    { key: "online", label: "Online", w: "100px" },
    { key: "totalAmount", label: "Total Amount", w: "120px" },
];

export const SM_COLUMNS = [
    { key: "id", label: "ID", w: "80px" },
    { key: "name", label: "Salesman Name", w: "250px" },
    { key: "billCount", label: "Bill Count", w: "120px" },
    { key: "posSales", label: "Retail Sales", w: "150px" },
    { key: "totalSales", label: "Total Performance", w: "150px" },
];

export function getTypeColor(type) {
    if (!type) return "bg-gray-100 text-gray-800 border border-gray-200";
    if (type.includes("POS")) return "bg-blue-50 text-blue-700 border border-blue-200";
    if (type.includes("Bulk")) return "bg-purple-50 text-purple-700 border border-purple-200";
    if (type.includes("Online")) return "bg-cyan-50 text-cyan-700 border border-cyan-200";
    if (type.includes("Expense")) return "bg-red-50 text-red-700 border border-red-200";
    return "bg-gray-100 text-gray-800 border border-gray-200";
}
