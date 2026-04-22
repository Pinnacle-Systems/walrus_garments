-- AlterTable
ALTER TABLE `deliverychallan` ADD COLUMN `challanType` VARCHAR(191) NULL,
    ADD COLUMN `platform` VARCHAR(191) NULL,
    ADD COLUMN `storeId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `DeliveryChallan` ADD CONSTRAINT `DeliveryChallan_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
