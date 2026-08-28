-- AlterTable
ALTER TABLE `paymentadjustment` ADD COLUMN `updatedById` INTEGER NULL;

-- AlterTable
ALTER TABLE `saleorder` ADD COLUMN `isCompleted` BOOLEAN NULL;

-- AlterTable
ALTER TABLE `stocktransfer` ADD COLUMN `branchId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `StockTransfer` ADD CONSTRAINT `StockTransfer_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentAdjustment` ADD CONSTRAINT `PaymentAdjustment_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
