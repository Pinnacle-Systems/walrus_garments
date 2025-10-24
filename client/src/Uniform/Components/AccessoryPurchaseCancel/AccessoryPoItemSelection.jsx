import React, { useEffect, useState } from 'react'
import secureLocalStorage from 'react-secure-storage';
import { Loader } from '../../../Basic/components';
import { useGetPoItemsQuery } from '../../../redux/uniformService/PoServices';
import { showEntries } from '../../../Utils/DropdownData';
import ReactPaginate from 'react-paginate';
import { getDateFromDateTimeToDisplay, pageNumberToReactPaginateIndex, reactPaginateIndexToPageNumber } from '../../../Utils/helper';
import { useGetAccessoryPoItemsQuery } from '../../../redux/uniformService/AccessoryPoServices';


const AccessoryPoItemSelection = ({

    setInwardItems, inwardItems, setInwardItemSelection, onClose,
    poType, supplierId, readOnly, po }) => {



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
            branchId, supplierId, poType, ...searchFields, pagination: true, dataPerPage,
            pageNumber: currentPageNumber, isPurchaseCancelFilter: true, poInwardOrDirectInward: po
        }

    })

    const [tempInwardItems, seTempInwardItems] = useState([])

    const isLoadingIndicator = isPoItemsFetching || isPoItemsLoading
    useEffect(() => {
        // if (poItems?.totalCount) {
        //     setTotalCount(poItems?.totalCount)
        // }
        seTempInwardItems(poItems?.data)
    }, [poItems, isPoItemsFetching, isPoItemsLoading])


    console.log(tempInwardItems, "tempInwardItems")
    function handleDone() {
        onClose()

    }

    function handleCancel() {
        setInwardItems([]);
        onClose()
    }




    function addItem(id, poItem) {
        const newItem = {
            poNo: poItem?.AccessoryPo?.docId,
            poId: poItem?.AccessoryPo?.id,
            accessoryGroupId: poItem?.accessoryGroupId,
            accessoryItemId: poItem?.accessoryItemId,
            accessoryId: poItem?.accessoryId,
            colorId: poItem?.colorId,
            sizeId: poItem?.sizeId,
            discountAmount: poItem?.discountAmount,
            discountType: poItem?.discountType,
            poItemsId: poItem?.id,

            price: poItem?.price,
            taxPercent: poItem?.taxPercent,
            uomId: poItem?.uomId,
            poQty: poItem?.qty,
            cancelQty: poItem?.alreadyCancelData?._sum?.qty
                ? parseFloat(poItem.alreadyCancelData._sum.qty).toFixed(3)
                : "0",
            alreadyInwardedQty: poItem?.alreadyInwardedData?._sum?.qty
                ? parseFloat(poItem.alreadyInwardedData._sum.qty).toFixed(3)
                : "0",
            alreadyInwardedRolls: poItem?.alreadyInwardedData?._sum?.noOfRolls
                ? parseInt(poItem.alreadyInwardedData._sum.noOfRolls)
                : "0",
            alreadyReturnedQty: poItem?.alreadyReturnedData?._sum?.qty
                ? parseFloat(poItem.alreadyReturnedData._sum.qty).toFixed(3)
                : "0",
            alreadyReturnedRolls: poItem?.alreadyReturnedData?._sum?.noOfRolls
                ? parseInt(poItem.alreadyReturnedData._sum.noOfRolls)
                : "0",
            balanceQty: poItem?.balanceQty
                ? parseFloat(poItem.balanceQty).toFixed(3)
                : "0.000",

            stockQty: poItem?.stockQty
                ? parseFloat(poItem.stockQty).toFixed(3)
                : "0.000",
            stockRolls: poItem?.stockRolls
                ? parseInt(poItem.stockRolls)
                : 0,
            allowedReturnRolls: poItem?.allowedReturnRolls || 0,
            allowedReturnQty: poItem?.allowedReturnQty
                ? parseFloat(poItem.allowedReturnQty).toFixed(3)
                : "0.000"
        };
        console.log(newItem, "newItem")

        setInwardItems(prevItems => {
            let newBlend = structuredClone(prevItems);

            const index = newBlend?.findIndex(v => v?.poItemsId === "");

            console.log(poItem, "poItem")

            let poNo = poItem?.AccessoryPo?.docId
            let poId = poItem?.AccessoryPo?.poId

            // Build common object


            if (index !== -1) {
                // Replace existing blank slot
                newBlend[index] = newItem;
            } else {
                // Push as a new entry
                newBlend.push(newItem);
            }

            return newBlend;
        });
    }

    function removeItem(id) {
        setInwardItems(localInwardItems => {
            let newItems = structuredClone(localInwardItems);
            newItems = newItems?.filter(item => parseInt(item.poItemsId) !== parseInt(id))
            return newItems
        });
    }

    function handleChange(id, obj) {
        console.log(id, "iddddd")

        if (isItemAdded(id)) {
            removeItem(id)
        } else {
            addItem(id, obj)
        }
    }

    function isItemAdded(id) {
        console.log(inwardItems?.findIndex(item => parseInt(item?.poItemsId) === parseInt(id)) !== -1, "inwardItems")

        return (inwardItems || [])?.findIndex(item => parseInt(item?.poItemsId) === parseInt(id)) !== -1
    }

    console.log(inwardItems, "inwardItems")

    function handleSelectAllChange(value, inwardItems) {
        if (value) {
            inwardItems?.forEach(item => addItem(item.id, item))
        } else {
            inwardItems?.forEach(item => removeItem(item.id))
        }
    }

    function getSelectAll(inwardItems) {
        return inwardItems?.every(item => isItemAdded(item.id))
    }








    return (
        <div className="flex flex-col w-full h-[100%] border border-gray-200  shadow-sm bg-[#f1f1f0]">
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
                            <div className="flex flex-col w-full ">
                                <div className="mt-4 mb-5 w-full p-4">


                                    <table className="table-auto text-center w-full">
                                        <thead className="border-2 table-header">
                                            <tr className='h-2'>
                                                <th className='w-12'>
                                                    <input type="checkbox" onChange={(e) => handleSelectAllChange(e.target.checked, poItems?.data ? poItems.data : [])}
                                                        checked={getSelectAll(poItems?.data ? poItems.data : [])}
                                                    />
                                                </th>
                                                <th
                                                    className="border-2  top-0 stick-bg">
                                                    S. no.
                                                </th>
                                                <th
                                                    className="border-2  top-0 stick-bg grid"
                                                >
                                                    <label>Po.No</label><input
                                                        type="text"
                                                        className="text-black h-6 focus:outline-none border md:ml-3 border-gray-400 rounded-lg"
                                                        placeholder="Search"
                                                        value={poNo}
                                                        onChange={(e) => {
                                                            setPoNo(e.target.value);
                                                        }}
                                                    />
                                                </th>
                                                <th
                                                    className="border-2  top-0 stick-bg"
                                                >
                                                    <label>Po.Date</label>
                                                    <input
                                                        type="text"
                                                        className="text-black h-6 focus:outline-none border md:ml-3 border-gray-400 rounded-lg"
                                                        placeholder="Search"
                                                        value={searchPoDate}
                                                        onChange={(e) => {
                                                            setPoDate(e.target.value);
                                                        }}
                                                    />
                                                </th>
                                                <th className="border-2  top-0 stick-bg">
                                                    <label>Accessory</label>
                                                    <input
                                                        type="text"
                                                        className="text-black h-6 focus:outline-none border md:ml-3 border-gray-400 rounded-lg"
                                                        placeholder="Search"
                                                        value={searchDueDate}
                                                    // onChange={(e) => {
                                                    //     setDueDate(e.target.value);
                                                    // }}
                                                    />
                                                </th>
                                                <th className="border-2  top-0 stick-bg">
                                                    <label>Accessory Item</label>
                                                    <input
                                                        type="text"
                                                        className="text-black h-6 focus:outline-none border md:ml-3 border-gray-400 rounded-lg"
                                                        placeholder="Search"
                                                        value={searchDueDate}
                                                    // onChange={(e) => {
                                                    //     setDueDate(e.target.value);
                                                    // }}
                                                    />
                                                </th>
                                                <th className="border-2  top-0 stick-bg">
                                                    <label>Accessory Group</label>
                                                    <input
                                                        type="text"
                                                        className="text-black h-6 focus:outline-none border md:ml-3 border-gray-400 rounded-lg"
                                                        placeholder="Search"
                                                        value={searchDueDate}
                                                    // onChange={(e) => {
                                                    //     setDueDate(e.target.value);
                                                    // }}
                                                    />
                                                </th>
                                                <th className="border-2  top-0 stick-bg">
                                                    <label>Color</label>
                                                    <input
                                                        type="text"
                                                        className="text-black h-6 focus:outline-none border md:ml-3 border-gray-400 rounded-lg"
                                                        placeholder="Search"
                                                        value={searchDueDate}
                                                    // onChange={(e) => {
                                                    //     setDueDate(e.target.value);
                                                    // }}
                                                    />
                                                </th>
                                                <th className="border-2  top-0 stick-bg">
                                                    <label>Size</label>
                                                    <input
                                                        type="text"
                                                        className="text-black h-6 focus:outline-none border md:ml-3 border-gray-400 rounded-lg"
                                                        placeholder="Search"
                                                        value={searchDueDate}
                                                    // onChange={(e) => {
                                                    //     setDueDate(e.target.value);
                                                    // }}
                                                    />
                                                </th>
                                                <th className="border-2  top-0 stick-bg">
                                                    <label>Uom</label>
                                                    <input
                                                        type="text"
                                                        className="text-black h-6 focus:outline-none border md:ml-3 border-gray-400 rounded-lg"
                                                        placeholder="Search"
                                                        value={searchDueDate}
                                                    // onChange={(e) => {
                                                    //     setDueDate(e.target.value);
                                                    // }}
                                                    />
                                                </th>

                                            </tr>
                                        </thead>
                                        {tempInwardItems?.length <= 0 ?
                                            <tbody>
                                                <tr>
                                                    <td
                                                        colSpan="10"
                                                        className="text-center py-4 text-gray-600 bg-gray-50 font-medium"
                                                    >
                                                        No Data Available
                                                    </td>
                                                </tr>
                                            </tbody>
                                            :
                                            <tbody className="border-2">
                                                {tempInwardItems?.map((dataObj, index) => (
                                                    <tr
                                                        key={dataObj.id}
                                                        className="border-2 table-row "
                                                        onClick={() => handleChange(dataObj?.id, dataObj)}
                                                    >
                                                        <td className='py-1'>
                                                            <input type="checkbox" name="" id="" checked={isItemAdded(dataObj.id)} />
                                                        </td>
                                                        <td className='py-1'> {(index + 1) + (dataPerPage * (currentPageNumber - 1))}</td>
                                                        <td className='py-1'> {dataObj?.AccessoryPo?.docId}</td>
                                                        <td className='py-1'>{getDateFromDateTimeToDisplay(dataObj.AccessoryPo.createdAt)} </td>
                                                        <td className='py-1'> {dataObj?.Accessory?.aliasName}</td>
                                                        <td className='py-1'> {dataObj.Accessory?.accessoryItem?.name}</td>
                                                        <td className='py-1'> {dataObj.Accessory?.accessoryItem?.AccessoryGroup?.name}</td>
                                                        <td className='py-1'> {dataObj?.Color?.name}</td>
                                                        <td className='py-1'> {dataObj?.Size?.name}</td>
                                                        <td className='py-1'> {dataObj?.Uom?.name}</td>
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
        </div >
    )

}

export default AccessoryPoItemSelection