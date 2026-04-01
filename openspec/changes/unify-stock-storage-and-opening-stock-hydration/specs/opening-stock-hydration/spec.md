## ADDED Requirements

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

### Requirement: Opening stock SHALL hydrate item size and color associations
The opening-stock workflow SHALL create the item size or item size-color associations required by the effective centralized barcode-generation semantics for the resolved item. The workflow SHALL use those semantics only to determine required associations and SHALL NOT use them to decide stock-entry column visibility.

#### Scenario: Size mode adds missing size association
- **WHEN** the effective barcode-generation mode for the resolved item is `SIZE`
- **AND** the opening-stock row uses a size that is not yet associated with the item
- **THEN** the workflow creates the missing item-size association before saving the stock row

#### Scenario: Size and color mode adds missing size-color association
- **WHEN** the effective barcode-generation mode for the resolved item is `SIZE_COLOR`
- **AND** the opening-stock row uses a size-color combination that is not yet associated with the item
- **THEN** the workflow creates the missing association before saving the stock row

#### Scenario: Standard mode skips variant association hydration
- **WHEN** the effective barcode-generation mode for the resolved item is `STANDARD`
- **THEN** opening stock does not require new size or size-color associations solely because variant values were captured for stock purposes
