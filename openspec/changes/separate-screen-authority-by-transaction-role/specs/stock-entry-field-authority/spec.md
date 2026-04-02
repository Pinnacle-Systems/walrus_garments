## MODIFIED Requirements

### Requirement: Stock Control Panel SHALL be the only authority for stock-entry field schema
Runtime stock-writing and stock-assisted operational screens SHALL derive field presence and requiredness for stock dimensions from Stock Control Panel configuration. Item-level or centralized barcode-generation settings SHALL NOT determine whether `size` or `color` fields exist or are mandatory on those screens. This rule applies to inventory-shaped workflows such as Purchase Inward, Purchase Return, Opening Stock, Stock Transfer, Stock Adjustment, and other stock-assisted operational capture flows. It SHALL NOT be used to make pre-fulfillment sales documents adopt stock-only visible dimensions.

#### Scenario: Stock Control enables size-only capture
- **WHEN** Stock Control Panel is configured for size-based stock capture without color-based capture
- **THEN** the relevant stock-writing or stock-assisted operational screens show `Size`
- **AND** do not require `Color`
- **AND** do not use barcode-generation mode to change that field schema

#### Scenario: Stock Control enables size-and-color capture
- **WHEN** Stock Control Panel is configured for size-and-color stock capture
- **THEN** the relevant stock-writing or stock-assisted operational screens show both `Size` and `Color`
- **AND** require those fields according to the stock-maintenance rule
- **AND** do not hide or relax them because an item uses a different barcode-generation mode

#### Scenario: Pre-fulfillment sales documents do not adopt stock-only columns from this rule
- **WHEN** a user opens a catalog-driven screen such as Estimate / Quotation or Sale Order
- **THEN** this Stock Control field-schema rule does not by itself force the screen to show stock-only visible dimensions
- **AND** the sales document instead follows the authority defined for catalog-driven screens
