import React, { useEffect } from 'react'
import { TextArea, TextInput } from '../../../Inputs'
import { findFromList, params } from '../../../Utils/helper'
import { HiPencil, HiPlus, HiTrash } from 'react-icons/hi'
import { useGetYarnCountsQuery } from '../../../redux/uniformService/YarnMasterServices'



export default function ToOrderDetails({ tempOrderItems, setOrderItems, orderItems, onClose, tempStockItems, toOrderId, setStockItems

}) {


    console.log(tempOrderItems, "tempOrderItems")




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
                                                <input type="checkbox" onChange={(e) => handleSelectAllChange(e.target.checked, tempOrderItems ? tempOrderItems : [])}
                                                    checked={getSelectAll(tempOrderItems ? tempOrderItems : [])}
                                                />
                                            </th>

                                            <th className="border border-gray-300 px-2 py-1 text-center text-xs w-11">S No</th>
                                            <th className="border border-gray-300 px-2 py-1 text-center text-xs w-72">Style Name</th>

                                            <th className="w-96 px-4 py-1.5 border border-gray-300 text-center font-medium text-xs">Accessory</th>
                                            <th className="w-32 px-4 py-1.5 border border-gray-300 text-center font-medium text-xs">Color</th>
                                            <th className="w-24 px-4 py-1.5 border border-gray-300 text-center font-medium text-xs">Size</th>
                                            <th className="w-24 px-4 py-1.5 border border-gray-300 text-center font-medium text-xs">Uom</th>
                                            <th className="w-24 px-4 py-1.5 border border-gray-300  text-xs">Required Qty (Kgs)</th>
                                            <th className="w-24 px-4 py-1.5 border border-gray-300  text-xs">Issued Qty (Kgs)</th>

                                            {/* <th className="w-24 px-4 py-1.5 border border-gray-300  text-xs">Stock Qty (Kgs)</th> */}
                                            {/* <th className="w-24 px-4 py-1.5 border border-gray-300  text-xs">Already Issue Qty (Kgs)</th> */}

                                            <th className="w-24 px-4 py-1.5 border border-gray-300  text-xs">Balance  Qty</th>


                                        </tr>
                                    </thead>


                                    <tbody>
                                        {(tempOrderItems ?? []).map((yarnItem, index) => (
                                            <tr
                                                key={index}
                                                className={`
                                                       
                                                        border-b border-gray-200
                                                        text-[12px]
                                                        ${yarnItem?.remainingQty === 0
                                                        ? "bg-gray-400 text-white"
                                                        : index % 2 === 0
                                                            ? "bg-white"
                                                            : "bg-gray-100"
                                                    }
`}


                                                onClick={() => {
                                                    if (yarnItem?.remainingQty !== 0) {
                                                        handleChange(yarnItem.id, yarnItem)
                                                    }
                                                }}

                                            >
                                                <td className='py-1 text-center'>
                                                    <input type="checkbox" name="" id=""
                                                        checked={isItemAdded(yarnItem.id, yarnItem)}
                                                    // disabled={yarnItem?.balanceQty === 0}
                                                    />
                                                </td>
                                                <td className="w-5 border border-gray-300 px-2 py-1 text-center text-xs">
                                                    {index + 1}
                                                </td>
                                                <td className=" border border-gray-300 text-[11px] py-1.5 px-2">
                                                    {yarnItem?.OrderDetails?.style?.name}
                                                </td>
                                                <td className=" border border-gray-300 text-[11px] py-1.5 px-2">
                                                    {yarnItem?.Accessory?.aliasName}
                                                </td>
                                                <td className=" border border-gray-300 text-[11px] py-1.5 px-2">
                                                    {yarnItem?.Color?.name}
                                                </td>
                                                <td className=" border border-gray-300 text-[11px] py-1.5 px-2">
                                                    {yarnItem?.Size?.name}
                                                </td>
                                                <td className=" border border-gray-300 text-[11px] py-1.5 px-2">
                                                    {yarnItem?.Uom?.name}
                                                </td>
                                                <td className="w-28 border border-gray-300 text-right text-[11px] py-1.5 px-2">
                                                    {parseFloat(yarnItem?.requiredQty)?.toFixed(3)}
                                                </td>
                                                <td className="w-28 border border-gray-300 text-right text-[11px] py-1.5 px-2">
                                                    {/* {(parseFloat(yarnItem?.tranferQty) + parseFloat(yarnItem?.issuedQty))?.toFixed(3)} */}
                                                    {
                                                        (
                                                            // parseFloat(yarnItem?.tranferQty || 0) +
                                                            parseFloat(yarnItem?.issuedQty || 0)
                                                        ).toFixed(3)

                                                    }
                                                </td>

                                                <td className="w-28 border border-gray-300 text-right text-[11px] py-1.5 px-2">
                                                    {
                                                        parseFloat(parseFloat(yarnItem?.requiredQty || 0) -
                                                            (
                                                                // parseFloat(yarnItem?.tranferQty || 0) +
                                                                parseFloat(yarnItem?.issuedQty || 0)
                                                            )).toFixed(3)

                                                    }
                                                    {/* {parseFloat(yarnItem?.remainingQty || 0).toFixed(3)} */}
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




