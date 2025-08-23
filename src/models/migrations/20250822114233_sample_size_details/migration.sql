/*
  Warnings:

  - You are about to drop the column `Weight` on the `samplesizedetails` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `samplesizedetails` DROP COLUMN `Weight`,
    ADD COLUMN `weight` VARCHAR(191) NULL,
    ADD COLUMN `yarnNeedleId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `sampleSizeDetails` ADD CONSTRAINT `sampleSizeDetails_yarnNeedleId_fkey` FOREIGN KEY (`yarnNeedleId`) REFERENCES `YarnNeedle`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
