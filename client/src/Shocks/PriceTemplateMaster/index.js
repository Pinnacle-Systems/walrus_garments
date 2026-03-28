
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAddItemMasterMutation, useDeleteItemMasterMutation, useGetItemMasterByIdQuery, useGetItemMasterQuery, useUpdateItemMasterMutation } from "../../redux/uniformService/ItemMasterService";
import secureLocalStorage from "react-secure-storage";
import Swal from "sweetalert2";
import useInvalidateTags from '../../CustomHooks/useInvalidateTags';
import { Check, Power, Plus } from "lucide-react";
import { DropdownInput, DropdownInputSearch, PriceInputWithTax, ReusableTable, TextInputNew1, ToggleButton, MultiSelectDropdownNew, childRecordCount } from "../../Inputs";
import Modal from "../../UiComponents/Modal";
import { ItemTypes, statusDropdown } from "../../Utils/DropdownData";
import { dropDownListObject, multiSelectOption } from "../../Utils/contructObject";
import { useGetStyleMasterQuery } from "../../redux/uniformService/StyleMasterService";
import { useGetSizeMasterQuery } from "../../redux/uniformService/SizeMasterService";
import { useGetHsnMasterQuery } from "../../redux/services/HsnMasterServices";
import { useGetColorMasterQuery } from "../../redux/uniformService/ColorMasterService";
import { capitalizeFirstLetter, findFromList } from "../../Utils/helper";
import { useGetSectionMasterQuery } from "../../redux/uniformService/SectionMasterService";
import { useGetLocationMasterQuery } from "../../redux/uniformService/LocationMasterServices";

