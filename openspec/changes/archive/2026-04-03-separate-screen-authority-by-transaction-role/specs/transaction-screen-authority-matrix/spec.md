## ADDED Requirements

### Requirement: Transaction screens SHALL use role-specific authority sources
The system SHALL classify transaction screens by role and SHALL use the matching authority source for visible document fields and option lists. Catalog-driven screens SHALL use Item Master and Item Price List. Stock-writing screens SHALL use Stock Control. Hybrid fulfillment screens SHALL preserve the source sales-document shape on the visible document while using stock snapshots or allocation underneath when operationally required.

#### Scenario: Matching field numbers do not imply shared authority
- **WHEN** Item Control Panel and Stock Report Control both define configurable fields with similar labels such as `field1`
- **THEN** the system does not assume those fields share the same meaning or authority just because their field numbers match
- **AND** catalog-driven screens follow item-defined attributes while stock-writing screens follow stock-defined attributes

#### Scenario: User opens a catalog-driven sales screen
- **WHEN** a user opens Estimate / Quotation or Sale Order
- **THEN** the screen derives visible sales dimensions and selectable combinations from Item Master and Item Price List
- **AND** it does not use stock presence as the source of document shape

#### Scenario: User opens a stock-writing inventory screen
- **WHEN** a user opens Purchase Inward, Purchase Return, Opening Stock, Stock Transfer, or Stock Adjustment
- **THEN** the screen derives visible stock dimensions and required tracked fields from Stock Control
- **AND** it does not rely on sellable-catalog shape to decide which stock fields must be captured

#### Scenario: Stock-writing screen keeps tracked stock fields required when item granularity is coarser
- **WHEN** a stock-writing screen requires a tracked dimension or stock-defined attribute from Stock Control
- **AND** Item Master is less granular than the stock shape for the selected item
- **THEN** the tracked stock field still remains required
- **AND** the workflow uses the value-sourcing rules defined for stock-writing behavior rather than relaxing the stock schema

#### Scenario: Purchase Inward and Opening Stock have different stock-intake intent
- **WHEN** the user is receiving newly inwarded stock that follows the current item-master and canonical barcode-generation rules
- **THEN** Purchase Inward acts as the normal operational intake screen
- **AND** Purchase Inward is the path that prints new canonical barcode labels
- **AND** Opening Stock remains the compatibility intake path for pre-existing stock whose barcode labels may be historical or less granular than the current canonical method

#### Scenario: Legacy barcode stock does not enter through Purchase Inward
- **WHEN** stock carries a historical or coarse barcode that does not follow the current canonical barcode method
- **THEN** Purchase Inward does not act as the intake path for that stock
- **AND** the stock must be brought through the compatibility-oriented Opening Stock workflow instead

#### Scenario: User opens a hybrid fulfillment screen
- **WHEN** a user opens Sales Delivery, Sales Return, or Point Of Sales
- **THEN** the visible document starts from the source sales-document shape or item-facing selling shape for that workflow
- **AND** the workflow may use stock snapshots or allocation logic underneath to execute fulfillment or reversal

#### Scenario: Hybrid fulfillment uses payment and stock execution underneath visible sales lines
- **WHEN** a user works in Sales Delivery as a hybrid fulfillment screen
- **THEN** the visible delivery lines remain sale-order-shaped
- **AND** the workflow may separately enforce payment-capacity and stock-allocation rules underneath those visible lines

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
