## Why

The current implementation mixes two different product intents:

- Item Control Panel barcode-generation settings describe how item variants, price-list rows, and canonical barcode behavior are structured.
- Stock Control Panel settings describe which operational stock-entry dimensions the UI should capture and require.

Several runtime flows already use Stock Control Panel correctly for stock-entry columns and requiredness, but other helpers and quick-add flows still branch on `effectiveBarcodeGenerationMethod` or `getItemBarcodeGenerationMethod(...)` in ways that influence field behavior. That makes the source of truth ambiguous and risks inconsistent transaction behavior across stock, sales, and inward flows.

## What Changes

- Declare Stock Control Panel as the only source of truth for stock-entry and transaction field presence and requiredness for item, size, and color capture.
- Limit barcode-generation settings to variant, price-list, and barcode-resolution behavior rather than using them to decide whether stock-entry fields exist or are mandatory.
- Refactor shared helpers and affected transaction screens so item-level barcode mode only filters valid variant combinations or resolves price/barcode data, without controlling field schema.
- Align opening stock, stock adjustment, and related transaction surfaces to this boundary so the runtime behavior matches the approved design intent.

## Capabilities

### New Capabilities
- `stock-entry-field-authority`: Defines that Stock Control Panel governs stock-entry field presence and requiredness, while barcode-generation settings govern variant/barcode behavior only.

### Modified Capabilities
- `stock-entry-granularity-controls`: Clarify that the configured stock-maintenance granularity is the source of truth for transaction field schema, even when item-level barcode-generation metadata exists.
- `centralized-barcode-generation`: Clarify that item-level or centralized barcode-generation mode may shape variant lookup and barcode/price resolution, but SHALL NOT determine whether transaction fields exist or are required.

## Impact

- Affected UI includes opening stock, stock adjustment, purchase inward, sales order, sales invoice, sales delivery, quotation, and sales return line-entry behavior.
- Affected shared runtime logic includes helper functions such as `getUniqueArrayBySize`, `getUniqueArrayByColor`, and any quick-add modal logic that currently uses barcode-generation mode to shape field behavior.
- This change reduces ambiguity between stock-maintenance rules and barcode-generation rules, making future stock-entry requirements easier to reason about and test.
