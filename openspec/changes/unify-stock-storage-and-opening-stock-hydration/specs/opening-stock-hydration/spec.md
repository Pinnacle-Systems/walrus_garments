## ADDED Requirements

### Requirement: Opening stock SHALL act as the compatibility intake path for legacy stock
Opening stock SHALL be used to bring pre-existing stock into the unified stock model when that stock may carry historical, coarse, or otherwise non-canonical barcode labels. The workflow SHALL treat those barcodes as compatibility inputs rather than as proof that the stock follows the current barcode-generation method used for new operational inward flows.

#### Scenario: User captures historical stock through opening stock
- **WHEN** a user needs to inward stock that already existed before the current barcode-generation approach or does not follow the current canonical barcode structure
- **THEN** the workflow allows that stock to be captured through Opening Stock
- **AND** treats the barcode as compatibility-oriented stock-row data rather than as a canonical new-barcode definition

#### Scenario: Opening stock does not replace routine inward for new canonical stock
- **WHEN** the business is receiving newly inwarded stock that follows the current item-master and canonical barcode-generation rules
- **THEN** that intake belongs to routine inward workflows such as Purchase Inward
- **AND** Opening Stock is not treated as the primary operational inward path for those new canonical barcode flows

#### Scenario: Legacy barcode intake stays out of Purchase Inward
- **WHEN** stock is identified by a historical or otherwise coarse barcode that does not follow the current canonical barcode-generation method
- **THEN** that stock must enter through Opening Stock as the compatibility intake workflow
- **AND** Purchase Inward is not used for that legacy-barcode intake because it is the path that prints new canonical barcode labels

### Requirement: Opening stock SHALL hydrate structural item master data
The opening-stock workflow SHALL allow users to resolve an existing item or create a missing item while capturing stock. The workflow SHALL support hydration only of `item name` and the structural variant fields required by the effective centralized barcode-generation mode. For `STANDARD`, the core item field is `item name`. For `SIZE`, the core item fields are `item name` and `size`. For `SIZE_COLOR`, the core item fields are `item name`, `size`, and `color`. The workflow SHALL NOT create canonical barcode definitions or item price-list rows as part of stock save.

#### Scenario: Create missing item from opening stock
- **WHEN** a user captures an opening-stock row for an item that does not exist in item master
- **THEN** the workflow creates the item with the approved core item fields
- **AND** links the saved stock row to the created item
- **AND** does not create barcode definitions or price-list rows from the imported stock data

#### Scenario: Enrich existing item with mode-dependent core fields
- **WHEN** a user resolves an opening-stock row to an existing item that is missing one or more allowed core fields required by the effective barcode-generation mode
- **THEN** the workflow allows those approved core fields to be hydrated on the existing item before save
- **AND** does not require the user to leave the opening-stock screen to complete the row

### Requirement: Opening stock SHALL create missing size and color masters on demand
When a resolved opening-stock row includes a size or color value that does not exist in the corresponding master, the workflow SHALL allow the user to create the missing master record and reuse it for the stock row.

#### Scenario: Create missing size master from opening stock
- **WHEN** a user enters a size value that is not found in the size master
- **THEN** the workflow creates the size master record
- **AND** assigns the created size to the opening-stock row

#### Scenario: Create missing color master from opening stock
- **WHEN** a user enters a color value that is not found in the color master
- **THEN** the workflow creates the color master record
- **AND** assigns the created color to the opening-stock row

### Requirement: Bulk opening-stock import SHALL review missing masters before creation
When bulk opening-stock import detects missing items, sizes, or colors, the workflow SHALL present a review step showing the pending master records to be created and SHALL proceed only after a single batch confirmation from the user.

#### Scenario: Batch review shows missing masters before save
- **WHEN** a user attempts to save an opening-stock import that includes missing items, sizes, or colors
- **THEN** the workflow shows a review summary of the missing master records grouped by type
- **AND** asks the user to confirm the batch before creating them

#### Scenario: Batch confirmation avoids row-by-row prompts
- **WHEN** the user confirms creation of missing masters in a bulk opening-stock import
- **THEN** the workflow creates the reviewed master records as a batch
- **AND** continues the import without prompting separately for each affected row

### Requirement: Opening stock SHALL NOT hydrate sellable variant associations
The opening-stock workflow SHALL NOT create item size, item color, item size-color, or other sellable variant-association data when saving stock rows. In the current system, downstream option availability is derived from `ItemPriceList`, so association hydration from opening stock would implicitly create sellable catalog combinations and exceed the approved scope of stock-row hydration.

#### Scenario: Opening stock resolves a stock row with a new size or color combination
- **WHEN** a user captures or imports an opening-stock row whose size or size-color combination is not yet represented as a sellable item option
- **THEN** the workflow may still save the stock row using the resolved masters and tracked stock dimensions
- **AND** it does not auto-create sellable item variant associations as part of that stock save

#### Scenario: Opening stock skips commercial association creation
- **WHEN** opening stock enriches an item with approved core fields and standalone master values
- **THEN** the workflow stops short of creating `ItemPriceList`-backed combination rows
- **AND** leaves future sellable option definition to dedicated item-master workflows

### Requirement: Opening stock SHALL allow coarse barcodes under finer stock tracking
When opening stock captures imported stock rows whose barcode values are less specific than the dimensions required by current stock-maintenance settings, the workflow SHALL allow the same barcode to appear on multiple stock rows. Opening stock SHALL treat those barcode values as stock-row data or lookup aids in this workflow, not as canonical uniqueness keys for item-variant combinations.

#### Scenario: Shared barcode across multiple stock combinations
- **WHEN** opening stock import includes multiple rows with the same barcode
- **AND** those rows differ by stock dimensions that are currently required by stock-maintenance settings
- **THEN** the workflow allows those rows to proceed without raising a barcode-conflict error solely because the barcode is shared
- **AND** still requires the tracked stock dimensions to be completed before those rows are persisted to `Stock`

#### Scenario: Import does not infer canonical barcode uniqueness from legacy stock
- **WHEN** opening stock import validates rows captured from legacy or coarse barcode labels
- **THEN** the workflow does not require one barcode to map to exactly one size or size-color combination within the import batch
- **AND** it does not treat the imported barcode as defining canonical future barcode-generation policy
