# centralized-barcode-generation Specification

## Purpose
TBD - created by archiving change centralize-barcode-generation. Update Purpose after archive.
## Requirements
### Requirement: Barcode generation mode is configured centrally
The system SHALL provide a single item control-panel setting named `barcodeGenerationMethod` with the supported values `STANDARD`, `SIZE`, and `SIZE_COLOR`. The system MUST use this centralized setting as the only configuration source for item barcode-generation mode.

#### Scenario: Save centralized barcode generation mode
- **WHEN** an authorized user selects a barcode generation mode in Item Settings and saves the control-panel record
- **THEN** the system stores the selected `barcodeGenerationMethod` on the item control-panel configuration

#### Scenario: Item Settings preserves existing visual style
- **WHEN** the centralized barcode generation control is shown in Item Settings
- **THEN** it uses the existing Item Settings page visual style for labels, spacing, and form controls
- **AND** it does not introduce a distinct or inconsistent visual treatment compared with the surrounding settings fields

#### Scenario: Load centralized barcode generation mode
- **WHEN** a screen requests item control-panel settings
- **THEN** the system returns the saved `barcodeGenerationMethod` value with the control-panel data

#### Scenario: Missing control-panel mode resolves safely
- **WHEN** a screen requests item control-panel settings before a mode has been saved
- **THEN** the system resolves the effective barcode generation mode as `STANDARD`

#### Scenario: Effective mode is derived rather than item-owned
- **WHEN** a downstream workflow needs item data and barcode-generation mode together
- **THEN** the effective mode is derived from `ItemControlPanel`
- **AND** the system does not model that mode as item-owned state
- **AND** the system does not expose that derived mode in the item API payload

### Requirement: Barcode generation mode is surfaced only in Item Settings
The system SHALL surface barcode generation mode in the UI only within Control Panel Item Settings. Outside Item Settings, screens MUST derive behavior from the centralized mode without showing it as a selector, field, label, or read-only value.

#### Scenario: Item Settings shows centralized mode control
- **WHEN** an authorized user opens Control Panel Item Settings
- **THEN** the UI shows the centralized barcode generation mode control there

#### Scenario: Item Master adapts implicitly
- **WHEN** a user opens Item Master
- **THEN** the UI adapts to the centralized barcode generation mode
- **AND** the UI does not show the mode as a selector, field, label, or read-only value

#### Scenario: Quick-add flows adapt implicitly
- **WHEN** a user opens a quick-add item workflow from another screen
- **THEN** the UI adapts to the centralized barcode generation mode
- **AND** the UI does not show the mode as a selector, field, label, or read-only value

### Requirement: Legacy barcode mode flags are removed from item control panel
The system SHALL NOT keep `sizeWise` and `size_color_wise` as parallel representations of barcode-generation mode after this change is complete.

#### Scenario: Item Settings saves one mode field
- **WHEN** an authorized user updates barcode-generation behavior in Item Settings
- **THEN** the saved control-panel configuration uses `barcodeGenerationMethod` as the only barcode-mode field

### Requirement: Item Master behavior follows centralized barcode generation mode
The system SHALL centralize item barcode-definition behavior under the shared `barcodeGenerationMethod` settings so that Item Master and related flows collect and persist a consistent canonical item shape for new item variants. The centralized mode SHALL define canonical barcode-definition structure for new item variants and SHALL NOT determine stock-entry field visibility or required stock dimensions.

#### Scenario: Standard mode uses the item-only definition
- **GIVEN** `barcodeGenerationMethod` is `STANDARD`
- **WHEN** Item Master renders or validates item pricing rows
- **THEN** the canonical item definition SHALL allow only the item-level row
- **AND** Item Master SHALL not require size or color assignments for the canonical row
- **AND** downstream canonical item flows SHALL persist barcode rows without size or color dimensions.

#### Scenario: Size mode uses item plus size definitions
- **GIVEN** `barcodeGenerationMethod` is `SIZE`
- **WHEN** Item Master renders or validates item pricing rows
- **THEN** the canonical item definition SHALL require rows keyed by item and size
- **AND** Item Master SHALL require a size assignment before persisting a canonical row.

#### Scenario: Size and color mode uses item plus size plus color definitions
- **GIVEN** `barcodeGenerationMethod` is `SIZE_COLOR`
- **WHEN** Item Master renders or validates item pricing rows
- **THEN** the canonical item definition SHALL require rows keyed by item, size, and color
- **AND** Item Master SHALL require both size and color assignments before persisting the canonical row.

#### Scenario: Stock-entry screens do not use barcode mode for column visibility
- **GIVEN** `barcodeGenerationMethod` is configured centrally
- **WHEN** a stock-entry screen renders required dimensions
- **THEN** the screen SHALL derive visible and required columns from stock-maintenance controls instead of the barcode mode
- **AND** the centralized barcode mode SHALL remain limited to canonical item-definition behavior.

### Requirement: Inventory workflows use centralized barcode generation mode
Inventory workflows that depend on canonical item barcode definitions or barcode row shape SHALL use the centralized `barcodeGenerationMethod` so that quick-add item flows and other canonical item-definition screens stay aligned with Item Master. Stock-entry visibility and required stock dimensions SHALL remain governed by stock-maintenance controls even when those workflows hydrate item data from the centralized mode.

#### Scenario: Opening stock uses centralized mode for core-field hydration only
- **GIVEN** a user adds an item through Opening Stock
- **WHEN** the current `barcodeGenerationMethod` requires size or color dimensions
- **THEN** Opening Stock SHALL use that mode only to determine which core item variant fields may need hydration
- **AND** Opening Stock SHALL NOT infer stock-entry field visibility or required stock dimensions from the centralized barcode mode
- **AND** Opening Stock SHALL NOT create sellable variant associations or other downstream canonical sales data from that compatibility hydration.

#### Scenario: Stock adjustment uses stock-maintenance controls for dimensions
- **GIVEN** stock maintenance settings require `size` and `color`
- **AND** `barcodeGenerationMethod` is `STANDARD`
- **WHEN** Stock Adjustment renders barcode-assisted entry
- **THEN** the screen SHALL still require `size` and `color` for new stock combinations
- **AND** SHALL not hide those fields based on the centralized barcode mode.

#### Scenario: Quick-add item flow uses centralized mode
- **GIVEN** a quick-add item flow is launched from a stock workflow
- **WHEN** the quick-add form renders
- **THEN** it SHALL honor the centralized `barcodeGenerationMethod` for canonical item-definition fields
- **AND** SHALL not expose a per-item `Price Method` selector.

### Requirement: Item price method is removed before go-live
The system SHALL stop persisting and reading item-level `priceMethod` values, and the item data model MUST NOT expose `priceMethod` after this change is complete.

#### Scenario: Item create and update ignore item-level price method
- **WHEN** Item Master creates or updates an item after this change
- **THEN** the request and persistence flow do not require or store `Item.priceMethod`

#### Scenario: Item API no longer exposes price method
- **WHEN** a client fetches item data after this change is complete
- **THEN** the returned item payload does not rely on item-level `priceMethod` to describe barcode-generation mode

#### Scenario: Item model does not own centralized mode
- **WHEN** the system describes item barcode behavior after this change
- **THEN** it does so through the effective mode derived from `ItemControlPanel`
- **AND** not through an item-owned barcode-mode field

#### Scenario: Item API does not expose derived centralized mode
- **WHEN** a client fetches item data after this change is complete
- **THEN** the item payload does not include a derived `barcodeGenerationMethod`
- **AND** clients obtain centralized barcode-generation behavior from control-panel context rather than from the item payload
