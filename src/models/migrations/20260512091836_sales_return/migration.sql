-- AlterTable
ALTER TABLE `salesreturn` ADD COLUMN `returnCharge` VARCHAR(191) NULL,
    ADD COLUMN `returnChargeEnabled` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `returnChargeType` VARCHAR(191) NULL;
