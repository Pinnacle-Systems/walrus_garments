## ADDED Requirements

### Requirement: Transaction entry screens use a consistent transaction-entry shell
The system SHALL render supported transaction entry screens inside a consistent workspace shell derived from the recent Purchase Inward reference pattern. This shell MUST provide a fixed-height layout, a collapsible header section, a scrollable middle content region, and a visible footer action area while allowing transaction-specific field layouts.

#### Scenario: Opening a supported transaction entry screen
- **WHEN** a user opens a supported transaction screen such as Purchase Inward, Estimate / Quotation, Sale Order, Sales Invoice, Sales Delivery, Sales Return, or Purchase Return / Cancel
- **THEN** the screen appears inside the standardized transaction-entry shell
- **AND** the header, content region, and footer follow the same overall layout pattern as the Purchase Inward reference
- **AND** transaction-specific fields remain available within that shared shell

#### Scenario: Footer actions remain visible during item entry
- **WHEN** a supported transaction screen contains enough header fields or line items to require vertical scrolling
- **THEN** the main content region scrolls independently within the transaction shell
- **AND** the primary footer actions remain visible without requiring the user to scroll the entire page

### Requirement: Transaction headers support collapsible summary behavior
The system SHALL provide a collapsible header section for supported transaction entry screens. When collapsed, the system MUST display a compact inline summary of key transaction values using the shared transaction-entry pattern, while allowing each screen to choose its own summary fields and ordering.

#### Scenario: Collapsing the header on a transaction screen
- **WHEN** a user collapses the header details on a supported transaction screen
- **THEN** the screen shows a compact summary row with key values such as document number, date, type, branch, location, party, or related document fields as applicable
- **AND** the summary remains visually consistent with the Purchase Inward reference pattern

#### Scenario: Collapsed summary values are provided as matching display strings
- **WHEN** a supported transaction screen shows both expanded header fields and a configured collapsed summary for some of those fields
- **THEN** the screen may choose which fields to summarize and in what order
- **AND** for any summarized field, the consuming screen provides the same visible display string represented by the corresponding expanded header field
- **AND** the shared shell renders that provided summary value without deriving an alternate or approximate display source

#### Scenario: Optional linked-document values are absent
- **WHEN** a supported transaction screen includes an optional linked-document field such as estimate, sale order, delivery, or inward reference and no linked document is present
- **THEN** the expanded header shows no value for that field
- **AND** the collapsed summary also shows no value for that field if the field is included in the summary
- **AND** the shared shell does not substitute generic fallback placeholder text for that absent optional link

#### Scenario: Expanding the header on a transaction screen
- **WHEN** a user expands the header details on a supported transaction screen
- **THEN** the full editable or read-only header fields are shown again
- **AND** the screen preserves the same transaction data without requiring the user to re-enter values

#### Scenario: Collapsing the header frees space for transaction content
- **WHEN** a supported transaction screen's header is collapsed
- **THEN** the scrollable content region gains additional usable vertical space
- **AND** the line-item area or other transaction content expands within the fixed-height shell

### Requirement: Expanded transaction header groups use a consistent fieldset-style presentation
The system SHALL render expanded header-detail groups using a shared presentation pattern derived from the Purchase Inward reference. Supported transaction screens MUST use a shared tiny presentational helper for grouped header sections, with consistently styled fieldset or legend-like titles, aligned spacing, and shared label treatment while still allowing transaction-specific header fields and group structure inside those sections.

#### Scenario: Viewing an expanded transaction header
- **WHEN** a user opens a supported transaction screen with the header expanded
- **THEN** the header details appear in grouped sections that follow the shared Purchase Inward-inspired fieldset style
- **AND** section titles, borders, spacing, and grouping treatment remain visually consistent across supported transaction screens
- **AND** each screen may still define different groups, layouts, and field content inside those shared sections

#### Scenario: In-scope screens use the shared presentational helper
- **WHEN** a supported transaction screen renders expanded header groups
- **THEN** it uses the shared tiny presentational helper for header-section visual treatment
- **AND** the helper standardizes presentation without imposing a shared header structure or field schema

