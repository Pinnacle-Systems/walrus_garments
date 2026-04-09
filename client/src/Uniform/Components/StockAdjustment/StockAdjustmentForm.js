import React, { useCallback, useEffect, useState } from "react";
import { useGetItemMasterQuery } from "../../../redux/uniformService/ItemMasterService";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { getCommonParams, getConfiguredStockDrivenFields, getStockMaintenanceConfig, isGridDatasValid, ModeChip } from "../../../Utils/helper";
import { toast } from "react-toastify";
import { FiSave, FiEdit2 } from "react-icons/fi";
import { DropdownInput } from "../../../Inputs";
import { adjTypeData } from "../../../Utils/DropdownData";
import { dropDownListObject } from "../../../Utils/contructObject";
import Swal from "sweetalert2";
import QuickAddItemModal from "./QuickAddItemModal";
import { useGetUnitOfMeasurementMasterQuery } from "../../../redux/uniformService/UnitOfMeasurementServices";
import { FaFileAlt } from "react-icons/fa";
import { ReusableInput } from "../Order/CommonInput";
import { HiOutlineRefresh } from "react-icons/hi";
import { useAddStockAdjustmentMutation, useGetStockAdjustmentByIdQuery, useUpdateStockAdjustmentMutation } from "../../../redux/uniformService/StockAdjustmentService";
import moment from "moment";
import { useGetItemControlPanelMasterQuery } from "../../../redux/uniformService/ItemControlPanelService";
import { getItemBarcodeGenerationMethod, getItemPriceForBarcodeGenerationMode, resolveBarcodeGenerationMethod } from "../../../Utils/helper";
import { useGetStockReportControlQuery } from "../../../redux/uniformService/StockReportControl.Services";
import QuickAddSizeModal from "../OpeningStock/QuickAddSizeModal";
import QuickAddColorModal from "../OpeningStock/QuickAddColorModal";
import { useFormKeyboardNavigation } from "../../../CustomHooks/useFormKeyboardNavigation";
import TransactionLineItemsSection, {
  transactionTableActionCellClassName,
  transactionTableFocusCellClassName,
  transactionTableClassName,
  transactionTableHeadClassName,
  transactionTableHeaderCellClassName,
  transactionTableIndexCellClassName,
  transactionTableNumberInputClassName,
  transactionTableSelectInputClassName,
} from "../ReusableComponents/TransactionLineItemsSection";
import SearchableTableCellSelect from "../ReusableComponents/SearchableTableCellSelect";
import { ItemMaster } from "../../../Shocks";
import { ColorMaster, SizeMaster, UomMaster } from "../../../Basic/components";
import { IoArrowBackCircleSharp } from "react-icons/io5";

