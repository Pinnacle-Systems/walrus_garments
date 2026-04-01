## ADDED Requirements

### Requirement: Operational stock writes SHALL use the stock table only
The system SHALL persist all new operational stock movements in the `stock` table. Opening stock, stock adjustment, and stock transfer SHALL NOT depend on `legacyStock` for new writes after the unified model is enabled.

#### Scenario: Opening stock saves into stock table
- **WHEN** a user saves opening-stock rows after the unified stock model is enabled
- **THEN** the system writes those rows to the `stock` table
- **AND** does not route the write to `legacyStock` based on location naming

#### Scenario: Stock adjustment saves into stock table
- **WHEN** a user saves a stock adjustment after the unified stock model is enabled
- **THEN** the system writes the resulting stock movement rows to the `stock` table
- **AND** does not route the write to `legacyStock`

#### Scenario: Stock transfer writes both legs into stock table
- **WHEN** a user saves a stock transfer after the unified stock model is enabled
- **THEN** the system writes both the outbound and inbound stock movement rows to the `stock` table
- **AND** does not split the transfer between `stock` and `legacyStock`

### Requirement: Unified stock lookups SHALL resolve from stock table snapshots
Barcode-assisted and stock-query workflows SHALL use stock rows in the `stock` table as the operational inventory snapshot. The system MAY read `legacyStock` only during migration cutover, but the steady-state lookup contract SHALL be based on `stock`.

#### Scenario: Barcode lookup returns stock row snapshot
- **WHEN** a user scans or enters a barcode for a stock-assisted workflow
- **THEN** the system resolves the matching stock row snapshot from the unified `stock` table
- **AND** returns the row dimensions and stock quantity needed by the workflow

#### Scenario: Migration window can include legacy rows
- **WHEN** the system is in the migration window before `legacyStock` is retired
- **THEN** unified lookup may include migrated compatibility reads from `legacyStock`
- **AND** the workflow still presents the result as a stock-row snapshot for downstream completion

### Requirement: Legacy stock SHALL be retired as an active runtime boundary
The system SHALL phase out `legacyStock` as a location-based runtime routing mechanism and SHALL remove active dependency on location names such as `old` or `warehouse` to choose the stock table.

#### Scenario: Location names do not choose stock table
- **WHEN** the system determines where to persist or fetch operational stock after the unified model is enabled
- **THEN** it does not use location naming conventions to choose between `stock` and `legacyStock`

#### Scenario: Legacy rows are backfilled before retirement
- **WHEN** `legacyStock` is retired from active runtime use
- **THEN** active legacy stock rows have been backfilled into `stock`
- **AND** the application can serve operational stock behavior without requiring `legacyStock` as a primary source
