-- CreateTable
CREATE TABLE `RequirementYarnProcessList` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `requirementYarnDetailsId` INTEGER NULL,
    `processId` INTEGER NULL,
    `sequence` INTEGER NULL,
    `lossPercentage` DOUBLE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RequirementPlanningProcessList` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `requirementPlanningItemsId` INTEGER NULL,
    `processId` INTEGER NULL,
    `sequence` INTEGER NULL,
    `lossPercentage` DOUBLE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RequirementYarnProcessList` ADD CONSTRAINT `RequirementYarnProcessList_requirementYarnDetailsId_fkey` FOREIGN KEY (`requirementYarnDetailsId`) REFERENCES `RequirementYarnDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementYarnProcessList` ADD CONSTRAINT `RequirementYarnProcessList_processId_fkey` FOREIGN KEY (`processId`) REFERENCES `Process`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementPlanningProcessList` ADD CONSTRAINT `RequirementPlanningProcessList_requirementPlanningItemsId_fkey` FOREIGN KEY (`requirementPlanningItemsId`) REFERENCES `RequirementPlanningItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementPlanningProcessList` ADD CONSTRAINT `RequirementPlanningProcessList_processId_fkey` FOREIGN KEY (`processId`) REFERENCES `Process`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
