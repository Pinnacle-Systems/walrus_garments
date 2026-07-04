-- AlterTable
ALTER TABLE `quotationitems` ADD COLUMN `barcodeType` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `saleorderitems` ADD COLUMN `barcodeType` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `salesdelivery` ADD COLUMN `barcodeType` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `salesreturnitems` ADD COLUMN `barcodeType` VARCHAR(191) NULL;
