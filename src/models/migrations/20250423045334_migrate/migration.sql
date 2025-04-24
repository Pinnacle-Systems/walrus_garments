/*
  Warnings:

  - You are about to alter the column `isIgst` on the `party` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `party` MODIFY `isIgst` VARCHAR(191) NULL;
