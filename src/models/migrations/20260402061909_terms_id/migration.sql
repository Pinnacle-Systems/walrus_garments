/*
  Warnings:

  - You are about to drop the column `termId` on the `quotation` table. All the data in the column will be lost.
  - You are about to drop the column `termId` on the `saleorder` table. All the data in the column will be lost.
  - You are about to drop the column `termId` on the `salesdelivery` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `quotation` DROP FOREIGN KEY `Quotation_termId_fkey`;

-- DropForeignKey
ALTER TABLE `saleorder` DROP FOREIGN KEY `Saleorder_termId_fkey`;

-- DropForeignKey
ALTER TABLE `salesdelivery` DROP FOREIGN KEY `SalesDelivery_termId_fkey`;

-- AlterTable
ALTER TABLE `quotation` DROP COLUMN `termId`,
    ADD COLUMN `termsAndConditionsId` INTEGER NULL;

-- AlterTable
ALTER TABLE `saleorder` DROP COLUMN `termId`,
    ADD COLUMN `termsAndConditionsId` INTEGER NULL;

-- AlterTable
ALTER TABLE `salesdelivery` DROP COLUMN `termId`,
    ADD COLUMN `termsAndConditionsId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Quotation` ADD CONSTRAINT `Quotation_termsAndConditionsId_fkey` FOREIGN KEY (`termsAndConditionsId`) REFERENCES `TermsAndConditionsNew`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Saleorder` ADD CONSTRAINT `Saleorder_termsAndConditionsId_fkey` FOREIGN KEY (`termsAndConditionsId`) REFERENCES `TermsAndConditionsNew`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesDelivery` ADD CONSTRAINT `SalesDelivery_termsAndConditionsId_fkey` FOREIGN KEY (`termsAndConditionsId`) REFERENCES `TermsAndConditionsNew`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
