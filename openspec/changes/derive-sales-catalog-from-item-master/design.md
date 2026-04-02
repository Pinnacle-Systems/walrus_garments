## Context

The standardized Uniform sales transaction screens already behave mostly as item-domain screens: Quotation, Sale Order, Sales Delivery, and Sales Invoice load selectable items from Item Master and pricing rows from Item Price List, while the wider codebase still contains older sales and POS-style surfaces that read directly from stock. That mixed reality creates a risk that pre-fulfillment sales documents drift toward stock-driven filtering even though their business purpose is to capture demand against the sellable catalog.

This change focuses on Quotation and Sale Order because they are pre-fulfillment documents. They should allow the business to quote or order any valid sellable option defined in Item Master, regardless of whether the combination currently has stock. The change needs an explicit contract so future refactors do not treat stock presence as the source of allowed item combinations on those screens.

Quotation and Sale Order are catalog-driven screens. Their visible document shape should follow the sellable definition from Item Master and Item Price List rather than the stock-tracking shape from Stock Control.

## Goals / Non-Goals

**Goals:**
- Define Quotation and Sale Order as item-master-driven catalog entry surfaces.
- Make Item Master and Item Price List the source of selectable item, size, and color combinations for those screens.
- Make Item Master the authority for visible sales dimensions on Quotation and Sale Order, not just for option values.
- Allow stock availability to remain visible as advisory information without controlling which sellable combinations are selectable.
- Distinguish these pre-fulfillment sales documents from stock-assisted fulfillment flows.

**Non-Goals:**
- Redesign Sales Delivery, Sales Invoice, Sales Return, or POS behavior in this change.
- Remove stock availability indicators from sales workflows where they are already helpful.
- Redefine Item Master variant rules or barcode-generation behavior.
- Change stock persistence, stock reservation, or stock deduction semantics.

## Decisions

1. Treat Quotation and Sale Order as catalog-entry surfaces, not stock-snapshot surfaces.
These screens exist to capture intent to sell, so they should offer the full valid catalog from Item Master and Item Price List. Stock presence can lag behind demand, replenishment, or make-to-order workflows and therefore is not a safe source for allowed combinations.

Alternative considered: derive selectable options from current stock for all sales screens.
This was rejected because it would prevent quoting or ordering valid catalog combinations that are temporarily out of stock or not yet inwarded.

2. Use Item Master for visible sales dimensions and sellable-catalog membership.
Quotation and Sale Order should derive both their visible sales dimensions and their valid selectable combinations from item-domain data rather than from Stock Control or current stock rows.

Alternative considered: let stock presence narrow options after Stock Control establishes the fields.
This was rejected for Quotation and Sale Order because it turns stock absence into an implicit prohibition on otherwise valid sellable combinations.

3. Treat stock information as advisory on Quotation and Sale Order.
If these screens show stock quantity or availability badges, that information should guide the user without removing options from selection or save.

Alternative considered: block save when stock is missing.
This was rejected because stock enforcement belongs closer to fulfillment or dispatch workflows than to quotation or order capture.

4. Scope the requirement explicitly to Quotation and Sale Order for now.
The codebase still has older sales and POS paths that are more stock-driven. This change should not silently redefine those surfaces without a separate design decision.

Alternative considered: define a universal rule for every sales surface.
This was rejected because fulfillment-oriented and POS-like flows may intentionally depend on stock snapshots.

Alternative considered: allow Stock Control to add visible stock-only sales columns on Quotation and Sale Order.
This was rejected because it leaks warehouse granularity into catalog-driven sales documents.

## Risks / Trade-offs

- [Quotation and Sale Order may still contain helper logic that assumes stock-backed option filtering] -> Audit shared sales-item helpers and make the new requirement explicit in spec before implementation.
- [Users may expect out-of-stock combinations to be blocked] -> Allow stock status to remain visible as an advisory warning instead of as a hard filter.
- [Future contributors may generalize this rule incorrectly to fulfillment screens] -> Keep the requirement scoped to pre-fulfillment sales documents and state that scope directly in spec language.
- [Item Master and Item Price List data quality issues may become more visible once stock no longer hides gaps] -> Treat missing item-price or variant data as item-domain validation gaps, not as reasons to fall back to stock presence.
