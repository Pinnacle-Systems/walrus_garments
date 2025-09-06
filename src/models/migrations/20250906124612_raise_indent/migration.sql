-- AlterTable
ALTER TABLE `raiseindentitems` ADD COLUMN `orderdetailsId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `RaiseIndentItems` ADD CONSTRAINT `RaiseIndentItems_orderdetailsId_fkey` FOREIGN KEY (`orderdetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
