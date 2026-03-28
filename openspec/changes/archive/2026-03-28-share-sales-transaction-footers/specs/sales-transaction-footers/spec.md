## ADDED Requirements

### Requirement: Standardized sales transaction screens use a shared footer implementation
The system SHALL render the standardized sales transaction-entry screens through a shared sales-footer implementation instead of separate near-duplicate local footer layouts. This shared implementation MUST provide the common sales-footer structure for notes, totals, and actions while remaining configurable per screen.

#### Scenario: Opening a supported sales transaction screen
- **WHEN** a user opens a standardized sales transaction screen such as Quotation, Sale Order, Sales Delivery, Sales Invoice, or Sales Return
- **THEN** the screen footer is rendered through the shared sales-footer implementation
- **AND** the footer still appears inside the standardized transaction-entry shell
- **AND** the screen no longer depends on a one-off local footer layout for the common sales-footer sections

### Requirement: Shared sales footers preserve screen-specific footer content
The system SHALL preserve transaction-specific footer behavior while using the shared sales-footer implementation. The shared footer MUST allow each supported sales screen to configure its own totals rows, optional controls, and action buttons without changing the screen's business behavior.

#### Scenario: Sales screen provides common notes and totals
- **WHEN** a supported sales transaction screen needs terms, remarks, totals, and save or edit actions
- **THEN** the shared footer renders those sections using the shared sales-footer layout
- **AND** the consuming screen provides the values and handlers needed for that footer content

#### Scenario: Quotation includes an extra footer control
- **WHEN** the Quotation screen includes a footer-specific control such as minimum advance in addition to notes, totals, and actions
- **THEN** the shared footer renders that extra control within the shared footer structure
- **AND** the control preserves the same editability and value behavior as before the refactor

#### Scenario: Sales screen provides print actions
- **WHEN** a supported sales transaction screen includes print or thermal-print actions
- **THEN** those actions remain available through the shared footer implementation
- **AND** the action enablement, validation, and handlers continue to follow the consuming screen's existing behavior

### Requirement: Shared sales footers support consistent layout updates
The system SHALL centralize the common sales-footer layout contract so future visual changes to notes, totals, and action presentation can be applied consistently across the supported sales transaction screens.

#### Scenario: Footer layout or typography is adjusted later
- **WHEN** the shared sales-footer layout or typography contract is updated after this refactor
- **THEN** the supported sales transaction screens pick up that shared change through the centralized sales-footer implementation
- **AND** the screens do not require separate footer markup edits for the same common visual adjustment
