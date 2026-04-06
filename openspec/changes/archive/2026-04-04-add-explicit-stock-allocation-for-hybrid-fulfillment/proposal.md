## Why

Hybrid fulfillment screens such as Sales Delivery, Sales Return, and POS already sit between item-shaped selling documents and more granular stock rows. When a fulfillment lookup is broader than the tracked stock identity, the current contract does not say whether the system should aggregate, guess, or require the user to choose a concrete stock bucket before reducing inventory.

## What Changes

- Add an explicit hybrid fulfillment stock-allocation capability for candidate lookup, explicit bucket selection, and save-time revalidation.
- Require under-granular fulfillment lookups to return all compatible stock buckets instead of silently collapsing ambiguous matches into one consumable result.
- Clarify that stock-reducing hybrid fulfillment saves must consume from one or more explicit stock buckets, even when the visible document remains sale-shaped.
- Allow auto-selection only when the lookup resolves exactly one compatible stock bucket.
- Allow split allocation across multiple stock buckets when one bucket alone cannot satisfy the requested fulfillment quantity.

## Capabilities

### New Capabilities
- `hybrid-stock-allocation`: Define candidate stock-bucket lookup, explicit user allocation, and revalidation rules for hybrid fulfillment workflows such as Sales Delivery, Sales Return, and POS.

### Modified Capabilities
- `transaction-screen-authority-matrix`: Clarify that hybrid fulfillment screens may search broadly but must resolve ambiguous stock execution through explicit allocation underneath the visible document shape.
- `sales-order-direct-delivery-conversion`: Clarify that converted delivery lines use explicit stock-bucket allocation when fulfillment lookup is broader than tracked stock identity.

## Impact

- Affected workflows: Sales Delivery conversion, Sales Return fulfillment, Point Of Sales, and any shared stock-assisted fulfillment helpers.
- Affected behavior: stock search result shape, fulfillment-line execution, allocation persistence, and save-time stock revalidation.
- Likely touched areas: client fulfillment grids or allocation pickers, stock snapshot lookup services, and backend delivery/POS stock-out validation logic.
