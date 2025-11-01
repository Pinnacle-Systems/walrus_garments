import React, { useEffect, useState } from 'react'
import secureLocalStorage from 'react-secure-storage';
import { Loader } from '../../../Basic/components';
import { useGetPoItemsQuery } from '../../../redux/uniformService/PoServices';
import { showEntries } from '../../../Utils/DropdownData';
import ReactPaginate from 'react-paginate';
import { getBalanceBillQty, getDateFromDateTimeToDisplay, pageNumberToReactPaginateIndex, reactPaginateIndexToPageNumber } from '../../../Utils/helper';
import { useGetPoItemsandDirectInwardItemsQuery } from '../../../redux/uniformService/DirectInwardOrReturnServices';
import { useGetPoItemsandAccessoryInwardItemsQuery } from '../../../redux/uniformService/AccessoryInwardServices';


const AccessoryPoItemSelection = ({ poType, supplierId, isItemAdded, handleChange, handleCancel, handleDone, readOnly, po }) => {
    const [poNo, setPoNo] = useState("");
    const [searchPoDate, setPoDate] = useState("");
    const [searchDueDate, setDueDate] = useState("");
    const [searchPoType, setSearchPoType] = useState("");
    const [searchTransType, setSearchTransType] = useState("");
    const [searchYarn, setSearchYarn] = useState("");
    const [searchProcess, setSearchProcess] = useState("");
    const [searchUom, setSearchUom] = useState("");
    const [searchPoQty, setSearchPoQty] = useState("");
    const [searchGrnQty, setSearchGrnQty] = useState("");
    const [searchRtnQty, setSearchRtnQty] = useState("");
    const [searchCanQty, setSearchCanQty] = useState("");
    const [searchPoRate, setSearchPoRate] = useState("");
    const [searchBillQty, setSearchBillQty] = useState("");
    const [searchBalQty, setSearchBalQty] = useState("");

    const [searchColor, setSearchColor] = useState("");
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

    const { data: items, isLoading, isFetching } = useGetPoItemsandAccessoryInwardItemsQuery({
        params: {
            branchId, supplierId, poType, ...searchFields, pagination: true, dataPerPage, pageNumber: currentPageNumber,
            isAccessoryFilter: true
        }
    })

    const isLoadingIndicator = isLoading || isFetching

    useEffect(() => {
        if (items?.totalCount) {
            setTotalCount(items?.totalCount)
        }
    }, [items, isLoading, isFetching])

    return (
        <div className="flex flex-col w-full ">
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
                    className=" overflow-auto border border-gray-200  shadow-sm bg-[#f1f1f0] "
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
                    <div className="flex-1 overflow-y-auto rounded-md h-[61vh]">

                        <div className=" flex flex-col bg-[#f1f1f0] px-1 w-full ">

                            <div className="flex flex-row w-full">
                                <div className="flex flex-col w-full">
                                    <div className="mt-4 mb-5 w-full">

                                        <table className="table-fixed text-center w-full">
                                            <thead className="border-2 table-header">
                                                <tr className='h-2 text-xs'>
                                                    <th className='w-10'>
                                                        <input type="checkbox"
                                                        //  onChange={(e) => handleSelectAllChange(e.target.checked, items?.data ? items.data : [])}
                                                            // checked={getSelectAll(items?.data ? items.data : [])}
                                                        />
                                                    </th>
                                                    <th
                                                        className="border-2  top-0 stick-bg w-10">
                                                        S. no.
                                                    </th>
                                                    <th
                                                        className="border-2  top-0 stick-bg w-24"
                                                    >
                                                        <label>Po No</label><input
                                                            type="text"
                                                            className="text-black h-6 focus:outline-none border  border-gray-400 rounded-lg w-full"
                                                            placeholder="Search"
                                                            value={poNo}
                                                            onChange={(e) => {
                                                                setPoNo(e.target.value);
                                                            }}
                                                        />
                                                    </th>
                                                    <th className="border-2  top-0 stick-bg w-72">
                                                        <label>Accesory Item</label>
                                                        <input
                                                            type="text"
                                                            className="text-black h-6 focus:outline-none border  border-gray-400 rounded-lg w-full"
                                                            placeholder="Search"
                                                            value={searchYarn}
                                                            onChange={(e) => {
                                                                setSearchYarn(e.target.value);
                                                            }}
                                                        />
                                                    </th>

                                                    <th className="border-2  top-0 stick-bg ">
                                                        <label>Color</label>
                                                        <input
                                                            type="text"
                                                            className="text-black h-6 focus:outline-none border  border-gray-400 rounded-lg w-full"
                                                            placeholder="Search"
                                                            value={searchColor}
                                                            onChange={(e) => {
                                                                setSearchColor(e.target.value);
                                                            }}
                                                        />
                                                    </th>
                                                    <th className="border-2  top-0 stick-bg grid">
                                                        <label>Uom</label>
                                                        <input
                                                            type="text"
                                                            className="text-black h-6 focus:outline-none border  border-gray-400 rounded-lg w-full"
                                                            placeholder="Search"
                                                            value={searchUom}
                                                            onChange={(e) => {
                                                                setSearchUom(e.target.value);
                                                            }}
                                                        />
                                                    </th>
                                                    {/* <th className="border-2  top-0 stick-bg">
                                                        <label>Po Qty</label>
                                                        <input
                                                            type="text"
                                                            className="text-black h-6 focus:outline-none border  border-gray-400 rounded-lg w-full"
                                                            placeholder="Search"
                                                            value={searchPoQty}
                                                            onChange={(e) => {
                                                                setSearchPoQty(e.target.value);
                                                            }}
                                                        />
                                                    </th> */}
                                                    <th className="border-2  ">
                                                        <label>Already Inward Qty</label>
                                                        <input
                                                            type="text"
                                                            className="text-black h-6 focus:outline-none border  border-gray-400 rounded-lg w-full"
                                                            placeholder="Search"
                                                            value={searchGrnQty}
                                                            onChange={(e) => {
                                                                setSearchGrnQty(e.target.value);
                                                            }}
                                                        />
                                                    </th>
                                                    <th className="border-2  top-0 stick-bg ">
                                                        <label>Rtn.Qty</label>
                                                        <input
                                                            type="text"
                                                            className="text-black h-6 focus:outline-none border  border-gray-400 rounded-lg w-full"
                                                            placeholder="Search"
                                                            value={searchRtnQty}
                                                            onChange={(e) => {
                                                                setSearchRtnQty(e.target.value);
                                                            }}
                                                        />
                                                    </th>
                                                    <th className="border-2  top-0 stick-bg">
                                                        <label>Can.Qty</label>
                                                        <input
                                                            type="text"
                                                            className="text-black h-6 focus:outline-none border  border-gray-400 rounded-lg w-full"
                                                            placeholder="Search"
                                                            value={searchCanQty}
                                                            onChange={(e) => {
                                                                setSearchCanQty(e.target.value);
                                                            }}
                                                        />
                                                    </th>
                                                    <th className="border-2  top-0 stick-bg ">
                                                        <label>Po.Rate</label>
                                                        <input
                                                            type="text"
                                                            className="text-black h-6 focus:outline-none border  border-gray-400 rounded-lg w-full"
                                                            placeholder="Search"
                                                            value={searchPoRate}
                                                            onChange={(e) => {
                                                                setSearchPoRate(e.target.value);
                                                            }}
                                                        />
                                                    </th>
                                                    <th className="border-2  top-0 stick-bg">
                                                        <label>Bill.Qty</label>
                                                        <input
                                                            type="text"
                                                            className="text-black h-6 focus:outline-none border  border-gray-400 rounded-lg w-full"
                                                            placeholder="Search"
                                                            value={searchBillQty}
                                                            onChange={(e) => {
                                                                setSearchBillQty(e.target.value);
                                                            }}
                                                        />
                                                    </th>
                                                    <th className="border-2  top-0 stick-bg grid">
                                                        <label>Bal.Qty</label>
                                                        <input
                                                            type="text"
                                                            className="text-black h-6 focus:outline-none border  border-gray-400 rounded-lg w-full"
                                                            placeholder="Search"
                                                            value={searchBalQty}
                                                            onChange={(e) => {
                                                                setSearchBalQty(e.target.value);
                                                            }}
                                                        />
                                                    </th>
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
                                                    {(items?.data ? items?.data : [])
                                                        ?.filter(i => i.alreadyInwardedQty  > i.alreadyReturnedQty)
                                                        ?.map((dataObj, index) => (
                                                            <tr
                                                                key={dataObj.id}
                                                                className="border-2 table-row text-xs "
                                                                onClick={() => handleChange(dataObj.id, dataObj?.accessoryId ? true : false)}
                                                            >
                                                                <td className='py-1'>
                                                                    <input type="checkbox" name="" id="" checked={isItemAdded(dataObj.id, dataObj?.accessoryId ? true : false)} />
                                                                </td>
                                                                <td className='py-1'> {(index + 1) + (dataPerPage * (currentPageNumber - 1))}</td>
                                                                <td className='py-1'> {dataObj?.AccessoryPo?.docId}</td>
                                                                <td className='py-1'> {dataObj?.Accessory?.aliasName}</td>
                                                                <td className='py-1'> {dataObj?.Color?.name}</td>
                                                                <td className='py-1'> {dataObj?.Uom?.name}</td>
                                                                {/* <td className='py-1'> { dataObj?.qty  }</td> */}
                                                                <td className='py-1'> {dataObj?.poId
                                                                    ? (dataObj?.alreadyInwardedData?._sum.qty ? dataObj.alreadyInwardedData?._sum.qty : "0.000")
                                                                    : parseFloat(dataObj.qty).toFixed(3)}</td>
                                                                <td className='py-1'> {dataObj?.poId ? (dataObj?.alreadyReturnedData?._sum.qty ? dataObj.alreadyReturnedData._sum.qty : "0.000") : ""}</td>
                                                                <td className='py-1'> {dataObj?.poId ? (dataObj?.alreadyCancelData?._sum.qty ? dataObj.alreadyCancelData._sum.qty : "0.000") : ""}</td>
                                                                <td className='py-1'> {parseFloat(dataObj.price).toFixed(2)}</td>
                                                                <td className='py-1'> {dataObj?.alreadyBillData?._sum.qty ? dataObj.alreadyBillData._sum.qty : "0.000"}</td>
                                                                <td className='py-1'> {
                                                                    getBalanceBillQty(
                                                                        dataObj?.poId ? (dataObj?.alreadyInwardedData._sum.qty ? dataObj?.alreadyInwardedData._sum.qty : "0.000") : dataObj.qty,
                                                                        dataObj?.alreadyReturnedData?._sum?.qty ? dataObj.alreadyReturnedData._sum.qty : "0.000",
                                                                        dataObj?.alreadyBillData?._sum?.qty ? dataObj.alreadyBillData._sum.qty : "0.000"
                                                                    )}</td>
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

export default AccessoryPoItemSelection