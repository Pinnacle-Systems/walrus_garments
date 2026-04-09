import React, { useEffect, useRef, useState } from "react"
import { HiPencil, HiPlus, HiTrash } from "react-icons/hi"
import { toast } from "react-toastify";
import Modal from "../../../UiComponents/Modal";
import StockTransferDetails from "./TranferItems";
import { useGetStockTransferQuery } from "../../../redux/uniformService/StockTransferService";
import { useGetStockQuery } from "../../../redux/services/StockService";
import { findFromList } from "../../../Utils/helper";
import ToOrderDetails from "./TranferItems";
import FromOrderDetails from "./FromOrderDetails";
import Swal from "sweetalert2";
import OrderToGeneral from "./OrderToGeneral";
import TransferItems from "./TranferItems";
import TransactionLineItemsSection, {
    transactionTableClassName,
    transactionTableHeadClassName,
} from "../ReusableComponents/TransactionLineItemsSection";

const FormItems = ({ setOrderItems, orderItems, readOnly, colorList, transferType, singleData, id,
    yarnList, setRequirementId, stockItems, setStockItems, setTempOrderItems, tempOrderItems, tempStockItems, setTempStockItems,
    toOrderId, fromOrderId, orderData, fromLocationId, locationData, sizeList, itemList, uomList, toLocationId,
    orderToGeneral, setOrderToGeneral, searchColor, setSearchColor, searchItem, setSearchItem, searchSize, setSearchSize
    , stockDrivenFields = []

}) => {


    console.log(tempStockItems, "tempStockItems")
    console.log(tempOrderItems, "tempOrderItems")
    console.log(stockItems, "stockItems")

    useEffect(() => {
        if (stockItems?.length >= 15) return;
        setStockItems((prev) => {
            let newArray = Array.from({ length: 15 - prev.length }, (i) => {
                return {
                    itemId: "",
                    sizeId: "",
                    colorId: "",
                    uomId: "",

                };
            });
            return [...prev, ...newArray];
        });
    }, [setStockItems, stockItems]);



    const [tableDataView, setTableDataView] = useState(false)
    const [tableStockDataView, setTableStockDataView] = useState(false)




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








    const formatThreeDecimals = (value) => {
        const parsed = parseFloat(value);
        return Number.isFinite(parsed) ? parsed.toFixed(3) : "0.000";
    };

    const formatTwoDecimals = (value) => {
        const parsed = parseFloat(value);
        return Number.isFinite(parsed) ? parsed.toFixed(2) : "0.00";
    };












    return (
        <>

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
                widthClass="  h-[94%] w-[90%]"
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
                    fromLocationId={fromLocationId} locationData={locationData}
                    searchItem={searchItem} setSearchItem={setSearchItem}
                    searchColor={searchColor} setSearchColor={setSearchColor}
                    searchSize={searchSize} setSearchSize={setSearchSize}
                    stockDrivenFields={stockDrivenFields}

                />
            </Modal>

            <TransactionLineItemsSection
                // title="Transfer Items"
                panelClassName="h-full"
                titleClassName="font-bold"
                contentClassName="h-[380px]"
            >
                <table className={transactionTableClassName}>
                    <thead className={transactionTableHeadClassName}>
                        <tr>
                            <th className="border border-gray-300 px-2 py-1 text-center text-xs w-11 bg-gray-300">S No</th>
                            <th className="w-48 px-4 py-1.5 border border-gray-300 text-center  text-xs bg-gray-300">Item</th>
                            <th className="w-16 px-4 py-1.5 border border-gray-300 text-center  text-xs bg-gray-300">Size</th>
                            <th className="w-48 px-4 py-1.5 border border-gray-300 text-center text-xs bg-gray-300">Color</th>
                            <th className="w-48 px-4 py-1.5 border border-gray-300 text-center  text-xs bg-gray-300">BarCode</th>
                            {stockDrivenFields.map((field) => (
                                <th key={field.key} className="w-32 px-4 py-1.5 border border-gray-300 text-center text-xs bg-gray-300">{field.label}</th>
                            ))}
                            <th className="w-20 px-4 py-1.5 border border-gray-300  text-xs bg-gray-300">Stock Qty (Pcs)</th>
                            {findFromList(toLocationId, locationData?.data, "storeName") == "DISCOUNT SECTION" && (

                                <th className="w-20 px-4 py-1.5 border border-gray-300 text-center text-xs bg-gray-300">Discount Price</th>
                            )}
                            <th className="w-20 px-4 py-1.5 border border-gray-300  text-xs bg-gray-300">Transfer Qty (Pcs)<span className="text-red-500">*</span></th>

                        </tr>
                    </thead>


                    <tbody>
                        {stockItems?.map((item, index) => <TransferItems
                            item={item} index={index} handleRightClickFromOrder={handleRightClickFromOrder}
                            readOnly={readOnly} handleInputChangeFromOrder={handleInputChangeFromOrder}
                            itemList={itemList} sizeList={sizeList} colorList={colorList} fromLocationId={fromLocationId}
                            stockItems={stockItems} toLocationId={toLocationId} locationData={locationData}
                            stockDrivenFields={stockDrivenFields}
                        />)}
                    </tbody>
                    <tfoot className="sticky bottom-0 z-20 border-t-2 border-gray-300  font-bold shadow-[0_-1px_0_0_rgba(203,213,225,1)]">
                        <tr className="bg-gray-300">
                            <td
                                colSpan={5}
                                className="bg-gray-300 px-1 py-1 text-right text-[12px]"
                            >
                                Total:
                            </td>
                            <td className="bg-gray-300 px-1 py-1 text-right text-[11px]">
                            </td>
                            <td className="bg-gray-300 px-1 py-1 text-right text-[11px] px-2">
                                {(stockItems || [])?.reduce((acc, curr) => acc + parseFloat(curr?.transferQty || 0), 0).toFixed(2)}
                            </td>

                        </tr>
                    </tfoot>
                </table>

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
            </TransactionLineItemsSection>





        </>
    )
}

export default FormItems;













