import React, { useEffect, useState } from "react";
import { DELETE, PLUS } from "../../../icons";
import { useGetAccessoryMasterQuery } from "../../../redux/uniformService/AccessoryMasterServices";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { useGetUomQuery } from "../../../redux/services/UomMasterService";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { toast } from "react-toastify";
import { Loader } from "../../../Basic/components";
import { VIEW } from "../../../icons";
import TaxDetailsFullTemplate from "../TaxDetailsCompleteTemplate";

import Modal from "../../../UiComponents/Modal";
import { priceWithTax } from "../../../Utils/helper";
import { discountTypes } from "../../../Utils/DropdownData";
import { useGetAccessoryGroupMasterQuery } from "../../../redux/uniformService/AccessoryGroupMasterServices";
import { useGetAccessoryItemMasterQuery } from "../../../redux/uniformService/AccessoryItemMasterServices";
import { useDispatch, useSelector } from "react-redux";
import { push } from "../../../redux/features/opentabs";
import {
  setLastTab,
  setOpenPartyModal,
} from "../../../redux/features/openModel";
import { HiPencil, HiPlus, HiTrash } from "react-icons/hi";
import Swal from "sweetalert2";


const GeneralAccessoryPoItems = ({
  accessoryList,
  accessoryGroupList,
  accessoryItemList,
  colorList,
  uomList,
  sizeList,
  id,
  poItems,
  setPoItems,
  readOnly,
  params,
  isSupplierOutside,
  taxTypeId,
  supplierId,
  setTableDataView,
  hsnData,
  contextMenu,
  handleRightClick,
  handleCloseContextMenu ,
  accessoryCategoryList
}) => {


  const [currentSelectedIndex, setCurrentSelectedIndex] = useState("");

  const handleInputChange = (value, index, field) => {


    const newBlend = structuredClone(poItems);

    // newBlend[index][field] = value;
    // if (field === "accessoryId") {
    //   newBlend[index]["taxPercent"] = findYarnTax(value);
    // }

    if (field === "accessoryId") {
      if (field === "accessoryId") {
        const selected = accessoryList?.data?.find(item => parseInt(item.id) === parseInt(value));
        const hsnId = selected?.hsnId || 0;
        const selectedTaxPercent = hsnData?.data?.find(item => parseInt(item.id) === parseInt(hsnId));
        const taxPercent = selectedTaxPercent?.tax || 0;

        console.log(hsnId, "hsnId")
        newBlend[index]["hsnId"] = hsnId
        newBlend[index]["taxPercent"] = taxPercent

        newBlend[index][field] = value

      }

    } else {
      newBlend[index][field] = value;
    }
    setPoItems(newBlend);
  };





  const activeTab = useSelector(
    (state) => state.openTabs.tabs.find((tab) => tab.active).name
  );


  useEffect(() => {
    if (id) return;
    if (poItems.length >= 3) return;
    setPoItems((prev) => {
      let newArray = Array.from({ length: 3 - prev.length }, (i) => {
        return {
          accessoryItemId: "",
          accessoryGroupId: "",
          accessoryId: "",
          qty: "",
          colorId: "",
          taxPercent: "0.000",
          sizeId: "",
          uomId: "",

          price: "",
          discountType: "",
          discountValue: 0,
          noOfBags: 0.00,
          weightPerBag: 0.00,

        };
      });
      return [...prev, ...newArray];
    });
  }, [setPoItems, poItems]);


  const handleDeleteRow = (id) => {
    setPoItems((yarnBlend) =>
      yarnBlend.filter((row, index) => index !== parseInt(id))
    );
  };
  const handleDeleteAllRows = () => {
    setPoItems([]);
  };

  const addNewRow = () => {
    const newRow = {
      yarnId: "",
      qty: "",
      tax: "0",
      colorId: "",
      uomId: "",
      price: "",
      discountTypes: "",
      discountValue: "0.00",
      noOfBags: "0.00"
    };
    setPoItems([...poItems, newRow]);
  };
  function findAccessoryItemName(id) {
    if (!accessoryList) return 0;
    let acc = accessoryList.data.find(
      (item) => parseInt(item.id) === parseInt(id)
    );
    return acc ? acc.accessoryItem.name : null;
  }


  function findAccessoryGroupName(id) {
    if (!accessoryList) return 0;
    let acc = accessoryList.data.find(
      (item) => parseInt(item.id) === parseInt(id)
    );
    return acc ? acc.accessoryItem.AccessoryGroup.name : null;
  }

  function findYarnTax(id) {
    if (!accessoryList) return 0;
    let yarnItem = accessoryList.data.find(
      (item) => parseInt(item.id) === parseInt(id)
    );
    return yarnItem?.taxPercent ? yarnItem.taxPercent : 0;
  }

  function getTotals(field) {
    const total = poItems.reduce((accumulator, current) => {
      return accumulator + parseFloat(current[field] ? current[field] : 0);
    }, 0);
    return parseFloat(total);
  }

  function getGross(field1, field2) {
    const total = poItems.reduce((accumulator, current) => {
      return (
        accumulator +
        parseFloat(
          current[field1] && current[field2]
            ? current[field1] * current[field2]
            : 0
        )
      );
    }, 0);
    return parseFloat(total);
  }

  const getTotalAmount = (
    qtyKey,
    priceKey,
    taxKey,
    discountTypeKey,
    discountAmountKey
  ) => {
    const total = poItems.reduce((acc, item) => {
      const qty = parseFloat(item[qtyKey]) || 0;
      const price = parseFloat(item[priceKey]) || 0;
      const tax = parseFloat(item[taxKey]) || 0;
      const discountType = item[discountTypeKey] || "";
      const discountAmount = parseFloat(item[discountAmountKey]) || 0;

      const amount = calculateRowTotal(
        qty,
        price,
        tax,
        discountType,
        discountAmount
      );

      return acc + (Number.isFinite(amount) ? amount : 0);
    }, 0);

    return Number.isFinite(total) ? total : 0;
  };

  const calculateRowTotal = (
    qty,
    price,
    taxPercent,
    discountType,
    discountValue
  ) => {
    // Core calculations
    const gross = qty * price;
    const tax = gross * (taxPercent / 100);
    let discount = 0;

    switch (discountType) {
      case "Flat":
        discount = Math.min(discountValue, gross + tax);
        break;
      case "Percentage":
        discount = (gross + tax) * (discountValue / 100);
        break;
    }

    return gross + tax - discount;
  };

  const findAmount = (row) => {
    const qty = row.qty;
    const price = row.price;
    const tax = row.tax;
    const discountType = row.discountType;
    const disAmount = row.discountAmount;

    let grossAmount = parseFloat(qty || 0) * parseFloat(price || 0) || 0;
    let taxAmount = 0;
    let discountValue = 0;

    if (tax) {
      taxAmount = grossAmount * (parseFloat(tax) / 100);
    }

    if (discountType === "Flat") {
      discountValue = parseFloat(disAmount) || 0;
    } else if (discountType === "Percentage") {
      discountValue =
        (grossAmount + taxAmount) * (parseFloat(disAmount) / 100) || 0;
    }

    const finalAmount = (grossAmount + taxAmount - discountValue).toFixed(2);
    return finalAmount;
  };
  const dispatch = useDispatch();


  // if (!accessoryList || !colorList || !uomList || !sizeList) return <Loader />;
  console.log(accessoryGroupList?.data || [], "accessoryGroupList");
  const handleCreateNew = (masterName = "") => {
    dispatch(setOpenPartyModal(true));
    dispatch(setLastTab(activeTab));
    dispatch(push({ name: masterName }));
  };

  const deleteRow = (id) => {
    setPoItems((yarnBlend) =>
      yarnBlend.filter((row, index) => index !== parseInt(id))
    );
  };
  return (
    <>
      <Modal
        isOpen={Number.isInteger(currentSelectedIndex)}
        onClose={() => setCurrentSelectedIndex("")}
      >
        <TaxDetailsFullTemplate
          readOnly={readOnly}
          taxTypeId={taxTypeId}
          currentIndex={currentSelectedIndex}
          poItems={poItems}
          handleInputChange={handleInputChange}
          isSupplierOutside={isSupplierOutside}
        />
      </Modal>
      <div className={` relative w-full overflow-y-auto p-3 max-h-[190px] overflow-auto`}>
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-bold text-slate-700">List Of Items</h2>
          <button className="font-bold text-slate-700 bord"
            // onKeyDown={(e) => {
            //   if (e.key === "Enter") {
            //     e.preventDefault();
            //     setTableDataView(true)

            //   }
            // }}
            // onClick={() => {
            //   if (!supplierId) {
            //     Swal.fire({
            //       icon: 'success',
            //       title: ` Choose Supplier`,
            //       showConfirmButton: false,
            //       timer: 2000
            //     });
            //   }
            //   else {

            //     setTableDataView(true)
            //   }
            // }}
            disabled
          >
            Fill Po Items
          </button>


        </div>
        <table className="w-full border-collapse table-fixed ">
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

                className={`w-44 px-4 py-2 text-center font-medium text-[13px] `}
              >
                Accessory Category
              </th>
              <th

                className={`w-80 px-4 py-2 text-center font-medium text-[13px] `}
              >
                Accessory Name
              </th>

              <th

                className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
              >
                Color
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
                Tax Details
              </th>
              <th

                className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
              >
                Actions
              </th>
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
                    disabled={readOnly} className='text-left w-full rounded py-1 table-data-input' value={row.accessoryGroupId}
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
                    onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "accessoryCategoryId") } }}
                    disabled={readOnly || !row.accessoryGroupId} className='text-left w-full rounded py-1 table-data-input' value={row.accessoryCategoryId}
                    onChange={(e) => handleInputChange(e.target.value, index, "accessoryCategoryId")}
                    onBlur={(e) => {

                      handleInputChange(e.target.value, index, "accessoryCategoryId")

                    }
                    }
                  >
                    <option hidden>
                    </option>
                    {(id ? (accessoryCategoryList?.data || []) : accessoryCategoryList?.data?.filter(item => item.active) || []).map((blend) =>
                      <option value={blend.id} key={blend.id}>
                        {blend.name}
                      </option>
                    )}
                  </select>
                </td>
                <td className='py-0.5 border border-gray-300 text-[11px]'>
                  <select
                    onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "accessoryId") } }}
                    disabled={readOnly || !row.accessoryCategoryId} className='text-left w-full rounded py-1 table-data-input' value={row.accessoryId}
                    onChange={(e) => handleInputChange(e.target.value, index, "accessoryId")}
                    onBlur={(e) => {

                      handleInputChange(e.target.value, index, "accessoryId")

                    }
                    }
                  >
                    <option hidden>
                    </option>
                    {(id ? (accessoryList?.data || []) : accessoryList?.data?.filter(item => item.active && item?.accessoryCategoryId == row?.accessoryCategoryId && item?.accessoryGroupId == row?.accessoryGroupId ) || [])?.map((blend) =>
                      <option value={blend.id} key={blend.id}>
                        {blend.aliasName}
                      </option>
                    )}
                  </select>
                </td>

                <td className='py-0.5 border border-gray-300 text-[11px]'>
                  <select
                    onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "colorId") } }}
                    disabled={readOnly || !row.accessoryId} className='text-left w-full rounded py-1 table-data-input' value={row.colorId}
                    onChange={(e) => handleInputChange(e.target.value, index, "colorId")}
                    onBlur={(e) => {

                      handleInputChange(e.target.value, index, "colorId")

                    }
                    }
                  >
                    <option hidden>
                    </option>
                    {(id ? colorList?.data : colorList?.data?.filter(item => item.active))?.map((blend) =>
                      <option value={blend.id} key={blend.id}>
                        {blend.name}
                      </option>
                    )}
                  </select>
                </td>
                <td className='py-0.5 border border-gray-300 text-[11px]'>
                  <select
                    onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "sizeId") } }}
                   disabled={readOnly || !row.accessoryId} className='text-left w-20 rounded py-1 table-data-input' value={row.sizeId}
                    onChange={(e) => handleInputChange(e.target.value, index, "sizeId")}
                    onBlur={(e) => {

                      handleInputChange(e.target.value, index, "sizeId")

                    }
                    }
                  >
                    <option hidden>
                    </option>
                    {(id ? sizeList?.data : sizeList?.data?.filter(item => item.active))?.map((blend) =>
                      <option value={blend.id} key={blend.id}>
                        {blend.name}
                      </option>
                    )}
                  </select>
                </td>
                <td className='py-0.5 border border-gray-300 text-[11px]'>
                  <select
                    onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "uomId") } }}
                    disabled={readOnly || !row.accessoryId} className='text-left w-20 rounded py-1 table-data-input' value={row.uomId}
                    onChange={(e) => handleInputChange(e.target.value, index, "uomId")}
                    onBlur={(e) => {

                      handleInputChange(e.target.value, index, "uomId")

                    }
                    }
                  >
                    <option hidden>
                    </option>
                    {(id ? uomList?.data : uomList?.data.filter(item => item.active))?.map((blend) =>
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
                    className="text-right rounded py-1 px-1 w-full table-data-input"
                    value={(!row.qty) ? 0 : row.qty}
                    disabled={readOnly || !row.accessoryId}
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
                    className="text-right rounded py-1 px-1 w-full table-data-input"
                    value={(!row.price) ? 0 : row.price}
                   disabled={readOnly || !row.accessoryId}
                    onChange={(e) =>
                      handleInputChange(e.target.value, index, "price")
                    }
                    onBlur={(e) => {
                      handleInputChange(parseFloat(e.target.value).toFixed(3), index, "price");
                    }
                    }
                  />
                </td>

                <td className='py-0.5 border border-gray-300 text-[11px]'>
                  <input
                    type="number"
                    onFocus={(e) => e.target.select()}
                    className="text-right rounded py-1 px-1 w-full"
                    value={(!row.qty || !row.price) ? 0 : (parseFloat(row.qty || 0) * parseFloat(row.price || 0)).toFixed(3)}
                    disabled={true}
                  />
                </td>

                <td className='w-40 py-0.5 border border-gray-300 text-[11px] text-right'>
                  <button
                    disabled={readOnly || !row?.accessoryId}

                    className="text-center rounded py-1 w-20"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setCurrentSelectedIndex(index);
                      }
                    }}
                    onClick={() => {
                      if (!taxTypeId) return Swal.fire({
                        title: "Please select Tax Type",
                        icon: "success",
                        draggable: true,
                        timer: 1000,
                        showConfirmButton: false,
                        didOpen: () => {
                          Swal.showLoading();
                        }
                      });

                      setCurrentSelectedIndex(index)
                    }}>
                    {VIEW}
                  </button>
                </td>
                <td className="w-16 px-1 py-1 border border-gray-300 text-center">
                  <input
                    readOnly={true }
                    disabled={!row.accessoryGroupId}
                    className="w-full bg-transparent  text-right pr-2"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addNewRow();
                      }
                    }}
                    onContextMenu={(e) => {
                      if (!readOnly) {
                        handleRightClick(e, index, "shiftTimeHrs");
                      }
                    }}
                  />
                </td>


              </tr>
            ))}
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
    </>
  );
};

export default GeneralAccessoryPoItems;
