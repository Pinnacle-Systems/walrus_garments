/*
  Warnings:

  - You are about to drop the column `transaction` on the `excesstolerance` table. All the data in the column will be lost.
  - You are about to drop the `excesstoleranceitems` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `excesstoleranceitems` DROP FOREIGN KEY `ExcessToleranceItems_excessToleranceId_fkey`;

-- AlterTable
ALTER TABLE `excesstolerance` DROP COLUMN `transaction`,
    ADD COLUMN `excessQty` VARCHAR(191) NULL,
    ADD COLUMN `from` VARCHAR(191) NULL,
    ADD COLUMN `materialId` INTEGER NULL,
    ADD COLUMN `orderType` VARCHAR(191) NULL,
    ADD COLUMN `qty` VARCHAR(191) NULL,
    ADD COLUMN `roundOfType` VARCHAR(191) NULL,
    ADD COLUMN `to` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `excesstoleranceitems`;
