import React, { useState, useEffect } from "react";
import { TextInput, DropdownInput } from "../../../Inputs";
import { useAddItemMasterMutation, useUpdateItemMasterMutation } from "../../../redux/uniformService/ItemMasterService";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import QuickAddSizeModal from "../../../Shocks/ItemMaster/QuickAddSizeModal";
import QuickAddColorModal from "../../../Shocks/ItemMaster/QuickAddColorModal";
import { Plus } from "lucide-react";
import { getCommonParams } from "../../../Utils/helper";
import { toast } from "react-toastify";
import Modal from "../../../UiComponents/Modal";
import { Check, X } from "lucide-react";
import { ItemTypes } from "../../../Utils/DropdownData";
import { dropDownListObject, multiSelectOption } from "../../../Utils/contructObject";
import { MultiSelectDropdownNew, TextInputNew1 } from "../../../Inputs";
import { useGetSectionMasterQuery } from "../../../redux/uniformService/SectionMasterService";
import { useGetItemCategoryQuery } from "../../../redux/uniformService/ItemCategoryMasterService";
import { capitalizeFirstLetter, findFromList } from "../../../Utils/helper";
import { useGetLocationMasterQuery } from "../../../redux/uniformService/LocationMasterServices";
import LocationStockEditor, { createEmptyLocationThreshold, getConfiguredLocationAlertCount, validateLocationThresholdRows } from "../../../Shocks/ItemMaster/LocationStockEditor";

const createStandardPriceRow = () => ({
  sizeId: null,
  colorId: null,
  offerPrice: "",
  salesPrice: "",
  sku: "",
  barcode: "",
  MinimumStockQty: [createEmptyLocationThreshold()],
});

function sanitizePriceRowsForSave(priceRows = []) {
  return priceRows.map((row) => ({
    ...row,
    MinimumStockQty: validateLocationThresholdRows(row?.MinimumStockQty || []).cleanedRows,
  }));
}

