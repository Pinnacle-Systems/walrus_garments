-- AlterTable
ALTER TABLE `quotation` ADD COLUMN `courierCharge` VARCHAR(191) NULL,
    ADD COLUMN `courierChargeEnabled` BOOLEAN NULL DEFAULT false;

-- AlterTable
ALTER TABLE `saleorder` ADD COLUMN `courierCharge` VARCHAR(191) NULL,
    ADD COLUMN `courierChargeEnabled` BOOLEAN NULL DEFAULT false;

-- AlterTable
ALTER TABLE `salesdelivery` ADD COLUMN `courierCharge` VARCHAR(191) NULL,
    ADD COLUMN `courierChargeEnabled` BOOLEAN NULL DEFAULT false;
