/*
  Warnings:

  - You are about to drop the column `Weight` on the `sampledetails` table. All the data in the column will be lost.
  - You are about to drop the column `colorId` on the `sampledetails` table. All the data in the column will be lost.
  - You are about to drop the column `gsmId` on the `sampledetails` table. All the data in the column will be lost.
  - You are about to drop the column `qty` on the `sampledetails` table. All the data in the column will be lost.
  - You are about to drop the column `remarks` on the `sampledetails` table. All the data in the column will be lost.
  - You are about to drop the column `sizeId` on the `sampledetails` table. All the data in the column will be lost.
  - You are about to drop the column `uomId` on the `sampledetails` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `sampledetails` DROP FOREIGN KEY `sampleDetails_colorId_fkey`;

-- DropForeignKey
ALTER TABLE `sampledetails` DROP FOREIGN KEY `sampleDetails_gsmId_fkey`;

-- DropForeignKey
ALTER TABLE `sampledetails` DROP FOREIGN KEY `sampleDetails_sizeId_fkey`;

-- DropForeignKey
ALTER TABLE `sampledetails` DROP FOREIGN KEY `sampleDetails_uomId_fkey`;

-- AlterTable
ALTER TABLE `sampledetails` DROP COLUMN `Weight`,
    DROP COLUMN `colorId`,
    DROP COLUMN `gsmId`,
    DROP COLUMN `qty`,
    DROP COLUMN `remarks`,
    DROP COLUMN `sizeId`,
    DROP COLUMN `uomId`;

-- CreateTable
CREATE TABLE `sampleSizeDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sampleId` INTEGER NULL,
    `sampleDetailsId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `uomId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `qty` DOUBLE NULL,
    `gsmId` INTEGER NULL,
    `Weight` VARCHAR(191) NULL,
    `remarks` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sampleSizeDetails` ADD CONSTRAINT `sampleSizeDetails_sampleId_fkey` FOREIGN KEY (`sampleId`) REFERENCES `Sample`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sampleSizeDetails` ADD CONSTRAINT `sampleSizeDetails_sampleDetailsId_fkey` FOREIGN KEY (`sampleDetailsId`) REFERENCES `sampleDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sampleSizeDetails` ADD CONSTRAINT `sampleSizeDetails_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sampleSizeDetails` ADD CONSTRAINT `sampleSizeDetails_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sampleSizeDetails` ADD CONSTRAINT `sampleSizeDetails_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sampleSizeDetails` ADD CONSTRAINT `sampleSizeDetails_gsmId_fkey` FOREIGN KEY (`gsmId`) REFERENCES `Gsm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
