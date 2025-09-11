-- AlterTable
ALTER TABLE `requirementplanningform` ADD COLUMN `isMaterialIssue` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `isMaterialRequst` BOOLEAN NULL DEFAULT false;

-- AlterTable
ALTER TABLE `stock` ADD COLUMN `orderId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
