/*
  Warnings:

  - A unique constraint covering the columns `[couponCode]` on the table `OfferDefinition` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `discountType` to the `OfferDefinition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `offerType` to the `OfferDefinition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `OfferDefinition` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `offerdefinition` required. This step will fail if there are existing NULL values in that column.
  - Made the column `validFrom` on table `offerdefinition` required. This step will fail if there are existing NULL values in that column.
  - Made the column `validTo` on table `offerdefinition` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `offerdefinition` ADD COLUMN `active` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `branchId` INTEGER NULL,
    ADD COLUMN `comboItems` LONGTEXT NULL,
    ADD COLUMN `couponCode` VARCHAR(191) NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `daysOfWeek` VARCHAR(191) NULL,
    ADD COLUMN `discountType` VARCHAR(191) NOT NULL,
    ADD COLUMN `discountValue` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `endTime` VARCHAR(191) NULL,
    ADD COLUMN `freeItemId` INTEGER NULL,
    ADD COLUMN `freeItemQty` DOUBLE NULL DEFAULT 1,
    ADD COLUMN `itemSelection` LONGTEXT NULL,
    ADD COLUMN `maxDiscountValue` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `minBillAmount` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `minQty` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `offerType` VARCHAR(191) NOT NULL,
    ADD COLUMN `perCustomerLimit` INTEGER NULL,
    ADD COLUMN `startTime` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `usageLimit` INTEGER NULL,
    MODIFY `name` VARCHAR(191) NOT NULL,
    MODIFY `validFrom` DATETIME(3) NOT NULL,
    MODIFY `validTo` DATETIME(3) NOT NULL;

-- CreateTable
CREATE TABLE `Collections` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `active` BOOLEAN NULL DEFAULT true,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CollectionItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `collectionId` INTEGER NULL,
    `itemId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `OfferDefinition_couponCode_key` ON `OfferDefinition`(`couponCode`);

-- AddForeignKey
ALTER TABLE `OfferDefinition` ADD CONSTRAINT `OfferDefinition_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CollectionItems` ADD CONSTRAINT `CollectionItems_collectionId_fkey` FOREIGN KEY (`collectionId`) REFERENCES `Collections`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CollectionItems` ADD CONSTRAINT `CollectionItems_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Item`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
