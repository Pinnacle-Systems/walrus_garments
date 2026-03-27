## ADDED Requirements

### Requirement: Low-stock thresholds are location-specific only
The system SHALL persist low-stock thresholds only at the location level through `MinimumStockQty` records associated with an `ItemPriceList` row. The system MUST NOT persist an item-level or item-price-list-level minimum stock quantity field.

#### Scenario: Saving a standard item with location-wise thresholds
- **WHEN** a user saves a `STANDARD` item and enters minimum stock values for one or more locations
- **THEN** the system stores those values only as `MinimumStockQty` records linked to the single `ItemPriceList` row

#### Scenario: Saving a size-based item with location-wise thresholds
- **WHEN** a user saves a `SIZE` or `SIZE_COLOR` item and enters minimum stock values for a size or size-color row across locations
- **THEN** the system stores those values only as `MinimumStockQty` records linked to that row's `ItemPriceList`

### Requirement: Item-entry flows expose only location-level low-stock editing
The system SHALL expose low-stock configuration in item-entry workflows only through location-wise entries. The system MUST NOT show a standalone `Min Stock Qty` input that implies an item-level threshold.

#### Scenario: Standard item entry
- **WHEN** a user opens Item Master or quick-add item for a `STANDARD` item
- **THEN** the UI does not display a standalone minimum-stock field
- **AND** any low-stock configuration is done through location-specific rows

#### Scenario: Size-based item entry
- **WHEN** a user opens Item Master or quick-add item for a `SIZE` or `SIZE_COLOR` item
- **THEN** the UI allows low-stock configuration only through location-specific rows for each item-price-list row

### Requirement: A location can be configured only once per item-price row
The system SHALL allow at most one low-stock threshold per location for a given `ItemPriceList` row. The UI MUST prevent duplicate locations during editing, the backend MUST reject duplicate locations if they are submitted anyway, and the database MUST enforce uniqueness for persisted `(itemPriceListId, locationId)` pairs.

#### Scenario: User selects a location that is already configured
- **WHEN** a user edits stock alerts for an `ItemPriceList` row and a location is already used in another row of that editor
- **THEN** the UI does not allow that duplicate location to be selected again for the same `ItemPriceList` row

#### Scenario: All locations are already used
- **WHEN** a user has configured every available location for an `ItemPriceList` row
- **THEN** the UI does not offer another blank location row that would create a duplicate or unusable entry

#### Scenario: Duplicate locations are submitted through the API
- **WHEN** a client submits multiple `MinimumStockQty` rows with the same `locationId` for one `ItemPriceList` row
- **THEN** the backend rejects the payload instead of persisting ambiguous low-stock rules

#### Scenario: A duplicate location reaches persistence
- **WHEN** application validation is bypassed and a duplicate `(itemPriceListId, locationId)` pair is attempted in persistence
- **THEN** the database rejects the write instead of storing duplicate location thresholds

### Requirement: Stock-alert rows must be complete and valid
The system SHALL ignore fully blank stock-alert rows during save. The system MUST reject half-filled rows where only one of `locationId` or `minStockQty` is present. The system MUST accept only numeric non-negative integer values for `minStockQty`.

#### Scenario: Fully blank row is present during save
- **WHEN** a user saves an item-price row that includes a stock-alert row with no `locationId` and no `minStockQty`
- **THEN** the system ignores that blank row instead of persisting it

#### Scenario: Half-filled row is present during save
- **WHEN** a user saves an item-price row that includes a stock-alert row with only `locationId` or only `minStockQty`
- **THEN** the system rejects the save and indicates that the row must be fully completed or cleared

#### Scenario: Invalid minimum stock quantity is entered
- **WHEN** a user enters a negative, non-numeric, or fractional `minStockQty`
- **THEN** the system rejects that value and requires a numeric non-negative integer

#### Scenario: No valid location thresholds remain
- **WHEN** all stock-alert rows for an `ItemPriceList` row are blank or removed
- **THEN** the system treats that item-price row as having no configured low-stock alert

### Requirement: Low-stock alerts are evaluated only from location thresholds
The system SHALL evaluate low-stock alerts only from `MinimumStockQty.minStockQty` for the relevant item, size, color, and location combination. If no location-level threshold exists for a combination, the system MUST treat that combination as having no configured low-stock alert.

#### Scenario: Location threshold exists
- **WHEN** stock is evaluated for an item-price-list row at a location that has a `MinimumStockQty` record
- **THEN** the system marks the combination as low stock only when available quantity is below that location's minimum stock quantity

#### Scenario: No location threshold exists
- **WHEN** stock is evaluated for an item-price-list row at a location with no `MinimumStockQty` record
- **THEN** the system does not create a low-stock alert from a fallback item-level threshold
