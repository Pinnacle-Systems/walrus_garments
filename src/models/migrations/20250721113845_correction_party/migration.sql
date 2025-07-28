/*
  Warnings:

  - You are about to drop the column `contactMobile` on the `party` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `branchcontactdetails` DROP FOREIGN KEY `BranchContactDetails_branchId_fkey`;

-- DropForeignKey
ALTER TABLE `branchcontactdetails` DROP FOREIGN KEY `BranchContactDetails_partyId_fkey`;

-- DropForeignKey
ALTER TABLE `partybranch` DROP FOREIGN KEY `PartyBranch_partyId_fkey`;

-- DropForeignKey
ALTER TABLE `partycontactdetails` DROP FOREIGN KEY `PartyContactDetails_partyId_fkey`;

-- DropForeignKey
ALTER TABLE `partymaterials` DROP FOREIGN KEY `PartyMaterials_partyId_fkey`;

-- AlterTable
ALTER TABLE `party` DROP COLUMN `contactMobile`,
    ADD COLUMN `alterContactNumber` INTEGER NULL,
    ADD COLUMN `contact` BIGINT NULL,
    ADD COLUMN `contactPersonEmail` VARCHAR(191) NULL,
    ADD COLUMN `contactPersonNumber` INTEGER NULL,
    ADD COLUMN `department` VARCHAR(191) NULL,
    ADD COLUMN `designation` VARCHAR(191) NULL,
    ADD COLUMN `isBuyer` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `landMark` VARCHAR(191) NULL,
    ADD COLUMN `msmeNo` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `PartyBranch` ADD CONSTRAINT `PartyBranch_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BranchContactDetails` ADD CONSTRAINT `BranchContactDetails_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `PartyBranch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BranchContactDetails` ADD CONSTRAINT `BranchContactDetails_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartyMaterials` ADD CONSTRAINT `PartyMaterials_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartyContactDetails` ADD CONSTRAINT `PartyContactDetails_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
