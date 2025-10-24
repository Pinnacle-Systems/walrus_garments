/*
  Warnings:

  - You are about to alter the column `discountType` on the `accessorypoitems` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(34))` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `accessorypoitems` MODIFY `discountType` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `accesssorypurchasecancel` ADD COLUMN `po` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `directitems` ADD COLUMN `poId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `DirectItems` ADD CONSTRAINT `DirectItems_poId_fkey` FOREIGN KEY (`poId`) REFERENCES `Po`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
