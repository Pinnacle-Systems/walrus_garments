-- CreateTable
CREATE TABLE `FiberContent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `aliasName` VARCHAR(191) NULL,
    `companyId` INTEGER NULL,
    `active` BOOLEAN NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FiberBlend` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fabricId` INTEGER NULL,
    `percentage` INTEGER NULL,
    `fiberContentId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FiberContent` ADD CONSTRAINT `FiberContent_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FiberBlend` ADD CONSTRAINT `FiberBlend_fiberContentId_fkey` FOREIGN KEY (`fiberContentId`) REFERENCES `FiberContent`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FiberBlend` ADD CONSTRAINT `FiberBlend_fabricId_fkey` FOREIGN KEY (`fabricId`) REFERENCES `Fabric`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
