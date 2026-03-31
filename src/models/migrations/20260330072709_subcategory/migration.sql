-- DropForeignKey
ALTER TABLE `item` DROP FOREIGN KEY `Item_subCategoryId_fkey`;

-- CreateTable
CREATE TABLE `SubCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `itemCategoryId` INTEGER NULL,
    `name` VARCHAR(191) NULL,
    `code` VARCHAR(191) NULL,
    `active` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Item` ADD CONSTRAINT `Item_subCategoryId_fkey` FOREIGN KEY (`subCategoryId`) REFERENCES `SubCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubCategory` ADD CONSTRAINT `SubCategory_itemCategoryId_fkey` FOREIGN KEY (`itemCategoryId`) REFERENCES `ItemCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
