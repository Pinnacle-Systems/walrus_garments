-- AlterTable
ALTER TABLE `accessorycancelitems` ADD COLUMN `accessoryCategoryId` INTEGER NULL;

-- AlterTable
ALTER TABLE `accessoryinwarditems` ADD COLUMN `accessoryCategoryId` INTEGER NULL;

-- AlterTable
ALTER TABLE `accessorypoitems` ADD COLUMN `accessoryCategoryId` INTEGER NULL;

-- AlterTable
ALTER TABLE `accessoryreturnitems` ADD COLUMN `accessoryCategoryId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `AccessoryPoItems` ADD CONSTRAINT `AccessoryPoItems_accessoryCategoryId_fkey` FOREIGN KEY (`accessoryCategoryId`) REFERENCES `AccessoryCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryInwardItems` ADD CONSTRAINT `AccessoryInwardItems_accessoryCategoryId_fkey` FOREIGN KEY (`accessoryCategoryId`) REFERENCES `AccessoryCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryReturnItems` ADD CONSTRAINT `AccessoryReturnItems_accessoryCategoryId_fkey` FOREIGN KEY (`accessoryCategoryId`) REFERENCES `AccessoryCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryCancelItems` ADD CONSTRAINT `AccessoryCancelItems_accessoryCategoryId_fkey` FOREIGN KEY (`accessoryCategoryId`) REFERENCES `AccessoryCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
