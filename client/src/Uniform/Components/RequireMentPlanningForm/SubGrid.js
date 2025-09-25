import React, { useEffect, useState } from 'react'
import { TextArea, TextInput } from '../../../Inputs'
import { findFromList, params } from '../../../Utils/helper'
import { HiPencil, HiPlus, HiTrash } from 'react-icons/hi'
import { useGetYarnCountsQuery } from '../../../redux/uniformService/YarnMasterServices'



export default function SubGrid({ handleInputChange, orderYarnDetails, setOrderYarnDetails, processList, selectedIndex, selectedItem,
    readOnly,
}) {






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




    function handleAdd(index) {
        setOrderYarnDetails(prev => {
            const newPrev = structuredClone(prev);
            if (!Array.isArray(newPrev[selectedIndex].RequirementYarnProcessList)) {
                newPrev[index].RequirementYarnProcessList = [];
            }

            newPrev[selectedIndex].RequirementYarnProcessList.push({
                processId: "",
                lossPercentage: ''
            });

            return newPrev;
        });
    }



    const handleDeleteRow = (id) => {
        setOrderYarnDetails((prevOrderDetails) => {
            const newOrderDetails = structuredClone(prevOrderDetails);


            if (newOrderDetails[selectedIndex].RequirementYarnProcessList.length > 1) {
                newOrderDetails[selectedIndex].RequirementYarnProcessList = newOrderDetails[selectedIndex].RequirementYarnProcessList?.filter(
                    (_, index) => index !== Number(id)
                );
            }

            return newOrderDetails;
        });
    };

    const handleDeleteAllRows = () => {
        setOrderYarnDetails((prevRows) => {
            const newRows = structuredClone(prevRows);

            if (!Array.isArray(newRows[selectedIndex]?.RequirementYarnProcessList)) {
                newRows[selectedIndex].RequirementYarnProcessList = [];
            }

            newRows[selectedIndex].RequirementYarnProcessList = [{ processId: "", lossPercentage: "" }];

            return newRows;
        });
    };



    return (

        <>








            <div className="flex-1 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-sm ">
                <div className="h-full flex flex-col bg-[#f1f1f0] px-1 w-full">
                    <div className="flex flex-row w-full">
                        <div className="flex flex-col w-full">
                            <div>
                                <div className="flex justify-center items-center ">
                                    <h2 className="text-xl font-bold text-gray-800 py-1">Process List</h2>

                                </div>
                                <div className=" flex justify-end items-center mt-4">

                                    <table className="w-full border-collapse table-fixed">
                                        <thead className="bg-gray-200 text-gray-800">

                                            <tr>
                                                <td className="border border-gray-300 px-2 py-1 text-center text-xs w-10">S No</td>
                                                <td className="border border-gray-300 px-2 py-1 text-center text-xs w-72">Process</td>
                                                <td className="border border-gray-300 px-2 py-1 text-center text-xs w-48">Loss %</td>
                                                <td className="border border-gray-300 px-2 py-1 text-center text-xs w-16">Actions</td>


                                            </tr>

                                        </thead>
                                        <tbody>
                                            {orderYarnDetails[selectedIndex]?.RequirementYarnProcessList?.map((item, index) => (


                                                <tr className=''>
                                                    <td className="border border-gray-300 px-2 py-1 text-left text-xs w-9">{index + 1}</td>

                                                    <td className="border border-gray-300 px-2 py-1 text-left text-xs">
                                                        <select
                                                            // onKeyDown={e => {
                                                            //     if (e.key === "Delete") {
                                                            //         handleInputChange("", index, yarn?.yarnId, "isProcess");
                                                            //     }
                                                            // }}
                                                            // disabled={readOnly}
                                                            className="text-left w-full rounded h-full py-1"
                                                            value={item?.processId}
                                                            onChange={(e) => handleInputChange(parseInt(e.target.value), selectedIndex, null, "processId", index)}
                                                            onBlur={(e) => handleInputChange(e.target.value, selectedIndex, null, "processId", index)}
                                                        >
                                                            <option value={""} key={""}>
                                                                select
                                                            </option>
                                                            {processList?.map(size => (

                                                                <option value={size?.id} key={size?.id}>
                                                                    {size?.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>


                                                    <td className=" border border-gray-300 text-right text-[12px] py-1.5 px-2 text-xs">
                                                        <input
                                                            className=" rounded px-1 ml-2 w-full py-0.5 text-xs text-right"
                                                            type="number"
                                                            step="0.01"
                                                            min="0"

                                                            placeHolder="0.000"
                                                            onFocus={e => e.target.select()}
                                                            value={item?.lossPercentage}
                                                            onChange={(e) => handleInputChange(e.target.value, selectedIndex, null, "lossPercentage", index)}
                                                            onBlur={(e) => handleInputChange(e.target.value, selectedIndex, "lossPercentage", index)}
                                                        />
                                                    </td>
                                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs w-16">
                                                        <input

                                                            onContextMenu={(e) => {
                                                                handleRightClick(e, index, "notes");
                                                            }}
                                                            className='w-full '
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter") {
                                                                    e.preventDefault();
                                                                    handleAdd();
                                                                }
                                                            }}

                                                        />
                                                    </td>


                                                </tr>

                                            ))}

                                        </tbody>

                                    </table>
                                    {contextMenu && (
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: `${contextMenu.mouseY - 200}px`,
                                                left: `${contextMenu.mouseX - 270}px`,

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
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}
















