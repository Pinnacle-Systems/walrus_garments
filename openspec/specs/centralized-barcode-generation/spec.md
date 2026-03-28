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
The Item Master SHALL render its pricing and barcode entry UI from the centralized `barcodeGenerationMethod` and MUST NOT allow the user to choose `STANDARD`, `SIZE`, or `SIZE_COLOR` per item. Outside Item Settings, the UI MUST NOT surface the mode itself as a displayed field or read-only value.

#### Scenario: Standard mode renders single-item barcode fields
- **WHEN** `barcodeGenerationMethod` is `STANDARD` and a user opens Item Master
- **THEN** the form shows the single barcode, SKU, and sales-price fields for the item
- **AND** the form does not show a per-item mode selector
- **AND** the form does not show the centralized mode as a visible field or label

### Requirement: Validation stays consistent across centralized modes
The system SHALL keep Item Master validation behavior consistent across centralized barcode-generation modes. The `STANDARD` mode MAY render different fields than `SIZE` or `SIZE_COLOR`, but it MUST NOT impose a stricter required-field rule solely because the mode is `STANDARD`.

#### Scenario: Standard mode does not add extra required-field validation
- **WHEN** `barcodeGenerationMethod` is `STANDARD` and a user creates or edits an item
- **THEN** the system validates the data needed for the rendered standard layout
- **AND** it does not apply an additional stricter required-field policy that exists only for `STANDARD`

#### Scenario: Size mode renders size-based rows
- **WHEN** `barcodeGenerationMethod` is `SIZE` and a user opens Item Master
- **THEN** the form shows size selection and size-based item price rows
- **AND** the form does not show a per-item mode selector
- **AND** the form does not show the centralized mode as a visible field or label

#### Scenario: Size and color mode renders size-color rows
- **WHEN** `barcodeGenerationMethod` is `SIZE_COLOR` and a user opens Item Master
- **THEN** the form shows size and color selection with size-color-based item price rows
- **AND** the form does not show a per-item mode selector
- **AND** the form does not show the centralized mode as a visible field or label

### Requirement: Inventory workflows use centralized barcode generation mode
Workflows that depend on item pricing structure or barcode row shape SHALL use the centralized `barcodeGenerationMethod` instead of item-level `priceMethod` data.

#### Scenario: Opening stock resolves price using centralized mode
- **WHEN** a user selects an item in opening stock
- **THEN** the system resolves standard, size-based, or size-color-based pricing using the centralized `barcodeGenerationMethod`

#### Scenario: Stock adjustment resolves price using centralized mode
- **WHEN** a user selects an item in stock adjustment
- **THEN** the system resolves standard, size-based, or size-color-based pricing using the centralized `barcodeGenerationMethod`

#### Scenario: Quick-add item flow uses centralized mode
- **WHEN** a user opens a quick-add item workflow from opening stock or stock adjustment
- **THEN** the quick-add form uses the centralized `barcodeGenerationMethod`
- **AND** the form does not expose a per-item `Price Method` selector
- **AND** the form does not display the centralized mode as a visible field or read-only value

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

