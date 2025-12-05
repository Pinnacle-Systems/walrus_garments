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
import { useGetHsnMasterQuery } from "../../../redux/services/HsnMasterServices";
import { findFromList } from "../../../Utils/helper";

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
    hsnData,
    setTableDataView,
    supplierId,
    poMaterial,

    yarnList,
    uomList,
    colorList,
    countsList,

}) => {

    const { data: excessToleranceData } = useGetExcessToleranceItemsQuery({ params });

    const [currentSelectedIndex, setCurrentSelectedIndex] = useState("")
    const [contextMenu, setContextMenu] = useState(null);


    useEffect(() => {
        if (poItems?.length >= 3) return
        setPoItems(prev => {
            let newArray = Array?.from({ length: 3 - prev?.length }, () => {
                return {
                    yarnId: "",
                    colorId: "",
                    uomId: "",
                    discountValue: "0.00",


                }
            })
            return [...prev, ...newArray]
        }
        )
    }, [setPoItems, poItems])

    console.log(poMaterial, "poMaterial")


    const handleInputChange = (value, index, field, requiredQty, balanceQty, weightPerBag) => {

        console.log(balanceQty, "balanceQty")

        const newBlend = structuredClone(poItems);

        if (field == "qty" || field == "noOfBags") {

            if (field == "qty") {

                let filterArray = excessToleranceData?.data
                    ?.filter(item =>
                        item.excessType === "PURCHASE" &&
                        (item.material?.toLowerCase() === poMaterial?.toLowerCase()) &&
                        item.active
                    )?.[0];


                // console.log("newnew", excessToleranceData?.data?.filter(item => item.material.toLowerCase()), poMaterial)
                console.log("filterArray", filterArray)

                let excessQty;
                let allowedQty;
                let overAll;
                let noOfBags;

                if (filterArray?.applyon == "APPLYOVERALL") {

                    if (filterArray?.qty == "PERCENTAGE") {
                        excessQty = parseFloat(requiredQty) * parseFloat(filterArray?.excessQty) / 100;
                        allowedQty = parseFloat(excessQty) + parseFloat(balanceQty);
                        if (allowedQty < weightPerBag) {
                            noOfBags = 1
                            allowedQty = weightPerBag
                        }
                        else {

                            noOfBags = Math.floor(parseFloat(allowedQty) / parseFloat(weightPerBag))
                        }
                        overAll = noOfBags * parseFloat(weightPerBag);
                    }

                }




                if (filterArray?.qty == "QTY") {

                    excessQty = filterArray?.excessQty
                    allowedQty = parseFloat(excessQty) + parseFloat(balanceQty);

                    console.log(allowedQty, weightPerBag, "allowedQty")

                    if (parseFloat(allowedQty) < parseFloat(weightPerBag)) {
                        noOfBags = 1
                        allowedQty = weightPerBag
                    }
                    else {
                        noOfBags = Math.floor(parseFloat(allowedQty) / parseFloat(weightPerBag))
                    }
                    overAll = noOfBags * parseFloat(weightPerBag);
                }

                // console.log(excessQty, "excessQty", allowedQty, "allowedQty", overAll, "overAll", noOfBags)
                // console.log(allowedQty > value, allowedQty,weightPerBag,"weightPerBag", value, "condition")

                if (parseFloat(value) > parseFloat(allowedQty)) {
                    Swal.fire({
                        title: `Allowed Qty is ${allowedQty}`,
                        icon: "warning",
                        timer: 1500,
                        showConfirmButton: false,
                        didOpen: () => {
                            Swal.showLoading();
                        }
                    });
                    newBlend[index]["noOfBags"] = noOfBags;
                    newBlend[index]["qty"] = allowedQty;


                } else {
                    newBlend[index][field] = parseFloat(value);
                }




            }

            if (field == "noOfBags") {

                let filterArray = excessToleranceData?.data
                    ?.filter(item =>
                        item.excessType === "PURCHASE" &&
                        (item.material?.toLowerCase() === poMaterial?.toLowerCase()) &&
                        item.active
                    )?.[0];

                let overallQty = parseFloat(value) * parseFloat(weightPerBag)

                console.log(filterArray, "filterArray")
                let excessQty;
                let allowedQty;
                let overAll;
                let noOfBags;

                if (filterArray?.applyon == "APPLYOVERALL") {

                    if (filterArray?.qty == "PERCENTAGE") {
                        excessQty = parseFloat(requiredQty) * parseFloat(filterArray?.excessQty) / 100;
                        allowedQty = parseFloat(excessQty) + parseFloat(balanceQty);
                        if (allowedQty < weightPerBag) {
                            noOfBags = 1
                        }
                        else {

                            noOfBags = Math.floor(parseFloat(allowedQty) / parseFloat(weightPerBag))
                        }
                        overAll = noOfBags * parseFloat(weightPerBag);
                    }
                    if (filterArray?.qty == "QTY") {
                        excessQty = filterArray?.excessQty
                        allowedQty = parseFloat(excessQty) + parseFloat(balanceQty);
                        if (allowedQty < weightPerBag) {
                            noOfBags = 1
                        }
                        else {

                            noOfBags = Math.floor(parseFloat(allowedQty) / parseFloat(weightPerBag))
                        }
                        overAll = noOfBags * parseFloat(weightPerBag);
                    }

                }
                console.log(requiredQty, "requiredQty", excessQty, "excessQty", allowedQty, "allowedQty", overAll, "overAll", noOfBags)
                console.log(allowedQty > value, allowedQty, value, "condition")

                if (parseFloat(overAll) < overallQty) {
                    Swal.fire({
                        title: `Allowed Bags is ${noOfBags}`,
                        icon: "success",
                        draggable: true,
                        timer: 1000,
                        showConfirmButton: false,
                        didOpen: () => {
                            Swal.showLoading();
                        }
                    });
                    newBlend[index]["noOfBags"] = noOfBags
                    newBlend[index]["qty"] = overAll

                }
                else {
                    newBlend[index][field] = value;

                }



            }
        } else {
            newBlend[index][field] = value;
        }

        setPoItems(newBlend);
    };





    console.log("poItems", poItems)


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


    const handleDeleteRow = (id) => {
        setPoItems((yarnBlend) => {
            if (yarnBlend.length <= 1) {
                return yarnBlend;
            }
            return yarnBlend.filter((_, index) => index !== parseInt(id));
        });
    };
    const handleDeleteAllRows = () => {
        setPoItems((prevRows) => {
            if (prevRows.length <= 1) return prevRows;
            return [prevRows[0]];
        });
    };

    const activeTab = useSelector((state) =>
        state.openTabs.tabs.find((tab) => tab.active).name
    );




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
            <Modal isOpen={Number.isInteger(currentSelectedIndex)} onClose={() => setCurrentSelectedIndex("")}>
                <TaxDetailsFullTemplate readOnly={readOnly} setCurrentSelectedIndex={setCurrentSelectedIndex} taxTypeId={taxTypeId} currentIndex={currentSelectedIndex} poItems={poItems} handleInputChange={handleInputChange} isSupplierOutside={isSupplierOutside} hsnData={hsnData?.data}
                />
            </Modal>

            <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm max-h-[250px] overflow-auto">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="font-bold text-slate-700">List Of Items</h2>
                    <button className="font-bold text-slate-700 bord"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                setTableDataView(true)

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

                                setTableDataView(true)
                            }
                        }}
                    >
                        Fill Po Items
                    </button>
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

                                    className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Hsn<span className="text-red-500">*</span>
                                </th>
                                <th

                                    className={`w-52 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Color<span className="text-red-500">*</span>
                                </th>


                                <th

                                    className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    UOM<span className="text-red-500">*</span>
                                </th>

                                <th

                                    className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                >
                                    Required Qty (kgs)
                                </th>
                                <th

                                    className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Balance Purchase Qty  (kgs)
                                </th>
                                <th

                                    className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Weight Per Bag
                                </th>
                                <th

                                    className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    No of Bags
                                </th>

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
                                {/* <th

                                    className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                >
                                    Actions
                                </th> */}
                            </tr>
                        </thead>

                        <tbody>

                            {(poItems ? poItems : [])?.map((row, index) =>
                                <tr className="border border-blue-gray-200 cursor-pointer "
                                    onContextMenu={(e) => {
                                        if (!readOnly) {
                                            handleRightClick(e, index, "shiftTimeHrs");
                                        }
                                    }}
                                >
                                    <td className="w-12 border border-gray-300 text-[11px]  text-center p-0.5 ">{index + 1}</td>
                                    <td className="py-0.5 border border-gray-300 text-[11px] ">
                                        <select
                                            onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "yarnId") } }}
                                            tabIndex={"0"} disabled={readOnly || transType == "Order Purchase" || !transType} className='text-left w-full rounded py-1 table-data-input'
                                            value={row.yarnId}
                                            onChange={(e) => handleInputChange(e.target.value, index, "yarnId")}
                                            onBlur={(e) => {
                                                handleInputChange((e.target.value), index, "yarnId")
                                            }
                                            }

                                        >
                                            <option >
                                            </option>
                                            {(id ? yarnList?.data : yarnList?.data?.filter(item => item?.active))?.map((blend) =>
                                                <option value={blend.id} key={blend.id}>
                                                    {blend?.name}
                                                </option>)}
                                        </select>
                                    </td>
                                    <td className="py-0.5 border border-gray-300 text-[11px]">
                                        {findFromList(row?.hsnId, hsnData?.data, "name")}
                                    </td>

                                    <td className="py-0.5 border border-gray-300 text-[11px]">

                                        <select
                                            onKeyDown={e => {
                                                if (e.key === "Delete") {
                                                    handleInputChange("", index, "colorId")
                                                }
                                            }}
                                            disabled={readOnly || transType == "Order Purchase" || !transType || !row?.yarnId}
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






                                    <td className="w-12 border border-gray-300 text-[11px] py-0.5">
                                        <select
                                            onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "uomId") } }}
                                            disabled={readOnly || !transType || !row?.yarnId} className='text-left w-full rounded py-1 table-data-input' value={row.uomId} onChange={(e) => handleInputChange(e.target.value, index, "uomId")}
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
                                        {(row.requiredQty || 0.000)?.toFixed(3)}
                                    </td>



                                    <td className="border border-gray-300 text-[11px] text-right py-1.5 px-2">
                                        {row?.balanceQty
                                            ? parseFloat(row.balanceQty).toFixed(3)
                                            : 0.000}                                    </td>


                                    <td className=" border border-gray-300 text-right text-[11px] py-1.5 px-2 text-xs">
                                        <input
                                            className=" rounded px-1 ml-2 w-full py-0.5 text-xs focus:outline-none text-right"
                                            type="number"
                                            value={row?.weightPerBag}
                                            onFocus={e => e.target.select()}
                                            placeHolder="0.000"
                                            disabled={readOnly || !transType || !row?.yarnId}
                                            onChange={(e) => {

                                                handleInputChange(e.target.value, index, "weightPerBag");
                                            }}
                                            onBlur={(e) => {
                                                const val = e.target.value;
                                                const formatted = e.target.value === "" ? "" : parseFloat(e.target.value).toFixed(3);
                                                e.target.value = formatted;
                                                handleInputChange(val === "" ? 0 : formatted, index, "weightPerBag");
                                            }}



                                        />
                                    </td>
                                    <td className=" border border-gray-300 text-right text-[11px] py-1.5 px-2 text-xs">
                                        <input
                                            className=" rounded px-1 ml-2 w-full py-0.5 text-xs focus:outline-none text-right"
                                            type="number"
                                            value={row?.noOfBags}
                                            onFocus={e => e.target.select()}
                                            placeHolder="0.000"
                                            disabled={readOnly || !transType || !row?.yarnId}
                                            onChange={(e) => {
                                                const balanceQty = Math.max(0, (parseFloat(row?.requiredQty) || 0) - (parseFloat(row?.alreadyPoqty) || 0));

                                                handleInputChange(e.target.value, index, "noOfBags", row.requiredQty, row.balanceQty, row.weightPerBag);
                                            }}
                                            onBlur={(e) => {
                                                const val = e.target.value;
                                                const formatted = e.target.value === "" ? "" : parseFloat(e.target.value).toFixed(3);
                                                // const balanceQty = Math.max(0, (parseFloat(row?.requiredQty) || 0) - (parseFloat(row?.alreadyPoqty) || 0));

                                                e.target.value = formatted;
                                                handleInputChange(val === "" ? 0 : formatted, index, "noOfBags", row.requiredQty, row.balanceQty, row.weightPerBag);
                                            }}


                                        />
                                    </td>

                                    <td className=" border border-gray-300 text-right text-[11px] py-1.5 px-2 text-xs">
                                        <input
                                            className=" rounded px-1 ml-2 w-full py-0.5 text-xs focus:outline-none text-right"
                                            type="number"
                                            value={row?.qty}
                                            onFocus={e => e.target.select()}
                                            placeHolder="0.000"







                                            disabled={readOnly || !transType || !row?.yarnId}
                                            onChange={(e) => {
                                                const balanceQty = Math.max(0, (parseFloat(row?.requiredQty) || 0) - (parseFloat(row?.alreadyPoqty) || 0));

                                                handleInputChange(e.target.value, index, "qty", row.requiredQty, row.balanceQty, row.weightPerBag);


                                            }}
                                            onBlur={(e) => {
                                                const balanceQty = Math.max(0, (parseFloat(row?.requiredQty) || 0) - (parseFloat(row?.alreadyPoqty) || 0));
                                                const val = e.target.value;
                                                const formatted = e.target.value === "" ? "" : parseFloat(e.target.value).toFixed(3);
                                                e.target.value = formatted;
                                                handleInputChange(val === "" ? 0 : formatted, index, "qty", row.requiredQty, row.balanceQty, row.weightPerBag);
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



                                            placeHolder="0.000"

                                            disabled={readOnly || !transType || !row?.yarnId}
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
                                            // value={
                                            //     isFinite(parseFloat(row.qty)) && isFinite(parseFloat(row.price))
                                            //         ? (parseFloat(row.qty || 0) * parseFloat(row.price || 0)).toFixed(3)
                                            //         : "0.000"
                                            // }
                                            value={(parseFloat(row.qty || 0) * parseFloat(row.price || 0)).toFixed(3)}
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
                                            disabled={readOnly || !transType && !row?.yarnId}
                                            onClick={() => {
                                                if (!taxTypeId) return Swal.fire({
                                                    icon: "error",
                                                    text: "Select TaxType",
                                                });
                                                else if (!row?.yarnId) {
                                                    Swal.fire({
                                                        icon: "error",
                                                        text: "Cannot View The Tax Details",
                                                    });
                                                } else {

                                                    setCurrentSelectedIndex(index)
                                                }
                                            }}

                                        >
                                            {VIEW}
                                        </button>
                                    </td>


                                    {/* <td className="w-40 py-0.5 border border-gray-300 text-[11px] text-right">
                                        <input
                                            readOnly
                                            className="w-full bg-transparent focus:outline-none focus:border-transparent text-right pr-2"
                                            // onKeyDown={(e) => {
                                            //     if (e.key === "Enter") {
                                            //         e.preventDefault();
                                            //         addNewRow();
                                            //     }
                                            // }}
                                            onContextMenu={(e) => {
                                                if (!readOnly) {
                                                    handleRightClick(e, index, "shiftTimeHrs");
                                                }
                                            }}
                                        />


                                    </td> */}


                                </tr>
                            )}
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
    );
};

export default YarnPoItems;
