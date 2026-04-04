## Context

Runtime stock-writing behavior is currently split across multiple flows. Purchase Inward / Direct Inward already treats `field1` through `field10` as operational stock-entry fields when they are present on runtime rows, but Opening Stock derives a narrower schema around `field6` through `field10`, and Stock Adjustment and Stock Transfer still write stock rows without consistently rendering, validating, or persisting the configured stock-driven field set.

The existing data model does not block this work. `Stock` and `StockReportControl` already expose `field1` through `field10`, and the current drift comes from application-layer schema derivation, row rendering, and save-path enforcement rather than from missing columns. The main challenge is to align multiple stock-writing screens around one runtime interpretation of Stock Control without accidentally importing item-control semantics or barcode-mode behavior into stock-entry field authority.

## Goals / Non-Goals

**Goals:**
- Establish one consistent runtime interpretation of Stock Control for stock-writing screens.
- Treat configured stock-driven fields across `field1` through `field10` as part of the stock-entry contract when those fields are active in Stock Control.
- Bring Opening Stock, Stock Adjustment, and Stock Transfer into alignment with the broader runtime stock-entry contract already used by Purchase Inward / Direct Inward.
- Keep barcode-generation mode limited to price, barcode, and valid item-variant behavior rather than field-schema authority.
- Preserve the current database model and focus on field derivation, optional completion behavior, and payload consistency.

**Non-Goals:**
- Redesign the Stock Control Panel UI beyond whatever small helper changes are needed to expose a shared runtime field definition.
- Introduce typed stock-defined fields, custom field ordering beyond current control ordering, or richer field metadata such as enums and validation classes.
- Redesign item onboarding, barcode generation, or item-control-field semantics.
- Rework unrelated sales-document or catalog-driven screens.

## Decisions

### Use one shared runtime stock-field-definition contract
All in-scope stock-writing screens SHALL derive their stock-driven field schema from a shared helper built from the active Stock Control record. That helper will describe:
- which shared stock dimensions are tracked (`item`, `size`, `color`)
- which stock-defined fields are active across `field1` through `field10`
- the ordered runtime field set used for rendering, validation, and persistence mapping

Why:
- It removes per-screen interpretation drift.
- It gives Opening Stock, Stock Adjustment, and Stock Transfer the same contract as Purchase Inward / Direct Inward instead of letting each flow infer field rules independently.

Alternative considered:
- Patch each screen separately against its current local logic. Rejected because the same divergence would reappear when new stock-driven fields or screens are added.

### Treat configured stock-driven fields as supported stock keys, not universal blockers
When Stock Control configures a stock-driven field for runtime stock entry, stock-writing screens SHALL expose that field in the runtime schema and persist it when present. Those fields participate in stock identity and matching semantics when captured, but they SHALL NOT become unconditional required-entry blockers solely because they are configured.

Why:
- The governing contract is that Stock Control defines stock-granularity support, not that every configured field must be filled on every row.
- Partial support creates silent mismatches where some flows can neither capture nor preserve a tracked stock attribute even when the user has it.

Alternative considered:
- Continue treating stock-defined fields as advisory on some screens. Rejected because it breaks the requirement that all stock-writing surfaces can capture and preserve tracked stock attributes consistently.

### Expand Opening Stock to the same runtime stock-driven field set
Opening Stock SHALL stop using a narrower interpretation of “additional fields” and instead consume the same runtime stock-driven field definition as the rest of the stock-writing contract. The practical effect is that Opening Stock may need to operationalize configured `field1` through `field10`, not only `field6` through `field10`.

Why:
- Opening Stock is a stock-writing surface and should not have a narrower field-authority contract than the rest of runtime stock entry unless the spec explicitly carves that out.
- The current narrower behavior is a source of drift.

Alternative considered:
- Preserve the `field6` through `field10` special case for Opening Stock only. Rejected because it would preserve an inconsistent stock-writing contract across flows.

### Reuse screen-specific value sourcing while standardizing schema support
The shared runtime contract SHALL standardize which fields are present and how they map into stock identity semantics, but each screen may continue to use the most appropriate sourcing pattern:
- shared dimensions may use item-scoped options or master-backed fallback
- stock-defined attributes may use direct row entry
- imported or barcode-assisted rows may start partially filled and complete before save when a higher-level flow explicitly requires that

Why:
- It preserves existing usability patterns where they already work.
- It avoids forcing all screens into one identical editor implementation while still enforcing the same field-support contract.

Alternative considered:
- Force every stock-writing screen to use the full Opening Stock hydration experience. Rejected because Stock Adjustment and Stock Transfer need lighter-weight operational entry.

## Risks / Trade-offs

- [Screens have different row-editor architectures] -> Mitigation: standardize the field-definition and validation contract first, then adapt each screen’s UI to that contract with local renderers.
- [Existing Opening Stock assumptions around `field6` through `field10` may be embedded in import/template logic] -> Mitigation: replace special-cased additional-field logic with a generic stock-driven field mapper before changing validation rules.
- [Some configured fields may currently be treated as labels without active runtime entry widgets] -> Mitigation: verify active Stock Control configurations against each in-scope screen during implementation and add focused regression coverage.
- [Screens may still disagree about when a configured field must be completed] -> Mitigation: keep this change scoped to field presence, persistence, and matching semantics, and leave hard requiredness to explicit flow-level rules.

## Migration Plan

1. Add or extract a shared runtime stock-field-definition helper from Stock Control covering `field1` through `field10`.
2. Update Opening Stock to derive template generation, manual entry, parser mapping, validation, and payload persistence from that shared definition.
3. Update Stock Adjustment to render and persist the configured stock-driven field set in both adjustment rows and resulting `Stock` rows without imposing blanket requiredness.
4. Update Stock Transfer to render and persist the configured stock-driven field set on transfer rows and both transfer stock legs without imposing blanket requiredness.
5. Verify Purchase Inward / Purchase Return still align with the shared contract and do not regress from existing `field1` through `field10` support.

Rollback strategy:
- Revert the application-layer helper and per-screen field wiring if regressions are found.
- No schema rollback is required because the change uses existing columns and control records.

## Open Questions

- Should Stock Control explicitly expose runtime activation semantics for `field1` through `field5` in the UI, or is the current stored configuration sufficient as long as runtime screens honor it?
- Do any existing stock-writing screens intentionally exclude a subset of configured stock-driven fields for business reasons, or is the current inconsistency purely accidental?
