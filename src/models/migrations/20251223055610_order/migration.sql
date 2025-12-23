-- AlterTable
ALTER TABLE `orderaccessorydetails` ADD COLUMN `qty` DOUBLE NULL,
    ADD COLUMN `uomId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `OrderAccessoryDetails` ADD CONSTRAINT `OrderAccessoryDetails_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
