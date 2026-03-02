-- AlterTable
ALTER TABLE `minimumstockqty` ADD COLUMN `itemPriceListId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `MinimumStockQty` ADD CONSTRAINT `MinimumStockQty_itemPriceListId_fkey` FOREIGN KEY (`itemPriceListId`) REFERENCES `ItemPriceList`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
