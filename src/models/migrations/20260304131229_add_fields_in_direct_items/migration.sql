/*
  Warnings:

  - You are about to drop the column `field1` on the `directinwardorreturn` table. All the data in the column will be lost.
  - You are about to drop the column `field2` on the `directinwardorreturn` table. All the data in the column will be lost.
  - You are about to drop the column `field3` on the `directinwardorreturn` table. All the data in the column will be lost.
  - You are about to drop the column `field4` on the `directinwardorreturn` table. All the data in the column will be lost.
  - You are about to drop the column `field5` on the `directinwardorreturn` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `directinwardorreturn` DROP COLUMN `field1`,
    DROP COLUMN `field2`,
    DROP COLUMN `field3`,
    DROP COLUMN `field4`,
    DROP COLUMN `field5`;

-- AlterTable
ALTER TABLE `directitems` ADD COLUMN `field1` VARCHAR(191) NULL,
    ADD COLUMN `field2` VARCHAR(191) NULL,
    ADD COLUMN `field3` VARCHAR(191) NULL,
    ADD COLUMN `field4` VARCHAR(191) NULL,
    ADD COLUMN `field5` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `directreturnitems` ADD COLUMN `field1` VARCHAR(191) NULL,
    ADD COLUMN `field2` VARCHAR(191) NULL,
    ADD COLUMN `field3` VARCHAR(191) NULL,
    ADD COLUMN `field4` VARCHAR(191) NULL,
    ADD COLUMN `field5` VARCHAR(191) NULL;
