/*
  Warnings:

  - A unique constraint covering the columns `[salesInvoiceId]` on the table `Ledger` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `ledger` ADD COLUMN `salesInvoiceId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Ledger_salesInvoiceId_key` ON `Ledger`(`salesInvoiceId`);

-- AddForeignKey
ALTER TABLE `Ledger` ADD CONSTRAINT `Ledger_salesInvoiceId_fkey` FOREIGN KEY (`salesInvoiceId`) REFERENCES `SalesInvoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
