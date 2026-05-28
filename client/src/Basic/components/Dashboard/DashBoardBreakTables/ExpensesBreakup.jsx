import { useEffect } from "react";
import { useState } from "react";
import {
    FaTimes,
    FaChevronLeft,
    FaChevronRight,
    FaStepBackward,
    FaStepForward,
    FaSearch,
} from "react-icons/fa";

const ExpensesBreakup = ({ data, onClose }) => {
    console.log(data, "data in expensesBreakup")

    const [search, setSearch] = useState({
        id: "",
        category: "",
        amount: "",
        note: "",
    }); 
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);

    const uniqueCategories = ["All", ...new Set(data?.breakups?.todayExpenses?.map(r => r.category) || [])];

    const handleFilterClick = (cat) => {
        setSelectedCategory(cat);
    };

    const filteredData = Array.isArray(data?.breakups?.todayExpenses)
        ? data?.breakups?.todayExpenses.filter((row) =>
            Object.keys(search || {}).every((key) => {
                const rowValue = row[key]?.toString().toLowerCase() || "";
                const searchValue = search[key]?.toString().toLowerCase() || "";
                return rowValue.includes(searchValue);
            })
        )
        .filter((row) => {
            if (selectedCategory !== "All") return row?.category === selectedCategory;
            return true;
        })
        : [];

    useEffect(() => {
        setCurrentPage(1);
    }, [data]);

    const recordsPerPage = 32;
    const totalPages = Math.ceil(filteredData?.length / recordsPerPage);
    const totalRecords = filteredData?.length;

    const currentRecords = filteredData?.slice(
        (currentPage - 1) * recordsPerPage,
        currentPage * recordsPerPage
    );

    const totalExpense = filteredData.reduce((acc, r) => acc + parseFloat(r.amount || 0), 0);

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[9999]">
            <div className="bg-white p-4 rounded-lg shadow-2xl w-[1300px] max-w-[1300px] h-[590px] max-h-[590px] relative">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-2 rounded-full transition-all"
                >
                    <FaTimes size={20} />
                </button>

                <div className="grid grid-cols-2">
                    <div className="text-start">
                        <div className="flex items-center gap-4 mb-2">
                            <p className="text-[12px] text-gray-500 font-bold">
                                Total Records: {totalRecords}
                            </p>
                            <p className="text-[12px] text-pink-600 font-bold">
                                Total Expense Amount: ₹{totalExpense.toLocaleString("en-IN")}
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mb-2 max-w-[100%] overflow-x-auto custom-scrollbar whitespace-nowrap">
                        <div className="bg-gray-200 rounded-lg flex gap-1 p-1 items-center max-h-[40px]">
                            {uniqueCategories.map(cat => (
                                <button
                                    key={cat}
                                    className={`px-3 py-0.5 text-[10px] font-semibold rounded-full shadow-sm transition-all 
                                       ${selectedCategory === cat
                                            ? "bg-pink-600 text-white scale-105"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-300"
                                        }`}
                                    onClick={() => handleFilterClick(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-start">
                    <div className="grid grid-cols-5 gap-2 mb-3 w-[80%]">
                        {["id", "category", "amount", "note"].map((key) => (
                            <div key={key} className="relative">
                                <input
                                    type="text"
                                    placeholder={`Search ${key === 'id' ? 'Doc ID' : key === 'category' ? 'Category' : key === 'note' ? 'Note/Detail' : key}...`}
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
                </div>

                <div className="grid grid-cols-2 gap-6">
                    {/* Left Table */}
                    <div
                        className="overflow-x-auto max-h-[420px]"
                        style={{ border: "1px solid gray", borderRadius: "16px" }}
                    >
                        <table className="w-full border-collapse border border-gray-300 text-[11px]">
                            <thead className="bg-gray-100 text-gray-800 sticky top-0 tracking-wider">
                                <tr>
                                    <th className="border p-1 text-left w-[10px]">S.No</th>
                                    <th className="border p-1 text-left w-[50px]">Doc ID</th>
                                    <th className="border p-1 text-left w-[80px]">Category</th>
                                    <th className="border p-1 text-left w-[50px]">Amount</th>
                                    <th className="border p-1 text-left w-[120px]">Note / Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentRecords.slice(0, 16).map((row, index) => {
                                    const serialNo = (currentPage - 1) * recordsPerPage + index + 1;
                                    return (
                                        <tr
                                            key={index}
                                            className="text-gray-800 bg-white even:bg-gray-100"
                                        >
                                            <td className="border p-1 text-[10px]">{serialNo}</td>
                                            <td className="border p-1 text-[10px] font-bold text-gray-600">{row.id}</td>
                                            <td className="border p-1 text-[10px] font-semibold text-purple-700">{row.category}</td>
                                            <td className="border p-1 text-[10px] font-bold text-pink-600">₹{parseFloat(row.amount || 0).toLocaleString("en-IN")}</td>
                                            <td className="border p-1 text-[10px] text-gray-500 truncate max-w-[120px]">{row.note}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Right Table */}
                    <div
                        className="overflow-x-auto max-h-[420px]"
                        style={{ border: "1px solid gray", borderRadius: "16px" }}
                    >
                        <table className="w-full border-collapse border border-gray-300 text-[11px]">
                            <thead className="bg-gray-100 text-gray-800 sticky top-0 tracking-wider">
                                <tr>
                                    <th className="border p-1 text-left w-[10px]">S.No</th>
                                    <th className="border p-1 text-left w-[50px]">Doc ID</th>
                                    <th className="border p-1 text-left w-[80px]">Category</th>
                                    <th className="border p-1 text-left w-[50px]">Amount</th>
                                    <th className="border p-1 text-left w-[120px]">Note / Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentRecords.slice(16, 32).map((row, index) => {
                                    const serialNo = (currentPage - 1) * recordsPerPage + 16 + index + 1;
                                    return (
                                        <tr
                                            key={index}
                                            className="text-gray-800 bg-white even:bg-gray-100"
                                        >
                                            <td className="border p-1 text-[10px]">{serialNo}</td>
                                            <td className="border p-1 text-[10px] font-bold text-gray-600">{row.id}</td>
                                            <td className="border p-1 text-[10px] font-semibold text-purple-700">{row.category}</td>
                                            <td className="border p-1 text-[10px] font-bold text-pink-600">₹{parseFloat(row.amount || 0).toLocaleString("en-IN")}</td>
                                            <td className="border p-1 text-[10px] text-gray-500 truncate max-w-[120px]">{row.note}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div>
                    {totalPages > 1 && (
                        <div
                            className="flex justify-end items-center mt-4 space-x-2 text-[11px]"
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
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExpensesBreakup;
