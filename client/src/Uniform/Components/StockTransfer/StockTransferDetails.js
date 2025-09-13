import React, { useEffect } from 'react'
import { TextArea, TextInput } from '../../../Inputs'
import { findFromList, params } from '../../../Utils/helper'
import { HiPencil, HiPlus, HiTrash } from 'react-icons/hi'
import { useGetYarnCountsQuery } from '../../../redux/uniformService/YarnMasterServices'



export default function YarnTransferDetails({ tempOrderItems, setOrderItems, orderItems, onClose, tempStockItems, stockItems, setStockItems

}) {


    console.log(orderItems, "orderItems")

    console.log(tempStockItems, "tempStockItems")


    function handleDone() {
        setStockItems(
            tempStockItems?.filter(stockItem =>
                orderItems?.some(orderItem =>
                    stockItem?.yarnId === orderItem?.yarnId &&
                    stockItem?.colorId === orderItem?.colorId // use colorId for safety
                )
            )
        );
        // setStockItems(
        //     tempStockItems?.filter((stockItem, index) => {
        //         const orderItem = orderItems?.[index];
        //         if (!orderItem) return false; // skip if no corresponding order item

        //         return (
        //             stockItem?.yarnId === orderItem?.yarnId &&
        //             stockItem?.color === orderItem?.color &&
        //             stockItem?.count === orderItem?.count &&
        //             stockItem?.shade === orderItem?.shade
        //         );
        //     })
        // );

        onClose()
    }

    function handleCancel() {
        setOrderItems([]);
        onClose()
    }



    // function handleInputChange(value, index, field) {


    //     console.log(value, "value", index)
    //     let orderYarnDetails = "orderYarnDetails"


    //     setOrderDetails(orderDetails => {
    //         const newBlend = structuredClone(orderDetails);
    //         newBlend[gridIndex][orderYarnDetails][index][field] = value;
    //         return newBlend
    //     }
    //     );
    // };

    // function addNewRow() {
    //     setOrderDetails(prev => {
    //         const newPrev = structuredClone(prev);
    //         const orderYarnDetailsKey = "orderYarnDetails";

    //         if (!newPrev[selectedIndex][orderYarnDetailsKey]) {
    //             newPrev[selectedIndex][orderYarnDetailsKey] = [];
    //         }

    //         console.log(newPrev[selectedIndex][orderYarnDetailsKey], "gridIndex");

    //         newPrev[selectedIndex][orderYarnDetailsKey].push({
    //             yarnId: '',
    //         });

    //         return newPrev;
    //     });


    // }

    // function handleEdit(index) {
    //     setOrderDetails(prev => {
    //         const newPrev = structuredClone(prev);

    //         const itemData = newPrev[index]?.orderDetailsSubGrid?.[0] || {};

    //         if (!Array.isArray(newPrev[index].orderDetailsSubGrid)) {
    //             newPrev[index].orderDetailsSubGrid = [];
    //         }

    //         newPrev[index].orderDetailsSubGrid.push({

    //             size: "",
    //             sizeMesaurement: "",
    //             qty: 0,

    //         });

    //         return newPrev;
    //     });
    // }

    // function deleteRow(yarnIndex) {
    //     // if (readOnly) return toast.info("Turn on Edit Mode...!!!")
    //     // setOrderDetails(prev => prev.filter((_, i) => i !== index))
    //     setOrderDetails(prev => {
    //         // const updated = [...prev];
    //         const updated = structuredClone(prev);
    //         updated[gridIndex].orderYarnDetails
    //             .splice(yarnIndex, 1);


    //         if (updated[gridIndex].orderYarnDetails
    //             .length === 0) {
    //             updated.splice(gridIndex, 1);
    //         }

    //         return updated;
    //     });
    // }
    // function deleteSubRow(rowIndex, subRowIndex) {

    //     setOrderDetails(prev => {
    //         // const updated = [...prev];
    //         const updated = structuredClone(prev);
    //         updated[rowIndex].orderYarnDetails.splice(subRowIndex, 1);


    //         if (updated[rowIndex].orderDetailsSubGrid.length === 0) {
    //             updated.splice(rowIndex, 1);
    //         }

    //         return updated;
    //     });
    // }

    function addItem(id, obj) {
        console.log(obj, "obj")

        setOrderItems(localInwardItems => {
            let newItems = structuredClone(localInwardItems);
            newItems.push(obj);
            return newItems
        });
    }
    function removeItem(id) {
        setOrderItems(localInwardItems => {
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
        return orderItems?.findIndex(item => parseInt(item?.id) === parseInt(id)) !== -1
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

            <div className="h-full flex flex-col bg-[f1f1f0] px-2">


                <div className="flex flex-row gap-40 ">
                    <div className="flex flex-col">
                        <div className="justify-end items-center mt-4 mb-5">
                            <div className="max-h-[600px] overflow-y-auto ">
                                <table className="w-full border-collapse table-fixed">
                                    <thead className="bg-gray-200 text-gray-800 sticky top-0 z-10">
                                        <tr>
                                            <th className="border border-gray-300 px-2 py-1 text-center text-xs w-11">
                                                <input type="checkbox" onChange={(e) => handleSelectAllChange(e.target.checked, tempOrderItems ? tempOrderItems : [])}
                                                    checked={getSelectAll(tempOrderItems ? tempOrderItems : [])}
                                                />
                                            </th>

                                            <th className="border border-gray-300 px-2 py-1 text-center text-xs w-11">S No</th>
                                            <th className="border border-gray-300 px-2 py-1 text-center text-xs w-72">Style Name</th>
                                            <th className="w-48 px-4 py-1.5 border border-gray-300 text-center  text-xs">Yarn</th>
                                            <th className="w-48 px-4 py-1.5 border border-gray-300 text-center text-xs">Color</th>
                                            <th className="w-24 px-4 py-1.5 border border-gray-300  text-xs">Required Qty (Kgs)</th>
                                            <th className="w-24 px-4 py-1.5 border border-gray-300  text-xs">Purchase Qty</th>


                                        </tr>
                                    </thead>


                                    <tbody>
                                        {(tempOrderItems ?? []).map((yarnItem, index) => (
                                            <tr
                                                key={index}
                                                className={`hover:bg-gray-50 transition-colors border-b border-gray-200 text-[12px] ${index % 2 === 0 ? "bg-white" : "bg-gray-100"
                                                    }`}
                                                onClick={() => handleChange(yarnItem.id, yarnItem)}
                                            >
                                                <td className='py-1 text-center'>
                                                    <input type="checkbox" name="" id=""
                                                        checked={isItemAdded(yarnItem.id, yarnItem)}
                                                    />
                                                </td>
                                                <td className="w-5 border border-gray-300 px-2 py-1 text-center text-xs">
                                                    {index + 1}
                                                </td>
                                                <td className="w-72 border border-gray-300 px-2 py-1 text-left text-xs">
                                                    {yarnItem?.style}
                                                </td>
                                                <td className="w-48 border border-gray-300 text-[11px] py-1.5 px-2">
                                                    {yarnItem?.Yarn?.name}
                                                </td>
                                                <td className="w-48 border border-gray-300 text-[11px] py-1.5 px-2">
                                                    {yarnItem?.Color?.name}
                                                </td>
                                                <td className="w-28 border border-gray-300 text-right text-[11px] py-1.5 px-2">
                                                    {yarnItem?.qty?.toFixed(3)}
                                                </td>
                                                <td className="w-28 border border-gray-300 text-right text-[11px] py-1.5 px-2">
                                                    {yarnItem?.qty?.toFixed(3)}
                                                </td>

                                            </tr>
                                        ))}

                                    </tbody>
                                </table>
                            </div>

                        </div>
                        <div className='flex justify-end gap-4 mt-3'>
                            <button onClick={handleDone} className='bg-lime-400 hover:bg-lime-600 hover:text-white p-1 px-3 text-sm rounded font-semibold transition'>
                                Done
                            </button>
                            <button onClick={handleCancel} className='bg-red-400 hover:bg-red-600 hover:text-white p-1 text-sm rounded font-semibold transition'>
                                Cancel
                            </button>
                        </div>
                    </div>

                </div>


            </div>

        </>
    )
}




