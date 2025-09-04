/*
  Warnings:

  - You are about to drop the column `isRaiseRendent` on the `materialissue` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `materialissue` DROP COLUMN `isRaiseRendent`,
    ADD COLUMN `isMaterialIssue` BOOLEAN NULL DEFAULT false;

-- AlterTable
ALTER TABLE `materialissueitems` ADD COLUMN `issueQty` DOUBLE NULL;
