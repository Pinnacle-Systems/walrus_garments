## 1. Authority Audit

- [x] 1.1 Inventory the runtime screens and helpers that currently use Stock Control Panel for field presence/requiredness versus item barcode-generation mode for runtime field behavior.
- [x] 1.2 Identify every place where `effectiveBarcodeGenerationMethod` or `getItemBarcodeGenerationMethod(...)` currently influences field-schema decisions rather than variant/barcode behavior.

## 2. Shared Runtime Boundary

- [x] 2.1 Refactor shared helpers so Stock Control Panel remains the source of truth for transaction field schema, while item variant data is used only for valid option filtering and price/barcode resolution.
- [x] 2.2 Update helper naming or inline documentation as needed so the authority boundary is obvious to future maintainers.

## 3. Screen Alignment

- [x] 3.1 Align Opening Stock and Stock Adjustment flows so item barcode-generation mode does not determine stock-entry field presence or requiredness.
- [x] 3.2 Align stock-writing and stock-assisted operational screens that currently rely on item-level barcode mode for size/color behavior, preserving valid variant filtering without letting it control field schema.
- [x] 3.3 Review quick-add item modal usage in runtime stock/transaction screens and constrain barcode-mode branching to item-structure editing behavior only.

## 4. Verification

- [x] 4.1 Verify Stock Control Panel settings alone control whether Size and Color fields appear and are required in stock-entry flows.
- [x] 4.2 Verify item barcode-generation mode still drives price lookup, barcode lookup, and valid variant-combination filtering where appropriate.
- [x] 4.3 Verify transaction screens no longer drift into using barcode-generation mode as an implicit source of field requiredness.
- [x] 4.4 Verify stock-writing surfaces block save when any Stock Control tracked field is still missing, even when rows begin from partial barcode or import prefills.
- [x] 4.5 Verify stock-writing surfaces do not reject rows solely because multiple tracked stock combinations share the same barcode.
- [x] 4.6 Reconciliation note: catalog-driven sales screens do not use Stock Control as their visible-column authority.
