# opening-stock-import-color-review Specification

## Purpose
TBD - created by archiving change require-color-codes-for-opening-stock-import-colors. Update Purpose after archive.
## Requirements
### Requirement: Bulk opening-stock import SHALL collect required color codes before creating missing colors
When bulk opening-stock import detects color values that do not exist in color master, the workflow SHALL present those missing colors in a batch review step and SHALL require the user to complete a color code for each pending color before creation.

#### Scenario: Missing colors require code completion before batch create
- **WHEN** a user attempts to save an opening-stock import that contains one or more missing colors
- **THEN** the workflow shows the missing colors in a batch review step
- **AND** each missing color row includes the imported color name and an editable required code field
- **AND** the workflow does not create the missing colors until all required codes are completed

### Requirement: Bulk opening-stock import SHALL validate pending color codes before confirmation
The batch review step for missing colors SHALL reject invalid color-code input before creating any new colors.

#### Scenario: Duplicate code in pending batch is rejected
- **WHEN** two pending missing colors are assigned the same code in the batch review step
- **THEN** the workflow blocks confirmation
- **AND** highlights the conflicting rows so the user can correct them

#### Scenario: Existing color code conflict is rejected
- **WHEN** a pending missing color is assigned a code that already belongs to an existing color master
- **THEN** the workflow blocks confirmation
- **AND** informs the user that the code must be unique before batch creation can proceed

### Requirement: Bulk opening-stock import SHALL keep grouped review for missing non-color masters
The batch review flow SHALL continue to summarize missing items and sizes together with missing colors, while only requiring inline completion for the master types that need additional metadata.

#### Scenario: Missing sizes still use lightweight batch review
- **WHEN** a user attempts to save an opening-stock import with missing sizes but no missing colors
- **THEN** the workflow shows the grouped review summary
- **AND** does not require any extra completion fields for the missing sizes before confirmation

#### Scenario: Missing items and colors are reviewed together
- **WHEN** a user attempts to save an opening-stock import with both missing items and missing colors
- **THEN** the workflow shows one grouped batch review step
- **AND** allows item creation to remain summary-based
- **AND** requires the missing colors to be completed with valid codes before final confirmation

