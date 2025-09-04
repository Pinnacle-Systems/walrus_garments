-- AlterTable
ALTER TABLE `raiseindentitems` ADD COLUMN `colorId` INTEGER NULL,
    ADD COLUMN `percentage` DOUBLE NULL,
    ADD COLUMN `weight` DOUBLE NULL,
    ADD COLUMN `yarnId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `RaiseIndentItems` ADD CONSTRAINT `RaiseIndentItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaiseIndentItems` ADD CONSTRAINT `RaiseIndentItems_yarnId_fkey` FOREIGN KEY (`yarnId`) REFERENCES `Yarn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
