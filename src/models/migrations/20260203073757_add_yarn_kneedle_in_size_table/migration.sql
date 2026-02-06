-- AlterTable
ALTER TABLE `orderdetails` ADD COLUMN `notes` VARCHAR(191) NULL,
    ADD COLUMN `packingCover` VARCHAR(191) NULL,
    ADD COLUMN `packingType` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `ordersizedetails` ADD COLUMN `yarnKneedleId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `orderSizeDetails` ADD CONSTRAINT `orderSizeDetails_yarnKneedleId_fkey` FOREIGN KEY (`yarnKneedleId`) REFERENCES `YarnNeedle`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
