-- CreateTable
CREATE TABLE `ItemPriceList` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `itemId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `purchasePrice` VARCHAR(191) NULL,
    `salesPrice` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ItemPriceList` ADD CONSTRAINT `ItemPriceList_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Item`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ItemPriceList` ADD CONSTRAINT `ItemPriceList_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ItemPriceList` ADD CONSTRAINT `ItemPriceList_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
