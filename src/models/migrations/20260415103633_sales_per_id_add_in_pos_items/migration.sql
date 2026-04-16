/*
  Warnings:

  - You are about to drop the column `salesPersonId` on the `pos` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `pos` DROP FOREIGN KEY `Pos_salesPersonId_fkey`;

-- AlterTable
ALTER TABLE `pos` DROP COLUMN `salesPersonId`;

-- AlterTable
ALTER TABLE `positems` ADD COLUMN `salesPersonId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `PosItems` ADD CONSTRAINT `PosItems_salesPersonId_fkey` FOREIGN KEY (`salesPersonId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
