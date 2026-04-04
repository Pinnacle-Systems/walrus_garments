## Transaction Screen Authority Matrix

This note records which runtime authority owns visible document shape for the current transaction screens.

### Catalog-driven screens

- `Quotation`
- `SaleOrder`

Visible columns and option lists come from `Item Master` plus `ItemPriceList`.
Current helpers:
- `client/src/Utils/salesCatalogRules.js`
- `client/src/Uniform/Components/Quotation/QuotationItems.js`
- `client/src/Uniform/Components/SaleOrder/SaleOrderItems.js`

### Stock-writing screens

- `PurchaseInward`
- `PurchaseReturn`
- `OpeningStock`
- `StockTransfer`
- `StockAdjustment`

Visible and required tracked fields come from `StockReportControl`.
Current helpers:
- `client/src/Utils/stockMaintenanceRules.js`
- `client/src/Uniform/Components/PurchaseInward/YarnPoItems.js`
- `client/src/Uniform/Components/OpeningStock/openingStockSchema.js`
- `client/src/Uniform/Components/OpeningStock/ManualAddStock.js`
- `client/src/Uniform/Components/StockTransfer/StockTransferFormUI.js`
- `client/src/Uniform/Components/StockAdjustment/StockAdjustmentForm.js`

### Hybrid fulfillment screens

- `SalesDelivery`
- `SalesReturn`
- `PointOfSale`

The visible document starts from the sales-facing item shape, while stock snapshot, allocation, and payment checks run underneath.
Current helpers and services:
- `client/src/Utils/salesCatalogRules.js`
- `client/src/Uniform/Components/SalesDelivery/SalesDeliveryItems.js`
- `src/services/salesDeliveryConversionRules.js`
- `src/services/salesDelivery.services.js`

## Helper Audit

- `salesCatalogRules.js` is the helper for sellable-document shape. It should be used by catalog-driven screens and any hybrid screen that must preserve visible sales shape.
- `stockMaintenanceRules.js` is the helper for stock-writing field schema. It should not be used to add stock-only visible columns to pre-fulfillment sales documents.
- `helper.js` re-exports both helper families so older callers can migrate incrementally without reintroducing one shared authority rule.
