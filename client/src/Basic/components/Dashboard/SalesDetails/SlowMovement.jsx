import React, { useEffect, useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";

import { Card, CardHeader, CardContent, Box, Typography } from "@mui/material";

// import SpinLoader from "../../../utils/spinLoader";
import {
  FaTimes,
  FaSearch,
  FaStepBackward,
  FaStepForward,
  FaChevronLeft,
  FaChevronRight,
  FaSortAmountUp,
  FaSortAmountDown,
} from "react-icons/fa";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

import { useGetDeadStockQuery, useGetSlowMovingItemsByVelocityQuery, useGetSlowMovingItemsQuery } from "../../../../redux/uniformService/SalesDashboardService.js";
import { addInsightsRowTurnOver, formatQtyByUOM, getExcelQtyFormatByUOM } from "../../../../Utils/helper.js";

const AGING_RANGES = [

  { label: "91–120", min: 91, max: 120 },
  { label: "121–150", min: 121, max: 150 },
  { label: "151–180", min: 151, max: 180 },
  { label: "181–210", min: 181, max: 210 },
  { label: "211–240", min: 211, max: 240 },
  { label: "241–270", min: 241, max: 270 },
  { label: "271–300", min: 271, max: 300 },
  { label: "301-330", min: 301, max: 330 },
  { label: "331-360", min: 331, max: 360 },
  { label: "361-390", min: 361, max: 390 },
  { label: "391-420", min: 391, max: 420 },
  { label: "421-450", min: 421, max: 450 },
  { label: "451-480", min: 451, max: 480 },
  { label: "481-510", min: 481, max: 510 },
  { label: "511-540", min: 511, max: 540 },
  { label: "541-570", min: 541, max: 570 },
  { label: "571-600", min: 571, max: 600 },
  { label: "601-630", min: 601, max: 630 },
  { label: "631-660", min: 631, max: 660 },
  { label: "661-690", min: 661, max: 690 },
  { label: "691-720", min: 691, max: 720 },
  { label: "721-750", min: 721, max: 750 },
  { label: "751-780", min: 751, max: 780 },
  { label: "781-810", min: 781, max: 810 },
  { label: "811-840", min: 811, max: 840 },
  { label: "841-870", min: 841, max: 870 },
  { label: "871-900", min: 871, max: 900 },
  { label: "901-930", min: 901, max: 930 },
  { label: "931-960", min: 931, max: 960 },
  { label: "961-990", min: 961, max: 990 },
  { label: "991 + ", min: 991, max: 99999 },
];

const CHART_HEIGHT = 420;
const RECORDS_PER_PAGE = 36;

/* ── Dropdown ─────────────────────────────────────────────────── */
const SlowTypeDropdown = ({ slowType, setSlowType, autoBorder }) => (
  <select
    className={`${autoBorder
      ? "border-2 border-blue-600"
      : "border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      } p-1 w-36 h-6.5 text-gray-900 text-xs rounded-md`}
    value={slowType}
    onChange={(e) => setSlowType(e.target.value)}
  >
    <option value="AGING">Aging</option>
    <option value="VELOCITY">Low Velocity</option>
    <option value="DEADSTOCK">Dead Stock</option>
  </select>
);

/* ── Aging color helper ───────────────────────────────────────── */
const agingBadgeStyle = (days) => {
  const d = Number(days);
  if (d <= 60) return { bg: "#e8f5e9", color: "#2e7d32" };
  if (d <= 120) return { bg: "#fff8e1", color: "#f57f17" };
  if (d <= 180) return { bg: "#fff3e0", color: "#e65100" };
  return { bg: "#fce4ec", color: "#b71c1c" };
};

//  Bucket Modal — styled like the second file's table modal

const BucketModal = ({ open, onClose, bucket }) => {
  const [itemNameSearch, setItemNameSearch] = useState("");
  const [itemGroupSearch, setItemGroupSearch] = useState("");
  const [docSearch, setDocSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("asc"); // null | "asc" | "desc"

  /* reset page & search whenever bucket changes */
  useEffect(() => {
    setItemNameSearch("");
    setItemGroupSearch("");
    setDocSearch("");
    setCurrentPage(1);
    setSortOrder("asc");
  }, [bucket]);

  const filtered = useMemo(() => {
    if (!bucket?.items) return [];

    let result = [...bucket.items];

    if (itemNameSearch.trim()) {
      const q = itemNameSearch.toLowerCase();
      result = result.filter((i) => i.itemName?.toLowerCase().includes(q));
    }

    if (itemGroupSearch.trim()) {
      const q = itemGroupSearch.toLowerCase();
      result = result.filter((i) => i.itemGroup?.toLowerCase().includes(q));
    }

    if (docSearch.trim()) {
      const q = docSearch.toLowerCase();
      result = result.filter((i) =>
        String(i.docId || "")
          .toLowerCase()
          .includes(q),
      );
    }

    if (sortOrder === "asc") {
      result = result.sort((a, b) => a.aging - b.aging);
    } else if (sortOrder === "desc") {
      result = result.sort((a, b) => b.aging - a.aging);
    }

    return result;
  }, [bucket, itemNameSearch, itemGroupSearch, docSearch, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / RECORDS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const currentRecords = filtered.slice(
    (safePage - 1) * RECORDS_PER_PAGE,
    safePage * RECORDS_PER_PAGE,
  );

  if (!open || !bucket) return null;

  const handleSort = (order) => {
    setSortOrder((prev) => (prev === order ? null : order));
    setCurrentPage(1);
  };
  // ── inside BucketModal, add this function ──
  const downloadExcel = async () => {
    if (!filtered.length) {
      alert("No data");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Aging Bucket Report");

    worksheet.columns = [
      { header: "S.No", key: "sno", width: 8 },
      { header: "Item Group", key: "itemGroup", width: 60 },
      { header: "Item Name", key: "itemName", width: 60 },
      { header: "Doc No", key: "docNo", width: 30 },
      { header: "Aging (Days)", key: "aging", width: 18 },
    ];

    /* ================= TITLE ================= */
    worksheet.insertRow(1, [
      `Slow Movement Sales Report    (${bucket.label} Days)`,
    ]);
    worksheet.mergeCells("A1:E1");
    const titleCell = worksheet.getCell("A1");
    titleCell.font = { bold: true, size: 14 };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getRow(1).height = 30;

    /* ================= INSIGHTS ROW ================= */
    addInsightsRowTurnOver({
      worksheet,
      startRow: 2,
      totalColumns: 3,
      localCompany: "HVM",
      disableFinYear: true,
      disableWeek: true,
    });

    /* ================= HEADER ROW ================= */
    const headerRow = worksheet.getRow(3);
    headerRow.height = 26;
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD9D9D9" },
      };
      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
    });

    /* ================= DATA ROWS ================= */
    filtered.forEach((item, idx) => {
      const row = worksheet.addRow({
        sno: idx + 1,
        itemGroup: item.itemGroup,
        itemName: item.itemName,
        docNo: item.docId,
        aging: Number(item.aging),
      });

      row.height = 22;

      row.getCell("sno").alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      row.getCell("itemGroup").alignment = {
        horizontal: "left",
        vertical: "middle",
        indent: 1,
      };
      row.getCell("itemName").alignment = {
        horizontal: "left",
        vertical: "middle",
        indent: 1,
      };
      row.getCell("docNo").alignment = {
        horizontal: "left",
        vertical: "middle",
        indent: 1,
      };
      row.getCell("aging").alignment = {
        horizontal: "center",
        vertical: "middle",
      };

      // ✅ text color only, no background
      const d = Number(item.aging);
      let agingColor = "FFB71C1C";
      if (d <= 60) agingColor = "FF2E7D32";
      else if (d <= 120) agingColor = "FFF57F17";
      else if (d <= 180) agingColor = "FFE65100";

      row.getCell("aging").font = { bold: true, color: { argb: agingColor } };

      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "FFE0E0E0" } },
          bottom: { style: "thin", color: { argb: "FFE0E0E0" } },
          left: { style: "thin", color: { argb: "FFE0E0E0" } },
          right: { style: "thin", color: { argb: "FFE0E0E0" } },
        };
      });
    });

    /* ================= TOTAL ROW ================= */
    const totalRow = worksheet.addRow({
      sno: "",
      itemGroup: "",
      itemName: "Total",
      docNo: "",
      aging: "",
    });
    totalRow.height = 24;
    totalRow.getCell("itemName").value = `Total Items: ${filtered.length}`;
    totalRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = { top: { style: "thin" } };
    });

    /* ================= FREEZE ================= */
    worksheet.views = [{ state: "frozen", ySplit: 3 }];

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `Slow Movement Sales Report ${bucket.label} Days.xlsx`,
    );
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex justify-center items-center">
      <div className="bg-white w-[1370px] h-[634px] p-4 rounded-xl relative flex flex-col">
        {/* ── HEADER ── */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="font-bold uppercase text-sm">
              Slow Movement Sales {"    "} ({bucket.label} Days) —{" "}
              <span className="text-blue-600"> HVM </span>
            </h2>
          </div>
          <div className="flex gap-2 items-center">
            <div className="bg-gray-300  rounded-lg shadow-2xl flex gap-x-4 gap-1 p-2">
              <div className="w-24">
                <select
                  value={"HVM"}
                  className="w-full px-2 py-1 text-xs border-2   rounded-md 
                border-blue-600 transition-all duration-200"
                >
                  <option value="HVM">HVM</option>
                </select>
              </div>
            </div>
            <button
              className="text-red-600 hover:text-red-800"
              onClick={onClose}
            >
              <FaTimes size={16} />
            </button>
          </div>
        </div>

        <p className="text-xs font-semibold  text-gray-600 mb-1">
          Total Items :{" "}
          <span className="text-xs font-semibold  px-2  rounded-full">
            {bucket.items.length}
          </span>
        </p>

        {/* ── SEARCH + SORT ── */}
        <div className="flex items-center gap-3 mt-1 mb-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Item Group..."
              value={itemGroupSearch}
              onChange={(e) => {
                setItemGroupSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="h-6 p-1 pl-7 text-gray-900 text-[11px] border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm w-52"
            />
            <FaSearch className="absolute left-2 top-1.5 text-gray-400 text-[11px]" />
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Item name..."
              value={itemNameSearch}
              onChange={(e) => {
                setItemNameSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="h-6 p-1 pl-7 text-gray-900 text-[11px] border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm w-52"
            />
            <FaSearch className="absolute left-2 top-1.5 text-gray-400 text-[11px]" />
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Doc No..."
              value={docSearch}
              onChange={(e) => {
                setDocSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="h-6 p-1 pl-7 text-gray-900 text-[11px] border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm w-52"
            />
            <FaSearch className="absolute left-2 top-1.5 text-gray-400 text-[11px]" />
          </div>

          {/* ── SORT BUTTONS ── */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-gray-600 font-medium uppercase tracking-wide">
              Aging:
            </span>
            <button
              onClick={() => handleSort("asc")}
              title="Sort Ascending (Lowest aging first)"
              className={`flex items-center gap-1 h-6 px-2 text-[10px] font-semibold rounded-md border transition-all
                ${sortOrder === "asc"
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white text-gray-500 border-gray-300 hover:border-blue-400 hover:text-blue-600"
                }`}
            >
              <FaSortAmountUp size={9} />
              ASC
            </button>
            <button
              onClick={() => handleSort("desc")}
              title="Sort Descending (Highest aging first)"
              className={`flex items-center gap-1 h-6 px-2 text-[10px] font-semibold rounded-md border transition-all
                ${sortOrder === "desc"
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white text-gray-500 border-gray-300 hover:border-blue-400 hover:text-blue-600"
                }`}
            >
              <FaSortAmountDown size={9} />
              DESC
            </button>
          </div>

          <button
            onClick={downloadExcel}
            className="ml-auto p-0 rounded-full shadow-md hover:brightness-110 transition-all duration-300"
            title="Download Excel"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/732/732220.png"
              alt="Download Excel"
              className="w-7 h-7 rounded-lg"
            />
          </button>
        </div>

        {/* ── TABLE ── */}
        <div className="flex-1 overflow-hidden">
          <div
            className="overflow-x-auto overflow-y-auto h-full border border-gray-300"
            style={{ border: "1px solid gray", borderRadius: "16px" }}
          >
            <table className="w-full border-collapse text-[11px] table-fixed">
              <thead className="bg-gray-100 text-gray-800 sticky top-0 z-10 tracking-wider">
                <tr>
                  <th className="border p-1 py-1 text-center w-8">S.No</th>
                  <th className="border p-1 text-center w-80">Item Group</th>
                  <th className="border p-1 text-center w-80">Item Name</th>
                  <th className="border p-1 text-center w-40">Doc No</th>
                  <th className="border p-1 text-center w-28">
                    <span className="inline-flex items-center justify-center gap-1">
                      Aging (Days)
                      {/* ✅ reserve space always — just change visibility */}
                      <span
                        style={{
                          width: 12,
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                      >
                        {sortOrder === "asc" && (
                          <FaSortAmountUp className="text-blue-500" size={9} />
                        )}
                        {sortOrder === "desc" && (
                          <FaSortAmountDown
                            className="text-blue-500"
                            size={9}
                          />
                        )}
                      </span>
                    </span>
                  </th>
                  <th className="border p-1 text-center w-auto"></th>
                </tr>
              </thead>
              <tbody>
                {currentRecords.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="text-center py-6 text-gray-400 text-xs"
                    >
                      No items found
                    </td>
                  </tr>
                ) : (
                  currentRecords.map((item, idx) => {
                    const { bg, color } = agingBadgeStyle(item.aging);
                    const serialNo =
                      (safePage - 1) * RECORDS_PER_PAGE + idx + 1;
                    return (
                      <tr
                        key={idx}
                        className="text-gray-800 text-[11px] bg-white even:bg-gray-50  transition-colors"
                      >
                        <td className="border p-1 text-center text-gray-800">
                          {serialNo}
                        </td>
                        <td className="border p-1 pl-2 text-left ">
                          {item.itemGroup}
                        </td>
                        <td className="border p-1 pl-2 text-left ">
                          {item.itemName}
                        </td>
                        <td className="border p-1 pl-2 text-left ">
                          {item.docId}
                        </td>
                        <td className="border p-1 text-right pr-1">
                          <span
                            style={{ color }}
                            className="text-[11px] font-bold px-2 py-0.5 "
                          >
                            {item.aging}
                          </span>
                        </td>
                        <td className="border p-1 text-center text-gray-400"></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── PAGINATION ── */}
        <div className="flex justify-between items-center mt-2 text-[11px]">
          <span className="text-gray-400 text-xs">
            Showing {currentRecords.length} of {filtered.length} item
            {filtered.length !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={safePage === 1}
              className={`p-1.5 rounded-md ${safePage === 1 ? "text-gray-300 cursor-not-allowed" : "text-blue-600 hover:bg-gray-100"}`}
            >
              <FaStepBackward size={13} />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={safePage === 1}
              className={`p-1.5 rounded-md ${safePage === 1 ? "text-gray-300 cursor-not-allowed" : "text-blue-600 hover:bg-gray-100"}`}
            >
              <FaChevronLeft size={13} />
            </button>
            <span className="text-xs font-semibold px-2">
              Page {safePage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={safePage === totalPages}
              className={`p-1.5 rounded-md ${safePage === totalPages ? "text-gray-300 cursor-not-allowed" : "text-blue-600 hover:bg-gray-100"}`}
            >
              <FaChevronRight size={13} />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={safePage === totalPages}
              className={`p-1.5 rounded-md ${safePage === totalPages ? "text-gray-300 cursor-not-allowed" : "text-blue-600 hover:bg-gray-100"}`}
            >
              <FaStepForward size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};



const AgingChart = ({
  response,
  onBarClick,
  finYrData,
  selectedYear,
  onYearChange,
}) => {
  // ── year navigation ──────────────────────────────────────────
  const years = useMemo(
    () => (finYrData || [])?.map((f) => f.finYear ?? f).filter(Boolean),
    [finYrData],
  );
  const currentYearIdx = useMemo(
    () => years?.indexOf(selectedYear),
    [years, selectedYear],
  );

  const canGoPrev = currentYearIdx > 0;
  const canGoNext = currentYearIdx < years.length - 1;

  const goPrev = () => canGoPrev && onYearChange(years[currentYearIdx - 1]);
  const goNext = () => canGoNext && onYearChange(years[currentYearIdx + 1]);

  // ── existing grouped / chart logic ──────────────────────────
  const grouped = useMemo(() => {
    if (!Array.isArray(response?.data)) return [];
    return AGING_RANGES.map((range) => {
      const items = response?.data?.filter(
        (item) =>
          Number(item.aging) >= range.min && Number(item.aging) <= range.max,
      );
      const agingSum = items?.reduce((sum, i) => sum + Number(i.aging), 0);
      return { ...range, items, agingSum };
    }).filter((g) => g.items.length > 0);
  }, [response]);

  const categories = useMemo(() => grouped.map((g) => g.itemGroup), [grouped]);

  console.log(categories, "categories", grouped, response)

  const { barData, lineData, maxBar } = useMemo(() => {

    const barData = grouped.map((g) => g.items.length);
    const rawLineData = grouped.map((g) => g.agingSum);
    const maxBar = Math.max(...barData, 1);
    const maxLine = Math.max(...rawLineData, 1);
    const lineData = rawLineData.map((v) =>
      parseFloat(((v / maxLine) * maxBar).toFixed(2)),
    );

    return { barData, lineData, maxBar };
  }, [grouped]);

  const option = useMemo(
    () => ({
      backgroundColor: "#ffffff",
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter(params) {
          const idx = params[0]?.dataIndex;
          const g = grouped[idx];
          if (!g) return "";
          const lines = g.items
            .slice(0, 5)
            .map((i) => `• ${i.itemName} (${i.aging}d)`)
            .join("<br/>");
          const more =
            g.items.length > 5
              ? `<br/><span style="color:#14c8d4;font-style:italic">+${g.items.length - 5} more — click to see all</span>`
              : "";
          return (
            `<b>${g.label} days</b><br/>` +
            `Items: <b>${g.items.length}</b><br/>` +
            `${lines}${more}`
          );
        },
      },
      legend: {
        data: ["Item Count", "Aging Sum"],
        textStyle: { color: "#333" },
        top: 8,
      },
      xAxis: {
        data: categories,
        axisLine: { lineStyle: { color: "#999" } },
        axisLabel: { color: "#333", fontSize: 11 },
      },
      yAxis: {
        name: "Items",
        nameTextStyle: { color: "#333", fontSize: 11 },
        splitLine: { show: false },
        axisLine: { lineStyle: { color: "#999" } },
        axisLabel: { color: "#333" },
      },
      series: [
        {
          name: "Item Count",
          type: "bar",
          barWidth: 10,
          itemStyle: {
            borderRadius: 5,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "#14c8d4" },
              { offset: 1, color: "#43eec6" },
            ]),
          },
          cursor: "pointer",
          data: barData,
          z: 2,
        },
        {
          name: "Item Count",
          type: "bar",
          barGap: "-100%",
          barWidth: 10,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(20,200,212,0.5)" },
              { offset: 0.2, color: "rgba(20,200,212,0.2)" },
              { offset: 1, color: "rgba(20,200,212,0)" },
            ]),
          },
          z: -12,
          silent: true,
          tooltip: { show: false },
          data: barData.map(() => maxBar),
        },
        {
          name: "Item Count",
          type: "pictorialBar",
          symbol: "rect",
          itemStyle: { color: "#ffffff" },
          symbolRepeat: true,
          symbolSize: [12, 4],
          symbolMargin: 1,
          z: -10,
          silent: true,
          tooltip: { show: false },
          data: barData.map(() => maxBar),
        },
        {
          name: "Aging Sum",
          type: "line",
          smooth: true,
          showAllSymbol: true,
          symbol: "emptyCircle",
          symbolSize: 15,
          lineStyle: { color: "#f5a623", width: 2 },
          itemStyle: { color: "#f5a623" },
          cursor: "pointer", // <-- show pointer on dots
          data: lineData,
          z: 3,
        },
      ],
      grid: { top: 60, bottom: 40, left: 55, right: 30 },
    }),
    [categories, barData, lineData, grouped, maxBar],
  );

  // ── unified click handler ────────────────────────────────────
  // seriesIndex 0 = bar (Item Count)
  // seriesIndex 3 = line (Aging Sum yellow dots)
  const handleChartClick = (params) => {
    const CLICKABLE_SERIES = [0, 3]; // bar + yellow line dots
    if (!CLICKABLE_SERIES.includes(params.seriesIndex)) return;
    const g = grouped[params.dataIndex];
    if (g?.items.length) onBarClick(g);
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {/* ── LEFT ARROW — go to NEXT (newer) year ── */}
      <button
        onClick={goNext}
        disabled={!canGoNext}
        title=""
        style={{
          position: "absolute",
          left: 0,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 10,
          background: canGoNext ? "#e0f7fa" : "#f5f5f5",
          border: "1px solid",
          borderColor: canGoNext ? "#14c8d4" : "#e0e0e0",
          borderRadius: "50%",
          width: 28,
          height: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: canGoNext ? "pointer" : "not-allowed",
          boxShadow: canGoNext ? "0 2px 6px rgba(20,200,212,0.3)" : "none",
          transition: "all 0.2s",
        }}
      >
        <FaChevronLeft size={11} color={canGoNext ? "#14c8d4" : "#bbb"} />
      </button>

      {/* ── CHART ── */}
      <div style={{ paddingLeft: 36, paddingRight: 36 }}>
        <ReactECharts
          echarts={echarts}
          option={option}
          notMerge
          lazyUpdate
          style={{ width: "100%", height: CHART_HEIGHT }}
          onEvents={{
            click: handleChartClick,
          }}
        />
      </div>

      {/* ── RIGHT ARROW — go to PREV (older/decrease) year ── */}
      <button
        onClick={goPrev}
        disabled={!canGoPrev}
        title=""
        style={{
          position: "absolute",
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 10,
          background: canGoPrev ? "#e0f7fa" : "#f5f5f5",
          border: "1px solid",
          borderColor: canGoPrev ? "#14c8d4" : "#e0e0e0",
          borderRadius: "50%",
          width: 28,
          height: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: canGoPrev ? "pointer" : "not-allowed",
          boxShadow: canGoPrev ? "0 2px 6px rgba(20,200,212,0.3)" : "none",
          transition: "all 0.2s",
        }}
      >
        <FaChevronRight size={11} color={canGoPrev ? "#14c8d4" : "#bbb"} />
      </button>
    </div>
  );
};

/* ── Low Velocity Horizontal Bar ─────────────────────────────── */
const LowVelocityChart = ({ data, onBarClick }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  // ── group by itemGroup ──────────────────────────────────────
  const grouped = useMemo(() => {
    if (!Array.isArray(data)) return [];
    const map = {};
    data.forEach((item) => {
      const grp = item.itemGroup || "Unknown";
      if (!map[grp]) map[grp] = [];
      map[grp].push(item);
    });
    return Object.entries(map)
      .map(([groupName, items]) => ({ groupName, items }))
      .sort((a, b) => b.items.length - a.items.length);
  }, [data]);

  const categories = grouped.map((g) => g.groupName);
  const barData = grouped.map((g) => g.items.length);
  const maxBar = Math.max(...barData, 1);

  const option = useMemo(
    () => ({
      backgroundColor: "#ffffff",
      tooltip: {
        formatter(info) {
          const g = grouped.find((g) => g.groupName === info.name);
          if (!g) return "";
          const extremelySlow = g.items.filter(
            (i) => i.slowMovementCategory === "Extremely Slow",
          ).length;
          const slowMoving = g.items.filter(
            (i) => i.slowMovementCategory === "Slow-moving",
          ).length;
          const preview = g.items
            .slice(0, 4)
            .map(
              (i) =>
                `• ${i.itemName} (ratio: ${(Number(i.soldRatio) * 100).toFixed(2)}%)`,
            )
            .join("<br/>");
          const more =
            g.items.length > 4
              ? `<br/><span style="color:#1565c0;font-style:italic">+${g.items.length - 4} more — click to see all</span>`
              : "";
          return (
            `<b>${g.groupName}</b><br/>` +
            `Items: <b>${g.items.length}</b><br/>` +
            `Extremely Slow: <b style="color:#0d47a1">${extremelySlow}</b> &nbsp; Slow-moving: <b style="color:#1976d2">${slowMoving}</b><br/>` +
            `${preview}${more}`
          );
        },
      },
      series: [
        {
          type: "treemap",
          width: "100%",
          height: "100%",
          roam: false,
          nodeClick: "link",
          cursor: "pointer",
          label: {
            show: true,
            formatter: (p) => `{name|${p.name}}\n{count|${p.value} items}`,
            rich: {
              name: {
                fontSize: 11,
                fontWeight: "bold",
                color: "#fff",
                lineHeight: 18,
              },
              count: {
                fontSize: 10,
                color: "rgba(255,255,255,0.85)",
                lineHeight: 16,
              },
            },
          },
          upperLabel: { show: false },
          itemStyle: {
            borderWidth: 2,
            borderColor: "#fff",
            gapWidth: 2,
          },
          levels: [
            {
              itemStyle: {
                borderWidth: 2,
                borderColor: "#fff",
                gapWidth: 2,
              },
              colorSaturation: [0.4, 0.8],
            },
          ],
          colorBy: "data",
          color: [
            "#1565c0",
            "#1976d2",
            "#1e88e5",
            "#2196f3",
            "#42a5f5",
            "#64b5f6",
            "#0d47a1",
            "#1a237e",
            "#283593",
            "#0288d1",
            "#0277bd",
            "#01579b",
          ],
          data: grouped.map((g) => ({
            name: g.groupName,
            value: g.items.length,
          })),
        },
      ],
    }),
    [grouped],
  );

  if (!grouped.length) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: CHART_HEIGHT,
          color: "#aaa",
          fontSize: "0.88rem",
        }}
      >
        No low velocity items found for the selected year.
      </Box>
    );
  }

  return (
    <>
      <ReactECharts
        echarts={echarts}
        option={option}
        notMerge
        lazyUpdate
        style={{ width: "100%", height: CHART_HEIGHT }}
        onEvents={{
          click: (params) => {
            // ✅ treemap fires click with params.name = groupName
            const g = grouped.find((g) => g.groupName === params.name);
            if (g?.items.length) {
              setModalData(g);
              setModalOpen(true);
            }
          },
        }}
      />

      {modalOpen && modalData && (
        <LowVelocityGroupModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setModalData(null);
          }}
          group={modalData}
          allGroups={grouped}
        />
      )}
    </>
  );
};

const LowVelocityGroupModal = ({ open, onClose, group, allGroups = [] }) => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeGroup, setActiveGroup] = useState(group);

  useEffect(() => {
    setActiveGroup(group);
    setSearch("");
    setCurrentPage(1);
  }, [group]);

  const handleGroupChange = (groupName) => {
    const found = allGroups.find((g) => g.groupName === groupName);
    if (found) {
      setActiveGroup(found);
      setSearch("");
      setCurrentPage(1);
    }
  };

  const filtered = useMemo(() => {
    if (!activeGroup?.items) return [];
    const q = search.trim().toLowerCase();
    return !q
      ? [...activeGroup.items]
      : activeGroup.items.filter((i) => i.itemName.toLowerCase().includes(q));
  }, [activeGroup, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / RECORDS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const currentRecords = filtered.slice(
    (safePage - 1) * RECORDS_PER_PAGE,
    safePage * RECORDS_PER_PAGE,
  );

  if (!open || !activeGroup) return null;

  const downloadExcel = async () => {
    if (!filtered.length) {
      alert("No data");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Low Velocity Report");

    worksheet.columns = [
      { header: "S.No", key: "sno", width: 8 },
      { header: "Item Name", key: "itemName", width: 60 },
      { header: "UOM", key: "uom", width: 16 },
      { header: "Total Inward Quantity", key: "totalQuantity", width: 22 },
      { header: "Total Sold Quantity", key: "totalSold", width: 22 },
      { header: "Balance Quantity", key: "balanceStock", width: 18 },
      { header: "Sold Ratio", key: "soldRatio", width: 14 },
      { header: "Category", key: "slowMovementCategory", width: 22 },
    ];

    worksheet.insertRow(1, [`Low Velocity Report`]);
    worksheet.mergeCells("A1:H1");
    const titleCell = worksheet.getCell("A1");
    titleCell.font = { bold: true, size: 14 };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getRow(1).height = 30;

    addInsightsRowTurnOver({
      worksheet,
      startRow: 2,
      totalColumns: 7,
      localCompany: "HVM",
      disableFinYear: true,
      disableWeek: true,
      dynamicField: "Item Group",
      dynamicValue: activeGroup.groupName,
    });

    const headerRow = worksheet.getRow(3);
    headerRow.height = 26;
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD9D9D9" },
      };
      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
    });

    filtered.forEach((item, idx) => {
      const row = worksheet.addRow({
        sno: idx + 1,
        itemName: item.itemName,
        uom: item.uom ?? "",
        totalQuantity: Number(item.totalQuantity || 0),
        totalSold: Number(item.totalSold || 0),
        balanceStock: Number(item.balanceStock || 0),
        soldRatio: Number(item.soldRatio || 0) * 100, // ✅ as percentage
        slowMovementCategory: item.slowMovementCategory ?? "",
      });

      row.height = 22;
      row.getCell("sno").alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      row.getCell("itemName").alignment = {
        horizontal: "left",
        vertical: "middle",
        indent: 1,
      };
      row.getCell("uom").alignment = {
        horizontal: "left",
        vertical: "middle",
        indent: 1,
      };
      row.getCell("totalQuantity").alignment = {
        horizontal: "right",
        vertical: "middle",
        indent: 1,
      };
      row.getCell("totalSold").alignment = {
        horizontal: "right",
        vertical: "middle",
        indent: 1,
      };
      row.getCell("balanceStock").alignment = {
        horizontal: "right",
        vertical: "middle",
        indent: 1,
      };
      row.getCell("soldRatio").alignment = {
        horizontal: "right",
        vertical: "middle",
        indent: 1,
      };
      row.getCell("slowMovementCategory").alignment = {
        horizontal: "left",
        vertical: "middle",
        indent: 1,
      };

      row.getCell("totalQuantity").numFmt = getExcelQtyFormatByUOM(item.uom);
      row.getCell("totalSold").numFmt = getExcelQtyFormatByUOM(item.uom);
      row.getCell("balanceStock").numFmt = getExcelQtyFormatByUOM(item.uom);
      row.getCell("soldRatio").numFmt = '0.00"%"';

      // ── category color ──
      const cat = item.slowMovementCategory;
      row.getCell("slowMovementCategory").font = {
        bold: true,
        color: { argb: cat === "Extremely Slow" ? "FFFF0000" : "FFFFA500" },
      };

      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "FFE0E0E0" } },
          bottom: { style: "thin", color: { argb: "FFE0E0E0" } },
          left: { style: "thin", color: { argb: "FFE0E0E0" } },
          right: { style: "thin", color: { argb: "FFE0E0E0" } },
        };
      });
    });

    const totalRow = worksheet.addRow({
      sno: "",
      itemName: `Total Items: ${filtered.length}`,
      uom: "",
      totalQuantity: "",
      totalSold: "",
      balanceStock: "",
      soldRatio: "",
      slowMovementCategory: "",
    });
    totalRow.height = 24;
    totalRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = { top: { style: "thin" } };
    });

    worksheet.views = [{ state: "frozen", ySplit: 3 }];
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `Low Velocity Report ${activeGroup.groupName}.xlsx`,
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex justify-center items-center">
      <div className="bg-white w-[1370px] h-[634px] p-4 rounded-xl relative flex flex-col">
        {/* ── HEADER ── */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="font-bold uppercase text-sm">
              Low Velocity — <span className="text-blue-600"> HVM </span>
            </h2>
          </div>
          <div className="flex gap-2 items-center">
            <div className="bg-gray-300 rounded-lg shadow-2xl flex items-center gap-2 p-2">
              <div className="w-20">
                <select
                  value={"HVM"}
                  className="w-full px-2 py-1 text-xs border-2 rounded-md border-blue-600 transition-all duration-200"
                >
                  <option value="HVM">HVM</option>
                </select>
              </div>
              <div className="w-60">
                <select
                  value={activeGroup.groupName}
                  onChange={(e) => handleGroupChange(e.target.value)}
                  className="w-full px-2 py-1 text-xs border-2 rounded-md border-blue-600 transition-all duration-200 bg-white"
                >
                  {allGroups.map((g) => (
                    <option key={g.groupName} value={g.groupName}>
                      {g.groupName} ({g.items.length})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              className="text-red-600 hover:text-red-800"
              onClick={onClose}
            >
              <FaTimes size={16} />
            </button>
          </div>
        </div>

        <p className="text-xs font-semibold text-gray-600 mb-1">
          Total Items :{" "}
          <span className="text-xs font-semibold px-2 rounded-full">
            {activeGroup.items.length}
          </span>
        </p>

        {/* ── SEARCH + EXCEL ── */}
        <div className="flex items-center gap-3 mt-1 mb-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search item name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="h-6 p-1 pl-7 text-gray-900 text-[11px] border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm w-52"
            />
            <FaSearch className="absolute left-2 top-1.5 text-gray-400 text-[11px]" />
          </div>
          {search && (
            <span className="text-[11px] text-gray-500">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          )}
          <button
            onClick={downloadExcel}
            className="ml-auto p-0 rounded-full shadow-md hover:brightness-110 transition-all duration-300"
            title="Download Excel"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/732/732220.png"
              alt="Download Excel"
              className="w-7 h-7 rounded-lg"
            />
          </button>
        </div>

        {/* ── TABLE ── */}
        <div className="flex-1 overflow-hidden">
          <div
            className="overflow-x-auto overflow-y-auto h-full border border-gray-300"
            style={{ border: "1px solid gray", borderRadius: "16px" }}
          >
            <table className="w-full border-collapse text-[11px] table-fixed">
              <thead className="bg-gray-100 text-gray-800 sticky top-0 z-10 tracking-wider">
                <tr>
                  <th className="border p-1 text-center w-8">S.No</th>
                  <th className="border p-1 text-center w-72">Item Name</th>
                  <th className="border p-1 text-center w-20">UOM</th>
                  <th className="border p-1 text-center w-40">
                    Total Inward Quantity
                  </th>
                  <th className="border p-1 text-center w-40">
                    Total Sold Quantity
                  </th>
                  <th className="border p-1 text-center w-32">
                    Balance Quantity
                  </th>
                  <th className="border p-1 text-center w-20">Sold Ratio</th>
                  <th className="border p-1 text-center w-28">Category</th>
                  <th className="border p-1 text-center w-auto"></th>
                </tr>
              </thead>
              <tbody>
                {currentRecords.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-center py-6 text-gray-400 text-[11px]"
                    >
                      No items found
                    </td>
                  </tr>
                ) : (
                  currentRecords.map((item, idx) => {
                    const serialNo =
                      (safePage - 1) * RECORDS_PER_PAGE + idx + 1;
                    const isExtreme =
                      item.slowMovementCategory === "Extremely Slow";
                    return (
                      <tr
                        key={idx}
                        className="text-gray-800 bg-white text-[11px] even:bg-gray-50  transition-colors"
                      >
                        <td className="border p-1 text-center text-gray-800">
                          {serialNo}
                        </td>
                        <td className="border p-1 pl-2 text-left">
                          {item.itemName}
                        </td>
                        <td className="border p-1 pl-2 text-left">
                          {item.uom}
                        </td>
                        <td className="border p-1 text-right pr-2">
                          {formatQtyByUOM(item.totalQuantity, item.uom)}
                        </td>
                        <td className="border p-1 text-right pr-2">
                          {formatQtyByUOM(item.totalSold, item.uom)}
                        </td>
                        <td className="border p-1 text-right pr-2">
                          {formatQtyByUOM(item.balanceStock, item.uom)}
                        </td>
                        <td className="border p-1 text-right pr-2">
                          {Number(item.soldRatio * 100).toFixed(2)} %
                        </td>
                        <td className="border p-1 text-left pl-1">
                          <span
                            style={{ color: isExtreme ? "red" : "orange" }}
                            className="text-[11px]"
                          >
                            {item.slowMovementCategory}
                          </span>
                        </td>
                        <td className="border p-1 text-center text-gray-400"></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── PAGINATION ── */}
        <div className="flex justify-between items-center mt-2 text-[11px]">
          <span className="text-gray-400 text-xs">
            Showing {currentRecords.length} of {filtered.length} item
            {filtered.length !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={safePage === 1}
              className={`p-1.5 rounded-md ${safePage === 1 ? "text-gray-300 cursor-not-allowed" : "text-blue-600 hover:bg-gray-100"}`}
            >
              <FaStepBackward size={13} />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={safePage === 1}
              className={`p-1.5 rounded-md ${safePage === 1 ? "text-gray-300 cursor-not-allowed" : "text-blue-600 hover:bg-gray-100"}`}
            >
              <FaChevronLeft size={13} />
            </button>
            <span className="text-xs font-semibold px-2">
              Page {safePage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={safePage === totalPages}
              className={`p-1.5 rounded-md ${safePage === totalPages ? "text-gray-300 cursor-not-allowed" : "text-blue-600 hover:bg-gray-100"}`}
            >
              <FaChevronRight size={13} />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={safePage === totalPages}
              className={`p-1.5 rounded-md ${safePage === totalPages ? "text-gray-300 cursor-not-allowed" : "text-blue-600 hover:bg-gray-100"}`}
            >
              <FaStepForward size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DeadStockChart = ({ data }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null); // { groupName, items[] }

  // ── group by itemGroup ──────────────────────────────────────
  const grouped = useMemo(() => {
    if (!Array.isArray(data)) return [];
    const map = {};
    data.forEach((item) => {
      const grp = item.itemGroup || "Unknown";
      if (!map[grp]) map[grp] = [];
      map[grp].push(item);
    });
    return Object.entries(map)
      .map(([groupName, items]) => ({ groupName, items }))
      .sort((a, b) => b.items.length - a.items.length); // highest first
  }, [data]);

  const categories = grouped.map((g) => g.groupName);
  const barData = grouped.map((g) => g.items.length);
  const maxBar = Math.max(...barData, 1);

  const option = useMemo(
    () => ({
      backgroundColor: "#ffffff",
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter(params) {
          const idx = params[0]?.dataIndex;
          const g = grouped[idx];
          if (!g) return "";
          const preview = g.items
            .slice(0, 4)
            .map((i) => `• ${i.itemName}`)
            .join("<br/>");
          const more =
            g.items.length > 4
              ? `<br/><span style="color:#CC3F57;font-style:italic">+${g.items.length - 4} more — click to see all</span>`
              : "";
          return `<b>${g.groupName}</b><br/>Items: <b>${g.items.length}</b><br/>${preview}${more}`;
        },
      },
      grid: { top: 30, bottom: 60, left: 55, right: 20 },
      xAxis: {
        type: "category",
        data: categories,
        axisLabel: {
          color: "#555",
          fontSize: 10,
          rotate: 30,
          overflow: "truncate",
          width: 80,
        },
        axisLine: { lineStyle: { color: "#ddd" } },
        axisTick: { show: false },
      },
      yAxis: {
        name: "Items",
        nameTextStyle: { color: "#999", fontSize: 10 },
        splitLine: { lineStyle: { type: "dashed", color: "#f0f0f0" } },
        axisLine: { show: false },
        axisLabel: { color: "#888", fontSize: 10 },
      },
      series: [
        {
          name: "Dead Stock Items",
          type: "bar",
          barWidth: 14,
          cursor: "pointer",
          itemStyle: {
            borderRadius: [4, 4, 0, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "#CC3F57" },
              { offset: 1, color: "#FF7853" },
            ]),
          },
          label: {
            show: true,
            position: "top",
            fontSize: 9,
            color: "#555",
            formatter: (p) => p.value,
          },
          data: barData,
        },
        // ── ghost bars (background fill) ──
        {
          type: "bar",
          barWidth: 14,
          barGap: "-100%",
          silent: true,
          tooltip: { show: false },
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(204,63,87,0.15)" },
              { offset: 1, color: "rgba(255,120,83,0.04)" },
            ]),
            borderRadius: [4, 4, 0, 0],
          },
          data: barData.map(() => maxBar),
        },
      ],
    }),
    [grouped, categories, barData, maxBar],
  );

  if (!grouped.length) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: CHART_HEIGHT,
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            backgroundColor: "#fce4ec",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography sx={{ fontSize: "1.1rem", lineHeight: 1 }}>✓</Typography>
        </Box>
        <Typography sx={{ color: "#aaa", fontSize: "0.88rem" }}>
          No dead stock items for this year
        </Typography>
      </Box>
    );
  }

  return (
    <>
      {/* ── TOP BAR ── */}

      {/* ── CHART ── */}
      <Box sx={{ height: CHART_HEIGHT, overflow: "hidden" }}>
        <ReactECharts
          echarts={echarts}
          option={option}
          notMerge
          lazyUpdate
          style={{ width: "100%", height: CHART_HEIGHT - 28 }}
          onEvents={{
            click: (params) => {
              const g = grouped[params.dataIndex];
              if (g?.items.length) {
                setModalData(g);
                setModalOpen(true);
              }
            },
          }}
        />
      </Box>
      {/* ── GROUP ITEMS MODAL ── */}
      {modalOpen && modalData && (
        <DeadStockGroupModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setModalData(null);
          }}
          group={modalData}
          allGroups={grouped}
        />
      )}
    </>
  );
};

