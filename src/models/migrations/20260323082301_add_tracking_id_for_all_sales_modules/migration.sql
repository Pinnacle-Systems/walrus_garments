/*
  Warnings:

  - You are about to drop the column `taxType` on the `saleorderitems` table. All the data in the column will be lost.
  - You are about to drop the column `taxType` on the `salesdeliveryitems` table. All the data in the column will be lost.
  - You are about to drop the column `taxType` on the `salesinvoiceitems` table. All the data in the column will be lost.
  - You are about to drop the column `taxPercent` on the `salesreturnitems` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `quotationitems` ADD COLUMN `taxMethod` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `saleorderitems` DROP COLUMN `taxType`,
    ADD COLUMN `taxMethod` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `salesdelivery` ADD COLUMN `salesInvoiceId` INTEGER NULL;

-- AlterTable
ALTER TABLE `salesdeliveryitems` DROP COLUMN `taxType`,
    ADD COLUMN `taxMethod` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `salesinvoice` ADD COLUMN `saleOrderId` INTEGER NULL;

-- AlterTable
ALTER TABLE `salesinvoiceitems` DROP COLUMN `taxType`,
    ADD COLUMN `taxMethod` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `salesreturnitems` DROP COLUMN `taxPercent`,
    ADD COLUMN `taxMethod` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `SalesDelivery` ADD CONSTRAINT `SalesDelivery_salesInvoiceId_fkey` FOREIGN KEY (`salesInvoiceId`) REFERENCES `SalesInvoice`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesInvoice` ADD CONSTRAINT `SalesInvoice_saleOrderId_fkey` FOREIGN KEY (`saleOrderId`) REFERENCES `Saleorder`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
