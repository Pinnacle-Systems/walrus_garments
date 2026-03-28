## Why

Core sales and purchase transaction entry screens still feel inconsistent even when they contain similar business workflows. The mismatch is no longer limited to line-item tables. Purchase Inward now represents the preferred direction for the entire transaction workspace: a collapsible header that shows key values when collapsed, a fixed-height layout, a pinned footer, and a scrollable middle area where line-item tables can expand. The related sales and purchase document screens still use older page structures and table surfaces, which increases operator friction and makes the product feel uneven.

## What Changes

- Standardize transaction entry surfaces across the core sales and purchase document screens using the recent Purchase Inward implementation as the baseline.
- Introduce shared transaction-entry primitives for the overall workspace shell, collapsible header card, collapsed summary values, scrollable content region, pinned footer actions, line-item table section, and a mandatory tiny presentational helper for expanded header-section treatment on all in-scope screens.
- Standardize header-detail presentation inside that shell, including Purchase Inward-style fieldset/legend group styling for expanded header sections via shared presentational helpers while keeping header structure and field composition screen-specific.
- Standardize collapsed header-summary presentation while keeping summary field selection and ordering flexible per screen; when a screen chooses to summarize a field, it should pass the same visible display string shown in the expanded field, and optional linked-document values should appear blank when absent rather than showing fallback placeholder text.
- Standardize transaction-entry typography within that shell, including shared font-size tiers for section headers, field labels, collapsed summary labels and values, footer notes, and totals text so compact transaction layouts remain visually consistent across screens.
- Standardize line-item table behavior and visual treatment within that shell, including sticky headers, spacing, row numbering, action placement, empty states, and editable/read-only treatment.
- Apply the shared transaction-entry pattern to Purchase Inward, Estimate / Quotation, Sale Order, Sales Invoice, Sales Delivery, Sales Return, and Purchase Return / Cancel.
- Preserve transaction-specific columns, business logic, pricing/tax rules, lot/barcode flows, validations, and specialized row editors while aligning the surrounding workspace and table behavior.

## Capabilities

### New Capabilities
- `transaction-entry-surfaces`: Defines a consistent transaction entry shell and line-item table experience derived from the recent Purchase Inward reference, including collapsible summary headers, fixed footer layout, scrollable content regions, standardized line-item tables, and shared transaction-entry typography.

### Modified Capabilities

## Impact

- Affected code is primarily in `client/src/Uniform/Components/**` sales and purchase transaction forms and their line-item table/grid components.
- This change is UI-focused and should not require backend API, database, or business-rule changes.
- Shared shell, header-summary, footer, and table primitives will likely be introduced to reduce duplication and keep future transaction screens aligned to the Purchase Inward pattern.
