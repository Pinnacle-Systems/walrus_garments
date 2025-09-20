import React, { useEffect, useState } from "react";
import { useGetYarnMasterQuery } from "../../../redux/uniformService/YarnMasterServices";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { useGetUnitOfMeasurementMasterQuery } from "../../../redux/uniformService/UnitOfMeasurementServices";

import { useDispatch, useSelector } from "react-redux";
import { push } from "../../../redux/features/opentabs";
import { setLastTab, setOpenPartyModal } from "../../../redux/features/openModel";
import { HiPencil, HiPlus, HiTrash } from "react-icons/hi";
import { useGetCountsMasterQuery } from "../../../redux/uniformService/CountsMasterServices";

const YarnPoItems = ({
    id,
    transType,
    poItems,
    setPoItems,
    readOnly,
    params,
    isSupplierOutside,
    taxTypeId,
    greyFilter,
}) => {

    console.log(poItems, "PoItems")
    useEffect(() => {
        if (poItems?.length >= 3) return
        setPoItems(prev => {
            let newArray = Array?.from({ length: 3 - prev?.length }, () => {
                return {
                    yarnId: "",
                    qty: "0",
                    tax: "0",
                    colorId: "",
                    uomId: "",
                    price: "0",
                    discountValue: "0.00",
                    noOfBags: 0,
                    weightPerBag: 0,


                }
            })
            return [...prev, ...newArray]
        }
        )
    }, [setPoItems, poItems])
    console.log(poItems, "poItems");


    const handleInputChange = (value, index, field) => {
        const newBlend = structuredClone(poItems);
        newBlend[index][field] = value;
        // if (field === "yarnId") {
        //     newBlend[index]["taxPercent"] = findYarnTax(value);
        // }
        // // if (field !== "qty") {
        // //   newBlend[index]["qty"] = (
        // //     parseFloat(newBlend[index]["noOfBags"]) *
        // //     parseFloat(newBlend[index]["weightPerBag"])
        // //   ).toFixed(3);
        // // }
        setPoItems(newBlend);
    };



    const addNewRow = () => {
        const newRow = {
            yarnId: "",
            qty: "0",
            tax: "0",
            colorId: "",
            uomId: "",
            price: "0",
            discountValue: "0.00",
            noOfBags: 0,
            weightPerBag: 0,
        };
        setPoItems([...poItems, newRow]);
    };


    const deleteRow = (id) => {
        setPoItems((yarnBlend) =>
            yarnBlend.filter((row, index) => index !== parseInt(id))
        );
    };
    const activeTab = useSelector((state) =>
        state.openTabs.tabs.find((tab) => tab.active).name
    );

    const { data: yarnList } = useGetYarnMasterQuery({ params });
    const { data: uomList } = useGetUnitOfMeasurementMasterQuery({ params });
    const {
        data: colorList, isLoading: isColorLoading, isFetching: isColorFetching, } = useGetColorMasterQuery({ params: { ...params, isGrey: greyFilter ? true : undefined } });

    const { data: countsList } = useGetCountsMasterQuery({ params });











    return (
        <>


            <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm max-h-[250px] overflow-auto">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="font-bold text-slate-700">List Of Items</h2>
                    {/* <div className="flex gap-2 items-center">

                        <button
                            onClick={() => {
                                // addNewRow()
                            }}
                            className="hover:bg-green-600 text-green-600 hover:text-white border border-green-600 px-2 py-1 rounded-md flex items-center text-xs"
                        >
                            <HiPlus className="w-3 h-3 mr-1" />
                            Add Item
                        </button>
                    </div> */}

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

                                    className={`w-52 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Items
                                </th>
                                <th

                                    className={`w-52 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Colors
                                </th>
                                <th

                                    className={`w-52 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Counts
                                </th>
                                <th

                                    className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    UOM
                                </th>
                                <th

                                    className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                >
                                    Required Qty (kgs)
                                </th>
                                <th

                                    className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Already Purchased Qty (kgs)
                                </th>

                                <th

                                    className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Balance Purchase Qty  (kgs)
                                </th>
                                <th

                                    className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Price
                                </th>


                                <th

                                    className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                >
                                    Gross
                                </th>

                                <th

                                    className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                >
                                    Actions
                                </th>
                                {/* ))} */}
                            </tr>
                        </thead>

                        <tbody>

                            {(poItems ? poItems : [])?.map((row, index) =>
                                <tr className="border border-blue-gray-200 cursor-pointer " >
                                    <td className="w-12 border border-gray-300 text-[11px]  text-center p-0.5 ">{index + 1}</td>
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
                                                    {blend?.name}
                                                </option>)}
                                        </select>
                                    </td>



                                    <td className="py-0.5 border border-gray-300 text-[11px]">
                                        <select
                                            onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "colorId") } }}
                                            disabled={readOnly} className='text-left w-full rounded py-1 table-data-input' value={row.colorId}
                                            onChange={(e) => handleInputChange(e.target.value, index, "colorId")}
                                            onBlur={(e) => {
                                                handleInputChange((e.target.value), index, "colorId")
                                            }
                                            }
                                        >
                                            <option hidden>
                                            </option>
                                            {(id ? colorList?.data : colorList?.data.filter(item => item.active))?.map((blend) =>
                                                <option value={blend.id} key={blend.id}>
                                                    {blend?.name}
                                                </option>
                                            )}
                                        </select>
                                    </td>



                                    <td className="py-0.5 border border-gray-300 text-[11px]">
                                        <select
                                            onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "colorId") } }}
                                            disabled={readOnly} className='text-left w-full rounded py-1 table-data-input' value={row.count}
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



                                    <td className="w-12 border border-gray-300 text-[11px] py-0.5">
                                        <select
                                            onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "uomId") } }}
                                            disabled={readOnly} className='text-left w-full rounded py-1 table-data-input' value={row.uomId} onChange={(e) => handleInputChange(e.target.value, index, "uomId")}
                                            onBlur={(e) => {
                                                handleInputChange((e.target.value), index, "uomId")
                                            }
                                            }
                                        >

                                            <option hidden>
                                            </option>
                                            {(id ? uomList?.data : uomList?.data?.filter(item => item.active))?.map((blend) =>
                                                <option value={blend.id} key={blend.id}>
                                                    {blend.name}
                                                </option>
                                            )}
                                        </select>
                                    </td>

                                    <td className="w-48 border border-gray-300 text-[11px] text-right py-1.5 px-2">
                                        {row.requiredQty}
                                    </td>  <td className="w-48 border border-gray-300 text-[11px] text-right py-1.5 px-2">
                                        {row.alreadyPoQty}

                                    </td>

                                    <td className="w-40  border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                                        <input
                                            min="0"
                                            type="number"
                                            className="text-right rounded py-1 px-1 w-full table-data-input"
                                            onFocus={(e) => e.target.select()}
                                            value={row?.qty ?? 0}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                handleInputChange(val === "" ? 0 : val, index, "qty");
                                            }}
                                            onBlur={(e) => {
                                                const val = e.target.value;
                                                handleInputChange(val === "" ? 0 : parseFloat(val).toFixed(2), index, "qty");
                                            }}
                                        />
                                    </td>

                                    <td className="w-40 py-0.5 border border-gray-300 text-[11px] text-right">
                                        <input
                                            onKeyDown={e => {
                                                if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                                                if (e.key === "Delete") { handleInputChange("0.00", index, "price") }
                                            }}
                                            min={"0"}
                                            type="number"
                                            className="text-right rounded py-1 w-full px-1 table-data-input"
                                            onFocus={(e) => e.target.select()}
                                            value={(!row.price) ? 0 : row.price}
                                            disabled={readOnly}
                                            onChange={(e) =>
                                                handleInputChange(e.target.value, index, "price")
                                            }
                                            onBlur={(e) => {
                                                handleInputChange(parseFloat(e.target.value).toFixed(2), index, "price");

                                            }
                                            }
                                        />

                                    </td>

                                    <td className="w-40 py-0.5 border border-gray-300 text-[11px] text-right">
                                        <input
                                            type="number"
                                            onFocus={(e) => e.target.select()}
                                            className="text-right rounded py-1 w-16 px-1 table-data-input"
                                            value={(!row.qty || !row.price) ? 0.00 : (parseFloat(row.qty) * parseFloat(row.price)).toFixed(2)}
                                            disabled={true}
                                        />
                                    </td>
                                  


                                    <td className="w-40 py-0.5 border border-gray-300 text-[11px] text-right">
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
    );
};

export default YarnPoItems;
