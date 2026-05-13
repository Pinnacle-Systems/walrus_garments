-- AlterTable
ALTER TABLE `ledger` ADD COLUMN `salesReturnId` INTEGER NULL;

-- CreateTable
CREATE TABLE `SalesExchangeItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `salesReturnId` INTEGER NULL,
    `salesDeliveryItemId` INTEGER NULL,
    `itemId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `uomId` INTEGER NULL,
    `hsnId` INTEGER NULL,
    `qty` VARCHAR(191) NULL,
    `price` VARCHAR(191) NULL,
    `discountType` VARCHAR(191) NULL,
    `discountValue` VARCHAR(191) NULL,
    `taxMethod` VARCHAR(191) NULL,
    `taxType` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Ledger` ADD CONSTRAINT `Ledger_salesReturnId_fkey` FOREIGN KEY (`salesReturnId`) REFERENCES `SalesReturn`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesExchangeItems` ADD CONSTRAINT `SalesExchangeItems_salesReturnId_fkey` FOREIGN KEY (`salesReturnId`) REFERENCES `SalesReturn`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesExchangeItems` ADD CONSTRAINT `SalesExchangeItems_salesDeliveryItemId_fkey` FOREIGN KEY (`salesDeliveryItemId`) REFERENCES `SalesDeliveryItems`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesExchangeItems` ADD CONSTRAINT `SalesExchangeItems_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Item`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesExchangeItems` ADD CONSTRAINT `SalesExchangeItems_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesExchangeItems` ADD CONSTRAINT `SalesExchangeItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesExchangeItems` ADD CONSTRAINT `SalesExchangeItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesExchangeItems` ADD CONSTRAINT `SalesExchangeItems_hsnId_fkey` FOREIGN KEY (`hsnId`) REFERENCES `Hsn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
