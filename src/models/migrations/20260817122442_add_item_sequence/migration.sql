-- AlterTable
ALTER TABLE `item` ADD COLUMN `saleType` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `ItemSequence` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `saleType` VARCHAR(191) NULL,
    `prefix` VARCHAR(191) NULL,
    `sequence` INTEGER NULL DEFAULT 1000,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
