## Why

Quotation and Sale Order should represent the full sellable catalog, not only the combinations that currently exist in stock. Right now the product direction is clear in discussion but not captured as an explicit contract, which makes it easy for sales-entry behavior to drift toward stock-driven filtering.

## What Changes

- Define Quotation and Sale Order as item-master-driven sales-entry surfaces.
- Require these screens to allow any valid item, size, and color combination supported by Item Master and Item Price List, even when no matching stock row exists.
- Clarify that stock availability on these screens is advisory only when shown, and must not remove otherwise valid sellable options from selection.
- Define Quotation and Sale Order visible sales dimensions from Item Master and Item Price List rather than from Stock Control.
- Keep Stock Control as the authority for stock-writing inventory screens rather than pre-fulfillment sales documents.
- Distinguish pre-fulfillment sales documents from stock-assisted fulfillment workflows that may legitimately resolve from stock snapshots.

## Capabilities

### New Capabilities
- `sales-catalog-source-authority`: Defines whether pre-fulfillment sales-entry screens derive selectable sellable combinations from Item Master and Item Price List or from stock presence.

### Modified Capabilities
- `transaction-entry-surfaces`: Clarify that standardization preserves this new source-of-truth behavior for Quotation and Sale Order while keeping their existing business semantics intact.

## Impact

- Affected frontend areas are the Quotation and Sale Order line-item entry screens under `client/src/Uniform/Components/**`.
- Related helpers that currently mix stock-driven and item-master-driven option resolution may need cleanup.
- The change establishes the catalog-driven side of a broader authority split; Sales Delivery, Sales Return, and POS may be refined separately as hybrid fulfillment screens.
