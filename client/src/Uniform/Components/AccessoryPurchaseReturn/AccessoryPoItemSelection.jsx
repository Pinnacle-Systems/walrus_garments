import React, { useEffect, useState } from 'react'
import secureLocalStorage from 'react-secure-storage';
import { Loader } from '../../../Basic/components';
import { useGetPoItemsQuery } from '../../../redux/uniformService/PoServices';
import { showEntries } from '../../../Utils/DropdownData';
import ReactPaginate from 'react-paginate';
import { getDateFromDateTimeToDisplay, pageNumberToReactPaginateIndex, reactPaginateIndexToPageNumber } from '../../../Utils/helper';
import { useGetAccessoryPoItemsQuery } from '../../../redux/uniformService/AccessoryPoServices';


const AccessoryPoItemSelection = ({ poType, supplierId, isItemAdded, handleChange, getSelectAll, handleSelectAllChange, poInwardOrDirectInward  ,handleCancel , handleDone}) => {

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

    const { data: poItems, isLoading: isPoItemsLoading, isFetching: isPoItemsFetching } = useGetAccessoryPoItemsQuery({
        params: {
            branchId, supplierId, poType, ...searchFields, pagination: true, dataPerPage, pageNumber: currentPageNumber,
            isPurchaseReturnFilter: true, poInwardOrDirectInward: poInwardOrDirectInward,
        }
    })
    const isLoadingIndicator = isPoItemsFetching || isPoItemsLoading
    useEffect(() => {
        if (poItems?.totalCount) {
            setTotalCount(poItems?.totalCount)
        }
    }, [poItems, isPoItemsFetching, isPoItemsLoading])


    console.log(poInwardOrDirectInward, "poInwardOrDirectInward")

    return (
        
        <div className='border border-gray-200  shadow-sm bg-[#f1f1f0]'>
            <div className="border-b py-2 px-4 mx-3 flex justify-between items-center sticky top-0 z-10 bg-white mt-3">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
                        Accessory Po Inward Items
                    </h2>

                </div>
                <div className="flex gap-2">
                    <div>
                        <button
                            type="button"
                            onClick={() => {
                                handleCancel();
                       
                            }}
                            className="px-3 py-1 text-red-600 hover:bg-red-600 hover:text-white border border-red-600 text-xs rounded"
                        >
                            Cancel
                        </button>
                    </div>
                    <div className="flex gap-2">
                        {/* {!readOnly && ( */}
                            <button
                                type="button"
                                onClick={handleDone}
                                className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
                                        border border-green-600 flex items-center gap-1 text-xs"
                            >
                                Done
                            </button>
                        {/* )} */}
                    </div>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto rounded-md ">

                <div className="h-full flex flex-col bg-[#f1f1f0] px-1 w-full max-h-[450px]">

                    <div className="flex flex-row w-full">
                        <div className="flex flex-col w-full">
                            <div className="mt-4 mb-5 w-full">

                                <div className=" w-[90vw] overflow-auto ">

                                    <table className="border-collapse w-full">
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
                                                    <label>Po No</label>
                                                    <input
                                                        type="text"
                                                        className="text-black h-6 focus:outline-none border  border-gray-400 rounded-lg w-full"
                                                        placeholder="Search"
                                                        onFocus={(e) => e.target.select()}
                                                        // value={searchDocId}
                                                        onChange={(e) => {
                                                            // setSearchDocId(e.target.value);
                                                        }}
                                                    />
                                                </th>
                                                <th className="px-1 py-1.5 border border-gray-300 text-center text-xs w-36">
                                                    <label>Po Date</label>
                                                    <input
                                                        type="text"
                                                        className="text-black h-6 focus:outline-none border  border-gray-400 rounded-lg w-full"
                                                        placeholder="Search"
                                                        value={searchPoDate}
                                                        onChange={(e) => {
                                                            setPoDate(e.target.value);
                                                        }}
                                                        onFocus={(e) => { e.target.select() }}

                                                    />
                                                </th>
                                                <th className="px-1 py-1.5 border border-gray-300 text-xs  w-96">
                                                    <label>Accessory</label>
                                                    <input
                                                        type="text"
                                                        className="text-black h-6 focus:outline-none border w-full border-gray-400 rounded-lg"
                                                        placeholder="Search"
                                                        value={searchDueDate}
                                                        onChange={(e) => {
                                                            setDueDate(e.target.value);
                                                        }}
                                                        onFocus={(e) => { e.target.select() }}

                                                    /></th>


                                                {/* <th className="px-1 py-1.5 border border-gray-300 text-xs text-gray-800  w-96"> 
                                                       <label>Accessory Item</label>
                                                    <input
                                                        type="text"
                                                        className="text-black h-6 focus:outline-none border w-full border-gray-400 rounded-lg"
                                                        placeholder="Search"
                                                        value={searchDueDate}
                                                        // onChange={(e) => {
                                                        //     setDueDate(e.target.value);
                                                        // }}
                                                        onFocus={(e) => { e.target.select() }}

                                                    />
                                                    </th> */}



                                                {/* 
                                                <th className="px-1 py-1.5 border border-gray-300 text-xs  w-60">
                                                    <label>Accessory Group</label>
                                                    <input
                                                        type="text"
                                                        className="text-black h-6 focus:outline-none border w-full border-gray-400 rounded-lg"
                                                        placeholder="Search"
                                                        value={searchDueDate}
                                                    // onChange={(e) => {
                                                    //     setDueDate(e.target.value);
                                                    // }}
                                                    />
                                                    
                                                    </th> */}
                                                {/* <th className="px-4 py-1.5 border border-gray-300 text-xs  w-20">Uom</th> */}
                                                <th className="px-1 py-1.5 border border-gray-300 text-xs  w-64">
                                                    <label>Color</label>
                                                    <input
                                                        type="text"
                                                        className="text-black h-6 focus:outline-none border w-full border-gray-400 rounded-lg"
                                                        placeholder="Search"
                                                        value={searchDueDate}
                                                    // onChange={(e) => {
                                                    //     setDueDate(e.target.value);
                                                    // }}
                                                    /></th>
                                                <th className="px-1 py-1.5 border border-gray-300 text-xs  w-20">
                                                    <label>Size</label>
                                                    {/* <input
                                                        type="text"
                                                        className="text-black h-6 focus:outline-none border w-full border-gray-400 rounded-lg"
                                                        placeholder="Search"
                                                        value={searchDueDate}
                                                    // onChange={(e) => {
                                                    //     setDueDate(e.target.value);
                                                    // }}
                                                    /> */}

                                                </th>
                                                <th className="px-1 py-1.5 border border-gray-300 text-xs  w-20">
                                                    <label>Uom</label>
                                                    {/* <input
                                                        type="text"
                                                        className="text-black h-6 focus:outline-none border w-full border-gray-400 rounded-lg"
                                                        placeholder="Search"
                                                        value={searchDueDate}
                                                    // onChange={(e) => {
                                                    //     setDueDate(e.target.value);
                                                    // }}
                                                    /> */}

                                                </th>

                                                <th className="px-4 py-1.5 border border-gray-300 text-xs  w-20">Price </th>



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

                                                        <td className=" border border-gray-300 text-[11px]  text-left py-1.5 px-2">
                                                            {item?.AccessoryPo?.docId}
                                                        </td>

                                                        <td className=" border border-gray-300 px-2 py-1 text-left text-xs">
                                                            {getDateFromDateTimeToDisplay(item?.AccessoryPo?.createdAt)}
                                                        </td>
                                                        <td className=" border border-gray-300 text-[11px]  text-left py-1.5 px-2">
                                                            {item?.Accessory?.aliasName}
                                                        </td>

                                                        {/* <td className=" border border-gray-300 text-[11px] py-1.5 px-2">
                                                            {item?.Accessory?.accessoryItem?.name}
                                                        </td> */}

                                                        {/* <td className=" border border-gray-300 text-[11px] py-1.5 px-2">
                                                            {item?.Accessory?.accessoryItem?.AccessoryGroup?.name}
                                                        </td> */}

                                                        <td className=" border border-gray-300 text-[11px]   text-left py-1.5 px-2">
                                                            {item?.Color?.name}
                                                        </td>
                                                        <td className=" border border-gray-300 text-[11px]  text-left  py-1.5 px-2">
                                                            {item?.Size?.name}
                                                        </td>
                                                        <td className=" border border-gray-300 text-[11px]  text-left  py-1.5 px-2">
                                                            {item?.Uom?.name}
                                                        </td>
                                                        <td className=" border border-gray-300 text-[11px] text-right  py-1.5 px-2">
                                                            {parseFloat(item?.price).toFixed(3)}
                                                        </td>

                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

}

export default AccessoryPoItemSelection