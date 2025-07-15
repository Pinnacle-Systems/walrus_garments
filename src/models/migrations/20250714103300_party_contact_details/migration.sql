/*
  Warnings:

  - You are about to drop the column `partyBranchId` on the `partycontactdetails` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `partycontactdetails` DROP FOREIGN KEY `PartyContactDetails_partyBranchId_fkey`;

-- AlterTable
ALTER TABLE `partycontactdetails` DROP COLUMN `partyBranchId`,
    ADD COLUMN `Designation` VARCHAR(191) NULL,
    ADD COLUMN `department` VARCHAR(191) NULL,
    ADD COLUMN `partyId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `PartyContactDetails` ADD CONSTRAINT `PartyContactDetails_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
