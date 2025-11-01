import React, { useState } from 'react';
import YarnPoItem from './YarnPoItem';
import { toast } from 'react-toastify';
import { HiPlus } from 'react-icons/hi';
import { useEffect } from 'react';
import Swal from 'sweetalert2';


const YarnCancelItems = ({ id, inwardItems, setInwardItems, readOnly, removeItem, purchaseInwardId, supplierId, setInwardItemSelection, poType,
    contextMenu, setContextMenu
}) => {
    const handleInputChange = (value, index, field, balanceQty, poItem) => {

        console.log(value, index, "indexindex")

        setInwardItems(inwardItems => {
            const newBlend = structuredClone(inwardItems);
            newBlend[index][field] = value;
            if (poItem) {

                newBlend[index]["yarnId"] = poItem?.yarnId
                newBlend[index]["uomId"] = poItem?.uomId
                newBlend[index]["colorId"] = poItem?.colorId
                newBlend[index]["poId"] = poItem?.poId
                newBlend[index]["poItemsId"] = poItem?.id
                newBlend[index]["poQty"] = poItem?.poQty
                newBlend[index]["poNo"] = poItem?.Po?.docId
                newBlend[index]["price"] = poItem?.price

            }
            if (field === "qty") {
                if (parseFloat(balanceQty) < parseFloat(value)) {
                    Swal.fire({
                        icon: "warning",
                        title: "Cancel Qty is greater than Balance Qty!",
                        text: "Are you sure you want to continue?",
                        showCancelButton: true,
                        confirmButtonText: "Yes",
                        cancelButtonText: "No",
                        confirmButtonColor: "#2563eb", // Tailwind blue-600
                        cancelButtonColor: "#ef4444",  // Tailwind red-500
                        didOpen: () => {
                            // 👇 Force visible white text (fix Tailwind/Bootstrap override issue)
                            const confirmBtn = Swal.getConfirmButton();
                            const cancelBtn = Swal.getCancelButton();
                            confirmBtn.style.color = "#fff";
                            cancelBtn.style.color = "#fff";
                            confirmBtn.style.fontWeight = "600";
                            cancelBtn.style.fontWeight = "600";
                        },
                    }).then((result) => {
                        if (result.isConfirmed) {
                            console.log('User confirmed action');
                        } else {
                            console.log('User cancelled');
                        }
                    });

                    return inwardItems
                }
            }
            // if (field !== "qty" && newBlend[index]["noOfBags"] && newBlend[index]["weightPerBag"]) {
            //     let tempInwardQty = (parseFloat(newBlend[index]["noOfBags"]) * parseFloat(newBlend[index]["weightPerBag"])).toFixed(3)
            //     if (parseFloat(balanceQty) < parseFloat(tempInwardQty)) {
            //         toast.info("Inward Qty Can not be more than balance Qty", { position: 'top-center' })
            //         return inwardItems
            //     }
            //     newBlend[index]["qty"] = tempInwardQty
            // }

            //     let qty = parseInt(newBlend[index]["noOfBags"]) * parseFloat(newBlend[index]["weightPerBag"])
            //     let excessQty = parseInt(newBlend[index]["noOfBags"]) * 2
            //     if ((qty + excessQty) < parseFloat(value)) {
            //         toast.info("Excess Qty Cannot be More than 2kg Per Bag", { position: 'top-center' })
            //         return inwardItems
            //     }
            // }
            return newBlend
        });
    };

    console.log(inwardItems, "inwardItems")

    useEffect(() => {
        if (id) return
        if (inwardItems?.length >= 1) return;
        setInwardItems((prev) => {
            let newArray = Array.from({ length: 1 - prev.length }, (i) => {
                return {
                    yarnId: "",
                    qty: "0.00",
                    tax: "0",
                    colorId: "",
                    uomId: "",
                    price: "0.00",
                    discountValue: "0.00",
                    noOfBags: 0.00,
                    discountType: "",
                    weightPerBag: 0.00,
                };
            });
            return [...prev, ...newArray];
        });
    }, [setInwardItems, inwardItems]);


    const deleteRow = (id) => {
        setInwardItems((yarnBlend) =>
            yarnBlend.filter((row, index) => index !== parseInt(id))
        );
    };


    const handleDeleteRow = (id) => {
        setInwardItems((yarnBlend) => {
            if (yarnBlend.length <= 1) {
                return yarnBlend;
            }
            return yarnBlend.filter((_, index) => index !== parseInt(id));
        });
    };
    const handleDeleteAllRows = () => {
        // setInwardItems((prevRows) => {
        //     if (prevRows.length <= 1) return prevRows;
        //     return [prevRows[0]];
        // });
        setInwardItems([])
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

    const handleCloseContextMenu = () => {
        setContextMenu(null);
    };


    return (
        <>



            <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm max-h-[250px] overflow-auto">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="font-bold text-slate-700">List Of Items</h2>
                    <div className="flex gap-2 items-center">

                        {/* <button
                            onClick={() => {
                                addNewRow()
                            }}
                            className="hover:bg-green-600 text-green-600 hover:text-white border border-green-600 px-2 py-1 rounded-md flex items-center text-xs"
                        >
                            <HiPlus className="w-3 h-3 mr-1" />
                            Add Item
                        </button> */}
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
                                        icon: 'success',
                                        title: ` Choose Supplier`,
                                        showConfirmButton: false,
                                        timer: 2000
                                    });
                                }
                                else {

                                    setInwardItemSelection(true)
                                }
                            }}
                        >
                            Fill Po Items
                        </button>
                    </div>

                </div>
                <div className={` relative w-full overflow-y-auto py-1`}>
                    <table className="w-full border-collapse table-fixed">
                        <thead className="bg-gray-200 text-gray-900">
                            <tr>
                                <th
                                    className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    S.No
                                </th>
                                <th
                                    className={`w-20 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    doc Id
                                </th>
                                <th

                                    className={`w-52 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Items
                                </th>
                                <th

                                    className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Colors
                                </th>
                                <th

                                    className={`w-28 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    UOM
                                </th>


                                <th

                                    className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Po Quantity
                                </th>
                                <th

                                    className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Already Inward Qty
                                </th>
                                <th

                                    className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Already Cancel Qty
                                </th>
                                <th className="w-16 px-4 py-2 text-center font-medium text-[13px]">Already Return Qty</th>

                                <th

                                    className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Balance  Qty
                                </th>

                                <th

                                    className={`w-24 px-3 py-2 text-center font-medium text-[13px] `}
                                >
                                    Cancel Type
                                </th>

                                <th

                                    className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                >
                                    Cancel Qty
                                </th>
                                <th

                                    className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                >
                                    Actions
                                </th>
                                {/* ))} */}
                            </tr>
                        </thead>
                        <tbody className='overflow-y-auto  h-full w-full'>

                            {inwardItems.map((item, index) => <YarnPoItem
                                deleteRow={deleteRow}
                                readOnly={readOnly} noOfBags={item.noOfBags} weightPerBag={item.weightPerBag} purchaseInwardId={purchaseInwardId} removeItem={removeItem} key={item.poItemsId} qty={item.qty} poItemId={item.poItemsId}
                                cancelType={item.cancelType}

                                index={index} handleInputChange={handleInputChange} handleRightClick={handleRightClick} />)}
                            {Array.from({ length: 1 - inwardItems?.length }).map(i =>
                                <tr className='w-full font-bold h-8 border border-gray-400 table-row' key={i}>
                                    {Array.from({ length: 8 }).map(i =>
                                        <td className="table-data   "></td>
                                    )}
                                    {!readOnly &&
                                        <td className="table-data w-10"></td>
                                    }
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

export default YarnCancelItems