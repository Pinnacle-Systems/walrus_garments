import React, { useState } from "react";
import Loader from "../Loader";
import "./Master.css";
// import { ToggleButton } from '../Uis';
import { Power, Table } from "lucide-react";
import { FaTableList } from "react-icons/fa6";
import { RiPlayListAddLine } from "react-icons/ri";

const ACTIVE = (
    <div className="bg-gradient-to-r from-green-200 to-green-500 inline-flex items-center justify-center rounded-full border-2 w-6 border-green-500 shadow-lg text-white hover:scale-110 transition-transform duration-300">
        <Power size={10} />
    </div>
);
const INACTIVE = (
    <div className="bg-gradient-to-r from-red-200 to-red-500 inline-flex items-center justify-center rounded-full border-2 w-6 border-red-500 shadow-lg text-white hover:scale-110 transition-transform duration-300">
        <Power size={10} />
    </div>
);
const EXPIRED = (
    <button className="rounded-md text-white bg-gray-500 border p-1 disabled">
        EXPIRED
    </button>
);
const ACTIVE_PLAN = (
    <button className="rounded-md text-white bg-blue-600 border p-1 disabled">
        ACTIVE
    </button>
);

const Mastertable = ({
    tableHeaders,
    tableDataNames,
    setId,
    data,
    loading,
    searchValue,
    setSearchValue,
    rowActions = true,
    header,
    setForm,
    onDataClick,
    setReadOnly,
    deleteData,
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const totalPages = Math.ceil(data?.length / rowsPerPage);

    const currentData = data?.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    return (
        <div className="row w-full mx-auto">
            <div className="text-xs col-12 px-0 bg-[f1f1f0] bg-opacity-15 rounded-lg border shadow-md">
                <div className="flex justify-between mx-3 items-center py-1">
                    <div className="text-normal flex items-center text-gray-600">
                        <RiPlayListAddLine size={20} className=" mr-0.5" />
                        &nbsp;{" "}
                        <div className="my-0">
                            <div className=" text-[13px] text-black my-0">{header}</div>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <input
                            type="text"
                            className="text-sm bg-gray-100 focus:outline-none border border-gray-300 w-full rounded-md px-2 py-1 text-normal"
                            id="id"
                            placeholder="Search"
                            value={searchValue}
                            onChange={(e) => {
                                setSearchValue(e.target.value);
                            }}
                        />
                        <div className="flex items-center  ml-3">
                            <label className=" text-gray-700 text-normal text-nowrap mr-1">
                                select rows:
                            </label>
                            <select
                                className="ml-2 p-1 border text-normal bg-gray-100 border-gray-300 py-1.5 rounded-md"
                                value={rowsPerPage}
                                onChange={(e) => {
                                    setRowsPerPage(Number(e.target.value));
                                    setCurrentPage(1); // Reset to first page when changing rows per page
                                }}
                            >
                                {[10, 15, 20].map((num) => (
                                    <option key={num} value={num}>
                                        {num}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <Loader />
                ) : (
                    <>
                        {data?.length === 0 ? (
                            <div className="flex-1 flex justify-center bg-white  text-gray-800 items-center text-xl py-3">
                                <p>No Data Found...! </p>
                            </div>
                        ) : (
                            <>
                                <div className=" bg-white overflow-auto custom-scrollbar border-y border-gray-300 h-[65vh]">
                                    {currentData?.length > 0 && (
                                        <table className="min-w-full text-normal border-collapse text-[12px]">
                                            <thead className="bg-gray-200 text-gray-800">
                                                <tr>
                                                    {tableHeaders.map((column, index) => (
                                                        <th
                                                            key={index}
                                                            className={`px-4 py-2 text-left font-medium border-white/50 ${index < tableHeaders.length - 1
                                                                ? "border-r"
                                                                : ""
                                                                }`}
                                                        >
                                                            {column}
                                                        </th>
                                                    ))}
                                                    <th className="px-4 py-2 text-left font-medium border-white/50">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {currentData.map((dataObj, index) => (
                                                    <tr
                                                        key={index}
                                                        className={`hover:bg-gray-50 transition-colors border-b border-gray-200 ${index % 2 === 0 ? "bg-white" : "bg-gray-100"
                                                            } cursor-pointer`}
                                                    >
                                                        {tableDataNames?.map((data, idx) => (
                                                            <td
                                                                key={idx}
                                                                className={`h-[32px] text-[12px] border-r border-gray-200 px-4`}
                                                                onClick={() => onDataClick(dataObj?.id)}
                                                            >
                                                                {eval(data)}
                                                            </td>
                                                        ))}

                                                        <td className="px-2 py-1 w-[40px] border-gray-200 border-l h-8">
                                                            <div className="flex gap-2">

                                                                <button
                                                                    onClick={() => {
                                                                        onDataClick(dataObj?.id)
                                                                        setReadOnly(true);                                                                    
                                                                    }}
                                                                    className="text-blue-800 flex items-center gap-1 px-2 mx-2 py-1.5 bg-blue-50 rounded"
                                                                >
                                                                    👁 <span className="text-xs">view</span>
                                                                </button>


                                                                <button
                                                                    onClick={() => {
                                                                        onDataClick(dataObj?.id);
                                                                        setReadOnly(false);
                                                                    }}
                                                                    className="text-green-800 flex items-center gap-1 mx-2 px-2 py-1.5 bg-green-50 rounded"
                                                                >
                                                                    ✏️ <span className="text-xs">edit</span>
                                                                </button>

                                                                <button
                                                                    onClick={() => {
                                                                        // onDataClick(dataObj?.id);
                                                                        deleteData(dataObj?.id);
                                                                    }}
                                                                    className="text-red-800 flex items-center gap-1 mx-2 px-2 py-1.5 bg-red-50 rounded"
                                                                >
                                                                    🗑️ <span className="text-xs">delete</span>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                                {/* Pagination Controls */}
                                <div className="flex justify-center items-center mt-2  my-2 text-normal font-semibold">
                                    <button
                                        className={`text-xs text-stone-900 rounded ${currentPage === 1
                                            ? "opacity-50 cursor-not-allowed"
                                            : "hover:bg-gray-400"
                                            }`}
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                    >
                                        &lt;&nbsp;
                                    </button>

                                    <span className="text-gray-700">
                                        {currentPage} / {totalPages}
                                    </span>

                                    <button
                                        className={`text-xs text-stone-900 rounded ${currentPage === totalPages
                                            ? "opacity-50 cursor-not-allowed"
                                            : "hover:bg-gray-400"
                                            }`}
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                    >
                                        &nbsp;&gt;
                                    </button>
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Mastertable;