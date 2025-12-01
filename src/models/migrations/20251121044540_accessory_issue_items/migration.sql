-- AlterTable
ALTER TABLE `accessoryraiseindentitems` ADD COLUMN `accessoryCategoryId` INTEGER NULL,
    ADD COLUMN `accessoryGroupId` INTEGER NULL;

-- CreateTable
CREATE TABLE `AccessoryMaterialIssueItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `materialIssueId` INTEGER NULL,
    `styleId` INTEGER NULL,
    `requirementPlanningFormId` INTEGER NULL,
    `orderDetailsId` INTEGER NULL,
    `orderId` INTEGER NULL,
    `accessoryId` INTEGER NULL,
    `accessoryCategoryId` INTEGER NULL,
    `accessoryGroupId` INTEGER NULL,
    `uomId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `qty` DOUBLE NULL,
    `requiredQty` DOUBLE NULL,
    `issueQty` DOUBLE NULL,
    `raiseIndentId` INTEGER NULL,
    `styleColor` VARCHAR(191) NULL,
    `accessoryRaiseIndentItemsId` INTEGER NULL,
    `accessoryRequirementPlanningId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AccessoryRaiseIndentItems` ADD CONSTRAINT `AccessoryRaiseIndentItems_accessoryGroupId_fkey` FOREIGN KEY (`accessoryGroupId`) REFERENCES `AccessoryGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryRaiseIndentItems` ADD CONSTRAINT `AccessoryRaiseIndentItems_accessoryCategoryId_fkey` FOREIGN KEY (`accessoryCategoryId`) REFERENCES `AccessoryCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryMaterialIssueItems` ADD CONSTRAINT `AccessoryMaterialIssueItems_materialIssueId_fkey` FOREIGN KEY (`materialIssueId`) REFERENCES `MaterialIssue`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryMaterialIssueItems` ADD CONSTRAINT `AccessoryMaterialIssueItems_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryMaterialIssueItems` ADD CONSTRAINT `AccessoryMaterialIssueItems_requirementPlanningFormId_fkey` FOREIGN KEY (`requirementPlanningFormId`) REFERENCES `RequirementPlanningForm`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryMaterialIssueItems` ADD CONSTRAINT `AccessoryMaterialIssueItems_orderDetailsId_fkey` FOREIGN KEY (`orderDetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryMaterialIssueItems` ADD CONSTRAINT `AccessoryMaterialIssueItems_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryMaterialIssueItems` ADD CONSTRAINT `AccessoryMaterialIssueItems_accessoryId_fkey` FOREIGN KEY (`accessoryId`) REFERENCES `Accessory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryMaterialIssueItems` ADD CONSTRAINT `AccessoryMaterialIssueItems_accessoryCategoryId_fkey` FOREIGN KEY (`accessoryCategoryId`) REFERENCES `AccessoryCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryMaterialIssueItems` ADD CONSTRAINT `AccessoryMaterialIssueItems_accessoryGroupId_fkey` FOREIGN KEY (`accessoryGroupId`) REFERENCES `AccessoryGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryMaterialIssueItems` ADD CONSTRAINT `AccessoryMaterialIssueItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryMaterialIssueItems` ADD CONSTRAINT `AccessoryMaterialIssueItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryMaterialIssueItems` ADD CONSTRAINT `AccessoryMaterialIssueItems_raiseIndentId_fkey` FOREIGN KEY (`raiseIndentId`) REFERENCES `RaiseIndent`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryMaterialIssueItems` ADD CONSTRAINT `AccessoryMaterialIssueItems_accessoryRaiseIndentItemsId_fkey` FOREIGN KEY (`accessoryRaiseIndentItemsId`) REFERENCES `AccessoryRaiseIndentItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryMaterialIssueItems` ADD CONSTRAINT `AccessoryMaterialIssueItems_accessoryRequirementPlanningId_fkey` FOREIGN KEY (`accessoryRequirementPlanningId`) REFERENCES `AccessoryRequirementPlanning`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
