-- AlterTable
ALTER TABLE `order` ADD COLUMN `isMaterialRequest` BOOLEAN NULL DEFAULT false;

-- AlterTable
ALTER TABLE `orderdetails` ADD COLUMN `isMaterialRequest` BOOLEAN NULL DEFAULT false;

-- AlterTable
ALTER TABLE `stock` ADD COLUMN `category` VARCHAR(191) NULL;
