-- CreateTable
CREATE TABLE `MaterialTypeList` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `value` VARCHAR(191) NULL,
    `raiseIndentId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccessoryRaiseIndentItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `raiseIndentId` INTEGER NULL,
    `accessoryId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `uomId` INTEGER NULL,
    `styleColor` VARCHAR(191) NULL,
    `requiredQty` DOUBLE NULL,
    `qty` DOUBLE NULL,
    `requirementPlanningFormId` INTEGER NULL,
    `accessoryRequirementPlanningId` INTEGER NULL,
    `orderDetailsId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MaterialTypeList` ADD CONSTRAINT `MaterialTypeList_raiseIndentId_fkey` FOREIGN KEY (`raiseIndentId`) REFERENCES `RaiseIndent`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryRaiseIndentItems` ADD CONSTRAINT `AccessoryRaiseIndentItems_raiseIndentId_fkey` FOREIGN KEY (`raiseIndentId`) REFERENCES `RaiseIndent`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryRaiseIndentItems` ADD CONSTRAINT `AccessoryRaiseIndentItems_accessoryId_fkey` FOREIGN KEY (`accessoryId`) REFERENCES `Accessory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryRaiseIndentItems` ADD CONSTRAINT `AccessoryRaiseIndentItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryRaiseIndentItems` ADD CONSTRAINT `AccessoryRaiseIndentItems_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryRaiseIndentItems` ADD CONSTRAINT `AccessoryRaiseIndentItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryRaiseIndentItems` ADD CONSTRAINT `AccessoryRaiseIndentItems_requirementPlanningFormId_fkey` FOREIGN KEY (`requirementPlanningFormId`) REFERENCES `RequirementPlanningForm`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryRaiseIndentItems` ADD CONSTRAINT `AccessoryRaiseIndentItems_accessoryRequirementPlanningId_fkey` FOREIGN KEY (`accessoryRequirementPlanningId`) REFERENCES `AccessoryRequirementPlanning`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryRaiseIndentItems` ADD CONSTRAINT `AccessoryRaiseIndentItems_orderDetailsId_fkey` FOREIGN KEY (`orderDetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
