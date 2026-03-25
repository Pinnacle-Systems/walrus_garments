import { useEffect, useState } from 'react';
import YarnDirectItem from './YarnDirectItem';
import { capitalizeFirstLetter } from '../../../Utils/helper';
import Swal from 'sweetalert2';


const YarnDirectInwardItems = ({ deleteRow, handleInputChange, directInwardReturnItems,
    setDirectInwardReturnItems, readOnly, sizeList, itemList, colorList, uomList, stockControlData, storeId, setInwardItemSelection, supplierId, purchaseInwardId, itemPriceList

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
        setDirectInwardReturnItems((prevRows) => {
            if (prevRows.length <= 1) return prevRows;
            return [prevRows[0]];
        });
    };

    useEffect(() => {
        if (directInwardReturnItems?.length >= 12) return
        setDirectInwardReturnItems(prev => {
            let newArray = Array?.from({ length: 12 - prev?.length }, () => {
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
    }, [setDirectInwardReturnItems, directInwardReturnItems])

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
            <div className=" bg-white rounded-md shadow-sm h-[390px]">
                <div className="flex justify-between items-center mb-2 ">
                    <h2 className="font-bold text-slate-700">List Of Items</h2>
                    <button className="font-bold text-slate-700 bord"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                setInwardItemSelection(true)

                            }
                        }}
                        onClick={() => {
                            if (!supplierId) {
                                Swal.fire({
                                    icon: 'warning',
                                    title: ` Choose Supplier`,
                                });
                                return
                            }
                            if (!purchaseInwardId) {
                                Swal.fire({
                                    icon: 'warning',
                                    title: `Select Purchase Inward No`,
                                });
                                return
                            }


                            setInwardItemSelection(true)

                        }}
                    >
                        Fill Inward Items
                    </button>
                </div>

                <div className={` w-full h-[350px]  overflow-auto overflow-y-auto  `}>
                    <table className="w-full border-collapse table-fixed ">
                        <thead className="bg-gray-200 text-gray-800 top-0 sticky" >
                            <tr>
                                <th
                                    className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    S.No
                                </th>

                                <th

                                    className={`w-60 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Item
                                </th>
                                <th

                                    className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Size
                                </th>
                                <th

                                    className={`w-36 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Color
                                </th>
                                <th

                                    className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    UOM
                                </th>
                                <th

                                    className={`w-20 px-4 py-2 text-left font-medium text-[13px] `}
                                >
                                    Barcode
                                </th>
                                {stockControlData?.data?.map(element => (
                                    Object.keys(element)?.filter(key => key.toLowerCase().includes("field") && !!element[key])?.map(i => (
                                        <>
                                            <th
                                                key={i}
                                                className={`w-28 px-4 py-2 text-center font-medium text-[13px] `}
                                            >
                                                {capitalizeFirstLetter(element?.[i])}
                                            </th>

                                        </>
                                    ))
                                ))}

                                <th

                                    className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Allowed Return Qty
                                </th>
                                <th

                                    className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Stock Qty
                                </th>
                                <th

                                    className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Price
                                </th>
                                <th

                                    className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}

                                >
                                    Return Qty
                                </th>


                                <th

                                    className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                >
                                    Gross
                                </th>

                                {/* <th

                                    className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                >
                                    Actions
                                </th> */}
                            </tr>
                        </thead>

                        <tbody className='w-full'>
                            {(directInwardReturnItems || [])?.map((item, index) => <YarnDirectItem itemList={itemList} uomList={uomList}
                                colorList={colorList} deleteRow={deleteRow}
                                sizeList={sizeList}
                                key={item.poItemsId} storeId={storeId}
                                item={item} index={index} handleInputChange={handleInputChange}
                                readOnly={readOnly}
                                handleRightClick={handleRightClick} addNewRow={addNewRow} stockControlData={stockControlData}
                            />)}
                            {Array.from({ length: 1 - directInwardReturnItems?.length }).map(i =>
                                <tr className='w-12 border border-gray-300 text-[11px]  h-8 text-center p-0.5'>
                                    {Array.from({ length: 12 }).map(i =>
                                        <td className=" table-data "></td>
                                    )}

                                </tr>)
                            }
                        </tbody>
                        <tfoot className="bg-gray-300 font-bold sticky bottom-0 z-10 border-t-2 border-gray-300">
                            <tr>
                                <td
                                    colSpan={6 + (stockControlData?.data?.reduce((acc, element) => acc + Object.keys(element)?.filter(k => k.toLowerCase().includes("field") && !!element[k]).length, 0) || 0) + 3}
                                    className="px-4 py-1 text-right text-[12px]"
                                >
                                    Total:
                                </td>
                                <td className="px-1 py-1 text-right text-[11px] border border-gray-300 bg-gray-300">
                                    {(directInwardReturnItems || [])?.reduce((acc, curr) => acc + parseFloat(curr?.qty || 0), 0).toFixed(3)}
                                </td>
                                <td className="px-1 py-1 text-right text-[11px] border border-gray-300 bg-gray-300">
                                    {(directInwardReturnItems || [])?.reduce((acc, curr) => acc + (parseFloat(curr?.qty || 0) * parseFloat(curr?.price || 0)), 0).toFixed(3)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                {contextMenu && (
                    <div
                        style={{
                            position: "absolute",
                            top: `${contextMenu.mouseY - 50}px`,
                            left: `${contextMenu.mouseX - 30}px`,

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
            </div>
        </>
    )
}

export default YarnDirectInwardItems