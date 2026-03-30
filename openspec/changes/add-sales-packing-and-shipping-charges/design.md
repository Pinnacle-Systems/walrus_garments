## Context

The standardized sales transaction screens already share a compact footer implementation that centralizes terms, remarks, totals, and action buttons. That footer currently exposes total quantity on the left and monetary totals on the right, but it has no shared affordance for optional transaction-level charges such as packing and shipping. Because Quotation, Sale Order, Sales Delivery, Sales Invoice, and Sales Return all consume the same footer pattern, adding this behavior screen-by-screen would create another round of near-duplicate totals logic.

The requested behavior is UI-visible and calculation-sensitive. Users want to opt packing and shipping in independently, enter their amounts only when relevant, and have the final net amount reflect those adjustments without collapsing them into one generic charge field.

## Goals / Non-Goals

**Goals:**
- Extend the shared sales footer so in-scope sales screens can expose separate optional packing and shipping charges through one common pattern.
- Keep the opt-in controls close to the total-quantity area while rendering amount entry in the right-hand totals summary where financial adjustments already appear.
- Preserve a strict separation between packing and shipping in state, layout, and saved values.
- Recalculate net amount from the existing item-based totals plus any selected packing and shipping charges.
- Support both editable and read-only transaction states without losing visibility into which charges were applied.

**Non-Goals:**
- Change line-item pricing, tax derivation, or item-level packing metadata.
- Introduce a generic arbitrary-charge system beyond the two requested charge types.
- Redesign the overall footer layout beyond the minimum adjustments needed to fit the new controls and inputs.
- Change unrelated purchase or production transaction screens that do not use the shared sales footer contract.

## Decisions

1. Extend the shared footer API instead of adding one-off controls in each screen.
The new behavior belongs in `CommonFormFooter` because the affected sales screens already share that surface and totals composition. Each consuming screen should pass the enabled flags, amount values, setters, and any save/load totals mapping it needs, while the shared footer owns the common presentation.

Alternative considered: add local packing and shipping UI in each sales form.
This was rejected because it would duplicate layout, checkbox behavior, conditional amount rendering, and net-total presentation across the same family of screens.

2. Keep packing and shipping as explicit separate fields.
The UI and saved transaction shape should carry `packing` and `shipping` independently rather than storing one combined “other charges” amount. This preserves the user’s requested distinction, keeps the footer copy clearer, and avoids ambiguous read-only totals later.

Alternative considered: one checkbox group with a single combined charge amount.
This was rejected because it would not satisfy the requirement that packing and shipping remain separate.

3. Place toggles on the left summary card and conditional amount rows on the right totals card.
The checkbox controls should appear in the Total Qty section because they act as transaction-level opt-ins, while the entered amounts should appear in the monetary summary column because that is where users already inspect financial totals. This mirrors the requested layout without moving the existing summary cards around.

Alternative considered: show both toggles and amount inputs in the same summary card.
This was rejected because it would mix quantity-oriented controls with currency entry and make the right-hand totals area less complete.

4. Treat packing and shipping as post-tax transaction adjustments unless existing screen logic explicitly requires otherwise.
The gross amount and tax amount should continue to represent the current item-derived calculations. Net amount should be recomputed as existing net plus selected packing and shipping amounts. This matches the request to include the charges in the net amount without redefining current gross or tax semantics.

Alternative considered: fold the new charges into gross amount or recompute tax from them.
This was rejected because the request only calls for net-amount inclusion, and expanding tax scope would create larger business-rule ambiguity than the current change needs.

5. Preserve visibility in read-only mode by showing only applied charges.
When a saved transaction is opened in read-only mode, the footer should show the enabled charge rows and their values, but disabled or unselected charges should remain hidden to keep the summary compact. Editable mode remains the place where users can toggle charges on and off.

Alternative considered: always show disabled zero-value charge rows in read-only mode.
This was rejected because it adds visual noise without improving comprehension.

## Risks / Trade-offs

- [Existing save/load payloads may not yet carry charge fields] -> Update transaction mapping per sales screen and verify reopening an edited record preserves both flags and amounts.
- [Different screens may already derive `netAmount` locally in slightly different ways] -> Centralize the charge-addition rule near each screen’s footer totals mapping and verify parity across Quotation, Sale Order, Sales Delivery, Sales Invoice, and Sales Return.
- [The compact footer could become crowded on narrower widths] -> Reuse the existing responsive summary-card layout and keep the new controls short-label and single-purpose.
- [Users may enter invalid blank or negative values when a charge is enabled] -> Normalize empty amounts to zero and keep the input constrained to numeric currency entry.
- [Downstream read-only or print surfaces may display a saved net amount without explaining the extra charges] -> Verify the saved total remains internally consistent and extend downstream summaries where needed in implementation.

## Migration Plan

1. Extend the shared footer props and rendering for charge toggles and conditional amount rows.
2. Update the in-scope sales forms to pass separate packing and shipping state, compute footer net totals with those values, and hydrate persisted records.
3. Verify editable, read-only, and reopened transactions across the affected sales screens before rollout.

## Open Questions

- Should downstream print formats and report summaries show packing and shipping as separate labeled rows whenever those values are saved, or is preserving the updated net amount sufficient for the first rollout?
