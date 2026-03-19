/*
  Warnings:

  - You are about to alter the column `inOrOut` on the `stock` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(15))` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `legacystock` ADD COLUMN `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `stock` MODIFY `inOrOut` VARCHAR(191) NULL;
