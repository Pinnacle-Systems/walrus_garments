## MODIFIED Requirements

### Requirement: Transaction screens SHALL use role-specific authority sources
The system SHALL classify transaction screens by role and SHALL use the matching authority source for visible document fields and option lists. Catalog-driven screens SHALL use Item Master and Item Price List. Stock-writing screens SHALL use Stock Control. Hybrid fulfillment screens SHALL preserve the source sales-document shape on the visible document while using stock snapshots or allocation underneath when operationally required.

#### Scenario: Hybrid fulfillment lookup does not silently collapse ambiguous stock identity
- **WHEN** a user searches or scans from a hybrid fulfillment screen using a line shape that is less granular than tracked stock identity
- **AND** more than one compatible stock bucket matches that lookup
- **THEN** the workflow returns the candidate stock buckets for explicit resolution underneath the visible document line
- **AND** it does not silently pool or choose a stock bucket for inventory reduction
