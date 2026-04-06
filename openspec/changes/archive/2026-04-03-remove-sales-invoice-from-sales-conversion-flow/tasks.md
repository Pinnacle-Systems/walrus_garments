## 1. Rewire the sales conversion entry point

- [x] 1.1 Replace the sale order conversion action so it launches `SALES DELIVERY` directly instead of `SALES INVOICE`.
- [x] 1.2 Update sale order report/query wiring so conversion availability is based on existing sales delivery linkage rather than sales invoice linkage.
- [x] 1.3 Remove or disable invoice-to-delivery conversion affordances so Sales Invoice is no longer part of the standard conversion path.

## 2. Move sales delivery conversion to sale-order source data

- [x] 2.1 Update the sales delivery screen to treat its conversion `projectId` as a sale order id and prefill header values from the selected sale order.
- [x] 2.2 Update delivery item prefill so converted deliveries copy `SaleOrderItems` instead of `SalesInvoiceItems`.
- [x] 2.3 Rename or refactor delivery conversion props/state as needed so the code clearly reflects sale-order origin rather than invoice origin.
- [x] 2.4 Add source sale-order-line tracking so delivery lines can be tied back to the originating `SaleOrderItems` records.
- [x] 2.5 Update conversion prefill so subsequent sale-order conversions include only remaining undelivered lines and remaining quantities.
- [x] 2.6 Keep partial conversion editable by allowing users to reduce copied quantities or remove remaining lines before save.

## 3. Update persistence to link delivery back to the sale order

- [x] 3.1 Update sales delivery frontend payload mapping to send `saleOrderId` for converted deliveries and stop sending `salesInvoiceId` for the conversion flow.
- [x] 3.2 Update backend sales delivery create/update handling to persist sale-order linkage and stop depending on invoice linkage for new writes.
- [x] 3.3 Update Prisma schema and any required migration files so Sales Delivery relates to `Saleorder` for this flow.
- [x] 3.4 Persist source sale-order-line references on converted delivery items and derive remaining quantities from saved delivery history.
- [x] 3.5 Update sale order reporting/conversion availability so partially delivered orders remain convertible until all line quantities are exhausted.
- [x] 3.6 Enforce a conversion-time save rule that blocks sales delivery save when total received payment is less than the delivery net amount.
- [x] 3.7 Update delivery payment validation so repeated conversions use remaining payment capacity after prior saved deliveries.
- [x] 3.8 Define and persist fulfillment-allocation records for converted delivery execution.
- [x] 3.9 Revalidate chosen fulfillment allocation against current stock and record stock-out movement atomically with delivery save.

## 4. Verify the narrowed workflow change

- [x] 4.1 Smoke test `Quotation -> Sale Order -> Sales Delivery` conversion and confirm delivery prefill uses sale order values and items.
- [x] 4.2 Verify Sales Invoice still opens, saves, edits, and reports normally as a standalone module.
- [x] 4.3 Verify newly created sales deliveries link back to the originating sale order and no longer require a sales invoice to exist first.
- [x] 4.4 Verify a partially delivered sale order prepopulates only remaining lines and remaining quantities on the next conversion.
- [x] 4.5 Verify users can still reduce quantities or remove remaining lines during conversion before save.
- [x] 4.6 Verify the system blocks converted delivery save when received payment is below the delivery net amount and allows save once payment coverage is sufficient.
- [x] 4.7 Verify Sale Order -> Sales Delivery conversion preserves visible source line shape while allowing stock-side allocation underneath.
- [x] 4.8 Verify repeated conversions subtract prior saved delivery value from available payment capacity.
- [x] 4.9 Verify Sales Delivery save rejects stale stock allocation when current inventory changed after the user chose the allocation.
