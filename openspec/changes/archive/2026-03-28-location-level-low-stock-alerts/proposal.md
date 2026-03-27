## Why

Low-stock configuration currently exists in two places: `ItemPriceList.minStockQty` and `MinimumStockQty.minStockQty` per location. That overlap creates ambiguous behavior, and the current stock-service logic treats the item-price-list value as a broader fallback than the UI suggests.

## What Changes

- Remove `minStockQty` from `ItemPriceList`.
- Treat low-stock thresholds as location-level data only through `MinimumStockQty`.
- Update item create, edit, and quick-add flows so they no longer read or write an item-level minimum stock quantity.
- Update Item Master so low-stock settings are managed only through location-wise rows instead of a standalone minimum-stock field.
- Simplify low-stock detection logic to always compare stock against location-level thresholds.

## Capabilities

### New Capabilities
- `location-level-low-stock-alerts`: Define how low-stock thresholds are captured and evaluated exclusively at the location level.

### Modified Capabilities

## Impact

- Prisma schema and migrations for `ItemPriceList` and `MinimumStockQty`
- Item create/update/get services
- Stock alert calculation service
- Item Master and quick-add item UIs
- Manual verification for low-stock alert behavior across barcode-generation modes
