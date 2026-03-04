/*
  Warnings:

  - You are about to drop the column `isStockReport` on the `stockreportcontrol` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `itemcontrolpanel` ADD COLUMN `sectionType` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `sizeWise` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `size_color_wise` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `stockreportcontrol` DROP COLUMN `isStockReport`,
    ADD COLUMN `color` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `field1` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `field2` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `field3` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `field4` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `field5` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `item` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `size` BOOLEAN NULL DEFAULT false;
