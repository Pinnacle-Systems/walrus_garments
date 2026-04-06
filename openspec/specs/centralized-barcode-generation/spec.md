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
The system SHALL centralize canonical item barcode-definition behavior under the shared `barcodeGenerationMethod` settings so that Item Master and related canonical inventory flows collect and persist a consistent modern item shape for new item variants. The centralized mode SHALL define canonical size/color requiredness for non-legacy item variants and SHALL NOT make stock-defined runtime fields such as `field1` through `field10` mandatory by itself.

#### Scenario: Standard mode uses the item-only canonical definition
- **GIVEN** `barcodeGenerationMethod` is `STANDARD`
- **WHEN** Item Master or a canonical inventory intake flow validates a non-legacy item row
- **THEN** the canonical item definition SHALL allow the row without size or color assignments
- **AND** the centralized mode SHALL not require stock-defined runtime fields for that row.

#### Scenario: Size mode requires canonical size assignment
- **GIVEN** `barcodeGenerationMethod` is `SIZE`
- **WHEN** Item Master or a canonical inventory intake flow validates a non-legacy item row
- **THEN** the canonical item definition SHALL require a size assignment before the row can be persisted
- **AND** the centralized mode SHALL not require a color assignment unless the mode is `SIZE_COLOR`.

#### Scenario: Size and color mode requires canonical size and color assignment
- **GIVEN** `barcodeGenerationMethod` is `SIZE_COLOR`
- **WHEN** Item Master or a canonical inventory intake flow validates a non-legacy item row
- **THEN** the canonical item definition SHALL require both size and color assignments before the row can be persisted.

#### Scenario: Legacy compatibility flow does not inherit canonical requiredness
- **GIVEN** an Opening Stock or other legacy-compatible flow is handling a legacy item shape
- **WHEN** the current `barcodeGenerationMethod` is `SIZE` or `SIZE_COLOR`
- **THEN** the flow SHALL NOT require size or color solely because of the centralized barcode mode
- **AND** the flow SHALL remain permissive for stock-defined runtime fields.

### Requirement: Inventory workflows use centralized barcode generation mode
Inventory workflows that create or validate canonical item-variant structure SHALL use the centralized `barcodeGenerationMethod` so that Item Master, Purchase Inward, Purchase Return, and related canonical flows stay aligned. Legacy Opening Stock compatibility handling SHALL remain outside canonical barcode-requiredness enforcement, and stock-entry field presence SHALL not be inferred from barcode mode alone.

#### Scenario: Canonical purchase inward follows centralized mode
- **GIVEN** a user is receiving new canonical stock through Purchase Inward
- **WHEN** the selected item row is validated before persistence
- **THEN** the workflow SHALL apply the centralized `barcodeGenerationMethod` to determine whether size and color are required for that canonical row.

#### Scenario: Canonical purchase return preserves centralized variant shape
- **GIVEN** a user is returning stock through Purchase Return for a canonical inventory flow
- **WHEN** the return row is validated or reconstructed from the source inward row
- **THEN** the workflow SHALL preserve the size/color completeness required by the centralized barcode mode for that canonical row.

#### Scenario: Opening stock uses centralized mode only as compatibility context
- **GIVEN** a user adds or reconciles stock through Opening Stock
- **WHEN** the current `barcodeGenerationMethod` requires size or color in canonical flows
- **THEN** Opening Stock SHALL NOT treat that centralized mode as a hard requiredness rule for the legacy row
- **AND** Opening Stock SHALL remain the permissive compatibility path for coarse or historical stock.

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

