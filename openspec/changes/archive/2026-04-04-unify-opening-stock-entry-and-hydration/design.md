## Context

Opening Stock already derives much of its stock-row schema from Stock Control, but the user experience still treats spreadsheet import and manual entry as separate top-level surfaces. That separation made early sense when import review and manual row editing followed different flows, but it now clashes with three product realities:

- Opening Stock is a stock-writing screen whose row schema must stay aligned with Stock Control.
- Opening Stock is also the allowed creation path for legacy items, so the workflow must reuse row data to hydrate valid legacy-item records without forcing users into Item Master mid-flow.
- Users may mix imported rows and manually added rows in the same working batch, which makes origin-specific master-creation timing difficult to understand.

The existing specs already cover dynamic stock fields, template generation, legacy-item hydration, and import-time color review, but they still leave the top-level workspace model fragmented. This change keeps those capabilities but re-centers them around one table workspace and one hydration-review flow.

## Goals / Non-Goals

**Goals:**
- Present Opening Stock as one editable row workspace rather than separate final entry surfaces.
- Use one shared row contract for manual entry, import parsing, template generation, validation, and save mapping.
- Minimize duplicate entry by reusing row `item name`, `item code`, and `price` for legacy-item hydration.
- Make mixed-origin batches behave consistently by resolving missing masters through one table-level review flow.
- Preserve Stock Control as the authority for stock-writing fields and requiredness.

**Non-Goals:**
- Redesign non-Opening-Stock stock-writing screens in this change.
- Add new database columns or change legacy-item persistence shape beyond reuse of existing fields.
- Turn Opening Stock into a full Item Master replacement for legacy maintenance.
- Expand the Opening Stock import template into a generalized item-master migration file.

## Decisions

### Use one Opening Stock table workspace for all row ingestion
Opening Stock SHALL render one editable table that serves as the working batch surface. Manual row creation and bulk import are row-ingestion actions into that table, not separate destination surfaces.

Why:
- It matches the user's mental model of building one pending opening-stock batch.
- It removes duplicated concepts between manual entry and import review.
- It makes row status, save behavior, and hydration review easier to reason about.

Alternative considered:
- Keep separate manual and import surfaces but align their field definitions. Rejected because it preserves the same mode split that causes mixed-batch ambiguity.

### Define one shared row contract and use it everywhere
The Opening Stock workspace SHALL compute one ordered row contract from Stock Control plus fixed operational row fields. That contract SHALL drive table columns, manual row defaults, import header matching, downloadable template headers, validation, and save payload mapping.

Why:
- It prevents drift between the table, parser, and template.
- It gives one place to express which values are stock-writing requirements.

Alternative considered:
- Keep separate import and manual schema helpers with shared utility fragments. Rejected because it still leaves room for behavioral drift and split ownership.

### Reuse row values for legacy-item hydration
Opening Stock SHALL treat `item code` as both the legacy item code and the legacy barcode identity, and SHALL treat row `price` as the legacy item's flat sales price when creating or enriching a legacy item.

Why:
- These values already appear naturally in stock capture and do not need to be requested twice.
- Reuse reduces friction without expanding the import contract with item-only fields.

Alternative considered:
- Keep separate item-hydration fields for code, barcode, and sales price. Rejected because it duplicates user input and creates avoidable mismatch between stock rows and legacy-item creation.

### Resolve missing masters through one table-level hydration review on save
Once rows are present in the unified Opening Stock table, missing item, size, and color masters SHALL be collected into one pending review set for the whole batch regardless of whether a row was imported or added manually. The workflow MAY detect pending masters inline while editing, but confirmation and creation SHALL happen only when the user attempts to save through the shared table-level review flow.

Why:
- Mixed-origin batches need one predictable creation model.
- Shared review enables deduplication, grouped conflict handling, and clearer row state.

Alternative considered:
- Keep immediate inline creation for manual rows and deferred batch creation for imported rows. Rejected because rows in the same visible table would obey different timing rules that are hard for users to predict.

### Drop row-origin distinctions after ingestion
Once rows have been loaded into the Opening Stock table, the UI SHALL treat imported rows and manually added rows as the same working-batch rows rather than preserving origin as a first-class workflow distinction.

Why:
- Bulk import is a convenience for loading rows, not a separate business flow.
- Hiding origin keeps the user's mental model centered on one stock batch instead of two row classes.

Alternative considered:
- Preserve imported/manual badges or origin-specific controls after ingestion. Rejected because that would keep bulk import feeling like a parallel surface rather than a convenience entry method.

### Keep color-code completion inside the shared review flow
Missing colors that require codes SHALL continue to block creation until valid codes are supplied, but that requirement SHALL now live inside the shared hydration review flow rather than inside an import-only branch.

Why:
- It preserves the stricter color-master rules already established.
- It keeps mixed batches consistent when a user manually adds a row with a new color after importing other rows.

Alternative considered:
- Restrict color-code completion to import-only review and allow immediate manual creation elsewhere. Rejected because it reintroduces origin-specific master behavior inside one table batch.

## Risks / Trade-offs

- [The unified table may feel heavier than the previous manual-entry flow] -> Keep fast row addition and inline editing, while using row states and a save-triggered review flow instead of constant modal interruption.
- [Users may expect immediate creation when typing a new manual value] -> Show clear pending-review status on affected rows so the deferred save-time behavior remains visible.
- [Template expectations may drift if the row contract is not centralized] -> Generate template headers directly from the same contract used by the table and parser.
- [Legacy-item hydration may still leak Item Master concerns into Opening Stock] -> Limit reuse to `item name`, `item code`, and `price`, and keep broader item maintenance out of scope.

## Migration Plan

1. Introduce or adapt a shared Opening Stock row-contract helper that produces unified table columns and template headers.
2. Replace top-level manual/import surface switching with one table workspace and ingestion controls.
3. Route imported rows and manual rows into the same row state model.
4. Move missing-master detection into a shared pending-review collector for the whole table batch.
5. Reuse row `item code` and `price` during legacy-item hydration and keep color-code completion inside the unified review flow.
6. Validate the template, row states, and save path against mixed imported/manual batches.

Rollback strategy:
- Restore the separate manual/import surfaces while retaining the shared field helper if the unified table introduces unacceptable workflow regressions.
- No data migration rollback is required because the change reuses existing persistence fields.

## Open Questions

- None at this stage.
