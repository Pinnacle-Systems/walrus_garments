## Context

The recent opening-stock hydration work introduced a batch review step for missing items, sizes, and colors so bulk import could remain fast while still surfacing structural master-data creation. That approach works well for sizes because size master creation only needs the imported size value. It does not cleanly work for colors because the product still treats color codes as intentional master data, while the opening-stock import file only supplies a color name.

The current implementation drifts into an unsafe middle ground by assuming a color code can be derived or reused implicitly during batch creation. That weakens the operator-controlled Color Master workflow and creates a risk of low-quality or misleading color codes entering the system unnoticed.

## Goals / Non-Goals

**Goals:**
- Preserve the bulk-import review pattern for missing masters instead of falling back to row-by-row prompts.
- Require explicit user completion of missing color codes before bulk creation of new colors during opening-stock import.
- Continue allowing one-step batch confirmation after the user completes the required color metadata.
- Keep size and item handling lightweight where no extra metadata is needed.

**Non-Goals:**
- Redesign the standalone Color Master screen.
- Add color-code columns to the uploaded opening-stock file format for this change.
- Relax product expectations so bulk import may silently create colors with guessed or placeholder codes.

## Decisions

### Use a batch completion step for missing colors
Opening-stock bulk import should still detect and group missing colors during review, but colors should move from a plain confirmation list to a completion list. Each missing color should show its imported name together with an editable required code field.

Why:
- Users already need visibility into missing masters.
- Color code is a required operator decision that cannot be inferred reliably from the file.

Alternative considered:
- Continue blind batch creation using `code = name`. Rejected because it encodes a guess as master data.

### Keep one-click handling for missing sizes and ordinary missing items
The review flow should continue to summarize missing sizes and any item records that can be created from already approved fields without extra operator input. Only colors should require extra completion input in the batch review step.

Why:
- It keeps the workflow fast where the system has enough information.
- It prevents color-specific data requirements from making every missing-master type heavier.

Alternative considered:
- Turn all missing masters into editable review grids. Rejected because it adds needless complexity to sizes and ordinary item creation.

### Block final batch creation until all missing color codes are valid
The import workflow should not create any reviewed colors until every missing color row has a non-empty valid code and there are no duplicate codes within the pending batch or against existing color master records.

Why:
- Batch creation should remain deterministic and safe.
- Users need immediate feedback before the save step, not partial creation followed by cleanup.

Alternative considered:
- Create valid colors and leave invalid ones unresolved. Rejected because it produces mixed outcomes from one review action and makes retry behavior harder to understand.

### Keep quick-add/manual color creation behavior out of scope unless needed for parity
This change is about the bulk-import review path. Manual or row-level quick-add color flows may be revisited later if the product wants uniform code capture everywhere, but they should not block this narrower correction unless current service validation makes parity unavoidable.

Why:
- The reported design gap is specific to bulk import.
- A focused fix lowers implementation risk.

Alternative considered:
- Expand the change to all color-creation entry points immediately. Rejected for now because it broadens scope before the bulk-import rule is settled.

## Risks / Trade-offs

- [The review step becomes heavier for imports with many missing colors] -> Keep the grid compact and batch-oriented instead of spawning per-row dialogs.
- [Users may enter duplicate or low-quality codes] -> Validate codes before batch create and surface row-level errors inline.
- [Quick-add color creation may still differ from bulk import behavior] -> Treat this as an explicit follow-up decision rather than silently coupling the flows now.
- [Item creation may also need more required fields later] -> Keep this decision isolated to color-specific metadata required today.

## Implementation Outline

1. Detect missing colors during opening-stock import as before, but build a pending color-review list with `name` and editable `code`.
2. Replace the current yes/no missing-master confirmation with a compact batch review modal or panel that:
   - shows missing items and sizes as summaries
   - shows missing colors in an editable list
   - validates required codes and duplicate conditions
3. Create missing colors only after the review list is complete and confirmed.
4. Continue mapping the newly created color ids back onto stock rows and proceed with stock save.

## Open Questions

- Should bulk-import color review also capture optional `pantone` now, or should the workflow remain limited to the minimum required `code` field?
- Should quick-add color creation be aligned in the same change if the service layer starts enforcing `code` for all color creates?
