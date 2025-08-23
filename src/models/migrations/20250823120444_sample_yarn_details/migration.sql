-- AlterTable
ALTER TABLE `orderyarndetails` ADD COLUMN `colorId` INTEGER NULL;

-- CreateTable
CREATE TABLE `SampleYarnDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `colorId` INTEGER NULL,
    `yarncategoryId` INTEGER NULL,
    `yarnId` INTEGER NULL,
    `count` VARCHAR(191) NULL,
    `yarnKneedleId` INTEGER NULL,
    `sampleDetailsId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `orderYarnDetails` ADD CONSTRAINT `orderYarnDetails_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SampleYarnDetails` ADD CONSTRAINT `SampleYarnDetails_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SampleYarnDetails` ADD CONSTRAINT `SampleYarnDetails_sampleDetailsId_fkey` FOREIGN KEY (`sampleDetailsId`) REFERENCES `sampleDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
