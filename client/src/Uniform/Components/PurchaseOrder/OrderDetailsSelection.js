import React, { useEffect } from 'react'
import { TextArea, TextInput } from '../../../Inputs'
import { findFromList, params } from '../../../Utils/helper'
import { HiPencil, HiPlus, HiTrash } from 'react-icons/hi'
import { useGetYarnCountsQuery } from '../../../redux/uniformService/YarnMasterServices'
import { useGetRequirementPlanningFormItemsQuery } from '../../../redux/uniformService/RequirementPlanningFormServices'



export default function OrderDetailsSelection({ id, tempPoItems, setPoItems, poItems = [], onClose, readOnly, setPoType, poMaterial

}) {


    console.log(poMaterial === "GreyYarn", "pomaterial")

    function handleDone() {
        onClose()

    }


    function handleCancel() {
        setPoItems([]);
        onClose()
        setPoType("")
    }




    function addItem(id, obj) {
        setPoItems(prevItems => {
            let newItems = structuredClone(prevItems);

            const index = newItems?.findIndex(v => v?.yarnId === "");


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
        console.log(id, "iddddd")

        if (isItemAdded(id)) {
            removeItem(id)
        } else {
            addItem(id, obj)
        }
    }

    function isItemAdded(id) {
        console.log(id, "id")

        return (poItems || [])?.findIndex(item => parseInt(item?.id) === parseInt(id)) !== -1
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

           <div className='border border-gray-200  shadow-sm bg-[#f1f1f0]'>
             <div className="border-b py-2 px-4 mx-3 flex justify-between items-center sticky top-0 z-10 bg-white mt-3">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
                        {id ? (!readOnly ? "Edit Yarn Details" : "Yarn Details ") : "Add New Yarn"}
                    </h2>

                </div>
                <div className="flex gap-2">
                    {/* <div>
                            <button
                                type="button"
                                onClick={() => {
                                     handleCancel();
                                    // setSearchValue("");
                                    // setId(false);
                                }}
                                className="px-3 py-1 text-red-600 hover:bg-red-600 hover:text-white border border-red-600 text-xs rounded"
                            >
                                Cancel
                            </button>
                    </div> */}
                    <div className="flex gap-2">
                        {!readOnly && (
                            <button
                                type="button"
                                onClick={handleDone}
                                className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
                                        border border-green-600 flex items-center gap-1 text-xs"
                            >
                                {/* <Check size={14} /> */}
                                Done
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto rounded-md ">

                <div className="h-full flex flex-col bg-[#f1f1f0] px-1 w-full max-h-[450px]">

                    <div className="flex flex-row w-full">
                        <div className="flex flex-col w-full">
                            <div className="mt-4 mb-5 w-full">

                                <div className=" w-[90vw] overflow-auto ">

                                    <table className="border-collapse w-full">
                                        <thead className="bg-gray-200 text-gray-800">
                                            <tr>
                                                <th className="border border-gray-300 px-2 py-1 text-center text-xs w-11">
                                                    <input type="checkbox" onChange={(e) => handleSelectAllChange(e.target.checked, tempPoItems ? tempPoItems : [])}
                                                        checked={getSelectAll(tempPoItems ? tempPoItems : [])}
                                                    />
                                                </th>
                                                <th className="border border-gray-300 px-2 py-1 text-center text-xs w-11">S No</th>
                                                {/* <th className="px-4 py-1.5 border border-gray-300 text-center text-xs w-36">Po Type</th> */}
                                                <th className="px-4 py-1.5 border border-gray-300 text-center text-xs w-20">Order No</th>
                                                <th className="px-4 py-1.5 border border-gray-300 text-center text-xs w-64">Style No</th>
                                                <th className="px-4 py-1.5 border border-gray-300 text-xs  w-96">Yarn</th>


                                                <th className="px-4 py-1.5 border border-gray-300 text-xs text-gray-800  w-24">Color</th>




                                                <th className="px-4 py-1.5 border border-gray-300 text-xs  w-20">Counts</th>
                                                {/* <th className="px-4 py-1.5 border border-gray-300 text-xs  w-20">Price </th> */}
                                                {/* <th className="px-4 py-1.5 border border-gray-300 text-xs  w-20">Uom</th> */}
                                                <th className="px-4 py-1.5 border border-gray-300 text-xs  w-20">Required Qty </th>
                                                <th className="px-4 py-1.5 border border-gray-300 text-xs  w-20">Already Purchased Qty</th>
                                                <th className="px-4 py-1.5 border border-gray-300 text-xs  w-20">Balance  Qty </th>




                                            </tr>
                                        </thead>

                                        <tbody>

                                            {tempPoItems?.length === 0 ? (
                                                <tr>
                                                    <td colSpan={9} className="px-4 py-4 text-center text-gray-500">
                                                        No data found
                                                    </td>
                                                </tr>
                                            ) : (
                                                tempPoItems?.map((item, index) => (
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
                                                                checked={isItemAdded(item.id, item)}
                                                                disabled={(parseFloat(item?.requiredQty) || 0) - (parseFloat(item?.alreadyPoqty) || 0) === 0} />
                                                        </td>
                                                        <td className="w-5 border border-gray-300 px-2 py-1 text-center text-xs">
                                                            {index + 1}
                                                        </td>
                                                        {/* <td className=" border border-gray-300 text-[11px] text-right py-1.5 px-2">
                                                            { }
                                                        </td> */}
                                                        <td className=" border border-gray-300 text-[11px] py-1.5 px-2">
                                                            {item?.order?.docId}
                                                        </td>

                                                        <td className=" border border-gray-300 px-2 py-1 text-left text-xs">
                                                            {item?.allColors}
                                                        </td>
                                                        <td className=" border border-gray-300 text-[11px] py-1.5 px-2">
                                                            {item?.Yarn?.name}
                                                        </td>
                                                        {poMaterial === "DyedYarn" && (

                                                            <td className=" border border-gray-300 text-[11px] py-1.5 px-2">
                                                                {item?.Color?.name}
                                                            </td>
                                                        )}
                                                        {poMaterial === "GreyYarn" && (

                                                            <td className=" border border-gray-300 text-[11px] py-1.5 px-2">
                                                                Grey
                                                            </td>
                                                        )}
                                                        <td className=" border border-gray-300 text-[11px] py-1.5 px-2">
                                                            {item?.yarnCounts?.name}
                                                        </td>

                                                        <td className=" border border-gray-300 text-[11px] text-right py-1.5 px-2">
                                                            {item?.requiredQty?.toFixed(3)}
                                                        </td>
                                                        <td className=" border border-gray-300 text-[11px]  text-right py-1.5 px-2">
                                                            {item?.alreadyPoqty?.toFixed(3)}
                                                        </td>
                                                        <td className="border border-gray-300 text-[11px] text-right py-1.5 px-2">
                                                            {Math.max(0, (parseFloat(item?.requiredQty) || 0) - (parseFloat(item?.alreadyPoqty) || 0)).toFixed(3)}
                                                        </td>

                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            {/* <div className='flex justify-end gap-4 mt-3'>
                                {poItems?.length > 0 && (
                                    <button onClick={handleDone} className='bg-lime-400 hover:bg-lime-600 hover:text-white p-1 px-3 text-sm rounded font-semibold transition'>
                                        Done
                                    </button>

                                )}
                                <button onClick={handleCancel} className='bg-red-400 hover:bg-red-600 hover:text-white p-1 text-sm rounded font-semibold transition'>
                                    Cancel
                                </button>
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>
           </div>


        </>
    )
}















