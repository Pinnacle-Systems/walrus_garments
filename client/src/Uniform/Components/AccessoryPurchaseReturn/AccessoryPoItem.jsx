import React, { useEffect } from 'react'
import { useGetPoItemByIdQuery } from '../../../redux/uniformService/PoServices'
import { Loader } from '../../../Basic/components'
import { DELETE } from '../../../icons'
import { findFromList, getAllowableReturnQty, isBetweenRange, substract } from '../../../Utils/helper'
import { HiPencil, HiTrash } from 'react-icons/hi'
import { toast } from 'react-toastify'
import { useGetAccessoryPoItemByIdQuery } from '../../../redux/uniformService/AccessoryPoServices'
import Swal from 'sweetalert2'

const AccessoryPoItem = ({ storeId, uomList, sizeList, accessoryList, colorList, item, index, handleInputChange, readOnly, deleteRow, purchaseInwardId, handleRightClick, poInwardOrDirectInward }) => {


    const { data, isLoading, isFetching } = useGetAccessoryPoItemByIdQuery({ id: item.accessoryPoItemsId, purchaseInwardId, storeId: storeId, poType: "Accessory", poInwardOrDirectInward }, { skip: !item.accessoryPoItemsId })

    console.log(index, "index")

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

    const balanceQty = parseFloat(item?.alreadyInwardedQty || 0) - parseFloat(item?.alreadyReturnedQty || 0);


    // if (isLoading || isFetching) return <Loader />

    return (

        <tr key={item.poItemsId} className='border border-blue-gray-200 cursor-pointer'>
            <td className='w-12 border border-gray-300 text-[11px]  text-center p-0.5'>{index + 1}</td>
            <td className='w-12 border border-gray-300 text-[11px]  text-center p-0.5'>{item?.poNo}</td>

            <td className='w-32 border border-gray-300 text-[11px]  text-center p-0.5'>{findFromList(item.accessoryId, accessoryList?.data, "aliasName")} </td>
            <td className='w-52 border border-gray-300 text-[11px]  text-center p-0.5'>{findAccessoryName(item.accessoryId, accessoryList?.data, "accessoryItem")}</td>
            <td className='w-40 border border-gray-300 text-[11px]  text-center p-0.5'>{findAccessoryName(item.accessoryId, accessoryList?.data, "accessoryGroup")}</td>
            <td className='w-16 border border-gray-300 text-[11px]  text-center p-0.5'>{findFromList(item.colorId, colorList?.data, "name")} </td>
            <td className='w-16 border border-gray-300 text-[11px]  text-center p-0.5'>{findFromList(item.sizeId, sizeList?.data, "name")} </td>
            <td className='w-16 border border-gray-300 text-[11px]  text-center p-0.5'>{findFromList(item.uomId, uomList?.data, "name")} </td>
            <td className='w-16 border border-gray-300 text-[11px]  text-right p-0.5'>{parseFloat(item?.poQty || 0).toFixed(3)}</td>
            <td className='w-16 border border-gray-300 text-[11px]  text-right p-0.5'>{parseFloat(balanceQty|| 0).toFixed(3)}</td>

            <td className='py-0.5 border border-gray-300 text-[11px]'>
                <input
                    type="number"
                    onKeyDown={e => { if (e.key === "Delete") { handleInputChange("0.000", index, "returnQty") } }}
                    onFocus={(e) => e.target.select()}
                    className="text-right rounded py-1 w-full px-1 table-data-input"
                    value={(!item.qty) ? 0 : item.qty}
                    disabled={readOnly}
                    onChange={(event) => {
                        if (!event.target.value) {
                            handleInputChange(0, index, "returnQty");
                            return
                        }

                        const inputValue = event.target.value.replace(/^0+/, ''); // remove leading zeros
                        const enteredQty = parseFloat(inputValue || 0);
                        const balanceQty = parseFloat(item?.alreadyInwardedQty || 0) - parseFloat(item?.alreadyReturnedQty || 0);

                        if (enteredQty > balanceQty) {
                            Swal.fire({
                                icon: 'warning',
                                title: 'Return Qty cannot be more than Balance Qty',
                                showConfirmButton: false,
                                timer: 2000
                            });
                            handleInputChange(balanceQty.toString(), index, "qty"); // reset to max allowed
                        } else {
                            handleInputChange(inputValue, index, "qty");
                        }

                    }}
                    onBlur={(e) => {
                        if (!e.target.value) {
                            handleInputChange(0.000, index, "qty");
                            return
                        }
                        handleInputChange(parseFloat(e.target.value).toFixed(3), index, "qty")
                    }

                    }
                />
                <div className='text-center'>
                </div>
            </td>
            <td className='w-12 border border-gray-300 text-[11px]  text-right p-0.5'>{parseFloat(item?.price).toFixed(3)}</td>
            <td className='w-12 border border-gray-300 text-[11px]  text-right p-0.5'>{!item.qty ? "0.000" : (parseFloat(item?.price) * parseFloat(item.qty ? item.qty : "0.000")).toFixed(3)}</td>
            <td className="py-0.5 border border-gray-300 text-[11px]">
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
