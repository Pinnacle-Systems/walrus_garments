-- AlterTable
ALTER TABLE `poitems` ADD COLUMN `orderId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `PoItems` ADD CONSTRAINT `PoItems_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
