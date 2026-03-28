## ADDED Requirements

### Requirement: Transaction-entry section headers use the reduced type scale
The system SHALL render section headers in standardized transaction-entry page header and footer sections at `12px`. This requirement MUST apply to grouped header-section titles and footer block titles within the in-scope transaction-entry screens.

#### Scenario: Viewing grouped header sections
- **WHEN** a user opens a standardized transaction-entry screen with expanded header groups
- **THEN** each grouped header-section title renders at `12px`
- **AND** the reduced type scale is applied consistently across the shared transaction header-section presentation

#### Scenario: Viewing footer section titles
- **WHEN** a user views footer sections such as terms, remarks, totals, or similar grouped blocks on a standardized transaction-entry screen
- **THEN** each footer section title renders at `12px`
- **AND** the title styling remains visually consistent with the shared transaction-entry typography contract

### Requirement: Transaction-entry subsection text uses 11px typography
The system SHALL render subsection or supporting text within standardized transaction-entry header and footer sections at `11px`. This requirement MUST cover supporting copy and summary rows that are not field labels and are not primary section headers.

#### Scenario: Viewing supporting text in transaction sections
- **WHEN** a standardized transaction-entry screen shows supporting text inside header or footer sections
- **THEN** that subsection text renders at `11px`
- **AND** the reduced type size is applied consistently across comparable transaction screens

#### Scenario: Viewing totals rows in a transaction footer
- **WHEN** a user reviews totals lines such as quantity, before-tax amount, net amount, or similar supporting rows in a standardized transaction footer
- **THEN** the totals-row text uses the `11px` typography scale for its non-label supporting text role
- **AND** important values may still use stronger font weight without changing the required size tier

### Requirement: Transaction-entry field labels use 12px typography
The system SHALL render field labels within standardized transaction-entry page header and footer sections at `12px`. This requirement MUST apply whether the label is rendered through a shared input component or through local footer markup.

#### Scenario: Viewing header field labels
- **WHEN** a user opens a standardized transaction-entry screen with header fields
- **THEN** the labels for those header fields render at `12px`
- **AND** the label size is consistent across shared and local field renderers used in the transaction header

#### Scenario: Viewing footer field labels
- **WHEN** a user views labeled footer inputs such as terms, remarks, or similar footer fields on a standardized transaction-entry screen
- **THEN** the footer field labels render at `12px`
- **AND** the label size is consistent with the transaction-entry typography contract used in the header
