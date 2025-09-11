import React, { useEffect, useState } from 'react'
import secureLocalStorage from 'react-secure-storage'
import { HiTrash } from 'react-icons/hi'


const YarnDetails = ({ indentItems, setIssueItems, gridIndex }) => {





  
  
  
  const handleInputChange = (value, index, field) => {
    const newBlend = structuredClone(indentItems?.RaiseIndenetYarnItems);
    console.log(newBlend,"newBlend",value , index)
        newBlend[index][field] = parseInt(value);
   
    
        setIssueItems(newBlend);
    };





  return (
    <>




      <div className="flex justify-between items-center mb-2">
        <h2 className="font-bold text-gray-800">{indentItems?.OrderDetails?.style?.name}</h2>
      </div>
      <tr>
        <td className="p-0">
          <div className="justify-center w-full">
            <table className="w-auto border border-gray-300">
              <thead className="bg-gray-200 text-gray-800">
                <tr>
                  <th className="w-8 px-4 py-1.5 border border-gray-300 text-center font-medium text-xs">S.No</th>
                  <th className="w-72 px-4 py-1.5 border border-gray-300 text-center font-medium text-xs">Yarn</th>
                  <th className="w-48 px-4 py-1.5 border border-gray-300 text-center font-medium text-xs">Color</th>
                  <th className="w-32 px-4 py-1.5 border border-gray-300  font-medium text-xs">Required Qty (Kgs) </th>
                  <td className="border border-gray-300 px-2 py-1 text-center text-xs w-32">Issue Qty (Kgs)</td>

                </tr>
              </thead>
              <tbody>
                {indentItems?.RaiseIndenetYarnItems?.map((yarn, index) => (
                  <tr key={index} className="border border-blue-gray-200 cursor-pointer">
                    <td className="py-0.5 border border-gray-300 text-[11px] text-center">
                      {index + 1}
                    </td>
                    <td className=" border border-gray-300 text-[11px] py-1.5 px-2">
                      {yarn?.Yarn?.name}
                    </td>
                    <td className=" border border-gray-300 text-[11px] py-1.5 px-2">
                      {yarn?.Color?.name}
                    </td>
                    <td className=" border border-gray-300 text-right text-[11px] py-1.5 px-2">
                      {(yarn.qty.toFixed(3))}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-right text-xs">
                      <input
                        min="0"
                        type="number"
                        className="text-right rounded py-1 px-1 w-full table-data-input"
                        onFocus={(e) => e.target.select()}
                        value={yarn?.issueQty}  
                      onChange={(e) => {
                        handleInputChange(e.target.value, index, "issueQty");
                      }}
                      // onBlur={(e) => {
                      //   const val = e.target.value;
                      //   handleInputChange(val === "" ? 0 : parseFloat(val).toFixed(2), index, "qty");
                      // }}
                      />
                    </td>

                  </tr>
                ))}
                <tr>
                  <td colSpan={3} className="border border-gray-300 px-2 py-1 text-center text-xs">Total Qty</td>
                  <td colSpan={1} className="border border-gray-300 px-2 py-1 text-right font-bold text-xs"> {
                    (indentItems?.RaiseIndenetYarnItems?.reduce((yarnSum, yarn) => yarnSum + yarn.qty, 0)).toFixed(3)
                  }</td>
                </tr>
              </tbody>
            </table>
          </div>
        </td>
      </tr>


    </>
  )
}

export default YarnDetails






