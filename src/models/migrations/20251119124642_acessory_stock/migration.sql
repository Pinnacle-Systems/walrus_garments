-- AlterTable
ALTER TABLE `accessorypoitems` ADD COLUMN `accessoryRequirementPlanningId` INTEGER NULL,
    ADD COLUMN `orderDetailsId` INTEGER NULL;

-- AlterTable
ALTER TABLE `accessoryrequirementplanning` ADD COLUMN `isMaterialRequst` BOOLEAN NULL DEFAULT false;

-- CreateTable
CREATE TABLE `AccessoryStock` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `itemType` ENUM('GreyYarn', 'DyedYarn', 'GreyFabric', 'DyedFabric', 'Accessory') NULL,
    `inOrOut` ENUM('PurchaseCancel', 'PurchaseInward', 'PurchaseReturn', 'ProcessDelivery', 'ProcessInward', 'DirectInward', 'DirectReturn', 'CuttingDelivery', 'CuttingInward', 'CuttingExcessFabricReturn', 'ProcessDeliveryReturn', 'RawMaterialSales', 'RawMaterialOpeningStock', 'GeneralPo', 'OrderAgainstPo', 'MaterialIssue', 'StockTransfer', 'GeneralInward', 'GeneralReturn') NULL,
    `accessoryId` INTEGER NULL,
    `accessoryGroupId` INTEGER NULL,
    `accessoryItemId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `uomId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `qty` DOUBLE NULL,
    `price` DOUBLE NULL,
    `noOfRolls` INTEGER NULL DEFAULT 0,
    `noOfBags` INTEGER NULL DEFAULT 0,
    `storeId` INTEGER NULL,
    `branchId` INTEGER NULL,
    `active` BOOLEAN NULL DEFAULT true,
    `lotNo` VARCHAR(191) NULL,
    `orderId` INTEGER NULL,
    `supplierId` INTEGER NULL,
    `orderDetailsId` INTEGER NULL,
    `accessoryRequirementPlanningId` INTEGER NULL,
    `category` VARCHAR(191) NULL,
    `transactionId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AccessoryPoItems` ADD CONSTRAINT `AccessoryPoItems_orderDetailsId_fkey` FOREIGN KEY (`orderDetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryPoItems` ADD CONSTRAINT `AccessoryPoItems_accessoryRequirementPlanningId_fkey` FOREIGN KEY (`accessoryRequirementPlanningId`) REFERENCES `AccessoryRequirementPlanning`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryStock` ADD CONSTRAINT `AccessoryStock_accessoryId_fkey` FOREIGN KEY (`accessoryId`) REFERENCES `Accessory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryStock` ADD CONSTRAINT `AccessoryStock_accessoryGroupId_fkey` FOREIGN KEY (`accessoryGroupId`) REFERENCES `AccessoryGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryStock` ADD CONSTRAINT `AccessoryStock_accessoryItemId_fkey` FOREIGN KEY (`accessoryItemId`) REFERENCES `AccessoryItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryStock` ADD CONSTRAINT `AccessoryStock_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryStock` ADD CONSTRAINT `AccessoryStock_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryStock` ADD CONSTRAINT `AccessoryStock_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryStock` ADD CONSTRAINT `AccessoryStock_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryStock` ADD CONSTRAINT `AccessoryStock_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryStock` ADD CONSTRAINT `AccessoryStock_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryStock` ADD CONSTRAINT `AccessoryStock_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryStock` ADD CONSTRAINT `AccessoryStock_orderDetailsId_fkey` FOREIGN KEY (`orderDetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryStock` ADD CONSTRAINT `AccessoryStock_accessoryRequirementPlanningId_fkey` FOREIGN KEY (`accessoryRequirementPlanningId`) REFERENCES `AccessoryRequirementPlanning`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
