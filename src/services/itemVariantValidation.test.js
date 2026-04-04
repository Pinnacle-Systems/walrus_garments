import test from "node:test";
import assert from "node:assert/strict";

import {
    getCanonicalVariantRequirements,
    validateVariantRowShape,
    validateVariantRows,
} from "./itemVariantValidation.js";

test("canonical STANDARD mode allows rows without size or color", () => {
    assert.deepEqual(getCanonicalVariantRequirements("STANDARD"), {
        requiresSize: false,
        requiresColor: false,
    });

    assert.doesNotThrow(() => validateVariantRowShape({
        flowType: "canonical",
        isLegacy: false,
        barcodeGenerationMethod: "STANDARD",
        row: { sizeId: null, colorId: null },
        rowLabel: "Purchase Inward row 1",
    }));
});

test("canonical SIZE mode requires size only", () => {
    assert.throws(() => validateVariantRowShape({
        flowType: "canonical",
        isLegacy: false,
        barcodeGenerationMethod: "SIZE",
        row: { sizeId: null, colorId: null },
        rowLabel: "Purchase Inward row 1",
    }), /requires size/i);

    assert.doesNotThrow(() => validateVariantRowShape({
        flowType: "canonical",
        isLegacy: false,
        barcodeGenerationMethod: "SIZE",
        row: { sizeId: 11, colorId: null },
        rowLabel: "Purchase Inward row 1",
    }));
});

test("canonical SIZE_COLOR mode requires both size and color", () => {
    assert.throws(() => validateVariantRowShape({
        flowType: "canonical",
        isLegacy: false,
        barcodeGenerationMethod: "SIZE_COLOR",
        row: { sizeId: 11, colorId: null },
        rowLabel: "Purchase Return row 1",
    }), /requires color/i);

    assert.doesNotThrow(() => validateVariantRowShape({
        flowType: "canonical",
        isLegacy: false,
        barcodeGenerationMethod: "SIZE_COLOR",
        row: { sizeId: 11, colorId: 21 },
        rowLabel: "Purchase Return row 1",
    }));
});

test("legacy-compatible rows stay permissive under canonical barcode modes", () => {
    assert.doesNotThrow(() => validateVariantRows({
        flowType: "legacy",
        isLegacy: true,
        barcodeGenerationMethod: "SIZE_COLOR",
        rows: [{ sizeId: null, colorId: null }],
        rowLabelPrefix: "Opening Stock row",
    }));

    assert.doesNotThrow(() => validateVariantRows({
        flowType: "canonical",
        isLegacy: true,
        barcodeGenerationMethod: "SIZE_COLOR",
        rows: [{ sizeId: null, colorId: null }],
        rowLabelPrefix: "Legacy item row",
    }));
});
