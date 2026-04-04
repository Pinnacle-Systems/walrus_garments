## Context

The product now clearly distinguishes two configurable layers: Item Master defines what can be sold, while Stock Control defines how inventory is tracked. That separation is intentional, but some existing spec language still treats “transaction-entry screens” as one category and lets Stock Control drive field schema too broadly. This becomes problematic when the sellable catalog is intentionally less granular than stock tracking, or when fulfillment needs stock detail that should not leak into pre-sales documents.

The same separation also applies to configurable attributes. `ItemControlPanel.field1` through `field5` are item-defined attributes that belong to sellable item structure. `StockReportControl.field1` through `field10` are stock-defined attributes that belong to operational inventory tracking. Matching field numbers across those models do not, by themselves, imply shared meaning or shared authority.

The actual transaction screens fall into three roles:
- catalog-driven screens such as Estimate / Quotation and Sale Order
- stock-writing screens such as Purchase Inward, Purchase Return, Opening Stock, Stock Transfer, and Stock Adjustment
- hybrid fulfillment screens such as Sales Delivery, Sales Return, and Point Of Sales

Even within stock-writing screens, the intake intent is not identical. Purchase Inward is the normal operational intake path for newly received stock that follows current item-master and canonical barcode rules, and it is the path that prints new canonical barcode labels. Opening Stock is the compatibility intake path for pre-existing stock, especially where legacy or coarse barcodes do not align cleanly with the current canonical barcode-generation model.

Conversion flows reinforce those role boundaries rather than erasing them. Quotation converts to Sale Order without introducing stock-only dimensions. Sale Order converts to Sales Delivery, where the visible document should still reflect what was sold, while fulfillment can allocate against more granular stock rows underneath. Purchase Inward converts to Purchase Return with stock-shaped lines preserved directly.

## Goals / Non-Goals

**Goals:**
- Define which authority source governs visible fields, option lists, and execution semantics for each transaction role.
- Narrow the Stock Control field-schema rule so it applies only where stock shape truly matters.
- Clarify how hybrid fulfillment screens bridge item-shaped source documents and stock-shaped execution.
- Clarify that conversion preserves business-document shape from the source flow.

**Non-Goals:**
- Redesign every transaction screen implementation in this change.
- Decide every detailed UX for warehouse allocation, picking, or fulfillment modals.
- Redefine Item Master or Stock Control configuration models themselves.
- Fully specify Sales Return or POS behavior beyond the role-level authority model.

## Decisions

1. Split transaction screens into three authority classes.
Catalog-driven screens use Item Master. Stock-writing screens use Stock Control. Hybrid fulfillment screens preserve source sales-document shape on the visible document while using stock snapshots underneath.

Alternative considered: keep one shared “transaction-entry” authority rule.
This was rejected because catalog, inventory, and fulfillment screens do not serve the same business purpose and therefore should not share one field-schema source.

The same split applies to configurable attributes: item-defined attributes belong to catalog-driven behavior, stock-defined attributes belong to stock-writing behavior, and only explicitly shared master-backed dimensions such as `Size` and `Color` may participate in both worlds under different rules.

2. Treat visible document shape as distinct from storage or allocation shape.
The visible columns on a pre-sales or converted delivery document should represent what the business sold or promised, not necessarily the most granular shape of the underlying stock rows.

Alternative considered: make every destination screen adopt the destination table’s storage granularity.
This was rejected because it would force stock-only dimensions into customer-facing sales documents and break the intended separation between sellable and stock-tracked granularity.

3. Make conversion preserve upstream business shape.
Quotation to Sale Order preserves catalog shape. Sale Order to Sales Delivery preserves source sales-line shape while allowing stock allocation underneath. Purchase Inward to Purchase Return preserves stock shape because both screens are inventory transactions.

Alternative considered: let conversion re-derive line shape independently on each destination screen.
This was rejected because it would make conversions unstable, introduce unexpected dimension changes, and complicate fulfillment logic.

