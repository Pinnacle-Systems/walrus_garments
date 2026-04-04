CREATE TABLE `SalesDeliveryFulfillmentAllocation` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `salesDeliveryId` INTEGER NOT NULL,
  `salesDeliveryItemId` INTEGER NULL,
  `saleOrderItemId` INTEGER NULL,
  `itemId` INTEGER NULL,
  `sizeId` INTEGER NULL,
  `colorId` INTEGER NULL,
  `uomId` INTEGER NULL,
  `storeId` INTEGER NULL,
  `branchId` INTEGER NULL,
  `barcode` VARCHAR(191) NULL,
  `allocatedQty` DOUBLE NULL,
  `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `SalesDeliveryFulfillmentAllocation`
  ADD CONSTRAINT `SalesDeliveryFulfillmentAllocation_salesDeliveryId_fkey`
  FOREIGN KEY (`salesDeliveryId`) REFERENCES `SalesDelivery`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `SalesDeliveryFulfillmentAllocation`
  ADD CONSTRAINT `SalesDeliveryFulfillmentAllocation_salesDeliveryItemId_fkey`
  FOREIGN KEY (`salesDeliveryItemId`) REFERENCES `SalesDeliveryItems`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `SalesDeliveryFulfillmentAllocation`
  ADD CONSTRAINT `SalesDeliveryFulfillmentAllocation_saleOrderItemId_fkey`
  FOREIGN KEY (`saleOrderItemId`) REFERENCES `SaleOrderItems`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `SalesDeliveryFulfillmentAllocation`
  ADD CONSTRAINT `SalesDeliveryFulfillmentAllocation_itemId_fkey`
  FOREIGN KEY (`itemId`) REFERENCES `Item`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `SalesDeliveryFulfillmentAllocation`
  ADD CONSTRAINT `SalesDeliveryFulfillmentAllocation_sizeId_fkey`
  FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `SalesDeliveryFulfillmentAllocation`
  ADD CONSTRAINT `SalesDeliveryFulfillmentAllocation_colorId_fkey`
  FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `SalesDeliveryFulfillmentAllocation`
  ADD CONSTRAINT `SalesDeliveryFulfillmentAllocation_uomId_fkey`
  FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `SalesDeliveryFulfillmentAllocation`
  ADD CONSTRAINT `SalesDeliveryFulfillmentAllocation_storeId_fkey`
  FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `SalesDeliveryFulfillmentAllocation`
  ADD CONSTRAINT `SalesDeliveryFulfillmentAllocation_branchId_fkey`
  FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;
