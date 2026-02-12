import React, { useEffect } from 'react'
import { useGetPoItemByIdQuery } from '../../../redux/uniformService/PoServices'
import { Loader } from '../../../Basic/components'
import { DELETE } from '../../../icons'
import { substract } from '../../../Utils/helper'
import { toast } from "react-toastify"
import { HiPencil, HiTrash } from 'react-icons/hi'
import Swal from 'sweetalert2'
import { cancelTypes } from '../../../Utils/DropdownData'

const YarnPoItem = ({ poItemId, index, handleInputChange, readOnly, qty, cancelType, deleteRow, removeItem, purchaseInwardId, handleRightClick }) => {



    const { data, isLoading, isFetching } = useGetPoItemByIdQuery({ id: poItemId, purchaseInwardId }, { skip: !poItemId })

    const poItem = data?.data



    let poQty = poItem?.qty  ?  parseFloat(poItem?.qty).toFixed(3)  :  "0.000"
    let poBags = parseFloat(poItem?.noOfBags).toFixed(3)
    let alreadyCancelQty = poItem?.alreadyCancelData?._sum.qty ? poItem?.alreadyCancelData?._sum.qty : "0.000";
    let alreadyInwardedQty = poItemId ? poItem?.alreadyInwardedQty : poItem?.alreadyInwardedData?._sum?.qty ? parseFloat(poItem.alreadyInwardedData._sum.qty).toFixed(3) : "0.000";

    let alreadyReturnedQty = poItem?.alreadyReturnedData?._sum?.qty ? parseFloat(poItem.alreadyReturnedData._sum.qty).toFixed(3) : "0.000";
    let alreadyCancelBags = poItem?.alreadyCancelData?._sum.noOfBags ? poItem.alreadyCancelData._sum.noOfBags : "0.000";
    let alreadyInwardedBags = poItem?.alreadyInwardedData?._sum?.noOfBags ? poItem.alreadyInwardedData._sum.noOfBags : "0.000";

    let alreadyReturnedBags = poItem?.alreadyReturnedData?._sum?.noOfBags ? parseFloat(poItem.alreadyReturnedData._sum.noOfBags).toFixed(3) : "0.000";
    let balanceQty = substract(substract(poQty, alreadyCancelQty), alreadyInwardedQty)
    let balanceBags = substract(substract(poBags, alreadyCancelBags), alreadyInwardedBags)


    useEffect(() => {
        if (purchaseInwardId) return
        if (isLoading || isFetching) return
        if (data?.data) {
            handleInputChange(parseFloat(data.data.weightPerBag).toFixed(3), index, "weightPerBag", 0, poItem)
        }
    }, [isFetching, isLoading, data, purchaseInwardId])


    if (isLoading || isFetching) return <Loader />

    return (
        <tr key={poItemId} className="border border-blue-gray-200 cursor-pointer "  
               onContextMenu={(e) => {
                        if (!readOnly) {
                            handleRightClick(e, index, "shiftTimeHrs");
                        }
                    }}
        >
            <td className="w-12 border border-gray-300 text-[11px]  text-center p-0.5 ">{index + 1}</td>
            <td className="py-0.5 border border-gray-300 text-[11px] ">{poItem?.Po?.docId}</td>
            <td className="py-0.5 border border-gray-300 text-[11px]">{poItem?.Yarn?.name}</td>
            <td className="py-0.5 border border-gray-300 text-[11px]">{poItem?.Color?.name}</td>
            <td className="py-0.5 border border-gray-300 text-[11px]">{poItem?.Uom?.name}</td>
            <td className="py-0.5 border border-gray-300 text-[11px] text-right">{parseFloat(poQty).toFixed(3)}</td>
            <td className='py-0.5 border border-gray-300 text-[11px] text-right'>{parseFloat(alreadyInwardedQty).toFixed(3)}</td>
            <td className="py-0.5 border border-gray-300 text-[11px] text-right">{parseFloat(alreadyCancelQty).toFixed(3)}</td>

            <td className="py-0.5 border border-gray-300 text-[11px] text-right">{parseFloat(alreadyReturnedQty).toFixed(3)}</td>

            <td className="py-0.5 border border-gray-300 text-[11px] text-right">{parseFloat(balanceQty).toFixed(3)}</td>

            {/* <td className=" border border-gray-300 text-right text-[11px] py-1.5 px-2 text-xs">
                <input
                    className=" rounded px-1 ml-2 w-full py-0.5 text-xs focus:outline-none text-right"
                    type="number"
                    value={row?.noOfBags}
                    onFocus={e => e.target.select()}
                    placeHolder="0.000"
                    disabled={readOnly || !transType || !row?.yarnId}
                    onChange={(e) => {
                        const balanceQty = Math.max(0, (parseFloat(row?.requiredQty) || 0) - (parseFloat(row?.alreadyPoqty) || 0));

                        handleInputChange(e.target.value, index, "noOfBags", row.requiredQty, balanceQty, row.weightPerBag);
                    }}
                    onBlur={(e) => {
                        const val = e.target.value;
                        const formatted = e.target.value === "" ? "" : parseFloat(e.target.value).toFixed(3);
                        const balanceQty = Math.max(0, (parseFloat(row?.requiredQty) || 0) - (parseFloat(row?.alreadyPoqty) || 0));

                        e.target.value = formatted;
                        handleInputChange(val === "" ? 0 : formatted, index, "noOfBags", row.requiredQty, balanceQty, row.weightPerBag);
                    }}


                />
            </td>*/}

            <td className=" border border-gray-300  text-[11px] py-0.5 text-xs td-outline-focus">
                <select
                    onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "uomId") } }}
                    disabled={readOnly || !poItem?.id} className='text-left w-full rounded py-1 text-xs' value={cancelType} onChange={(e) => handleInputChange(e.target.value, index, "cancelType")}
                    onBlur={(e) => {
                        handleInputChange((e.target.value), index, "cancelType")
                    }
                    }
                >

                    <option >
                    </option>
                    <option value="" >
                        Select
                    </option>
                    {cancelTypes?.map((option, index) => (
                        <option key={index} value={option.value}>
                            {option.show}
                        </option>
                    ))}
                </select>
            </td>

            <td className="w-28 py-0.5 border border-gray-300 text-[11px] td-outline-focus">
                <input
                    min={"0"}
                    type="number"
                    className="text-right rounded py-1 w-full "
                    value={qty}
                    disabled={readOnly || !poItem?.id}
                    onKeyDown={(e) => {
                        if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                        // if (e.altKey) { e.preventDefault() }
                        // let value = e.target.value
                        // if (e.key === "altKey") {
                        //     let qty = parseInt(noOfBags) * parseFloat(weightPerBag)
                        //     let excessQty = parseInt(noOfBags) * 2
                        //     if ((substract(qty, excessQty)) > parseFloat(value)) {
                        //         toast.info("Deficient Qty Cannot be Less than 2kg Per Bag", { position: 'top-center' })
                        //         e.preventDefault()
                        //         return
                        //     }
                        // }
                    }}
                    onFocus={(e) => e.target.select()}
                    onChange={(event) => {
                        if (event.target.value < 0) return
                        if (!event.target.value) {
                            handleInputChange(0, index, "qty", balanceQty);
                            return
                        }

                        else {

                            handleInputChange(event.target.value, index, "qty", balanceQty);
                        }

                    }}
                    // onBlur={(e) => {
                    //     if (!e.target.value) {
                    //         handleInputChange(0.000, index, "qty", balanceQty);
                    //         return
                    //     }
                    //     // let value = e.target.value
                    //     // let qty = parseInt(noOfBags) * parseFloat(weightPerBag)
                    //     // let excessQty = parseInt(noOfBags) * 2
                    //     // if ((substract(qty, excessQty)) > parseFloat(value)) {
                    //     //     toast.info("Deficient Qty Cannot be Less than 2kg Per Bag", { position: 'top-center' })
                    //     //     e.target.focus()
                    //     //     return
                    //     // }
                    //     handleInputChange(parseFloat(e.target.value).toFixed(3), index, "qty", balanceQty)
                    // }}
                    onBlur={(e) => {
                        const formatted =
                            e.target.value === "" ? "" : parseFloat(e.target.value).toFixed(3);
                        e.target.value = formatted;
                        handleInputChange(formatted, index, "qty", balanceQty);
                    }}
                    placeHolder="0.000"
                />
            </td>

            {/* <td className="w-16 px-1 py-0.5 text-center td-outline-focus">
    
                <input
                    readOnly
                    className="w-full bg-transparent focus:outline-none focus:border-transparent text-right pr-2"
                    // onKeyDown={(e) => {
                    //     if (e.key === "Enter") {
                    //         e.preventDefault();
                    //         addNewRow();
                    //     }
                    // }}
                    onContextMenu={(e) => {
                        if (!readOnly) {
                            handleRightClick(e, index, "shiftTimeHrs");
                        }
                    }}
                />
            </td> */}

        </tr>
    )
}

export default YarnPoItem
