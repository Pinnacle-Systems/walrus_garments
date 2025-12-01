-- AlterTable
ALTER TABLE `accessoryinward` MODIFY `inwardOrReturn` ENUM('PurchaseCancel', 'PurchaseInward', 'PurchaseReturn', 'ProcessDelivery', 'ProcessInward', 'DirectInward', 'DirectReturn', 'CuttingDelivery', 'CuttingInward', 'CuttingExcessFabricReturn', 'ProcessDeliveryReturn', 'RawMaterialSales', 'RawMaterialOpeningStock', 'GeneralPo', 'OrderAgainstPo', 'MaterialIssue', 'StockTransfer', 'GeneralInward', 'GeneralReturn', 'FromOrderTransfer', 'ToOrderTransfer') NULL;

-- AlterTable
ALTER TABLE `accessorystock` MODIFY `inOrOut` ENUM('PurchaseCancel', 'PurchaseInward', 'PurchaseReturn', 'ProcessDelivery', 'ProcessInward', 'DirectInward', 'DirectReturn', 'CuttingDelivery', 'CuttingInward', 'CuttingExcessFabricReturn', 'ProcessDeliveryReturn', 'RawMaterialSales', 'RawMaterialOpeningStock', 'GeneralPo', 'OrderAgainstPo', 'MaterialIssue', 'StockTransfer', 'GeneralInward', 'GeneralReturn', 'FromOrderTransfer', 'ToOrderTransfer') NULL;

-- AlterTable
ALTER TABLE `directinwardorreturn` MODIFY `inwardOrReturn` ENUM('PurchaseCancel', 'PurchaseInward', 'PurchaseReturn', 'ProcessDelivery', 'ProcessInward', 'DirectInward', 'DirectReturn', 'CuttingDelivery', 'CuttingInward', 'CuttingExcessFabricReturn', 'ProcessDeliveryReturn', 'RawMaterialSales', 'RawMaterialOpeningStock', 'GeneralPo', 'OrderAgainstPo', 'MaterialIssue', 'StockTransfer', 'GeneralInward', 'GeneralReturn', 'FromOrderTransfer', 'ToOrderTransfer') NULL;

-- AlterTable
ALTER TABLE `fromaccessorytransferitems` ADD COLUMN `orderDetailsId` INTEGER NULL;

-- AlterTable
ALTER TABLE `pinwardorreturn` MODIFY `inwardOrReturn` ENUM('PurchaseCancel', 'PurchaseInward', 'PurchaseReturn', 'ProcessDelivery', 'ProcessInward', 'DirectInward', 'DirectReturn', 'CuttingDelivery', 'CuttingInward', 'CuttingExcessFabricReturn', 'ProcessDeliveryReturn', 'RawMaterialSales', 'RawMaterialOpeningStock', 'GeneralPo', 'OrderAgainstPo', 'MaterialIssue', 'StockTransfer', 'GeneralInward', 'GeneralReturn', 'FromOrderTransfer', 'ToOrderTransfer') NOT NULL;

-- AlterTable
ALTER TABLE `stock` MODIFY `inOrOut` ENUM('PurchaseCancel', 'PurchaseInward', 'PurchaseReturn', 'ProcessDelivery', 'ProcessInward', 'DirectInward', 'DirectReturn', 'CuttingDelivery', 'CuttingInward', 'CuttingExcessFabricReturn', 'ProcessDeliveryReturn', 'RawMaterialSales', 'RawMaterialOpeningStock', 'GeneralPo', 'OrderAgainstPo', 'MaterialIssue', 'StockTransfer', 'GeneralInward', 'GeneralReturn', 'FromOrderTransfer', 'ToOrderTransfer') NULL;

-- AlterTable
ALTER TABLE `toaccessorytransferitems` ADD COLUMN `orderDetailsId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `FromAccessoryTransferItems` ADD CONSTRAINT `FromAccessoryTransferItems_orderDetailsId_fkey` FOREIGN KEY (`orderDetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ToAccessoryTransferItems` ADD CONSTRAINT `ToAccessoryTransferItems_orderDetailsId_fkey` FOREIGN KEY (`orderDetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
