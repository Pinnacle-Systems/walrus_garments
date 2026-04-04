## MODIFIED Requirements

### Requirement: Stock-maintenance settings SHALL control stock-entry dimensions
Stock-entry screens SHALL use stock-maintenance controls as the source of truth for which stock-defined runtime attributes are available for capture and which stock axes are tracked for matching and persistence. Barcode-generation settings SHALL NOT control stock-defined field visibility. Opening Stock SHALL remain a legacy compatibility flow and SHALL NOT treat configured additional stock fields as universally required entry fields.

#### Scenario: Stock-defined field visibility follows stock-maintenance controls
- **WHEN** stock-maintenance settings configure one or more additional stock-tracking fields
- **THEN** stock-entry screens expose those configured fields as supported stock attributes
- **AND** they do so regardless of the item barcode-generation mode.

#### Scenario: Barcode-generation mode does not hide stock-defined attributes
- **WHEN** an item uses `STANDARD`, `SIZE`, or `SIZE_COLOR` barcode-generation mode
- **THEN** stock-entry screens still determine stock-defined field visibility from stock-maintenance settings only.

#### Scenario: Opening stock does not require every configured additional stock field
- **WHEN** Stock Control defines one or more additional stock-tracking fields for Opening Stock
- **THEN** Opening Stock includes those configured fields in its compatibility schema
- **AND** it MAY persist a row without every configured field populated
- **AND** it does not treat those configured fields as unconditional save blockers.

### Requirement: Barcode-assisted stock entry SHALL prompt for missing required dimensions
When barcode input resolves fewer canonical dimensions than required by centralized barcode-generation mode for a canonical inventory flow, the system SHALL prompt the user to supply the missing canonical dimensions before saving the row. Stock-defined runtime fields SHALL not become missing-dimension prompts solely because they are configured in stock-maintenance settings.

#### Scenario: Item-only barcode requires canonical size and color completion
- **WHEN** a canonical inventory flow uses a barcode or prefill that resolves only the item
- **AND** centralized barcode-generation mode requires size and color
- **THEN** the workflow prompts the user to choose the required size and color before save.

#### Scenario: Item-size barcode requires canonical color completion
- **WHEN** a canonical inventory flow uses a barcode or prefill that resolves item and size but not color
- **AND** centralized barcode-generation mode requires both size and color
- **THEN** the workflow prompts the user to choose the required color before save.

#### Scenario: Configured stock field does not by itself trigger completion prompt
- **WHEN** a stock-maintenance setting configures a stock-defined runtime field such as `field1`
- **AND** a row omits that field
- **THEN** the workflow does not treat that omission as an automatic canonical completeness failure unless a higher-level flow-specific rule explicitly requires it.
