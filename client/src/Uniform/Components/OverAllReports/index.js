// ─────────────────────────────────────────────────────────────────────────────
//  OverallSalesReports.jsx — Unified view of POS, Bulk, Online sales & Expenses
// ─────────────────────────────────────────────────────────────────────────────
import React, { useMemo, useRef, useState } from "react";
import ColumnFilterMenu from "./components/ColumnFilterMenu";
import {
    COLUMNS,
    SM_COLUMNS,
    buildGroups,
    computeSalesRow,
    fmtDate,
    fmtCurrency,
    getTypeColor
} from "./salesReportUtils";
import XLSXStyle from "xlsx-js-style";
import mpLogo from "../../../assets/walrusNew.png";
import { useGetOverAllSalesReportQuery } from "../../../redux/uniformService/SalesReportServices";

const PAGE_SIZE = 40;

export default function OverallSalesReports() {
    const [queryParams, setQueryParams] = useState({
        fromDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        toDate: new Date().toISOString().split('T')[0],
        branchId: undefined
    });

    const {
        data: apiResponse,
        isLoading,
        isFetching,
        isError,
        refetch,
    } = useGetOverAllSalesReportQuery(queryParams);

    const apiData = apiResponse?.data || { transactions: [], salesmanSummary: [], summary: {} };
    const allData = useMemo(
        () => (apiData.transactions || []).map(computeSalesRow),
        [apiData.transactions],
    );

    const [colOrder, setColOrder] = useState(() => COLUMNS.map((c) => c.key));
    const [groupKeys, setGroupKeys] = useState([]);
    const [groupDirs, setGroupDirs] = useState({});
    const [collapsed, setCollapsed] = useState({});
    const [colFilters, setColFilters] = useState({});
    const [openMenuCol, setOpenMenuCol] = useState(null);
    const [sortKey, setSortKey] = useState("date");
    const [sortDir, setSortDir] = useState(-1);
    const [page, setPage] = useState(1);
    const [activeTab, setActiveTab] = useState("all");

    const dragColRef = useRef(null);

    const uniqueVals = useMemo(() => {
        const map = {};
        COLUMNS.forEach(({ key }) => {
            const vals = allData.map((r) => {
                const v = r[key];
                if (key === 'date') return fmtDate(v);
                return String(v ?? "");
            });
            map[key] = [...new Set(vals)].sort();
        });
        return map;
    }, [allData]);

    const filtered = useMemo(() => {
        let base = allData;

        // Tab-based filtering
        if (activeTab === "pos") base = base.filter(r => r.type === "POS Sales");
        else if (activeTab === "bulk") base = base.filter(r => r.type === "Bulk Sales");
        else if (activeTab === "online") base = base.filter(r => r.type === "Online");
        else if (activeTab === "expense") base = base.filter(r => r.type === "Expense");

        return base.filter((r) => {
            for (const [k, allowed] of Object.entries(colFilters)) {
                if (!allowed) continue;
                const val = k === 'date' ? fmtDate(r[k]) : String(r[k] ?? "");
                if (!allowed.has(val)) return false;
            }
            return true;
        });
    }, [allData, colFilters, activeTab]);

    const sorted = useMemo(() => {
        if (!sortKey) return filtered;
        return [...filtered].sort((a, b) => {
            let av = a[sortKey], bv = b[sortKey];
            if (sortKey === "date") {
                av = new Date(av).getTime();
                bv = new Date(bv).getTime();
            }
            return (
                (typeof av === "string"
                    ? av.localeCompare(bv)
                    : (av || 0) - (bv || 0)) * sortDir
            );
        });
    }, [filtered, sortKey, sortDir]);

    const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const paginated = sorted.slice(
        (safePage - 1) * PAGE_SIZE,
        safePage * PAGE_SIZE,
    );

    const tree = useMemo(
        () =>
            groupKeys.length
                ? buildGroups(paginated, groupKeys, groupDirs)
                : paginated,
        [paginated, groupKeys, groupDirs],
    );

    console.log(tree, "treetree")

    const metrics = apiData.summary || {};

    const visibleCols = useMemo(
        () =>
            colOrder
                .filter((k) => !groupKeys.includes(k))
                .map((k) => COLUMNS.find((c) => c.key === k))
                .filter(Boolean),
        [colOrder, groupKeys],
    );

    // ─── handlers ──────────────────────────────────────────────────────────────
    function handleSort(k, dir) {
        setSortKey(k);
        setSortDir(dir);
        setPage(1);
    }
    function handleFilterApply(k, vs) {
        setColFilters((p) => {
            const n = { ...p };
            if (!vs) delete n[k];
            else n[k] = vs;
            return n;
        });
        setOpenMenuCol(null);
        setPage(1);
    }
    function removeFilterChip(k) {
        setColFilters((p) => {
            const n = { ...p };
            delete n[k];
            return n;
        });
        setPage(1);
    }
    function toggleGroup(gid) {
        setCollapsed((p) => ({ ...p, [gid]: !p[gid] }));
    }
    function removeGroupKey(k) {
        setGroupKeys((p) => p.filter((g) => g !== k));
        setGroupDirs((p) => {
            const n = { ...p };
            delete n[k];
            return n;
        });
    }
    function toggleGroupDir(k) {
        setGroupDirs((p) => ({ ...p, [k]: (p[k] || 1) * -1 }));
    }
    function onColDragStart(e, k) {
        dragColRef.current = k;
        e.dataTransfer.setData("col", k);
        e.dataTransfer.effectAllowed = "move";
    }
    function onGbDragOver(e) {
        e.preventDefault();
    }
    function onGbDrop(e) {
        e.preventDefault();
        const k = e.dataTransfer.getData("col") || dragColRef.current;
        if (!k || groupKeys.includes(k)) return;
        setGroupKeys((p) => [...p, k]);
        setGroupDirs((p) => ({ ...p, [k]: 1 }));
    }
    function onColDrop(e, tgtKey) {
        e.preventDefault();
        const srcKey = e.dataTransfer.getData("col") || dragColRef.current;
        if (!srcKey || srcKey === tgtKey) return;
        setColOrder((p) => {
            const a = [...p],
                si = a.indexOf(srcKey),
                ti = a.indexOf(tgtKey);
            if (si < 0 || ti < 0) return a;
            a.splice(si, 1);
            a.splice(ti, 0, srcKey);
            return a;
        });
    }

    // ─── cell renderer ─────────────────────────────────────────────────────────
    function renderCellValue(row, key) {
        switch (key) {
            case "date":
                return <span className="text-xs text-gray-600">{fmtDate(row.date)}</span>;
            case "docId":
                return <span className="text-xs font-medium text-gray-800">{row.docId ?? "—"}</span>;
            case "type":
                return (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getTypeColor(row.type)}`}>
                        {row.type}
                    </span>
                );
            case "cash":
            case "upi":
            case "card":
            case "online":
                return <div className="text-xs text-right text-gray-600">{fmtCurrency(row[key])}</div>;
            case "totalAmount":
                return <div className="text-xs text-right font-bold text-gray-900">{fmtCurrency(row.totalAmount)}</div>;
            default:
                return <span className="text-xs text-gray-600">{row[key] ?? "—"}</span>;
        }
    }

    function renderNode(node, vc, localIdx, rIdx) {
        if (node._group) {
            const gid = `${node._key}:${node._val}:${node._depth}`;
            const col = COLUMNS.find((c) => c.key === node._key);

            function collectRows(n) {
                if (n._group) return n._children.flatMap(collectRows);
                return [n];
            }
            const groupRows = collectRows(node);
            const total = groupRows.reduce((s, r) => s + (parseFloat(r.totalAmount) || 0), 0);

            return (
                <React.Fragment key={gid}>
                    <tr className="bg-indigo-50/50 hover:bg-indigo-100/50 transition-colors">
                        <td className="px-2 py-2 border-b border-gray-200 w-10 text-center text-[10px] text-gray-400 font-bold" />
                        <td
                            colSpan={vc.length}
                            className="px-3 py-2 text-xs font-semibold text-indigo-700 border-b border-gray-200"
                            style={{ paddingLeft: `${node._depth * 20 + 12}px` }}
                        >
                            <button
                                onClick={() => toggleGroup(gid)}
                                className="mr-2 text-indigo-500 hover:text-indigo-700 w-4"
                            >
                                {collapsed[gid] ? "▶" : "▼"}
                            </button>
                            {col?.label || node._key}: <strong>{node._val || "(blank)"}</strong>
                            <span className="ml-3 text-indigo-400 font-normal">({node._count} items)</span>
                            <span className="ml-auto float-right text-indigo-600 bg-white px-2 py-0.5 rounded border border-indigo-100">
                                Total: {fmtCurrency(total)}
                            </span>
                        </td>
                    </tr>
                    {!collapsed[gid] &&
                        node._children.map((child, ci) => renderNode(child, vc, ci, rIdx + ci))}
                </React.Fragment>
            );
        }

        const r = node;
        const stripe = localIdx % 2 === 0 ? "bg-white" : "bg-gray-50/50";
        const sno = (safePage - 1) * PAGE_SIZE + localIdx + 1;

        return (
            <tr key={r.id} className={`${stripe} hover:bg-indigo-50/70 transition-colors ${r.isExpense ? 'bg-red-50/30' : ''}`}>
                <td className="px-2 py-2 w-10 text-center border-r border-b border-gray-100 text-[10px] text-gray-400 font-bold select-none">
                    {sno}
                </td>
                {vc.map((col) => (
                    <td
                        key={col.key}
                        className="px-3 py-2 whitespace-nowrap border-r border-b border-gray-100 last:border-r-0"
                    >
                        {renderCellValue(r, col.key)}
                    </td>
                ))}
            </tr>
        );
    }

    if (isLoading) return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading overall sales report…</div>;
    if (isError) return <div className="flex items-center justify-center h-64 text-red-500 text-sm">Failed to load report.</div>;

    // function exportExcel() {
    //     const isSalesman = activeTab === 'salesman';
    //     const cols = isSalesman ? SM_COLUMNS : COLUMNS;
    //     const dataToExport = isSalesman ? apiData.salesmanSummary : sorted;
    //     const sheetName = isSalesman ? "Salesman Summary" : "Overall Sales";

    //     // 1. Prepare Header
    //     const header = cols.map(c => c.label);

    //     // 2. Prepare Data Rows
    //     const dataRows = dataToExport.map((row) => 
    //         cols.map(c => {
    //             const val = row[c.key];
    //             if (c.key === 'date') return fmtDate(val);
    //             return val;
    //         })
    //     );

    //     // 3. Create Workbook and Sheet
    //     const wb = XLSXStyle.utils.book_new();
    //     const ws = XLSXStyle.utils.aoa_to_sheet([header, ...dataRows]);

    //     // 4. Define Styles
    //     const headerStyle = {
    //         font: { bold: true, color: { rgb: "333333" }, sz: 11 },
    //         fill: { fgColor: { rgb: "E9ECEF" } }, // Light gray background
    //         alignment: { horizontal: "center", vertical: "center", wrapText: true },
    //         border: {
    //             top: { style: "thin", color: { rgb: "CED4DA" } },
    //             bottom: { style: "thin", color: { rgb: "CED4DA" } },
    //             left: { style: "thin", color: { rgb: "CED4DA" } },
    //             right: { style: "thin", color: { rgb: "CED4DA" } }
    //         }
    //     };

    //     const dataStyle = (isEven) => ({
    //         font: { sz: 10, color: { rgb: "495057" } },
    //         fill: { fgColor: { rgb: isEven ? "FFFFFF" : "F8F9FA" } },
    //         alignment: { vertical: "center", wrapText: true },
    //         border: {
    //             top: { style: "thin", color: { rgb: "E9ECEF" } },
    //             bottom: { style: "thin", color: { rgb: "E9ECEF" } },
    //             left: { style: "thin", color: { rgb: "E9ECEF" } },
    //             right: { style: "thin", color: { rgb: "E9ECEF" } }
    //         }
    //     });

    //     const numberStyle = (isEven) => ({
    //         ...dataStyle(isEven),
    //         alignment: { horizontal: "right", vertical: "center" },
    //         numFmt: "#,##0.00"
    //     });

    //     // 5. Apply Styles and Configuration
    //     const range = XLSXStyle.utils.decode_range(ws['!ref']);

    //     // Set column widths based on the configuration in salesReportUtils
    //     ws['!cols'] = cols.map(c => ({ wch: Math.max(12, parseInt(c.w || 100) / 7) }));

    //     // Set row heights (Header is taller)
    //     const rowHeights = [{ hpt: 35 }]; // Header row height
    //     for (let i = 1; i <= dataRows.length; i++) {
    //         rowHeights.push({ hpt: 25 }); // Data row height
    //     }
    //     ws['!rows'] = rowHeights;

    //     for (let R = range.s.r; R <= range.e.r; ++R) {
    //         for (let C = range.s.c; C <= range.e.c; ++C) {
    //             const cellAddress = XLSXStyle.utils.encode_cell({ r: R, c: C });
    //             if (!ws[cellAddress]) continue;

    //             if (R === 0) {
    //                 ws[cellAddress].s = headerStyle;
    //             } else {
    //                 const colKey = cols[C].key;
    //                 const isNumber = ['cash', 'upi', 'card', 'online', 'totalAmount', 'posSales', 'totalSales'].includes(colKey);
    //                 ws[cellAddress].s = isNumber ? numberStyle(R % 2 === 0) : dataStyle(R % 2 === 0);
    //             }
    //         }
    //     }

    //     XLSXStyle.utils.book_append_sheet(wb, ws, sheetName);
    //     const fileName = `${sheetName.replace(/\s+/g, '_')}_${queryParams.fromDate}_to_${queryParams.toDate}.xlsx`;
    //     XLSXStyle.writeFile(wb, fileName);
    // }

    function exportExcel() {
        const isSalesman = activeTab === 'salesman';
        const cols = isSalesman ? SM_COLUMNS : COLUMNS;
        const dataToExport = isSalesman ? apiData.salesmanSummary : sorted;
        const sheetName = isSalesman ? "Salesman Summary" : "Overall Sales";

        const keys = cols.map(c => c.key);
        const labels = cols.map(c => c.label);

        const EXCEL_NUM_FMT = "#,##0.00";

        const BORDER = {
            top: { style: "thin", color: { rgb: "E5E7EB" } },
            bottom: { style: "thin", color: { rgb: "E5E7EB" } },
            left: { style: "thin", color: { rgb: "E5E7EB" } },
            right: { style: "thin", color: { rgb: "E5E7EB" } },
        };

        // ── Core cell builder ────────────────────────────────────────────────────
        function cell(value, opts = {}) {
            const {
                bold = false,
                fontColor = "1F2937",
                fgColor = null,
                align = "left",
                fontSize = 9,
                indent = 1,
                numFmt = null,
            } = opts;
            const fill = fgColor
                ? { fgColor: { rgb: fgColor }, patternType: "solid" }
                : { patternType: "none" };
            const c = {
                v: value ?? "",
                t: typeof value === "number" ? "n" : "s",
                s: {
                    font: { bold, color: { rgb: fontColor }, sz: fontSize, name: "Arial" },
                    fill,
                    alignment: { horizontal: align, vertical: "center", indent, wrapText: false },
                    border: BORDER,
                },
            };
            if (numFmt) c.z = numFmt;
            return c;
        }

        // ── Date formatter ───────────────────────────────────────────────────────
        function fmtExcelDate(d) {
            if (!d) return "—";
            const dt = new Date(d);
            if (isNaN(dt)) return String(d);
            return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()}`;
        }

        // ── Column classification ────────────────────────────────────────────────
        const NUMBER_KEYS = new Set(['cash', 'upi', 'card', 'online', 'totalAmount', 'posSales', 'totalSales']);
        const DATE_KEYS = new Set(['date']);

        // ── Semantic cell helpers ────────────────────────────────────────────────
        function numberCell(k, row, bg = null, isBold = false) {
            const raw = row[k];
            const numVal = typeof raw === "number" ? raw : parseFloat(raw) || 0;
            return cell(numVal, {
                fontColor: numVal > 0 ? "15803D" : numVal < 0 ? "DC2626" : "6B7280",
                bold: isBold || numVal !== 0,
                align: "right",
                indent: 0,
                numFmt: EXCEL_NUM_FMT,
                fgColor: bg,
            });
        }

        // ── S.No prepended ───────────────────────────────────────────────────────
        const allKeys = ["sno", ...keys];
        const allLabels = ["S.No", ...labels];

        // ── Build sheet rows ─────────────────────────────────────────────────────
        const allSheetRows = [];
        let dataRowCount = 0;

        if (!isSalesman && groupKeys.length > 0) {
            const exportTree = buildGroups(sorted, groupKeys, groupDirs);

            function traverse(nodes) {
                nodes.forEach((node) => {
                    if (node._group) {
                        const col = COLUMNS.find((c) => c.key === node._key);
                        const groupLabel = `${col?.label || node._key}: ${node._val || "(blank)"} (${node._count} items)`;

                        // Calculate total for this group
                        function collectRows(n) {
                            if (n._group) return n._children.flatMap(collectRows);
                            return [n];
                        }
                        const groupRows = collectRows(node);
                        const total = groupRows.reduce((s, r) => s + (parseFloat(r.totalAmount) || 0), 0);

                        // Add group header row
                        const groupRow = allKeys.map((k, i) => {
                            if (k === "sno") return cell("", { fgColor: "EEF2FF" });
                            if (i === 1) return cell(groupLabel, { bold: true, fontColor: "4338CA", fgColor: "EEF2FF", indent: node._depth * 2 + 1 });
                            if (k === "totalAmount") return numberCell("totalAmount", { totalAmount: total }, "EEF2FF", true);
                            return cell("", { fgColor: "EEF2FF" });
                        });
                        allSheetRows.push({ cells: groupRow, isGroup: true });

                        traverse(node._children);
                    } else {
                        dataRowCount++;
                        const isOdd = dataRowCount % 2 === 1;
                        const bg = isOdd ? "FFFFFF" : "F9FAFB";
                        const dataRow = allKeys.map((k) => {
                            if (k === "sno") return cell(dataRowCount, { fontColor: "9CA3AF", align: "center", indent: 0, fgColor: bg });
                            if (DATE_KEYS.has(k)) return cell(fmtExcelDate(node[k]), { fgColor: bg });
                            if (NUMBER_KEYS.has(k)) return numberCell(k, node, bg);
                            return cell(String(node[k] ?? ""), { fgColor: bg });
                        });
                        allSheetRows.push({ cells: dataRow, isGroup: false });
                    }
                });
            }
            traverse(exportTree);
        } else {
            dataToExport.forEach((row) => {
                dataRowCount++;
                const isOdd = dataRowCount % 2 === 1;
                const bg = isOdd ? "FFFFFF" : "F9FAFB";

                const dataRow = allKeys.map((k) => {
                    if (k === "sno")
                        return cell(dataRowCount, {
                            fontColor: "9CA3AF",
                            align: "center",
                            indent: 0,
                            fgColor: bg,
                        });
                    if (DATE_KEYS.has(k))
                        return cell(fmtExcelDate(row[k]), { fgColor: bg });
                    if (NUMBER_KEYS.has(k))
                        return numberCell(k, row, bg);
                    return cell(String(row[k] ?? ""), { fgColor: bg });
                });

                allSheetRows.push({ cells: dataRow, isGroup: false });
            });
        }

        // ── Header row ───────────────────────────────────────────────────────────
        const headerRow = allLabels.map((label, i) =>
            cell(label, {
                bold: true,
                fgColor: "F3F4F6",
                fontColor: "000000",
                align: NUMBER_KEYS.has(allKeys[i]) || allKeys[i] === "sno" ? "center" : "left",
                fontSize: 10,
                indent: 1,
            })
        );

        // ── Write sheet ──────────────────────────────────────────────────────────
        const wsData = [headerRow, ...allSheetRows.map((r) => r.cells)];
        const ws = XLSXStyle.utils.aoa_to_sheet(
            wsData.map((row) => row.map((c) => c.v))
        );

        wsData.forEach((row, ri) => {
            row.forEach((c, ci) => {
                const addr = XLSXStyle.utils.encode_cell({ r: ri, c: ci });
                ws[addr] = { ...(ws[addr] || {}), ...c };
                if (c.z) ws[addr].z = c.z;
            });
        });

        // ── Column widths ────────────────────────────────────────────────────────
        const COL_WIDTHS = {
            sno: 6, date: 14, salesman: 30,
            cash: 14, upi: 14, card: 14, online: 14,
            totalAmount: 16, posSales: 14, totalSales: 16,
        };
        ws["!cols"] = allKeys.map((k) => ({ wch: COL_WIDTHS[k] || Math.max(12, parseInt(cols.find(c => c.key === k)?.w || 100) / 7) }));

        // ── Row heights ───────────────────────────────────────────────────────────
        ws["!rows"] = [
            { hpt: 24 },
            ...allSheetRows.map((r) => ({ hpt: r.isGroup ? 20 : 17 })),
        ];

        // ── Freeze header ─────────────────────────────────────────────────────────
        ws["!freeze"] = { xSplit: 0, ySplit: 1, topLeftCell: "A2", activePane: "bottomLeft" };

        // ── Merge Cells for Group Headers (Optional but looks better) ───────────
        const merges = [];
        allSheetRows.forEach((r, ri) => {
            if (r.isGroup) {
                // Merge from column 1 to column totalAmount-1
                const totalAmountIdx = allKeys.indexOf("totalAmount");
                if (totalAmountIdx > 2) {
                    merges.push({
                        s: { r: ri + 1, c: 1 },
                        e: { r: ri + 1, c: totalAmountIdx - 1 }
                    });
                }
            }
        });
        ws["!merges"] = merges;

        // ── Export ────────────────────────────────────────────────────────────────
        const wb = XLSXStyle.utils.book_new();
        XLSXStyle.utils.book_append_sheet(wb, ws, sheetName);
        const fileName = `${sheetName.replace(/\s+/g, "_")}_${queryParams.fromDate}_to_${queryParams.toDate}.xlsx`;
        XLSXStyle.writeFile(wb, fileName);
    }

    return (
        <div className="flex flex-col h-full bg-gray-50 p-2 font-sans text-gray-900 overflow-hidden">

            <div className="flex items-center justify-between mb-2">
                <div>
                    <h1 className="text-xl font-black tracking-tight text-gray-900 leading-none">Overall Sales Report</h1>
                    <p className="text-[10px] text-gray-400 font-medium">POS, Bulk, Online & Expenses</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 px-2">
                        <span className="text-[9px] font-bold text-gray-400 uppercase">Report</span>
                        <select
                            className="text-xs font-bold text-indigo-600 outline-none bg-transparent cursor-pointer hover:text-indigo-700 transition-colors"
                            value={activeTab}
                            onChange={(e) => {
                                setActiveTab(e.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="all">All Transactions</option>
                            <option value="pos">POS Sales</option>
                            <option value="bulk">Bulk Sales</option>
                            <option value="online">Online Sales</option>
                            <option value="expense">Expenses</option>
                            <option value="salesman">Salesman Summary</option>
                        </select>
                    </div>
                    <div className="w-px h-6 bg-gray-100" />
                    <div className="flex items-center gap-2 px-2">
                        <span className="text-[9px] font-bold text-gray-400 uppercase">From</span>
                        <input
                            type="date"
                            className="text-xs font-bold text-gray-800 outline-none bg-transparent"
                            value={queryParams.fromDate}
                            onChange={(e) => setQueryParams(p => ({ ...p, fromDate: e.target.value }))}
                        />
                    </div>
                    <div className="w-px h-6 bg-gray-100" />
                    <div className="flex items-center gap-2 px-2">
                        <span className="text-[9px] font-bold text-gray-400 uppercase">To</span>
                        <input
                            type="date"
                            className="text-xs font-bold text-gray-800 outline-none bg-transparent"
                            value={queryParams.toDate}
                            onChange={(e) => setQueryParams(p => ({ ...p, toDate: e.target.value }))}
                        />
                    </div>
                    <button
                        onClick={exportExcel}
                        className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                    >
                        Export
                    </button>
                    <button
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="bg-white text-indigo-600 border border-indigo-100 p-1.5 rounded-lg hover:bg-indigo-50 transition-all active:scale-95 disabled:opacity-50"
                        title="Refresh Data"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-2">
                <MetricCard title="Total POS" value={metrics.totalPos} color="blue" />
                <MetricCard title="Total Bulk" value={metrics.totalBulk} color="purple" />
                {/* <MetricCard title="Total Online" value={metrics.totalOnline} color="cyan" /> */}
                <MetricCard title="Total Expenses" value={metrics.totalExpense} color="red" />
                <MetricCard title="Net Profit" value={metrics.finalProfit} color="green" isPrimary />
            </div>


            {/* Table Area */}
            <div className="flex-1 bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col overflow-hidden">
                {activeTab !== 'salesman' ? (
                    <>
                        <div className="p-2 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3">
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">Group By:</div>
                            <div
                                className="flex-1 min-h-[36px] flex items-center gap-2 flex-wrap"
                                onDragOver={onGbDragOver}
                                onDrop={onGbDrop}
                            >
                                {groupKeys.length === 0 ? (
                                    <span className="text-[10px] text-gray-400 font-medium italic">Drag column headers here to group results...</span>
                                ) : (
                                    groupKeys.map(k => (
                                        <span key={k} className="bg-indigo-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-2 shadow-md shadow-indigo-100">
                                            {COLUMNS.find(c => c.key === k)?.label}
                                            <button onClick={() => toggleGroupDir(k)} className="hover:text-indigo-200">{groupDirs[k] === 1 ? '↑' : '↓'}</button>
                                            <button onClick={() => removeGroupKey(k)} className="hover:text-indigo-200">×</button>
                                        </span>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto custom-scrollbar">
                            <table className="w-full border-collapse">
                                <thead className="sticky top-0 bg-white/95 backdrop-blur-md z-20 shadow-sm">
                                    <tr>
                                        <th className="w-12 px-2 py-4 text-[10px] font-black text-gray-400 uppercase border-b border-gray-100">#</th>
                                        {visibleCols.map(col => (
                                            <th
                                                key={col.key}
                                                draggable
                                                onDragStart={(e) => onColDragStart(e, col.key)}
                                                onDragOver={(e) => e.preventDefault()}
                                                onDrop={(e) => onColDrop(e, col.key)}
                                                className="px-3 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-100 cursor-grab active:cursor-grabbing hover:bg-gray-50 transition-colors"
                                                style={{ width: col.w }}
                                            >
                                                <div className="flex items-center gap-2 relative">
                                                    <span className="truncate">{col.label}</span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setOpenMenuCol(openMenuCol === col.key ? null : col.key);
                                                        }}
                                                        className={`transition-colors ${colFilters[col.key] ? 'text-indigo-600' : 'text-gray-300 hover:text-indigo-500'}`}
                                                    >
                                                        {sortKey === col.key ? (sortDir === 1 ? '↑' : '↓') : '⇅'}
                                                    </button>
                                                    {openMenuCol === col.key && (
                                                        <ColumnFilterMenu
                                                            colKey={col.key}
                                                            allValues={uniqueVals[col.key] || []}
                                                            activeFilter={colFilters[col.key]}
                                                            onApply={handleFilterApply}
                                                            onSort={handleSort}
                                                            onClose={() => setOpenMenuCol(null)}
                                                        />
                                                    )}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {tree.length === 0 ? (
                                        <tr><td colSpan={visibleCols.length + 1} className="py-20 text-center text-gray-400 font-medium">No records found.</td></tr>
                                    ) : (
                                        tree.map((node, i) => renderNode(node, visibleCols, i, i))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer / Pagination */}
                        <div className="p-5 border-t border-gray-50 bg-gray-50/50 flex items-center justify-between">
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                Showing {paginated.length} of {filtered.length} entries
                            </div>
                            <div className="flex gap-2">
                                <button
                                    disabled={safePage === 1}
                                    onClick={() => setPage(p => p - 1)}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-30 transition-all"
                                >
                                    ←
                                </button>
                                <div className="flex items-center px-4 text-sm font-black text-gray-800 bg-white rounded-xl border border-gray-100">
                                    {safePage} / {totalPages}
                                </div>
                                <button
                                    disabled={safePage === totalPages}
                                    onClick={() => setPage(p => p + 1)}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-30 transition-all"
                                >
                                    →
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex-1 overflow-auto custom-scrollbar">
                            <table className="w-full border-collapse">
                                <thead className="sticky top-0 bg-white/95 backdrop-blur-md z-20 shadow-sm">
                                    <tr>
                                        <th className="w-12 px-2 py-4 text-[10px] font-black text-gray-400 uppercase border-b border-gray-100 text-center">#</th>
                                        {SM_COLUMNS.map(col => (
                                            <th
                                                key={col.key}
                                                className="px-3 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-100"
                                                style={{ width: col.w }}
                                            >
                                                {col.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {apiData.salesmanSummary.length === 0 ? (
                                        <tr><td colSpan={SM_COLUMNS.length + 1} className="py-20 text-center text-gray-400 font-medium">No performance data found.</td></tr>
                                    ) : (
                                        apiData.salesmanSummary.map((sm, i) => (
                                            <tr key={sm.id} className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-indigo-50/70 transition-colors`}>
                                                <td className="px-2 py-3 w-12 text-center border-r border-b border-gray-100 text-[10px] text-gray-400 font-bold select-none">{i + 1}</td>
                                                <td className="px-3 py-3 border-r border-b border-gray-100 text-xs font-bold text-gray-800">{sm.id}</td>
                                                <td className="px-3 py-3 border-r border-b border-gray-100 text-xs font-black text-indigo-600">{sm.name}</td>
                                                <td className="px-3 py-3 border-r border-b border-gray-100 text-xs font-medium text-gray-600">{sm.billCount} Bills</td>
                                                <td className="px-3 py-3 border-r border-b border-gray-100 text-xs font-bold text-gray-900 text-right">{fmtCurrency(sm.posSales)}</td>
                                                <td className="px-3 py-3 border-b border-gray-100 text-xs font-black text-gray-900 text-right">{fmtCurrency(sm.totalSales)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function MetricCard({ title, value, color, isPrimary }) {
    const themes = {
        blue: "text-blue-600 bg-blue-50/50 border-blue-100 shadow-blue-100/20",
        purple: "text-purple-600 bg-purple-50/50 border-purple-100 shadow-purple-100/20",
        cyan: "text-cyan-600 bg-cyan-50/50 border-cyan-100 shadow-cyan-100/20",
        red: "text-red-600 bg-red-50/50 border-red-100 shadow-red-100/20",
        green: "text-green-600 bg-green-50/50 border-green-100 shadow-green-100/20",
    };

    return (
        <div className={`p-2 px-4 rounded-2xl border shadow-lg transition-all hover:scale-[1.02] ${themes[color] || themes.blue} ${isPrimary ? 'ring-2 ring-white' : ''}`}>
            <div className="text-[9px] font-black uppercase tracking-[0.1em] opacity-60">{title}</div>
            <div className={`text-sm font-black tabular-nums ${isPrimary ? 'text-green-700' : ''}`}>
                {fmtCurrency(value)}
            </div>
        </div>
    );
}
