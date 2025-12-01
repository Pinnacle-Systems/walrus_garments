import React, { useEffect } from 'react';
import { DELETE, PLUS } from '../../../icons';
import { useGetYarnMasterQuery } from '../../../redux/uniformService/YarnMasterServices';
import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService';
import { useGetUnitOfMeasurementMasterQuery } from '../../../redux/uniformService/UnitOfMeasurementServices';
import { Loader } from '../../../Basic/components';
import secureLocalStorage from 'react-secure-storage';
import { findFromList, isBetweenRange, priceWithTax, substract, sumArray } from '../../../Utils/helper';
import {
    useGetPoQuery,
} from "../../../redux/uniformService/PoServices";
import { toast } from 'react-toastify';
import { HiPencil, HiPlus, HiTrash } from 'react-icons/hi';
import YarnPoItem from './YarnPoItem';


const YarnInwardItems = ({ directInwardReturnItems, setDirectInwardReturnItems, readOnly, id, deleteRow, handleEdit, contextMenu,
    handleDeleteRow, handleCloseContextMenu, handleDeleteAllRows, handleRightClick,

    supplierList, supplierDetails, payTermList, branchList,
    branchdata, yarnList, colorList, uomList, setSupplierId
}) => {
    // useEffect(() => {
    //     if (directInwardReturnItems?.length >= 1) return
    //     setDirectInwardReturnItems(prev => {
    //         let newArray = Array.from({ length: 1 - prev.length }, () => {
    //             return {
    //                 yarnNeedleId: "", machineId: "", fiberContentId: "", description: "", socksMaterialId: "",
    //                 measurements: "", sizeId: "", styleId: "", legcolorId: "", footcolorId: "",
    //                 stripecolorId: "", noOfStripes: "0", qty: "0", socksTypeId: ""
    //             }
    //         })
    //         return [...prev, ...newArray]
    //     }
    //     )
    // }, [setDirectInwardReturnItems, directInwardReturnItems])


    // const handleInputChange = (value, index, field) => {
    //     const newBlend = structuredClone(directInwardReturnItems);
    //     newBlend[index][field] = value;
    //     if (field !== "inwardQty" && newBlend[index]["noOfBags"] && newBlend[index]["weightPerBag"]) {
    //         let tempInwardQty = (parseFloat(newBlend[index]["noOfBags"]) * parseFloat(newBlend[index]["weightPerBag"])).toFixed(3)
    //         newBlend[index]["inwardQty"] = tempInwardQty
    //     }
    //     setDirectInwardReturnItems(newBlend);
    // };

    const handleInputChange = (value, index, field, balanceQty, poItem = undefined) => {
        console.log(value, "value", field, "field")
        const newBlend = structuredClone(directInwardReturnItems);
        newBlend[index][field] = value
        if (poItem) {
            newBlend[index]["poNo"] = poItem?.Po?.docId
            newBlend[index]["orderId"] = poItem?.orderId
            newBlend[index]["orderDetailsId"] = poItem?.orderDetailsId
            newBlend[index]["requirementPlanningItemsId"] = poItem?.requirementPlanningItemsId

            newBlend[index]["yarnId"] = poItem?.yarnId
            newBlend[index]["colorId"] = poItem?.colorId
            newBlend[index]["gaugeId"] = poItem?.gaugeId
            newBlend[index]["gsmId"] = poItem?.gsmId
            newBlend[index]["fDiaId"] = poItem?.fDiaId
            newBlend[index]["designId"] = poItem?.designId
            newBlend[index]["discountAmount"] = poItem?.discountAmount
            newBlend[index]["discountType"] = poItem?.discountType
            newBlend[index]["kDiaId"] = poItem?.kDiaId
            newBlend[index]["loopLengthId"] = poItem?.loopLengthId
            newBlend[index]["poId"] = poItem?.poId
            newBlend[index]["price"] = poItem?.price
            newBlend[index]["taxPercent"] = poItem?.taxPercent
            newBlend[index]["uomId"] = poItem?.uomId
            newBlend[index]["poQty"] = poItem?.qty
            newBlend[index]["cancelQty"] = poItem?.alreadyCancelData?._sum?.qty ? parseFloat(poItem.alreadyCancelData?._sum?.qty).toFixed(3) : "0.000";
            newBlend[index]["alreadyInwardedQty"] = poItem?.alreadyInwardedData?._sum?.qty ? parseFloat(poItem.alreadyInwardedData._sum.qty).toFixed(3) : "0.000";
            newBlend[index]["alreadyInwardedRolls"] = poItem?.alreadyInwardedData?._sum?.noOfRolls ? parseInt(poItem.alreadyInwardedData._sum.noOfRolls) : "0";
            newBlend[index]["alreadyReturnedQty"] = poItem?.alreadyReturnedData?._sum?.qty ? parseFloat(poItem.alreadyReturnedData._sum.qty).toFixed(3) : "0.000";
            newBlend[index]["alreadyReturnedRolls"] = poItem?.alreadyReturnedData?._sum?.noOfRolls ? parseInt(poItem.alreadyReturnedData._sum.noOfRolls) : "0";
            newBlend[index]["balanceQty"] = poItem?.balanceQty ? parseFloat(poItem.balanceQty).toFixed(3) : "0.000";
            newBlend[index]["poItemsId"] = poItem?.id
            // newBlend[index]["stockRolls"] = parseInt(findStockRolls(poItem?.stockData))
            newBlend[index]["stockQty"] = parseFloat(poItem?.stockQty).toFixed(3)
            newBlend[index]["stockRolls"] = parseInt(poItem?.stockRolls)
            newBlend[index]["allowedReturnRolls"] = poItem?.allowedReturnRolls
            newBlend[index]["allowedReturnQty"] = parseFloat(poItem?.allowedReturnQty).toFixed(3)
        }

        if (field === "qty") {
            if (parseFloat(balanceQty) < parseFloat(value)) {
                toast.info("Inward Qty Can not be more than balance Qty", { position: 'top-center' })
                return
            }
        }
        setDirectInwardReturnItems(newBlend);
    };
    console.log(directInwardReturnItems, "directInwardReturnItems")

    const companyId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userCompanyId"
    )

    const branchId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "currentBranchId"
    )

    const { data: poList, isLoading: poListLoading, isFetching: poListFetching } = useGetPoQuery({ params: { branchId } });







    // if (!yarnList || !colorList || !uomList || !poList) return <Loader />
    return (
        <>

            <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm max-h-[250px] overflow-auto">

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

                                    className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Po No
                                </th>
                                <th

                                    className={`w-60 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Yarn
                                </th>
                                <th

                                    className={`w-20 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Color
                                </th>
                                <th

                                    className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    UOM
                                </th>
                                <th

                                    className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Stock Qty
                                </th>
                                <th

                                    className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Allowed Return Qty
                                </th>

                                <th

                                    className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}

                                >
                                    Return Qty
                                </th>
                                <th

                                    className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Price
                                </th>
                                <th

                                    className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Tax
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
                            </tr>
                        </thead>


                        <tbody className='overflow-y-auto  h-full w-full'>
                            {(directInwardReturnItems || [])?.map((item, index) => <YarnPoItem yarnList={yarnList} uomList={uomList}
                                colorList={colorList} deleteRow={deleteRow}
                                poList={poList}
                                //  handleInputChangeLotNo={handleInputChangeLotNo}
                                key={item.poItemsId}
                                item={item} index={index} handleInputChange={handleInputChange}
                                handleRightClick={handleRightClick}
                                readOnly={readOnly} />)}
                            {Array.from({ length: 1 - directInwardReturnItems?.length }).map(i =>
                                <tr className='w-full font-bold h-8 border border-gray-400 table-row'>
                                    {Array.from({ length: 10 }).map(i =>
                                        <td className="table-data   "></td>
                                    )}
                                    {!readOnly &&
                                        <td className="table-data w-10"></td>
                                    }
                                </tr>)
                            }
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
    )
}

export default YarnInwardItems