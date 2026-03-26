## 1. Backend Model And API

- [ ] 1.1 Add `barcodeGenerationMethod` to the `ItemControlPanel` Prisma model and create the required migration
- [ ] 1.2 Update item control-panel create/get/update services to persist and return `barcodeGenerationMethod`
- [ ] 1.3 Remove `priceMethod` handling from item create/update/get services and delete the `Item.priceMethod` field from the Prisma model

## 2. Control Panel And Item Master UI

- [ ] 2.1 Replace the Item Settings barcode mode checkboxes with a single `barcodeGenerationMethod` selector
- [ ] 2.2 Update Shocks Item Master to load the centralized barcode generation method from item control panel
- [ ] 2.3 Remove the per-item `Price Method` selector from Item Master and render the standard, size, or size-color UI from the centralized mode
- [ ] 2.4 Update Item Master validation and barcode row generation to follow the centralized mode without sending `priceMethod`

## 3. Downstream Workflow Refactor

- [ ] 3.1 Update opening stock and stock adjustment flows to resolve price and barcode behavior from the centralized barcode generation method
- [ ] 3.2 Update quick-add item flows and any shared helpers that branch on `item.priceMethod`
- [ ] 3.3 Remove or rename remaining UI text that refers to item-level "Price Method" when it now means barcode generation mode

## 4. Verification

- [ ] 4.1 Verify Item Settings save/load behavior for `STANDARD`, `SIZE`, and `SIZE_COLOR`
- [ ] 4.2 Verify Item Master create and edit flows in each centralized mode
- [ ] 4.3 Verify opening stock, stock adjustment, and quick-add flows after `Item.priceMethod` removal
