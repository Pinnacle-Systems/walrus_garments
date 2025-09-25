-- DropForeignKey
ALTER TABLE `poitems` DROP FOREIGN KEY `PoItems_count_fkey`;

-- DropForeignKey
ALTER TABLE `requirementplanningitems` DROP FOREIGN KEY `RequirementPlanningItems_count_fkey`;

-- AddForeignKey
ALTER TABLE `PoItems` ADD CONSTRAINT `PoItems_count_fkey` FOREIGN KEY (`count`) REFERENCES `yarnCounts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orderYarnDetails` ADD CONSTRAINT `orderYarnDetails_count_fkey` FOREIGN KEY (`count`) REFERENCES `yarnCounts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementPlanningItems` ADD CONSTRAINT `RequirementPlanningItems_count_fkey` FOREIGN KEY (`count`) REFERENCES `yarnCounts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementYarnDetails` ADD CONSTRAINT `RequirementYarnDetails_count_fkey` FOREIGN KEY (`count`) REFERENCES `yarnCounts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
