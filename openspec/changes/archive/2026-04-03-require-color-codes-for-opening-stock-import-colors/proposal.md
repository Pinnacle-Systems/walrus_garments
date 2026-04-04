## Why

Opening-stock bulk import currently assumes missing color masters can be created from the uploaded color name alone. That breaks down because Color Master creation in the product still expects a meaningful color code, and the uploaded file does not include one.

## What Changes

- Add a dedicated bulk-review step for missing opening-stock colors that lets users complete required color codes before batch creation.
- Keep bulk detection and grouped review for missing items, sizes, and colors, but treat colors as a completion workflow rather than a blind one-click create.
- Preserve the existing one-batch confirmation flow after users finish any required color metadata.
- Stop assuming color `code` can be safely inferred from the imported color name during opening-stock bulk import.

## Capabilities

### New Capabilities
- `opening-stock-import-color-review`: Defines how bulk opening-stock import reviews missing colors, collects required color codes, and creates missing colors in one batch confirmation step.

### Modified Capabilities

## Impact

- Affected UI is primarily the opening-stock bulk import review flow in `client/src/Uniform/Components/OpeningStock/ExcelSelectionTable.js`.
- Affected master-data behavior includes color creation through `ColorMasterService` and any related quick-add or validation paths that currently assume name-only creation is sufficient.
- This change aligns bulk import behavior with the existing Color Master product expectation that color codes are operator-controlled data rather than imported guesswork.