4. Keep Sales Delivery hybrid rather than purely stock-driven.
Sales Delivery needs stock-aware execution and barcode support, but the visible delivery line should still reflect what the order promised unless the business explicitly chooses to expose more fulfillment detail.

Alternative considered: make Sales Delivery fully stock-driven.
This was rejected because it would force fulfillment granularity into the outward sales document and make direct sale-order-to-delivery conversion harder to keep consistent.

5. Gate phased delivery by remaining payment capacity at the delivery-document level.
Converted Sales Delivery should allow the user to choose any subset of remaining sale-order lines as long as the total net amount of the delivery stays within the payment capacity still available for that sale-order flow. The system should not force payment to be allocated per line item.

Alternative considered: allocate received payment to individual sale-order lines and use line-level payment coverage during delivery conversion.
This was rejected because it adds unnecessary accounting complexity to phased delivery and does not match the intended business rule, which is that received payment authorizes a delivery-value envelope for the order flow as a whole.

6. Treat fulfillment allocation as a secondary execution layer under the visible delivery lines.
Users should decide delivery quantities on the sale-order-shaped document first. The workflow may then allocate those chosen quantities against stock rows underneath, but the allocation detail should remain secondary to the visible document shape.

Alternative considered: make the visible delivery grid itself become the fulfillment-allocation grid.
This was rejected because it would push stock-only operational detail into the outward delivery document and weaken the hybrid boundary.

7. Persist fulfillment mapping and inventory movement together at final save.
Any stock allocation selected during Sales Delivery should remain provisional until save. The server should revalidate stock availability against current inventory at save time, then persist the delivery, the delivery-line fulfillment mapping, and the stock-out movement in one transaction.

Alternative considered: treat the allocation chosen in the client as authoritative and write the delivery without a final stock recheck.
This was rejected because concurrent stock changes could make the saved delivery diverge from actual inventory availability.

8. Distinguish item-defined attributes, stock-defined attributes, and shared master-backed dimensions.
`ItemControlPanel.field1` through `field5` define item-master attributes for sellable-document shape. `StockReportControl.field1` through `field10` define tracked stock attributes for inventory capture. Shared master-backed dimensions such as `Size` and `Color` may be used in both catalog and stock workflows, but each screen role still derives visibility and requiredness from its own authority source.

Alternative considered: assume matching field numbers across Item Control Panel and Stock Report Control describe the same business attribute.
This was rejected because the two configuration layers intentionally support different granularity and different meanings.

9. Keep tracked stock fields required even when item granularity is coarser.
When a stock-writing screen requires a tracked stock field, lower granularity in Item Master must not make that field optional. For shared master-backed dimensions such as `Size` and `Color`, the workflow should use item-scoped options when available, fall back to normalized master selection when item granularity is lower, and allow controlled master creation where needed. For stock-defined business attributes such as `StockReportControl.field1` through `field10`, direct operational entry remains acceptable.

Alternative considered: make tracked stock fields optional whenever Item Master does not supply item-scoped option lists.
This was rejected because it would make stock identity depend on item-setup completeness instead of on Stock Control policy.

## Risks / Trade-offs

- [Existing helper code may still assume stock-driven option filtering on sales screens] → Capture the authority split in spec first, then audit helpers during implementation.
- [Hybrid screens may still need detailed warehouse allocation UX later] → Keep this change focused on authority and conversion rules, and defer detailed fulfillment UX to follow-on work.
- [Payment gating and stock allocation now interact in Sales Delivery] → Keep payment coverage at the whole-delivery level while validating stock allocation separately so the concerns stay understandable.
- [Sales Return and POS may still need more specific behavior choices] → Define their role class now and allow future changes to refine the exact execution details without reopening the core authority split.
- [Older stock-control-driven wording may conflict with the new matrix] → Update the affected existing capabilities directly so the normative rules no longer overlap ambiguously.
