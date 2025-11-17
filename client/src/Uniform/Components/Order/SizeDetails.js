import React, { useEffect, useState } from 'react'


import { useGetProcessMasterQuery } from '../../../redux/uniformService/ProcessMasterService'
import { ReusableInput } from './CommonInput'
import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService'
import secureLocalStorage from 'react-secure-storage'
import { HiTrash } from 'react-icons/hi'
import { Plus } from 'lucide-react'


const SizeDetailsSubGrid = ({ readOnly, item, sizeList, id, setOrderDetails, gridIndex, handleAdd, contextSubGridMenu, handleCloseSubGridContextMenu,
  handleRightSubGridClick, addNewRow
}) => {


  console.log(contextSubGridMenu, "contextSubGridMenu")



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

  function handleDeleteAllRows(gridIndex) {
    setOrderDetails(prev => {
      const updated = structuredClone(prev);
      const details = updated[gridIndex]?.orderSizeDetails;

      if (Array.isArray(details) && details.length > 1) {
        updated[gridIndex].orderSizeDetails = [details[0]]; // keep only first row
      }

      return updated;
    });
  }


  function handleDeleteRow(gridIndex, index) {

    setOrderDetails(prev => {
      const updated = structuredClone(prev);
      updated[gridIndex]?.orderSizeDetails?.splice(index, 1);


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

                  </th>

                </tr>
              </thead>
              <tbody>
                {item?.orderSizeDetails?.map((yarn, index) => (
                  <tr key={index} className="border border-blue-gray-200 cursor-pointer"
                    onContextMenu={(e) => {
                      if (!readOnly) {
                        handleRightSubGridClick(e, index, "notes");
                      }
                    }}
                  >
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


                    {/* 
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
                        value={parseFloat(yarn.weight).toFixed}
                        disabled={readOnly}
                        onChange={e => handleInputChange(e.target.value, index, "weight")}
                        onBlur={e => handleInputChange(e.target.value, index, "weight")}
                      />
                    </td> */}


                    <td className='py-0.5 border border-gray-300 text-[11px]'>
                      <input
                        onKeyDown={e => {
                          if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                          if (e.key === "Delete") { handleInputChange("0.00", index, "weight") }
                        }}
                        min={"0"}
                        type="number"
                        placeholder='0.000'
                        onFocus={(e) => e.target.select()}
                        className="text-right rounded py-1 px-1 w-full table-data-input"
                        value={((!yarn.weight) ? 0.000 : yarn.weight)}
                        disabled={readOnly}
                        onChange={(e) =>
                          handleInputChange(e.target.value, index, "weight")
                        }
                        onBlur={(e) => {
                          handleInputChange(parseFloat(e.target.value).toFixed(3), index, "weight");
                        }
                        }
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
                        className="text-left rounded w-full py-1 text-xs "
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
                        className="text-right rounded w-full py-1  text-[11px]"
                        value={yarn?.qty}
                        disabled={readOnly || Boolean(item?.alreadyInwardedData?._sum?.qty)}
                        onChange={e => handleInputChange(e.target.value, index, "qty")}
                        onBlur={(e) => {
                          handleInputChange(parseFloat(e.target.value).toFixed(3), index, "qty");
                        }
                        }

                      />
                    </td>
                    <td className="border border-gray-300 text-center">
                      <button
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAdd(gridIndex);
                          }
                        }}
                        className="flex items-center justify-center w-full py-1"
                      >
                        <Plus size={18} className="text-red-800" />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {contextSubGridMenu && (
            <div
              style={{
                position: "absolute",
                top: `${contextSubGridMenu.mouseY - 50}px`,
                left: `${contextSubGridMenu.mouseX - 30}px`,

                // background: "gray",
                boxShadow: "0px 0px 5px rgba(0,0,0,0.3)",
                padding: "8px",
                borderRadius: "4px",
                zIndex: 1000,
              }}
              className="bg-gray-100"
              onMouseLeave={handleCloseSubGridContextMenu} // Close when the mouse leaves
            >
              <div className="flex flex-col gap-1">
                <button
                  className=" text-black text-[12px] text-left rounded px-1"
                  onClick={() => {
                    handleDeleteRow(gridIndex, contextSubGridMenu.rowId);
                    handleCloseSubGridContextMenu();
                  }}
                >
                  Delete{" "}
                </button>
                <button
                  className=" text-black text-[12px] text-left rounded px-1"
                  onClick={() => {
                    handleDeleteAllRows(gridIndex);
                    handleCloseSubGridContextMenu();
                  }}
                >
                  Delete All
                </button>
              </div>
            </div>
          )}
        </td>
      </tr >




    </>
  )
}

export default SizeDetailsSubGrid
