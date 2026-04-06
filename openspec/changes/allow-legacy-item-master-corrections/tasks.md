## 1. Legacy Item Correction Rules

- [x] 1.1 Audit the current Item Master legacy edit surface and identify which controls are disabled only because of blanket `childRecord > 0` logic.
- [x] 1.2 Define and implement an explicit allowlist for legacy-item flat corrections in edit mode, covering approved core fields while preserving view-only mode behavior.
- [x] 1.3 Keep legacy-item structural protections in place so edit mode still cannot add size-wise or size-color-wise sellable structure or extra `ItemPriceList` rows.

## 2. Legacy Stock-Alert Editing

- [x] 2.1 Ensure the simplified legacy pricing surface continues to expose the single-row location-level stock-alert editor in Item Master.
- [x] 2.2 Allow users to save updated location-level stock alerts for legacy items even when linked records already exist.
- [x] 2.3 Verify backend save behavior still treats legacy items as one flat price row while preserving stock-alert validation rules.

## 3. Verification

- [x] 3.1 Add or update regression coverage for editing approved flat legacy fields through Item Master.
- [x] 3.2 Add or update regression coverage that legacy items still cannot gain canonical size or color structure through Item Master.
- [ ] 3.3 Manually verify a linked legacy item can update approved core fields and stock alerts but cannot access variant-expansion actions.
