import React, { useEffect } from 'react'
import { useGetPoItemByIdQuery } from '../../../redux/uniformService/PoServices'
import { Loader } from '../../../Basic/components'
import { DELETE } from '../../../icons'
import { findFromList, substract } from '../../../Utils/helper'
import { HiPencil, HiTrash } from 'react-icons/hi'
import { useGetAccessoryPoItemByIdQuery } from '../../../redux/uniformService/AccessoryPoServices'
import { cancelTypes } from '../../../Utils/DropdownData'

const AccessoryPoItem = ({ uomList, sizeList, accessoryList, colorList, item, poItemId, index, handleInputChange, readOnly, purchaseInwardId, deleteRow, handleRightClick  ,poInwardOrDirectInward}) => {



    const { data, isLoading, isFetching } = useGetAccessoryPoItemByIdQuery({ id: poItemId, purchaseInwardId  ,poInwardOrDirectInward}, { skip: !poItemId })


console.log({item},"itemitem")

    function findAccessoryName(accessoryId, accessoryArray, field) {

        let accessoryObj = accessoryArray?.find(item => parseInt(item.id) == accessoryId)

        console.log(accessoryList, "accessoryList")
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
        <tr key={poItemId}>
            <td className='py-0.5 px-1 border border-gray-300 text-[11px] text-center'>{index + 1}</td>
            <td className='py-0.5  px-1 border border-gray-300 text-[11px]'>{item?.poNo}</td>
            <td className='py-0.5 px-1  border border-gray-300 text-[11px]'>{findFromList(item.accessoryId, accessoryList?.data, "aliasName")} </td>
            {/* <td className='py-0.5 px-1  border border-gray-300 text-[11px]'>{findAccessoryName(item.accessoryId, accessoryList?.data, "accessoryItem")}</td>
            <td className='py-0.5 px-1  border border-gray-300 text-[11px]'>{findAccessoryName(item.accessoryId, accessoryList?.data, "accessoryGroup")}</td> */}
            <td className='py-0.5 px-1 border border-gray-300 text-[11px]'>{findFromList(item.colorId, colorList?.data, "name")} </td>
            <td className='py-0.5 px-1 border border-gray-300 text-[11px]'>{findFromList(item.sizeId, sizeList?.data, "name")} </td>
            <td className='py-0.5 px-1 border border-gray-300 text-[11px]'>{findFromList(item.uomId, uomList?.data, "name")} </td>

            <td className='py-0.5 px-1 border border-gray-300 text-[11px] text-right'>{parseFloat(item?.poQty || 0).toFixed(3)}</td>

            {/* <td className='py-0.5 border border-gray-300 text-[11px] text-right'>{parseFloat(item?.alreadyCancelQty ? item?.alreadyCancelQty : item?.cancelQty ? item?.cancelQty : 0).toFixed(3)}</td>
            <td className='py-0.5 border border-gray-300 text-[11px] text-right'>{parseFloat(item?.alreadyInwardedQty || 0).toFixed(3)}</td>
            <td className='py-0.5 border border-gray-300 text-[11px] text-right'>{parseFloat(item?.alreadyReturnedQty || 0).toFixed(3)}</td> */}
            <td className='py-0.5 px-1  border border-gray-300 text-[11px] text-right'>{parseFloat(item?.balanceQty || 0).toFixed(3)}</td>

            <td className='py-0.5 px-1 border border-gray-300 text-[11px]'>
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
                    onFocus={(e) => e.target.select()}
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
            <td className="border border-gray-300 text-right font-medium text-[13px] py-1.5 text-xs">
                <select
                    onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "uomId") } }}
                    disabled={readOnly || !item.accessoryId} className='text-left w-full rounded py-1 text-[11px]  text-xs' value={item.cancelType} onChange={(e) => handleInputChange(e.target.value, index, "cancelType")}
                    onBlur={(e) => {
                        handleInputChange((e.target.value), index, "cancelType")
                    }
                    }
                    
                >

                    <option hidden>   </option>
                    <option value="" className='font-medium text-[13px] text-xs'>Select</option>
                   
                    {cancelTypes?.map((option, index) => (
                        <option key={index} value={option.value} className='font-medium text-[13px] text-xs'>
                           <span className=' text-xs'> {option.show}</span> 
                        </option>
                    ))}
                </select>
            </td>
            <td className='py-0.5 px-0.5 border border-gray-300 text-[11px] text-right'>{parseFloat(item?.price).toFixed(3)}</td>

            <td className='py-0.5 px-0.5 border border-gray-300 text-[11px] text-right'>{parseFloat((item?.price || 0) * parseFloat(item?.qty || 0)).toFixed(3)}</td>

            <td className="py-0.5 px-0.5 border border-gray-300 text-[11px]">
                <input
                    readOnly
                    className="w-full bg-transparent focus:outline-none focus:border-transparent text-right pr-2"
                 
                    onContextMenu={(e) => {
                        if (!readOnly) {
                            handleRightClick(e, index, "shiftTimeHrs");
                        }
                    }}
                />
            </td>




        </tr>
    )
}

export default AccessoryPoItem
