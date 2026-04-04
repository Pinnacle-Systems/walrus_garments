## MODIFIED Requirements

### Requirement: Stock-writing surfaces SHALL persist complete stock keys
Any runtime surface that writes rows to `Stock` SHALL require every stock-tracking dimension and stock-defined runtime field enabled by Stock Control Panel to be populated before save. These workflows MAY begin with partial data from barcode lookup, import, or other prefills, but they SHALL collect the missing tracked fields before persisting the stock row.

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

#### Scenario: Stock adjustment requires configured stock-defined fields before save
- **WHEN** Stock Control Panel configures one or more stock-defined runtime fields such as `field1` through `field10`
- **AND** a user enters a stock adjustment row without a configured required field
- **THEN** stock adjustment blocks save for that row
- **AND** it does not write an incomplete `Stock` row

#### Scenario: Stock transfer requires configured stock-defined fields before save
- **WHEN** Stock Control Panel configures one or more stock-defined runtime fields such as `field1` through `field10`
- **AND** a user enters a stock transfer row without a configured required field
- **THEN** stock transfer blocks save for that row
- **AND** it does not write either transfer leg to `Stock` until the configured field set is complete

### Requirement: Stock-writing value sourcing SHALL distinguish shared dimensions from stock-defined attributes
When a stock-writing screen captures tracked fields, it SHALL distinguish between shared master-backed dimensions such as `Size` and `Color` and stock-defined business attributes configured through Stock Control Panel. Shared master-backed dimensions MAY use item-scoped option lists when available, but SHALL fall back to normalized master selection or controlled master creation when Item Master is less granular. Stock-defined attributes such as configured `field1` through `field10` SHALL be treated as runtime stock-entry fields when they are active in Stock Control, and the stock-writing workflow MAY capture their values through direct operational entry according to Stock Control configuration.

#### Scenario: Shared master-backed dimension falls back to normalized master selection
- **WHEN** a stock-writing screen requires `Size` or `Color`
- **AND** Item Master does not provide item-scoped options at the needed stock granularity
- **THEN** the workflow may fall back to normalized master-backed selection or controlled master creation
- **AND** it does not persist the tracked field as unresolved free text

#### Scenario: Stock-defined attribute accepts direct operational entry
- **WHEN** Stock Control Panel configures a stock-defined business attribute such as `field1` through `field10`
- **THEN** the stock-writing screen shows that tracked attribute according to Stock Control
- **AND** the workflow may capture its value through direct operational entry rather than through Item Master option lists

#### Scenario: Opening stock uses the same stock-defined attribute contract as purchase inward
- **WHEN** Stock Control Panel configures runtime stock-defined fields that are active on Purchase Inward / Direct Inward
- **THEN** Opening Stock follows the same stock-defined field contract for field presence and persistence mapping
- **AND** it does not narrow the runtime stock-defined field set to only a subset unless Stock Control itself excludes the other fields
