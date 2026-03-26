## Why

Barcode generation is currently configured per item through the Item Master `Price Method` selection, which allows different items to use different barcode patterns. Before go-live, we want to make barcode generation a single company-level decision so item creation stays consistent and customers cannot accidentally mix barcode schemes.

## What Changes

- Add a single control-panel setting under Item Settings for `barcodeGenerationMethod` with the supported values `STANDARD`, `SIZE`, and `SIZE_COLOR`.
- Update Item Master to remove the per-item `Price Method` selector and render its pricing and barcode UI from the control-panel `barcodeGenerationMethod`.
- Update barcode generation and item price row behavior so new and edited items follow the centralized method automatically.
- Update downstream inventory flows that currently read `item.priceMethod` to use the centralized barcode generation method instead.
- **BREAKING** Remove persistence and runtime use of `Item.priceMethod` from the data model and item service layer before go-live.

## Capabilities

### New Capabilities
- `centralized-barcode-generation`: Manage barcode generation mode once in the Item control panel and apply it consistently across item and inventory workflows.

### Modified Capabilities

## Impact

- Affected frontend areas include Item Settings, Shocks Item Master, quick-add item flows, opening stock, stock adjustment, and any UI that branches on item pricing mode.
- Affected backend areas include `ItemControlPanel`, item create/update validation, and schema changes removing `Item.priceMethod`.
- Requires a schema migration and coordinated updates to frontend and backend consumers before implementation is complete.
