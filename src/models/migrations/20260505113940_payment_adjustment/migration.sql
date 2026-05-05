-- AlterTable
ALTER TABLE `pospayments` MODIFY `date` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `PaymentAdjustment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `billRef` VARCHAR(50) NULL,
    `adjustmentType` VARCHAR(191) NULL,
    `originalMode` VARCHAR(20) NULL,
    `newMode` VARCHAR(20) NULL,
    `originalAmount` DECIMAL(10, 2) NOT NULL,
    `adjustmentAmt` DECIMAL(10, 2) NOT NULL,
    `reason` VARCHAR(255) NULL,
    `status` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
