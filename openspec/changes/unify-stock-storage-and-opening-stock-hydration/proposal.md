## Why

Stock behavior is currently split across `stock` and `legacyStock`, while operational flows such as stock transfer already allow legacy-style and new-style stock to coexist in the main stock table. At the same time, stock-entry screens mix barcode-generation concerns with stock-maintenance field visibility, which makes it harder to support legacy stock onboarding, granular stock capture, and consistent item hydration.

## What Changes

- Consolidate operational inventory handling around a single `stock` table and phase out `legacyStock` as an active runtime dependency.
- Clarify that item-master barcode-generation settings apply only to new barcode definitions and item variant structure, not to stock-entry column visibility.
- Drive stock-entry field visibility from stock-maintenance controls so stock can be captured at item, item+size, or item+size+color granularity independent of barcode behavior.
- Clarify that Purchase Inward is the operational intake path for newly barcoded stock, while Opening Stock is the compatibility intake path for legacy or coarse-barcode stock brought into the unified stock model.
- Add opening-stock hydration flows that can resolve or create core item data and create missing size/color master records without hydrating barcode definitions, price lists, or sellable variant associations.
- Update stock-entry and barcode-assisted workflows so barcode lookup can prefill a stock row snapshot, then prompt for missing dimensions when stock-maintenance rules require more detail than the barcode provides.
- Clarify that legacy or coarse barcodes are compatibility lookup inputs for stock-assisted workflows only, and are not treated as canonical sellable-catalog definitions.

## Capabilities

### New Capabilities
- `opening-stock-hydration`: Guided opening-stock workflows for resolving stock rows, hydrating core item data, creating missing size/color masters, and linking required item associations.
- `unified-stock-storage`: Single-table stock storage and lookup behavior that supports mixed legacy and new stock rows during the transition away from `legacyStock`.
- `stock-entry-granularity-controls`: Stock-entry behavior that uses stock-maintenance controls to determine required dimensions and prompts users to complete missing size/color data when barcode input is less specific.

### Modified Capabilities
- `centralized-barcode-generation`: Clarify that barcode-generation settings govern canonical item barcode definitions for new stock only and do not control stock-entry field visibility.

## Impact

- Affected services include opening stock, stock adjustment, stock transfer, unified stock lookup, and stock reporting.
- Affected UI includes opening stock, stock adjustment, stock transfer, and stock-maintenance control flows.
- Affected master data includes item, size, and color hydration paths, plus item size/color association management.
- Runtime logic will need a migration path that stops new writes to `legacyStock`, backfills active legacy rows into `stock`, and removes location-name-based legacy routing.
