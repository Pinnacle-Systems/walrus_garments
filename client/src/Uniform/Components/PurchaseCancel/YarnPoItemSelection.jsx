import React, { useEffect, useState } from 'react'
import secureLocalStorage from 'react-secure-storage';
import { Loader } from '../../../Basic/components';
import { useGetPoItemsQuery } from '../../../redux/uniformService/PoServices';
import { showEntries } from '../../../Utils/DropdownData';
import ReactPaginate from 'react-paginate';
import { getDateFromDateTimeToDisplay, pageNumberToReactPaginateIndex, reactPaginateIndexToPageNumber } from '../../../Utils/helper';


const YarnPoItemSelection = ({ poType, supplierId, isItemAdded, handleChange, handleCancel, handleDone, readOnly, po, handleSelectAllChange,
    getSelectAll
}) => {
    const [poNo, setPoNo] = useState("");
    const [searchPoDate, setPoDate] = useState("");
    const [searchDueDate, setDueDate] = useState("");
    const [searchPoType, setSearchPoType] = useState("");
    const [supplier, setSupplier] = useState("");
    const [dataPerPage, setDataPerPage] = useState("10");
    const [totalCount, setTotalCount] = useState(0);
    const [currentPageNumber, setCurrentPageNumber] = useState(1);
    const [searchYarn, setSearchYarn] = useState("")
    const [searchColor, setSearchColor] = useState("")
    const branchId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "currentBranchId"
    )
    const handleOnclick = (e) => {
        setCurrentPageNumber(reactPaginateIndexToPageNumber(e.selected));
    }
    const searchFields = { searchDocId: poNo, searchPoDate, searchSupplierAliasName: supplier, searchPoType, searchDueDate, searchYarn, searchColor }

    const { data: poItems, isLoading: isPoItemsLoading, isFetching: isPoItemsFetching } = useGetPoItemsQuery({
        params: {
            branchId, supplierId, poType, ...searchFields, pagination: true, dataPerPage, pageNumber: currentPageNumber, isPurchaseCancelFilter: true, poInwardOrDirectInward: po
        }
    })
    const isLoadingIndicator = isPoItemsFetching || isPoItemsLoading
    useEffect(() => {
        if (poItems?.totalCount) {
            setTotalCount(poItems?.totalCount)
        }
    }, [poItems, isPoItemsFetching, isPoItemsLoading])

    return (
        <div className="flex flex-col w-full">
            {/* <div className="md:flex md:items-center md:justify-between page-heading p-1">
                <div className="heading text-center md:mx-10"> Purchase Order Items </div>
                <div className=" sub-heading justify-center md:justify-start items-center">
                    <label className="text-white text-sm rounded-md m-1  border-none">Show Entries</label>
                    <select value={dataPerPage}
                        onChange={(e) => setDataPerPage(e.target.value)} className='h-6 w-40 border border-gray-500 rounded mr-9'>
                        {showEntries.map((option) => <option value={option.value} >{option.show}</option>)}
                    </select>
                </div>
            </div> */}
            <>
                <div
                    className=" overflow-auto border border-gray-200  shadow-sm bg-[#f1f1f0] h-[530px]"
                >
                    <div className="border-b py-2 px-4 mx-3 flex justify-between items-center sticky top-0 z-10 bg-white mt-3">
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
                                Purchase Order Items
                            </h2>

                        </div>
                        <div className="flex gap-2">
                            <div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleCancel();
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
                                        {/* <Check size={14} /> */}
                                        Done
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto rounded-md ">

                        <div className=" flex flex-col bg-[#f1f1f0] px-1 w-full ">

                            <div className="flex flex-row w-full">
                                <div className="flex flex-col w-full">
                                    <div className="mt-4 mb-5 w-full">

                                        <table className="table-fixed text-center w-full">
                                            <thead className="bg-gray-200 text-gray-800">
                                                <tr>
                                                    <th className="border border-gray-300 px-2 py-1 text-center text-xs w-11">

                                                        <input type="checkbox" onChange={(e) => handleSelectAllChange(e.target.checked, poItems?.data ? poItems.data : [])}
                                                            checked={getSelectAll(poItems?.data ? poItems.data : [])}
                                                        />
                                                    </th>
                                                    <th className="border border-gray-300 px-2 py-1 text-center text-xs w-11">S No</th>
                                                    {/* <th className="px-4 py-1.5 border border-gray-300 text-center text-xs w-36">Po Type</th> */}
                                                    <th className="px-1 py-1.5 border border-gray-300 text-center text-xs w-36">

                                                        <label>Po.No</label>
                                                        <input
                                                            type="text"
                                                            className="text-black h-6 focus:outline-none border w-full  border-gray-400 rounded-lg"
                                                            placeholder="Search"
                                                            value={poNo}
                                                            onChange={(e) => {
                                                                setPoNo(e.target.value);
                                                            }}
                                                        />

                                                    </th>
                                                    <th className="px-1 py-1.5 border border-gray-300 text-center text-xs w-32">
                                                        <label>Po Date</label>
                                                        <input
                                                            type="text"
                                                            className="text-black h-6 focus:outline-none border w-full  border-gray-400 rounded-lg"
                                                            placeholder="Search"
                                                            value={searchPoDate}
                                                            onChange={(e) => {
                                                                setPoDate(e.target.value);
                                                            }}
                                                        />

                                                    </th>
                                                    {/* <th className="px-1 py-1.5 border border-gray-300 text-center text-xs w-32">
                                                        <label>Po Material</label>
                                                        <input
                                                            type="text"
                                                            className="text-black h-6 focus:outline-none border w-full  border-gray-400 rounded-lg"
                                                            placeholder="Search"
                                                            value={searchPoDate}
                                                            onChange={(e) => {
                                                                setPoDate(e.target.value);
                                                            }}
                                                        />

                                                    </th>
                                                       <th className="px-1 py-1.5 border border-gray-300 text-center text-xs w-32">
                                                        <label>Po Type</label>
                                                        <input
                                                            type="text"
                                                            className="text-black h-6 focus:outline-none border w-full  border-gray-400 rounded-lg"
                                                            placeholder="Search"
                                                            value={searchPoDate}
                                                            onChange={(e) => {
                                                                setPoDate(e.target.value);
                                                            }}
                                                        />

                                                    </th> */}
                                                    <th className="px-1 py-1.5 border border-gray-300 text-xs  w-64">

                                                        <label>Yarn</label>
                                                        <input
                                                            type="text"
                                                            className="text-black h-6 focus:outline-none border w-full border-gray-400 rounded-lg"
                                                            placeholder="Search"
                                                            value={searchYarn}
                                                            onChange={(e) => {
                                                                setSearchYarn(e.target.value);
                                                            }}
                                                        />
                                                    </th>


                                                    <th className="px-1 py-1.5 border border-gray-300 text-xs text-gray-800  w-32">

                                                        <label>Color</label>
                                                        <input
                                                            type="text"
                                                            className="text-black h-6 focus:outline-none border  w-full border-gray-400 rounded-lg"
                                                            placeholder="Search"
                                                            value={searchColor}
                                                            onChange={(e) => {
                                                                setSearchColor(e.target.value);
                                                            }}
                                                        />
                                                    </th>




                                                    <th className="px-1 py-1.5 border border-gray-300 text-xs  w-20">
                                                        <label>Uom</label>


                                                    </th>
                                                    <th className="px-1 py-1.5 border border-gray-300 text-xs  w-20">
                                                        <label>Price</label>

                                                    </th>

                                                    <th className="px-4 py-1.5 border border-gray-300 text-xs  w-20">Po Qty</th>
                                                    <th className="px-4 py-1.5 border border-gray-300 text-xs  w-20">Already Cancel Qty</th>
                                                    <th className="px-4 py-1.5 border border-gray-300 text-xs  w-20">Already Inward Qty</th>
                                                    <th className="px-4 py-1.5 border border-gray-300 text-xs  w-20">Already Return Qty</th>
                                                    <th className="px-4 py-1.5 border border-gray-300 text-xs  w-20">Balance  Qty </th>





                                                </tr>
                                            </thead>
                                            {isLoadingIndicator ?
                                                <tbody>
                                                    <tr>
                                                        <td>
                                                            <Loader />
                                                        </td>
                                                    </tr>
                                                </tbody>
                                                :
                                                <tbody className="border-2">
                                                    {poItems.data.map((dataObj, index) => (
                                                        <tr
                                                            key={dataObj.id}
                                                            className="border-2 tx-table-row "
                                                            onClick={() => handleChange(dataObj.id)}
                                                        >
                                                            <td className='py-1'>
                                                                <input type="checkbox" name="" id="" checked={isItemAdded(dataObj.id)} />
                                                            </td>
                                                            <td className='py-1'> {(index + 1) + (dataPerPage * (currentPageNumber - 1))}</td>
                                                            <td className='py-1'> {dataObj?.Po?.docId}</td>
                                                            <td className='py-1'>{getDateFromDateTimeToDisplay(dataObj?.Po?.createdAt)} </td>
                                                            {/* <td className='py-1'> {dataObj?.Po?.poMaterial}</td>
                                                            <td className='py-1'> {dataObj?.Po?.poType}</td> */}

                                                            <td className='py-1'> {dataObj?.Yarn?.name}</td>
                                                            <td className='py-1'> {dataObj?.Color?.name}</td>
                                                            <td className='py-1'> {dataObj?.Uom?.name}</td>
                                                            <td className=" border border-gray-300 text-[11px] text-right py-1.5 px-2">
                                                                {parseInt(dataObj?.price).toFixed(3)}
                                                            </td>
                                                            <td className=" border border-gray-300 text-[11px] text-right py-1.5 px-2">
                                                                {parseInt(dataObj?.poQty).toFixed(3)}
                                                            </td>
                                                            <td className=" border border-gray-300 text-[11px]  text-right py-1.5 px-2">
                                                                {parseInt(dataObj?.alreadyCancelData?._sum?.qty ?? 0).toFixed(3)}
                                                            </td>
                                                            <td className=" border border-gray-300 text-[11px] text-right py-1.5 px-2">
                                                                {parseInt(dataObj?.alreadyInwardedData?._sum?.qty ?? 0).toFixed(3)}
                                                            </td>
                                                            <td className=" border border-gray-300 text-[11px] text-right py-1.5 px-2">
                                                                {parseInt(dataObj?.alreadyReturnedQty).toFixed(3) ?? 0}
                                                            </td>
                                                            <td className=" border border-gray-300 text-[11px]  text-right py-1.5 px-2">
                                                                {parseInt(dataObj?.balanceQty).toFixed(3) ?? 0}
                                                            </td>

                                                        </tr>
                                                    ))}
                                                </tbody>
                                            }
                                        </table>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>

                </div>
            </>
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

export default YarnPoItemSelection