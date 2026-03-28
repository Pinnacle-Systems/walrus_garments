## 1. Define the compact footer contract

- [ ] 1.1 Audit the standardized transaction-entry forms under `client/src/Uniform/Components/**` to identify which screens still use the tall footer composition and which footer sections/actions each one needs to preserve.
- [ ] 1.2 Define the shared compact-footer layout rules, including tighter section spacing, smaller control heights, compact totals presentation, and responsive wrap behavior for medium-width screens.
- [ ] 1.3 Identify whether the compact footer should be implemented through a small shared helper, shared utility classes, or localized updates within existing footer content blocks.

## 2. Implement compact transaction footers

- [ ] 2.1 Update the shared transaction-entry footer presentation to support a denser layout without changing pinned-footer behavior in `TransactionEntryShell` or related reusable components.
- [ ] 2.2 Refactor Purchase Inward footer content to use the compact layout while preserving remarks, totals, and transaction actions such as save, edit, and barcode printing.
- [ ] 2.3 Refactor the other standardized transaction forms that still use the tall footer pattern, including Sale Order and Sales Delivery, to match the compact footer contract while preserving their screen-specific actions such as print and thermal print.

## 3. Verify layout and behavior

- [ ] 3.1 Smoke test editable and read-only transaction screens to confirm the compact footer still exposes required notes, totals, and actions.
- [ ] 3.2 Verify that the line-item workspace gains visible usable height after the compact-footer change and that pinned-footer behavior remains stable during scrolling.
- [ ] 3.3 Check representative desktop and laptop widths to confirm compact footer sections wrap cleanly without clipped controls, hidden totals, or inaccessible actions.
