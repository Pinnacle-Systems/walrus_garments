import React, { useEffect, useState } from "react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { useAddItemMasterMutation, useGetItemMasterQuery } from "../../../redux/uniformService/ItemMasterService";
import { useAddSizeMasterMutation, useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { useAddColorMasterMutation, useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { useAddLegacyStockMutation, useUpdateLegacyStockMutation } from "../../../redux/uniformService/LegacyStockService";
import { getCommonParams, isGridDatasValid } from "../../../Utils/helper";
import { toast } from "react-toastify";
import { FiPlus, FiTrash, FiSave, FiSettings, FiEdit2 } from "react-icons/fi";
import { Check, X } from "lucide-react";
import Modal from "../../../UiComponents/Modal";
import { TextInput, DropdownInput, ReusableSearchableInput } from "../../../Inputs";
import { adjTypeData, ItemTypes } from "../../../Utils/DropdownData";
import { dropDownListObject } from "../../../Utils/contructObject";
import Swal from "sweetalert2";
import QuickAddItemModal from "./QuickAddItemModal";
import { useGetUnitOfMeasurementMasterQuery } from "../../../redux/uniformService/UnitOfMeasurementServices";
import { FaFileAlt } from "react-icons/fa";
import { ReusableInput } from "../Order/CommonInput";
import { useGetLocationMasterQuery } from "../../../redux/uniformService/LocationMasterServices";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService";
import { HiOutlineRefresh } from "react-icons/hi";
import { useAddStockAdjustmentMutation } from "../../../redux/uniformService/StockAdjustmentService";

const ManualAddStock = ({ params, onClose, id, setId, docId, setDocId, date, setDate, readOnly, setReadOnly, transType, setTransType,
  dcNo, setDcNo, dcDate, setDcDate, customerId, setCustomerId, payTermId, setPayTermId, locationId, setLocationId, storeId, setStoreId, branchList, locationData, yarnList, hasPermission }) => {

  const [contextMenu, setContextMenu] = useState(false)

  const { branchId, companyId, finYearId, userId } = getCommonParams();

  // --- Main State ---
  const [rows, setRows] = useState([
    {
      id: Date.now(),
      itemId: "",
      item_name: "",
      sizeId: "",
      size: "",
      colorId: "",
      color: "",
      qty: 0,
      barcode_no: "",
    },
  ]);

  // --- Modal State ---
  const [modalState, setModalState] = useState({
    item: { open: false, rowId: null, value: "", editItem: null },
    size: { open: false, rowId: null, value: "" },
    color: { open: false, rowId: null, value: "" },
  });

  // --- Quick Add Form State ---
  const [quickItem, setQuickItem] = useState({ name: "", code: "", type: "" });

  // --- Queries & Mutations ---
  const { data: itemList } = useGetItemMasterQuery({ params });
  const { data: sizeList } = useGetSizeMasterQuery({ params });
  const { data: colorList } = useGetColorMasterQuery({ params });
  const { data: uomList } = useGetUnitOfMeasurementMasterQuery({ params });




  const [addData] = useAddLegacyStockMutation();
  const [updateData] = useUpdateLegacyStockMutation();

  // const [addData] = useAddStockAdjustmentMutation();



  // --- Options Mapping ---
  const itemOptions = itemList?.data?.map((i) => ({ value: i.id, label: i.name })) || [];
  const sizeOptions = sizeList?.data?.map((s) => ({ value: s.id, label: s.name })) || [];
  const colorOptions = colorList?.data?.map((c) => ({ value: c.id, label: c.name })) || [];
  const uomOptions = uomList?.data?.map((c) => ({ value: c.id, label: c.name })) || [];


  useEffect(() => {
    if (id) return
    if (rows?.length >= 10) return;
    setRows((prev) => {
      let newArray = Array.from({ length: 10 - prev.length }, (i) => {
        return {
          itemId: "",
          qty: "0.00",
          tax: "0",
          colorId: "",
          uomId: "",
          price: "0.00",
          discountValue: "0.00",
          noOfBags: "0",
          discountType: "",
          weightPerBag: "0.00",
          id: '',
          poItemsId: ""
        };
      });
      return [...prev, ...newArray];
    });
  }, [rows, setRows]);


  const updateRow = (id, field, value, extraData = {}) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;

        const updatedRow = { ...row, [field]: value, ...extraData };

        // Auto-price lookup (only if item, size, or color changed)
        if (["itemId", "sizeId", "colorId"].includes(field)) {
          const selectedItem = itemList?.data?.find((i) => i.id === updatedRow.itemId);
          if (selectedItem) {
            const { priceMethod, ItemPriceList } = selectedItem;
            let foundPrice = updatedRow.price;

            if (priceMethod === "STANDARD") {
              foundPrice = ItemPriceList?.[0]?.salesPrice || 0;
            } else if (priceMethod === "SIZE") {
              if (updatedRow.sizeId) {
                const priceEntry = ItemPriceList?.find((p) => p.sizeId === updatedRow.sizeId);
                if (priceEntry) foundPrice = priceEntry.salesPrice;
              }
            } else if (priceMethod === "SIZE_COLOR") {
              if (updatedRow.sizeId && updatedRow.colorId) {
                const priceEntry = ItemPriceList?.find(
                  (p) => p.sizeId === updatedRow.sizeId && p.colorId === updatedRow.colorId
                );
                if (priceEntry) foundPrice = priceEntry.salesPrice;
              }
            }
            updatedRow.price = foundPrice;
          }
        }

        return updatedRow;
      })
    );
  };

  const openQuickAdd = (type, value, rowId, editItem = null) => {
    setModalState((prev) => ({ ...prev, [type]: { open: true, rowId, value, editItem } }));
    if (type === "item") setQuickItem({ name: value, code: value, type: "" });
  };

  const closeQuickAdd = (type) => {
    setModalState((prev) => ({ ...prev, [type]: { ...prev[type], open: false } }));
  };

  // --- Save Logic (Quick Add) ---
  const handleQuickSaveItem = (newItem) => {
    updateRow(modalState.item.rowId, "itemId", newItem.id, { item_name: newItem.name });
  };

  // --- Save Logic (Batch Stock) ---


  const customSelectStyles = {
    control: (base) => ({ ...base, minHeight: "30px", height: "30px", fontSize: "12px" }),
    valueContainer: (base) => ({ ...base, padding: "0 6px" }),
    input: (base) => ({ ...base, margin: 0, padding: 0 }),
    indicatorsContainer: (base) => ({ ...base, height: "30px" }),
  };


  const storeOptions = locationData
    ? locationData?.data?.filter((item) => parseInt(item.locationId) === parseInt(branchId))
    : [];

  const addNewRow = () => {
    const newRow = {
      itemId: "",
      qty: "",
      tax: "0",
      colorId: "",
      uomId: "",
      price: "",
      discountTypes: "",
      discountValue: "0.00",
      id: '',
      poItemsId: ""
    };
    setRows([...rows, newRow]);
  };


  const handleRightClick = (event, rowIndex, type) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
      rowId: rowIndex,
      type,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };
  const handleDeleteRow = (id) => {
    setRows((yarnBlend) =>
      yarnBlend.filter((row, index) => index !== parseInt(id))
    );
  };
  const handleDeleteAllRows = () => {
    setRows((prevRows) => {
      if (prevRows.length <= 1) return prevRows;
      return [prevRows[0]];
    });
  };


  const data = {
    branchId, storeId, stockItems: rows?.filter((i) => i.itemId)
  };

  const validateData = (d) =>
    !!(d?.branchId && d?.storeId);

  const handleSubmitCustom = async (callback, payload, text, nextProcess) => {
    try {
      const returnData = await callback(payload).unwrap();
      if (returnData.statusCode === 1) {
        toast.error(returnData.message);
      } else {
        Swal.fire({ icon: "success", title: `${text || "Saved"} Successfully`, showConfirmButton: false });
        if (returnData.statusCode === 0) {
          if (nextProcess === "new") {
            // syncFormWithDb(undefined)
            // onNew();
          } else {
            onClose()
          }

        } else {
          toast.error(returnData?.message);
        }
      }
    } catch (error) {
      console.log("handle", error);
    }
  };



  const saveData = (nextProcess) => {

    const mandatoryFields = ["itemId", "sizeId", "adjType", "qty", "price"];

    if (!validateData(data)) {
      Swal.fire({ title: "Please fill all required fields...!", icon: "warning" });
      return;
    }

    if (data?.adjustmentItems?.filter((i) => i.itemId)?.length === 0) {
      Swal.fire({ title: "Please fill all adjustment Items...!", icon: "warning" });
      return;
    }
    if (!isGridDatasValid(data?.stockItems?.filter((i) => i.itemId), false, mandatoryFields)) {
      Swal.fire({ title: "Please fill all Po Items Mandatory fields...!", icon: "warning" });
      return;
    }
    if (!window.confirm("Are you sure save the details ...?")) return;

    if (nextProcess === "draft" && !id)
      handleSubmitCustom(addData, { ...data, draftSave: true }, "Added", nextProcess);
    else if (id && nextProcess === "draft")
      handleSubmitCustom(updateData, { ...data, draftSave: true }, "Updated", nextProcess);
    else if (id)
      handleSubmitCustom(updateData, data, "Updated", nextProcess);
    else
      handleSubmitCustom(addData, data, "Added", nextProcess);
  };


  return (

    <>

      <div className="w-full bg-[#f1f1f0] mx-auto rounded-md shadow-md px-2 py-1 overflow-y-auto">
        <div className="flex justify-between items-center mb-1">
          <h1 className="text-2xl font-bold text-gray-800">Stock Adjustment</h1>
          <button
            onClick={onClose}
            className="text-indigo-600 hover:text-indigo-700"
            title="Open Report"
          >
            <FaFileAlt className="w-5 h-5" />
          </button>
        </div>

      </div>
      <div className="space-y-3  mt-2 h-[58vh]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">


          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
            <h2 className="font-medium text-slate-700 mb-2">
              Basic Details
            </h2>
            <div className="grid grid-cols-2 gap-1">
              <ReusableInput label="Sale Order No" readOnly value={docId} />
              <ReusableInput label="Sale Order Date" value={date} type={"date"} required={true} readOnly={true} disabled />


            </div>
          </div>




          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-2">
            <h2 className="font-medium text-slate-700 mb-2">
              Location Details
            </h2>
            <div className="grid grid-cols-4 gap-1">


              <DropdownInput
                name="Branch"
                options={
                  branchList
                    ? dropDownListObject(
                      id ? branchList?.data : branchList?.data?.filter((item) => item.active),
                      "branchName", "id"
                    )
                    : []
                }
                value={branchId}
                setValue={(value) => { setLocationId(value); setStoreId(""); }}
                required
              />
              <DropdownInput
                name="Location"
                options={dropDownListObject(
                  id
                    ? storeOptions
                    : storeOptions?.filter((item) => item.active),
                  "storeName", "id"
                )}
                value={storeId}
                setValue={setStoreId}
                required
              />

            </div>

          </div>


        </div>
        <div className="w-full h-full bg-white border border-gray-200 rounded-md p-2">


          <div className="overflow-x-auto h-[400px]">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr className="text-xs font-semibold text-gray-600">
                  <th className="border px-2 py-1.5 w-12">S.No</th>
                  <th className="border px-2 py-1.5 w-64 text-left">Item Name</th>
                  <th className="border px-2 py-1.5 w-32 text-left">Size</th>
                  {/* <th className="border px-2 py-1.5 w-32 text-left">Color</th> */}
                  <th className="border px-2 py-1.5 w-32 text-left">UOM</th>

                  <th className="border px-2 py-1.5 w-40 text-left">Barcode</th>
                  <th className="border px-2 py-1.5 w-24 text-left">Price</th>
                  <th className="border px-2 py-1.5 w-24 text-left">Adjust Type</th>

                  <th className="border px-2 py-1.5 w-24 text-right">Qty</th>
                  <th className="border px-2 py-1.5 w-12 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => {
                  const selectedItemData = itemList?.data?.find(i => i.id === row.itemId);
                  const validSizeIds = selectedItemData?.ItemPriceList?.map(p => p.sizeId) || [];
                  const validColorIds = selectedItemData?.ItemPriceList?.map(p => p.colorId) || [];

                  const filteredSizeOptions = sizeOptions.filter(o => validSizeIds.includes(o.value));
                  const filteredColorOptions = colorOptions.filter(o => validColorIds.includes(o.value));

                  return (
                    <tr key={row.id} className="hover:bg-gray-50 border-b"

                      onContextMenu={(e) => {
                        if (!readOnly) {
                          handleRightClick(e, idx, "shiftTimeHrs");
                        }
                      }}>
                      <td className="border px-2 py-1 text-center text-xs">{idx + 1}</td>
                      <td className="border px-2 py-1">
                        <div className="flex items-center gap-1">
                          <div className="flex-1 uppercase">
                            <CreatableSelect isClearable placeholder="Item..." options={itemOptions} value={itemOptions.find(o => o.value === row.itemId)} styles={customSelectStyles}
                              onChange={o => {
                                const selectedItem = itemList?.data?.find(i => i.id === (o?.value || ""));
                                updateRow(row.id, "itemId", o?.value || "", {
                                  item_name: o?.label || "",
                                  sizeId: "",
                                  size: "",
                                  colorId: "",
                                  color: "",
                                  price: selectedItem?.priceMethod === "STANDARD" ? selectedItem?.ItemPriceList?.[0]?.salesPrice || 0 : ""
                                });
                              }}
                              onInputChange={(v) => v.toUpperCase()}
                              onCreateOption={v => openQuickAdd("item", v.toUpperCase(), row.id)}
                              formatCreateLabel={(v) => `Create Item: "${v.toUpperCase()}"`} />
                          </div>
                          {row.itemId && (
                            <button
                              title="Manage Item"
                              onClick={() => openQuickAdd("item", row.item_name, row.id, selectedItemData)}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded border border-indigo-100"
                            >
                              <FiSettings className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="border px-2 py-1">
                        <Select isClearable placeholder="Size..." options={filteredSizeOptions} value={filteredSizeOptions.find(o => o.value === row.sizeId)} styles={customSelectStyles}
                          onChange={o => updateRow(row.id, "sizeId", o?.value || "", { size: o?.label || "" })}
                        />
                      </td>

                      <td className="border px-2 py-1">
                        <Select isClearable placeholder="UOM..." options={uomOptions} value={uomOptions?.find(o => o.value === row.uomId)} styles={customSelectStyles}
                          onChange={o => updateRow(row.id, "uomId", o?.value || "", { uom: o?.label || "" })}
                        />
                      </td>
                      <td className="border px-2 py-1">
                        <input type="text" className="w-full px-2 py-1 text-xs border rounded outline-none uppercase" value={row.barcode} onChange={e => updateRow(row.id, "barcode", e.target.value)} />
                      </td>
                      <td className="border px-2 py-1"><input type="number" className="w-full px-2 py-1 text-xs border rounded outline-none text-right" value={row.price} onChange={e => updateRow(row.id, "price", parseInt(e.target.value) || 0)} />
                      </td>
                      <td className="py-0.5 border border-gray-300 text-[11px]">
                        <select
                          id={`adjType-${idx}`}
                          tabIndex={0}
                          disabled={readOnly || (row.salesQty ?? 0) > 0}
                          className={`text-left w-full rounded py-1 table-data-input 
    ${row.adjType === "PLUS" ? "text-green-600" : ""}
    ${row.adjType === "MINUS" ? "text-red-600" : ""}
  `}
                          value={row.adjType}
                          onChange={(e) => {
                            updateRow(row.id, "adjType", e.target.value)
                          }}
                          onBlur={(e) => {
                            updateRow(row.id, "adjType", e.target.value)
                          }}
                          onFocus={(e) => e.target.onselect()}
                        >
                          <option></option>
                          {adjTypeData?.map((blend) => (
                            <option value={blend.value} key={blend.value}>
                              {blend?.show}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="border px-2 py-1"><input type="number" className="w-full px-2 py-1 text-xs border rounded outline-none text-right" value={row.qty} onChange={e => updateRow(row.id, "qty", parseInt(e.target.value) || 0)} />
                      </td>
                      {/* <td className="border px-2 py-1 text-center">
                        <button onClick={() => removeRow(row.id)} className="text-red-500 hover:text-red-700"><FiTrash />
                        </button>
                      </td> */}
                      <td className="w-16 px-1 py-1 text-center">
                        <input
                          readOnly
                          className="w-full bg-transparent focus:outline-none focus:border-transparent text-right pr-2"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addNewRow();
                            }
                          }}

                        />
                      </td>
                    </tr>
                  );
                })}
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
          {/* --- Quick Add Modals --- */}

          {modalState.item.open && (
            <QuickAddItemModal
              isOpen={modalState.item.open}
              onClose={() => closeQuickAdd("item")}
              itemName={modalState.item.value}
              itemToEdit={modalState.item.editItem}
              onCreated={handleQuickSaveItem}
            />
          )}

        </div>

        <div className="flex flex-col md:flex-row gap-2 justify-between mt-0">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => hasPermission(() => saveData("new"), "save")}

              className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm">
              <FiSave className="w-4 h-4 mr-2" />
              Save & New
            </button>
            <button
              onClick={() => hasPermission(() => saveData("close"), "save")}
              className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm">
              <HiOutlineRefresh className="w-4 h-4 mr-2" />
              Save & Close
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button className="bg-yellow-600 text-white px-4 py-1 rounded-md hover:bg-yellow-700 flex items-center text-sm"
              // onClick={() => setReadOnly(false)}
              onClick={() => hasPermission(() => setReadOnly(false), "edit")}

            >
              <FiEdit2 className="w-4 h-4 mr-2" />
              Edit
            </button>

          </div>
        </div>
      </div>

    </>
  );
};

export default ManualAddStock;
