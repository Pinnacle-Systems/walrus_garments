-- AlterTable
ALTER TABLE `cancelitems` ADD COLUMN `orderdetailsId` INTEGER NULL;

-- AlterTable
ALTER TABLE `directitems` ADD COLUMN `orderdetailsId` INTEGER NULL;

-- AlterTable
ALTER TABLE `directreturnorporeturn` ADD COLUMN `orderdetailsId` INTEGER NULL;

-- AlterTable
ALTER TABLE `poitems` ADD COLUMN `orderdetailsId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `PoItems` ADD CONSTRAINT `PoItems_orderdetailsId_fkey` FOREIGN KEY (`orderdetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectItems` ADD CONSTRAINT `DirectItems_orderdetailsId_fkey` FOREIGN KEY (`orderdetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnOrPoReturn` ADD CONSTRAINT `DirectReturnOrPoReturn_orderdetailsId_fkey` FOREIGN KEY (`orderdetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CancelItems` ADD CONSTRAINT `CancelItems_orderdetailsId_fkey` FOREIGN KEY (`orderdetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
