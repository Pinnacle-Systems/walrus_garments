import React, { useEffect, useRef, useState } from "react"
import { HiPencil, HiPlus, HiTrash } from "react-icons/hi"
import YarnDetails from "./YarnDetails";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const FormItems = ({ setRaiseIndentItems, issueItems, readOnly, setIssueItems, isMaterialIssue, setIsMaterialIssue, setSubGridForm, subGridForm,
    requirementId, setRequirementId
}) => {



    console.log(issueItems, "issueItems");







    function handleInputChange(value, index, field) {

        setIssueItems(issueItems => {
            const newBlend = structuredClone(issueItems);
            newBlend[index][field] = parseFloat(value);
            return newBlend
        });
    };






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
    return (
        <>
            <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm h-[300px] overflow-y-auto">


                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="font-medium text-slate-700">Required Qty</h2>
                    </div>

                </div>
                <div className="flex flex-row gap-40">
                    <div className="w-[70%] flex flex-col ">
                        <div className="justify-end items-center mt-4 mb-5">
                            <table className="w-full border-collapse table-fixed">
                                <thead className="bg-gray-200 text-gray-800">

                                    <tr>
                                        <td className="border border-gray-300 px-2 py-1 text-center text-xs w-5">S No</td>
                                        <td className="border border-gray-300 px-2 py-1 text-center text-xs w-64">Yarn</td>
                                        <td className="border border-gray-300 px-2 py-1 text-center text-xs w-32">Color</td>
                                        <td className="border border-gray-300 px-2 py-1 text-center text-xs w-24">Stock Qty (Kgs)</td>
                                        <td className="border border-gray-300 px-2 py-1 text-center text-xs w-24">Required Qty (Kgs)</td>
                                        <td className="border border-gray-300 px-2 py-1 text-center text-xs w-24">Already Issue Qty (Kgs)</td>
                                        <td className="border border-gray-300 px-2 py-1 text-center text-xs w-24">Balance Issue Qty (Kgs)</td>

                                        <td className="border border-gray-300 px-2 py-1 text-center text-xs w-24">Issue Qty (Kgs)</td>



                                    </tr>
                                </thead>
                                <tbody>

                                    {(issueItems ? issueItems : []).map((indent, index) => {
                                        return (
                                            <React.Fragment key={index}>

                                                <tr
                                                    className={`${indent?.requirementPlanningFormId === requirementId ? "border-2 border-gray-500" : ""} `}
                                                    onContextMenu={(e) => {
                                                        // if (!readOnly) {
                                                        handleRightClick(e, index, "shiftTimeHrs");
                                                        // }
                                                    }}
                                                >
                                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs">{index + 1}</td>

                                                    <td className="border border-gray-300 px-2 py-1 text-left text-xs"
                                                    >{indent?.Yarn?.name}
                                                    </td>
                                                    <td className="border border-gray-300 px-2 py-1 text-left text-xs"
                                                    >{indent?.Color?.name}
                                                    </td>
                                                    <td className="border border-gray-300 px-1 py-1 text-right text-xs">
                                                        {parseFloat(indent?.availableQty || 0).toFixed(3)}
                                                    </td>
                                                    <td className="border border-gray-300 px-1 py-1 text-right text-xs">
                                                        {parseFloat(indent?.qty || 0).toFixed(3)}
                                                    </td>
                                                    <td className="border border-gray-300 px-1 py-1 text-right text-xs">
                                                        {parseFloat(indent?.alreadyIssueQty || 0).toFixed(3)}
                                                    </td>

                                                    <td className="border border-gray-300 px-1 py-1 text-right text-xs">
                                                        {parseFloat(parseFloat(indent?.qty || 0) - parseFloat(indent?.alreadyIssueQty || 0)).toFixed(3)}
                                                    </td>

                                                    <td className="border border-gray-300 px-1 py-1 text-right text-xs">
                                                        <input
                                                            onKeyDown={e => {
                                                                if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                                                                if (e.key === "Delete") { handleInputChange("0.000", index, "issueQty") }
                                                            }}
                                                            min={"0"}
                                                            type="number"
                                                            onFocus={(e) => e.target.select()}
                                                            className="text-right rounded py-1 px-1 w-full table-data-input"
                                                            value={(!indent.issueQty) ? 0.000 : indent.issueQty}
                                                            // disabled={readOnly}
                                                            onChange={(e) => {

                                                                if (parseFloat(e.target.value) > parseFloat(indent.qty)) {
                                                                    Swal.fire({
                                                                        title: "Issue Qty Cannot Be More Than Required Qty",
                                                                        icon: "Warning",

                                                                    });
                                                                }
                                                                else {
                                                                    handleInputChange(parseFloat(e.target.value), index, "issueQty")

                                                                }

                                                            }}
                                                            onBlur={(e) => {
                                                                handleInputChange(parseFloat(e.target.value).toFixed(3), index, "issueQty");
                                                            }}

                                                        />                                                    </td>
                                                </tr>



                                            </React.Fragment>
                                        );


                                    })}
                                    <tr>
                                        <td colSpan={4} className="border border-gray-300 px-2 py-1 text-center text-xs">Total Required Qty</td>
                                        <td colSpan={1} className="border border-gray-300 px-2 py-1 text-right font-bold text-xs">
                                            {
                                                (issueItems?.reduce((sum, item) => {
                                                    return sum + (parseFloat(item?.qty) || 0);
                                                }, 0))?.toFixed(3) || "0.000"
                                            }


                                        </td>
                                        <td className="border border-gray-300 px-2 py-1 text-right font-bold text-xs"></td>
                                        <td className="border border-gray-300 px-2 py-1 text-right font-bold text-xs"></td>

                                        <td colSpan={1} className="border border-gray-300 px-2 py-1 text-right font-bold text-xs">
                                            {
                                                (issueItems?.reduce((sum, item) => {
                                                    return sum + (parseFloat(item?.issueQty) || 0);
                                                }, 0))?.toFixed(3) || "0.000"
                                            }


                                        </td>
                                    </tr>
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
                        {/* 
                        <label className="flex items-center justify-start mt-5 space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                onChange={() => setIsMaterialIssue(!isMaterialIssue)}
                                checked={isMaterialIssue}
                            />
                            <span className="text-sm text-gray-700">Material Issue to Production</span>
                        </label> */}


                    </div>



                    {/* <div className=" w-[50%]">
                        <table className="w-full border-collapse table-fixed">

                            <tbody>

                                {(issueItems ? issueItems : [])?.filter(item => item.requirementPlanningFormId === requirementId)?.map((indent, index) => {
                                    return (
                                        <React.Fragment key={index}>



                                            <YarnDetails indentItems={indent} index={index} />


                                        </React.Fragment>
                                    );


                                })}


                            </tbody>

                        </table>
                    </div> */}


                </div>
            </div>
            <div>

            </div>
        </>
    )
}

export default FormItems;















