ALTER TABLE `saleorderitems`
    ADD COLUMN `quotationItemId` INTEGER NULL;

ALTER TABLE `salesreturnitems`
    ADD COLUMN `salesDeliveryItemId` INTEGER NULL;

ALTER TABLE `salesreturn`
    ADD COLUMN `storeId` INTEGER NULL;

CREATE INDEX `SaleOrderItems_quotationItemId_fkey` ON `saleorderitems`(`quotationItemId`);
CREATE INDEX `SalesReturnItems_salesDeliveryItemId_fkey` ON `salesreturnitems`(`salesDeliveryItemId`);
CREATE INDEX `SalesReturn_storeId_fkey` ON `salesreturn`(`storeId`);

ALTER TABLE `saleorderitems`
    ADD CONSTRAINT `SaleOrderItems_quotationItemId_fkey`
    FOREIGN KEY (`quotationItemId`) REFERENCES `quotationitems`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `salesreturnitems`
    ADD CONSTRAINT `SalesReturnItems_salesDeliveryItemId_fkey`
    FOREIGN KEY (`salesDeliveryItemId`) REFERENCES `salesdeliveryitems`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `salesreturn`
    ADD CONSTRAINT `SalesReturn_storeId_fkey`
    FOREIGN KEY (`storeId`) REFERENCES `location`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;
