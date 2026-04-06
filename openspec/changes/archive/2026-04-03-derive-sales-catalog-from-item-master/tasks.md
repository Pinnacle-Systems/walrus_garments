## 1. Catalog Authority Audit

- [x] 1.1 Audit Quotation and Sale Order line-item screens to identify any option lists, variant helpers, or validation paths that still depend on stock presence instead of Item Master and Item Price List.
- [x] 1.2 Audit any shared sales-item helpers used by Quotation and Sale Order to separate item-master-driven option resolution from stock advisory lookups.
- [x] 1.3 Remove any shared helper logic that makes Quotation or Sale Order inherit visible dimensions from Stock Control instead of Item Master.

## 2. Quotation And Sale Order Behavior

- [x] 2.1 Update Quotation line-item entry so selectable item, size, and color combinations come from Item Master and Item Price List even when no matching stock row exists.
- [x] 2.2 Update Sale Order line-item entry so selectable item, size, and color combinations come from Item Master and Item Price List even when no matching stock row exists.
- [x] 2.3 Ensure Quotation and Sale Order derive visible sales dimensions from Item Master while preventing stock presence or stock-only granularity from reshaping the document.
- [x] 2.4 Ensure any stock quantity or availability shown on Quotation and Sale Order is advisory only and does not block or remove otherwise valid sellable combinations.

## 3. Verification

- [x] 3.1 Verify Quotation allows a valid item-master combination that has no stock row.
- [x] 3.2 Verify Sale Order allows a valid item-master combination that has no stock row.
- [x] 3.3 Verify Quotation and Sale Order visible sales dimensions come from Item Master rather than Stock Control.
- [x] 3.4 Verify any displayed stock availability on Quotation and Sale Order remains informational and does not change selectable sellable combinations.
