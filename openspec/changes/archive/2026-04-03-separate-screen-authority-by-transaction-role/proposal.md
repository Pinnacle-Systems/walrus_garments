## Why

The current transaction rules blur together three different concerns: what the business sells, how the business tracks inventory, and how the business fulfills a sale from inventory. Treating all transaction screens as though they should derive visible fields from the same authority has created recurring mismatches, especially when Item Master and Stock Control intentionally support different granularity.

## What Changes

- Define a screen-authority matrix that classifies transaction screens as catalog-driven, stock-driven, or hybrid fulfillment screens.
- Clarify that pre-fulfillment sales screens derive visible sales dimensions from Item Master, not Stock Control.
- Clarify that stock-writing inventory screens derive visible stock dimensions from Stock Control.
- Clarify that hybrid fulfillment screens preserve the source sales-document shape on the visible document while using stock snapshots and allocation underneath.
- Clarify that transaction conversion preserves the upstream document’s business shape rather than adopting the destination table’s storage granularity.

## Capabilities

### New Capabilities
- `transaction-screen-authority-matrix`: Defines which authority source governs visible fields, option lists, and execution behavior for catalog, stock, and hybrid transaction screens.

### Modified Capabilities
- `stock-entry-field-authority`: Narrow the Stock Control field-schema rule so it applies to stock-writing and stock-assisted operational screens rather than all transaction screens.
- `sales-catalog-source-authority`: Clarify that catalog-driven sales screens derive visible dimensions from Item Master because they represent sellable-document shape rather than stock shape.
- `sales-order-direct-delivery-conversion`: Clarify that delivery conversion preserves the source sale-order document shape while allowing stock-side allocation during fulfillment.

## Impact

- Affected specs span stock entry, sales catalog entry, and sales delivery conversion behavior.
- The affected UI surface area includes Purchase Inward, Purchase Return, Opening Stock, Stock Transfer, Stock Adjustment, Estimate / Quotation, Sale Order, Sales Delivery, Sales Return, and Point Of Sales.
- Future implementation work will likely touch shared transaction-item helpers and delivery allocation behavior, but this change is primarily establishing the governing contract first.
