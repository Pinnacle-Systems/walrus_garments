-- AlterTable
ALTER TABLE `directinwardorreturn` ADD COLUMN `orderId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `DirectInwardOrReturn` ADD CONSTRAINT `DirectInwardOrReturn_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
