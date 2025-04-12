/*
  Warnings:

  - You are about to drop the column `address` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `branchId` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `contactPersonName` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `partyId` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `validDate` on the `order` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_branchId_fkey`;

-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_partyId_fkey`;

-- AlterTable
ALTER TABLE `order` DROP COLUMN `address`,
    DROP COLUMN `branchId`,
    DROP COLUMN `contactPersonName`,
    DROP COLUMN `partyId`,
    DROP COLUMN `phone`,
    DROP COLUMN `validDate`,
    ADD COLUMN `billingAddress` VARCHAR(191) NULL,
    ADD COLUMN `customer` VARCHAR(191) NULL,
    ADD COLUMN `deliveryDate` DATETIME(3) NULL,
    ADD COLUMN `gmail` VARCHAR(191) NULL,
    ADD COLUMN `orderDate` DATETIME(3) NULL,
    ADD COLUMN `phoneNo` VARCHAR(191) NULL,
    ADD COLUMN `shippingAddress` VARCHAR(191) NULL,
    MODIFY `docId` VARCHAR(191) NULL,
    MODIFY `createdById` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
