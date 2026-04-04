## MODIFIED Requirements

### Requirement: Delivery fulfillment allocation SHALL remain secondary to the visible document shape
The system MAY let the user allocate a converted delivery line against one or more stock identities underneath the visible delivery document, but that allocation detail SHALL NOT force the visible delivery grid to become stock-shaped.

#### Scenario: Converted delivery line resolves ambiguous stock through candidate allocation
- **WHEN** a converted delivery line is less granular than the compatible stock buckets available for fulfillment
- **THEN** the workflow returns the candidate stock buckets for that delivery line
- **AND** the user must select one or more buckets before inventory reduction
- **AND** the visible delivery line still remains in the source sale-order shape
