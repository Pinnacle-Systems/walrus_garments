## ADDED Requirements

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
- **WHEN** the source sale order uses a sales shape that is less granular than the underlying stock rows
- **THEN** the converted sales delivery still shows the source sale-order line shape on the visible document
- **AND** any required stock allocation occurs underneath that document shape

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

### Requirement: Delivery save requires sufficient received payment coverage
The system SHALL block save of a converted sales delivery unless the remaining payment capacity for the source sale-order flow is greater than or equal to the net amount of the delivery being saved. This payment gate SHALL apply to the delivery document as a whole rather than to individual converted lines.

#### Scenario: Save blocked when payment is insufficient
- **WHEN** a user attempts to save a converted sales delivery whose net amount exceeds the remaining payment capacity available for the source sale-order flow
- **THEN** the system MUST reject the save
- **THEN** the system MUST show that payment coverage is insufficient for the delivery

#### Scenario: Save allowed when payment covers delivery
- **WHEN** a user attempts to save a converted sales delivery whose net amount is less than or equal to the remaining payment capacity available for the source sale-order flow
- **THEN** the system MUST allow the delivery to be saved

#### Scenario: Remaining payment capacity subtracts prior saved deliveries
- **WHEN** the source sale-order flow has prior saved deliveries
- **THEN** the available payment coverage for a new conversion MUST be calculated as total received payment minus the net amount already consumed by those prior saved deliveries
- **AND** the system MUST NOT allow every new conversion to reuse the full received payment total

#### Scenario: Payment coverage applies to the whole selected delivery mix
- **WHEN** a user chooses a subset of remaining sale-order lines for the current delivery
- **THEN** the system MAY allow any mix of those lines
- **AND** it MUST enforce payment coverage against the total net amount of the selected delivery rather than by allocating received payment to individual lines

### Requirement: Delivery save SHALL revalidate stock allocation before inventory recording
Any fulfillment allocation selected during converted Sales Delivery SHALL remain provisional until save. Before recording inventory, the system MUST revalidate the chosen allocation against current stock availability and persist the delivery, the saved fulfillment mapping, and the resulting stock movement together.

#### Scenario: Save rejects stale fulfillment allocation
- **WHEN** a user selected a stock allocation during conversion
- **AND** current stock no longer supports that allocation at save time
- **THEN** the system MUST reject the delivery save
- **AND** it MUST require the affected quantities to be reallocated before inventory is recorded
