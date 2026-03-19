import React, { useState } from "react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { useAddItemMasterMutation, useGetItemMasterQuery } from "../../../redux/uniformService/ItemMasterService";
import { useAddSizeMasterMutation, useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { useAddColorMasterMutation, useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { useAddLegacyStockMutation } from "../../../redux/uniformService/LegacyStockService";
import { getCommonParams } from "../../../Utils/helper";
import { toast } from "react-toastify";
import { FiPlus, FiTrash, FiSave, FiSettings } from "react-icons/fi";
import { Check, X } from "lucide-react";
import Modal from "../../../UiComponents/Modal";
import { TextInput, DropdownInput } from "../../../Inputs";
import { ItemTypes } from "../../../Utils/DropdownData";
import { dropDownListObject } from "../../../Utils/contructObject";
import Swal from "sweetalert2";
import QuickAddItemModal from "./QuickAddItemModal";
import { useGetUnitOfMeasurementMasterQuery } from "../../../redux/uniformService/UnitOfMeasurementServices";

const ManualAddStock = ({ params }) => {
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

  const [addStock] = useAddLegacyStockMutation();
  const [addItem] = useAddItemMasterMutation();
  const [addSize] = useAddSizeMasterMutation();
  const [addColor] = useAddColorMasterMutation();

  // --- Options Mapping ---
  const itemOptions = itemList?.data?.map((i) => ({ value: i.id, label: i.name })) || [];
  const sizeOptions = sizeList?.data?.map((s) => ({ value: s.id, label: s.name })) || [];
  const colorOptions = colorList?.data?.map((c) => ({ value: c.id, label: c.name })) || [];
  const uomOptions = uomList?.data?.map((c) => ({ value: c.id, label: c.name })) || [];

  // --- Row Logic ---
  const addRow = () => {
    setRows([...rows, { id: Date.now(), itemId: "", item_name: "", sizeId: "", size: "", colorId: "", color: "", qty: 0, barcode_no: "" }]);
  };

  const removeRow = (id) => {
    if (rows.length === 1) return;
    setRows(rows.filter((row) => row.id !== id));
  };

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

  // --- Modal Logic ---
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
  const handleSaveStock = async () => {
    const valid = rows.every((r) => r.itemId && r.qty && r.barcode);
    if (!valid) { toast.warning("Fill Item and Qty and Barcode"); return; }
    if (!window.confirm("Save stock?")) return;
    try {
      const payload = {

        branchId, companyId, finYearId, userId, stockItems: rows.map(({ id, ...rest }) => rest)

      };
      const resp = await addStock(payload).unwrap();

      if (resp.statusCode === 0) {
        Swal.fire({ icon: "success", title: "Saved", timer: 1500, showConfirmButton: false });
        setRows([{ id: Date.now(), itemId: "", item_name: "", sizeId: "", size: "", colorId: "", color: "", qty: 0, barcode: "", price: "" }]);
      }
    } catch (e) { toast.error("Save failed"); }
  };

  const customSelectStyles = {
    control: (base) => ({ ...base, minHeight: "30px", height: "30px", fontSize: "12px" }),
    valueContainer: (base) => ({ ...base, padding: "0 6px" }),
    input: (base) => ({ ...base, margin: 0, padding: 0 }),
    indicatorsContainer: (base) => ({ ...base, height: "30px" }),
  };

  console.log(rows, "rows")

  return (
    <div className="w-full bg-white rounded-md p-2">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h2 className="text-lg font-semibold text-gray-700">Manual Entry</h2>
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (window.confirm("Clear all rows?")) {
                setRows([{ id: Date.now(), itemId: "", item_name: "", sizeId: "", size: "", colorId: "", color: "", qty: 0, barcode: "", price: "" }]);
              }
            }}
            className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm flex items-center gap-1 border border-gray-300 hover:bg-gray-200"
          >
            New
          </button>
          <button onClick={addRow} className="bg-green-500 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1"><FiPlus />Add Row</button>
          <button onClick={handleSaveStock} className="bg-indigo-600 text-white px-4 py-1 rounded-md text-sm flex items-center gap-1"><FiSave />Save Stock</button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto h-[450px]">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr className="text-xs font-semibold text-gray-600">
              <th className="border px-2 py-1.5 w-12">S.No</th>
              <th className="border px-2 py-1.5 w-64 text-left">Item Name</th>
              <th className="border px-2 py-1.5 w-32 text-left">Size</th>
              {/* <th className="border px-2 py-1.5 w-32 text-left">Color</th> */}
              <th className="border px-2 py-1.5 w-32 text-left">UOM</th>

              <th className="border px-2 py-1.5 w-40 text-left">Barcode</th>
              <th className="border px-2 py-1.5 w-40 text-left">Price</th>

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
                <tr key={row.id} className="hover:bg-gray-50 border-b">
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
                  {/* <td className="border px-2 py-1">
                    <Select isClearable placeholder="Color..." options={filteredColorOptions} value={filteredColorOptions.find(o => o.value === row.colorId)} styles={customSelectStyles}
                      onChange={o => updateRow(row.id, "colorId", o?.value || "", { color: o?.label || "" })}
                    />
                  </td> */}
                  <td className="border px-2 py-1">
                    <Select isClearable placeholder="UOM..." options={uomOptions} value={uomOptions.find(o => o.value === row.uomId)} styles={customSelectStyles}
                      onChange={o => updateRow(row.id, "uomId", o?.value || "", { uom: o?.label || "" })}
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input type="text" className="w-full px-2 py-1 text-xs border rounded outline-none uppercase" value={row.barcode} onChange={e => updateRow(row.id, "barcode", e.target.value)} />
                  </td>
                  <td className="border px-2 py-1"><input type="number" className="w-full px-2 py-1 text-xs border rounded outline-none text-right" value={row.price} onChange={e => updateRow(row.id, "price", parseInt(e.target.value) || 0)} />
                  </td>
                  <td className="border px-2 py-1"><input type="number" className="w-full px-2 py-1 text-xs border rounded outline-none text-right" value={row.qty} onChange={e => updateRow(row.id, "qty", parseInt(e.target.value) || 0)} />
                  </td>
                  <td className="border px-2 py-1 text-center">
                    <button onClick={() => removeRow(row.id)} className="text-red-500 hover:text-red-700"><FiTrash />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

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
  );
};

export default ManualAddStock;
