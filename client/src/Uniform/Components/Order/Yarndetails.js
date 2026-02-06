import React, { useEffect, useState } from 'react'
import { TextArea, TextInput } from '../../../Inputs'
import { findFromList, params } from '../../../Utils/helper'
import { HiPencil, HiPlus, HiTrash } from 'react-icons/hi'
import { useGetYarnCountsQuery } from '../../../redux/uniformService/YarnMasterServices'
import { Plus } from 'lucide-react'



export default function TableGridItems({ item, gridIndex, id, setOrderDetails, orderDetails, readOnly, yarnList, selectedIndex,

    yarnNeedleList, countsList, colorlist, onClose ,accessoryTemplateData
}) {


    const [contextMenu, setContextMenu] = useState(null);


    const handleRightClick = (event, rowIndex, type) => {
        console.log(rowIndex, "rowIndexs");

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


    const { data: allData } = useGetYarnCountsQuery({ params })



    function handleInputChange(value, index, field) {


        console.log(value, "value", index)
        let orderYarnDetails = "orderYarnDetails"


        setOrderDetails(orderDetails => {
            const newBlend = structuredClone(orderDetails);
            newBlend[gridIndex][orderYarnDetails][index][field] = value;
            return newBlend
        }
        );
    };


    function handleDeleteAllRows(gridIndex) {
        setOrderDetails(prev => {
            const updated = structuredClone(prev);
            const details = updated[gridIndex]?.orderYarnDetails;

            if (Array.isArray(details) && details.length > 1) {
                updated[gridIndex].orderYarnDetails = [details[0]]; // keep only first row
            }

            return updated;
        });
    }


    function addNewRow() {
        setOrderDetails(prev => {
            const newPrev = structuredClone(prev);
            const orderYarnDetailsKey = "orderYarnDetails";

            if (!newPrev[selectedIndex][orderYarnDetailsKey]) {
                newPrev[selectedIndex][orderYarnDetailsKey] = [];
            }

            console.log(newPrev[selectedIndex][orderYarnDetailsKey], "gridIndex");

            newPrev[selectedIndex][orderYarnDetailsKey].push({
                yarnId: '',
            });

            return newPrev;
        });


    }


    function handleEdit(index) {
        setOrderDetails(prev => {
            const newPrev = structuredClone(prev);

            const itemData = newPrev[index]?.orderDetailsSubGrid?.[0] || {};

            if (!Array.isArray(newPrev[index].orderDetailsSubGrid)) {
                newPrev[index].orderDetailsSubGrid = [];
            }

            newPrev[index].orderDetailsSubGrid.push({

                size: "",
                sizeMesaurement: "",
                qty: 0,

            });

            return newPrev;
        });
    }

    function deleteRow(yarnIndex) {

        setOrderDetails(prev => {
            // const updated = [...prev];
            const updated = structuredClone(prev);
            updated[gridIndex].orderYarnDetails
                .splice(yarnIndex, 1);


            if (updated[gridIndex].orderYarnDetails
                .length === 0) {
                updated.splice(gridIndex, 1);
            }

            return updated;
        });
    }
    function deleteSubRow(rowIndex, subRowIndex) {

        setOrderDetails(prev => {
            // const updated = [...prev];
            const updated = structuredClone(prev);
            updated[rowIndex].orderYarnDetails.splice(subRowIndex, 1);


            if (updated[rowIndex].orderDetailsSubGrid.length === 0) {
                updated.splice(rowIndex, 1);
            }

            return updated;
        });
    }

    console.log(orderDetails, "orderdetails")
    return (

        <>





            <div className="h-full flex flex-col bg-[#f1f1f0]">
                <div className="border-b py-2 px-4 mx-3 flex justify-between items-center sticky top-0 z-10 bg-white mt-3">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
                            {id ? (!readOnly ? "Edit Yarn Details" : "Yarn Details ") : "Add New Yarn"}
                        </h2>

                    </div>
                    <div className="flex gap-2">
                        <div>
                            {readOnly && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        // setForm(false);
                                        // setSearchValue("");
                                        // setId(false);
                                    }}
                                    className="px-3 py-1 text-red-600 hover:bg-red-600 hover:text-white border border-red-600 text-xs rounded"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            {!readOnly && (
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
                                        border border-green-600 flex items-center gap-1 text-xs"
                                >
                                    {/* <Check size={14} /> */}
                                    Done
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex-1  p-3">
                    <div className="grid grid-cols-1  gap-3  h-full">
                        <div className="lg:col-span- space-y-3">
                            <div className="bg-white p-3 rounded-md border border-gray-200 h-full">

                                <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm ">
                                    <div className="flex justify-between items-center mb-2">
                                        <h2 className="font-medium text-slate-700">List Of Items</h2>
                                        {/* <div className="flex gap-2 items-center">

                                            <button
                                                onClick={() => {
                                                    addNewRow()
                                                }}
                                                className="hover:bg-green-600 text-green-600 hover:text-white border border-green-600 px-2 py-1 rounded-md flex items-center text-xs"
                                            >
                                                <HiPlus className="w-3 h-3 mr-1" />
                                                Add Item
                                            </button>
                                        </div> */}

                                    </div>
                                    <div className={` relative w-full max-h-[300px] overflow-y-auto  py-1`}>
                                        <table className="w-full border-collapse table-fixed">
                                            <thead className="bg-gray-200 text-gray-800">
                                                <tr

                                                >
                                                    <th
                                                        className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                                                    >
                                                        S.No
                                                    </th>
                                                    <th

                                                        className={`w-24 px-4 py-2 text-center font-medium text-[13px] `}
                                                    >
                                                        Color
                                                    </th>
                                                    {/* <th

                                    className={`w-52 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Yarn category
                                </th> */}
                                                    <th

                                                        className={`w-44 px-4 py-2 text-center font-medium text-[13px] `}
                                                    >
                                                        Yarn
                                                    </th>
                                                    {/* <th

                                                        className={`w-36 px-4 py-2 text-center font-medium text-[13px] `}
                                                    >
                                                        Count
                                                    </th> */}
                                                    {/* <th

                                                        className={`w-24 px-4 py-2 text-center font-medium text-[13px] `}
                                                    >
                                                        Needle Type
                                                    </th> */}


                                                    <th

                                                        className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                                    >
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody className=' '>

                                                {(item?.orderYarnDetails ? item?.orderYarnDetails : [])?.map((row, index) =>
                                                    <tr className="border border-blue-gray-200 cursor-pointer "

                                                        onContextMenu={(e) => {
                                                            if (!readOnly) {
                                                                handleRightClick(e, index, "notes");
                                                            }
                                                        }}>
                                                        <td className="w-12 border border-gray-300 text-[11px]  text-center p-0.5 ">{index + 1}</td>

                                                        <td className="py-0.5 border border-gray-300 text-[11px] ">
                                                            <select
                                                                onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "colorId") } }}
                                                                tabIndex={"0"} disabled={readOnly} className='text-left w-full rounded py-1 focus:outline-none'
                                                                value={row.colorId}
                                                                onChange={(e) => handleInputChange(e.target.value, index, "colorId")}
                                                                onBlur={(e) => {
                                                                    handleInputChange((e.target.value), index, "colorId")
                                                                }
                                                                }
                                                            >
                                                                <option >
                                                                </option>
                                                                {(id ? colorlist?.data : colorlist?.data?.filter(item => item.active))?.map((blend) =>
                                                                    <option value={blend.id} key={blend.id}>
                                                                        {blend?.name}
                                                                    </option>)}
                                                            </select>
                                                        </td>
                                                        <td className="py-0.5 border border-gray-300 text-[11px] ">
                                                            <select
                                                                onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "yarnTypeId") } }}
                                                                tabIndex={"0"} disabled={readOnly} className='text-left w-full rounded py-1 focus:outline-none'
                                                                value={row.yarnId}
                                                                onChange={(e) => handleInputChange(e.target.value, index, "yarnId")}
                                                                onBlur={(e) => {
                                                                    handleInputChange((e.target.value), index, "yarnId")
                                                                }
                                                                }
                                                            >
                                                                <option >
                                                                </option>
                                                                {(id ? yarnList?.data : yarnList?.data?.filter(item => item.active))?.map((blend) =>
                                                                    <option value={blend.id} key={blend.id}>
                                                                        {blend?.name}
                                                                    </option>)}

                                                            </select>
                                                        </td>


                                                        {/* <td className="py-0.5 border border-gray-300 text-[11px]">
                                                            <select
                                                                onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "colorId") } }}
                                                                disabled={readOnly} className='text-left w-full rounded py-1 focus:outline-none'
                                                                value={row.count}
                                                                onChange={(e) => handleInputChange(e.target.value, index, "count")}
                                                                onBlur={(e) => {
                                                                    handleInputChange((e.target.value), index, "count")
                                                                }
                                                                }
                                                            >
                                                                <option hidden>
                                                                </option>
                                                                {(allData?.data?.filter(count => count.yarnId == row.yarnId))?.map((blend) =>
                                                                    <option value={blend.id} key={blend.id}>
                                                                        {blend?.id}
                                                                    </option>
                                                                )}
                                                            </select>
                                                        </td> */}
                                                        {/* <td className="py-0.5 border border-gray-300 text-[11px]">
                                                            <select
                                                                onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "colorId") } }}
                                                                disabled={readOnly} className='text-left w-full rounded py-1 focus:outline-none' value={row.yarnKneedleId}
                                                                onChange={(e) => handleInputChange(e.target.value, index, "yarnKneedleId")}
                                                                onBlur={(e) => {
                                                                    handleInputChange((e.target.value), index, "yarnKneedleId")
                                                                }
                                                                }
                                                            >
                                                                <option hidden>
                                                                </option>
                                                                {(id ? yarnNeedleList?.data : yarnNeedleList?.data.filter(item => item.active))?.map((blend) =>
                                                                    <option value={blend.id} key={blend.id}>
                                                                        {blend?.name}
                                                                    </option>
                                                                )}
                                                            </select>
                                                        </td> */}
                                                        <td
                                                            className="w-10 border border-gray-300"

                                                        >
                                                            {/* <input

                                                                onContextMenu={(e) => {
                                                                    if (!readOnly) {
                                                                        handleRightClick(e, index, "notes");
                                                                    }
                                                                }}
                                                                className='w-full '
                                                                onKeyDown={(e) => {
                                                                    if (e.key === "Enter") {
                                                                        e.preventDefault();
                                                                        addNewRow();
                                                                    }
                                                                }}

                                                            /> */}
                                                            <button
                                                                onKeyDown={(e) => {
                                                                    if (e.key === "Enter") {
                                                                        e.preventDefault();
                                                                        addNewRow();
                                                                    }
                                                                }}
                                                                className="flex items-center justify-center w-full py-1"
                                                            >
                                                                <Plus size={18} className="text-red-800" />
                                                            </button>
                                                        </td>









                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>

                                    </div>

                                </div>
                                {contextMenu && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            top: `${contextMenu.mouseY - 120}px`,
                                            left: `${contextMenu.mouseX - 200}px`,

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
                                            <button
                                                className=" text-black text-[12px] text-left rounded px-1"
                                                onClick={() => {
                                                    handleDeleteAllRows(gridIndex);
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
        </>
    )
}

