# hybrid-stock-allocation Specification

## Purpose
Define how hybrid fulfillment workflows resolve broad stock searches into explicit stock-bucket allocations before reducing inventory.

## Requirements
### Requirement: Hybrid fulfillment lookup SHALL return candidate stock buckets for broad matches
When a hybrid fulfillment workflow searches stock with fewer dimensions than the tracked stock identity, the system SHALL return the compatible candidate stock buckets rather than silently collapsing ambiguous results into one consumable stock row.

#### Scenario: Broad lookup returns multiple candidate buckets
- **WHEN** a Sales Delivery, Sales Return, or POS lookup resolves an item-facing line to more than one compatible stock bucket
- **THEN** the workflow returns the matching candidate stock buckets with their differentiating tracked dimensions and available quantities
- **AND** it does not silently choose one candidate for stock reduction

#### Scenario: Broad lookup returns one candidate bucket
- **WHEN** a hybrid fulfillment lookup resolves exactly one compatible stock bucket
- **THEN** the workflow may auto-select that bucket for provisional allocation
- **AND** it still treats that allocation as provisional until save

#### Scenario: Broad lookup returns no candidate buckets
- **WHEN** a hybrid fulfillment lookup does not resolve any compatible stock bucket
- **THEN** the workflow reports that no fulfillable stock match exists for the requested line
- **AND** it does not invent a pooled or fallback stock identity

### Requirement: Hybrid fulfillment save SHALL consume from explicit stock buckets
Any stock-reducing save in a hybrid fulfillment workflow SHALL reduce inventory from one or more explicit stock buckets chosen by the user or auto-selected through an unambiguous match.

#### Scenario: Ambiguous match requires explicit user selection
- **WHEN** the lookup returns more than one compatible stock bucket
- **THEN** the workflow requires the user to select one or more concrete stock buckets before save
- **AND** it does not consume inventory from an ambiguous pooled match

#### Scenario: Requested quantity may be split across multiple stock buckets
- **WHEN** the requested fulfillment quantity cannot be satisfied by a single selected stock bucket
- **THEN** the workflow may allocate the visible line across multiple stock buckets underneath that line
- **AND** the visible line does not need to become stock-bucket-shaped

### Requirement: Hybrid fulfillment allocation SHALL remain provisional until final save
Candidate stock-bucket matches and user selections SHALL remain provisional until final save, and the server SHALL revalidate the selected allocations against current stock before inventory recording.

#### Scenario: Save rejects stale selected allocation
- **WHEN** one or more selected stock buckets no longer have enough available quantity at save time
- **THEN** the server rejects the fulfillment save
- **AND** requires the user to refresh or reallocate the affected quantities before inventory is reduced

#### Scenario: Save commits explicit allocation and stock movement together
- **WHEN** the selected stock buckets remain valid at save time
- **THEN** the system persists the fulfillment record, the explicit bucket allocation, and the resulting stock-out movement together
- **AND** it does so without collapsing the chosen buckets into an untraceable pooled deduction
