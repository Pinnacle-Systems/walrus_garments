/*
  Warnings:

  - You are about to alter the column `discountType` on the `billentry` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(41))` to `VarChar(191)`.
  - You are about to alter the column `discountType` on the `billentryitems` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(23))` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `billentry` MODIFY `discountType` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `billentryitems` MODIFY `discountType` VARCHAR(191) NULL;
