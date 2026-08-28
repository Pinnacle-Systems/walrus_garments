-- CreateTable
CREATE TABLE `Fulfillments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `posItemId` INTEGER NULL,
    `storeId` INTEGER NULL,
    `qty` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Fulfillments` ADD CONSTRAINT `Fulfillments_posItemId_fkey` FOREIGN KEY (`posItemId`) REFERENCES `PosItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
