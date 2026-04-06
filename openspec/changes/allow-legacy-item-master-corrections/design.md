## Context

The current legacy-item model already separates two concerns:

- structural safety: legacy items stay flat and must not gain canonical variant structure
- correction usability: Item Master remains the place where users fix legacy master data after Opening Stock creates or hydrates those items

In practice, the current Item Master screen enforces structural safety partly through a broad `childRecord > 0` disablement rule. That broad lock also blocks flat corrections and stock-alert editing, even though those edits do not change the one-row legacy structure. The result is that the UI preserves the simplified legacy mode but prevents the very correction workflow the legacy-item spec approved.

## Goals / Non-Goals

**Goals:**
- Define which legacy-item fields remain editable in Item Master as flat corrections.
- Keep location-level stock-alert editing available for legacy items on their single `ItemPriceList` row.
- Preserve the invariant that legacy items always remain one flat null-size/null-color price row.
- Make the permission boundary implementable in the current Item Master screen without redesigning the broader item workflow.

**Non-Goals:**
- Allowing legacy items to grow into size-wise or size-color-wise sellable structures.
- Reclassifying existing legacy items into canonical items.
- Redesigning Opening Stock creation rules or legacy barcode identity rules.
- Broadly redefining all child-record locking behavior for canonical items.

## Decisions

### Treat approved legacy corrections separately from structure-changing edits

Legacy-item correction should not be blocked just because linked records exist. The presence of transactions or stock history protects structural identity, not every flat metadata field.

For legacy items, Item Master should continue to expose the simplified flat edit surface and should allow correction of approved flat fields such as:
- item name, alias name, item code, HSN, section, category, subcategory, active status, and approved dynamic flat fields
- the single-row flat pricing fields that remain part of the simplified legacy model
- location-level stock alerts tied to that single price row

The workflow must still block any action that would add size-wise or size-color-wise sellable rows, create extra `ItemPriceList` rows, or otherwise mutate the legacy item into canonical variant structure.

Alternatives considered:
- Keep the current blanket disablement once linked records exist.
  Rejected because it conflicts with the approved role of Item Master as the legacy correction surface.
- Remove all edit restrictions for legacy items.
  Rejected because structural protections still matter and the one-row legacy contract must remain enforced.

### Keep stock-alert editing within the simplified legacy surface

Legacy items use one flat `ItemPriceList` row. Because location-level stock alerts are attached to `ItemPriceList`, the simplified legacy surface should continue to expose stock-alert editing for that single row.

This does not create variant structure. It only updates location thresholds under the already-approved flat row and remains consistent with the location-level low-stock model.

Alternatives considered:
- Hide stock-alert editing whenever linked records exist.
  Rejected because stock-alert maintenance is part of flat operational correction and does not violate the legacy-item model.

### Do not treat current barcode-generation mode as permission to expand legacy structure

Even if current barcode-generation settings use `SIZE` or `SIZE_COLOR` for canonical items, legacy items remain a compatibility-oriented exception. The Item Master UI may continue to render legacy items in a simplified `STANDARD`-like surface, but that simplified surface must be editable for approved corrections.

Alternatives considered:
- Convert legacy items to the current canonical barcode-generation mode when edited.
  Rejected because archived specs explicitly keep legacy items flat forever.

## Risks / Trade-offs

- [Too many fields become editable and accidentally change structural identity] -> Limit this change to flat master fields, the single flat price row, and location-level stock alerts; keep size/color expansion controls unavailable.
- [Legacy and canonical edit rules diverge further] -> Keep the distinction explicit in spec and UI logic: this is a legacy compatibility exception, not a new general item-edit policy.
- [Existing tests only cover flat-vs-variant validation, not UI permissions] -> Add regression coverage around legacy edit enablement and stock-alert save behavior.

## Implementation Notes

Implementation should define an explicit legacy-correction allowlist rather than relying on a broad `childRecord > 0` disablement. In the current screen, that likely means:

1. preserve `readOnly` behavior for view mode
2. keep legacy items on the simplified single-row pricing surface
3. allow approved flat fields and location-level stock alerts in edit mode
4. keep size/color multiselects, row-generation actions, and any extra-row actions unavailable for legacy items

Backend validation already preserves the flat legacy contract and should remain the final safety net against variant expansion.

## Confirmed Decisions

- Legacy items remain non-variant forever and continue to use exactly one flat `ItemPriceList` row.
- Item Master remains the correction surface for legacy items after linked records exist.
- Linked records do not by themselves block approved flat-field corrections for legacy items.
- Linked records do not by themselves block location-level stock-alert editing for the single legacy price row.
- Variant-expansion controls remain unavailable for legacy items in Item Master.
