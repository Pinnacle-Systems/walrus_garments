-- AlterTable
ALTER TABLE `stocktransfer` ADD COLUMN `docId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `stocktransferitems` ADD COLUMN `stockTransferId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `StockTransferItems` ADD CONSTRAINT `StockTransferItems_stockTransferId_fkey` FOREIGN KEY (`stockTransferId`) REFERENCES `StockTransfer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
