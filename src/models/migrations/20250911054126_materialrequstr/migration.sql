/*
  Warnings:

  - You are about to drop the column `isRaiseRendent` on the `raiseindent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `raiseindent` DROP COLUMN `isRaiseRendent`,
    ADD COLUMN `isMaterialRequset` BOOLEAN NULL DEFAULT false;
