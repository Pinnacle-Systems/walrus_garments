## 1. Define the shared sales-footer contract

- [x] 1.1 Audit Quotation, Sale Order, Sales Delivery, Sales Invoice, and Sales Return to list their shared footer sections and the screen-specific footer differences that must remain configurable.
- [x] 1.2 Define the shared sales-footer API for terms, remarks, totals rows, optional extra controls, and action groups so each sales screen can supply its own values and handlers without owning separate footer markup.
- [x] 1.3 Decide whether to evolve `CommonFormFooter` into the shared sales-footer primitive or replace it with a new reusable footer component under `client/src/Uniform/Components/ReusableComponents/**`.

## 2. Implement the shared footer on sales screens

- [x] 2.1 Build the shared sales-footer implementation with support for configurable notes, totals, optional extra controls, and action buttons.
- [x] 2.2 Refactor Sale Order, Sales Delivery, Sales Invoice, and Sales Return to use the shared sales-footer implementation while preserving their current totals and action behavior.
- [x] 2.3 Refactor Quotation to use the shared sales-footer implementation while preserving its quotation-specific footer behavior such as minimum advance and print actions.

## 3. Verify behavioral parity

- [x] 3.1 Smoke test Quotation, Sale Order, Sales Delivery, Sales Invoice, and Sales Return to confirm the shared footer still renders the expected notes, totals, and actions for each screen.
- [x] 3.2 Verify that save, edit, print, and thermal-print handlers still use each consuming screen's existing validation and open the same flows as before.
- [x] 3.3 Confirm that a shared footer layout or typography tweak can now be applied centrally without needing separate markup changes in each sales transaction form.
