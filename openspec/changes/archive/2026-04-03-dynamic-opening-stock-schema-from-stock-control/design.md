## Context

Opening stock currently mixes a dynamic stock-control model with a fixed import/template model. The save-time rule now partially follows Stock Control for `size` and `color`, but the template headers, upload parser, review grid, sample row, and manual row-entry schema are still partly hard-coded. That leaves a gap for businesses that configure additional stock-tracking fields in Stock Control, because the opening-stock workflow cannot reliably prompt for, import, validate, or persist those configured fields.

The `Stock` table already supports `field1` through `field10`, and `StockReportControl` already stores additional configured stock fields through `field6` to `field10`. The missing piece is an application-level schema contract that turns the active Stock Control record into a single field definition used consistently across template generation, import parsing, grid rendering, validation, and save payload mapping.

## Goals / Non-Goals

**Goals:**
- Derive the opening-stock entry schema from Stock Control instead of fixed header constants.
- Ensure the download template, parser, review grid, validation, and payload all use the same active field definition.
- Apply that same schema to the manual opening-stock entry surface so opening stock behaves consistently regardless of entry path.
- Treat configured additional stock fields (`field6` to `field10`) as required stock-tracking fields when present.
- Preserve the existing separation where barcode behavior may prefill stock rows but does not define the schema.

**Non-Goals:**
- Redesign Stock Control UI itself.
- Change the database schema for `Stock` or `StockReportControl`.
- Expand this change to every stock-writing surface in one pass beyond the opening-stock contract it formalizes.

## Decisions

### Build one dynamic opening-stock field definition from Stock Control
Opening stock SHALL compute a single ordered field-definition list from the active Stock Control record and reuse that list everywhere in the import workflow.

That field definition includes:
- base fields that are always part of opening stock, such as barcode, price, qty, and UOM
- stock-tracked dimensions controlled by Stock Control, such as item, size, and color
- configured additional stock fields mapped from `field6` to `field10`

Why:
- It prevents the screen, template, parser, and validation from drifting apart.
- It gives one source of truth for requiredness and persistence mapping.

Alternative considered:
- Patch template generation, grid rendering, and validation separately. Rejected because it would recreate the current drift problem in a different form.

### Treat configured additional fields as required stock-tracking fields
If Stock Control configures any of `field6` to `field10`, opening stock SHALL render them and require them before save just like other tracked stock dimensions.

Why:
- These fields exist specifically so businesses can define additional stock data they must capture.
- Treating them as optional would undercut the purpose of configuring them in Stock Control.

Alternative considered:
- Render configured additional fields but leave them optional. Rejected because it makes the configured stock schema unenforceable and leaves stock rows incomplete.

### Keep template and parser headers human-readable but mapped to stock columns
The dynamic template SHALL use user-facing column labels derived from the active stock schema, while the import parser maps those labels back into the underlying stock row keys.

Why:
- Users need understandable spreadsheet headers.
- Persistence still needs stable mapping into `itemId`, `sizeId`, `colorId`, and `field6` to `field10`.

Alternative considered:
- Expose raw field keys such as `field6` in the template. Rejected because configured business labels are the point of those fields.

### Require save-time completeness, not immediate-entry completeness
The opening-stock workflow MAY start with partially populated rows from import or barcode-assisted resolution, but SHALL block save until every configured stock-tracking field is populated.

Why:
- It preserves usability for imported or coarse data.
- It keeps persisted stock rows consistent with the configured stock schema.

Alternative considered:
- Require every field to be present at initial import parsing time. Rejected because the current workflow already supports review, hydration, and completion before save.

## Risks / Trade-offs

- [Configured labels may change over time] -> Build the template and grid from the current active Stock Control record at runtime rather than caching old headers.
- [Dynamic columns make the import UI more complex] -> Centralize field metadata in one helper and keep rendering logic data-driven.
- [Existing files prepared from the older fixed template may stop matching] -> Make the new template explicit and update help text so the downloaded template always reflects the current required columns.
- [Additional fields may need different input types in the future] -> Start with text-based dynamic fields and leave richer field typing out of scope for this change.

## Migration Plan

1. Add a shared opening-stock field-definition helper derived from Stock Control.
2. Replace fixed template header generation with dynamic header generation from that helper.
3. Replace fixed import review-grid and manual-entry column rendering with dynamic rendering from the same helper.
4. Extend import parsing and validation to require configured additional stock fields.
5. Extend opening-stock save payload mapping so configured additional values persist into `Stock.field6` to `Stock.field10`.

Rollback strategy:
- Revert the opening-stock import workflow to the fixed-header implementation if dynamic-schema regressions are found.
- No database rollback is required because the change uses existing `Stock` columns.

## Open Questions

- Do businesses need custom ordering for configured additional fields beyond the current `field6` to `field10` order?
