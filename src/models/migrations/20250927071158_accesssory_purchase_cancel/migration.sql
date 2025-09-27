-- AlterTable
ALTER TABLE `accessorypoitems` ADD COLUMN `sizeId` INTEGER NULL;

-- CreateTable
CREATE TABLE `AccesssoryPurchaseCancel` (
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
CREATE TABLE `AccessoryCancelItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fabricId` INTEGER NULL,
    `accessoryId` INTEGER NULL,
    `accessoryGroupId` INTEGER NULL,
    `accessoryItemId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `uomId` INTEGER NULL,
    `price` DOUBLE NOT NULL,
    `sizeId` INTEGER NULL,
    `designId` INTEGER NULL,
    `gsmId` INTEGER NULL,
    `accesssoryPurchaseCancelId` INTEGER NULL,
    `qty` DOUBLE NULL,
    `poItemsId` INTEGER NULL,
    `poNo` VARCHAR(191) NULL,
    `poQty` DOUBLE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AccessoryPoItems` ADD CONSTRAINT `AccessoryPoItems_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccesssoryPurchaseCancel` ADD CONSTRAINT `AccesssoryPurchaseCancel_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccesssoryPurchaseCancel` ADD CONSTRAINT `AccesssoryPurchaseCancel_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccesssoryPurchaseCancel` ADD CONSTRAINT `AccesssoryPurchaseCancel_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccesssoryPurchaseCancel` ADD CONSTRAINT `AccesssoryPurchaseCancel_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryCancelItems` ADD CONSTRAINT `AccessoryCancelItems_accesssoryPurchaseCancelId_fkey` FOREIGN KEY (`accesssoryPurchaseCancelId`) REFERENCES `AccesssoryPurchaseCancel`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryCancelItems` ADD CONSTRAINT `AccessoryCancelItems_fabricId_fkey` FOREIGN KEY (`fabricId`) REFERENCES `Fabric`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryCancelItems` ADD CONSTRAINT `AccessoryCancelItems_accessoryId_fkey` FOREIGN KEY (`accessoryId`) REFERENCES `Accessory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryCancelItems` ADD CONSTRAINT `AccessoryCancelItems_accessoryGroupId_fkey` FOREIGN KEY (`accessoryGroupId`) REFERENCES `AccessoryGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryCancelItems` ADD CONSTRAINT `AccessoryCancelItems_accessoryItemId_fkey` FOREIGN KEY (`accessoryItemId`) REFERENCES `AccessoryItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryCancelItems` ADD CONSTRAINT `AccessoryCancelItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryCancelItems` ADD CONSTRAINT `AccessoryCancelItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryCancelItems` ADD CONSTRAINT `AccessoryCancelItems_designId_fkey` FOREIGN KEY (`designId`) REFERENCES `Design`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryCancelItems` ADD CONSTRAINT `AccessoryCancelItems_gsmId_fkey` FOREIGN KEY (`gsmId`) REFERENCES `Gsm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryCancelItems` ADD CONSTRAINT `AccessoryCancelItems_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryCancelItems` ADD CONSTRAINT `AccessoryCancelItems_poItemsId_fkey` FOREIGN KEY (`poItemsId`) REFERENCES `PoItems`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
