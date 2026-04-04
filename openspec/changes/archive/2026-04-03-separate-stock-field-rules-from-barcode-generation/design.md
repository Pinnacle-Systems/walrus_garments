## Context

The codebase currently contains two different kinds of configuration that both touch item dimensions:

- Stock Control Panel, surfaced through stock-maintenance settings such as `itemWise`, `sizeWise`, and `sizeColorWise`
- Item barcode-generation configuration, surfaced through helpers such as `resolveBarcodeGenerationMethod(...)`, `getItemBarcodeGenerationMethod(...)`, and local `effectiveBarcodeGenerationMethod` variables

The intended product rule is:

```text
Stock Control Panel:
  decides whether Size / Color are present and required in stock-entry style screens

Item barcode-generation settings:
  decide how item variants, price lookup, and barcode lookup behave
```

The original phrasing of this rule was too broad when read as applying to every transaction screen. The intended scope is stock-writing and stock-assisted operational workflows, not pre-fulfillment sales documents such as Quotation and Sale Order.

That boundary is already followed in parts of Opening Stock and Stock Adjustment, but not everywhere. In particular, some shared helpers and quick-add flows still use barcode-generation mode in ways that shape field behavior rather than variant behavior.

## Goals / Non-Goals

**Goals:**
- Make Stock Control Panel the only runtime authority for stock-writing and stock-assisted operational field presence/requiredness.
- Preserve barcode-generation mode for variant-aware operations such as barcode lookup, price lookup, and valid size/color combination resolution.
- Remove ambiguous logic paths where barcode-generation mode implicitly changes whether a field is treated as part of the transaction schema.
- Keep the behavior consistent across stock-entry and stock-assisted operational surfaces without leaking the rule into catalog-driven sales documents.

**Non-Goals:**
- Redesign Item Master itself.
- Remove variant-aware filtering of valid size/color combinations when an item already has structured variant data.
- Change the underlying item price-list or barcode data model in this change.

## Decisions

### Use Stock Control Panel as the only source of field schema for stock-writing and stock-assisted operational screens
All runtime stock-writing and stock-assisted operational screens must derive field presence and requiredness for item dimensions from Stock Control Panel configuration, not from item-level barcode-generation mode.

This includes decisions such as:
- whether a `Size` column exists
- whether a `Color` column exists
- whether `sizeId` or `colorId` are mandatory for save

Why:
- These are operational capture rules, not barcode-structure rules.
- It keeps the UI schema stable and centrally explainable.
- It ensures every persisted stock row carries the complete stock key defined by stock-maintenance policy.

Alternative considered:
- Continue letting barcode-generation mode imply required dimensions. Rejected because it mixes master-data semantics with transaction-capture policy.

Catalog-driven sales documents such as Quotation and Sale Order are out of scope for this visible-column rule because they follow item-master-driven document shape instead.

### Require complete stock-tracking fields before stock writes
Any runtime surface that writes rows to the `Stock` table SHALL require every dimension enabled by Stock Control Panel to be populated before save. A workflow may begin with partial data from barcode lookup, import, or user entry, but it must progressively collect the missing tracked fields before persisting the stock row.

Why:
- The stock table should store complete operational stock identities, not partially resolved rows.
- This preserves a clean separation where Stock Control defines the stock key and barcode behavior only helps resolution.

Alternative considered:
- Allow stock-writing surfaces to save rows with missing tracked dimensions and rely on downstream interpretation. Rejected because it creates ambiguous inventory rows and weakens reporting and reconciliation.

### Shared barcodes do not invalidate stock rows by themselves
Stock-writing surfaces SHALL treat barcode values as operational stock-row data or lookup aids, not as canonical uniqueness keys for stock combinations. When stock-maintenance settings require more dimensions than a barcode can resolve, multiple stock rows may legitimately share the same barcode as long as the required tracked fields are completed before save.

Why:
- Legacy or coarse barcodes can still support valid stock capture under finer-grained stock-maintenance rules.
- Canonical barcode uniqueness belongs to item/barcode-definition workflows, not operational stock-row validation.

Alternative considered:
- Enforce one-barcode-per-stock-combination on every stock-writing surface. Rejected because it leaks item-master barcode policy into stock-entry behavior and blocks legitimate transitional stock capture.

### Treat barcode-generation mode as variant behavior, not field-schema behavior
Barcode-generation mode may still affect:
- price lookup from `ItemPriceList`
- barcode lookup and prefill behavior
- which size/color combinations are valid for a selected item

It must not affect:
- whether a field appears
- whether a field is marked required
- whether a transaction row conceptually captures size/color at all

Why:
- This preserves the useful variant semantics without letting them leak into transaction schema rules.

Alternative considered:
- Remove all barcode-generation branching from runtime entry screens. Rejected because price/barcode resolution still depends on variant structure.

### Reframe variant option filtering as data validity, not field authority
Shared helpers that filter size/color choices for a selected item should be treated as variant-validity helpers, not as sources of truth for field schema.

This means:
- the screen first decides from Stock Control Panel whether `Size` or `Color` exists
- only then may item variant data narrow the available option set

Why:
- It cleanly separates “field exists” from “which values are valid.”

Alternative considered:
- Leave current helper behavior unchanged and rely on naming/documentation. Rejected because the current branching makes intent easy to misread and easy to extend incorrectly later.

### Align quick-add flows with the same authority boundary
Quick-add item modals used from stock/transaction flows may use barcode-generation mode to construct item price-list rows, but they should not be treated as deciding the field schema of the parent stock-entry screen.

Why:
- The quick-add modal is an item-structure editor embedded in an operational flow.
- Its barcode-generation decisions should stay scoped to created item structure, not leak back into transaction capture rules.

Alternative considered:
- Keep quick-add modals out of scope. Rejected because they are one of the main places where the mixed intent currently appears.

## Risks / Trade-offs

- [Some existing helper behavior may appear “mostly correct” today] -> Make the authority boundary explicit anyway so future changes do not keep encoding the wrong source of truth.
- [Variant filtering may still look similar after refactor] -> Rename and document the helpers so their role is clearly about valid combinations, not field existence.
- [Quick-add item modals may still need barcode-mode branching internally] -> Keep that branching, but constrain it to item-structure editing and save payload construction.
- [Different transaction modules may have drifted implementations] -> Audit and normalize the shared helpers first, then update each consumer screen against the same rule.

## Implementation Outline

1. Identify all stock-writing and stock-assisted operational screens that currently use Stock Control Panel versus item barcode-generation helpers.
2. Update shared helper semantics so they no longer imply field presence/requiredness from item barcode mode.
3. Refactor affected screens to:
   - derive field presence and requiredness from Stock Control Panel
   - use item variant data only for valid option filtering and price/barcode resolution
4. Verify that stock-entry and stock-assisted operational screens behave consistently across opening stock, stock adjustment, inward, and fulfillment-oriented flows.

## Open Questions

- Should shared helper names be changed to make the new boundary more obvious, or is internal documentation enough?
- Should quick-add item modals continue to receive a barcode-generation mode prop from parent screens, or should they resolve it locally from Item Control Panel to reduce coupling?
