## MODIFIED Requirements

### Requirement: Item-entry flows expose only location-level low-stock editing
The system SHALL expose low-stock configuration in item-entry workflows only through location-wise entries. The system MUST NOT show a standalone `Min Stock Qty` input that implies an item-level threshold.

#### Scenario: Standard item entry
- **WHEN** a user opens Item Master or quick-add item for a `STANDARD` item
- **THEN** the UI does not display a standalone minimum-stock field
- **AND** any low-stock configuration is done through location-specific rows

#### Scenario: Size-based item entry
- **WHEN** a user opens Item Master or quick-add item for a `SIZE` or `SIZE_COLOR` item
- **THEN** the UI allows low-stock configuration only through location-specific rows for each item-price-list row

#### Scenario: Legacy item correction keeps location-level stock-alert editing
- **WHEN** a user edits an existing legacy item in Item Master
- **THEN** the simplified legacy surface still allows location-level stock alerts to be edited on the single flat `ItemPriceList` row
- **AND** the workflow does not hide or disable that stock-alert editor solely because linked records already exist
