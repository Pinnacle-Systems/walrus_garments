# opening-stock-import-template Specification

## Purpose
Define the downloadable Opening Stock import template as a reflection of the active dynamic opening-stock schema.

## Requirements
### Requirement: Users can download an opening stock import template
The system SHALL provide a downloadable template from the Opening Stock Excel Import interface so users can prepare import data in the expected format. The template SHALL be generated from the active opening-stock schema derived from Stock Control rather than from a fixed header list.

#### Scenario: Template download is available during import preparation
- **WHEN** a user opens the Opening Stock screen and selects the Excel Import view
- **THEN** the system shows a template download action within the import controls

#### Scenario: Template matches the active opening-stock schema
- **WHEN** a user downloads the opening stock template
- **THEN** the downloaded file includes the exact column headers required by the current opening-stock import parser
- **AND** those headers reflect the active Stock Control configuration, including configured additional stock fields

### Requirement: Opening stock import guidance is shown on hover without consuming layout space
The system SHALL present brief usage guidance for the template download through a hover-triggered icon tooltip instead of persistent informational text in the Opening Stock import area.

#### Scenario: Helper text appears on hover
- **WHEN** a user hovers over the help icon associated with the template download action
- **THEN** the system displays concise helper text explaining that the user can download the CSV template, complete it in Excel, and upload the finished file

#### Scenario: Helper text does not occupy persistent page space
- **WHEN** the Opening Stock Excel Import interface is rendered with no hover interaction
- **THEN** no always-visible informational text is added below or around the import controls for this guidance
