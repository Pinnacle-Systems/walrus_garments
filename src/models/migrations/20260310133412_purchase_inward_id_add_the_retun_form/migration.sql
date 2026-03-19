-- AlterTable
ALTER TABLE `directreturnorporeturn` ADD COLUMN `purchaseInwardId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `DirectReturnOrPoReturn` ADD CONSTRAINT `DirectReturnOrPoReturn_purchaseInwardId_fkey` FOREIGN KEY (`purchaseInwardId`) REFERENCES `DirectInwardOrReturn`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
