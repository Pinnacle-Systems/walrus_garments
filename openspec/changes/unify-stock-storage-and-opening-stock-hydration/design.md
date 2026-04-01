## Context

The current stock model splits operational inventory across `stock` and `legacyStock`, with runtime routing based on location names such as `old`. That split no longer reflects actual behavior because stock transfer already allows legacy-style and new-style stock rows to coexist in the main `stock` table. At the same time, opening stock, stock adjustment, and related stock-entry flows currently use item barcode-generation semantics to influence row behavior even though stock-entry visibility and required dimensions should be controlled by stock-maintenance settings.

Opening stock is also evolving from a pure import screen into a stock-row hydration surface. Users need to resolve stock rows against existing items when possible, create missing item/size/color master records when needed, and link size/color associations that match current barcode-generation semantics, while intentionally avoiding canonical barcode-definition or price-list hydration. The approved core item fields for this hydration flow are `item name` and the structural variant fields required by the effective barcode-generation mode: `size` for `SIZE`, `size` and `color` for `SIZE_COLOR`, and neither `size` nor `color` for `STANDARD`.

## Goals / Non-Goals

**Goals:**
- Move active stock writes and reads to a single `stock` table.
- Remove location-name-driven legacy routing from runtime stock behavior.
- Use stock-maintenance settings as the only source of truth for stock-entry field visibility and required dimensions.
- Keep item control-panel barcode-generation settings focused on new barcode definitions and item variant structure.
- Support opening-stock hydration of core item fields, missing size/color masters, and size/color associations needed to save valid stock rows.
- Allow barcode-assisted workflows to prefill known stock dimensions and prompt users for missing required dimensions when stock maintenance is more granular than barcode resolution.

**Non-Goals:**
- Do not introduce a legacy barcode mode into item settings.
- Do not hydrate canonical barcode definitions from opening stock.
- Do not hydrate item price lists from opening stock.
- Do not require a bulk relabeling of existing stock before rollout.

## Decisions

### Use one operational stock table
All new operational stock writes SHALL target `stock`, including opening stock, stock adjustment, and stock transfer. Existing `legacyStock` rows will be migrated into `stock` during rollout, and `legacyStock` will remain only as a temporary migration source until reads are fully cut over.

Why:
- Stock transfer already undermines strict table separation by writing legacy-style and new-style stock into the same operational flow.
- A single table lets barcode resolution and stock-entry behavior focus on row data rather than table identity.

Alternative considered:
- Keep `legacyStock` as a long-lived staging table. Rejected because it duplicates runtime logic without preserving a meaningful domain boundary once mixed stock is already allowed in `stock`.

### Separate barcode-generation semantics from stock-entry granularity
`barcodeGenerationMethod` in item settings SHALL govern only canonical barcode definitions and the size/color association structure expected for new item variants. Stock-entry screens SHALL use stock-maintenance controls to decide which dimensions are visible and required.

Why:
- Barcode behavior and stock-capture behavior solve different problems.
- Stock may need more granular capture than the barcode can resolve, especially during the transition from older stock.

Alternative considered:
- Use barcode-generation settings to drive stock-entry columns. Rejected because it couples future barcode policy to current stock-capture needs and blocks legitimate color capture for legacy or coarse barcodes.

### Treat barcode lookup as stock-row prefill, not generation detection
Barcode-assisted flows SHALL first try to resolve a usable stock-row snapshot and then prompt for any dimensions still required by stock-maintenance settings. The system does not need to classify a barcode as legacy or new as a first-class concept during runtime if it can resolve the row and complete missing dimensions.

Why:
- Operational workflows care about obtaining a valid stock row, not about lineage.
- This keeps the transition model simple and avoids adding legacy barcode options to item settings.

Alternative considered:
- Persist explicit provenance or barcode-generation markers on every stock row. Rejected for now because the business concern is compatibility, not audit provenance.

### Limit opening-stock hydration to structural master data
Opening stock SHALL be allowed to hydrate only `item name` and the structural variant fields required by the effective barcode-generation mode. It may create missing size and color master records and create item size/color associations required by the configured barcode-generation semantics. It SHALL NOT create or mutate canonical barcode definitions or item price-list rows.

Why:
- This gives users a practical one-screen way to resolve imported stock while avoiding unintended commercial master-data changes.

Alternative considered:
- Allow opening stock to fully hydrate item price/barcode definitions. Rejected because imported stock rows are transitional and should not silently become canonical future barcode or pricing policy.

