-- AlterTable
ALTER TABLE `orderaccessorydetails` ADD COLUMN `orderId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `OrderAccessoryDetails` ADD CONSTRAINT `OrderAccessoryDetails_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
