## ADDED Requirements

### Requirement: Standardized transaction screens use a compact footer layout
The system SHALL render supported transaction-entry screens with a compact footer layout that reduces vertical footprint while preserving the same footer responsibilities. The compact footer MUST keep footer content visually organized within the pinned transaction shell and MUST leave more usable height for the line-item region than the previous tall footer layout.

#### Scenario: Opening a supported transaction screen with a footer
- **WHEN** a user opens a standardized transaction-entry screen such as Purchase Inward, Sale Order, Sales Delivery, Sales Invoice, Sales Return, or Purchase Return / Cancel
- **THEN** the footer uses the compact transaction-entry footer pattern
- **AND** the footer consumes less vertical space than the previous card-heavy layout
- **AND** the surrounding pinned-footer behavior of the transaction shell remains intact

### Requirement: Compact footers preserve notes, totals, and action access
The system SHALL preserve the functional content of the transaction footer while compacting its presentation. The compact footer MUST continue to expose terms-related inputs where applicable, remarks input where applicable, totals, and transaction actions without moving those capabilities to hidden secondary surfaces.

#### Scenario: Using a compact footer in editable mode
- **WHEN** a user works in an editable transaction-entry screen that supports terms, remarks, totals, and actions
- **THEN** the compact footer still shows those inputs and values in the main footer area
- **AND** the user can interact with save, edit, print, barcode, thermal-print, or other transaction-specific actions from that compact footer
- **AND** the layout reduces extra padding, oversized cards, or unnecessary vertical gaps rather than removing footer capabilities

#### Scenario: Viewing a compact footer in read-only mode
- **WHEN** a user opens a supported transaction-entry screen in read-only mode
- **THEN** the compact footer still presents remarks, totals, and allowed actions in the compact layout
- **AND** inputs that are not editable remain visible in their appropriate read-only or disabled state

### Requirement: Compact footers remain responsive and usable across widths
The system SHALL keep compact transaction footers usable across representative desktop and laptop widths. The compact layout MUST support responsive wrapping when needed, but it MUST avoid reintroducing unnecessary tall spacing or clipping required controls and totals.

#### Scenario: Footer content fits a wide transaction workspace
- **WHEN** a user opens a supported transaction screen on a wide desktop viewport
- **THEN** footer sections align in a denser arrangement than the previous layout
- **AND** the footer avoids tall stacked cards when the available width can support a shorter presentation

#### Scenario: Footer content wraps on a narrower workspace
- **WHEN** a user opens a supported transaction screen on a narrower viewport where all footer sections cannot sit in one row
- **THEN** the footer may wrap its sections
- **AND** wrapped sections retain compact spacing and usable control sizes
- **AND** required actions and totals remain visible and operable without clipping
