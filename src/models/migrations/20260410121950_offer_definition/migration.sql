/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Item` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE `OfferDefinition` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `priority` INTEGER NOT NULL DEFAULT 0,
    `validFrom` DATETIME(3) NULL,
    `validTo` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Item_name_key` ON `Item`(`name`);
