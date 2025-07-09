-- AlterTable
ALTER TABLE `partybranch` ADD COLUMN `isMainBranch` BOOLEAN NULL DEFAULT false,
    MODIFY `active` BOOLEAN NULL DEFAULT true;
