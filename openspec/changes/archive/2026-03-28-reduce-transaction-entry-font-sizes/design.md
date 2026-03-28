## Context

The transaction-entry standardization work introduced shared shell and header-section patterns, but typography across those screens is still mixed. Shared header section titles currently use `text-sm`, footer block headings also commonly use `text-sm`, and field labels vary between shared input components and local footer markup. As the screens are being compacted for denser workflow use, the current type sizes make header and footer chrome feel too visually heavy relative to the table and data-entry area.

The requested change is intentionally narrow: reduce typography in transaction page header and footer sections to a consistent smaller scale. The key implementation challenge is that the typography is split between shared primitives such as `TransactionHeaderSection` and many local transaction form footer blocks.

## Goals / Non-Goals

**Goals:**
- Standardize section-header text on transaction pages to `12px`.
- Standardize subsection text on transaction pages to `11px`.
- Standardize field-label text on transaction pages to `12px`.
- Apply the typography reduction consistently across both header and footer sections on the standardized transaction-entry screens.
- Preserve existing workflows, spacing logic, responsive behavior, and business rules while changing only the visual text scale.

**Non-Goals:**
- Change line-item table typography unless that text is part of the header or footer sections covered by this change.
- Redesign transaction form structure, re-order fields, or alter header/footer capabilities.
- Modify backend behavior, APIs, validation logic, or print formats.

## Decisions

1. Treat transaction-entry typography as a shared contract rather than ad hoc per-screen styling.
The standardization effort already introduced common entry-shell patterns. Font-size changes should follow that same direction so section titles, supporting subsection text, and field labels remain consistent across screens.

Alternative considered: update only the currently visible transaction form.
This was rejected because typography inconsistency would remain across the rest of the standardized transaction surfaces.

2. Map typography by semantic role, not by specific HTML tag.
The implementation should apply `12px` to section headers such as grouped header legends and footer block titles, `11px` to subsection/supporting text such as totals rows or secondary footer copy, and `12px` to field labels regardless of whether they come from shared input helpers or local markup.

Alternative considered: search-and-replace individual Tailwind classes screen by screen.
This was rejected because the same semantic role is rendered through different component trees and would drift over time.

3. Update shared primitives first, then patch local footer markup that does not flow through those primitives.
Components such as `TransactionHeaderSection` provide the cleanest control point for header section titles. Footer sections are often locally composed, so the typography contract should be completed by updating those local blocks or by introducing a small shared footer text helper if it reduces repetition.

Alternative considered: create a large new typography abstraction before implementation.
This was rejected because the change is small enough to stay practical, and the existing shared primitives already cover part of the surface.

## Risks / Trade-offs

- [Smaller typography could reduce readability for some users] -> Keep weights, contrast, and spacing strong enough that the reduced sizes still scan clearly.
- [Field labels may remain inconsistent if some inputs bypass shared label rendering] -> Audit shared input components and local footer markup together during implementation.
- [Footer totals could become visually weak if every text element shrinks equally] -> Use the new semantic sizes while preserving stronger weight for important values such as net amount.
- [Local one-off screens may be missed during rollout] -> Limit the scope to standardized transaction-entry screens and verify each in-scope form after implementation.
