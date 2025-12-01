-- AlterTable
ALTER TABLE `accessorystock` ADD COLUMN `accessoryCategoryId` INTEGER NULL;

-- CreateTable
CREATE TABLE `MaterialIssueTypeList` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `value` VARCHAR(191) NULL,
    `materialIssueId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AccessoryStock` ADD CONSTRAINT `AccessoryStock_accessoryCategoryId_fkey` FOREIGN KEY (`accessoryCategoryId`) REFERENCES `AccessoryCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssueTypeList` ADD CONSTRAINT `MaterialIssueTypeList_materialIssueId_fkey` FOREIGN KEY (`materialIssueId`) REFERENCES `MaterialIssue`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
