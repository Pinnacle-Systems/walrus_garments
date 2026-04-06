## MODIFIED Requirements

### Requirement: Opening stock SHALL hydrate legacy item master data only
The opening-stock workflow SHALL allow users to resolve an existing legacy item or create a missing legacy item while capturing stock. The workflow SHALL hydrate the core legacy-item values needed for a valid flat item record with `isLegacy = true`, but SHALL NOT create canonical barcode definitions or canonical variant structure as part of stock save. For rows created through Opening Stock, the workflow SHALL reuse the shared row values `item name`, `item code`, and `price` for legacy-item identity and flat sales-price hydration rather than asking the user to enter duplicate values.

#### Scenario: Create missing legacy item from opening stock
- **WHEN** a user captures an opening-stock row for a historical item that does not exist in item master
- **THEN** the workflow creates a legacy item with the required core item fields
- **AND** uses the row `item name` as the legacy item name
- **AND** uses the row `item code` as both the legacy item code and the flat legacy barcode identity
- **AND** uses the row `price` as the flat legacy sales price
- **AND** links the saved stock row to the created legacy item
- **AND** does not create canonical barcode definitions from the imported stock data

#### Scenario: Enrich existing legacy item with needed core fields
- **WHEN** a user resolves an opening-stock row to an existing legacy item that is missing one or more required core fields
- **THEN** the workflow allows those approved fields to be hydrated on the legacy item before save
- **AND** reuses the shared row values for legacy item code, legacy barcode identity, and flat sales price where those values are missing
- **AND** does not require the user to leave the opening-stock screen to complete the row

### Requirement: Opening stock SHALL create missing size and color masters on demand
When a resolved opening-stock row includes a size or color value that does not exist in the corresponding master, the workflow SHALL allow the user to stage that missing master record for creation and reuse it for the stock row through the shared table-level hydration review flow.

#### Scenario: Missing size enters the shared review flow
- **WHEN** a user enters or imports a size value that is not found in the size master
- **THEN** the workflow adds that size to the current Opening Stock table's pending master review set
- **AND** the affected row remains linked to the pending size until the shared review flow completes

#### Scenario: Missing color enters the shared review flow
- **WHEN** a user enters or imports a color value that is not found in the color master
- **THEN** the workflow adds that color to the current Opening Stock table's pending master review set
- **AND** the affected row remains linked to the pending color until the shared review flow completes

### Requirement: Bulk opening-stock import SHALL review missing masters before creation
When the current Opening Stock table contains rows that depend on missing legacy items, sizes, or colors, the workflow SHALL present one shared review step showing the pending master records to be created and SHALL proceed only after a single confirmation flow from the user. This review rule SHALL apply to mixed table batches containing both imported rows and manually added rows. The workflow SHALL validate all configured stock-tracking fields from the active opening-stock schema before stock rows are written.

#### Scenario: Shared review shows missing masters before save
- **WHEN** a user attempts to save an Opening Stock table that includes missing legacy items, sizes, or colors
- **THEN** the workflow shows a review summary of the missing master records grouped by type
- **AND** the review includes pending masters originating from both imported and manually added rows
- **AND** the workflow asks the user to confirm the batch before creating them

#### Scenario: Shared confirmation avoids row-by-row prompts
- **WHEN** the user confirms creation of missing masters for the current Opening Stock table
- **THEN** the workflow creates the reviewed master records as a batch
- **AND** continues the Opening Stock save without prompting separately for each affected row

#### Scenario: Configured stock-tracking fields are required before stock save
- **WHEN** the active opening-stock schema includes tracked fields required by Stock Control, including configured additional fields
- **AND** a row in the current Opening Stock table is still missing one or more of those fields
- **THEN** the workflow blocks the save for that row
- **AND** highlights the missing configured fields that must be completed before the stock row is persisted
