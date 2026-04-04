import React from "react";
import { read, utils } from "xlsx";
import { FiDownload, FiFileText, FiPlus, FiRotateCcw, FiSave, FiUploadCloud, FiX } from "react-icons/fi";
import { FaQuestionCircle } from "react-icons/fa";
import Select from "react-select";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useAddOpeningStockMutation } from "../../../redux/services/StockService";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService";
import { useAddColorMasterMutation, useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { useAddItemMasterMutation, useGetItemMasterQuery, useUpdateItemMasterMutation } from "../../../redux/uniformService/ItemMasterService";
import { useGetLocationMasterQuery } from "../../../redux/uniformService/LocationMasterServices";
import { useAddSizeMasterMutation, useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { useGetStockReportControlQuery } from "../../../redux/uniformService/StockReportControl.Services";
import { useAddUnitOfMeasurementMasterMutation, useGetUnitOfMeasurementMasterQuery } from "../../../redux/uniformService/UnitOfMeasurementServices";
import {
  getCommonParams,
  getStockMaintenanceConfig,
  normalizeMasterValue,
} from "../../../Utils/helper";
import Modal from "../../../UiComponents/Modal";
import TransactionLineItemsSection, {
  transactionTableActionButtonClassName,
  transactionTableActionCellClassName,
  transactionTableClassName,
  transactionTableFocusCellClassName,
  transactionTableHeadClassName,
  transactionTableHeaderCellClassName,
  transactionTableIndexCellClassName,
  transactionTableNumberInputClassName,
  transactionTableSelectInputClassName,
} from "../ReusableComponents/TransactionLineItemsSection";
import {
  createOpeningStockRowDefaults,
  getOpeningStockFieldDefinitions,
  getOpeningStockHeaderMap,
  getOpeningStockTemplateRow,
} from "./openingStockSchema";

const OPENING_STOCK_CREATION_SOURCE = "OPENING_STOCK";

const escapeCsvValue = (value) => {
  const stringValue = value?.toString() ?? "";
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

const normalizeLookupValue = (value) => (value || "").toString().trim().toLowerCase();
const normalizeCodeValue = (value) => value?.toString().trim().toUpperCase() || "";
const normalizeNumericValue = (value) => (value === undefined || value === null ? "" : value);

const createRowId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

function findByName(name, list = []) {
  const normalizedName = normalizeLookupValue(name);
  if (!normalizedName) return undefined;
  return list.find((entry) => normalizeLookupValue(entry?.name) === normalizedName);
}

function buildLegacySeedMap(rows = []) {
  const nameToCode = new Map();
  const codeToName = new Map();

  rows.forEach((row, index) => {
    const normalizedName = normalizeLookupValue(row?.item_name);
    const normalizedCode = normalizeCodeValue(row?.item_code);

    if (!normalizedName || !normalizedCode) {
      return;
    }

    const existingCodeForName = nameToCode.get(normalizedName);
    if (existingCodeForName && existingCodeForName !== normalizedCode) {
      throw Error(`Opening stock row ${index + 1} uses a different item code for item ${row?.item_name}.`);
    }

    const existingNameForCode = codeToName.get(normalizedCode);
    if (existingNameForCode && existingNameForCode !== normalizedName) {
      throw Error(`Opening stock row ${index + 1} reuses item code ${normalizedCode} for a different item name.`);
    }

    nameToCode.set(normalizedName, normalizedCode);
    codeToName.set(normalizedCode, normalizedName);
  });

  return {
    nameToCode,
    codeToName,
  };
}

function getExistingLegacyBarcode(item) {
  return normalizeCodeValue(item?.ItemPriceList?.[0]?.barcode);
}

function getExistingLegacySalesPrice(item) {
  return item?.ItemPriceList?.[0]?.salesPrice;
}

const ExcelSelectionTable = ({ file, setFile, params, stockItems = [], setStockItems }) => {
  const { branchId, companyId, finYearId, userId } = getCommonParams();

  const [selectedBranchId, setSelectedBranchId] = React.useState("");
  const [selectedLocationId, setSelectedLocationId] = React.useState("");
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

  const itemQueryParams = React.useMemo(() => ({ ...params, active: true }), [params]);
  const { data: itemList } = useGetItemMasterQuery({ params: itemQueryParams });
  const { data: sizeList } = useGetSizeMasterQuery({ params });
  const { data: colorList } = useGetColorMasterQuery({ params });
  const { data: stockReportControlData } = useGetStockReportControlQuery({ params });
  const { data: uomList } = useGetUnitOfMeasurementMasterQuery({ params });
  const { data: branchList } = useGetBranchQuery({ params: { companyId } });
  const { data: locationList } = useGetLocationMasterQuery({ params: { branchId: selectedBranchId } });

  const [addOpeningStock] = useAddOpeningStockMutation();
  const [addItem] = useAddItemMasterMutation();
  const [updateItem] = useUpdateItemMasterMutation();
  const [addSize] = useAddSizeMasterMutation();
  const [addColor] = useAddColorMasterMutation();
  const [addUom] = useAddUnitOfMeasurementMasterMutation();

  const branchOptions = branchList?.data?.map((branch) => ({ value: branch.id, label: branch.branchName })) || [];
  const locationOptions = locationList?.data?.map((location) => ({ value: location.id, label: location.storeName })) || [];
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
  const legacyItems = React.useMemo(
    () => (itemList?.data || []).filter((item) => item.active && item.isLegacy),
    [itemList]
  );
  const itemByName = React.useMemo(
    () => new Map(legacyItems.map((item) => [normalizeLookupValue(item.name), item])),
    [legacyItems]
  );
  const sizeByName = React.useMemo(
    () => new Map((sizeList?.data || []).map((size) => [normalizeLookupValue(size.name), size])),
    [sizeList]
  );
  const colorByName = React.useMemo(
    () => new Map((colorList?.data || []).map((color) => [normalizeLookupValue(color.name), color])),
    [colorList]
  );
  const uomOptions = React.useMemo(
    () => (uomList?.data || []).map((uom) => ({ value: uom.id, label: uom.name })),
    [uomList]
  );
  const existingColorCodeMap = React.useMemo(
    () =>
      new Map(
        (colorList?.data || [])
          .map((color) => [normalizeCodeValue(color?.code), normalizeMasterValue(color?.name || "")])
          .filter(([code]) => Boolean(code))
      ),
    [colorList]
  );

  const createManualRow = React.useCallback(() => {
    const pcsUom = findByName("PCS", uomList?.data || []);
    return {
      _rowId: createRowId(),
      ...createOpeningStockRowDefaults(openingStockFields),
      uom: pcsUom?.name || "",
      uomId: pcsUom?.id || "",
    };
  }, [openingStockFields, uomList]);

  const closeMissingMasterReview = React.useCallback(() => {
    setMissingMasterReview({
      isOpen: false,
      items: [],
      sizes: [],
      colors: [],
    });
  }, []);

  const getResolvedItem = React.useCallback((row) => {
    const resolvedFromState = row?.itemId
      ? legacyItems.find((item) => String(item.id) === String(row.itemId))
      : undefined;
    return resolvedFromState || itemByName.get(normalizeLookupValue(row?.item_name));
  }, [itemByName, legacyItems]);

  const getResolvedSize = React.useCallback((row) => {
    const resolvedFromState = row?.sizeId
      ? (sizeList?.data || []).find((size) => String(size.id) === String(row.sizeId))
      : undefined;
    return resolvedFromState || sizeByName.get(normalizeLookupValue(row?.size));
  }, [sizeByName, sizeList]);

  const getResolvedColor = React.useCallback((row) => {
    const resolvedFromState = row?.colorId
      ? (colorList?.data || []).find((color) => String(color.id) === String(row.colorId))
      : undefined;
    return resolvedFromState || colorByName.get(normalizeLookupValue(row?.color));
  }, [colorByName, colorList]);

  const getResolvedUom = React.useCallback((row) => {
    const resolvedFromState = row?.uomId
      ? (uomList?.data || []).find((uom) => String(uom.id) === String(row.uomId))
      : undefined;
    return resolvedFromState || findByName(row?.uom, uomList?.data || []);
  }, [uomList]);

  const updateRows = React.useCallback((updater) => {
    setStockItems((previousRows) => updater(previousRows));
  }, [setStockItems]);

  const updateRowField = React.useCallback((rowId, fieldKey, nextValue) => {
    updateRows((previousRows) =>
      previousRows.map((row) => {
        if (row._rowId !== rowId) return row;

        const updatedRow = {
          ...row,
          [fieldKey]: nextValue,
        };

        if (fieldKey === "item_name") {
          updatedRow.itemId = "";
        }

        if (fieldKey === "size") {
          updatedRow.sizeId = "";
        }

        if (fieldKey === "color") {
          updatedRow.colorId = "";
        }

        if (fieldKey === "uom") {
          updatedRow.uomId = "";
        }

        return updatedRow;
      })
    );
  }, [updateRows]);

  const addManualRow = React.useCallback(() => {
    updateRows((previousRows) => [...previousRows, createManualRow()]);
  }, [createManualRow, updateRows]);

  const clearWorkspace = React.useCallback(() => {
    setFile(null);
    closeMissingMasterReview();
    setStockItems([]);
    const input = document.getElementById("openingStockFileInput");
    if (input) {
      input.value = "";
    }
  }, [closeMissingMasterReview, setFile, setStockItems]);

  const isFieldValueMissing = React.useCallback((row, field) => {
    const value = row?.[field.key];

    if (field.key === "qty") {
      return !value || Number(value) <= 0;
    }

    if (field.key === "uom") {
      return !getResolvedUom(row)?.id;
    }

    return !value?.toString().trim();
  }, [getResolvedUom]);

  const getRowStatus = React.useCallback((row) => {
    const requiredField = openingStockFields.find((field) => field.required && isFieldValueMissing(row, field));
    if (requiredField) {
      return {
        tone: "missing",
        label: "Missing Fields",
        detail: requiredField.label,
      };
    }

    const resolvedItem = getResolvedItem(row);
    if (normalizeLookupValue(row?.item_name) && !resolvedItem) {
      return {
        tone: "pending",
        label: "Pending Item",
        detail: row.item_name,
      };
    }

    if (stockMaintenance.trackSize && normalizeLookupValue(row?.size) && !getResolvedSize(row)) {
      return {
        tone: "pending",
        label: "Pending Size",
        detail: row.size,
      };
    }

    if (stockMaintenance.trackColor && normalizeLookupValue(row?.color) && !getResolvedColor(row)) {
      return {
        tone: "pending",
        label: "Pending Color",
        detail: row.color,
      };
    }

    return {
      tone: "ready",
      label: "Ready",
      detail: "",
    };
  }, [getResolvedColor, getResolvedItem, getResolvedSize, isFieldValueMissing, openingStockFields, stockMaintenance.trackColor, stockMaintenance.trackSize]);

  const getColorReviewErrors = React.useCallback((reviewColors = missingMasterReview.colors) => {
    const codeCounts = reviewColors.reduce((accumulator, color) => {
      const normalizedCode = normalizeCodeValue(color.code);
      if (!normalizedCode) return accumulator;
      accumulator[normalizedCode] = (accumulator[normalizedCode] || 0) + 1;
      return accumulator;
    }, {});

    return reviewColors.reduce((accumulator, color) => {
      const normalizedCode = normalizeCodeValue(color.code);

      if (!normalizedCode) {
        accumulator[color.name] = "Color code is required.";
        return accumulator;
      }

      if (codeCounts[normalizedCode] > 1) {
        accumulator[color.name] = "Color code must be unique within this batch.";
        return accumulator;
      }

      const existingColorName = existingColorCodeMap.get(normalizedCode);
      if (existingColorName) {
        accumulator[color.name] = `Code ${normalizedCode} is already associated with color ${existingColorName}.`;
      }

      return accumulator;
    }, {});
  }, [existingColorCodeMap, missingMasterReview.colors]);

  const getMissingRequiredRowMessage = React.useCallback(() => {
    for (const field of openingStockFields.filter((entry) => entry.required)) {
      const missingRowIndex = stockItems.findIndex((row) => isFieldValueMissing(row, field));
      if (missingRowIndex !== -1) {
        return `${field.label} is required at row ${missingRowIndex + 1}`;
      }
    }

    return "";
  }, [isFieldValueMissing, openingStockFields, stockItems]);

  const buildMissingReviewState = React.useCallback(() => {
    buildLegacySeedMap(stockItems);

    const missingItems = [];
    const missingSizes = [];
    const missingColors = [];
    const seenItems = new Set();
    const seenSizes = new Set();
    const seenColors = new Set();

    stockItems.forEach((row) => {
      const normalizedItemName = normalizeLookupValue(row?.item_name);
      const normalizedSize = normalizeLookupValue(row?.size);
      const normalizedColor = normalizeLookupValue(row?.color);

      if (normalizedItemName && !getResolvedItem(row) && !seenItems.has(normalizedItemName)) {
        seenItems.add(normalizedItemName);
        missingItems.push({
          name: normalizeMasterValue(row.item_name),
          itemCode: normalizeCodeValue(row.item_code),
          price: row.price || "",
        });
      }

      if (stockMaintenance.trackSize && normalizedSize && !getResolvedSize(row) && !seenSizes.has(normalizedSize)) {
        seenSizes.add(normalizedSize);
        missingSizes.push(normalizeMasterValue(row.size));
      }

      if (stockMaintenance.trackColor && normalizedColor && !getResolvedColor(row) && !seenColors.has(normalizedColor)) {
        seenColors.add(normalizedColor);
        missingColors.push({
          name: normalizeMasterValue(row.color),
          code: "",
        });
      }
    });

    return {
      items: missingItems,
      sizes: missingSizes,
      colors: missingColors,
    };
  }, [getResolvedColor, getResolvedItem, getResolvedSize, stockItems, stockMaintenance.trackColor, stockMaintenance.trackSize]);

  const hydrateExistingLegacyItems = React.useCallback(async () => {
    const hydratedItemIds = new Set();

    for (const row of stockItems) {
      const existingItem = getResolvedItem(row);
      if (!existingItem || hydratedItemIds.has(existingItem.id)) {
        continue;
      }

      const normalizedItemCode = normalizeCodeValue(row.item_code);
      const nextCode = existingItem.code || normalizedItemCode;
      const existingPriceRow = existingItem.ItemPriceList?.[0] || {};
      const nextBarcode = getExistingLegacyBarcode(existingItem) || normalizedItemCode;
      const nextSalesPrice = existingPriceRow?.salesPrice || row.price || 0;
      const shouldHydrate = (!existingItem.code && normalizedItemCode)
        || (!getExistingLegacyBarcode(existingItem) && normalizedItemCode)
        || (!existingPriceRow?.salesPrice && row.price);

      if (shouldHydrate) {
        await updateItem({
          id: existingItem.id,
          name: existingItem.name,
          code: nextCode,
          sectionId: existingItem.sectionId,
          mainCategory: existingItem.mainCategoryId,
          subCategory: existingItem.subCategoryId,
          active: existingItem.active,
          isLegacy: true,
          itemPriceList: [
            {
              id: existingPriceRow.id,
              sizeId: null,
              colorId: null,
              offerPrice: existingPriceRow.offerPrice || 0,
              salesPrice: nextSalesPrice,
              sku: existingPriceRow.sku || "",
              barcode: nextBarcode,
              MinimumStockQty: existingPriceRow.MinimumStockQty || [],
            },
          ],
        }).unwrap();
      }

      hydratedItemIds.add(existingItem.id);
    }
  }, [getResolvedItem, stockItems, updateItem]);

  const processStockSave = React.useCallback(async ({
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
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const newSizeIdMap = {};
      for (const sizeName of missingSizes) {
        const response = await addSize({
          name: sizeName,
          code: sizeName,
          companyId,
          branchId,
          active: true,
        }).unwrap();
        if (response.data?.id) {
          newSizeIdMap[normalizeLookupValue(sizeName)] = response.data.id;
        }
      }

      const newColorIdMap = {};
      for (const color of reviewedColors) {
        const response = await addColor({
          name: color.name,
          code: normalizeCodeValue(color.code),
          companyId,
          branchId,
          active: true,
        }).unwrap();
        if (response.data?.id) {
          newColorIdMap[normalizeLookupValue(color.name)] = response.data.id;
        }
      }

      let pcsId = getResolvedUom({ uom: "PCS" })?.id;
      if (!pcsId) {
        const response = await addUom({
          name: "PCS",
          code: "PCS",
          companyId,
          branchId,
          active: true,
        }).unwrap();
        pcsId = response.data?.id;
      }

      await hydrateExistingLegacyItems();

      const newItemIdMap = {};
      for (const item of missingItems) {
        const normalizedName = normalizeMasterValue(item.name);
        const normalizedItemCode = normalizeCodeValue(item.itemCode || item.name);
        const response = await addItem({
          name: normalizedName,
          code: normalizedItemCode,
          active: true,
          isLegacy: true,
          creationSource: OPENING_STOCK_CREATION_SOURCE,
          itemPriceList: [
            {
              sizeId: null,
              colorId: null,
              salesPrice: item.price ? parseFloat(item.price) : 0,
              offerPrice: 0,
              barcode: normalizedItemCode,
            },
          ],
          companyId,
          branchId,
          storeId: selectedLocationId,
        }).unwrap();

        const createdItemId = response.data?.data?.id || response.data?.id;
        if (createdItemId) {
          newItemIdMap[normalizeLookupValue(item.name)] = createdItemId;
        }
      }

      const mappedStockItems = stockItems.map((row) => {
        const resolvedItem = getResolvedItem(row);
        const resolvedSize = getResolvedSize(row);
        const resolvedColor = getResolvedColor(row);
        const resolvedUom = getResolvedUom(row);

        return {
          ...row,
          itemId: newItemIdMap[normalizeLookupValue(row.item_name)] || resolvedItem?.id || row.itemId || null,
          sizeId: newSizeIdMap[normalizeLookupValue(row.size)] || resolvedSize?.id || row.sizeId || null,
          colorId: newColorIdMap[normalizeLookupValue(row.color)] || resolvedColor?.id || row.colorId || null,
          uomId: resolvedUom?.id || row.uomId || pcsId || null,
          barcode: normalizeCodeValue(row.item_code),
        };
      });

      setStockItems(mappedStockItems);

      const payload = {
        branchId: selectedBranchId,
        storeId: selectedLocationId,
        companyId,
        finYearId,
        userId,
        stockItems: mappedStockItems.map(({ _rowId, item_name, item_code, size, color, uom, ...rest }) => ({
          ...rest,
          barcode: normalizeCodeValue(item_code),
        })),
      };

      const returnData = await addOpeningStock(payload).unwrap();

      if (returnData.statusCode === 1) {
        Swal.fire({ icon: "error", title: returnData?.message, showConfirmButton: false });
      } else if (returnData.statusCode === 0) {
        Swal.fire({ icon: "success", title: "Stock Added Successfully", showConfirmButton: false });
      } else {
        toast.error(returnData?.message);
      }
    } catch (error) {
      Swal.fire("Error", "Failed to save: " + (error.data?.message || error.message), "error");
    }
  }, [
    addColor,
    addItem,
    addOpeningStock,
    addSize,
    addUom,
    branchId,
    companyId,
    finYearId,
    getMissingRequiredRowMessage,
    getResolvedColor,
    getResolvedItem,
    getResolvedSize,
    getResolvedUom,
    hydrateExistingLegacyItems,
    selectedBranchId,
    selectedLocationId,
    setStockItems,
    stockItems,
    userId,
  ]);

  const saveData = React.useCallback(async () => {
    if (stockItems.length === 0) {
      toast.warning("Please add at least one row before saving.");
      return;
    }

    try {
      buildLegacySeedMap(stockItems);
    } catch (error) {
      toast.error(error.message);
      return;
    }

    const reviewState = buildMissingReviewState();
    if (reviewState.items.length || reviewState.sizes.length || reviewState.colors.length) {
      setMissingMasterReview({
        isOpen: true,
        ...reviewState,
      });
      return;
    }

    await processStockSave({
      missingItems: reviewState.items,
      missingSizes: reviewState.sizes,
      reviewedColors: [],
    });
  }, [buildMissingReviewState, processStockSave, stockItems]);

  const loadFile = React.useCallback((selectedFile = file) => {
    if (!selectedFile) {
      toast.warning("Please select a file first.");
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = read(data, { type: "array" });
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      const jsonData = utils.sheet_to_json(worksheet, { header: 1, raw: false });
      const headerNames = jsonData.shift() || [];

      const transformedRows = jsonData
        .filter((row) => row.some((cell) => cell !== undefined && cell !== null && cell.toString().trim() !== ""))
        .map((row) => {
          const nextRow = {
            _rowId: createRowId(),
            ...createOpeningStockRowDefaults(openingStockFields),
          };

          headerNames.forEach((header, index) => {
            const key = openingStockHeaderMap.get(header?.toString().trim().toLowerCase());
            if (key) {
              nextRow[key] = row[index];
            }
          });

          const resolvedItem = itemByName.get(normalizeLookupValue(nextRow.item_name));
          const resolvedSize = sizeByName.get(normalizeLookupValue(nextRow.size));
          const resolvedColor = colorByName.get(normalizeLookupValue(nextRow.color));
          const resolvedUom = findByName(nextRow.uom, uomList?.data || []);

          nextRow.itemId = resolvedItem?.id || "";
          nextRow.sizeId = resolvedSize?.id || "";
          nextRow.colorId = resolvedColor?.id || "";
          nextRow.uomId = resolvedUom?.id || "";

          return nextRow;
        });

      updateRows((previousRows) => [...previousRows, ...transformedRows]);
    };

    reader.readAsArrayBuffer(selectedFile);
  }, [colorByName, file, itemByName, openingStockFields, openingStockHeaderMap, sizeByName, uomList, updateRows]);

  const handleFileChange = React.useCallback((event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    loadFile(selectedFile);
  }, [loadFile, setFile]);

  const downloadTemplate = React.useCallback(() => {
    const csvRows = [
      openingStockFields.map((field) => escapeCsvValue(field.label)).join(","),
      openingStockFields.map((field) => escapeCsvValue(openingStockTemplateRow[field.label])).join(","),
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
  }, [openingStockFields, openingStockTemplateRow]);

  const reviewErrors = getColorReviewErrors();
  const hasColorReviewErrors = Object.keys(reviewErrors).length > 0;

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="flex min-h-0 w-full flex-1 flex-col gap-5">
        <div className="mt-3 flex shrink-0 flex-col gap-4">
          <div className="flex w-full items-end justify-between gap-2">
            <div className="flex min-w-0 items-end gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-600">Select Branch</label>
                <div className="w-52">
                  <Select
                    options={branchOptions}
                    value={branchOptions.find((option) => option.value === selectedBranchId)}
                    onChange={(option) => {
                      setSelectedBranchId(option?.value || "");
                      setSelectedLocationId("");
                    }}
                    placeholder="Branch..."
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={{
                      control: (base) => ({ ...base, minHeight: "30px", height: "30px", fontSize: "12px" }),
                      indicatorsContainer: (base) => ({ ...base, height: "30px" }),
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                      menu: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-600">Select Location</label>
                <div className="w-52">
                  <Select
                    options={locationOptions}
                    value={locationOptions.find((option) => option.value === selectedLocationId)}
                    onChange={(option) => setSelectedLocationId(option?.value || "")}
                    placeholder="Location..."
                    isClearable
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={{
                      control: (base) => ({ ...base, minHeight: "30px", height: "30px", fontSize: "12px" }),
                      indicatorsContainer: (base) => ({ ...base, height: "30px" }),
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                      menu: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-600">Load File</label>
                <div className="flex h-8 w-[240px] items-center gap-2 rounded-lg bg-white">
                  <input
                    id="openingStockFileInput"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="openingStockFileInput"
                    className="inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-emerald-500 bg-white px-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-500 hover:text-white"
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
                  {file ? (
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        const input = document.getElementById("openingStockFileInput");
                        if (input) input.value = "";
                      }}
                      className="inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                      aria-label="Clear selected file"
                    >
                      <FiX className="h-3 w-3" />
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  onClick={downloadTemplate}
                  className="inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border border-indigo-500 bg-white px-3 text-sm font-semibold text-indigo-600 transition-colors hover:bg-indigo-500 hover:text-white"
                >
                  <FiDownload className="h-3.5 w-3.5" />
                  Template
                </button>
                <div className="group relative z-30">
                  <button
                    type="button"
                    className="text-slate-400 transition-colors hover:text-slate-600"
                    aria-label="Opening stock import template help"
                  >
                    <FaQuestionCircle className="cursor-help text-sm" />
                  </button>
                  <div className="pointer-events-none absolute right-0 top-full z-[80] mt-2 w-56 rounded-md bg-slate-800 px-3 py-2 text-[11px] leading-4 text-white shadow-lg opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                    Download the template that matches your current stock-control fields, fill it in Excel, then load it into this table.
                  </div>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-row items-center gap-1.5">
              <button
                onClick={addManualRow}
                className="inline-flex h-8 items-center whitespace-nowrap rounded-md border border-emerald-500 bg-white px-3 text-sm font-semibold text-emerald-700 shadow-sm transition-all hover:bg-emerald-500 hover:text-white"
              >
                <FiPlus className="mr-2 h-4 w-4" />
                Add Row
              </button>
              <button
                onClick={saveData}
                className="inline-flex h-8 items-center whitespace-nowrap rounded-md border border-indigo-500 bg-white px-3 text-sm font-semibold text-indigo-600 shadow-sm transition-all hover:bg-indigo-500 hover:text-white"
              >
                <FiSave className="mr-2 h-4 w-4" />
                Save Stock
              </button>
              <button
                onClick={clearWorkspace}
                className="inline-flex h-8 items-center whitespace-nowrap rounded-md border border-red-500 bg-white px-3 text-sm font-semibold text-red-600 shadow-sm transition-all hover:bg-red-500 hover:text-white"
              >
                <FiRotateCcw className="mr-2 h-4 w-4" />
                Reset
              </button>
            </div>
          </div>
        </div>

        <TransactionLineItemsSection panelClassName="min-h-0 w-full flex-1" contentClassName="min-h-0">
          {stockItems.length === 0 ? (
            <div className="flex h-full min-h-[240px] items-center justify-center px-6 text-center">
              <div className="max-w-md">
                <p className="text-sm font-semibold text-slate-700">No rows yet.</p>
                <p className="mt-1 text-sm text-slate-500">Load a file or add a row to start building your opening stock batch.</p>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-0 overflow-auto">
              <table className={transactionTableClassName}>
                <thead className={transactionTableHeadClassName}>
                  <tr>
                    <th className={`${transactionTableHeaderCellClassName} w-12`}>S.No</th>
                    {openingStockFields.map((field) => (
                      <th key={field.key} className={`${transactionTableHeaderCellClassName} ${field.widthClass || ""}`}>
                        {field.label}
                      </th>
                    ))}
                    <th className={`${transactionTableHeaderCellClassName} w-32`}>Status</th>
                    <th className={`${transactionTableHeaderCellClassName} w-16`}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stockItems.map((row, rowIndex) => {
                    const rowStatus = getRowStatus(row);

                    return (
                      <tr key={row._rowId || rowIndex} className="border border-blue-gray-200">
                        <td className={transactionTableIndexCellClassName}>{rowIndex + 1}</td>
                        {openingStockFields.map((field) => {
                          const isInvalid = field.required && isFieldValueMissing(row, field);
                          const cellClassName = isInvalid
                            ? `${transactionTableFocusCellClassName} bg-red-100`
                            : transactionTableFocusCellClassName;

                          if (field.key === "uom") {
                            const resolvedUomId = getResolvedUom(row)?.id || "";
                            return (
                              <td key={field.key} className={cellClassName}>
                                <Select
                                  options={uomOptions}
                                  value={uomOptions.find((option) => String(option.value) === String(resolvedUomId)) || null}
                                  onChange={(option) => {
                                    updateRows((previousRows) =>
                                      previousRows.map((entry) =>
                                        entry._rowId === row._rowId
                                          ? {
                                              ...entry,
                                              uomId: option?.value || "",
                                              uom: option?.label || "",
                                            }
                                          : entry
                                      )
                                    );
                                  }}
                                  placeholder="UOM..."
                                  styles={{
                                    control: (base) => ({ ...base, minHeight: "30px", height: "30px", fontSize: "12px" }),
                                    indicatorsContainer: (base) => ({ ...base, height: "30px" }),
                                  }}
                                />
                              </td>
                            );
                          }

                          const inputType = field.type === "number" ? "number" : "text";
                          const inputClassName = field.type === "number"
                            ? transactionTableNumberInputClassName
                            : transactionTableSelectInputClassName;

                          return (
                            <td key={field.key} className={cellClassName}>
                              <input
                                type={inputType}
                                value={normalizeNumericValue(row[field.key])}
                                onChange={(event) => updateRowField(row._rowId, field.key, event.target.value)}
                                className={inputClassName}
                              />
                            </td>
                          );
                        })}
                        <td className={transactionTableActionCellClassName}>
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${
                              rowStatus.tone === "ready"
                                ? "bg-emerald-100 text-emerald-700"
                                : rowStatus.tone === "missing"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {rowStatus.label}
                          </span>
                        </td>
                        <td className={transactionTableActionCellClassName}>
                          <button
                            onClick={() => updateRows((previousRows) => previousRows.filter((entry) => entry._rowId !== row._rowId))}
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
                  })}
                </tbody>
              </table>
            </div>
          )}
        </TransactionLineItemsSection>
      </div>

      <Modal isOpen={missingMasterReview.isOpen} onClose={closeMissingMasterReview} widthClass="w-[720px] max-w-[95vw]">
        <div className="flex max-h-[80vh] flex-col bg-white">
          <div className="mb-4 border-b pb-3">
            <h2 className="text-lg font-semibold text-slate-800">Review Missing Masters</h2>
            <p className="mt-1 text-sm text-slate-500">Complete any required color codes, then confirm the batch creation.</p>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto pr-1">
            {missingMasterReview.items.length > 0 ? (
              <div>
                <h3 className="text-sm font-semibold text-slate-700">Missing Items</h3>
                <div className="mt-2 overflow-hidden rounded-md border border-slate-200">
                  <table className="w-full table-fixed border-collapse">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="border border-slate-200 px-2 py-2 text-left text-xs font-semibold text-slate-600">Item Name</th>
                        <th className="border border-slate-200 px-2 py-2 text-left text-xs font-semibold text-slate-600">Item Code</th>
                        <th className="border border-slate-200 px-2 py-2 text-left text-xs font-semibold text-slate-600">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {missingMasterReview.items.map((item) => (
                        <tr key={item.name}>
                          <td className="border border-slate-200 px-2 py-2 text-sm font-medium uppercase text-slate-700">{item.name}</td>
                          <td className="border border-slate-200 px-2 py-2 text-sm uppercase text-slate-700">{item.itemCode}</td>
                          <td className="border border-slate-200 px-2 py-2 text-sm text-slate-700">{item.price || "0"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
                          <td className="border border-slate-200 px-2 py-2 text-sm font-medium uppercase text-slate-700">{color.name}</td>
                          <td className="border border-slate-200 px-2 py-2 align-top">
                            <input
                              type="text"
                              value={color.code}
                              onChange={(event) => {
                                const nextCode = normalizeCodeValue(event.target.value);
                                setMissingMasterReview((previousReview) => ({
                                  ...previousReview,
                                  colors: previousReview.colors.map((entry) =>
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