const StockAdjustmentFrom = ({ params, onClose, id, setId, docId, setDocId, date, setDate, readOnly, setReadOnly, transType, setTransType,
  dcNo, setDcNo, dcDate, setDcDate, customerId, setCustomerId, payTermId, setPayTermId, locationId, setLocationId, storeId, setStoreId, branchList, locationData, yarnList, hasPermission }) => {

  const [contextMenu, setContextMenu] = useState(false)

  const { branchId, companyId, finYearId, userId } = getCommonParams();

  const { refs, handlers, focusFirstInput } = useFormKeyboardNavigation();
  const { movedToNextSaveNewRef } = refs;

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

  console.log(rows, 'rowsrows')

  const [modalState, setModalState] = useState({
    item: { open: false, rowId: null, value: "", editItem: null },
    size: { open: false, rowId: null, value: "" },
    color: { open: false, rowId: null, value: "" },
  });

  // --- Queries & Mutations ---
  const { data: itemList } = useGetItemMasterQuery({ params });
  const { data: itemControlData } = useGetItemControlPanelMasterQuery({ params });
  const { data: stockReportControlData } = useGetStockReportControlQuery({ params });
  const { data: sizeList } = useGetSizeMasterQuery({ params });
  const { data: colorList } = useGetColorMasterQuery({ params });
  const { data: uomList } = useGetUnitOfMeasurementMasterQuery({ params });


  const { data: singleData, isFetching: isSingleFetching, isLoading: isSingleLoading } =
    useGetStockAdjustmentByIdQuery(id, { skip: !id });

  const [addData] = useAddStockAdjustmentMutation();
  const [updateData] = useUpdateStockAdjustmentMutation();

  const syncFormWithDb = useCallback((data) => {
    const today = new Date();
    if (id) setReadOnly(true);
    else setReadOnly(false);
    setDate(
      data?.createdAt
        ? moment.utc(data.createdAt).format("YYYY-MM-DD")
        : moment.utc(today).format("YYYY-MM-DD")
    );
    setRows(data?.StockAdjustmentItems ? data?.StockAdjustmentItems : []);
    setStoreId(data?.storeId ? data?.storeId : "")
  }, [id]);

  useEffect(() => {
    if (id) syncFormWithDb(singleData?.data);
    else syncFormWithDb(undefined);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);



  // --- Options Mapping ---
  const itemOptions = itemList?.data?.map((i) => ({ value: i.id, label: i.name })) || [];
  const sizeOptions = sizeList?.data?.map((s) => ({ value: s.id, label: s.name })) || [];
  const colorOptions = colorList?.data?.map((c) => ({ value: c.id, label: c.name })) || [];
  const uomOptions = uomList?.data?.map((c) => ({ value: c.id, label: c.name })) || [];
  const barcodeGenerationMethod = resolveBarcodeGenerationMethod(itemControlData?.data?.[0]);
  const stockMaintenance = getStockMaintenanceConfig(stockReportControlData?.data?.[0]);
  const stockDrivenFields = getConfiguredStockDrivenFields(stockReportControlData?.data?.[0]);


  useEffect(() => {
    // if (id) return;
    if (rows?.length >= 20) return;
    setRows((prev) => {
      let newArray = Array.from({ length: 20 - prev.length }, (_, i) => {
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
          id: Date.now() + i + Math.random(),
          poItemsId: ""
        };
      });
      return [...prev, ...newArray];
    });
  }, [rows, setRows, id]);


  const updateRow = (id, field, value, extraData = {}) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;

        const updatedRow = { ...row, [field]: value, ...extraData };

        // Auto-price lookup (only if item, size, or color changed)
        if (["itemId", "sizeId", "colorId"].includes(field)) {
          const selectedItem = itemList?.data?.find((i) => i.id === updatedRow.itemId);
          if (selectedItem) {
            const itemBarcodeGenerationMethod = getItemBarcodeGenerationMethod(selectedItem, barcodeGenerationMethod);
            updatedRow.price = getItemPriceForBarcodeGenerationMode(
              selectedItem,
              itemBarcodeGenerationMethod,
              updatedRow.sizeId,
              updatedRow.colorId
            );

            // Barcode logic: Legacy uses first available Price List barcode, modern uses matched barcode
            if (selectedItem.isLegacy) {
              updatedRow.barcode = selectedItem.ItemPriceList?.[0]?.barcode || selectedItem.barcode || "";
            } else {
              const priceEntry = selectedItem.ItemPriceList?.find(
                p => String(p.sizeId) === String(updatedRow.sizeId) && String(p.colorId) === String(updatedRow.colorId)
              );
              updatedRow.barcode = priceEntry?.barcode || "";
            }
          } else {
            updatedRow.barcode = "";
          }
        }

        return updatedRow;
      })
    );
  };

  // --- Options Mapping ---
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
      id: Date.now() + Math.random(),
      poItemsId: ""
    };
    stockDrivenFields.forEach((field) => {
      newRow[field.key] = "";
    });
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
    branchId, storeId, stockAdjustmentItems: rows?.filter((i) => i.itemId), id
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
    const mandatoryFields = ["itemId", "adjType", "qty",];
    if (stockMaintenance.trackSize) mandatoryFields.push("sizeId");
    if (stockMaintenance.trackColor) mandatoryFields.push("colorId");
    mandatoryFields.push(...stockDrivenFields.map((field) => field.key));

    if (!validateData(data)) {
      Swal.fire({ title: "Please fill all required fields...!", icon: "warning" });
      return;
    }

    if (data?.stockAdjustmentItems?.filter((i) => i.itemId)?.length === 0) {
      Swal.fire({ title: "Please fill all adjustment Items...!", icon: "warning" });
      return;
    }
    if (!isGridDatasValid(data?.stockAdjustmentItems?.filter((i) => i.itemId), false, mandatoryFields)) {
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

    <div className="flex flex-col h-full bg-[#f1f1f0] overflow-hidden">
      <div className="flex-none w-full bg-white mx-auto rounded-md shadow-sm px-2  border-b border-gray-200 mb-1">
        <div className="flex justify-between items-center py-1">
          <h1 className="text-md font-bold text-gray-800">Stock Adjustment</h1>
          <div className="flex flex-row gap-2">
            <ModeChip id={id} readOnly={readOnly} />
            <button
              onClick={onClose}
              className=" text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
              title="Open Report"
            >
              <IoArrowBackCircleSharp className="w-7 h-7" />
            </button>
          </div>

        </div>
      </div>

      <div className="flex-grow flex flex-col min-h-0  space-y-3 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-none">
          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
            <h2 className="font-bold text-slate-700 mb-1  b-1">
              Basic Details
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <ReusableInput label="Adjustment No" readOnly value={docId} />
              <ReusableInput label="Adjustment Date" value={date} type={"date"} required={true} readOnly={true} disabled />
            </div>
          </div>

          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-2">
            <h2 className="font-bold text-slate-700 mb-1   pb-1">
              Location Details
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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

        <TransactionLineItemsSection
          panelClassName="flex-grow min-h-0"
          contentClassName="!py-0"
        >
          <div className="h-full overflow-auto">
            <table className={transactionTableClassName}>
              <thead className={`${transactionTableHeadClassName} shadow-sm`}>
                <tr className="py-2">
                  <th className={`w-12 bg-gray-300 px-1 py-1 text-center font-medium text-[12px]`}>S.No</th>
                  <th className={`w-64 bg-gray-300 px-1 py-1 text-center font-medium text-[12px]`}>Item Name <span className="text-red-500">*</span></th>
                  {stockMaintenance.trackSize && <th className={`w-32 bg-gray-300 px-1 py-1 text-center font-medium text-[12px]`}>Size <span className="text-red-500">*</span></th>}
                  {stockMaintenance.trackColor && <th className={`w-32 bg-gray-300 px-1 py-1 text-center font-medium text-[12px]`}>Color <span className="text-red-500">*</span></th>}
                  {stockDrivenFields.map((field) => (
                    <th key={field.key} className={`w-32 bg-gray-300 px-1 py-1 text-center font-medium text-[12px]`}>{field.label} <span className="text-red-500">*</span></th>
                  ))}
                  <th className={`w-32 bg-gray-300 px-1 py-1 text-center font-medium text-[12px]`}>UOM <span className="text-red-500">*</span></th>
                  <th className={`w-40 bg-gray-300 px-1 py-1 text-center font-medium text-[12px]`}>Barcode <span className="text-red-500">*</span></th>
                  {/* <th className={`w-24 bg-gray-200 px-1 py-1 text-center font-medium text-[12px]`}>Price <span className="text-red-500">*</span></th> */}
                  <th className={`w-24 bg-gray-300 px-1 py-1 text-center font-medium text-[12px]`}>Adjust Type <span className="text-red-500">*</span></th>
                  <th className={`w-24 bg-gray-300 px-1 py-1 text-center font-medium text-[12px]`}>Qty <span className="text-red-500">*</span></th>
                  {/* <th className={`w-32 bg-gray-200 px-1 py-1 text-center font-medium text-[12px]`}>Gross</th> */}
                  <th className={`w-8 bg-gray-300 px-1 py-1 text-center font-medium text-[12px]`}>Action</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {rows.map((row, idx) => {
                  const selectedItemData = itemList?.data?.find(i => i.id === row.itemId);
                  const isLegacy = selectedItemData?.isLegacy || false;

                  const validSizeIds = selectedItemData?.ItemPriceList?.map(p => p.sizeId) || [];
                  const validColorIds = selectedItemData?.ItemPriceList?.map(p => p.colorId) || [];

                  const filteredSizeOptions = (!isLegacy && validSizeIds.length > 0) ? sizeOptions.filter(o => validSizeIds.includes(o.value)) : sizeOptions;
                  const filteredColorOptions = (!isLegacy && validColorIds.length > 0) ? colorOptions.filter(o => validColorIds.includes(o.value)) : colorOptions;

                  const isUomReady = (row) => {
                    if (stockMaintenance.trackColor) return Boolean(row.colorId);
                    if (stockMaintenance.trackSize) return Boolean(row.sizeId);
                    return Boolean(row.itemId);
                  };

                  return (
                    <tr key={row.id} className={`border border-blue-gray-200 cursor-pointer ${idx % 2 === 0 ? "bg-white" : "bg-gray-100"}`}
                      onContextMenu={(e) => {
                        if (!readOnly) {

                          handleRightClick(e, idx, "shiftTimeHrs");
                        }
                      }}>
                      <td className="w-12 border border-gray-300 text-[11px] text-center p-0">{idx + 1}</td>
                      <td className="border border-gray-300 p-0 text-[11px] focus-within:border-amber-700 focus-within:bg-amber-100">
                        <SearchableTableCellSelect
                          value={row.itemId}
                          options={itemOptions}
                          disabled={readOnly}
                          onChange={v => {
                            const selectedItem = itemList?.data?.find(i => i.id === (v || ""));
                            updateRow(row.id, "itemId", v || "", {
                              item_name: selectedItem?.name || "",
                              sizeId: "",
                              size: "",
                              colorId: "",
                              color: "",
                              price: getItemBarcodeGenerationMethod(selectedItem, barcodeGenerationMethod) === "STANDARD"
                                ? selectedItem?.ItemPriceList?.[0]?.salesPrice || 0
                                : ""
                            });
                          }}
                          addNewModalWidth="w-[90%] h-[95%]"
                          childComponent={ItemMaster}
                          addNewLabel="+ Add New Item"
                        />
                      </td>
                      {stockMaintenance.trackSize && (
                        <td className="border border-gray-300  p-0 py-1.5 text-[11px] focus-within:border-amber-700 focus-within:bg-amber-100">
                          <SearchableTableCellSelect
                            value={row.sizeId}
                            options={filteredSizeOptions}
                            disabled={readOnly || !row.itemId}
                            onChange={v => {
                              const selected = sizeOptions.find(o => o.value === v);
                              updateRow(row.id, "sizeId", v || "", { size: selected?.label || "" });
                            }}
                          // addNewModalWidth="w-[40%] h-[45%]"
                          // childComponent={SizeMaster}
                          // addNewLabel="+ Add New Size"
                          />
                        </td>
                      )}
                      {stockMaintenance.trackColor && (
                        <td className="border border-gray-300  p-0 text-[11px] focus-within:border-amber-700 focus-within:bg-amber-100">
                          <SearchableTableCellSelect
                            value={row.colorId}
                            options={filteredColorOptions}
                            disabled={readOnly || !(stockMaintenance.trackSize ? row.sizeId : row.itemId)}
                            onChange={v => {
                              const selected = colorOptions.find(o => o.value === v);
                              updateRow(row.id, "colorId", v || "", { color: selected?.label || "" });
                            }}
                          // addNewModalWidth="w-[40%] h-[45%]"
                          // childComponent={ColorMaster}
                          // addNewLabel="+ Add New Color"
                          />
                        </td>
                      )}
                      {stockDrivenFields.map((field) => (
                        <td key={field.key} className="w-32 border border-gray-300 p-0 text-[11px] text-right focus-within:border-amber-600 focus-within:bg-amber-100">
                          <input
                            type="text"
                            className="h-full w-full rounded-none border-0 bg-transparent px-1 py-0 text-right shadow-none outline-none focus:bg-transparent focus:outline-none uppercase"
                            value={row?.[field.key] || ""}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => updateRow(row.id, field.key, e.target.value)}
                          />
                        </td>
                      ))}

                      <td className="w-32 border border-gray-300 p-0 text-[11px] focus-within:border-amber-700 focus-within:bg-amber-100">
                        <SearchableTableCellSelect
                          value={row.uomId}
                          options={uomOptions}
                          disabled={readOnly || !isUomReady(row)}
                          onChange={v => {
                            const selected = uomOptions.find(o => o.value === v);
                            updateRow(row.id, "uomId", v || "", { uom: selected?.label || "" });
                          }}
                          addNewModalWidth="w-[40%] h-[45%]"
                          childComponent={UomMaster}
                          addNewLabel="+ Add New Uom"
                        />
                      </td>
                      <td className="w-40 border border-gray-300 p-0 text-[11px] text-right">
                        <div className="flex h-full min-h-[22px] items-center justify-end px-1">
                          {row.barcode || ""}
                        </div>
                      </td>
                      {/* <td className="w-24 border border-gray-300 p-0 text-[11px] text-right focus-within:border-amber-600 focus-within:bg-amber-100">
                        <input
                          type="number"
                          className="h-full w-full rounded-none border-0 bg-transparent px-1 py-0 text-right shadow-none outline-none focus:bg-transparent focus:outline-none"
                          onFocus={(e) => e.target.select()}
                          value={row.price}
                          disabled={readOnly || !row.itemId}
                          onChange={e => updateRow(row.id, "price", parseInt(e.target.value) || 0)}
                        />
                      </td> */}
                      <td className="w-24 border border-gray-300 p-0 text-[11px] focus-within:border-amber-700 focus-within:bg-amber-100">
                        <select
                          disabled={readOnly || (row.salesQty ?? 0) > 0}
                          className={`h-full w-full rounded-none border-0 bg-transparent px-1 py-0 shadow-none outline-none focus:bg-transparent focus:outline-none ${row.adjType === "PLUS" ? "text-green-600" : ""} ${row.adjType === "MINUS" ? "text-red-600" : ""}`}
                          value={row.adjType}
                          onChange={(e) => updateRow(row.id, "adjType", e.target.value)}
                        >
                          <option></option>
                          {adjTypeData?.map((blend) => (
                            <option value={blend.value} key={blend.value}>{blend?.show}</option>
                          ))}
                        </select>
                      </td>
                      <td className="w-24 border border-gray-300 p-0 text-[11px] text-right focus-within:border-amber-600 focus-within:bg-amber-100">
                        <input
                          type="number"
                          className="h-full w-full rounded-none border-0 bg-transparent px-1 py-0 text-right shadow-none outline-none focus:bg-transparent focus:outline-none"
                          onFocus={(e) => e.target.select()}
                          value={row.qty}
                          disabled={readOnly || !row.itemId}
                          onChange={e => updateRow(row.id, "qty", parseInt(e.target.value) || 0)}
                        />
                      </td>
                      {/* <td className="border border-gray-300 text-[11px] text-right px-2">
                        {(row.price && row.qty ? parseFloat(row.price) * parseFloat(row.qty) : 0).toFixed(2)}
                      </td> */}
                      <td className="w-16 border border-gray-300 p-0 text-center">
                        <button
                          onClick={() => addNewRow()}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (idx === rows.length - 1) {
                                addNewRow(idx);
                              }
                            }
                          }}
                          className="h-full w-full rounded-none bg-blue-50 py-0"
                        >
                          +
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="sticky bottom-0 z-20 border-t-2 border-gray-300 font-bold shadow-[0_-1px_0_0_rgba(203,213,225,1)]">
                <tr>
                  <td
                    colSpan={4 + (stockMaintenance.trackSize ? 1 : 0) + (stockMaintenance.trackColor ? 1 : 0) + stockDrivenFields.length}
                    className="bg-gray-300 px-1 py-1 text-right text-[12px]"
                  >
                    Total:
                  </td>
                  <td className="bg-gray-300 px-1 py-1 text-right text-[11px]">
                  </td>
                  <td className="bg-gray-300 px-1 py-1 text-right text-[11px]">
                    {rows?.reduce((acc, curr) => acc + parseFloat(curr?.qty || 0), 0).toFixed(2)}

                    {/* {rows?.reduce((acc, curr) => acc + (parseFloat(curr?.qty || 0) * parseFloat(curr?.price || 0)), 0).toFixed(2)} */}
                  </td>
                  <td className="px-1 py-1 bg-gray-300"></td>
                </tr>
              </tfoot>
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

        </TransactionLineItemsSection>

        <div className="flex flex-col md:flex-row gap-2 justify-between flex-none bg-white p-2 rounded-md border border-slate-200 shadow-sm">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => hasPermission(() => saveData("new"), "save")}
              disabled={readOnly}
              className="bg-indigo-500 text-white px-4 py-1.5 rounded-md hover:bg-indigo-600 flex items-center text-sm shadow-sm transition-all active:scale-95">
              <FiSave className="w-4 h-4 mr-2" />
              Save & New
            </button>
            <button
              onClick={() => hasPermission(() => saveData("close"), "save")}
              disabled={readOnly}

              className="bg-indigo-500 text-white px-4 py-1.5 rounded-md hover:bg-indigo-600 flex items-center text-sm shadow-sm transition-all active:scale-95">
              <HiOutlineRefresh className="w-4 h-4 mr-2" />
              Save & Close
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button className="bg-yellow-600 text-white px-4 py-1.5 rounded-md hover:bg-yellow-700 flex items-center text-sm shadow-sm transition-all active:scale-95"
              // onClick={() => setReadOnly(false)}
              onClick={() => hasPermission(() => setReadOnly(false), "edit")}

            >
              <FiEdit2 className="w-4 h-4 mr-2" />
              Edit
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default StockAdjustmentFrom;
