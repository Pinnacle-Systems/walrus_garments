-- DropForeignKey
ALTER TABLE `fabric` DROP FOREIGN KEY `Fabric_fabricTypeId_fkey`;

-- AlterTable
ALTER TABLE `fabric` MODIFY `fabricTypeId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Fabric` ADD CONSTRAINT `Fabric_fabricTypeId_fkey` FOREIGN KEY (`fabricTypeId`) REFERENCES `FabricType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
