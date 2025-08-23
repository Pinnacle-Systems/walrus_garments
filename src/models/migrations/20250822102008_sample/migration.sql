/*
  Warnings:

  - You are about to drop the column `legcolorId` on the `sampledetails` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `sampledetails` DROP FOREIGN KEY `sampleDetails_legcolorId_fkey`;

-- AlterTable
ALTER TABLE `sampledetails` DROP COLUMN `legcolorId`,
    ADD COLUMN `Weight` VARCHAR(191) NULL,
    ADD COLUMN `colorId` INTEGER NULL,
    ADD COLUMN `gsmId` INTEGER NULL,
    ADD COLUMN `remarks` VARCHAR(191) NULL,
    ADD COLUMN `uomId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `sampleDetails` ADD CONSTRAINT `sampleDetails_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sampleDetails` ADD CONSTRAINT `sampleDetails_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sampleDetails` ADD CONSTRAINT `sampleDetails_gsmId_fkey` FOREIGN KEY (`gsmId`) REFERENCES `Gsm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
