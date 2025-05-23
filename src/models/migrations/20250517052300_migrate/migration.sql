/*
  Warnings:

  - You are about to drop the column `certificateId` on the `party` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `party` DROP FOREIGN KEY `Party_certificateId_fkey`;

-- AlterTable
ALTER TABLE `party` DROP COLUMN `certificateId`,
    ADD COLUMN `mailId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `CertificateDetail` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `partyId` INTEGER NOT NULL,
    `certificateId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CertificateDetail` ADD CONSTRAINT `CertificateDetail_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CertificateDetail` ADD CONSTRAINT `CertificateDetail_certificateId_fkey` FOREIGN KEY (`certificateId`) REFERENCES `Certificate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
