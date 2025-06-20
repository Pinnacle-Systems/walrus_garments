/*
  Warnings:

  - You are about to drop the column `tax` on the `po` table. All the data in the column will be lost.
  - You are about to drop the column `taxPercent` on the `poitems` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `po` DROP COLUMN `tax`;

-- AlterTable
ALTER TABLE `poitems` DROP COLUMN `taxPercent`,
    ADD COLUMN `tax` DOUBLE NULL DEFAULT 0;
