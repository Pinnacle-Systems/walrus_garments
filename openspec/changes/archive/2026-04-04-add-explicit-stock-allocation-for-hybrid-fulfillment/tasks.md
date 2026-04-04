## 1. Shared Allocation Contract

- [x] 1.1 Define a shared hybrid-allocation result model that distinguishes zero-match, single-match, and multi-match stock lookup outcomes.
- [x] 1.2 Implement candidate stock-bucket lookup helpers that return differentiating tracked dimensions and available quantities without silently pooling ambiguous matches.
- [x] 1.3 Add save-time allocation revalidation helpers that verify selected stock buckets still cover the requested fulfillment quantity.

## 2. Hybrid Fulfillment Integration

- [x] 2.1 Update Sales Delivery conversion flows to attach provisional stock allocation underneath visible delivery lines without changing the visible sale-order-shaped grid.
- [x] 2.2 Update POS and other hybrid fulfillment flows to require explicit bucket selection when a lookup resolves multiple compatible stock buckets.
- [x] 2.3 Allow exact single-match auto-selection and multi-bucket split allocation where the selected workflow supports partial fulfillment across stock buckets.

## 3. Validation And Regression Coverage

- [x] 3.1 Add or update tests for zero-match, one-match auto-selection, and ambiguous multi-match lookup outcomes.
- [x] 3.2 Add tests proving fulfillment save rejects stale or insufficient selected allocations after intervening stock changes.
- [x] 3.3 Verify hybrid fulfillment screens preserve visible document shape while recording explicit stock-bucket allocations underneath.
