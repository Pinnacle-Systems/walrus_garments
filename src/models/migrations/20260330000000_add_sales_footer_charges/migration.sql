ALTER TABLE `Quotation`
  ADD COLUMN `packingChargeEnabled` BOOLEAN NULL DEFAULT false,
  ADD COLUMN `packingCharge` VARCHAR(191) NULL,
  ADD COLUMN `shippingChargeEnabled` BOOLEAN NULL DEFAULT false,
  ADD COLUMN `shippingCharge` VARCHAR(191) NULL;

ALTER TABLE `Saleorder`
  ADD COLUMN `packingChargeEnabled` BOOLEAN NULL DEFAULT false,
  ADD COLUMN `packingCharge` VARCHAR(191) NULL,
  ADD COLUMN `shippingChargeEnabled` BOOLEAN NULL DEFAULT false,
  ADD COLUMN `shippingCharge` VARCHAR(191) NULL;

ALTER TABLE `SalesDelivery`
  ADD COLUMN `packingChargeEnabled` BOOLEAN NULL DEFAULT false,
  ADD COLUMN `packingCharge` VARCHAR(191) NULL,
  ADD COLUMN `shippingChargeEnabled` BOOLEAN NULL DEFAULT false,
  ADD COLUMN `shippingCharge` VARCHAR(191) NULL;

ALTER TABLE `SalesInvoice`
  ADD COLUMN `packingChargeEnabled` BOOLEAN NULL DEFAULT false,
  ADD COLUMN `packingCharge` VARCHAR(191) NULL,
  ADD COLUMN `shippingChargeEnabled` BOOLEAN NULL DEFAULT false,
  ADD COLUMN `shippingCharge` VARCHAR(191) NULL;

ALTER TABLE `SalesReturn`
  ADD COLUMN `packingChargeEnabled` BOOLEAN NULL DEFAULT false,
  ADD COLUMN `packingCharge` VARCHAR(191) NULL,
  ADD COLUMN `shippingChargeEnabled` BOOLEAN NULL DEFAULT false,
  ADD COLUMN `shippingCharge` VARCHAR(191) NULL;
