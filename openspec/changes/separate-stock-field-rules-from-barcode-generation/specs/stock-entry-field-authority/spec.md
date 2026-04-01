## ADDED Requirements

### Requirement: Stock Control Panel SHALL be the only authority for stock-entry field schema
Runtime stock-entry and transaction-entry screens SHALL derive field presence and requiredness for stock dimensions from Stock Control Panel configuration. Item-level or centralized barcode-generation settings SHALL NOT determine whether `size` or `color` fields exist or are mandatory on those screens.

#### Scenario: Stock Control enables size-only capture
- **WHEN** Stock Control Panel is configured for size-based stock capture without color-based capture
- **THEN** the relevant runtime entry screens show `Size`
- **AND** do not require `Color`
- **AND** do not use barcode-generation mode to change that field schema

#### Scenario: Stock Control enables size-and-color capture
- **WHEN** Stock Control Panel is configured for size-and-color stock capture
- **THEN** the relevant runtime entry screens show both `Size` and `Color`
- **AND** require those fields according to the stock-maintenance rule
- **AND** do not hide or relax them because an item uses a different barcode-generation mode

### Requirement: Barcode-generation mode SHALL be limited to variant and barcode behavior
Runtime screens MAY use item-level or centralized barcode-generation mode to resolve price, barcode, or valid variant combinations, but SHALL NOT use that mode as the source of truth for field presence or requiredness.

#### Scenario: Barcode mode drives price lookup without changing field schema
- **WHEN** a runtime entry screen resolves item price from item variant data
- **THEN** it may use barcode-generation semantics to select the correct price row
- **AND** it does not use those semantics to decide whether `Size` or `Color` fields exist

#### Scenario: Barcode mode filters valid combinations after field schema is established
- **WHEN** a runtime entry screen already shows `Size` or `Color` because Stock Control Panel requires those fields
- **THEN** the screen may narrow the available options to valid combinations for the selected item
- **AND** treats that filtering as item-variant validity rather than as field-schema authority

### Requirement: Quick-add item flows SHALL not redefine parent transaction field rules
Quick-add item flows launched from runtime stock or transaction screens MAY use barcode-generation mode to construct item variant data, but SHALL NOT redefine the field presence or requiredness of the parent screen.

#### Scenario: Quick add creates a standard item while parent screen still tracks size and color
- **WHEN** a user launches a quick-add item flow from a parent screen whose Stock Control settings require dimension capture
- **THEN** the quick-add flow may create item structure according to barcode-generation settings
- **AND** the parent screen still determines its visible and required fields from Stock Control Panel
