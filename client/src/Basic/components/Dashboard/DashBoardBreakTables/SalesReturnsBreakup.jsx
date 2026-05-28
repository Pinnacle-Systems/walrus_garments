import { useEffect } from "react";
import { useState } from "react";
import {
    FaTimes,
    FaChevronLeft,
    FaChevronRight,
    FaStepBackward,
    FaStepForward,
    FaSearch,
    FaUserTie,
    FaUsers,
    FaMars,
    FaVenus,
} from "react-icons/fa";
import { IoMaleFemale } from "react-icons/io5";


const TodaySalesReturnsBreakup = ({ data, onClose }) => {

    console.log(data, "data in salesBreakup")

    const [search, setSearch] = useState({
        id: "",
        party: "",
        amount: "",
        type: "",
    }); const [selectedState, setSelectedState] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);

    const handleFilterClick = (type) => {
        setSelectedState(type);
    };

    console.log(search, "`search`")

    const filteredData = Array.isArray(data?.breakups?.todaySalesReturns)

        ? data?.breakups?.todaySalesReturns.filter((row) =>
            Object.keys(search || {}).every((key) => {
                const rowValue = row[key]?.toString().toLowerCase() || "";
                const searchValue = search[key]?.toString().toLowerCase() || "";
                return rowValue.includes(searchValue);
            })
        )
            .filter((row) => {

                if (selectedState === "Pos") return row?.type === "POS";
                if (selectedState === "Bulk") return row?.type === "BULK";
                return true;
            })
        // .filter((row) => {
        //     if (selectedGender === "Male") return row?.GENDER !== "FEMALE";
        //     if (selectedGender === "Female") return row?.GENDER === "FEMALE";
        //     return true;
        // })
        // .filter((row) => {
        //     const netpay = Number(row?.ESI) || 0;
        //     return netpay >= netpayRange.min && netpay <= netpayRange.max;
        // })
        // .filter((row) => {
        //     if (!selectmonths) return true;
        //     return row.PAYPERIOD === selectmonths;
        // })
        : [];


    console.log(filteredData, "filteredData")

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
    console.log(currentRecords, "currentRecords")

    return (
        <>
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[9999]">
                <div className="bg-white p-4 rounded-lg shadow-2xl w-[1300px] max-w-[1300px]  h-[590px] max-h-[590px] relative">
                    <button
                        onClick={onClose}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-2 rounded-full transition-all"
                    >
                        <FaTimes size={20} />
                    </button>

                    <div className="grid grid-cols-2">
                        <div className="text-start">

                            <div className="flex items-start justify-start mb-1">
                                {/* Left: Total Records */}
                                <p className="text-[12px] text-gray-500 font-medium">
                                    Total Records:
                                    {totalRecords}
                                </p>



                            </div>
                        </div>
                        <div className="flex justify-center gap-3 ">


                            <div className="bg-gray-300  rounded-lg shadow-2xl grid grid-cols-3 gap-1 p-2">
                                <button
                                    className={`flex items-center gap-2 px-1.5 py-0.5 text-[11px] font-semibold rounded-full shadow-md transition-all 
                                       ${selectedState === "Pos"
                                            ? "bg-blue-600 text-white scale-105"
                                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                        }  `
                                    }
                                    onClick={() => handleFilterClick("Pos")}

                                >
                                    <FaMars size={14} className="text-blue-500" /> Pos Sales
                                </button>

                                <button
                                    className={`flex items-center gap-2 px-1.5 py-0.5 text-[11px] font-semibold rounded-full shadow-md transition-all 
                                       ${selectedState === "Bulk"
                                            ? "bg-blue-600 text-white scale-105"
                                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                        }  `
                                    }
                                    onClick={() => handleFilterClick("Bulk")}

                                >
                                    <FaVenus size={14} className="text-pink-500" /> Bulk Sales
                                </button>
                                <button
                                    className={`flex items-center gap-2 px-2 py-0.5 text-[11px] font-semibold rounded-full shadow-md transition-all 
                                       ${selectedState === "All"
                                            ? "bg-blue-600 text-white scale-105"
                                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                        }  `
                                    }
                                    onClick={() => handleFilterClick("All")}

                                >
                                    <IoMaleFemale size={14} className="text-green-500" /> Both
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-start">
                        <div className="grid grid-cols-6 gap-2 mb-3">
                            {["id", "party", "amount", "type"].map((key) => (
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

                            <div className="flex items-center text-[12px]">
                                {/* <FinYear
                                    selectedYear={selectedYear}
                                    selectmonths={selectmonths}
                                    setSelectmonths={setSelectmonths}
                                    autoFocusBuyer={autoFocusBuyer}
                                /> */}
                            </div>


                        </div>
                        <div className="right-0">
                            <button
                                // onClick={downloadExcel}
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

                    <div className="grid grid-cols-2 gap-6">
                        <div
                            className="overflow-x-auto max-h-[450px] "
                            style={{ border: "1px solid gray", borderRadius: "16px" }}
                        >
                            <table className="w-full border-collapse border border-gray-300 text-[11px]">
                                <thead className="bg-gray-100 text-gray-800 sticky top-0 tracking-wider">
                                    <tr>
                                        <th className="border p-1 text-left w-[10px]">S.No</th>
                                        <th className="border p-1 text-left w-[40px]">Doc ID</th>
                                        <th className="border p-1 text-left w-[100px]">Customer Name</th>
                                        <th className="border p-1 text-left w-[60px]">Bill Amount</th>
                                        <th className="border p-1 text-left w-[30px]">Sales Type</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentRecords.slice(0, 16).map((row, index) => {
                                        const globalIndex = index; // 0–16
                                        const serialNo =
                                            (currentPage - 1) * recordsPerPage + globalIndex + 1;
                                        return (
                                            <tr
                                                key={index}
                                                className="text-gray-800 bg-white even:bg-gray-100 "
                                            >
                                                <td className="border p-1 text-[10px] ">
                                                    {index + 1}
                                                </td>
                                                <td className="border p-1 text-[10px]">
                                                    {row?.id}
                                                </td>
                                                <td className="border p-1 text-[10px] ">
                                                    {row.party}
                                                </td>
                                                <td
                                                    className="border p-1 text-[10px]"
                                                >
                                                    {row.amount}
                                                </td>



                                                <td className="border p-1 text-sky-700  text-[10px] w-[25px]">
                                                    {row.type}
                                                </td>



                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div
                            className="overflow-x-auto max-h-[450px]"
                            style={{ border: "1px solid gray", borderRadius: "16px" }}
                        >
                            <table className="w-full border-collapse border border-gray-300 text-[11px]">
                                <thead className="bg-gray-100 text-gray-800 sticky top-0 tracking-wider">
                                    <tr>
                                        <th className="border p-1 text-left">S.No</th>
                                        <th className="border p-1 text-left">Doc ID</th>
                                        <th className="border p-1 text-left">Customer Name</th>
                                        <th className="border p-1 text-left">Bill Amount</th>
                                        <th className="border p-1 text-left">Sales Person</th>
                                        <th className="border p-1 text-left">Sales Type</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentRecords.slice(16, 32).map((row, index) => {
                                        const globalIndex = 16 + index; // 17–33
                                        const serialNo =
                                            (currentPage - 1) * recordsPerPage + globalIndex + 1;
                                        return (
                                            <tr
                                                key={index}
                                                className="text-gray-700 bg-white even:bg-gray-100"
                                            >
                                                <td className="border p-1 text-[10px] w-[25px]">
                                                    {serialNo}
                                                </td>
                                                <td className="border p-1 text-[10px] w-[60px]">
                                                    {row.EMPID}
                                                </td>
                                                <td
                                                    className="border p-1 text-[10px] w-[100px] whitespace-nowrap overflow-hidden text-ellipsis "
                                                    style={{ maxWidth: "100px" }}
                                                >
                                                    {row.FNAME}
                                                </td>
                                                <td className="border p-1 text-[10px] w-[30px]">
                                                    {row.GENDER}
                                                </td>
                                                <td
                                                    className="border p-1 text-[10px] w-[100px] whitespace-nowrap overflow-hidden text-ellipsis "
                                                    style={{ maxWidth: "100px" }}
                                                >
                                                    {row.DEPARTMENT}
                                                </td>

                                                <td className="border p-1 text-sky-700  text-[10px] w-[25px]">
                                                    {new Intl.NumberFormat("en-IN", {
                                                        style: "currency",
                                                        currency: "INR",
                                                    }).format(row.EMPLOYER_CON)}
                                                </td>
                                                <td className="border p-1 text-sky-700  text-[10px] w-[25px]">
                                                    {new Intl.NumberFormat("en-IN", {
                                                        style: "currency",
                                                        currency: "INR",
                                                    }).format(row.ESI)}
                                                </td>
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
                        )}
                    </div>

                    <div>

                    </div>
                </div>
            </div>
        </>
    )

}

export default TodaySalesReturnsBreakup;