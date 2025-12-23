-- AlterTable
ALTER TABLE `order` ADD COLUMN `accessoryTemplateId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_accessoryTemplateId_fkey` FOREIGN KEY (`accessoryTemplateId`) REFERENCES `AccessoryTemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
