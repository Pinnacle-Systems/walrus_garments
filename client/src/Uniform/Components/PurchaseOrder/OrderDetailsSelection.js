import React, { useEffect } from 'react'
import { TextArea, TextInput } from '../../../Inputs'
import { findFromList, params } from '../../../Utils/helper'
import { HiPencil, HiPlus, HiTrash } from 'react-icons/hi'
import { useGetYarnCountsQuery } from '../../../redux/uniformService/YarnMasterServices'
import { useGetRequirementPlanningFormItemsQuery } from '../../../redux/uniformService/RequirementPlanningFormServices'



export default function OrderDetailsSelection({ tempPoItems, setPoItems, poItems, onClose, tempStockItems,  setStockItems, 

}) {


    console.log(tempPoItems, "tempPoItems")

 






    function handleDone() {
        setStockItems(
            tempStockItems?.filter(stockItem =>
                poItems?.some(orderItem =>
                    stockItem?.yarnId === orderItem?.yarnId &&
                    stockItem?.colorId === orderItem?.colorId // use colorId for safety
                )
            )
        );


        onClose()
    }




    function addItem(id, obj) {
        setPoItems(prevItems => {
            let newItems = structuredClone(prevItems);

            const index = newItems.findIndex(v => v?.yarnId === "");

            if (index !== -1) {
                newItems[index] = obj;
            } else {
                newItems.push(obj);
            }

            return newItems;
        });
    }
    function removeItem(id) {
        setPoItems(localInwardItems => {
            let newItems = structuredClone(localInwardItems);
            newItems = newItems?.filter(item => parseInt(item.id) !== parseInt(id))
            return newItems
        });
    }

    function handleChange(id, obj) {

        if (isItemAdded(id, obj)) {
            removeItem(id)
        } else {
            addItem(id, obj)
        }
    }

    function isItemAdded(id) {

        return poItems?.findIndex(item => parseInt(item?.id) === parseInt(id)) !== -1
    }

    function handleSelectAllChange(value, poItems) {
        if (value) {
            poItems?.forEach(item => addItem(item.id, item))
        } else {
            poItems?.forEach(item => removeItem(item.id))
        }
    }

    function getSelectAll(poItems) {
        return poItems?.every(item => isItemAdded(item.id))
    }






    return (

        <>








            <div className="flex-1 overflow-y-auto rounded-md border border-gray-200  shadow-sm bg-[#f1f1f0]">
                <div className="h-full flex flex-col bg-[#f1f1f0] px-1 w-full">
                    <div className="flex flex-row w-full">
                        <div className="flex flex-col w-full">
                            <div className="mt-4 mb-5 w-full">
                                <div className="max-h-[600px] w-[90vw] overflow-auto ">
                                    <table className="border-collapse w-full">
                                        <thead className="bg-gray-200 text-gray-800">
                                            <tr>
                                                <th className="border border-gray-300 px-2 py-1 text-center text-xs w-11">
                                                    <input type="checkbox" onChange={(e) => handleSelectAllChange(e.target.checked, tempPoItems ? tempPoItems : [])}
                                                        checked={getSelectAll(tempPoItems ? tempPoItems : [])}
                                                    />
                                                </th>
                                                <th className="border border-gray-300 px-2 py-1 text-center text-xs w-11">S No</th>
                                                <th className="px-4 py-1.5 border border-gray-300 text-center text-xs w-36">Po Type</th>
                                                <th className="px-4 py-1.5 border border-gray-300 text-center text-xs w-20">Order No</th>
                                                <th className="px-4 py-1.5 border border-gray-300 text-center text-xs w-64">Style No</th>
                                                <th className="px-4 py-1.5 border border-gray-300 text-xs  w-96">Yarn</th>
                                                <th className="px-4 py-1.5 border border-gray-300 text-xs  w-24">Color</th>
                                                <th className="px-4 py-1.5 border border-gray-300 text-xs  w-20">Counts</th>
                                                {/* <th className="px-4 py-1.5 border border-gray-300 text-xs  w-20">Price </th> */}
                                                {/* <th className="px-4 py-1.5 border border-gray-300 text-xs  w-20">Uom</th> */}
                                                <th className="px-4 py-1.5 border border-gray-300 text-xs  w-20">Required Qty</th>
                                                <th className="px-4 py-1.5 border border-gray-300 text-xs  w-20">Already Purchased Qty</th>
                                                <th className="px-4 py-1.5 border border-gray-300 text-xs  w-20">Balance  Qty</th>




                                            </tr>
                                        </thead>

                                        <tbody>
                                            {tempPoItems?.map((item, index) => (
                                                <tr
                                                    key={index}
                                                    className={`hover:bg-gray-50 py-1 transition-colors border-b border-gray-200 text-[12px] ${index % 2 === 0 ? "bg-white" : "bg-gray-100"
                                                        }`}
                                                    onClick={() => {
                                                        if (item?.balanceQty !== 0) {
                                                            handleChange(item.id, item)
                                                        }
                                                    }}
                                                >
                                                    <td className='py-1 text-center'>
                                                        <input type="checkbox" name="" id=""
                                                            checked={isItemAdded(item.id, item, index)}
                                                            disabled={item?.balanceQty === 0} />
                                                    </td>
                                                    <td className="w-5 border border-gray-300 px-2 py-1 text-center text-xs">
                                                        {index + 1}
                                                    </td>
                                                    <td className=" border border-gray-300 text-[11px] text-right py-1.5 px-2">
                                                        { }
                                                    </td>
                                                    <td className=" border border-gray-300 text-[11px] py-1.5 px-2">
                                                        {item?.order?.docId}
                                                    </td>
                                          
                                                    <td className=" border border-gray-300 px-2 py-1 text-left text-xs">
                                                        {item?.allColors}
                                                    </td>
                                                    <td className=" border border-gray-300 text-[11px] py-1.5 px-2">
                                                        {item?.Yarn?.name}
                                                    </td>
                                                    <td className=" border border-gray-300 text-[11px] py-1.5 px-2">
                                                        {item?.Color?.name}
                                                    </td>
                                                    <td className=" border border-gray-300 text-[11px] py-1.5 px-2">
                                                        {item?.Counts?.name}
                                                    </td>
                                        
                                                    <td className=" border border-gray-300 text-[11px] text-right py-1.5 px-2">
                                                        {item?.requiredQty?.toFixed(3)}
                                                    </td>
                                                    <td className=" border border-gray-300 text-[11px]  text-right py-1.5 px-2">
                                                        { item?.alreadyPoqty}
                                                    </td>  <td className=" border border-gray-300 text-[11px]   text-right py-1.5 px-2">
                                                        {parseFloat(item?.requiredQty)  - parseFloat( item?.alreadyPoqty)}
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
            </div>

        </>
    )
}










