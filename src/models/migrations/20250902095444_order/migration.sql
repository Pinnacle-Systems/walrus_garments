-- AlterTable
ALTER TABLE `po` ADD COLUMN `requirementId` INTEGER NULL;

-- AlterTable
ALTER TABLE `poitems` ADD COLUMN `weight` DOUBLE NULL,
    ADD COLUMN `yarncategoryId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Po` ADD CONSTRAINT `Po_requirementId_fkey` FOREIGN KEY (`requirementId`) REFERENCES `RequirementPlanningForm`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoItems` ADD CONSTRAINT `PoItems_yarncategoryId_fkey` FOREIGN KEY (`yarncategoryId`) REFERENCES `YarnType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
