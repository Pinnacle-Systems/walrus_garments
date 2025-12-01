import React, { useEffect, useRef, useState } from "react"
import { HiPencil, HiPlus, HiTrash } from "react-icons/hi"
import YarnDetails from "./YarnDetails";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const AccessoryIssueItems = ({ setAccessoryStock, id, readOnly, setIssueItems, materialTypeList, setIsReport, isReport,
    requirementId, setRequirementId, AccessoryStock, setAccessoryIssueItems, accessoryIssueItems
}) => {




    console.log(accessoryIssueItems, "accessoryIssueItems")
    console.log(AccessoryStock, "AccessoryStock")


    function handleInputChange(value, index, field, accessoryItem) {
        const newValue = parseFloat(value) || 0;

        console.log(newValue,"newValue")

        let totalAvailable
        totalAvailable = AccessoryStock
            .filter(s => s.accessoryId === accessoryItem.accessoryId && s.colorId == accessoryItem.colorId && s.sizeId == accessoryItem.sizeId)
            .reduce((sum, s) => sum + (parseFloat(s.qty) || 0), 0);
        if (id) {
            totalAvailable = parseFloat(totalAvailable) + parseFloat(accessoryItem?.qty)
        }

        const currentlyUsed = AccessoryStock
            .filter(s => s.accessoryId === accessoryItem.accessoryId && s.colorId == accessoryItem.colorId && s.sizeId == accessoryItem.sizeId)
            .reduce((sum, s) => sum + (parseFloat(s.issueQty) || 0), 0);
        console.log(currentlyUsed, "currentlyUsed")

        console.log(totalAvailable, "totalAvailable")

        const existingTransfer = accessoryIssueItems
            .filter((i, idx) =>
                idx !== index &&
                i.accessoryId === accessoryItem.accessoryId &&
                i.colorId === accessoryItem.colorId &&
                i.sizeId == accessoryItem.sizeId
            )
            .reduce((sum, i) => sum + (parseFloat(i.issueQty) || 0), 0);


        console.log({
            existingTransfer,
            totalAvailable,
            currentlyUsed
        }, "existingTransfer")

        if (existingTransfer + newValue > (totalAvailable)) {
            Swal.fire({
                title: "Not enough stock!",
                text: `Only ${(parseFloat(totalAvailable)).toFixed(3)} available in stock.`,

                icon: "warning"
            });
            return;
        } else {
            setAccessoryIssueItems(prevOrder => {


                const updatedOrders = structuredClone(prevOrder);
                updatedOrders[index][field] = newValue;
                // updatedOrders[index]["qty"] = newValue;

                console.log(updatedOrders, "updatedOrders")

                const totalRequired = updatedOrders
                    .filter(i => i.accessoryId === accessoryItem.accessoryId && i.colorId === accessoryItem.colorId && i.sizeId == accessoryItem.sizeId)
                    .reduce((sum, i) => sum + (parseFloat(i.requiredQty) || 0), 0);


                console.log(totalRequired, "totalRequired")

                setAccessoryStock(prev => {
                    const updatedStock = structuredClone(prev);
                    console.log(updatedStock, "updatedStock")

                    const matches = updatedStock
                        .map((item, i) => ({ ...item, index: i }))
                        .filter(i => i.accessoryId === accessoryItem.accessoryId && i.colorId === accessoryItem.colorId && i.sizeId == accessoryItem.sizeId);

                    let remaining = totalRequired;

                    console.log(matches, "matches")
                    console.log(accessoryItem, "accessoryItem")
                    for (const row of matches) {
                        updatedStock[row.index].transferQty = 0;
                    }

                    for (const row of matches) {

                        let available;
                        if (id) {
                            available = parseFloat(row.qty || 0) + parseFloat(accessoryItem?.qty)
                        }
                        else {
                            available = parseFloat(row.qty || 0);
                        }

                        console.log(available, "availableavailable", parseFloat(existingTransfer) + parseFloat(value))

                        if (available <= 0) continue;


                        if (available >= parseFloat(existingTransfer) + parseFloat(value)) {
                            updatedStock[row.index].transferQty = value;
                        }
                    }

                    return updatedStock;
                });


                return updatedOrders;
            });
        }


    }






    function deleteRow(index) {
        // if (readOnly) return toast.info("Turn on Edit Mode...!!!")
        setIssueItems(prev => prev.filter((_, i) => i !== index))
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


    const tableRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (tableRef?.current && !tableRef?.current?.contains(event.target)) {
                setRequirementId(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // function calculateStockQty(indent) {
    //     const stockQty = AccessoryStock?.find(i => i.yarnId == indent.yarnId && i.colorId == indent.colorId)
    //     console.log({
    //         stockQty
    //     })
    //     return stockQty

    // }


    function calculateBalanceStockQty(accessoryItem) {
        console.log(accessoryItem, "accessoryItem")
        let balanceStockQty = 0;
        if (id) {
            balanceStockQty = accessoryIssueItems
                .filter(i => i.accessoryId === accessoryItem.accessoryId && i.colorId === accessoryItem.colorId && i.uomId == accessoryItem?.uomId)
                .reduce((sum, next) => sum + (parseFloat(next?.qty) || 0), 0);
        } else {
            balanceStockQty = accessoryIssueItems
                .filter(i => i.accessoryId === accessoryItem.accessoryId && i.colorId === accessoryItem.colorId && i.uomId == accessoryItem?.uomId)
                .reduce((sum, next) => sum + (parseFloat(next?.issueQty) || 0), 0);
        }


        console.log({
            balanceStockQty
        }, "balanceStockQty")

        return {
            qty: id ? (parseFloat(balanceStockQty) + parseFloat(accessoryItem?.qty)).toFixed(3) : (parseFloat(accessoryItem?.qty) - parseFloat(balanceStockQty)).toFixed(3),
            balanceStockQty,


        }

    }


    function calculateStockQty(accessoryItem) {
        console.log(accessoryItem, "accessoryItem")
        let stockQty = 0
        let balanceStockQty = 0;
        if (id) {
            balanceStockQty = accessoryIssueItems
                .filter(i => i.accessoryId === accessoryItem.accessoryId && i.colorId === accessoryItem.colorId && i.uomId == accessoryItem?.uomId)
                .reduce((sum, next) => sum + (parseFloat(next?.qty) || 0), 0);

                console.log(balanceStockQty,"balanceStockQty")
            stockQty = parseFloat(accessoryItem?.qty) + parseFloat(balanceStockQty)

        } else {
            stockQty = parseFloat(accessoryItem?.qty)
        }


 

        return {
            qty:stockQty

        }

    }




    return (
        <>
            <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm h-[480px] ">

                <div className="w-[45%] mb-3 h-[200px]">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="font-medium text-slate-700">Accessory Stock Qty</h2>
                    </div>
                    <table>
                        <thead className="bg-gray-200 text-gray-800">

                            <tr>
                                <td className="border border-gray-300 px-2 py-1 text-center text-xs w-8">S No</td>
                                <td className="border border-gray-300 px-2 py-1 text-center text-xs w-80">Yarn</td>
                                <td className="border border-gray-300 px-2 py-1 text-center text-xs w-52">Color</td>
                                <td className="border border-gray-300 px-2 py-1 text-center text-xs w-20">Stock Qty</td>
                                {/* <td className="border border-gray-300 px-2 py-1 text-center text-xs w-20">Balance Stock Qty</td> */}


                            </tr>

                        </thead>
                        <tbody>

                            {(AccessoryStock ? AccessoryStock : []).map((indent, index) => {
                                return (

                                    <tr>
                                        <td className="border border-gray-300 px-2 py-1 text-left text-xs">{index + 1}</td>
                                        <td className="border border-gray-300 px-2 py-1 text-left text-xs">{indent?.Accessory?.aliasName} </td>
                                        <td className="border border-gray-300 px-2 py-1 text-left text-xs">{indent?.Color?.name} </td>
                                        <td className="border border-gray-300 px-2 py-1  text-xs text-right">
                                            {parseFloat(calculateStockQty(indent)?.qty).toFixed(3)}
                                        </td>
                                        {/* <td className="border border-gray-300 px-2 py-1  text-xs text-right">
                                            {parseFloat(calculateBalanceStockQty(indent)?.qty).toFixed(3)}
                                            </td> */}

                                        {/* <td className="border border-gray-300 px-2 py-1  text-xs text-right">{(parseFloat(indent.qty || 0) - parseFloat(indent.transferQty || 0)).toFixed(3)}</td> */}
                                        {/* <td className="border border-gray-300 px-2 py-1  text-xs text-right">
                                            {parseFloat(calculateBalanceStockQty(indent)?.qty).toFixed(3)}
                                        </td> */}



                                    </tr>
                                );


                            })}
                        </tbody>
                    </table>

                </div>









                <div className="mt-2">
                    <div className="flex justify-between items-center ">
                        <h2 className="font-medium text-slate-700">Accessory Issue Qty</h2>
                    </div>

                </div>
                <div className="flex flex-row gap-10 h-[200px]">
                    <div className="w-[80%] flex flex-col ">
                        <div className="justify-end items-center mt-2 mb-5">
                            <table className="w-full border-collapse table-fixed">
                                <thead className="bg-gray-200 text-gray-800">

                                    <tr>
                                        <td className="border border-gray-300 px-2 py-1 text-center text-xs w-9">S No</td>
                                        <td className="border border-gray-300 px-2 py-1 text-center text-xs w-72">Style Name </td>
                                        <th className="w-96 px-4 py-1.5 border border-gray-300 text-center font-medium text-xs">Accessory</th>
                                        <th className="w-32 px-4 py-1.5 border border-gray-300 text-center font-medium text-xs">Color</th>
                                        <th className="w-24 px-4 py-1.5 border border-gray-300 text-center font-medium text-xs">Size</th>
                                        <th className="w-24 px-4 py-1.5 border border-gray-300 text-center font-medium text-xs">Uom</th>
                                        <th className="w-32 px-4 py-1.5 border border-gray-300  font-medium text-xs">Required Qty  </th>
                                        <td className="border border-gray-300 px-2 py-1 text-center text-xs w-20">Already Issue Qty (Kgs)</td>
                                        <td className="border border-gray-300 px-2 py-1 text-center text-xs w-20">Balance Issue Qty (Kgs)</td>
                                        <th className="w-32 px-4 py-1.5 border border-gray-300  font-medium text-xs">Issued Qty  </th>
                                    </tr>
                                </thead>
                                <tbody>

                                    {(accessoryIssueItems ? accessoryIssueItems : []).map((indent, index) => {
                                        return (
                                            <React.Fragment key={index}>

                                                <tr
                                                    className={`${indent?.requirementPlanningFormId === requirementId ? " border-gray-500" : ""} `}
                                                    onContextMenu={(e) => {
                                                        // if (!readOnly) {
                                                        handleRightClick(e, index, "shiftTimeHrs");
                                                        // }
                                                    }}
                                                    disabled={true}
                                                >
                                                    <td className="border border-gray-300 px-2 py-1  text-center text-xs">{index + 1}</td>
                                                    <td className="border border-gray-300 px-2  text-left text-xs"
                                                    >{indent?.styleColor}
                                                    </td>
                                                    <td className="border border-gray-300 px-2  text-left text-xs"
                                                    >{indent?.Accessory?.aliasName}
                                                    </td>
                                                    <td className="border border-gray-300 px-2  text-left text-xs"
                                                    >{indent?.Color?.name}
                                                    </td>
                                                    <td className="border border-gray-300 px-1 py-1 text-right text-xs">
                                                        {indent?.Size?.name}
                                                    </td>
                                                    <td className="border border-gray-300 px-1 py-1 text-right text-xs">
                                                        {indent?.Uom?.name}
                                                    </td>
                                                    <td className="border border-gray-300 px-1  text-right text-xs">
                                                        {parseFloat(indent?.requiredQty || 0).toFixed(3)}
                                                    </td>
                                                    <td className="border border-gray-300 px-1  text-right text-xs">
                                                        {parseFloat(indent?.alreadyIssueQty || 0).toFixed(3)}
                                                    </td>

                                                    <td className="border border-gray-300 px-1  text-right text-xs">
                                                        {Math.max(
                                                            parseFloat(indent?.requiredQty || 0) -
                                                            parseFloat(indent?.alreadyIssueQty || 0),
                                                            0
                                                        ).toFixed(3)
                                                        }
                                                    </td>


                                                    <td className="border border-gray-300 px-1  text-right text-xs">
                                                        <input
                                                            // onKeyDown={e => {
                                                            //     if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                                                            //     if (e.key === "Delete") { handleInputChange("0.000", index, "issueQty") }
                                                            // }}
                                                            // min={"0"}
                                                            type="number"
                                                            onFocus={(e) => e.target.select()}
                                                            className="text-right rounded  px-1 w-full table-data-input"
                                                            value={indent.issueQty}
                                                            // disabled={!calculateStockQty(indent)?.qty > 0}
                                                            onChange={(e) => {
                                                                handleInputChange(parseFloat(e.target.value), index, "issueQty", indent)
                                                            }}




                                                        // onBlur={(e) => {
                                                        //     if (parseFloat(e.target.value) < parseFloat(indent.qty)) {
                                                        //         handleInputChange(parseFloat(e.target.value), index, "issueQty", indent)

                                                        //     }
                                                        // }}

                                                        /></td>
                                                </tr>






                                            </React.Fragment>
                                        );


                                    })}




                                    {contextMenu && (
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: `${contextMenu.mouseY - 50}px`,
                                                left: `${contextMenu.mouseX + 20}px`,

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
                                                        deleteRow(contextMenu.rowId);
                                                        handleCloseContextMenu();
                                                    }}
                                                >
                                                    Delete{" "}
                                                </button>
                                                {/* <button
                                                    className=" text-black text-[12px] text-left rounded px-1"
                                                    onClick={() => {
                                                        handleDeleteAllRows();
                                                        handleCloseContextMenu();
                                                    }}
                                                >
                                                    Delete All
                                                </button> */}
                                            </div>
                                        </div>
                                    )}

                                </tbody>

                            </table>
                        </div>
                    </div>








                </div>
            </div>

        </>
    )
}

export default AccessoryIssueItems;















