/*
  Warnings:

  - You are about to drop the column `barcodeType` on the `salesdelivery` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `salesdelivery` DROP COLUMN `barcodeType`;

-- AlterTable
ALTER TABLE `salesdeliveryitems` ADD COLUMN `barcodeType` VARCHAR(191) NULL;
