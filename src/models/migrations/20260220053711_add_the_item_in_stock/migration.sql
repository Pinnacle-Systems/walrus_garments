/*
  Warnings:

  - You are about to drop the column `branchId` on the `directinwardorreturn` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `directinwardorreturn` DROP FOREIGN KEY `DirectInwardOrReturn_branchId_fkey`;

-- AlterTable
ALTER TABLE `directinwardorreturn` DROP COLUMN `branchId`,
    ADD COLUMN `locationId` INTEGER NULL;

-- AlterTable
ALTER TABLE `directitems` ADD COLUMN `itemId` INTEGER NULL;

-- AlterTable
ALTER TABLE `stock` ADD COLUMN `itemCode` VARCHAR(191) NULL,
    ADD COLUMN `itemId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `DirectInwardOrReturn` ADD CONSTRAINT `DirectInwardOrReturn_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectItems` ADD CONSTRAINT `DirectItems_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Item`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Item`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
