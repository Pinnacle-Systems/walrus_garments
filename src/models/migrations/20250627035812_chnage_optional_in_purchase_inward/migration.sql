-- DropForeignKey
ALTER TABLE `directinwardorreturn` DROP FOREIGN KEY `DirectInwardOrReturn_branchId_fkey`;

-- DropForeignKey
ALTER TABLE `directinwardorreturn` DROP FOREIGN KEY `DirectInwardOrReturn_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `directinwardorreturn` DROP FOREIGN KEY `DirectInwardOrReturn_supplierId_fkey`;

-- AlterTable
ALTER TABLE `directinwardorreturn` MODIFY `poType` ENUM('GreyYarn', 'DyedYarn', 'GreyFabric', 'DyedFabric', 'Accessory') NULL,
    MODIFY `supplierId` INTEGER NULL,
    MODIFY `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `updatedAt` DATETIME(3) NULL,
    MODIFY `createdById` INTEGER NULL,
    MODIFY `branchId` INTEGER NULL,
    MODIFY `docId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `DirectInwardOrReturn` ADD CONSTRAINT `DirectInwardOrReturn_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectInwardOrReturn` ADD CONSTRAINT `DirectInwardOrReturn_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectInwardOrReturn` ADD CONSTRAINT `DirectInwardOrReturn_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
