-- DropForeignKey
ALTER TABLE `accessoryinwarditems` DROP FOREIGN KEY `AccessoryInwardItems_AccessoryInwardId_fkey`;

-- AlterTable
ALTER TABLE `accessorycancelitems` ADD COLUMN `isDeleted` BOOLEAN NULL;

-- AlterTable
ALTER TABLE `accessoryinward` ADD COLUMN `isDeleted` BOOLEAN NULL;

-- AlterTable
ALTER TABLE `accessoryinwarditems` ADD COLUMN `isDeleted` BOOLEAN NULL;

-- AlterTable
ALTER TABLE `accessorypo` ADD COLUMN `isDeleted` BOOLEAN NULL;

-- AlterTable
ALTER TABLE `accessorypoitems` ADD COLUMN `isDeleted` BOOLEAN NULL;

-- AlterTable
ALTER TABLE `accessoryreturn` ADD COLUMN `isDeleted` BOOLEAN NULL;

-- AlterTable
ALTER TABLE `accessoryreturnitems` ADD COLUMN `isDeleted` BOOLEAN NULL;

-- AlterTable
ALTER TABLE `accesssorypurchasecancel` ADD COLUMN `isDeleted` BOOLEAN NULL;

-- AlterTable
ALTER TABLE `cancelitems` ADD COLUMN `isDeleted` BOOLEAN NULL;

-- AlterTable
ALTER TABLE `directinwardorreturn` ADD COLUMN `isDeleted` BOOLEAN NULL;

-- AlterTable
ALTER TABLE `directitems` ADD COLUMN `isDeleted` BOOLEAN NULL;

-- AlterTable
ALTER TABLE `directreturnitems` ADD COLUMN `isDeleted` BOOLEAN NULL;

-- AlterTable
ALTER TABLE `directreturnorporeturn` ADD COLUMN `isDeleted` BOOLEAN NULL;

-- AlterTable
ALTER TABLE `po` ADD COLUMN `isDeleted` BOOLEAN NULL;

-- AlterTable
ALTER TABLE `poitems` ADD COLUMN `isDeleted` BOOLEAN NULL;

-- AlterTable
ALTER TABLE `purchasecancel` ADD COLUMN `isDeleted` BOOLEAN NULL;

-- AddForeignKey
ALTER TABLE `AccessoryInwardItems` ADD CONSTRAINT `AccessoryInwardItems_AccessoryInwardId_fkey` FOREIGN KEY (`AccessoryInwardId`) REFERENCES `AccessoryInward`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
