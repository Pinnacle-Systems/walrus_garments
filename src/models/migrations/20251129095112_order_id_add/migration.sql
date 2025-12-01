-- AlterTable
ALTER TABLE `directitems` ADD COLUMN `orderId` INTEGER NULL;

-- AlterTable
ALTER TABLE `directreturnitems` ADD COLUMN `orderId` INTEGER NULL,
    ADD COLUMN `requirementPlanningItemsId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `DirectItems` ADD CONSTRAINT `DirectItems_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnItems` ADD CONSTRAINT `DirectReturnItems_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnItems` ADD CONSTRAINT `DirectReturnItems_requirementPlanningItemsId_fkey` FOREIGN KEY (`requirementPlanningItemsId`) REFERENCES `RequirementPlanningItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
