/*
  Warnings:

  - You are about to drop the column `active` on the `excesstolerance` table. All the data in the column will be lost.
  - You are about to drop the column `excessQty` on the `excesstolerance` table. All the data in the column will be lost.
  - You are about to drop the column `excessType` on the `excesstolerance` table. All the data in the column will be lost.
  - You are about to drop the column `from` on the `excesstolerance` table. All the data in the column will be lost.
  - You are about to drop the column `orderType` on the `excesstolerance` table. All the data in the column will be lost.
  - You are about to drop the column `qty` on the `excesstolerance` table. All the data in the column will be lost.
  - You are about to drop the column `roundOfType` on the `excesstolerance` table. All the data in the column will be lost.
  - You are about to drop the column `to` on the `excesstolerance` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `excesstolerance` DROP COLUMN `active`,
    DROP COLUMN `excessQty`,
    DROP COLUMN `excessType`,
    DROP COLUMN `from`,
    DROP COLUMN `orderType`,
    DROP COLUMN `qty`,
    DROP COLUMN `roundOfType`,
    DROP COLUMN `to`;

-- CreateTable
CREATE TABLE `ExcessToleranceItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `excessToleranceId` INTEGER NULL,
    `excessType` VARCHAR(191) NULL,
    `orderType` VARCHAR(191) NULL,
    `qty` VARCHAR(191) NULL,
    `roundOfType` VARCHAR(191) NULL,
    `from` VARCHAR(191) NULL,
    `to` VARCHAR(191) NULL,
    `excessQty` VARCHAR(191) NULL,
    `active` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ExcessToleranceItems` ADD CONSTRAINT `ExcessToleranceItems_excessToleranceId_fkey` FOREIGN KEY (`excessToleranceId`) REFERENCES `ExcessTolerance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
