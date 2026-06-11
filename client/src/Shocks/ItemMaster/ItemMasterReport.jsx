import { useState } from "react";
import { usePermissionForUsers } from "../../Basic/components/HasPermission";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { childRecordCount } from "../../Inputs";

export const Reports = ({
    columns,
    data,
    onView,
    onEdit,
    onDelete,
    emptyStateMessage = 'No data available',
    rowActions = true,
    itemsPerPage = 15,
    width,
    childRecordLabel = "",
    heightClass = "h-[calc(100%-0.75rem)]",
    printData
}) => {

    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math?.ceil(data?.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = data?.slice(indexOfFirstItem, indexOfLastItem);
    const [hoveredDeleteId, setHoveredDeleteId] = useState(null);


    const { hasPermission } = usePermissionForUsers()

    // console.log(hasPermission, "permission")

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const Pagination = () => {
        return (
            <div className="h-10 shrink-0 flex w-full flex-col items-center justify-between border-t border-gray-200 bg-white p-2 sm:flex-row">
                <div className="mb-2 text-sm text-gray-600 sm:mb-0">
                    Showing {data?.length ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, data?.length || 0)} of {data?.length || 0} entries
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`min-w-8 rounded-md px-2.5 py-1 ${currentPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <FaChevronLeft className="inline" />
                    </button>

                    {Array?.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                            pageNum = i + 1;
                        } else if (currentPage <= 3) {
                            pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                        } else {
                            pageNum = currentPage - 2 + i;
                        }

                        return (
                            <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`min-w-8 rounded-md px-2.5 py-1 ${currentPage === pageNum
                                    ? 'bg-indigo-800 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}

                    {totalPages > 5 && currentPage < totalPages - 2 && (
                        <span className="px-2 py-1">...</span>
                    )}

                    {totalPages > 5 && currentPage < totalPages - 2 && (
                        <button
                            onClick={() => handlePageChange(totalPages)}
                            className={`min-w-8 rounded-md px-2.5 py-1 ${currentPage === totalPages
                                ? 'bg-indigo-800 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {totalPages}
                        </button>
                    )}

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`min-w-8 rounded-md px-2.5 py-1 ${currentPage === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <FaChevronRight className="inline" />
                    </button>
                </div>
            </div>
        );
    };



    return (
        <>
            <div className={`flex min-h-0 flex-col overflow-hidden bg-[#F1F1F0] ${heightClass}`}>
                <div className="min-h-0 flex-1 overflow-auto">
                    <table className="table-auto">
                        <thead className="sticky top-0 z-10 bg-gray-200 text-gray-800">

                            <tr>
                                {columns?.map((column, index) => (
                                    <th
                                        key={index}
                                        className={` font-medium text-gray-900 py-2 text-[12px] px-8 text-center uppercase  ${column.header !== "" ? "border-r border-white/50" : ""
                                            } `}
                                    >
                                        {column.header}
                                    </th>
                                ))}
                                {rowActions && (
                                    <th className="px-4 py-2 text-center text-[12px] font-medium justify-end">
                                        ACTIONS
                                    </th>
                                )}
                            </tr>





                        </thead>
                        <tbody>
                            {currentItems?.length === 0 ? (
                                <tr>
                                    <td colSpan={columns?.length + (rowActions ? 1 : 0)} className="px-4 py-4 text-center text-gray-500">
                                        {emptyStateMessage}
                                    </td>
                                </tr>
                            ) : (
                                currentItems?.map((item, index) => {

                                    const hasChildRecords = childRecordCount(item?._count) > 0


                                    return (
                                        <tr
                                            key={item.id}
                                            className={`hover:bg-gray-50 transition-colors border-b   border-gray-200 text-[12px] ${index % 2 === 0 ? "bg-white" : "bg-gray-100"
                                                }`}
                                        >

                                            {columns?.map((column, colIndex) => (
                                                <td
                                                    key={colIndex}
                                                    className={` ${column.className ? column.className : ""} ${column.header !== "" ? 'border-r border-white/50' : ''} h-7 px-1.5`}
                                                >
                                                    {column.accessor(item, indexOfFirstItem + index)}
                                                </td>
                                            ))}
                                            {rowActions && (
                                                <td className=" w-[30px] border-gray-200 gap-1 px-2   h-8 justify-end">
                                                    <div className="flex">
                                                        {onView && (
                                                            <button
                                                                className="text-blue-600  flex items-center   px-1  bg-blue-50 rounded"
                                                                onClick={() => hasPermission(() => onView(item.id), "read")}
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                        {onEdit && (
                                                            <button
                                                                className="text-green-600 gap-1 px-1   bg-green-50 rounded"
                                                                onClick={() => hasPermission(() => onEdit(item.id), "edit")}
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                        <div className="relative inline-block"
                                                            onMouseEnter={() =>
                                                                setHoveredDeleteId(item.id)
                                                            }
                                                            onMouseLeave={() => setHoveredDeleteId(null)}
                                                        >
                                                            {onDelete && (
                                                                <button
                                                                    className="text-red-800 flex items-center gap-1 px-1 bg-red-50 rounded disabled:opacity-50"
                                                                    onClick={() =>
                                                                        hasPermission(() => onDelete(item.id), "delete", item?._count)
                                                                    }
                                                                    disabled={hasChildRecords}
                                                                >
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        className="h-4 w-4"
                                                                        viewBox="0 0 20 20"
                                                                        fill="currentColor"
                                                                    >
                                                                        <path
                                                                            fillRule="evenodd"
                                                                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                                                            clipRule="evenodd"
                                                                        />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                            {console.log(childRecordCount(item?._count > 0), "childRecord")}
                                                            {hasChildRecords &&
                                                                hoveredDeleteId === item.id && (
                                                                    <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-[12px] rounded shadow-lg w-64 z-50">
                                                                        Cannot delete. Child records exist.

                                                                    </div>
                                                                )}

                                                        </div>
                                                        {printData && (
                                                            <button
                                                                className="text-green-600 gap-1 px-1   bg-green-50 rounded"
                                                                onClick={() => hasPermission(() => printData(item.id), "edit")}
                                                                title="Print Barcode Labels"
                                                            >

                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <polyline points="6 9 6 2 18 2 18 9"></polyline>
                                                                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                                                                    <rect x="6" y="14" width="12" height="8"></rect>
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    )

                                }


                                )
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="shrink-0 bg-white">
                    <Pagination />
                </div>
            </div>

        </>





    );
};