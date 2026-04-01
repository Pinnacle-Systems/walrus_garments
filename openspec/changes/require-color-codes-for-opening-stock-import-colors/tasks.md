## 1. Review and Validation UX

- [x] 1.1 Replace the current missing-master confirmation in opening-stock bulk import with a batch review flow that distinguishes missing colors from missing sizes and items.
- [x] 1.2 Add editable required code fields for each missing color in the batch review step and block confirmation until every pending color has a valid non-empty code.
- [x] 1.3 Validate duplicate color codes within the pending batch and against existing color masters before allowing batch creation.

## 2. Color Creation Flow

- [x] 2.1 Update the opening-stock bulk import save path to create missing colors only from the completed review data rather than inferring `code` from the imported name.
- [x] 2.2 Keep missing size and item creation behavior compatible with the existing batch review flow while preserving downstream stock-row id mapping.

## 3. Verification

- [ ] 3.1 Verify bulk import still saves successfully when no colors are missing.
- [ ] 3.2 Verify imports with missing sizes but no missing colors still complete through the lightweight batch review path.
- [ ] 3.3 Verify imports with missing colors require code entry, reject duplicates, create the reviewed colors, and reuse the created ids in the saved stock rows.
- [x] 3.4 Confirm the flow no longer relies on `code = color name` assumptions anywhere in the opening-stock bulk import path.
