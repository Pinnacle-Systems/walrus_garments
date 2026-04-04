## MODIFIED Requirements

### Requirement: Users can download an opening stock import template
The system SHALL provide a downloadable template from the Opening Stock Excel Import interface so users can prepare import data in the expected format. The template SHALL be generated from the active opening-stock schema derived from Stock Control rather than from a fixed header list.

#### Scenario: Template download is available during import preparation
- **WHEN** a user opens the Opening Stock screen and selects the Excel Import view
- **THEN** the system shows a template download action within the import controls

#### Scenario: Template matches the active opening-stock schema
- **WHEN** a user downloads the opening stock template
- **THEN** the downloaded file includes the exact column headers required by the current opening-stock import parser
- **AND** those headers reflect the active Stock Control configuration, including configured additional stock fields
