/*
  Warnings:

  - You are about to alter the column `poType` on the `billentry` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(10))` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `billentry` MODIFY `poType` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `stock` ADD COLUMN `transactionId` INTEGER NULL;
