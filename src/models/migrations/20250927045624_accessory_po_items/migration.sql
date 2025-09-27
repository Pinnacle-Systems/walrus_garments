-- CreateTable
CREATE TABLE `AccessoryPo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `transType` ENUM('GreyYarn', 'DyedYarn', 'GreyFabric', 'DyedFabric', 'Accessory') NOT NULL,
    `dueDate` DATE NOT NULL,
    `supplierId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `docId` VARCHAR(191) NULL,
    `branchId` INTEGER NULL,
    `active` BOOLEAN NULL DEFAULT true,
    `discountType` ENUM('Flat', 'Percentage') NULL,
    `discountValue` DOUBLE NULL DEFAULT 0,
    `deliveryType` ENUM('ToSelf', 'ToParty') NOT NULL,
    `deliveryPartyId` INTEGER NULL,
    `deliveryBranchId` INTEGER NULL,
    `remarks` LONGTEXT NULL,
    `orderId` INTEGER NULL,
    `requirementId` INTEGER NULL,
    `RequirementPlanningItemsId` INTEGER NULL,
    `isPurchaseCancel` BOOLEAN NULL DEFAULT false,
    `PurchaseType` VARCHAR(191) NULL,
    `poMaterial` VARCHAR(191) NULL,
    `poType` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccessoryPoItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `accessoryPoId` INTEGER NULL,
    `accessoryId` INTEGER NULL,
    `accessoryGroupId` INTEGER NULL,
    `accessoryItemId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `uomId` INTEGER NULL,
    `noOfBags` INTEGER NULL,
    `weightPerBag` DOUBLE NULL,
    `percentage` DOUBLE NULL,
    `requiredQty` DOUBLE NULL,
    `qty` DOUBLE NULL,
    `price` DOUBLE NULL,
    `discountType` ENUM('Flat', 'Percentage') NULL,
    `discountValue` DOUBLE NULL DEFAULT 0,
    `tax` DOUBLE NULL DEFAULT 0,
    `weight` DOUBLE NULL,
    `isPurchaseCancel` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AccessoryPo` ADD CONSTRAINT `AccessoryPo_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryPo` ADD CONSTRAINT `AccessoryPo_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryPo` ADD CONSTRAINT `AccessoryPo_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryPo` ADD CONSTRAINT `AccessoryPo_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryPo` ADD CONSTRAINT `AccessoryPo_deliveryPartyId_fkey` FOREIGN KEY (`deliveryPartyId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryPo` ADD CONSTRAINT `AccessoryPo_deliveryBranchId_fkey` FOREIGN KEY (`deliveryBranchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryPo` ADD CONSTRAINT `AccessoryPo_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryPo` ADD CONSTRAINT `AccessoryPo_requirementId_fkey` FOREIGN KEY (`requirementId`) REFERENCES `RequirementPlanningForm`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryPo` ADD CONSTRAINT `AccessoryPo_RequirementPlanningItemsId_fkey` FOREIGN KEY (`RequirementPlanningItemsId`) REFERENCES `RequirementPlanningItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryPoItems` ADD CONSTRAINT `AccessoryPoItems_accessoryPoId_fkey` FOREIGN KEY (`accessoryPoId`) REFERENCES `AccessoryPo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryPoItems` ADD CONSTRAINT `AccessoryPoItems_accessoryId_fkey` FOREIGN KEY (`accessoryId`) REFERENCES `Accessory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryPoItems` ADD CONSTRAINT `AccessoryPoItems_accessoryGroupId_fkey` FOREIGN KEY (`accessoryGroupId`) REFERENCES `AccessoryGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryPoItems` ADD CONSTRAINT `AccessoryPoItems_accessoryItemId_fkey` FOREIGN KEY (`accessoryItemId`) REFERENCES `AccessoryItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryPoItems` ADD CONSTRAINT `AccessoryPoItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryPoItems` ADD CONSTRAINT `AccessoryPoItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
