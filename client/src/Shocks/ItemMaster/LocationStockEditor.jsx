import React from "react";
import { Plus, Trash2 } from "lucide-react";

export function getConfiguredLocationAlertCount(rows = []) {
  return rows.filter((row) => row?.locationId && String(row?.minStockQty ?? "").trim() !== "").length;
}

export function createEmptyLocationThreshold() {
  return { locationId: "", minStockQty: "" };
}

export function validateLocationThresholdRows(rows = []) {
  const seenLocations = new Map();
  const rowErrors = rows.map(() => ({}));
  const cleanedRows = [];

  rows.forEach((row, index) => {
    const locationId = String(row?.locationId ?? "").trim();
    const minStockQty = String(row?.minStockQty ?? "").trim();
    const isBlank = !locationId && !minStockQty;

    if (isBlank) {
      return;
    }

    if (!locationId) {
      rowErrors[index].locationId = "Select a location or clear the row.";
    }

    if (!minStockQty) {
      rowErrors[index].minStockQty = "Enter a minimum quantity or clear the row.";
    }

    if (minStockQty && !/^\d+$/.test(minStockQty)) {
      rowErrors[index].minStockQty = "Use a non-negative whole number.";
    }

    if (locationId) {
      if (seenLocations.has(locationId)) {
        rowErrors[index].locationId = "Location already added.";
        rowErrors[seenLocations.get(locationId)].locationId = "Location already added.";
      } else {
        seenLocations.set(locationId, index);
      }
    }

    cleanedRows.push({
      ...row,
      locationId,
      minStockQty,
    });
  });

  return {
    cleanedRows: cleanedRows.filter((row) => row.locationId && row.minStockQty),
    rowErrors,
    hasErrors: rowErrors.some((errors) => Object.keys(errors).length > 0),
  };
}

export function getAvailableLocationOptions(rows = [], locationOptions = [], currentIndex) {
  const currentValue = String(rows[currentIndex]?.locationId ?? "").trim();
  const selectedLocations = new Set(
    rows
      .filter((row, index) => index !== currentIndex)
      .map((row) => String(row?.locationId ?? "").trim())
      .filter(Boolean)
  );

  return locationOptions.filter(
    (option) => String(option.id) === currentValue || !selectedLocations.has(String(option.id))
  );
}

export function canAddLocationThresholdRow(rows = [], locationOptions = []) {
  const hasBlankRow = rows.some((row) => !String(row?.locationId ?? "").trim() && !String(row?.minStockQty ?? "").trim());
  if (hasBlankRow) {
    return false;
  }

  const usedLocations = new Set(
    rows
      .map((row) => String(row?.locationId ?? "").trim())
      .filter(Boolean)
  );

  return usedLocations.size < locationOptions.length;
}

export default function LocationStockEditor({
  rows = [],
  onChange,
  locationOptions = [],
  readOnly = false,
  title = "Stock Alerts",
}) {
  const safeRows = rows.length ? rows : [createEmptyLocationThreshold()];
  const { rowErrors } = validateLocationThresholdRows(safeRows);
  const canAddLocation = canAddLocationThresholdRow(safeRows, locationOptions);

  const updateRow = (index, field, value) => {
    onChange(
      safeRows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row
      )
    );
  };

  const addRow = () => {
    if (!canAddLocation) {
      return;
    }
    onChange([...safeRows, createEmptyLocationThreshold()]);
  };

  const removeRow = (index) => {
    const nextRows = safeRows.filter((_, rowIndex) => rowIndex !== index);
    onChange(nextRows.length ? nextRows : [createEmptyLocationThreshold()]);
  };

  return (
    <div className="flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="flex items-start justify-between gap-2 border-b border-gray-200 px-3 py-2">
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-gray-800 break-words leading-tight">{title}</h4>
          <p className="text-[11px] text-gray-500 leading-tight">Configure minimum stock by location.</p>
        </div>
        {!readOnly && (
          <button
            type="button"
            onClick={addRow}
            disabled={!canAddLocation}
            className="shrink-0 inline-flex items-center gap-1 rounded border border-indigo-200 bg-indigo-50 px-2 py-1 text-xs font-medium leading-tight text-indigo-700 hover:bg-indigo-100"
          >
            <Plus size={14} />
            <span>Add</span>
            <span>Location</span>
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full table-fixed text-xs">
          <thead className="sticky top-0 z-10 bg-gray-50 text-gray-700">
            <tr>
              <th className="w-10 border-b border-gray-200 px-1 py-2 text-center">S.No</th>
              <th className="border-b border-gray-200 px-1 py-2 text-left">Location</th>
              <th className="w-28 border-b border-gray-200 px-1 py-2 text-left">Min Qty</th>
              <th className="w-12 border-b border-gray-200 px-1 py-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {safeRows.map((row, index) => (
              <tr key={`${row.locationId || "empty"}-${index}`}>
                <td className="border-b border-gray-200 px-1 py-2 text-center">{index + 1}</td>
                <td className="border-b border-gray-200 px-1 py-2">
                  <select
                    className={`w-full rounded border px-1.5 py-1 ${rowErrors[index]?.locationId ? "border-red-400" : "border-gray-200"}`}
                    value={row.locationId || ""}
                    onChange={(e) => updateRow(index, "locationId", e.target.value)}
                    disabled={readOnly}
                  >
                    <option value=""></option>
                    {getAvailableLocationOptions(safeRows, locationOptions, index).map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.storeName}
                      </option>
                    ))}
                  </select>
                  {rowErrors[index]?.locationId && (
                    <p className="mt-1 text-[10px] text-red-600">{rowErrors[index].locationId}</p>
                  )}
                </td>
                <td className="border-b border-gray-200 px-1 py-2">
                  <input
                    type="text"
                    className={`w-full rounded border px-1.5 py-1 text-right ${rowErrors[index]?.minStockQty ? "border-red-400" : "border-gray-200"}`}
                    value={row.minStockQty || ""}
                    onChange={(e) => updateRow(index, "minStockQty", e.target.value)}
                    disabled={readOnly}
                  />
                  {rowErrors[index]?.minStockQty && (
                    <p className="mt-1 text-[10px] text-red-600">{rowErrors[index].minStockQty}</p>
                  )}
                </td>
                <td className="border-b border-gray-200 px-1 py-2 text-center">
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      className="inline-flex items-center justify-center rounded p-1 text-red-500 hover:bg-red-50"
                      title="Remove location row"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
