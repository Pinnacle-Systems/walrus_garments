-- AlterTable
ALTER TABLE `materialissueitems` ADD COLUMN `colorId` INTEGER NULL,
    ADD COLUMN `issueQty` DOUBLE NULL,
    ADD COLUMN `qty` DOUBLE NULL,
    ADD COLUMN `yarnId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `MaterialIssueItems` ADD CONSTRAINT `MaterialIssueItems_yarnId_fkey` FOREIGN KEY (`yarnId`) REFERENCES `Yarn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssueItems` ADD CONSTRAINT `MaterialIssueItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
