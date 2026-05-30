import React, { useEffect, useState } from "react";
import { FaTimes, FaChevronLeft, FaChevronRight, FaStepBackward, FaStepForward, FaSearch, FaFileExcel } from "react-icons/fa";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_SERVER_URL;
const DASHBOARD_API = "dashboard";

const SalesPeriodBreakup = ({ timeframe, filterValue, title, onClose, branchId, customerType, finYear, saleTypeFilter }) => {
    const [loading, setLoading] = useState(true);
    const [rawList, setRawList] = useState([]);
    const [search, setSearch] = useState({ id: "", party: "", amount: "", type: "" });
    const [selectedType, setSelectedType] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 16; // Single clean column layout fits perfectly in modal height

    useEffect(() => {
        const fetchBreakup = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${BASE_URL}${DASHBOARD_API}/sales-breakup`, {
                    params: { branchId, timeframe, filterValue, customerType, finYear, saleTypeFilter }
                });
                if (response.data.statusCode === 0) {
                    setRawList(response.data.data || []);
                }
            } catch (error) {
                console.error("Error fetching sales breakup:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBreakup();
    }, [branchId, timeframe, filterValue, customerType, finYear, saleTypeFilter]);

    const handleFilterClick = (type) => {
        setSelectedType(type);
        setCurrentPage(1);
    };

    const filteredData = rawList
        .filter((row) =>
            Object.keys(search).every((key) => {
                const rowValue = row[key]?.toString().toLowerCase() || "";
                const searchValue = search[key]?.toString().toLowerCase() || "";
                return rowValue.includes(searchValue);
            })
        )
        .filter((row) => {
            if (selectedType === "POS") return row.type.includes("POS");
            if (selectedType === "Bulk") return row.type.includes("Bulk");
            return true;
        });

    const totalRecords = filteredData.length;
    const totalPages = Math.ceil(totalRecords / recordsPerPage);

    const currentRecords = filteredData.slice(
        (currentPage - 1) * recordsPerPage,
        currentPage * recordsPerPage
    );

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-[9999] animate-fadeIn">
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-[900px] max-w-[95%] h-[600px] max-h-[90vh] relative flex flex-col justify-between">
                
                {/* Header */}
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <div>
                        <h4 className="text-lg font-black text-gray-900">{title}</h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Timeframe: {timeframe} | Filter: {filterValue}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-gray-50 transition-all"
                    >
                        <FaTimes size={18} />
                    </button>
                </div>

                {loading ? (
                    <div className="flex-1 flex flex-col justify-center items-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-3"></div>
                        <p className="text-gray-500 text-xs font-semibold">Loading transactions details...</p>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col justify-between mt-4 overflow-hidden">
                        {/* Filters & Search Row */}
                        <div className="flex flex-col sm:flex-row justify-between items-stretch gap-3 mb-4">
                            <div className="grid grid-cols-4 gap-2 flex-1">
                                {["id", "party", "amount", "type"].map((key) => (
                                    <div key={key} className="relative">
                                        <input
                                            type="text"
                                            placeholder={`Search ${key === 'id' ? 'Doc ID' : key === 'party' ? 'Customer' : key}...`}
                                            value={search[key] || ""}
                                            onChange={(e) => {
                                                setSearch({ ...search, [key]: e.target.value });
                                                setCurrentPage(1);
                                            }}
                                            className="w-full h-8 px-2 pl-7 text-[11px] border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm font-semibold"
                                        />
                                        <FaSearch className="absolute left-2.5 top-2.5 text-gray-400 text-[10px]" />
                                    </div>
                                ))}
                            </div>

                            {timeframe !== 'slow_moving' && (
                                <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200 gap-1 items-center">
                                    {["All", "POS", "Bulk"].map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => handleFilterClick(t)}
                                            className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${
                                                selectedType === t
                                                    ? "bg-indigo-600 text-white shadow-sm"
                                                    : "text-gray-600 hover:text-indigo-600"
                                            }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Total Count */}
                        <div className="flex justify-between items-center text-xs text-gray-500 font-bold mb-2">
                            <span>Total Items Found: <span className="text-indigo-600">{totalRecords}</span></span>
                        </div>

                        {/* Table Area */}
                        <div className="flex-1 overflow-y-auto border border-gray-100 rounded-xl max-h-[340px] shadow-inner bg-gray-50">
                            <table className="w-full text-left text-xs text-gray-600 border-collapse">
                                <thead className="bg-gray-100 text-gray-800 text-[10px] uppercase font-bold sticky top-0 border-b border-gray-200 shadow-sm z-10">
                                    <tr>
                                        <th className="px-4 py-2 w-[50px]">S.No</th>
                                        <th className="px-4 py-2 w-[120px]">{timeframe === 'slow_moving' ? 'Item Code' : 'Doc ID'}</th>
                                        <th className="px-4 py-2">{timeframe === 'slow_moving' ? 'Item Name' : 'Customer Name'}</th>
                                        <th className="px-4 py-2 w-[120px]">{timeframe === 'slow_moving' ? 'Age in Days' : 'Type'}</th>
                                        <th className="px-4 py-2 w-[120px] text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 font-semibold text-gray-700 bg-white">
                                    {currentRecords.length > 0 ? (
                                        currentRecords.map((row, index) => {
                                            const serialNo = (currentPage - 1) * recordsPerPage + index + 1;
                                            return (
                                                <tr key={index} className="hover:bg-indigo-50/30 transition-colors">
                                                    <td className="px-4 py-2.5 text-gray-400">{serialNo}</td>
                                                    <td className="px-4 py-2.5 font-bold text-gray-900">{row.id}</td>
                                                    <td className="px-4 py-2.5">{row.party}</td>
                                                    <td className="px-4 py-2.5">
                                                        {timeframe === 'slow_moving' ? (
                                                            <span className="bg-rose-50 text-rose-600 px-2 py-0.5 rounded font-black text-[10px]">
                                                                {row.ageDays} days old
                                                            </span>
                                                        ) : (
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                                                row.type.includes("POS") 
                                                                    ? "bg-sky-50 text-sky-600" 
                                                                    : "bg-emerald-50 text-emerald-600"
                                                            }`}>
                                                                {row.type}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-2.5 text-right font-black text-gray-900">
                                                        ₹{(row.amount || 0).toLocaleString()}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center py-10 text-gray-400 font-medium">
                                                No transactions matching filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Row */}
                        <div className="flex justify-between items-center border-t border-gray-100 pt-3 mt-3">
                            <span className="text-[10px] text-gray-400 font-bold uppercase">
                                Page {currentPage} of {totalPages || 1}
                            </span>

                            {totalPages > 1 && (
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setCurrentPage(1)}
                                        disabled={currentPage === 1}
                                        className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <FaStepBackward size={10} />
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <FaChevronLeft size={10} />
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <FaChevronRight size={10} />
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(totalPages)}
                                        disabled={currentPage === totalPages}
                                        className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <FaStepForward size={10} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalesPeriodBreakup;
