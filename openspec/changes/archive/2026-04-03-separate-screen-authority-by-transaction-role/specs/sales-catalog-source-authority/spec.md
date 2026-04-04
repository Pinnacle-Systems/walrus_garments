## MODIFIED Requirements

### Requirement: Quotation and Sale Order SHALL derive sellable combinations from item master data
Quotation and Sale Order SHALL derive selectable item combinations and visible sales dimensions from Item Master and Item Price List rather than from current stock presence. A valid item, size, and color combination supported by the item domain MUST remain selectable on these screens even when no matching stock row currently exists.

#### Scenario: Valid item-master combination has no stock row
- **WHEN** a user opens Quotation or Sale Order
- **AND** an item, size, and color combination exists in Item Master and Item Price List
- **AND** no matching stock row exists for that combination
- **THEN** the screen still allows the user to select that combination

#### Scenario: Stock absence does not remove sellable option
- **WHEN** a valid sellable combination is temporarily out of stock or has never been inwarded
- **THEN** Quotation and Sale Order continue to present that combination as part of the sellable catalog
- **AND** the system does not treat missing stock presence as a reason to hide the option

#### Scenario: Stock Control does not redefine visible sales dimensions
- **WHEN** stock is tracked at a more granular level than the item’s sellable definition
- **THEN** Quotation and Sale Order still use the item-master-defined sales dimensions as the visible document shape
- **AND** they do not adopt additional stock-only visible columns solely because inventory is tracked more granularly
