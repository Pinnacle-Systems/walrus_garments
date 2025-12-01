-- AlterTable
ALTER TABLE `accessorymaterialissueitems` ADD COLUMN `sizeId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `AccessoryMaterialIssueItems` ADD CONSTRAINT `AccessoryMaterialIssueItems_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
