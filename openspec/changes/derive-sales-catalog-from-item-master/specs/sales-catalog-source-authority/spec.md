## ADDED Requirements

### Requirement: Quotation and Sale Order SHALL derive sellable combinations from item master data
Quotation and Sale Order SHALL derive selectable item combinations from Item Master and Item Price List rather than from current stock presence. A valid item, size, and color combination supported by the item domain MUST remain selectable on these screens even when no matching stock row currently exists.

#### Scenario: Valid item-master combination has no stock row
- **WHEN** a user opens Quotation or Sale Order
- **AND** an item, size, and color combination exists in Item Master and Item Price List
- **AND** no matching stock row exists for that combination
- **THEN** the screen still allows the user to select that combination

#### Scenario: Stock absence does not remove sellable option
- **WHEN** a valid sellable combination is temporarily out of stock or has never been inwarded
- **THEN** Quotation and Sale Order continue to present that combination as part of the sellable catalog
- **AND** the system does not treat missing stock presence as a reason to hide the option

### Requirement: Catalog-driven screens SHALL follow item-defined attributes rather than stock-defined attributes
Quotation and Sale Order SHALL derive their visible sales dimensions and option lists from item-defined attributes and item-domain validity. Configured stock-defined attributes from Stock Control SHALL NOT become visible catalog fields on these screens merely because they use similar field numbers or labels.

#### Scenario: Matching configurable field numbers do not make stock fields appear on catalog screens
- **WHEN** Item Control Panel and Stock Report Control both contain similarly named configurable fields such as `field1`
- **THEN** Quotation and Sale Order use the item-defined attribute meaning for catalog behavior
- **AND** they do not surface the stock-defined field solely because the field names or numbers overlap

### Requirement: Stock availability on Quotation and Sale Order SHALL be advisory only
If Quotation or Sale Order show stock quantity, availability, or stock-related warnings, that information SHALL be advisory only. The system MUST NOT use stock presence or stock quantity as the source of allowed item-master combinations on these screens.

#### Scenario: Stock warning is shown for selectable combination
- **WHEN** a user selects a valid item-master combination on Quotation or Sale Order
- **AND** the system determines that current stock is zero or unavailable
- **THEN** the screen may show an availability warning or informational stock value
- **AND** it still allows the selected combination to remain on the document

#### Scenario: Stock data is absent during sales entry
- **WHEN** stock lookup data is unavailable, stale, or not yet created for a valid sellable combination
- **THEN** Quotation and Sale Order still allow the user to work with the item-master combination
- **AND** the absence of stock data does not invalidate the row by itself

### Requirement: Legacy barcode support SHALL not define Quotation or Sale Order catalog options
Quotation and Sale Order SHALL derive their sellable-option set from Item Master and Item Price List even when the application also supports legacy or coarse barcode lookup in stock-assisted workflows. Historical barcode values MAY be unsupported or only partially useful on these screens, but they MUST NOT become the source of catalog-option definitions.

#### Scenario: Historical barcode does not define sellable options on Quotation or Sale Order
- **WHEN** the application contains historical barcodes whose encoded granularity does not match the current item structure
- **THEN** Quotation and Sale Order still derive their selectable options from Item Master and Item Price List
- **AND** do not use those historical barcode values to determine which item, size, or color combinations exist in the sellable catalog