const QuickAddItemModal = ({ isOpen, onClose, itemName, onCreated, itemToEdit, barcodeGenerationMethod = "STANDARD" }) => {
  const params = getCommonParams();
  const [name, setName] = useState(itemName || "");
  const [code, setCode] = useState(itemName || "");
  const [itemType, setItemType] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [mainCategory, setMainCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [salesPrice, setSalesPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [sizeList, setSizeList] = useState([]);
  const [colorList, setColorList] = useState([]);
  const [itemPriceList, setItemPriceList] = useState([]);
  const [gridIndex, setGridIndex] = useState(null);
  const [active, setActive] = useState(true);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [showColorModal, setShowColorModal] = useState(false);
  // This only shapes the item structure edited inside the modal.
  // Parent stock-entry field presence/requiredness comes from Stock Control Panel.
  const effectiveBarcodeGenerationMethod = barcodeGenerationMethod || "STANDARD";

  const [addItem] = useAddItemMasterMutation();
  const [updateItem] = useUpdateItemMasterMutation();
  const { data: sizeData } = useGetSizeMasterQuery({ params });
  const { data: colorData } = useGetColorMasterQuery({ params });
  const { data: sectionData } = useGetSectionMasterQuery({ params });
  const { data: itemCategoryData } = useGetItemCategoryQuery({ params });
  const { data: locationData } = useGetLocationMasterQuery({ params });
  const storeOptions = locationData ? locationData?.data?.filter(item => parseInt(item.locationId) === parseInt(1)) : [];

  React.useEffect(() => {
    if (itemToEdit && sizeData?.data && colorData?.data) {
      setName(itemToEdit.name || "");
      setCode(itemToEdit.code || "");
      setItemType(itemToEdit.itemType || "");
      setSectionId(itemToEdit.sectionId || "");
      setMainCategory(itemToEdit.mainCategoryId || "");
      setSubCategory(itemToEdit.subCategoryId || "");
      setActive(itemToEdit.active === undefined ? true : itemToEdit.active);

      if (itemToEdit.ItemPriceList) {
        if (effectiveBarcodeGenerationMethod === "STANDARD") {
          setSalesPrice(itemToEdit.ItemPriceList[0]?.salesPrice || "");
          setOfferPrice(itemToEdit.ItemPriceList[0]?.offerPrice || "");
          setSku(itemToEdit.ItemPriceList[0]?.sku || "");
          setBarcode(itemToEdit.ItemPriceList[0]?.barcode || "");
          setItemPriceList(itemToEdit.ItemPriceList?.length ? itemToEdit.ItemPriceList : [createStandardPriceRow()]);
        } else {
          setItemPriceList(itemToEdit.ItemPriceList);
          const uniqueSizes = [...new Set(itemToEdit.ItemPriceList.filter(p => p.sizeId).map(p => p.sizeId))]
            .map(id => {
              const match = sizeData?.data?.find(s => s.id === id);
              return match ? { value: match.id, label: match.name } : null;
            }).filter(Boolean);

          const uniqueColors = [...new Set(itemToEdit.ItemPriceList.filter(p => p.colorId).map(p => p.colorId))]
            .map(id => {
              const match = colorData?.data?.find(c => c.id === id);
              return match ? { value: match.id, label: match.name } : null;
            }).filter(Boolean);

          setSizeList(uniqueSizes);
          setColorList(uniqueColors);
        }
      }
    }
  }, [effectiveBarcodeGenerationMethod, itemToEdit, sizeData, colorData]);

  useEffect(() => {
    if (isOpen && effectiveBarcodeGenerationMethod === "STANDARD" && itemPriceList.length === 0) {
      setItemPriceList([createStandardPriceRow()]);
    }
  }, [isOpen, effectiveBarcodeGenerationMethod, itemPriceList.length]);

  const handleSave = async () => {
    if (!name || !code || !itemType) {
      toast.info("Please fill required fields (Name, Code, Type)");
      return;
    }

    const hasStockAlertErrors = (effectiveBarcodeGenerationMethod === "STANDARD" ? [itemPriceList?.[0]] : itemPriceList)
      .filter(Boolean)
      .some((priceRow) => validateLocationThresholdRows(priceRow?.MinimumStockQty || []).hasErrors);

    if (hasStockAlertErrors) {
      toast.info("Please fix the stock alert rows before saving");
      return;
    }

    try {
      let itemPriceListToSave = [];
      if (effectiveBarcodeGenerationMethod === "STANDARD") {
        itemPriceListToSave = [{
          id: itemPriceList?.[0]?.id,
          sizeId: null,
          colorId: null,
          offerPrice: offerPrice || 0,
          salesPrice: salesPrice || 0,
          sku: sku || "",
          barcode: barcode || "",
          MinimumStockQty: validateLocationThresholdRows(itemPriceList?.[0]?.MinimumStockQty || []).cleanedRows,
        }];
      } else {
        itemPriceListToSave = sanitizePriceRowsForSave(itemPriceList).map(item => ({
          ...item,
          offerPrice: item.offerPrice || 0,
          salesPrice: item.salesPrice || 0,
        }));
      }

      const payload = {
        id: itemToEdit?.id,
        name: name.toUpperCase(),
        code: code.toUpperCase(),
        itemType,
        hsnId: itemToEdit?.hsnId || "",
        sectionId,
        mainCategoryId: mainCategory,
        subCategoryId: subCategory,
        itemPriceList: itemPriceListToSave,
        active,
        companyId: params.companyId,
        branchId: params.branchId,
      };

      const response = itemToEdit
        ? await updateItem(payload).unwrap()
        : await addItem(payload).unwrap();

      if (response.statusCode === 0) {
        toast.success(itemToEdit ? "Item updated successfully" : "Item created successfully");
        onCreated(response.data?.data || response.data || payload);
        onClose();
      } else {
        toast.error(response.message || "Failed to save item");
      }
    } catch (error) {
      console.error("Error creating item:", error);
      toast.error("An error occurred");
    }
  };


  useEffect(() => {
    if (effectiveBarcodeGenerationMethod === "SIZE") {
      setItemPriceList(prev =>
        prev.filter(p => sizeList.some(s => s.value === p.sizeId))
      );
    }

    if (effectiveBarcodeGenerationMethod === "SIZE_COLOR") {
      setItemPriceList(prev =>
        prev.filter(
          p =>
            sizeList.some(s => s.value === p.sizeId) &&
            colorList.some(c => c.value === p.colorId)
        )
      );
    }
  }, [sizeList, colorList, effectiveBarcodeGenerationMethod]);


  const handleAddPriceRows = () => {

    if (effectiveBarcodeGenerationMethod === "SIZE" && sizeList.length === 0) {
      alert("Please select at least one Size");
      return;
    }

    if (effectiveBarcodeGenerationMethod === "SIZE_COLOR") {
      if (sizeList.length === 0) {
        alert("Please select Size");
        return;
      }

      if (colorList.length === 0) {
        alert("Please select Color");
        return;
      }
    }

    setItemPriceList(prev => {
      const newList = [...prev];

      // SIZE METHOD
      if (effectiveBarcodeGenerationMethod === "SIZE") {
        sizeList.forEach(size => {

          const exists = newList.some(
            item => item.sizeId === size.value
          );

          if (!exists) {
            newList.push({
              sizeId: size.value,
              colorId: null,
              salesPrice: 0,
              offerPrice: 0,
              MinimumStockQty: [createEmptyLocationThreshold()]
            });
          }

        });
      }

      // SIZE + COLOR METHOD
      if (effectiveBarcodeGenerationMethod === "SIZE_COLOR") {
        sizeList.forEach(size => {

          colorList.forEach(color => {

            const exists = newList.some(
              item =>
                item.sizeId === size.value &&
                item.colorId === color.value
            );

            if (!exists) {
              newList.push({
                sizeId: size.value,
                colorId: color.value,
                salesPrice: 0,
                offerPrice: 0,
                MinimumStockQty: [createEmptyLocationThreshold()]
              });
            }

          });

        });
      }

      return newList;
    });

  };

  const handleMinimumStockRowsChange = (rowIndex, rows) => {
    setItemPriceList((prev) =>
      prev.map((item, index) =>
        index === rowIndex ? { ...item, MinimumStockQty: rows } : item
      )
    );
  };

  const getLowStockSummary = (item) => {
    const configuredCount = getConfiguredLocationAlertCount(item?.MinimumStockQty || []);
    return configuredCount ? `${configuredCount} locations set` : "No alerts set";
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} widthClass="w-[90%] h-[95%] ">
      <div className="p-4 bg-white rounded-lg shadow-xl">
        <h2 className="text-lg font-bold text-gray-800">{itemToEdit ? "Manage Item" : "Quick Add Item"}</h2>

        <div className="space-y-4 max-h-[70vh] pr-2">
          <fieldset className="border border-gray-300 rounded-lg p-4 bg-white">
            <legend className="px-2 text-sm font-semibold text-gray-700">Item Information</legend>
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-6">
                <TextInputNew1 name="Item Name" value={name} setValue={(v) => setName(v.toUpperCase())} required={true} className="uppercase" />
              </div>
              <div className="col-span-3">
                <TextInputNew1 name="Item Code" value={code} setValue={(v) => setCode(v.toUpperCase())} required={true} className="uppercase" />
              </div>
              <div className="col-span-3">
                <DropdownInput
                  name="Item Type"
                  options={dropDownListObject(ItemTypes, "show", "value")}
                  value={itemType}
                  setValue={setItemType}
                  required={true}
                />
              </div>
              <div className="col-span-3">
                <DropdownInput
                  name="Section Type"
                  options={dropDownListObject(sectionData?.data || [], "name", "id")}
                  value={sectionId}
                  setValue={setSectionId}
                />
              </div>
              <div className="col-span-3">
                <DropdownInput
                  name="Main Category"
                  options={dropDownListObject(itemCategoryData?.data || [], "name", "id")}
                  value={mainCategory}
                  setValue={setMainCategory}
                />
              </div>
              <div className="col-span-3">
                <DropdownInput
                  name="Sub Category"
                  options={dropDownListObject(itemCategoryData?.data?.filter(i => i.id !== mainCategory) || [], "name", "id")}
                  value={subCategory}
                  setValue={setSubCategory}
                  readOnly={!mainCategory}
                />
              </div>
              <div className="col-span-1 flex items-center mt-4">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="w-4 h-4 accent-indigo-600" />
                  <span className="text-xs font-semibold text-gray-700">Active</span>
                </label>
              </div>
            </div>
          </fieldset>

          <fieldset className="border border-gray-300 rounded-lg p-4 bg-white h-[300px] ">
            <legend className="px-2 text-sm font-semibold text-gray-700">Pricing Information</legend>
            <div className="grid grid-cols-12 gap-3 items-end">
              {effectiveBarcodeGenerationMethod === "STANDARD" && (
                <>
                  <div className="col-span-2">
                    <TextInputNew1 name="Barcode" value={barcode} setValue={setBarcode} />
                  </div>
                  <div className="col-span-2">
                    <TextInputNew1 name="SKU" value={sku} setValue={setSku} />
                  </div>
                  <div className="col-span-2">
                    <TextInputNew1 name="Sales Price" value={salesPrice} setValue={setSalesPrice} />
                  </div>
                  <div className="col-span-2">
                    <TextInputNew1 name="Offer Price" value={offerPrice} setValue={setOfferPrice} />
                  </div>
                  <div className="col-span-3 mt-5">
                    <button
                      type="button"
                      onClick={() => setGridIndex((prev) => (prev === 0 ? null : 0))}
                      className="w-full rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 text-left text-xs font-medium text-indigo-700 hover:bg-indigo-100"
                    >
                      Stock Alerts: {getLowStockSummary(itemPriceList?.[0])}
                    </button>
                  </div>
                </>
              )}

              {(effectiveBarcodeGenerationMethod === "SIZE" || effectiveBarcodeGenerationMethod === "SIZE_COLOR") && (
                <div className="col-span-3">
                  <div className="flex items-end gap-1">
                    <div className="flex-1">
                      <MultiSelectDropdownNew
                        name="Sizes"
                        options={multiSelectOption(sizeData?.data || [], "name", "id")}
                        selected={sizeList}
                        setSelected={setSizeList}
                      />
                    </div>
                    <button type="button" onClick={() => setShowSizeModal(true)} className="mb-1 p-1.5 bg-indigo-50 text-indigo-600 rounded-md border border-indigo-200" title="Add New Size">
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              )}

              {effectiveBarcodeGenerationMethod === "SIZE_COLOR" && (
                <div className="col-span-3">
                  <div className="flex items-end gap-1">
                    <div className="flex-1">
                      <MultiSelectDropdownNew
                        name="Colors"
                        options={multiSelectOption(colorData?.data || [], "name", "id")}
                        selected={colorList}
                        setSelected={setColorList}
                      />
                    </div>
                    <button type="button" onClick={() => setShowColorModal(true)} className="mb-1 p-1.5 bg-indigo-50 text-indigo-600 rounded-md border border-indigo-200" title="Add New Color">
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              )}

              {(effectiveBarcodeGenerationMethod !== "STANDARD") && (
                <div className="col-span-1 px-1">
                  <button
                    type="button"
                    onClick={handleAddPriceRows}
                    className="mb-1 px-3 py-1 bg-gray-200 text-gray-800 rounded text-xs font-semibold hover:bg-gray-300 h-8"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            {effectiveBarcodeGenerationMethod === "STANDARD" && gridIndex === 0 && itemPriceList[0] && (
              <div className="mt-4">
                <LocationStockEditor
                  rows={itemPriceList[0]?.MinimumStockQty || []}
                  onChange={(rows) => handleMinimumStockRowsChange(0, rows)}
                  locationOptions={storeOptions?.filter((item) => item.active)}
                  title="Stock Alerts"
                />
              </div>
            )}

            {effectiveBarcodeGenerationMethod !== "STANDARD" && itemPriceList.length > 0 && (
              <div className="mt-4 grid grid-cols-12 gap-3">
                <div className="col-span-8 border rounded flex flex-col h-[220px]">
                  <div className="overflow-y-auto flex-1 h-full">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead className="bg-gray-100 sticky top-0 z-10">
                        <tr>
                          <th className="p-2 border-b w-12 text-center bg-gray-100">S.No</th>
                          <th className="p-2 border-b bg-gray-100">Size Name</th>
                          {effectiveBarcodeGenerationMethod === "SIZE_COLOR" && <th className="p-2 border-b bg-gray-100">Color Name</th>}
                          <th className="p-2 border-b w-32 bg-gray-100">Sales Price</th>
                          <th className="p-2 border-b w-32 bg-gray-100">Offer Price</th>
                          <th className="p-2 border-b w-40 bg-gray-100">Stock Alerts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {itemPriceList.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 border-b">
                            <td className="p-2 text-center border-r">{idx + 1}</td>
                            <td className="p-2 border-r">{findFromList(item.sizeId, sizeData?.data, "name")}</td>
                            {effectiveBarcodeGenerationMethod === "SIZE_COLOR" && <td className="p-2 border-r">{findFromList(item.colorId, colorData?.data, "name")}</td>}
                            <td className="p-1 border-r">
                              <input
                                type="number"
                                value={item.salesPrice}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setItemPriceList(prev => prev.map((p, i) => i === idx ? { ...p, salesPrice: val } : p));
                                }}
                                className="w-full p-1 border rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                              />
                            </td>
                            <td className="p-1 border-r">
                              <input
                                type="number"
                                value={item.offerPrice}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setItemPriceList(prev => prev.map((p, i) => i === idx ? { ...p, offerPrice: val } : p));
                                }}
                                className="w-full p-1 border rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                              />
                            </td>
                            <td className="p-1">
                              <button
                                type="button"
                                onClick={() => setGridIndex((prev) => (prev === idx ? null : idx))}
                                className={`w-full rounded-md border px-2 py-1 text-left ${gridIndex === idx ? "border-indigo-400 bg-indigo-50 text-indigo-700" : "border-gray-200 bg-gray-50 text-gray-700"}`}
                              >
                                {getLowStockSummary(item)}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="col-span-4">
                  {itemPriceList[gridIndex] ? (
                    <LocationStockEditor
                      rows={itemPriceList[gridIndex]?.MinimumStockQty || []}
                      onChange={(rows) => handleMinimumStockRowsChange(gridIndex, rows)}
                      locationOptions={storeOptions?.filter((item) => item.active)}
                      title={`Stock Alerts - ${findFromList(itemPriceList[gridIndex]?.sizeId, sizeData?.data, "name")}${effectiveBarcodeGenerationMethod === "SIZE_COLOR" ? ` / ${findFromList(itemPriceList[gridIndex]?.colorId, colorData?.data, "name")}` : ""}`}
                    />
                  ) : (
                    <div className="flex h-full min-h-[220px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 text-center text-xs text-gray-500">
                      Select a row to edit location-wise stock alerts.
                    </div>
                  )}
                </div>
              </div>
            )}
          </fieldset>
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 border rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700 flex items-center gap-1"
          >
            <Check className="w-4 h-4" />
            Save Item
          </button>
        </div>
      </div>
      {showSizeModal && (
        <QuickAddSizeModal
          isOpen={showSizeModal}
          onClose={() => setShowSizeModal(false)}
          onCreated={(newSize) => {
            setSizeList((prev) => [...prev, { value: newSize.id, label: newSize.name }]);
          }}
        />
      )}
      {showColorModal && (
        <QuickAddColorModal
          isOpen={showColorModal}
          onClose={() => setShowColorModal(false)}
          onCreated={(newColor) => {
            setColorList((prev) => [...prev, { value: newColor.id, label: newColor.name }]);
          }}
        />
      )}
    </Modal>
  );
};

export default QuickAddItemModal;
