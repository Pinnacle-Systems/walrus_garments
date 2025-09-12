/*
  Warnings:

  - You are about to drop the column `colorId` on the `materialissueitems` table. All the data in the column will be lost.
  - You are about to drop the column `issueQty` on the `materialissueitems` table. All the data in the column will be lost.
  - You are about to drop the column `measurements` on the `materialissueitems` table. All the data in the column will be lost.
  - You are about to drop the column `noOfStripes` on the `materialissueitems` table. All the data in the column will be lost.
  - You are about to drop the column `percentage` on the `materialissueitems` table. All the data in the column will be lost.
  - You are about to drop the column `qty` on the `materialissueitems` table. All the data in the column will be lost.
  - You are about to drop the column `sizeId` on the `materialissueitems` table. All the data in the column will be lost.
  - You are about to drop the column `socksMaterialId` on the `materialissueitems` table. All the data in the column will be lost.
  - You are about to drop the column `socksTypeId` on the `materialissueitems` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `materialissueitems` table. All the data in the column will be lost.
  - You are about to drop the column `yarnId` on the `materialissueitems` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `materialissueitems` DROP FOREIGN KEY `MaterialIssueItems_colorId_fkey`;

-- DropForeignKey
ALTER TABLE `materialissueitems` DROP FOREIGN KEY `MaterialIssueItems_sizeId_fkey`;

-- DropForeignKey
ALTER TABLE `materialissueitems` DROP FOREIGN KEY `MaterialIssueItems_socksMaterialId_fkey`;

-- DropForeignKey
ALTER TABLE `materialissueitems` DROP FOREIGN KEY `MaterialIssueItems_socksTypeId_fkey`;

-- DropForeignKey
ALTER TABLE `materialissueitems` DROP FOREIGN KEY `MaterialIssueItems_yarnId_fkey`;

-- AlterTable
ALTER TABLE `materialissueitems` DROP COLUMN `colorId`,
    DROP COLUMN `issueQty`,
    DROP COLUMN `measurements`,
    DROP COLUMN `noOfStripes`,
    DROP COLUMN `percentage`,
    DROP COLUMN `qty`,
    DROP COLUMN `sizeId`,
    DROP COLUMN `socksMaterialId`,
    DROP COLUMN `socksTypeId`,
    DROP COLUMN `weight`,
    DROP COLUMN `yarnId`,
    ADD COLUMN `orderdetailsId` INTEGER NULL,
    ADD COLUMN `requirementPlanningFormId` INTEGER NULL;

-- CreateTable
CREATE TABLE `MaterialIssueYarnItems` (
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
ALTER TABLE `MaterialIssueItems` ADD CONSTRAINT `MaterialIssueItems_requirementPlanningFormId_fkey` FOREIGN KEY (`requirementPlanningFormId`) REFERENCES `RequirementPlanningForm`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssueItems` ADD CONSTRAINT `MaterialIssueItems_orderdetailsId_fkey` FOREIGN KEY (`orderdetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssueYarnItems` ADD CONSTRAINT `MaterialIssueYarnItems_raiseIndentItemsId_fkey` FOREIGN KEY (`raiseIndentItemsId`) REFERENCES `RaiseIndentItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssueYarnItems` ADD CONSTRAINT `MaterialIssueYarnItems_yarnId_fkey` FOREIGN KEY (`yarnId`) REFERENCES `Yarn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssueYarnItems` ADD CONSTRAINT `MaterialIssueYarnItems_yarnNeedleId_fkey` FOREIGN KEY (`yarnNeedleId`) REFERENCES `YarnNeedle`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssueYarnItems` ADD CONSTRAINT `MaterialIssueYarnItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssueYarnItems` ADD CONSTRAINT `MaterialIssueYarnItems_requirementPlanningId_fkey` FOREIGN KEY (`requirementPlanningId`) REFERENCES `RequirementPlanningForm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssueYarnItems` ADD CONSTRAINT `MaterialIssueYarnItems_orderdetailsId_fkey` FOREIGN KEY (`orderdetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
