## ADDED Requirements

### Requirement: Sales transaction footers expose optional packing and shipping charge toggles
The system SHALL let in-scope sales transaction screens opt packing and shipping charges into a transaction through the shared footer. In editable mode, the footer MUST show separate packing and shipping checkboxes in the total-quantity summary area so users can enable either charge independently.

#### Scenario: User opens an editable in-scope sales transaction screen
- **WHEN** a user opens Quotation, Sale Order, Sales Delivery, Sales Invoice, or Sales Return in editable mode
- **THEN** the shared footer shows separate packing and shipping checkboxes in the same footer summary area as Total Qty
- **AND** each checkbox can be selected or cleared independently of the other

#### Scenario: No charge is selected
- **WHEN** neither the packing checkbox nor the shipping checkbox is selected
- **THEN** the transaction behaves as if no footer charge is applied
- **AND** the net amount remains based on the screen's existing gross-plus-tax calculation only

### Requirement: Selected charges render separate amount entry in the right-hand totals summary
The system SHALL render separate monetary entry for packing and shipping in the right-hand totals summary whenever those charges are enabled. The footer MUST keep the two charge types visually distinct and MUST not collapse them into one combined charge input.

#### Scenario: User enables only packing
- **WHEN** the user selects the packing checkbox and leaves shipping unselected
- **THEN** the right-hand totals summary shows an input row for Packing Charge
- **AND** the right-hand totals summary does not show a Shipping Charge input row

#### Scenario: User enables only shipping
- **WHEN** the user selects the shipping checkbox and leaves packing unselected
- **THEN** the right-hand totals summary shows an input row for Shipping Charge
- **AND** the right-hand totals summary does not show a Packing Charge input row

#### Scenario: User enables both charges
- **WHEN** the user selects both the packing checkbox and the shipping checkbox
- **THEN** the right-hand totals summary shows separate input rows for Packing Charge and Shipping Charge
- **AND** each row accepts its own amount without changing the other row's value

### Requirement: Net amount includes the selected packing and shipping charges
The system SHALL include enabled packing and shipping charges in the transaction net amount while leaving the existing gross amount and tax amount semantics unchanged. Unselected charges MUST contribute zero to the net amount even if the user previously entered a value before clearing the checkbox.

#### Scenario: User enters one selected charge
- **WHEN** the user enables either packing or shipping and enters an amount for the selected charge
- **THEN** the footer net amount updates to the screen's existing net amount plus that selected charge amount
- **AND** the gross amount and tax amount continue to display the pre-existing item-based totals

#### Scenario: User enters both selected charges
- **WHEN** the user enables both packing and shipping and enters values for each
- **THEN** the footer net amount updates to the screen's existing net amount plus the packing charge plus the shipping charge
- **AND** the packing and shipping amounts remain separately visible in the right-hand totals summary

#### Scenario: User clears a previously selected charge
- **WHEN** the user clears the packing checkbox or the shipping checkbox after entering a value
- **THEN** the cleared charge no longer contributes to the net amount
- **AND** the corresponding amount row is hidden from the right-hand totals summary

### Requirement: Saved sales transactions preserve packing and shipping separately
The system SHALL preserve packing and shipping charge state as separate transaction values on supported sales screens so edited or read-only records reopen with the same applied charges and resulting net amount.

#### Scenario: User reopens a transaction with saved charges
- **WHEN** a user saves a supported sales transaction with packing and or shipping enabled and later reopens that record
- **THEN** the footer restores each saved charge independently
- **AND** any enabled charge appears with its saved amount in the right-hand totals summary
- **AND** the restored net amount still includes the saved packing and shipping values

#### Scenario: User views a saved transaction in read-only mode
- **WHEN** a supported sales transaction is opened in read-only mode after one or both charges were saved
- **THEN** the footer shows the applied charge rows and their amounts as read-only values
- **AND** the footer continues to show the net amount that includes those saved charges
