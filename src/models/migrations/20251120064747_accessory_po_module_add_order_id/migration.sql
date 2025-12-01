-- AlterTable
ALTER TABLE `accessoryinwarditems` ADD COLUMN `accessoryRequirementPlanningId` INTEGER NULL,
    ADD COLUMN `orderDetailsId` INTEGER NULL,
    ADD COLUMN `orderId` INTEGER NULL;

-- AlterTable
ALTER TABLE `accessoryreturnitems` ADD COLUMN `accessoryRequirementPlanningId` INTEGER NULL,
    ADD COLUMN `orderDetailsId` INTEGER NULL,
    ADD COLUMN `orderId` INTEGER NULL;

-- AlterTable
ALTER TABLE `cancelitems` ADD COLUMN `accessoryRequirementPlanningId` INTEGER NULL,
    ADD COLUMN `orderId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `AccessoryInwardItems` ADD CONSTRAINT `AccessoryInwardItems_orderDetailsId_fkey` FOREIGN KEY (`orderDetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryInwardItems` ADD CONSTRAINT `AccessoryInwardItems_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryInwardItems` ADD CONSTRAINT `AccessoryInwardItems_accessoryRequirementPlanningId_fkey` FOREIGN KEY (`accessoryRequirementPlanningId`) REFERENCES `AccessoryRequirementPlanning`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryReturnItems` ADD CONSTRAINT `AccessoryReturnItems_orderDetailsId_fkey` FOREIGN KEY (`orderDetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryReturnItems` ADD CONSTRAINT `AccessoryReturnItems_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryReturnItems` ADD CONSTRAINT `AccessoryReturnItems_accessoryRequirementPlanningId_fkey` FOREIGN KEY (`accessoryRequirementPlanningId`) REFERENCES `AccessoryRequirementPlanning`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CancelItems` ADD CONSTRAINT `CancelItems_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CancelItems` ADD CONSTRAINT `CancelItems_accessoryRequirementPlanningId_fkey` FOREIGN KEY (`accessoryRequirementPlanningId`) REFERENCES `AccessoryRequirementPlanning`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
