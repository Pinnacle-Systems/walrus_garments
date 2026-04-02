## MODIFIED Requirements

### Requirement: Standardization preserves transaction-specific behavior
The system SHALL preserve each transaction screen's existing business fields, validations, row-level modals, summary semantics, and special calculations while adopting the common transaction-entry shell and line-item table behavior. The system MUST NOT remove or alter required transaction-specific capabilities solely to achieve UI consistency. For Quotation and Sale Order, this preserved behavior includes deriving selectable sellable combinations from Item Master and Item Price List rather than from stock presence.

#### Scenario: A transaction row opens a specialized modal or editor
- **WHEN** a user interacts with a row action such as lot details, barcode handling, linked-document selection, or stock selection on a supported transaction screen
- **THEN** the screen continues to open and use its specialized editor
- **AND** the surrounding transaction shell and line-item surface still follow the shared standard

#### Scenario: A transaction has specialized header or computed fields
- **WHEN** a supported transaction screen includes domain-specific values such as supplier, party, dispatch details, allowed quantity, gross amount, or stock quantity
- **THEN** those values remain present and functional
- **AND** they are presented within the standardized transaction-entry shell rather than a one-off layout

#### Scenario: Quotation and Sale Order preserve item-master catalog behavior
- **WHEN** Quotation or Sale Order are rendered through the standardized transaction-entry surface
- **THEN** the shared shell does not change their sellable-option source of truth from Item Master and Item Price List to stock presence
- **AND** UI standardization does not hide otherwise valid sellable combinations just because no stock row exists
