/*
  Warnings:

  - You are about to alter the column `weight` on the `samplesizedetails` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Double`.

*/
-- AlterTable
ALTER TABLE `ordersizedetails` ADD COLUMN `weight` DOUBLE NULL;

-- AlterTable
ALTER TABLE `samplesizedetails` MODIFY `weight` DOUBLE NULL;
