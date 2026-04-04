## Why

The in-scope sales transaction screens currently let users review quantity, gross amount, tax amount, and net amount in the shared footer, but they do not provide a consistent way to add transaction-level packing and shipping charges. Users need those charges to be applied as separate optional adjustments from the footer itself so the saved transaction total reflects the full payable amount.

## What Changes

- Add shared footer support on the in-scope sales transaction screens for two separate optional transaction charges: packing and shipping.
- Show packing and shipping as independent checkboxes in the footer area alongside the total-quantity summary so users can opt each charge into the current transaction.
- Reveal separate amount inputs in the right-hand totals summary when the corresponding checkbox is selected, keeping packing and shipping visually distinct.
- Update footer total calculations so the net amount includes the selected packing and shipping charges in addition to the existing gross and tax amounts.
- Preserve existing gross-amount and tax-amount presentation while treating packing and shipping as transaction-level add-ons rather than line-item values.

## Capabilities

### New Capabilities
- `sales-transaction-footer-charges`: Defines optional packing and shipping footer charges for standardized sales transaction screens, including toggle controls, separate amount entry, and net-amount inclusion.

### Modified Capabilities

## Impact

- Affected code is primarily in the shared sales footer under `client/src/Uniform/Components/ReusableComponents/CommonFormFooter.jsx` and the in-scope sales transaction forms that pass footer totals and save transaction state.
- Transaction payload mapping and record hydration for Quotation, Sale Order, Sales Delivery, Sales Invoice, and Sales Return will likely need to carry separate packing and shipping enabled states and amounts.
- Any read-only totals views or print surfaces that display the saved net amount may need to reflect the added footer charges so saved and displayed totals remain consistent.
