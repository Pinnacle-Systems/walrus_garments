-- DropForeignKey
ALTER TABLE `pricetemplate` DROP FOREIGN KEY `PriceTemplate_companyId_fkey`;

-- AlterTable
ALTER TABLE `pricetemplate` MODIFY `name` VARCHAR(191) NULL,
    MODIFY `companyId` INTEGER NULL,
    MODIFY `active` BOOLEAN NULL DEFAULT true;

-- AlterTable
ALTER TABLE `pricetemplatedetails` ADD COLUMN `itemId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `PriceTemplate` ADD CONSTRAINT `PriceTemplate_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PriceTemplateDetails` ADD CONSTRAINT `PriceTemplateDetails_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Item`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
