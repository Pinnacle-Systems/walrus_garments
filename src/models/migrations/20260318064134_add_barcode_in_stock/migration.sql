-- AlterTable
ALTER TABLE `legacystock` ADD COLUMN `branchId` INTEGER NULL,
    ADD COLUMN `inOrOut` VARCHAR(191) NULL,
    ADD COLUMN `storeId` INTEGER NULL,
    ADD COLUMN `transactionId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `stock` ADD COLUMN `barcode` VARCHAR(191) NULL;
