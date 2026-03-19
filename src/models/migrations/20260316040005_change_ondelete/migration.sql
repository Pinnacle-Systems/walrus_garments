-- DropForeignKey
ALTER TABLE `quotationitems` DROP FOREIGN KEY `QuotationItems_quotationId_fkey`;

-- DropForeignKey
ALTER TABLE `saleorderitems` DROP FOREIGN KEY `SaleOrderItems_saleOrderId_fkey`;

-- AddForeignKey
ALTER TABLE `QuotationItems` ADD CONSTRAINT `QuotationItems_quotationId_fkey` FOREIGN KEY (`quotationId`) REFERENCES `Quotation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SaleOrderItems` ADD CONSTRAINT `SaleOrderItems_saleOrderId_fkey` FOREIGN KEY (`saleOrderId`) REFERENCES `Saleorder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
