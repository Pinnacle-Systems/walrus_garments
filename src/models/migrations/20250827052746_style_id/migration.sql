-- AlterTable
ALTER TABLE `requirementplanningform` ADD COLUMN `styleId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `RequirementPlanningForm` ADD CONSTRAINT `RequirementPlanningForm_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