const DeadStockGroupModal = ({ open, onClose, group, allGroups = [] }) => {
  const [itemNameSearch, setItemNameSearch] = useState("");
  const [docSearch, setDocSearch] = useState("");
  const [supplierSearch, setSupplierSearch] = useState("");
  const [rackSearch, setRackSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeGroup, setActiveGroup] = useState(group); // ✅ local group state

  // ── sync when parent group changes ──
  useEffect(() => {
    setActiveGroup(group);
    setItemNameSearch("");
    setDocSearch("");
    setSupplierSearch("");
    setRackSearch("");
    setCurrentPage(1);
  }, [group]);

  // ── reset page/search on group switch ──
  const handleGroupChange = (groupName) => {
    const found = allGroups.find((g) => g.groupName === groupName);
    if (found) {
      setActiveGroup(found);
      setItemNameSearch("");
      setDocSearch("");
      setSupplierSearch("");
      setRackSearch("");
      setCurrentPage(1);
    }
  };

  const filtered = useMemo(() => {
    if (!activeGroup?.items) return [];

    let result = [...activeGroup.items];

    if (itemNameSearch.trim()) {
      const q = itemNameSearch.toLowerCase();
      result = result.filter((i) => i.itemName?.toLowerCase().includes(q));
    }

    if (docSearch.trim()) {
      const q = docSearch.toLowerCase();
      result = result.filter((i) =>
        String(i.docId || "")
          .toLowerCase()
          .includes(q),
      );
    }

    if (supplierSearch.trim()) {
      const q = supplierSearch.toLowerCase();
      result = result.filter((i) => i.supplierName?.toLowerCase().includes(q));
    }

    if (rackSearch.trim()) {
      const q = rackSearch.toLowerCase();
      result = result.filter((i) => i.rackNo?.toLowerCase().includes(q));
    }

    return result;
  }, [activeGroup, itemNameSearch, docSearch, supplierSearch, rackSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / RECORDS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const currentRecords = filtered.slice(
    (safePage - 1) * RECORDS_PER_PAGE,
    safePage * RECORDS_PER_PAGE,
  );

  if (!open || !activeGroup) return null;

  const downloadExcel = async () => {
    if (!filtered.length) {
      alert("No data");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Dead Stock Report");

    worksheet.columns = [
      { header: "S.No", key: "sno", width: 8 },
      { header: "Item Name", key: "itemName", width: 60 },
      { header: "Doc No", key: "docId", width: 40 },
      { header: "Supplier Name", key: "supplierName", width: 50 },
      { header: "Rack No", key: "rackNo", width: 25 },
      { header: "Quantity", key: "quantity", width: 16 },
      { header: "UOM", key: "uom", width: 20 },
    ];

    /* ================= TITLE ================= */
    worksheet.insertRow(1, [`Dead Stock Report`]);
    worksheet.mergeCells("A1:G1");
    const titleCell = worksheet.getCell("A1");
    titleCell.font = { bold: true, size: 14 };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getRow(1).height = 30;

    /* ================= INSIGHTS ROW ================= */
    addInsightsRowTurnOver({
      worksheet,
      startRow: 2,
      totalColumns: 4,
      localCompany: "HVM",
      disableFinYear: true,
      disableWeek: true,
      dynamicField: "Item Group",
      dynamicValue: activeGroup.groupName,
    });

    /* ================= HEADER ROW ================= */
    const headerRow = worksheet.getRow(3);
    headerRow.height = 26;
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD9D9D9" },
      };
      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
    });

    /* ================= DATA ROWS ================= */
    filtered.forEach((item, idx) => {
      const row = worksheet.addRow({
        sno: idx + 1,
        itemName: item.itemName,
        docId: item.docId,
        supplierName: item.supplierName,
        rackNo: item.rackNo,
        quantity: Number(item.quantity || 0),
        uom: item.uom ?? "",
      });

      row.height = 22;

      row.getCell("sno").alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      row.getCell("itemName").alignment = {
        horizontal: "left",
        vertical: "middle",
        indent: 1,
      };
      row.getCell("docId").alignment = {
        horizontal: "left",
        vertical: "middle",
        indent: 1,
      };
      row.getCell("supplierName").alignment = {
        horizontal: "left",
        vertical: "middle",
        indent: 1,
      };
      row.getCell("rackNo").alignment = {
        horizontal: "left",
        vertical: "middle",
        indent: 1,
      };
      row.getCell("uom").alignment = {
        horizontal: "left",
        vertical: "middle",
        indent: 1,
      };
      row.getCell("quantity").alignment = {
        horizontal: "right",
        vertical: "middle",
        indent: 1,
      };

      // ✅ UOM-based quantity format
      row.getCell("quantity").numFmt = getExcelQtyFormatByUOM(item.uom);

      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "FFE0E0E0" } },
          bottom: { style: "thin", color: { argb: "FFE0E0E0" } },
          left: { style: "thin", color: { argb: "FFE0E0E0" } },
          right: { style: "thin", color: { argb: "FFE0E0E0" } },
        };
      });
    });

    /* ================= TOTAL ROW ================= */
    const totalRow = worksheet.addRow({
      sno: "",
      itemName: `Total Items: ${filtered.length}`,
      docId: "",
      supplierName: "",
      rackNo: "",
      quantity: "",
      uom: "",
    });
    totalRow.height = 24;
    totalRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = { top: { style: "thin" } };
    });

    /* ================= FREEZE ================= */
    worksheet.views = [{ state: "frozen", ySplit: 3 }];

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `Dead Stock Report ${activeGroup.groupName}.xlsx`,
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex justify-center items-center">
      <div className="bg-white w-[1370px] h-[634px] p-4 rounded-xl relative flex flex-col">
        {/* ── HEADER ── */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="font-bold uppercase text-sm">
              Dead Stock - <span className="text-blue-600"> HVM </span>{" "}
            </h2>
          </div>
          <div className="flex gap-2 items-center">
            <div className="bg-gray-300 rounded-lg shadow-2xl flex items-center gap-2 p-2">
              {/* HVM select */}
              <div className="w-20">
                <select
                  value={"HVM"}
                  className="w-full px-2 py-1 text-xs border-2 rounded-md
                             border-blue-600 transition-all duration-200"
                >
                  <option value="HVM">HVM</option>
                </select>
              </div>
              {/* ✅ Item Group Switcher */}
              <div className="w-60">
                <select
                  value={activeGroup.groupName}
                  onChange={(e) => handleGroupChange(e.target.value)}
                  className="w-full px-2 py-1 text-xs border-2 rounded-md
                             border-blue-600 transition-all duration-200 bg-white"
                >
                  {allGroups.map((g) => (
                    <option key={g.groupName} value={g.groupName}>
                      {g.groupName} ({g.items.length})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              className="text-red-600 hover:text-red-800"
              onClick={onClose}
            >
              <FaTimes size={16} />
            </button>
          </div>
        </div>

        <p className="text-xs font-semibold text-gray-600 mb-1">
          Total Items :{" "}
          <span className="text-xs font-semibold px-2 rounded-full">
            {activeGroup.items.length}
          </span>
        </p>

        {/* ── SEARCH + EXCEL ── */}
        <div className="flex items-center gap-3 mt-1 mb-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Item Name..."
              value={itemNameSearch}
              onChange={(e) => {
                setItemNameSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="h-6 p-1 pl-7 text-gray-900 text-[11px] border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm w-52"
            />
            <FaSearch className="absolute left-2 top-1.5 text-gray-400 text-[11px]" />
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Doc No..."
              value={docSearch}
              onChange={(e) => {
                setDocSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="h-6 p-1 pl-7 text-gray-900 text-[11px] border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm w-52"
            />
            <FaSearch className="absolute left-2 top-1.5 text-gray-400 text-[11px]" />
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Supplier..."
              value={supplierSearch}
              onChange={(e) => {
                setSupplierSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="h-6 p-1 pl-7 text-gray-900 text-[11px] border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm w-52"
            />
            <FaSearch className="absolute left-2 top-1.5 text-gray-400 text-[11px]" />
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Rack No..."
              value={rackSearch}
              onChange={(e) => {
                setRackSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="h-6 p-1 pl-7 text-gray-900 text-[11px] border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm w-52"
            />
            <FaSearch className="absolute left-2 top-1.5 text-gray-400 text-[11px]" />
          </div>

          <button
            onClick={downloadExcel}
            className="ml-auto p-0 rounded-full shadow-md hover:brightness-110 transition-all duration-300"
            title="Download Excel"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/732/732220.png"
              alt="Download Excel"
              className="w-7 h-7 rounded-lg"
            />
          </button>
        </div>

        {/* ── TABLE ── */}
        <div className="flex-1 overflow-hidden">
          <div
            className="overflow-x-auto overflow-y-auto h-full border border-gray-300"
            style={{ border: "1px solid gray", borderRadius: "16px" }}
          >
            <table className="w-full border-collapse text-[11px] table-fixed">
              <thead className="bg-gray-100 text-gray-800 sticky top-0 z-10 tracking-wider">
                <tr>
                  <th className="border p-1 text-center w-8">S.No</th>
                  <th className="border p-1 text-center w-80">Item Name</th>
                  <th className="border p-1 text-center w-40">Doc No</th>
                  <th className="border p-1 text-center w-80">Supplier Name</th>
                  <th className="border p-1 text-center w-28">Rack No</th>
                  <th className="border p-1 text-center w-20">Quantity</th>
                  <th className="border p-1 text-center w-20">UOM</th>
                  <th className="border p-1 text-center w-auto"></th>
                </tr>
              </thead>
              <tbody>
                {currentRecords.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="text-center py-6 text-gray-400 text-xs"
                    >
                      No items found
                    </td>
                  </tr>
                ) : (
                  currentRecords.map((item, idx) => {
                    const serialNo =
                      (safePage - 1) * RECORDS_PER_PAGE + idx + 1;
                    return (
                      <tr
                        key={idx}
                        className="text-gray-800 bg-white text-[11px] even:bg-gray-50  transition-colors"
                      >
                        <td className="border p-1 text-center text-gray-800">
                          {serialNo}
                        </td>
                        <td className="border p-1 pl-2 text-left ">
                          {item.itemName}
                        </td>
                        <td className="border p-1 pl-2 text-left ">
                          {item.docId}
                        </td>
                        <td className="border p-1 pl-2 text-left ">
                          {item.supplierName}
                        </td>
                        <td className="border p-1 pl-2 text-left ">
                          {item.rackNo}
                        </td>
                        <td className="border p-1 text-right pr-1 text-gray-800">
                          {formatQtyByUOM(item.quantity, item.uom)}
                        </td>
                        <td className="border p-1 pl-2 text-left ">
                          {item.uom}
                        </td>
                        <td className="border p-1 text-center text-gray-500"></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── PAGINATION ── */}
        <div className="flex justify-between items-center mt-2 text-[11px]">
          <span className="text-gray-400 text-xs">
            Showing {currentRecords.length} of {filtered.length} item
            {filtered.length !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={safePage === 1}
              className={`p-1.5 rounded-md ${safePage === 1 ? "text-gray-300 cursor-not-allowed" : "text-blue-500 hover:bg-gray-100"}`}
            >
              <FaStepBackward size={13} />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={safePage === 1}
              className={`p-1.5 rounded-md ${safePage === 1 ? "text-gray-300 cursor-not-allowed" : "text-blue-500 hover:bg-gray-100"}`}
            >
              <FaChevronLeft size={13} />
            </button>
            <span className="text-xs font-semibold px-2">
              Page {safePage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={safePage === totalPages}
              className={`p-1.5 rounded-md ${safePage === totalPages ? "text-gray-300 cursor-not-allowed" : "text-blue-500 hover:bg-gray-100"}`}
            >
              <FaChevronRight size={13} />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={safePage === totalPages}
              className={`p-1.5 rounded-md ${safePage === totalPages ? "text-gray-300 cursor-not-allowed" : "text-blue-500 hover:bg-gray-100"}`}
            >
              <FaStepForward size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Main component ───────────────────────────────────────────── */
const SlowMovement = ({
  yearFilter,
  selectedCompany,
  finYrData,
  filterType,
  setFilterType,
}) => {
  const [selectedYear, setSelectedYear] = useState(yearFilter || "");
  const [selectedfilterType, setSelectedFilterType] = useState(
    filterType || "ALL",
  );
  const [slowType, setSlowType] = useState("AGING");

  const [bucketModalOpen, setBucketModalOpen] = useState(false);
  const [bucketModalData, setBucketModalData] = useState(null);

  useEffect(() => setSelectedYear(yearFilter), [yearFilter]);
  useEffect(() => setSelectedFilterType(filterType), [filterType]);

  const skipBase = !selectedYear

  console.log(selectedYear, selectedCompany, filterType, "selectedYear, selectedCompany, filterType")

  const { data: agingResponse,
    isFetching: agingFetching,
    isLoading: agingLoading,
  } = useGetSlowMovingItemsQuery(
    { params: { selectedYear, selectedCompany, type: selectedfilterType } },
    { skip: skipBase || slowType !== "AGING" },
  );


  const {
    data: velocityResponse,
    isFetching: velFetching,
    isLoading: velLoading,
  } = useGetSlowMovingItemsByVelocityQuery(
    { params: { selectedYear } },
    { skip: !selectedYear || slowType !== "VELOCITY" },
  );

  const {
    data: deadStockResponse,
    isFetching: dsFetching,
    isLoading: dsLoading,
  } = useGetDeadStockQuery(
    { params: { selectedYear } },
    { skip: !selectedYear || slowType !== "DEADSTOCK" },
  );


  console.log(agingResponse, "agingResponse")


  const isLoading =
    slowType === "AGING"
      ? agingLoading
      : slowType === "VELOCITY"
        ? velLoading
        : dsLoading;
  const isFetching =
    slowType === "AGING"
      ? agingFetching
      : slowType === "VELOCITY"
        ? velFetching
        : dsFetching;

  return (
    <>
      <Card
        sx={{
          backgroundColor: "#f5f5f5",
          mt: 1,
          ml: 1,
          border: "1px solid #e0e0e0",
        }}
      >
        <CardHeader
          title="Slow Movement Sales"
          titleTypographyProps={{
            sx: { fontSize: ".9rem", fontWeight: 600, color: "#333" },
          }}
          action={
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <SlowTypeDropdown
                slowType={slowType}
                setSlowType={setSlowType}
                autoBorder
              />
            </Box>
          }
          sx={{
            p: 1,
            borderBottom: "1px solid #e0e0e0",
            "& .MuiCardHeader-action": {
              alignSelf: "center",
              marginTop: -1,
              marginRight: 5,
            },
          }}
        />

        <CardContent
          sx={{
            position: "relative",
            height: CHART_HEIGHT + 16, // ✅ fixed height — no more flicker
            width: "100%",
            boxSizing: "border-box",
            p: "8px !important",
            overflow: "hidden",
          }}
        >
          {(isLoading || isFetching) && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 10,
                backgroundColor: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(2px)",
              }}
            >
              {/* <SpinLoader /> */}
            </div>
          )}

          {slowType === "AGING" && (
            <AgingChart
              response={agingResponse}
              finYrData={finYrData} // ✅ pass fin year list
              selectedYear={selectedYear} // ✅ pass current year
              onYearChange={(yr) => setSelectedYear(yr)} // ✅ local year update
              onBarClick={(bucket) => {
                setBucketModalData(bucket);
                setBucketModalOpen(true);
              }}
            />
          )}

          {slowType === "VELOCITY" && (
            <LowVelocityChart
              data={velocityResponse?.data}
              onBarClick={() => { }}
            />
          )}

          {slowType === "DEADSTOCK" && (
            <DeadStockChart data={deadStockResponse?.data} />
          )}
        </CardContent>
      </Card>

      <BucketModal
        open={bucketModalOpen}
        onClose={() => {
          setBucketModalOpen(false);
          setBucketModalData(null);
        }}
        bucket={bucketModalData}
      />
    </>
  );
};

export default SlowMovement;
