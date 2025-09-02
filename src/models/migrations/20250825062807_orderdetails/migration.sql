/*
  Warnings:

  - You are about to drop the column `size` on the `ordersizedetails` table. All the data in the column will be lost.
  - You are about to alter the column `count` on the `orderyarndetails` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `ordersizedetails` DROP COLUMN `size`;

-- AlterTable
ALTER TABLE `orderyarndetails` MODIFY `count` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `orderSizeDetails` ADD CONSTRAINT `orderSizeDetails_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orderYarnDetails` ADD CONSTRAINT `orderYarnDetails_yarncategoryId_fkey` FOREIGN KEY (`yarncategoryId`) REFERENCES `YarnType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orderYarnDetails` ADD CONSTRAINT `orderYarnDetails_yarnId_fkey` FOREIGN KEY (`yarnId`) REFERENCES `Yarn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orderYarnDetails` ADD CONSTRAINT `orderYarnDetails_count_fkey` FOREIGN KEY (`count`) REFERENCES `Counts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orderYarnDetails` ADD CONSTRAINT `orderYarnDetails_yarnKneedleId_fkey` FOREIGN KEY (`yarnKneedleId`) REFERENCES `YarnNeedle`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
