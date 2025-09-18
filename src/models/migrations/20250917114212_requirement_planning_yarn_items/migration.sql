-- CreateTable
CREATE TABLE `RequirementPlanningYarnItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `requirementPlanningFormId` INTEGER NULL,
    `orderId` INTEGER NULL,
    `orderDetailsId` INTEGER NULL,
    `percentage` INTEGER NULL,
    `colorId` INTEGER NULL,
    `yarnId` INTEGER NULL,
    `count` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RequirementPlanningYarnItems` ADD CONSTRAINT `RequirementPlanningYarnItems_requirementPlanningFormId_fkey` FOREIGN KEY (`requirementPlanningFormId`) REFERENCES `RequirementPlanningForm`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementPlanningYarnItems` ADD CONSTRAINT `RequirementPlanningYarnItems_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementPlanningYarnItems` ADD CONSTRAINT `RequirementPlanningYarnItems_orderDetailsId_fkey` FOREIGN KEY (`orderDetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementPlanningYarnItems` ADD CONSTRAINT `RequirementPlanningYarnItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementPlanningYarnItems` ADD CONSTRAINT `RequirementPlanningYarnItems_yarnId_fkey` FOREIGN KEY (`yarnId`) REFERENCES `Yarn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementPlanningYarnItems` ADD CONSTRAINT `RequirementPlanningYarnItems_count_fkey` FOREIGN KEY (`count`) REFERENCES `Counts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
