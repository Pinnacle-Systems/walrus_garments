## 1. Backend Model And API

- [x] 1.1 Add `barcodeGenerationMethod` to the `ItemControlPanel` Prisma model and create the required migration
- [x] 1.2 Remove `sizeWise` and `size_color_wise` from `ItemControlPanel` as part of the same migration, with `barcodeGenerationMethod` defaulting to `STANDARD`
- [x] 1.3 Update item control-panel create/get/update services to persist and return `barcodeGenerationMethod`
- [x] 1.4 Remove `priceMethod` handling from item create/update/get services and delete the `Item.priceMethod` field from the Prisma model

## 2. Control Panel And Item Master UI

- [x] 2.1 Replace the Item Settings barcode mode checkboxes with a single `barcodeGenerationMethod` selector
- [x] 2.1.1 Keep the new Item Settings control visually consistent with the existing page layout, labels, spacing, and form styling
- [x] 2.2 Ensure Item Settings and any control-panel consumers resolve missing saved state to `STANDARD`
- [x] 2.3 Update Shocks Item Master to load the centralized barcode generation method from item control panel
- [x] 2.4 Update Price Template Master and any related control-panel readers to use `barcodeGenerationMethod` instead of `priceMethod` or legacy flags
- [x] 2.5 Remove the per-item `Price Method` selector and any visible barcode-generation-mode field from Item Master, and render the standard, size, or size-color UI from the centralized mode
- [x] 2.6 Update Item Master validation and barcode row generation to follow the centralized mode without sending `priceMethod`, and remove any stricter validation that applies only to `STANDARD`

## 3. Downstream Workflow Refactor

- [x] 3.1 Update opening stock and stock adjustment flows to resolve price and barcode behavior from the centralized barcode generation method
- [x] 3.2 Update quick-add item flows to inherit or fetch the centralized barcode generation method instead of maintaining their own `priceMethod` selector or visible mode field
- [x] 3.3 Update shared helpers and item-dependent option builders that branch on `item.priceMethod`
- [x] 3.4 Remove or rename remaining UI text that refers to item-level "Price Method" when it now means barcode generation mode

## 4. Verification

- [x] 4.1 Verify Item Settings save/load behavior for `STANDARD`, `SIZE`, and `SIZE_COLOR`
- [x] 4.2 Verify Item Master create and edit flows in each centralized mode
- [x] 4.3 Verify Price Template Master and any other control-panel readers still load correctly after the control-panel schema change
- [x] 4.4 Verify opening stock, stock adjustment, and quick-add flows after `Item.priceMethod` removal

## 5. Manual Verification Checklist

- [x] 5.1 With no saved `ItemControlPanel` barcode mode, open item-driven workflows and confirm the effective mode resolves to `STANDARD`
- [x] 5.2 In Item Settings, save `STANDARD`, reload the screen, and confirm `barcodeGenerationMethod` persists as the only barcode-mode setting
- [x] 5.3 In Item Settings, save `SIZE`, reload the screen, and confirm the saved mode persists
- [x] 5.4 In Item Settings, save `SIZE_COLOR`, reload the screen, and confirm the saved mode persists
- [x] 5.5 With Item Settings set to `STANDARD`, open Item Master and confirm there is no mode selector and only the standard barcode, SKU, and sales-price inputs are shown
- [x] 5.5.1 With Item Settings set to `STANDARD`, confirm Item Master does not apply an extra stricter validation rule that exists only for `STANDARD`
- [x] 5.6 With Item Settings set to `SIZE`, open Item Master and confirm there is no mode selector and size-based price rows are shown
- [x] 5.7 With Item Settings set to `SIZE_COLOR`, open Item Master and confirm there is no mode selector and size-color-based price rows are shown
- [x] 5.8 Create and edit an item successfully in each centralized mode without sending or depending on `priceMethod`
- [x] 5.9 Open Price Template Master and confirm it still loads correctly using centralized barcode-generation mode data
- [x] 5.10 In Opening Stock, confirm item price and barcode behavior follows the centralized mode for `STANDARD`, `SIZE`, and `SIZE_COLOR`
- [x] 5.11 In Stock Adjustment, confirm item price and barcode behavior follows the centralized mode for `STANDARD`, `SIZE`, and `SIZE_COLOR`
- [x] 5.12 Open quick-add item from Opening Stock and confirm the mode is inherited from the parent flow and is not editable in the modal
- [x] 5.13 Open quick-add item from Stock Adjustment and confirm the mode is inherited from the parent flow and is not editable in the modal
- [x] 5.14 Confirm remaining item-related screens do not show the centralized barcode-generation mode outside Item Settings and no longer show user-facing `Price Method` terminology where behavior is now derived from Item Settings
