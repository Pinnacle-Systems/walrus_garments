-- DropIndex
DROP INDEX `orderYarnDetails_count_fkey` ON `orderyarndetails`;

-- DropIndex
DROP INDEX `RequirementYarnDetails_count_fkey` ON `requirementyarndetails`;

-- AlterTable
ALTER TABLE `poitems` ADD COLUMN `percentage` DOUBLE NULL,
    ADD COLUMN `requiredQty` DOUBLE NULL;