### Use batch review for bulk opening-stock hydration
Bulk opening-stock import SHALL collect all missing items, sizes, and colors first, present them in a review step, and create them only after a single user confirmation for the batch. The import flow SHALL NOT force row-by-row intervention for each missing master record.

Why:
- Batch review gives users visibility into what structural master data will be created.
- It avoids the risk of silent bulk master creation while keeping the workflow faster than row-by-row prompts.

Alternative considered:
- Auto-create all missing masters after a generic confirmation. Rejected because it gives users too little visibility into what will be added.
- Prompt row by row for every missing master. Rejected because it makes bulk import too slow and fragile.

### Use progressive completion when barcode resolution is less specific than stock maintenance
When barcode input identifies fewer dimensions than stock maintenance requires, the UI SHALL prompt the user for only the missing dimensions before allowing save.

Why:
- This supports granular stock capture even when older barcodes are less specific than current stock-maintenance rules.

Alternative considered:
- Enforce that barcode granularity must be at least as specific as stock granularity. Rejected because it would force unnecessary relabeling and reduce backward compatibility during transition.

### Restrict creation of new combinations through stock adjustment
Stock adjustment MAY be used to introduce a newly tracked size or size-color combination for an existing item, but only through a positive adjustment. Negative adjustments SHALL require the adjusted combination to already exist in stock and SHALL NOT create a brand-new tracked combination as a side effect.

Why:
- Negative adjustments on a never-before-seen combination create confusing inventory history and hidden negative starting states.
- Positive adjustments align with the operational meaning of introducing or correcting inventory into the system.

Alternative considered:
- Allow both positive and negative adjustments to create new combinations. Rejected because it weakens data integrity and makes inventory history harder to reason about.

### Use a lighter phase-1 hydration UX for stock adjustment
Stock adjustment SHALL follow the same stock-dimension and combination-introduction rules as opening stock, but phase 1 SHALL implement them with lightweight inline completion and validation on the adjustment row rather than the fuller hydration workflow used by opening stock. Stock adjustment remains an existing-item operational screen and SHALL NOT become a full item-onboarding surface in phase 1.

Why:
- This keeps domain rules consistent across stock-entry surfaces.
- It limits implementation scope and preserves the faster operational feel expected from stock adjustment.

Alternative considered:
- Reuse the full opening-stock hydration UX in stock adjustment. Rejected for phase 1 because it adds unnecessary interaction weight to a correction-oriented screen.

## Risks / Trade-offs

- [Mixed old and new barcode semantics may still exist in one table] → Keep barcode-assisted flows row-oriented and require completion of missing dimensions before save.
- [Legacy-specific reports may depend on current table split] → Cut over reads in stages and validate report parity before retiring `legacyStock`.
- [Automatic master creation can create duplicates] → Normalize size/color values before create, reuse in-session creations, and require explicit confirmation in bulk flows.
- [Bulk import hydration could overwhelm users with too many prompts] → Use a batch review-and-approve step for missing item/size/color masters instead of row-by-row confirmation.
- [Removing location-name routing can surface hidden assumptions] → Replace runtime routing incrementally and keep temporary reconciliation checks during migration.
- [Opening stock could become too heavy as a workflow] → Keep hydration focused on structural fields and associations, and defer barcode/price-list editing to dedicated item-master screens.
- [Stock adjustment could create invalid negative inventory for brand-new combinations] → Allow new size or size-color combinations to be introduced only by positive adjustments and require existing combinations for negative adjustments.

## Migration Plan

1. Add runtime support for unified stock reads and writes against `stock` only, while keeping compatibility reads from `legacyStock`.
2. Update stock-entry behavior so visibility and required dimensions come from stock-maintenance controls, not item barcode-generation mode.
3. Implement opening-stock hydration for item, size, color, and required size/color associations.
4. Change opening stock, stock adjustment, and stock transfer to write only to `stock`.
5. Backfill active `legacyStock` rows into `stock` and verify report and lookup parity.
6. Remove `legacyStock` reads from application flows and retire location-name-based legacy routing.
7. Decommission `legacyStock` after reconciliation and a rollback window.

Rollback strategy:
- Keep `legacyStock` intact until unified reads/writes and migrated `stock` data are validated.
- During rollout, retain a feature-flag or staged deployment point where reads can still include `legacyStock` if parity issues are found.

## Open Questions

- Is there any report or reconciliation flow outside the inspected services that still requires `legacyStock` as a separate source of truth?
