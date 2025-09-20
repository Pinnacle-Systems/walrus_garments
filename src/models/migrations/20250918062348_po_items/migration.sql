-- AlterTable
ALTER TABLE `poitems` ADD COLUMN `count` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `PoItems` ADD CONSTRAINT `PoItems_count_fkey` FOREIGN KEY (`count`) REFERENCES `Counts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
