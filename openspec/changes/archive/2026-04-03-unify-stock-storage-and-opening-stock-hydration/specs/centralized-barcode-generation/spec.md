## MODIFIED Requirements

### Requirement: Item Master behavior follows centralized barcode generation mode
The Item Master SHALL render its pricing and barcode entry UI from the centralized `barcodeGenerationMethod` and MUST NOT allow the user to choose `STANDARD`, `SIZE`, or `SIZE_COLOR` per item. Outside Item Settings, the UI MUST NOT surface the mode itself as a displayed field or read-only value. The centralized mode SHALL define canonical barcode-definition structure for new item variants and SHALL NOT determine stock-entry field visibility.

#### Scenario: Standard mode renders single-item barcode fields
- **WHEN** `barcodeGenerationMethod` is `STANDARD` and a user opens Item Master
- **THEN** the form shows the single barcode, SKU, and sales-price fields for the item
- **AND** the form does not show a per-item mode selector
- **AND** the form does not show the centralized mode as a visible field or label

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

#### Scenario: Stock-entry screens do not use barcode mode for column visibility
- **WHEN** a stock-entry screen needs to decide whether size or color columns are shown
- **THEN** the screen does not use `barcodeGenerationMethod` as the source of truth for field visibility

### Requirement: Inventory workflows use centralized barcode generation mode
Workflows that depend on canonical item barcode definitions or barcode row shape SHALL use the centralized `barcodeGenerationMethod` instead of item-level `priceMethod` data. Stock-entry visibility and required dimensions SHALL be governed by stock-maintenance controls. Opening-stock hydration MAY use the centralized mode to understand which core variant fields are relevant for item enrichment, but SHALL NOT create downstream sellable-association data from stock capture alone.

#### Scenario: Opening stock uses centralized mode for core-field hydration only
- **WHEN** a user resolves an item in opening stock
- **THEN** the system may use the centralized `barcodeGenerationMethod` to determine whether `size` or `color` are relevant core item fields for that item
- **AND** it does not use that mode to decide whether the opening-stock UI shows size or color columns
- **AND** it does not create sellable size or size-color associations from stock capture alone

#### Scenario: Stock adjustment uses stock-maintenance controls for dimensions
- **WHEN** a user captures a stock adjustment row
- **THEN** the workflow uses stock-maintenance controls to decide which stock dimensions are shown and required
- **AND** it does not use `barcodeGenerationMethod` to hide or show those dimensions

#### Scenario: Quick-add item flow uses centralized mode
- **WHEN** a user opens a quick-add item workflow from opening stock or stock adjustment
- **THEN** the quick-add form uses the centralized `barcodeGenerationMethod`
- **AND** the form does not expose a per-item `Price Method` selector
- **AND** the form does not display the centralized mode as a visible field or read-only value
