-- AlterTable
ALTER TABLE `fromordertransferitems` ADD COLUMN `stockQty` DOUBLE NULL;

-- AlterTable
ALTER TABLE `stocktransfer` ADD COLUMN `fromCustomerId` INTEGER NULL,
    ADD COLUMN `toCustomerId` INTEGER NULL;

-- AlterTable
ALTER TABLE `toordertransferttems` ADD COLUMN `balanceQty` DOUBLE NULL,
    ADD COLUMN `requiredQty` DOUBLE NULL;
