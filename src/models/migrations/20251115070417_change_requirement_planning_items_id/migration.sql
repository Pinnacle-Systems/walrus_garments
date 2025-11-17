-- AlterTable
ALTER TABLE `raiseindentitems` ADD COLUMN `qty` DOUBLE NULL,
    ADD COLUMN `requiredQty` DOUBLE NULL,
    ADD COLUMN `requirementPlanningItemsId` INTEGER NULL,
    ADD COLUMN `styleColor` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `RaiseIndentItems` ADD CONSTRAINT `RaiseIndentItems_requirementPlanningItemsId_fkey` FOREIGN KEY (`requirementPlanningItemsId`) REFERENCES `RequirementPlanningItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
