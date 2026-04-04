# stock-entry-granularity-controls Specification

## Purpose
Define stock-entry field visibility and completion rules from stock-maintenance controls rather than barcode-generation mode.

## Requirements
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

### Requirement: Barcode-assisted stock entry SHALL prompt for missing required dimensions
When barcode input resolves fewer dimensions than required by stock-maintenance settings, the system SHALL prompt the user to supply the missing dimensions before saving the stock row.

#### Scenario: Item-only barcode requires size and color completion
- **WHEN** stock-maintenance settings require item, size, and color
- **AND** barcode input resolves only the item
- **THEN** the workflow prompts the user to choose the required size and color before save

#### Scenario: Item-size barcode requires color completion
- **WHEN** stock-maintenance settings require item, size, and color
- **AND** barcode input resolves item and size but not color
- **THEN** the workflow prompts the user to choose the required color before save

#### Scenario: Fully resolved barcode saves without extra prompts
- **WHEN** barcode input resolves all dimensions required by stock-maintenance settings
- **THEN** the workflow pre-fills the stock row and allows save without asking for additional dimensions

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
Stock adjustment SHALL enforce the same stock-dimension rules as opening stock for existing items, but phase 1 SHALL implement missing-dimension completion and validation inline on the adjustment row rather than through the fuller opening-stock hydration workflow.

#### Scenario: Stock adjustment completes missing dimensions inline
- **WHEN** a stock adjustment row for an existing item is missing a size or color required by stock-maintenance settings
- **THEN** the UI prompts the user inline on that adjustment row to complete the missing dimensions before save

#### Scenario: Stock adjustment does not become full item onboarding
- **WHEN** a user is working in stock adjustment in phase 1
- **THEN** the workflow supports only existing-item structural completion needed for the adjustment
- **AND** it does not expose the full opening-stock item-creation and bulk hydration experience
