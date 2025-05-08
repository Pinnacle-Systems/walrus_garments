/*
  Warnings:

  - You are about to drop the column `AccessoryGroupId` on the `poitems` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `poitems` DROP FOREIGN KEY `PoItems_AccessoryGroupId_fkey`;

-- AlterTable
ALTER TABLE `poitems` DROP COLUMN `AccessoryGroupId`,
    ADD COLUMN `accessoryGroupId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `PoItems` ADD CONSTRAINT `PoItems_accessoryGroupId_fkey` FOREIGN KEY (`accessoryGroupId`) REFERENCES `AccessoryGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
