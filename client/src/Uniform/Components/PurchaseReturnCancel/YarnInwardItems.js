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


const YarnInwardItems = ({ directInwardReturnItems, setDirectInwardReturnItems, readOnly, id, deleteRow, handleEdit, handleView }) => {
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
        console.log(value,"value",field,"field")
        const newBlend = structuredClone(directInwardReturnItems);
        newBlend[index][field] = value
        if(poItem) {
        newBlend[index]["poNo"] = poItem?.Po?.docId
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
        newBlend[index]["taxPercent"] = poItem?.tax
        newBlend[index]["uomId"] = poItem?.uomId
        newBlend[index]["poQty"] = poItem?.qty
        newBlend[index]["cancelQty"] = poItem?.alreadyCancelData?._sum?.qty ? parseFloat(poItem.alreadyCancelData?._sum?.qty).toFixed(3) : "0.000";
        newBlend[index]["alreadyInwardedQty"] = poItem?.alreadyInwardedData?._sum?.qty ? parseFloat(poItem.alreadyInwardedData._sum.qty).toFixed(3) : "0.000";
        newBlend[index]["alreadyInwardedRolls"] = poItem?.alreadyInwardedData?._sum?.noOfRolls ? parseInt(poItem.alreadyInwardedData._sum.noOfRolls) : "0";
        newBlend[index]["alreadyReturnedQty"] = poItem?.alreadyReturnedData?._sum?.qty ? parseFloat(poItem.alreadyReturnedData._sum.qty).toFixed(3) : "0.000";
        newBlend[index]["alreadyReturnedRolls"] = poItem?.alreadyReturnedData?._sum?.noOfRolls ? parseInt(poItem.alreadyReturnedData._sum.noOfRolls) : "0";
        newBlend[index]["balanceQty"] = poItem?.balanceQty ? parseFloat(poItem.balanceQty).toFixed(3) : "0.000";
        // newBlend[index]["stockQty"] = parseFloat(findStockQty(poItem?.stockData)).toFixed(3)
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
        console.log(directInwardReturnItems,"directInwardReturnItems")

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
            {/* <div className={`w-full overflow-y-auto py-1`}>
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
            </div> */}
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
            
                                                className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
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
    
                                            className={`w-12 px-3 py-2 text-center font-medium text-[13px] `}
                                            >
                                            No. of Bags
                                            </th>
                                            <th
            
                                                className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                            >
                                               Weight Per Bag
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
                  
                       {/* <tbody>
                      
                                {(directInwardReturnItems ? directInwardReturnItems : [])?.map((row, index) =>
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
                                            {blend?.aliasName}
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
    
                                        
    
    
                                    <td className="w-40 border border-gray-300 text-[11px] py-0.5">
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
                
                                
    
                            <td className="w-40 border border-gray-300 text-[11px] py-0.5">
                                <input
                                        onKeyDown={e => {
                                            if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                                            if (e.key === "Delete") { handleInputChange("0", index, "noOfBags") }
                                        }}
                                        min={"0"}
                                        type="number"
                                        onFocus={(e) => e.target.select()}
                                        className="text-right rounded py-1 w-full px-1 table-data-input"
                                        value={row?.noOfBags}
                                        inputMode='decimal'
                                        onChange={(e) => {
                                            handleInputChange(e.target.value, index, "noOfBags")
                                        }
                                            }
                                            onBlur={(e) => {
                                                handleInputChange(parseFloat(e.target.value), index, "noOfBags")
                                            }
                                            }

                                        />
                                </td>
                                <td className="w-40  border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                                    {row?.allowedQty}
                                </td>
                                <td className="w-40  border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                                    <input
                                        onKeyDown={e => {
                                            if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                                            if (e.key === "Delete") { handleInputChange("0.000", index, "qty") }
                                        }}
                                        min={"0"}
                                        type="number"
                                        className="text-right rounded py-1 px-1 w-16 table-data-input"
                                        onFocus={(e) => e.target.select()}
                                        value={row?.qty}
                                        onChange={(e) =>
                                            handleInputChange(e.target.value, index, "qty")
                                        }
                                        onBlur={(e) => {
                                            handleInputChange(parseFloat(e.target.value).toFixed(2), index, "qty");
                                        }
                                        }
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
                                                    className="text-right rounded py-1 w-16 px-1 table-data-input"
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
    
                                    <td className='w-40  py-0.5 border-blue-gray-200 text-[11px] text-right border border-gray-300'>

                                        {priceWithTax(row.price, row.taxPercent).toFixed(2)}

                                    </td>

                                    <td className='w-40  py-0.5 border-blue-gray-200 text-[11px] text-right border border-gray-300'>
                                        <input
                                            type="number"
                                            onFocus={(e) => e.target.select()}
                                            className="text-right rounded py-1 w-16 px-1 table-data-input"
                                            value={(!row.price || !row.price) ? 0 : (parseFloat(sumArray(row?.lotDetails ? row?.lotDetails : [], "qty")) * parseFloat(row.price)).toFixed(2)}
                                            disabled={true}
                                        />
                                    </td>
                                                
                                       
                            
    
                                        <td className="w-16 px-1 py-1 text-center">
                                            <div className="flex space-x-2  justify-center">
    
                                                <button
                                             
                                                    className="text-blue-800 flex items-center  bg-blue-50 rounded"
                                                >
                                                    👁 <span className="text-xs"></span>
                                                </button>
                                                <span className="tooltip-text">View</span>
                                                <button
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
    
                                            </div>
                                        </td>
    
    
    
                                    </tr>
                                )}
                        </tbody> */}
                         <tbody className='overflow-y-auto  h-full w-full'>
                                {(directInwardReturnItems || [])?.map((item, index) => <YarnPoItem yarnList={yarnList} uomList={uomList}
                                    colorList={colorList} deleteRow={deleteRow}
                                    poList={poList}
                                    //  handleInputChangeLotNo={handleInputChangeLotNo}
                                    key={item.poItemsId}
                                    item={item} index={index} handleInputChange={handleInputChange}
                                    // purchaseInwardId={purchaseInwardId}
                                     readOnly={readOnly} />)}
                                {Array.from({ length: 1 - directInwardReturnItems?.length }).map(i =>
                                    <tr className='w-full font-bold h-8 border border-gray-400 table-row'>
                                        {Array.from({ length: 12 }).map(i =>
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
                   </div>
        </>
    )
}

export default YarnInwardItems