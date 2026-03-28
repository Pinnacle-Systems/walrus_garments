## Why

The standardized transaction-entry pages still use typography that feels larger than necessary in the header and footer, which makes compact layouts less effective and causes supporting information to compete visually with the line-item workspace. A smaller, consistent type scale is needed now that these screens are being tuned for denser data entry.

## What Changes

- Define a shared transaction-entry typography scale for header and footer sections on standardized transaction pages.
- Set section-header text to `12px`, subsection text to `11px`, and field-label text to `12px` across the relevant transaction-entry header and footer surfaces.
- Apply the reduced typography consistently to shared header-section presentation and to footer areas such as terms, remarks, totals, and similar grouped blocks.
- Preserve existing business behavior, field ordering, actions, and responsive layout while making the surrounding UI text visually lighter and denser.

## Capabilities

### New Capabilities
- `transaction-entry-typography`: Defines the standard font sizes for transaction-entry header and footer section titles, subsection text, and field labels.

### Modified Capabilities

## Impact

- Affected code is primarily in `client/src/Uniform/Components/ReusableComponents/**` shared transaction-entry primitives and in transaction form components under `client/src/Uniform/Components/**` that render local footer sections.
- Shared header components such as `TransactionHeaderSection` and repeated footer markup for forms like Purchase Inward, Sale Order, Sales Delivery, Sales Invoice, Sales Return, and Purchase Return / Cancel will likely need styling updates.
- This is a frontend-only visual refinement and should not require backend, API, or data-model changes.
