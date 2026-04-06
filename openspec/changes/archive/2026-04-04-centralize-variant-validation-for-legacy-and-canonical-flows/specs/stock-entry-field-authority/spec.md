## MODIFIED Requirements

### Requirement: Stock Control Panel SHALL be the only authority for stock-entry field schema
Runtime stock-writing and stock-assisted operational screens SHALL derive available stock-defined attributes and stock-granularity support from Stock Control Panel configuration. Item-level or centralized barcode-generation settings SHALL NOT determine whether stock-defined runtime fields such as `field1` through `field10` exist. Canonical size/color requiredness for non-legacy flows MAY still come from centralized barcode-generation mode, but Stock Control SHALL remain the authority for which stock-defined attributes participate in stock capture and stock identity semantics.

#### Scenario: Stock Control exposes stock-defined runtime attributes
- **WHEN** Stock Control Panel configures one or more stock-defined runtime fields
- **THEN** relevant stock-writing or stock-assisted operational screens expose those attributes as supported stock-entry fields
- **AND** barcode-generation mode does not remove them from the screen schema.

#### Scenario: Canonical size and color requiredness is not derived from stock-defined fields
- **WHEN** a canonical inventory flow requires size or color for a row
- **THEN** that requirement comes from the centralized barcode-generation contract for the flow
- **AND** not from whether Stock Control labels `field1` through `field10`.

#### Scenario: Matching field numbers do not cross item and stock authority layers
- **WHEN** Item Control Panel and Stock Control Panel both define configurable fields with similar names such as `field1`
- **THEN** runtime stock-writing screens do not assume those fields are the same attribute by default
- **AND** the stock-writing workflow continues to follow Stock Control Panel for stock-defined field availability.

### Requirement: Stock-writing surfaces SHALL persist complete stock keys
Runtime surfaces that write rows to `Stock` SHALL preserve the stock-tracking dimensions and stock-defined attributes that are actually present for the row, but configured stock-defined runtime fields SHALL NOT automatically become unconditional required-entry fields. Canonical flows MAY still block save when size or color are missing according to centralized barcode-generation mode, while legacy compatibility flows MAY persist coarser rows without size, color, or stock-defined runtime values.

#### Scenario: Canonical flow blocks save for missing barcode-mode dimensions
- **WHEN** a canonical Purchase Inward or Purchase Return row is missing size or color required by the centralized barcode-generation mode
- **THEN** the workflow blocks the save
- **AND** prompts the user to complete the missing canonical dimensions before writing the row to `Stock`.

#### Scenario: Legacy compatibility flow allows coarse stock row
- **WHEN** a legacy Opening Stock row omits size, color, or one or more stock-defined runtime fields
- **THEN** the workflow MAY still persist the coarse stock row
- **AND** it does not reject the row solely because those values are absent.

#### Scenario: Present stock-defined fields remain part of stock identity
- **WHEN** a runtime stock-writing row includes one or more stock-defined runtime field values
- **THEN** the workflow persists those values with the stock row
- **AND** downstream stock matching or grouping MAY use those values as part of stock identity semantics.

### Requirement: Stock-writing value sourcing SHALL distinguish shared dimensions from stock-defined attributes
When a stock-writing screen captures tracked fields, it SHALL distinguish between canonical shared dimensions such as `Size` and `Color` and stock-defined business attributes configured through Stock Control Panel. Shared dimensions in canonical flows SHALL follow centralized barcode-generation requiredness for completeness, while stock-defined attributes SHALL remain supported stock-granularity values that may be captured and persisted without becoming universally mandatory.

#### Scenario: Canonical shared dimension follows centralized requiredness
- **WHEN** a canonical inventory flow validates `Size` or `Color`
- **THEN** it applies the centralized barcode-generation contract to decide whether the dimension must be present
- **AND** it does not infer that requiredness from Stock Control labels alone.

#### Scenario: Stock-defined attribute accepts optional operational entry
- **WHEN** Stock Control Panel configures a stock-defined business attribute such as `field1` through `field10`
- **THEN** the stock-writing screen shows that supported attribute according to Stock Control
- **AND** the workflow may capture and persist its value when present
- **AND** the attribute does not become universally mandatory just because it is configured.
