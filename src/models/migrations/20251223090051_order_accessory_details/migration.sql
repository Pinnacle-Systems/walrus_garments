/*
  Warnings:

  - You are about to drop the column `orderId` on the `orderaccessorydetails` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `orderaccessorydetails` DROP FOREIGN KEY `OrderAccessoryDetails_orderId_fkey`;

-- AlterTable
ALTER TABLE `orderaccessorydetails` DROP COLUMN `orderId`,
    ADD COLUMN `orderdetailsId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `OrderAccessoryDetails` ADD CONSTRAINT `OrderAccessoryDetails_orderdetailsId_fkey` FOREIGN KEY (`orderdetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
