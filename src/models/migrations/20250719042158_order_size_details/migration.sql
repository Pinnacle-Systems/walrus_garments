-- CreateTable
CREATE TABLE `orderSizeDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `size` VARCHAR(191) NULL,
    `sizeMeasurement` VARCHAR(191) NULL,
    `qty` DOUBLE NULL,
    `orderdetailsId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orderYarnDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `yarncategoryId` INTEGER NULL,
    `yarnId` INTEGER NULL,
    `count` VARCHAR(191) NULL,
    `yarnKneedleId` INTEGER NULL,
    `orderdetailsId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `orderSizeDetails` ADD CONSTRAINT `orderSizeDetails_orderdetailsId_fkey` FOREIGN KEY (`orderdetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orderYarnDetails` ADD CONSTRAINT `orderYarnDetails_orderdetailsId_fkey` FOREIGN KEY (`orderdetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
