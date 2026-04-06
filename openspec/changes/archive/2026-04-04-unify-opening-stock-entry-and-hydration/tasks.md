## 1. Unified Workspace Shell

- [x] 1.1 Replace the separate Opening Stock manual/import top-level surface switch with one shared table workspace and common workspace actions for add row, import, template download, and save.
- [x] 1.2 Route both manual row creation and bulk-imported rows into one shared Opening Stock row state model so the current table batch is origin-agnostic after ingestion.

## 2. Shared Row Contract

- [x] 2.1 Extend the Opening Stock schema helper so one ordered row contract drives unified table columns, manual row defaults, import header mapping, template headers, validation, and save payload mapping.
- [x] 2.2 Ensure the shared row contract includes `item name`, `item code`, `price`, `qty`, `uom`, and all Stock-Control-driven stock fields in a stable order.

## 3. Legacy Item Hydration Reuse

- [x] 3.1 Update Opening Stock legacy-item creation and enrichment so row `item code` hydrates both the legacy item code and the legacy barcode identity.
- [x] 3.2 Update Opening Stock legacy-item creation and enrichment so row `price` hydrates the flat legacy sales price without asking for a separate duplicate field.
- [x] 3.3 Keep legacy-item hydration scoped to the flat legacy item model and avoid introducing canonical variant creation through Opening Stock.

## 4. Shared Master Review Flow

- [x] 4.1 Replace origin-specific missing-master handling with one shared pending-review collector for missing items, sizes, and colors across the whole Opening Stock table batch.
- [x] 4.2 Keep missing-color code completion inside the shared review flow and preserve grouped review behavior for missing items and sizes.
- [x] 4.3 Block final stock save while any row depends on unresolved pending master creation or still-missing required stock fields.

## 5. Template And Validation Alignment

- [x] 5.1 Update the downloadable Opening Stock template so it is generated from the shared row contract used by the unified table.
- [x] 5.2 Update import parsing and row validation so imported rows and manually added rows follow the same shared contract and row-state behavior.

## 6. Verification

- [x] 6.1 Add or update tests covering the unified Opening Stock workspace with a mix of imported rows and manually added rows in the same batch.
- [x] 6.2 Verify legacy-item hydration reuses `item code` and `price` correctly for new and existing legacy items.
- [x] 6.3 Verify shared missing-master review handles items, sizes, and color-code completion correctly across mixed-origin rows.
