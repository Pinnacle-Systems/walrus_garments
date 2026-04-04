## MODIFIED Requirements

### Requirement: Initial delivery conversion copies sale order lines as editable delivery lines
The system SHALL prefill a newly converted sales delivery from the source sale order’s header values and line items, while allowing the user to edit copied quantities or remove copied lines before save. The visible delivery line shape SHALL preserve the source sale-order business shape even when fulfillment later requires stock-side allocation at a more granular level.

#### Scenario: First conversion copies sale order items
- **WHEN** a user opens the first sales delivery conversion from a sale order that has not yet been delivered
- **THEN** the system MUST prefill the delivery with the sale order’s deliverable line items and quantities
- **THEN** the user MUST be able to reduce quantities or remove copied lines before saving

#### Scenario: Delivery conversion preserves sale-order line shape
- **WHEN** the source sale order uses an item-defined sales shape that is less granular than the underlying stock rows
- **THEN** the converted sales delivery still shows the source sale-order line shape on the visible document
- **THEN** any required stock allocation may occur underneath that document shape rather than by forcing extra stock-only visible dimensions into the converted line

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

#### Scenario: Delivery line allocation happens under the sale-order-shaped line
- **WHEN** a converted delivery line needs stock-aware execution
- **THEN** the workflow MAY capture fulfillment allocation against one or more stock identities for that line
- **AND** the visible delivery line still remains in the source sale-order shape

### Requirement: Delivery save SHALL revalidate stock allocation before inventory recording
Any fulfillment allocation selected during converted Sales Delivery SHALL remain provisional until save. The server MUST revalidate allocation against current stock availability before committing the delivery, and the system SHALL persist the delivery, its fulfillment mappings, and the resulting stock-out movements together.

#### Scenario: Save rejects stale allocation after stock changes
- **WHEN** a user selected a fulfillment allocation earlier in the session
- **AND** current stock availability no longer covers that allocation at save time
- **THEN** the system MUST reject the save
- **AND** it MUST require the user to reallocate the affected delivery quantities before inventory is recorded
