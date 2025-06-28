-- AlterTable
ALTER TABLE `directitems` ADD COLUMN `poItemsId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `DirectItems` ADD CONSTRAINT `DirectItems_poItemsId_fkey` FOREIGN KEY (`poItemsId`) REFERENCES `PoItems`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
