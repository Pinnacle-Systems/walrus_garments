import React, { useEffect, useState } from 'react'


import { useGetProcessMasterQuery } from '../../../redux/uniformService/ProcessMasterService'
import { ReusableInput } from './CommonInput'
import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService'
import secureLocalStorage from 'react-secure-storage'
import { HiTrash } from 'react-icons/hi'


const SizeDetailsSubGrid = ({ readOnly, item,  sizeList, uomList ,  colorList ,  gsmList, sampleDetails, gridIndex, handleAdd, setSampleDetails }) => {

    const [currentSelectedIndex, setCurrentSelectedIndex] = useState("");
    const [panelGridOpen, setPanelGridOpen] = useState(false)
    const [arrayName, setArrayName] = useState("");

    const companyId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userCompanyId"
    )

      console.log(sampleDetails,"sampleDetails")
      
    
    
      // console.log(gridIndex,"gridIndex")
    function handleInputChange(value, index, field ) {
      let sampleSizeDetails =  "sampleSizeDetails"
        setSampleDetails(orderDetails => {
            const newBlend = structuredClone(orderDetails);
            console.log(newBlend,"newBlend")
            newBlend[gridIndex][sampleSizeDetails][index][field] = value;
            return newBlend
        }
        );
    };

    

//            function deleteSubRow(gridIndex, index) {
// console.log(gridIndex, index,"gridIndex, index")
//         setSampleDetails(prev => {
//             const updated = structuredClone(prev);
//             updated[gridIndex]?.sampleSizeDetails?.filter((_,i ) => i !== index )
//             console.log(updated[gridIndex]?.sampleSizeDetails?.filter((_,i ) => i !== index ),"check")


//             return updated;
//         });
//     }

