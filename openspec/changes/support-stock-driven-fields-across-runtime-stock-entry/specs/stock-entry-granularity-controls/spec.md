## MODIFIED Requirements

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
