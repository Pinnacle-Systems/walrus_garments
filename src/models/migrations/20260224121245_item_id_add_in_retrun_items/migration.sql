-- AlterTable
ALTER TABLE `directreturnitems` ADD COLUMN `itemId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `DirectReturnItems` ADD CONSTRAINT `DirectReturnItems_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Item`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
