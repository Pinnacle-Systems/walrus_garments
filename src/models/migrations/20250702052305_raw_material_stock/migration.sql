-- DropForeignKey
ALTER TABLE `rawmaterialopeningstock` DROP FOREIGN KEY `RawMaterialOpeningStock_branchId_fkey`;

-- DropForeignKey
ALTER TABLE `rawmaterialopeningstock` DROP FOREIGN KEY `RawMaterialOpeningStock_storeId_fkey`;

-- AlterTable
ALTER TABLE `rawmaterialopeningstock` MODIFY `rawMaterialType` ENUM('GreyYarn', 'DyedYarn', 'GreyFabric', 'DyedFabric', 'Accessory') NULL,
    MODIFY `storeId` INTEGER NULL,
    MODIFY `branchId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `RawMaterialOpeningStock` ADD CONSTRAINT `RawMaterialOpeningStock_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterialOpeningStock` ADD CONSTRAINT `RawMaterialOpeningStock_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
