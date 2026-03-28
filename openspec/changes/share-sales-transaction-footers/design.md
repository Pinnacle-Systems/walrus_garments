## Context

The standardized sales transaction forms already share a common shell and mostly identical footer responsibilities, but the implementation is still fragmented. Sales Return uses `CommonFormFooter`, while Sale Order, Sales Delivery, Sales Invoice, and Quotation each keep their own local footer composition for terms, remarks, totals, and actions. Those local copies have already needed repeated adjustments for density and typography, which demonstrates that the footer has become a shared concern even though the code is still split.

The main challenge is that the sales footers are similar but not identical. Some screens expose print and thermal print, some show extra totals such as advance or payment received, and Quotation includes minimum advance editing. The shared solution therefore needs to centralize the common layout while leaving those differences configurable.

## Goals / Non-Goals

**Goals:**
- Introduce a shared sales-footer implementation for the standardized sales transaction screens.
- Eliminate duplicated sales-footer markup for terms, remarks, totals, and action groups where the screens already follow the same pattern.
- Preserve transaction-specific footer variations through configuration rather than separate markup trees.
- Make future footer layout and typography changes apply consistently across Sale Order, Sales Delivery, Sales Invoice, Sales Return, and Quotation.

**Non-Goals:**
- Change save, print, thermal-print, or validation business logic.
- Force every sales transaction screen to have exactly the same footer fields or actions.
- Refactor purchase transaction footers as part of this change.

## Decisions

1. Treat the sales footer as a dedicated shared primitive rather than extending ad hoc local markup.
The existing duplication is no longer incidental. A shared footer component or small footer component family should own the layout contract for notes, totals, and actions across sales transaction screens.

Alternative considered: keep `CommonFormFooter` only for the screens already using it and lightly copy the rest.
This was rejected because it preserves the same maintenance problem that recent typography changes exposed.

2. Make the shared footer configuration-driven.
The shared sales footer should accept configurable sections for terms selection, terms text, remarks, totals rows, optional extra controls such as minimum advance, and action buttons. This keeps the shared layout flexible enough for Quotation and the different sales document types without reintroducing local footer copies.

Alternative considered: create one rigid footer with a fixed set of fields and actions.
This was rejected because Quotation and some sales documents have legitimate differences that should not be shoehorned into hidden conditional markup inside each form.

3. Reuse or evolve `CommonFormFooter` only if it can represent the full sales-footer contract cleanly.
`CommonFormFooter` already covers part of the surface, but it does not currently model the full sales-footer pattern or action layout used by the standardized transaction screens. The implementation may expand it significantly or replace it with a more descriptive shared sales-footer primitive.

Alternative considered: preserve `CommonFormFooter` unchanged and add multiple wrappers around it.
This was rejected because it risks splitting the sales footer API across too many layers and making screen ownership less clear.

## Risks / Trade-offs

- [A shared footer component could become overly generic and hard to follow] -> Keep the API focused on the real sales-footer sections that already exist instead of building a universal footer abstraction.
- [Screen-specific behavior could be lost during refactor] -> Preserve action handlers, totals semantics, and optional controls exactly as consumer-provided configuration.
- [Partial migration could leave sales forms inconsistent] -> Migrate the in-scope sales forms together so the shared footer becomes the new baseline immediately.
- [Quotation may need a slightly richer footer contract than other sales screens] -> Design the shared footer around pluggable totals rows and optional extra controls rather than special-casing Quotation after the fact.
