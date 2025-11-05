-- DropForeignKey
ALTER TABLE `accessory` DROP FOREIGN KEY `Accessory_accessoryCategoryId_fkey`;

-- DropForeignKey
ALTER TABLE `accessory` DROP FOREIGN KEY `Accessory_accessoryItemId_fkey`;

-- DropForeignKey
ALTER TABLE `accessory` DROP FOREIGN KEY `Accessory_companyId_fkey`;

-- AlterTable
ALTER TABLE `accessory` MODIFY `accessoryItemId` INTEGER NULL,
    MODIFY `companyId` INTEGER NULL,
    MODIFY `active` BOOLEAN NULL DEFAULT true,
    MODIFY `accessoryCategoryId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Accessory` ADD CONSTRAINT `Accessory_accessoryItemId_fkey` FOREIGN KEY (`accessoryItemId`) REFERENCES `AccessoryItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Accessory` ADD CONSTRAINT `Accessory_accessoryCategoryId_fkey` FOREIGN KEY (`accessoryCategoryId`) REFERENCES `AccessoryCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Accessory` ADD CONSTRAINT `Accessory_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
