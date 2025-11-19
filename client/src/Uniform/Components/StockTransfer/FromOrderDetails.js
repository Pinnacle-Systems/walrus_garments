import React, { useEffect } from 'react'
import { TextArea, TextInput } from '../../../Inputs'
import { findFromList, params } from '../../../Utils/helper'
import { HiPencil, HiPlus, HiTrash } from 'react-icons/hi'
import { useGetYarnCountsQuery } from '../../../redux/uniformService/YarnMasterServices'



export default function FromOrderDetails({ fromOrderId, setOrderItems, orderItems, onClose, tempStockItems, stockItems, setStockItems, yarnList, colorList

}) {


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

            <div className="h-full flex flex-col bg-[#f1f1f0] p-3 w-full">
                <div className="flex flex-row w-full">
                    <div className="flex flex-col w-full">
                        <div className="mt-4 mb-5 w-full">
                            <div className="max-h-[600px] w-full overflow-y-auto">
                                <table className="border-collapse w-full">
                                    <thead className="bg-gray-200 text-gray-800">
                                        <tr>
                                            <th className="border border-gray-300 px-2 py-1 text-center text-xs w-11">S No</th>

                                            {fromOrderId && (

                                                <th className="px-4 py-1.5 border border-gray-300 text-center text-xs">Style</th>
                                            )}

                                            <th className="px-4 py-1.5 border border-gray-300 text-center text-xs">Yarn</th>
                                            <th className="px-4 py-1.5 border border-gray-300 text-center text-xs">Color</th>
                                            <th className="px-4 py-1.5 border border-gray-300 text-xs  w-20">Stock Qty (Kgs)</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {tempStockItems?.map((stock, index) => (
                                            <tr
                                                key={index}
                                                className={`hover:bg-gray-50 py-1 transition-colors border-b border-gray-200 text-[12px] ${index % 2 === 0 ? "bg-white" : "bg-gray-100"
                                                    }`}
                                            >
                                                <td className="w-5 border border-gray-300 px-2 py-1 text-center text-xs">
                                                    {index + 1}
                                                </td>
                                                {fromOrderId && (
                                                    <td className="w-72 border border-gray-300 px-2 py-1 text-left text-xs">
                                                        {stock?.OrderDetails?.style?.name}
                                                    </td>
                                                )}

                                                <td className="w-72 border border-gray-300 px-2 py-1 text-left text-xs">
                                                    {findFromList(stock?.yarnId, yarnList, "name")}
                                                </td>
                                                <td className="w-48 border border-gray-300 text-[11px] py-1.5 px-2">
                                                    {findFromList(stock?.colorId, colorList, "name")}
                                                </td>
                                                <td className="w-12 border border-gray-300 text-[11px] text-right py-1.5 px-2">
                                                    {parseFloat(stock?.stockQty).toFixed(3)}
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




