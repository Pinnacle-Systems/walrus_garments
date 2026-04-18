import React, { useState } from "react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { useGetItemMasterQuery } from "../../../redux/uniformService/ItemMasterService";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { useAddOpeningStockMutation } from "../../../redux/services/StockService";
import { getCommonParams, getStockMaintenanceConfig } from "../../../Utils/helper";
import { toast } from "react-toastify";
import { FiPlus, FiTrash, FiSave, FiSettings } from "react-icons/fi";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService";
import { useGetLocationMasterQuery } from "../../../redux/uniformService/LocationMasterServices";
import Swal from "sweetalert2";
import QuickAddItemModal from "./QuickAddItemModal";
import { useGetUnitOfMeasurementMasterQuery } from "../../../redux/uniformService/UnitOfMeasurementServices";
import { useGetItemControlPanelMasterQuery } from "../../../redux/uniformService/ItemControlPanelService";
import { getItemBarcodeGenerationMethod, getItemPriceForBarcodeGenerationMode, resolveBarcodeGenerationMethod } from "../../../Utils/helper";
import QuickAddSizeModal from "./QuickAddSizeModal";
import QuickAddColorModal from "./QuickAddColorModal";
import { useGetStockReportControlQuery } from "../../../redux/uniformService/StockReportControl.Services";
import TransactionLineItemsSection, {
  transactionTableActionButtonClassName,
  transactionTableActionCellClassName,
  transactionTableFocusCellClassName,
  transactionTableClassName,
  transactionTableHeadClassName,
  transactionTableHeaderCellClassName,
  transactionTableIndexCellClassName,
  transactionTableNumberInputClassName,
  transactionTableSelectInputClassName,
} from "../ReusableComponents/TransactionLineItemsSection";
import {
  createOpeningStockRowDefaults,
  getOpeningStockFieldDefinitions,
} from "./openingStockSchema";

