## Context

The frontend currently models the sales flow as a chained set of tab launches:

- Quotation -> Sale Order
- Sale Order -> Sales Invoice
- Sales Invoice -> Sales Delivery

That chaining is reflected in the data model as well. `SalesInvoice` already stores `saleOrderId`, but `SalesDelivery` still stores `salesInvoiceId`, and the Sales Delivery conversion screen currently hydrates itself from invoice data and invoice items. This means the UI flow and persistence layer both still assume invoice-first delivery creation.

The requested behavior is narrower than removing invoicing entirely. Sales Invoice should continue to exist as a standalone module. The change is only about removing invoice from the conversion chain and making Sales Delivery derive from Sale Order directly.

## Goals / Non-Goals

**Goals:**
- Let users launch Sales Delivery directly from Sale Order.
- Stop offering Sales Invoice as the default next conversion step from Sale Order.
- Make converted Sales Delivery records inherit their source linkage and item prefill from Sale Order.
- Support partial delivery conversion by allowing users to remove copied lines or reduce copied quantities before save.
- Support repeated conversions by prefilling only remaining undelivered quantities from the source sale order.
- Block converted delivery saves unless received payment for the source sale-order flow covers the delivery net amount.
- Preserve standalone Sales Invoice behavior outside this conversion path.

**Non-Goals:**
- Remove the Sales Invoice module, routes, reports, or CRUD behavior.
- Redesign invoice payment behavior or invoice-specific reporting.
- Rework broader quotation-to-order behavior beyond what is needed to launch delivery directly.
- Introduce multi-source delivery creation from both orders and invoices at the same time.

## Decisions

1. Make Sale Order the only upstream conversion source for Sales Delivery.
The conversion action should move to the sale order surface, and the sales delivery tab should interpret its incoming `projectId` as a sale order id for conversion mode.

Alternative considered: keep both Sale Order -> Sales Delivery and Sales Invoice -> Sales Delivery available.
This was rejected because the requested workflow explicitly removes invoice from the conversion flow, and supporting both sources would preserve the ambiguity the change is intended to eliminate.

2. Keep Sales Invoice available, but disconnected from the conversion path.
The invoice module remains a standalone transaction screen, which limits scope and avoids unrelated regressions in billing or payment workflows.

Alternative considered: remove invoice UI, services, and schema entirely.
This was rejected because the request is specifically to remove invoice from the conversion flow, not to retire the module.

3. Move Sales Delivery linkage from `salesInvoiceId` to `saleOrderId`.
Converted deliveries should track the originating sale order directly. This keeps delivery history aligned to the business source document and matches the new flow.

Alternative considered: keep storing `salesInvoiceId` while launching delivery from sale order.
This was rejected because it would leave delivery records pointing to a document that may not exist in the new path.

4. Use Sale Order item data as the delivery prefill source.
When opening a converted delivery, the screen should copy sale order header fields and `SaleOrderItems` into the editable delivery state, matching the way other conversions currently prefill from their immediate source.

Alternative considered: derive delivery items indirectly by first creating or loading an invoice-shaped payload.
This was rejected because it adds a redundant transformation layer once invoice is no longer part of the path.

5. Track conversion progress at the sale-order-line level instead of treating delivery as a one-time state.
The sale order report currently hides conversion once an invoice exists, and the first round of this change shifts that gating to delivery existence. Partial conversion changes the requirement again: the system must know which order lines and quantities have already been delivered so later conversions can prefill only the remaining quantities.

Alternative considered: keep a simple sale-order-level delivered/not-delivered flag.
This was rejected because it cannot distinguish fully delivered orders from partially delivered orders and cannot support remaining-quantity prefills.

6. Persist a source sale-order-line reference on each sales delivery line.
Each converted delivery line should retain the originating sale-order-line identity so remaining quantities can be derived from saved deliveries rather than from one-time UI state. This allows later conversions and edits to recompute the remaining deliverable quantity correctly.

Alternative considered: infer matches from item, size, and color alone.
This was rejected because repeated product combinations can appear on different sale-order lines, making quantity reconciliation ambiguous.

7. Prefill subsequent conversions from remaining quantities only.
When a user starts another conversion from the same sale order, the system should include only lines whose undelivered quantity is still greater than zero, and each copied line's quantity should equal that remaining amount. Users may then reduce those quantities further or remove those lines before saving.

Alternative considered: always copy the full original order and rely on the user to manually remove already delivered quantities.
This was rejected because it is error-prone and does not provide the requested workflow.

8. Enforce payment coverage against the delivery being saved.
Converted sales deliveries should save only when total received payment for the source sale-order flow is greater than or equal to the current delivery's net amount. This rule should evaluate the delivery being saved, not the full sale order total, so partial deliveries can proceed incrementally as payment is received.

Alternative considered: require payment to cover the entire sale order before any delivery.
This was rejected because it would be stricter than requested and would block partial fulfilment even when the specific delivery being shipped is covered.

## Risks / Trade-offs

- [Schema and service changes can orphan existing assumptions] -> Update both frontend payload mapping and backend persistence together so conversion mode and saved records stay aligned.
- [Historical deliveries may already reference invoices] -> Preserve backward compatibility for existing records during load/display, even if new writes move to sale-order linkage.
- [Sale order report data may not currently include delivery relations or delivered quantities] -> Expand the sale order query/service shape so the report and conversion entry flow can compute remaining deliverable quantities accurately.
- [Invoice screen may still expose downstream delivery actions] -> Remove or disable invoice-driven delivery conversion affordances so the old path does not remain reachable.
- [Naming and tab-state reuse could become confusing] -> Treat `projectId` consistently as the current conversion source id for the target screen, while updating the delivery screen’s source query and prop names to reflect sale-order origin.
- [Edits to saved deliveries can change what remains on the sale order] -> Derive remaining quantities from persisted delivery lines on each new conversion instead of storing a denormalized remaining-quantity snapshot.
- [Payment gating can be misapplied if unrelated payments are counted] -> Scope the received-payment total to the same sale-order flow used for conversion, most likely quotation advance receipts already linked through the originating quotation unless the payment model is expanded.

## Migration Plan

1. Update the sale order UI to launch Sales Delivery directly and stop presenting Sales Invoice as the next conversion step.
2. Update sales delivery conversion to compute remaining quantities from prior deliveries and prefill only the undelivered sale-order lines.
3. Update sales delivery persistence and schema relationships to support direct sale-order linkage plus source sale-order-line references.
4. Add conversion-time payment validation against the delivery net amount.
5. Verify partial conversion, repeated conversion, payment gating, and standalone sales invoice behavior.

## Open Questions

- Should payment coverage for delivery conversion be derived only from quotation-linked advance receipts, or does the business want sale-order-specific receipt tracking added as part of this same change?
