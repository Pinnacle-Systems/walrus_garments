## ADDED Requirements

### Requirement: Transaction terms templates act only as compose-time prefills
The system SHALL treat terms template selection on supported transaction-entry screens as a compose-time helper rather than persisted transaction state. Selecting a template MUST prefill the editable transaction terms text area, and the saved transaction MUST preserve only the final editable terms text as the authoritative value for later viewing, editing, and printing.

#### Scenario: Applying a template to an empty transaction terms field
- **WHEN** a user opens a supported transaction-entry screen and the terms text area is empty
- **AND** the user selects a terms template from the template control
- **THEN** the system fills the transaction terms text area with that template's text
- **AND** the filled text remains editable before save

#### Scenario: Saving a transaction after editing prefilled terms
- **WHEN** a user applies a template, edits the terms text, and saves the transaction
- **THEN** the system saves the final edited terms text on the transaction
- **AND** later reads, prints, and edits of that transaction use the saved transaction text rather than reloading text from the template master

#### Scenario: Opening an existing transaction with saved terms text
- **WHEN** a user opens an existing supported transaction that already has saved terms text
- **THEN** the transaction footer displays the saved terms text from the transaction record
- **AND** the system does not reconstruct or replace that text from the template master

### Requirement: Changing templates protects existing transaction terms text
The system SHALL protect user-entered transaction terms text when a different template is selected after content already exists in the terms text area. The system MUST NOT silently discard existing terms text due to template selection.

#### Scenario: Applying a template when transaction terms already contain text
- **WHEN** a user has existing content in the transaction terms text area
- **AND** the user selects a terms template from the template control
- **THEN** the system requires an explicit confirmation before replacing the current terms text with the selected template text
- **AND** the existing text remains unchanged unless the user confirms the replacement

#### Scenario: Cancelling template replacement
- **WHEN** a user attempts to apply a template while transaction terms text already exists
- **AND** the user declines the replacement action
- **THEN** the system keeps the existing transaction terms text unchanged
- **AND** no template text is inserted into the transaction terms area

### Requirement: Terms template controls communicate helper-only intent
The system SHALL present terms template controls on supported transaction-entry screens in a way that makes clear the template is used to prefill editable transaction text rather than to store a permanent transaction classification. The system MUST keep the editable terms text area visually distinct as the final saved value.

#### Scenario: Viewing the terms controls on an editable transaction
- **WHEN** a user reviews the terms controls in the transaction footer
- **THEN** the UI makes clear that the template control applies draft text into the editable terms field
- **AND** the editable terms field remains the primary location for reviewing and editing the final transaction terms

#### Scenario: Viewing an existing transaction in read-only mode
- **WHEN** a user opens a supported transaction in read-only mode
- **THEN** the UI shows the saved transaction terms text as the authoritative transaction record
- **AND** the screen does not imply that the displayed terms are being read live from the template master
