## Why

The current sales conversion path still forces users through Sales Invoice before they can create Sales Delivery. That no longer matches the intended workflow. Users should be able to move directly from Sale Order to Sales Delivery, while Sales Invoice remains available as its own module for manual or independent use.

Keeping Sales Invoice inside the conversion chain also causes Sales Delivery to inherit the wrong upstream relationship. Delivery records should link back to the originating Sale Order rather than to an intermediate invoice that is no longer required for the flow.

## What Changes

- Remove Sales Invoice from the standard conversion flow so users no longer convert Sale Order into Sales Invoice as the next step.
- Introduce direct Sale Order to Sales Delivery conversion from the sale order workspace/report actions.
- Update Sales Delivery conversion prefill behavior so a delivery opened from conversion reads Sale Order header values and Sale Order items rather than Sales Invoice data.
- Allow partial sale-order to sales-delivery conversion so users can reduce quantities or remove copied line items before saving a delivery.
- Support repeated conversions from the same sale order by prefilling only the remaining undelivered line items and remaining quantities on subsequent deliveries.
- Require total received payment for the source sale order flow to be greater than or equal to the delivery net amount before a converted sales delivery can be saved.
- Update Sales Delivery persistence so converted deliveries track the originating `saleOrderId` and no longer store or depend on `salesInvoiceId` for this flow.
- Preserve the Sales Invoice module itself so users can still create, view, edit, and use invoices outside the removed conversion path.

## Capabilities

### New Capabilities
- `sales-order-direct-delivery-conversion`: Defines the direct conversion path from Sale Order to Sales Delivery without requiring Sales Invoice as an intermediate step.

### Modified Capabilities

## Impact

- Affected code spans the sale order, sales invoice, and sales delivery transaction screens under `client/src/Uniform/Components/**`.
- Backend work is required in the sales delivery service and schema/model relationship so delivery records reference sale orders for converted flows and track source line-item usage across repeated deliveries.
- Sale order reporting and action availability will need to reflect remaining deliverable quantities rather than a simple first-delivery-created state.
- Conversion-time payment validation must be able to compare received payment totals for the sale-order flow against the net amount of the delivery being saved.
- Sales Invoice should remain present in navigation and usable as a standalone module after the flow change.
