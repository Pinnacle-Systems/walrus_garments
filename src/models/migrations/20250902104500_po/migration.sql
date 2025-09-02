-- DropForeignKey
ALTER TABLE `poitems` DROP FOREIGN KEY `PoItems_uomId_fkey`;

-- AlterTable
ALTER TABLE `poitems` MODIFY `uomId` INTEGER NULL,
    MODIFY `qty` DOUBLE NULL,
    MODIFY `price` DOUBLE NULL,
    MODIFY `poId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `PoItems` ADD CONSTRAINT `PoItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
