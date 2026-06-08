import { useState, useMemo, useEffect } from "react";
import {
    FaTimes,
    FaChevronLeft,
    FaChevronRight,
    FaStepBackward,
    FaStepForward,
    FaSearch,
    FaUserTie,
    FaUsers,
} from "react-icons/fa";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

import { useGetYearlySalesTableQuery } from
    "../../../../../redux/uniformService/SalesDashboardService";

// import SpinLoader from '../../../../utils/spinLoader'
import moment from "moment";
import { addInsightsRowTurnOver } from "../../../../../Utils/helper";
import { dropDownFinYearNew } from "../../../../../Utils/contructObject";
import { DropdownInputNew } from "../../../../../Inputs";
// import FinYear from "../../../../components/FinYear";
const YearlyWiseTable = ({
    year, company, closeTable, finYrData, type, SalesType, setSalesType, setType
}) => {

    console.log(year, company, finYrData, "receivedparams")

    const [netpayRange, setNetpayRange] = useState({
        min: 0,
        max: Infinity,
    });
    const [localCompany, setLocalCompany] = useState(company || "ALL");
    const [localYear, setLocalYear] = useState(year);

    const [search, setSearch] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 34;


    const handleFilterClick = (type) => {
        setType(type);
    };


    const handleFilterClickNew = (type) => {
        setSalesType(type);
    };

    const { data: response, isLoading } =
        useGetYearlySalesTableQuery(
            {
                params: {
                    selectedCompany: localCompany === "ALL" ? undefined : localCompany,
                    finYear: localYear,
                    type,
                    SalesType
                },
            },
            { skip: !localYear }
        );

    const rawData = useMemo(() => {
        return Array.isArray(response?.data) ? response.data : [];
    }, [response?.data]);

    console.log(rawData, "rawData");
    console.log(search, "search");

    const formateDate = (date) => {
        if (!date) return

        return moment(date).format("DD-MM-YYYY")

    }

    // ✅ FILTERING
    const filteredData = useMemo(() => {
        return rawData.filter((row) => {
            // 🔹 Customer dropdown filter


            // 🔹 Search filter (month search)
            if (search.docId) {
                const rowdocId = row.docId?.toLowerCase() || "";
                if (!rowdocId.includes(search.docId.toLowerCase())) {
                    return false;
                }
            }
            if (search.salesType) {
                const rowsalesType = row.salesType?.toString().toLowerCase() || "";
                if (!rowsalesType.includes(search.salesType.toLowerCase())) {
                    return false;
                }
            }
            // 🔹 Style Ref No search
            if (search.customer) {
                const rowcustomer = row.customer?.toLowerCase() || "";
                if (!rowcustomer.includes(search.customer.toLowerCase())) {
                    return false;
                }
            }
            if (search.docDate) {
                const rowdocDate = formateDate(row.docDate)?.toLowerCase() || "";
                if (!rowdocDate.includes(search.docDate.toLowerCase())) {
                    return false;
                }
            }

            // 🔹 Min / Max Turnover filter
            const value = Number(row.amount || 0);

            // if (value < netpayRange.min) return false;
            // if (netpayRange.max !== Infinity && value > netpayRange.max) return false;

            return true;
        });
    }, [rawData, search, netpayRange]);


    console.log(filteredData, 'filteredData')


    useEffect(() => {
        setLocalCompany(company || "ALL");
    }, [company]);



    const totalSalesAmount = useMemo(() => {
        return filteredData.filter(i => i.isReturn === false)?.reduce((sum, row) => {
            return sum + parseFloat(row.amount || 0);
        }, 0);
    }, [filteredData]);

    const totalReturnsAmount = useMemo(() => {
        return filteredData.filter(i => i.isReturn === true)?.reduce((sum, row) => {
            return sum + parseFloat(row.amount || 0);
        }, 0);
    }, [filteredData]);

    const totalTurnOver = useMemo(() => {
        if (SalesType === "Sales") return totalSalesAmount;
        if (SalesType === "Returns") return totalReturnsAmount;
        return totalSalesAmount - totalReturnsAmount;
    }, [totalSalesAmount, totalReturnsAmount, SalesType]);




    const totalPages = Math.ceil(filteredData.length / recordsPerPage);
    const currentRecords = filteredData.slice(
        (currentPage - 1) * recordsPerPage,
        currentPage * recordsPerPage
    );



    // ✅ EXCEL EXPORT
    const downloadExcel = async () => {
        if (!filteredData.length) {
            alert("No data");
            return;
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Year Wise Sales Report");
        worksheet.columns = [
            { header: "Sales Type", key: "salesType", width: 25 },
            { header: "Doc No", key: "docNo", width: 35 },
            { header: "Doc Date", key: "docDate", width: 16 },
            { header: "Customer", key: "customer", width: 45 },
            { header: "Amount", key: "amount", width: 21 },
        ];

        /* ================= TITLE ================= */
        worksheet.insertRow(1, ["Year Wise Sales Report"]);
        worksheet.mergeCells("A1:E1");

        const titleCell = worksheet.getCell("A1");
        titleCell.font = { bold: true, size: 14 };
        titleCell.alignment = { horizontal: "center", vertical: "middle" };
        worksheet.getRow(1).height = 30;

        /* ================= INSIGHTS ================= */
        addInsightsRowTurnOver({
            worksheet,
            startRow: 2,
            totalColumns: 3,
            selectedYear: localYear,
            localCompany,


        });

        /* ================= COLUMNS ================= */


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

        /* ================= DATA ================= */
        filteredData.forEach((r) => {
            worksheet.addRow({
                salesType: r.salesType,
                docNo: r.docId,
                docDate: formateDate(r.docDate),
                customer: r.customer,
                amount: Number(r.amount || 0)
            });
        });

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber <= 3) return;

            row.height = 22;
            row.getCell("salesType").alignment = { horizontal: "left", vertical: "middle", indent: 1 };
            row.getCell("docNo").alignment = { horizontal: "left", vertical: "middle", indent: 1 };
            row.getCell("docDate").alignment = { horizontal: "left", vertical: "middle", indent: 1 };
            row.getCell("customer").alignment = { horizontal: "left", vertical: "middle", indent: 1 };
            row.getCell("amount").alignment = { horizontal: "right", vertical: "middle", indent: 1 };
        });

        // ================= TOTAL ROW =================
        const totalRow = worksheet.addRow({
            salesType: "",
            docNo: "",
            docDate: "",
            customer: "Total",
            amount: totalTurnOver,
        });

        totalRow.height = 24;

        // Style TOTAL row
        totalRow.eachCell((cell, colNumber) => {
            cell.font = { bold: true };
            cell.border = {
                top: { style: "thin" },

            };
            cell.alignment = {
                vertical: "middle",
                horizontal: colNumber === 5 ? "right" : "center",
                indent: 1
            };
        });
        worksheet.getColumn("docDate").numFmt = "dd-mm-yyyy";

        worksheet.getColumn("amount").numFmt = '₹ #,##,##0.00';

        /* ================= FREEZE ================= */
        worksheet.views = [{ state: "frozen", ySplit: 3 }];

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(
            new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            }),
            "Year Wise Sales Report.xlsx"
        );
    };






    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex justify-center items-center">
            <div className="bg-white w-[1350px] h-[630px] p-4 rounded-xl relative">

                {/* HEADER */}
                <div className="flex justify-between items-center">
                    <h2 className="font-bold uppercase">
                        Year Wise Sales - <span className="text-blue-600 ">{localCompany || ""}</span>
                    </h2>

                    <div className="flex flex-wrap items-center gap-4 pr-1">

                        <div className="flex items-center gap-2 border border-gray-300  p-1">
                            <button
                                onClick={() => handleFilterClickNew("Sales")}
                                className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full shadow-sm transition-all ${SalesType === "Sales"
                                    ? "bg-blue-600 text-white scale-105"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                            >
                                <FaUserTie size={12} /> Sales
                            </button>
                            <button
                                onClick={() => handleFilterClickNew("Returns")}
                                className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full shadow-sm transition-all ${SalesType === "Returns"
                                    ? "bg-blue-600 text-white scale-105"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                            >
                                <FaUsers size={14} /> Returns
                            </button>
                            <button
                                onClick={() => handleFilterClickNew("All")}
                                className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full shadow-sm transition-all ${SalesType === "All"
                                    ? "bg-blue-600 text-white scale-105"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                            >
                                <FaUsers size={14} /> All
                            </button>
                        </div>
                        <div className="flex items-center gap-2 border border-gray-300  p-1">
                            <button
                                onClick={() => handleFilterClick("B2B")}
                                className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full shadow-sm transition-all ${type === "B2B"
                                    ? "bg-blue-600 text-white scale-105"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                            >
                                <FaUserTie size={12} /> B2B
                            </button>
                            <button
                                onClick={() => handleFilterClick("B2C")}
                                className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full shadow-sm transition-all ${type === "B2C"
                                    ? "bg-blue-600 text-white scale-105"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                            >
                                <FaUsers size={14} /> B2C
                            </button>
                            <button
                                onClick={() => handleFilterClick("All")}
                                className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full shadow-sm transition-all ${type === "All"
                                    ? "bg-blue-600 text-white scale-105"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                            >
                                <FaUsers size={14} /> All
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Year Dropdown */}
                            <div className="w-28 flex items-center">
                                <DropdownInputNew
                                    options={dropDownFinYearNew(finYrData || [])}
                                    labelField={"finYr"}
                                    label={""}
                                    value={localYear}
                                    setValue={setLocalYear}
                                />
                            </div>

                        </div>
                        <button className="text-red-600" onClick={closeTable}>
                            <FaTimes size={18} />
                        </button>
                    </div>

                </div>

                {/* TOTAL */}



                <div className="flex flex-row gap-2">

                    {(SalesType == "All" || SalesType == "Sales") && (
                        <p className="text-xs font-semibold  text-green-600">
                            Total Sales Amount :{" "}
                            {new Intl.NumberFormat("en-IN", {
                                style: "currency",
                                currency: "INR",
                            }).format(totalSalesAmount)}
                        </p>
                    )}
                    {(SalesType == "All" || SalesType == "Returns") && (
                        <p className="text-xs font-semibold  text-red-600">
                            Total Returns Amount :{" "}
                            {new Intl.NumberFormat("en-IN", {
                                style: "currency",
                                currency: "INR",
                            }).format(totalReturnsAmount)}
                        </p>
                    )}
                </div>

                {/* SEARCH */}

                <div className="flex justify-between items-start mt-2">
                    <div className="flex gap-x-4 mb-3">
                        {["salesType", "docId", "docDate", "customer"].map((key) => (
                            <div key={key} className="relative">
                                <input
                                    type="text"
                                    placeholder={`Search ${key}...`}
                                    value={search[key] || ""}
                                    onChange={(e) =>
                                        setSearch({ ...search, [key]: e.target.value })
                                    }
                                    className="w-full h-6 p-1 pl-8 text-gray-900 text-[11px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
                                />
                                <FaSearch className="absolute left-2 top-1.5 text-gray-500 text-sm" />
                            </div>
                        ))}



                    </div>
                    <div className=" flex gap-x-2">
                        <div className="flex items-center text-[12px]">
                            <span className="text-gray-500">Min amount : </span>
                            <input
                                type="text"
                                value={netpayRange.min}
                                onChange={(e) =>
                                    setNetpayRange({
                                        ...netpayRange,
                                        min: Number(e.target.value),
                                    })
                                }
                                className="w-24 h-6 p-1 border ml-1 border-gray-300 rounded-md text-[11px] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>

                        <div className="flex items-center  text-[12px]">
                            <span className="text-gray-500">Max amount : </span>
                            <input
                                type="text"
                                value={netpayRange.max === Infinity ? "" : netpayRange.max}
                                onChange={(e) => {
                                    const val = e.target.value;

                                    setNetpayRange({
                                        ...netpayRange,
                                        max: val === "" ? Infinity : Number(val),
                                    });
                                }}
                                className="w-24 h-6 p-1 border ml-1 border-gray-300 rounded-md text-[11px] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <button
                            onClick={downloadExcel}
                            className="p-0 rounded-full shadow-md hover:brightness-110 transition-all duration-300"
                            title="Download Excel"
                        >
                            <img
                                src="https://cdn-icons-png.flaticon.com/512/732/732220.png"
                                alt="Download Excel"
                                className="w-7 h-7 rounded-lg"
                            />
                        </button>
                    </div>
                </div>
                {/* TABLE */}
                <div className="grid  gap-4">
                    <div className="overflow-x-auto h-[470px] " style={{ border: "1px solid gray", borderRadius: "16px" }}>
                        <table className="w-full border-collapse border border-gray-300 text-[11px] table-fixed">
                            <thead className="bg-gray-100 text-gray-800 sticky top-0 tracking-wider">
                                <tr>
                                    <th className="border p-1 text-center w-4">S.No</th>
                                    <th className="border p-1 text-center w-12">Sales Type</th>
                                    <th className="border p-1 text-center w-24">Doc No</th>
                                    <th className="border p-1 text-center w-[42px]">Doc Date</th>
                                    <th className="border p-1 text-center w-32">Customer</th>
                                    <th className="border p-1 text-center w-12">Amount</th>

                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className=" text-center">
                                            <div className="flex justify-center items-center pointer-events-none">
                                                {/* <SpinLoader /> */}
                                            </div>
                                        </td>
                                    </tr>
                                ) : currentRecords.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-6 text-gray-500">
                                            No data found
                                        </td>
                                    </tr>
                                ) : (
                                    currentRecords?.map((row, index) => {
                                        const globalIndex = index;  // 0–16
                                        const serialNo = (currentPage - 1) * recordsPerPage + globalIndex + 1;

                                        return (
                                            <tr
                                                key={index}
                                                className="text-gray-800 bg-white even:bg-gray-100"
                                            >
                                                <td className="border p-1 text-center">{serialNo}</td>
                                                <td className="border p-1 pl-2 text-left ">{row.salesType}</td>
                                                <td className="border p-1 pl-2 text-left">{row.docId}</td>

                                                <td className="border p-1 pl-2 text-left ">{formateDate(row.docDate)}</td>
                                                <td className="border p-1 pr-2 text-left">{row.customer}</td>

                                                <td className="border p-1 pr-2 text-right text-sky-700 ">
                                                    {new Intl.NumberFormat("en-IN", {
                                                        style: "currency",
                                                        currency: "INR",
                                                    }).format(row.amount)}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                </div>

                {/* PAGINATION */}
                <div>

                    <div
                        className="flex justify-end items-center mt-4 space-x-2 text-[11px] "
                        style={{ position: "absolute", bottom: "5px", right: "0px" }}
                    >
                        <button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className={`p-2 rounded-md ${currentPage === 1
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-blue-600 hover:bg-gray-200"
                                }`}
                        >
                            <FaStepBackward size={16} />
                        </button>

                        <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className={`p-2 rounded-md ${currentPage === 1
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-blue-600 hover:bg-gray-200"
                                }`}
                        >
                            <FaChevronLeft size={16} />
                        </button>

                        <span className="text-xs font-semibold px-3">
                            Page {currentPage} of {totalPages}
                        </span>

                        <button
                            onClick={() =>
                                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                            }
                            disabled={currentPage === totalPages}
                            className={`p-2 rounded-md ${currentPage === totalPages
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-blue-600 hover:bg-gray-200"
                                }`}
                        >
                            <FaChevronRight size={16} />
                        </button>

                        <button
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className={`p-2 rounded-md ${currentPage === totalPages
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-blue-600 hover:bg-gray-200"
                                }`}
                        >
                            <FaStepForward size={16} />
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default YearlyWiseTable;
