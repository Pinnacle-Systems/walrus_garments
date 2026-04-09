import React, { useEffect } from 'react'
import { useGetPoItemByIdQuery } from '../../../redux/uniformService/PoServices'
import { Loader } from '../../../Basic/components'
import { DELETE } from '../../../icons'
import { findFromList, getAllowableReturnQty, isBetweenRange, substract } from '../../../Utils/helper'
import { useGetDirectItemByIdQuery } from '../../../redux/uniformService/DirectInwardOrReturnServices'
import { HiPencil, HiTrash } from 'react-icons/hi'
import { toast } from 'react-toastify'

const AccessoryDirectItem = ({ uomList, sizeList, accessoryList,
    colorList, item, index, handleInputChange, readOnly, deleteRow, purchaseInwardId, storeId }) => {


    const { data, isLoading, isFetching } = useGetDirectItemByIdQuery({ id: item.poItemsId, purchaseInwardId, storeId: storeId }, { skip: !item.poItemsId })


    console.log(data,"data")
    
    useEffect(() => {
        if (purchaseInwardId) return
        if (isLoading || isFetching) return
        const poItem = data?.data

        if (data?.data) {

            handleInputChange(poItem?.accessoryId, index, "accessoryId", 0, poItem);

        }
    }, [isFetching, isLoading, data, purchaseInwardId])


    function findAccessoryName(accessoryId, accessoryArray, field) {

        let accessoryObj = accessoryArray?.find(item => parseInt(item.id) == accessoryId)

        if (field == "accessoryItem") {
            return accessoryObj?.accessoryItem?.name
        }
        else if ("accessoryGroup") {
            return accessoryObj?.accessoryItem?.AccessoryGroup?.name
        }

    }

    // if (isLoading || isFetching) return <Loader />

    return (
        <tr key={item.poItemsId} className='border border-blue-gray-200 cursor-pointer'>
            <td className='w-12 border border-gray-300 text-[11px]  text-center p-0.5'>{index + 1}</td>
            <td className='w-12 border border-gray-300 text-[11px]  text-center p-0.5'>{item?.poNo}</td>

            <td className='w-12 border border-gray-300 text-[11px]  text-center p-0.5'>{findFromList(item.accessoryId, accessoryList?.data, "aliasName")} </td>
            <td className='w-12 border border-gray-300 text-[11px]  text-center p-0.5'>{findAccessoryName(item.accessoryId, accessoryList?.data, "accessoryItem")}</td>
            <td className='w-12 border border-gray-300 text-[11px]  text-center p-0.5'>{findAccessoryName(item.accessoryId, accessoryList?.data, "accessoryGroup")}</td>
            <td className='w-12 border border-gray-300 text-[11px]  text-center p-0.5'>{findFromList(item.colorId, colorList?.data, "name")} </td>
            <td className='w-12 border border-gray-300 text-[11px]  text-center p-0.5'>{findFromList(item.sizeId, sizeList?.data, "name")} </td>
            <td className='w-12 border border-gray-300 text-[11px]  text-center p-0.5'>{findFromList(item.uomId, uomList?.data, "name")} </td>
            {/* <td className='w-12 border border-gray-300 text-[11px]  text-right p-0.5'>{item?.stockQty || 0}</td> */}
            {/* <td className='w-12 border border-gray-300 text-[11px]  text-center p-0.5'>{item?.allowedReturnQty || 0}</td>
            <td className='w-12 border border-gray-300 text-[11px]  text-center p-0.5'>{item?.alreadyReturnedQty || 0}</td> */}
            <td className='w-12 border border-gray-300 text-[11px]  text-right p-0.5'>{item?.allowedReturnQty || 0}</td>
            <td className='py-0.5 border border-gray-300 text-[11px]'>
                                <input
                                    type="number"
                                    onKeyDown={e => { if (e.key === "Delete") { handleInputChange("0.000", index, "returnQty") } }}
                                    onFocus={(e) => e.target.select()}
                                    className="text-right rounded py-1 w-full px-1 tx-table-input"
                                    value={(!item.returnQty) ? 0 : item.returnQty}
                                    disabled={readOnly}
                                    onChange={(event) => {
                                        if (!event.target.value) {
                                            handleInputChange(0, index, "returnQty");
                                            return
                                        }
                                        if (isBetweenRange(0, getAllowableReturnQty(item.alreadyInwardedQty, item.alreadyReturnedQty, item.stockQty), event.target.value)) {
                                            handleInputChange(event.target.value.replace(/^0+/, ''), index, "returnQty")
                                        } else {
                                            toast.info("Return Qty Cannot be more than allowable Qty", { position: 'top-center' })
                                        }
                                    }}
                                    onBlur={(e) => {
                                        if (!e.target.value) {
                                            handleInputChange(0.000, index, "returnQty");
                                            return
                                        }
                                        handleInputChange(parseFloat(e.target.value).toFixed(3), index, "returnQty")
                                    }
        
                                    }
                                />
                                <div className='text-center'>
                                </div>
                                                </td>
            <td className='w-12 border border-gray-300 text-[11px]  text-right p-0.5'>{parseFloat(item?.price).toFixed(2) || 0 }</td>
            <td className='w-12 border border-gray-300 text-[11px]  text-right p-0.5'>{!item.qty ? "0.000" : (parseFloat(item?.price) * parseFloat(item.qty ? item.qty : "0.000")).toFixed(2) ||  0}</td>
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

export default AccessoryDirectItem
