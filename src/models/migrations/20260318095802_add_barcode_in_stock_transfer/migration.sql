/*
  Warnings:

  - You are about to alter the column `transactionId` on the `legacystock` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `fromlocationtransferitems` ADD COLUMN `barcode` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `legacystock` MODIFY `transactionId` INTEGER NULL;
