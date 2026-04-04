## Why

Opening Stock currently behaves like two parallel entry surfaces, with one path optimized for spreadsheet import and another for row-by-row entry. As the product shifts toward legacy-item creation and stock-field-driven capture, that split creates avoidable friction, duplicated concepts, and unclear master-hydration behavior when a user mixes imported rows with manually added rows in the same working batch.

## What Changes

- Introduce a unified Opening Stock workspace built around one editable row table that accepts both manually added rows and bulk-imported rows.
- Define a shared Opening Stock row contract that drives table rendering, manual entry, import parsing, downloadable template generation, validation, and save payload mapping.
- Standardize the shared legacy-item hydration fields so `item name`, `item code`, and `price` are captured once and reused to create or enrich legacy items.
- Treat `item code` as the legacy item code and the legacy barcode identity for Opening Stock legacy-item hydration.
- Treat Opening Stock row `price` as the legacy item's flat sales price when the row creates or enriches a legacy item.
- Replace origin-specific master creation behavior with one table-level hydration review model that detects and resolves missing masters across the whole current table batch, including mixed manual and imported rows.
- Keep the Opening Stock template aligned to the unified shared row contract rather than to a separate import-only surface.

## Capabilities

### New Capabilities
- `opening-stock-entry-workspace`: Define the unified Opening Stock table workspace, shared row contract, mixed-origin row handling, and table-level hydration review flow.

### Modified Capabilities
- `opening-stock-dynamic-schema`: Extend the dynamic schema contract so the shared Opening Stock row contract governs the unified workspace rather than separate manual and import surfaces.
- `opening-stock-import-template`: Align template generation and guidance with the unified Opening Stock workspace and shared row contract.
- `opening-stock-hydration`: Update legacy-item hydration rules so Opening Stock reuses shared row fields for legacy item creation and enrichment, and resolves missing masters through the shared table-level review model.
- `opening-stock-import-color-review`: Generalize missing-color review so required color-code completion works inside the shared table-level hydration review flow, not only as an import-only branch.

## Impact

- Affected UI: `client/src/Uniform/Components/OpeningStock/index.jsx`, `client/src/Uniform/Components/OpeningStock/ExcelSelectionTable.js`, `client/src/Uniform/Components/OpeningStock/ManualAddStock.js`, `client/src/Uniform/Components/OpeningStock/QuickAddItemModal.js`, and related Opening Stock helpers.
- Affected schema helpers: `client/src/Uniform/Components/OpeningStock/openingStockSchema.js` and any shared runtime stock-field helpers used for template generation and validation.
- Affected workflow behavior: Opening Stock row validation, downloadable template columns, mixed manual/import review states, missing master creation, and legacy-item hydration.
- No database schema changes are expected, but Opening Stock import/export contracts and row-state behavior will change.
