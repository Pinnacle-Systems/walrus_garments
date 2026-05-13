/*
  Warnings:

  - You are about to drop the column `salesInvoiceId` on the `ledger` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `ledger` DROP FOREIGN KEY `Ledger_salesInvoiceId_fkey`;

-- AlterTable
ALTER TABLE `ledger` DROP COLUMN `salesInvoiceId`,
    ADD COLUMN `posId` INTEGER NULL,
    ADD COLUMN `salesDeliveryId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Ledger` ADD CONSTRAINT `Ledger_salesDeliveryId_fkey` FOREIGN KEY (`salesDeliveryId`) REFERENCES `SalesDelivery`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ledger` ADD CONSTRAINT `Ledger_posId_fkey` FOREIGN KEY (`posId`) REFERENCES `Pos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
