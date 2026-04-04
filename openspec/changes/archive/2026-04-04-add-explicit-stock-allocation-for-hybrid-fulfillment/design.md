## Context

The current OpenSpec contract already distinguishes hybrid fulfillment screens from catalog-driven sales entry and stock-writing intake. Those hybrid screens preserve the source sales-document shape on the visible grid while using stock snapshots or allocation underneath. However, the contract stops short of defining what happens when a user searches for stock with fewer dimensions than the tracked stock identity.

That missing rule is risky because hybrid fulfillment is exactly where broad selling lines meet granular stock. If the system silently aggregates multiple stock buckets into one fulfillment result, it can consume the wrong lot, batch, or stock-defined field combination without the user realizing it. The new change needs to make broad search acceptable while making stock reduction exact and auditable.

## Goals / Non-Goals

**Goals:**
- Define how hybrid fulfillment lookups behave when the search input is less granular than stock identity.
- Require explicit stock-bucket allocation before inventory reduction when more than one candidate bucket matches.
- Preserve the visible sales-document shape while keeping allocation as a secondary execution layer.
- Allow exact-match auto-selection and multi-bucket split allocation where appropriate.
- Revalidate selected allocations against current stock at final save.

**Non-Goals:**
- Redesign the visible sales-line schema for Sales Delivery, Sales Return, or POS.
- Redefine sellable catalog shape or Item Master option lists.
- Introduce a mandatory global FIFO or FEFO policy in this phase.
- Rewrite every non-fulfillment stock-assisted lookup in the product.

## Decisions

### Broad lookup is allowed, but stock consumption must be exact
Hybrid fulfillment searches MAY begin from a coarse item-shaped or partially resolved stock-shaped lookup, but any stock-reducing save SHALL target one or more explicit stock buckets.

Why:
- Users often begin from the selling line shape rather than from full warehouse granularity.
- Inventory reduction needs a stable, auditable identity and must not depend on silent server guesses.

Alternative considered:
- Require users to enter the full stock identity before any lookup. Rejected because it pushes warehouse-level complexity into the initial search step and makes hybrid screens harder to use.

### Ambiguous matches return candidate buckets instead of one merged result
When a lookup resolves more than one compatible stock bucket, the system SHALL return the candidate buckets and require user choice or split allocation rather than silently collapsing them into a single consumable row.

Why:
- Different stock buckets may represent different lots, batches, shades, or business attributes that matter operationally.
- Silent merging hides the real stock identity and can create incorrect depletion history.

Alternative considered:
- Aggregate all compatible buckets and let the save consume against the pooled quantity. Rejected because it removes traceability and can deplete the wrong tracked bucket.

### Exact single-match lookups may auto-select
When the lookup resolves exactly one compatible stock bucket, the system MAY auto-select that bucket for the line while still treating the allocation as provisional until save.

Why:
- The common case should stay fast.
- Auto-selection is safe when there is no ambiguity.

Alternative considered:
- Always force a picker even for one match. Rejected because it adds unnecessary friction without improving correctness.

### Split allocation is part of the execution layer, not the visible document shape
If the requested fulfillment quantity exceeds the quantity in a single selected bucket, the workflow MAY allow the user to allocate the line across multiple stock buckets underneath the same visible sales line.

Why:
- Large or partial deliveries often need to combine stock from multiple buckets.
- Keeping that split underneath the visible line preserves the authority model for hybrid screens.

Alternative considered:
- Force the visible delivery/POS grid itself to become stock-bucket-shaped. Rejected because it would leak warehouse granularity into the business document.

### Save-time revalidation remains authoritative
Client-side candidate resolution and user allocation remain provisional until final save, and the server SHALL revalidate current availability for every selected stock bucket before inventory recording.

Why:
- Stock can change between initial lookup and save.
- Save-time revalidation prevents stale allocations from over-consuming stock.

Alternative considered:
- Trust the client-selected allocation without a final stock check. Rejected because concurrent inventory activity would make the result unreliable.

## Risks / Trade-offs

- [Candidate selection adds UI complexity to hybrid fulfillment screens] -> Mitigation: allow single-match auto-selection and keep the picker only for ambiguous or split-allocation cases.
- [Teams may overgeneralize this contract to pre-fulfillment sales entry] -> Mitigation: keep the scope explicitly limited to hybrid fulfillment execution, not catalog-driven option lists.
- [Allocation persistence may become tightly coupled to one screen] -> Mitigation: define the contract at the shared hybrid-allocation layer and let each screen choose its own presentation.
- [Phase 1 may need to coexist with legacy/coarse stock rows] -> Mitigation: allow coarse lookups to prefill what they can, but require exact selected buckets before any reduction.

## Migration Plan

1. Introduce a shared hybrid-allocation contract that can return zero, one, or many candidate stock buckets for a fulfillment lookup.
2. Update Sales Delivery conversion flows to keep visible lines sale-order-shaped while attaching provisional stock allocations underneath.
3. Extend POS and other hybrid fulfillment flows to resolve ambiguous matches through candidate selection instead of silent pooled consumption.
4. Add save-time server revalidation so selected allocations fail safely when stock changes before commit.

Rollback strategy:
- Revert the allocation layer changes and fall back to the prior fulfillment path if the picker or save-time validation causes blocking regressions.
- No schema rollback is required if the first phase stores allocation data in existing fulfillment-side structures or transient service payloads.

## Open Questions

- Should phase 1 require split allocation in POS immediately, or is single-bucket selection plus re-prompting enough for the first rollout?
- Which tracked dimensions should be shown most prominently in the candidate picker when many stock-defined runtime fields are configured?
