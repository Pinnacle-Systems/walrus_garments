-- AlterTable
ALTER TABLE `raiseindentitems` ADD COLUMN `materialIssueId` INTEGER NULL;

-- CreateTable
CREATE TABLE `MaterialIssue` (
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
CREATE TABLE `MaterialIssueItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `materialIssueId` INTEGER NULL,
    `qty` DOUBLE NULL,
    `socksMaterialId` INTEGER NULL,
    `measurements` VARCHAR(191) NULL,
    `sizeId` INTEGER NULL,
    `styleId` INTEGER NULL,
    `noOfStripes` VARCHAR(191) NULL,
    `socksTypeId` INTEGER NULL,
    `percentage` DOUBLE NULL,
    `colorId` INTEGER NULL,
    `weight` DOUBLE NULL,
    `yarnId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RaiseIndentItems` ADD CONSTRAINT `RaiseIndentItems_materialIssueId_fkey` FOREIGN KEY (`materialIssueId`) REFERENCES `MaterialIssue`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssue` ADD CONSTRAINT `MaterialIssue_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssue` ADD CONSTRAINT `MaterialIssue_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssue` ADD CONSTRAINT `MaterialIssue_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssue` ADD CONSTRAINT `MaterialIssue_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssue` ADD CONSTRAINT `MaterialIssue_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssue` ADD CONSTRAINT `MaterialIssue_finYearId_fkey` FOREIGN KEY (`finYearId`) REFERENCES `FinYear`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssue` ADD CONSTRAINT `MaterialIssue_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssue` ADD CONSTRAINT `MaterialIssue_orderDetailsId_fkey` FOREIGN KEY (`orderDetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssue` ADD CONSTRAINT `MaterialIssue_requirementId_fkey` FOREIGN KEY (`requirementId`) REFERENCES `RequirementPlanningForm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssueItems` ADD CONSTRAINT `MaterialIssueItems_materialIssueId_fkey` FOREIGN KEY (`materialIssueId`) REFERENCES `MaterialIssue`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssueItems` ADD CONSTRAINT `MaterialIssueItems_socksMaterialId_fkey` FOREIGN KEY (`socksMaterialId`) REFERENCES `SocksMaterial`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssueItems` ADD CONSTRAINT `MaterialIssueItems_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssueItems` ADD CONSTRAINT `MaterialIssueItems_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssueItems` ADD CONSTRAINT `MaterialIssueItems_socksTypeId_fkey` FOREIGN KEY (`socksTypeId`) REFERENCES `SocksType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssueItems` ADD CONSTRAINT `MaterialIssueItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssueItems` ADD CONSTRAINT `MaterialIssueItems_yarnId_fkey` FOREIGN KEY (`yarnId`) REFERENCES `Yarn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
