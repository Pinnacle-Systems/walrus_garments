import React, { useEffect, useState } from 'react'
import secureLocalStorage from 'react-secure-storage';
import { Loader } from '../../../Basic/components';
import { useGetPoItemsQuery } from '../../../redux/uniformService/PoServices';
import { showEntries } from '../../../Utils/DropdownData';
import ReactPaginate from 'react-paginate';
import { getDateFromDateTimeToDisplay, pageNumberToReactPaginateIndex, reactPaginateIndexToPageNumber } from '../../../Utils/helper';
import { useGetDirectInwardOrReturnQuery, useGetDirectItemsQuery } from '../../../redux/uniformService/DirectInwardOrReturnServices';


const YarnInwardItemSelection = ({ poType, supplierId, isItemAdded, handleChange, getSelectAll, handleSelectAllChange, storeId, handleDone, readOnly ,purchaseInwardId }) => {
    const [poNo, setPoNo] = useState("");
    const [searchPoDate, setPoDate] = useState("");
    const [searchDueDate, setDueDate] = useState("");
    const [searchPoType, setSearchPoType] = useState("");
    const [supplier, setSupplier] = useState("");
    const [dataPerPage, setDataPerPage] = useState("10");
    const [totalCount, setTotalCount] = useState(0);
    const [currentPageNumber, setCurrentPageNumber] = useState(1);
    const branchId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "currentBranchId"
    )
    const handleOnclick = (e) => {
        setCurrentPageNumber(reactPaginateIndexToPageNumber(e.selected));
    }
    const searchFields = { searchDocId: poNo, searchPoDate, searchSupplierAliasName: supplier, searchPoType, searchDueDate }

    const { data: poItems, isLoading: isPoItemsLoading, isFetching: isPoItemsFetching } = useGetDirectItemsQuery({
        params: {
            branchId, supplierId, storeId, poType, ...searchFields, pagination: true, dataPerPage, pageNumber: currentPageNumber,
            isDirectInwardFilter: true ,purchaseInwardId
        }
    })



    useEffect(() => {
        if (poItems?.totalCount) {
            setTotalCount(poItems?.totalCount)
        }
    }, [poItems, isPoItemsFetching, isPoItemsLoading])

    const isLoadingIndicator = isPoItemsFetching || isPoItemsLoading


    return (

        <div className='border border-gray-200  shadow-sm bg-[#f1f1f0] h-full'>
            <div className="h-[500px]">

            
            <div className="border-b py-2 px-4 mx-3 flex justify-between items-center sticky top-0 z-10 bg-white mt-3">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
                       Po Inward Items
                    </h2>

                </div>
                <div className="flex gap-2">
                    <div>
                        <button
                            type="button"
                            onClick={() => {
                                // handleCancel();
                                // setSearchValue("");
                                // setId(false);
                            }}
                            className="px-3 py-1 text-red-600 hover:bg-red-600 hover:text-white border border-red-600 text-xs rounded"
                        >
                            Cancel
                        </button>
                    </div>
                    <div className="flex gap-2">
                        {!readOnly && (
                            <button
                                type="button"
                                onClick={handleDone}
                                className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
                                                        border border-green-600 flex items-center gap-1 text-xs"
                            >
                                Done
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex-1 rounded-md ">

               
                            <div className="mt-4 mb-5 px-1 w-full overflow-y-auto ">


                                    <table className="border-collapse w-full table-fixed top-0 sticky">
                                        <thead className="bg-gray-200 text-gray-800">
                                            <tr>
                                                <th className="border border-gray-300 px-2 py-1 text-center text-xs w-11">

                                                    <input type="checkbox" onChange={(e) => handleSelectAllChange(e.target.checked, poItems?.data ? poItems.data : [])}
                                                        checked={getSelectAll(poItems?.data ? poItems.data : [])}
                                                    />
                                                </th>
                                                <th className="border border-gray-300 px-2 py-1 text-center text-xs w-8">S No</th>
                                                <th className="px-1 py-1.5 border border-gray-300 text-center text-xs w-20">

                                                    <label>Inward Doc No</label>
                                                    {/* <input
                                                                type="text"
                                                                className="text-black h-6 focus:outline-none border w-full  border-gray-400 rounded-lg"
                                                                placeholder="Search"
                                                                value={poNo}
                                                                onChange={(e) => {
                                                                    setPoNo(e.target.value);
                                                                }}
                                                            /> */}

                                                </th>
                                                <th className="px-1 py-1.5 border border-gray-300 text-center text-xs w-16">
                                                    <label>Inward Date</label>
                                                    {/* <input
                                                                type="text"
                                                                className="text-black h-6 focus:outline-none border w-full  border-gray-400 rounded-lg"
                                                                placeholder="Search"
                                                                value={searchPoDate}
                                                                onChange={(e) => {
                                                                    setPoDate(e.target.value);
                                                                }}
                                                            /> */}

                                                </th>
                                                <th className="px-1 py-1.5 border border-gray-300 text-xs  w-64">

                                                    <label>Item</label>
                                                    {/* <input
                                                                type="text"
                                                                className="text-black h-6 focus:outline-none border w-full border-gray-400 rounded-lg"
                                                                placeholder="Search"
                                                                value={searchDueDate}
                                                                onChange={(e) => {
                                                                    setDueDate(e.target.value);
                                                                }}
                                                            /> */}
                                                </th>

                                                <th className="px-1 py-1.5 border border-gray-300 text-xs  w-14">

                                                    <label>Size</label>
                                                    {/* <input
                                                                type="text"
                                                                className="text-black h-6 focus:outline-none border w-full border-gray-400 rounded-lg"
                                                                placeholder="Search"
                                                                value={searchDueDate}
                                                                onChange={(e) => {
                                                                    setDueDate(e.target.value);
                                                                }}
                                                            /> */}
                                                </th>

                                                <th className="px-1 py-1.5 border border-gray-300 text-xs text-gray-800  w-32">

                                                    <label>Color</label>
                                                    {/* <input
                                                                type="text"
                                                                className="text-black h-6 focus:outline-none border  w-full border-gray-400 rounded-lg"
                                                                placeholder="Search"
                                                                value={searchDueDate}
                                                            // onChange={(e) => {
                                                            //     setDueDate(e.target.value);
                                                            // }}
                                                            /> */}
                                                </th>




                                                <th className="px-1 py-1.5 border border-gray-300 text-xs  w-14">
                                                    <label>Uom</label>
                                                    {/* <input
                                                                type="text"
                                                                className="text-black h-6 focus:outline-none border w-full  border-gray-400 rounded-lg"
                                                                placeholder="Search"
                                                                value={searchDueDate}
                                                            // onChange={(e) => {
                                                            //     setDueDate(e.target.value);
                                                            // }}
                                                            /> */}

                                                </th>
                                                <th className="px-1 py-1.5 border border-gray-300 text-xs  w-16">
                                                    <label>Price</label>
                                                    {/* <input
                                                                type="text"
                                                                className="text-black h-6 focus:outline-none border  w-full border-gray-400 rounded-lg"
                                                                placeholder="Search"
                                                                value={searchDueDate}
                                                                onChange={(e) => {
                                                                    setDueDate(e.target.value);
                                                                }}
                                                            />  */}
                                                </th>

                                                {/* <th className="px-4 py-1.5 border border-gray-300 text-xs  w-20">Stock Qty</th> */}
                                                <th className="px-4 py-1.5 border border-gray-300 text-xs  w-20">Allowed Return Qty </th>




                                            </tr>
                                        </thead>

                                        <tbody>

                                            {poItems?.data?.length === 0 ? (
                                                <tr>
                                                    <td colSpan={9} className="px-4 py-4 text-center text-gray-500">
                                                        No data found
                                                    </td>
                                                </tr>
                                            ) : (
                                                poItems?.data?.map((item, index) => (
                                                    <tr
                                                        key={index}
                                                        className={`hover:bg-gray-50 py-1 transition-colors border-b border-gray-200 text-[12px] ${index % 2 === 0 ? "bg-white" : "bg-gray-100"
                                                            }`}
                                                        onClick={() => {
                                                            handleChange(item.id, item)

                                                        }}
                                                    >
                                                        <td className='py-1 text-center' key={index}>
                                                            <input type="checkbox" name="" id=""
                                                                checked={isItemAdded(item.id)}
                                                            />
                                                        </td>
                                                        <td className="w-5 border border-gray-300 px-2 py-1 text-center text-xs">
                                                            {index + 1}
                                                        </td>

                                                        <td className=" border border-gray-300 text-[11px] py-1.5 px-2">
                                                            {item?.DirectInwardOrReturn?.docId}
                                                        </td>

                                                        <td className=" border border-gray-300 px-2 py-1 text-left text-xs">
                                                            {getDateFromDateTimeToDisplay(item?.DirectInwardOrReturn?.createdAt)}
                                                        </td>
                                                        <td className=" border border-gray-300 text-[11px] py-1.5 px-2">
                                                            {item?.Item?.name}
                                                        </td>
                                                        <td className=" border border-gray-300 text-[11px] py-1.5 px-2">
                                                            {item?.Size?.name}
                                                        </td>
                                                        <td className=" border border-gray-300 text-[11px] py-1.5 px-2">
                                                            {item?.Color?.name}
                                                        </td>

                                                        <td className=" border border-gray-300 text-[11px] py-1.5 px-2">
                                                            {item?.Uom?.name}
                                                        </td>
                                                        <td className=" border border-gray-300 text-[11px] text-right py-1.5 px-2">
                                                            {parseInt(item?.price).toFixed(3)}
                                                        </td>
                                                        <td className=" border border-gray-300 text-[11px] text-right py-1.5 px-2">
                                                            {parseInt(item?.allowedReturnQty).toFixed(3)}
                                                        </td>


                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                            </div>

            </div>
            </div>
            <ReactPaginate
                previousLabel={"<"}
                nextLabel={">"}
                breakLabel={"..."}
                breakClassName={"break-me"}
                forcePage={pageNumberToReactPaginateIndex(currentPageNumber)}
                pageCount={Math.ceil(totalCount / dataPerPage)}
                marginPagesDisplayed={1}
                onPageChange={handleOnclick}
                containerClassName={"flex justify-center m-2 gap-5 items-center"}
                pageClassName={"border custom-circle text-center"}
                disabledClassName={"p-1 bg-gray-200"}
                previousLinkClassName={"border p-1 text-center"}
                nextLinkClassName={"border p-1"}
                activeClassName={"bg-blue-900 text-white px-2"} />
        </div>
    )

}

export default YarnInwardItemSelection