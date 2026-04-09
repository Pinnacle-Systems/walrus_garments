import React, { useEffect, useState } from "react";
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
  standardTransactionPlaceholderRowCount,
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
import TransactionEntryShell from "../ReusableComponents/TransactionEntryShell";
import TransactionHeaderSection from "../ReusableComponents/TransactionHeaderSection";
import { DropdownInput } from "../../../Inputs";
import OpeningStockInput from "../ReusableComponents/SearchableTableCellSelectWithValue";
import {
  createOpeningStockRowDefaults,
  getOpeningStockFieldDefinitions,
  getOpeningStockHeaderMap,
  getOpeningStockTemplateRow,
} from "./openingStockSchema";
import SearchableTableCellSelectWithValue from "../ReusableComponents/SearchableTableCellSelectWithValue";
import SearchableTableCellSelect from "../ReusableComponents/SearchableTableCellSelect";

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
const normalizeManualFieldValue = (field, value) => {
  if (field?.type === "number" || field?.type === "uom") {
    return value;
  }

  return value?.toString().toUpperCase() ?? "";
};


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

function getExistingLegacyOfferPrice(item) {
  return item?.ItemPriceList?.[0]?.offerPrice;
}

function getRowSalesPrice(row) {
  if (row?.sales_price !== undefined && row?.sales_price !== null && `${row.sales_price}`.trim() !== "") {
    return row.sales_price;
  }

  return 0;
}

function getRowOfferPrice(row) {
  if (row?.offer_price !== undefined && row?.offer_price !== null && `${row.offer_price}`.trim() !== "") {
    return row.offer_price;
  }

  return 0;
}

function normalizeComparablePrice(value) {
  if (value === undefined || value === null || `${value}`.trim() === "") {
    return "";
  }

  return String(value).trim();
}

function applyResolvedLegacyItemToRow(row, resolvedItem) {
  if (!resolvedItem) {
    return row;
  }

  const existingPriceRow = resolvedItem.ItemPriceList?.[0] || {};

  return {
    ...row,
    itemId: resolvedItem.id || row.itemId || "",
    item_name: resolvedItem.name || row.item_name || "",
    item_code: row.item_code || resolvedItem.code || existingPriceRow.barcode || "",
    sales_price: normalizeComparablePrice(row.sales_price) ? row.sales_price : (existingPriceRow.salesPrice ?? row.sales_price),
    offer_price: normalizeComparablePrice(row.offer_price) ? row.offer_price : (existingPriceRow.offerPrice ?? row.offer_price),
  };
}

function clearResolvedLegacyItemFromRow(row) {
  return {
    ...row,
    itemId: "",
    item_name: "",
    item_code: "",
  };
}

