/*
  Warnings:

  - You are about to drop the `requirementplanningyarnitems` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `requirementplanningyarnitems` DROP FOREIGN KEY `RequirementPlanningYarnItems_colorId_fkey`;

-- DropForeignKey
ALTER TABLE `requirementplanningyarnitems` DROP FOREIGN KEY `RequirementPlanningYarnItems_count_fkey`;

-- DropForeignKey
ALTER TABLE `requirementplanningyarnitems` DROP FOREIGN KEY `RequirementPlanningYarnItems_orderDetailsId_fkey`;

-- DropForeignKey
ALTER TABLE `requirementplanningyarnitems` DROP FOREIGN KEY `RequirementPlanningYarnItems_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `requirementplanningyarnitems` DROP FOREIGN KEY `RequirementPlanningYarnItems_requirementPlanningFormId_fkey`;

-- DropForeignKey
ALTER TABLE `requirementplanningyarnitems` DROP FOREIGN KEY `RequirementPlanningYarnItems_yarnId_fkey`;

-- AlterTable
ALTER TABLE `ordersizedetails` ADD COLUMN `uomId` INTEGER NULL;

-- DropTable
DROP TABLE `requirementplanningyarnitems`;

-- CreateTable
CREATE TABLE `RequirementPlanningItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `requirementPlanningFormId` INTEGER NULL,
    `orderId` INTEGER NULL,
    `orderDetailsId` INTEGER NULL,
    `percentage` DOUBLE NULL,
    `colorId` INTEGER NULL,
    `yarnId` INTEGER NULL,
    `count` INTEGER NULL,
    `poType` VARCHAR(191) NULL,
    `transType` VARCHAR(191) NULL,
    `partyId` INTEGER NULL,
    `requiredQty` DOUBLE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `orderSizeDetails` ADD CONSTRAINT `orderSizeDetails_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementPlanningItems` ADD CONSTRAINT `RequirementPlanningItems_requirementPlanningFormId_fkey` FOREIGN KEY (`requirementPlanningFormId`) REFERENCES `RequirementPlanningForm`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementPlanningItems` ADD CONSTRAINT `RequirementPlanningItems_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementPlanningItems` ADD CONSTRAINT `RequirementPlanningItems_orderDetailsId_fkey` FOREIGN KEY (`orderDetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementPlanningItems` ADD CONSTRAINT `RequirementPlanningItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementPlanningItems` ADD CONSTRAINT `RequirementPlanningItems_yarnId_fkey` FOREIGN KEY (`yarnId`) REFERENCES `Yarn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementPlanningItems` ADD CONSTRAINT `RequirementPlanningItems_count_fkey` FOREIGN KEY (`count`) REFERENCES `Counts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementPlanningItems` ADD CONSTRAINT `RequirementPlanningItems_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
