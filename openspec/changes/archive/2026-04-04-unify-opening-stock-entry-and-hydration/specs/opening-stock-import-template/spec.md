## MODIFIED Requirements

### Requirement: Users can download an opening stock import template
The system SHALL provide a downloadable template from the Opening Stock workspace so users can prepare row data in the expected format. The template SHALL be generated from the shared Opening Stock row contract derived from the active opening-stock schema rather than from a separate import-only header list.

#### Scenario: Template download is available in the Opening Stock workspace
- **WHEN** a user opens the Opening Stock screen
- **THEN** the system shows a template download action within the workspace controls

#### Scenario: Template matches the shared Opening Stock row contract
- **WHEN** a user downloads the opening stock template
- **THEN** the downloaded file includes the exact column headers required by the current shared row contract
- **AND** those headers reflect the active Stock Control configuration, including configured additional stock fields
- **AND** the uploaded file can be loaded into the unified Opening Stock table without column drift

### Requirement: Opening stock import guidance is shown on hover without consuming layout space
The system SHALL present brief usage guidance for the template download through a hover-triggered icon tooltip instead of persistent informational text in the Opening Stock workspace.

#### Scenario: Helper text appears on hover
- **WHEN** a user hovers over the help icon associated with the template download action
- **THEN** the system displays concise helper text explaining that the user can download the template, complete it in Excel, and load the finished file into the Opening Stock table

#### Scenario: Helper text does not occupy persistent page space
- **WHEN** the Opening Stock workspace is rendered with no hover interaction
- **THEN** no always-visible informational text is added below or around the workspace controls for this guidance
