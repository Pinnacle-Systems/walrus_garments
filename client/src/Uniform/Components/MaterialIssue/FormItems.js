import React, { useEffect, useRef, useState } from "react"
import { HiPencil, HiPlus, HiTrash } from "react-icons/hi"
import YarnDetails from "./YarnDetails";
import { toast } from "react-toastify";

const FormItems = ({ setRaiseIndentItems, issueItems, readOnly, id,  isMaterialIssue,  setIsMaterialIssue, setSubGridForm, subGridForm,
    requirementId, setRequirementId
}) => {



    console.log(issueItems, "issueItems");














    function deleteRow(index) {
        console.log(index, "index")
        if (readOnly) return toast.info("Turn on Edit Mode...!!!")
        setRaiseIndentItems(prev => prev.filter((_, i) => i !== index))
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
        setRaiseIndentItems(prev => prev.filter((_, i) => i !== index))
    }

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
                    <div className="w-[40%] flex flex-col ">
                        <div className="justify-end items-center mt-4 mb-5">
                            <table className="w-full border-collapse table-fixed">
                                <thead className="bg-gray-200 text-gray-800">

                                    <tr>
                                        <td className="border border-gray-300 px-2 py-1 text-center text-xs w-5">S No</td>
                                        <td className="border border-gray-300 px-2 py-1 text-center text-xs w-32">Style Name </td>
                                        <td className="border border-gray-300 px-2 py-1 text-center text-xs w-10">Required Qty (Kgs)</td>


                                    </tr>
                                </thead>
                                <tbody>

                                    {(issueItems ? issueItems : []).map((indent, index) => {
                                        return (
                                            <React.Fragment key={index}>

                                                <tr
                                                    className={`${indent?.requirementPlanningFormId === requirementId ? "border-2 border-gray-500" : ""} `}
                                                    onClick={() => {
                                                        setRequirementId(indent?.requirementPlanningFormId)
                                                        setSubGridForm(true)
                                                    }}
                                                >
                                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs">{index + 1}</td>

                                                    <td className="border border-gray-300 px-2 py-1 text-left text-xs"
                                                    >{indent?.OrderDetails?.style?.name}
                                                    </td>

                                                    <td className="border border-gray-300 px-2 py-1 text-right text-xs"

                                                    >
                                                        {Number(indent?.totalYarnQty || 0).toFixed(3)}
                                                    </td>
                                               

                                                </tr>



                                            </React.Fragment>
                                        );


                                    })}
                                    <tr>
                                        <td colSpan={2} className="border border-gray-300 px-2 py-1 text-center text-xs">Total Required Qty</td>
                                        <td colSpan={1} className="border border-gray-300 px-2 py-1 text-right font-bold text-xs">       {(
                                            issueItems?.reduce((sum, item) => {
                                                return sum + (item?.RaiseIndenetYarnItems?.reduce(
                                                    (yarnSum, yarn) => yarnSum + (parseFloat(yarn?.qty) || 0),
                                                    0
                                                ) || 0);
                                            }, 0)
                                        )?.toFixed(3) || "0.000"}
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

                        <label className="flex items-center justify-start mt-5 space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                onChange={() => setIsMaterialIssue(!isMaterialIssue)}
                                checked={isMaterialIssue}
                            />
                            <span className="text-sm text-gray-700">Material Issue to Production</span>
                        </label>


                    </div>



                    <div className=" w-[50%]">
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
                    </div>

                    {/* <div className="w-[30%] flex justify-end items-center mt-4">

                        <table className="w-full border-collapse table-fixed">
                            <thead className="bg-gray-200 text-gray-800">

                                <tr>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs w-10">S No</td>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs w-16">Yarn</td>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs w-16">Required Qty</td>

                                </tr>

                            </thead>
                            <tbody>

                                {orderYarnDetails?.map((yarn, index) => (
                                    <tr>
                                        <td className="border border-gray-300 px-2 py-1 text-left text-xs w-9">{index + 1}</td>
                                        <td className="border border-gray-300 px-2 py-1 text-left text-xs">{yarn?.Yarn?.name}</td>

                                        <td className="border border-gray-300 px-2 py-1 text-left text-xs">
                                            {getRequireWeight(yarn?.yarnId).toFixed(3)} Kg
                                        </td>

                                    </tr>
                                ))}

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















