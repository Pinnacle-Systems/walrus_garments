import React, { useEffect, useState } from "react";
import { CLOSE_ICON, DELETE, PLUS } from "../../../icons";
import { useGetYarnMasterQuery } from "../../../redux/uniformService/YarnMasterServices";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { useGetUnitOfMeasurementMasterQuery } from "../../../redux/uniformService/UnitOfMeasurementServices";
import { toast } from "react-toastify";
import { VIEW } from "../../../icons";

import { useGetFabricMasterQuery } from "../../../redux/uniformService/FabricMasterService";
import { useGetUomQuery } from "../../../redux/services/UomMasterService";
import { useGetGaugeQuery } from "../../../redux/services/GaugeMasterServices";
import { useGetdesignQuery } from "../../../redux/uniformService/DesignMasterServices";
import { useGetgsmQuery } from "../../../redux/uniformService/GsmMasterServices";
import { useGetLoopLengthQuery } from "../../../redux/uniformService/LoopLengthMasterServices";
import { useGetDiaQuery } from "../../../redux/uniformService/DiaMasterServices";
import PurchaseYarnPoItems from "./YarnPoItem";
import { FaPlus, FaTrashAlt } from "react-icons/fa";
import { useGetPoQuery } from "../../../redux/uniformService/PoServices";
import Swal from "sweetalert2";
import TransactionLineItemsSection, {
    transactionTableClassName,
    transactionTableHeadClassName,
} from "../ReusableComponents/TransactionLineItemsSection";

