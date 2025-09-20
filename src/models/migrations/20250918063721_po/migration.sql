-- AlterTable
ALTER TABLE `order` ADD COLUMN `isPlanning` BOOLEAN NULL DEFAULT false;

-- AlterTable
ALTER TABLE `orderdetails` ADD COLUMN `isPlanning` BOOLEAN NULL DEFAULT false;
