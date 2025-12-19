import { useEffect, useState } from "react";
import secureLocalStorage from "react-secure-storage";
import { reactPaginateIndexToPageNumber } from "../../../Utils/helper";
import { Loader } from "../../../Basic/components";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useGetRaiseIndentQuery } from "../../../redux/uniformService/RaiseIndenetServices";
import moment from "moment";





const MaterialRequestFormReport = ({
    onClick,
    onView,
    itemsPerPage = 10,
    onEdit,
    onDelete,
    rowActions = true,
    isReport,
}) => {



    const [dataPerPage, setDataPerPage] = useState("1");
    const [serachDocNo, setSerachDocNo] = useState("");
    const [searchClientName, setSearchClientName] = useState("");
    const [searchDate, setSearchDate] = useState("");
    const [searchOrderNo, setSearchOrderNo] = useState("");
    const [searchStyleNo, setSearchStyleNo] = useState("")

    const [totalCount, setTotalCount] = useState(0);
    const [currentPageNumber, setCurrentPageNumber] = useState(1);


    const handleOnclick = (e) => {
        setCurrentPageNumber(reactPaginateIndexToPageNumber(e.selected));
    };
    const searchFields = {
        serachDocNo,
        searchDate,
        searchOrderNo,
        searchStyleNo,
        searchClientName,
        isReport,
    };

    useEffect(() => {
        setCurrentPageNumber(1);
    }, [
        serachDocNo,
        searchDate,
        searchOrderNo,
        searchStyleNo,
        searchClientName,
        isReport,
    ]);
    const branchId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "currentBranchId"
    );
    const companyId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userCompanyId"
    );



    const { data: allData, isFetching, isLoading } = useGetRaiseIndentQuery({
        params: {
            branchId, companyId,
            ...searchFields,
            pagination: true,
            dataPerPage,
            pageNumber: currentPageNumber,
            isReport,
        }
    });




    useEffect(() => {
        if (allData?.totalCount) {
            setTotalCount(allData?.totalCount);
        }
    }, [allData, isLoading, isFetching]);

    const isLoadingIndicator =
        isLoading || isFetching


    const filtered = allData?.data?.map(item => {
        const requestQty = item?.RaiseIndentItems?.reduce(
            (sum, next) => sum + (next?.requiredQty || 0),
            0
        );

        const issueQty = item?.RaiseIndentItems
            ?.flatMap(i => i?.MaterialIssueItems || [])
            ?.reduce((sum, next) => sum + (next?.issueQty || 0), 0);

        return {
            ...item,
            requestQty,
            issueQty
        };
    });

    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math?.ceil(allData?.data?.length / itemsPerPage);
    const indexOfLastItem = currentPage * parseInt(10);
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = allData?.data?.slice(indexOfFirstItem, indexOfLastItem);

    console.log(indexOfLastItem, "indexOfLastItem")

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };
    const Pagination = () => {
        // if (totalPages <= 1) return null;

        return (
            <div className="h-10 w-full flex flex-col sm:flex-row justify-between items-center p-2 bg-white border-t border-gray-200 ">
                <div className="text-sm text-gray-600 mb-2 sm:mb-0">
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, allData?.data?.length)} of {allData?.length} entries
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded-md ${currentPage === 1
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
                                className={`px-3 py-1 rounded-md ${currentPage === pageNum
                                    ? 'bg-indigo-800 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}

                    {totalPages > 5 && currentPage < totalPages - 2 && (
                        <span className="px-3 py-1">...</span>
                    )}

                    {totalPages > 5 && currentPage < totalPages - 2 && (
                        <button
                            onClick={() => handlePageChange(totalPages)}
                            className={`px-3 py-1 rounded-md ${currentPage === totalPages
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
                        className={`px-3 py-1 rounded-md ${currentPage === totalPages
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
        <div
            //   id="registrationFormReport"
            className="flex flex-col w-full h-[78vh] overflow-auto"
        >

            <>
                <div className="h-[100vh] rounded-lg bg-[#F1F1F0] shadow-sm">
                    <div className="h-[68vh]">
                        <table className="">
                            <thead className="bg-gray-200 text-gray-800 ">
                                <tr className="">
                                    <th className=" px-1 py-1.5  font-medium text-[13px]  text-gray-900  text-center  w-12">
                                        <div className="">S No</div>
                                    </th>

                                    <th className=" px-3  font-medium text-[13px]  text-gray-900  text-center w-32">
                                        <div>Doc No</div>
                                        {/* <input
                                            type="text"
                                            className="text-black h-5   w-full py-1.5  px-1 focus:outline-none border  border-gray-400 rounded-lg"
                                            placeholder="Search"
                                            value={serachDocNo}
                                            onChange={(e) => {
                                                setSerachDocNo(e.target.value);
                                            }}
                                        /> */}
                                    </th>
                                    <th className="w-28 px-3  font-medium text-[13px]  text-gray-900  text-center ">
                                        <div>Doc Date</div>
                                        {/* <input
                                            type="text"
                                            className="text-black h-5   w-full py-1.5  px-1 focus:outline-none border  border-gray-400 rounded-lg"
                                            placeholder="Search"
                                            value={searchDate}
                                            onChange={(e) => {
                                                setSearchDate(e.target.value);
                                            }}
                                        /> */}
                                    </th>
                                    <th className="w-28   px-3   font-medium text-[13px] text-gray-900  text-center ">
                                        <div>Order No</div>
                                        {/* <input
                                            type="text"
                                            className="text-black h-5   w-full py-1.5  px-1 focus:outline-none border  border-gray-400 rounded-lg"
                                            placeholder="Search"
                                            value={searchClientName}
                                            onChange={(e) => {
                                                setSearchClientName(e.target.value);
                                            }}
                                        /> */}
                                    </th>
                                    {/* <th className="w-28    px-3  font-medium text-[13px]  text-gray-900  text-center ">
                                        <div>Style No</div>

                                    </th> */}
                                    <th className="w-96   px-3  font-medium text-[13px]  text-gray-900  text-center  ">
                                        <div>Customer</div>

                                    </th>
                                    <th className="w-52   px-3  font-medium text-[13px]  text-gray-900  text-center ">
                                        <div>Status</div>
                                    </th>
                                    <th className="w-10   px-3  font-medium text-[13px]  text-gray-900  text-center ">
                                        <div>Actions</div>

                                    </th>
                                </tr>
                                <tr className="">
                                    <th className=" px-1  font-medium text-[13px] justify-end  text-gray-900  text-center  w-12">
                                        <div className="h-3"></div>
                                    </th>

                                    <th className=" px-1 font-medium text-[13px] border  text-gray-900  text-center w-32">
                                        <input
                                            type="text"
                                            className="text-black h-5   w-full  px-1 focus:outline-none border  border-gray-400 rounded-md"
                                            placeholder="Search"
                                            value={serachDocNo}
                                            onChange={(e) => {
                                                setSerachDocNo(e.target.value);
                                            }}
                                        />
                                    </th>
                                    <th className="w-20  px-1 font-medium text-[13px]  text-gray-900  text-center ">
                                        <input
                                            type="text"
                                            className="text-black h-5   w-full   px-1 focus:outline-none border  border-gray-400 rounded-md"
                                            placeholder="Search"
                                            value={searchDate}
                                            onChange={(e) => {
                                                setSearchDate(e.target.value);
                                            }}
                                        />
                                    </th>
                                    <th className="  px-1 font-medium text-[13px]  text-gray-900  text-center w-32">
                                        <input
                                            type="text"
                                            className="text-black h-5   w-full   px-1 focus:outline-none border  border-gray-400 rounded-md"
                                            placeholder="Search"
                                            value={searchOrderNo}
                                            onChange={(e) => {
                                                setSearchOrderNo(e.target.value);
                                            }}
                                        />
                                    </th>
                                    {/* <th className="w-32  px-1 font-medium text-[13px]  text-gray-900  text-center ">
                                        <input
                                            type="text"
                                            className="text-black h-5   w-full   px-1 focus:outline-none border  border-gray-400 rounded-md"
                                            placeholder="Search"
                                            value={searchStyleNo}
                                            onChange={(e) => {
                                                setSearchStyleNo(e.target.value);
                                            }}
                                        />
                                    </th> */}

                                    <th className="w-32  px-1 font-medium text-[13px]  text-gray-900  text-center ">
                                        <input
                                            type="text"
                                            className="text-black h-5   w-full   px-1 focus:outline-none border  border-gray-400 rounded-md"
                                            placeholder="Search"
                                            value={searchClientName}
                                            onChange={(e) => {
                                                setSearchClientName(e.target.value);
                                            }}
                                        />
                                    </th>
                                    <th className="w-12  px-1  font-medium text-[13px]  text-gray-900  text-center ">

                                    </th>
                                    <th className="w-10  px-1  font-medium text-[13px]  text-gray-900  text-center ">

                                    </th>
                                </tr>
                            </thead>
                            {isLoadingIndicator ? (
                                <tbody>
                                    <tr>
                                        <td>
                                            <Loader />
                                        </td>
                                    </tr>
                                </tbody>
                            ) : (
                                <tbody className="border-2">
                                    {(filtered ? filtered : []).map((dataObj, index) => (
                                        <tr
                                            onKeyDown={(e) => {
                                                // if (e.key === "Enter") {
                                                //     onClick(dataObj.id);
                                                // }
                                            }}
                                            tabIndex={0}
                                            key={dataObj.id}
                                            className={`hover:bg-gray-50 transition-colors border-b   border-gray-200 text-[12px] ${index % 2 === 0 ? "bg-white" : "bg-gray-100"
                                                }`}
                                        // onClick={() => onClick(dataObj.id)}
                                        >
                                            <td className="text-center " >
                                                {index + 1}
                                            </td>

                                            <td className="py-1.5 text-center">{dataObj.docId} </td>

                                            <td className="py-1.5 text-center">{moment.utc(dataObj.createdAt).format("YYYY-MM-DD")}</td>

                                            <td className="py-1.5 text-center">{dataObj?.Order?.docId} </td>

                                            <td className="py-1.5 text-left"> {dataObj?.Party?.name}</td>
                                            <td className="py-1.5 text-left">
                                                {(() => {
                                                    if (dataObj?.issueQty == 0)
                                                        return (
                                                            <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 font-medium">
                                                                Material Not Issued
                                                            </span>
                                                        );

                                                    if (dataObj?.issueQty >= dataObj?.requestQty)
                                                        return (
                                                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium">
                                                                Material Issued
                                                            </span>
                                                        );

                                                    return (
                                                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 font-medium">
                                                            Material Partially Issued
                                                        </span>
                                                    );
                                                })()}
                                            </td>
                                            <td className="w-[30px] h-8 px-2 border-gray-200">
                                                <div className="flex items-center justify-center">
                                                    {onView && (
                                                        <button
                                                            className="text-blue-600 flex items-center justify-center px-1 bg-blue-50 rounded"
                                                            onClick={() => onView(dataObj.id)}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg"
                                                                className="h-4 w-4"
                                                                viewBox="0 0 20 20"
                                                                fill="currentColor">
                                                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                                <path fillRule="evenodd"
                                                                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                                                    clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>


                                        </tr>
                                    ))}

                                </tbody>
                            )}
                        </table>

                    </div>
                    <div className="h-[10vh]">
                        <Pagination />
                    </div>

                </div>
            </>

        </div>
    );
};

export default MaterialRequestFormReport;
