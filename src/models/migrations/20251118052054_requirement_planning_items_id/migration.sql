/*
  Warnings:

  - You are about to drop the column `RequirementPlanningItemsId` on the `poitems` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `poitems` DROP FOREIGN KEY `PoItems_RequirementPlanningItemsId_fkey`;

-- AlterTable
ALTER TABLE `directitems` ADD COLUMN `requirementPlanningItemsId` INTEGER NULL;

-- AlterTable
ALTER TABLE `poitems` DROP COLUMN `RequirementPlanningItemsId`,
    ADD COLUMN `requirementPlanningItemsId` INTEGER NULL;

-- AlterTable
ALTER TABLE `stock` ADD COLUMN `requirementPlanningItemsId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `PoItems` ADD CONSTRAINT `PoItems_requirementPlanningItemsId_fkey` FOREIGN KEY (`requirementPlanningItemsId`) REFERENCES `RequirementPlanningItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectItems` ADD CONSTRAINT `DirectItems_requirementPlanningItemsId_fkey` FOREIGN KEY (`requirementPlanningItemsId`) REFERENCES `RequirementPlanningItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_requirementPlanningItemsId_fkey` FOREIGN KEY (`requirementPlanningItemsId`) REFERENCES `RequirementPlanningItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
