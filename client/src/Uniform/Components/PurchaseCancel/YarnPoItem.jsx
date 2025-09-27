import React, { useEffect } from 'react'
import { useGetPoItemByIdQuery } from '../../../redux/uniformService/PoServices'
import { Loader } from '../../../Basic/components'
import { DELETE } from '../../../icons'
import { substract } from '../../../Utils/helper'
import { toast } from "react-toastify"
import { HiPencil, HiTrash } from 'react-icons/hi'
import Swal from 'sweetalert2'

const YarnPoItem = ({ poItemId, index, handleInputChange, readOnly, qty, deleteRow, removeItem, purchaseInwardId, weightPerBag }) => {



    const { data, isLoading, isFetching } = useGetPoItemByIdQuery({ id: poItemId, purchaseInwardId }, { skip: !poItemId })

    const poItem = data?.data




    let poQty = parseFloat(poItem?.qty).toFixed(3)
    let poBags = parseFloat(poItem?.noOfBags).toFixed(3)
    let alreadyCancelQty = poItem?.alreadyCancelData?._sum.qty ? poItem.alreadyCancelData._sum.qty : "0.000";
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
        <tr key={poItemId} className="border border-blue-gray-200 cursor-pointer "  >
            <td className="w-12 border border-gray-300 text-[11px]  text-center p-0.5 ">{index + 1}</td>
            <td className="py-0.5 border border-gray-300 text-[11px] ">{poItem?.Po?.docId}</td>
            <td className="py-0.5 border border-gray-300 text-[11px]">{poItem?.Yarn?.name}</td>
            <td className="py-0.5 border border-gray-300 text-[11px]">{poItem?.Color?.name}</td>
            <td className="py-0.5 border border-gray-300 text-[11px]">{poItem?.Uom?.name}</td>
            <td className="py-0.5 border border-gray-300 text-[11px] text-right">{poQty}</td>
            <td className='py-0.5 border border-gray-300 text-[11px] text-right'>{alreadyInwardedQty}</td>
            <td className="py-0.5 border border-gray-300 text-[11px] text-right">{alreadyCancelQty}</td>

            <td className="py-0.5 border border-gray-300 text-[11px] text-right">{(alreadyReturnedQty)}</td>

            <td className="py-0.5 border border-gray-300 text-[11px] text-right">{parseInt(balanceQty).toFixed(3)}</td>


            <td className="py-0.5 border border-gray-300 text-[11px]">
                <input
                    min={"0"}
                    type="number"
                    className="text-right rounded py-1 w-full table-data-input"
                    value={qty}
                    disabled={readOnly}
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
                        // if (!event.target.value) {
                        //     handleInputChange(0, index, "qty", balanceQty);
                        //     return
                        // }
              
                        else{

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

            <td className="w-16 px-1 py-1 text-center">
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
            {/* {!readOnly &&
                <td className='table-data w-12'>
                    <div tabIndex={-1} onClick={() => removeItem(poItemId)} className='flex justify-center px-2 py-1.5 items-center cursor-pointer bg-gray-300'>
                        {DELETE}
                    </div>
                </td>
            } */}
        </tr>
    )
}

export default YarnPoItem
