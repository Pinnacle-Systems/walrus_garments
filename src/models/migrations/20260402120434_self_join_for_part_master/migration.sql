/*
  Warnings:

  - You are about to alter the column `parentId` on the `party` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `party` MODIFY `parentId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Party` ADD CONSTRAINT `Party_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
