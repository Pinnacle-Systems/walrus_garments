## MODIFIED Requirements

### Requirement: Item Master SHALL be the correction surface for legacy items
Legacy items SHALL remain editable through Item Master for correction of flat master data, but Item Master SHALL present legacy items through a simplified edit surface that preserves the flat one-row `ItemPriceList` model.

#### Scenario: Item Master edits a legacy item in simplified mode
- **WHEN** a user opens an existing legacy item in Item Master
- **THEN** Item Master exposes the flat legacy fields needed for correction
- **AND** it does not expose variant-expansion controls that would add extra `ItemPriceList` rows or size/color sellable structure

#### Scenario: Linked records do not block approved flat legacy corrections
- **WHEN** a user edits a legacy item in Item Master and that item already has linked stock or transaction records
- **THEN** the workflow still allows approved flat-field corrections that preserve the one-row legacy model
- **AND** it does not treat linked records alone as a reason to make the entire simplified legacy edit surface read-only

#### Scenario: Legacy item still cannot gain variant structure during correction
- **WHEN** a user edits a legacy item in Item Master after linked records already exist
- **THEN** the workflow still blocks actions that would add size-wise or size-color-wise sellable structure
- **AND** it still preserves exactly one flat `ItemPriceList` row with `sizeId = null` and `colorId = null`
