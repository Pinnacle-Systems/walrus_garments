-- AlterTable
ALTER TABLE `branchcontactdetails` ADD COLUMN `alterContactNumber` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `PartyAttachments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `partyId` INTEGER NULL,
    `filePath` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BranchAttchments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `partyBranchId` INTEGER NULL,
    `filePath` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PartyAttachments` ADD CONSTRAINT `PartyAttachments_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BranchAttchments` ADD CONSTRAINT `BranchAttchments_partyBranchId_fkey` FOREIGN KEY (`partyBranchId`) REFERENCES `PartyBranch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
