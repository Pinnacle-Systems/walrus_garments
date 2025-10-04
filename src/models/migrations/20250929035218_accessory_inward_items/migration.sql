-- AlterTable
ALTER TABLE `billentryitems` ADD COLUMN `accessoryInwardItemsId` INTEGER NULL;

-- AlterTable
ALTER TABLE `directreturnitems` ADD COLUMN `accessoryInwardItemsId` INTEGER NULL;

-- AlterTable
ALTER TABLE `inwardlotdetails` ADD COLUMN `accessoryInwardItemsId` INTEGER NULL;

-- AlterTable
ALTER TABLE `stock` ADD COLUMN `accessoryInwardItemsId` INTEGER NULL;

-- CreateTable
CREATE TABLE `AccessoryInward` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `inwardOrReturn` ENUM('PurchaseCancel', 'PurchaseInward', 'PurchaseReturn', 'ProcessDelivery', 'ProcessInward', 'DirectInward', 'DirectReturn', 'CuttingDelivery', 'CuttingInward', 'CuttingExcessFabricReturn', 'ProcessDeliveryReturn', 'RawMaterialSales', 'RawMaterialOpeningStock', 'GeneralPo', 'OrderAgainstPo', 'MaterialIssue', 'StockTransfer') NULL,
    `dcNo` VARCHAR(191) NULL,
    `dcDate` DATE NULL,
    `orderId` INTEGER NULL,
    `poType` ENUM('GreyYarn', 'DyedYarn', 'GreyFabric', 'DyedFabric', 'Accessory') NULL,
    `supplierId` INTEGER NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `branchId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `storeId` INTEGER NULL,
    `docId` VARCHAR(191) NULL,
    `payTermId` INTEGER NULL,
    `taxTemplateId` INTEGER NULL,
    `discountType` ENUM('Flat', 'Percentage') NULL,
    `discountValue` DOUBLE NULL DEFAULT 0,
    `vehicleNo` VARCHAR(191) NULL,
    `specialInstructions` LONGTEXT NULL,
    `remarks` LONGTEXT NULL,
    `poInwardOrDirectInward` VARCHAR(191) NULL,
    `draftSave` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccessoryInwardItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `AccessoryInwardId` INTEGER NULL,
    `fabricId` INTEGER NULL,
    `accessoryId` INTEGER NULL,
    `accessoryGroupId` INTEGER NULL,
    `accessoryItemId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `uomId` INTEGER NULL,
    `price` DOUBLE NULL,
    `discountType` ENUM('Flat', 'Percentage') NULL,
    `discountValue` DOUBLE NULL DEFAULT 0,
    `taxPercent` DOUBLE NULL DEFAULT 0,
    `designId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `weightPerBag` DOUBLE NULL,
    `noOfBags` INTEGER NULL,
    `noOfRolls` INTEGER NULL,
    `qty` DOUBLE NULL,
    `lotNo` VARCHAR(191) NULL,
    `lotNoCommonIndex` INTEGER NULL,
    `poItemsId` INTEGER NULL,
    `alreadyInwardedQty` DOUBLE NULL,
    `alreadyReturnedQty` DOUBLE NULL,
    `balanceQty` DOUBLE NULL,
    `cancelQty` DOUBLE NULL,
    `poNo` VARCHAR(191) NULL,
    `poQty` DOUBLE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AccessoryInward` ADD CONSTRAINT `AccessoryInward_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryInward` ADD CONSTRAINT `AccessoryInward_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryInward` ADD CONSTRAINT `AccessoryInward_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryInward` ADD CONSTRAINT `AccessoryInward_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryInward` ADD CONSTRAINT `AccessoryInward_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryInward` ADD CONSTRAINT `AccessoryInward_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryInward` ADD CONSTRAINT `AccessoryInward_payTermId_fkey` FOREIGN KEY (`payTermId`) REFERENCES `PayTerm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryInward` ADD CONSTRAINT `AccessoryInward_taxTemplateId_fkey` FOREIGN KEY (`taxTemplateId`) REFERENCES `TaxTemplate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryInwardItems` ADD CONSTRAINT `AccessoryInwardItems_AccessoryInwardId_fkey` FOREIGN KEY (`AccessoryInwardId`) REFERENCES `AccessoryInward`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryInwardItems` ADD CONSTRAINT `AccessoryInwardItems_fabricId_fkey` FOREIGN KEY (`fabricId`) REFERENCES `Fabric`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryInwardItems` ADD CONSTRAINT `AccessoryInwardItems_accessoryId_fkey` FOREIGN KEY (`accessoryId`) REFERENCES `Accessory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryInwardItems` ADD CONSTRAINT `AccessoryInwardItems_accessoryGroupId_fkey` FOREIGN KEY (`accessoryGroupId`) REFERENCES `AccessoryGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryInwardItems` ADD CONSTRAINT `AccessoryInwardItems_accessoryItemId_fkey` FOREIGN KEY (`accessoryItemId`) REFERENCES `AccessoryItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryInwardItems` ADD CONSTRAINT `AccessoryInwardItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryInwardItems` ADD CONSTRAINT `AccessoryInwardItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryInwardItems` ADD CONSTRAINT `AccessoryInwardItems_designId_fkey` FOREIGN KEY (`designId`) REFERENCES `Design`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryInwardItems` ADD CONSTRAINT `AccessoryInwardItems_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryInwardItems` ADD CONSTRAINT `AccessoryInwardItems_poItemsId_fkey` FOREIGN KEY (`poItemsId`) REFERENCES `AccessoryPoItems`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_accessoryInwardItemsId_fkey` FOREIGN KEY (`accessoryInwardItemsId`) REFERENCES `AccessoryInwardItems`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BillEntryItems` ADD CONSTRAINT `BillEntryItems_accessoryInwardItemsId_fkey` FOREIGN KEY (`accessoryInwardItemsId`) REFERENCES `AccessoryInwardItems`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnItems` ADD CONSTRAINT `DirectReturnItems_accessoryInwardItemsId_fkey` FOREIGN KEY (`accessoryInwardItemsId`) REFERENCES `AccessoryInwardItems`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InwardLotDetails` ADD CONSTRAINT `InwardLotDetails_accessoryInwardItemsId_fkey` FOREIGN KEY (`accessoryInwardItemsId`) REFERENCES `AccessoryInwardItems`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
