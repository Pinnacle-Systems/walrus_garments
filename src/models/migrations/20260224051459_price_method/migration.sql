/*
  Warnings:

  - You are about to drop the column `priceMethod` on the `itempricelist` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `item` ADD COLUMN `priceMethod` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `itempricelist` DROP COLUMN `priceMethod`;
