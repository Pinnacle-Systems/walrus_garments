## Why

The current sales-transaction footer exposes both a terms template selector and an editable terms text area, but the product intent is that the transaction should preserve only the final agreed text. Persisting the selected template id adds ambiguity once users customize the text, because the saved transaction can imply a template relationship that no longer reflects the final terms.

## What Changes

- Treat the terms template dropdown on supported transaction-entry screens as a prefill helper rather than persisted transaction state.
- Standardize the UX so selecting a template inserts or replaces draft terms text in the textarea, while the textarea remains the only source of truth saved on the transaction.
- Stop relying on stored `termId`-style values for supported transaction records and load existing transactions from their saved terms text instead of re-deriving terms from the template master.
- Clarify footer wording and interaction expectations so users understand that templates help compose terms but the edited text is what gets saved and printed.

## Capabilities

### New Capabilities
- `transaction-terms-prefill`: Defines how transaction terms templates behave as compose-time prefills while the saved transaction preserves only the final editable terms text.

### Modified Capabilities

## Impact

- Affected code is primarily in `client/src/Uniform/Components/**` sales transaction forms, the shared `CommonFormFooter`, and any related transaction save/load payload mapping for terms fields.
- API payloads and persistence may need to stop sending or depending on stored terms-template ids for the affected transaction flows.
- Existing transactions that already contain saved terms text should continue to load and display that text unchanged.
