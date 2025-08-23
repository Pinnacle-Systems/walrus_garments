import React, { useEffect } from 'react'
import { TextArea, TextInput } from '../../../Inputs'
import { findFromList } from '../../../Utils/helper'
import { HiPencil, HiPlus, HiTrash } from 'react-icons/hi'



export default function TableGridItems({ item, gridIndex, id, setOrderDetails, yarnTypeList, readOnly, yarnList, selectedIndex,

    yarnNeedleList, countsList, colorlist
}) {


    console.log(selectedIndex, "selectedIndex");




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
        // if (readOnly) return toast.info("Turn on Edit Mode...!!!")
        // setOrderDetails(prev => prev.filter((_, i) => i !== index))
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
    return (

        <>
            <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm max-h-[300px] overflow-auto">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="font-medium text-slate-700">List Of Items</h2>
                    <div className="flex gap-2 items-center">

                        <button
                            onClick={() => {
                                addNewRow()
                            }}
                            className="hover:bg-green-600 text-green-600 hover:text-white border border-green-600 px-2 py-1 rounded-md flex items-center text-xs"
                        >
                            <HiPlus className="w-3 h-3 mr-1" />
                            Add Item
                        </button>
                    </div>

                </div>
                <div className={` relative w-full overflow-y-auto py-1`}>
                    <table className="w-full border-collapse table-fixed">
                        <thead className="bg-gray-200 text-gray-800">
                            <tr>
                                <th
                                    className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    S.No
                                </th>
                                <th

                                    className={`w-52 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Color
                                </th>
                                <th

                                    className={`w-52 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Yarn category
                                </th>
                                <th

                                    className={`w-44 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Yarn
                                </th>
                                <th

                                    className={`w-36 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Count
                                </th>
                                <th

                                    className={`w-24 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Needle Type
                                </th>


                                <th

                                    className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                >
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody>

                            {(item?.orderYarnDetails ? item?.orderYarnDetails : [])?.map((row, index) =>
                                <tr className="border border-blue-gray-200 cursor-pointer " >
                                    <td className="w-12 border border-gray-300 text-[11px]  text-center p-0.5 ">{index + 1}</td>

                                    <td className="py-0.5 border border-gray-300 text-[11px] ">
                                        <select
                                            onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "colorId") } }}
                                            tabIndex={"0"} disabled={readOnly} className='text-left w-full rounded py-1 table-data-input'
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
                                            tabIndex={"0"} disabled={readOnly} className='text-left w-full rounded py-1 table-data-input'
                                            value={row.yarncategoryId}
                                            onChange={(e) => handleInputChange(e.target.value, index, "yarncategoryId")}
                                            onBlur={(e) => {
                                                handleInputChange((e.target.value), index, "yarncategoryId")
                                            }
                                            }
                                        >
                                            <option >
                                            </option>
                                                {(id ? yarnTypeList?.data : yarnTypeList?.data?.filter(item => item.active))?.map((blend) =>
                                                <option value={blend.id} key={blend.id}>
                                                    {blend?.name}
                                                </option>)}
                                           
                                        </select>
                                    </td>


                                    <td className="py-0.5 border border-gray-300 text-[11px] ">
                                        <select
                                            onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "yarnId") } }}
                                            tabIndex={"0"} disabled={readOnly} className='text-left w-full rounded py-1 table-data-input'
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
                                                    {blend?.aliasName}
                                                </option>)}
                                        </select>
                                    </td>
                                    <td className="py-0.5 border border-gray-300 text-[11px]">
                                        <select
                                            onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "colorId") } }}
                                            disabled={readOnly} className='text-left w-full rounded py-1 table-data-input'
                                            value={row.count}
                                            onChange={(e) => handleInputChange(e.target.value, index, "count")}
                                            onBlur={(e) => {
                                                handleInputChange((e.target.value), index, "count")
                                            }
                                            }
                                        >
                                            <option hidden>
                                            </option>
                                            {(id ? countsList?.data : countsList?.data.filter(item => item.active))?.map((blend) =>
                                                <option value={blend.id} key={blend.id}>
                                                    {blend?.name}
                                                </option>
                                            )}
                                        </select>
                                    </td>
                                    <td className="py-0.5 border border-gray-300 text-[11px]">
                                        <select
                                            onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "colorId") } }}
                                            disabled={readOnly} className='text-left w-full rounded py-1 table-data-input' value={row.yarnKneedleId}
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
                                    </td>






                                    <td className="w-16 px-1 py-1 text-center">
                                        <div className="flex space-x-2  justify-center">

                                            <button
                                                // onClick={() => handleView(index)}
                                                // onMouseEnter={() => setTooltipVisible(true)}
                                                // onMouseLeave={() => setTooltipVisible(false)}
                                                className="text-blue-800 flex items-center  bg-blue-50 rounded"
                                            >
                                                👁 <span className="text-xs"></span>
                                            </button>
                                            <span className="tooltip-text">View</span>
                                            <button
                                                // onClick={() => handleEdit(index)}
                                                className="text-green-600 hover:text-green-800 bg-green-50 py-1 rounded text-xs flex items-center"
                                            >
                                                <HiPencil className="w-4 h-4" />

                                            </button>
                                            <span className="tooltip-text">Edit</span>
                                            <button
                                                onClick={() => deleteRow(index)}
                                                className="text-red-600 hover:text-red-800 bg-red-50  py-1 rounded text-xs flex items-center"
                                            >
                                                <HiTrash className="w-4 h-4" />

                                            </button>
                                            <span className="tooltip-text">Delete</span>

                                            {/* {tooltipVisible && (
                                                                   <div className="absolute  z-10 top-full right-0 mt-1 w-48 bg-indigo-800 text-white text-xs rounded p-2 shadow-lg">
                                                                       <div className="flex items-start">
                                                                           <FaInfoCircle className="flex-shrink-0 mt-0.5 mr-1" />
                                                                           <span>View</span>
                                                                       </div>
                                                                       <div className="absolute -top-1 right-3 w-2.5 h-2.5 bg-indigo-800 transform rotate-45"></div>
                                                                   </div>
                                                               )} */}
                                        </div>
                                    </td>



                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>





        </>
    )
}

