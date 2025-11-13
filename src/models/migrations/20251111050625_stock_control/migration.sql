-- AlterTable
ALTER TABLE `stock` ADD COLUMN `supplierId` INTEGER NULL;

-- CreateTable
CREATE TABLE `StockReportControl` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `isStockReport` LONGTEXT NULL,
    `active` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
