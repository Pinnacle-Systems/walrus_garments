/*
  Warnings:

  - You are about to alter the column `transType` on the `po` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(6))` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `po` ADD COLUMN `taxTemplateId` INTEGER NULL,
    MODIFY `transType` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `poitems` ADD COLUMN `taxPercent` DOUBLE NULL;

-- AddForeignKey
ALTER TABLE `Po` ADD CONSTRAINT `Po_taxTemplateId_fkey` FOREIGN KEY (`taxTemplateId`) REFERENCES `TaxTemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
