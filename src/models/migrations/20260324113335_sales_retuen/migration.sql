-- AlterTable
ALTER TABLE `salesreturn` ADD COLUMN `salesDeliveryId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `SalesReturn` ADD CONSTRAINT `SalesReturn_salesDeliveryId_fkey` FOREIGN KEY (`salesDeliveryId`) REFERENCES `SalesDelivery`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
