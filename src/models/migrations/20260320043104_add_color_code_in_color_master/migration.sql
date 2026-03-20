-- AlterTable
ALTER TABLE `color` ADD COLUMN `code` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `itempricelist` ADD COLUMN `barcode` VARCHAR(191) NULL,
    ADD COLUMN `sku` VARCHAR(191) NULL;
