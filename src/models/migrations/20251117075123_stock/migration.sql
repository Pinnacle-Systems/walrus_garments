-- AlterTable
ALTER TABLE `fromordertransferitems` ADD COLUMN `orderdetailsId` INTEGER NULL;

-- AlterTable
ALTER TABLE `stock` ADD COLUMN `orderdetailsId` INTEGER NULL;

-- AlterTable
ALTER TABLE `toordertransferttems` ADD COLUMN `orderdetailsId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_orderdetailsId_fkey` FOREIGN KEY (`orderdetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FromOrderTransferItems` ADD CONSTRAINT `FromOrderTransferItems_orderdetailsId_fkey` FOREIGN KEY (`orderdetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ToOrderTransferTtems` ADD CONSTRAINT `ToOrderTransferTtems_orderdetailsId_fkey` FOREIGN KEY (`orderdetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
