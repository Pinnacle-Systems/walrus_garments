## Why

Opening stock currently uses a partially dynamic model: some validation now follows Stock Control for size and color, but the import template, rendered import columns, parser expectations, and extra stock fields remain hard-coded. That drift makes the opening-stock workflow unreliable for businesses that configure additional stock-tracking fields and expect every configured stock field to be captured, required, and persisted consistently.

## What Changes

- Make Stock Control the source of truth for the full opening-stock schema, including `item`, `size`, `color`, and configured additional stock fields such as `field6` through `field10`.
- Generate the Opening Stock import template columns dynamically from the active Stock Control configuration instead of using a fixed header list.
- Render both Opening Stock entry surfaces from the same dynamic field definition, including the import review grid and manual stock-entry table.
- Require every configured stock-tracking field before saving opening-stock rows, including configured additional fields.
- Persist configured additional stock-field values from opening stock into the corresponding `Stock` table columns.

## Capabilities

### New Capabilities
- `opening-stock-dynamic-schema`: Define opening-stock screen, template, parser, validation, and payload behavior from active Stock Control fields.

### Modified Capabilities
- `opening-stock-import-template`: Change the template requirement from fixed parser headers to headers generated from the active opening-stock schema.
- `opening-stock-hydration`: Clarify that opening-stock save-time validation and persistence include all configured stock-tracking fields, not only item/size/color.
- `stock-entry-granularity-controls`: Extend stock-maintenance authority from size/color-only behavior to the full set of configured stock-entry fields used by opening stock.

## Impact

- Affected UI: `client/src/Uniform/Components/OpeningStock/ExcelSelectionTable.js`, `client/src/Uniform/Components/OpeningStock/ManualAddStock.js`, and related Opening Stock containers.
- Affected configuration source: Stock Control / `StockReportControl` settings, especially configured additional fields `field6` to `field10`.
- Affected persistence: opening-stock payload mapping into `Stock.field6` to `Stock.field10`.
- No new database schema is expected, but frontend import/export contracts and save-time validation will change.
