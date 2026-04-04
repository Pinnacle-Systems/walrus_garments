## 1. Define the shared transaction-entry contract

- [x] 1.1 Audit the in-scope transaction screens under `client/src/Uniform/Components` and list which of Purchase Inward, Estimate / Quotation, Sale Order, Sales Invoice, Sales Delivery, Sales Return, and Purchase Return / Cancel must adopt the standardized entry shell, collapsed header summary, pinned footer, and line-item table surface.
- [x] 1.2 Document the shared workspace rules to standardize, including fixed-height layout, collapsible header behavior, collapsed summary values, exact summary-value parity with expanded fields, scrollable body sizing, footer pinning, and how content height should grow when headers collapse.
- [x] 1.5 Document the shared transaction-entry typography rules to standardize, including section-header sizing, field-label sizing, collapsed summary typography, and footer notes/totals typography.
- [x] 1.6 Document the shared footer rules to standardize, including compact pinned-footer layout, shared sales-footer composition, responsive wrap behavior, and which footer sections remain screen-configurable.
- [x] 1.3 Document the shared line-item table rules to standardize, including wrapper layout, heading treatment, sticky headers, spacing, row numbering, required markers, empty states, add/delete actions, read-only treatment, and inline editing.
- [x] 1.4 Identify which shared UI primitives should be extracted, including a higher-level transaction-entry shell and supporting tiny presentational helpers for header fieldset/summary treatment, footer, and table-section helpers.

## 2. Implement the shared transaction-entry shell

- [x] 2.1 Create or update shared frontend primitives needed for the common transaction-entry shell, including collapsible header summary support, a scrollable content region, a fixed footer area, and the reusable line-item section wrapper.
- [x] 2.5 Standardize expanded header section styling across in-scope screens using the mandatory shared presentational helper, while keeping header structure screen-owned and aligning collapsed summary values to the consumer-provided visible display strings of the corresponding expanded fields.
- [x] 2.6 Standardize transaction-entry typography across in-scope screens through shared shell, header, label, collapsed-summary, and footer primitives rather than per-screen text sizing.
- [x] 2.7 Refactor Estimate / Quotation, Sale Order, Sales Delivery, Sales Invoice, and Sales Return to use a shared configurable sales-footer implementation while preserving their screen-specific totals, print actions, and optional controls.
- [x] 2.2 Refactor Purchase Inward to be the canonical implementation of the shared transaction-entry shell and table surface where older subflows still diverge.
- [x] 2.3 Refactor Estimate / Quotation, Sale Order, Sales Invoice, Sales Delivery, and Sales Return to match the Purchase Inward baseline for both the transaction-entry shell and the line-item table surface.
- [x] 2.4 Refactor Purchase Return / Cancel to match the shared shell and line-item table standard.
- [x] 2.8 Compact the standardized transaction footers so pinned footer height is reduced while preserving notes, totals, and transaction-specific actions across Purchase Inward and the other in-scope transaction forms.

## 3. Verify behavioral parity

- [x] 3.1 Smoke test editable and read-only states for each in-scope transaction screen to confirm collapsed summaries, header expansion, exact summary-to-field parity, row actions, inline editing, modals, validations, totals, and footer actions still behave correctly.
- [x] 3.2 Verify that the content region scrolls independently, footer actions remain visible, and the usable line-item area grows when the header is collapsed.
- [x] 3.5 Verify that expanded header groups use the mandatory shared fieldset-style presentational helper, that each in-scope screen passes collapsed summary values that match the visible display strings shown in the corresponding expanded header fields, and that optional linked-document values render blank when absent in both expanded and collapsed states.
- [x] 3.6 Verify that section headers, field labels, collapsed summary labels and values, and footer notes/totals all follow the shared transaction-entry typography treatment across the in-scope screens.
- [x] 3.7 Verify that the shared sales-footer implementation still preserves each screen's notes, totals, optional controls, and transaction-specific actions while allowing common footer layout and typography updates to flow centrally.
- [x] 3.3 Check overflow behavior, sticky headers, and responsive usability on representative wide and dense transaction tables.
- [x] 3.8 Check representative desktop and laptop widths to confirm the compact footer layout wraps cleanly without clipped controls, hidden totals, or inaccessible actions.
- [x] 3.4 Remove redundant legacy shell and table-surface styling that is no longer needed after the standardization pass.
