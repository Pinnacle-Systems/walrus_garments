/*
  Warnings:

  - Added the required column `date` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `PosPayments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PosPayments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `payment` ADD COLUMN `date` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `pospayments` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `date` DATETIME(3) NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- CreateTable
CREATE TABLE `DayBook` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `branchId` INTEGER NOT NULL,
    `openingBalance` DOUBLE NOT NULL DEFAULT 0,
    `posCashSales` DOUBLE NOT NULL DEFAULT 0,
    `bulkCashSales` DOUBLE NOT NULL DEFAULT 0,
    `otherReceipts` DOUBLE NOT NULL DEFAULT 0,
    `cashExpenses` DOUBLE NOT NULL DEFAULT 0,
    `otherPayments` DOUBLE NOT NULL DEFAULT 0,
    `expectedCash` DOUBLE NOT NULL DEFAULT 0,
    `difference` DOUBLE NOT NULL DEFAULT 0,
    `totalUpi` DOUBLE NOT NULL DEFAULT 0,
    `totalCard` DOUBLE NOT NULL DEFAULT 0,
    `totalOnline` DOUBLE NOT NULL DEFAULT 0,
    `denominations` JSON NULL,
    `remarks` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'CLOSED',
    `closedById` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DayBook` ADD CONSTRAINT `DayBook_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DayBook` ADD CONSTRAINT `DayBook_closedById_fkey` FOREIGN KEY (`closedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
