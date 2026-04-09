import { useEffect, useState } from 'react';
import YarnDirectItem from './YarnDirectItem';
import { capitalizeFirstLetter } from '../../../Utils/helper';
import Swal from 'sweetalert2';
import TransactionLineItemsSection, {
    standardTransactionPlaceholderRowCount,
    transactionTableClassName,
    transactionTableHeadClassName,
} from "../ReusableComponents/TransactionLineItemsSection";


const YarnDirectInwardItems = ({ deleteRow, handleInputChange, directInwardReturnItems,
    setDirectInwardReturnItems, readOnly, sizeList, itemList, colorList, uomList, stockControlData, storeId, setInwardItemSelection, supplierId, purchaseInwardId, handlers, headerOpen, movedToNextSaveNewRef

}) => {

    const [contextMenu, setContextMenu] = useState(false)

    const handleCloseContextMenu = () => {
        setContextMenu(null);
    };
    const handleRightClick = (event, rowIndex, type) => {
        event.preventDefault();
        setContextMenu({
            mouseX: event.clientX,
            mouseY: event.clientY,
            rowId: rowIndex,
            type,
        });
    };

    const handleDeleteRow = (id) => {
        setDirectInwardReturnItems((yarnBlend) =>
            yarnBlend.filter((row, index) => index !== parseInt(id))
        );
    };
    const handleDeleteAllRows = () => {
        setDirectInwardReturnItems([]);
    };

    useEffect(() => {
        const targetRows = standardTransactionPlaceholderRowCount;

        if (directInwardReturnItems?.length >= targetRows) return
        setDirectInwardReturnItems(prev => {
            let newArray = Array?.from({ length: targetRows - prev?.length }, () => {
                return {
                    itemId: "",
                    colorId: "",
                    uomId: "",
                    discountValue: "0.00",


                }
            })
            return [...prev, ...newArray]
        }
        )
    }, [setDirectInwardReturnItems, directInwardReturnItems, headerOpen])

    const addNewRow = () => {
        const newRow = {
            itemId: "",
            qty: "",
            tax: "0",
            colorId: "",
            uomId: "",
            price: "",
            discountTypes: "",
            discountValue: "0.00",
            id: '',
            poItemsId: ""
        };
        setDirectInwardReturnItems([...directInwardReturnItems, newRow]);
    };

    return (
        <>
            <TransactionLineItemsSection
                panelClassName="h-full min-h-0"
                contentClassName="h-full min-h-0 overflow-hidden rounded-md border border-slate-200 !py-0"
            >
                <div className="h-full min-h-0 overflow-x-auto overflow-y-scroll ">
                    <table className={transactionTableClassName}>
                        <thead className={`${transactionTableHeadClassName} shadow-sm`} >

                            <tr className='bg-gray-300'>
                                <th
                                    className="w-12 bg-gray-300 px-1 py-1 text-center font-medium text-[12px]"
                                >
                                    S.No
                                </th>

                                {stockControlData?.data?.[0]?.itemWise && (
                                    <th
                                        className="w-60 bg-gray-300 px-1 py-1 text-center font-medium text-[12px]"
                                    >
                                        Item
                                    </th>
                                )}
                                {stockControlData?.data?.[0]?.sizeWise && (
                                    <th
                                        className="w-16 bg-gray-300 px-1 py-1 text-center font-medium text-[12px]"
                                    >
                                        Size
                                    </th>
                                )}
                                {stockControlData?.data?.[0]?.sizeColorWise && (
                                    <th
                                        className="w-36 bg-gray-300 px-1 py-1 text-center font-medium text-[12px]"
                                    >
                                        Color
                                    </th>
                                )}
                                <th

                                    className="w-12 bg-gray-300 px-1 py-1 text-center font-medium text-[12px]"
                                >
                                    UOM
                                </th>
                                <th

                                    className="w-20 bg-gray-300 px-1 py-1 text-center font-medium text-[12px]"
                                >
                                    Barcode
                                </th>
                                {stockControlData?.data?.map(element => (
                                    Object.keys(element)?.filter(key => key.toLowerCase().includes("field") && !!element[key])?.map(i => (
                                        <>
                                            <th
                                                key={i}
                                                className="w-28 bg-gray-300 px-1 py-1 text-center font-medium text-[12px]"
                                            >
                                                {capitalizeFirstLetter(element?.[i])}
                                            </th>

                                        </>
                                    ))
                                ))}
                                <th

                                    className="w-12 bg-gray-300 px-1 py-1 text-center font-medium text-[12px]"
                                >
                                    Inward Qty
                                </th>
                                <th

                                    className="w-12 bg-gray-300 px-1 py-1 text-center font-medium text-[12px]"
                                >
                                    Already Return Qty
                                </th>
                                <th

                                    className="w-12 bg-gray-300 px-1 py-1 text-center font-medium text-[12px]"
                                >
                                    Stock Qty
                                </th>
                                <th

                                    className="w-12 bg-gray-300 px-1 py-1 text-center font-medium text-[12px]"
                                >
                                    Balance Qty
                                </th>
                                <th

                                    className="w-16 bg-gray-300 px-1 py-1 text-center font-medium text-[12px]"
                                >
                                    Price
                                </th>
                                <th

                                    className="w-16 bg-gray-300 px-1 py-1 text-center font-medium text-[12px]"

                                >
                                    Return Qty <span className="text-red-500">*</span>
                                </th>


                                {/* <th

                                    className="w-16 bg-gray-200 px-1 py-1 text-center font-medium text-[12px]"
                                >
                                    Gross
                                </th> */}

                                {/* <th

                                    className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                >
                                    Actions
                                </th> */}
                            </tr>
                        </thead>

                        <tbody className='w-full bg-white'>
                            {(directInwardReturnItems || [])?.map((item, index) => <YarnDirectItem itemList={itemList} uomList={uomList}
                                colorList={colorList} deleteRow={deleteRow}
                                sizeList={sizeList}
                                key={item.poItemsId} storeId={storeId}
                                item={item} index={index} handleInputChange={handleInputChange}
                                readOnly={readOnly}
                                handleRightClick={handleRightClick} addNewRow={addNewRow} stockControlData={stockControlData} movedToNextSaveNewRef={index === 0 ? movedToNextSaveNewRef : undefined}
                                handlers={handlers}
                            />)}
                            {Array.from({ length: Math.max(0, standardTransactionPlaceholderRowCount - (directInwardReturnItems?.length || 0)) }).map((_, i) => {
                                const rowIndex = (directInwardReturnItems?.length || 0) + i;
                                return (
                                    <tr key={`placeholder-${i}`} className={`border border-gray-300 text-[11px] h-8 text-center p-0.5 ${rowIndex % 2 === 0 ? "bg-white" : "bg-gray-100"}`}>
                                        {Array.from({
                                            length: 6 + // S.No, UOM, Barcode, Allowed Return Qty, Stock Qty, Price
                                                (stockControlData?.data?.[0]?.itemWise ? 1 : 0) +
                                                (stockControlData?.data?.[0]?.sizeWise ? 1 : 0) +
                                                (stockControlData?.data?.[0]?.sizeColorWise ? 1 : 0) +
                                                (stockControlData?.data?.reduce((acc, element) => acc + Object.keys(element)?.filter(k => k.toLowerCase().includes("field") && !!element[k]).length, 0) || 0)
                                        }).map((_, j) =>
                                            <td key={`placeholder-cell-${j}`} className="border border-gray-300 p-0 text-[11px]"></td>
                                        )}
                                        <td className="border border-gray-300 p-0 text-[11px]"></td>
                                        {/* <td className="border border-gray-300 p-0 text-[11px]"></td> */}
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot className="sticky bottom-0 z-10 border-t-2 border-gray-300 bg-gray-300 font-bold shadow-[0_-1px_0_0_rgba(203,213,225,1)]">
                            <tr>
                                <td
                                    colSpan={
                                        (stockControlData?.data?.[0]?.itemWise ? 1 : 0) +
                                        (stockControlData?.data?.[0]?.sizeWise ? 1 : 0) +
                                        (stockControlData?.data?.[0]?.sizeColorWise ? 1 : 0) +
                                        3 + // S.No, UOM, Barcode
                                        (stockControlData?.data?.reduce((acc, element) => acc + Object.keys(element)?.filter(k => k.toLowerCase().includes("field") && !!element[k]).length, 0) || 0) +
                                        2 // Allowed Return Qty, Stock Qty
                                    }
                                    className="px-4 py-1 text-right text-[12px]"
                                >
                                    Total:
                                </td>
                                <td className="bg-gray-300 px-1 py-1 text-right text-[11px]"></td>
                                <td className="bg-gray-300 px-1 py-1 text-right text-[11px]"></td>

                                <td className="bg-gray-300 px-1 py-1 text-right text-[11px]"></td>

                                <td className="bg-gray-300 px-1 py-1 text-right text-[11px]">
                                    {(directInwardReturnItems || [])?.reduce((acc, curr) => acc + parseFloat(curr?.qty || 0), 0).toFixed(3)}
                                </td>
                                {/* <td className="bg-gray-300 px-1 py-1 text-right text-[11px]">
                                    {(directInwardReturnItems || [])?.reduce((acc, curr) => acc + (parseFloat(curr?.qty || 0) * parseFloat(curr?.price || 0)), 0).toFixed(3)}
                                </td> */}
                            </tr>
                        </tfoot>
                    </table>
                </div>
                {contextMenu && (
                    <div
                        style={{
                            position: "absolute",
                            top: `${contextMenu.mouseY - 290}px`,
                            left: `${contextMenu.mouseX - 35}px`,

                            // background: "gray",
                            boxShadow: "0px 0px 5px rgba(0,0,0,0.3)",
                            padding: "8px",
                            borderRadius: "4px",
                            zIndex: 1000,
                        }}
                        className="bg-gray-100"
                        onMouseLeave={handleCloseContextMenu} // Close when the mouse leaves
                    >
                        <div className="flex flex-col gap-1">
                            <button
                                className=" text-black text-[12px] text-left rounded px-1"
                                onClick={() => {
                                    handleDeleteRow(contextMenu.rowId);
                                    handleCloseContextMenu();
                                }}
                            >
                                Delete{" "}
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

export default YarnDirectInwardItems
