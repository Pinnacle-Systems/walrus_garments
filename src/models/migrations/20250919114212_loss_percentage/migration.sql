-- AlterTable
ALTER TABLE `requirementplanningitems` ADD COLUMN `isProcess` VARCHAR(191) NULL,
    ADD COLUMN `lossPercentage` DOUBLE NULL,
    ADD COLUMN `processId` INTEGER NULL;

-- AlterTable
ALTER TABLE `requirementyarndetails` ADD COLUMN `isProcess` VARCHAR(191) NULL,
    ADD COLUMN `lossPercentage` DOUBLE NULL,
    ADD COLUMN `processId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `RequirementPlanningItems` ADD CONSTRAINT `RequirementPlanningItems_processId_fkey` FOREIGN KEY (`processId`) REFERENCES `Process`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementYarnDetails` ADD CONSTRAINT `RequirementYarnDetails_processId_fkey` FOREIGN KEY (`processId`) REFERENCES `Process`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
