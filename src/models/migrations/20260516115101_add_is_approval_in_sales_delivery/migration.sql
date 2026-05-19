-- AlterTable
ALTER TABLE `salesdelivery` ADD COLUMN `approvedAt` DATETIME(3) NULL,
    ADD COLUMN `approvedBy` INTEGER NULL,
    ADD COLUMN `isOverDelivery` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `status` VARCHAR(191) NULL DEFAULT 'APPROVED';
