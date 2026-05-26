-- AlterTable
ALTER TABLE `ledger` ADD COLUMN `paymentId` INTEGER NULL,
    ADD COLUMN `posPaymentId` INTEGER NULL,
    MODIFY `EntryType` ENUM('Purchase_Bill', 'Process_Bill', 'Sales', 'My_Payment', 'Customer_Payment', 'Credit_Note', 'Debit_Note', 'Opening_Balance', 'Printing_Job_Work', 'Credit_Adjustment', 'Debit_Adjustment') NOT NULL;

-- AddForeignKey
ALTER TABLE `Ledger` ADD CONSTRAINT `Ledger_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `Payment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ledger` ADD CONSTRAINT `Ledger_posPaymentId_fkey` FOREIGN KEY (`posPaymentId`) REFERENCES `PosPayments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
