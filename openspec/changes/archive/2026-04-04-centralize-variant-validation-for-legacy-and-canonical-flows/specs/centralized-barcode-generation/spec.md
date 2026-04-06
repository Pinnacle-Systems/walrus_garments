## MODIFIED Requirements

### Requirement: Item Master behavior follows centralized barcode generation mode
The system SHALL centralize canonical item barcode-definition behavior under the shared `barcodeGenerationMethod` settings so that Item Master and related canonical inventory flows collect and persist a consistent modern item shape for new item variants. The centralized mode SHALL define canonical size/color requiredness for non-legacy item variants and SHALL NOT make stock-defined runtime fields such as `field1` through `field10` mandatory by itself.

#### Scenario: Standard mode uses the item-only canonical definition
- **GIVEN** `barcodeGenerationMethod` is `STANDARD`
- **WHEN** Item Master or a canonical inventory intake flow validates a non-legacy item row
- **THEN** the canonical item definition SHALL allow the row without size or color assignments
- **AND** the centralized mode SHALL not require stock-defined runtime fields for that row.

#### Scenario: Size mode requires canonical size assignment
- **GIVEN** `barcodeGenerationMethod` is `SIZE`
- **WHEN** Item Master or a canonical inventory intake flow validates a non-legacy item row
- **THEN** the canonical item definition SHALL require a size assignment before the row can be persisted
- **AND** the centralized mode SHALL not require a color assignment unless the mode is `SIZE_COLOR`.

#### Scenario: Size and color mode requires canonical size and color assignment
- **GIVEN** `barcodeGenerationMethod` is `SIZE_COLOR`
- **WHEN** Item Master or a canonical inventory intake flow validates a non-legacy item row
- **THEN** the canonical item definition SHALL require both size and color assignments before the row can be persisted.

#### Scenario: Legacy compatibility flow does not inherit canonical requiredness
- **GIVEN** an Opening Stock or other legacy-compatible flow is handling a legacy item shape
- **WHEN** the current `barcodeGenerationMethod` is `SIZE` or `SIZE_COLOR`
- **THEN** the flow SHALL NOT require size or color solely because of the centralized barcode mode
- **AND** the flow SHALL remain permissive for stock-defined runtime fields.

### Requirement: Inventory workflows use centralized barcode generation mode
Inventory workflows that create or validate canonical item-variant structure SHALL use the centralized `barcodeGenerationMethod` so that Item Master, Purchase Inward, Purchase Return, and related canonical flows stay aligned. Legacy Opening Stock compatibility handling SHALL remain outside canonical barcode-requiredness enforcement, and stock-entry field presence SHALL not be inferred from barcode mode alone.

#### Scenario: Canonical purchase inward follows centralized mode
- **GIVEN** a user is receiving new canonical stock through Purchase Inward
- **WHEN** the selected item row is validated before persistence
- **THEN** the workflow SHALL apply the centralized `barcodeGenerationMethod` to determine whether size and color are required for that canonical row.

#### Scenario: Canonical purchase return preserves centralized variant shape
- **GIVEN** a user is returning stock through Purchase Return for a canonical inventory flow
- **WHEN** the return row is validated or reconstructed from the source inward row
- **THEN** the workflow SHALL preserve the size/color completeness required by the centralized barcode mode for that canonical row.

#### Scenario: Opening stock uses centralized mode only as compatibility context
- **GIVEN** a user adds or reconciles stock through Opening Stock
- **WHEN** the current `barcodeGenerationMethod` requires size or color in canonical flows
- **THEN** Opening Stock SHALL NOT treat that centralized mode as a hard requiredness rule for the legacy row
- **AND** Opening Stock SHALL remain the permissive compatibility path for coarse or historical stock.
