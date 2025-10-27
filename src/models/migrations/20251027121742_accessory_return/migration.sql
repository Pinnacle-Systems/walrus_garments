-- AlterTable
ALTER TABLE `returnlotdetails` ADD COLUMN `accessoryReturnItemsId` INTEGER NULL;

-- CreateTable
CREATE TABLE `AccessoryReturn` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `poInwardOrDirectInward` VARCHAR(191) NULL,
    `dcNo` VARCHAR(191) NULL,
    `dcDate` DATE NULL,
    `poType` VARCHAR(191) NULL,
    `supplierId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `branchId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `storeId` INTEGER NULL,
    `docId` VARCHAR(191) NOT NULL,
    `payTermId` INTEGER NULL,
    `taxTemplateId` INTEGER NULL,
    `discountType` VARCHAR(191) NULL,
    `discountValue` DOUBLE NULL DEFAULT 0,
    `vehicleNo` VARCHAR(191) NULL,
    `specialInstructions` LONGTEXT NULL,
    `remarks` LONGTEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccessoryReturnItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `accessoryId` INTEGER NULL,
    `accessoryGroupId` INTEGER NULL,
    `accessoryItemId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `uomId` INTEGER NULL,
    `price` DOUBLE NOT NULL,
    `discountType` VARCHAR(191) NULL,
    `discountValue` DOUBLE NOT NULL DEFAULT 0,
    `taxPercent` DOUBLE NOT NULL DEFAULT 0,
    `designId` INTEGER NULL,
    `gsmId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `accessoryReturnId` INTEGER NOT NULL,
    `weightPerBag` DOUBLE NULL,
    `noOfBags` INTEGER NULL,
    `noOfRolls` INTEGER NULL,
    `qty` DOUBLE NULL,
    `poItemsId` INTEGER NULL,
    `alreadyInwardedQty` DOUBLE NULL,
    `alreadyReturnedQty` DOUBLE NULL,
    `balanceQty` DOUBLE NULL,
    `cancelQty` DOUBLE NULL,
    `poNo` VARCHAR(191) NULL,
    `poQty` DOUBLE NULL,
    `accessoryInwardItemsId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AccessoryReturn` ADD CONSTRAINT `AccessoryReturn_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryReturn` ADD CONSTRAINT `AccessoryReturn_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryReturn` ADD CONSTRAINT `AccessoryReturn_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryReturn` ADD CONSTRAINT `AccessoryReturn_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryReturn` ADD CONSTRAINT `AccessoryReturn_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryReturn` ADD CONSTRAINT `AccessoryReturn_payTermId_fkey` FOREIGN KEY (`payTermId`) REFERENCES `PayTerm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryReturn` ADD CONSTRAINT `AccessoryReturn_taxTemplateId_fkey` FOREIGN KEY (`taxTemplateId`) REFERENCES `TaxTemplate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryReturnItems` ADD CONSTRAINT `AccessoryReturnItems_accessoryReturnId_fkey` FOREIGN KEY (`accessoryReturnId`) REFERENCES `AccessoryReturn`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryReturnItems` ADD CONSTRAINT `AccessoryReturnItems_accessoryId_fkey` FOREIGN KEY (`accessoryId`) REFERENCES `Accessory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryReturnItems` ADD CONSTRAINT `AccessoryReturnItems_accessoryGroupId_fkey` FOREIGN KEY (`accessoryGroupId`) REFERENCES `AccessoryGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryReturnItems` ADD CONSTRAINT `AccessoryReturnItems_accessoryItemId_fkey` FOREIGN KEY (`accessoryItemId`) REFERENCES `AccessoryItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryReturnItems` ADD CONSTRAINT `AccessoryReturnItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryReturnItems` ADD CONSTRAINT `AccessoryReturnItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryReturnItems` ADD CONSTRAINT `AccessoryReturnItems_designId_fkey` FOREIGN KEY (`designId`) REFERENCES `Design`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryReturnItems` ADD CONSTRAINT `AccessoryReturnItems_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryReturnItems` ADD CONSTRAINT `AccessoryReturnItems_poItemsId_fkey` FOREIGN KEY (`poItemsId`) REFERENCES `PoItems`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `AccessoryReturnItems` ADD CONSTRAINT `AccessoryReturnItems_accessoryInwardItemsId_fkey` FOREIGN KEY (`accessoryInwardItemsId`) REFERENCES `AccessoryInwardItems`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReturnLotDetails` ADD CONSTRAINT `ReturnLotDetails_accessoryReturnItemsId_fkey` FOREIGN KEY (`accessoryReturnItemsId`) REFERENCES `AccessoryReturnItems`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
