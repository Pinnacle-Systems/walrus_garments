-- AlterTable
ALTER TABLE `accessorypo` ADD COLUMN `taxTemplateId` INTEGER NULL,
    ADD COLUMN `termsAndCondtion` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `accessorypoitems` ADD COLUMN `RequirementPlanningItemsId` INTEGER NULL,
    ADD COLUMN `hsnId` INTEGER NULL,
    ADD COLUMN `orderId` INTEGER NULL,
    ADD COLUMN `taxPercent` DOUBLE NULL;

-- AddForeignKey
ALTER TABLE `AccessoryPo` ADD CONSTRAINT `AccessoryPo_taxTemplateId_fkey` FOREIGN KEY (`taxTemplateId`) REFERENCES `TaxTemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryPoItems` ADD CONSTRAINT `AccessoryPoItems_RequirementPlanningItemsId_fkey` FOREIGN KEY (`RequirementPlanningItemsId`) REFERENCES `RequirementPlanningItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryPoItems` ADD CONSTRAINT `AccessoryPoItems_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryPoItems` ADD CONSTRAINT `AccessoryPoItems_hsnId_fkey` FOREIGN KEY (`hsnId`) REFERENCES `Hsn`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
