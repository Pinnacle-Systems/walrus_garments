/*
  Warnings:

  - You are about to drop the column `contact` on the `partybranch` table. All the data in the column will be lost.
  - You are about to drop the column `contactperson` on the `partybranch` table. All the data in the column will be lost.
  - You are about to drop the column `designation` on the `partybranch` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `partybranch` DROP COLUMN `contact`,
    DROP COLUMN `contactperson`,
    DROP COLUMN `designation`,
    ADD COLUMN `branchAccountNumber` VARCHAR(191) NULL,
    ADD COLUMN `branchAliasName` VARCHAR(191) NULL,
    ADD COLUMN `branchBankBranchName` VARCHAR(191) NULL,
    ADD COLUMN `branchBankname` VARCHAR(191) NULL,
    ADD COLUMN `branchCityId` INTEGER NULL,
    ADD COLUMN `branchContactPerson` VARCHAR(191) NULL,
    ADD COLUMN `branchDepartment` VARCHAR(191) NULL,
    ADD COLUMN `branchDesignation` VARCHAR(191) NULL,
    ADD COLUMN `branchIfscCode` VARCHAR(191) NULL,
    ADD COLUMN `branchLandMark` VARCHAR(191) NULL,
    ADD COLUMN `branchPincode` VARCHAR(191) NULL,
    ADD COLUMN `branchWebsite` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `BranchContactDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `branchId` INTEGER NULL,
    `partyId` INTEGER NULL,
    `contactPersonName` VARCHAR(191) NULL,
    `mobileNo` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `designation` VARCHAR(191) NULL,
    `department` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PartyBranch` ADD CONSTRAINT `PartyBranch_branchCityId_fkey` FOREIGN KEY (`branchCityId`) REFERENCES `City`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BranchContactDetails` ADD CONSTRAINT `BranchContactDetails_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `PartyBranch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BranchContactDetails` ADD CONSTRAINT `BranchContactDetails_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
