-- DropForeignKey
ALTER TABLE `directitems` DROP FOREIGN KEY `DirectItems_directInwardOrReturnId_fkey`;

-- AddForeignKey
ALTER TABLE `DirectItems` ADD CONSTRAINT `DirectItems_directInwardOrReturnId_fkey` FOREIGN KEY (`directInwardOrReturnId`) REFERENCES `DirectInwardOrReturn`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
