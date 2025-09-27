-- DropForeignKey
ALTER TABLE `accessorycancelitems` DROP FOREIGN KEY `AccessoryCancelItems_poItemsId_fkey`;

-- AddForeignKey
ALTER TABLE `AccessoryCancelItems` ADD CONSTRAINT `AccessoryCancelItems_poItemsId_fkey` FOREIGN KEY (`poItemsId`) REFERENCES `AccessoryPoItems`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
