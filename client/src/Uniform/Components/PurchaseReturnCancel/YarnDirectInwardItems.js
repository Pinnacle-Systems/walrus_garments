import { useEffect, useState } from 'react';
import YarnDirectItem from './YarnDirectItem';


const YarnDirectInwardItems = ({ deleteRow, handleInputChange, directInwardReturnItems,
    setDirectInwardReturnItems, readOnly, sizeList, itemList, colorList, uomList,

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
        if (directInwardReturnItems?.length >= 9) return
        setDirectInwardReturnItems(prev => {
            let newArray = Array?.from({ length: 9 - prev?.length }, () => {
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
            <div className=" rounded-md shadow-sm h-full">

                <div className={` w-full h-[310px]  overflow-auto py-1`}>
                    <table className="w-full border-collapse table-fixed ">
                        <thead className="bg-gray-200 text-gray-800 top-0 sticky" >
                            <tr>
                                <th
                                    className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    S.No
                                </th>
                                <th

                                    className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Inward No
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

                                    className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Stock Qty
                                </th>
                                <th

                                    className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Allowed Return Qty
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
                    

                            </tr>
                        </thead>

                        <tbody className='w-full'>
                            {(directInwardReturnItems || [])?.map((item, index) => <YarnDirectItem itemList={itemList} uomList={uomList}
                                colorList={colorList} deleteRow={deleteRow}
                                sizeList={sizeList}
                                key={item.poItemsId}
                                item={item} index={index} handleInputChange={handleInputChange}
                                readOnly={readOnly}
                                handleRightClick={handleRightClick} addNewRow={addNewRow}
                            />)}
                            {Array.from({ length: 1 - directInwardReturnItems?.length }).map(i =>
                                <tr className='w-12 border border-gray-300 text-[11px]  h-8 text-center p-0.5'>
                                    {Array.from({ length: 11 }).map(i =>
                                        <td className=" table-data "></td>
                                    )}

                                </tr>)
                            }
                        </tbody>
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