-- AddForeignKey
ALTER TABLE `Item` ADD CONSTRAINT `Item_mainCategoryId_fkey` FOREIGN KEY (`mainCategoryId`) REFERENCES `ItemCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item` ADD CONSTRAINT `Item_subCategoryId_fkey` FOREIGN KEY (`subCategoryId`) REFERENCES `ItemCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
