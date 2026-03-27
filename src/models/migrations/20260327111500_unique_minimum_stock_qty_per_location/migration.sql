ALTER TABLE `MinimumStockQty`
ADD CONSTRAINT `MinimumStockQty_itemPriceListId_locationId_key`
UNIQUE (`itemPriceListId`, `locationId`);
