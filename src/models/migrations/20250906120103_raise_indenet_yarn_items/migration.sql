/*
  Warnings:

  - You are about to drop the column `description` on the `raiseindentitems` table. All the data in the column will be lost.
  - You are about to drop the column `fiberContentId` on the `raiseindentitems` table. All the data in the column will be lost.
  - You are about to drop the column `machineId` on the `raiseindentitems` table. All the data in the column will be lost.
  - You are about to drop the column `materialIssueId` on the `raiseindentitems` table. All the data in the column will be lost.
  - You are about to drop the column `measurements` on the `raiseindentitems` table. All the data in the column will be lost.
  - You are about to drop the column `noOfStripes` on the `raiseindentitems` table. All the data in the column will be lost.
  - You are about to drop the column `percentage` on the `raiseindentitems` table. All the data in the column will be lost.
  - You are about to drop the column `qty` on the `raiseindentitems` table. All the data in the column will be lost.
  - You are about to drop the column `socksMaterialId` on the `raiseindentitems` table. All the data in the column will be lost.
  - You are about to drop the column `socksTypeId` on the `raiseindentitems` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `raiseindentitems` table. All the data in the column will be lost.
  - You are about to drop the column `yarnNeedleId` on the `raiseindentitems` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `raiseindentitems` DROP FOREIGN KEY `RaiseIndentItems_fiberContentId_fkey`;

-- DropForeignKey
ALTER TABLE `raiseindentitems` DROP FOREIGN KEY `RaiseIndentItems_machineId_fkey`;

-- DropForeignKey
ALTER TABLE `raiseindentitems` DROP FOREIGN KEY `RaiseIndentItems_materialIssueId_fkey`;

-- DropForeignKey
ALTER TABLE `raiseindentitems` DROP FOREIGN KEY `RaiseIndentItems_socksMaterialId_fkey`;

-- DropForeignKey
ALTER TABLE `raiseindentitems` DROP FOREIGN KEY `RaiseIndentItems_socksTypeId_fkey`;

-- DropForeignKey
ALTER TABLE `raiseindentitems` DROP FOREIGN KEY `RaiseIndentItems_yarnNeedleId_fkey`;

-- AlterTable
ALTER TABLE `raiseindentitems` DROP COLUMN `description`,
    DROP COLUMN `fiberContentId`,
    DROP COLUMN `machineId`,
    DROP COLUMN `materialIssueId`,
    DROP COLUMN `measurements`,
    DROP COLUMN `noOfStripes`,
    DROP COLUMN `percentage`,
    DROP COLUMN `qty`,
    DROP COLUMN `socksMaterialId`,
    DROP COLUMN `socksTypeId`,
    DROP COLUMN `weight`,
    DROP COLUMN `yarnNeedleId`,
    ADD COLUMN `requirementPlanningFormId` INTEGER NULL;

-- CreateTable
CREATE TABLE `RaiseIndenetYarnItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `raiseIndentItemsId` INTEGER NULL,
    `yarnId` INTEGER NULL,
    `yarnNeedleId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `count` INTEGER NULL,
    `qty` DOUBLE NULL,
    `issueQty` DOUBLE NULL,
    `percentage` DOUBLE NULL,
    `weight` DOUBLE NULL,
    `requirementPlanningId` INTEGER NULL,
    `orderdetailsId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RaiseIndentItems` ADD CONSTRAINT `RaiseIndentItems_requirementPlanningFormId_fkey` FOREIGN KEY (`requirementPlanningFormId`) REFERENCES `RequirementPlanningForm`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaiseIndenetYarnItems` ADD CONSTRAINT `RaiseIndenetYarnItems_raiseIndentItemsId_fkey` FOREIGN KEY (`raiseIndentItemsId`) REFERENCES `RaiseIndentItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaiseIndenetYarnItems` ADD CONSTRAINT `RaiseIndenetYarnItems_yarnId_fkey` FOREIGN KEY (`yarnId`) REFERENCES `Yarn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaiseIndenetYarnItems` ADD CONSTRAINT `RaiseIndenetYarnItems_yarnNeedleId_fkey` FOREIGN KEY (`yarnNeedleId`) REFERENCES `YarnNeedle`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaiseIndenetYarnItems` ADD CONSTRAINT `RaiseIndenetYarnItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaiseIndenetYarnItems` ADD CONSTRAINT `RaiseIndenetYarnItems_requirementPlanningId_fkey` FOREIGN KEY (`requirementPlanningId`) REFERENCES `RequirementPlanningForm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaiseIndenetYarnItems` ADD CONSTRAINT `RaiseIndenetYarnItems_orderdetailsId_fkey` FOREIGN KEY (`orderdetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
