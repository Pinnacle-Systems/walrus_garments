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
import OrderToGeneral from "./OrderToGeneral";

const FormItems = ({ setOrderItems, orderItems, readOnly, colorList, transferType, singleData, id,
    yarnList, setRequirementId, stockItems, setStockItems, setTempOrderItems, tempOrderItems, tempStockItems, setTempStockItems,
    toOrderId, fromOrderId, orderData, fromLocation, locationData, sizeList, itemList, uomList


}) => {


    console.log(tempStockItems, "tempStockItems")
    console.log(tempOrderItems, "tempOrderItems")
    console.log(stockItems, "stockItems")





    const [tableDataView, setTableDataView] = useState(false)
    const [tableStockDataView, setTableStockDataView] = useState(false)
    const [orderToGeneral, setOrderToGeneral] = useState(false)




    function deleteFromOrderRow(index) {
        if (readOnly) return toast.info("Turn on Edit Mode...!!!")
        setStockItems(prev => prev.filter((_, i) => i !== index))
    }

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





    function handleInputChangeFromOrder(value, index, field) {

        setStockItems(stock => {
            const newBlend = structuredClone(stock);
            newBlend[index][field] = parseFloat(value);
            return newBlend
        });


    };





















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
            <Modal
                isOpen={orderToGeneral}
                // onClose={() => setOrderToGeneral(false)}
                widthClass="  h-[70%] w-[80%]"
            >
                <OrderToGeneral
                    tempOrderItems={tempOrderItems}
                    setOrderItems={setOrderItems} orderItems={orderItems}
                    setTempOrderItems={setTempOrderItems}
                    tempStockItems={tempStockItems} setTempStockItems={setTempStockItems} stockItems={stockItems} setStockItems={setStockItems}
                    onClose={() => setOrderToGeneral(false)}
                    colorList={colorList} yarnList={yarnList}
                    fromOrderId={fromOrderId}
                    itemList={itemList} uomList={uomList}
                    sizeList={sizeList}

                />
            </Modal>




            <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm h-[500px] ">


                <div className="flex flex-row gap-7">
                    <div className="flex justify-between items-center ">
                        <h2 className="font-medium text-slate-700">(From Location Stock)
                            <span
                                // className="ml-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent font-semibold"
                                className="ml-4 text-purple-400 font-bold"
                            >
                                {findFromList(fromLocation, locationData?.data, "storeName")}
                            </span>
                        </h2>
                    </div>
                    <button
                        onClick={() => {
                            setOrderToGeneral(true)
                        }}
                        disabled={id}

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

                                            <th className="w-48 px-4 py-1.5 border border-gray-300 text-center  text-xs">Item</th>
                                            <th className="w-48 px-4 py-1.5 border border-gray-300 text-center  text-xs">Size</th>

                                            <th className="w-48 px-4 py-1.5 border border-gray-300 text-center text-xs">Color</th>
                                            <th className="w-12 px-4 py-1.5 border border-gray-300  text-xs">Stock Qty (Pcs)</th>
                                            <th className="w-12 px-4 py-1.5 border border-gray-300  text-xs">Transfer Qty (Pcs)</th>
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

                                                <td className="w-72 border border-gray-300 px-2 py-1 text-left text-xs">
                                                    {findFromList(stock?.itemId, itemList, "name")}
                                                </td>
                                                <td className="w-48 border border-gray-300 text-[11px] py-1 px-2">
                                                    {findFromList(stock?.sizeId, sizeList, "name")}

                                                </td>
                                                <td className="w-48 border border-gray-300 text-[11px] py-1 px-2">
                                                    {findFromList(stock?.colorId, colorList, "name")}

                                                </td>
                                                <td className="w-12 border border-gray-300 text-[11px] text-right py-1 px-2">
                                                    {parseFloat(stock?._sum?.qty).toFixed(3)}

                                                </td>

                                                <td className="w-12 border border-gray-300 text-right text-[11px] py-1 px-2 text-xs">
                                                    <input
                                                        className=" rounded px-1 ml-2 w-full py-0.5 text-xs focus:outline-none text-right"
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={parseFloat(stock?.transferQty || 0)}




                                                        onKeyDown={(e) => {
                                                            if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                                                        }}
                                                        onFocus={(e) => e.target.select()}
                                                        onChange={(e) => {
                                                            const val = e.target.value;

                                                            if (parseFloat(val) <= parseFloat(stock?._sum?.qty).toFixed(3)) {

                                                                handleInputChangeFromOrder(val, index, "transferQty", stock);
                                                            } else {
                                                                Swal.fire({
                                                                    title: "Transfer Qty cannot be more than Stock Qty",
                                                                    icon: "warning",
                                                                });
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
















