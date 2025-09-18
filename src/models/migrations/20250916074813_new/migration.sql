-- AlterTable
ALTER TABLE `directinwardorreturn` MODIFY `inwardOrReturn` ENUM('PurchaseCancel', 'PurchaseInward', 'PurchaseReturn', 'ProcessDelivery', 'ProcessInward', 'DirectInward', 'DirectReturn', 'CuttingDelivery', 'CuttingInward', 'CuttingExcessFabricReturn', 'ProcessDeliveryReturn', 'RawMaterialSales', 'RawMaterialOpeningStock', 'GeneralPo', 'OrderAgainstPo', 'MaterialIssue', 'StockTransfer') NULL;

-- AlterTable
ALTER TABLE `pinwardorreturn` MODIFY `inwardOrReturn` ENUM('PurchaseCancel', 'PurchaseInward', 'PurchaseReturn', 'ProcessDelivery', 'ProcessInward', 'DirectInward', 'DirectReturn', 'CuttingDelivery', 'CuttingInward', 'CuttingExcessFabricReturn', 'ProcessDeliveryReturn', 'RawMaterialSales', 'RawMaterialOpeningStock', 'GeneralPo', 'OrderAgainstPo', 'MaterialIssue', 'StockTransfer') NOT NULL;

-- AlterTable
ALTER TABLE `stock` MODIFY `inOrOut` ENUM('PurchaseCancel', 'PurchaseInward', 'PurchaseReturn', 'ProcessDelivery', 'ProcessInward', 'DirectInward', 'DirectReturn', 'CuttingDelivery', 'CuttingInward', 'CuttingExcessFabricReturn', 'ProcessDeliveryReturn', 'RawMaterialSales', 'RawMaterialOpeningStock', 'GeneralPo', 'OrderAgainstPo', 'MaterialIssue', 'StockTransfer') NULL;
