-- AlterTable
ALTER TABLE `materialissue` ADD COLUMN `raiseIndentId` INTEGER NULL;

-- AlterTable
ALTER TABLE `materialissueitems` ADD COLUMN `raiseIndentId` INTEGER NULL,
    ADD COLUMN `requirementPlanningItemsId` INTEGER NULL,
    ADD COLUMN `uomId` INTEGER NULL;

-- AlterTable
ALTER TABLE `raiseindentitems` ADD COLUMN `uomId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `RaiseIndentItems` ADD CONSTRAINT `RaiseIndentItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssue` ADD CONSTRAINT `MaterialIssue_raiseIndentId_fkey` FOREIGN KEY (`raiseIndentId`) REFERENCES `RaiseIndent`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssueItems` ADD CONSTRAINT `MaterialIssueItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssueItems` ADD CONSTRAINT `MaterialIssueItems_raiseIndentId_fkey` FOREIGN KEY (`raiseIndentId`) REFERENCES `RaiseIndent`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssueItems` ADD CONSTRAINT `MaterialIssueItems_requirementPlanningItemsId_fkey` FOREIGN KEY (`requirementPlanningItemsId`) REFERENCES `RequirementPlanningItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
