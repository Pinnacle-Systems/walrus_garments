-- AlterTable
ALTER TABLE `pos` ADD COLUMN `bilStatus` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `positems` ADD COLUMN `isReturn` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `originalItemId` INTEGER NULL,
    ADD COLUMN `retunBillId` INTEGER NULL;

-- AlterTable
ALTER TABLE `pospayments` ADD COLUMN `retunBillId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `PosItems` ADD CONSTRAINT `PosItems_retunBillId_fkey` FOREIGN KEY (`retunBillId`) REFERENCES `Pos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PosItems` ADD CONSTRAINT `PosItems_originalItemId_fkey` FOREIGN KEY (`originalItemId`) REFERENCES `PosItems`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PosPayments` ADD CONSTRAINT `PosPayments_retunBillId_fkey` FOREIGN KEY (`retunBillId`) REFERENCES `Pos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
