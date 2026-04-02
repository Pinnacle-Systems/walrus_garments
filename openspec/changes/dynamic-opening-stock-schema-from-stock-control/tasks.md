## 1. Shared Opening-Stock Schema

- [x] 1.1 Add a shared opening-stock field-definition helper that derives visible columns, labels, requiredness, and stock-field mappings from the active Stock Control record.
- [x] 1.2 Include configured additional stock fields `field6` to `field10` in that shared schema when they are defined in Stock Control.

## 2. Dynamic Opening-Stock Surfaces

- [x] 2.1 Replace the fixed import template header/sample-row generation with output built from the shared opening-stock schema.
- [x] 2.2 Replace the fixed Opening Stock import review-grid columns with columns rendered from the shared opening-stock schema.
- [x] 2.3 Update the manual Opening Stock entry table to render configured additional stock fields from the shared opening-stock schema.

## 3. Validation And Persistence

- [x] 3.1 Update Opening Stock import parsing to map dynamic template headers back into the corresponding opening-stock row fields.
- [x] 3.2 Require every configured stock-tracking field before save, including configured additional fields `field6` to `field10`.
- [x] 3.3 Extend Opening Stock save payload mapping so configured additional field values persist into the matching `Stock` columns.

## 4. Verification

- [x] 4.1 Verify the downloaded template matches the active Stock Control selection and can be uploaded through the import flow.
- [x] 4.2 Verify both Opening Stock entry surfaces show the same configured stock fields and requiredness rules.
- [x] 4.3 Verify opening-stock save writes configured additional field values into `Stock` and blocks save when any configured tracked field is blank.
