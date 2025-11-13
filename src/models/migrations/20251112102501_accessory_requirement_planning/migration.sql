/*
  Warnings:

  - You are about to alter the column `tranferQty` on the `requirementplanningitems` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `accessoryrequirementplanning` ADD COLUMN `accessoryCategoryId` INTEGER NULL,
    ADD COLUMN `accessoryGroupId` INTEGER NULL;

-- AlterTable
ALTER TABLE `requirementplanningitems` MODIFY `tranferQty` DOUBLE NULL;

-- AddForeignKey
ALTER TABLE `AccessoryRequirementPlanning` ADD CONSTRAINT `AccessoryRequirementPlanning_accessoryCategoryId_fkey` FOREIGN KEY (`accessoryCategoryId`) REFERENCES `AccessoryCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryRequirementPlanning` ADD CONSTRAINT `AccessoryRequirementPlanning_accessoryGroupId_fkey` FOREIGN KEY (`accessoryGroupId`) REFERENCES `AccessoryGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
