## Context

The current stock model splits operational inventory across `stock` and `legacyStock`, with runtime routing based on location names such as `old`. That split no longer reflects actual behavior because stock transfer already allows legacy-style and new-style stock rows to coexist in the main `stock` table. At the same time, opening stock, stock adjustment, and related stock-entry flows currently use item barcode-generation semantics to influence row behavior even though stock-entry visibility and required dimensions should be controlled by stock-maintenance settings.

Opening stock is also evolving from a pure import screen into a legacy-stock intake surface. Users need to resolve stock rows against legacy items when possible and create missing legacy items and supporting master data when needed. For historical stock that already carries an older barcode, the system now needs a controlled legacy-item path rather than forcing that stock into the future-facing canonical variant model.

This change governs stock-writing and stock-assisted workflows. Pre-fulfillment sales-document shape is governed separately by the catalog-driven sales authority model.

Within stock-writing flows, Purchase Inward and Opening Stock serve different intake roles. Purchase Inward is the normal operational path for new stock that follows the current item-master and canonical barcode-generation rules, and it is the path where new canonical barcodes are printed for inwarded stock. Opening Stock is the transition and compatibility path for bringing pre-existing stock into the unified model, including legacy or otherwise coarse barcode labels that may not encode the same granularity as new canonical barcodes.

## Goals / Non-Goals

**Goals:**
- Move active stock writes and reads to a single `stock` table.
- Remove location-name-driven legacy routing from runtime stock behavior.
- Introduce a constrained legacy-item model so pre-existing sellable stock with historical barcodes does not distort the canonical item-master variant model.
- Use stock-maintenance settings as the only source of truth for stock-entry field visibility and required dimensions.
- Keep item control-panel barcode-generation settings focused on new barcode definitions and item variant structure.
- Support opening-stock hydration of legacy items and any supporting master data needed to save valid legacy stock rows.
- Allow barcode-assisted workflows to prefill known stock dimensions and prompt users for missing required dimensions when stock maintenance is more granular than barcode resolution.

**Non-Goals:**
- Do not introduce a legacy barcode mode into item settings.
- Do not hydrate canonical barcode definitions from opening stock.
- Do not let legacy items grow canonical size/color granularity after creation.
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

Legacy or otherwise coarse barcodes SHALL be treated as compatibility lookup inputs for stock-assisted workflows rather than as canonical item-variant definitions. The system SHALL NOT rely on the current app-wide `barcodeGenerationMethod` to infer how a historical barcode was generated or what granularity it encoded.

Opening-stock validation SHALL NOT enforce a one-barcode-per-combination uniqueness rule when imported stock rows represent legacy or otherwise coarse barcode values that are less specific than current stock-maintenance settings.

Why:
- Operational workflows care about obtaining a valid stock row, not about lineage.
- This keeps the transition model simple and avoids adding legacy barcode options to item settings.
- Historical barcodes can follow mixed or unknown conventions, so inference from today's configured generation method is not trustworthy enough to act as a catalog-definition rule.

Alternative considered:
- Persist explicit provenance or barcode-generation markers on every stock row. Rejected for now because the business concern is compatibility, not audit provenance.
- Infer the semantic granularity of every historical barcode from the current barcode-generation setting. Rejected because global configuration is forward-looking and cannot safely reverse-engineer mixed historical barcode conventions.

### Introduce legacy items as a constrained stop-gap item class
Opening Stock SHALL be the only workflow that can create a legacy item. A legacy item represents sellable stock that already carries a historical barcode and therefore should remain separate from the canonical item-master variant model. Legacy items SHALL remain non-variant forever, SHALL be editable only for correction of flat master data, and SHALL use exactly one `ItemPriceList` row with `sizeId = null` and `colorId = null`.

The historical barcode stored on that single `ItemPriceList` row SHALL be the machine identity of the legacy item. The human-facing `Item.name` SHALL remain searchable and SHALL be globally unique across items so that users can reliably identify items in non-POS flows.

Why:
- This isolates historical sellable stock from the future-facing canonical item model instead of forcing one item identity to straddle two barcode eras.
- Reusing a single `ItemPriceList` row keeps pricing and transaction logic aligned with the existing schema while still exposing a simple legacy-item UI.
- Global item-name uniqueness matches the way users currently search by item name in non-POS flows.

Alternative considered:
- Continue treating historical barcodes as compatibility-only lookups inside the canonical item model. Rejected because mixed old/new granularity on the same item identity keeps spilling complexity into item master, sales entry, and fulfillment rules.
- Create a separate legacy pricing schema. Rejected because a single flat `ItemPriceList` row already models the required behavior without adding another pricing system.

### Use Item Master as the legacy-item correction surface
Legacy items SHALL continue to be edited through Item Master rather than through a separate dedicated master screen. Item Master SHALL switch to a simplified legacy-item edit mode for those records.

Why:
- This preserves one familiar item-maintenance entry point while still enforcing the flat legacy-item contract.

