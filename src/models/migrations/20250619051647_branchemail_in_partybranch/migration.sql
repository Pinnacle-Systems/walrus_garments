/*
  Warnings:

  - You are about to drop the column `address` on the `partybranch` table. All the data in the column will be lost.
  - You are about to drop the column `contactEmail` on the `partybranch` table. All the data in the column will be lost.
  - You are about to drop the column `contactMobile` on the `partybranch` table. All the data in the column will be lost.
  - You are about to drop the column `contactName` on the `partybranch` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `partybranch` DROP COLUMN `address`,
    DROP COLUMN `contactEmail`,
    DROP COLUMN `contactMobile`,
    DROP COLUMN `contactName`,
    ADD COLUMN `branchAddress` LONGTEXT NULL,
    ADD COLUMN `branchContact` INTEGER NULL,
    ADD COLUMN `branchEmail` LONGTEXT NULL;