const ExcelSelectionTable = ({ file, setFile, params, stockItems = [], setStockItems }) => {
  const { branchId, companyId, finYearId, userId } = getCommonParams();

  const [selectedBranchId, setSelectedBranchId] = React.useState("");
  const [selectedLocationId, setSelectedLocationId] = React.useState("");
  const [headerOpen, setHeaderOpen] = React.useState(true);
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
  const itemsByBarcode = React.useMemo(() => {
    const barcodeMap = new Map();

    legacyItems.forEach((item) => {
      const normalizedBarcode = getExistingLegacyBarcode(item);
      if (!normalizedBarcode) {
        return;
      }

      const matches = barcodeMap.get(normalizedBarcode) || [];
      matches.push(item);
      barcodeMap.set(normalizedBarcode, matches);
    });

    return barcodeMap;
  }, [legacyItems]);
  const itemLookupOptions = React.useMemo(
    () => legacyItems.map((item) => ({
      value: String(item.id),
      label: item.name || "",
      code: item.code || getExistingLegacyBarcode(item) || "",
    })),
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
  const sizeOptions = React.useMemo(
    () => (sizeList?.data || []).map((size) => ({ value: size.name, label: size.name })),
    [sizeList]
  );
  const colorOptions = React.useMemo(
    () => (colorList?.data || []).map((color) => ({ value: color.name, label: color.name })),
    [colorList]
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
      _entryMode: "manual",
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
  const getBarcodeMatches = React.useCallback((row) => {
    const normalizedBarcode = normalizeCodeValue(row?.item_code);
    if (!normalizedBarcode) {
      return [];
    }

    return itemsByBarcode.get(normalizedBarcode) || [];
  }, [itemsByBarcode]);
  const getItemIdentityAttentionState = React.useCallback((row) => {
    const normalizedName = normalizeLookupValue(row?.item_name);
    if (!normalizedName) {
      return null;
    }

    const resolvedItem = getResolvedItem(row);
    if (resolvedItem) {
      return null;
    }

    const barcodeMatches = getBarcodeMatches(row);
    const normalizedBarcode = normalizeCodeValue(row?.item_code);

    if (normalizedBarcode && barcodeMatches.length > 1) {
      return {
        tone: "conflict",
        message: `Barcode ${normalizedBarcode} matches multiple Item Master rows. Clean up Item Master before loading stock.`,
      };
    }

    if (normalizedBarcode && barcodeMatches.length === 1) {
      return {
        tone: "conflict",
        message: `Row name ${normalizeMasterValue(row.item_name)} differs from Item Master item ${barcodeMatches[0].name} for barcode ${normalizedBarcode}. Update Item Master before loading stock.`,
      };
    }

    return {
      tone: "pending",
      message: `Item ${normalizeMasterValue(row.item_name)} will be created during save`,
    };
  }, [getBarcodeMatches, getResolvedItem]);

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
    const fieldDefinition = openingStockFields.find((field) => field.key === fieldKey);
    const normalizedValue = normalizeManualFieldValue(fieldDefinition, nextValue);

    updateRows((previousRows) =>
      previousRows.map((row) => {
        if (row._rowId !== rowId) return row;

        const updatedRow = {
          ...row,
          [fieldKey]: normalizedValue,
        };

        if (fieldKey === "item_name") {
          updatedRow.itemId = "";
          const resolvedItem = itemByName.get(normalizeLookupValue(normalizedValue));
          if (resolvedItem) {
            return applyResolvedLegacyItemToRow(updatedRow, resolvedItem);
          }
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
  }, [itemByName, openingStockFields, updateRows]);

  const updateRowItemSelection = React.useCallback((rowId, itemIdOrName) => {
    updateRows((previousRows) =>
      previousRows.map((row) => {
        if (row._rowId !== rowId) return row;
        if (!itemIdOrName) {
          return clearResolvedLegacyItemFromRow(row);
        }

        const resolvedItem = legacyItems.find((item) => String(item.id) === String(itemIdOrName));
        if (resolvedItem) {
          return applyResolvedLegacyItemToRow(row, resolvedItem);
        }

        return {
          ...row,
          itemId: "",
          item_name: itemIdOrName,
        };
      })
    );
  }, [legacyItems, updateRows]);

  const addManualRow = React.useCallback(() => {
    updateRows((previousRows) => [...previousRows, createManualRow()]);
  }, [createManualRow, updateRows]);

  const clearWorkspace = React.useCallback(() => {
    setFile(null);
    setSelectedLocationId('')
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

  const getFieldAttentionState = React.useCallback((row, field) => {
    if (field.required && isFieldValueMissing(row, field)) {
      return {
        tone: "missing",
        message: `${field.label} is required`,
      };
    }

    if (field.key === "item_name") {
      const identityAttentionState = getItemIdentityAttentionState(row);
      if (identityAttentionState) {
        return identityAttentionState;
      }
    }

    if (field.key === "size" && stockMaintenance.trackSize && normalizeLookupValue(row?.size) && !getResolvedSize(row)) {
      return {
        tone: "pending",
        message: `Size ${normalizeMasterValue(row.size)} will be created during save`,
      };
    }

    if (field.key === "color" && stockMaintenance.trackColor && normalizeLookupValue(row?.color) && !getResolvedColor(row)) {
      return {
        tone: "pending",
        message: `Color ${normalizeMasterValue(row.color)} will be created during save`,
      };
    }

    return null;
  }, [
    getResolvedColor,
    getResolvedSize,
    getItemIdentityAttentionState,
    isFieldValueMissing,
    stockMaintenance.trackColor,
    stockMaintenance.trackSize,
  ]);

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

      const itemIdentityAttentionState = getItemIdentityAttentionState(row);
      if (normalizedItemName && itemIdentityAttentionState?.tone === "pending" && !seenItems.has(normalizedItemName)) {
        seenItems.add(normalizedItemName);
        missingItems.push({
          name: normalizeMasterValue(row.item_name),
          itemCode: normalizeCodeValue(row.item_code),
          salesPrice: getRowSalesPrice(row),
          offerPrice: getRowOfferPrice(row),
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
  }, [getItemIdentityAttentionState, getResolvedColor, getResolvedSize, stockItems, stockMaintenance.trackColor, stockMaintenance.trackSize]);

  const getExistingLegacyConflicts = React.useCallback(() => {
    const conflicts = [];

    stockItems.forEach((row, index) => {
      const itemIdentityAttentionState = getItemIdentityAttentionState(row);
      if (itemIdentityAttentionState?.tone === "conflict") {
        conflicts.push(`Row ${index + 1}: ${itemIdentityAttentionState.message}`);
        return;
      }

      const existingItem = getResolvedItem(row);
      if (!existingItem) {
        return;
      }

      const rowName = normalizeMasterValue(row?.item_name || "");
      const itemName = normalizeMasterValue(existingItem?.name || "");
      if (rowName && itemName && rowName !== itemName) {
        conflicts.push(`Row ${index + 1} item name differs from Item Master (${existingItem.name}). Update Item Master before loading stock.`);
      }

      const rowCode = normalizeCodeValue(row?.item_code);
      const itemCode = normalizeCodeValue(existingItem?.code);
      if (rowCode && itemCode && rowCode !== itemCode) {
        conflicts.push(`Row ${index + 1} item code ${rowCode} differs from Item Master code ${itemCode}. Update Item Master before loading stock.`);
      }

      const rowBarcode = normalizeCodeValue(row?.item_code);
      const itemBarcode = getExistingLegacyBarcode(existingItem);
      if (rowBarcode && itemBarcode && rowBarcode !== itemBarcode) {
        conflicts.push(`Row ${index + 1} barcode ${rowBarcode} differs from Item Master barcode ${itemBarcode}. Update Item Master before loading stock.`);
      }

      const rowSalesPrice = normalizeComparablePrice(getRowSalesPrice(row));
      const itemSalesPrice = normalizeComparablePrice(getExistingLegacySalesPrice(existingItem));
      if (rowSalesPrice && itemSalesPrice && rowSalesPrice !== itemSalesPrice) {
        conflicts.push(`Row ${index + 1} sales price ${rowSalesPrice} differs from Item Master sales price ${itemSalesPrice}. Update Item Master before loading stock.`);
      }

      // const rowOfferPrice = normalizeComparablePrice(getRowOfferPrice(row));
      // const itemOfferPrice = normalizeComparablePrice(getExistingLegacyOfferPrice(existingItem));
      // if (rowOfferPrice && itemOfferPrice && rowOfferPrice !== itemOfferPrice) {
      //   conflicts.push(`Row ${index + 1} offer price ${rowOfferPrice} differs from Item Master offer price ${itemOfferPrice}. Update Item Master before loading stock.`);
      // }
    });

    return conflicts;
  }, [getItemIdentityAttentionState, getResolvedItem, stockItems]);

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
      const nextSalesPrice = normalizeComparablePrice(getExistingLegacySalesPrice(existingItem)) || getRowSalesPrice(row);
      const nextOfferPrice = normalizeComparablePrice(getExistingLegacyOfferPrice(existingItem)) || getRowOfferPrice(row);
      const shouldHydrate = (!existingItem.code && normalizedItemCode)
        || (!getExistingLegacyBarcode(existingItem) && normalizedItemCode)
        || (!normalizeComparablePrice(getExistingLegacySalesPrice(existingItem)) && normalizeComparablePrice(row?.sales_price))
        || (!normalizeComparablePrice(getExistingLegacyOfferPrice(existingItem)) && normalizeComparablePrice(row?.offer_price));

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
              offerPrice: nextOfferPrice,
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
      // toast.warning("Please select a branch.");
      Swal.fire({
        text: "Please select a branch",
        icon: "warning",
      });
      return;
    }

    if (!selectedLocationId) {
      // toast.warning("Please select a location.");
      Swal.fire({
        text: "Please select a location",
        icon: "warning",

      });
      return;
    }

    const missingRequiredRowMessage = getMissingRequiredRowMessage();
    if (missingRequiredRowMessage) {
      Swal.fire({
        text: missingRequiredRowMessage,
        icon: "warning",
      });
      return;
    }

    const existingLegacyConflicts = getExistingLegacyConflicts();
    if (existingLegacyConflicts.length > 0) {
      Swal.fire({
        text: existingLegacyConflicts[0],
        icon: "error",
      });
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
              salesPrice: item.salesPrice ? parseFloat(item.salesPrice) : 0,
              offerPrice: item.offerPrice ? parseFloat(item.offerPrice) : 0,
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
        stockItems: mappedStockItems.map(({
          _rowId,
          item_name,
          item_code,
          size,
          color,
          uom,
          sales_price,
          offer_price,
          ...rest
        }) => ({
          ...rest,
          barcode: normalizeCodeValue(item_code),
        })),
      };

      const returnData = await addOpeningStock(payload).unwrap();

      if (returnData.statusCode === 1) {
        Swal.fire({ icon: "error", title: returnData?.message, showConfirmButton: false });
      } else if (returnData.statusCode === 0) {
        await Swal.fire({
          icon: "success",
          title: "Stock Added Successfully",
        });
        clearWorkspace();
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
    clearWorkspace,
    companyId,
    finYearId,
    getMissingRequiredRowMessage,
    getExistingLegacyConflicts,
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
      // toast.warning("Please add at least one row before saving.");
      Swal.fire("Please add at least one row before saving.");
      return;
    }

    try {
      buildLegacySeedMap(stockItems);
    } catch (error) {
      // toast.error(error.message);
      Swal.fire((error.data?.message || error.message));
      return;
    }

    const reviewState = buildMissingReviewState();
    // if (reviewState.items.length || reviewState.sizes.length || reviewState.colors.length) {
    //   setMissingMasterReview({
    //     isOpen: true,
    //     ...reviewState,
    //   });
    //   return;
    // }

    await processStockSave({
      missingItems: reviewState.items,
      missingSizes: reviewState.sizes,
      reviewedColors: [],
    });
  }, [buildMissingReviewState, processStockSave, stockItems]);

  const loadFile = React.useCallback((selectedFile = file) => {
    if (!selectedFile) {
      // toast.warning("Please select a file first.");
      Swal.fire("Please select a file first.");
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
            _entryMode: "import",
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

      // updateRows((previousRows) => [...previousRows, ...transformedRows]);
      updateRows((previousRows) => [...transformedRows]);

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

  const headerContent = (
    <div className="grid grid-cols-1 gap-3 overflow-visible md:grid-cols-3 ">
      <TransactionHeaderSection title="Location Details" bodyClassName="grid-cols-2 gap-1.5 py-1.5">
        <DropdownInput
          name="Branch"
          options={
            branchList
              ? branchList?.data?.map((item) => ({
                show: item.branchName,
                value: item.id,
              }))
              : []
          }
          value={selectedBranchId}
          setValue={(value) => {
            setSelectedBranchId(value);
            setSelectedLocationId("");
          }}
          required
        />
        <DropdownInput
          name="Location"
          options={
            locationList
              ? locationList?.data?.map((item) => ({
                show: item.storeName,
                value: item.id,
              }))
              : []
          }
          value={selectedLocationId}
          setValue={setSelectedLocationId}
          required
        />
      </TransactionHeaderSection>

      <TransactionHeaderSection title="Import Options" bodyClassName="grid-cols-1 gap-1.5">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-600">Load File (CSV or Excel)</label>
          <div className="flex h-8 items-center gap-2 rounded-lg bg-white border border-gray-300 px-2 py-1">
            <input
              id="openingStockFileInput"
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={handleFileChange}
            />
            <label
              htmlFor="openingStockFileInput"
              className="inline-flex h-6 shrink-0 cursor-pointer items-center gap-1.5 rounded-md bg-emerald-50 px-2 text-[11px] font-semibold text-emerald-700 transition hover:bg-emerald-100"
            >
              <FiUploadCloud className="h-3 w-3" />
              Browse
            </label>
            <div className="flex min-w-0 flex-1 items-center overflow-hidden">
              {file ? (
                <span className="block truncate text-[11px] font-medium text-slate-700">
                  {file.name}
                </span>
              ) : (
                <span className="block truncate text-[11px] text-slate-400">
                  No file chosen
                </span>
              )}
            </div>
            {file && (
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  const input = document.getElementById("openingStockFileInput");
                  if (input) input.value = "";
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <FiX className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </TransactionHeaderSection>

      <TransactionHeaderSection title="Help & Templates" bodyClassName="grid-cols-1 gap-1.5">
        <div className="flex items-center gap-2 pt-4">
          <button
            type="button"
            onClick={downloadTemplate}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-indigo-500 bg-white px-3 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
          >
            <FiDownload className="h-3.5 w-3.5" />
            Download Template
          </button>

          <div className="group relative">
            <FaQuestionCircle className="cursor-help text-slate-400 hover:text-slate-600" />
            <div className="pointer-events-none absolute bottom-full right-0 z-[80] mb-2 w-56 rounded-md bg-slate-800 px-3 py-2 text-[11px] leading-4 text-white shadow-lg opacity-0 transition-opacity duration-150 group-hover:opacity-100">
              Download the template that matches your current stock-control fields, fill it in Excel, then load it into this table.
            </div>
          </div>
        </div>
      </TransactionHeaderSection>
    </div>
  );

  const footerContent = (
    <div className="flex flex-col justify-between gap-2 md:flex-row">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={saveData}
          className="flex items-center rounded-md bg-indigo-500 px-4 py-1 text-sm text-white hover:bg-indigo-600"
        >
          <FiSave className="mr-2 h-4 w-4" />
          Save Stock
        </button>
        <button
          onClick={addManualRow}
          className="flex items-center rounded-md bg-emerald-500 px-4 py-1 text-sm text-white hover:bg-emerald-600"
        >
          <FiPlus className="mr-2 h-4 w-4" />
          Add Row
        </button>
      </div>
      {/* <div className="flex flex-wrap gap-2">
        <button
          onClick={clearWorkspace}
          className="flex items-center rounded-md bg-red-500 px-4 py-1 text-sm text-white hover:bg-red-600"
        >
          <FiRotateCcw className="mr-2 h-4 w-4" />
          Reset
        </button>
      </div> */}
    </div>
  );

  const [contextMenu, setContextMenu] = useState(false);

  const handleRightClick = (event, rowIndex, type) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
      rowId: rowIndex,
      type,
    });
  };

  const handleCloseContextMenu = () => setContextMenu(null);

  const handleDeleteRow = (id) => {
    setStockItems((yarnBlend) =>
      yarnBlend.filter((row, index) => index !== parseInt(id))
    );
  };


  const handleDeleteAllRows = () => {
    setStockItems([]);
  };

  // useEffect(() => {
  //   const targetRows = standardTransactionPlaceholderRowCount;
  //   if (stockItems?.length >= targetRows) return;

  //   setStockItems((prev) => {
  //     const newArray = Array.from({ length: targetRows - prev.length }, () => ({
  //       itemId: "",

  //     }));
  //     return [...prev, ...newArray];
  //   });
  // }, [setStockItems, stockItems]);



  return (
    <>
      <TransactionEntryShell
        title="Opening Stock"
        isNew={true}
        clearWorkspace={clearWorkspace}
        headerOpen={headerOpen}
        setHeaderOpen={setHeaderOpen}
        headerContent={headerContent}
        footer={footerContent}
      >
        <div className="flex h-full min-h-0 w-full flex-col">
          <TransactionLineItemsSection
            panelClassName="min-h-0 w-full flex-1"
            contentClassName="min-h-0"
          >
            {stockItems.length === 0 ? (
              <div className="flex h-full min-h-[240px] items-center justify-center px-6 text-center">
                <div className="max-w-md">
                  <p className="text-sm font-semibold text-slate-700">No rows yet.</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Load a file or add a row to start building your opening stock batch.
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-0 overflow-auto">
                <table className={transactionTableClassName}>
                  <thead className={transactionTableHeadClassName}>
                    <tr>
                      <th className={`${transactionTableHeaderCellClassName} w-12`}>S.No</th>
                      {openingStockFields.map((field) => (
                        <th
                          key={field.key}
                          className={`${transactionTableHeaderCellClassName} ${field.widthClass || ""
                            }`}
                        >
                          {field.label}
                        </th>
                      ))}
                      <th className={`${transactionTableHeaderCellClassName} w-8`}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockItems.map((row, rowIndex) => {
                      return (
                        <tr
                          key={row._rowId || rowIndex}
                          // className="border border-blue-gray-200"
                          className={`border border-blue-gray-200 ${rowIndex % 2 === 0 ? "bg-white" : "bg-gray-100"} `}
                          onContextMenu={(e) => {
                            handleRightClick(e, rowIndex, "shiftTimeHrs");

                          }}

                        >
                          <td className={transactionTableIndexCellClassName}>
                            {rowIndex + 1}
                          </td>
                          {openingStockFields.map((field) => {
                            const attentionState = getFieldAttentionState(row, field);
                            const cellClassName =
                              attentionState?.tone === "missing"
                                ? `${transactionTableFocusCellClassName} bg-red-50`
                                : attentionState?.tone === "conflict"
                                  ? `${transactionTableFocusCellClassName} bg-orange-50`
                                  : attentionState?.tone === "pending"
                                    ? `${transactionTableFocusCellClassName} bg-amber-50`
                                    : transactionTableFocusCellClassName;
                            const inputClassName =
                              field.type === "number"
                                ? transactionTableNumberInputClassName
                                : transactionTableSelectInputClassName;
                            const emphasizedInputClassName = attentionState
                              ? `${inputClassName} ${attentionState.tone === "missing"
                                ? "text-red-700 placeholder:text-red-300"
                                : attentionState.tone === "conflict"
                                  ? "text-orange-800 placeholder:text-orange-300"
                                  : "text-amber-800 placeholder:text-amber-300"
                              }`
                              : inputClassName;

                            if (field.key === "uom") {
                              const resolvedUomId = getResolvedUom(row)?.id || "";
                              console.log(resolvedUomId, "resolvedUomId")
                              return (
                                <td key={field.key} className={cellClassName}>
                                  {/* <Select
                                    options={uomOptions}
                                    value={
                                      uomOptions.find(
                                        (option) =>
                                          String(option.value) === String(resolvedUomId)
                                      ) || null
                                    }
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
                                    title={attentionState?.message || ""}
                                    styles={{
                                      control: (base) => ({
                                        ...base,
                                        minHeight: "30px",
                                        height: "30px",
                                        fontSize: "12px",
                                        backgroundColor: "transparent",
                                        borderColor: "transparent",
                                        boxShadow: "none",
                                      }),
                                      indicatorsContainer: (base) => ({
                                        ...base,
                                        height: "30px",
                                      }),
                                    }}
                                  /> */}
                                  <SearchableTableCellSelect
                                    value={resolvedUomId}
                                    options={uomOptions}
                                    onChange={(val) => {
                                      const selectedUom = uomOptions.find((o) => String(o.value) === String(val));
                                      updateRows((previousRows) =>
                                        previousRows.map((entry) =>
                                          entry._rowId === row._rowId
                                            ? {
                                              ...entry,
                                              uomId: val || "",
                                              uom: selectedUom?.label || "",
                                            }
                                            : entry
                                        )
                                      );
                                    }}
                                    placeholder=""
                                  />
                                </td>
                              );
                            }

                            if (
                              field.key === "item_name" &&
                              row?._entryMode === "manual"
                            ) {
                              return (
                                <td key={field.key} className={cellClassName}>
                                  <SearchableTableCellSelectWithValue
                                    value={row.itemId ? String(row.itemId) : row.item_name}
                                    options={itemLookupOptions}
                                    disabled={false}
                                    onChange={(nextValue) =>
                                      updateRowItemSelection(row._rowId, nextValue)
                                    }
                                    placeholder=""
                                  />
                                </td>
                              );
                            }

                            if (field.key === "size") {
                              return (
                                <td key={field.key} className={cellClassName}>
                                  <SearchableTableCellSelectWithValue
                                    value={row.size}
                                    options={sizeOptions}
                                    onChange={(val) => updateRowField(row._rowId, "size", val)}
                                  />
                                </td>
                              );
                            }

                            if (field.key === "color") {
                              return (
                                <td key={field.key} className={cellClassName}>
                                  <SearchableTableCellSelectWithValue
                                    value={row.color}
                                    options={colorOptions}
                                    onChange={(val) => updateRowField(row._rowId, "color", val)}
                                  />
                                </td>
                              );
                            }

                            const inputType = field.type === "number" ? "number" : "text";

                            return (
                              <td key={field.key} className={cellClassName}>
                                <input
                                  type={inputType}
                                  value={normalizeNumericValue(row[field.key])}
                                  onChange={(event) =>
                                    updateRowField(
                                      row._rowId,
                                      field.key,
                                      event.target.value
                                    )
                                  }
                                  className={emphasizedInputClassName}
                                  title={attentionState?.message || ""}
                                />
                              </td>
                            );
                          })}
                          <td className={transactionTableActionCellClassName}>
                            {/* <button
                              onClick={() =>
                                updateRows((previousRows) =>
                                  previousRows.filter(
                                    (entry) => entry._rowId !== row._rowId
                                  )
                                )
                              }
                              className="mx-auto inline-flex h-7 w-7 items-center justify-center rounded bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700"
                              title="Delete Row"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button> */}
                            <button
                              onClick={addManualRow}
                              className="mx-auto inline-flex h-6 w-10 items-center justify-center rounded bg-blue-50 text-blue-500 hover:bg-blue-100 hover:text-blue-700"
                            // disabled={readOnly}
                            // className="h-full w-full rounded-none bg-blue-50 py-0"
                            >
                              +
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {contextMenu && (
                  <div
                    style={{
                      position: "absolute",
                      top: `${contextMenu.mouseY - 240}px`,
                      left: `${contextMenu.mouseX - 40}px`,

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
              </div>

            )}

          </TransactionLineItemsSection>
        </div>
      </TransactionEntryShell>

      <Modal
        isOpen={missingMasterReview.isOpen}
        onClose={closeMissingMasterReview}
        widthClass="w-[90vw]"
      >
        <div className="flex max-h-[90vh] flex-col bg-white">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Review Missing Masters</h2>
              <p className="text-xs font-medium text-slate-500">
                Complete any required color codes, then confirm the batch creation.
              </p>
            </div>
            <button
              onClick={closeMissingMasterReview}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto p-4">
            {missingMasterReview.items.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-bold text-slate-700">Missing Items</h3>
                <TransactionLineItemsSection containerClassName="border rounded-lg overflow-hidden">
                  <table className={transactionTableClassName}>
                    <thead className={transactionTableHeadClassName}>
                      <tr>
                        <th className={`${transactionTableHeaderCellClassName} w-12`}>S.No</th>
                        <th className={`${transactionTableHeaderCellClassName} w-96`}>Item Name</th>
                        <th className={`${transactionTableHeaderCellClassName} w-32`}>Item Code</th>
                        <th className={`${transactionTableHeaderCellClassName} w-32`}>Sales Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {missingMasterReview.items.map((item, idx) => (
                        <tr key={item.name} className="border border-blue-gray-200">
                          <td className={transactionTableIndexCellClassName}>{idx + 1}</td>
                          <td className={`${transactionTableFocusCellClassName} text-[11px] font-medium uppercase text-slate-700`}>
                            {item.name}
                          </td>
                          <td className={`${transactionTableFocusCellClassName} text-[11px] uppercase text-slate-700 font-mono`}>
                            {item.itemCode}
                          </td>
                          <td className={`${transactionTableFocusCellClassName} text-[11px] text-slate-700 font-semibold`}>
                            {item.salesPrice || "0"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TransactionLineItemsSection>
              </div>
            )}

            {missingMasterReview.sizes.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-bold text-slate-700">Missing Sizes</h3>
                <TransactionLineItemsSection containerClassName="border rounded-lg overflow-hidden max-w-sm">
                  <table className={transactionTableClassName}>
                    <thead className={transactionTableHeadClassName}>
                      <tr>
                        <th className={`${transactionTableHeaderCellClassName} w-12`}>S.No</th>
                        <th className={`${transactionTableHeaderCellClassName}`}>Size</th>
                      </tr>
                    </thead>
                    <tbody>
                      {missingMasterReview.sizes.map((size, idx) => (
                        <tr key={size} className="border border-blue-gray-200">
                          <td className={transactionTableIndexCellClassName}>{idx + 1}</td>
                          <td className={`${transactionTableFocusCellClassName} text-[11px] font-medium uppercase text-slate-700`}>
                            {size}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TransactionLineItemsSection>
              </div>
            )}

            {missingMasterReview.colors.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-bold text-slate-700">Missing Colors</h3>
                <TransactionLineItemsSection containerClassName="border rounded-lg overflow-hidden">
                  <table className={transactionTableClassName}>
                    <thead className={transactionTableHeadClassName}>
                      <tr>
                        <th className={`${transactionTableHeaderCellClassName} w-12`}>S.No</th>
                        <th className={`${transactionTableHeaderCellClassName}`}>Color Name</th>
                        <th className={`${transactionTableHeaderCellClassName} w-48`}>Color Code</th>
                      </tr>
                    </thead>
                    <tbody>
                      {missingMasterReview.colors.map((color, idx) => (
                        <tr key={color.name} className="border border-blue-gray-200">
                          <td className={transactionTableIndexCellClassName}>{idx + 1}</td>
                          <td className={`${transactionTableFocusCellClassName} text-[11px] font-medium uppercase text-slate-700`}>
                            {color.name}
                          </td>
                          <td className={transactionTableFocusCellClassName}>
                            <div className="flex flex-col gap-1">
                              <input
                                type="text"
                                value={color.code}
                                onChange={(event) => {
                                  const nextCode = normalizeCodeValue(event.target.value);
                                  setMissingMasterReview((previousReview) => ({
                                    ...previousReview,
                                    colors: previousReview.colors.map((entry) =>
                                      entry.name === color.name
                                        ? { ...entry, code: nextCode }
                                        : entry
                                    ),
                                  }));
                                }}
                                placeholder="Enter color code"
                                className={`${transactionTableSelectInputClassName} uppercase ${reviewErrors[color.name] ? "text-red-700 placeholder:text-red-300 bg-red-50" : ""
                                  }`}
                              />
                              {reviewErrors[color.name] && (
                                <p className="px-2 pb-1 text-[10px] font-semibold text-red-600">
                                  {reviewErrors[color.name]}
                                </p>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TransactionLineItemsSection>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 border-t bg-slate-50 px-4 py-3">
            <button
              type="button"
              onClick={closeMissingMasterReview}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
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
              className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <FiPlus className="h-4 w-4" />
              Create & Continue
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ExcelSelectionTable;
