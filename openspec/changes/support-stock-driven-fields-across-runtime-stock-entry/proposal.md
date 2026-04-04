## Why

Stock-writing screens currently disagree about which Stock Control fields are real runtime stock-entry requirements. Purchase Inward / Direct Inward already reads and persists `field1` through `field10`, while Opening Stock operationalizes only `field6` through `field10`, and Stock Adjustment and Stock Transfer do not consistently capture configured stock-defined fields. That drift breaks the contract that Stock Control is the authority for runtime stock-entry schema.

## What Changes

- Standardize runtime stock-writing behavior so configured stock-driven fields are treated consistently across Opening Stock, Purchase Inward, Purchase Return, Stock Adjustment, and Stock Transfer.
- Clarify that stock-defined operational fields configured through Stock Control may include `field1` through `field10`, not only `field6` through `field10`.
- Expand Opening Stock’s dynamic stock schema to align with the full configured stock-driven field set used by runtime stock-writing flows.
- Require Stock Adjustment and Stock Transfer to render, validate, and persist the configured stock-driven field set before writing `Stock` rows.
- Preserve the rule that Stock Control, not item barcode-generation mode, remains the authority for runtime stock-entry field presence and requiredness.

## Capabilities

### New Capabilities

### Modified Capabilities
- `stock-entry-field-authority`: Clarify that runtime stock-writing screens must operationalize the configured stock-driven field set across `field1` through `field10` when those fields are part of Stock Control.
- `stock-entry-granularity-controls`: Extend stock-writing completion rules so configured stock-driven fields are required consistently on all in-scope stock-writing screens, not just selected flows.
- `opening-stock-dynamic-schema`: Expand the opening-stock dynamic schema contract from the narrower additional-field handling to the full configured stock-driven field set used by runtime stock entry.

## Impact

- Affected UI: Opening Stock, Purchase Inward, Purchase Return, Stock Adjustment, and Stock Transfer stock-entry surfaces.
- Affected services: runtime stock-writing save/update flows that create `Stock` rows, especially `directInwardOrReturn`, `stockAdjustment`, and `StockTransfer`.
- Affected configuration source: `StockReportControl` and any shared helpers that derive runtime stock field schema from Stock Control.
- No database schema change is expected; the work is aligning runtime behavior with the existing stock/control field model.
