## Context

The codebase already distinguishes between centralized barcode-generation mode, legacy Opening Stock behavior, and stock runtime field configuration, but those concerns are not enforced coherently. `barcodeGenerationMethod` exists as the centralized replacement for older size-wise flags, Opening Stock legacy handling already tolerates coarse item definitions, and canonical inward/return services still assume size/color completeness operationally. At the same time, stock runtime field helpers currently model configured `field1` through `field10` as hard-required fields, which overstates their intended role.

This change is cross-cutting because it touches item validation, canonical inventory flows, legacy compatibility flows, and shared stock-runtime helper semantics. A shared validation contract is needed before implementation so the code does not continue to enforce the same business rule differently in each service.

## Goals / Non-Goals

**Goals:**
- Centralize validation around a shared distinction between legacy and canonical flows.
- Use `barcodeGenerationMethod` to define canonical size/color requiredness.
- Preserve Opening Stock as a permissive legacy compatibility path.
- Recast stock-defined runtime fields as stock-granularity support rather than unconditional required-entry rules.
- Keep canonical Purchase Inward / Purchase Return aligned with the barcode-mode contract.

**Non-Goals:**
- Redesign Item Master, Opening Stock, or runtime stock-writing UI layouts.
- Replace existing stock matching/storage columns or introduce new schema fields.
- Remove stock-defined runtime fields from persistence or matching logic.
- Redefine sales-document shape or pre-fulfillment catalog behavior.

## Decisions

### Use one shared validation contract for legacy versus canonical item shape
Validation SHALL be driven first by whether the row is legacy-compatible or canonical. Legacy behavior is represented by Opening Stock compatibility flows and legacy items. Canonical behavior is represented by modern item-definition and inventory-intake flows.

Why:
- It matches current business intent more closely than treating every stock-writing path as equivalent.
- It prevents legacy Opening Stock permissiveness from weakening canonical Purchase Inward / Purchase Return validation.

Alternative considered:
- Continue deriving behavior per screen with ad hoc checks. Rejected because the current mismatch already comes from distributed assumptions.

### Barcode-generation mode defines canonical size/color requiredness
For canonical item-definition and inventory-intake flows, `barcodeGenerationMethod` SHALL determine whether `size` and `color` are required:
- `STANDARD`: neither required
- `SIZE`: `size` required
- `SIZE_COLOR`: both required

Why:
- The centralized barcode mode was introduced specifically to replace older size-wise mode flags.
- Canonical Purchase Inward / Purchase Return already behave as if size/color completeness matters operationally.

Alternative considered:
- Continue using Stock Control to drive all size/color requiredness. Rejected because stock granularity support and canonical variant requiredness are different concerns.

### Legacy Opening Stock remains permissive for variant and stock-defined fields
Opening Stock SHALL remain the compatibility path for historical or coarse stock. Legacy flows SHALL NOT require `size`, `color`, or `field1` through `field10` merely because newer canonical or stock-tracking rules exist elsewhere.

Why:
- Existing legacy item rules already tolerate flatter inventory shape.
- Historical stock intake should not be blocked by requirements intended for new canonical variant creation.

Alternative considered:
- Bring Opening Stock up to the same requiredness as canonical flows. Rejected because it conflicts with the intended compatibility role.

### Stock runtime fields define supported stock axes, not automatic requiredness
Configured stock runtime fields SHALL continue to influence persistence, matching, and grouping semantics where applicable, but their presence in Stock Control SHALL NOT by itself mean the user must always enter them.

Why:
- These fields support stock granularity and stock identity, but not every flow or row starts with complete business metadata.
- Treating every configured field as hard-required causes the helper layer to over-enforce business rules that should remain flow-specific.

Alternative considered:
- Keep runtime field helpers returning `required: true` for all configured fields. Rejected because it bakes hard requiredness into a lower-level helper that cannot distinguish legacy and canonical contexts.

## Risks / Trade-offs

- [Canonical services currently rely on implicit size/color assumptions] -> Mitigation: add a shared validator and route Purchase Inward / Purchase Return through it before stock writes.
- [Relaxing stock-field requiredness could accidentally weaken stock save checks too far] -> Mitigation: preserve flow-specific completeness checks where a transaction truly requires a value, but do not encode unconditional requiredness in shared stock-field metadata.
- [Legacy versus canonical context may be ambiguous in some helper entry points] -> Mitigation: make flow context explicit in validator inputs instead of inferring from partial payload shape.
- [Spec changes may conflict with the in-progress stock-field change] -> Mitigation: define this change as an authority-layer clarification that future implementation can merge with the stock-field work rather than override it blindly.

## Migration Plan

1. Introduce a shared validation helper that accepts flow context (`legacy` vs `canonical`), barcode mode, and relevant row data.
2. Update Item Master create/update validation to enforce canonical row shape by barcode mode while preserving legacy item exceptions.
3. Update canonical inward/return services to call the shared validator before persisting rows or writing stock.
4. Rework stock runtime field helper semantics so configured stock fields describe supported capture/matching axes without globally declaring them required.
5. Verify Opening Stock remains permissive and continues to support legacy barcode compatibility without inheriting canonical requiredness.

Rollback strategy:
- Revert the shared validator integration and helper semantic change if canonical flows regress.
- No schema rollback is required because the change is application-layer validation and specification work.

## Open Questions

- Should canonical Stock Adjustment and Stock Transfer adopt the same barcode-mode requiredness immediately, or should this change scope implementation first to Item Master plus Purchase Inward / Purchase Return?
- Do any non-legacy quick-add flows launched from stock screens need the same canonical validator in phase 1, or can they remain item-master-driven only?
