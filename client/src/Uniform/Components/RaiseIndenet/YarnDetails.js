import React, { useEffect, useState } from 'react'
import secureLocalStorage from 'react-secure-storage'
import { HiTrash } from 'react-icons/hi'


const YarnDetails = ({ readOnly, item, sizeList, indentItems, setOrderDetails, gridIndex, handleAdd, id }) => {

  const [currentSelectedIndex, setCurrentSelectedIndex] = useState("");
  const [panelGridOpen, setPanelGridOpen] = useState(false)
  const [arrayName, setArrayName] = useState("");

  const companyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userCompanyId"
  )




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


  function getQty(percentage) {
    if (!indentItems?.requirementSizeDetails?.length) return 0;

    const totalQty = indentItems?.requirementSizeDetails?.reduce((sum, size) => {
      return sum + (size.weight * percentage) / 100;
    }, 0);

    return Number(totalQty.toFixed(3)); // round to 3 decimals
  }




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
        <td colSpan={3} className="p-0">
          <div className="flex justify-end w-full">
            <table className="w-auto border border-gray-300">
              <thead className="bg-gray-200 text-gray-800">
                <tr>
                  <th className="w-8 px-4 py-1.5 text-center font-medium text-[13px]">S.No</th>
                  <th className="w-8 px-4 py-1.5 text-center font-medium text-[13px]">Yarn</th>
                  <th className="w-8 px-4 py-1.5 text-center font-medium text-[13px]">Color</th>
                  <th className="w-8 px-4 py-1.5 text-center font-medium text-[13px]">Required Qty</th>


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
                     {yarn.qty} Kg
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

export default YarnDetails
