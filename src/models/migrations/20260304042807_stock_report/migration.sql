/*
  Warnings:

  - You are about to alter the column `field1` on the `stockreportcontrol` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `VarChar(191)`.
  - You are about to alter the column `field2` on the `stockreportcontrol` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `VarChar(191)`.
  - You are about to alter the column `field3` on the `stockreportcontrol` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `VarChar(191)`.
  - You are about to alter the column `field4` on the `stockreportcontrol` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `VarChar(191)`.
  - You are about to alter the column `field5` on the `stockreportcontrol` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `stockreportcontrol` MODIFY `field1` VARCHAR(191) NULL,
    MODIFY `field2` VARCHAR(191) NULL,
    MODIFY `field3` VARCHAR(191) NULL,
    MODIFY `field4` VARCHAR(191) NULL,
    MODIFY `field5` VARCHAR(191) NULL;
