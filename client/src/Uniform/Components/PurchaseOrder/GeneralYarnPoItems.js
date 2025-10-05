import React, { useEffect, useState } from "react";
import { useGetYarnCountsQuery, useGetYarnMasterQuery } from "../../../redux/uniformService/YarnMasterServices";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { useGetUnitOfMeasurementMasterQuery } from "../../../redux/uniformService/UnitOfMeasurementServices";

import { useDispatch, useSelector } from "react-redux";
import { push } from "../../../redux/features/opentabs";
import { setLastTab, setOpenPartyModal } from "../../../redux/features/openModel";
import { HiPencil, HiPlus, HiTrash } from "react-icons/hi";
import { useGetCountsMasterQuery } from "../../../redux/uniformService/CountsMasterServices";
import Swal from "sweetalert2";
import Modal from "../../../UiComponents/Modal";
import TaxDetailsFullTemplate from "../TaxDetailsCompleteTemplate";
import { toast } from "react-toastify";
import { VIEW } from "../../../icons";
import { useGetExcessToleranceItemsQuery, useGetExcessToleranceQuery } from "../../../redux/services/ExcessToleranceServices";

const GeneralYarnPoItems = ({
    id,
    transType,
    poItems,
    setPoItems,
    readOnly,
    params,
    isSupplierOutside,
    taxTypeId,
    greyFilter,
    poMaterial,
}) => {

    const { data: excessToleranceData } = useGetExcessToleranceItemsQuery({ params });

    const [currentSelectedIndex, setCurrentSelectedIndex] = useState("")


    useEffect(() => {
        if (poItems?.length >= 3) return
        setPoItems(prev => {
            let newArray = Array?.from({ length: 3 - prev?.length }, () => {
                return {
                    yarnId: "",
                    tax: "0",
                    colorId: "",
                    uomId: "",
                    discountValue: "0.00",
                    noOfBags: 0,
                    weightPerBag: 0,


                }
            })
            return [...prev, ...newArray]
        }
        )
    }, [setPoItems, poItems])


    const handleInputChange = (value, index, field, requiredQty, balanceQty) => {

        let filterArray = excessToleranceData?.data?.filter(item => item.excessType == "PURCHASE" && item.material == "GREYYARN")

        console.log(filterArray, "filterArray", requiredQty > 0)

        const newBlend = structuredClone(poItems);


        // if (field === "qty" && requiredQty > 0) {
        //          let cost = 0;   

        //     for (let rule of filterArray) {
        //         console.log(rule.from, requiredQty, rule.to, "rule", rule.excessQty, balanceQty)
        //         if (rule.from <= requiredQty && requiredQty <= rule.to) {
        //             cost = rule.excessQty;
        //             break;
        //         }
        //     }
        //     console.log(cost, "cost")
        //     if (parseFloat(cost) + parseFloat(balanceQty) < value) {
        //         Swal.fire({
        //             title: `allowed Purchase Qty  ${parseFloat(cost) + parseFloat(balanceQty)}`,
        //             icon: "success",
        //             draggable: true,
        //             timer: 1000,
        //             showConfirmButton: false,
        //             didOpen: () => {
        //                 Swal.showLoading();
        //             }
        //         });
        //         return
        //     }
        //     else {
        //         newBlend[index][field] = value;

        //     }
        // }
        // else {

            newBlend[index][field] = value;
        // }

        setPoItems(newBlend);
    };

    console.log(poMaterial === "DyedYarn", "poItemspoItems", poMaterial)


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

    const { data: countsList } = useGetYarnCountsQuery({ params });











    return (
        <>
            <Modal isOpen={Number.isInteger(currentSelectedIndex)} onClose={() => setCurrentSelectedIndex("")}>
                <TaxDetailsFullTemplate readOnly={readOnly} setCurrentSelectedIndex={setCurrentSelectedIndex} taxTypeId={taxTypeId} currentIndex={currentSelectedIndex} poItems={poItems} handleInputChange={handleInputChange} isSupplierOutside={isSupplierOutside}
                />
            </Modal>

            <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm max-h-[250px] overflow-auto">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="font-bold text-slate-700">List Of Items</h2>


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

                                    className={`w-80 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Items<span className="text-red-500">*</span>
                                </th>

                                <th

                                    className={`w-52 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Color<span className="text-red-500">*</span>
                                </th>

                                <th

                                    className={`w-24 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Counts<span className="text-red-500">*</span>
                                </th>
                                <th

                                    className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    UOM<span className="text-red-500">*</span>
                                </th>
                                {/* <th

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
                                </th> */}
                                <th

                                    className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Qty  (kgs)<span className="text-red-500">*</span>
                                </th>
                                <th

                                    className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Price<span className="text-red-500">*</span>
                                </th>


                                <th

                                    className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                >
                                    Gross
                                </th>
                                <th

                                    className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                >
                                    View Tax
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
                                            tabIndex={"0"} disabled={readOnly || transType == "Order Purchase" || !transType } className='text-left w-full rounded py-1 table-data-input'
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
                                            onKeyDown={e => {
                                                if (e.key === "Delete") {
                                                    handleInputChange("", index, "colorId")
                                                }
                                            }}
                                            disabled={readOnly || transType == "Order Purchase" || !transType ||  !row?.yarnId}
                                            className="text-left w-full rounded py-1 table-data-input"
                                            value={row.colorId}
                                            onChange={e => handleInputChange(e.target.value, index, "colorId")}
                                            onBlur={e => handleInputChange(e.target.value, index, "colorId")}
                                        >
                                            <option hidden></option>
                                            {(id ? colorList?.data : colorList?.data.filter(item => item.active))?.map(blend => (
                                                <option value={blend.id} key={blend.id}>
                                                    {blend?.name}
                                                </option>
                                            ))}
                                        </select>

                                    </td>





                                    <td className="py-0.5 border border-gray-300 text-[11px]">
                                        <select
                                            onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "colorId") } }}
                                            disabled={readOnly || transType == "Order Purchase" || !transType ||  !row?.yarnId}
                                            className='text-left w-full rounded py-1 table-data-input'
                                            value={row.count}
                                            onChange={(e) => handleInputChange(e.target.value, index, "count")}
                                            onBlur={(e) => {
                                                handleInputChange((e.target.value), index, "count")
                                            }
                                            }
                                        >
                                            <option hidden>
                                            </option>
                                            {(id ? countsList?.data : countsList?.data)?.map((blend) =>
                                                <option value={blend.id} key={blend.id}>
                                                    {blend?.name}
                                                </option>
                                            )}
                                        </select>
                                    </td>



                                    <td className="w-12 border border-gray-300 text-[11px] py-0.5">
                                        <select
                                            onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "uomId") } }}
                                            disabled={readOnly || !transType ||  !row?.yarnId} className='text-left w-full rounded py-1 table-data-input' value={row.uomId} onChange={(e) => handleInputChange(e.target.value, index, "uomId")}
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
{/* 
                                    <td className="w-48 border border-gray-300 text-[11px] text-right py-1.5 px-2">
                                        {(row.requiredQty || 0.000)?.toFixed(3)}
                                    </td>
                                    <td className="w-48 border border-gray-300 text-[11px] text-right py-1.5 px-2">
                                        {(row.alreadyPoqty || 0.000)?.toFixed(3)}

                                    </td> */}
                                    {/* <td className="border border-gray-300 text-[11px] text-right py-1.5 px-2">
                                        {Math.max(0, (parseFloat(row?.requiredQty) || 0) - (parseFloat(row?.alreadyPoqty) || 0))?.toFixed(3)}
                                    </td> */}
                                    <td className=" border border-gray-300 text-right text-[11px] py-1.5 px-2 text-xs">
                                        <input
                                            className=" rounded px-1 ml-2 w-full py-0.5 text-xs focus:outline-none text-right"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={row?.qty}



                                            onFocus={e => e.target.select()}

                                            onKeyDown={(e) => {
                                                if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                                            }}

                                            placeHolder="0.000"

                                            disabled={readOnly || !transType ||  !row?.yarnId   }
                                             onChange={(e) => {
                                                const numVal = parseFloat(e.target.value) || 0;
                                                const balanceQty = Math.max(0, (parseFloat(row?.requiredQty) || 0) - (parseFloat(row?.alreadyPoqty) || 0));

                                                handleInputChange(numVal, index, "qty", row.requiredQty, balanceQty);


                                            }}
                                            onBlur={(e) => {
                                                const balanceQty = Math.max(0, (parseFloat(row?.requiredQty) || 0) - (parseFloat(row?.alreadyPoqty) || 0));
                                                const val = e.target.value;
                                                const formatted = e.target.value === "" ? "" : parseFloat(e.target.value).toFixed(3);
                                                e.target.value = formatted;
                                                handleInputChange(val === "" ? 0 : formatted, index, "qty", row.requiredQty, balanceQty);
                                            }}

                                        />
                                    </td>

                                    <td className=" border border-gray-300 text-right text-[11px] py-1.5 px-2 text-xs">
                                        <input
                                            className=" rounded px-1 ml-2 w-full py-0.5 text-xs focus:outline-none text-right"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={row?.price}



                                            onFocus={e => e.target.select()}

                                            onKeyDown={(e) => {
                                                if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                                            }}

                                            placeHolder="0.000"

                                            disabled={readOnly || !transType ||  !row?.yarnId}
                                            onChange={(e) => {
                                                const numVal = parseFloat(e.target.value) || 0;

                                                handleInputChange(numVal, index, "price");


                                            }}
                                            onBlur={(e) => {
                                                const val = e.target.value;
                                                const formatted = e.target.value === "" ? "" : parseFloat(e.target.value).toFixed(3);
                                                e.target.value = formatted;
                                                handleInputChange(val === "" ? 0 : formatted, index, "price");
                                            }}

                                        />
                                    </td>
                                    <td className="w-40 py-0.5 border border-gray-300 text-[11px] text-right">
                                        <input
                                            type="number"
                                            onFocus={(e) => e.target.select()}
                                            className="text-right rounded py-1 w-16 px-1 table-data-input"
                                            value={(!row.qty || !row.price) ? 0.00 : (parseFloat(row.qty) * parseFloat(row.price)).toFixed(3)}
                                            disabled={true}
                                        />
                                    </td>
                                    <td className='w-40 py-0.5 border border-gray-300 text-[11px] text-right'>
                                        <button
                                            className="text-center rounded py-1 w-20"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    setCurrentSelectedIndex(index);
                                                }
                                            }}
                                            onClick={() => {
                                                if (!taxTypeId) return toast.info("Please select Tax Type", { position: "top-center" });
                                                setCurrentSelectedIndex(index)
                                            }}>
                                            {VIEW}
                                        </button>
                                    </td>


                                    <td className="w-40 py-0.5 border border-gray-300 text-[11px] text-right">
                                        <div className="flex space-x-2  justify-center">


                                            <span className="tooltip-text">View</span>

                                            <span className="tooltip-text">Edit</span>
                                            <button
                                                onClick={() => deleteRow(index)}
                                                className="text-red-600 hover:text-red-800 bg-red-50  py-1 rounded text-xs flex items-center"
                                            >
                                                <HiTrash className="w-4 h-4" />

                                            </button>
                                            <span className="tooltip-text">Delete</span>

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

export default GeneralYarnPoItems;
