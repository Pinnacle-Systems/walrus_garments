# transaction-screen-authority-matrix Specification

## Purpose
Define which authority source governs visible fields, option lists, and execution behavior for catalog, stock-writing, and hybrid fulfillment transaction screens.
## Requirements
### Requirement: Transaction screens SHALL use role-specific authority sources
The system SHALL classify transaction screens by role and SHALL use the matching authority source for visible document fields and option lists. Catalog-driven screens SHALL use Item Master and Item Price List. Stock-writing screens SHALL use Stock Control. Hybrid fulfillment screens SHALL preserve the source sales-document shape on the visible document while using stock snapshots or allocation underneath when operationally required.

#### Scenario: Hybrid fulfillment lookup does not silently collapse ambiguous stock identity
- **WHEN** a user searches or scans from a hybrid fulfillment screen using a line shape that is less granular than tracked stock identity
- **AND** more than one compatible stock bucket matches that lookup
- **THEN** the workflow returns the candidate stock buckets for explicit resolution underneath the visible document line
- **AND** it does not silently pool or choose a stock bucket for inventory reduction

### Requirement: Transaction conversion SHALL preserve upstream business shape
When one transaction converts into another, the destination workflow SHALL preserve the upstream document’s business-line shape unless both source and destination are inventory-shaped screens. Conversion MUST NOT silently replace the source document’s visible dimensions with the destination persistence layer’s more granular stock shape.

#### Scenario: Quotation converts to sale order
- **WHEN** a user converts Estimate / Quotation into Sale Order
- **THEN** the destination sale-order lines preserve the item-master-driven sales shape from the source document
- **AND** conversion does not introduce stock-only dimensions into the visible line structure

#### Scenario: Sale order converts to sales delivery
- **WHEN** a user converts Sale Order into Sales Delivery
- **THEN** the visible delivery lines preserve the source sale-order line shape
- **AND** the workflow may perform stock-side allocation underneath without forcing the document itself to adopt stock-only dimensions

#### Scenario: Purchase inward converts to purchase return
- **WHEN** a user converts Purchase Inward into Purchase Return
- **THEN** the destination return lines preserve the source stock-shaped line structure
- **AND** the conversion continues to follow Stock Control because both transactions are inventory-shaped

