## ADDED Requirements

### Requirement: Barcode generation mode is configured centrally
The system SHALL provide a single item control-panel setting named `barcodeGenerationMethod` with the supported values `STANDARD`, `SIZE`, and `SIZE_COLOR`. The system MUST use this centralized setting as the only configuration source for item barcode-generation mode.

#### Scenario: Save centralized barcode generation mode
- **WHEN** an authorized user selects a barcode generation mode in Item Settings and saves the control-panel record
- **THEN** the system stores the selected `barcodeGenerationMethod` on the item control-panel configuration

#### Scenario: Load centralized barcode generation mode
- **WHEN** a screen requests item control-panel settings
- **THEN** the system returns the saved `barcodeGenerationMethod` value with the control-panel data

### Requirement: Item Master behavior follows centralized barcode generation mode
The Item Master SHALL render its pricing and barcode entry UI from the centralized `barcodeGenerationMethod` and MUST NOT allow the user to choose `STANDARD`, `SIZE`, or `SIZE_COLOR` per item.

#### Scenario: Standard mode renders single-item barcode fields
- **WHEN** `barcodeGenerationMethod` is `STANDARD` and a user opens Item Master
- **THEN** the form shows the single barcode, SKU, and sales-price fields for the item
- **AND** the form does not show a per-item mode selector

#### Scenario: Size mode renders size-based rows
- **WHEN** `barcodeGenerationMethod` is `SIZE` and a user opens Item Master
- **THEN** the form shows size selection and size-based item price rows
- **AND** the form does not show a per-item mode selector

#### Scenario: Size and color mode renders size-color rows
- **WHEN** `barcodeGenerationMethod` is `SIZE_COLOR` and a user opens Item Master
- **THEN** the form shows size and color selection with size-color-based item price rows
- **AND** the form does not show a per-item mode selector

### Requirement: Inventory workflows use centralized barcode generation mode
Workflows that depend on item pricing structure or barcode row shape SHALL use the centralized `barcodeGenerationMethod` instead of item-level `priceMethod` data.

#### Scenario: Opening stock resolves price using centralized mode
- **WHEN** a user selects an item in opening stock
- **THEN** the system resolves standard, size-based, or size-color-based pricing using the centralized `barcodeGenerationMethod`

#### Scenario: Stock adjustment resolves price using centralized mode
- **WHEN** a user selects an item in stock adjustment
- **THEN** the system resolves standard, size-based, or size-color-based pricing using the centralized `barcodeGenerationMethod`

### Requirement: Item price method is removed before go-live
The system SHALL stop persisting and reading item-level `priceMethod` values, and the item data model MUST NOT expose `priceMethod` after this change is complete.

#### Scenario: Item create and update ignore item-level price method
- **WHEN** Item Master creates or updates an item after this change
- **THEN** the request and persistence flow do not require or store `Item.priceMethod`

#### Scenario: Item API no longer exposes price method
- **WHEN** a client fetches item data after this change is complete
- **THEN** the returned item payload does not rely on item-level `priceMethod` to describe barcode-generation mode
