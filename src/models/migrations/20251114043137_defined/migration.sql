-- AlterTable
ALTER TABLE `materialissueitems` ADD COLUMN `orderId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `MaterialIssueItems` ADD CONSTRAINT `MaterialIssueItems_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
