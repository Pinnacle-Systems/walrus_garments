## Context

The current item flow stores `priceMethod` on each item and uses that field to drive both barcode-generation behavior and item pricing structure. In practice, this lets users create different barcode patterns for different items, which conflicts with the product decision to choose one barcode-generation mode once in Control Panel before go-live.

This change touches the Prisma schema, item and item-control-panel services, the Item Settings UI, the Shocks Item Master UI, and downstream inventory screens that branch on `item.priceMethod`. Because the product is not live yet, we can simplify the model instead of carrying a backward-compatibility layer.

## Goals / Non-Goals

**Goals:**
- Introduce a single `barcodeGenerationMethod` setting on `ItemControlPanel`.
- Make Item Settings the only place where `STANDARD`, `SIZE`, or `SIZE_COLOR` is selected.
- Make Item Master and dependent inventory flows derive their behavior from the centralized method.
- Remove item-level persistence and runtime branching on `Item.priceMethod` before go-live.
- Remove the legacy `sizeWise` and `size_color_wise` control-panel fields that currently approximate barcode mode.

**Non-Goals:**
- Supporting mixed barcode-generation modes across items within the same company.
- Preserving backward-compatible reads or writes for legacy item-level `priceMethod` data after the refactor lands.
- Redesigning barcode token composition beyond moving its controlling mode to the control panel.

## Decisions

### Use `ItemControlPanel.barcodeGenerationMethod` as the only source of truth

The control panel already stores company-level item configuration, so the barcode mode belongs there rather than on each item.

`barcodeGenerationMethod` is not an item property in the domain model. Downstream consumers may use a resolved effective mode internally when a screen or service needs item data and centralized mode together, but that resolved value is derived from `ItemControlPanel`, must not be treated as item-owned state, and must not be exposed as part of the item API payload.

Alternatives considered:
- Keep `Item.priceMethod` and sync it from control panel.
  Rejected because it duplicates state and keeps the old ambiguity alive.
- Attach `barcodeGenerationMethod` to the `Item` model as a replacement for `priceMethod`.
  Rejected because it would reintroduce the appearance of item-level ownership for a company-level setting.
- Infer mode from each item's `ItemPriceList` shape.
  Rejected because UI and validation still need an explicit company-level rule.

### Replace the control-panel booleans instead of keeping parallel mode flags

`sizeWise` and `size_color_wise` currently act as a second representation of barcode mode in Item Settings and Item Master. This change should replace those booleans with `barcodeGenerationMethod` rather than derive one from the other.

The Item Settings UI should preserve the visual language already used on the page. The new centralized control should look like the existing Item Settings form controls and headings rather than introducing a distinct visual treatment.

Alternatives considered:
- Keep `sizeWise` and `size_color_wise` for UI compatibility.
  Rejected because it preserves three overlapping representations of the same choice (`Item.priceMethod`, two booleans, and the new centralized field).
- Add `barcodeGenerationMethod` but continue calculating dropdown options from booleans.
  Rejected because it keeps transitional logic in the steady-state design and leaves room for impossible combinations.
- Redesign the Item Settings section while introducing the new control.
  Rejected because this change is about centralizing barcode-generation behavior, not refreshing the surrounding control-panel layout.

### Remove the Item Master `Price Method` selector

The Item Master UI will read the control-panel value and render one of the existing layouts:
- `STANDARD`: single barcode, SKU, and sales-price inputs
- `SIZE`: size-driven item price rows
- `SIZE_COLOR`: size-and-color-driven item price rows

This mode is a set-once control-panel property, not an item-level choice. No other screen should allow users to configure barcode or pricing mode directly, and no other screen should display the mode as a field or read-only value. Screens outside Item Settings should only derive behavior from Item Settings implicitly through their rendered layout.

Validation should stay consistent across all three modes. `STANDARD` may render a simpler layout, but it should not impose a stricter required-field rule than the size-based modes solely because it is the standard mode.

Alternatives considered:
- Keep the selector but disable edits.
  Rejected because it still suggests item-level choice exists.
- Show the centralized mode as a read-only field outside Item Settings.
  Rejected because it still unnecessarily surfaces an internal control-panel setting in places where users should only see the resulting workflow.
