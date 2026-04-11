/*
  Warnings:

  - You are about to drop the `offerdefinition` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `offerdefinition` DROP FOREIGN KEY `OfferDefinition_branchId_fkey`;

-- DropTable
DROP TABLE `offerdefinition`;

-- CreateTable
CREATE TABLE `Offer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `code` VARCHAR(191) NULL,
    `offerType` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `priority` INTEGER NOT NULL DEFAULT 0,
    `startTime` VARCHAR(191) NULL,
    `endTime` VARCHAR(191) NULL,
    `daysOfWeek` VARCHAR(191) NULL,
    `noEndDate` BOOLEAN NOT NULL DEFAULT false,
    `scopeMode` VARCHAR(191) NULL,
    `itemSelection` LONGTEXT NULL,
    `minQty` DOUBLE NULL DEFAULT 0,
    `minBillAmount` DOUBLE NULL DEFAULT 0,
    `comboItems` LONGTEXT NULL,
    `couponCode` VARCHAR(191) NULL,
    `usageLimit` INTEGER NULL,
    `perCustomerLimit` INTEGER NULL,
    `discountType` VARCHAR(191) NOT NULL,
    `discountValue` DOUBLE NULL DEFAULT 0,
    `maxDiscountValue` DOUBLE NULL DEFAULT 0,
    `freeItemId` INTEGER NULL,
    `freeItemQty` DOUBLE NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `branchId` INTEGER NULL,

    UNIQUE INDEX `Offer_couponCode_key`(`couponCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OfferScope` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `offerId` INTEGER NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `refId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OfferRule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `offerId` INTEGER NOT NULL,
    `logic` VARCHAR(191) NOT NULL,
    `conditions` JSON NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Offer` ADD CONSTRAINT `Offer_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OfferScope` ADD CONSTRAINT `OfferScope_offerId_fkey` FOREIGN KEY (`offerId`) REFERENCES `Offer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OfferRule` ADD CONSTRAINT `OfferRule_offerId_fkey` FOREIGN KEY (`offerId`) REFERENCES `Offer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
