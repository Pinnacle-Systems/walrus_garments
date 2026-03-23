-- AlterTable
ALTER TABLE `quotationitems` ADD COLUMN `priceType` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `saleorderitems` ADD COLUMN `priceType` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `salesdeliveryitems` ADD COLUMN `priceType` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `salesinvoiceitems` ADD COLUMN `priceType` VARCHAR(191) NULL;
