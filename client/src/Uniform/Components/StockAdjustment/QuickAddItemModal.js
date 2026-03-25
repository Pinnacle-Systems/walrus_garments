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
import { useGetHsnMasterQuery } from "../../../redux/services/HsnMasterServices";
import { useGetSectionMasterQuery } from "../../../redux/uniformService/SectionMasterService";
import { useGetItemCategoryQuery } from "../../../redux/uniformService/ItemCategoryMasterService";
import { capitalizeFirstLetter, findFromList } from "../../../Utils/helper";

const QuickAddItemModal = ({ isOpen, onClose, itemName, onCreated, itemToEdit }) => {
  const params = getCommonParams();
  const [name, setName] = useState(itemName || "");
  const [code, setCode] = useState(itemName || "");
  const [itemType, setItemType] = useState("");
  const [hsnId, setHsnId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [mainCategory, setMainCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [priceMethod, setPriceMethod] = useState("STANDARD");
  const [salesPrice, setSalesPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [minStockQty, setMinStockQty] = useState("");
  const [sizeList, setSizeList] = useState([]);
  const [colorList, setColorList] = useState([]);
  const [itemPriceList, setItemPriceList] = useState([]);
  const [active, setActive] = useState(true);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [showColorModal, setShowColorModal] = useState(false);

  const [addItem] = useAddItemMasterMutation();
  const [updateItem] = useUpdateItemMasterMutation();
  const { data: sizeData } = useGetSizeMasterQuery({ params });
  const { data: colorData } = useGetColorMasterQuery({ params });
  const { data: hsnData } = useGetHsnMasterQuery({ params });
  const { data: sectionData } = useGetSectionMasterQuery({ params });
  const { data: itemCategoryData } = useGetItemCategoryQuery({ params });

  React.useEffect(() => {
    if (itemToEdit && sizeData?.data && colorData?.data) {
      setName(itemToEdit.name || "");
      setCode(itemToEdit.code || "");
      setItemType(itemToEdit.itemType || "");
      setHsnId(itemToEdit.hsnId || "");
      setSectionId(itemToEdit.sectionId || "");
      setMainCategory(itemToEdit.mainCategoryId || "");
      setSubCategory(itemToEdit.subCategoryId || "");
      setPriceMethod(itemToEdit.priceMethod || "STANDARD");
      setActive(itemToEdit.active === undefined ? true : itemToEdit.active);

      if (itemToEdit.ItemPriceList) {
        if (itemToEdit.priceMethod === "STANDARD") {
          setSalesPrice(itemToEdit.ItemPriceList[0]?.salesPrice || "");
          setOfferPrice(itemToEdit.ItemPriceList[0]?.offerPrice || "");
          setMinStockQty(itemToEdit.ItemPriceList[0]?.minStockQty || "");
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
  }, [itemToEdit, sizeData, colorData]);

  const handleSave = async () => {
    if (!name || !code || !itemType) {
      toast.info("Please fill required fields (Name, Code, Type)");
      return;
    }

    if (priceMethod !== "STANDARD" && sizeList.length === 0) {
      toast.info("Please select at least one size");
      return;
    }

    if (priceMethod === "SIZE_COLOR" && colorList.length === 0) {
      toast.info("Please select at least one color");
      return;
    }

    try {
      let itemPriceListToSave = [];
      if (priceMethod === "STANDARD") {
        itemPriceListToSave = [{
          sizeId: null,
          colorId: null,
          offerPrice: offerPrice || 0,
          salesPrice: salesPrice || 0,
          minStockQty: minStockQty || 0
        }];
      } else {
        itemPriceListToSave = itemPriceList.map(item => ({
          ...item,
          offerPrice: item.offerPrice || 0,
          salesPrice: item.salesPrice || 0,
          minStockQty: item.minStockQty || 0
        }));
      }

      const payload = {
        id: itemToEdit?.id,
        name: name.toUpperCase(),
        code: code.toUpperCase(),
        itemType,
        hsnId,
        sectionId,
        mainCategoryId: mainCategory,
        subCategoryId: subCategory,
        priceMethod,
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
    if (priceMethod === "SIZE") {
      setItemPriceList(prev =>
        prev.filter(p => sizeList.some(s => s.value === p.sizeId))
      );
    }

    if (priceMethod === "SIZE_COLOR") {
      setItemPriceList(prev =>
        prev.filter(
          p =>
            sizeList.some(s => s.value === p.sizeId) &&
            colorList.some(c => c.value === p.colorId)
        )
      );
    }
  }, [sizeList, colorList, priceMethod]);


  const handleAddPriceRows = () => {

    if (priceMethod === "SIZE" && sizeList.length === 0) {
      alert("Please select at least one Size");
      return;
    }

    if (priceMethod === "SIZE_COLOR") {
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
      if (priceMethod === "SIZE") {
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
              minStockQty: 0
            });
          }

        });
      }

      // SIZE + COLOR METHOD
      if (priceMethod === "SIZE_COLOR") {
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
                minStockQty: 0
              });
            }

          });

        });
      }

      return newList;
    });

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
              <div className="col-span-2">
                <DropdownInput
                  name="HSN"
                  options={dropDownListObject(hsnData?.data || [], "name", "id")}
                  value={hsnId}
                  setValue={setHsnId}
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
              <div className="col-span-4  ">
                <DropdownInput
                  name="Price Method"
                  options={[
                    { show: "STANDARD", value: "STANDARD" },
                    { show: "SIZE WISE", value: "SIZE" },
                    { show: "SIZE AND COLOR WISE", value: "SIZE_COLOR" },
                  ]}
                  value={priceMethod}
                  setValue={(val) => {
                    // if (priceMethod === "SIZE" && val === "SIZE_COLOR") {
                    //   // Convert existing size data to size + color
                    //   setItemPriceList(prev => {
                    //     const newList = [];

                    //     prev.forEach(p => {
                    //       colorList.forEach(c => {
                    //         const exists = newList.find(
                    //           n => n.sizeId === p.sizeId && n.colorId === c.value
                    //         );

                    //         if (!exists) {
                    //           newList.push({
                    //             sizeId: p.sizeId,
                    //             colorId: c.value,
                    //             salesPrice: p.salesPrice,
                    //             offerPrice: p.offerPrice,
                    //             minStockQty: p.minStockQty,
                    //           });
                    //         }
                    //       });
                    //     });

                    //     return newList;
                    //   });
                    // }

                    setPriceMethod(val);
                  }}
                  required={true}
                />
              </div>

              {priceMethod === "STANDARD" && (
                <>
                  <div className="col-span-2">
                    <TextInputNew1 name="Sales Price" value={salesPrice} setValue={setSalesPrice} />
                  </div>
                  <div className="col-span-2">
                    <TextInputNew1 name="Offer Price" value={offerPrice} setValue={setOfferPrice} />
                  </div>
                  <div className="col-span-2">
                    <TextInputNew1 name="Min Stock Qty" value={minStockQty} setValue={setMinStockQty} />
                  </div>
                </>
              )}

              {(priceMethod === "SIZE" || priceMethod === "SIZE_COLOR") && (
                <div className="col-span-3">
                  <div className="flex items-end gap-1">
                    <div className="flex-1">
                      <MultiSelectDropdownNew
                        name="Sizes"
                        required={true}
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

              {priceMethod === "SIZE_COLOR" && (
                <div className="col-span-3">
                  <div className="flex items-end gap-1">
                    <div className="flex-1">
                      <MultiSelectDropdownNew
                        name="Colors"
                        required={true}
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

              {(priceMethod !== "STANDARD") && (
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

            {priceMethod !== "STANDARD" && itemPriceList.length > 0 && (
              <div className="mt-4 border rounded  flex flex-col h-[180px]">
                <div className="overflow-y-auto flex-1 h-full">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-gray-100 sticky top-0 z-10">
                      <tr>
                        <th className="p-2 border-b w-12 text-center bg-gray-100">S.No</th>
                        <th className="p-2 border-b bg-gray-100">Size Name</th>
                        {priceMethod === "SIZE_COLOR" && <th className="p-2 border-b bg-gray-100">Color Name</th>}
                        <th className="p-2 border-b w-32 bg-gray-100">Sales Price</th>
                        <th className="p-2 border-b w-32 bg-gray-100">Offer Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemPriceList.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 border-b">
                          <td className="p-2 text-center border-r">{idx + 1}</td>
                          <td className="p-2 border-r">{findFromList(item.sizeId, sizeData?.data, "name")}</td>
                          {priceMethod === "SIZE_COLOR" && <td className="p-2 border-r">{findFromList(item.colorId, colorData?.data, "name")}</td>}
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
                          <td className="p-1">
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
