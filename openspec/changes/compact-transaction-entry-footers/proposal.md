## Why

The standardized transaction-entry screens still spend more vertical space in the footer than the workflow needs. Large cards for terms, remarks, totals, and action buttons reduce the visible line-item area even after the header has already been compacted.

## What Changes

- Define a compact transaction-entry footer pattern for standardized sales and purchase entry screens.
- Reduce footer height by tightening section spacing, control heights, and totals presentation without removing required information or actions.
- Keep terms, remarks, totals, and primary actions visible, but reorganize them into a denser layout that better fits within the pinned footer area.
- Preserve editable and read-only behavior, save flows, print actions, and transaction-specific footer fields while standardizing the compact presentation.

## Capabilities

### New Capabilities
- `transaction-entry-footers`: Defines compact, consistently structured footers for standardized transaction-entry screens, including notes, totals, and action areas.

### Modified Capabilities

## Impact

- Affected code is primarily in `client/src/Uniform/Components/**` transaction form components that currently compose footer content for Purchase Inward, Sale Order, Sales Delivery, Sales Invoice, Sales Return, and related standardized screens.
- Shared transaction-entry primitives may need a small footer layout helper or styling update under `client/src/Uniform/Components/ReusableComponents/**`.
- This is a frontend-only layout refinement and should not require backend, API, or database changes.
