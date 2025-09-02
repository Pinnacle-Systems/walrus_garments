-- CreateTable
CREATE TABLE `yarnCounts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `yarnTypeId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `yarnCounts` ADD CONSTRAINT `yarnCounts_yarnTypeId_fkey` FOREIGN KEY (`yarnTypeId`) REFERENCES `YarnType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
