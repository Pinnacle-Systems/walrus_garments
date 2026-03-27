## Context

Low-stock behavior is currently split across two fields in the item domain model: `ItemPriceList.minStockQty` and `MinimumStockQty.minStockQty`. The Item Master UI reflects that split by showing a standalone minimum-stock field in `STANDARD` mode while exposing a separate location grid for size-based modes. The stock service then switches between the two sources, which makes alert behavior inconsistent and hard to reason about.

This change touches the Prisma schema, item services, stock-service alert calculation, Item Master, and quick-add item flows. The product decision is to treat low-stock thresholds as location-specific inventory settings rather than item-level defaults.

## Goals / Non-Goals

**Goals:**
- Remove `ItemPriceList.minStockQty` from the schema and service layer.
- Make `MinimumStockQty.minStockQty` the only persisted low-stock threshold.
- Standardize Item Master and quick-add workflows so low-stock settings are edited only through location-wise entries.
- Simplify low-stock detection logic so it always compares stock against location-level thresholds.
- Keep the existing association between an item-price-list row and its location-level minimum-stock records.

**Non-Goals:**
- Redesigning the broader pricing layout beyond removing the item-level minimum-stock field and aligning low-stock editing to location rows.
- Changing barcode-generation behavior or coupling this change to the barcode centralization work.
- Introducing company-wide or branch-wide default low-stock templates.

## Decisions

### Remove `ItemPriceList.minStockQty` entirely

`ItemPriceList` should no longer carry a default or fallback minimum stock quantity. Low-stock thresholds are inventory rules, and inventory is location-specific in this system.

Alternatives considered:
- Keep `ItemPriceList.minStockQty` as a fallback default for locations.
  Rejected because it preserves ambiguous precedence and keeps the current mismatch alive.
- Keep the column but stop using it.
  Rejected because dead schema invites accidental reuse.

### Keep location thresholds attached to `ItemPriceList`

Each size/color row already owns its `MinimumStockQty[]` records. That structure should remain in place for all barcode-generation modes, including `STANDARD`, where the item still uses a single `ItemPriceList` row with location-specific minimum-stock entries.

The database should enforce uniqueness for `(itemPriceListId, locationId)` so a location cannot be configured twice for the same item-price row even if validation is bypassed in application code.

Alternatives considered:
- Move minimum-stock records to the `Item` table.
  Rejected because size/color variants would lose their natural parent.
- Create a separate alert-config model detached from `ItemPriceList`.
  Rejected because it adds unnecessary complexity for a relationship the schema already expresses.

### Make low-stock evaluation always location-based

The stock service should compare stock quantities against `MinimumStockQty.minStockQty` for the corresponding item/size/color/location combination. If no location threshold exists, the system should not infer one from an item-level field.

Alternatives considered:
- Preserve the current fallback from location threshold to item-price-list threshold.
  Rejected because the product decision is to remove item-level thresholds.
- Treat missing thresholds as zero.
  Rejected because it would create noisy alerts for items with no configured rule.

### Remove standalone minimum-stock inputs from item-entry UIs

Item Master and quick-add flows should stop showing a single `Min Stock Qty` field. All low-stock configuration should be done through location-wise rows so `STANDARD`, `SIZE`, and `SIZE_COLOR` behave consistently.

The UI should surface low-stock settings as a row-level stock-alert editor tied to the relevant `ItemPriceList` row. Each row should show a compact summary such as `No alerts set` or `<n> locations set`, and opening that row should reveal the location-wise editor for that row instead of using a hidden icon-only interaction or a detached editor below the full pricing table.

Within a row-level stock-alert editor, each location may appear at most once. The UI should hide already-selected locations from other dropdown rows, disable `Add Location` when no unused locations remain, allow a single temporary empty row while editing, and show inline validation if a duplicate somehow occurs. The backend should also reject duplicate locations for the same `ItemPriceList` row as a safety net.

The editor should ignore fully blank rows on save, but it should reject half-filled rows where only one of `locationId` or `minStockQty` is provided. `minStockQty` must be a numeric non-negative integer. A saved set of zero valid location rows means the item-price row has no configured low-stock alert.

Alternatives considered:
- Keep the standalone field for `STANDARD` only.
  Rejected because it preserves different mental models by mode.
- Hide low-stock editing from quick-add flows.
  Rejected because quick-add currently supports item creation and should remain functionally complete.
- Keep the existing alert icon that expands a separate table below the pricing grid.
  Rejected because it hides critical inventory settings, especially when pricing rows are already tall or scrollable.

## Risks / Trade-offs

- [Existing records depend on `ItemPriceList.minStockQty`] -> Add a migration path that either drops obsolete values knowingly before go-live or copies them into location-level records if preservation is needed during rollout.
- [Users may create items without any location thresholds] -> Treat missing location rules as “no alert configured” rather than inventing a fallback.
- [UI becomes slower to edit for simple standard items] -> Keep the location editor lightweight and scoped to the single standard row.
- [Cross-screen regressions in quick-add or stock reports] -> Audit every `minStockQty` read/write and verify all item-creation paths after the schema change.

## Migration Plan

1. Remove `minStockQty` from `ItemPriceList` in Prisma and add the corresponding migration.
2. Update item create/get/update services to stop reading and writing item-level minimum stock quantity while preserving `MinimumStockQty`.
3. Update Item Master and quick-add flows to remove standalone minimum-stock fields and manage only location-level rows.
4. Refactor low-stock alert calculation to use only `MinimumStockQty` records.
5. Manually verify create/edit flows and low-stock reporting for `STANDARD`, `SIZE`, and `SIZE_COLOR`.

Rollback before deployment would restore the removed column and old service/UI paths. After deployment, rollback would require a compensating schema migration.

## Confirmed Decisions

- Existing `ItemPriceList.minStockQty` values will not be backfilled into location-level rows; they will be dropped as part of this pre-go-live cleanup.
- `STANDARD` items will continue to use a single `ItemPriceList` row, and all low-stock thresholds for that row will be stored only in `MinimumStockQty`.
- Low-stock settings will be surfaced in the UI as a row-level stock-alert summary and editor for each `ItemPriceList` row, not as a standalone item-level field and not as an icon-only control that opens a detached table below the pricing grid.
- A stock-alert editor may contain at most one threshold per location for a given `ItemPriceList` row; duplicate locations are invalid and must be prevented in the UI and rejected in the backend.
- A stock-alert editor may keep one temporary blank row during editing, but save behavior ignores fully blank rows, rejects half-filled rows, and accepts only numeric non-negative integer minimum-stock quantities.
- The database will enforce uniqueness on `(itemPriceListId, locationId)` for persisted `MinimumStockQty` rows so duplicate locations cannot exist for the same item-price row.
