## ADDED Requirements

### Requirement: Stock Control Panel SHALL be the only authority for stock-entry field schema
Runtime stock-writing and stock-assisted operational screens SHALL derive field presence and requiredness for stock dimensions from Stock Control Panel configuration. Item-level or centralized barcode-generation settings SHALL NOT determine whether `size` or `color` fields exist or are mandatory on those screens.

#### Scenario: Stock Control enables size-only capture
- **WHEN** Stock Control Panel is configured for size-based stock capture without color-based capture
- **THEN** the relevant stock-writing or stock-assisted operational screens show `Size`
- **AND** do not require `Color`
- **AND** do not use barcode-generation mode to change that field schema

#### Scenario: Stock Control enables size-and-color capture
- **WHEN** Stock Control Panel is configured for size-and-color stock capture
- **THEN** the relevant stock-writing or stock-assisted operational screens show both `Size` and `Color`
- **AND** require those fields according to the stock-maintenance rule
- **AND** do not hide or relax them because an item uses a different barcode-generation mode

#### Scenario: Pre-fulfillment sales documents do not inherit stock-only dimensions
- **WHEN** a user opens a catalog-driven screen such as Estimate / Quotation or Sale Order
- **THEN** this Stock Control field-schema rule does not by itself force the screen to show stock-only visible dimensions
- **AND** the sales document instead follows the authority defined for catalog-driven sales workflows

### Requirement: Stock-writing surfaces SHALL persist complete stock keys
Any runtime surface that writes rows to `Stock` SHALL require every stock-tracking dimension enabled by Stock Control Panel to be populated before save. These workflows MAY begin with partial data from barcode lookup, import, or other prefills, but they SHALL collect the missing tracked fields before persisting the stock row.

#### Scenario: Missing tracked field blocks stock save
- **WHEN** Stock Control Panel enables a stock-tracking field for runtime stock capture
- **AND** a user attempts to save a stock row without that field populated
- **THEN** the workflow blocks the save
- **AND** prompts the user to complete the missing tracked field before writing the row to `Stock`

#### Scenario: Partial barcode resolution completes before stock save
- **WHEN** barcode lookup or imported row data provides fewer dimensions than Stock Control Panel requires
- **THEN** the workflow may begin with the partially resolved row
- **BUT** it must collect the missing tracked fields before persisting the row to `Stock`

#### Scenario: Lower item granularity does not make tracked stock fields optional
- **WHEN** Stock Control Panel requires a tracked stock field on a stock-writing screen
- **AND** the selected item does not define item-scoped options for that field at the same granularity
- **THEN** the workflow still requires the tracked stock field before save
- **AND** it does not relax requiredness merely because Item Master is coarser

### Requirement: Stock-writing value sourcing SHALL distinguish shared dimensions from stock-defined attributes
When a stock-writing screen captures tracked fields, it SHALL distinguish between shared master-backed dimensions such as `Size` and `Color` and stock-defined business attributes configured through Stock Control Panel. Shared master-backed dimensions MAY use item-scoped option lists when available, but SHALL fall back to normalized master selection or controlled master creation when Item Master is less granular. Stock-defined attributes such as configured `field1` through `field10` MAY use direct operational entry according to Stock Control configuration.

#### Scenario: Shared master-backed dimension falls back to normalized master selection
- **WHEN** a stock-writing screen requires `Size` or `Color`
- **AND** Item Master does not provide item-scoped options at the needed stock granularity
- **THEN** the workflow may fall back to normalized master-backed selection or controlled master creation
- **AND** it does not persist the tracked field as unresolved free text

#### Scenario: Stock-defined attribute accepts direct operational entry
- **WHEN** Stock Control Panel configures a stock-defined business attribute such as `field1` through `field10`
- **THEN** the stock-writing screen shows that tracked attribute according to Stock Control
- **AND** the workflow may capture its value through direct operational entry rather than through Item Master option lists

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

#### Scenario: Matching field numbers do not cross item and stock authority layers
- **WHEN** Item Control Panel and Stock Control Panel both define configurable fields with similar names such as `field1`
- **THEN** runtime stock-writing screens do not assume those fields are the same attribute by default
- **AND** the stock-writing workflow continues to follow Stock Control Panel for stock-defined field schema

### Requirement: Stock-writing surfaces SHALL not enforce canonical barcode uniqueness
Runtime surfaces that write rows to `Stock` MAY use barcode values for lookup, prefill, or display, but SHALL NOT reject a stock row solely because another stock row uses the same barcode. Shared barcode values are allowed when the row otherwise satisfies the tracked stock dimensions required by Stock Control Panel.

#### Scenario: Shared barcode across multiple tracked stock combinations
- **WHEN** a stock-writing surface captures two or more rows with the same barcode
- **AND** those rows differ by stock dimensions required by Stock Control Panel
- **THEN** the workflow allows those rows to be saved
- **AND** does not treat the shared barcode as a stock-validation conflict by itself

#### Scenario: Barcode does not replace required tracked fields
- **WHEN** a barcode identifies an item or partially resolves stock dimensions
- **THEN** the workflow may prefill the row from that barcode
- **AND** it still requires any remaining tracked stock fields before saving the row to `Stock`

### Requirement: Quick-add item flows SHALL not redefine parent transaction field rules
Quick-add item flows launched from runtime stock or transaction screens MAY use barcode-generation mode to construct item variant data, but SHALL NOT redefine the field presence or requiredness of the parent screen.

#### Scenario: Quick add creates a standard item while parent screen still tracks size and color
- **WHEN** a user launches a quick-add item flow from a parent screen whose Stock Control settings require dimension capture
- **THEN** the quick-add flow may create item structure according to barcode-generation settings
- **AND** the parent screen still determines its visible and required fields from Stock Control Panel
