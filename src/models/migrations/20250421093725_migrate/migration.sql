/*
  Warnings:

  - You are about to drop the column `Active` on the `socksmaterial` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `socksmaterial` DROP COLUMN `Active`,
    ADD COLUMN `active` BOOLEAN NULL DEFAULT true;
