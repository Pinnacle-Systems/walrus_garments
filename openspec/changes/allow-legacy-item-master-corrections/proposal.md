## Why

The current Item Master implementation is stricter than the existing legacy-item model requires. Archived specs already say legacy items must remain flat and non-variant, but they also say Item Master is the correction surface for legacy items and that location-level stock alerts are edited in item-entry flows.

Today, legacy items with linked records are broadly disabled in Item Master through `childRecord > 0` guards, which blocks routine correction work such as alias/code/category updates and location-wise stock-alert maintenance. That behavior makes legacy-item correction harder than intended and conflicts with the approved legacy compatibility model.

## What Changes

- Clarify that Item Master must allow approved flat-field corrections for legacy items even when linked records already exist.
- Clarify that legacy-item correction includes location-level stock-alert editing on the single flat `ItemPriceList` row.
- Keep the existing legacy-item constraint that legacy items remain flat and cannot be expanded into canonical size or size-color sellable structure.
- Define the boundary between editable correction fields and still-protected structure-changing controls so implementation can relax the blanket lock without reopening variant growth.

## Capabilities

### New Capabilities

### Modified Capabilities
- `opening-stock-hydration`: Clarify the allowed correction scope for legacy items in Item Master.
- `location-level-low-stock-alerts`: Clarify that legacy-item correction flows keep location-level stock-alert editing available.

## Impact

- Item Master legacy edit UX and field enablement rules
- Any shared `childRecord`-based disabling logic applied to legacy item correction
- Regression coverage for legacy item correction and stock-alert editing
