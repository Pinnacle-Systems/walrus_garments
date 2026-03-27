## Why

The sales transaction screens already follow a shared transaction-entry shell, but their footers still duplicate nearly the same terms, remarks, totals, and action markup in each form. That duplication makes recent footer-density and typography adjustments more expensive, and it increases the risk that Sale Order, Sales Delivery, Sales Invoice, Quotation, and Sales Return will drift apart again.

## What Changes

- Introduce a shared sales-transaction footer pattern for the standardized sales forms.
- Refactor Sale Order, Sales Delivery, Sales Invoice, Quotation, and Sales Return to compose their footer through the shared implementation instead of keeping near-duplicate local footer markup.
- Keep transaction-specific actions such as print, thermal print, minimum advance, and screen-specific totals supported through configuration rather than separate footer copies.
- Preserve existing save, edit, print, and read-only behavior while centralizing the common footer layout and typography treatment.

## Capabilities

### New Capabilities
- `sales-transaction-footers`: Defines a shared configurable footer implementation for standardized sales transaction-entry screens, including notes, totals, and action areas.

### Modified Capabilities

## Impact

- Affected code is primarily in `client/src/Uniform/Components/SaleOrder/**`, `client/src/Uniform/Components/SalesDelivery/**`, `client/src/Uniform/Components/SalesInvoice/**`, `client/src/Uniform/Components/SalesReturn/**`, `client/src/Uniform/Components/Quotation/**`, and `client/src/Uniform/Components/ReusableComponents/**`.
- Existing footer helpers such as `CommonFormFooter` will likely be expanded or replaced by a more configurable shared sales footer component.
- This is a frontend-only refactor and consistency improvement and should not require backend, API, or data-model changes.
