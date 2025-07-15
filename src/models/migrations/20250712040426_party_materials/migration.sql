-- AlterTable
ALTER TABLE `directinwardorreturn` ADD COLUMN `draftSave` BOOLEAN NULL DEFAULT false;

-- CreateTable
CREATE TABLE `PartyMaterials` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `partyId` INTEGER NULL,
    `isMainBranch` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PartyMaterials` ADD CONSTRAINT `PartyMaterials_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