### Requirement: Transaction entry screens use a consistent typography scale
The system SHALL render supported transaction-entry screens with a shared typography scale for the standardized shell. The system MUST apply consistent type sizing across section headers, field labels, collapsed summary labels and values, footer notes, and footer totals text so compact transaction screens remain visually aligned.

#### Scenario: Viewing grouped header sections and field labels
- **WHEN** a user opens a supported transaction-entry screen with the header expanded
- **THEN** grouped header-section titles use the shared transaction-entry type tier
- **AND** field labels inside those sections use the shared transaction-entry label tier
- **AND** the screen does not rely on arbitrary local type-size choices for the same semantic roles

#### Scenario: Viewing a collapsed transaction summary
- **WHEN** a user collapses the header on a supported transaction-entry screen
- **THEN** the collapsed summary labels and values follow the shared transaction-entry typography treatment
- **AND** the distinction between summary labels and values comes from the shared presentation pattern rather than one-off per-screen font sizing

#### Scenario: Viewing footer notes and totals
- **WHEN** a user reviews footer notes, remarks, totals, and action-adjacent footer content on a supported transaction-entry screen
- **THEN** that footer content follows the shared transaction-entry typography scale
- **AND** footer notes and totals remain visually consistent across the supported transaction screens

### Requirement: Transaction entry screens use a consistent line-item table surface
The system SHALL render transaction line-item entry areas with a consistent table surface derived from the recent Purchase Inward reference pattern. This surface MUST provide a consistent section container, heading treatment, scroll region, table header styling, spacing, and row numbering across transaction screens, while allowing screen-specific columns.

#### Scenario: Opening any supported transaction entry screen with line items
- **WHEN** a user opens a transaction screen that contains editable or read-only line items
- **THEN** the line-item area appears within the standardized transaction table surface
- **AND** the table uses the same visual shell and header treatment as the Purchase Inward reference
- **AND** transaction-specific columns remain available within that shared shell

#### Scenario: Comparing two different transaction screens
- **WHEN** a user moves between supported transaction flows such as Estimate / Quotation, Sales Invoice, Sales Return, or Purchase Return / Cancel
- **THEN** the line-item tables feel visually consistent in structure, spacing, numbering, and actions
- **AND** only domain-specific columns and field editors differ

### Requirement: Shared transaction table interactions behave consistently
The system SHALL provide consistent interaction patterns for common line-item actions across supported transaction screens. The system MUST keep add-row, delete-row, read-only, scroll, required-field, and inline-editing affordances in predictable locations and styles unless a screen has a documented domain-specific exception.

#### Scenario: Screen is editable
- **WHEN** a user opens a supported transaction screen in editable mode
- **THEN** the table shows add-row and row-action affordances in the standardized positions for that screen type
- **AND** required inputs are indicated consistently with the shared transaction table pattern

#### Scenario: Screen is read-only
- **WHEN** a supported transaction screen is opened in read-only mode
- **THEN** line-item rows remain visible in the standardized table surface
- **AND** editing affordances are hidden or disabled consistently

#### Scenario: Table content exceeds visible height
- **WHEN** a supported transaction table contains enough rows or columns to overflow its container
- **THEN** the table remains usable through the standardized scroll region and sticky-header behavior
- **AND** header labels remain visible while the user reviews row data

### Requirement: Standardization preserves transaction-specific behavior
The system SHALL preserve each transaction screen's existing business fields, validations, row-level modals, summary semantics, and special calculations while adopting the common transaction-entry shell and line-item table behavior. The system MUST NOT remove or alter required transaction-specific capabilities solely to achieve UI consistency.

#### Scenario: A transaction row opens a specialized modal or editor
- **WHEN** a user interacts with a row action such as lot details, barcode handling, linked-document selection, or stock selection on a supported transaction screen
- **THEN** the screen continues to open and use its specialized editor
- **AND** the surrounding transaction shell and line-item surface still follow the shared standard

#### Scenario: A transaction has specialized header or computed fields
- **WHEN** a supported transaction screen includes domain-specific values such as supplier, party, dispatch details, allowed quantity, gross amount, or stock quantity
- **THEN** those values remain present and functional
- **AND** they are presented within the standardized transaction-entry shell rather than a one-off layout
