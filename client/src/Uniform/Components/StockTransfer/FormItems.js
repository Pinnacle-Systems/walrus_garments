import React, { useEffect, useRef, useState } from "react"
import { HiPencil, HiPlus, HiTrash } from "react-icons/hi"
import { toast } from "react-toastify";
import Modal from "../../../UiComponents/Modal";
import StockTransferDetails from "./ToOrderDetails";
import { useGetStockTransferQuery } from "../../../redux/uniformService/StockTransferService";
import { useGetStockQuery } from "../../../redux/services/StockService";
import { findFromList } from "../../../Utils/helper";
import ToOrderDetails from "./ToOrderDetails";
import FromOrderDetails from "./FromOrderDetails";
import Swal from "sweetalert2";

const FormItems = ({ setOrderItems, orderItems, readOnly, colorList, transferType, singleData, id,
    yarnList, setRequirementId, stockItems, setStockItems, setTempOrderItems, tempOrderItems, tempStockItems, setTempStockItems,
    toOrderId, fromOrderId, orderData


}) => {


    console.log(stockItems, "stockItems")
    console.log(tempOrderItems, "tempOrderItems")




    const [tableDataView, setTableDataView] = useState(false)
    const [tableStockDataView, setTableStockDataView] = useState(false)


    function deleteToOrderRow(index) {
        console.log(index, "index")
        if (readOnly) return toast.info("Turn on Edit Mode...!!!")
        setOrderItems(prev => prev.filter((_, i) => i !== index))
    }

    function deleteFromOrderRow(index) {
        console.log(index, "index")
        if (readOnly) return toast.info("Turn on Edit Mode...!!!")
        setStockItems(prev => prev.filter((_, i) => i !== index))
    }

    const [contextMenuToOrder, setContextMenuToOrder] = useState(null);
    const [contextMenuFromOrder, setContextMenuFromOrder] = useState(null);


    const handleRightClickFromOrder = (event, rowIndex, type) => {
        event.preventDefault();
        setContextMenuFromOrder({
            mouseX: event.clientX,
            mouseY: event.clientY,
            rowId: rowIndex,
            type,
        });
    };

    const handleCloseContextMenuFromOrder = () => {
        setContextMenuFromOrder(null);
    };



    const handleRightClickToOrder = (event, rowIndex, type) => {
        event.preventDefault();
        setContextMenuToOrder({
            mouseX: event.clientX,
            mouseY: event.clientY,
            rowId: rowIndex,
            type,
        });
    };

    const handleCloseContextMenuToOrder = () => {
        setContextMenuToOrder(null);
    };


    function handleInputChangeFromOrder(value, index, field, stock) {
        console.log(stock, "stock")

        setStockItems(stock => {
            const newBlend = structuredClone(stock);
            if (stock)
                newBlend[index][field] = parseFloat(value);
            return newBlend
        });




    };





    // function handleInputChangeToOrder(value, index, field, yarnItem) {




    //     const qtyToFill = parseFloat(value) || 0;

    //     setStockItems(prev => {
    //         const updated = structuredClone(prev);

    //         const matchedIndexes = updated
    //             .map((item, i) => ({
    //                 ...item,
    //                 index: i
    //             }))
    //             ?.filter(
    //                 i =>
    //                     i.yarnId === yarnItem?.yarnId &&
    //                     i.colorId === yarnItem?.colorId
    //             );



    //         // for (const row of matchedIndexes) {
    //         //     // reset all old values first
    //         //     updated[row.index].transferQty = 0;
    //         // }

    //         let remaining = value;



    //         for (const row of matchedIndexes) {
    //             if (remaining < 0) break;

    //             const available = parseFloat(row.stockQty || 0);
    //             const previous = (updated[row.index]);
    //             // const totalRequested = parseFloat(previous) + parseFloat(remaining);
    //         console.log(available, "previous", previous)

    //             if (available >= remaining) {
    //                 updated[row.index].transferQty = remaining;
    //                 remaining = 0;
    //             } else {
    //                 updated[row.index].transferQty = available;
    //                 remaining -= available;
    //             }
    //         }


    //         return updated;
    //     });

    //     setOrderItems(prevOrder => {
    //         const updated = structuredClone(prevOrder);
    //         updated[index][field] = qtyToFill;
    //         return updated;
    //     });
    // }


    // function handleInputChangeToOrder(value, index, field, yarnItem) {
    //     const newValue = parseFloat(value) || 0;

    //     setOrderItems(prevOrder => {
    //         const updatedOrders = structuredClone(prevOrder);
    //         updatedOrders[index][field] = newValue;

    //         const totalRequired = updatedOrders
    //             .filter(i => i.yarnId === yarnItem.yarnId && i.colorId === yarnItem.colorId)
    //             .reduce((sum, i) => sum + (parseFloat(i.transferQty) || 0), 0);

    //         setStockItems(prev => {
    //             const updatedStock = structuredClone(prev);

    //             const matches = updatedStock
    //                 .map((item, i) => ({ ...item, index: i }))
    //                 .filter(i => i.yarnId === yarnItem.yarnId && i.colorId === yarnItem.colorId);

    //             let remaining = totalRequired;

    //             for (const row of matches) {
    //                 updatedStock[row.index].transferQty = 0;
    //             }

    //             for (const row of matches) {
    //                 if (remaining <= 0) break;

    //                 const available = parseFloat(row.stockQty || 0);

    //                 if (available >= remaining) {
    //                     updatedStock[row.index].transferQty = remaining;
    //                     remaining = 0;
    //                 }
    //                 else {
    //                     updatedStock[row.index].transferQty = available;
    //                     remaining -= available;
    //                 }
    //             }

    //             return updatedStock;
    //         });

    //         return updatedOrders;
    //     });
    // }

    function handleInputChangeToOrder(value, index, field, yarnItem) {
        const newValue = parseFloat(value) || 0;

        // ⭐ 1) CHECK TOTAL AVAILABLE STOCK
        const totalAvailable = stockItems
            .filter(s => s.yarnId === yarnItem.yarnId && s.colorId === yarnItem.colorId)
            .reduce((sum, s) => sum + (parseFloat(s.stockQty) || 0), 0);

        const currentlyUsed = stockItems
            .filter(s => s.yarnId === yarnItem.yarnId && s.colorId === yarnItem.colorId)
            .reduce((sum, s) => sum + (parseFloat(s.transferQty) || 0), 0);

        console.log(totalAvailable, "totalAvailable")

        // ⭐ 2) CHECK EXISTING transferQty (except this row)
        const existingTransfer = orderItems
            .filter((i, idx) =>
                idx !== index &&
                i.yarnId === yarnItem.yarnId &&
                i.colorId === yarnItem.colorId
            )
            .reduce((sum, i) => sum + (parseFloat(i.transferQty) || 0), 0);

        console.log(currentlyUsed, "currentlyUsed")
        console.log(existingTransfer, "existingTransfer", newValue, "newValue", totalAvailable, "totalAvailable")

        if (existingTransfer + newValue > (totalAvailable)) {
            Swal.fire({
                title: "Not enough stock!",
                text: `Only ${(parseFloat(totalAvailable)).toFixed(3)} available in stock.`,

                // text: `Only ${(parseFloat(totalAvailable) - parseFloat(currentlyUsed)).toFixed(3)} available in stock.`,
                icon: "warning"
            });
            return;
        } else {
            setOrderItems(prevOrder => {
                const updatedOrders = structuredClone(prevOrder);
                updatedOrders[index][field] = newValue;

                const totalRequired = updatedOrders
                    .filter(i => i.yarnId === yarnItem.yarnId && i.colorId === yarnItem.colorId)
                    .reduce((sum, i) => sum + (parseFloat(i.transferQty) || 0), 0);

                // ⭐ 5) UPDATE STOCK ITEMS
                setStockItems(prev => {
                    const updatedStock = structuredClone(prev);

                    const matches = updatedStock
                        .map((item, i) => ({ ...item, index: i }))
                        .filter(i => i.yarnId === yarnItem.yarnId && i.colorId === yarnItem.colorId);

                    let remaining = totalRequired;

                    for (const row of matches) {
                        updatedStock[row.index].transferQty = 0;
                    }

                    for (const row of matches) {
                        if (remaining <= 0) break;

                        const available = parseFloat(row.stockQty || 0);

                        if (available >= remaining) {
                            updatedStock[row.index].transferQty = remaining;
                            remaining = 0;
                        } else {
                            updatedStock[row.index].transferQty = available;
                            remaining -= available;
                        }
                    }

                    return updatedStock;
                });

                return updatedOrders;
            });
        }


    }



    console.log(orderItems, "orderItems")
    console.log(tempStockItems, "tempStockItems")
    console.log(stockItems, "stockItems")










    return (
        <>
            <Modal
                isOpen={tableDataView}
                onClose={() => setTableDataView(false)}
                widthClass=" h-[70%] w-[90%]"
            >
                <ToOrderDetails
                    tempOrderItems={tempOrderItems}
                    setOrderItems={setOrderItems} orderItems={orderItems}
                    setTempOrderItems={setTempOrderItems}
                    tempStockItems={tempStockItems} setTempStockItems={setTempStockItems} stockItems={stockItems} setStockItems={setStockItems}
                    onClose={() => setTableDataView(false)}
                    toOrderId={findFromList(toOrderId, orderData, "docId")}

                />
            </Modal>
            <Modal
                isOpen={tableStockDataView}
                onClose={() => setTableStockDataView(false)}
                widthClass="  h-[70%] w-[70%]"
            >
                <FromOrderDetails
                    tempOrderItems={tempOrderItems}
                    setOrderItems={setOrderItems} orderItems={orderItems}
                    setTempOrderItems={setTempOrderItems}
                    tempStockItems={tempStockItems} setTempStockItems={setTempStockItems} stockItems={stockItems} setStockItems={setStockItems}
                    onClose={() => setTableStockDataView(false)}
                    colorList={colorList} yarnList={yarnList}
                    fromOrderId={fromOrderId}

                />
            </Modal>
            <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm h-[240px] mb-2">


                <div className="flex flex-row gap-5">
                    <div className="flex justify-between items-center ">
                        <h2 className="font-medium text-slate-700">To Order Details
                            <span
                                className="ml-4 text-green-400 font-bold"
                            >
                                {(toOrderId || id) ? findFromList(id ? singleData?.data?.toOrderId : toOrderId, orderData, "docId") : "To Order No"}

                            </span>
                        </h2>
                    </div>
                    <button
                        onClick={() => {
                            setTableDataView(true)
                        }}
                        disabled={id}

                        className="text-blue-800 rounded h-full py-1  text-lg focus:outline-none"
                    >
                        <span className=''>👁</span>
                    </button>
                </div>
                <div className="flex flex-row gap-40 ">
                    <div className="w-[80%] flex flex-col">
                        <div className="justify-end items-center ">
                            <div className="max-h-[180px] overflow-y-auto ">
                                <table className="w-full border-collapse table-fixed">
                                    <thead className="bg-gray-200 text-gray-800 sticky top-0 z-10">
                                        <tr>
                                            <th className="border border-gray-300 px-2 py-1 text-center text-xs w-11">S No</th>
                                            <th className="border border-gray-300 px-2 py-1 text-center text-xs w-72">Style Name</th>
                                            <th className="w-72 px-4 py-1.5 border border-gray-300 text-center  text-xs">Yarn</th>
                                            <th className="w-40 px-4 py-1.5 border border-gray-300 text-center text-xs">Color</th>
                                            <th className="w-20 px-4 py-1.5 border border-gray-300  text-xs">Required Qty (Kgs)</th>
                                            {/* <th className="w-20 px-4 py-1.5 border border-gray-300  text-xs">Stock Qty</th> */}
                                            <th className="w-20 px-4 py-1.5 border border-gray-300  text-xs">Balance Qty (Kgs)</th>
                                            <th className="w-20 px-4 py-1.5 border border-gray-300  text-xs">Transfer Qty (Kgs)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(orderItems ?? []).map((yarnItem, index) => (
                                            <tr
                                                key={index}
                                                className={`hover:bg-gray-50 transition-colors border-b border-gray-200 text-[12px] ${index % 2 === 0 ? "bg-white" : "bg-gray-100"
                                                    }`}
                                                onContextMenu={(e) => {
                                                    if (!readOnly) {
                                                        handleRightClickToOrder(e, index, "notes");
                                                    }
                                                }}
                                                onClick={() => setRequirementId(yarnItem?.requirementPlanningFormId)}
                                            >
                                                <td className="w-5 border border-gray-300 px-2 py-1 text-center text-xs">
                                                    {index + 1}
                                                </td>
                                                <td className="w-72 border border-gray-300 px-2 py-1 text-left text-xs">
                                                    {yarnItem?.style}
                                                </td>
                                                <td className="w-48 border border-gray-300 text-[11px] py-1 px-2">
                                                    {yarnItem?.Yarn?.name}
                                                </td>
                                                <td className="w-48 border border-gray-300 text-[11px] py-1 px-2">
                                                    {yarnItem?.Color?.name}
                                                </td>
                                                <td className="w-28 border border-gray-300 text-right text-[11px] py-1 px-2">
                                                    {parseFloat(yarnItem?.requiredQty)?.toFixed(3)}
                                                </td>
                                                {/* <td className="w-28 border border-gray-300 text-right text-[11px] py-1 px-2">
                                                    {parseFloat(yarnItem?.currentStock)?.toFixed(3)}
                                                </td> */}

                                                <td className="w-28 border border-gray-300 text-right text-[11px] py-1 px-2">
                                                    {/* {Math.max(
                                                        parseFloat(yarnItem?.requiredQty || 0) -
                                                        parseFloat(yarnItem?.currentStock || 0),
                                                        0
                                                    ).toFixed(3)
                                                    } */}
                                                    {parseFloat(yarnItem?.remainingQty || 0).toFixed(3)}
                                                </td>


                                                <td className="w-28 border border-gray-300 text-right text-[11px] py-1 px-2">
                                                    <input
                                                        className=" rounded px-1 ml-2 w-full py-0.5 text-xs focus:outline-none text-right"
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={(yarnItem?.transferQty || 0)}



                                                        onFocus={(e) => e.target.select()}
                                                        disabled={readOnly}
                                                        onKeyDown={(e) => {
                                                            if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                                                        }}
                                                        onChange={(e) => {
                                                            const val = e.target.value;

                                                            if (parseFloat(val) > parseFloat(yarnItem?.remainingQty)) {

                                                                Swal.fire({
                                                                    title: "Transfer Qty cannot Be More than Balance Qty",
                                                                    icon: "Warning",

                                                                });
                                                            }
                                                            else {
                                                                handleInputChangeToOrder(val === "" ? 0 : val, index, "transferQty", yarnItem);
                                                            }
                                                        }}
                                                        // onBlur={(e) => {
                                                        //     const formatted = e.target.value === "" ? "" : Number(e.target.value).toFixed(3);
                                                        //     e.target.value = formatted;
                                                        //     if (parseFloat(formatted) <= parseFloat(yarnItem?.requiredQty)) {

                                                        //         handleInputChangeToOrder(formatted, index, "transferQty");

                                                        //     }
                                                        // }}
                                                        placeHolder="0.000"
                                                    />
                                                </td>
                                            </tr>
                                        ))}

                                    </tbody>

                                </table>
                            </div>
                            {contextMenuToOrder && (
                                <div
                                    style={{
                                        position: "absolute",
                                        top: `${contextMenuToOrder.mouseY - 50}px`,
                                        left: `${contextMenuToOrder.mouseX + 20}px`,
                                        boxShadow: "0px 0px 5px rgba(0,0,0,0.3)",
                                        padding: "8px",
                                        borderRadius: "4px",
                                        zIndex: 1000,
                                    }}
                                    className="bg-gray-100"
                                    onMouseLeave={handleCloseContextMenuToOrder}
                                >
                                    <div className="flex flex-col gap-1">
                                        <button
                                            className="text-black text-[12px] text-left rounded px-1"
                                            onClick={() => {
                                                deleteToOrderRow(contextMenuToOrder.rowId);
                                                handleCloseContextMenuToOrder();
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>

            </div>
            <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm h-[240px] ">


                <div className="flex flex-row gap-7">
                    <div className="flex justify-between items-center ">
                        <h2 className="font-medium text-slate-700">From Order Details (From stock)
                            <span
                                // className="ml-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent font-semibold"
                                className="ml-4 text-purple-400 font-bold"
                            >
                                {transferType == "General" ? "General" : findFromList(fromOrderId, orderData, "docId")}

                            </span>
                        </h2>
                    </div>
                    <button
                        onClick={() => {
                            setTableStockDataView(true)
                        }

                        }
                        disabled={id}
                        // onMouseEnter={() => setTooltipVisible(true)}
                        // onMouseLeave={() => setTooltipVisible(false)}
                        className="text-blue-800 rounded h-full py-1  text-lg focus:outline-none"
                    >
                        <span className=''>👁</span>
                    </button>
                </div>


                <div className="flex flex-row gap-40 ">
                    <div className="w-[70%] flex flex-col">
                        <div className="justify-end items-center ">
                            <div className="h-[140px] overflow-y-auto ">
                                <table className="w-full border-collapse ">
                                    <thead className="bg-gray-200 text-gray-800 sticky top-0 z-10">
                                        <tr>
                                            <th className="border border-gray-300 px-2 py-1 text-center text-xs w-11">S No</th>
                                            {fromOrderId && (

                                                <th className="px-4 py-1.5 border border-gray-300 text-center text-xs">Style</th>
                                            )}
                                            <th className="w-48 px-4 py-1.5 border border-gray-300 text-center  text-xs">Yarn</th>
                                            <th className="w-48 px-4 py-1.5 border border-gray-300 text-center text-xs">Color</th>
                                            <th className="w-12 px-4 py-1.5 border border-gray-300  text-xs">Stock Qty (Kgs)</th>
                                            <th className="w-12 px-4 py-1.5 border border-gray-300  text-xs">Issue Qty (Kgs)</th>
                                            {/* <th className="w-12 px-4 py-1.5 border border-gray-300  text-xs">Balance Transfer Qty (Kgs)</th> */}

                                        </tr>
                                    </thead>

                                    <tbody>
                                        {stockItems?.map((stock, index) => (
                                            <tr
                                                key={index}
                                                className={`hover:bg-gray-50 py-1 transition-colors border-b border-gray-200 text-[12px] ${index % 2 === 0 ? "bg-white" : "bg-gray-100"
                                                    }`}
                                                onContextMenu={(e) => {
                                                    if (!readOnly) {
                                                        handleRightClickFromOrder(e, index, "notes");
                                                    }
                                                }}
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
                                                <td className="w-48 border border-gray-300 text-[11px] py-1 px-2">
                                                    {findFromList(stock?.colorId, colorList, "name")}

                                                </td>
                                                <td className="w-12 border border-gray-300 text-[11px] text-right py-1 px-2">
                                                    {parseFloat(stock?.stockQty).toFixed(3)}

                                                </td>

                                                <td className="w-12 border border-gray-300 text-right text-[11px] py-1 px-2 text-xs">
                                                    <input
                                                        className=" rounded px-1 ml-2 w-full py-0.5 text-xs focus:outline-none text-right"
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={parseFloat(stock?.transferQty || 0).toFixed(3)}
                                                        // value={item?.quantity ? item.quantity.toFixed(3) : ""}




                                                        disabled={true}
                                                        onKeyDown={(e) => {
                                                            if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                                                        }}
                                                        onChange={(e) => {
                                                            const val = e.target.value;


                                                            if (val <= parseFloat(stock?._sum?.qty ?? 0)) {
                                                                if (/^\d+(\.\d{2})$/.test(val)) {
                                                                }
                                                                handleInputChangeFromOrder(val, index, "transferQty", stock);
                                                            } else {
                                                                Swal.fire({
                                                                    title: "Transfer Qty cannot be more than Stock Qty",
                                                                    icon: "warning",

                                                                });
                                                            }
                                                        }}
                                                        onBlur={(e) => {
                                                            const formatted =
                                                                e.target.value === "" ? "" : Number(e.target.value).toFixed(3);
                                                            e.target.value = formatted;
                                                            if (formatted <= parseFloat(stock?._sum?.qty ?? 0)) {
                                                                handleInputChangeFromOrder(formatted, index, "transferQty");
                                                            }
                                                        }}
                                                        placeHolder="0.000"
                                                    />
                                                </td>

                                            </tr>
                                        ))}

                                    </tbody>
                                </table>
                            </div>

                            {contextMenuFromOrder && (
                                <div
                                    style={{
                                        position: "absolute",
                                        top: `${contextMenuFromOrder.mouseY - 50}px`,
                                        left: `${contextMenuFromOrder.mouseX + 20}px`,
                                        boxShadow: "0px 0px 5px rgba(0,0,0,0.3)",
                                        padding: "8px",
                                        borderRadius: "4px",
                                        zIndex: 1000,
                                    }}
                                    className="bg-gray-100"
                                    onMouseLeave={handleCloseContextMenuFromOrder}
                                >
                                    <div className="flex flex-col gap-1">
                                        <button
                                            className="text-black text-[12px] text-left rounded px-1"
                                            onClick={() => {
                                                deleteFromOrderRow(contextMenuFromOrder.rowId);
                                                handleCloseContextMenuFromOrder();
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>






        </>
    )
}

export default FormItems;
















