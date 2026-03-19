/*
  Warnings:

  - You are about to drop the `pricetemplatestylesizedetails` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pricetemplatestylewisedetails` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `pricetemplatestylesizedetails` DROP FOREIGN KEY `PriceTemplateStyleSizeDetails_PriceTemplateStyleWiseDetails_fkey`;

-- DropForeignKey
ALTER TABLE `pricetemplatestylesizedetails` DROP FOREIGN KEY `PriceTemplateStyleSizeDetails_sizeId_fkey`;

-- DropForeignKey
ALTER TABLE `pricetemplatestylewisedetails` DROP FOREIGN KEY `PriceTemplateStyleWiseDetails_priceTemplateId_fkey`;

-- DropForeignKey
ALTER TABLE `pricetemplatestylewisedetails` DROP FOREIGN KEY `PriceTemplateStyleWiseDetails_styleId_fkey`;

-- AlterTable
ALTER TABLE `stockadjustment` ADD COLUMN `docId` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `pricetemplatestylesizedetails`;

-- DropTable
DROP TABLE `pricetemplatestylewisedetails`;

-- CreateTable
CREATE TABLE `PriceTemplateDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `priceTemplateId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PriceTemplateDetails` ADD CONSTRAINT `PriceTemplateDetails_priceTemplateId_fkey` FOREIGN KEY (`priceTemplateId`) REFERENCES `PriceTemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
