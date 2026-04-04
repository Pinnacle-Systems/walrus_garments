## Why

Legacy Opening Stock and canonical inventory intake flows currently blur together variant requiredness, stock-granularity support, and barcode behavior. That makes Opening Stock too influential over modern validation rules while leaving canonical Purchase Inward / Purchase Return expectations encoded only indirectly in service behavior.

## What Changes

- Centralize item-variant validation around two inputs: `isLegacy` and centralized `barcodeGenerationMethod`.
- Treat Opening Stock as the legacy compatibility path with permissive validation for `size`, `color`, and stock-defined runtime fields.
- Treat Purchase Inward and Purchase Return as canonical inventory flows that enforce `size` / `color` completeness according to centralized barcode-generation mode.
- Clarify that Stock Control fields such as `field1` through `field10` define supported stock granularity and persistence/matching semantics, not unconditional required-entry rules.
- Update runtime stock-writing specifications so stock-defined fields may participate in stock identity when present without automatically blocking save when absent.

## Capabilities

### New Capabilities

### Modified Capabilities
- `centralized-barcode-generation`: Define centralized barcode mode as the authority for canonical variant requiredness while excluding legacy Opening Stock from those requirements.
- `stock-entry-field-authority`: Separate stock-granularity support from hard requiredness and clarify that stock-defined fields do not automatically become mandatory entry fields.
- `stock-entry-granularity-controls`: Reframe stock-maintenance settings as stock granularity and completion support rather than unconditional requiredness, especially for legacy Opening Stock.
- `transaction-screen-authority-matrix`: Clarify that Opening Stock is a legacy compatibility path while Purchase Inward / Purchase Return are canonical inventory flows.

## Impact

- Affected services: `src/services/item.service.js`, `src/services/directInwardOrReturn.service.js`, `src/services/accessoryPurchaseInward.service.js`, `src/services/accesssoryPoReturn.service.js`, `src/services/stock.service.js`, and shared stock helpers.
- Affected configuration sources: `ItemControlPanel.barcodeGenerationMethod`, `Item.isLegacy`, and Stock Control / stock runtime field helpers.
- Affected behavior: Item Master validation, canonical inward/return validation, Opening Stock compatibility handling, and stock-field requiredness semantics across stock-writing screens.
