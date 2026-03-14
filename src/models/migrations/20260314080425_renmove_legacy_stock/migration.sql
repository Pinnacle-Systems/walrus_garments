/*
  Warnings:

  - You are about to drop the column `inOrOut` on the `legacystock` table. All the data in the column will be lost.
  - You are about to drop the column `itemCode` on the `legacystock` table. All the data in the column will be lost.
  - You are about to drop the column `itemType` on the `legacystock` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `legacystock` DROP COLUMN `inOrOut`,
    DROP COLUMN `itemCode`,
    DROP COLUMN `itemType`;
