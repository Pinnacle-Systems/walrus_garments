-- AlterTable
ALTER TABLE `item` ADD COLUMN `isSameAsBarcode` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `PosPayments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `PosId` INTEGER NULL,
    `amount` VARCHAR(191) NULL,
    `reference_no` VARCHAR(191) NULL,
    `card_type` VARCHAR(191) NULL,
    `bank_name` VARCHAR(191) NULL,
    `transaction_id` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PosPayments` ADD CONSTRAINT `PosPayments_PosId_fkey` FOREIGN KEY (`PosId`) REFERENCES `Pos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
