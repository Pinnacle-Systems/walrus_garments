/*
  Warnings:

  - You are about to alter the column `discountType` on the `po` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(34))` to `VarChar(191)`.
  - You are about to alter the column `discountType` on the `poitems` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(31))` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `po` ADD COLUMN `termsAndCondtion` LONGTEXT NULL,
    MODIFY `discountType` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `poitems` ADD COLUMN `hsnId` INTEGER NULL,
    MODIFY `discountType` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `PoItems` ADD CONSTRAINT `PoItems_hsnId_fkey` FOREIGN KEY (`hsnId`) REFERENCES `Hsn`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
