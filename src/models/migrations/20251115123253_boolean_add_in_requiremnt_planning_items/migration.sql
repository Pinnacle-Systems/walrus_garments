-- AlterTable
ALTER TABLE `materialissueitems` ADD COLUMN `styleColor` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `requirementplanningitems` ADD COLUMN `isMaterialRequst` BOOLEAN NULL DEFAULT false;
