/*
  Warnings:

  - You are about to alter the column `taxPercent` on the `accessory` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `Double`.

*/
-- AlterTable
ALTER TABLE `accessory` MODIFY `taxPercent` DOUBLE NULL;
