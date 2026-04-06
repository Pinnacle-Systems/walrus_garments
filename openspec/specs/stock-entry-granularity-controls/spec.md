# stock-entry-granularity-controls Specification

## Purpose
Define stock-entry field visibility and completion rules from stock-maintenance controls rather than barcode-generation mode.
## Requirements
### Requirement: Stock-maintenance settings SHALL control stock-entry dimensions
Stock-entry screens SHALL use stock-maintenance controls as the only source of truth for which stock dimensions and configured stock-defined runtime fields are visible and available during stock capture. Barcode-generation settings SHALL NOT control stock-entry field visibility. For opening stock, stock adjustment, stock transfer, purchase inward, and purchase return, this SHALL extend to configured stock-driven fields sourced from Stock Control across `field1` through `field10`, not only item, size, and color.

#### Scenario: Color visibility follows stock-maintenance controls
- **WHEN** stock-maintenance settings require color-level stock capture
- **THEN** opening stock and stock adjustment show color as a stock-entry dimension
- **AND** they do so regardless of the item barcode-generation mode

#### Scenario: Barcode-generation mode does not hide stock dimensions
- **WHEN** an item uses `STANDARD`, `SIZE`, or `SIZE_COLOR` barcode-generation mode
- **THEN** stock-entry screens still determine visible stock-defined fields from stock-maintenance settings only

#### Scenario: Opening stock includes configured stock-driven fields
- **WHEN** Stock Control defines one or more configured runtime stock fields across `field1` through `field10`
- **THEN** opening stock includes those configured fields in its schema
- **AND** allows the workflow to capture and persist those values when present

#### Scenario: Stock transfer includes configured stock-driven fields
- **WHEN** Stock Control defines one or more configured runtime stock fields across `field1` through `field10`
- **THEN** stock transfer includes those configured fields in transfer-row capture
- **AND** preserves captured values on the resulting transfer stock rows

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

### Requirement: Manual stock entry SHALL allow finer stock capture than barcode specificity
The system SHALL allow users to manually enter or complete stock rows at a finer granularity than the available barcode specificity, as long as the row satisfies stock-maintenance requirements before save.

#### Scenario: Manual color completion for coarse barcode
- **WHEN** stock-maintenance settings require color
- **AND** the user is working from a barcode or item match that does not identify color
- **THEN** the workflow allows the user to manually select or create the needed color and continue saving the row

#### Scenario: Save is blocked until required dimensions are complete
- **WHEN** a stock row is missing one or more dimensions required by stock-maintenance settings
- **THEN** the system blocks save for that row
- **AND** highlights the missing dimensions that must be completed

### Requirement: Stock adjustment SHALL not create negative starting states for new combinations
Stock adjustment SHALL allow a newly tracked size or size-color combination for an existing item to be introduced only through a positive adjustment. A negative adjustment SHALL require the adjusted combination to already exist in stock and SHALL NOT create a brand-new combination.

#### Scenario: Positive adjustment can introduce a new color combination
- **WHEN** a user enters a positive stock adjustment for an existing item with a size or color combination that is not yet present in stock
- **THEN** the workflow may create the needed structural association and save the adjustment

#### Scenario: Negative adjustment is blocked for a new combination
- **WHEN** a user enters a negative stock adjustment for a size or color combination that does not already exist in stock
- **THEN** the system blocks the adjustment
- **AND** informs the user that a new combination must first be introduced through a positive stock entry

### Requirement: Stock adjustment SHALL use lightweight inline completion in phase 1
Stock adjustment SHALL expose the same stock-dimension and stock-defined field schema as other stock-writing screens for existing items, but phase 1 SHALL implement any needed completion inline on the adjustment row rather than through the fuller opening-stock hydration workflow.

#### Scenario: Stock adjustment completes missing dimensions inline
- **WHEN** a stock adjustment row for an existing item is missing a size or color required by stock-maintenance settings
- **THEN** the UI prompts the user inline on that adjustment row to complete the missing dimensions before save

#### Scenario: Stock adjustment captures configured stock-driven fields inline
- **WHEN** a stock adjustment row needs to capture one or more configured stock-defined runtime fields
- **THEN** the UI supports entering those fields inline on the adjustment row
- **AND** the workflow persists the values that are actually captured

#### Scenario: Stock adjustment does not become full item onboarding
- **WHEN** a user is working in stock adjustment in phase 1
- **THEN** the workflow supports only existing-item structural completion needed for the adjustment
- **AND** it does not expose the full opening-stock item-creation and bulk hydration experience

