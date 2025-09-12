/*
  Warnings:

  - You are about to drop the column `raiseIndentItemsId` on the `materialissueyarnitems` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `materialissueyarnitems` DROP FOREIGN KEY `MaterialIssueYarnItems_raiseIndentItemsId_fkey`;

-- AlterTable
ALTER TABLE `materialissueyarnitems` DROP COLUMN `raiseIndentItemsId`,
    ADD COLUMN `materialIssueItemsId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `MaterialIssueYarnItems` ADD CONSTRAINT `MaterialIssueYarnItems_materialIssueItemsId_fkey` FOREIGN KEY (`materialIssueItemsId`) REFERENCES `MaterialIssueItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
