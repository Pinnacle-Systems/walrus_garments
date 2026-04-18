/*
  Warnings:

  - You are about to drop the column `barcode` on the `itempricelist` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `itempricelist` DROP COLUMN `barcode`;

-- AlterTable
ALTER TABLE `offer` ADD COLUMN `applyToClearance` BOOLEAN NULL DEFAULT false;

-- CreateTable
CREATE TABLE `ItemBarcode` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `itemPriceListId` INTEGER NULL,
    `barcode` VARCHAR(191) NOT NULL,
    `barcodeType` ENUM('REGULAR', 'CLEARANCE') NOT NULL DEFAULT 'REGULAR',
    `active` BOOLEAN NULL DEFAULT true,
    `clearanceReason` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    UNIQUE INDEX `ItemBarcode_barcode_key`(`barcode`),
    INDEX `ItemBarcode_itemPriceListId_barcodeType_idx`(`itemPriceListId`, `barcodeType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ItemBarcode` ADD CONSTRAINT `ItemBarcode_itemPriceListId_fkey` FOREIGN KEY (`itemPriceListId`) REFERENCES `ItemPriceList`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