- Keep extra required-field validation only for `STANDARD`.
  Rejected because centralized barcode-generation mode should change layout behavior, not create a stricter validation policy for one mode.

### Refactor downstream consumers to read the centralized method

Screens such as opening stock, stock adjustment, quick-add flows, and barcode generation logic currently branch on `item.priceMethod`. Those paths should instead use the centralized control-panel setting, fetched once per screen, threaded through existing item-control-panel queries, or passed around as explicitly derived screen context.

Alternatives considered:
- Continue using `item.priceMethod` in downstream screens temporarily.
  Rejected because the product decision is to remove per-item mode entirely before go-live.

### Default missing control-panel state to `STANDARD`

Some flows can open before an Item Settings record exists, and the current UI assumes a usable mode is always available. To keep item creation and stock workflows unblocked while the control panel is being initialized, the backend schema and frontend consumers should resolve a missing `barcodeGenerationMethod` to `STANDARD`.

Alternatives considered:
- Block item and inventory workflows until Item Settings is saved once.
  Rejected because it adds setup coupling across unrelated screens and creates a fragile first-run experience.
- Allow `barcodeGenerationMethod` to remain null and let each screen decide its own fallback.
  Rejected because it spreads mode-resolution logic across the app and invites inconsistent defaults.

### Remove `Item.priceMethod` from schema and service writes in the same change

Since there is no production data to preserve, the cleanest migration is to stop writing the field, update all consumers, and then remove the column from the Prisma model and migration history forward path.

Alternatives considered:
- Two-step deprecation with a temporary unused column.
  Rejected because it adds code churn without helping a pre-go-live rollout.

## Risks / Trade-offs

- [Cross-screen regressions] -> Audit every `priceMethod` read and update each branch to the centralized setting before removing the field.
- [Hidden shared-helper regressions] -> Update shared utilities such as item filtering and option builders that currently inspect `item.priceMethod`.
- [Item creation blocked when control-panel data is missing] -> Define a deterministic fallback or require Item Settings initialization before item workflows are used.
- [UI confusion during transition] -> Remove or rename all "Price Method" labels that actually mean barcode-generation mode.
- [Migration mismatch between frontend and backend] -> Land schema, API, and UI updates together and verify create/edit stock flows against each mode.

## Migration Plan

1. Add `barcodeGenerationMethod` to `ItemControlPanel` with a default of `STANDARD`, expose it through create/get/update APIs, and remove `sizeWise` / `size_color_wise`.
2. Update Item Settings to edit the new field through a single selector and to load `STANDARD` when no saved value exists yet.
3. Refactor Item Master, Price Template Master, quick-add flows, and inventory screens to read one resolved barcode-generation mode from control panel state.
4. Update shared frontend helpers and validation paths so no runtime logic depends on `item.priceMethod`.
5. Stop sending and reading `Item.priceMethod` in item APIs and frontend consumers.
6. Remove `priceMethod` from the `Item` Prisma model and add the corresponding schema migration.
7. Verify all three modes end-to-end before implementation is considered complete.

Rollback is only relevant before deployment of the full change; after the schema removal lands, rollback would require restoring the old column and UI paths.

## Confirmed Decisions

- Missing `ItemControlPanel` barcode mode state resolves to `STANDARD` until a user saves a different value.
- `sizeWise` and `size_color_wise` are removed from `ItemControlPanel`; `barcodeGenerationMethod` is the only barcode-mode field that remains.
- The mode is configured only in Control Panel Item Settings and is derived everywhere else; no other screen should expose a barcode/pricing mode selector.
- The centralized barcode generation method is surfaced in UI only within Control Panel Item Settings; all other screens must adapt implicitly without showing the mode as a field, label, or read-only value.
- User-facing UI should stop calling this setting `Price Method`; downstream screens should treat it as centralized barcode-generation behavior from Item Settings.
- Quick-add item modals receive the resolved barcode-generation mode from their parent screens instead of fetching control-panel state themselves.
- Any effective mode used outside Item Settings is derived from `ItemControlPanel`, must not be modeled or described as item-owned state, and must not appear in item API payloads.
- `STANDARD` does not carry a stricter validation rule than other barcode-generation modes; mode differences affect layout and row shape, not an extra required-field policy.
