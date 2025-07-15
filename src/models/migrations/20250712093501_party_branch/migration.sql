/*
  Warnings:

  - You are about to drop the column `branchType` on the `partybranch` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `partybranch` DROP COLUMN `branchType`,
    ADD COLUMN `branchTypeId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `PartyBranch` ADD CONSTRAINT `PartyBranch_branchTypeId_fkey` FOREIGN KEY (`branchTypeId`) REFERENCES `BranchType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
