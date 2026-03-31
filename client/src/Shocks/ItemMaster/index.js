
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAddItemMasterMutation, useDeleteItemMasterMutation, useGetItemMasterByIdQuery, useGetItemMasterQuery, useUpdateItemMasterMutation } from "../../redux/uniformService/ItemMasterService";
import secureLocalStorage from "react-secure-storage";
import Swal from "sweetalert2";
import useInvalidateTags from '../../CustomHooks/useInvalidateTags';
import { Check, Power, Plus } from "lucide-react";
import { DropdownInput, PriceInputWithTax, ReusableTable, TextInputNew1, ToggleButton, MultiSelectDropdownNew, childRecordCount } from "../../Inputs";
import Modal from "../../UiComponents/Modal";
import { ItemTypes, statusDropdown } from "../../Utils/DropdownData";
import { dropDownListObject, multiSelectOption } from "../../Utils/contructObject";
import { useGetStyleMasterQuery } from "../../redux/uniformService/StyleMasterService";
import { useGetSizeMasterQuery } from "../../redux/uniformService/SizeMasterService";
import { useGetHsnMasterQuery } from "../../redux/services/HsnMasterServices";
import { useGetColorMasterQuery } from "../../redux/uniformService/ColorMasterService";
import { capitalizeFirstLetter, findFromList, resolveBarcodeGenerationMethod } from "../../Utils/helper";
import { useGetSectionMasterQuery } from "../../redux/uniformService/SectionMasterService";
import { useGetLocationMasterQuery } from "../../redux/uniformService/LocationMasterServices";
import { useGetItemControlPanelMasterQuery } from "../../redux/uniformService/ItemControlPanelService";
import { useGetItemCategoryQuery } from "../../redux/uniformService/ItemCategoryMasterService";
import QuickAddSizeModal from "./QuickAddSizeModal";
import QuickAddColorModal from "./QuickAddColorModal";
import LocationStockEditor, { createEmptyLocationThreshold, getConfiguredLocationAlertCount, validateLocationThresholdRows } from "./LocationStockEditor";

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

