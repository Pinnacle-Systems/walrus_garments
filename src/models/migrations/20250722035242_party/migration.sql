/*
  Warnings:

  - You are about to drop the column `accountnumber` on the `party` table. All the data in the column will be lost.
  - You are about to drop the column `ifsccode` on the `party` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `party` DROP COLUMN `accountnumber`,
    DROP COLUMN `ifsccode`,
    ADD COLUMN `accountNumber` VARCHAR(191) NULL,
    ADD COLUMN `ifscCode` VARCHAR(191) NULL;
