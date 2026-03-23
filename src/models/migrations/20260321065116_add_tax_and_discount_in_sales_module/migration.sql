-- AlterTable
ALTER TABLE `quotation` ADD COLUMN `taxType` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `quotationitems` ADD COLUMN `discountType` VARCHAR(191) NULL,
    ADD COLUMN `discountValue` VARCHAR(191) NULL,
    ADD COLUMN `taxPercent` VARCHAR(191) NULL,
    ADD COLUMN `taxType` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `saleorder` ADD COLUMN `taxType` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `saleorderitems` ADD COLUMN `discountType` VARCHAR(191) NULL,
    ADD COLUMN `discountValue` VARCHAR(191) NULL,
    ADD COLUMN `taxPercent` VARCHAR(191) NULL,
    ADD COLUMN `taxType` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `salesdelivery` ADD COLUMN `taxType` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `salesdeliveryitems` ADD COLUMN `discountType` VARCHAR(191) NULL,
    ADD COLUMN `discountValue` VARCHAR(191) NULL,
    ADD COLUMN `taxPercent` VARCHAR(191) NULL,
    ADD COLUMN `taxType` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `salesinvoice` ADD COLUMN `taxType` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `salesinvoiceitems` ADD COLUMN `discountType` VARCHAR(191) NULL,
    ADD COLUMN `discountValue` VARCHAR(191) NULL,
    ADD COLUMN `taxPercent` VARCHAR(191) NULL,
    ADD COLUMN `taxType` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `salesreturn` ADD COLUMN `taxType` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `salesreturnitems` ADD COLUMN `discountType` VARCHAR(191) NULL,
    ADD COLUMN `discountValue` VARCHAR(191) NULL,
    ADD COLUMN `taxPercent` VARCHAR(191) NULL,
    ADD COLUMN `taxType` VARCHAR(191) NULL;
