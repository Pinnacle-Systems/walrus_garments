/*
  Warnings:

  - You are about to drop the column `qty` on the `sampledetails` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `sampledetails` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `sampledetails` DROP COLUMN `qty`,
    DROP COLUMN `weight`,
    ADD COLUMN `sampleQty` INTEGER NULL,
    ADD COLUMN `sampleWeight` DOUBLE NULL;
