import React, { useEffect, useRef, useState } from "react"
import { HiPencil, HiPlus, HiTrash } from "react-icons/hi"
import YarnDetails from "./YarnDetails";
import { toast } from "react-toastify";
import Modal from "../../../UiComponents/Modal";
import StockTransferDetails from "./StockTransferDetails";
import { useGetStockTransferQuery } from "../../../redux/uniformService/StockTransferService";
import { useGetStockQuery } from "../../../redux/services/StockService";
import { findFromList } from "../../../Utils/helper";
import YarnTransferDetails from "./StockTransferDetails";
import StockDetails from "./StockDetails";

const FormItems = ({ setOrderItems, orderItems, readOnly, colorList,
    yarnList, setRequirementId, stockItems, setStockItems, setTempOrderItems, tempOrderItems, tempStockItems, setTempStockItems,
    toOrderId, fromOrderId, orderData


}) => {


    console.log(fromOrderId, toOrderId, "toOrderId", orderData)



    const [tableDataView, setTableDataView] = useState(false)
    const [tableStockDataView, setTableStockDataView] = useState(false)


    function deleteRow(index) {
        console.log(index, "index")
        if (readOnly) return toast.info("Turn on Edit Mode...!!!")
        setOrderItems(prev => prev.filter((_, i) => i !== index))
    }


    const [contextMenu, setContextMenu] = useState(null);


    const handleRightClick = (event, rowIndex, type) => {
        event.preventDefault();
        setContextMenu({
            mouseX: event.clientX,
            mouseY: event.clientY,
            rowId: rowIndex,
            type,
        });
    };

    const handleCloseContextMenu = () => {
        setContextMenu(null);
    };

    function deleteRow(index) {
        console.log(index, "index")
        if (readOnly) return toast.info("Turn on Edit Mode...!!!")
        setOrderItems(prev => prev.filter((_, i) => i !== index))
    }




    function handleInputChange(value, index, field, stock) {


        console.log(stock, "stock",)


        setStockItems(stock => {
            const newBlend = structuredClone(stock);
            if (stock)
                newBlend[index][field] = parseFloat(value);
            return newBlend
        });



    };


    function handleInputChangeOrder(value, index, field) {


        console.log(value, "value", index)


        setOrderItems(stock => {
            const newBlend = structuredClone(stock);
            newBlend[index][field] = parseFloat(value);
            return newBlend
        }
        );
    };



    return (
        <>
            <Modal
                isOpen={tableDataView}
                onClose={() => setTableDataView(false)}
                widthClass=" h-[70%] w-[70%]"
            >
                <YarnTransferDetails
                    tempOrderItems={tempOrderItems}
                    setOrderItems={setOrderItems} orderItems={orderItems}
                    setTempOrderItems={setTempOrderItems}
                    tempStockItems={tempStockItems} setTempStockItems={setTempStockItems} stockItems={stockItems} setStockItems={setStockItems}
                    onClose={() => setTableDataView(false)}

                />
            </Modal>
            <Modal
                isOpen={tableStockDataView}
                onClose={() => setTableStockDataView(false)}
                widthClass="  h-[70%] w-[50%]"
            >
                <StockDetails
                    tempOrderItems={tempOrderItems}
                    setOrderItems={setOrderItems} orderItems={orderItems}
                    setTempOrderItems={setTempOrderItems}
                    tempStockItems={tempStockItems} setTempStockItems={setTempStockItems} stockItems={stockItems} setStockItems={setStockItems}
                    onClose={() => setTableStockDataView(false)}
                    colorList={colorList} yarnList={yarnList}

                />
            </Modal>
            <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm h-[180px] mb-4">


                <div className="flex flex-row gap-5">
                    <div className="flex justify-between items-center ">
                        <h2 className="font-medium text-slate-700">From Order Details
                            <span className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 bg-clip-text text-transparent font-semibold ml-4">
                                {findFromList(fromOrderId, orderData, "docId")}
                            </span>
                        </h2>
                    </div>
                    <button
                        onClick={() => {
                            setTableDataView(true)
                        }

                        }
                        // onMouseEnter={() => setTooltipVisible(true)}
                        // onMouseLeave={() => setTooltipVisible(false)}
                        className="text-blue-800 rounded h-full py-1  text-lg focus:outline-none"
                    >
                        <span className=''>👁</span>
                    </button>
                </div>
                <div className="flex flex-row gap-40 ">
                    <div className="w-[81%] flex flex-col">
                        <div className="justify-end items-center ">
                            <div className="max-h-[140px] overflow-y-auto ">
                                <table className="w-full border-collapse table-fixed">
                                    <thead className="bg-gray-200 text-gray-800 sticky top-0 z-10">
                                        <tr>
                                            <th className="border border-gray-300 px-2 py-1 text-center text-xs w-11">S No</th>
                                            <th className="border border-gray-300 px-2 py-1 text-center text-xs w-72">Style Name</th>
                                            <th className="w-72 px-4 py-1.5 border border-gray-300 text-center  text-xs">Yarn</th>
                                            <th className="w-72 px-4 py-1.5 border border-gray-300 text-center text-xs">Color</th>
                                            <th className="w-24 px-4 py-1.5 border border-gray-300  text-xs">Required Qty (Kgs)</th>
                                            <th className="w-24 px-4 py-1.5 border border-gray-300  text-xs">Balance Qty</th>

                                            <th className="w-32 px-4 py-1.5 border border-gray-300  text-xs">Transfer Qty (Kgs)</th>

                                        </tr>
                                    </thead>


                                    <tbody>
                                        {(orderItems ?? []).map((yarnItem, index) => (
                                            <tr
                                                key={index}
                                                className={`hover:bg-gray-50 transition-colors border-b border-gray-200 text-[12px] ${index % 2 === 0 ? "bg-white" : "bg-gray-100"
                                                    }`}
                                                onClick={() => setRequirementId(yarnItem?.requirementPlanningFormId)}
                                            >
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
                                                    {yarnItem?.balaneQty?.toFixed(3)}
                                                </td>
                                                {/* <td className="w-28 border border-gray-300 text-right text-[11px] py-1.5 px-2">
                                                    <input
                                                        min="0"
                                                        type="number"
                                                        className="text-right rounded py-1 px-1 w-full "
                                                        onFocus={(e) => e.target.select()}
                                                        value={(yarnItem?.transferQty || "0.000")
                                                        }
                                                        onChange={(e) => handleInputChangeOrder(e.target.value, index, "transferQty")}
                                                        onBlur={(e) => {
                                                            handleInputChangeOrder((e.target.value), index, "transferQty")
                                                        }
                                                        }
                                                    />
                                                </td> */}
                                                <td className="w-28 border border-gray-300 text-right text-[11px] py-1.5 px-2">
                                                    <input
                                                        className=" rounded px-1 ml-2 w-full py-0.5 text-xs focus:outline-none text-right"
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={yarnItem?.transferQty || ""}
                                                        // value={item?.quantity ? item.quantity.toFixed(3) : ""}




                                                        disabled={readOnly}
                                                        onKeyDown={(e) => {
                                                            if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                                                        }}
                                                        onChange={(e) => {
                                                            const val = e.target.value;

                                                            handleInputChangeOrder(
                                                                val === "" ? "" : val,
                                                                index,
                                                                "transferQty",

                                                            );
                                                        }}
                                                        onBlur={(e) => {
                                                            const formatted =
                                                                e.target.value === "" ? "" : Number(e.target.value).toFixed(3);
                                                            e.target.value = formatted;
                                                            handleInputChangeOrder(formatted, index, "transferQty");
                                                        }}
                                                        placeHolder="0.00"
                                                    />
                                                </td>
                                            </tr>
                                        ))}

                                    </tbody>
                                </table>
                            </div>

                            {contextMenu && (
                                <div
                                    style={{
                                        position: "absolute",
                                        top: `${contextMenu.mouseY - 50}px`,
                                        left: `${contextMenu.mouseX + 20}px`,
                                        boxShadow: "0px 0px 5px rgba(0,0,0,0.3)",
                                        padding: "8px",
                                        borderRadius: "4px",
                                        zIndex: 1000,
                                    }}
                                    className="bg-gray-100"
                                    onMouseLeave={handleCloseContextMenu}
                                >
                                    <div className="flex flex-col gap-1">
                                        <button
                                            className="text-black text-[12px] text-left rounded px-1"
                                            onClick={() => {
                                                deleteRow(contextMenu.rowId);
                                                handleCloseContextMenu();
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
            <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm h-[180px] ">


                <div className="flex flex-row gap-7">
                    <div className="flex justify-between items-center ">
                        <h2 className="font-medium text-slate-700">To Order Details  <span
                            className="ml-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent font-semibold"
                        >
                            {findFromList(toOrderId, orderData, "docId")}
                        </span>    </h2>
                    </div>
                    <button
                        onClick={() => {
                            setTableStockDataView(true)
                        }

                        }
                        // onMouseEnter={() => setTooltipVisible(true)}
                        // onMouseLeave={() => setTooltipVisible(false)}
                        className="text-blue-800 rounded h-full py-1  text-lg focus:outline-none"
                    >
                        <span className=''>👁</span>
                    </button>
                </div>


                <div className="flex flex-row gap-40 ">
                    <div className="w-[81%] flex flex-col">
                        <div className="justify-end items-center ">
                            <div className="h-[140px] overflow-y-auto ">
                                <table className="w-full border-collapse ">
                                    <thead className="bg-gray-200 text-gray-800 sticky top-0 z-10">
                                        <tr>
                                            <th className="border border-gray-300 px-2 py-1 text-center text-xs w-11">S No</th>
                                            <th className="w-48 px-4 py-1.5 border border-gray-300 text-center  text-xs">Yarn</th>
                                            <th className="w-48 px-4 py-1.5 border border-gray-300 text-center text-xs">Color</th>
                                            <th className="w-12 px-4 py-1.5 border border-gray-300  text-xs">Stock Qty (Kgs)</th>
                                            <th className="w-12 px-4 py-1.5 border border-gray-300  text-xs">Transfer Qty (Kgs)</th>

                                        </tr>
                                    </thead>

                                    <tbody>
                                        {stockItems?.map((stock, index) => (
                                            <tr
                                                key={index}
                                                className={`hover:bg-gray-50 py-1 transition-colors border-b border-gray-200 text-[12px] ${index % 2 === 0 ? "bg-white" : "bg-gray-100"
                                                    }`}
                                            >
                                                <td className="w-5 border border-gray-300 px-2 py-1 text-center text-xs">
                                                    {index + 1}
                                                </td>
                                                <td className="w-72 border border-gray-300 px-2 py-1 text-left text-xs">
                                                    {findFromList(stock?.yarnId, yarnList, "name")}
                                                </td>
                                                <td className="w-48 border border-gray-300 text-[11px] py-1.5 px-2">
                                                    {findFromList(stock?.colorId, colorList, "name")}

                                                </td>
                                                <td className="w-12 border border-gray-300 text-[11px] text-right py-1.5 px-2">
                                                    {parseFloat(stock?._sum?.qty).toFixed(2)}

                                                </td>

                                                <td className="w-12 border border-gray-300 text-right text-[11px] py-1.5 px-2">
                                                    <input
                                                        className=" rounded px-1 ml-2 w-full py-0.5 text-xs focus:outline-none text-right"
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={stock?.transferQty || ""}
                                                        // value={item?.quantity ? item.quantity.toFixed(3) : ""}




                                                        disabled={readOnly}
                                                        onKeyDown={(e) => {
                                                            if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                                                        }}
                                                        onChange={(e) => {
                                                            const val = e.target.value;

                                                            // handleInputChange(
                                                            //     val === "" ? "" : val,
                                                            //     index,
                                                            //     "transferQty",

                                                            // );
                                                            if (val <= parseFloat(stock?._sum?.qty ?? 0)) {
                                                                // ✅ If user typed two decimals, fix it immediately
                                                                if (/^\d+(\.\d{2})$/.test(val)) {
                                                                }
                                                                handleInputChange(val, index, "transferQty", stock);
                                                            } else {
                                                                toast.info("Transfer Qty cannot be more than Stock Qty");
                                                            }
                                                        }}
                                                        onBlur={(e) => {
                                                            const formatted =
                                                                e.target.value === "" ? "" : Number(e.target.value).toFixed(3);
                                                            e.target.value = formatted;
                                                            handleInputChange(formatted, index, "transferQty");
                                                        }}
                                                        placeHolder="0.00"
                                                    />
                                                </td>
                                            </tr>
                                        ))}

                                    </tbody>
                                </table>
                            </div>

                            {contextMenu && (
                                <div
                                    style={{
                                        position: "absolute",
                                        top: `${contextMenu.mouseY - 50}px`,
                                        left: `${contextMenu.mouseX + 20}px`,
                                        boxShadow: "0px 0px 5px rgba(0,0,0,0.3)",
                                        padding: "8px",
                                        borderRadius: "4px",
                                        zIndex: 1000,
                                    }}
                                    className="bg-gray-100"
                                    onMouseLeave={handleCloseContextMenu}
                                >
                                    <div className="flex flex-col gap-1">
                                        <button
                                            className="text-black text-[12px] text-left rounded px-1"
                                            onClick={() => {
                                                deleteRow(contextMenu.rowId);
                                                handleCloseContextMenu();
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
















