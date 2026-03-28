## 1. Schema And Backend

- [x] 1.1 Remove `minStockQty` from `ItemPriceList` in Prisma and add the migration
- [x] 1.2 Update item create/get/update services to stop reading and writing item-level minimum stock quantity
- [x] 1.3 Preserve create/update handling for `MinimumStockQty` location rows across standard and size-based item flows
- [x] 1.4 Refactor low-stock alert calculation to use only `MinimumStockQty.minStockQty` and to skip combinations with no configured location threshold

## 2. Item Entry UI

- [x] 2.1 Remove the standalone `Min Stock Qty` input from `STANDARD` item entry
- [x] 2.2 Update Item Master so low-stock settings are edited only through location-wise rows for all barcode-generation modes
- [x] 2.3 Update opening-stock and stock-adjustment quick-add item modals to stop reading and writing item-level minimum stock quantity
- [x] 2.4 Prevent duplicate locations within a single stock-alert editor, disable extra rows when all locations are used, and show inline validation if duplication occurs
- [x] 2.5 Ignore fully blank stock-alert rows on save and reject half-filled or invalid quantity rows with inline validation
- [x] 2.6 Add database-backed uniqueness for `(itemPriceListId, locationId)` and return a clear validation error when it is violated

## 3. Verification

- [x] 3.1 Verify item create and edit flows in `STANDARD`, `SIZE`, and `SIZE_COLOR` modes save only location-level thresholds
- [ ] 3.2 Verify low-stock alerts are raised only when a matching location-level threshold exists
- [ ] 3.3 Verify items with no configured location thresholds do not produce fallback low-stock alerts
- [ ] 3.4 Verify duplicate locations cannot be created for the same item-price row through the UI or API
- [ ] 3.5 Verify blank stock-alert rows are ignored, half-filled rows are blocked, and only non-negative integer quantities are accepted
- [ ] 3.6 Verify the database rejects duplicate `(itemPriceListId, locationId)` entries and the application surfaces a usable error