import { TriangleAlert } from "lucide-react";
import { useGetItemControlPanelMasterQuery } from "../../redux/uniformService/ItemControlPanelService";
import { useGetItemCategoryQuery } from "../../redux/uniformService/ItemCategoryMasterService";
import QuickAddSizeModal from "./QuickAddSizeModal";
import QuickAddColorModal from "./QuickAddColorModal";
import CreatableSelect from "react-select/creatable";
import QuickAddItemModal from "../../Uniform/Components/OpeningStock/QuickAddItemModal";
import { useAddpriceTemplateMutation, useDeletepriceTemplateMutation, useGetpriceTemplateByIdQuery, useGetpriceTemplateQuery, useUpdatepriceTemplateMutation } from "../../redux/uniformService/priceTemplateService";


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
  const [itemId, setItemId] = useState('')


  const [purchasePrice, setPurchasePrice] = useState('')
  const [offerPrice, setOfferPrice] = useState('')

  const [salesTaxType, setSalesTaxType] = useState("")
  const [purchaseTaxType, setPurchaseTaxType] = useState("")
  const [itemType, setItemType] = useState('')
  const [sizeList, setSizeList] = useState([])
  const [colorList, setColorList] = useState([])
  const childRecord = useRef(0);
  const itemSelectRef = useRef(null);
  const [itemPriceList, setItemPriceList] = useState([])
  const [sectionId, setSectionId] = useState('')
  const [minStockQty, setMinStockQty] = useState("")
  const [gridIndex, setGridIndex] = useState();
  const [fields, setFields] = useState({});
  const [contextMenu, setContextMenu] = useState(null);
  const [mainCategory, setMainCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [showColorModal, setShowColorModal] = useState(false);
  const [modalState, setModalState] = useState({
    item: { open: false, rowId: null, value: "", editItem: null },
  });
  const [priceTemplate, setPriceTemlate] = useState([]);



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
  } = useGetpriceTemplateQuery({ params });


  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetpriceTemplateByIdQuery(id, { skip: !id });



  const [addData] = useAddpriceTemplateMutation();
  const [updateData] = useUpdatepriceTemplateMutation();
  const [removeData] = useDeletepriceTemplateMutation();
  const [dispatchInvalidate] = useInvalidateTags();





  const { data: itemList, } = useGetItemMasterQuery({ params });








  const {
    data: itemControlData, isFetching: itemControlFetching, isLoading: itemControlLoading
  } = useGetItemControlPanelMasterQuery({ params });







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
        setMinStockQty(data?.minStockQty ? data?.minStockQty : "")
        setOfferPrice(data?.offerPrice ? data?.offerPrice : "")

      } else {
        setItemId(data?.itemId ? data?.itemId : "")
        setPriceTemlate(data?.PriceTemplateDetails ? data?.PriceTemplateDetails : [])








      }
    },
    [id]
  );


  const openQuickAdd = (type, value, rowId = null, editItem = null) => {
    setModalState((prev) => ({ ...prev, [type]: { open: true, rowId, value, editItem } }));
  };

  const closeQuickAdd = (type) => {
    setModalState((prev) => ({ ...prev, [type]: { ...prev[type], open: false } }));
  };

  const handleQuickSaveItem = (newItem) => {
    setItemId(newItem.id);
  };


  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const data = {
    id,
    itemId,
    priceTemplate: priceTemplate?.filter(i => i.minQty && i.maxQty && i.price),
    branchId: params.branchId,
    companyId: params.companyId,

  };

  const validateData = (data) => {
    if (data.itemId && data?.priceTemplate?.length > 0) {
      return true;
    }
    return false;
  };

  const handleSubmitCustom = async (callback, data, text, nextProcess) => {
    try {
      await callback(data).unwrap();
      setId("");
      syncFormWithDb(undefined);
      dispatchInvalidate();
      await Swal.fire({
        title: text + "  " + "Successfully",
        icon: "success",
      });
      if (nextProcess == "new") {
        onNew()
      } else {
        setForm(false)
      }
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Submission error',
        text: error.data?.message || 'Something went wrong!',
      });
      itemSelectRef.current?.focus();
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

    if (foundItem) {
      Swal.fire({
        text: "The Item Name already exists.",
        icon: "warning",
        timer: 1500,
        showConfirmButton: false,
      });
      return false;
    }
    if (!validateData(data)) {
      Swal.fire({
        title: "Please fill all required fields...!",
        icon: "error",
      });
      itemSelectRef.current?.focus();
      return;
    }
    if (!window.confirm("Are you sure save the details ...?")) {
      return;
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
      try {
        let deldata = await removeData(id).unwrap();
        if (deldata?.statusCode == 1) {
          await Swal.fire({
            icon: "error",
            title: deldata?.message || "Data cannot be deleted!",
          });
          return;
        }
        setId("");
        dispatchInvalidate();
        await Swal.fire({
          title: "Deleted Successfully",
          icon: "success",
        });
        setForm(false);
        setForm(false);
      } catch (error) {
        await Swal.fire({
          icon: "error",
          title: "Submission error",
          text: error.data?.message || "Something went wrong!",
        });
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
    syncFormWithDb(undefined);
    setReadOnly(false);
    setSizeList([]);
    setColorList([]);
    setItemId("")
    setPriceTemlate([{
      minQty: "",
      maxQty: "",
      price: ""
    }])
    setTimeout(() => {
      itemSelectRef.current?.focus();
    }, 100);
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
      accessor: (item) => item?.Item?.name,
      className: "font-medium text-gray-900  w-[200px]  py-1  px-2",
      search: "Item Name",
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
    setPriceTemlate(orderDetails => {
      const newBlend = structuredClone(orderDetails);
      if (typeof value === "string" && value.includes("& Above")) {
        newBlend[index][field] = value;
      } else {
        newBlend[index][field] = value === "" ? "" : Number(value);
      }
      return newBlend;
    });
  }
  function handleBlurValidation(index, field) {
    setPriceTemlate(orderDetails => {
      const newBlend = structuredClone(orderDetails);

      // Enforce continuity through all rows
      for (let i = 0; i < newBlend.length; i++) {
        const row = newBlend[i];

        // 1. Maintain continuity with PREVIOUS row
        if (i > 0) {
          const prev = newBlend[i - 1];
          const isPrevInfinite = typeof prev.maxQty === "string" && prev.maxQty.includes("& Above");

          if (prev.maxQty !== "" && !isPrevInfinite) {
            const expectedMin = Number(prev.maxQty) + 1;
            // Force this row to start exactly after previous row ends
            if (row.minQty !== expectedMin) {
              row.minQty = expectedMin;
            }
          }
        }

        const isInfinite = typeof row.maxQty === "string" && row.maxQty.includes("& Above");
        if (row.minQty !== "" && row.maxQty !== "" && !isInfinite && Number(row.maxQty) <= Number(row.minQty)) {
          if (field === "maxQty" && i === index) {
          }
          row.maxQty = "";
        }

        // 3. Validate Price
        if (row.price !== "" && Number(row.price) <= 0) {
          if (field === "price" && i === index) {
            alert(`Price must be greater than 0 at row ${i + 1}`);
          }
          row.price = "";
        }
      }

      return newBlend;
    });
  }

  const handleMinQtyFocus = (index) => {
    if (index === 0) {
      if (priceTemplate[index].minQty === "") {
        handleInputChange(1, index, "minQty");
      }
      return;
    }
    const prev = priceTemplate[index - 1];
    if (prev && prev.maxQty !== "" && prev.price !== "") {
      const isPrevInfinite = typeof prev.maxQty === "string" && prev.maxQty.includes("& Above");
      if (isPrevInfinite) return;

      const expectedMin = Number(prev.maxQty) + 1;
      if (priceTemplate[index].minQty === "" || priceTemplate[index].minQty !== expectedMin) {
        handleInputChange(expectedMin, index, "minQty");
      }
    }
  };

  const isRowComplete = (idx) => {
    const row = priceTemplate[idx];
    return row && row.minQty !== "" && row.maxQty !== "" && row.price !== "";
  };






  useEffect(() => {
    const hasInfinity = priceTemplate?.some(item => typeof item.maxQty === "string" && item.maxQty.includes("& Above"));
    if (hasInfinity) return;

    if (priceTemplate?.length >= 7) return;

    setPriceTemlate((prev) => {
      const newArray = Array.from({ length: 7 - prev.length }, () => ({
        minQty: "",
        maxQty: "",
        price: ""
      }));
      return [...prev, ...newArray];
    });
  }, [priceTemplate, setPriceTemlate]);



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
    setPriceTemlate((prev) => {
      return prev?.filter((_, index) => index !== id);
    });
  };

  const setAsInfinite = (rowIndex) => {
    setPriceTemlate(prev => {
      const newItems = structuredClone(prev);
      newItems[rowIndex].maxQty = `${newItems[rowIndex].minQty} & Above`;
      // Truncate any following rows since infinity is the cap
      return newItems.slice(0, rowIndex + 1);
    });
  };


  useEffect(() => {
    if (form && itemSelectRef.current) {
      itemSelectRef.current.focus();
    }
  }, [form]);

  const handleNameChange = (val) => setName(val ? val.charAt(0).toUpperCase() + val.slice(1) : val);

  const itemOptions = itemList?.data?.map((i) => ({ value: i.id, label: i.name })) || [];

  const customSelectStyles = {
    control: (base) => ({
      ...base,
      minHeight: "30px",
      height: "30px",
      fontSize: "12px",
      borderRadius: "8px",
      borderColor: "#d1d5db"
    }),

    valueContainer: (base) => ({
      ...base,
      padding: "0 8px"
    }),

    input: (base) => ({
      ...base,
      margin: 0,
      padding: 0
    }),

    indicatorsContainer: (base) => ({
      ...base,
      height: "30px"
    }),

    // ✅ ADD THIS (important)
    menu: (base) => ({
      ...base,
      zIndex: 9999
    }),

    menuPortal: (base) => ({
      ...base,
      zIndex: 9999
    })
  };
  const formRef = useRef(null);



  return (
    <div onKeyDown={handleKeyDown} className="p-1">
      <div className="w-full flex bg-white p-1 justify-between  items-center">
        <h5 className="text-xl font-bold font-segoe text-gray-800 ">
          Price Template
        </h5>
        <div className="flex items-center">
          <button
            onClick={() => {
              setForm(true);
              onNew();
            }}
            className="bg-white border  border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-sm px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
          >
            + Add New Price Template
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
          widthClass={"w-[40%] h-[90%]"}
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
                      ? "Edit  Price Template"
                      : "Price Template Master"
                    : "Add New  Price Template"}
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
                  border border-blue-600 flex items-center gap-1 text-xs"
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
                  border border-green-600 flex items-center gap-1 text-xs"
                    >
                      <Check size={14} />
                      {"Save & New"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-3">
              <div ref={formRef} className="bg-gray-50 p-4 rounded-lg h-full space-y-4">

                <fieldset className="border border-gray-300 rounded-lg p-4 bg-white h-full">
                  <legend className="px-2 text-sm font-semibold text-gray-700">
                    Item Information
                  </legend>

                  <div className="grid grid-cols-12 gap-4 mt-2">



                    <div className="col-span-8">
                      <label className="block text-xs font-bold text-gray-600 mb-1">
                        Item <span className="text-red-600">*</span>
                      </label>
                      <CreatableSelect
                        ref={itemSelectRef}
                        isClearable
                        placeholder="Search Item..."
                        options={itemOptions}
                        value={itemOptions.find(o => o.value === itemId)}
                        styles={customSelectStyles}
                        onChange={o => setItemId(o?.value || "")}
                        onInputChange={(v) => v.toUpperCase()}
                        onCreateOption={v => openQuickAdd("item", v.toUpperCase())}
                        formatCreateLabel={(v) => `Create Item: "${v.toUpperCase()}"`}
                        isDisabled={readOnly}
                      />
                    </div>


















                    <div className="col-span-1 mt-5">
                      <ToggleButton name="Status" options={statusDropdown} value={active} setActive={setActive} required={true} readOnly={readOnly} />
                    </div>


                    <fieldset className="col-span-12 rounded-lg h-full">
                      <legend className="px-2 text-sm font-semibold text-gray-700">
                        Pricing Information
                      </legend>

                      <div>



                        <div className="grid grid-cols-12 gap-3 ">
                          <div className={`col-span-10 border border-gray-300  w-full ${Object.keys(fields).length > 1 ? " h-[220px]" : " h-[300px]"} `}>
                            <div className={` relative overflow-y-auto py-1 h-full`}>
                              <table className="w-full border-collapse table-fixed ">
                                <thead className="bg-gray-200 text-gray-900 sticky top-0 header">
                                  <tr>
                                    <th
                                      className={`w-1 px-4 py-2 text-center font-medium text-[13px] `}
                                    >
                                      S.No
                                    </th>
                                    <th

                                      className={`w-24 px-4 py-2 text-center font-medium text-[13px] `}
                                    >
                                      Min Qty
                                    </th>
                                    <th

                                      className={`w-24 px-4 py-2 text-center font-medium text-[13px] `}
                                    >
                                      Max Qty
                                    </th>
                                    <th

                                      className={`w-24 px-4 py-2 text-center font-medium text-[13px] `}
                                    >
                                      Price
                                    </th>

                                  </tr>
                                </thead>
                                <tbody>

                                  {priceTemplate?.map((item, index) => (
                                    <tr key={index} className=""
                                      onContextMenu={(e) => {
                                        if (!readOnly) {
                                          handleRightSubGridClick(e, index, "notes");
                                        }
                                      }}
                                    >
                                      <td className="border border-gray-200 w-12 px-1 py-1 text-center text-xs ">{index + 1}
                                      </td>
                                      <td className="border border-gray-200 w-32 px-1 py-1 text-left text-xs">
                                        <input
                                          type="text"

                                          min="0"
                                          rows={1}
                                          onFocus={e => { e.target.select(); handleMinQtyFocus(index); }}
                                          className={`text-right rounded w-full px-1 py-1 text-xs ${index > 0 && !isRowComplete(index - 1) ? "bg-gray-100 cursor-not-allowed" : ""}`}
                                          value={item.minQty}
                                          disabled={readOnly || (index > 0 && !isRowComplete(index - 1))}
                                          onChange={e => handleInputChange(e.target.value, index, "minQty")}
                                          onBlur={() => handleBlurValidation(index, "minQty")}
                                        />
                                      </td>

                                      <td className="border border-gray-200 w-32 px-1 py-1 text-left text-xs">
                                        <input
                                          type="text"

                                          min="0"
                                          rows={1}
                                          onFocus={e => e.target.select()}
                                          className={`text-right rounded w-full px-1 py-1 text-xs ${!item.minQty ? "bg-gray-100 cursor-not-allowed" : ""} ${item.maxQty === 999999 ? "font-bold text-indigo-600" : ""}`}
                                          value={item.maxQty === 999999 ? "∞ And Above" : item.maxQty}
                                          disabled={readOnly || !item.minQty || item.maxQty === 999999}
                                          onChange={e => handleInputChange(e.target.value, index, "maxQty")}
                                          onBlur={() => handleBlurValidation(index, "maxQty")}
                                        />
                                      </td>
                                      <td className="border border-gray-200 w-32 px-1 py-1 text-left text-xs">
                                        <input
                                          type="text"

                                          min="0"
                                          rows={1}
                                          onFocus={e => e.target.select()}
                                          className={`text-right rounded w-full px-1 py-1 text-xs ${!item.maxQty ? "bg-gray-100 cursor-not-allowed" : ""}`}
                                          value={item.price}
                                          disabled={readOnly || !item.maxQty}
                                          onChange={e => handleInputChange(e.target.value, index, "price")}
                                          onBlur={() => handleBlurValidation(index, "price")}
                                        />
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
                                left: `${contextMenu.mouseX - 480}px`,

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
                                  className=" text-black text-[12px] text-left rounded px-1 hover:bg-gray-200"
                                  onClick={() => {
                                    setAsInfinite(contextMenu.rowId);
                                    handleCloseContextMenu();
                                  }}
                                >
                                  Set as Final (∞)
                                </button>
                                <button
                                  className=" text-black text-[12px] text-left rounded px-1 hover:bg-gray-200"
                                  onClick={() => {
                                    handleDeleteRow(contextMenu.rowId);
                                    handleCloseContextMenu();
                                  }}
                                >
                                  Delete{" "}
                                </button>

                              </div>
                            </div>
                          )}




                        </div>


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
      {modalState.item.open && (
        <QuickAddItemModal
          isOpen={modalState.item.open}
          onClose={() => closeQuickAdd("item")}
          itemName={modalState.item.value}
          itemToEdit={modalState.item.editItem}
          onCreated={handleQuickSaveItem}
          barcodeGenerationMethod={itemControlData?.data?.[0]?.barcodeGenerationMethod || "STANDARD"}
        />
      )}
    </div >

  );
}
