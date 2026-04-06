## Why

Users importing opening stock currently have no in-product template to guide the file format, which increases failed uploads and trial-and-error while preparing spreadsheets. Adding a downloadable template and contextual hover help makes the import workflow self-serve without adding persistent instructional text to the page.

## What Changes

- Add a downloadable CSV template to the Opening Stock Excel Import screen.
- Ensure the template uses the exact header names expected by the current import parser.
- Add a compact hover-triggered helper tooltip, anchored to an icon near the template action, instead of always-visible instructional text.
- Keep the change scoped to the Opening Stock import experience and avoid backend/API changes.

## Capabilities

### New Capabilities
- `opening-stock-import-template`: Provide a downloadable import template and compact hover guidance for Opening Stock Excel import.

### Modified Capabilities

## Impact

- Affected UI: `client/src/Uniform/Components/OpeningStock/index.jsx`
- Affected import flow: `client/src/Uniform/Components/OpeningStock/ExcelSelectionTable.js`
- Likely reuse or extension point: `client/src/Utils/excelHelper.js`
- No database, API, or migration impact expected
