import React, { useEffect } from 'react'
import { useGetPoItemByIdQuery } from '../../../redux/uniformService/PoServices'
import { Loader } from '../../../Basic/components'
import { DELETE } from '../../../icons'
import { findFromList, substract } from '../../../Utils/helper'
import { HiPencil, HiTrash } from 'react-icons/hi'
import { useGetAccessoryPoItemByIdQuery } from '../../../redux/uniformService/AccessoryPoServices'

const AccessoryPoItem = ({ uomList, sizeList, accessoryList, colorList, item, poItemId, index, handleInputChange, readOnly, qty, deleteRow, purchaseInwardId }) => {



    // const { data, isLoading, isFetching } = useGetAccessoryPoItemByIdQuery({ id: poItemId, purchaseInwardId }, { skip: !poItemId })




    function findAccessoryName(accessoryId, accessoryArray, field) {

        let accessoryObj = accessoryArray?.find(item => parseInt(item.id) == accessoryId)

        console.log(accessoryList,"accessoryList")
        if (field == "accessoryItem") {
            return accessoryObj?.accessoryItem?.name
        }
        else if ("accessoryGroup") {
            return accessoryObj?.accessoryItem?.AccessoryGroup?.name
        }

    }

    // useEffect(() => {
    //     if (purchaseInwardId) return
    //     if (isLoading || isFetching) return
    //     const poItem = data?.data

    //     if (data?.data) {
    //         handleInputChange(poItem?.accessoryId, index, "accessoryId", 0, poItem);


    //     }
    // }, [isFetching, isLoading, data, purchaseInwardId])

    // if (isLoading || isFetching) return <Loader />

    return (
        <tr key={poItemId}>
            <td className='py-0.5 border border-gray-300 text-[11px]'>{index + 1}</td>
            <td className='py-0.5 border border-gray-300 text-[11px]'>{item?.poNo}</td>
            <td className='py-0.5 border border-gray-300 text-[11px]'>{findFromList(item.accessoryId, accessoryList?.data, "aliasName")} </td>
            <td className='py-0.5 border border-gray-300 text-[11px]'>{findAccessoryName(item.accessoryId, accessoryList?.data, "accessoryItem")}</td>
            <td className='py-0.5 border border-gray-300 text-[11px]'>{findAccessoryName(item.accessoryId, accessoryList?.data, "accessoryGroup")}</td>
            <td className='py-0.5 border border-gray-300 text-[11px]'>{findFromList(item.colorId, colorList?.data, "name")} </td>
            <td className='py-0.5 border border-gray-300 text-[11px]'>{findFromList(item.sizeId, sizeList?.data, "name")} </td>
            <td className='py-0.5 border border-gray-300 text-[11px]'>{findFromList(item.uomId, uomList?.data, "name")} </td>{console.log(item.uomId, "uom", uomList)}

            <td className='py-0.5 border border-gray-300 text-[11px] text-right'>{item?.poQty || 0}</td>

            <td className='py-0.5 border border-gray-300 text-[11px] text-right'>{(item?.alreadyCancelQty ? item?.alreadyCancelQty : item?.cancelQty ? item?.cancelQty : 0)}</td>
            <td className='py-0.5 border border-gray-300 text-[11px] text-right'>{item?.alreadyInwardedQty || 0}</td>
            <td className='py-0.5 border border-gray-300 text-[11px] text-right'>{item?.alreadyReturnedQty || 0}</td>
            <td className='py-0.5 border border-gray-300 text-[11px] text-right'>{item?.balanceQty}</td>

            <td className='py-0.5 border border-gray-300 text-[11px]'>
                <input
                    onKeyDown={e => {
                        if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                        if (e.altKey) { e.preventDefault() }
                    }}
                    min={"0"}
                    type="number"
                    className="text-right rounded   w-full py-1 table-data-input"
                    value={item?.qty}
                    disabled={readOnly}
                    onChange={(event) => {
                        if (event.target.value < 0) return
                        if (!event.target.value) {
                            handleInputChange(0, index, "qty", item?.balanceQty);
                            return
                        }
                        handleInputChange(event.target.value, index, "qty", item?.balanceQty);
                    }}
                    onBlur={(e) => {
                        if (!e.target.value) {
                            handleInputChange(0.000, index, "qty", item?.balanceQty);
                            return
                        }
                        handleInputChange(parseFloat(e.target.value).toFixed(3), index, "qty", item?.balanceQty)
                    }}
                />
            </td>
            <td className='py-0.5 border border-gray-300 text-[11px] text-right'>{item?.price}</td>



            <td className='py-0.5 border border-gray-300 text-[11px] text-right'>{parseFloat(item?.price) * parseFloat(item?.qty).toFixed(3) || "0.000"}</td>

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
        </tr>
    )
}

export default AccessoryPoItem
