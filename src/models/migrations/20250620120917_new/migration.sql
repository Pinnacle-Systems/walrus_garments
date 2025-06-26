-- CreateTable
CREATE TABLE `sampleDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sampleId` INTEGER NULL,
    `qty` INTEGER NULL,
    `weight` DOUBLE NULL,
    `orderId` INTEGER NULL,
    `yarnNeedleId` INTEGER NULL,
    `machineId` INTEGER NULL,
    `fiberContentId` INTEGER NULL,
    `description` LONGTEXT NULL,
    `orderQty` DOUBLE NULL,
    `socksMaterialId` INTEGER NULL,
    `measurements` VARCHAR(191) NULL,
    `sizeId` INTEGER NULL,
    `styleId` INTEGER NULL,
    `legcolorId` INTEGER NULL,
    `footcolorId` INTEGER NULL,
    `stripecolorId` INTEGER NULL,
    `noOfStripes` VARCHAR(191) NULL,
    `socksTypeId` INTEGER NULL,
    `filePath` LONGTEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sampleDetails` ADD CONSTRAINT `sampleDetails_sampleId_fkey` FOREIGN KEY (`sampleId`) REFERENCES `Sample`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sampleDetails` ADD CONSTRAINT `sampleDetails_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sampleDetails` ADD CONSTRAINT `sampleDetails_yarnNeedleId_fkey` FOREIGN KEY (`yarnNeedleId`) REFERENCES `YarnNeedle`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sampleDetails` ADD CONSTRAINT `sampleDetails_machineId_fkey` FOREIGN KEY (`machineId`) REFERENCES `Machine`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sampleDetails` ADD CONSTRAINT `sampleDetails_fiberContentId_fkey` FOREIGN KEY (`fiberContentId`) REFERENCES `FiberContent`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sampleDetails` ADD CONSTRAINT `sampleDetails_socksMaterialId_fkey` FOREIGN KEY (`socksMaterialId`) REFERENCES `SocksMaterial`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sampleDetails` ADD CONSTRAINT `sampleDetails_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sampleDetails` ADD CONSTRAINT `sampleDetails_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sampleDetails` ADD CONSTRAINT `sampleDetails_legcolorId_fkey` FOREIGN KEY (`legcolorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sampleDetails` ADD CONSTRAINT `sampleDetails_footcolorId_fkey` FOREIGN KEY (`footcolorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sampleDetails` ADD CONSTRAINT `sampleDetails_stripecolorId_fkey` FOREIGN KEY (`stripecolorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sampleDetails` ADD CONSTRAINT `sampleDetails_socksTypeId_fkey` FOREIGN KEY (`socksTypeId`) REFERENCES `SocksType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