Alternative considered:
- Create a separate legacy-item master. Rejected because it adds another maintenance surface without changing the underlying flat legacy-item model.

### Limit opening-stock hydration to legacy items and standalone masters
Opening stock SHALL hydrate only legacy items plus any standalone size and color master records needed to satisfy stock-entry requirements. It SHALL NOT create or mutate canonical barcode definitions or canonical sellable association data that is currently encoded through `ItemPriceList`.

Why:
- This keeps Opening Stock tightly scoped to the drain-down compatibility workflow instead of turning it into a second canonical item-onboarding path.
- In the current data model, size and color availability for downstream sales screens is derived from `ItemPriceList`, so auto-creating associations would immediately behave like adding sellable catalog variants.

Alternative considered:
- Allow opening stock to create or hydrate canonical items. Rejected because new stock should enter through canonical item and inward workflows, not through the legacy-stock intake path.

### Distinguish legacy-stock intake from new-stock intake
Opening stock SHALL remain the compatibility intake path for pre-existing stock, including stock identified by historical or coarse barcode labels. Purchase Inward SHALL remain the normal intake path for newly received stock that follows current item-master and canonical barcode-generation behavior, including the printing of new canonical barcode labels.

Why:
- The system needs one path that can absorb historical stock without forcing it into current canonical barcode semantics.
- The system also needs a clean operational inward path for new stock that does follow current item-master structure and is eligible for canonical barcode printing.

Alternative considered:
- Treat Opening Stock and Purchase Inward as interchangeable stock-intake surfaces. Rejected because the transition workflow for legacy stock has different barcode and hydration requirements than routine inwarding of new stock.
- Allow Purchase Inward to accept historical or coarse legacy barcode stock while also acting as the canonical barcode-printing path. Rejected because it would blur compatibility onboarding with the workflow that formalizes new stock under the current barcode regime.

### Keep stock granularity-aware rather than legacy-aware
Operational stock rows SHALL continue to store whatever dimensions stock-maintenance controls require, without adding a first-class legacy flag to the stock schema. Legacy-versus-canonical behavior SHALL be determined by the resolved item identity rather than by a separate stock-level legacy mode, and lower item granularity SHALL NOT prevent finer stock granularity where stock-maintenance rules require it.

Why:
- This keeps stock-keeping neutral and focused on required granularity rather than on barcode era.
- Separate legacy item identity is sufficient to distinguish historical stock from canonical stock without introducing another stock-state axis.

Alternative considered:
- Add stock-level legacy flags as an operational invariant. Rejected because item identity plus barcode pairing already separates the two worlds, and a stock-level legacy mode would duplicate business meaning.

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
- [Legacy items could become a second permanent item system] → Restrict creation to Opening Stock, keep the UI deliberately simple, and require users to manage retirement through item active status rather than expanding legacy behavior.
- [Legacy-specific reports may depend on current table split] → Cut over reads in stages and validate report parity before retiring `legacyStock`.
- [Automatic master creation can create duplicates] → Normalize size/color values before create, reuse in-session creations, and require explicit confirmation in bulk flows.
- [Legacy item naming could drift from barcode identity] → Enforce global item-name uniqueness plus one-to-one pairing between legacy item name and legacy barcode.
- [Inactive items could linger as sellable or inwardable records] → Block inactive items from sales selection and from inward/opening flows when the item already exists.
- [Bulk import hydration could overwhelm users with too many prompts] → Use a batch review-and-approve step for missing item/size/color masters instead of row-by-row confirmation.
- [Removing location-name routing can surface hidden assumptions] → Replace runtime routing incrementally and keep temporary reconciliation checks during migration.
- [Opening stock could become too heavy as a workflow] → Keep hydration focused on structural fields and associations, and defer barcode/price-list editing to dedicated item-master screens.
- [Stock adjustment could create invalid negative inventory for brand-new combinations] → Allow new size or size-color combinations to be introduced only by positive adjustments and require existing combinations for negative adjustments.

## Migration Plan

1. Add runtime support for unified stock reads and writes against `stock` only, while keeping compatibility reads from `legacyStock`.
2. Update stock-entry behavior so visibility and required dimensions come from stock-maintenance controls, not item barcode-generation mode.
3. Implement opening-stock hydration for item, size, and color master resolution only.
4. Change opening stock, stock adjustment, and stock transfer to write only to `stock`.
5. Backfill active `legacyStock` rows into `stock` and verify report and lookup parity.
6. Remove `legacyStock` reads from application flows and retire location-name-based legacy routing.
7. Decommission `legacyStock` after reconciliation and a rollback window.

Rollback strategy:
- Keep `legacyStock` intact until unified reads/writes and migrated `stock` data are validated.
- During rollout, retain a feature-flag or staged deployment point where reads can still include `legacyStock` if parity issues are found.

## Open Questions

- Is there any report or reconciliation flow outside the inspected services that still requires `legacyStock` as a separate source of truth?
