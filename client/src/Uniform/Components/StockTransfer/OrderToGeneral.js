import React, { useEffect } from 'react'
import { TextArea, TextInput } from '../../../Inputs'
import { findFromList, params } from '../../../Utils/helper'
import { HiPencil, HiPlus, HiTrash } from 'react-icons/hi'
import { useGetYarnCountsQuery } from '../../../redux/uniformService/YarnMasterServices'



export default function OrderToGeneral({ tempOrderItems, setOrderItems, orderItems, onClose, tempStockItems, toOrderId, setStockItems
    , yarnList, colorList, stockItems, sizeList, itemList, uomList
}) {






    function handleDone() {
        // setStockItems(
        //     tempStockItems?.filter(stockItem =>
        //         orderItems?.some(orderItem =>
        //             stockItem?.yarnId === orderItem?.yarnId &&
        //             stockItem?.colorId === orderItem?.colorId // use colorId for safety
        //         )
        //     )
        // );

        onClose()
    }

    function handleCancel() {
        setOrderItems([]);
        setStockItems([])
        onClose()
    }






    function addItem(obj) {

        setStockItems(localInwardItems => {
            let newItems = structuredClone(localInwardItems);
            const isAlreadyAdded = newItems.some(i => i.sizeId == obj.sizeId && i.itemId == obj.itemId && i.colorId == obj.colorId);

            if (isAlreadyAdded) {
                return newItems
            } else {
                newItems.push(obj);

            }

            return newItems
        });

    }


    function removeItem(obj) {
        setStockItems(localInwardItems => {
            let newItems = structuredClone(localInwardItems);
            newItems = newItems?.filter(item =>
                parseInt(item.itemId) !== parseInt(obj?.itemId) &&
                parseInt(item.sizeId) !== parseInt(obj?.sizeId) &&
                parseInt(item.colorId) !== parseInt(obj?.colorId)



            )
            return newItems
        });

    }

    function handleChange(obj) {
        if (isItemAdded(obj)) {
            removeItem(obj)
        } else {
            addItem(obj)
        }
    }

    function isItemAdded(obj) {
        return stockItems?.findIndex(item =>

            parseInt(item?.itemId) == parseInt(obj?.itemId) &&
            parseInt(item?.sizeId) == parseInt(obj?.sizeId) &&
            parseInt(item?.colorId) == parseInt(obj?.colorId)

        ) !== -1
    }

    function handleSelectAllChange(value, poItems) {
        if (value) {
            poItems?.forEach(item => addItem(item.id, item))
        } else {
            poItems?.forEach(item => removeItem(item.id))
        }
    }

    function getSelectAll(poItems) {
        return poItems?.every(item => isItemAdded(item))
    }

    return (

        <>

            <div className="h-full flex flex-col bg-[f1f1f0] px-2">


                <div className="flex flex-row gap-40 ">
                    <div className="flex flex-col">
                        <div className="border-b py-1.5 px-2 flex justify-between items-center sticky top-0 z-10 bg-white mt-3">
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
                                    {toOrderId}
                                </h2>

                            </div>
                            <div className="flex gap-2">


                                <div>

                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="px-3 py-1 hover:bg-red-600 hover:text-white rounded text-red-600 
                                        border border-red-600 flex items-center gap-1 text-xs"
                                    >
                                        Cancel
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={handleDone}
                                        className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
                                        border border-green-600 flex items-center gap-1 text-xs"
                                    >
                                        Done
                                    </button>

                                </div>
                            </div>
                        </div>
                        <div className="justify-end items-center mt-4 mb-5">

                            <div className="max-h-[600px] overflow-y-auto ">
                                <table className="w-full border-collapse table-fixed">
                                    <thead className="bg-gray-200 text-gray-800 sticky top-0 z-10">
                                        <tr>
                                            <th className="border border-gray-300 px-2 py-1 text-center text-xs w-11">
                                                <input type="checkbox" onChange={(e) => handleSelectAllChange(e.target.checked, tempStockItems ? tempStockItems : [])}
                                                    checked={getSelectAll(tempStockItems ? tempStockItems : [])}
                                                />
                                            </th>

                                            <th className="border border-gray-300 px-2 py-1 text-center text-xs w-11">S No</th>
                                            <th className="border border-gray-300 px-2 py-1 text-center text-xs w-72">Item</th>
                                            <th className=" px-4 py-1.5 border border-gray-300 text-center  text-xs w-14">Size</th>
                                            <th className="w-48 px-4 py-1.5 border border-gray-300 text-center text-xs">Color</th>
                                            <th className="w-24 px-4 py-1.5 border border-gray-300  text-xs">Stock Qty</th>




                                        </tr>
                                    </thead>


                                    <tbody>
                                        {(tempStockItems ?? []).map((yarnItem, index) => (
                                            <tr
                                                key={index}
                                                className={`
                                                       
                                                        border-b border-gray-200
                                                        text-[12px]
                                                        ${yarnItem?.remainingQty === 0
                                                        ? "bg-gray-600 text-white"
                                                        : index % 2 === 0
                                                            ? "bg-white"
                                                            : "bg-gray-100"
                                                    }
`}


                                                onClick={() => {
                                                    if (yarnItem?.remainingQty !== 0) {
                                                        handleChange(yarnItem)
                                                    }
                                                }}

                                            >
                                                <td className='py-1 text-center'>
                                                    <input type="checkbox" name="" id=""
                                                        checked={isItemAdded(yarnItem)}
                                                    // disabled={yarnItem?.balanceQty === 0}
                                                    />
                                                </td>
                                                <td className="w-5 border border-gray-300 px-2 py-1 text-center text-xs">
                                                    {index + 1}
                                                </td>
                                                <td className="w-5 border border-gray-300 px-2 py-1 text-left text-xs">
                                                    {findFromList(yarnItem?.itemId, itemList, "name")}
                                                </td>
                                                <td className="w-48 border border-gray-300 text-[11px] py-1.5 px-2">
                                                    {findFromList(yarnItem?.sizeId, sizeList, "name")}
                                                </td>

                                                <td className="w-48 border border-gray-300 text-[11px] py-1.5 px-2">
                                                    {findFromList(yarnItem?.colorId, colorList, "name")}
                                                </td>

                                                <td className="w-28 border border-gray-300 text-right text-[11px] py-1.5 px-2">

                                                    {parseFloat(yarnItem?._sum?.qty || 0).toFixed(3)}
                                                </td>
                                            </tr>
                                        ))}

                                    </tbody>
                                </table>
                            </div>

                        </div>

                    </div>

                </div>


            </div>

        </>
    )
}




