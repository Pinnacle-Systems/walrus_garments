## 1. Shared Stock-Field Contract

- [x] 1.1 Add or extract a shared runtime stock-field-definition helper that derives tracked shared dimensions and configured stock-driven fields from the active `StockReportControl` record across `field1` through `field10`.
- [x] 1.2 Update shared stock-writing helpers so configured stock-driven fields are exposed consistently for capture, persistence, and matching semantics when active in Stock Control.
- [x] 1.3 Document or encode the ordering/mapping rules that runtime stock-writing screens use for configured stock-driven fields so all in-scope flows follow the same contract.

## 2. Opening Stock Alignment

- [x] 2.1 Update Opening Stock schema generation, import parsing, template generation, review-grid rendering, and manual-entry rendering to use the shared stock-field-definition contract rather than a `field6` to `field10` special case.
- [x] 2.2 Extend Opening Stock row handling so configured runtime stock-driven fields across `field1` through `field10` are captured consistently in the unified schema and review flow.
- [x] 2.3 Extend Opening Stock save payload mapping so all configured runtime stock-driven fields persist into the corresponding `Stock` columns.

## 3. Stock Adjustment And Transfer Alignment

- [x] 3.1 Update Stock Adjustment row rendering and inline completion so configured runtime stock-driven fields appear when active in Stock Control.
- [x] 3.2 Update Stock Adjustment save/update flows so configured runtime stock-driven fields are validated and persisted on both adjustment items and resulting `Stock` rows.
- [x] 3.3 Update Stock Transfer row rendering so configured runtime stock-driven fields appear on transfer capture when active in Stock Control.
- [x] 3.4 Update Stock Transfer save/update flows so configured runtime stock-driven fields are validated and persisted on both transfer legs written to `Stock`.

## 4. Purchase Inward / Return Consistency

- [x] 4.1 Verify Purchase Inward / Direct Inward still follows the shared stock-field contract for configured `field1` through `field10` after helper consolidation.
- [x] 4.2 Verify Purchase Return continues to enforce the same configured stock-driven field set and does not regress to a narrower stock-entry contract.

## 5. Verification

- [x] 5.1 Add or update tests for shared stock-field derivation and validation covering configured `field1` through `field10`.
- [x] 5.2 Verify Opening Stock, Stock Adjustment, and Stock Transfer all expose configured stock-driven fields consistently and preserve captured values without regressing screen-specific completion behavior.
- [x] 5.3 Verify persisted `Stock` rows from Opening Stock, Stock Adjustment, and Stock Transfer include values for configured runtime stock-driven fields whenever those values are captured.