const YarnInwardPoItems = ({
    id,
    transType,
    inwardItems,
    setInwardItems,
    readOnly,
    params,
    removeItem, purchaseInwardId, setInwardItemSelection, supplierId, handleRightClick, contextMenu, handleCloseContextMenu,
    yarnList, colorList, uomList

}) => {







    const { data: poList } =
        useGetPoQuery({ params });

    console.log(inwardItems, "inwardItems")


    const handleInputChange = (value, index, field, balanceQty, poItem = undefined) => {
        const newBlend = structuredClone(inwardItems);
        if (field === "qty") {
            if (parseFloat(balanceQty) < parseFloat(value)) {
                // toast.info("Inward Qty Can not be more than balance Qty", { position: 'top-center' })
                Swal.fire({
                    text: "Inward Qty Can not be more than balance Qty",
                    icon: "warning",
                });
                return
            }
        }
        newBlend[index][field] = value
        // newBlend[index]["poNo"] = poItem?.Po?.docId
        // newBlend[index]["fabricId"] = poItem?.fabricId
        // newBlend[index]["colorId"] = poItem?.colorId
        // newBlend[index]["gaugeId"] = poItem?.gaugeId
        // newBlend[index]["gsmId"] = poItem?.gsmId
        // newBlend[index]["fDiaId"] = poItem?.fDiaId
        // newBlend[index]["designId"] = poItem?.designId
        // newBlend[index]["discountAmount"] = poItem?.discountAmount
        // newBlend[index]["discountType"] = poItem?.discountType
        // newBlend[index]["kDiaId"] = poItem?.kDiaId
        // newBlend[index]["loopLengthId"] = poItem?.loopLengthId
        // newBlend[index]["poId"] = poItem?.poId
        // newBlend[index]["price"] = poItem?.price
        // newBlend[index]["taxPercent"] = poItem?.tax
        // newBlend[index]["uomId"] = poItem?.uomId
        // newBlend[index]["poQty"] = poItem?.qty
        // newBlend[index]["cancelQty"] = poItem?.alreadyCancelData?._sum?.qty ? parseFloat(poItem.alreadyCancelData?._sum?.qty).toFixed(3) : "0.000";
        // newBlend[index]["alreadyInwardedQty"] = poItem?.alreadyInwardedData?._sum?.qty ? parseFloat(poItem.alreadyInwardedData._sum.qty).toFixed(3) : "0.000";
        // newBlend[index]["alreadyReturnedQty"] = poItem?.alreadyReturnedData?._sum?.qty ? parseFloat(poItem.alreadyReturnedData._sum.qty).toFixed(3) : "0.000";
        // newBlend[index]["balanceQty"] = poItem?.balanceQty ? parseFloat(poItem.balanceQty).toFixed(3) : "0.000";


        setInwardItems(newBlend);
    };

    useEffect(() => {
        if (id) return
        if (inwardItems?.length >= 1) return;
        setInwardItems((prev) => {
            let newArray = Array.from({ length: 1 - prev.length }, (i) => {
                return {
                    yarnId: "",
                    qty: "0.00",
                    tax: "0",
                    colorId: "",
                    uomId: "",
                    price: "0.00",
                    discountValue: "0.00",
                    noOfBags: "0",
                    discountType: "",
                    weightPerBag: "0.00",
                    poItemsId: ""
                };
            });
            return [...prev, ...newArray];
        });
    }, [transType, setInwardItems, inwardItems]);
    const addNewRow = () => {
        const newRow = {
            yarnId: "",
            qty: "",
            tax: "0",
            colorId: "",
            uomId: "",
            price: "",
            discountTypes: "",
            discountValue: "0.00",
            noOfBags: "0.00",
            poItemsId: ""
        };
        setInwardItems([...inwardItems, newRow]);
    };

    const handleDeleteRow = (id) => {
        setInwardItems((yarnBlend) =>
            yarnBlend.filter((row, index) => index !== parseInt(id))
        );
    };
    const handleDeleteAllRows = (id) => {
        setInwardItems((yarnBlend) =>
            yarnBlend.filter((row, index) => index !== parseInt(id))
        );
    };
    function findBalanceQty(balanceQty) {

        let balanceNos = parseFloat(balanceQty) * parseFloat(0.10)
        balanceNos = Math.round(balanceNos)
        return parseInt(parseInt(balanceNos) + parseInt(balanceQty))
    }

    function handleInputChangeLotNo(value, index, lotIndex, field, balanceQty) {
        console.log(value, index, field, "value, index, field")
        let allowedBalance = findBalanceQty(balanceQty)

        setInwardItems(inwardItems => {
            const newBlend = structuredClone(inwardItems);
            if (!newBlend[index]["inwardLotDetails"]) return inwardItems
            if (field == "qty") {
                if (parseFloat(allowedBalance) < parseFloat(value)) {
                    toast.info("Inward Qty Can not be more than balance Qty", { position: 'top-center' })
                    allowedBalance = 0
                    return newBlend
                }
            }
            newBlend[index]["inwardLotDetails"][lotIndex][field] = value;
            if (field == "noOfBags") {
                let totalValue = newBlend[index]["inwardLotDetails"].reduce((accumulator, currentValue) => accumulator + parseInt(currentValue?.noOfBags), 0);
                console.log(totalValue, 'totalValue');

                newBlend[index][field] = totalValue;
            }
            if (field == "qty") {

                let totalValue = parseFloat(newBlend[index]["inwardLotDetails"].reduce((accumulator, currentValue) => accumulator + parseFloat(currentValue?.qty), 0)).toFixed(3);
                newBlend[index][field] = totalValue;
            }
            return newBlend
        });
    }
    function addNewLotNo(index) {
        setInwardItems(inwardItems => {
            const newBlend = structuredClone(inwardItems);
            if (!newBlend[index]) return inwardItems
            if (newBlend[index]["inwardLotDetails"]) {
                newBlend[index]["inwardLotDetails"] = [
                    ...newBlend[index]["inwardLotDetails"],
                    { lotNo: "", qty: "0.000", noOfRolls: 0 }]
            } else {
                newBlend[index]["inwardLotDetails"] = [{ lotNo: "", qty: "0.000", noOfRolls: 0 }]
            }
            return newBlend
        })
    }
    function removeLotNo(index, lotIndex) {
        setInwardItems(inwardItems => {
            const newBlend = structuredClone(inwardItems);
            if (!newBlend[index]["inwardLotDetails"]) return inwardItems
            newBlend[index]["inwardLotDetails"] = newBlend[index]["inwardLotDetails"].filter((_, index) => index != lotIndex)
            return newBlend
        })
    }
    console.log(inwardItems, "inwardItems")
    return (
        <>
            <TransactionLineItemsSection
                panelClassName="h-full"
                actions={
                        <button className="font-bold text-slate-700 bord"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    setInwardItemSelection(true)

                                }
                            }}
                            onClick={() => {
                                if (!supplierId) {
                                    Swal.fire({
                                        icon: 'success',
                                        title: `Choose Supplier`,

                                    });
                                }
                                else {

                                    setInwardItemSelection(true)
                                }
                            }}
                        >
                            Fill Po Items
                        </button>
                }
            >
                    <table className={transactionTableClassName}>
                        <thead className={transactionTableHeadClassName}>
                            <tr>
                                <th
                                    className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    S.No
                                </th>
                                <th
                                    className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Po.No
                                </th>
                                <th

                                    className={`w-60 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Items
                                </th>
                                <th

                                    className={`w-52 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Colors
                                </th>
                                <th

                                    className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    UOM
                                </th>
                                {/* <th

                                    className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Po Qty
                                </th> */}
                                {/* <th

                                    className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Lot Det.
                                </th> */}

                                <th

                                    className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Po Quantity
                                </th>
                                <th

                                    className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Cancel Qty
                                </th>
                                <th

                                    className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Already Inward Qty
                                </th>

                                <th

                                    className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                >
                                    Already Return Qty
                                </th>
                                <th

                                    className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                >
                                    Balance Qty
                                </th>

                                <th

                                    className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                >
                                    Inward Qty
                                </th>
                                <th

                                    className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                >
                                    Price
                                </th>
                                <th

                                    className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                >
                                    Gross
                                </th>
                                <th className="w-16 px-1 py-1 text-center font-medium text-[13px]">
                                    <div className="flex flex-col items-center">
                                        <span>Actions</span>
                                        <button
                                            type="button"
                                            onClick={addNewRow}
                                            className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                                            title="Add New Row"
                                        >
                                            <FaPlus className="w-4 h-4 mx-auto" />
                                        </button>
                                    </div>
                                </th>
                            </tr>
                        </thead>{console.log(inwardItems, "inwardItemsinIndividual")}
                        <tbody>
                            {(inwardItems || [])?.map((item, index) =>
                                <PurchaseYarnPoItems yarnList={yarnList} uomList={uomList}
                                    colorList={colorList} deleteRow={handleDeleteRow}
                                    id={id}
                                    poList={poList}
                                    removeLotNo={removeLotNo} addNewLotNo={addNewLotNo} handleInputChangeLotNo={handleInputChangeLotNo}
                                    removeItem={removeItem} key={item.poItemsId}
                                    item={item} index={index} handleInputChange={handleInputChange} handleRightClick={handleRightClick}
                                    purchaseInwardId={purchaseInwardId} readOnly={readOnly} />)}


                            {Array.from({ length: 1 - inwardItems?.length }).map(i =>
                                <tr className='font-bold h-8 border border-gray-400 table-row'>
                                    {Array.from({ length: 6 }).map(i =>
                                        <td className="table-data   "></td>
                                    )}
                                    {!readOnly &&
                                        <td className="table-data w-10"></td>
                                    }
                                </tr>)
                            }
                        </tbody>
                    </table>
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
            </TransactionLineItemsSection>
        </>
    );
};

export default YarnInwardPoItems;
