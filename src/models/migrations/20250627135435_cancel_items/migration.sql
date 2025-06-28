-- CreateTable
CREATE TABLE `PurchaseCancel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `poInwardOrDirectInward` VARCHAR(191) NULL,
    `poType` VARCHAR(191) NULL,
    `supplierId` INTEGER NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `branchId` INTEGER NULL,
    `active` BOOLEAN NULL DEFAULT true,
    `docId` VARCHAR(191) NULL,
    `remarks` LONGTEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CancelItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fabricId` INTEGER NULL,
    `yarnId` INTEGER NULL,
    `accessoryId` INTEGER NULL,
    `accessoryGroupId` INTEGER NULL,
    `accessoryItemId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `uomId` INTEGER NOT NULL,
    `price` DOUBLE NOT NULL,
    `designId` INTEGER NULL,
    `gaugeId` INTEGER NULL,
    `loopLengthId` INTEGER NULL,
    `gsmId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `kDiaId` INTEGER NULL,
    `fDiaId` INTEGER NULL,
    `purchaseCancelId` INTEGER NULL,
    `qty` DOUBLE NULL,
    `poItemsId` INTEGER NULL,
    `poNo` VARCHAR(191) NULL,
    `poQty` DOUBLE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PurchaseCancel` ADD CONSTRAINT `PurchaseCancel_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseCancel` ADD CONSTRAINT `PurchaseCancel_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseCancel` ADD CONSTRAINT `PurchaseCancel_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseCancel` ADD CONSTRAINT `PurchaseCancel_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CancelItems` ADD CONSTRAINT `CancelItems_purchaseCancelId_fkey` FOREIGN KEY (`purchaseCancelId`) REFERENCES `PurchaseCancel`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CancelItems` ADD CONSTRAINT `CancelItems_fabricId_fkey` FOREIGN KEY (`fabricId`) REFERENCES `Fabric`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CancelItems` ADD CONSTRAINT `CancelItems_yarnId_fkey` FOREIGN KEY (`yarnId`) REFERENCES `Yarn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CancelItems` ADD CONSTRAINT `CancelItems_accessoryId_fkey` FOREIGN KEY (`accessoryId`) REFERENCES `Accessory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CancelItems` ADD CONSTRAINT `CancelItems_accessoryGroupId_fkey` FOREIGN KEY (`accessoryGroupId`) REFERENCES `AccessoryGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CancelItems` ADD CONSTRAINT `CancelItems_accessoryItemId_fkey` FOREIGN KEY (`accessoryItemId`) REFERENCES `AccessoryItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CancelItems` ADD CONSTRAINT `CancelItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CancelItems` ADD CONSTRAINT `CancelItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CancelItems` ADD CONSTRAINT `CancelItems_designId_fkey` FOREIGN KEY (`designId`) REFERENCES `Design`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CancelItems` ADD CONSTRAINT `CancelItems_gaugeId_fkey` FOREIGN KEY (`gaugeId`) REFERENCES `Gauge`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CancelItems` ADD CONSTRAINT `CancelItems_loopLengthId_fkey` FOREIGN KEY (`loopLengthId`) REFERENCES `LoopLength`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CancelItems` ADD CONSTRAINT `CancelItems_gsmId_fkey` FOREIGN KEY (`gsmId`) REFERENCES `Gsm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CancelItems` ADD CONSTRAINT `CancelItems_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CancelItems` ADD CONSTRAINT `CancelItems_kDiaId_fkey` FOREIGN KEY (`kDiaId`) REFERENCES `Dia`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CancelItems` ADD CONSTRAINT `CancelItems_fDiaId_fkey` FOREIGN KEY (`fDiaId`) REFERENCES `Dia`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CancelItems` ADD CONSTRAINT `CancelItems_poItemsId_fkey` FOREIGN KEY (`poItemsId`) REFERENCES `PoItems`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