export default function Form() {
  const [form, setForm] = useState(false);

  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [styleId, setStyleId] = useState("");
  const [sizeId, setSizeId] = useState("");

  const [active, setActive] = useState(false);
  const [aliasName, setAliasName] = useState("");
  const [code, setCode] = useState("");
  const [hsnId, setHsnId] = useState('')
  const [salesPrice, setSalesPrice] = useState("")


  const [purchasePrice, setPurchasePrice] = useState('')
  const [offerPrice, setOfferPrice] = useState('')

  const [salesTaxType, setSalesTaxType] = useState("")
  const [purchaseTaxType, setPurchaseTaxType] = useState("")
  const [itemType, setItemType] = useState('')
  const [searchValue, setSearchValue] = useState("");
  const [sizeList, setSizeList] = useState([])
  const [colorList, setColorList] = useState([])
  const childRecord = useRef(0);
  const [itemPriceList, setItemPriceList] = useState([])
  const [sectionId, setSectionId] = useState('')
  const [gridIndex, setGridIndex] = useState();
  const [fields, setFields] = useState({});
  const [contextMenu, setContextMenu] = useState(null);
  const [mainCategory, setMainCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [showColorModal, setShowColorModal] = useState(false);
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");

  const params = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
    branchId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "branchId"
    ),
  };

  const {
    data: allData,
    isLoading,
    isFetching,
  } = useGetItemMasterQuery({ params, searchParams: searchValue });


  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetItemMasterByIdQuery(id, { skip: !id });



  const [addData] = useAddItemMasterMutation();
  const [updateData] = useUpdateItemMasterMutation();
  const [removeData] = useDeleteItemMasterMutation();
  const [dispatchInvalidate] = useInvalidateTags();


  const {
    data: styleData,
  } = useGetStyleMasterQuery({ params, searchParams: searchValue });
  const {
    data: sizeData,
  } = useGetSizeMasterQuery({ params, searchParams: searchValue });

  const {
    data: colorData,
  } = useGetColorMasterQuery({ params, searchParams: searchValue });


  const {
    data: hsnData,
  } = useGetHsnMasterQuery({ params, searchParams: searchValue });

  const {
    data: sectionData,
  } = useGetSectionMasterQuery({ params, searchParams: searchValue });

  const {
    data: itemCategoryData,
  } = useGetItemCategoryQuery({ params, searchParams: searchValue });


  const {
    data: locationData,
  } = useGetLocationMasterQuery({ params, searchParams: searchValue });

  const storeOptions = locationData ?
    locationData?.data?.filter(item => parseInt(item.locationId) === parseInt(1)) :
    [];



  const {
    data: itemControlData, isFetching: itemControlFetching, isLoading: itemControlLoading
  } = useGetItemControlPanelMasterQuery({ params, searchParams: searchValue });


  const AccessItemsColums = itemControlData?.data?.[0];
  const barcodeGenerationMethod = resolveBarcodeGenerationMethod(AccessItemsColums);


  const syncFormWithDb = useCallback(
    (data) => {
      if (!id) {
        setStyleId(data?.styleId ? data?.styleId : "")
        setSizeId(data?.sizeId ? data?.sizeId : "")
        setName(data?.name ? data?.name : "")
        setCode(data?.cose ? data?.code : "")
        setItemType(data?.itemType ? data?.itemType : "")
        setHsnId(data?.hsnId ? data?.hsnId : "")
        setPurchasePrice(data?.purchasePrice ? data?.purchasePrice : "")
        setPurchaseTaxType(data?.purchaseTaxType ? data?.purchaseTaxType : "")
        setSalesPrice(data?.salesPrice ? data?.salesPrice : "")
        setSalesTaxType(data?.salesTaxType ? data?.salesTaxType : "")
        setActive(data?.active ? data?.active : true)
        setSectionId(data?.sectionId ? data?.sectionId : "")
        setOfferPrice(data?.offerPrice ? data?.offerPrice : "")
        setSku("")
        setBarcode("")
        setItemPriceList(barcodeGenerationMethod === "STANDARD" ? [createStandardPriceRow()] : [])

      } else {
        setName(data?.name ? data?.name : "")
        setCode(data?.code ? data?.code : "")
        setItemType(data?.itemType ? data?.itemType : "")
        setHsnId(data?.hsnId ? data?.hsnId : "")
        setSizeId(data?.sizeId ? data?.sizeId : "")
        setPurchasePrice(data?.purchasePrice ? data?.purchasePrice : "")
        setPurchaseTaxType(data?.purchaseTaxType ? data?.purchaseTaxType : "")
        setSalesPrice(data?.salesPrice ? data?.salesPrice : "")
        setSalesTaxType(data?.salesTaxType ? data?.salesTaxType : "")
        setActive(data?.active ? data?.active : true)
        setSectionId(data?.sectionId ? data?.sectionId : "")
        setOfferPrice(data?.offerPrice ? data?.offerPrice : "")
        setMainCategory(data?.mainCategoryId ? data?.mainCategoryId : "")
        setSubCategory(data?.subCategoryId ? data?.subCategoryId : "")

        const initialState = {};
        itemControlData?.data?.forEach((i) => {

          Object.keys(i)?.filter(key => key.toLowerCase().includes("field") && key !== "id" && !!i[key])?.map(key => {
            console.log(Object.keys(i), 'Object.keys(i)')
            initialState[i[key]] = data?.[key];
          })
        })

        setFields(initialState)








        if (barcodeGenerationMethod === "STANDARD") {
          setOfferPrice(data?.ItemPriceList?.[0]?.offerPrice ? data?.ItemPriceList?.[0]?.offerPrice : "")
          setSalesPrice(data?.ItemPriceList?.[0]?.salesPrice ? data?.ItemPriceList?.[0]?.salesPrice : "")
          setSku(data?.ItemPriceList?.[0]?.sku ? data?.ItemPriceList?.[0]?.sku : "")
          setBarcode(data?.ItemPriceList?.[0]?.barcode ? data?.ItemPriceList?.[0]?.barcode : "")
          setItemPriceList(data?.ItemPriceList?.length ? data?.ItemPriceList : [createStandardPriceRow()])

        } else {
          setItemPriceList(data?.ItemPriceList ? data?.ItemPriceList : [])
          const uniqueSizes = [...new Set(data?.ItemPriceList?.map(item => item.sizeId))];

          const uniqueColors = [...new Set(data?.ItemPriceList?.map(item => item.colorId))];
          setSizeList(
            uniqueSizes
              ? uniqueSizes?.map((item) => {
                return {
                  value: item,
                  label: findFromList(item, sizeData?.data, "name"),

                };
              })
              : []
          );
          setColorList(
            uniqueColors
              ? uniqueColors?.map((item) => {
                return {
                  value: item,
                  label: findFromList(item, colorData?.data, "name"),

                };
              })
              : []
          );
        }
      }
    },
    [barcodeGenerationMethod, id, itemControlData?.data, sizeData?.data, colorData?.data]
  );

  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const data = {
    id,
    styleId,
    sizeId,
    name,
    code,
    itemType,
    hsnId,
    active,
    itemPriceList: barcodeGenerationMethod === "STANDARD" ?
      [{
        id: itemPriceList?.[0]?.id,
        itemId: itemPriceList?.[0]?.itemId,
        sizeId: null,
        colorId: null,
        offerPrice,
        salesPrice,
        sku: sku?.trim() || "",
        barcode: barcode?.trim() || "",
        MinimumStockQty: validateLocationThresholdRows(itemPriceList?.[0]?.MinimumStockQty || []).cleanedRows
      }] :
      sanitizePriceRowsForSave(itemPriceList),
    sectionId,
    fields: Object.values(fields),
    mainCategory,
    subCategory

  };

  const validateData = (data) => {
    if (!data.name || !data?.code || !data?.hsnId || !data?.mainCategory) {
      return false;
    }

    if (barcodeGenerationMethod === "STANDARD") {
      const standardPrice = data?.itemPriceList?.[0];
      if (!standardPrice?.barcode?.trim() || !standardPrice?.sku?.trim() || !standardPrice?.salesPrice?.trim()) {
        return false;
      }
    }

    const hasStockAlertErrors = (barcodeGenerationMethod === "STANDARD" ? [itemPriceList?.[0]] : itemPriceList)
      .filter(Boolean)
      .some((priceRow) => validateLocationThresholdRows(priceRow?.MinimumStockQty || []).hasErrors);

    if (hasStockAlertErrors) {
      return false;
    }

    if (data.name && data?.code) {
      return true;
    }
    return false;
  };

  const handleSubmitCustom = async (callback, data, text, nextProcess) => {
    try {
      let returnData;
      if (text === "Updated") {
        returnData = await callback(data).unwrap();
      } else {
        returnData = await callback(data).unwrap();
      }
      if (returnData?.statusCode === 1) {
        Swal.fire({
          icon: "warning",
          title: returnData?.message || "Unable to save item",
        });
        return;
      }
      setId(returnData.data.id);
      dispatchInvalidate();
      Swal.fire({
        title: text + "  " + "Successfully",
        icon: "success",
        draggable: true,
        timer: 1000,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      console.log(nextProcess, 'nextProcess')
      if (nextProcess == "new") {
        syncFormWithDb(undefined)
        onNew()
      } else {
        setForm(false)
      }
    } catch (error) {
      console.log("handle");
    }
  };

  const saveData = (nextProcess) => {

    // if price method === standard
    //  data = {...data, itemPricelist: [sizeId: null, colorId: null, purchasePrice, salesPrice]}


    let foundItem;
    if (id) {
      foundItem = allData?.data
        ?.filter((i) => i.id !== id)
        ?.some(
          (item) =>
            item.name?.trim().toLowerCase() === name?.trim().toLowerCase()
        );
    } else {
      foundItem = allData?.data?.some(
        (item) => item.name?.trim().toLowerCase() === name?.trim().toLowerCase()
      );
    }


    if (!validateData(data)) {
      const hasStockAlertErrors = (barcodeGenerationMethod === "STANDARD" ? [itemPriceList?.[0]] : itemPriceList)
        .filter(Boolean)
        .some((priceRow) => validateLocationThresholdRows(priceRow?.MinimumStockQty || []).hasErrors);
      Swal.fire({
        title: hasStockAlertErrors ? "Please fix the stock alert rows before saving." : "Please fill all required fields...!",
        icon: "warning",
        timer: 1000,
      });
      return;
    }

    if (itemPriceList?.length <= 0) {
      Swal.fire({
        text: "Please Fill The Item Priceing Information ",
        icon: "warning",
        timer: 1500,
        showConfirmButton: false,
      });
      return false;

    }


    if (itemPriceList?.filter(i => i.sizeId == null && i.colorId == null)?.length > 1) {
      Swal.fire({
        text: "Please select only one size and color.",
        icon: "warning",
        timer: 1500,
        showConfirmButton: false,
      });
      return false;
    }



    if (foundItem) {
      Swal.fire({
        text: "The Item Name already exists.",
        icon: "warning",
        timer: 1500,
        showConfirmButton: false,
      });
      return false;
    }
    if (id) {
      if (!window.confirm("Are you sure update the details ...?")) {
        return;
      }
    }
    if (id) {
      handleSubmitCustom(updateData, data, "Updated", nextProcess);
    } else {
      handleSubmitCustom(addData, data, "Added", nextProcess);
    }
  };

  const handleDelete = async (id, childRecord) => {
    // if (childRecordCount(childRecord)) {
    //   Swal.fire({
    //     icon: "error",
    //     title: "Child record Exists",
    //   });
    //   return;
    // }
    if (id) {
      if (!window.confirm("Are you sure to delete...?")) {
        return;
      }
      if (data?.data?.childRecord > 0) {
        Swal.fire({
          icon: "error",
          title: "Child record Exists",
          text: "Data cannot be deleted!",
        });
      } else {
        try {
          let deldata = await removeData(id).unwrap();
          if (deldata?.statusCode == 1) {
            Swal.fire({
              icon: "error",
              title: deldata?.message || "Data cannot be deleted!",
            });
            return;
          }
          setId("");
          dispatchInvalidate();
          Swal.fire({
            title: "Deleted Successfully",
            icon: "success",
            timer: 1000,
          });
          setForm(false);
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Submission error",
            text: error.data?.message || "Something went wrong!",
          });
          setForm(false);
        }
      }
    }
  };

  const handleKeyDown = (event) => {
    let charCode = String.fromCharCode(event.which).toLowerCase();
    if ((event.ctrlKey || event.metaKey) && charCode === "s") {
      event.preventDefault();
      saveData();
    }
  };

  const onNew = () => {
    setId("");
    setForm(true);
    setSearchValue("");
    syncFormWithDb(undefined);
    setReadOnly(false);
    setSizeList([]);
    setColorList([]);
    setGridIndex(null);
    setItemPriceList(barcodeGenerationMethod === "STANDARD" ? [createStandardPriceRow()] : []);
  };

  const ACTIVE = (
    <div className="bg-gradient-to-r from-green-200 to-green-500 inline-flex items-center justify-center rounded-full border-2 w-6 border-green-500 shadow-lg text-white hover:scale-110 transition-transform duration-300">
      <Power size={10} />
    </div>
  );
  const INACTIVE = (
    <div className="bg-gradient-to-r from-red-200 to-red-500 inline-flex items-center justify-center rounded-full border-2 w-6 border-red-500 shadow-lg text-white hover:scale-110 transition-transform duration-300">
      <Power size={10} />
    </div>
  );

  const columns = [
    {
      header: "S.No",
      accessor: (item, index) => parseInt(index) + parseInt(1),
      className: "font-medium text-gray-900 text-center w-[10px] py-1",
      search: "",
    },
    {
      header: "Item Name",
      accessor: (item) => item.name,
      className: "font-medium text-gray-900  w-[200px]  py-1  px-2",
      search: "Item Name",
    },
    {
      header: "Item Code",
      accessor: (item) => item.code,
      className: "font-medium text-gray-900  w-[150px]  py-1  px-2",
      search: "Item Code",
    },
    {
      header: "Status",
      accessor: (item) => (item.active ? ACTIVE : INACTIVE),
      className: "font-medium text-gray-900 text-center w-[10px] py-1",
      search: "",
    },
  ];

  const handleView = (id) => {
    setId(id);
    setForm(true);
    setReadOnly(true);
  };

  const handleEdit = (id) => {
    setId(id);
    setForm(true);
    setReadOnly(false);
  };




  function handleInputChange(value, index, field) {
    setItemPriceList(orderDetails => {
      const newBlend = structuredClone(orderDetails);
      newBlend[index][field] = value;
      return newBlend
    }
    );
  };

  function handleMinimumStockRowsChange(rowIndex, rows) {
    setItemPriceList(orderDetails => {
      const newBlend = structuredClone(orderDetails);
      if (!newBlend[rowIndex]) {
        return orderDetails;
      }
      newBlend[rowIndex].MinimumStockQty = rows;
      return newBlend;
    });
  };

  function getLowStockSummary(item) {
    const configuredCount = getConfiguredLocationAlertCount(item?.MinimumStockQty || []);
    return configuredCount ? `${configuredCount} locations set` : "No alerts set";
  }






  console.log(itemPriceList, "itemPriceList");

  const generateBarcodeValue = (code, sizeName, item) => {
    const colorCode = findFromList(item?.colorId, colorData?.data, "code") ?? "00"
    const shortName = code
      ?.replace(/\s+/g, "")   // remove spaces
      ?.toUpperCase()
      ?.slice(0, 4) || "";

    return `WR${shortName}${sizeName?.toUpperCase() || ""}${colorCode?.toUpperCase() || ""}`;
  };

  function setItems() {
    if (!sizeList?.length) return;

    const newCombinations = colorList?.length
      ? sizeList.flatMap(size =>
        colorList.map(color => ({
          sizeId: size.value === "null" ? null : parseInt(size.value) || size.value,
          sizeName: size.label,
          colorId: color.value === "null" ? null : parseInt(color.value) || color.value,
          colorName: color.label
        })))
      : sizeList.map(size => ({
        sizeId: size.value === "null" ? null : parseInt(size.value) || size.value,
        sizeName: size.label,
        colorId: null,
        colorName: null
      }));

    // For comparison, use string keys
    const newCombinationKeys = newCombinations.map(c => `${c.sizeId}-${c.colorId}`);

    if (id) {
      const existingCombinationsKeys = itemPriceList.map(item => `${item.sizeId}-${item.colorId}`);
      const removedCombinations = existingCombinationsKeys.filter(key => !newCombinationKeys.includes(key));

      if (removedCombinations.length) {
        if (!window.confirm("Changing size/color will remove existing price details for the removed combinations. Do you want to proceed?")) {
          return;
        }
      }

      const updatedList = newCombinations.map(combo => {
        const existing = itemPriceList.find(item => String(item.sizeId) === String(combo.sizeId) && String(item.colorId) === String(combo.colorId));

        if (existing) {
          // Update barcode but keep prices and other data
          return {
            ...existing,
            barcode: generateBarcodeValue(code, existing.sizeName, existing)
          };
        } else {
          // New combination
          const newItem = {
            sizeId: combo.sizeId,
            sizeName: combo.sizeName,
            colorId: combo.colorId,
            colorName: combo.colorName,
            purchasePrice: 0,
            salesPrice: 0,
            MinimumStockQty: [createEmptyLocationThreshold()]
          };
          return {
            ...newItem,
            barcode: generateBarcodeValue(code, combo.sizeName, newItem)
          };
        }
      });
      setItemPriceList(updatedList);
    } else {
      const itemPriceArray = newCombinations.map(combo => {
        const newItem = {
          sizeId: combo.sizeId,
          sizeName: combo.sizeName,
          colorId: combo.colorId,
          colorName: combo.colorName,
          purchasePrice: 0,
          salesPrice: 0,
          MinimumStockQty: [createEmptyLocationThreshold()]
        };
        return {
          ...newItem,
          barcode: generateBarcodeValue(code, combo.sizeName, newItem)
        };
      });
      setItemPriceList(itemPriceArray);
    }
  }

  const handleRightSubGridClick = (event, rowIndex, type) => {
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
    console.log(id, "idddddddddddddddd");

    setItemPriceList((prevItemPriceList) => {
      console.log(prevItemPriceList, "prevItemPriceList");
      return prevItemPriceList?.filter((_, index) => index !== id);
    });
  };


  const firstInputFocus = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    if (form && formRef.current) {
      const firstInput = formRef.current.querySelector('input');
      if (firstInput) firstInput.focus();
    }
  }, [form]);

  const handleNameChange = (val) => setName(val ? val.charAt(0).toUpperCase() + val.slice(1) : val);
  useEffect(() => {
    if (!itemControlData?.data?.length) return;

    const initialState = {};
    itemControlData?.data?.forEach((i) => {
      console.log(Object.keys(i)?.filter(key => key.toLowerCase().includes("field") && !!i[key]), "keys");

      Object.keys(i)?.filter(key => key.toLowerCase().includes("field") && !!i[key])?.map(key => {
        initialState[i[key]] = "";

      })
    })
    // console.log(initialState, "initialState");

    setFields(initialState);
  }, [itemControlData, itemControlLoading, itemControlFetching]);

  useEffect(() => {
    if (form && barcodeGenerationMethod === "STANDARD" && itemPriceList.length === 0) {
      setItemPriceList([createStandardPriceRow()]);
    }
  }, [form, barcodeGenerationMethod, itemPriceList.length]);


  return (
    <div onKeyDown={handleKeyDown} className="p-1">
      <div className="w-full flex bg-white p-1 justify-between  items-center">
        <h5 className="text-xl font-bold font-segoe text-gray-800 ">
          Item Master
        </h5>
        <div className="flex items-center">
          <button
            onClick={() => {
              setForm(true);
              onNew();
            }}
            className="bg-white border  border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-sm px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
          >
            + Add New Item
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-3">
        <ReusableTable
          columns={columns}
          data={allData?.data || []}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          itemsPerPage={15}
        />
      </div>
      {form && (
        <Modal
          isOpen={form}
          form={form}
          widthClass={"w-[90%] h-[95%]"}
          onClose={() => {
            setForm(false);
          }}
        >
          <div className="h-full flex flex-col bg-gray-200">
            <div className="border-b py-2 px-4 mt-4 mx-3 flex justify-between items-center sticky top-0 z-10 bg-white">
              <div className="flex items-center gap-2">
                <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
                  {id
                    ? !readOnly
                      ? "Edit Item"
                      : "Item Master"
                    : "Add New Item"}
                </h2>
              </div>
              <div className="flex gap-2">
                <div>
                  {readOnly && (
                    <button
                      type="button"
                      onClick={() => {
                        setForm(false);
                        setSearchValue("");
                        setId(false);
                      }}
                      className="px-3 py-1 text-red-600 hover:bg-red-600 hover:text-white border border-red-600 text-xs rounded"
                    >
                      Cancel
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => {
                        saveData("close")
                      }}
                      className="px-3 py-1 hover:bg-blue-600 hover:text-white rounded text-blue-600 
                  border border-blue-600 flex items-center gap-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-blue-600"
                    >
                      <Check size={14} />
                      {id ? "Update" : "Save & close"}
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  {(!readOnly && !id) && (
                    <button
                      type="button"
                      onClick={() => {
                        saveData("new")
                      }}

                      className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
                  border border-green-600 flex items-center gap-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-green-600"
                    >
                      <Check size={14} />
                      {"Save & New"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-3">
              <div ref={formRef} className="bg-gray-50 p-2 rounded-lg h-full space-y-4">

                <fieldset className="border border-gray-300 rounded-lg p-2 bg-white h-full">
                  <legend className="px-2 text-sm font-semibold text-gray-700">
                    Item Information
                  </legend>

                  <div className="grid grid-cols-12 gap-4 ">



                    <div className="col-span-4">
                      <TextInputNew1
                        name="Item Name"
                        value={name}
                        setValue={handleNameChange}
                        required
                        readOnly={readOnly}
                        disabled={childRecord.current > 0}
                        ref={firstInputFocus}
                      />
                    </div>

                    <div className="col-span-2">
                      <TextInputNew1
                        name="Item Code"
                        value={code}
                        setValue={setCode}
                        readOnly={readOnly}
                        disabled={childRecord.current > 0}
                        required={true}
                      />
                    </div>






                    <div className="col-span-1">
                      <DropdownInput
                        name="HSN"
                        options={dropDownListObject(
                          id ? hsnData?.data : hsnData?.data?.filter(item => item.active),
                          "name",
                          "id"
                        )}
                        value={hsnId}
                        setValue={setHsnId}
                        required
                        readOnly={readOnly}
                        disabled={childRecord.current > 0}
                      />
                    </div>

                    {AccessItemsColums?.sectionType && (
                      <>
                        <div className="col-span-2">
                          <DropdownInput
                            name="Section Type"
                            options={dropDownListObject(
                              id ? sectionData?.data : sectionData?.data?.filter(item => item.active),
                              "name",
                              "id"
                            )}
                            value={sectionId}
                            setValue={setSectionId}
                            required
                            readOnly={readOnly}
                            disabled={childRecord.current > 0}
                          />
                        </div>

                      </>
                    )}



                    <div className="col-span-2">
                      <DropdownInput
                        name="Item Category"
                        options={dropDownListObject(
                          id ? itemCategoryData?.data : itemCategoryData?.data?.filter(item => item.active),
                          "name",
                          "id"
                        )}
                        value={mainCategory}
                        setValue={setMainCategory}
                        required
                        readOnly={readOnly}
                        disabled={childRecord.current > 0}
                      />
                    </div>
                    {/* <div className="col-span-2">
                      <DropdownInput
                        name="Sub Category"
                        options={dropDownListObject(
                          id ? itemCategoryData?.data?.filter(item => item.id != mainCategory) : itemCategoryData?.data?.filter(item => item.active && item.id != mainCategory),
                          "name",
                          "id"
                        )}
                        value={subCategory}
                        setValue={setSubCategory}
                        required
                        readOnly={readOnly || !mainCategory}
                        disabled={childRecord.current > 0}
                      />
                    </div> */}



                    {/* <div className="col-span-2">

                    </div> */}

                    {Object.keys(fields).map((key) => (
                      <div
                        key={key}
                        className={`${key.toLowerCase() === "description"
                          ? "col-span-4"
                          : "col-span-2"
                          }`}
                      >
                        <TextInputNew1
                          name={capitalizeFirstLetter(key)}
                          value={fields[key]}
                          setValue={(val) =>
                            setFields((prev) => ({
                              ...prev,
                              [key]: val,
                            }))
                          }
                          width="w-full px-2"
                        />
                      </div>
                    ))}
                    <div className="col-span-1 mt-5">
                      <ToggleButton name="Status" options={statusDropdown} value={active} setActive={setActive} required={true} readOnly={readOnly} />
                    </div>


                    <fieldset className="col-span-12 border border-gray-300 rounded-lg h-[380px]">
                      <legend className="px-2 text-sm font-semibold text-gray-700">
                        Pricing Information
                      </legend>

                      <div>
                        <div className="grid grid-cols-12 gap-4 px-2">
                          {barcodeGenerationMethod == "STANDARD" && (
                            <>
                              <div className="col-span-2">
                                <TextInputNew1
                                  name="Barcode"
                                  value={barcode}
                                  setValue={setBarcode}
                                  readOnly={readOnly}
                                  disabled={childRecord.current > 0}
                                  required={true}
                                />
                              </div>
                              <div className="col-span-2">
                                <TextInputNew1
                                  name="Sku"
                                  value={sku}
                                  setValue={setSku}
                                  readOnly={readOnly}
                                  disabled={childRecord.current > 0}
                                  required={true}
                                />
                              </div>
                              <div className="col-span-2">
                                <TextInputNew1
                                  name="Sales Price"
                                  value={salesPrice}
                                  setValue={setSalesPrice}
                                  readOnly={readOnly}
                                  disabled={childRecord.current > 0}
                                  required={true}
                                />
                              </div>
                              <div className="col-span-2">
                                <TextInputNew1
                                  name="Offer Price"
                                  value={offerPrice}
                                  setValue={setOfferPrice}
                                  readOnly={readOnly}
                                  disabled={childRecord.current > 0}
                                />
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

                          {(barcodeGenerationMethod == "SIZE" || barcodeGenerationMethod == "SIZE_COLOR") && (
                            <div className="col-span-3">
                              <div className="flex items-end gap-1">
                                <div className="flex-1">
                                  <MultiSelectDropdownNew
                                    name="Sizes"
                                    required={true}
                                    disabled={readOnly}
                                    options={multiSelectOption(id ? sizeData?.data : sizeData?.data?.filter(i => i.active) || [], "name", "id")}
                                    selected={sizeList}
                                    setSelected={(value) => {
                                      setSizeList(value)
                                    }}
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setShowSizeModal(true)}
                                  className="mb-1 p-1.5 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 border border-indigo-200"
                                  title="Add New Size"
                                >
                                  <Plus size={16} />
                                </button>
                              </div>
                            </div>
                          )}

                          {(barcodeGenerationMethod == "SIZE_COLOR") && (
                            <div className="col-span-3">
                              <div className="flex items-end gap-1">
                                <div className="flex-1">
                                  <MultiSelectDropdownNew
                                    name="Colors"
                                    required={true}
                                    disabled={readOnly}
                                    options={multiSelectOption(id ? colorData?.data : colorData?.data?.filter(i => i.active) || [], "name", "id")}
                                    selected={colorList}
                                    setSelected={(value) => {
                                      setColorList(value)
                                    }}
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setShowColorModal(true)}
                                  className="mb-1 p-1.5 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 border border-indigo-200"
                                  title="Add New Color"
                                >
                                  <Plus size={16} />
                                </button>
                              </div>
                            </div>
                          )}
                          {(barcodeGenerationMethod == "SIZE" || barcodeGenerationMethod == "SIZE_COLOR") && (
                            <button
                              type="button"
                              onClick={() => {
                                setItems()
                              }}
                              className="px-3 py-1 rounded items-center gap-1 text-xs h-8 w-14 mt-4 bg-gray-200"
                            >
                              Add
                            </button>
                          )}
                        </div>

                        {barcodeGenerationMethod == "STANDARD" && gridIndex === 0 && itemPriceList[0] && (
                          <div className="px-2 pt-3 h-[280px] min-h-0">
                            <LocationStockEditor
                              rows={itemPriceList[0]?.MinimumStockQty || []}
                              onChange={(rows) => handleMinimumStockRowsChange(0, rows)}
                              locationOptions={id ? storeOptions : storeOptions?.filter((i) => i.active)}
                              readOnly={readOnly}
                              title="Stock Alerts"
                            />
                          </div>
                        )}

                        {barcodeGenerationMethod != "STANDARD" && (
                          <>
                            <div className="grid grid-cols-12 gap-3 ">
                              <div className={`col-span-8 w-full ${Object.keys(fields).length > 1 ? " h-[280px]" : " h-[280px]"} `}>
                                <div className={`relative overflow-y-auto py-1 h-full`}>
                                  <table className="w-full border-collapse table-fixed">
                                    <thead className="bg-gray-200 text-gray-900 sticky top-0 header">
                                      <tr>
                                        <th className={`w-10 px-2 py-2 text-center font-medium text-[12px] `}>S.No</th>
                                        <th className={`w-16 px-2 py-2 text-center font-medium text-[12px] `}>Size Name</th>
                                        {barcodeGenerationMethod == "SIZE_COLOR" && (
                                          <th className={`w-20 px-2 py-2 text-center font-medium text-[12px] `}>Color Name</th>
                                        )}
                                        <th className={`w-20 px-2 py-2 text-center font-medium text-[12px] `}>Barcode</th>
                                        <th className={`w-16 px-2 py-2 text-center font-medium text-[12px] `}>Sku</th>
                                        <th className={`w-16 px-2 py-2 text-center font-medium text-[12px] `}>Sales Price</th>
                                        <th className={`w-16 px-2 py-2 text-center font-medium text-[12px] `}>Offer Price</th>
                                        <th className={`w-24 px-2 py-2 text-center font-medium text-[12px] `}>Stock Alerts</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {itemPriceList.map((item, index) => (
                                        <tr
                                          key={index}
                                          onContextMenu={(e) => {
                                            if (!readOnly) {
                                              handleRightSubGridClick(e, index, "notes");
                                            }
                                          }}
                                        >
                                          <td className="border border-gray-200 w-10 px-1 py-1 text-center text-xs ">{index + 1}</td>
                                          <td className="border border-gray-200 w-16 px-1 py-1 text-left text-xs">
                                            {findFromList(item?.sizeId, sizeData?.data, "name")}
                                          </td>
                                          {barcodeGenerationMethod == "SIZE_COLOR" && (
                                            <td className="border border-gray-200 w-20 px-1 py-1 text-left text-xs">
                                              {findFromList(item?.colorId, colorData?.data, "name")}
                                            </td>
                                          )}
                                          <td className="border border-gray-200 w-20 px-1 py-1 text-left text-xs">
                                            <input
                                              type="text"
                                              min="0"
                                              rows={1}
                                              onFocus={e => e.target.select()}
                                              className="text-right rounded w-full px-1 py-1 text-xs"
                                              value={item.barcode}
                                              disabled={readOnly}
                                              onChange={e => handleInputChange(e.target.value, index, "barcode")}
                                              onBlur={e => handleInputChange(e.target.value, index, "barcode")}
                                            />
                                          </td>
                                          <td className="border border-gray-200 w-16 px-1 py-1 text-left text-xs">
                                            <input
                                              type="text"
                                              min="0"
                                              rows={1}
                                              onFocus={e => e.target.select()}
                                              className="text-right rounded w-full px-1 py-1 text-xs"
                                              value={item.sku}
                                              disabled={readOnly}
                                              onChange={e => handleInputChange(e.target.value, index, "sku")}
                                              onBlur={e => handleInputChange(e.target.value, index, "sku")}
                                            />
                                          </td>
                                          <td className="border border-gray-200 w-16 px-1 py-1 text-left text-xs">
                                            <input
                                              type="text"
                                              min="0"
                                              rows={1}
                                              onFocus={e => e.target.select()}
                                              className="text-right rounded w-full px-1 py-1 text-xs"
                                              value={item.salesPrice}
                                              disabled={readOnly}
                                              onChange={e => handleInputChange(e.target.value, index, "salesPrice")}
                                              onBlur={e => handleInputChange(e.target.value, index, "salesPrice")}
                                            />
                                          </td>
                                          <td className="border border-gray-200 w-16 px-1 py-1 text-left text-xs">
                                            <input
                                              type="text"
                                              min="0"
                                              rows={1}
                                              onFocus={e => e.target.select()}
                                              className="text-right rounded w-full px-1 py-1 text-xs"
                                              value={item.offerPrice}
                                              disabled={readOnly}
                                              onChange={e => handleInputChange(e.target.value, index, "offerPrice")}
                                              onBlur={e => handleInputChange(e.target.value, index, "offerPrice")}
                                            />
                                          </td>
                                          <td className="border border-gray-200 px-2 py-1 text-xs">
                                            <button
                                              type="button"
                                              onClick={() => setGridIndex((prev) => (prev === index ? null : index))}
                                              className={`w-full rounded-md border px-2 py-1 text-left ${gridIndex === index ? "border-indigo-400 bg-indigo-50 text-indigo-700" : "border-gray-200 bg-gray-50 text-gray-700"}`}
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
                              {contextMenu && (
                                <div
                                  style={{
                                    position: "absolute",
                                    top: `${contextMenu.mouseY - 40}px`,
                                    left: `${contextMenu.mouseX - 80}px`,
                                    boxShadow: "0px 0px 5px rgba(0,0,0,0.3)",
                                    padding: "8px",
                                    borderRadius: "4px",
                                    zIndex: 1000,
                                  }}
                                  className="bg-gray-100"
                                  onMouseLeave={handleCloseContextMenu}
                                >
                                  <div className="flex flex-col gap-1">
                                    <button
                                      className=" text-black text-[12px] text-left rounded px-1"
                                      onClick={() => {
                                        handleDeleteRow(contextMenu.rowId);
                                        handleCloseContextMenu();
                                      }}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              )}

                              <div className="col-span-4 h-[280px] min-h-0">
                                {itemPriceList[gridIndex] ? (
                                  <LocationStockEditor
                                    rows={itemPriceList[gridIndex]?.MinimumStockQty || []}
                                    onChange={(rows) => handleMinimumStockRowsChange(gridIndex, rows)}
                                    locationOptions={id ? storeOptions : storeOptions?.filter((i) => i.active)}
                                    readOnly={readOnly}
                                    title={`Stock Alerts${barcodeGenerationMethod == "SIZE_COLOR"
                                      ? ` - ${findFromList(itemPriceList[gridIndex]?.sizeId, sizeData?.data, "name")} / ${findFromList(itemPriceList[gridIndex]?.colorId, colorData?.data, "name")}`
                                      : ` - ${findFromList(itemPriceList[gridIndex]?.sizeId, sizeData?.data, "name")}`
                                      }`}
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 text-center text-xs text-gray-500">
                                    Select a row to edit location-wise stock alerts.
                                  </div>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                    </fieldset>



                  </div>

                </fieldset>

              </div>
            </div>













          </div>
        </Modal >
      )
      }
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
    </div >
  );
}
