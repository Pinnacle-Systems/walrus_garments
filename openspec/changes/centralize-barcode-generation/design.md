## Context

The current item flow stores `priceMethod` on each item and uses that field to drive both barcode-generation behavior and item pricing structure. In practice, this lets users create different barcode patterns for different items, which conflicts with the product decision to choose one barcode-generation mode once in Control Panel before go-live.

This change touches the Prisma schema, item and item-control-panel services, the Item Settings UI, the Shocks Item Master UI, and downstream inventory screens that branch on `item.priceMethod`. Because the product is not live yet, we can simplify the model instead of carrying a backward-compatibility layer.

## Goals / Non-Goals

**Goals:**
- Introduce a single `barcodeGenerationMethod` setting on `ItemControlPanel`.
- Make Item Settings the only place where `STANDARD`, `SIZE`, or `SIZE_COLOR` is selected.
- Make Item Master and dependent inventory flows derive their behavior from the centralized method.
- Remove item-level persistence and runtime branching on `Item.priceMethod` before go-live.

**Non-Goals:**
- Supporting mixed barcode-generation modes across items within the same company.
- Preserving backward-compatible reads or writes for legacy item-level `priceMethod` data after the refactor lands.
- Redesigning barcode token composition beyond moving its controlling mode to the control panel.

## Decisions

### Use `ItemControlPanel.barcodeGenerationMethod` as the only source of truth

The control panel already stores company-level item configuration, so the barcode mode belongs there rather than on each item.

Alternatives considered:
- Keep `Item.priceMethod` and sync it from control panel.
  Rejected because it duplicates state and keeps the old ambiguity alive.
- Infer mode from each item's `ItemPriceList` shape.
  Rejected because UI and validation still need an explicit company-level rule.

### Remove the Item Master `Price Method` selector

The Item Master UI will read the control-panel value and render one of the existing layouts:
- `STANDARD`: single barcode, SKU, and sales-price inputs
- `SIZE`: size-driven item price rows
- `SIZE_COLOR`: size-and-color-driven item price rows

Alternatives considered:
- Keep the selector but disable edits.
  Rejected because it still suggests item-level choice exists.

### Refactor downstream consumers to read the centralized method

Screens such as opening stock, stock adjustment, quick-add flows, and barcode generation logic currently branch on `item.priceMethod`. Those paths should instead use the centralized control-panel setting, fetched once per screen or threaded through the existing item-control-panel queries.

Alternatives considered:
- Continue using `item.priceMethod` in downstream screens temporarily.
  Rejected because the product decision is to remove per-item mode entirely before go-live.

### Remove `Item.priceMethod` from schema and service writes in the same change

Since there is no production data to preserve, the cleanest migration is to stop writing the field, update all consumers, and then remove the column from the Prisma model and migration history forward path.

Alternatives considered:
- Two-step deprecation with a temporary unused column.
  Rejected because it adds code churn without helping a pre-go-live rollout.

## Risks / Trade-offs

- [Cross-screen regressions] -> Audit every `priceMethod` read and update each branch to the centralized setting before removing the field.
- [Item creation blocked when control-panel data is missing] -> Define a deterministic fallback or require Item Settings initialization before item workflows are used.
- [UI confusion during transition] -> Remove or rename all "Price Method" labels that actually mean barcode-generation mode.
- [Migration mismatch between frontend and backend] -> Land schema, API, and UI updates together and verify create/edit stock flows against each mode.

## Migration Plan

1. Add `barcodeGenerationMethod` to `ItemControlPanel` and expose it through create/get/update APIs.
2. Update Item Settings to edit the new field and stop using the old checkbox-based mode flags for barcode selection.
3. Refactor Item Master and dependent inventory screens to read the centralized setting.
4. Stop sending and reading `Item.priceMethod` in item APIs and frontend consumers.
5. Remove `priceMethod` from the `Item` Prisma model and add the corresponding schema migration.
6. Verify all three modes end-to-end before implementation is considered complete.

Rollback is only relevant before deployment of the full change; after the schema removal lands, rollback would require restoring the old column and UI paths.

## Open Questions

- Should `sizeWise` and `size_color_wise` remain in `ItemControlPanel` for any purpose, or should they be removed as part of this cleanup?
- Should the Item Settings label remain "Barcode Generation Method" everywhere, or do some downstream screens need a friendlier user-facing term?
- Do quick-add item modals need their own control-panel fetch, or should they receive the resolved barcode-generation mode from their parent screens?
