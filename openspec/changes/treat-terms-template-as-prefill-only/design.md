## Context

Supported sales transaction screens currently expose a terms template dropdown alongside an editable terms text area in the shared footer. The intended business model is that the user can start from a reusable template but the transaction must preserve the final edited terms text as its own record. Persisting a template id on the transaction blurs that boundary once users customize the text, and it creates ambiguity about whether later reads should trust the stored text or the referenced template.

The change touches shared footer UX, per-screen save/load mapping, and the transaction data contract for the affected sales forms. That makes the persistence rule and the template-apply interaction worth documenting before implementation.

## Goals / Non-Goals

**Goals:**
- Make the template dropdown a compose-time helper that prefills terms text without becoming the persisted source of truth.
- Preserve only the final transaction terms text for supported screens so saved and printed content always reflects the transaction snapshot.
- Keep the template-application interaction understandable, especially when a user changes templates after entering custom text.
- Standardize the behavior across the shared sales footer instead of allowing each sales screen to drift.

**Non-Goals:**
- Redesign the overall transaction footer layout beyond the already standardized shared footer work.
- Introduce template versioning, audit history, or analytics on which template was used.
- Remove or redesign the terms template master itself.
- Change unrelated transaction footer fields such as remarks, totals, or print actions.

## Decisions

1. The transaction terms text is the only persisted business value for this feature.
Supported transactions will save and load only the final editable terms text. The selected template will not be treated as persisted transaction state.

Alternative considered: persist both the template id and the final terms text.
This was rejected because the saved template id becomes misleading when the user edits the text and provides little business value if reports, printouts, and later reads rely on the transaction snapshot anyway.

2. The template selector is a prefill control, not a data field.
The shared footer should present the dropdown as a helper that inserts template content into the terms textarea. The UI wording should reinforce that the user is applying a template to draft text rather than selecting a permanent classification for the transaction.

Alternative considered: keep the current presentation where the dropdown looks like part of the persisted footer data.
This was rejected because it encourages users to think both controls are primary saved fields and obscures which one matters after edits.

3. Template changes must not silently destroy user-entered text.
If the terms textarea is empty, applying a template can fill it directly. If the textarea already contains content, the system should require an explicit replace-style confirmation before overwriting the existing terms text. This keeps the compose-only model safe and understandable.

Alternative considered: always overwrite the textarea when a template is selected.
This was rejected because the user can lose customized text with a routine template change and the risk is amplified in dense transaction entry screens.

4. Existing transaction reads must come from the saved text snapshot.
When opening an existing transaction, the footer should display the transaction's saved terms text and should not attempt to reconstruct that text from a template master. If no saved template association remains, the template control can start empty until the user explicitly applies a template again in edit mode.

Alternative considered: infer or reconstruct the selected template from stored data or master lookups on read.
This was rejected because the system cannot reliably determine provenance once the saved text diverges and because the saved transaction text is the authoritative record.

5. The change should roll out through the shared footer and affected sales forms together.
The shared `CommonFormFooter` owns the terms interaction surface, while the transaction forms own save/load payload mapping. The rollout should update both layers together so the UX contract and persistence contract stay aligned.

Alternative considered: change payload persistence first and leave the current UI semantics for later.
This was rejected because it would leave the UI implying a persisted template link that no longer exists.

## Risks / Trade-offs

- [Users may miss which template was originally used] -> Accept this as part of the simpler, more truthful model where only final transaction text matters.
- [Users may accidentally replace custom text when applying a template] -> Require explicit overwrite confirmation whenever the textarea already contains content.
- [Some flows may still send or expect template ids] -> Audit the affected transaction forms and related service mappings together before shipping.
- [Editing an old transaction may show an empty template selector even though the terms came from a template long ago] -> Treat this as acceptable because the selector is compose-only helper state, not persisted transaction history.
- [Different transaction modules may have slightly different terms field names] -> Keep the shared interaction consistent while letting each screen map to its existing terms text field until a broader API cleanup is warranted.
