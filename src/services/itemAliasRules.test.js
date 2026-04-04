import test from "node:test";
import assert from "node:assert/strict";

import { resolveItemAliasName } from "./itemAliasRules.js";

test("resolveItemAliasName keeps explicit alias values", () => {
    assert.equal(
        resolveItemAliasName({
            aliasName: "Manual Alias",
            normalizedName: "ITEM NAME",
            isLegacy: true,
            creationSource: "OPENING_STOCK",
        }),
        "Manual Alias"
    );
});

test("resolveItemAliasName defaults legacy opening-stock alias to normalized item name", () => {
    assert.equal(
        resolveItemAliasName({
            aliasName: "",
            normalizedName: "ITEM NAME",
            isLegacy: true,
            creationSource: "OPENING_STOCK",
        }),
        "ITEM NAME"
    );
});

test("resolveItemAliasName does not backfill alias outside opening-stock legacy creation", () => {
    assert.equal(
        resolveItemAliasName({
            aliasName: "",
            normalizedName: "ITEM NAME",
            isLegacy: false,
            creationSource: "OPENING_STOCK",
        }),
        undefined
    );
});
