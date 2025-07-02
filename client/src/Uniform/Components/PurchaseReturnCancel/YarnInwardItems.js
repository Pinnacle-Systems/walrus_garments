import React, { useEffect } from 'react';
import { DELETE, PLUS } from '../../../icons';
import { useGetYarnMasterQuery } from '../../../redux/uniformService/YarnMasterServices';
import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService';
import { useGetUnitOfMeasurementMasterQuery } from '../../../redux/uniformService/UnitOfMeasurementServices';
import { Loader } from '../../../Basic/components';
import secureLocalStorage from 'react-secure-storage';
import { findFromList, isBetweenRange, substract } from '../../../Utils/helper';
import {
    useGetPoQuery,
} from "../../../redux/uniformService/PoServices";
import { toast } from 'react-toastify';
import { HiPencil, HiTrash } from 'react-icons/hi';


const YarnInwardItems = ({ directInwardReturnItems, setDirectInwardReturnItems, readOnly, prefix, removeItem, handleEdit, handleView }) => {
    // useEffect(() => {
    //     if (directInwardReturnItems?.length >= 1) return
    //     setDirectInwardReturnItems(prev => {
    //         let newArray = Array.from({ length: 1 - prev.length }, () => {
    //             return {
    //                 yarnNeedleId: "", machineId: "", fiberContentId: "", description: "", socksMaterialId: "",
    //                 measurements: "", sizeId: "", styleId: "", legcolorId: "", footcolorId: "",
    //                 stripecolorId: "", noOfStripes: "0", qty: "0", socksTypeId: "",
    //             }
    //         })
    //         return [...prev, ...newArray]
    //     }
    //     )
    // }, [setDirectInwardReturnItems, directInwardReturnItems])


    const handleInputChange = (value, index, field) => {
        const newBlend = structuredClone(directInwardReturnItems);
        newBlend[index][field] = value;
        if (field !== "inwardQty" && newBlend[index]["noOfBags"] && newBlend[index]["weightPerBag"]) {
            let tempInwardQty = (parseFloat(newBlend[index]["noOfBags"]) * parseFloat(newBlend[index]["weightPerBag"])).toFixed(3)
            newBlend[index]["inwardQty"] = tempInwardQty
        }
        setDirectInwardReturnItems(newBlend);
    };

    const companyId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userCompanyId"
    )

    const branchId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "currentBranchId"
    )

    const { data: poList, isLoading: poListLoading, isFetching: poListFetching } = useGetPoQuery({ params: { branchId } });

    const { data: yarnList } =
        useGetYarnMasterQuery({ params: { companyId } });

    const { data: colorList, isLoading: isColorLoading, isFetching: isColorFetching } =
        useGetColorMasterQuery({ params: { companyId } });

    const { data: uomList } =
        useGetUnitOfMeasurementMasterQuery({ params: { companyId } });

    if (!yarnList || !colorList || !uomList || !poList) return <Loader />
    return (
        <>
            <div className={`w-full overflow-y-auto py-1`}>
                <table className="border border-gray-500 text-xs table-fixed w-full">
                    <thead className='bg-gray-300 top-0 border-b border-gray-500'>
                        <tr className='h-8'>
                            <th className="table-data  w-9 text-center">S.no</th>
                            <th className="table-data  w-20 text-center">P.no</th>
                            <th className="table-data w-20">Items</th>
                            <th className="table-data w-20">Colors</th>
                            <th className="table-data  w-16">UOM</th>
                            <th className="table-data  w-12">Po. Qty</th>
                            <th className="table-data  w-14"> Can. Qty</th>
                            <th className="table-data  w-14"> A. In Qty</th>
                            <th className="table-data  w-14"> A. Return Qty</th>
                            <th className="table-data  w-14">Bal. Qty</th>
                            <th className="table-data  w-12">No. of Bags<span className="text-red-500">*</span></th>
                            <th className="table-data  w-12">Weight Per Bag<span className="text-red-500">*</span></th>
                            <th className="table-data  w-12">Inward Qty</th>

                            <th

                                className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                            >
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className='overflow-y-auto  h-full w-full'>
                        {directInwardReturnItems?.map((row, index) => (
                            <tr key={index} className="w-full table-row">
                                <td className="table-data text-center px-1 py-1">
                                    {index + 1}
                                </td>
                                <td className="table-data text-left px-1 py-1">
                                    {row.poDocId}
                                </td>
                                <td className='table-data'>
                                    <input
                                        type="text"
                                        onFocus={(e) => e.target.select()}
                                        className="text-left rounded py-1  px-1 table-data-input"
                                        value={findFromList(row.yarnId, yarnList.data, "aliasName")}
                                        disabled={true}
                                    />
                                </td>
                                <td className='table-data'>
                                    <input
                                        type="text"
                                        onFocus={(e) => e.target.select()}
                                        className="text-left rounded py-1  px-1 table-data-input"
                                        value={findFromList(row.colorId, colorList.data, "name")}
                                        disabled={true}
                                    />
                                </td>
                                <td className='table-data'>
                                    <input
                                        type="text"
                                        onFocus={(e) => e.target.select()}
                                        className="text-left rounded py-1  px-1 table-data-input"
                                        value={findFromList(row.uomId, uomList.data, "name")}
                                        disabled={true}
                                    />
                                </td>
                                <td className='table-data text-right px-1'>
                                    {substract(row.qty, row.alreadyCancelQty).toFixed(3)}
                                </td>
                                <td className='table-data text-right px-1'>
                                    {(parseFloat(row.alreadyInwardedQty) + parseFloat(row.alreadyReturnedQty)).toFixed(3)}
                                </td>
                                <td className='table-data text-right px-1'>
                                    {substract(substract(row.qty, row.alreadyCancelQty), (parseFloat(row.alreadyInwardedQty) + parseFloat(row.alreadyReturnedQty))).toFixed(3)}
                                </td>
                                <td className='table-data'>
                                    <input
                                        type="number"
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("0", index, "noOfBags") } }}
                                        onFocus={(e) => e.target.select()}
                                        className="text-right rounded py-1 w-16 px-1 table-data-input"
                                        value={(!row.noOfBags) ? 0 : row.noOfBags}
                                        disabled={readOnly}
                                        inputMode='decimal'
                                        onChange={(e) => {
                                            if (!e.target.value) {
                                                handleInputChange(0, index, "noOfBags");
                                                return
                                            }
                                            let tempInwardQty = parseFloat(row?.weightPerBag ? row.weightPerBag : 0) * parseFloat(e.target.value)
                                            if (isBetweenRange(0, substract(substract(row.qty, row.alreadyCancelQty), (parseFloat(row.alreadyInwardedQty) + parseFloat(row.alreadyReturnedQty))), tempInwardQty)) {
                                                handleInputChange(e.target.value.replace(/^0+/, ''), index, "noOfBags")
                                            } else {
                                                toast.info("Inward Qty Cannot be more than balance Qty", { position: 'top-center' })
                                            }
                                        }
                                        }
                                        onBlur={(e) =>
                                            handleInputChange(parseFloat(e.target.value), index, "noOfBags")
                                        }
                                    />
                                </td>
                                <td className='table-data'>
                                    <input
                                        type="number"
                                        onFocus={(e) => e.target.select()}
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("0.000", index, "weightPerBag") } }}
                                        className="text-right rounded py-1 w-16 px-1 table-data-input"
                                        value={(!row.weightPerBag) ? 0 : row.weightPerBag}
                                        disabled={readOnly}
                                        inputMode='decimal'
                                        onChange={(e) => {
                                            if (!e.target.value) {
                                                handleInputChange(0, index, "weightPerBag");
                                                return
                                            }
                                            let tempInwardQty = parseFloat(row?.noOfBags ? row.noOfBags : 0) * parseFloat(e.target.value)
                                            if (isBetweenRange(0, substract(substract(row.qty, row.alreadyCancelQty), (parseFloat(row.alreadyInwardedQty) + parseFloat(row.alreadyReturnedQty))), tempInwardQty)) {
                                                handleInputChange(e.target.value.replace(/^0+/, ''), index, "weightPerBag")
                                            } else {
                                                toast.info("Inward Qty Cannot be more than balance Qty", { position: 'top-center' })
                                            }
                                        }
                                        }
                                        onBlur={(e) =>
                                            handleInputChange(parseFloat(e.target.value).toFixed(3), index, "weightPerBag")
                                        }
                                    />
                                </td>
                                <td className='table-data'>
                                    <input
                                        type="number"
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("0.000", index, "inwardQty") } }}
                                        onFocus={(e) => e.target.select()}
                                        className="text-right rounded py-1 px-1 w-full table-data-input"
                                        value={row.inwardQty}
                                        disabled={readOnly}
                                        onChange={(event) => {
                                            if (!event.target.value) {
                                                handleInputChange(0, index, "inwardQty");
                                                return
                                            }
                                            if (isBetweenRange(0, substract(substract(row.qty, row.alreadyCancelQty), (parseFloat(row.alreadyInwardedQty) + parseFloat(row.alreadyReturnedQty))), event.target.value)) {
                                                handleInputChange(event.target.value.replace(/^0+/, ''), index, "inwardQty")
                                            } else {
                                                toast.info("Inward Qty Cannot be more than balance Qty", { position: 'top-center' })
                                            }
                                        }}
                                        onBlur={(e) => {
                                            if (!e.target.value) {
                                                handleInputChange(0.000, index, "inwardQty");
                                                return
                                            }
                                            handleInputChange(parseFloat(e.target.value).toFixed(3), index, "inwardQty")
                                        }}
                                    />
                                </td>
                                <td className='table-data text-right px-1'>
                                    {row.price}
                                </td>
                                <td className='table-data'>
                                    <input
                                        type="number"
                                        onFocus={(e) => e.target.select()}
                                        className="text-right rounded py-1 px-1 table-data-input"
                                        value={(row.price * row.inwardQty).toFixed(2)}
                                        disabled={true}
                                    />
                                </td>
                                <td className="w-16 px-1 py-1 text-center">
                                    <div className="flex space-x-2  justify-center">

                                        <button
                                            onClick={() => handleView(index)}

                                            className="text-blue-800 flex items-center  bg-blue-50 rounded"
                                        >
                                            👁 <span className="text-xs"></span>
                                        </button>
                                        <span className="tooltip-text">View</span>
                                        <button
                                            onClick={() => handleEdit(index)}
                                            className="text-green-600 hover:text-green-800 bg-green-50 py-1 rounded text-xs flex items-center"
                                        >
                                            <HiPencil className="w-4 h-4" />

                                        </button>
                                        <span className="tooltip-text">Edit</span>
                                        <button
                                            onClick={() => removeItem(row?.poItemsId)}
                                            className="text-red-600 hover:text-red-800 bg-red-50  py-1 rounded text-xs flex items-center"
                                        >
                                            <HiTrash className="w-4 h-4" />

                                        </button>
                                        <span className="tooltip-text">Delete</span>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {Array.from({ length: 3 - directInwardReturnItems.length }).map(i =>
                            <tr className='w-full font-bold h-8 border border-gray-400 table-row'>
                                {Array.from({ length: 13 }).map(i =>
                                    <td className="table-data   "></td>
                                )}
                                {!readOnly &&
                                    <td className="table-data w-14"></td>
                                }
                            </tr>)
                        }
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default YarnInwardItems