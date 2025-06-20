/*
  Warnings:

  - You are about to drop the column `payTermDay` on the `po` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `po` DROP COLUMN `payTermDay`;

-- AlterTable
ALTER TABLE `poitems` ADD COLUMN `AccessoryGroupId` INTEGER NULL,
    ADD COLUMN `accessoryItemId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `PoItems` ADD CONSTRAINT `PoItems_AccessoryGroupId_fkey` FOREIGN KEY (`AccessoryGroupId`) REFERENCES `AccessoryGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoItems` ADD CONSTRAINT `PoItems_accessoryItemId_fkey` FOREIGN KEY (`accessoryItemId`) REFERENCES `AccessoryItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
