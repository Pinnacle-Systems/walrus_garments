## 1. Shared Validation Contract

- [x] 1.1 Define a shared validator input model for legacy versus canonical flow context, centralized barcode-generation mode, and row shape.
- [x] 1.2 Implement centralized size/color requiredness rules for `STANDARD`, `SIZE`, and `SIZE_COLOR` in the shared validator.
- [x] 1.3 Rework shared stock runtime field helpers so configured `field1` through `field10` describe supported stock granularity without globally marking them required.

## 2. Item And Canonical Flow Enforcement

- [x] 2.1 Update Item Master create/update validation to use the shared validator while preserving legacy item exceptions.
- [x] 2.2 Update canonical Purchase Inward flows to enforce barcode-mode-driven size/color completeness before persistence and stock writes.
- [x] 2.3 Update canonical Purchase Return flows to preserve and validate barcode-mode-driven size/color completeness on returned rows.

## 3. Legacy Compatibility And Regression Coverage

- [x] 3.1 Verify Opening Stock remains permissive for legacy rows with missing size, color, or stock-defined runtime fields.
- [x] 3.2 Add or update tests covering legacy permissiveness, canonical `STANDARD`, canonical `SIZE`, and canonical `SIZE_COLOR` validation outcomes.
- [x] 3.3 Audit stock matching and helper code paths for assumptions that stock-defined runtime fields are always required and align them with the new contract.
