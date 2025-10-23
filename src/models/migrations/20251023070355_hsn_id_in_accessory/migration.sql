/*
  Warnings:

  - You are about to drop the column `hsn` on the `accessory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `accessory` DROP COLUMN `hsn`,
    ADD COLUMN `hsnId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Accessory` ADD CONSTRAINT `Accessory_hsnId_fkey` FOREIGN KEY (`hsnId`) REFERENCES `Hsn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
