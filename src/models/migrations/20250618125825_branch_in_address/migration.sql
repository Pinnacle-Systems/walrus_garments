-- CreateTable
CREATE TABLE `PartyBranch` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `branchName` VARCHAR(191) NOT NULL,
    `branchCode` VARCHAR(191) NULL,
    `contactName` VARCHAR(191) NULL,
    `contactMobile` INTEGER NULL,
    `contactEmail` VARCHAR(191) NULL,
    `partyId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `address` LONGTEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PartyShippingAddress` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `partyBranchId` INTEGER NULL,
    `address` LONGTEXT NULL,
    `aliasName` LONGTEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PartyContactDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `contactPersonName` VARCHAR(191) NULL,
    `mobileNo` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `partyBranchId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PartyBranch` ADD CONSTRAINT `PartyBranch_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartyShippingAddress` ADD CONSTRAINT `PartyShippingAddress_partyBranchId_fkey` FOREIGN KEY (`partyBranchId`) REFERENCES `PartyBranch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartyContactDetails` ADD CONSTRAINT `PartyContactDetails_partyBranchId_fkey` FOREIGN KEY (`partyBranchId`) REFERENCES `PartyBranch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
