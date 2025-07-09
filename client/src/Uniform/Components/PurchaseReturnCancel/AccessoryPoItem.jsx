import React, { useEffect } from 'react'
import { useGetPoItemByIdQuery } from '../../../redux/uniformService/PoServices'
import { Loader } from '../../../Basic/components'
import { DELETE } from '../../../icons'
import { findFromList, getAllowableReturnQty, isBetweenRange, substract } from '../../../Utils/helper'
import { HiPencil, HiTrash } from 'react-icons/hi'
import { toast } from 'react-toastify'

const AccessoryPoItem = ({ storeId, uomList, sizeList, accessoryList, colorList, item, index, handleInputChange, readOnly, deleteRow, purchaseInwardId }) => {


    const { data, isLoading, isFetching } = useGetPoItemByIdQuery({ id: item.poItemsId, purchaseInwardId, storeId: storeId, poType: "Accessory" }, { skip: !item.poItemsId })

console.log(index,"index")

    function findAccessoryName(accessoryId, accessoryArray, field) {

        let accessoryObj = accessoryArray?.find(item => parseInt(item.id) == accessoryId)

        if (field == "accessoryItem") {
            return accessoryObj?.accessoryItem?.name
        }
        else if ("accessoryGroup") {
            return accessoryObj?.accessoryItem?.AccessoryGroup?.name
        }

    }
    
    useEffect(() => {
        if (purchaseInwardId) return
        if (isLoading || isFetching) return
        const poItem = data?.data

        if (data?.data) {
            handleInputChange(poItem?.accessoryId, index, "accessoryId", 0, poItem);


        }
    }, [isFetching, isLoading, data, purchaseInwardId])

    // if (isLoading || isFetching) return <Loader />

    return (
        // <tr key={item.poItemsId} className='table-row'>
        //     <td className='text-left   table-data'>{index + 1}</td>
        //     <td className='text-left px-1 table-data'>{item?.poNo}</td>
        //     <td className='text-left px-1 table-data'>{findFromList(item.accessoryId, accessoryList?.data, "aliasName")} </td>
        //     <td className='text-left   table-data'>{findAccessoryName(item.accessoryId, accessoryList?.data, "accessoryItem")}</td>
        //     <td className='text-left   table-data'>{findAccessoryName(item.accessoryId, accessoryList?.data, "accessoryGroup")}</td>
        //     <td className='text-left px-1 table-data'>{findFromList(item.colorId, colorList?.data, "name")} </td>
        //     <td className='text-left px-1 table-data'>{findFromList(item.sizeId, sizeList?.data, "name")} </td>
        //     <td className='text-left px-1 table-data'>{findFromList(item.uomId, uomList?.data, "name")} </td>
        //     <td className='text-right px-1  table-data'>{item?.poQty || 0}</td>
        //     <td className='text-right px-1  table-data'>{item?.cancelQty || 0}</td>
        //     <td className='text-right px-1  table-data'>{item?.alreadyInwardedQty || 0}</td>
        //     <td className='text-right px-1  table-data'>{item?.alreadyReturnedQty || 0}</td>
        //     <td className='text-right px-1  table-data'>{item?.allowedReturnQty || item?.balanceQty}</td>
        //     <td className='   table-data text-right'>
        //         <input
        //             onKeyDown={e => {
        //                 if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
        //                 if (e.altKey) { e.preventDefault() }
        //             }}
        //             min={"0"}
        //             type="number"
        //             className="text-right rounded   w-full py-1 table-data-input"
        //             autoFocus={index === 0}
        //             value={item.qty}
        //             disabled={readOnly}
        //             onChange={(event) => {
        //                 if (event.target.value < 0) return
        //                 if (!event.target.value) {
        //                     handleInputChange(0, index, "qty");
        //                     return
        //                 }
        //                 handleInputChange(event.target.value, index, "qty", item?.allowedReturnQty);
        //             }}

        //             onBlur={(e) => {
        //                 if (!e.target.value) {
        //                     handleInputChange(0.000, index, "qty");
        //                     return
        //                 }
        //                 handleInputChange(parseFloat(e.target.value).toFixed(3), index, "qty", item?.allowedReturnQty)
        //             }}
        //         />
        //     </td>
        //     <td className='text-right  w-12 table-data'>{parseFloat(item?.price).toFixed(2)}</td>
        //     <td className='text-right   table-data'>{!item.qty ? "0.000" : (parseFloat(item?.price) * parseFloat(item.qty ? item.qty : "0.000")).toFixed(2)}</td>
        //     {!readOnly &&
        //         <td className='table-data w-12'>
        //             <div tabIndex={-1} onClick={() => removeItem(item.poItemsId)} className='flex justify-center px-2 py-1.5 items-center cursor-pointer bg-gray-300'>
        //                 {DELETE}
        //             </div>
        //         </td>
        //     }
        // </tr>
          <tr key={item.poItemsId} className='border border-blue-gray-200 cursor-pointer'>
                     <td className='w-12 border border-gray-300 text-[11px]  text-center p-0.5'>{index + 1}</td>
                     <td className='w-12 border border-gray-300 text-[11px]  text-center p-0.5'>{item?.poNo}</td>
         
                     <td className='w-32 border border-gray-300 text-[11px]  text-center p-0.5'>{findFromList(item.accessoryId, accessoryList?.data, "aliasName")} </td>
                     <td className='w-52 border border-gray-300 text-[11px]  text-center p-0.5'>{findAccessoryName(item.accessoryId, accessoryList?.data, "accessoryItem")}</td>
                     <td className='w-40 border border-gray-300 text-[11px]  text-center p-0.5'>{findAccessoryName(item.accessoryId, accessoryList?.data, "accessoryGroup")}</td>
                     <td className='w-16 border border-gray-300 text-[11px]  text-center p-0.5'>{findFromList(item.colorId, colorList?.data, "name")} </td>
                     <td className='w-16 border border-gray-300 text-[11px]  text-center p-0.5'>{findFromList(item.sizeId, sizeList?.data, "name")} </td>
                     <td className='w-16 border border-gray-300 text-[11px]  text-center p-0.5'>{findFromList(item.uomId, uomList?.data, "name")} </td>
                     <td className='w-16 border border-gray-300 text-[11px]  text-center p-0.5'>{item?.poQty || 0}</td>
                     <td className='w-16 border border-gray-300 text-[11px]  text-center p-0.5'>{item?.allowedReturnQty || 0}</td>
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
                                
                <td className='py-0.5 border border-gray-300 text-[11px] text-right'>
                            <input
                                type="number"
                                onKeyDown={e => { if (e.key === "Delete") { handleInputChange("0.000", index, "weightPerBag") } }}
                                onFocus={(e) => e.target.select()}
                                className="text-right rounded py-1 w-full px-1 table-data-input"
                                value={(!item.weightPerBag) ? 0 : item.weightPerBag}
                                disabled={readOnly}
                                inputMode='decimal'
                                onChange={(e) => {
                                    if (!e.target.value) {
                                        handleInputChange(0, index, "weightPerBag");
                                        return
                                    }
                                    let tempReturnQty = parseFloat(item?.noOfBags ? item.noOfBags : 0) * parseFloat(e.target.value)
                                    if (isBetweenRange(0, getAllowableReturnQty(item.alreadyInwardedQty, item.alreadyReturnedQty, item.stockQty), tempReturnQty)) {
                                        handleInputChange(e.target.value.replace(/^0+/, ''), index, "weightPerBag")
                                    } else {
                                        toast.info("Return Qty Cannot be more than allowable Qty", { position: 'top-center' })
                                    }
                                }
                                }
                                onBlur={(e) =>
                                    handleInputChange(parseFloat(e.target.value).toFixed(3), index, "weightPerBag")
                                }
                            />
                        </td>              
                       <td className='py-0.5 border border-gray-300 text-[11px]'>
                                     <input
                                         type="number"
                                         onKeyDown={e => { if (e.key === "Delete") { handleInputChange("0.000", index, "returnQty") } }}
                                         onFocus={(e) => e.target.select()}
                                         className="text-right rounded py-1 w-full px-1 table-data-input"
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
                     <td className='w-12 border border-gray-300 text-[11px]  text-center p-0.5'>{parseFloat(item?.price).toFixed(2)}</td>
                     <td className='w-12 border border-gray-300 text-[11px]  text-center p-0.5'>{!item.qty ? "0.000" : (parseFloat(item?.price) * parseFloat(item.qty ? item.qty : "0.000")).toFixed(2)}</td>
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
