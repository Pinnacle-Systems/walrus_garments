/*
  Warnings:

  - You are about to drop the column `color` on the `stockreportcontrol` table. All the data in the column will be lost.
  - You are about to drop the column `item` on the `stockreportcontrol` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `stockreportcontrol` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `stockreportcontrol` DROP COLUMN `color`,
    DROP COLUMN `item`,
    DROP COLUMN `size`,
    ADD COLUMN `itemWise` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `sizeColorWise` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `sizeWise` BOOLEAN NULL DEFAULT false;
