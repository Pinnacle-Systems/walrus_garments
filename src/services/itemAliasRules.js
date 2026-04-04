const OPENING_STOCK_CREATION_SOURCE = "OPENING_STOCK";

export function resolveItemAliasName({
    aliasName,
    normalizedName,
    isLegacy = false,
    creationSource,
}) {
    if (aliasName !== undefined && aliasName !== null && String(aliasName).trim() !== "") {
        return String(aliasName);
    }

    if (isLegacy && creationSource === OPENING_STOCK_CREATION_SOURCE) {
        return normalizedName;
    }

    return undefined;
}
