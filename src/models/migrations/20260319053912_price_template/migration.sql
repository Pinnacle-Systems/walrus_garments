-- AlterTable
ALTER TABLE `item` ADD COLUMN `sku` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `pricetemplate` ADD COLUMN `itemId` INTEGER NULL,
    ADD COLUMN `price` DOUBLE NULL,
    ADD COLUMN `qty` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `PriceTemplate` ADD CONSTRAINT `PriceTemplate_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Item`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
