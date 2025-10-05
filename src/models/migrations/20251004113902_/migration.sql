/*
  Warnings:

  - You are about to drop the column `hsn` on the `yarn` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `excesstoleranceitems` ADD COLUMN `bagweight` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `yarn` DROP COLUMN `hsn`,
    ADD COLUMN `hsnId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Yarn` ADD CONSTRAINT `Yarn_hsnId_fkey` FOREIGN KEY (`hsnId`) REFERENCES `Hsn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
