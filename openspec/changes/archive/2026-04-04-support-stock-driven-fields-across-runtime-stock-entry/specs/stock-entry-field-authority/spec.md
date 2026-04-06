## MODIFIED Requirements

### Requirement: Stock-writing surfaces SHALL persist complete stock keys
Any runtime surface that writes rows to `Stock` SHALL expose the stock-tracking dimensions and stock-defined runtime fields enabled by Stock Control Panel, and SHALL persist the values that are actually captured for the row. These workflows MAY begin with partial data from barcode lookup, import, or other prefills. Shared dimensions such as `Size` and `Color` MAY still be required by flow-specific rules, but configured stock-defined runtime fields SHALL NOT automatically become universal save blockers solely because they are enabled in Stock Control.

#### Scenario: Configured stock-defined field is exposed for capture
- **WHEN** Stock Control Panel enables a stock-defined runtime field for stock capture
- **THEN** the stock-writing workflow exposes that field in the row schema
- **AND** it preserves the value if the user provides one before writing the row to `Stock`

#### Scenario: Partial barcode resolution does not make stock-defined field universally mandatory
- **WHEN** barcode lookup or imported row data provides fewer values than the available stock-defined runtime field set
- **THEN** the workflow may begin with the partially resolved row
- **AND** it does not automatically fail solely because a configured stock-defined field remains blank unless a higher-level flow-specific rule requires it

#### Scenario: Present stock-defined field remains part of stock identity
- **WHEN** a stock-writing row includes one or more configured stock-defined runtime field values
- **THEN** the workflow persists those values with the `Stock` row
- **AND** downstream matching or grouping may use those values as part of stock identity semantics

#### Scenario: Stock adjustment preserves configured stock-defined fields without universal block
- **WHEN** Stock Control Panel configures one or more stock-defined runtime fields such as `field1` through `field10`
- **AND** a user enters one or more of those values on a stock adjustment row
- **THEN** stock adjustment persists the captured values onto the adjustment item and resulting `Stock` row
- **AND** it does not impose a blanket save block solely because some configured stock-defined fields remain blank

#### Scenario: Stock transfer preserves configured stock-defined fields without universal block
- **WHEN** Stock Control Panel configures one or more stock-defined runtime fields such as `field1` through `field10`
- **AND** a user enters one or more of those values on a stock transfer row
- **THEN** stock transfer persists the captured values on both transfer legs written to `Stock`
- **AND** it does not write those values through a narrower field contract than the rest of stock-writing runtime surfaces

### Requirement: Stock-writing value sourcing SHALL distinguish shared dimensions from stock-defined attributes
When a stock-writing screen captures tracked fields, it SHALL distinguish between shared master-backed dimensions such as `Size` and `Color` and stock-defined business attributes configured through Stock Control Panel. Shared master-backed dimensions MAY use item-scoped option lists when available, but SHALL fall back to normalized master selection or controlled master creation when Item Master is less granular. Stock-defined attributes such as configured `field1` through `field10` SHALL be treated as runtime stock-entry fields when they are active in Stock Control, and the stock-writing workflow MAY capture their values through direct operational entry according to Stock Control configuration.

#### Scenario: Shared master-backed dimension falls back to normalized master selection
- **WHEN** a stock-writing screen requires `Size` or `Color`
- **AND** Item Master does not provide item-scoped options at the needed stock granularity
- **THEN** the workflow may fall back to normalized master-backed selection or controlled master creation
- **AND** it does not persist the tracked field as unresolved free text

#### Scenario: Stock-defined attribute accepts direct operational entry
- **WHEN** Stock Control Panel configures a stock-defined business attribute such as `field1` through `field10`
- **THEN** the stock-writing screen shows that tracked attribute according to Stock Control
- **AND** the workflow may capture its value through direct operational entry rather than through Item Master option lists

#### Scenario: Opening stock uses the same stock-defined attribute contract as purchase inward
- **WHEN** Stock Control Panel configures runtime stock-defined fields that are active on Purchase Inward / Direct Inward
- **THEN** Opening Stock follows the same stock-defined field contract for field presence and persistence mapping
- **AND** it does not narrow the runtime stock-defined field set to only a subset unless Stock Control itself excludes the other fields
