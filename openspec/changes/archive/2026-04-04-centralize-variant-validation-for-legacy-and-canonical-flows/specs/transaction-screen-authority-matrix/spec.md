## MODIFIED Requirements

### Requirement: Transaction screens SHALL use role-specific authority sources
The system SHALL classify transaction screens by role and SHALL use the matching authority source for visible document fields, option lists, and validation behavior. Catalog-driven screens SHALL use Item Master and Item Price List. Canonical stock-intake screens such as Purchase Inward and Purchase Return SHALL use centralized barcode-generation mode for canonical size/color requiredness while still using Stock Control for supported stock-defined runtime attributes. Legacy compatibility screens such as Opening Stock SHALL preserve permissive historical intake behavior. Hybrid fulfillment screens SHALL preserve the source sales-document shape on the visible document while using stock snapshots or allocation underneath when operationally required.

#### Scenario: Matching field numbers do not imply shared authority
- **WHEN** Item Control Panel and Stock Report Control both define configurable fields with similar labels such as `field1`
- **THEN** the system does not assume those fields share the same meaning or authority just because their field numbers match
- **AND** catalog-driven screens follow item-defined attributes while stock-writing screens follow stock-defined attributes.

#### Scenario: User opens a catalog-driven sales screen
- **WHEN** a user opens Estimate / Quotation or Sale Order
- **THEN** the screen derives visible sales dimensions and selectable combinations from Item Master and Item Price List
- **AND** it does not use stock presence as the source of document shape.

#### Scenario: User opens a canonical stock-intake screen
- **WHEN** a user opens Purchase Inward or Purchase Return
- **THEN** the screen validates canonical size/color completeness from centralized barcode-generation mode
- **AND** it uses Stock Control for supported stock-defined runtime attributes
- **AND** it does not treat legacy Opening Stock permissiveness as the authority for canonical validation.

#### Scenario: User opens a legacy compatibility stock screen
- **WHEN** a user opens Opening Stock
- **THEN** the screen acts as the compatibility-oriented path for historical or coarse stock
- **AND** it remains permissive for missing size, color, and stock-defined runtime fields unless a legacy-specific rule explicitly requires otherwise.

#### Scenario: Purchase Inward and Opening Stock have different stock-intake intent
- **WHEN** the user is receiving newly inwarded stock that follows the current item-master and centralized barcode-generation rules
- **THEN** Purchase Inward acts as the normal canonical operational intake screen
- **AND** Purchase Inward is the path that enforces canonical size/color completeness
- **AND** Opening Stock remains the compatibility intake path for pre-existing or coarse stock whose captured shape may not satisfy canonical variant rules.

#### Scenario: User opens a hybrid fulfillment screen
- **WHEN** a user opens Sales Delivery, Sales Return, or Point Of Sales
- **THEN** the visible document starts from the source sales-document shape or item-facing selling shape for that workflow
- **AND** the workflow may use stock snapshots or allocation logic underneath to execute fulfillment or reversal.

#### Scenario: Hybrid fulfillment uses payment and stock execution underneath visible sales lines
- **WHEN** a user works in Sales Delivery as a hybrid fulfillment screen
- **THEN** the visible delivery lines remain sale-order-shaped
- **AND** the workflow may separately enforce payment-capacity and stock-allocation rules underneath those visible lines.
