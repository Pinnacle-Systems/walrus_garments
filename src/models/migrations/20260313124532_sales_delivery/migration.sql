-- AlterTable
ALTER TABLE `item` ADD COLUMN `mainCategoryId` INTEGER NULL,
    ADD COLUMN `subCategoryId` INTEGER NULL;

-- AlterTable
ALTER TABLE `legacystock` ADD COLUMN `barcode` VARCHAR(191) NULL;
