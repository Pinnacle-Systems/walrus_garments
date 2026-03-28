## 1. Define the shared typography contract

- [x] 1.1 Audit the standardized transaction-entry screens and shared UI primitives under `client/src/Uniform/Components/**` to identify where header section titles, subsection text, and field labels are currently styled.
- [x] 1.2 Map the requested typography roles to implementation targets so section headers use `12px`, subsection text uses `11px`, and field labels use `12px` across in-scope transaction header and footer surfaces.
- [x] 1.3 Identify which typography updates can be centralized in shared components such as `TransactionHeaderSection` and which footer text styles still require local form updates.

## 2. Implement reduced typography on transaction pages

- [x] 2.1 Update shared transaction-entry header primitives and shared input label styling used by in-scope transaction forms to apply the reduced font-size contract.
- [x] 2.2 Refactor in-scope transaction footers to apply the reduced typography to section titles, supporting subsection text, totals rows, and footer field labels without changing footer behavior.
- [x] 2.3 Verify that transaction-specific actions, totals emphasis, and read-only states remain visually clear after the font-size reduction.

## 3. Verify consistency across screens

- [x] 3.1 Smoke test representative standardized transaction screens such as Purchase Inward, Sale Order, Sales Delivery, and Purchase Return / Cancel to confirm header and footer typography matches the new sizes.
- [x] 3.2 Check that shared and local field labels both render at the `12px` tier and that footer titles and supporting text follow the `12px` and `11px` tiers respectively.
- [x] 3.3 Review representative desktop and laptop widths to ensure the smaller text improves density without creating readability or alignment regressions.
