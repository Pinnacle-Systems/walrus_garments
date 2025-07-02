-- DropForeignKey
ALTER TABLE `directitems` DROP FOREIGN KEY `DirectItems_directInwardOrReturnId_fkey`;

-- AlterTable
ALTER TABLE `directitems` ADD COLUMN `alreadyInwardedQty` DOUBLE NULL,
    ADD COLUMN `alreadyReturnedQty` DOUBLE NULL,
    ADD COLUMN `balanceQty` DOUBLE NULL,
    ADD COLUMN `cancelQty` DOUBLE NULL,
    ADD COLUMN `poNo` VARCHAR(191) NULL,
    ADD COLUMN `poQty` DOUBLE NULL;

-- AddForeignKey
ALTER TABLE `DirectItems` ADD CONSTRAINT `DirectItems_directInwardOrReturnId_fkey` FOREIGN KEY (`directInwardOrReturnId`) REFERENCES `DirectInwardOrReturn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
