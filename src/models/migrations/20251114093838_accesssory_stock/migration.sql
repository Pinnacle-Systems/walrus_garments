-- AlterTable
ALTER TABLE `materialissueitems` ADD COLUMN `requiredQty` DOUBLE NULL;

-- CreateTable
CREATE TABLE `AccessoyStockTransfer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `transferType` VARCHAR(191) NULL,
    `fromOrderId` INTEGER NULL,
    `toOrderId` INTEGER NULL,
    `fromCustomerId` INTEGER NULL,
    `toCustomerId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FromAccessoryTransferItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stockTransferId` INTEGER NULL,
    `accessoryId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `uomId` INTEGER NULL,
    `transferQty` DOUBLE NULL,
    `stockQty` DOUBLE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ToAccessoryTransferItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stockTransferId` INTEGER NULL,
    `accessoryId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `uomId` INTEGER NULL,
    `transferQty` DOUBLE NULL,
    `stockQty` DOUBLE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AccessoyStockTransfer` ADD CONSTRAINT `AccessoyStockTransfer_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoyStockTransfer` ADD CONSTRAINT `AccessoyStockTransfer_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoyStockTransfer` ADD CONSTRAINT `AccessoyStockTransfer_fromOrderId_fkey` FOREIGN KEY (`fromOrderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoyStockTransfer` ADD CONSTRAINT `AccessoyStockTransfer_toOrderId_fkey` FOREIGN KEY (`toOrderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FromAccessoryTransferItems` ADD CONSTRAINT `FromAccessoryTransferItems_stockTransferId_fkey` FOREIGN KEY (`stockTransferId`) REFERENCES `AccessoyStockTransfer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FromAccessoryTransferItems` ADD CONSTRAINT `FromAccessoryTransferItems_accessoryId_fkey` FOREIGN KEY (`accessoryId`) REFERENCES `Accessory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FromAccessoryTransferItems` ADD CONSTRAINT `FromAccessoryTransferItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FromAccessoryTransferItems` ADD CONSTRAINT `FromAccessoryTransferItems_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FromAccessoryTransferItems` ADD CONSTRAINT `FromAccessoryTransferItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ToAccessoryTransferItems` ADD CONSTRAINT `ToAccessoryTransferItems_stockTransferId_fkey` FOREIGN KEY (`stockTransferId`) REFERENCES `AccessoyStockTransfer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ToAccessoryTransferItems` ADD CONSTRAINT `ToAccessoryTransferItems_accessoryId_fkey` FOREIGN KEY (`accessoryId`) REFERENCES `Accessory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ToAccessoryTransferItems` ADD CONSTRAINT `ToAccessoryTransferItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ToAccessoryTransferItems` ADD CONSTRAINT `ToAccessoryTransferItems_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ToAccessoryTransferItems` ADD CONSTRAINT `ToAccessoryTransferItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
