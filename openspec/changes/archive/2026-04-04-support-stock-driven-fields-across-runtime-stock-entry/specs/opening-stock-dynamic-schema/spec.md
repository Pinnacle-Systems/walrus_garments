## MODIFIED Requirements

### Requirement: Configured additional stock fields SHALL be rendered and required
When Stock Control configures one or more stock-driven runtime fields across `field1` to `field10`, opening stock SHALL render those fields in the dynamic schema and persist their values when the row captures them.

#### Scenario: Configured stock-driven field appears in opening stock
- **WHEN** Stock Control defines a label for a stock-driven runtime field such as `field1` or `field6`
- **THEN** opening stock shows a matching column for that field in the import workflow
- **AND** maps the captured value to the corresponding stock field when saving

#### Scenario: Configured stock-driven field may remain blank in a coarse row
- **WHEN** a configured stock-driven runtime field is present in the opening-stock schema
- **AND** a user attempts to save a row without that field populated
- **THEN** the workflow may still preserve the row as a coarse opening-stock row
- **AND** it does not treat the configured stock-driven field as an unconditional save blocker solely because the field exists in Stock Control

### Requirement: Opening-stock save SHALL persist all configured stock fields
The opening-stock workflow SHALL write all configured stock-tracking fields captured in the active schema into the corresponding `Stock` row fields.

#### Scenario: Opening-stock save writes configured stock-driven fields
- **WHEN** a user saves opening stock with configured stock-driven field values
- **THEN** the save payload includes those values in the corresponding `field1` to `field10` properties
- **AND** the created `Stock` rows persist those values
