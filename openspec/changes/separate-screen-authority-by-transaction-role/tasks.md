## 1. Authority Matrix

- [ ] 1.1 Document the transaction-screen role matrix in code-facing notes and identify which current screens are catalog-driven, stock-writing, or hybrid fulfillment screens.
- [ ] 1.2 Audit existing shared helpers and specs for assumptions that all transaction screens derive visible dimensions from Stock Control.

## 2. Spec Alignment

- [ ] 2.1 Narrow stock-entry field-authority implementation so Stock Control drives inventory and stock-assisted operational screens rather than all transaction screens.
- [ ] 2.2 Align Quotation and Sale Order implementation with item-master-driven visible dimensions and option lists.
- [ ] 2.3 Align Sales Delivery conversion and fulfillment behavior with hybrid screen rules so the visible delivery document preserves sale-order shape while allowing stock-side allocation underneath.
- [ ] 2.4 Align Sales Delivery phased-payment behavior so payment coverage is enforced at the whole-delivery level using remaining payment capacity rather than line-level payment allocation.
- [ ] 2.5 Define or implement persisted fulfillment mappings plus save-time stock revalidation for hybrid delivery execution.

## 3. Verification

- [ ] 3.1 Verify Quotation and Sale Order do not gain stock-only visible columns when stock is tracked more granularly than the sellable item definition.
- [ ] 3.2 Verify Purchase Inward, Purchase Return, Opening Stock, Stock Transfer, and Stock Adjustment continue to use Stock Control for visible and required stock dimensions.
- [ ] 3.3 Verify Sale Order to Sales Delivery conversion preserves source line shape on the visible document while still permitting stock-aware execution.
- [ ] 3.4 Verify phased Sales Delivery conversion uses remaining payment capacity from prior saved deliveries rather than the raw received-payment total on every conversion.
- [ ] 3.5 Verify Sales Delivery save revalidates chosen stock allocation against current inventory before persisting delivery and stock-out movement.
