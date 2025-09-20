-- AlterTable
ALTER TABLE `po` ADD COLUMN `RequirementPlanningItemsId` INTEGER NULL;

-- AlterTable
ALTER TABLE `poitems` ADD COLUMN `RequirementPlanningItemsId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Po` ADD CONSTRAINT `Po_RequirementPlanningItemsId_fkey` FOREIGN KEY (`RequirementPlanningItemsId`) REFERENCES `RequirementPlanningItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoItems` ADD CONSTRAINT `PoItems_RequirementPlanningItemsId_fkey` FOREIGN KEY (`RequirementPlanningItemsId`) REFERENCES `RequirementPlanningItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
