-- CreateTable
CREATE TABLE `YarnTransferDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stockTransferId` INTEGER NULL,
    `RequirementPlanningId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `orderId` INTEGER NULL,
    `yarnId` INTEGER NULL,
    `style` VARCHAR(191) NULL,
    `qty` DOUBLE NULL,
    `transferQty` DOUBLE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `YarnTransferDetails` ADD CONSTRAINT `YarnTransferDetails_stockTransferId_fkey` FOREIGN KEY (`stockTransferId`) REFERENCES `StockTransfer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `YarnTransferDetails` ADD CONSTRAINT `YarnTransferDetails_RequirementPlanningId_fkey` FOREIGN KEY (`RequirementPlanningId`) REFERENCES `RequirementPlanningForm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `YarnTransferDetails` ADD CONSTRAINT `YarnTransferDetails_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `YarnTransferDetails` ADD CONSTRAINT `YarnTransferDetails_yarnId_fkey` FOREIGN KEY (`yarnId`) REFERENCES `Yarn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
