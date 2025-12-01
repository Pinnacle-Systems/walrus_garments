import React, { useEffect, useRef, useState } from "react"
import { HiPencil, HiPlus, HiTrash } from "react-icons/hi"
import YarnDetails from "./YarnDetails";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import YarnIssueItems from "./YarnItems";
import AccessoryIssueItems from "./AccessoryItems";

const FormItems = ({ Stock, setStock ,setAccessoryStock , issueItems, readOnly, setIssueItems, materialTypeList, setIsReport, isReport,
    requirementId, setRequirementId ,AccessoryStock ,setAccessoryIssueItems ,accessoryIssueItems ,id
}) => { 



    console.log(issueItems, "issueItems");


    console.log(Stock, "Stockkkk");





    function handleInputChange(value, index, field, indent) {

        setIssueItems(issueItems => {
            const newBlend = structuredClone(issueItems);
            if (field == "issueQty") {
                const stockQty = Stock?.find(i => i.yarnId == indent.yarnId && i.colorId == indent.colorId)?.qty

                console.log(stockQty, "stockQty")

                if (stockQty < 0) {
                    return
                }

                if (parseFloat(stockQty) < parseFloat(value)) {
                    Swal.fire({
                        title: "Issue Qty Cannot Be More The Stock Qty",
                        icon: "Warning",
                    });
                } else {
                    newBlend[index][field] = parseFloat(value);

                }
                // newBlend[index][field] = parseFloat(value);

            }
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

    function calculateStockQty(indent) {
        const stockQty = Stock?.find(i => i.yarnId == indent.yarnId && i.colorId == indent.colorId)
        console.log({
            stockQty
        })
        return stockQty

    }


    return (
        <>
            <div className="py-1 bg-white rounded-md shadow-sm h-[500px] ">
                <div className="mb-3">
                    {materialTypeList?.length > 0 ? (
                        <div className="flex gap-2  rounded-lg shadow-sm p-1 w-fit">
                            {materialTypeList.some((i) => i.value === "Yarn") && (
                                <button
                                    onClick={() => setIsReport("Yarn")}
                                    className={`
          px-3 py-1.5 text-xs rounded-md transition-all duration-200  border border-gray-300
          ${isReport === "Yarn"
                                            ? "bg-blue-600 text-white shadow-sm"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
        `}
                                >
                                    Yarn Required Details
                                </button>
                            )}

                            {materialTypeList.some((i) => i.value === "Accessories") && (
                                <button
                                    onClick={() => setIsReport("Accessories")}
                                    className={`
          px-3 py-1.5 text-xs rounded-md transition-all duration-200   border border-gray-300
          ${isReport === "Accessories"
                                            ? "bg-blue-600 text-white shadow-sm"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
        `}
                                >
                                    Trims & Accessories Required Details
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center h-[30px] text-md text-gray-500">
                            Request Items
                        </div>
                    )}
                </div>

                <div>
                    {isReport == "Yarn" && (
                        <>
                            <YarnIssueItems Stock={Stock} setStock={setStock} setSt issueItems={issueItems} readOnly={readOnly} setIssueItems={setIssueItems} materialTypeList={materialTypeList} setIsReport={setIsReport} isReport={isReport} requirementId={requirementId} setRequirementId={setRequirementId} id={id}
                            />
                        </>
                    )}
                    {isReport == "Accessories" && (
                        <>
                            <AccessoryIssueItems AccessoryStock={AccessoryStock} setAccessoryStock={setAccessoryStock} accessoryIssueItems={accessoryIssueItems} 
                            setAccessoryIssueItems={setAccessoryIssueItems} id={id}
                            />
                        </>
                    )}
                </div>









            </div>

        </>
    )
}

export default FormItems;















