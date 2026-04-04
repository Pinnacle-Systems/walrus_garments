# opening-stock-entry-workspace Specification

## Purpose
TBD - created by archiving change unify-opening-stock-entry-and-hydration. Update Purpose after archive.
## Requirements
### Requirement: Opening Stock SHALL use one shared table workspace
The system SHALL present Opening Stock as one editable row-based workspace rather than as separate manual-entry and import-entry surfaces. The workspace SHALL allow users to add rows manually and SHALL allow bulk-imported rows to load into that same editable table.

#### Scenario: Manual and imported rows share one visible table
- **WHEN** a user opens Opening Stock
- **THEN** the system shows one editable stock table as the main working surface
- **AND** the user may add rows directly in that table
- **AND** rows loaded through bulk import appear in that same table rather than in a separate final entry surface

#### Scenario: Row origin disappears after ingestion
- **WHEN** a row has been loaded into the Opening Stock table through either manual entry or bulk import
- **THEN** the workspace treats that row as part of the same working batch
- **AND** the UI does not require a persistent imported-versus-manual distinction for normal editing and save behavior

### Requirement: Opening Stock SHALL use one shared row contract
The system SHALL define one ordered Opening Stock row contract that drives manual entry rendering, import header matching, downloadable template generation, row validation, and save payload mapping. The shared row contract SHALL include `item name`, `item code`, `price`, `qty`, `uom`, and every stock-writing field required by Stock Control for Opening Stock.

#### Scenario: Shared row contract drives all row paths
- **WHEN** Opening Stock renders manual rows, parses imported rows, or generates the downloadable template
- **THEN** all those behaviors use the same ordered row contract
- **AND** the system does not maintain separate column definitions for manual and bulk row paths

#### Scenario: Stock-writing save uses the shared row contract
- **WHEN** a user saves Opening Stock rows
- **THEN** each row must satisfy the required fields in the shared row contract
- **AND** the workflow blocks save until the missing row values are completed

### Requirement: Opening Stock SHALL reuse shared row values for legacy-item hydration
When Opening Stock creates or enriches a legacy item, the workflow SHALL reuse shared row values instead of asking the user to enter duplicate identity and price values. `item code` SHALL hydrate both the legacy item code and the legacy barcode identity, and row `price` SHALL hydrate the legacy item's flat sales price.

#### Scenario: Item code becomes the legacy barcode identity
- **WHEN** Opening Stock creates or enriches a legacy item from a row
- **THEN** the captured row `item code` value is used as the legacy item code
- **AND** that same value is used as the legacy barcode identity for the flat legacy item

#### Scenario: Row price becomes the legacy sales price
- **WHEN** Opening Stock creates or enriches a legacy item from a row
- **THEN** the captured row `price` is used as the legacy item's flat sales price
- **AND** the workflow does not require the user to enter a second sales-price value for that same row

### Requirement: Opening Stock SHALL resolve missing masters at the table level
Once rows exist in the Opening Stock table, the workflow SHALL collect missing items, sizes, and colors into one shared pending review set for the whole current batch regardless of whether the affected rows were imported or added manually. The workflow MAY detect pending masters while a row is edited, but creation SHALL be confirmed only when the user attempts to save through the shared table-level review flow.

#### Scenario: Mixed imported and manual rows share one pending master review
- **WHEN** a user imports some rows and then manually adds more rows in the same Opening Stock workspace
- **AND** the combined table contains missing items, sizes, or colors
- **THEN** the workflow groups those missing masters into one shared review set
- **AND** the user resolves them through one table-level review flow rather than separate origin-specific creation behaviors

#### Scenario: Pending master review blocks final save
- **WHEN** one or more rows in the current Opening Stock table depend on missing master creation
- **THEN** the workflow blocks final stock save until the shared review flow is completed
- **AND** the affected rows remain visible in the same table with a pending status

#### Scenario: Shared review opens when save is attempted
- **WHEN** a user attempts to save an Opening Stock table that still contains pending missing masters
- **THEN** the workflow opens the shared table-level review flow at that time
- **AND** the system does not require a separate pre-save review action to trigger missing-master creation

