/*
  Warnings:

  - You are about to drop the column `accessoryTemplateId` on the `order` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_accessoryTemplateId_fkey`;

-- AlterTable
ALTER TABLE `accessoryrequirementplanning` ADD COLUMN `isNotPurchase` BOOLEAN NULL DEFAULT false;

-- AlterTable
ALTER TABLE `order` DROP COLUMN `accessoryTemplateId`,
    ADD COLUMN `poNumber` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `orderdetails` ADD COLUMN `accessoryTemplateId` INTEGER NULL;

-- AlterTable
ALTER TABLE `requirementplanningform` ADD COLUMN `poNumber` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `requirementplanningitems` ADD COLUMN `isNotPurchase` BOOLEAN NULL DEFAULT false;

-- AlterTable
ALTER TABLE `requirementyarndetails` ADD COLUMN `isNotPurchase` BOOLEAN NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE `OrderDetails` ADD CONSTRAINT `OrderDetails_accessoryTemplateId_fkey` FOREIGN KEY (`accessoryTemplateId`) REFERENCES `AccessoryTemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
