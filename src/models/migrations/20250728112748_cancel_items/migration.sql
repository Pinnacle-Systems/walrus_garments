-- DropForeignKey
ALTER TABLE `cancelitems` DROP FOREIGN KEY `CancelItems_uomId_fkey`;

-- AlterTable
ALTER TABLE `cancelitems` MODIFY `uomId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `CancelItems` ADD CONSTRAINT `CancelItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
