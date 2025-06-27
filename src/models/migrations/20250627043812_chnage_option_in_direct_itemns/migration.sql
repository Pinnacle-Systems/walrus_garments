-- DropForeignKey
ALTER TABLE `directitems` DROP FOREIGN KEY `DirectItems_directInwardOrReturnId_fkey`;

-- DropForeignKey
ALTER TABLE `directitems` DROP FOREIGN KEY `DirectItems_stockId_fkey`;

-- DropForeignKey
ALTER TABLE `directitems` DROP FOREIGN KEY `DirectItems_uomId_fkey`;

-- AlterTable
ALTER TABLE `directitems` MODIFY `uomId` INTEGER NULL,
    MODIFY `price` DOUBLE NULL,
    MODIFY `discountType` ENUM('Flat', 'Percentage') NULL,
    MODIFY `discountValue` DOUBLE NULL DEFAULT 0,
    MODIFY `taxPercent` DOUBLE NULL DEFAULT 0,
    MODIFY `directInwardOrReturnId` INTEGER NULL,
    MODIFY `stockId` INTEGER NULL,
    MODIFY `qty` DOUBLE NULL;

-- AddForeignKey
ALTER TABLE `DirectItems` ADD CONSTRAINT `DirectItems_directInwardOrReturnId_fkey` FOREIGN KEY (`directInwardOrReturnId`) REFERENCES `DirectInwardOrReturn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectItems` ADD CONSTRAINT `DirectItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectItems` ADD CONSTRAINT `DirectItems_stockId_fkey` FOREIGN KEY (`stockId`) REFERENCES `Stock`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
