-- AlterTable
ALTER TABLE `order` ADD COLUMN `baseColorId` INTEGER NULL;

-- AlterTable
ALTER TABLE `requirementplanningform` ADD COLUMN `jobNumber` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_baseColorId_fkey` FOREIGN KEY (`baseColorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
