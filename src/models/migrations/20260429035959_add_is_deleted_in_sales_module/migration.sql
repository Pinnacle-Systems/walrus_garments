-- AlterTable
ALTER TABLE `quotation` ADD COLUMN `isDeleted` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `isMinAdvanceEdited` BOOLEAN NULL DEFAULT false;

-- AlterTable
ALTER TABLE `saleorder` ADD COLUMN `isDeleted` BOOLEAN NULL DEFAULT false;

-- AlterTable
ALTER TABLE `salesdelivery` ADD COLUMN `isDeleted` BOOLEAN NULL DEFAULT false;

-- AlterTable
ALTER TABLE `salesreturn` ADD COLUMN `isDeleted` BOOLEAN NULL DEFAULT false;
