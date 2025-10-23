-- DropForeignKey
ALTER TABLE `directitems` DROP FOREIGN KEY `DirectItems_directInwardOrReturnId_fkey`;

-- DropForeignKey
ALTER TABLE `directitems` DROP FOREIGN KEY `DirectItems_fabricId_fkey`;

-- AlterTable
ALTER TABLE `accessory` ADD COLUMN `taxPercent` BOOLEAN NULL;

-- AddForeignKey
ALTER TABLE `DirectItems` ADD CONSTRAINT `DirectItems_directInwardOrReturnId_fkey` FOREIGN KEY (`directInwardOrReturnId`) REFERENCES `DirectInwardOrReturn`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectItems` ADD CONSTRAINT `DirectItems_fabricId_fkey` FOREIGN KEY (`fabricId`) REFERENCES `Fabric`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
