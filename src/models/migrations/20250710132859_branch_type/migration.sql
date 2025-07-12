-- CreateTable
CREATE TABLE `BranchType` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `partyId` INTEGER NULL,
    `active` BOOLEAN NULL DEFAULT false,
    `aliasName` VARCHAR(191) NULL,
    `isMainBranch` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `BranchType` ADD CONSTRAINT `BranchType_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
