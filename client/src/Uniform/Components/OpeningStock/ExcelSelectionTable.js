import React from "react";
import { read, utils } from "xlsx";
import { getCommonParams, getStockMaintenanceConfig, normalizeMasterValue } from "../../../Utils/helper";
import { useGetItemMasterQuery, useAddItemMasterMutation } from "../../../redux/uniformService/ItemMasterService";
import { useGetSizeMasterQuery, useAddSizeMasterMutation } from "../../../redux/uniformService/SizeMasterService";
import { useAddColorMasterMutation, useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { FiDownload, FiSave, FiUploadCloud, FiFileText, FiX } from "react-icons/fi";
import { FaQuestionCircle } from "react-icons/fa";
import { useAddOpeningStockMutation } from "../../../redux/services/StockService";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useGetUnitOfMeasurementMasterQuery, useAddUnitOfMeasurementMasterMutation } from "../../../redux/uniformService/UnitOfMeasurementServices";
import Select from "react-select";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService";
import { useGetLocationMasterQuery } from "../../../redux/uniformService/LocationMasterServices";
import { useGetStockReportControlQuery } from "../../../redux/uniformService/StockReportControl.Services";
import Modal from "../../../UiComponents/Modal";
import TransactionLineItemsSection, {
  transactionTableActionButtonClassName,
  transactionTableActionCellClassName,
  transactionTableCellClassName,
  transactionTableClassName,
  transactionTableFocusCellClassName,
  transactionTableHeadClassName,
  transactionTableHeaderCellClassName,
  transactionTableIndexCellClassName,
  transactionTableSelectInputClassName,
} from "../ReusableComponents/TransactionLineItemsSection";
import {
  createOpeningStockRowDefaults,
  getOpeningStockFieldDefinitions,
  getOpeningStockHeaderMap,
  getOpeningStockTemplateRow,
} from "./openingStockSchema";

