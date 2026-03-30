ALTER TABLE `SalesDeliveryItems`
  ADD COLUMN `saleOrderItemId` INTEGER NULL;

ALTER TABLE `SalesDeliveryItems`
  ADD CONSTRAINT `SalesDeliveryItems_saleOrderItemId_fkey`
  FOREIGN KEY (`saleOrderItemId`) REFERENCES `SaleOrderItems`(`id`)
  ON DELETE SET NULL
  ON UPDATE CASCADE;
