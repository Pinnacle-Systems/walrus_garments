/*
  Warnings:

  - You are about to drop the column `qty` on the `pricetemplatedetails` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `pricetemplatedetails` DROP COLUMN `qty`,
    ADD COLUMN `hsnId` INTEGER NULL,
    ADD COLUMN `maxQty` VARCHAR(191) NULL,
    ADD COLUMN `minQty` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `PriceTemplateDetails` ADD CONSTRAINT `PriceTemplateDetails_hsnId_fkey` FOREIGN KEY (`hsnId`) REFERENCES `Hsn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
