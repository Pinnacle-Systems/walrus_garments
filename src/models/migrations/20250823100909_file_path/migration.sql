-- AlterTable
ALTER TABLE `sample` ADD COLUMN `draftSave` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `filePath` LONGTEXT NULL;
