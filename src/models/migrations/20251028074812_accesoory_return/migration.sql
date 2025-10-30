/*
  Warnings:

  - You are about to drop the column `poItemsId` on the `accessoryreturnitems` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `accessoryreturnitems` DROP FOREIGN KEY `AccessoryReturnItems_poItemsId_fkey`;

-- AlterTable
ALTER TABLE `accessoryreturnitems` DROP COLUMN `poItemsId`,
    ADD COLUMN `accessoryPoItemsId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `AccessoryReturnItems` ADD CONSTRAINT `AccessoryReturnItems_accessoryPoItemsId_fkey` FOREIGN KEY (`accessoryPoItemsId`) REFERENCES `AccessoryPoItems`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
