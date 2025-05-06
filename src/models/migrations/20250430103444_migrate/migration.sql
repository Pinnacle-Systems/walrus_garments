/*
  Warnings:

  - You are about to drop the column `payTermId` on the `po` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `po` DROP FOREIGN KEY `Po_payTermId_fkey`;

-- AlterTable
ALTER TABLE `party` ADD COLUMN `payTermDay` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `po` DROP COLUMN `payTermId`,
    ADD COLUMN `payTermDay` VARCHAR(191) NULL;
