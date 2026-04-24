import React, { useEffect, useRef, useState } from "react"
import { HiPencil, HiPlus, HiTrash } from "react-icons/hi"
import { toast } from "react-toastify";
import Modal from "../../../UiComponents/Modal";
import StockTransferDetails from "./TranferItems";
import { useGetStockTransferQuery } from "../../../redux/uniformService/StockTransferService";
import { useGetStockQuery } from "../../../redux/services/StockService";
import { findFromList } from "../../../Utils/helper";
import Swal from "sweetalert2";
import OrderToGeneral from "./OrderToGeneral";
import TransferItems from "./TranferItems";
import TransactionLineItemsSection, {
    standardTransactionPlaceholderRowCount,
    transactionTableClassName,
    transactionTableHeadClassName,
} from "../ReusableComponents/TransactionLineItemsSection";

const FormItems = ({ setOrderItems, orderItems, readOnly, colorList, transferType, singleData, id,
    yarnList, setRequirementId, stockItems, setStockItems, setTempOrderItems, tempOrderItems, tempStockItems, setTempStockItems,
    toOrderId, fromOrderId, orderData, fromLocationId, locationData, sizeList, itemList, uomList, toLocationId,
    orderToGeneral, setOrderToGeneral, searchColor, setSearchColor, searchItem, setSearchItem, searchSize, setSearchSize
    , stockDrivenFields = [], itemPriceList = [], offersData = [], collectionsData = []

}) => {


    console.log(tempStockItems, "tempStockItems")
    console.log(tempOrderItems, "tempOrderItems")
    console.log(stockItems, "stockItemsstockItems")

    useEffect(() => {
        console.log(stockItems?.length, "length for stockItems", stockItems?.length >= standardTransactionPlaceholderRowCount)

        if (stockItems?.length >= standardTransactionPlaceholderRowCount) return;

        console.log("setting stock Items")

        setStockItems((prev) => {
            let newArray = Array.from({ length: standardTransactionPlaceholderRowCount - prev.length }, (i) => {
                return {
                    itemId: "",
                    sizeId: "",
                    colorId: "",
                    uomId: "",

                };
            });
            return [...prev, ...newArray];
        });
    }, [setStockItems, stockItems, id]);


    console.log(stockItems, "length for stockItems", stockItems?.length >= standardTransactionPlaceholderRowCount)



    function deleteFromOrderRow(index) {
        if (readOnly) return toast.info("Turn on Edit Mode...!!!")
        setStockItems(prev => prev.filter((_, i) => i !== index))
    }
    const handleDeleteAllRows = () => {
        setStockItems([]);
    };

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

            // Avoid parseFloat for string fields like barcode or clearanceBarcode
            if (field === "clearanceBarcode" || field === "barcode") {
                newBlend[index][field] = value;
            } else {
                newBlend[index][field] = parseFloat(value);
            }

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
                isOpen={orderToGeneral}
                widthClass="  h-[94%] w-[90%]"
                onClose={() => setOrderToGeneral(false)}
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
                panelClassName="flex-grow min-h-0"
                titleClassName="font-bold"
                contentClassName="!py-0 flex flex-col"
            >
                <div className="flex-grow overflow-auto min-h-0">
                    <table className={`${transactionTableClassName} min-w-[1000px]`}>
                        <thead className={`${transactionTableHeadClassName} shadow-sm`}>
                            <tr className="py-2">
                                <th className="bg-gray-300 px-1 py-1 text-center font-medium text-[12px] w-12">S.No</th>
                                <th className="w-48 bg-gray-300 px-1 py-1 text-center font-medium text-[12px]">Item</th>
                                <th className="w-16 bg-gray-300 px-1 py-1 text-center font-medium text-[12px]">Size</th>
                                <th className="w-48 bg-gray-300 px-1 py-1 text-center font-medium text-[12px]">Color</th>
                                <th className="w-48 bg-gray-300 px-1 py-1 text-center font-medium text-[12px]">BarCode</th>
                                {stockDrivenFields.map((field) => (
                                    <th key={field.key} className="w-32 bg-gray-300 px-1 py-1 text-center font-medium text-[12px]">{field.label}</th>
                                ))}
                                <th className="w-20 bg-gray-300 px-1 py-1 text-center font-medium text-[12px]">Stock Qty (Pcs)</th>
                                {findFromList(toLocationId, locationData?.data, "storeName") == "DISCOUNT SECTION" && (

                                    <th className="w-20 bg-gray-300 px-1 py-1 text-center font-medium text-[12px]">Discount Price</th>
                                )}
                                <th className="w-20 bg-gray-300 px-1 py-1 text-center font-medium text-[12px]">Transfer Qty (Pcs)<span className="text-red-500">*</span></th>

                            </tr>
                        </thead>


                        <tbody className="bg-white">
                            {stockItems?.map((item, index) => <TransferItems
                                key={item.id || index}
                                item={item} index={index} handleRightClickFromOrder={handleRightClickFromOrder}
                                readOnly={readOnly} handleInputChangeFromOrder={handleInputChangeFromOrder}
                                itemList={itemList} sizeList={sizeList} colorList={colorList} fromLocationId={fromLocationId}
                                stockItems={stockItems} toLocationId={toLocationId} locationData={locationData}
                                stockDrivenFields={stockDrivenFields} id={id}
                                itemPriceList={itemPriceList}
                                offersData={offersData}
                                collectionsData={collectionsData}
                            />)}
                        </tbody>
                        <tfoot className="sticky bottom-0 z-20 border-t-2 border-gray-300 font-bold shadow-[0_-1px_0_0_rgba(203,213,225,1)]">
                            <tr>
                                <td
                                    colSpan={findFromList(toLocationId, locationData?.data, "storeName") == "DISCOUNT SECTION" ? 6 + stockDrivenFields.length : 5 + stockDrivenFields.length}
                                    className="bg-gray-300 px-1 py-1 text-right text-[12px]"
                                >
                                </td>
                                <td className="bg-gray-300 px-1 py-1 text-right text-[11px] px-2">
                                    Total :
                                </td>
                                <td className="bg-gray-300 px-1 py-1 text-right text-[11px] px-2">
                                    {(stockItems || [])?.reduce((acc, curr) => acc + parseFloat(curr?.transferQty || 0), 0).toFixed(2)}
                                </td>

                            </tr>
                        </tfoot>
                    </table>
                </div>

                {contextMenuFromOrder && (
                    <div
                        style={{
                            position: "absolute",
                            top: `${contextMenuFromOrder.mouseY - 250}px`,
                            left: `${contextMenuFromOrder.mouseX - 10}px`,
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
                            <button
                                className=" text-black text-[12px] text-left rounded px-1"
                                onClick={() => {
                                    handleDeleteAllRows();
                                    handleCloseContextMenu();
                                }}
                            >
                                Delete All
                            </button>
                        </div>
                    </div>
                )}
            </TransactionLineItemsSection>





        </>
    )
}

export default FormItems;













