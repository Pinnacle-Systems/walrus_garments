-- DropForeignKey
ALTER TABLE `ordersizedetails` DROP FOREIGN KEY `orderSizeDetails_orderdetailsId_fkey`;

-- DropForeignKey
ALTER TABLE `orderyarndetails` DROP FOREIGN KEY `orderYarnDetails_orderdetailsId_fkey`;

-- AddForeignKey
ALTER TABLE `orderSizeDetails` ADD CONSTRAINT `orderSizeDetails_orderdetailsId_fkey` FOREIGN KEY (`orderdetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orderYarnDetails` ADD CONSTRAINT `orderYarnDetails_orderdetailsId_fkey` FOREIGN KEY (`orderdetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
