/*
  Warnings:

  - You are about to drop the column `orderdetailsId` on the `fromordertransferitems` table. All the data in the column will be lost.
  - You are about to drop the column `orderdetailsId` on the `toordertransferttems` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `fromordertransferitems` DROP FOREIGN KEY `FromOrderTransferItems_orderdetailsId_fkey`;

-- DropForeignKey
ALTER TABLE `toordertransferttems` DROP FOREIGN KEY `ToOrderTransferTtems_orderdetailsId_fkey`;

-- AlterTable
ALTER TABLE `fromordertransferitems` DROP COLUMN `orderdetailsId`,
    ADD COLUMN `orderDetailsId` INTEGER NULL;

-- AlterTable
ALTER TABLE `toordertransferttems` DROP COLUMN `orderdetailsId`,
    ADD COLUMN `orderDetailsId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `FromOrderTransferItems` ADD CONSTRAINT `FromOrderTransferItems_orderDetailsId_fkey` FOREIGN KEY (`orderDetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ToOrderTransferTtems` ADD CONSTRAINT `ToOrderTransferTtems_orderDetailsId_fkey` FOREIGN KEY (`orderDetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
