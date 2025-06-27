-- CreateTable
CREATE TABLE `DirectReturnOrPoReturn` (
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
CREATE TABLE `DirectReturnItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fabricId` INTEGER NULL,
    `yarnId` INTEGER NULL,
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
    `gaugeId` INTEGER NULL,
    `loopLengthId` INTEGER NULL,
    `gsmId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `kDiaId` INTEGER NULL,
    `fDiaId` INTEGER NULL,
    `directReturnOrPoReturnId` INTEGER NOT NULL,
    `weightPerBag` DOUBLE NULL,
    `noOfBags` INTEGER NULL,
    `noOfRolls` INTEGER NULL,
    `qty` DOUBLE NULL,
    `poItemsId` INTEGER NULL,
    `directItemsId` INTEGER NULL,
    `alreadyInwardedQty` DOUBLE NULL,
    `alreadyReturnedQty` DOUBLE NULL,
    `balanceQty` DOUBLE NULL,
    `cancelQty` DOUBLE NULL,
    `poNo` VARCHAR(191) NULL,
    `poQty` DOUBLE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReturnLotDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `directReturnItemsId` INTEGER NOT NULL,
    `lotNo` VARCHAR(191) NULL,
    `qty` DOUBLE NULL,
    `noOfRolls` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DirectReturnOrPoReturn` ADD CONSTRAINT `DirectReturnOrPoReturn_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnOrPoReturn` ADD CONSTRAINT `DirectReturnOrPoReturn_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnOrPoReturn` ADD CONSTRAINT `DirectReturnOrPoReturn_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnOrPoReturn` ADD CONSTRAINT `DirectReturnOrPoReturn_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnOrPoReturn` ADD CONSTRAINT `DirectReturnOrPoReturn_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnOrPoReturn` ADD CONSTRAINT `DirectReturnOrPoReturn_payTermId_fkey` FOREIGN KEY (`payTermId`) REFERENCES `PayTerm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnOrPoReturn` ADD CONSTRAINT `DirectReturnOrPoReturn_taxTemplateId_fkey` FOREIGN KEY (`taxTemplateId`) REFERENCES `TaxTemplate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnItems` ADD CONSTRAINT `DirectReturnItems_directReturnOrPoReturnId_fkey` FOREIGN KEY (`directReturnOrPoReturnId`) REFERENCES `DirectReturnOrPoReturn`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnItems` ADD CONSTRAINT `DirectReturnItems_fabricId_fkey` FOREIGN KEY (`fabricId`) REFERENCES `Fabric`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnItems` ADD CONSTRAINT `DirectReturnItems_yarnId_fkey` FOREIGN KEY (`yarnId`) REFERENCES `Yarn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnItems` ADD CONSTRAINT `DirectReturnItems_accessoryId_fkey` FOREIGN KEY (`accessoryId`) REFERENCES `Accessory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnItems` ADD CONSTRAINT `DirectReturnItems_accessoryGroupId_fkey` FOREIGN KEY (`accessoryGroupId`) REFERENCES `AccessoryGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnItems` ADD CONSTRAINT `DirectReturnItems_accessoryItemId_fkey` FOREIGN KEY (`accessoryItemId`) REFERENCES `AccessoryItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnItems` ADD CONSTRAINT `DirectReturnItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnItems` ADD CONSTRAINT `DirectReturnItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnItems` ADD CONSTRAINT `DirectReturnItems_designId_fkey` FOREIGN KEY (`designId`) REFERENCES `Design`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnItems` ADD CONSTRAINT `DirectReturnItems_gaugeId_fkey` FOREIGN KEY (`gaugeId`) REFERENCES `Gauge`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnItems` ADD CONSTRAINT `DirectReturnItems_loopLengthId_fkey` FOREIGN KEY (`loopLengthId`) REFERENCES `LoopLength`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnItems` ADD CONSTRAINT `DirectReturnItems_gsmId_fkey` FOREIGN KEY (`gsmId`) REFERENCES `Gsm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnItems` ADD CONSTRAINT `DirectReturnItems_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnItems` ADD CONSTRAINT `DirectReturnItems_kDiaId_fkey` FOREIGN KEY (`kDiaId`) REFERENCES `Dia`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnItems` ADD CONSTRAINT `DirectReturnItems_fDiaId_fkey` FOREIGN KEY (`fDiaId`) REFERENCES `Dia`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnItems` ADD CONSTRAINT `DirectReturnItems_poItemsId_fkey` FOREIGN KEY (`poItemsId`) REFERENCES `PoItems`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `DirectReturnItems` ADD CONSTRAINT `DirectReturnItems_directItemsId_fkey` FOREIGN KEY (`directItemsId`) REFERENCES `DirectItems`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `ReturnLotDetails` ADD CONSTRAINT `ReturnLotDetails_directReturnItemsId_fkey` FOREIGN KEY (`directReturnItemsId`) REFERENCES `DirectReturnItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
