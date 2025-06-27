-- DropForeignKey
ALTER TABLE `stock` DROP FOREIGN KEY `Stock_branchId_fkey`;

-- DropForeignKey
ALTER TABLE `stock` DROP FOREIGN KEY `Stock_storeId_fkey`;

-- DropForeignKey
ALTER TABLE `stock` DROP FOREIGN KEY `Stock_uomId_fkey`;

-- AlterTable
ALTER TABLE `stock` MODIFY `itemType` ENUM('GreyYarn', 'DyedYarn', 'GreyFabric', 'DyedFabric', 'Accessory') NULL,
    MODIFY `inOrOut` ENUM('PurchaseCancel', 'PurchaseInward', 'PurchaseReturn', 'ProcessDelivery', 'ProcessInward', 'DirectInward', 'DirectReturn', 'CuttingDelivery', 'CuttingInward', 'CuttingExcessFabricReturn', 'ProcessDeliveryReturn', 'RawMaterialSales', 'RawMaterialOpeningStock') NULL,
    MODIFY `uomId` INTEGER NULL,
    MODIFY `qty` DOUBLE NULL,
    MODIFY `price` DOUBLE NULL,
    MODIFY `storeId` INTEGER NULL,
    MODIFY `branchId` INTEGER NULL,
    MODIFY `active` BOOLEAN NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
