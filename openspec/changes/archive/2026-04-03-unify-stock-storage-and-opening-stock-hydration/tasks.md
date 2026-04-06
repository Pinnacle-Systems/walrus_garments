## 1. Unified Stock Foundation

- [x] 1.1 Audit all runtime `legacyStock` read/write paths and add a controlled unified-stock cutover plan for services, reports, and barcode lookup.
- [x] 1.2 Update opening stock, stock adjustment, and stock transfer services so new operational writes target `stock` only and no longer branch by legacy location names.
- [x] 1.3 Add and run a migration that backfills active `legacyStock` rows into `stock`, with reconciliation checks for quantity and key dimensions.
- [x] 1.4 Remove active location-name-based stock-table routing from unified stock query and reporting paths once migrated data is verified.
- [x] 1.5 Add schema- and service-level uniqueness enforcement for globally unique `Item.name` and for one-to-one legacy barcode pairing on the single legacy `ItemPriceList` row.

## 2. Legacy Item Model

- [x] 2.1 Add `isLegacy` item behavior and a simplified legacy-item interface that maps to exactly one null-size/null-color `ItemPriceList` row.
- [x] 2.2 Restrict legacy-item creation to Opening Stock and use Item Master as the simplified legacy-item correction surface only.
- [x] 2.3 Block any legacy-item edit path from adding canonical size/color granularity or extra `ItemPriceList` rows.

## 3. Stock-Entry Granularity Controls

- [x] 3.1 Refactor stock-entry screens to load stock-maintenance controls and use them as the only source of truth for visible and required stock dimensions.
- [x] 3.2 Remove barcode-generation-mode-driven size/color column visibility from opening stock and stock adjustment while preserving barcode-based prefills where useful.
- [x] 3.3 Implement save-time validation and completion prompts for stock rows that are missing dimensions required by stock-maintenance settings.
- [x] 3.4 Add stock-adjustment validation that allows new combinations only on positive adjustments and blocks negative adjustments for combinations not yet present in stock.
- [x] 3.5 Implement phase-1 stock-adjustment inline completion for required size/color dimensions and existing-item structural associations without adding full item-onboarding UX.

## 4. Opening Stock Hydration

- [x] 4.1 Extend opening-stock workflows to resolve or create missing legacy items only, hydrating the required core item fields plus the flat legacy-item path for historical barcodes.
- [x] 4.2 Add opening-stock support for creating missing size master records and reusing them within the current hydration flow when the effective barcode-generation mode requires size.
- [x] 4.3 Add opening-stock support for creating missing color master records and reusing them within the current hydration flow when the effective barcode-generation mode requires color.
- [x] 4.4 Ensure opening stock explicitly skips canonical item hydration, canonical barcode-definition hydration, and canonical sellable association hydration, while still creating the single required price row for legacy items.
- [x] 4.5 Add a bulk-import review step that summarizes missing item/size/color masters and creates them only after one batch confirmation.
- [x] 4.6 Implement duplicate-pair validation so Opening Stock allows repeated rows for the same legacy item name/barcode pair but blocks conflicting pairings.

## 5. Sales And Barcode-Assisted Flow Updates

- [x] 5.1 Update sales item-selection and line-entry flows so Quotation, Sale Order, Sales Delivery, Sales Return, and POS can mix canonical items and flat legacy items on the same document, while excluding standalone Sales Invoice from scope.
- [x] 5.2 Update barcode lookup services and UI flows to treat barcode results as stock-row snapshots rather than legacy/new classification.
- [x] 5.3 Implement partial-resolution behavior that prompts users for missing size/color dimensions when stock maintenance requires more detail than barcode lookup provides.

## 6. Verification and Retirement

- [x] 6.1 Add regression coverage for opening stock hydration, legacy-item creation/correction, stock-maintenance-driven visibility, and barcode partial-resolution flows.
- [x] 6.2 Add reconciliation checks that compare pre-cutover `legacyStock` behavior with unified `stock` behavior for lookup, transfer, adjustment, and reporting.
- [x] 6.3 Define and verify how inactive canonical and legacy items are excluded from sales selection and blocked from inward/opening flows when they already exist.
- [x] 6.4 Remove remaining `legacyStock` runtime dependencies and retire the table or endpoint after the validation window completes.