const escapeCsvValue = (value) => {
  const stringValue = value?.toString() ?? "";
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

const normalizeLookupValue = (value) => (value || "").toString().trim().toLowerCase();
const normalizeCodeValue = (value) => value?.toString().trim().toUpperCase() || "";

const ExcelSelectionTable = ({ file, setFile, pres, setPres, params, stockItems, setStockItems }) => {
  const { branchId, companyId, finYearId, userId } = getCommonParams();

  const [selectedBranchId, setSelectedBranchId] = React.useState("");
  const [selectedLocationId, setSelectedLocationId] = React.useState("");
  const [editingCell, setEditingCell] = React.useState(null);
  const [missingMasterReview, setMissingMasterReview] = React.useState({
    isOpen: false,
    items: [],
    sizes: [],
    colors: [],
  });

  React.useEffect(() => {
    if (branchId) {
      setSelectedBranchId(branchId);
    }
  }, [branchId]);


  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    loadFile(selectedFile);
  };

  console.log(file, "file for Invoice")


  const { data: itemList } = useGetItemMasterQuery({ params });
  const { data: sizeList } = useGetSizeMasterQuery({ params });
  const { data: colorList } = useGetColorMasterQuery({ params });
  const { data: stockReportControlData } = useGetStockReportControlQuery({ params });
  const { data: uomList } = useGetUnitOfMeasurementMasterQuery({ params });
  const { data: branchList } = useGetBranchQuery({ params: { companyId } });
  const { data: locationList } = useGetLocationMasterQuery({ params: { branchId: selectedBranchId } });

  const branchOptions = branchList?.data?.map(b => ({ value: b.id, label: b.branchName })) || [];
  const locationOptions = locationList?.data?.map(l => ({ value: l.id, label: l.storeName })) || [];


  const [addData] = useAddOpeningStockMutation();
  const [addItem] = useAddItemMasterMutation();
  const [addSize] = useAddSizeMasterMutation();
  const [addColor] = useAddColorMasterMutation();
  const [addUom] = useAddUnitOfMeasurementMasterMutation();
  const stockReportControl = stockReportControlData?.data?.[0];
  const stockMaintenance = getStockMaintenanceConfig(stockReportControl);
  const openingStockFields = React.useMemo(
    () => getOpeningStockFieldDefinitions(stockReportControl),
    [stockReportControl]
  );
  const openingStockHeaderMap = React.useMemo(
    () => getOpeningStockHeaderMap(openingStockFields),
    [openingStockFields]
  );
  const openingStockTemplateRow = React.useMemo(
    () => getOpeningStockTemplateRow(openingStockFields),
    [openingStockFields]
  );

  const uomOptions = (uomList?.data || []).map(u => ({ value: u.id, label: u.name }));

  const existingColorCodeMap = React.useMemo(
    () =>
      new Map(
        (colorList?.data || [])
          .map((color) => [normalizeCodeValue(color?.code), normalizeMasterValue(color?.name || "")])
          .filter(([code]) => Boolean(code))
      ),
    [colorList]
  );

  const isFieldValueMissing = React.useCallback((row, field) => {
    const value = row?.[field.key];

    if (field.key === "qty") {
      return !value || Number(value) <= 0;
    }

    if (field.key === "uom") {
      const selectedUomId = row?.uomId || row?._uomId || findFromList(row?.uom, uomList?.data, "id");
      return !selectedUomId;
    }

    return !value?.toString().trim();
  }, [uomList]);

  const closeMissingMasterReview = () => {
    setMissingMasterReview({
      isOpen: false,
      items: [],
      sizes: [],
      colors: [],
    });
  };

  const getColorReviewErrors = (reviewColors = missingMasterReview.colors) => {
    const codeCounts = reviewColors.reduce((acc, color) => {
      const normalizedCode = normalizeCodeValue(color.code);
      if (!normalizedCode) return acc;
      acc[normalizedCode] = (acc[normalizedCode] || 0) + 1;
      return acc;
    }, {});

    return reviewColors.reduce((acc, color) => {
      const normalizedCode = normalizeCodeValue(color.code);

      if (!normalizedCode) {
        acc[color.name] = "Color code is required.";
        return acc;
      }

      if (codeCounts[normalizedCode] > 1) {
        acc[color.name] = "Color code must be unique within this batch.";
        return acc;
      }

      const existingColorName = existingColorCodeMap.get(normalizedCode);
      if (existingColorName) {
        acc[color.name] = `Code ${normalizedCode} is already associated with color ${existingColorName}.`;
      }

      return acc;
    }, {});
  };

  const getMissingRequiredRowMessage = () => {
    for (const field of openingStockFields.filter((entry) => entry.required)) {
      const missingRowIndex = stockItems.findIndex((row) => isFieldValueMissing(row, field));
      if (missingRowIndex !== -1) {
        return `${field.label} is required at row ${missingRowIndex + 1}`;
      }
    }

    return "";
  };

  const processStockSave = async ({
    missingItems = [],
    missingSizes = [],
    reviewedColors = [],
  }) => {
    if (!selectedBranchId) {
      toast.warning("Please select a branch.");
      return;
    }
    if (!selectedLocationId) {
      toast.warning("Please select a location.");
      return;
    }

    const missingRequiredRowMessage = getMissingRequiredRowMessage();
    if (missingRequiredRowMessage) {
      toast.warning(missingRequiredRowMessage);
      return;
    }

    if (missingItems.length === 0 && missingSizes.length === 0 && reviewedColors.length === 0) {
      if (!window.confirm("Are you sure you want to save these details?")) return;
    }

    try {
      Swal.fire({
        title: "Processing...",
        text: "Please wait while we save master records and stock.",
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); },
      });

      // --- Auto-create missing Sizes ---
      const newSizeIdMap = {};
      for (const s of missingSizes) {
        const res = await addSize({ name: s, code: s, companyId, branchId, active: true }).unwrap();
        if (res.data?.id) newSizeIdMap[s.toLowerCase().trim()] = res.data.id;
      }

      const newColorIdMap = {};
      for (const color of reviewedColors) {
        const res = await addColor({
          name: color.name,
          code: normalizeCodeValue(color.code),
          companyId,
          branchId,
          active: true,
        }).unwrap();
        if (res.data?.id) newColorIdMap[normalizeLookupValue(color.name)] = res.data.id;
      }

      // --- Ensure PCS UOM exists; create if missing ---
      let pcsId = findFromList("PCS", uomList?.data, "id");
      if (!pcsId) {
        const res = await addUom({ name: "PCS", code: "PCS", companyId, branchId, active: true }).unwrap();
        if (res.data?.id) pcsId = res.data.id;
      }

      // --- Auto-create missing Item masters ---
      const newItemIdMap = {};
      for (const itm of missingItems) {
        const res = await addItem({
          name: normalizeMasterValue(itm),
          active: true,
          companyId,
          branchId,
          storeId: selectedLocationId,
        }).unwrap();
        if (res.data?.data?.id || res.data?.id) {
          newItemIdMap[itm.toLowerCase().trim()] = res.data?.data?.id || res.data?.id;
        }
      }

      // --- Map all stock items with newly created IDs ---
      const mappedStockItems = await stockItems.map(row => {
        const itemKey = normalizeLookupValue(row.item_name);
        const sizeKey = normalizeLookupValue(row.size);
        const colorKey = normalizeLookupValue(row.color);

        const newlyCreatedItemId = newItemIdMap[itemKey];
        const newlyCreatedSizeId = newSizeIdMap[sizeKey];
        const newlyCreatedColorId = newColorIdMap[colorKey];

        // Use overridden UOM from row if set, else from uomList; else default PCS
        const resolvedUomId = row.uomId || row._uomId ||
          findFromList(row.uom, uomList?.data, "id") ||
          pcsId ||
          null;

        return {
          ...row,
          itemId: newlyCreatedItemId || row.itemId || findFromList(row.item_name, itemList?.data, "id"),
          sizeId: newlyCreatedSizeId || row.sizeId || findFromList(row.size, sizeList?.data, "id") || null,
          colorId: newlyCreatedColorId || row.colorId || findFromList(row.color, colorList?.data, "id") || null,
          uomId: resolvedUomId,
        };
      });

      // Update state so the UI reflects the new IDs
      setStockItems(mappedStockItems);

      const payload = {
        branchId: selectedBranchId,
        storeId: selectedLocationId,
        companyId,
        finYearId,
        userId,
        stockItems: mappedStockItems.map(({ _rowId, item_name, size, color, uom, _uomId, ...rest }) => rest)
      };

      const returnData = await addData(payload).unwrap();
      if (returnData.statusCode === 1) {
        Swal.fire({ icon: "error", title: returnData?.message, showConfirmButton: false });
      } else if (returnData.statusCode === 0) {
        Swal.fire({ icon: "success", title: "Stock Added Successfully", showConfirmButton: false });
      } else {
        toast.error(returnData?.message);
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to save: " + (err.data?.message || err.message), "error");
    }
  };

  const saveData = async () => {
    const missingItems = [...new Set(
      stockItems
        .filter(r => r.item_name && !findFromList(r.item_name, itemList?.data, "id"))
        .map(r => r.item_name)
    )];

    const missingSizes = [...new Set(
      stockMaintenance.trackSize
        ? stockItems.filter(r => normalizeMasterValue(r.size) && !findFromList(r.size, sizeList?.data, "id")).map(r => normalizeMasterValue(r.size))
        : []
    )];
    const missingColors = [...new Set(
      stockMaintenance.trackColor
        ? stockItems.filter(r => normalizeMasterValue(r.color) && !findFromList(r.color, colorList?.data, "id")).map(r => normalizeMasterValue(r.color))
        : []
    )];

    if (missingItems.length > 0 || missingSizes.length > 0 || missingColors.length > 0) {
      setMissingMasterReview({
        isOpen: true,
        items: missingItems.map((item) => normalizeMasterValue(item)),
        sizes: missingSizes,
        colors: missingColors.map((color) => ({
          name: color,
          code: "",
        })),
      });
      return;
    }

    await processStockSave({
      missingItems,
      missingSizes,
      reviewedColors: [],
    });
  };





  function findFromList(name, list, property) {
    if (!list || !name) return ""
    const trimmedName = name.toString().trim().toLowerCase();
    let data = list?.find(i => (i.name || "").toString().trim().toLowerCase() === trimmedName)
    if (!data) return ""
    return data[property]
  }






  const loadFile = (selectedFile = file) => {
    if (!selectedFile) {
      toast.warning("Please select a file first.");
      return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
      const data = new Uint8Array(e.target.result);

      const workbook = read(data, { type: "array" });
      console.log(workbook, "workbook")

      const worksheetName = workbook.SheetNames[0];
      console.log(worksheetName, "worksheetName")

      const worksheet = workbook.Sheets[worksheetName];
      console.log(worksheet, "worksheet")

      // const jsonData = utils.sheet_to_json(worksheet, { header: 1 });

      const jsonData = utils.sheet_to_json(worksheet, { header: 1, raw: false });


      const headerNames = jsonData.shift();

      console.log(jsonData, "jsonData")
      console.log(headerNames, "headerNames")

      let transformedData = jsonData
        .filter(row => row.some(cell => cell !== undefined && cell !== null && cell.toString().trim() !== ""))
        .map((row) => {
          const obj = { _rowId: Date.now() + Math.random(), ...createOpeningStockRowDefaults(openingStockFields) };
          headerNames.forEach((header, index) => {
            const key = openingStockHeaderMap.get(header?.toString().trim().toLowerCase());
            if (!key) return;
            obj[key] = row[index];
          });

          // Pre-populate IDs if they exist in master
          const itemName = obj.item_name;
          const sizeName = obj.size;
          const colorName = obj.color;
          const uomName = obj.uom;

          obj.itemId = findFromList(itemName, itemList?.data, "id");
          obj.sizeId = findFromList(sizeName, sizeList?.data, "id") || null;
          obj.colorId = findFromList(colorName, colorList?.data, "id") || null;
          obj.uomId = findFromList(uomName, uomList?.data, "id") || null;
          obj.branchId = branchId;
          obj.storeId = selectedLocationId;
          obj.companyId = companyId;
          obj.finYearId = finYearId;
          obj.userId = userId;

          return obj;
        });
      console.log(transformedData, "transformedData")

      setStockItems(transformedData);
    };



    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentLoaded = (event.loaded / event.total) * 100;
        console.log(`Loading progress: ${percentLoaded}%`);
      }
    };



    reader.readAsArrayBuffer(selectedFile);
  };

  const downloadTemplate = () => {
    const csvRows = [
      openingStockFields.map((field) => escapeCsvValue(field.label)).join(","),
      openingStockFields.map((field) => escapeCsvValue(openingStockTemplateRow[field.label])).join(",")
    ];
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", "opening-stock-template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const reviewErrors = getColorReviewErrors();
  const hasColorReviewErrors = Object.keys(reviewErrors).length > 0;

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="flex min-h-0 w-full flex-1 flex-col gap-5">
        <div className="mt-3 flex shrink-0 flex-col items-start justify-start gap-4">
          <div className="w-full flex flex-col gap-3 2xl:flex-row 2xl:justify-between 2xl:items-end">
            <div className="flex flex-wrap items-end gap-3 xl:flex-nowrap xl:items-end xl:gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-600">Select Branch</label>
                <div className="w-56"

                >
                  <Select
                    options={branchOptions}
                    value={branchOptions.find(o => o.value === selectedBranchId)}
                    onChange={o => { setSelectedBranchId(o?.value || ""); setSelectedLocationId(""); }}
                    placeholder="Branch..."
                    styles={{ control: (b) => ({ ...b, minHeight: "30px", height: "30px", fontSize: "12px" }), indicatorsContainer: (b) => ({ ...b, height: "30px" }) }}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-600">Select Location</label>
                <div className="w-56">
                  <Select
                    options={locationOptions}
                    value={locationOptions.find(o => o.value === selectedLocationId)}
                    onChange={o => setSelectedLocationId(o?.value || "")}
                    placeholder="Location..."
                    isClearable
                    styles={{ control: (b) => ({ ...b, minHeight: "30px", height: "30px", fontSize: "12px" }), indicatorsContainer: (b) => ({ ...b, height: "30px" }) }}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-600">Load File</label>
                <div className="flex h-[30px] w-[280px] items-center gap-2 overflow-hidden rounded-lg bg-white">
                  <input type="file" id="profileImage" accept=".csv,.xlsx,.xls" className='hidden' onChange={handleFileChange} />
                  <label
                    htmlFor="profileImage"
                    className="inline-flex h-[30px] shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-lime-500 bg-lime-50 px-2.5 text-[11px] font-bold text-lime-700 transition hover:bg-lime-500 hover:text-white"
                  >
                    <FiUploadCloud className="h-3 w-3" />
                    Load File
                  </label>
                  <div className="flex min-w-0 flex-1 items-center overflow-hidden">
                    {file ? (
                      <div className="flex min-w-0 items-center gap-1.5 text-[11px] text-slate-600">
                        <FiFileText className="h-3 w-3 shrink-0 text-slate-400" />
                        <span className="block truncate font-medium text-slate-700">{file.name}</span>
                      </div>
                    ) : (
                      <span className="block truncate text-[11px] text-slate-400">CSV or Excel file</span>
                    )}
                  </div>
                  {file && (
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        const input = document.getElementById("profileImage");
                        if (input) input.value = "";
                      }}
                      className="inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                      aria-label="Clear selected file"
                    >
                      <FiX className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2 xl:self-end">
                <button
                  type="button"
                  onClick={downloadTemplate}
                  className="inline-flex h-[30px] shrink-0 items-center gap-2 whitespace-nowrap rounded-md border border-indigo-500 px-3 text-[11px] font-bold text-indigo-600 transition-colors hover:bg-indigo-500 hover:text-white"
                >
                  <FiDownload className="w-3.5 h-3.5" />
                  Download Template
                </button>
                <div className="relative z-30 group">
                  <button
                    type="button"
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label="Opening stock import template help"
                  >
                    <FaQuestionCircle className="text-sm cursor-help" />
                  </button>
                  <div className="pointer-events-none absolute top-full right-0 z-[80] mt-2 w-56 rounded-md bg-slate-800 px-3 py-2 text-[11px] leading-4 text-white shadow-lg opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                    Download the CSV template that matches your current stock-control fields, fill it in Excel, then upload it here.
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-row shrink-0 items-center xl:self-end">
              <button
                onClick={saveData}
                className="inline-flex h-8 items-center whitespace-nowrap rounded-md bg-indigo-500 px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-600"
              >
                <FiSave className="w-4 h-4 mr-2" />
                Save Stock
              </button>
              <button
                onClick={() => {
                  setStockItems([]);
                  setFile(null);
                  const input = document.getElementById("profileImage");
                  if (input) input.value = "";
                }}
                className="ml-2 inline-flex h-8 items-center whitespace-nowrap rounded-md bg-red-500 px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-600"
              >
                New
              </button>
            </div>
          </div>
        </div>

        <TransactionLineItemsSection
          panelClassName="min-h-0 w-full flex-1"
          contentClassName="min-h-0"
        >
          {stockItems.length === 0 ? (
            <div className="flex h-full min-h-[240px] items-center justify-center px-6 text-center">
              <div className="max-w-md">
                <p className="text-sm font-semibold text-slate-700">No bulk data loaded yet.</p>
                <p className="mt-1 text-sm text-slate-500">Load a file to import bulk data into opening stock.</p>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-0 overflow-auto">
              <table className={transactionTableClassName}>
                <thead className={transactionTableHeadClassName}>
                  <tr>
                    <th className={`${transactionTableHeaderCellClassName} w-12`}>S.No</th>
                    {openingStockFields.map((field) => (
                      <th className={`${transactionTableHeaderCellClassName} ${field.widthClass || ""}`} key={field.key}>
                        {field.label}
                      </th>
                    ))}
                    <th className={`${transactionTableHeaderCellClassName} w-16`}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    return stockItems?.map((row, rowIndex) => {
                      const itemId = row.itemId || findFromList(row.item_name, itemList?.data, "id");
                      const sizeId = row.sizeId || findFromList(row.size, sizeList?.data, "id");
                      const colorId = row.colorId || findFromList(row.color, colorList?.data, "id");
                      const uomId = row.uomId || row._uomId || findFromList(row.uom, uomList?.data, "id");

                      return (
                        <tr key={row._rowId || rowIndex} className="border border-blue-gray-200">
                          <td className={transactionTableIndexCellClassName}>{rowIndex + 1}</td>
                          {openingStockFields.map((field) => {
                            const key = field.key;
                            const val = row[key];
                            const isEmpty = !val?.toString().trim();
                            let isInvalid = false;
                            if (field.required && isFieldValueMissing(row, field)) isInvalid = true;
                            if (key === "item_name" && !isEmpty && !itemId) isInvalid = true;
                            if (key === "size" && !isEmpty && !sizeId) isInvalid = true;
                            if (key === "uom" && !uomId) isInvalid = true;
                            if (key === "color" && !isEmpty && !colorId) isInvalid = true;

                            if (key === "uom") {
                              const pcsDefaultId = findFromList("PCS", uomList?.data, "id") || "";
                              const selectedUomId = row._uomId || findFromList(row.uom, uomList?.data, "id") || pcsDefaultId;
                              return (
                                <td key={field.key} className={!selectedUomId ? `${transactionTableFocusCellClassName} bg-red-100` : transactionTableFocusCellClassName}>
                                  <select
                                    value={selectedUomId}
                                    onChange={(e) => {
                                      setStockItems(prev => prev.map(r =>
                                        r._rowId === row._rowId ? { ...r, _uomId: e.target.value } : r
                                      ));
                                    }}
                                    className={`${transactionTableSelectInputClassName} cursor-pointer ${!selectedUomId ? "text-red-700 font-semibold" : "text-gray-700"}`}
                                  >
                                    <option value="">-- Select UOM --</option>
                                    {uomOptions.map(o => (
                                      <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                  </select>
                                </td>
                              );
                            }

                            const rowKey = row._rowId || rowIndex;

                            return (
                              <td
                                key={field.key}
                                className={isInvalid ? `${transactionTableCellClassName} bg-red-100 text-red-700 font-semibold` : transactionTableCellClassName}
                                onDoubleClick={() => setEditingCell({ rowId: rowKey, key })}
                              >
                                {editingCell?.rowId === rowKey && editingCell?.key === key ? (
                                  <input
                                    autoFocus
                                    type="text"
                                    value={val || ""}
                                    onChange={(e) => {
                                      const newValue = e.target.value;
                                      setStockItems(prev => prev.map((r, idx) =>
                                        (r._rowId || idx) === rowKey
                                          ? {
                                            ...r,
                                            [key]: newValue,
                                            ...(key === "item_name" ? { itemId: "" } : {}),
                                            ...(key === "size" ? { sizeId: "" } : {}),
                                            ...(key === "color" ? { colorId: "" } : {}),
                                            ...(key === "uom" ? { _uomId: "" } : {}),
                                          }
                                          : r
                                      ));
                                    }}
                                    onBlur={() => setEditingCell(null)}
                                    onKeyDown={(e) => { if (e.key === "Enter") setEditingCell(null); }}
                                    className={transactionTableSelectInputClassName}
                                  />
                                ) : (
                                  <div className="flex min-h-[20px] w-full cursor-pointer items-center">{val}</div>
                                )}
                              </td>
                            );
                          })}
                          <td className={transactionTableActionCellClassName}>
                            <button
                              onClick={() => setStockItems(prev => prev.filter((r, idx) => (r._rowId || idx) !== (row._rowId || rowIndex)))}
                              className={`${transactionTableActionButtonClassName} inline-flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700`}
                              title="Delete Row"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          )}
        </TransactionLineItemsSection>
      </div>

      <Modal
        isOpen={missingMasterReview.isOpen}
        onClose={closeMissingMasterReview}
        widthClass="w-[720px] max-w-[95vw]"
      >
        <div className="flex max-h-[80vh] flex-col bg-white">
          <div className="mb-4 border-b pb-3">
            <h2 className="text-lg font-semibold text-slate-800">Review Missing Masters</h2>
            <p className="mt-1 text-sm text-slate-500">
              Complete any required color codes, then confirm the batch creation.
            </p>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto pr-1">
            {missingMasterReview.items.length > 0 ? (
              <div>
                <h3 className="text-sm font-semibold text-slate-700">Missing Items</h3>
                <p className="mt-1 text-sm text-slate-600">{missingMasterReview.items.join(", ")}</p>
              </div>
            ) : null}

            {missingMasterReview.sizes.length > 0 ? (
              <div>
                <h3 className="text-sm font-semibold text-slate-700">Missing Sizes</h3>
                <p className="mt-1 text-sm text-slate-600">{missingMasterReview.sizes.join(", ")}</p>
              </div>
            ) : null}

            {missingMasterReview.colors.length > 0 ? (
              <div>
                <h3 className="text-sm font-semibold text-slate-700">Missing Colors</h3>
                <div className="mt-2 overflow-hidden rounded-md border border-slate-200">
                  <table className="w-full table-fixed border-collapse">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="border border-slate-200 px-2 py-2 text-left text-xs font-semibold text-slate-600">Color Name</th>
                        <th className="border border-slate-200 px-2 py-2 text-left text-xs font-semibold text-slate-600">Color Code</th>
                      </tr>
                    </thead>
                    <tbody>
                      {missingMasterReview.colors.map((color) => (
                        <tr key={color.name}>
                          <td className="border border-slate-200 px-2 py-2 text-sm font-medium uppercase text-slate-700">
                            {color.name}
                          </td>
                          <td className="border border-slate-200 px-2 py-2 align-top">
                            <input
                              type="text"
                              value={color.code}
                              onChange={(e) => {
                                const nextCode = normalizeCodeValue(e.target.value);
                                setMissingMasterReview((prev) => ({
                                  ...prev,
                                  colors: prev.colors.map((entry) =>
                                    entry.name === color.name ? { ...entry, code: nextCode } : entry
                                  ),
                                }));
                              }}
                              placeholder="Enter color code"
                              className={`w-full rounded border px-2 py-1.5 text-sm uppercase outline-none ${
                                reviewErrors[color.name]
                                  ? "border-red-400 bg-red-50 text-red-700"
                                  : "border-slate-300"
                              }`}
                            />
                            {reviewErrors[color.name] ? (
                              <p className="mt-1 text-xs text-red-600">{reviewErrors[color.name]}</p>
                            ) : null}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-5 flex justify-end gap-2 border-t pt-4">
            <button
              type="button"
              onClick={closeMissingMasterReview}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={hasColorReviewErrors}
              onClick={async () => {
                const reviewData = {
                  items: [...missingMasterReview.items],
                  sizes: [...missingMasterReview.sizes],
                  colors: missingMasterReview.colors.map((color) => ({
                    ...color,
                    code: normalizeCodeValue(color.code),
                  })),
                };
                closeMissingMasterReview();
                await processStockSave({
                  missingItems: reviewData.items,
                  missingSizes: reviewData.sizes,
                  reviewedColors: reviewData.colors,
                });
              }}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Create & Continue
            </button>
          </div>
        </div>
      </Modal>
    </div>

  );
};

export default ExcelSelectionTable;
