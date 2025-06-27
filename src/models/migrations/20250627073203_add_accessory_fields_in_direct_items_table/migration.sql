-- AlterTable
ALTER TABLE `directitems` ADD COLUMN `accessoryGroupId` INTEGER NULL,
    ADD COLUMN `accessoryItemId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `DirectItems` ADD CONSTRAINT `DirectItems_accessoryGroupId_fkey` FOREIGN KEY (`accessoryGroupId`) REFERENCES `AccessoryGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectItems` ADD CONSTRAINT `DirectItems_accessoryItemId_fkey` FOREIGN KEY (`accessoryItemId`) REFERENCES `AccessoryItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
