import { useEffect, useState } from "react";
import { useGetAccessoryGroupMasterQuery } from "../../../redux/uniformService/AccessoryGroupMasterServices";
import { useGetAccessoryItemMasterQuery } from "../../../redux/uniformService/AccessoryItemMasterServices";
import { useGetAccessoryMasterQuery } from "../../../redux/uniformService/AccessoryMasterServices";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { useGetUomQuery } from "../../../redux/services/UomMasterService";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { Loader } from "lucide-react";
import { DELETE, PLUS } from "../../../icons";
import { HiPencil, HiPlus, HiTrash } from "react-icons/hi";
import { standardTransactionPlaceholderRowCount } from "../ReusableComponents/TransactionLineItemsSection";

const AccessoryPoItems = ({ id, poItems, setPoItems, readOnly, params, isSupplierOutside, taxTypeId }) => {

    const [currentSelectedIndex, setCurrentSelectedIndex] = useState("")

    const handleInputChange = (value, index, field) => {

        const newBlend = structuredClone(poItems);
        newBlend[index][field] = value;
        if (field === "accessoryId") {
            newBlend[index]["taxPercent"] = findYarnTax(value)
        }
        setPoItems(newBlend);
    };

    useEffect(() => {
        if (poItems?.length >= standardTransactionPlaceholderRowCount) return
        setPoItems(prev => {
            let newArray = Array.from({ length: standardTransactionPlaceholderRowCount - prev.length }, i => {
                return { accessoryItemId: "", accessoryGroupId: "", accessoryId: "", qty: "", colorId: "", taxPercent: "0.000", sizeId: "", uomId: "", qty: "", price: "", discountType: "Percentage", discountValue: 0 }
            })
            return [...prev, ...newArray]
        }
        )
    }, [setPoItems, poItems])

    const addNewRow = () => {
        const newRow = { accessoryItemId: "", accessoryGroupId: "", accessoryId: "", qty: "", colorId: "", taxPercent: "0.000", sizeId: "", uomId: "", qty: "", price: "", discountType: "Percentage", discountValue: 0 };
        setPoItems([...poItems, newRow]);
    };
    const deleteRow = id => {
        setPoItems(yarnBlend => yarnBlend.filter((row, index) => index !== parseInt(id)));
    };
    const { data: accessoryGroupList } =
        useGetAccessoryGroupMasterQuery({ params })

    const { data: accessoryItemList } =
        useGetAccessoryItemMasterQuery({ params })

    const { data: accessoryList } =
        useGetAccessoryMasterQuery({ params })


    const { data: colorList } =
        useGetColorMasterQuery({ params });

    const { data: uomList } =
        useGetUomQuery({ params });

    const { data: sizeList } =
        useGetSizeMasterQuery({ params });

    function findAccessoryItemName(id) {
        if (!accessoryList) return 0
        let acc = accessoryList?.data?.find(item => parseInt(item.id) === parseInt(id))
        return acc ? acc.accessoryItem.name : null
    }

    function findAccessoryGroupName(id) {
        if (!accessoryList) return 0
        let acc = accessoryList?.data?.find(item => parseInt(item.id) === parseInt(id))
        return acc ? acc.accessoryItem.AccessoryGroup.name : null
    }

    function findYarnTax(id) {
        if (!accessoryList) return 0
        let yarnItem = accessoryList?.data?.find(item => parseInt(item.id) === parseInt(id))
        return yarnItem?.taxPercent ? yarnItem.taxPercent : 0
    }

    function getTotals(field) {
        const total = poItems?.reduce((accumulator, current) => {
            return accumulator + parseFloat(current[field] ? current[field] : 0)
        }, 0)
        return parseFloat(total)
    }

    function getPriceWithTax(qty, price, taxPercent) {



        if ((!qty) || (!price)) return 0
        let taxAmount = 0;
        let grossAmount = parseFloat((parseFloat(qty) * parseFloat(price)) || 0).toFixed(2);


        if (taxPercent !== "") {
            let percentage = parseFloat(taxPercent) / 100

            taxAmount = parseFloat(parseFloat(grossAmount) * percentage).toFixed(2)
        }
        return (((parseFloat(grossAmount || 0) + parseFloat(taxAmount || 0))) || 0)
    }

    function getTotalAmount(qty, price, taxPercent) {
        const total = poItems.reduce((accumulator, current) => {
            return accumulator + parseFloat(getPriceWithTax(current[qty], current[price], current[taxPercent]))
        }, 0)
        return parseFloat(total)
    }


    function getGross(field1, field2) {
        const total = poItems?.reduce((accumulator, current) => {
            return accumulator + parseFloat(current[field1] && current[field2] ? current[field1] * current[field2] : 0)
        }, 0)
        return parseFloat(total)
    }



    if (!accessoryList || !colorList || !uomList || !sizeList) return <Loader />

    return (
        <>

            {/* <Modal isOpen={Number.isInteger(currentSelectedIndex)} onClose={() => setCurrentSelectedIndex("")}>
                <TaxDetailsFullTemplate taxTypeId={taxTypeId} currentIndex={currentSelectedIndex}
                    readOnly={readOnly}
                    poItems={poItems} handleInputChange={handleInputChange} isSupplierOutside={isSupplierOutside} />
            </Modal> */}
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
                                            Accessory Group
                                        </th>
                                        <th
        
                                            className={`w-52 px-4 py-2 text-center font-medium text-[13px] `}
                                        >
                                            Accessory Item
                                        </th>
                                        <th
        
                                            className={`w-40 px-4 py-2 text-center font-medium text-[13px] `}
                                        >
                                            Accessory Name
                                        </th>
                                       
                                        <th
        
                                            className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                                        >
                                            Colors
                                        </th>
                                        <th
        
                                            className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                        >
                                            Size
                                        </th>
                                        <th
        
                                            className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                        >
                                            UOM
                                        </th>
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
        
                                            className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                        >
                                            Gross
                                        </th>
                                         <th
        
                                            className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                        >
                                             Tax
                                        </th>
                                           <th
        
                                            className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                        >
                                             Price With Tax
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
                  
                                 {poItems?.map((row, index) => (
                            <tr key={index} className="border border-blue-gray-200 cursor-pointer">
                                <td className="w-12 border border-gray-300 text-[11px]  text-center p-0.5">
                                    {index + 1}
                                </td>
                                <td className='py-0.5 border border-gray-300 text-[11px]'>
                                    <select
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "accessoryGroupId") } }}
                                        disabled={readOnly} className='text-left w-full rounded py-1 tx-table-input' value={row.accessoryGroupId}
                                        onChange={(e) => handleInputChange(e.target.value, index, "accessoryGroupId")}
                                        onBlur={(e) => {

                                            handleInputChange(e.target.value, index, "accessoryGroupId")

                                        }
                                        }
                                    >
                                        <option hidden>
                                        </option>
                                        {(id ? (accessoryGroupList?.data || []) : accessoryGroupList?.data.filter(item => item.active) || []).map((blend) =>
                                            <option value={blend.id} key={blend.id}>
                                                {blend.name}
                                            </option>
                                        )}
                                    </select>
                                </td>
                                <td className='py-0.5 border border-gray-300 text-[11px]'>
                                    <select
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "accessoryItemId") } }}
                                        disabled={readOnly} className='text-left w-full rounded py-1 tx-table-input' value={row.accessoryItemId}
                                        onChange={(e) => handleInputChange(e.target.value, index, "accessoryItemId")}
                                        onBlur={(e) => {

                                            handleInputChange(e.target.value, index, "accessoryItemId")

                                        }
                                        }
                                    >
                                        <option hidden>
                                        </option>
                                        {(id ? (accessoryItemList?.data || []) : accessoryItemList?.data?.filter(item => item.active && item?.accessoryGroupId == row?.accessoryGroupId) || []).map((blend) =>
                                            <option value={blend.id} key={blend.id}>
                                                {blend.name}
                                            </option>
                                        )}
                                    </select>
                                </td>
                                <td className='py-0.5 border border-gray-300 text-[11px]'>
                                    <select
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "accessoryId") } }}
                                        disabled={readOnly} className='text-left w-full rounded py-1 tx-table-input' value={row.accessoryId}
                                        onChange={(e) => handleInputChange(e.target.value, index, "accessoryId")}
                                        onBlur={(e) => {

                                            handleInputChange(e.target.value, index, "fabricaccessoryId")

                                        }
                                        }
                                    >
                                        <option hidden>
                                        </option>
                                        {(id ? (accessoryList.data || []) : accessoryList.data.filter(item => item.active && item?.accessoryItemId == row?.accessoryItemId) || []).map((blend) =>
                                            <option value={blend.id} key={blend.id}>
                                                {blend.aliasName}
                                            </option>
                                        )}
                                    </select>
                                </td>
                                {/* <td className='tx-table-cell'>
                                    <input
                                        type="text-left px-1"
                                        onFocus={(e) => e.target.select()}
                                        className="text-center rounded w-36 py-1 tx-table-input"
                                        value={findAccessoryItemName(row.accessoryId)}
                                        disabled={true}

                                    />
                                </td>
                                <td className='tx-table-cell'>
                                    <input
                                        type="text"
                                        onFocus={(e) => e.target.select()}
                                        className="text-center rounded w-36 py-1 tx-table-input"
                                        value={findAccessoryGroupName(row.accessoryId)}
                                        disabled={true}
                                    />
                                </td> */}
                                <td className='py-0.5 border border-gray-300 text-[11px]'>
                                    <select
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "colorId") } }}
                                        disabled={readOnly} className='text-left w-full rounded py-1 tx-table-input' value={row.colorId}
                                        onChange={(e) => handleInputChange(e.target.value, index, "colorId")}
                                        onBlur={(e) => {

                                            handleInputChange(e.target.value, index, "colorId")

                                        }
                                        }
                                    >
                                        <option hidden>
                                        </option>
                                        {(id ? colorList.data : colorList.data.filter(item => item.active)).map((blend) =>
                                            <option value={blend.id} key={blend.id}>
                                                {blend.name}
                                            </option>
                                        )}
                                    </select>
                                </td>
                                <td className='py-0.5 border border-gray-300 text-[11px]'>
                                    <select
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "sizeId") } }}
                                        disabled={readOnly} className='text-left w-20 rounded py-1 tx-table-input' value={row.sizeId}
                                        onChange={(e) => handleInputChange(e.target.value, index, "sizeId")}
                                        onBlur={(e) => {

                                            handleInputChange(e.target.value, index, "sizeId")

                                        }
                                        }
                                    >
                                        <option hidden>
                                        </option>
                                        {(id ? sizeList.data : sizeList.data.filter(item => item.active)).map((blend) =>
                                            <option value={blend.id} key={blend.id}>
                                                {blend.name}
                                            </option>
                                        )}
                                    </select>
                                </td>
                                <td className='py-0.5 border border-gray-300 text-[11px]'>
                                    <select
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "uomId") } }}
                                        disabled={readOnly} className='text-left w-20 rounded py-1 tx-table-input' value={row.uomId}
                                        onChange={(e) => handleInputChange(e.target.value, index, "uomId")}
                                        onBlur={(e) => {

                                            handleInputChange(e.target.value, index, "uomId")

                                        }
                                        }
                                    >
                                        <option hidden>
                                        </option>
                                        {(id ? uomList.data : uomList.data.filter(item => item.active)).map((blend) =>
                                            <option value={blend.id} key={blend.id}>
                                                {blend.name}
                                            </option>
                                        )}
                                    </select>
                                </td>
                                <td className='py-0.5 border border-gray-300 text-[11px]'>
                                    <input
                                        onKeyDown={e => {
                                            if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                                            if (e.key === "Delete") { handleInputChange("0.000", index, "qty") }
                                        }}
                                        min={"0"}
                                        type="number"
                                        onFocus={(e) => e.target.select()}
                                        className="text-right rounded py-1 px-1 w-16 tx-table-input"
                                        value={(!row.qty) ? 0 : row.qty}
                                        disabled={readOnly}
                                        onChange={(e) =>
                                            handleInputChange(parseFloat(e.target.value), index, "qty")
                                        }
                                        onBlur={(e) => {
                                            handleInputChange(parseFloat(e.target.value).toFixed(3), index, "qty");

                                        }
                                        }

                                    />

                                </td>
                                <td className='py-0.5 border border-gray-300 text-[11px]'>
                                    <input
                                        onKeyDown={e => {
                                            if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                                            if (e.key === "Delete") { handleInputChange("0.00", index, "price") }
                                        }}
                                        min={"0"}
                                        type="number"
                                        onFocus={(e) => e.target.select()}
                                        className="text-right rounded py-1 px-1 w-16 tx-table-input"
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

                                <td className='py-0.5 border border-gray-300 text-[11px]'>
                                    <input
                                        type="number"
                                        onFocus={(e) => e.target.select()}
                                        className="text-right rounded py-1 px-1 w-16 tx-table-input"
                                        value={(!row.qty || !row.price) ? 0 : (parseFloat(row.qty) * parseFloat(row.price))}
                                        disabled={true}
                                    />
                                </td>
                                <td className='py-0.5 border border-gray-300 text-[11px]'>
                                    <input
                                        type="number"
                                        onKeyDown={e => {
                                            if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                                            if (e.key === "Delete") { handleInputChange("0", index, "taxPercent") }
                                        }}
                                        min={"0"}
                                        onFocus={(e) => e.target.select()}
                                        className="text-right rounded py-1 px-1 w-full tx-table-input"
                                        value={(!row.taxPercent) ? 0 : row.taxPercent}
                                        disabled={readOnly || Boolean(row?.alreadyInwardedData?._sum?.tax)}
                                        onChange={(e) =>
                                            handleInputChange(e.target.value, index, "taxPercent")
                                        }
                                        onBlur={(e) => {

                                            handleInputChange(parseFloat(e.target.value), index, "taxPercent");


                                        }
                                        }
                                    />
                                </td>
                                <td className='py-0.5 border border-gray-300 text-[11px]'>
                                    <input
                                        type="number"
                                        onFocus={(e) => e.target.select()}
                                        className="text-right rounded py-1 px-1 w-16 tx-table-input"
                                        // value={(!row.qty || !row.price) ? 0 : (parseFloat(row.qty) * parseFloat(row.price))}
                                        value={getPriceWithTax(row.qty, row.price, row.taxPercent)}
                                        disabled={true}
                                    />
                                </td>
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
                        ))}            
                         </tbody>
                </table>
              </div>
               </div>
        </>
    )
}

export default AccessoryPoItems
