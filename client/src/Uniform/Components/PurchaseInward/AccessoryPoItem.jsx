import { useEffect } from "react"
import { useGetPoItemByIdQuery } from "../../../redux/uniformService/PoServices"
import { Loader } from "lucide-react"
import { findFromList } from "../../../Utils/helper"
import { DELETE } from "../../../icons"
import { HiPencil, HiTrash } from "react-icons/hi"


const AccessoryPoItem = ({ uomList, sizeList, accessoryList, colorList, item, index, handleInputChange, readOnly, deleteRow, purchaseInwardId }) => {
    const { data, isLoading, isFetching } = useGetPoItemByIdQuery({ id: item?.poItemsId, purchaseInwardId }, { skip: !item?.poItemsId })

    console.log(item, "item")

    useEffect(() => {
        if (purchaseInwardId) return
        if (isLoading || isFetching) return
        const poItem = data?.data

        if (data?.data) {
            handleInputChange(poItem?.accessoryId, index, "accessoryId", 0, poItem);


        }
    }, [isFetching, isLoading, data, purchaseInwardId])
    if (isLoading || isFetching) return <Loader />




    function findAccessoryName(accessoryId, accessoryArray, field) {

        let accessoryObj = accessoryArray?.find(item => parseInt(item.id) == accessoryId)

        if (field == "accessoryItem") {
            return accessoryObj?.accessoryItem?.name
        }
        else if ("accessoryGroup") {
            return accessoryObj?.accessoryItem?.AccessoryGroup?.name
        }

    }


    // const poItem = data.data
    // let poQty = parseFloat(poItem.qty).toFixed(3)
    // let cancelQty = poItem.alreadyCancelData?._sum.qty ? poItem.alreadyCancelData._sum.qty : "0.000";
    // let alreadyInwardedQty = poItem.alreadyInwardedData?._sum?.qty ? parseFloat(poItem.alreadyInwardedData._sum.qty).toFixed(3) : "0.000";
    // let alreadyReturnedQty = poItem.alreadyReturnedData?._sum?.qty ? parseFloat(poItem.alreadyReturnedData._sum.qty).toFixed(3) : "0.000";
    // let balanceQty = substract(substract(poQty, cancelQty), substract(alreadyInwardedQty, alreadyReturnedQty)).toFixed(3)
    return (
        <tr key={item.poItemsId} className='table-row'>
            <td className='w-12 border border-gray-300 text-[11px] text-center'>{index + 1}</td>
            <td className='w-12 border border-gray-300 text-[11px]'>{item?.poNo}</td>
            <td className='w-12 border border-gray-300 text-[11px]'>{findFromList(item?.accessoryId, accessoryList?.data, "aliasName")} </td>
            <td className='py-0.5 border border-gray-300 text-[11px]'>{findAccessoryName(item?.accessoryId, accessoryList?.data, "accessoryItem")}</td>
            <td className='py-0.5 border border-gray-300 text-[11px]'>{findAccessoryName(item?.accessoryId, accessoryList?.data, "accessoryGroup")}</td>
            <td className='py-0.5 border border-gray-300 text-[11px]'>{findFromList(item?.colorId, colorList?.data, "name")} </td>
            <td className='py-0.5 border border-gray-300 text-[11px]'>{findFromList(item?.sizeId, sizeList?.data, "name")} </td>
            <td className='py-0.5 border border-gray-300 text-[11px]'>{findFromList(item?.uomId, uomList?.data, "name")} </td>
            <td className='py-0.5 border border-gray-300 text-[11px] text-left'>{item?.poQty || 0}</td>
            <td className='py-0.5 border border-gray-300 text-[11px] text-left'>{item?.cancelQty || 0}</td>
            <td className='py-0.5 border border-gray-300 text-[11px] text-left'>{item?.alreadyInwardedQty || 0}</td>
            <td className='py-0.5 border border-gray-300 text-[11px] text-left'>{item?.alreadyReturnedQty || 0}</td>
            <td className='py-0.5 border border-gray-300 text-[11px] text-left'>{item?.balanceQty || 0}</td>
 <td className='py-0.5 border border-gray-300 text-[11px] text-right'>
                    <input
                        type="number"
                        className="text-right rounded py-1  px-1 w-full table-data-input"
                        // value={sumArray(item?.lotDetails ? item?.lotDetails : [], "noOfRolls")}
                        value={item?.noOfBags ? item?.noOfBags : 0}
                        // disabled={true}
                        onChange={(event) => {
                            if (event.target.value < 0) return
                            if (!event.target.value) {
                                handleInputChange(0, index, "noOfBags");
                                return
                            }
                            handleInputChange(event.target.value, index, "noOfBags", item?.balanceQty);
                        }}
                        onKeyDown={e => {
                            if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                            if (e.key === "Delete") { handleInputChange("0", index, "noOfBags") }
                        }}
                        min={"0"}
                        onBlur={(e) => {
                            if (!e.target.value) {
                                handleInputChange(0.000, index, "noOfBags", item?.balanceQty);
                                return
                            }
                            handleInputChange(parseFloat(e.target.value).toFixed(3), index, "noOfBags", item?.balanceQty)
                        }}
                    />
                </td>   
            <td className='py-0.5 border border-gray-300 text-[11px]'>
                <input
                    onKeyDown={e => {
                        if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                        if (e.altKey) { e.preventDefault() }
                    }}
                    min={"0"}
                    type="number"
                    className="text-right rounded   w-full py-1 table-data-input"
                    autoFocus={index === 0}
                    value={item?.qty}
                    disabled={readOnly}
                    onChange={(event) => {
                        if (event.target.value < 0) return
                        if (!event.target.value) {
                            handleInputChange(0, index, "qty");
                            return
                        }
                        handleInputChange(event.target.value, index, "qty", item?.balanceQty);
                    }}

                    onBlur={(e) => {
                        if (!e.target.value) {
                            handleInputChange(0.000, index, "qty");
                            return
                        }
                        handleInputChange(parseFloat(e.target.value).toFixed(3), index, "qty", item?.balanceQty)
                    }}
                />
            </td>
            <td className='py-0.5 border border-gray-300 text-[11px] text-right'>{parseFloat(item?.price).toFixed(2)}</td>
            <td className='py-0.5 border border-gray-300 text-[11px] text-right'>{!item?.qty ? "0.000" : (parseFloat(item?.price) * parseFloat(item.qty ? item?.qty : "0.000")).toFixed(2)}</td>
            {!readOnly &&
                 <td className="py-0.5 border border-gray-300 text-[11px]">
                    <div className="flex space-x-2  justify-center">

                        <button
                            // onClick={() => handleView(index)}
                            // onMouseEnter={() => setTooltipVisible(true)}
                            // onMouseLeave={() => setTooltipVisible(false)}
                            className="text-blue-800 flex items-center  bg-blue-50 rounded"
                        >
                            👁 <span className="text-xs"></span>
                        </button>
                        <span className="tooltip-text">View</span>
                        <button
                            // onClick={() => handleEdit(index)}
                            className="text-green-600 hover:text-green-800 bg-green-50 py-1 rounded text-xs flex items-center"
                        >
                            <HiPencil className="w-4 h-4" />

                        </button>
                        <span className="tooltip-text">Edit</span>
                        <button
                            onClick={() => deleteRow(index)}
                            className="text-red-600 hover:text-red-800 bg-red-50  py-1 rounded text-xs flex items-center"
                        >
                            <HiTrash className="w-4 h-4" />

                        </button>
                        <span className="tooltip-text">Delete</span>

                        {/* {tooltipVisible && (
                            <div className="absolute  z-10 top-full right-0 mt-1 w-48 bg-indigo-800 text-white text-xs rounded p-2 shadow-lg">
                                <div className="flex items-start">
                                    <FaInfoCircle className="flex-shrink-0 mt-0.5 mr-1" />
                                    <span>View</span>
                                </div>
                                <div className="absolute -top-1 right-3 w-2.5 h-2.5 bg-indigo-800 transform rotate-45"></div>
                            </div>
                        )} */}
                    </div>
                </td>
            }
        </tr>
    )
}

export default AccessoryPoItem
