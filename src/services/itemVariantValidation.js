import { prisma } from "../lib/prisma.js";

export const DEFAULT_BARCODE_GENERATION_METHOD = "STANDARD";

function hasAssignedDimension(value) {
    return !(value === undefined || value === null || value === "");
}

export async function getBarcodeGenerationMethod(prismaClient = prisma) {
    const itemControlPanel = await prismaClient.ItemControlPanel.findFirst({
        select: {
            barcodeGenerationMethod: true,
        },
    });

    return itemControlPanel?.barcodeGenerationMethod || DEFAULT_BARCODE_GENERATION_METHOD;
}

export function getCanonicalVariantRequirements(barcodeGenerationMethod = DEFAULT_BARCODE_GENERATION_METHOD) {
    switch (barcodeGenerationMethod) {
        case "SIZE":
            return { requiresSize: true, requiresColor: false };
        case "SIZE_COLOR":
            return { requiresSize: true, requiresColor: true };
        case "STANDARD":
        default:
            return { requiresSize: false, requiresColor: false };
    }
}

export function validateVariantRowShape({
    flowType = "canonical",
    isLegacy = false,
    barcodeGenerationMethod = DEFAULT_BARCODE_GENERATION_METHOD,
    row = {},
    rowLabel = "Row",
}) {
    const legacyCompatible = flowType === "legacy" || Boolean(isLegacy);
    const requirements = getCanonicalVariantRequirements(barcodeGenerationMethod);

    if (!legacyCompatible) {
        if (requirements.requiresSize && !hasAssignedDimension(row?.sizeId)) {
            throw Error(`${rowLabel} requires size for barcode generation mode ${barcodeGenerationMethod}.`);
        }

        if (requirements.requiresColor && !hasAssignedDimension(row?.colorId)) {
            throw Error(`${rowLabel} requires color for barcode generation mode ${barcodeGenerationMethod}.`);
        }
    }

    return {
        legacyCompatible,
        ...requirements,
    };
}

export function validateVariantRows({
    flowType = "canonical",
    isLegacy = false,
    barcodeGenerationMethod = DEFAULT_BARCODE_GENERATION_METHOD,
    rows = [],
    rowLabelPrefix = "Row",
}) {
    (rows || []).forEach((row, index) => {
        validateVariantRowShape({
            flowType,
            isLegacy,
            barcodeGenerationMethod,
            row,
            rowLabel: `${rowLabelPrefix} ${index + 1}`,
        });
    });
}
