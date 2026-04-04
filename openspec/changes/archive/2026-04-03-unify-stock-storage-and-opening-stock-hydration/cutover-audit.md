# Legacy Stock Runtime Audit

## Live Runtime Dependencies

The remaining runtime `legacyStock` dependencies are intentionally concentrated in [`src/services/stock.service.js`](/home/ajay/workspace/walrus_garments/src/services/stock.service.js):

- `getUnifiedStock`
  Uses location-name fallback (`old` / `warehouse`) to read from `legacyStock`.
- `getUnifiedStockReport`
  Uses location-name fallback (`old`) to read grouped totals from `legacyStock`.
- `getUnifiedStockWithLegacyByBarcode`
  Merges `stock` and `legacyStock` barcode matches during the validation window.
- `getLegacyStockReconciliation`
  Reads both tables only for comparison; this is a validation-only path and should remain until cutover is complete.

The remaining non-operational references are master-data `_count` includes:

- [`src/services/color.service.js`](/home/ajay/workspace/walrus_garments/src/services/color.service.js)
- [`src/services/size.service.js`](/home/ajay/workspace/walrus_garments/src/services/size.service.js)
- [`src/services/uom.service.js`](/home/ajay/workspace/walrus_garments/src/services/uom.service.js)

These are not transaction-driving paths, but they still depend on the `LegacyStock` relation and must be removed before retiring the table.

## Controlled Cutover Plan

### Phase 1: Dual-read validation

- Keep the current unified endpoints available with legacy fallback enabled by default.
- Use [`/stock/reconciliation`](/home/ajay/workspace/walrus_garments/src/routes/stock.route.js) to compare `legacyStock` and `stock` for:
  - operational keys
  - report keys
  - barcode keys

### Phase 2: Stock-only shadow runs

- All unified stock endpoints now support `includeLegacy=false`:
  - `/stock/unified`
  - `/stock/unified-report`
  - `/stock/unified-barcode`
- Use this flag to exercise stock-only behavior without deleting fallback code.
- Compare stock-only responses against reconciliation output for the same stores, items, and barcodes.

### Phase 3: Backfill and verify

- Backfill active `legacyStock` rows into `stock`.
- Re-run reconciliation until:
  - operational mismatches are zero
  - report mismatches are zero
  - barcode mismatches are zero or explicitly understood

### Phase 4: Remove fallback

- Remove location-name-based fallback from `getUnifiedStock` and `getUnifiedStockReport`.
- Remove merged-table fallback from `getUnifiedStockWithLegacyByBarcode`.
- Remove `LegacyStock` `_count` references from color/size/uom services.
- Keep reconciliation only if needed for a short post-cutover validation window, then remove it too.

Status update:
- Completed in code.
- The remaining Prisma migration drops the `legacystock` table after the backfill validation returned zero remaining legacy rows in the local database.
