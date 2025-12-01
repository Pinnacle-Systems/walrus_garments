-- AlterTable
ALTER TABLE `fromaccessorytransferitems` ADD COLUMN `accessoryCategoryId` INTEGER NULL,
    ADD COLUMN `accessoryGroupId` INTEGER NULL;

-- AlterTable
ALTER TABLE `toaccessorytransferitems` ADD COLUMN `accessoryCategoryId` INTEGER NULL,
    ADD COLUMN `accessoryGroupId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `FromAccessoryTransferItems` ADD CONSTRAINT `FromAccessoryTransferItems_accessoryGroupId_fkey` FOREIGN KEY (`accessoryGroupId`) REFERENCES `AccessoryGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FromAccessoryTransferItems` ADD CONSTRAINT `FromAccessoryTransferItems_accessoryCategoryId_fkey` FOREIGN KEY (`accessoryCategoryId`) REFERENCES `AccessoryCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ToAccessoryTransferItems` ADD CONSTRAINT `ToAccessoryTransferItems_accessoryGroupId_fkey` FOREIGN KEY (`accessoryGroupId`) REFERENCES `AccessoryGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ToAccessoryTransferItems` ADD CONSTRAINT `ToAccessoryTransferItems_accessoryCategoryId_fkey` FOREIGN KEY (`accessoryCategoryId`) REFERENCES `AccessoryCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
