import React, { useEffect, useState } from 'react'


import { useGetProcessMasterQuery } from '../../../redux/uniformService/ProcessMasterService'
import { ReusableInput } from './CommonInput'
import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService'
import secureLocalStorage from 'react-secure-storage'
import { HiTrash } from 'react-icons/hi'


const SizeDetailsSubGrid = ({ readOnly, item, sizeList, id, setOrderDetails, gridIndex, handleAdd, orderDetails }) => {

  const [currentSelectedIndex, setCurrentSelectedIndex] = useState("");
  const [panelGridOpen, setPanelGridOpen] = useState(false)
  const [arrayName, setArrayName] = useState("");

  const companyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userCompanyId"
  )

console.log(readOnly,"readOnly")



  function handleInputChange(value, index, field) {
    let orderSizeDetails = "orderSizeDetails"
    console.log([gridIndex], [index], [field], "gridIndex")
    setOrderDetails(orderDetails => {
      const newBlend = structuredClone(orderDetails);
      console.log(newBlend, "newBlend")
      newBlend[gridIndex][orderSizeDetails][index][field] = value;
      return newBlend
    }
    );
  };


  function deleteRow(gridIndex, index) {
    setOrderDetails(prev => prev.filter((_, i) => i !== index))
  }
  function deleteSubRow(gridIndex, index) {

    setOrderDetails(prev => {
      // const updated = [...prev];
      const updated = structuredClone(prev);
      // console.log(updated[gridIndex],"deletesuybro")
      updated[gridIndex].orderSizeDetails.splice(index, 1);


      if (updated[gridIndex].orderSizeDetails.length === 0) {
        updated.splice(gridIndex, 1);
      }

      return updated;
    });
  }


  return (
    <>




      <tr>
        <td colSpan={8} className="p-0">
          <div className="flex justify-end w-full">
            <table className="w-auto border border-gray-300">
              <thead className="bg-gray-200 text-gray-800">
                <tr>
                  <th className="w-8 px-4 py-1.5 text-center font-medium text-[13px]">S.No</th>
                  <th className="w-28 px-4 py-1.5 text-center font-medium text-[13px]">Size</th>
                  <th className="w-28 px-4 py-1.5text-center font-medium text-[13px]">Weight</th>

                  <th className="w-44 px-4 py-1.5 text-center font-medium text-[13px]">Size Measurement</th>
                  <th className="w-24 px-4 py-1.5 text-center font-medium text-[13px]">Qty</th>
                  <th className="w-11 px-4 py-1.5 text-right font-medium text-[13px]">
                    <button
                      onClick={() => handleAdd(gridIndex)}
                      className="rounded text-xs flex items-center"
                    >
                      ➕
                    </button>
                  </th>

                </tr>
              </thead>
              <tbody>
                {item?.orderSizeDetails?.map((yarn, index) => (
                  <tr key={index} className="border border-blue-gray-200 cursor-pointer">
                    <td className="py-0.5 border border-gray-300 text-[11px] text-center">
                      {index + 1}
                    </td>
                    <td className="py-0.5 border border-gray-300 text-[11px]">
                      <select
                        onKeyDown={e => {
                          if (e.key === "Delete") {
                            handleInputChange("", index, "sizeId");
                          }
                        }}
                        disabled={readOnly}

                        className="text-left w-full rounded h-full py-1"
                        value={yarn?.sizeId}
                        onChange={(e) => handleInputChange(e.target.value, index, "sizeId", gridIndex)}
                        onBlur={(e) => handleInputChange(e.target.value, index, "sizeId", gridIndex)}
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
                        disabled={readOnly}
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
                        className="text-left rounded w-full py-1 text-xs table-data-input"
                        value={yarn.sizeMeasurement}
                        disabled={readOnly || Boolean(item?.alreadyInwardedData?._sum?.qty)}
                        onChange={e => handleInputChange(e.target.value, index, "sizeMeasurement")}
                        onBlur={e => handleInputChange(e.target.value, index, "sizeMeasurement")}
                      />
                    </td>
                    <td className="py-0.5 border border-gray-300 text-[11px]">
                      <input
                        type="number"
                        onKeyDown={e => {
                          if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault();
                          if (e.key === "Delete") handleInputChange("0.000", index, "discountAmount");
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
