-- CreateTable
CREATE TABLE `RequirementPlanningForm` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `branchId` INTEGER NULL,
    `partyId` INTEGER NULL,
    `requirementDate` DATETIME(3) NULL,
    `remarks` LONGTEXT NULL,
    `specialInstructions` VARCHAR(191) NULL,
    `sampelId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RequirementPlanningFormItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `requirementPlanningFormId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RequirementPlanningForm` ADD CONSTRAINT `RequirementPlanningForm_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementPlanningForm` ADD CONSTRAINT `RequirementPlanningForm_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementPlanningForm` ADD CONSTRAINT `RequirementPlanningForm_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementPlanningForm` ADD CONSTRAINT `RequirementPlanningForm_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementPlanningForm` ADD CONSTRAINT `RequirementPlanningForm_sampelId_fkey` FOREIGN KEY (`sampelId`) REFERENCES `Sample`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementPlanningFormItems` ADD CONSTRAINT `RequirementPlanningFormItems_requirementPlanningFormId_fkey` FOREIGN KEY (`requirementPlanningFormId`) REFERENCES `RequirementPlanningForm`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
