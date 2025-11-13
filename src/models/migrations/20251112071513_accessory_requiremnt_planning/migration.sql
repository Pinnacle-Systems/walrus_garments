-- AlterTable
ALTER TABLE `requirementplanningitems` ADD COLUMN `tranferQty` INTEGER NULL;

-- CreateTable
CREATE TABLE `AccessoryRequirementPlanning` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `RequirementPlanningId` INTEGER NULL,
    `orderId` INTEGER NULL,
    `orderDetailsId` INTEGER NULL,
    `accessoryId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `poQty` DOUBLE NULL,
    `qty` DOUBLE NULL,
    `uomId` INTEGER NULL,
    `percentage` DOUBLE NULL,
    `tranferQty` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AccessoryRequirementPlanning` ADD CONSTRAINT `AccessoryRequirementPlanning_RequirementPlanningId_fkey` FOREIGN KEY (`RequirementPlanningId`) REFERENCES `RequirementPlanningForm`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryRequirementPlanning` ADD CONSTRAINT `AccessoryRequirementPlanning_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryRequirementPlanning` ADD CONSTRAINT `AccessoryRequirementPlanning_orderDetailsId_fkey` FOREIGN KEY (`orderDetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryRequirementPlanning` ADD CONSTRAINT `AccessoryRequirementPlanning_accessoryId_fkey` FOREIGN KEY (`accessoryId`) REFERENCES `Accessory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryRequirementPlanning` ADD CONSTRAINT `AccessoryRequirementPlanning_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryRequirementPlanning` ADD CONSTRAINT `AccessoryRequirementPlanning_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryRequirementPlanning` ADD CONSTRAINT `AccessoryRequirementPlanning_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
