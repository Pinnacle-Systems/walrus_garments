-- DropForeignKey
ALTER TABLE `itempricelist` DROP FOREIGN KEY `ItemPriceList_itemId_fkey`;

-- DropForeignKey
ALTER TABLE `minimumstockqty` DROP FOREIGN KEY `MinimumStockQty_itemPriceListId_fkey`;

-- AlterTable
ALTER TABLE `item` ADD COLUMN `field1` VARCHAR(191) NULL,
    ADD COLUMN `field2` VARCHAR(191) NULL,
    ADD COLUMN `field3` VARCHAR(191) NULL,
    ADD COLUMN `field4` VARCHAR(191) NULL,
    ADD COLUMN `field5` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `ItemControlPanel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `field1` VARCHAR(191) NULL,
    `field2` VARCHAR(191) NULL,
    `field3` VARCHAR(191) NULL,
    `field4` VARCHAR(191) NULL,
    `field5` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ItemPriceList` ADD CONSTRAINT `ItemPriceList_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Item`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MinimumStockQty` ADD CONSTRAINT `MinimumStockQty_itemPriceListId_fkey` FOREIGN KEY (`itemPriceListId`) REFERENCES `ItemPriceList`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
