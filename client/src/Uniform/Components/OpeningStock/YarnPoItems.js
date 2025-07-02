import React, { useEffect } from 'react';
import { useGetYarnMasterQuery } from '../../../redux/uniformService/YarnMasterServices';
import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService';
import { useGetUnitOfMeasurementMasterQuery } from '../../../redux/uniformService/UnitOfMeasurementServices';
import { useGetProcessMasterQuery } from '../../../redux/uniformService/ProcessMasterService';
import { Loader } from 'lucide-react';
import { DELETE, PLUS } from '../../../icons';
import { priceWithTax, sumArray } from '../../../Utils/helper';
import { discountTypes } from '../../../Utils/DropdownData';
import { HiPencil, HiPlus, HiTrash } from 'react-icons/hi';


const YarnPoItems = ({ id, transType, poItems, setPoItems, readOnly, params, greyFilter }) => {


    const handleInputChange = (value, index, field) => {
        const newBlend = structuredClone(poItems);
        newBlend[index][field] = value;
        if (field !== "qty") {
            newBlend[index]["qty"] = (parseFloat(newBlend[index]["noOfBags"]) * parseFloat(newBlend[index]["weightPerBag"])).toFixed(3)
        }
        setPoItems(newBlend);
    };


    useEffect(() => {
        if (poItems.length >= 1) return
        setPoItems(prev => {
            let newArray = Array.from({ length: 1 - prev.length }, i => {
                return { yarnId: "", qty: "0.000", taxPercent: "0.000", colorId: "", uomId: "", price: "0.00", discountType: "Percentage", discountValue: "0.00", noOfBags: "0", weightPerBag: "0.000" }
            })
            return [...prev, ...newArray]
        }
        )
    }, [transType, setPoItems, poItems])


    const addNewRow = () => {
        const newRow = { yarnId: "", qty: "", taxPercent: "0.000", colorId: "", uomId: "", price: "", discountType: "Percentage", discountValue: "0.00" };
        setPoItems([...poItems, newRow]);
    };
    const deleteRow = id => {
        setPoItems(yarnBlend => yarnBlend?.filter((row, index) => index !== parseInt(id)));
    };

    const { data: yarnList } =
        useGetYarnMasterQuery({ params });

    const { data: colorList } =
        useGetColorMasterQuery({ params: { ...params, isGrey: greyFilter ? true : undefined } });

    const { data: uomList } =
        useGetUnitOfMeasurementMasterQuery({ params });

    const { data: processList } = useGetProcessMasterQuery({ params: { ...params, isPcsStage: false } });

    if (!yarnList || !colorList || !uomList) return <Loader />

    function getTotals(field) {
        const total = poItems.reduce((accumulator, current) => {
            return accumulator + parseFloat(current[field] ? current[field] : 0)
        }, 0)
        return parseFloat(total)
    }

    function getGross(field1, field2) {
        const total = poItems.reduce((accumulator, current) => {
            return accumulator + parseFloat(current[field1] && current[field2] ? current[field1] * current[field2] : 0)
        }, 0)
        return parseFloat(total)
    }
console.log(poItems,"poItems")
    return (
        // <div className={` relative w-full overflow-y-auto py-1`}>
        //     <table className=" border border-gray-500 text-xs table-auto  w-full">
        //         <thead className='bg-blue-200 top-0 border-b border-gray-500'>
        //             <tr >
        //                 <th className="table-data  w-2 text-center">S.no</th>
        //                 <th className="table-data ">Prev. Process<span className="text-red-500">*</span></th>
        //                 <th className="table-data ">Items<span className="text-red-500">*</span></th>
        //                 <th className="table-data ">Colors<span className="text-red-500">*</span></th>
        //                 <th className="table-data  w-20">UOM<span className="text-red-500">*</span></th>
        //                 <th className="table-data  w-20">Lot No<span className="text-red-500">*</span></th>
        //                 <th className="table-data  w-16">No. of Bags<span className="text-red-500">*</span></th>
        //                 <th className="table-data  w-16">Weight Per Bag<span className="text-red-500">*</span></th>
        //                 <th className="table-data  w-16">Quantity<span className="text-red-500">*</span></th>
        //                 <th className="table-data  w-16">Price<span className="text-red-500">*</span></th>
        //                 <th className="table-data  w-16">Gross</th>
        //                 {readOnly ?
        //                     "" :
        //                     <th className='w-20  bg-green-600 text-white'>
        //                         <div onClick={addRow}
        //                             className='hover:cursor-pointer w-full h-full flex items-center justify-center'>
        //                             {PLUS}
        //                         </div>
        //                     </th>
        //                 }
        //             </tr>
        //         </thead>
        //         <tbody className='overflow-y-auto h-full w-full'>
        //             {poItems.map((row, index) => (
        //                 <tr key={index} className="w-full table-row">
        //                     <td className="table-data w-2 text-left px-1 py-1">
        //                         {index + 1}
        //                     </td>
        //                     <td className='table-data'>
        //                         <select
        //                             onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "prevProcessId") } }}
        //                             tabIndex={"0"} disabled={readOnly} className='text-left w-full rounded py-1 table-data-input'
        //                             value={row.prevProcessId}
        //                             onChange={(e) => handleInputChange(e.target.value, index, "prevProcessId")}
        //                             onBlur={(e) => {
        //                                 handleInputChange((e.target.value), index, "prevProcessId")
        //                             }
        //                             }
        //                         >
        //                             <option value="">
        //                             </option>
        //                             {(id ? (processList?.data ? processList?.data : []) : (processList?.data ? processList?.data : []).filter(item => item.active)).map((blend) =>
        //                                 <option value={blend.id} key={blend.id}>
        //                                     {blend.name}
        //                                 </option>)}
        //                         </select>
        //                     </td>
        //                     <td className='table-data'>
        //                         <select
        //                             onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "yarnId") } }}
        //                             tabIndex={"0"} disabled={readOnly} className='text-left w-full rounded py-1 table-data-input'
        //                             value={row.yarnId}
        //                             onChange={(e) => handleInputChange(e.target.value, index, "yarnId")}
        //                             onBlur={(e) => {
        //                                 handleInputChange((e.target.value), index, "yarnId")
        //                             }
        //                             }
        //                         >
        //                             <option hidden>
        //                             </option>
        //                             {(id ? yarnList.data : yarnList.data.filter(item => item.active)).map((blend) =>
        //                                 <option value={blend.id} key={blend.id}>
        //                                     {blend.aliasName}
        //                                 </option>)}
        //                         </select>
        //                     </td>

        //                     <td className='table-data'>
        //                         <select
        //                             onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "colorId") } }}
        //                             disabled={readOnly} className='text-left w-full rounded py-1 table-data-input' value={row.colorId}
        //                             onChange={(e) => handleInputChange(e.target.value, index, "colorId")}
        //                             onBlur={(e) => {
        //                                 handleInputChange((e.target.value), index, "colorId")
        //                             }
        //                             }
        //                         >
        //                             <option hidden>
        //                             </option>
        //                             {(id ? colorList.data : colorList.data.filter(item => item.active)).map((blend) =>
        //                                 <option value={blend.id} key={blend.id}>
        //                                     {blend.name}
        //                                 </option>
        //                             )}
        //                         </select>
        //                     </td>
        //                     <td className='table-data'>
        //                         <select
        //                             onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "uomId") } }}
        //                             disabled={readOnly} className='text-left w-20 rounded py-1 table-data-input' value={row.uomId} onChange={(e) => handleInputChange(e.target.value, index, "uomId")}
        //                             onBlur={(e) => {
        //                                 handleInputChange((e.target.value), index, "uomId")
        //                             }
        //                             }
        //                         >
        //                             <option hidden>
        //                             </option>
        //                             {(id ? uomList.data : uomList.data.filter(item => item.active)).map((blend) =>
        //                                 <option value={blend.id} key={blend.id}>
        //                                     {blend.name}
        //                                 </option>
        //                             )}
        //                         </select>
        //                     </td>
        //                     <td className='table-data'>
        //                         <input
        //                             onKeyDown={e => {
        //                                 if (e.key === "Delete") { handleInputChange("0", index, "lotNo") }
        //                             }}
        //                             min={"0"}
        //                             type="text"
        //                             onFocus={(e) => e.target.select()}
        //                             className="text-right rounded py-1 w-16 px-1 table-data-input"
        //                             value={(!row.lotNo) ? 0 : row.lotNo}
        //                             disabled={readOnly}
        //                             inputMode='decimal'
        //                             onChange={(e) => {
        //                                 handleInputChange(e.target.value, index, "lotNo")
        //                             }
        //                             }
        //                             onBlur={(e) => {
        //                                 handleInputChange(parseFloat(e.target.value), index, "lotNo")
        //                             }
        //                             }

        //                         />
        //                     </td>
        //                     <td className='table-data'>
        //                         <input
        //                             onKeyDown={e => {
        //                                 if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
        //                                 if (e.key === "Delete") { handleInputChange("0", index, "noOfBags") }
        //                             }}
        //                             min={"0"}
        //                             type="number"
        //                             onFocus={(e) => e.target.select()}
        //                             className="text-right rounded py-1 w-16 px-1 table-data-input"
        //                             value={(!row.noOfBags) ? 0 : row.noOfBags}
        //                             disabled={readOnly}
        //                             inputMode='decimal'
        //                             onChange={(e) => {
        //                                 handleInputChange(e.target.value, index, "noOfBags")
        //                             }
        //                             }
        //                             onBlur={(e) => {
        //                                 handleInputChange(parseFloat(e.target.value), index, "noOfBags")
        //                             }
        //                             }
        //                         />
        //                     </td>
        //                     <td className='table-data'>
        //                         <input
        //                             onKeyDown={e => {
        //                                 if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
        //                                 if (e.key === "Delete") { handleInputChange("0", index, "weightPerBag") }
        //                             }}
        //                             min={"0"}
        //                             type="number"
        //                             onFocus={(e) => e.target.select()}
        //                             className="text-right rounded py-1 w-16 px-1 table-data-input"
        //                             value={(!row.weightPerBag) ? 0 : row.weightPerBag}
        //                             disabled={readOnly}
        //                             inputMode='decimal'
        //                             onChange={(e) =>
        //                                 handleInputChange(e.target.value, index, "weightPerBag")
        //                             }
        //                             onBlur={(e) => {
        //                                 handleInputChange(parseFloat(e.target.value).toFixed(3), index, "weightPerBag")
        //                             }
        //                             }
        //                         />
        //                     </td>
        //                     <td className='table-data'>
        //                         <input
        //                             onKeyDown={e => {
        //                                 if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
        //                                 if (e.key === "Delete") { handleInputChange("0.000", index, "qty") }
        //                             }}
        //                             min={"0"}
        //                             type="number"
        //                             className="text-right rounded py-1 px-1 w-16 table-data-input"
        //                             onFocus={(e) => e.target.select()}
        //                             value={(!row.qty) ? 0 : row.qty}
        //                             disabled={readOnly}
        //                             onChange={(e) =>
        //                                 handleInputChange(e.target.value, index, "qty")
        //                             }
        //                             onBlur={(e) => {
        //                                 handleInputChange(parseFloat(e.target.value).toFixed(3), index, "qty");
        //                             }
        //                             }
        //                         />
        //                     </td>
        //                     <td className='table-data'>
        //                         <input
        //                             onKeyDown={e => {
        //                                 if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
        //                                 if (e.key === "Delete") { handleInputChange("0.00", index, "price") }
        //                             }}
        //                             min={"0"}
        //                             type="number"
        //                             className="text-right rounded py-1 w-16 px-1 table-data-input"
        //                             onFocus={(e) => e.target.select()}
        //                             value={(!row.price) ? 0 : row.price}
        //                             disabled={readOnly || Boolean(row?.alreadyCancelData?._sum?.qty)}
        //                             onChange={(e) =>
        //                                 handleInputChange(e.target.value, index, "price")
        //                             }
        //                             onBlur={(e) => {
        //                                 handleInputChange(parseFloat(e.target.value).toFixed(2), index, "price");
        //                             }
        //                             }
        //                         />
        //                     </td>
        //                     <td className='table-data'>
        //                         <input
        //                             type="number"
        //                             onFocus={(e) => e.target.select()}
        //                             className="text-right rounded py-1 w-16 px-1 table-data-input"
        //                             value={(!row.qty || !row.price) ? 0 : (parseFloat(row.qty) * parseFloat(row.price)).toFixed(2)}
        //                             disabled={true}
        //                         />
        //                     </td>
        //                     {readOnly
        //                         ?
        //                         ""
        //                         :
        //                         <td className='table-data w-20'>
        //                             <div tabIndex={-1} onClick={() => handleDeleteRow(index)}
        //                                 className='flex justify-center px-2 py-1.5 items-center cursor-pointer'>
        //                                 {DELETE}
        //                             </div>
        //                         </td>
        //                     }
        //                 </tr>
        //             ))}
        //             <tr className='bg-blue-200 w-full border border-gray-400 h-7 font-bold'>
        //                 <td className="table-data text-center w-10 font-bold" colSpan={5}>Total</td>
        //                 <td className="table-data  w-10"></td>
        //                 <td className="table-data text-right px-1 w-10">{getTotals("noOfBags")}</td>
        //                 <td className="table-data  w-10"></td>
        //                 <td className="table-data text-right px-1 w-10">{getTotals("qty").toFixed(3)}</td>
        //                 <td className="table-data  w-10"></td>
        //                 <td className="table-data text-right px-1  w-10">{getGross("qty", "price").toFixed(2)} </td>
        //                 {!(readOnly)
        //                     &&
        //                     <td className="table-data w-10"></td>
        //                 }
        //             </tr>
        //         </tbody>
        //     </table>
        // </div>
           <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm max-h-[250px] overflow-auto">
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
        
                                            className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                                        >
                                            Items
                                        </th>
                                        <th
        
                                            className={`w-52 px-4 py-2 text-center font-medium text-[13px] `}
                                        >
                                            Colors
                                        </th>
                                        <th
        
                                            className={`w-40 px-4 py-2 text-center font-medium text-[13px] `}
                                        >
                                            UOM
                                        </th>
                                        {/* <th
        
                                            className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                                        >
                                            Lot Det.
                                        </th> */}
                                  
                                        <th
        
                                            className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                        >
                                            Quantity
                                        </th>
                                        <th
        
                                            className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                        >
                                            Price
                                        </th>
                                        <th
        
                                            className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                        >
                                            Price(with Tax)
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
                              
                                                {/* <td className='w-40 border border-gray-300 text-[11px] py-0.5'>
                                                        <button onClick={() => (index)} className='w-full'>
                                                            {VIEW}
                                                        </button>
                                                    </td> */}
                  
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
                                                        // value={sumArray(row?.lotDetails ? row?.lotDetails : [], "qty")}
                                                        value={row?.qty}
                                                        // disabled={true}
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
                                                        <td className='w-16 px-1 py-1 text-center text-[11px]'>
                                                        <select
                                                            onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "discountType") } }}
        
        
                                                            disabled={readOnly || Boolean(row?.alreadyInwardedData?._sum?.qty)}
                                                            className='text-left w-full rounded py-1 table-data-input'
                                                            value={row.discountType}
                                                            onChange={(e) => handleInputChange(e.target.value, index, "discountType")}
                                                            onBlur={(e) => {
        
                                                                handleInputChange(e.target.value, index, "discountType")
        
                                                            }
                                                            }
                                                        >
                                                            <option hidden>
                                                            </option>
                                                            {(discountTypes || []).map((blend) =>
                                                                <option value={blend.value} key={blend.value}>
                                                                    {blend.show}
                                                                </option>
                                                            )}
                                                        </select>
                                                    </td>        
                                                      {/* <td className='"w-40  py-0.5 border-blue-gray-200 text-[11px] text-right border border-gray-300'>
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
                                                      </td> */}
                                         
                  
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
    )
}

export default YarnPoItems