function deleteSubRow(gridIndex, index) {

    setSampleDetails(prev => {
        const updated = structuredClone(prev); 

        if (
            Array.isArray(updated[gridIndex]?.sampleSizeDetails)
        ) {
            updated[gridIndex].sampleSizeDetails = 
                updated[gridIndex].sampleSizeDetails.filter((_, i) => i !== index);
        }


        return updated;
    });
}


    return (
        <>
      

              
       
<tr>
  <td colSpan={6} className="p-0">
    <div className="flex justify-end w-full">
      <table className="w-auto border border-gray-300">
        <thead className="bg-gray-200 text-gray-800">
          <tr>
            <th className="w-8 px-4 py-2 text-center font-medium text-[13px]">S.No</th>
            <th className="w-28 px-4 py-2 text-center font-medium text-[13px]">Color</th>
            <th className="w-28 px-4 py-2 text-center font-medium text-[13px]">Size</th>
             <th className="w-28 px-4 py-2 text-center font-medium text-[13px]">Uom</th>

            <th className="w-24 px-4 py-2 text-center font-medium text-[13px]">Qty</th> 
            <th className="w-28 px-4 py-2 text-center font-medium text-[13px]">Gsm</th>

            <th className="w-24 px-4 py-2 text-center font-medium text-[13px]">Weight</th>
                        <th className="w-24 px-4 py-2 text-center font-medium text-[13px]">Yarn Needle</th>

          <th className="w-44 px-4 py-2 text-center font-medium text-[13px]">Remarks</th>

             <th className="w-11 px-4 py-2 text-right font-medium text-[13px]">
                    <button
              onClick={() => handleAdd(gridIndex)}
              className="text-green-600 hover:text-green-800 bg-green-50 py-1 rounded text-xs flex items-center"
            >
              ➕
            </button>
              </th> 

          </tr>
        </thead>
        <tbody>
          {
          //  orderId 
          // ? 
          //       item?.orderSizeDetails 
          //     :
                item?.sampleSizeDetails?.map((yarn, index) => (
            <tr key={index} className="border border-blue-gray-200 cursor-pointer">
                 <td className="py-0.5 border border-gray-300 text-[11px] text-center">
                    {index + 1}
              </td>
                   <td className="py-0.5 border border-gray-300 text-[11px]">
                <select
                  onKeyDown={e => {
                    if (e.key === "Delete") {
                      handleInputChange("", index, "colorId");
                    }
                  }}
                  className="text-left w-full rounded h-full py-1"
                  value={   yarn?.colorId}
                  onChange={(e) => handleInputChange(e.target.value, index, "colorId",gridIndex)}
                  onBlur={(e) => handleInputChange(e.target.value, index, "colorId",gridIndex)}
                >
                  <option>select</option>
                  {colorList?.data?.map(size => (
                    <option value={size.id || ""} key={size.id}>
                      {size?.name}
                    </option>
                  ))}
                </select>
              </td>
              <td className="py-0.5 border border-gray-300 text-[11px]">
                <select
                  onKeyDown={e => {
                    if (e.key === "Delete") {
                      handleInputChange("", index, "sizeId");
                    }
                  }}
                  className="text-left w-full rounded h-full py-1"
                  value={   yarn?.sizeId}
                  onChange={(e) => handleInputChange(e.target.value, index, "sizeId",gridIndex)}
                  onBlur={(e) => handleInputChange(e.target.value, index, "sizeId",gridIndex)}
                >
                  <option>select</option>
                  {sizeList?.data?.map(size => (
                    <option value={size.id || ""} key={size.id}>
                      {size?.name}
                    </option>
                  ))}
                </select>
              </td>
                  <td className="py-0.5 border border-gray-300 text-[11px]">
                <select
                  onKeyDown={e => {
                    if (e.key === "Delete") {
                      handleInputChange("", index, "sizeId");
                    }
                  }}
                  className="text-left w-full rounded h-full py-1"
                  value={   yarn?.uomId}
                  onChange={(e) => handleInputChange(e.target.value, index, "uomId",gridIndex)}
                  onBlur={(e) => handleInputChange(e.target.value, index, "uomId",gridIndex)}
                >
                  <option>select</option>
                  {uomList?.data?.map(size => (
                    <option value={size.id || ""} key={size.id}>
                      {size?.name}
                    </option>
                  ))}
                </select>
              </td>
                 <td className="py-0.5 border border-gray-300 text-[11px]">
                <input
                  type="number"
                  onKeyDown={e => {
                    if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault();
                    if (e.key === "Delete") handleInputChange("0.000", index, "qty");
                  }}
                  min="0"
                  onFocus={e => e.target.select()}
                  className="text-right rounded w-full py-1 text-xs table-data-input"
                  value={yarn?.qty}
                  disabled={readOnly || Boolean(item?.alreadyInwardedData?._sum?.qty)}
                  onChange={e => handleInputChange(e.target.value, index, "qty")}
                  onBlur={e => handleInputChange(e.target.value, index, "qty")}
                />
              </td>
              <td className="py-0.5 border border-gray-300 text-[11px]">
                <select
                  onKeyDown={e => {
                    if (e.key === "Delete") {
                      handleInputChange("", index, "gsmId");
                    }
                  }}
                  className="text-left w-full rounded h-full py-1"
                  value={   yarn?.colorId}
                  onChange={(e) => handleInputChange(e.target.value, index, "gsmId",gridIndex)}
                  onBlur={(e) => handleInputChange(e.target.value, index, "gsmId",gridIndex)}
                >
                  <option>select</option>
                  {gsmList?.data?.map(size => (
                    <option value={size.id || ""} key={size.id}>
                      {size?.name}
                    </option>
                  ))}
                </select>
              </td>
  
                 <td className="py-0.5 border border-gray-300 text-[11px]">
                <input
                  type="number"
                  // onKeyDown={e => {
                  //   if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault();
                  //   if (e.key === "Delete") handleInputChange("0.000", index, "discountAmount");
                  // }}
                  min="0"
                  onFocus={e => e.target.select()}
                  className="text-right rounded w-full py-1 text-xs table-data-input"
                  value={(yarn.weight)}
                  // disabled={readOnly || Boolean(item?.alreadyInwardedData?._sum?.qty)}
                  onChange={e => handleInputChange(e.target.value, index, "weight")}
                  onBlur={e => handleInputChange(e.target.value, index, "weight")}
                />
              </td>
              
                 <td className="py-0.5 border border-gray-300 text-[11px]">
                <input
                  type="text"
                  // onKeyDown={e => {
                  //   if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault();
                  //   if (e.key === "Delete") handleInputChange("0.000", index, "discountAmount");
                  // }}
                  min="0"
                  onFocus={e => e.target.select()}
                  className="text-right rounded w-full py-1 text-xs table-data-input"
                  value={(yarn.weight)}
                  // disabled={readOnly || Boolean(item?.alreadyInwardedData?._sum?.qty)}
                  onChange={e => handleInputChange(e.target.value, index, "yarnNeedle")}
                  onBlur={e => handleInputChange(e.target.value, index, "yarnNeedle")}
                />
              </td>
                               <td className="py-0.5 border border-gray-300 text-[11px]">
                <textarea
                  type="text"
                  // onKeyDown={e => {
                  //   if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault();
                  //   if (e.key === "Delete") handleInputChange("0.000", index, "discountAmount");
                  // }}
                                  

                  onFocus={e => e.target.select()}
                  className="text-left rounded w-full py-2 text-md table-data-input h-7"
                  value={yarn.remarks}
                  disabled={readOnly || Boolean(item?.alreadyInwardedData?._sum?.qty)}
                  onChange={e => handleInputChange(e.target.value, index, "remarks")}
                  onBlur={e => handleInputChange(e.target.value, index, "remarks")}
                />
              </td>
         
        <td>
            <div className="flex justify-end items-center">
              <button
                onClick={() => deleteSubRow(gridIndex, index)}
                className="text-red-600 hover:text-red-800 bg-red-50 p-1 rounded text-xs flex items-center"
              >
                <HiTrash className="w-4 h-4" />
              </button>
            </div>
  </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </td>
</tr>




        </>
    )
}

export default SizeDetailsSubGrid
