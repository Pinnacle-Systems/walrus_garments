-- AlterTable
ALTER TABLE `item` ADD COLUMN `sectionId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Item` ADD CONSTRAINT `Item_sectionId_fkey` FOREIGN KEY (`sectionId`) REFERENCES `Section`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
