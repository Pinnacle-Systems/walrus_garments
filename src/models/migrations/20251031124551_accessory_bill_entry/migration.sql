-- CreateTable
CREATE TABLE `AccessoryBillEntry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `processId` INTEGER NULL,
    `poType` VARCHAR(191) NULL,
    `supplierId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NOT NULL,
    `updatedById` INTEGER NULL,
    `branchId` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `storeId` INTEGER NULL,
    `docId` VARCHAR(191) NOT NULL,
    `payTermId` INTEGER NULL,
    `taxTemplateId` INTEGER NULL,
    `partyBillNo` VARCHAR(191) NULL,
    `netBillValue` INTEGER NULL,
    `discountType` VARCHAR(191) NULL,
    `discountValue` DOUBLE NULL DEFAULT 0,
    `partyBillDate` DATE NULL,
    `isProcessBillEntry` BOOLEAN NOT NULL DEFAULT false,
    `isDirect` BOOLEAN NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccessoryBillEntryItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `isPoItem` BOOLEAN NOT NULL DEFAULT false,
    `accessoryBillEntryId` INTEGER NOT NULL,
    `accessoryPoItemsId` INTEGER NULL,
    `accessoryInwardItemsId` INTEGER NULL,
    `processDeliveryProgramDetailsId` INTEGER NULL,
    `qty` DOUBLE NOT NULL,
    `discountType` VARCHAR(191) NULL,
    `discountValue` DOUBLE NULL DEFAULT 0,
    `price` DOUBLE NULL DEFAULT 0,
    `taxPercent` DOUBLE NULL,
    `notes` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AccessoryBillEntry` ADD CONSTRAINT `AccessoryBillEntry_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryBillEntry` ADD CONSTRAINT `AccessoryBillEntry_processId_fkey` FOREIGN KEY (`processId`) REFERENCES `Process`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryBillEntry` ADD CONSTRAINT `AccessoryBillEntry_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryBillEntry` ADD CONSTRAINT `AccessoryBillEntry_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryBillEntry` ADD CONSTRAINT `AccessoryBillEntry_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryBillEntry` ADD CONSTRAINT `AccessoryBillEntry_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryBillEntry` ADD CONSTRAINT `AccessoryBillEntry_payTermId_fkey` FOREIGN KEY (`payTermId`) REFERENCES `PayTerm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryBillEntry` ADD CONSTRAINT `AccessoryBillEntry_taxTemplateId_fkey` FOREIGN KEY (`taxTemplateId`) REFERENCES `TaxTemplate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryBillEntryItems` ADD CONSTRAINT `AccessoryBillEntryItems_accessoryBillEntryId_fkey` FOREIGN KEY (`accessoryBillEntryId`) REFERENCES `AccessoryBillEntry`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryBillEntryItems` ADD CONSTRAINT `AccessoryBillEntryItems_accessoryPoItemsId_fkey` FOREIGN KEY (`accessoryPoItemsId`) REFERENCES `AccessoryPoItems`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryBillEntryItems` ADD CONSTRAINT `AccessoryBillEntryItems_accessoryInwardItemsId_fkey` FOREIGN KEY (`accessoryInwardItemsId`) REFERENCES `AccessoryInwardItems`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryBillEntryItems` ADD CONSTRAINT `AccessoryBillEntryItems_processDeliveryProgramDetailsId_fkey` FOREIGN KEY (`processDeliveryProgramDetailsId`) REFERENCES `ProcessDeliveryProgramDetails`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
