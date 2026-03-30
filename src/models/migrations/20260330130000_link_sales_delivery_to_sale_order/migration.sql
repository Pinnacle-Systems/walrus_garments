ALTER TABLE `SalesDelivery` DROP FOREIGN KEY `SalesDelivery_salesInvoiceId_fkey`;

ALTER TABLE `SalesDelivery`
  DROP COLUMN `salesInvoiceId`,
  ADD COLUMN `saleOrderId` INTEGER NULL;

ALTER TABLE `SalesDelivery`
  ADD CONSTRAINT `SalesDelivery_saleOrderId_fkey`
  FOREIGN KEY (`saleOrderId`) REFERENCES `Saleorder`(`id`)
  ON DELETE SET NULL
  ON UPDATE CASCADE;
