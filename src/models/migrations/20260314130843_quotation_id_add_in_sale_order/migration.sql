-- AlterTable
ALTER TABLE `saleorder` ADD COLUMN `quotationId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Saleorder` ADD CONSTRAINT `Saleorder_quotationId_fkey` FOREIGN KEY (`quotationId`) REFERENCES `Quotation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
