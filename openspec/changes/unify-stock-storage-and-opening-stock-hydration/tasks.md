## 1. Unified Stock Foundation

- [ ] 1.1 Audit all runtime `legacyStock` read/write paths and add a controlled unified-stock cutover plan for services, reports, and barcode lookup.
- [x] 1.2 Update opening stock, stock adjustment, and stock transfer services so new operational writes target `stock` only and no longer branch by legacy location names.
- [ ] 1.3 Add and run a migration that backfills active `legacyStock` rows into `stock`, with reconciliation checks for quantity and key dimensions.
- [ ] 1.4 Remove active location-name-based stock-table routing from unified stock query and reporting paths once migrated data is verified.

## 2. Stock-Entry Granularity Controls

- [x] 2.1 Refactor stock-entry screens to load stock-maintenance controls and use them as the only source of truth for visible and required stock dimensions.
- [x] 2.2 Remove barcode-generation-mode-driven size/color column visibility from opening stock and stock adjustment while preserving barcode-based prefills where useful.
- [x] 2.3 Implement save-time validation and completion prompts for stock rows that are missing dimensions required by stock-maintenance settings.
- [x] 2.4 Add stock-adjustment validation that allows new combinations only on positive adjustments and blocks negative adjustments for combinations not yet present in stock.
- [x] 2.5 Implement phase-1 stock-adjustment inline completion for required size/color dimensions and existing-item structural associations without adding full item-onboarding UX.

## 3. Opening Stock Hydration

- [ ] 3.1 Extend opening-stock workflows to resolve or create missing items using only the approved core item fields: `item name` and the mode-dependent `size` / `color` fields.
- [x] 3.2 Add opening-stock support for creating missing size master records and reusing them within the current hydration flow when the effective barcode-generation mode requires size.
- [x] 3.3 Add opening-stock support for creating missing color master records and reusing them within the current hydration flow when the effective barcode-generation mode requires color.
- [ ] 3.4 Implement item size and size-color association hydration driven by the effective centralized barcode-generation semantics.
- [ ] 3.5 Ensure opening stock explicitly skips canonical barcode-definition hydration and item price-list hydration.
- [x] 3.6 Add a bulk-import review step that summarizes missing item/size/color masters and creates them only after one batch confirmation.

## 4. Barcode-Assisted Flow Updates

- [ ] 4.1 Update barcode lookup services and UI flows to treat barcode results as stock-row snapshots rather than legacy/new classification.
- [ ] 4.2 Implement partial-resolution behavior that prompts users for missing size/color dimensions when stock maintenance requires more detail than barcode lookup provides.
- [x] 4.3 Rework opening-stock import validation so barcode conflict rules align with unified stock-row behavior instead of hard-coded legacy item-size assumptions.

## 5. Verification and Retirement

- [ ] 5.1 Add regression coverage for opening stock hydration, stock-maintenance-driven visibility, and barcode partial-resolution flows.
- [ ] 5.2 Add reconciliation checks that compare pre-cutover `legacyStock` behavior with unified `stock` behavior for lookup, transfer, adjustment, and reporting.
- [ ] 5.3 Remove remaining `legacyStock` runtime dependencies and retire the table or endpoint after the validation window completes.
