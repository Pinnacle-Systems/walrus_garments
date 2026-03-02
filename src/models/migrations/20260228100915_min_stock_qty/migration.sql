-- CreateTable
CREATE TABLE `MinimumStockQty` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `locationId` INTEGER NULL,
    `minStockQty` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MinimumStockQty` ADD CONSTRAINT `MinimumStockQty_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
