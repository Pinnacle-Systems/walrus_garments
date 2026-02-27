/*
  Warnings:

  - You are about to drop the column `fromCustomerId` on the `stocktransfer` table. All the data in the column will be lost.
  - You are about to drop the column `fromOrderId` on the `stocktransfer` table. All the data in the column will be lost.
  - You are about to drop the column `toCustomerId` on the `stocktransfer` table. All the data in the column will be lost.
  - You are about to drop the column `toOrderId` on the `stocktransfer` table. All the data in the column will be lost.
  - You are about to drop the column `transferType` on the `stocktransfer` table. All the data in the column will be lost.
  - You are about to drop the `fromordertransferitems` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `toordertransferttems` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `fromordertransferitems` DROP FOREIGN KEY `FromOrderTransferItems_accessoryGroupId_fkey`;

-- DropForeignKey
ALTER TABLE `fromordertransferitems` DROP FOREIGN KEY `FromOrderTransferItems_accessoryId_fkey`;

-- DropForeignKey
ALTER TABLE `fromordertransferitems` DROP FOREIGN KEY `FromOrderTransferItems_accessoryItemId_fkey`;

-- DropForeignKey
ALTER TABLE `fromordertransferitems` DROP FOREIGN KEY `FromOrderTransferItems_colorId_fkey`;

-- DropForeignKey
ALTER TABLE `fromordertransferitems` DROP FOREIGN KEY `FromOrderTransferItems_orderDetailsId_fkey`;

-- DropForeignKey
ALTER TABLE `fromordertransferitems` DROP FOREIGN KEY `FromOrderTransferItems_stockTransferId_fkey`;

-- DropForeignKey
ALTER TABLE `fromordertransferitems` DROP FOREIGN KEY `FromOrderTransferItems_yarnId_fkey`;

-- DropForeignKey
ALTER TABLE `stocktransfer` DROP FOREIGN KEY `StockTransfer_fromOrderId_fkey`;

-- DropForeignKey
ALTER TABLE `stocktransfer` DROP FOREIGN KEY `StockTransfer_toOrderId_fkey`;

-- DropForeignKey
ALTER TABLE `toordertransferttems` DROP FOREIGN KEY `ToOrderTransferTtems_RequirementPlanningId_fkey`;

-- DropForeignKey
ALTER TABLE `toordertransferttems` DROP FOREIGN KEY `ToOrderTransferTtems_colorId_fkey`;

-- DropForeignKey
ALTER TABLE `toordertransferttems` DROP FOREIGN KEY `ToOrderTransferTtems_orderDetailsId_fkey`;

-- DropForeignKey
ALTER TABLE `toordertransferttems` DROP FOREIGN KEY `ToOrderTransferTtems_stockTransferId_fkey`;

-- DropForeignKey
ALTER TABLE `toordertransferttems` DROP FOREIGN KEY `ToOrderTransferTtems_yarnId_fkey`;

-- AlterTable
ALTER TABLE `stock` ADD COLUMN `sectionId` INTEGER NULL;

-- AlterTable
ALTER TABLE `stocktransfer` DROP COLUMN `fromCustomerId`,
    DROP COLUMN `fromOrderId`,
    DROP COLUMN `toCustomerId`,
    DROP COLUMN `toOrderId`,
    DROP COLUMN `transferType`,
    ADD COLUMN `fromLocationId` INTEGER NULL,
    ADD COLUMN `toLocationId` INTEGER NULL;

-- DropTable
DROP TABLE `fromordertransferitems`;

-- DropTable
DROP TABLE `toordertransferttems`;

-- CreateTable
CREATE TABLE `FromLocationTransferItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stockTransferId` INTEGER NULL,
    `itemId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `transferQty` DOUBLE NULL,
    `stockQty` DOUBLE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ToLocationTransferTtems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stockTransferId` INTEGER NULL,
    `itemId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `style` VARCHAR(191) NULL,
    `qty` DOUBLE NULL,
    `transferQty` DOUBLE NULL,
    `balanceQty` DOUBLE NULL,
    `requiredQty` DOUBLE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_sectionId_fkey` FOREIGN KEY (`sectionId`) REFERENCES `Section`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockTransfer` ADD CONSTRAINT `StockTransfer_fromLocationId_fkey` FOREIGN KEY (`fromLocationId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockTransfer` ADD CONSTRAINT `StockTransfer_toLocationId_fkey` FOREIGN KEY (`toLocationId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FromLocationTransferItems` ADD CONSTRAINT `FromLocationTransferItems_stockTransferId_fkey` FOREIGN KEY (`stockTransferId`) REFERENCES `StockTransfer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FromLocationTransferItems` ADD CONSTRAINT `FromLocationTransferItems_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Item`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FromLocationTransferItems` ADD CONSTRAINT `FromLocationTransferItems_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FromLocationTransferItems` ADD CONSTRAINT `FromLocationTransferItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ToLocationTransferTtems` ADD CONSTRAINT `ToLocationTransferTtems_stockTransferId_fkey` FOREIGN KEY (`stockTransferId`) REFERENCES `StockTransfer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ToLocationTransferTtems` ADD CONSTRAINT `ToLocationTransferTtems_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Item`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ToLocationTransferTtems` ADD CONSTRAINT `ToLocationTransferTtems_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ToLocationTransferTtems` ADD CONSTRAINT `ToLocationTransferTtems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