const ManualAddStock = ({ params }) => {
  const { branchId, companyId, finYearId, userId } = getCommonParams();

  // --- Main State ---
  const [rows, setRows] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState("");


  // --- Modal State ---
  const [modalState, setModalState] = useState({
    item: { open: false, rowId: null, value: "", editItem: null },
    size: { open: false, rowId: null, value: "" },
    color: { open: false, rowId: null, value: "" },
  });
  // --- Queries & Mutations ---
  const itemQueryParams = React.useMemo(() => ({ ...params, active: true }), [params]);
  const { data: itemList } = useGetItemMasterQuery({ params: itemQueryParams });
  const { data: itemControlData } = useGetItemControlPanelMasterQuery({ params });
  const { data: stockReportControlData } = useGetStockReportControlQuery({ params });
  const { data: sizeList } = useGetSizeMasterQuery({ params });
  const { data: colorList } = useGetColorMasterQuery({ params });
  const { data: uomList } = useGetUnitOfMeasurementMasterQuery({ params });

  const { data: branchList } = useGetBranchQuery({ params: { companyId } });
  const { data: locationList } = useGetLocationMasterQuery({ params: { branchId: selectedBranchId } });

  const branchOptionsList = branchList?.data?.map((b) => ({ value: b.id, label: b.branchName })) || [];
  const locationOptionsList = locationList?.data?.map((l) => ({ value: l.id, label: l.storeName })) || [];
  const barcodeGenerationMethod = resolveBarcodeGenerationMethod(itemControlData?.data?.[0]);
  const stockReportControl = stockReportControlData?.data?.[0];
  const stockMaintenance = getStockMaintenanceConfig(stockReportControl);
  const openingStockFields = React.useMemo(
    () => getOpeningStockFieldDefinitions(stockReportControl),
    [stockReportControl]
  );

  React.useEffect(() => {
    if (branchId) setSelectedBranchId(branchId);
  }, [branchId]);

  const [addStock] = useAddOpeningStockMutation();

  const createManualRow = React.useCallback(() => {
    const pcsId = uomList?.data?.find((u) => u.name?.toUpperCase() === "PCS")?.id || "";
    return {
      id: Date.now(),
      ...createOpeningStockRowDefaults(openingStockFields),
      uomId: pcsId,
      uom: pcsId ? "PCS" : "",
    };
  }, [openingStockFields, uomList]);


  React.useEffect(() => {
    if (uomList?.data && rows.length === 0) {
      setRows([createManualRow()]);
    }
  }, [createManualRow, rows.length, uomList]);

  // --- Options Mapping ---
  const legacyItems = React.useMemo(
    () => (itemList?.data || []).filter((item) => item.active && item.isLegacy),
    [itemList]
  );
  const itemOptions = legacyItems.map((i) => ({ value: i.id, label: i.name })) || [];
  const sizeOptions = sizeList?.data?.map((s) => ({ value: s.id, label: s.name })) || [];
  const colorOptions = colorList?.data?.map((c) => ({ value: c.id, label: c.name })) || [];
  const uomOptions = uomList?.data?.map((c) => ({ value: c.id, label: c.name })) || [];

  // --- Row Logic ---
  const addRow = () => {
    setRows([...rows, createManualRow()]);
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
          const selectedItem = legacyItems.find((i) => i.id === updatedRow.itemId);
          if (selectedItem) {
            updatedRow.price = selectedItem?.isLegacy
              ? selectedItem?.ItemPriceList?.[0]?.salesPrice || 0
              : getItemPriceForBarcodeGenerationMode(
                selectedItem,
                getItemBarcodeGenerationMethod(selectedItem, barcodeGenerationMethod),
                updatedRow.sizeId,
                updatedRow.colorId
              );
          }
        }

        return updatedRow;
      })
    );
  };

  // --- Modal Logic ---
  const openQuickAdd = (type, value, rowId, editItem = null) => {
    setModalState((prev) => ({ ...prev, [type]: { open: true, rowId, value, editItem } }));
  };

  const closeQuickAdd = (type) => {
    setModalState((prev) => ({ ...prev, [type]: { ...prev[type], open: false } }));
  };

  // --- Save Logic (Quick Add) ---
  const handleQuickSaveItem = (newItem) => {
    updateRow(modalState.item.rowId, "itemId", newItem.id, { item_name: newItem.name });
  };
  const handleQuickSaveSize = (newSize) => {
    updateRow(modalState.size.rowId, "sizeId", newSize.id, { size: newSize.name });
  };
  const handleQuickSaveColor = (newColor) => {
    updateRow(modalState.color.rowId, "colorId", newColor.id, { color: newColor.name });
  };

  const isManualFieldMissing = (row, field) => {
    if (field.key === "item_name") return !row.itemId;
    if (field.key === "size") return stockMaintenance.trackSize && !row.sizeId;
    if (field.key === "color") return stockMaintenance.trackColor && !row.colorId;
    if (field.key === "uom") return !row.uomId;
    if (field.key === "qty") return !row.qty || Number(row.qty) <= 0;

    return !row[field.key]?.toString().trim();
  };

  // --- Save Logic (Batch Stock) ---
  const handleSaveStock = async () => {
    if (!selectedBranchId) { toast.warning("Please select a branch."); return; }
    if (!selectedLocationId) { toast.warning("Please select a location."); return; }

    for (const field of openingStockFields.filter((entry) => entry.required)) {
      const missingRowIndex = rows.findIndex((row) => isManualFieldMissing(row, field));
      if (missingRowIndex !== -1) {
        toast.warning(`${field.label} is required at row ${missingRowIndex + 1}`);
        return;
      }
    }
    if (!window.confirm("Save stock?")) return;
    try {
      const selectedLocationName = locationList?.data?.find(loc => String(loc.id) === String(selectedLocationId))?.storeName;
      const isDiscountSection = selectedLocationName?.toUpperCase() === "DISCOUNT SECTION";

      const payload = {
        branchId: selectedBranchId,
        storeId: selectedLocationId,
        companyId,
        finYearId,
        userId,
        stockItems: rows.map(({ id, ...rest }) => ({
          ...rest,
          barcodeType: isDiscountSection ? "CLEARANCE" : "REGULAR"
        }))
      };
      const resp = await addStock(payload).unwrap();

      if (resp.statusCode === 0) {
        Swal.fire({ icon: "success", title: "Saved", timer: 1500, showConfirmButton: false });
        setRows([createManualRow()]);
      }
    } catch (e) { toast.error("Save failed"); }
  };

  const customSelectStyles = {
    control: (base) => ({ ...base, minHeight: "30px", height: "30px", fontSize: "12px" }),
    valueContainer: (base) => ({ ...base, padding: "0 6px" }),
    input: (base) => ({ ...base, margin: 0, padding: 0 }),
    indicatorsContainer: (base) => ({ ...base, height: "30px" }),
  };
  const headerSelectStyles = {
    control: (base) => ({ ...base, minHeight: "30px", height: "30px", fontSize: "12px", borderRadius: "0.5rem" }),
    valueContainer: (base) => ({ ...base, padding: "0 8px", fontSize: "12px" }),
    input: (base) => ({ ...base, margin: 0, padding: 0, fontSize: "12px" }),
    singleValue: (base) => ({ ...base, fontSize: "12px" }),
    placeholder: (base) => ({ ...base, fontSize: "12px" }),
    option: (base) => ({ ...base, fontSize: "12px" }),
    indicatorsContainer: (base) => ({ ...base, height: "30px" }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  };

  console.log(rows, "rows")

  return (
    <div className="w-full bg-white rounded-md p-2">
      <div className="flex flex-col gap-4 mb-4 border-b pb-4">
        {/* Header Title and Actions */}
        <div className="flex justify-between items-center ">
          <h2 className="text-lg font-semibold text-gray-700">Manual Entry</h2>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (window.confirm("Clear all rows?")) {
                  setRows([createManualRow()]);
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

        {/* Branch and Location Selection */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-600">Select Branch</label>
            <Select
              options={branchOptionsList}
              value={branchOptionsList.find((o) => o.value === selectedBranchId)}
              onChange={(o) => { setSelectedBranchId(o?.value || ""); setSelectedLocationId(""); }}
              placeholder="Branch..."
              menuPortalTarget={document.body}
              styles={headerSelectStyles}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-600">Select Location</label>
            <Select
              options={locationOptionsList}
              value={locationOptionsList.find((o) => o.value === selectedLocationId)}
              onChange={(o) => setSelectedLocationId(o?.value || "")}
              placeholder="Location..."
              isClearable
              menuPortalTarget={document.body}
              styles={headerSelectStyles}
            />
          </div>
        </div>
      </div>

      <TransactionLineItemsSection
        title="List Of Items"
        contentClassName="h-[450px]"
      >
        <table className={transactionTableClassName}>
          <thead className={transactionTableHeadClassName}>
            <tr>
              <th className={`${transactionTableHeaderCellClassName} w-12`}>S.No</th>
              {openingStockFields.map((field) => (
                <th key={field.key} className={`${transactionTableHeaderCellClassName} ${field.widthClass || ""}`}>
                  {field.label}
                </th>
              ))}
              <th className={`${transactionTableHeaderCellClassName} w-16`}>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const selectedItemData = legacyItems.find(i => i.id === row.itemId);
              const validSizeIds = selectedItemData?.ItemPriceList?.map(p => p.sizeId) || [];
              const validColorIds = selectedItemData?.ItemPriceList?.map(p => p.colorId) || [];

              const filteredSizeOptions = validSizeIds.length > 0 ? sizeOptions.filter(o => validSizeIds.includes(o.value)) : sizeOptions;
              const filteredColorOptions = validColorIds.length > 0 ? colorOptions.filter(o => validColorIds.includes(o.value)) : colorOptions;

              return (
                <tr key={row.id} className="border border-blue-gray-200">
                  <td className={transactionTableIndexCellClassName}>{idx + 1}</td>
                  {openingStockFields.map((field) => {
                    if (field.key === "item_name") {
                      return (
                        <td key={field.key} className={transactionTableFocusCellClassName}>
                          <div className="flex items-center gap-1">
                            <div className="flex-1 uppercase">
                              <CreatableSelect isClearable placeholder="Item..." options={itemOptions} value={itemOptions.find(o => o.value === row.itemId)} styles={customSelectStyles}
                                onChange={o => {
                                  const selectedItem = legacyItems.find(i => i.id === (o?.value || ""));
                                  updateRow(row.id, "itemId", o?.value || "", {
                                    item_name: o?.label || "",
                                    sizeId: "",
                                    size: "",
                                    colorId: "",
                                    color: "",
                                    price: selectedItem?.ItemPriceList?.[0]?.salesPrice || 0
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
                      );
                    }

                    if (field.key === "size") {
                      return (
                        <td key={field.key} className={transactionTableFocusCellClassName}>
                          <CreatableSelect
                            isClearable
                            placeholder="Size..."
                            options={filteredSizeOptions}
                            value={filteredSizeOptions.find(o => o.value === row.sizeId)}
                            styles={customSelectStyles}
                            onChange={o => updateRow(row.id, "sizeId", o?.value || "", { size: o?.label || "" })}
                            onCreateOption={v => openQuickAdd("size", v.toUpperCase(), row.id)}
                            formatCreateLabel={(v) => `Create Size: "${v.toUpperCase()}"`}
                          />
                        </td>
                      );
                    }

                    if (field.key === "color") {
                      return (
                        <td key={field.key} className={transactionTableFocusCellClassName}>
                          <CreatableSelect
                            isClearable
                            placeholder="Color..."
                            options={filteredColorOptions}
                            value={filteredColorOptions.find(o => o.value === row.colorId)}
                            styles={customSelectStyles}
                            onChange={o => updateRow(row.id, "colorId", o?.value || "", { color: o?.label || "" })}
                            onCreateOption={v => openQuickAdd("color", v.toUpperCase(), row.id)}
                            formatCreateLabel={(v) => `Create Color: "${v.toUpperCase()}"`}
                          />
                        </td>
                      );
                    }

                    if (field.key === "uom") {
                      return (
                        <td key={field.key} className={transactionTableFocusCellClassName}>
                          <Select isClearable placeholder="UOM..." options={uomOptions} value={uomOptions.find(o => o.value === row.uomId)} styles={customSelectStyles}
                            onChange={o => updateRow(row.id, "uomId", o?.value || "", { uom: o?.label || "" })}
                          />
                        </td>
                      );
                    }

                    if (field.key === "price" || field.key === "qty") {
                      return (
                        <td key={field.key} className={transactionTableFocusCellClassName}>
                          <input
                            type="number"
                            className={transactionTableNumberInputClassName}
                            value={row[field.key]}
                            onChange={e => updateRow(row.id, field.key, e.target.value)}
                          />
                        </td>
                      );
                    }

                    return (
                      <td key={field.key} className={transactionTableFocusCellClassName}>
                        <input
                          type="text"
                          className={transactionTableSelectInputClassName}
                          value={row[field.key] || ""}
                          onChange={e => updateRow(row.id, field.key, e.target.value)}
                        />
                      </td>
                    );
                  })}
                  <td className={transactionTableActionCellClassName}>
                    <button
                      onClick={() => removeRow(row.id)}
                      className="mx-auto inline-flex h-7 w-7 items-center justify-center rounded bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700"
                    >
                      <FiTrash />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TransactionLineItemsSection>

      {/* --- Quick Add Modals --- */}

      {modalState.item.open && (
        <QuickAddItemModal
          isOpen={modalState.item.open}
          onClose={() => closeQuickAdd("item")}
          itemName={modalState.item.value}
          itemToEdit={modalState.item.editItem}
          onCreated={handleQuickSaveItem}
          barcodeGenerationMethod={barcodeGenerationMethod}
          legacyOnly={true}
        />
      )}
      {modalState.size.open && (
        <QuickAddSizeModal
          isOpen={modalState.size.open}
          onClose={() => closeQuickAdd("size")}
          sizeName={modalState.size.value}
          onCreated={handleQuickSaveSize}
        />
      )}
      {modalState.color.open && (
        <QuickAddColorModal
          isOpen={modalState.color.open}
          onClose={() => closeQuickAdd("color")}
          colorName={modalState.color.value}
          onCreated={handleQuickSaveColor}
        />
      )}

    </div>
  );
};

export default ManualAddStock;
