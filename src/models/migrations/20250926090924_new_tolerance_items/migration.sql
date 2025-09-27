/*
  Warnings:

  - You are about to drop the column `type` on the `excesstolerance` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `excesstolerance` DROP COLUMN `type`,
    ADD COLUMN `active` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `excessType` VARCHAR(191) NULL;
