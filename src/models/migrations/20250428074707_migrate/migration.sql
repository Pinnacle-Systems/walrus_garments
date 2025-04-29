/*
  Warnings:

  - You are about to drop the column `taxTemplateId` on the `po` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `po` DROP FOREIGN KEY `Po_taxTemplateId_fkey`;

-- AlterTable
ALTER TABLE `po` DROP COLUMN `taxTemplateId`,
    ADD COLUMN `tax` DOUBLE NULL;
