/*
  Warnings:

  - You are about to drop the `stocktransferitems` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `yarntransferdetails` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `stocktransferitems` DROP FOREIGN KEY `StockTransferItems_accessoryGroupId_fkey`;

-- DropForeignKey
ALTER TABLE `stocktransferitems` DROP FOREIGN KEY `StockTransferItems_accessoryId_fkey`;

-- DropForeignKey
ALTER TABLE `stocktransferitems` DROP FOREIGN KEY `StockTransferItems_accessoryItemId_fkey`;

-- DropForeignKey
ALTER TABLE `stocktransferitems` DROP FOREIGN KEY `StockTransferItems_colorId_fkey`;

-- DropForeignKey
ALTER TABLE `stocktransferitems` DROP FOREIGN KEY `StockTransferItems_stockTransferId_fkey`;

-- DropForeignKey
ALTER TABLE `stocktransferitems` DROP FOREIGN KEY `StockTransferItems_yarnId_fkey`;

-- DropForeignKey
ALTER TABLE `yarntransferdetails` DROP FOREIGN KEY `YarnTransferDetails_RequirementPlanningId_fkey`;

-- DropForeignKey
ALTER TABLE `yarntransferdetails` DROP FOREIGN KEY `YarnTransferDetails_colorId_fkey`;

-- DropForeignKey
ALTER TABLE `yarntransferdetails` DROP FOREIGN KEY `YarnTransferDetails_stockTransferId_fkey`;

-- DropForeignKey
ALTER TABLE `yarntransferdetails` DROP FOREIGN KEY `YarnTransferDetails_yarnId_fkey`;

-- AlterTable
ALTER TABLE `po` ADD COLUMN `isPurchaseCancel` BOOLEAN NULL DEFAULT false;

-- AlterTable
ALTER TABLE `poitems` ADD COLUMN `isPurchaseCancel` BOOLEAN NULL DEFAULT false;

-- DropTable
DROP TABLE `stocktransferitems`;

-- DropTable
DROP TABLE `yarntransferdetails`;

-- CreateTable
CREATE TABLE `FromOrderTransferItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stockTransferId` INTEGER NULL,
    `yarnId` INTEGER NULL,
    `accessoryId` INTEGER NULL,
    `accessoryGroupId` INTEGER NULL,
    `accessoryItemId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `transferQty` DOUBLE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ToOrderTransferTtems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stockTransferId` INTEGER NULL,
    `RequirementPlanningId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `orderId` INTEGER NULL,
    `yarnId` INTEGER NULL,
    `style` VARCHAR(191) NULL,
    `qty` DOUBLE NULL,
    `transferQty` DOUBLE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FromOrderTransferItems` ADD CONSTRAINT `FromOrderTransferItems_stockTransferId_fkey` FOREIGN KEY (`stockTransferId`) REFERENCES `StockTransfer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FromOrderTransferItems` ADD CONSTRAINT `FromOrderTransferItems_yarnId_fkey` FOREIGN KEY (`yarnId`) REFERENCES `Yarn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FromOrderTransferItems` ADD CONSTRAINT `FromOrderTransferItems_accessoryId_fkey` FOREIGN KEY (`accessoryId`) REFERENCES `Accessory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FromOrderTransferItems` ADD CONSTRAINT `FromOrderTransferItems_accessoryGroupId_fkey` FOREIGN KEY (`accessoryGroupId`) REFERENCES `AccessoryGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FromOrderTransferItems` ADD CONSTRAINT `FromOrderTransferItems_accessoryItemId_fkey` FOREIGN KEY (`accessoryItemId`) REFERENCES `AccessoryItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FromOrderTransferItems` ADD CONSTRAINT `FromOrderTransferItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ToOrderTransferTtems` ADD CONSTRAINT `ToOrderTransferTtems_stockTransferId_fkey` FOREIGN KEY (`stockTransferId`) REFERENCES `StockTransfer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ToOrderTransferTtems` ADD CONSTRAINT `ToOrderTransferTtems_RequirementPlanningId_fkey` FOREIGN KEY (`RequirementPlanningId`) REFERENCES `RequirementPlanningForm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ToOrderTransferTtems` ADD CONSTRAINT `ToOrderTransferTtems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ToOrderTransferTtems` ADD CONSTRAINT `ToOrderTransferTtems_yarnId_fkey` FOREIGN KEY (`yarnId`) REFERENCES `Yarn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
