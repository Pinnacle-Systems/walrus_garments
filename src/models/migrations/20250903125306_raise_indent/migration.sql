-- CreateTable
CREATE TABLE `RaiseIndent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `phone` VARCHAR(191) NULL,
    `contactPersonName` VARCHAR(191) NOT NULL,
    `address` LONGTEXT NULL,
    `orderDate` DATETIME(3) NULL,
    `validDate` DATETIME(3) NULL,
    `gmail` VARCHAR(191) NULL,
    `branchId` INTEGER NULL,
    `companyId` INTEGER NULL,
    `partyId` INTEGER NULL,
    `packingCoverType` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `finYearId` INTEGER NULL,
    `notes` LONGTEXT NULL,
    `term` LONGTEXT NULL,
    `orderBy` VARCHAR(191) NULL,
    `orderId` INTEGER NULL,
    `orderDetailsId` INTEGER NULL,
    `requirementId` INTEGER NULL,
    `draftSave` BOOLEAN NULL DEFAULT false,
    `isRaiseRendent` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RaiseIndentItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `raiseIndentId` INTEGER NULL,
    `yarnNeedleId` INTEGER NULL,
    `machineId` INTEGER NULL,
    `fiberContentId` INTEGER NULL,
    `description` LONGTEXT NULL,
    `qty` DOUBLE NULL,
    `socksMaterialId` INTEGER NULL,
    `measurements` VARCHAR(191) NULL,
    `sizeId` INTEGER NULL,
    `styleId` INTEGER NULL,
    `noOfStripes` VARCHAR(191) NULL,
    `socksTypeId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RaiseIndent` ADD CONSTRAINT `RaiseIndent_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaiseIndent` ADD CONSTRAINT `RaiseIndent_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaiseIndent` ADD CONSTRAINT `RaiseIndent_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaiseIndent` ADD CONSTRAINT `RaiseIndent_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaiseIndent` ADD CONSTRAINT `RaiseIndent_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaiseIndent` ADD CONSTRAINT `RaiseIndent_finYearId_fkey` FOREIGN KEY (`finYearId`) REFERENCES `FinYear`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaiseIndent` ADD CONSTRAINT `RaiseIndent_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaiseIndent` ADD CONSTRAINT `RaiseIndent_orderDetailsId_fkey` FOREIGN KEY (`orderDetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaiseIndent` ADD CONSTRAINT `RaiseIndent_requirementId_fkey` FOREIGN KEY (`requirementId`) REFERENCES `RequirementPlanningForm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaiseIndentItems` ADD CONSTRAINT `RaiseIndentItems_raiseIndentId_fkey` FOREIGN KEY (`raiseIndentId`) REFERENCES `RaiseIndent`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaiseIndentItems` ADD CONSTRAINT `RaiseIndentItems_yarnNeedleId_fkey` FOREIGN KEY (`yarnNeedleId`) REFERENCES `YarnNeedle`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaiseIndentItems` ADD CONSTRAINT `RaiseIndentItems_machineId_fkey` FOREIGN KEY (`machineId`) REFERENCES `Machine`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaiseIndentItems` ADD CONSTRAINT `RaiseIndentItems_fiberContentId_fkey` FOREIGN KEY (`fiberContentId`) REFERENCES `FiberContent`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaiseIndentItems` ADD CONSTRAINT `RaiseIndentItems_socksMaterialId_fkey` FOREIGN KEY (`socksMaterialId`) REFERENCES `SocksMaterial`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaiseIndentItems` ADD CONSTRAINT `RaiseIndentItems_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaiseIndentItems` ADD CONSTRAINT `RaiseIndentItems_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaiseIndentItems` ADD CONSTRAINT `RaiseIndentItems_socksTypeId_fkey` FOREIGN KEY (`socksTypeId`) REFERENCES `SocksType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
