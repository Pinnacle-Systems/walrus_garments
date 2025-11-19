/*
  Warnings:

  - You are about to drop the column `orderdetailsId` on the `cancelitems` table. All the data in the column will be lost.
  - You are about to drop the column `orderdetailsId` on the `directitems` table. All the data in the column will be lost.
  - You are about to drop the column `orderdetailsId` on the `poitems` table. All the data in the column will be lost.
  - You are about to drop the column `orderdetailsId` on the `stock` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `cancelitems` DROP FOREIGN KEY `CancelItems_orderdetailsId_fkey`;

-- DropForeignKey
ALTER TABLE `directitems` DROP FOREIGN KEY `DirectItems_orderdetailsId_fkey`;

-- DropForeignKey
ALTER TABLE `poitems` DROP FOREIGN KEY `PoItems_orderdetailsId_fkey`;

-- DropForeignKey
ALTER TABLE `stock` DROP FOREIGN KEY `Stock_orderdetailsId_fkey`;

-- AlterTable
ALTER TABLE `cancelitems` DROP COLUMN `orderdetailsId`,
    ADD COLUMN `cancelItems` INTEGER NULL;

-- AlterTable
ALTER TABLE `directitems` DROP COLUMN `orderdetailsId`,
    ADD COLUMN `orderDetailsId` INTEGER NULL;

-- AlterTable
ALTER TABLE `directreturnitems` ADD COLUMN `orderDetailsId` INTEGER NULL;

-- AlterTable
ALTER TABLE `poitems` DROP COLUMN `orderdetailsId`,
    ADD COLUMN `orderDetailsId` INTEGER NULL;

-- AlterTable
ALTER TABLE `stock` DROP COLUMN `orderdetailsId`,
    ADD COLUMN `orderDetailsId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `PoItems` ADD CONSTRAINT `PoItems_orderDetailsId_fkey` FOREIGN KEY (`orderDetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectItems` ADD CONSTRAINT `DirectItems_orderDetailsId_fkey` FOREIGN KEY (`orderDetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_orderDetailsId_fkey` FOREIGN KEY (`orderDetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnItems` ADD CONSTRAINT `DirectReturnItems_orderDetailsId_fkey` FOREIGN KEY (`orderDetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CancelItems` ADD CONSTRAINT `CancelItems_cancelItems_fkey` FOREIGN KEY (`cancelItems`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
