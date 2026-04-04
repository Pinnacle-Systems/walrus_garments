## MODIFIED Requirements

### Requirement: Stock-maintenance settings SHALL control stock-entry dimensions
Stock-entry screens SHALL use stock-maintenance controls as the only source of truth for which stock dimensions are visible and required during stock capture. Barcode-generation settings SHALL NOT control stock-entry field visibility. For opening stock, this SHALL extend to configured additional stock-tracking fields sourced from Stock Control, not only item, size, and color.

#### Scenario: Color visibility follows stock-maintenance controls
- **WHEN** stock-maintenance settings require color-level stock capture
- **THEN** opening stock and stock adjustment show color as a stock-entry dimension
- **AND** they do so regardless of the item barcode-generation mode

#### Scenario: Barcode-generation mode does not hide stock dimensions
- **WHEN** an item uses `STANDARD`, `SIZE`, or `SIZE_COLOR` barcode-generation mode
- **THEN** stock-entry screens still determine visible and required dimensions from stock-maintenance settings only

#### Scenario: Opening stock includes configured additional stock fields
- **WHEN** Stock Control defines one or more additional stock-tracking fields for opening stock
- **THEN** opening stock includes those configured fields in its schema
- **AND** treats them as required stock-entry fields before save
