## ADDED Requirements

### Requirement: Opening stock SHALL derive its schema from active Stock Control
The opening-stock workflow SHALL derive its visible columns, import headers, validation rules, and persistence mapping from the active Stock Control configuration rather than from a fixed hard-coded header list.

#### Scenario: Dynamic opening-stock schema reflects Stock Control
- **WHEN** the opening-stock workflow loads the active Stock Control configuration
- **THEN** it derives the opening-stock field set from that configuration
- **AND** uses that same field set for template generation, import parsing, review-grid rendering, manual row-entry rendering, validation, and save payload mapping

### Requirement: Configured additional stock fields SHALL be rendered and required
When Stock Control configures one or more additional stock-tracking fields through `field6` to `field10`, opening stock SHALL render those fields and require values for them before saving stock rows.

#### Scenario: Configured additional field appears in opening stock
- **WHEN** Stock Control defines a label for an additional stock field such as `field6`
- **THEN** opening stock shows a matching column for that field in the import workflow
- **AND** maps the captured value to the corresponding stock field when saving

#### Scenario: Configured additional field blocks save when blank
- **WHEN** a configured additional stock field is present in the opening-stock schema
- **AND** a user attempts to save a row without that field populated
- **THEN** the workflow blocks the save
- **AND** prompts the user to complete the missing configured field

### Requirement: Opening-stock save SHALL persist all configured stock fields
The opening-stock workflow SHALL write all configured stock-tracking fields captured in the active schema into the corresponding `Stock` row fields.

#### Scenario: Opening-stock save writes configured additional fields
- **WHEN** a user saves opening stock with configured additional stock-field values
- **THEN** the save payload includes those values in the corresponding `field6` to `field10` properties
- **AND** the created `Stock` rows persist those values
