-- AlterTable
ALTER TABLE `payment` ADD COLUMN `refDocId` VARCHAR(191) NULL,
    ADD COLUMN `refId` INTEGER NULL,
    ADD COLUMN `transaction` VARCHAR(191) NULL,
    ADD COLUMN `transactionId` INTEGER NULL,
    ADD COLUMN `transactionType` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `quotation` ADD COLUMN `remarks` VARCHAR(191) NULL,
    ADD COLUMN `termId` INTEGER NULL,
    ADD COLUMN `termsAndCondition` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `saleorder` ADD COLUMN `remarks` VARCHAR(191) NULL,
    ADD COLUMN `termId` INTEGER NULL,
    ADD COLUMN `termsAndCondition` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `salesdelivery` ADD COLUMN `remarks` VARCHAR(191) NULL,
    ADD COLUMN `termId` INTEGER NULL,
    ADD COLUMN `termsAndCondition` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `salesinvoice` ADD COLUMN `remarks` VARCHAR(191) NULL,
    ADD COLUMN `termId` INTEGER NULL,
    ADD COLUMN `termsAndCondition` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Quotation` ADD CONSTRAINT `Quotation_termId_fkey` FOREIGN KEY (`termId`) REFERENCES `TermsAndConditions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Saleorder` ADD CONSTRAINT `Saleorder_termId_fkey` FOREIGN KEY (`termId`) REFERENCES `TermsAndConditions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesDelivery` ADD CONSTRAINT `SalesDelivery_termId_fkey` FOREIGN KEY (`termId`) REFERENCES `TermsAndConditions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesInvoice` ADD CONSTRAINT `SalesInvoice_termId_fkey` FOREIGN KEY (`termId`) REFERENCES `TermsAndConditions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
