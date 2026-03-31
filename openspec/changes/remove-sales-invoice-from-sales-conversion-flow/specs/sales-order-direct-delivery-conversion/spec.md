## ADDED Requirements

### Requirement: Sale order converts to sales delivery without invoice mediation
The system SHALL allow users to open Sales Delivery directly from a Sale Order without creating or selecting a Sales Invoice as an intermediate document.

#### Scenario: Direct delivery conversion launch
- **WHEN** a user chooses the delivery conversion action from a sale order
- **THEN** the system MUST open the sales delivery conversion flow using that sale order as the source document

### Requirement: Initial delivery conversion copies sale order lines as editable delivery lines
The system SHALL prefill a newly converted sales delivery from the source sale order's header values and line items, while allowing the user to edit copied quantities or remove copied lines before save.

#### Scenario: First conversion copies sale order items
- **WHEN** a user opens the first sales delivery conversion from a sale order that has not yet been delivered
- **THEN** the system MUST prefill the delivery with the sale order's deliverable line items and quantities
- **THEN** the user MUST be able to reduce quantities or remove copied lines before saving

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
The system SHALL block save of a converted sales delivery unless the total received payment for the source sale-order flow is greater than or equal to the net amount of the delivery being saved.

#### Scenario: Save blocked when payment is insufficient
- **WHEN** a user attempts to save a converted sales delivery whose net amount exceeds the total received payment available for the source sale-order flow
- **THEN** the system MUST reject the save
- **THEN** the system MUST show that payment coverage is insufficient for the delivery

#### Scenario: Save allowed when payment covers delivery
- **WHEN** a user attempts to save a converted sales delivery whose net amount is less than or equal to the total received payment available for the source sale-order flow
- **THEN** the system MUST allow the delivery to be saved
