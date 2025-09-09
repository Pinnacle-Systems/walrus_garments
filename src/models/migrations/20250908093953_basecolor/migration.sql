/*
  Warnings:

  - You are about to drop the column `baseColorId` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `footcolorId` on the `orderdetails` table. All the data in the column will be lost.
  - You are about to drop the column `legcolorId` on the `orderdetails` table. All the data in the column will be lost.
  - You are about to drop the column `stripecolorId` on the `orderdetails` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_baseColorId_fkey`;

-- DropForeignKey
ALTER TABLE `orderdetails` DROP FOREIGN KEY `OrderDetails_footcolorId_fkey`;

-- DropForeignKey
ALTER TABLE `orderdetails` DROP FOREIGN KEY `OrderDetails_legcolorId_fkey`;

-- DropForeignKey
ALTER TABLE `orderdetails` DROP FOREIGN KEY `OrderDetails_stripecolorId_fkey`;

-- AlterTable
ALTER TABLE `order` DROP COLUMN `baseColorId`;

-- AlterTable
ALTER TABLE `orderdetails` DROP COLUMN `footcolorId`,
    DROP COLUMN `legcolorId`,
    DROP COLUMN `stripecolorId`,
    ADD COLUMN `baseColorId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `OrderDetails` ADD CONSTRAINT `OrderDetails_baseColorId_fkey` FOREIGN KEY (`baseColorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
