import React, { useState } from "react";
import { Barcode, Plus, Trash2, Tag } from "lucide-react";
import Modal from "../../UiComponents/Modal";

export const BARCODE_TYPES = [
    { value: "REGULAR", label: "Regular" },
    { value: "CLEARANCE", label: "Clearance" },
];

/**
 * Creates a blank barcode row for the editor.
 */
export function createEmptyBarcodeRow() {
    return { barcode: "", barcodeType: "REGULAR", clearanceReason: "", active: true };
}

/**
 * Given a legacy flat barcode string, build the initial ItemBarcodes array.
 * Used when loading older items that may still have a top-level barcode field.
 */
export function coerceLegacyBarcode(priceRow) {
    if (priceRow?.ItemBarcodes?.length > 0) {
        return priceRow.ItemBarcodes;
    }
    // Fall back to the old flat barcode field if present
    const legacyBarcode = priceRow?.barcode;
    if (legacyBarcode?.trim()) {
        return [{ barcode: legacyBarcode.trim(), barcodeType: "REGULAR", active: true }];
    }
    return [createEmptyBarcodeRow()];
}

/**
 * Returns a compact summary label for the barcode list.
 */
export function getBarcodeSummary(barcodes = []) {
    const active = (barcodes || []).filter((b) => b.active !== false);
    if (!active.length) return "No barcodes";
    const first = active[0]?.barcode || "—";
    const extras = active.length - 1;
    return extras > 0 ? `${first} +${extras} more` : first;
}

/**
 * ItemBarcodeEditor
 *
 * Props:
 *   barcodes   – current barcode array for this variant row
 *   onChange   – (newBarcodes) => void
 *   readOnly   – disable editing
 *   label      – optional label (e.g., "S / Red")
 */
export default function ItemBarcodeEditor({ barcodes = [], onChange, readOnly = false, label }) {
    const [open, setOpen] = useState(false);

    const activeBarcodes = (barcodes || []).filter((b) => b.active !== false);
    const summary = getBarcodeSummary(activeBarcodes);

    function handleAdd() {
        onChange([...barcodes, createEmptyBarcodeRow()]);
    }

    function handleRemove(index) {
        const updated = barcodes.map((b, i) =>
            i === index ? { ...b, active: false } : b
        );
        onChange(updated);
    }

    function handleChange(index, field, value) {
        const updated = barcodes.map((b, i) =>
            i === index ? { ...b, [field]: value } : b
        );
        onChange(updated);
    }

    return (
        <>
            {/* Trigger chip */}
            <button
                type="button"
                title="Manage barcodes"
                onClick={() => setOpen(true)}
                className={`
                    flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium border transition-all
                    ${activeBarcodes.length === 0
                        ? "border-red-300 bg-red-50 text-red-600"
                        : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"}
                `}
            >
                <Barcode size={12} />
                <span className="truncate max-w-[120px]">{summary}</span>
            </button>

            {open && (
                <Modal
                    isOpen={open}
                    onClose={() => setOpen(false)}
                    title={`Barcodes${label ? ` — ${label}` : ""}`}
                    footer={
                        <div className="flex justify-end gap-2">
                            {!readOnly && (
                                <button
                                    type="button"
                                    onClick={handleAdd}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium"
                                >
                                    <Plus size={12} /> Add Barcode
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium"
                            >
                                Close
                            </button>
                        </div>
                    }
                >
                    <div className="space-y-2 min-w-[480px]">
                        {barcodes.filter((b) => b.active !== false).length === 0 && (
                            <p className="text-center text-gray-400 text-sm py-4">
                                No barcodes assigned yet.
                            </p>
                        )}

                        {/* Active barcodes */}
                        {barcodes.map((b, idx) => {
                            if (b.active === false) return null;
                            return (
                                <div
                                    key={idx}
                                    className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg bg-white shadow-sm"
                                >
                                    {/* Barcode value */}
                                    <div className="flex-1">
                                        <label className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                                            Barcode
                                        </label>
                                        <input
                                            type="text"
                                            value={b.barcode || ""}
                                            disabled={readOnly}
                                            placeholder="e.g. 8901234567890"
                                            onChange={(e) => handleChange(idx, "barcode", e.target.value.trim().toUpperCase())}
                                            className="block w-full border border-gray-300 rounded px-2 py-1 text-sm font-mono focus:outline-none focus:border-blue-400 disabled:bg-gray-50"
                                        />
                                    </div>

                                    {/* Type */}
                                    <div className="w-32">
                                        <label className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                                            Type
                                        </label>
                                        <select
                                            value={b.barcodeType || "REGULAR"}
                                            disabled={readOnly}
                                            onChange={(e) => handleChange(idx, "barcodeType", e.target.value)}
                                            className="block w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-400 disabled:bg-gray-50"
                                        >
                                            {BARCODE_TYPES.map((opt) => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Clearance reason – only if CLEARANCE */}
                                    {b.barcodeType === "CLEARANCE" && (
                                        <div className="flex-1">
                                            <label className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                                                Reason
                                            </label>
                                            <input
                                                type="text"
                                                value={b.clearanceReason || ""}
                                                disabled={readOnly}
                                                placeholder="e.g. End of season"
                                                onChange={(e) => handleChange(idx, "clearanceReason", e.target.value)}
                                                className="block w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-400 disabled:bg-gray-50"
                                            />
                                        </div>
                                    )}

                                    {/* Type badge */}
                                    {b.barcodeType === "CLEARANCE" && (
                                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700 border border-amber-200 whitespace-nowrap">
                                            <Tag size={9} /> Clearance
                                        </span>
                                    )}

                                    {/* Remove */}
                                    {!readOnly && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemove(idx)}
                                            title="Remove barcode (soft-delete)"
                                            className="p-1.5 rounded text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            );
                        })}

                        {/* Inactive / soft-deleted barcodes (read-only history) */}
                        {barcodes.filter((b) => b.active === false).length > 0 && (
                            <details className="mt-2">
                                <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                                    View deactivated barcodes ({barcodes.filter((b) => b.active === false).length})
                                </summary>
                                <div className="mt-1 space-y-1 pl-2 border-l-2 border-gray-100">
                                    {barcodes
                                        .filter((b) => b.active === false)
                                        .map((b, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-2 text-xs text-gray-400 line-through"
                                            >
                                                <Barcode size={10} />
                                                <span className="font-mono">{b.barcode}</span>
                                                <span className="not-italic no-underline text-[10px] bg-gray-100 px-1 rounded">
                                                    {b.barcodeType}
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            </details>
                        )}
                    </div>
                </Modal>
            )}
        </>
    );
}
