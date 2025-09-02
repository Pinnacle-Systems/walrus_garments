-- DropForeignKey
ALTER TABLE `sampleyarndetails` DROP FOREIGN KEY `SampleYarnDetails_colorId_fkey`;

-- DropForeignKey
ALTER TABLE `sampleyarndetails` DROP FOREIGN KEY `SampleYarnDetails_sampleDetailsId_fkey`;

-- AddForeignKey
ALTER TABLE `sampleYarnDetails` ADD CONSTRAINT `sampleYarnDetails_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sampleYarnDetails` ADD CONSTRAINT `sampleYarnDetails_sampleDetailsId_fkey` FOREIGN KEY (`sampleDetailsId`) REFERENCES `sampleDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
