/*
  Warnings:

  - You are about to drop the column `sampelId` on the `requirementplanningform` table. All the data in the column will be lost.
  - You are about to drop the `requirementplanningformitems` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `requirementplanningform` DROP FOREIGN KEY `RequirementPlanningForm_sampelId_fkey`;

-- DropForeignKey
ALTER TABLE `requirementplanningformitems` DROP FOREIGN KEY `RequirementPlanningFormItems_requirementPlanningFormId_fkey`;

-- AlterTable
ALTER TABLE `requirementplanningform` DROP COLUMN `sampelId`,
    ADD COLUMN `orderDetailsId` INTEGER NULL,
    ADD COLUMN `orderId` INTEGER NULL;

-- DropTable
DROP TABLE `requirementplanningformitems`;

-- CreateTable
CREATE TABLE `RequirementSizeDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `requirementPlanningFormId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `uomId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `qty` DOUBLE NULL,
    `gsmId` INTEGER NULL,
    `weight` DOUBLE NULL,
    `remarks` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RequirementYarnDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `RequirementPlanningId` INTEGER NULL,
    `percentage` INTEGER NULL,
    `colorId` INTEGER NULL,
    `yarncategoryId` INTEGER NULL,
    `yarnId` INTEGER NULL,
    `count` INTEGER NULL,
    `yarnKneedleId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RequirementPlanningForm` ADD CONSTRAINT `RequirementPlanningForm_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementPlanningForm` ADD CONSTRAINT `RequirementPlanningForm_orderDetailsId_fkey` FOREIGN KEY (`orderDetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementSizeDetails` ADD CONSTRAINT `RequirementSizeDetails_requirementPlanningFormId_fkey` FOREIGN KEY (`requirementPlanningFormId`) REFERENCES `RequirementPlanningForm`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementSizeDetails` ADD CONSTRAINT `RequirementSizeDetails_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementSizeDetails` ADD CONSTRAINT `RequirementSizeDetails_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementSizeDetails` ADD CONSTRAINT `RequirementSizeDetails_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementSizeDetails` ADD CONSTRAINT `RequirementSizeDetails_gsmId_fkey` FOREIGN KEY (`gsmId`) REFERENCES `Gsm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementYarnDetails` ADD CONSTRAINT `RequirementYarnDetails_RequirementPlanningId_fkey` FOREIGN KEY (`RequirementPlanningId`) REFERENCES `RequirementPlanningForm`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementYarnDetails` ADD CONSTRAINT `RequirementYarnDetails_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementYarnDetails` ADD CONSTRAINT `RequirementYarnDetails_yarncategoryId_fkey` FOREIGN KEY (`yarncategoryId`) REFERENCES `YarnType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementYarnDetails` ADD CONSTRAINT `RequirementYarnDetails_yarnId_fkey` FOREIGN KEY (`yarnId`) REFERENCES `Yarn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementYarnDetails` ADD CONSTRAINT `RequirementYarnDetails_count_fkey` FOREIGN KEY (`count`) REFERENCES `Counts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementYarnDetails` ADD CONSTRAINT `RequirementYarnDetails_yarnKneedleId_fkey` FOREIGN KEY (`yarnKneedleId`) REFERENCES `YarnNeedle`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
