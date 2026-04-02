## MODIFIED Requirements

### Requirement: Bulk opening-stock import SHALL review missing masters before creation
When bulk opening-stock import detects missing items, sizes, or colors, the workflow SHALL present a review step showing the pending master records to be created and SHALL proceed only after a single batch confirmation from the user. The import workflow SHALL validate all configured stock-tracking fields from the active opening-stock schema before stock rows are written.

#### Scenario: Batch review shows missing masters before save
- **WHEN** a user attempts to save an opening-stock import that includes missing items, sizes, or colors
- **THEN** the workflow shows a review summary of the missing master records grouped by type
- **AND** asks the user to confirm the batch before creating them

#### Scenario: Batch confirmation avoids row-by-row prompts
- **WHEN** the user confirms creation of missing masters in a bulk opening-stock import
- **THEN** the workflow creates the reviewed master records as a batch
- **AND** continues the import without prompting separately for each affected row

#### Scenario: Configured stock-tracking fields are required before stock save
- **WHEN** the active opening-stock schema includes tracked fields required by Stock Control, including configured additional fields
- **AND** an imported row is still missing one or more of those fields
- **THEN** the workflow blocks the save for that row
- **AND** highlights the missing configured fields that must be completed before the stock row is persisted
