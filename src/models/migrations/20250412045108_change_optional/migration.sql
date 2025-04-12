-- DropForeignKey
ALTER TABLE `color` DROP FOREIGN KEY `Color_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `yarn` DROP FOREIGN KEY `Yarn_contentId_fkey`;

-- DropForeignKey
ALTER TABLE `yarn` DROP FOREIGN KEY `Yarn_countsId_fkey`;

-- DropForeignKey
ALTER TABLE `yarn` DROP FOREIGN KEY `Yarn_yarnTypeId_fkey`;

-- DropForeignKey
ALTER TABLE `yarnonyarnblend` DROP FOREIGN KEY `YarnOnYarnBlend_yarnBlendId_fkey`;

-- AlterTable
ALTER TABLE `color` MODIFY `name` VARCHAR(191) NULL,
    MODIFY `pantone` VARCHAR(191) NULL,
    MODIFY `companyId` INTEGER NULL,
    MODIFY `active` BOOLEAN NULL DEFAULT true,
    MODIFY `isGrey` BOOLEAN NULL DEFAULT false;

-- AlterTable
ALTER TABLE `fabric` MODIFY `aliasName` VARCHAR(191) NULL,
    MODIFY `hsn` VARCHAR(191) NULL,
    MODIFY `active` BOOLEAN NULL DEFAULT true;

-- AlterTable
ALTER TABLE `fabrictype` MODIFY `name` VARCHAR(191) NULL,
    MODIFY `active` BOOLEAN NULL DEFAULT true;

-- AlterTable
ALTER TABLE `size` MODIFY `name` VARCHAR(191) NULL,
    MODIFY `isAccessory` BOOLEAN NULL DEFAULT false,
    MODIFY `active` BOOLEAN NULL DEFAULT true;

-- AlterTable
ALTER TABLE `yarn` MODIFY `contentId` INTEGER NULL,
    MODIFY `yarnTypeId` INTEGER NULL,
    MODIFY `countsId` INTEGER NULL,
    MODIFY `aliasName` VARCHAR(191) NULL,
    MODIFY `hsn` VARCHAR(191) NULL,
    MODIFY `taxPercent` DOUBLE NULL DEFAULT 0,
    MODIFY `active` BOOLEAN NULL DEFAULT true;

-- AlterTable
ALTER TABLE `yarnonyarnblend` MODIFY `yarnBlendId` INTEGER NULL,
    MODIFY `percentage` INTEGER NULL,
    MODIFY `yarnId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Yarn` ADD CONSTRAINT `Yarn_contentId_fkey` FOREIGN KEY (`contentId`) REFERENCES `Content`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Yarn` ADD CONSTRAINT `Yarn_yarnTypeId_fkey` FOREIGN KEY (`yarnTypeId`) REFERENCES `YarnType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Yarn` ADD CONSTRAINT `Yarn_countsId_fkey` FOREIGN KEY (`countsId`) REFERENCES `Counts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `YarnOnYarnBlend` ADD CONSTRAINT `YarnOnYarnBlend_yarnBlendId_fkey` FOREIGN KEY (`yarnBlendId`) REFERENCES `YarnBlend`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Color` ADD CONSTRAINT `Color_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
