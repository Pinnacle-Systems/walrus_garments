/*
  Warnings:

  - You are about to drop the column `partyId` on the `branchtype` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `branchtype` DROP FOREIGN KEY `BranchType_partyId_fkey`;

-- AlterTable
ALTER TABLE `branchtype` DROP COLUMN `partyId`;

-- AlterTable
ALTER TABLE `party` ADD COLUMN `branchTypeId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Party` ADD CONSTRAINT `Party_branchTypeId_fkey` FOREIGN KEY (`branchTypeId`) REFERENCES `BranchType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
