# sales-order-direct-delivery-conversion Specification

## Purpose
TBD - created by archiving change remove-sales-invoice-from-sales-conversion-flow. Update Purpose after archive.
## Requirements
### Requirement: Sale order converts to sales delivery without invoice mediation
The system SHALL allow users to open Sales Delivery directly from a Sale Order without creating or selecting a Sales Invoice as an intermediate document.

#### Scenario: Direct delivery conversion launch
- **WHEN** a user chooses the delivery conversion action from a sale order
- **THEN** the system MUST open the sales delivery conversion flow using that sale order as the source document

### Requirement: Initial delivery conversion copies sale order lines as editable delivery lines
The system SHALL prefill a newly converted sales delivery from the source sale order's header values and line items, while allowing the user to edit copied quantities or remove copied lines before save. The visible delivery line shape SHALL preserve the source sale-order business shape even when fulfillment later requires stock-side allocation at a more granular level.

#### Scenario: First conversion copies sale order items
- **WHEN** a user opens the first sales delivery conversion from a sale order that has not yet been delivered
- **THEN** the system MUST prefill the delivery with the sale order's deliverable line items and quantities
- **THEN** the user MUST be able to reduce quantities or remove copied lines before saving

#### Scenario: Delivery conversion preserves sale-order line shape
- **WHEN** the source sale order uses an item-defined sales shape that is less granular than the underlying stock rows
- **THEN** the converted sales delivery still shows the source sale-order line shape on the visible document
- **THEN** any required stock allocation may occur underneath that document shape rather than by forcing extra stock-only visible dimensions into the converted line

### Requirement: Subsequent conversions prefill only remaining undelivered quantities
The system SHALL support repeated sale-order-to-delivery conversions by tracking delivered quantity per originating sale-order line and prefilling only lines with undelivered quantity remaining.

#### Scenario: Remaining quantities appear on a later conversion
- **WHEN** a sale order has prior saved sales deliveries that consumed part of one or more source line quantities
- **THEN** the next conversion MUST include only source lines whose remaining undelivered quantity is greater than zero
- **THEN** each copied line's prefilled quantity MUST equal the current remaining undelivered quantity for that source line

#### Scenario: Fully delivered lines are omitted from later conversions
- **WHEN** a sale-order line has already been fully delivered across prior sales deliveries
- **THEN** that line MUST NOT appear in a subsequent conversion from the same sale order

### Requirement: Delivery lines retain source sale-order-line identity
The system SHALL persist each converted sales delivery line with a reference to the originating sale-order line so remaining quantities can be recomputed from saved delivery history.

#### Scenario: Saved delivery line keeps source identity
- **WHEN** a converted sales delivery is saved
- **THEN** each saved delivery line that originated from a sale-order line MUST retain the originating sale-order-line reference

### Requirement: Delivery conversion SHALL use remaining payment capacity as a document-level gate
The system SHALL allow phased Sale Order to Sales Delivery conversion only up to the payment capacity still available for that sale-order flow. This payment gate SHALL apply to the total delivery net amount rather than allocating received payment to individual converted lines.

#### Scenario: User chooses any subset of remaining lines within remaining payment capacity
- **WHEN** a converted sale order still has undelivered lines and remaining payment capacity
- **THEN** the user MAY choose any subset of those remaining lines for the current delivery
- **AND** the total net amount of the selected delivery MUST remain within the remaining payment capacity for the sale-order flow

#### Scenario: Remaining payment capacity excludes prior saved deliveries
- **WHEN** prior saved sales deliveries have already consumed part of the paid delivery value for the same sale-order flow
- **THEN** the next conversion MUST calculate available payment capacity as total received payment minus the net amount already consumed by those prior saved deliveries
- **AND** it MUST NOT treat the full received payment amount as newly available on every conversion

### Requirement: Delivery fulfillment allocation SHALL remain secondary to the visible document shape
The system MAY let the user allocate a converted delivery line against one or more stock identities underneath the visible delivery document, but that allocation detail SHALL NOT force the visible delivery grid to become stock-shaped.

#### Scenario: Converted delivery line resolves ambiguous stock through candidate allocation
- **WHEN** a converted delivery line is less granular than the compatible stock buckets available for fulfillment
- **THEN** the workflow returns the candidate stock buckets for that delivery line
- **AND** the user must select one or more buckets before inventory reduction
- **AND** the visible delivery line still remains in the source sale-order shape

### Requirement: Delivery save SHALL revalidate stock allocation before inventory recording
Any fulfillment allocation selected during converted Sales Delivery SHALL remain provisional until save. The server MUST revalidate allocation against current stock availability before committing the delivery, and the system SHALL persist the delivery, its fulfillment mappings, and the resulting stock-out movements together.

#### Scenario: Save rejects stale allocation after stock changes
- **WHEN** a user selected a fulfillment allocation earlier in the session
- **AND** current stock availability no longer covers that allocation at save time
- **THEN** the system MUST reject the save
- **AND** it MUST require the user to reallocate the affected delivery quantities before inventory is recorded

